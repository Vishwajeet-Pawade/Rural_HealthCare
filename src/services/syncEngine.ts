import { offlineDb, type OfflinePatient, type OfflineConsultation, type OutboxItem } from './offlineDb';
import { registerPatient, createConsultation } from '../api/client';

export type SyncListener = () => void;

let isSyncing = false;
let listenersInitialized = false;
const subscribers = new Set<SyncListener>();

function notifySubscribers(): void {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Error in sync subscriber:', err);
    }
  });
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function isCurrentlySyncing(): boolean {
  return isSyncing;
}

export function subscribeToSync(listener: SyncListener): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

export async function getPendingCount(): Promise<number> {
  try {
    return await offlineDb.outboxQueue.count();
  } catch {
    return 0;
  }
}

export async function getPendingItems(): Promise<OutboxItem[]> {
  try {
    return await offlineDb.outboxQueue.toArray();
  } catch {
    return [];
  }
}

export async function saveOfflinePatient(data: any): Promise<OfflinePatient> {
  const id = data.id || data.healthId || `TEMP-PAT-${Date.now()}`;
  const consent = data.consent || { granted: true };
  const payload = { ...data, id, consent };
  const patientRecord: OfflinePatient = {
    id,
    name: data.name || 'Unknown Patient',
    village: data.village || 'Unknown Village',
    synced: false,
    payload,
    createdAt: new Date().toISOString(),
  };

  await offlineDb.patients.put(patientRecord);

  await offlineDb.outboxQueue.add({
    action: 'CREATE_PATIENT',
    payload,
    createdAt: new Date().toISOString(),
  });

  notifySubscribers();

  if (isOnline()) {
    flushOutbox().catch((err) => {
      console.warn('Background sync on saveOfflinePatient failed:', err);
    });
  }

  return patientRecord;
}

export async function saveOfflineConsultation(data: any): Promise<OfflineConsultation> {
  const id = data.id || `TEMP-CONS-${Date.now()}`;
  const consultationRecord: OfflineConsultation = {
    id,
    patientId: data.patientId || '',
    synced: false,
    payload: { ...data, id },
    createdAt: new Date().toISOString(),
  };

  await offlineDb.consultations.put(consultationRecord);

  await offlineDb.outboxQueue.add({
    action: 'CREATE_CONSULTATION',
    payload: { ...data, id },
    createdAt: new Date().toISOString(),
  });

  notifySubscribers();

  if (isOnline()) {
    flushOutbox().catch((err) => {
      console.warn('Background sync on saveOfflineConsultation failed:', err);
    });
  }

  return consultationRecord;
}

export async function flushOutbox(): Promise<{
  success: boolean;
  processed: number;
  errors: number;
}> {
  if (isSyncing) {
    return { success: false, processed: 0, errors: 0 };
  }

  if (!isOnline()) {
    return { success: false, processed: 0, errors: 0 };
  }

  isSyncing = true;
  notifySubscribers();

  let processed = 0;
  let errors = 0;

  try {
    const queue = await offlineDb.outboxQueue.toArray();

    for (const item of queue) {
      if (!isOnline()) {
        break;
      }

      try {
        if (item.action === 'CREATE_PATIENT') {
          const res = await registerPatient(item.payload);

          if (item.id !== undefined) {
            await offlineDb.outboxQueue.delete(item.id);
          }

          const localId = item.payload.id || item.payload.healthId;
          const realPatientId = res?.patient?.healthId || res?.patient?.id;

          if (localId) {
            await offlineDb.patients.update(localId, { synced: true });
          }

          // Remap queued consultations from temporary patient ID to real server patient ID
          if (localId && realPatientId && localId !== realPatientId) {
            const tempIds = new Set([localId, item.payload.id, item.payload.healthId].filter(Boolean));

            // 1. Update remaining items in current in-memory queue array so subsequent loop iterations use realPatientId
            for (const remainingItem of queue) {
              if (
                remainingItem.action === 'CREATE_CONSULTATION' &&
                remainingItem.payload &&
                tempIds.has(remainingItem.payload.patientId)
              ) {
                remainingItem.payload.patientId = realPatientId;
              }
            }

            // 2. Update queued CREATE_CONSULTATION items in IndexedDB outboxQueue
            const queuedConsultations = await offlineDb.outboxQueue
              .filter(
                (qItem) =>
                  qItem.action === 'CREATE_CONSULTATION' &&
                  qItem.payload &&
                  tempIds.has(qItem.payload.patientId)
              )
              .toArray();

            for (const qc of queuedConsultations) {
              if (qc.id !== undefined) {
                await offlineDb.outboxQueue.update(qc.id, {
                  payload: {
                    ...qc.payload,
                    patientId: realPatientId,
                  },
                });
              }
            }

            // 3. Update local consultations table records
            const localConsultations = await offlineDb.consultations
              .filter((c) => tempIds.has(c.patientId))
              .toArray();

            for (const lc of localConsultations) {
              await offlineDb.consultations.update(lc.id, {
                patientId: realPatientId,
                payload: lc.payload
                  ? { ...lc.payload, patientId: realPatientId }
                  : lc.payload,
              });
            }
          }

          processed++;
        } else if (item.action === 'CREATE_CONSULTATION') {
          await createConsultation(item.payload);

          if (item.id !== undefined) {
            await offlineDb.outboxQueue.delete(item.id);
          }

          const localId = item.payload.id;
          if (localId) {
            await offlineDb.consultations.update(localId, { synced: true });
          }
          processed++;
        }
      } catch (reqError) {
        errors++;
        console.error(`Failed to sync outbox item #${item.id} (${item.action}):`, reqError);
        // Keep the queue item so it can be retried later
      }
    }
  } catch (err) {
    console.error('Error during flushOutbox iteration:', err);
  } finally {
    isSyncing = false;
    notifySubscribers();
  }

  return { success: errors === 0, processed, errors };
}

function initSyncEngine(): void {
  if (listenersInitialized || typeof window === 'undefined') {
    return;
  }
  listenersInitialized = true;

  window.addEventListener('online', () => {
    notifySubscribers();
    flushOutbox().catch((err) => {
      console.warn('Auto flush on reconnect failed:', err);
    });
  });

  window.addEventListener('offline', () => {
    notifySubscribers();
  });
}

initSyncEngine();

export const syncEngine = {
  saveOfflinePatient,
  saveOfflineConsultation,
  flushOutbox,
  getPendingCount,
  getPendingItems,
  subscribe: subscribeToSync,
  isOnline,
  isCurrentlySyncing,
};

export default syncEngine;
