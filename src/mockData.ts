import { PatientProfile, TriageCase, AuditLogEntry, IndianHospital } from './types';

export const INITIAL_PATIENT: PatientProfile = {
  id: 'PT-IN-89421',
  mrn: 'ABDM-994102',
  abhaId: '91-7823-4412-9012',
  abhaAddress: 'priya.sharma@abdm',
  pmjayCovered: true,
  firstName: 'Priya',
  lastName: 'Sharma',
  dateOfBirth: '1976-08-15',
  age: 49,
  sex: 'Female',
  bloodType: 'B+',
  weightKg: 64.0,
  heightCm: 162,
  allergies: [
    { allergen: 'Penicillin', reaction: 'Anaphylaxis, severe hives, throat tightness', severity: 'Life-Threatening' },
    { allergen: 'Sulfa Drugs', reaction: 'Maculopapular rash', severity: 'Moderate' }
  ],
  chronicConditions: [
    'Essential Hypertension (ICD-10 I10)',
    'Type 2 Diabetes Mellitus (ICD-10 E11.9)',
    'Mild Asthma (ICD-10 J45.20)'
  ],
  medications: [
    { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily morning', indication: 'Hypertension' },
    { name: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice daily with meals', indication: 'T2DM' },
    { name: 'Asthalin Inhaler (Salbutamol)', dosage: '100 mcg', frequency: '2 puffs PRN wheezing', indication: 'Asthma' }
  ],
  pastSurgeries: [
    'Laparoscopic Cholecystectomy (AIIMS New Delhi, 2019)',
    'Cesarean Delivery (2004)'
  ],
  emergencyContact: {
    name: 'Rajesh Sharma',
    relationship: 'Spouse',
    phone: '+91 98101 23456'
  },
  preferredLanguage: 'en'
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-991',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    actorRole: 'Patient',
    actorName: 'Priya Sharma',
    action: 'ABHA 2FA Verification & Session Authentication',
    resourceType: 'PHI_VIEW',
    details: 'Patient authenticated via ABHA OTP verification. ABDM token issued.',
    ipMasked: '103.24.***.***'
  },
  {
    id: 'AUD-992',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    actorRole: 'System_AI',
    actorName: 'Gemini Medical Clinical Engine',
    action: 'Multi-Modal Triage Evaluation (Case #TRG-104)',
    resourceType: 'TRIAGE_ANALYSIS',
    details: 'Analyzed acute substernal chest pain, ECG rhythm strip, and vitals. Assigned ESI Level 2 (Priority 1 Red).',
    ipMasked: 'Internal Service Mesh'
  },
  {
    id: 'AUD-993',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorRole: 'Emergency Physician',
    actorName: 'Dr. Marcus Chen, MD (Attending ER)',
    action: 'Clinician Chart Review & Bed Allocation',
    resourceType: 'CLINICIAN_OVERRIDE',
    details: 'Confirmed ESI-2 emergent disposition. Activated STEMI / Acute Coronary Syndrome protocol.',
    ipMasked: '10.240.42.***'
  },
  {
    id: 'AUD-994',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    actorRole: 'Triage Clinician',
    actorName: 'Nurse Sarah Jenkins, RN (CEN)',
    action: 'FHIR R4 Bundle Synchronization to Hospital EHR',
    resourceType: 'EHR_EXPORT',
    details: 'Exported FHIR bundle with Patient, Observation, and Condition resources to hospital EHR endpoint.',
    ipMasked: '10.240.42.***'
  }
];

export const INITIAL_CASES: TriageCase[] = [
  {
    id: 'TRG-104',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    patient: INITIAL_PATIENT,
    chiefComplaint: 'Substernal chest pressure and dyspnea on exertion with diaphoresis',
    detailedSymptoms: 'Pressure sensation described as an "elephant sitting on my chest" lasting 45 minutes, radiating toward the left jaw and shoulder. Accompanied by mild shortness of breath and cold perspiration.',
    onset: '45 minutes ago at rest',
    duration: 'Constant, worsening',
    painScale: 8,
    vitals: {
      heartRate: 104,
      systolicBp: 168,
      diastolicBp: 98,
      respiratoryRate: 22,
      oxygenSat: 93,
      temperature: 98.4,
      painScore: 8
    },
    attachments: [
      {
        id: 'att-1',
        type: 'photo',
        name: 'Single-Lead_Wearable_ECG.png',
        mimeType: 'image/png',
        analysisSnippet: 'Sinus tachycardia at 104 bpm with noticeable ST segment elevation in lead II/III vector.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'att-2',
        type: 'document',
        name: 'Recent_STAT_Labs_Report.pdf',
        mimeType: 'application/pdf',
        analysisSnippet: 'High-sensitivity Troponin I elevated at 0.084 ng/mL (Ref < 0.014). Glucose 184 mg/dL.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    labResults: [
      {
        testName: 'hs-Troponin I',
        value: '0.084',
        unit: 'ng/mL',
        referenceRange: '< 0.014',
        status: 'Critical',
        clinicalSignificance: 'Significant myocardial injury; strong indicator for Acute Coronary Syndrome.'
      },
      {
        testName: 'Blood Glucose',
        value: '184',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        status: 'High',
        clinicalSignificance: 'Hyperglycemia exacerbated by acute physiologic stress.'
      },
      {
        testName: 'Serum Potassium (K+)',
        value: '4.2',
        unit: 'mEq/L',
        referenceRange: '3.5 - 5.0',
        status: 'Normal'
      }
    ],
    analysis: {
      esiLevel: 2,
      acuityTitle: 'Emergent / High Risk (ESI Level 2)',
      category: 'Emergent',
      urgencyTimeline: 'Immediate evaluation (< 10 minutes)',
      confidenceScore: 0.96,
      primaryClinicalImpression: 'Acute Coronary Syndrome (ACS) / NSTEMI vs STEMI with Hypertensive Urgency',
      differentialConsiderations: [
        'Acute Myocardial Infarction',
        'Unstable Angina Pectoris',
        'Aortic Dissection (rule out given hypertension)',
        'Pulmonary Embolism'
      ],
      identifiedRedFlags: [
        'Radiating substernal chest pressure with diaphoresis',
        'Tachycardia (HR 104) and Hypertension (BP 168/98)',
        'Borderline hypoxemia (SpO2 93% on room air)',
        'Elevated high-sensitivity cardiac troponin'
      ],
      vitalsAssessment: {
        status: 'Critical',
        details: 'Hemodynamically unstable markers: Tachycardic at 104 bpm, hypertensive urgency 168/98 mmHg, tachypneic at 22/min, SpO2 depressed at 93%.'
      },
      multimodalFindings: {
        photoAnalysis: 'ECG snapshot reveals sinus tachycardia with suspicious J-point elevation and T-wave inversion.',
        audioFindings: 'Patient vocal tone strained, rapid speech cadence consistent with acute cardiopulmonary distress.',
        documentAnalysis: 'STAT chemistry confirms acute cardiac biomarker release (Troponin 0.084 ng/mL).'
      },
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: [
        'Chew 324 mg of non-enteric coated aspirin immediately if no allergy or bleeding disorder.',
        'Rest in an upright semi-fowler position; avoid all physical exertion.',
        'Do NOT drive yourself to the hospital; await EMS transport.'
      ],
      warningSignsToEscalate: [
        'Loss of consciousness or near-syncope',
        'Severe acute dyspnea or inability to speak full sentences',
        'Cyanosis of lips or nail beds'
      ],
      patientExplanation: 'Based on your chest pain, high blood pressure, and lab values, your symptoms require urgent emergency medical care immediately to protect your heart.',
      suggestedQuestionsForClinician: [
        'Is full 12-lead ECG obtained and telemetry monitoring active?',
        'Was Aspirin 324 mg and sublingual Nitroglycerin administered?',
        'Is cath lab team pre-notified for cardiac catheterization protocol?'
      ],
      fhirBundle: {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'PT-89421',
              name: [{ family: 'Vance', given: ['Eleanor'] }],
              gender: 'female',
              birthDate: '1974-06-18'
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
              valueQuantity: { value: 104, unit: 'beats/minute' }
            }
          },
          {
            resource: {
              resourceType: 'Condition',
              clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
              verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }] },
              code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'I20.0', display: 'Unstable angina' }] }
            }
          }
        ]
      }
    },
    status: 'in_clinician_review',
    assignedClinician: 'Dr. Marcus Chen, MD',
    messages: [
      {
        id: 'msg-1',
        caseId: 'TRG-104',
        sender: 'system',
        senderName: 'MySwaasth Automated Protocol',
        text: 'Emergency Severity Index 2 assigned. Care team notified. Secure HIPAA encrypted channel opened.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isUrgent: true
      },
      {
        id: 'msg-2',
        caseId: 'TRG-104',
        sender: 'clinician',
        senderName: 'Dr. Marcus Chen, MD (Attending ER)',
        text: 'Hello Mrs. Vance, I have reviewed your triage evaluation and troponin levels. EMS unit Medic-4 has been dispatched. Please remain seated and rest until paramedics arrive.',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        id: 'msg-3',
        caseId: 'TRG-104',
        sender: 'patient',
        senderName: 'Eleanor Vance',
        text: 'Thank you doctor. I am resting sitting up on the couch. My husband is waiting at the door for the paramedics.',
        timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString()
      }
    ],
    language: 'en'
  },
  {
    id: 'TRG-102',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    patient: {
      ...INITIAL_PATIENT,
      id: 'PT-33019',
      mrn: 'MRN-4491028',
      firstName: 'Mateo',
      lastName: 'Rodriguez',
      age: 38,
      sex: 'Male'
    },
    chiefComplaint: 'Right lower quadrant abdominal pain with low-grade fever and anorexia',
    detailedSymptoms: 'Pain started periumbilically 14 hours ago and migrated to the right iliac fossa (McBurney point). Sharp, exacerbated by walking or coughing.',
    onset: '14 hours ago',
    duration: 'Worsening',
    painScale: 7,
    vitals: {
      heartRate: 88,
      systolicBp: 124,
      diastolicBp: 78,
      respiratoryRate: 16,
      oxygenSat: 98,
      temperature: 100.8,
      painScore: 7
    },
    attachments: [],
    labResults: [
      {
        testName: 'WBC (Leukocyte Count)',
        value: '13.8',
        unit: 'x10^3/uL',
        referenceRange: '4.5 - 11.0',
        status: 'High',
        clinicalSignificance: 'Leukocytosis indicative of acute inflammatory process.'
      }
    ],
    analysis: {
      esiLevel: 3,
      acuityTitle: 'Urgent / Multi-Resource (ESI Level 3)',
      category: 'Urgent',
      urgencyTimeline: 'Evaluation within 30-60 minutes',
      confidenceScore: 0.92,
      primaryClinicalImpression: 'Suspected Acute Appendicitis',
      differentialConsiderations: ['Mesenteric Adenitis', 'Cecal Diverticulitis', 'Renal Colic'],
      identifiedRedFlags: ['Migratory right lower quadrant pain', 'Fever with elevated leukocytosis'],
      vitalsAssessment: {
        status: 'Abnormal',
        details: 'Febrile at 100.8°F, mild sinus tachycardia.'
      },
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: ['Remain NPO (do not eat or drink anything)', 'Avoid heat pads or heating compression on abdomen'],
      warningSignsToEscalate: ['Sudden relief of pain followed by diffuse peritonitis pain (rupture warning)', 'High fever with rigors'],
      patientExplanation: 'Your pain pattern and fever strongly suggest acute appendicitis. Please proceed to an Emergency Department for ultrasound/CT evaluation.',
      suggestedQuestionsForClinician: ['Order abdominal contrast CT or ultrasound', 'Initiate IV access and hydration', 'Surgical consult']
    },
    status: 'clinician_verified',
    assignedClinician: 'Dr. Sarah Lin, MD',
    clinicianDisposition: 'Emergency Department (Immediate)',
    messages: [],
    language: 'en'
  }
];

