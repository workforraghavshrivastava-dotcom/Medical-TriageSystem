export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export type TriageCategory = 'Resuscitation' | 'Emergent' | 'Urgent' | 'Less Urgent' | 'Non-Urgent';

export type CareSetting = 
  | 'Emergency Department (Immediate)'
  | 'Urgent Care (Within 1-2 hours)'
  | 'Primary Care (Within 24-48 hours)'
  | 'Telehealth Consultation'
  | 'Home Care & Self-Monitoring';

export interface VitalSigns {
  heartRate?: number; // bpm (normal 60-100)
  systolicBp?: number; // mmHg (normal 90-120)
  diastolicBp?: number; // mmHg (normal 60-80)
  respiratoryRate?: number; // breaths/min (normal 12-20)
  oxygenSat?: number; // % (normal 95-100)
  temperature?: number; // °F (normal 97.8 - 99.1)
  painScore?: number; // 0-10
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  indication: string;
}

export interface PatientProfile {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  sex: 'Female' | 'Male' | 'Other';
  bloodType: string;
  weightKg: number;
  heightCm: number;
  allergies: Allergy[];
  chronicConditions: string[];
  medications: Medication[];
  pastSurgeries: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferredLanguage: string;
}

export interface MediaAttachment {
  id: string;
  type: 'photo' | 'audio' | 'document';
  name: string;
  dataUrl?: string; // base64 or preview
  mimeType: string;
  sizeBytes?: number;
  analysisSnippet?: string;
  timestamp: string;
}

export interface LabResultItem {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
  clinicalSignificance?: string;
}

export interface TriageAnalysisResult {
  esiLevel: EsiLevel;
  acuityTitle: string;
  category: TriageCategory;
  urgencyTimeline: string;
  confidenceScore: number;
  primaryClinicalImpression: string;
  differentialConsiderations: string[];
  identifiedRedFlags: string[];
  vitalsAssessment: {
    status: 'Stable' | 'Abnormal' | 'Critical';
    details: string;
  };
  multimodalFindings?: {
    photoAnalysis?: string;
    audioFindings?: string;
    documentAnalysis?: string;
  };
  recommendedCareSetting: CareSetting;
  preArrivalInstructions: string[];
  warningSignsToEscalate: string[];
  patientExplanation: string;
  suggestedQuestionsForClinician: string[];
  fhirBundle?: Record<string, unknown>;
}

export interface Message {
  id: string;
  caseId: string;
  sender: 'patient' | 'clinician' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    url?: string;
  };
  isRead?: boolean;
  isUrgent?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: 'Patient' | 'Triage Clinician' | 'Emergency Physician' | 'System_AI' | 'EMS_Dispatcher';
  actorName: string;
  action: string;
  resourceType: 'PHI_VIEW' | 'TRIAGE_ANALYSIS' | 'CLINICIAN_OVERRIDE' | 'DISPOSITION_CHANGE' | 'EMERGENCY_DISPATCH' | 'EHR_EXPORT' | 'SECURE_MESSAGE';
  details: string;
  ipMasked: string;
}

export interface TriageCase {
  id: string;
  timestamp: string;
  patient: PatientProfile;
  chiefComplaint: string;
  detailedSymptoms: string;
  onset: string;
  duration: string;
  painScale: number;
  vitals: VitalSigns;
  attachments: MediaAttachment[];
  labResults: LabResultItem[];
  analysis?: TriageAnalysisResult;
  status: 'pending_analysis' | 'ai_evaluated' | 'in_clinician_review' | 'clinician_verified' | 'emergency_escalated' | 'resolved';
  clinicianOverrideEsi?: EsiLevel;
  clinicianNotes?: string;
  clinicianDisposition?: CareSetting;
  assignedClinician?: string;
  messages: Message[];
  language: string;
}

export interface EmergencyDispatchState {
  isActive: boolean;
  caseId?: string;
  patientName?: string;
  timestamp?: string;
  status: 'Triggered' | 'Dispatched' | 'En Route' | 'On Scene';
  locationAddress: string;
  coordinates: { lat: number; lng: number };
  nearestHospital: string;
  etaMinutes: number;
  ambulanceUnit: string;
  chiefComplaint: string;
}

export type SupportedLanguage = 'en' | 'es' | 'zh' | 'fr' | 'ar' | 'hi';
