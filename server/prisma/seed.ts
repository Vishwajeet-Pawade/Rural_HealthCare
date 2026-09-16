import { PrismaClient, Role, RiskLevel, ConsentStatus, ReferralPriority, ReferralStatus, DutyStatus, SyncStatus, SosStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RuralCare database with SIH 26133 domain records...');

  // Default PIN hash for '1234'
  const defaultPinHash = await bcrypt.hash('1234', 10);

  // 1. Clean existing records in reverse dependency order
  await prisma.emergencyAccessLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.consentArtifact.deleteMany();
  await prisma.sosAlert.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.aIAssessment.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.syncRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned existing records.');

  // 2. Seed Facilities (ABDM HFR)
  const phcLunkaransar = await prisma.facility.create({
    data: {
      hfrId: 'HFR-2024-00891',
      name: 'PHC Lunkaransar',
      facilityType: 'PHC',
      district: 'Bikaner',
      state: 'Rajasthan',
      latitude: 28.5305,
      longitude: 73.7432,
      address: 'Near Bus Stand, Lunkaransar, Bikaner – 334602',
    },
  });

  const chcBikaner = await prisma.facility.create({
    data: {
      hfrId: 'HFR-2024-00289',
      name: 'CHC Bikaner',
      facilityType: 'CHC',
      district: 'Bikaner',
      state: 'Rajasthan',
      latitude: 28.0229,
      longitude: 73.3119,
      address: 'Station Road, Bikaner – 334001',
    },
  });

  const dhBikaner = await prisma.facility.create({
    data: {
      hfrId: 'HFR-2024-00371',
      name: 'District Hospital Bikaner',
      facilityType: 'DH',
      district: 'Bikaner',
      state: 'Rajasthan',
      latitude: 28.0181,
      longitude: 73.3175,
      address: 'PBM Hospital Campus, Bikaner – 334003',
    },
  });

  // Additional PHCs from ADMIN_STATS / PHC_ACTIVITY
  for (const phc of [
    { name: 'PHC Kolayat', hfrId: 'HFR-2024-00892' },
    { name: 'PHC Nokha', hfrId: 'HFR-2024-00893' },
    { name: 'PHC Deshnok', hfrId: 'HFR-2024-00894' },
    { name: 'PHC Dungargarh', hfrId: 'HFR-2024-00895' },
  ]) {
    await prisma.facility.create({
      data: {
        hfrId: phc.hfrId,
        name: phc.name,
        facilityType: 'PHC',
        district: 'Bikaner',
        state: 'Rajasthan',
      },
    });
  }
  console.log('✓ Seeded facilities.');

  // 3. Seed Users & Profiles

  // Admin: Rajiv Singh
  const adminUser = await prisma.user.create({
    data: {
      phone: '9829000001',
      role: Role.ADMIN,
      fullName: 'Rajiv Singh',
      pinHash: defaultPinHash,
    },
  });

  // Doctor 1: Dr. Ankit Sharma (PHC Lunkaransar)
  const doc1User = await prisma.user.create({
    data: {
      phone: '9829000002',
      role: Role.DOCTOR,
      fullName: 'Dr. Ankit Sharma',
      pinHash: defaultPinHash,
    },
  });
  const doc1 = await prisma.doctor.create({
    data: {
      userId: doc1User.id,
      hprId: 'HPR-2024-00142',
      name: 'Dr. Ankit Sharma',
      specialty: 'General Medicine',
      facilityId: phcLunkaransar.id,
      dutyStatus: DutyStatus.AVAILABLE,
      distance: '2.1 km',
      isPreferred: true,
      recommendationReasons: ['Primary assigned doctor', 'On-duty now', 'General Medicine specialist', 'Nearest PHC'],
    },
  });

  // Doctor 2: Dr. Priya Mehta (CHC Bikaner)
  const doc2User = await prisma.user.create({
    data: {
      phone: '9829000003',
      role: Role.DOCTOR,
      fullName: 'Dr. Priya Mehta',
      pinHash: defaultPinHash,
    },
  });
  const doc2 = await prisma.doctor.create({
    data: {
      userId: doc2User.id,
      hprId: 'HPR-2024-00289',
      name: 'Dr. Priya Mehta',
      specialty: 'Gynaecology & Obstetrics',
      facilityId: chcBikaner.id,
      dutyStatus: DutyStatus.BUSY,
      distance: '8.4 km',
      isPreferred: false,
      recommendationReasons: [],
    },
  });

  // Doctor 3: Dr. Suresh Gupta (District Hospital Bikaner)
  const doc3User = await prisma.user.create({
    data: {
      phone: '9829000004',
      role: Role.DOCTOR,
      fullName: 'Dr. Suresh Gupta',
      pinHash: defaultPinHash,
    },
  });
  const doc3 = await prisma.doctor.create({
    data: {
      userId: doc3User.id,
      hprId: 'HPR-2024-00371',
      name: 'Dr. Suresh Gupta',
      specialty: 'Emergency Medicine',
      facilityId: dhBikaner.id,
      dutyStatus: DutyStatus.AVAILABLE,
      distance: '14.2 km',
      isPreferred: false,
      recommendationReasons: ['Emergency specialist available'],
    },
  });

  // Worker 1: Meena Kumari (ASHA, Govindpur)
  const worker1User = await prisma.user.create({
    data: {
      phone: '9829000005',
      role: Role.WORKER,
      fullName: 'Meena Kumari',
      pinHash: defaultPinHash,
    },
  });
  const worker1 = await prisma.worker.create({
    data: {
      userId: worker1User.id,
      name: 'Meena Kumari',
      workerType: 'ASHA',
      village: 'Govindpur',
      district: 'Bikaner',
      state: 'Rajasthan',
    },
  });

  // Worker 2: Sunita Yadav (ASHA, Khetolai)
  const worker2User = await prisma.user.create({
    data: {
      phone: '9829000006',
      role: Role.WORKER,
      fullName: 'Sunita Yadav',
      pinHash: defaultPinHash,
    },
  });
  const worker2 = await prisma.worker.create({
    data: {
      userId: worker2User.id,
      name: 'Sunita Yadav',
      workerType: 'ASHA',
      village: 'Khetolai',
      district: 'Bikaner',
      state: 'Rajasthan',
    },
  });

  // Worker 3: Raju Singh (Health Worker, Deshnok)
  const worker3User = await prisma.user.create({
    data: {
      phone: '9829000007',
      role: Role.WORKER,
      fullName: 'Raju Singh',
      pinHash: defaultPinHash,
    },
  });
  const worker3 = await prisma.worker.create({
    data: {
      userId: worker3User.id,
      name: 'Raju Singh',
      workerType: 'Health Worker',
      village: 'Deshnok',
      district: 'Bikaner',
      state: 'Rajasthan',
    },
  });
  console.log('✓ Seeded staff & healthcare worker accounts.');

  // 4. Seed Patients

  // Patient 1: Priya Devi
  const pat1User = await prisma.user.create({
    data: {
      phone: '9414158392',
      role: Role.PATIENT,
      fullName: 'Priya Devi',
      pinHash: defaultPinHash,
    },
  });
  const pat1 = await prisma.patient.create({
    data: {
      healthId: 'RHC-2026-8F4K92',
      userId: pat1User.id,
      name: 'Priya Devi',
      nameHi: 'प्रिया देवी',
      age: 28,
      dob: '12 Mar 1998',
      gender: 'F',
      bloodGroup: 'O+',
      phone: '94141 58392',
      village: 'Govindpur',
      district: 'Bikaner',
      state: 'Rajasthan',
      address: 'Ward No. 4, Govindpur, Bikaner, Rajasthan – 334001',
      emergencyContact: { name: 'Rajendra Singh', relation: 'Husband', phone: '98290 17643' },
      allergies: ['Penicillin', 'Sulfa drugs'],
      chronicConditions: ['Anaemia (mild)', 'Hypothyroidism'],
      currentMedications: ['Thyronorm 25 mcg', 'Ferrous Sulphate 200 mg'],
      riskLevel: RiskLevel.MODERATE,
      lastConsultation: '29 Aug 2026',
      healthWorkerId: worker1.id,
      healthWorkerName: 'Meena Kumari (ASHA)',
      registeredAt: '14 Jan 2026',
      consentStatus: ConsentStatus.GRANTED,
      vaccinationStatus: 'Fully vaccinated',
    },
  });

  // Patient 2: Ramesh Kumar
  const pat2User = await prisma.user.create({
    data: {
      phone: '9672944501',
      role: Role.PATIENT,
      fullName: 'Ramesh Kumar',
      pinHash: defaultPinHash,
    },
  });
  const pat2 = await prisma.patient.create({
    data: {
      healthId: 'RHC-2026-3M9P71',
      userId: pat2User.id,
      name: 'Ramesh Kumar',
      nameHi: 'रमेश कुमार',
      age: 45,
      dob: '07 Jun 1981',
      gender: 'M',
      bloodGroup: 'B+',
      phone: '96729 44501',
      village: 'Khetolai',
      district: 'Bikaner',
      state: 'Rajasthan',
      address: 'Near Shiv Temple, Khetolai, Bikaner – 334022',
      emergencyContact: { name: 'Sunita Devi', relation: 'Wife', phone: '98291 30012' },
      allergies: [],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      currentMedications: ['Metformin 500 mg', 'Amlodipine 5 mg', 'Aspirin 75 mg'],
      riskLevel: RiskLevel.HIGH,
      lastConsultation: '31 Aug 2026',
      healthWorkerId: worker2.id,
      healthWorkerName: 'Sunita Yadav (ASHA)',
      registeredAt: '03 Mar 2026',
      consentStatus: ConsentStatus.GRANTED,
      vaccinationStatus: 'COVID-19 booster due',
    },
  });

  // Patient 3: Sunita Bai
  const pat3User = await prisma.user.create({
    data: {
      phone: '9799928831',
      role: Role.PATIENT,
      fullName: 'Sunita Bai',
      pinHash: defaultPinHash,
    },
  });
  const pat3 = await prisma.patient.create({
    data: {
      healthId: 'RHC-2026-7X2N44',
      userId: pat3User.id,
      name: 'Sunita Bai',
      nameHi: 'सुनीता बाई',
      age: 52,
      dob: '19 Nov 1973',
      gender: 'F',
      bloodGroup: 'A+',
      phone: '97999 28831',
      village: 'Lunkaransar',
      district: 'Bikaner',
      state: 'Rajasthan',
      address: 'Mohalla Baniyon ka, Lunkaransar – 334602',
      emergencyContact: { name: 'Kishore Lal', relation: 'Son', phone: '97990 44120' },
      allergies: ['Aspirin'],
      chronicConditions: [],
      currentMedications: [],
      riskLevel: RiskLevel.LOW,
      lastConsultation: '25 Aug 2026',
      healthWorkerId: worker1.id,
      healthWorkerName: 'Meena Kumari (ASHA)',
      registeredAt: '22 Feb 2026',
      consentStatus: ConsentStatus.GRANTED,
      vaccinationStatus: 'Fully vaccinated',
    },
  });

  // Patient 4: Mohan Lal
  const pat4User = await prisma.user.create({
    data: {
      phone: '9462091004',
      role: Role.PATIENT,
      fullName: 'Mohan Lal',
      pinHash: defaultPinHash,
    },
  });
  const pat4 = await prisma.patient.create({
    data: {
      healthId: 'RHC-2026-2K8Q15',
      userId: pat4User.id,
      name: 'Mohan Lal',
      nameHi: 'मोहन लाल',
      age: 67,
      dob: '02 Apr 1959',
      gender: 'M',
      bloodGroup: 'AB+',
      phone: '94620 91004',
      village: 'Deshnok',
      district: 'Bikaner',
      state: 'Rajasthan',
      address: 'Purana Bazaar, Deshnok, Bikaner – 334801',
      emergencyContact: { name: 'Geeta Devi', relation: 'Daughter', phone: '98288 77601' },
      allergies: ['Ibuprofen', 'Codeine'],
      chronicConditions: ['COPD', 'Hypertension', 'Type 2 Diabetes', 'Chronic Kidney Disease (Stage 2)'],
      currentMedications: ['Tiotropium inhaler', 'Losartan 50 mg', 'Insulin (Mixtard 30)', 'Furosemide 40 mg'],
      riskLevel: RiskLevel.CRITICAL,
      lastConsultation: '31 Aug 2026',
      healthWorkerId: worker3.id,
      healthWorkerName: 'Raju Singh (Health Worker)',
      registeredAt: '08 Jan 2026',
      consentStatus: ConsentStatus.GRANTED,
      vaccinationStatus: 'Influenza vaccine due',
    },
  });

  // Patient 5: Kavita Sharma
  const pat5User = await prisma.user.create({
    data: {
      phone: '9529160772',
      role: Role.PATIENT,
      fullName: 'Kavita Sharma',
      pinHash: defaultPinHash,
    },
  });
  const pat5 = await prisma.patient.create({
    data: {
      healthId: 'RHC-2026-9R6T83',
      userId: pat5User.id,
      name: 'Kavita Sharma',
      nameHi: 'कविता शर्मा',
      age: 34,
      dob: '28 Aug 1992',
      gender: 'F',
      bloodGroup: 'A-',
      phone: '95291 60772',
      village: 'Churi Ajitgarh',
      district: 'Churu',
      state: 'Rajasthan',
      address: 'Ward 7, Churi Ajitgarh, Churu – 331001',
      emergencyContact: { name: 'Ashok Sharma', relation: 'Husband', phone: '98294 50011' },
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      riskLevel: RiskLevel.LOW,
      lastConsultation: '20 Aug 2026',
      healthWorkerName: 'Poonam Devi (ASHA)',
      registeredAt: '15 May 2026',
      consentStatus: ConsentStatus.GRANTED,
      vaccinationStatus: 'Fully vaccinated',
    },
  });
  console.log('✓ Seeded patients.');

  // 5. Seed Consultations
  const con1 = await prisma.consultation.create({
    data: {
      consultationCode: 'CON-2026-001',
      patientId: pat1.id,
      date: '29 Aug 2026',
      time: '10:15 AM',
      workerId: worker1User.id,
      workerName: 'Meena Kumari',
      doctorId: doc1.id,
      doctorName: 'Dr. Ankit Sharma',
      facilityName: 'PHC Lunkaransar',
      symptoms: ['Fatigue', 'Dizziness', 'Pale skin', 'Shortness of breath'],
      vitals: { temperature: 37.1, bloodPressure: '108/70', heartRate: 92, spo2: 97, weight: 51 },
      diagnosis: 'Moderate Anaemia – likely dietary iron deficiency',
      treatment: 'Iron supplementation increased, dietary counselling',
      prescription: ['Ferrous Sulphate 200 mg (TDS × 3 months)', 'Folic Acid 5 mg (OD × 3 months)', 'Vitamin C 500 mg (OD)'],
      notes: 'Haemoglobin: 8.6 g/dL. Referred for complete blood count at PHC.',
      riskLevel: RiskLevel.MODERATE,
      referralStatus: 'completed',
      followUpDate: '28 Sep 2026',
    },
  });

  const con2 = await prisma.consultation.create({
    data: {
      consultationCode: 'CON-2026-002',
      patientId: pat2.id,
      date: '31 Aug 2026',
      time: '09:40 AM',
      workerId: worker2User.id,
      workerName: 'Sunita Yadav',
      symptoms: ['Chest tightness', 'Sweating', 'Nausea', 'Left arm tingling'],
      vitals: { temperature: 37.4, bloodPressure: '168/102', heartRate: 108, spo2: 94, weight: 79 },
      riskLevel: RiskLevel.CRITICAL,
      referralStatus: 'pending',
    },
  });

  const con3 = await prisma.consultation.create({
    data: {
      consultationCode: 'CON-2026-003',
      patientId: pat4.id,
      date: '31 Aug 2026',
      time: '08:20 AM',
      workerId: worker3User.id,
      workerName: 'Raju Singh',
      symptoms: ['Breathlessness (at rest)', 'Pedal oedema', 'Productive cough', 'Confusion (mild)'],
      vitals: { temperature: 37.8, bloodPressure: '182/110', heartRate: 118, spo2: 88, respiratoryRate: 28 },
      riskLevel: RiskLevel.CRITICAL,
      referralStatus: 'pending',
    },
  });
  console.log('✓ Seeded consultations.');

  // 6. Seed AI Assessments
  await prisma.aIAssessment.create({
    data: {
      assessmentCode: 'AI-2026-001',
      consultationId: con2.id,
      patientId: pat2.id,
      riskLevel: RiskLevel.CRITICAL,
      symptomsConsidered: ['Chest tightness', 'Sweating', 'Nausea', 'Left arm tingling'],
      abnormalVitals: ['BP: 168/102 mmHg (↑↑)', 'Heart Rate: 108 bpm (↑)', 'SpO₂: 94% (↓)'],
      riskFactors: ['Known hypertension', 'Type 2 Diabetes (uncontrolled)', 'Male, 45 years', 'No prior cardiac evaluation'],
      reasoning: 'Patient presents with classic angina-equivalent symptoms in the context of poorly controlled hypertension and diabetes. The combination of chest tightness, left arm tingling, diaphoresis and elevated heart rate raises significant concern for acute coronary syndrome. SpO₂ at 94% with current presentation warrants immediate clinical evaluation.',
      recommendedAction: 'Refer patient IMMEDIATELY to PHC Lunkaransar. Administer aspirin 325 mg if no allergy confirmed. Arrange ambulance/transport urgently. Do not delay referral.',
      confidence: 91,
      generatedAt: '31 Aug 2026, 09:47 AM',
    },
  });

  await prisma.aIAssessment.create({
    data: {
      assessmentCode: 'AI-2026-002',
      consultationId: con3.id,
      patientId: pat4.id,
      riskLevel: RiskLevel.CRITICAL,
      symptomsConsidered: ['Breathlessness at rest', 'Pedal oedema', 'Productive cough', 'Mild confusion'],
      abnormalVitals: ['BP: 182/110 mmHg (↑↑↑)', 'Heart Rate: 118 bpm (↑)', 'SpO₂: 88% (↓↓)', 'Respiratory Rate: 28/min (↑↑)', 'Temperature: 37.8°C (↑)'],
      riskFactors: ['COPD (known)', 'Hypertension Stage 3', 'CKD Stage 2', 'Age 67 years', 'Polypharmacy'],
      reasoning: 'Critically ill patient with acute exacerbation of COPD compounded by possible hypertensive emergency. SpO₂ of 88% indicates severe hypoxaemia. Mild confusion may indicate cerebral hypoperfusion. Immediate oxygen therapy and emergency referral required.',
      recommendedAction: 'EMERGENCY referral to District Hospital Bikaner. Oxygen supplementation (4–6 L/min) if available. Monitor vitals every 5 minutes. Alert receiving facility in advance.',
      confidence: 96,
      generatedAt: '31 Aug 2026, 08:31 AM',
    },
  });
  console.log('✓ Seeded AI assessments.');

  // 7. Seed Referrals
  await prisma.referral.create({
    data: {
      referralCode: 'REF-2026-041',
      patientId: pat2.id,
      patientName: 'Ramesh Kumar',
      fromWorker: 'Sunita Yadav',
      fromWorkerId: worker2User.id,
      toFacilityId: phcLunkaransar.id,
      toPHC: 'PHC Lunkaransar',
      reason: 'Suspected Acute Coronary Syndrome – chest tightness, diaphoresis, elevated BP',
      riskLevel: RiskLevel.CRITICAL,
      status: ReferralStatus.ACCEPTED,
      date: '31 Aug 2026',
      priority: ReferralPriority.EMERGENCY,
      aiSummary: 'AI confidence 91% – ACS presentation. Immediate referral recommended.',
    },
  });

  await prisma.referral.create({
    data: {
      referralCode: 'REF-2026-042',
      patientId: pat4.id,
      patientName: 'Mohan Lal',
      fromWorker: 'Raju Singh',
      fromWorkerId: worker3User.id,
      toFacilityId: dhBikaner.id,
      toPHC: 'District Hospital Bikaner',
      reason: 'Acute COPD exacerbation with hypoxaemia and hypertensive emergency',
      riskLevel: RiskLevel.CRITICAL,
      status: ReferralStatus.IN_CONSULTATION,
      date: '31 Aug 2026',
      priority: ReferralPriority.EMERGENCY,
      aiSummary: 'AI confidence 96% – Critical. Emergency transfer required.',
    },
  });

  await prisma.referral.create({
    data: {
      referralCode: 'REF-2026-038',
      patientId: pat1.id,
      patientName: 'Priya Devi',
      fromWorker: 'Meena Kumari',
      fromWorkerId: worker1User.id,
      toFacilityId: phcLunkaransar.id,
      toPHC: 'PHC Lunkaransar',
      reason: 'Moderate anaemia – requires haematological workup and IV iron evaluation',
      riskLevel: RiskLevel.MODERATE,
      status: ReferralStatus.COMPLETED,
      date: '29 Aug 2026',
      priority: ReferralPriority.ROUTINE,
      aiSummary: 'AI confidence 82% – Moderate anaemia. Dietary + supplementation likely sufficient.',
    },
  });
  console.log('✓ Seeded referrals.');

  // 8. Seed Consents
  await prisma.consentArtifact.createMany({
    data: [
      {
        consentCode: 'CNS-001',
        patientId: pat1.id,
        grantedTo: 'Meena Kumari',
        role: 'ASHA Health Worker',
        organization: 'Village Health Centre, Govindpur',
        status: ConsentStatus.GRANTED,
        purpose: 'Ongoing health monitoring',
        dataScope: ['Vitals', 'Consultations', 'Follow-ups', 'Medications'],
        grantedAt: '14 Jan 2026',
      },
      {
        consentCode: 'CNS-002',
        patientId: pat1.id,
        grantedTo: 'Dr. Ankit Sharma',
        role: 'Doctor',
        organization: 'PHC Lunkaransar',
        facilityId: phcLunkaransar.id,
        status: ConsentStatus.TEMPORARY,
        purpose: 'Clinical consultation & referral',
        dataScope: ['Full Medical History', 'Diagnoses', 'Lab Reports', 'Medications', 'Referrals'],
        grantedAt: '29 Aug 2026',
        expiresAt: '29 Sep 2026',
      },
      {
        consentCode: 'CNS-003',
        patientId: pat1.id,
        grantedTo: 'PHC Lunkaransar Administration',
        role: 'PHC Staff',
        organization: 'PHC Lunkaransar',
        facilityId: phcLunkaransar.id,
        status: ConsentStatus.GRANTED,
        purpose: 'Referral management',
        dataScope: ['Referral Records', 'Contact Information'],
        grantedAt: '14 Jan 2026',
      },
      {
        consentCode: 'CNS-004',
        patientId: pat1.id,
        grantedTo: 'Dr. Priya Mehta',
        role: 'Doctor',
        organization: 'PHC Bikaner',
        facilityId: chcBikaner.id,
        status: ConsentStatus.REVOKED,
        purpose: 'Second opinion',
        dataScope: ['Medical History', 'Lab Reports'],
        grantedAt: '01 Jun 2026',
        expiresAt: '01 Jul 2026',
      },
    ],
  });
  console.log('✓ Seeded consent artifacts.');

  // 9. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        auditCode: 'AUD-001',
        patientId: pat1.id,
        accessorId: doc1User.id,
        accessorName: 'Dr. Ankit Sharma',
        accessorRole: 'Doctor',
        organization: 'PHC Lunkaransar',
        action: 'Viewed medical history & added diagnosis',
        dataAccessed: ['Medical History', 'Diagnoses', 'Lab Reports', 'Medications'],
        timestamp: '31 Aug 2026, 14:32',
        purpose: 'Clinical consultation – referral assessment',
      },
      {
        auditCode: 'AUD-002',
        patientId: pat1.id,
        accessorId: worker1User.id,
        accessorName: 'Meena Kumari',
        accessorRole: 'ASHA Worker',
        organization: 'Village Health Centre, Govindpur',
        action: 'Updated consultation record',
        dataAccessed: ['Vitals', 'Symptoms', 'Consultation Notes'],
        timestamp: '31 Aug 2026, 11:15',
        purpose: 'Routine health assessment',
      },
      {
        auditCode: 'AUD-003',
        patientId: pat1.id,
        accessorId: worker2User.id,
        accessorName: 'Sunita Yadav',
        accessorRole: 'ASHA Worker',
        organization: 'Village Health Centre, Khetolai',
        action: 'Viewed follow-up schedule',
        dataAccessed: ['Follow-up Records'],
        timestamp: '28 Aug 2026, 09:05',
        purpose: 'Follow-up coordination',
      },
      {
        auditCode: 'AUD-004',
        patientId: pat1.id,
        accessorId: doc2User.id,
        accessorName: 'Dr. Priya Mehta',
        accessorRole: 'Doctor',
        organization: 'PHC Bikaner',
        action: 'Viewed patient profile',
        dataAccessed: ['Patient Profile', 'Allergies'],
        timestamp: '15 Aug 2026, 16:48',
        purpose: 'Emergency contact verification',
      },
    ],
  });
  console.log('✓ Seeded audit logs.');

  // 10. Seed Emergency Access Logs (Break-glass)
  await prisma.emergencyAccessLog.createMany({
    data: [
      {
        logCode: 'EAL-2026-001',
        patientId: pat1.id,
        patientHealthId: 'RHC-2026-8F4K92',
        patientName: 'Priya Devi',
        doctorId: doc1.id,
        doctorName: 'Dr. Ankit Sharma',
        facilityId: phcLunkaransar.id,
        facilityName: 'PHC Lunkaransar',
        reason: 'Patient unconscious',
        note: 'Patient found unresponsive, suspected cardiac event, referred by ASHA Sunita Yadav.',
        started: '31 Aug 2026, 14:32',
        ended: '31 Aug 2026, 14:47',
        duration: '15 min',
        records: 'Emergency Medical Summary',
        addlRequested: false,
        status: 'Completed',
      },
      {
        logCode: 'EAL-2026-002',
        patientHealthId: 'TEMP-ER-2026-0046',
        patientName: 'Unknown Patient',
        doctorId: doc2.id,
        doctorName: 'Dr. Priya Mehta',
        facilityId: chcBikaner.id,
        facilityName: 'PHC Bikaner',
        reason: 'Life-threatening condition',
        note: 'RTA victim, unconscious, no ID available. Temp record created.',
        started: '28 Aug 2026, 09:15',
        ended: '28 Aug 2026, 09:30',
        duration: '15 min',
        records: 'Emergency Medical Summary, Vitals',
        addlRequested: true,
        status: 'Completed',
      },
      {
        logCode: 'EAL-2026-003',
        patientId: pat4.id,
        patientHealthId: 'RHC-2026-2K8Q15',
        patientName: 'Mohan Lal',
        doctorId: doc1.id,
        doctorName: 'Dr. Ankit Sharma',
        facilityId: phcLunkaransar.id,
        facilityName: 'PHC Lunkaransar',
        reason: 'Patient unable to provide consent',
        note: 'Acute COPD exacerbation, semi-conscious.',
        started: '31 Aug 2026, 08:35',
        ended: '31 Aug 2026, 08:50',
        duration: '15 min',
        records: 'Emergency Medical Summary, Medications, Allergies',
        addlRequested: true,
        status: 'Completed',
      },
    ],
  });
  console.log('✓ Seeded emergency access logs.');

  // 11. Seed Sync Records
  await prisma.syncRecord.createMany({
    data: [
      { syncCode: 'SYN-001', type: 'Consultation', description: 'Priya Devi – Consultation 29 Aug', status: SyncStatus.SYNCED, recordedAt: '29 Aug 2026, 10:45 AM', syncedAt: '29 Aug 2026, 11:02 AM' },
      { syncCode: 'SYN-002', type: 'Patient Registration', description: 'New patient – Anita Meena', status: SyncStatus.PENDING, recordedAt: '31 Aug 2026, 07:15 AM' },
      { syncCode: 'SYN-003', type: 'Referral', description: 'Ramesh Kumar – Emergency referral', status: SyncStatus.PENDING, recordedAt: '31 Aug 2026, 09:48 AM' },
      { syncCode: 'SYN-004', type: 'Vitals', description: 'Mohan Lal – Vitals record', status: SyncStatus.PENDING, recordedAt: '31 Aug 2026, 08:25 AM' },
      { syncCode: 'SYN-005', type: 'Consultation', description: 'Sunita Bai – Follow-up update', status: SyncStatus.SYNCED, recordedAt: '25 Aug 2026, 02:10 PM', syncedAt: '25 Aug 2026, 02:55 PM' },
      { syncCode: 'SYN-006', type: 'Referral', description: 'Mohan Lal – Emergency referral', status: SyncStatus.FAILED, recordedAt: '31 Aug 2026, 08:32 AM', error: 'Connection timeout after 3 retries' },
      { syncCode: 'SYN-007', type: 'Vitals', description: 'Ramesh Kumar – Vitals record', status: SyncStatus.PENDING, recordedAt: '31 Aug 2026, 09:41 AM' },
    ],
  });
  console.log('✓ Seeded sync records.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