export const DEFAULT_PATIENT = INITIAL_PATIENT;
export const MOCK_TRIAGE_CASES = INITIAL_CASES;
export const INITIAL_MESSAGES = INITIAL_CASES[0]?.messages || [];

export const INDIAN_EMERGENCY_HOSPITALS: IndianHospital[] = [
  {
    id: 'hosp-aiims-delhi',
    name: 'AIIMS - JPN Apex Trauma Centre',
    type: 'Government Apex',
    city: 'New Delhi',
    distanceKm: 2.4,
    travelTimeMins: 8,
    address: 'Ring Road, Safdarjung Enclave, New Delhi - 110029',
    emergencyPhone: '011-26731000',
    casualtyAvailable: true,
    icuBedsAvailable: 14,
    hasCathLab: true,
    hasTraumaLevel1: true,
    pmjayCashless: true
  },
  {
    id: 'hosp-safdarjung',
    name: 'Safdarjung Hospital Emergency Block',
    type: 'Government Apex',
    city: 'New Delhi',
    distanceKm: 2.8,
    travelTimeMins: 10,
    address: 'Ansari Nagar West, Ring Road, New Delhi - 110029',
    emergencyPhone: '011-26165060',
    casualtyAvailable: true,
    icuBedsAvailable: 9,
    hasCathLab: true,
    hasTraumaLevel1: true,
    pmjayCashless: true
  },
  {
    id: 'hosp-apollo-delhi',
    name: 'Indraprastha Apollo Emergency & Trauma',
    type: 'Private Super Speciality',
    city: 'New Delhi',
    distanceKm: 5.6,
    travelTimeMins: 14,
    address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi - 110076',
    emergencyPhone: '1066',
    casualtyAvailable: true,
    icuBedsAvailable: 18,
    hasCathLab: true,
    hasTraumaLevel1: true,
    pmjayCashless: true
  },
  {
    id: 'hosp-max-saket',
    name: 'Max Super Speciality Hospital (Casualty)',
    type: 'Private Super Speciality',
    city: 'New Delhi',
    distanceKm: 4.1,
    travelTimeMins: 12,
    address: '1, 2 Press Enclave Marg, Saket, New Delhi - 110017',
    emergencyPhone: '011-40554055',
    casualtyAvailable: true,
    icuBedsAvailable: 11,
    hasCathLab: true,
    hasTraumaLevel1: true,
    pmjayCashless: true
  },
  {
    id: 'hosp-fortis-escorts',
    name: 'Fortis Escorts Heart Institute (Cardiac ER)',
    type: 'Private Super Speciality',
    city: 'New Delhi',
    distanceKm: 6.2,
    travelTimeMins: 16,
    address: 'Okhla Road, Sukhdev Vihar Metro Station, New Delhi - 110025',
    emergencyPhone: '011-47135000',
    casualtyAvailable: true,
    icuBedsAvailable: 8,
    hasCathLab: true,
    hasTraumaLevel1: false,
    pmjayCashless: true
  },
  {
    id: 'hosp-rml-delhi',
    name: 'Dr. Ram Manohar Lohia Hospital Emergency',
    type: 'Government District',
    city: 'New Delhi',
    distanceKm: 7.0,
    travelTimeMins: 18,
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi - 110001',
    emergencyPhone: '011-23365525',
    casualtyAvailable: true,
    icuBedsAvailable: 6,
    hasCathLab: true,
    hasTraumaLevel1: true,
    pmjayCashless: true
  }
];

