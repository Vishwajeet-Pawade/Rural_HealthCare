import { prisma } from '../../lib/prisma.js';
import {
  FHIRPatient,
  FHIREncounter,
  FHIRObservation,
  FHIRCondition,
  FHIRMedicationRequest,
  FHIRServiceRequest,
  FHIRBundle,
} from '../../types/abdm.types.js';

export class FHIRService {
  /**
   * Generates HL7 FHIR R4 Patient resource matching NRCES NDHM Patient profile.
   */
  async generatePatientResource(patientId: string): Promise<FHIRPatient> {
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: patientId }, { healthId: patientId }],
      },
    });

    if (!patient) {
      throw new Error(`Patient ${patientId} not found`);
    }

    const identifiers: FHIRPatient['identifier'] = [
      {
        system: 'https://ruralcare.gov.in/health-id',
        value: patient.healthId,
        use: 'official',
      },
    ];

    if (patient.abhaAddress) {
      identifiers.push({
        system: 'https://healthid.ndhm.gov.in/abha-address',
        value: patient.abhaAddress,
        use: 'secondary',
      });
    }

    if (patient.abhaNumber) {
      identifiers.push({
        system: 'https://healthid.ndhm.gov.in/abha-number',
        value: patient.abhaNumber,
        use: 'official',
      });
    }

    const genderMap: Record<string, FHIRPatient['gender']> = {
      M: 'male',
      F: 'female',
      O: 'other',
      male: 'male',
      female: 'female',
    };

    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
        versionId: '1',
        lastUpdated: patient.updatedAt.toISOString(),
      },
      identifier: identifiers,
      active: true,
      name: [
        {
          use: 'official',
          text: patient.name,
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: patient.phone,
          use: 'mobile',
        },
      ],
      gender: genderMap[patient.gender] || 'unknown',
      birthDate: patient.dob,
      address: [
        {
          use: 'home',
          line: [patient.address || patient.village],
          city: patient.village,
          district: patient.district,
          state: patient.state,
          postalCode: '412205',
          country: 'IN',
        },
      ],
    };
  }

  /**
   * Generates HL7 FHIR R4 Encounter resource matching NRCES NDHM Encounter profile.
   */
  async generateEncounterResource(consultationId: string): Promise<FHIREncounter> {
    const consultation = await prisma.consultation.findFirst({
      where: {
        OR: [{ id: consultationId }, { consultationCode: consultationId }],
      },
      include: {
        patient: true,
        doctor: {
          include: { facility: true },
        },
      },
    });

    if (!consultation) {
      throw new Error(`Consultation ${consultationId} not found`);
    }

    return {
      resourceType: 'Encounter',
      id: consultation.id,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter'],
        versionId: '1',
        lastUpdated: consultation.updatedAt.toISOString(),
      },
      identifier: [
        {
          system: 'https://ruralcare.gov.in/encounter-code',
          value: consultation.consultationCode,
        },
      ],
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory',
      },
      subject: {
        reference: `Patient/${consultation.patientId}`,
        display: consultation.patient.name,
      },
      participant: consultation.doctor
        ? [
            {
              individual: {
                reference: `Practitioner/${consultation.doctor.hprId}`,
                display: consultation.doctor.name,
              },
            },
          ]
        : [],
      period: {
        start: `${consultation.date}T${consultation.time}:00Z`,
      },
      reasonCode: consultation.diagnosis
        ? [
            {
              text: consultation.diagnosis,
            },
          ]
        : [],
      serviceProvider: consultation.doctor?.facility
        ? {
            reference: `Organization/${consultation.doctor.facility.hfrId}`,
            display: consultation.doctor.facility.name,
          }
        : undefined,
    };
  }

  /**
   * Generates standard LOINC coded FHIR Observation resources for recorded vitals.
   */
  async generateObservationResources(consultationId: string): Promise<FHIRObservation[]> {
    const consultation = await prisma.consultation.findFirst({
      where: {
        OR: [{ id: consultationId }, { consultationCode: consultationId }],
      },
      include: { patient: true },
    });

    if (!consultation) {
      throw new Error(`Consultation ${consultationId} not found`);
    }

    const vitals = (consultation.vitals || {}) as Record<string, string | number>;
    const observations: FHIRObservation[] = [];
    const timestamp = `${consultation.date}T${consultation.time}:00Z`;

    // 1. Blood Pressure (LOINC 85354-9 Panel)
    if (vitals.bp) {
      const parts = String(vitals.bp).split('/');
      const sys = parseFloat(parts[0]) || 120;
      const dia = parseFloat(parts[1]) || 80;

      observations.push({
        resourceType: 'Observation',
        id: `obs-bp-${consultation.id}`,
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'],
        },
        status: 'final',
        category: [
          {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }],
          },
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel with all children optional' }],
          text: 'Blood Pressure',
        },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        effectiveDateTime: timestamp,
        component: [
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
            valueQuantity: { value: sys, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
          },
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
            valueQuantity: { value: dia, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
          },
        ],
      });
    }

    // 2. Pulse / Heart Rate (LOINC 8867-4)
    if (vitals.pulse) {
      observations.push({
        resourceType: 'Observation',
        id: `obs-hr-${consultation.id}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'] },
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }], text: 'Pulse / Heart Rate' },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        effectiveDateTime: timestamp,
        valueQuantity: { value: Number(vitals.pulse), unit: '/min', system: 'http://unitsofmeasure.org', code: '/min' },
      });
    }

    // 3. Oxygen Saturation SpO2 (LOINC 2708-6)
    if (vitals.spo2) {
      const val = parseFloat(String(vitals.spo2).replace('%', ''));
      observations.push({
        resourceType: 'Observation',
        id: `obs-spo2-${consultation.id}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'] },
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood' }], text: 'SpO2' },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        effectiveDateTime: timestamp,
        valueQuantity: { value: val, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
      });
    }

    // 4. Body Temperature (LOINC 8310-5)
    if (vitals.temp) {
      const val = parseFloat(String(vitals.temp).replace('°F', ''));
      observations.push({
        resourceType: 'Observation',
        id: `obs-temp-${consultation.id}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'] },
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' }], text: 'Temperature' },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        effectiveDateTime: timestamp,
        valueQuantity: { value: val, unit: '[degF]', system: 'http://unitsofmeasure.org', code: '[degF]' },
      });
    }

    return observations;
  }

  /**
   * Generates FHIR Condition resources for symptoms and diagnoses.
   */
  async generateConditionResources(consultationId: string): Promise<FHIRCondition[]> {
    const consultation = await prisma.consultation.findFirst({
      where: {
        OR: [{ id: consultationId }, { consultationCode: consultationId }],
      },
      include: { patient: true },
    });

    if (!consultation) {
      throw new Error(`Consultation ${consultationId} not found`);
    }

    const conditions: FHIRCondition[] = [];
    const timestamp = `${consultation.date}T${consultation.time}:00Z`;

    if (consultation.diagnosis) {
      conditions.push({
        resourceType: 'Condition',
        id: `cond-diag-${consultation.id}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition'] },
        clinicalStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }],
        },
        verificationStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }],
        },
        code: { text: consultation.diagnosis },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        recordedDate: timestamp,
      });
    }

    for (let i = 0; i < consultation.symptoms.length; i++) {
      const symptom = consultation.symptoms[i];
      conditions.push({
        resourceType: 'Condition',
        id: `cond-symp-${consultation.id}-${i}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition'] },
        clinicalStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }],
        },
        verificationStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional', display: 'Provisional' }],
        },
        code: { text: symptom },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        recordedDate: timestamp,
      });
    }

    return conditions;
  }

  /**
   * Generates FHIR MedicationRequest resources for prescriptions.
   */
  async generateMedicationRequestResources(consultationId: string): Promise<FHIRMedicationRequest[]> {
    const consultation = await prisma.consultation.findFirst({
      where: {
        OR: [{ id: consultationId }, { consultationCode: consultationId }],
      },
      include: { patient: true, doctor: true },
    });

    if (!consultation) {
      throw new Error(`Consultation ${consultationId} not found`);
    }

    const requests: FHIRMedicationRequest[] = [];
    const timestamp = `${consultation.date}T${consultation.time}:00Z`;

    for (let i = 0; i < consultation.prescription.length; i++) {
      const medText = consultation.prescription[i];
      requests.push({
        resourceType: 'MedicationRequest',
        id: `medrx-${consultation.id}-${i}`,
        meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest'] },
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: { text: medText },
        subject: { reference: `Patient/${consultation.patientId}`, display: consultation.patient.name },
        authoredOn: timestamp,
        requester: consultation.doctor
          ? { reference: `Practitioner/${consultation.doctor.hprId}`, display: consultation.doctor.name }
          : undefined,
        dosageInstruction: [{ text: medText }],
      });
    }

    return requests;
  }

  /**
   * Generates FHIR ServiceRequest resource for referral orders.
   */
  async generateServiceRequestResource(referralId: string): Promise<FHIRServiceRequest> {
    const referral = await prisma.referral.findFirst({
      where: {
        OR: [{ id: referralId }, { referralCode: referralId }],
      },
      include: {
        patient: true,
        toFacility: true,
        toDoctor: true,
      },
    });

    if (!referral) {
      throw new Error(`Referral ${referralId} not found`);
    }

    const priorityMap: Record<string, FHIRServiceRequest['priority']> = {
      ROUTINE: 'routine',
      URGENT: 'urgent',
      EMERGENCY: 'stat',
    };

    return {
      resourceType: 'ServiceRequest',
      id: referral.id,
      meta: { profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ServiceRequest'] },
      status: referral.status === 'COMPLETED' ? 'completed' : 'active',
      intent: 'order',
      priority: priorityMap[referral.priority] || 'routine',
      code: { text: `Referral Consultation: ${referral.reason}` },
      subject: { reference: `Patient/${referral.patientId}`, display: referral.patient.name },
      authoredOn: `${referral.date}T09:00:00Z`,
      performer: referral.toFacility
        ? [{ reference: `Organization/${referral.toFacility.hfrId}`, display: referral.toFacility.name }]
        : undefined,
      reasonCode: [{ text: referral.reason }],
    };
  }

  /**
   * Builds a full FHIR R4 Bundle for a patient's complete longitudinal record.
   */
  async generatePatientBundle(patientId: string): Promise<FHIRBundle> {
    const patientResource = await this.generatePatientResource(patientId);

    const consultations = await prisma.consultation.findMany({
      where: { patientId: patientResource.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const entries: FHIRBundle['entry'] = [
      {
        fullUrl: `urn:uuid:${patientResource.id}`,
        resource: patientResource,
      },
    ];

    for (const consult of consultations) {
      const enc = await this.generateEncounterResource(consult.id);
      entries.push({ fullUrl: `urn:uuid:${enc.id}`, resource: enc });

      const obs = await this.generateObservationResources(consult.id);
      for (const o of obs) {
        entries.push({ fullUrl: `urn:uuid:${o.id}`, resource: o });
      }

      const conds = await this.generateConditionResources(consult.id);
      for (const c of conds) {
        entries.push({ fullUrl: `urn:uuid:${c.id}`, resource: c });
      }

      const meds = await this.generateMedicationRequestResources(consult.id);
      for (const m of meds) {
        entries.push({ fullUrl: `urn:uuid:${m.id}`, resource: m });
      }
    }

    return {
      resourceType: 'Bundle',
      id: `bundle-${patientResource.id}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
        lastUpdated: new Date().toISOString(),
      },
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: entries.length,
      entry: entries,
    };
  }
}

export const fhirService = new FHIRService();

