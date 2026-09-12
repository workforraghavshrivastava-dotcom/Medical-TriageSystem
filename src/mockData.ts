import { PatientProfile, TriageCase, AuditLogEntry } from './types';

export const INITIAL_PATIENT: PatientProfile = {
  id: 'PT-89421',
  mrn: 'MRN-7734190',
  firstName: 'Eleanor',
  lastName: 'Vance',
  dateOfBirth: '1974-06-18',
  age: 52,
  sex: 'Female',
  bloodType: 'A+',
  weightKg: 68.5,
  heightCm: 167,
  allergies: [
    { allergen: 'Penicillin', reaction: 'Anaphylaxis, hives, bronchospasm', severity: 'Life-Threatening' },
    { allergen: 'Sulfa Drugs', reaction: 'Severe maculopapular rash', severity: 'Moderate' }
  ],
  chronicConditions: [
    'Essential Hypertension (ICD-10 I10)',
    'Type 2 Diabetes Mellitus (ICD-10 E11.9)',
    'Mild Intermittent Asthma (ICD-10 J45.20)'
  ],
  medications: [
    { name: 'Lisinopril', dosage: '20 mg', frequency: 'Once daily PO', indication: 'Hypertension' },
    { name: 'Metformin HCl', dosage: '1000 mg', frequency: 'Twice daily with meals', indication: 'T2DM' },
    { name: 'Albuterol HFA Inhaler', dosage: '90 mcg/actuation', frequency: '2 puffs PRN wheezing', indication: 'Asthma' }
  ],
  pastSurgeries: [
    'Laparoscopic Cholecystectomy (2018)',
    'Right Knee Arthroscopy (2021)'
  ],
  emergencyContact: {
    name: 'David Vance',
    relationship: 'Spouse',
    phone: '+1 (555) 349-8120'
  },
  preferredLanguage: 'en'
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-991',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    actorRole: 'Patient',
    actorName: 'Eleanor Vance',
    action: 'Session Authentication & Biometric Verification',
    resourceType: 'PHI_VIEW',
    details: 'Patient authenticated via secure 2FA session. Token issued.',
    ipMasked: '192.168.1.***'
  },
  {
    id: 'AUD-992',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    actorRole: 'System_AI',
    actorName: 'Gemini Medical Clinical Engine',
    action: 'Multi-Modal Triage Evaluation (Case #TRG-104)',
    resourceType: 'TRIAGE_ANALYSIS',
    details: 'Analyzed chief complaint, ECG rhythm strip photo, and elevated Troponin lab report. Assigned ESI Level 2.',
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
    action: 'FHIR R4 Bundle Synchronization to Epic EHR',
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
        senderName: 'AegisTriage Automated Protocol',
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