export const INDIAN_EMERGENCY_HELPLINES = [
  {
    number: '102',
    title: 'National Ambulance Service (Free)',
    hindiTitle: 'राष्ट्रीय एम्बुलेंस सेवा (102)',
    desc: 'Government Free 102 Ambulance across India for critical emergencies, maternal and pediatric transit',
    badge: 'Primary 102',
    tel: '102',
    isPrimary: true
  },
  {
    number: '108',
    title: 'Emergency Medical & Trauma Response (ALS/BLS)',
    hindiTitle: 'आपातकालीन चिकित्सा एवं ट्रॉमा सेवा',
    desc: 'State Emergency Medical Services with trained paramedics and life support equipment',
    badge: '24x7 ALS',
    tel: '108',
    isPrimary: false
  },
  {
    number: '112',
    title: 'National Unified Emergency Response (ERSS)',
    hindiTitle: 'एकीकृत राष्ट्रीय आपातकालीन हेल्पलाइन',
    desc: 'Unified Pan-India single emergency number for Police, Fire, and Medical Assistance',
    badge: 'Pan-India',
    tel: '112',
    isPrimary: false
  },
  {
    number: '1075',
    title: 'National Health Helpline (MoHFW)',
    hindiTitle: 'राष्ट्रीय स्वास्थ्य हेल्पलाइन',
    desc: 'Ministry of Health and Family Welfare official medical guidance and emergency hospital info',
    badge: 'Govt MoHFW',
    tel: '1075',
    isPrimary: false
  }
];

