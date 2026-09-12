import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Activity, 
  History, 
  MessageSquare, 
  ShieldCheck, 
  AlertOctagon, 
  FileCode2, 
  User, 
  Sparkles, 
  Clock, 
  Wifi, 
  CheckCircle2,
  ChevronRight,
  Heart,
  PhoneCall
} from 'lucide-react';
import { 
  PatientProfile, 
  TriageCase, 
  TriageAnalysisResult, 
  Message, 
  AuditLogEntry, 
  SupportedLanguage, 
  CareSetting, 
  EsiLevel,
  VitalSigns,
  MediaAttachment,
  LabResultItem
} from './types';
import { DEFAULT_PATIENT, MOCK_TRIAGE_CASES, INITIAL_MESSAGES, INITIAL_AUDIT_LOGS } from './mockData';
import { translations } from './translations';
import { Header } from './components/Header';
import { TriageIntakeForm } from './components/TriageIntakeForm';
import { TriageResultCard } from './components/TriageResultCard';
import { ClinicianDashboard } from './components/ClinicianDashboard';
import { SecureMessagingPortal } from './components/SecureMessagingPortal';
import { UserHistoryView } from './components/UserHistoryView';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { HipaaPrivacyModal } from './components/HipaaPrivacyModal';
import { EhrIntegrationModal } from './components/EhrIntegrationModal';

export default function App() {
  // Navigation & Role State
  const [activeRole, setActiveRole] = useState<'patient' | 'clinician'>('patient');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'intake' | 'result' | 'history' | 'messages'>('intake');

  // Core Data
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT);
  const [cases, setCases] = useState<TriageCase[]>(MOCK_TRIAGE_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(cases[0]?.id || null);
  const [currentResult, setCurrentResult] = useState<TriageAnalysisResult | null>(cases[0]?.analysis || null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Privacy & Modals
  const [isPhiDeidentified, setIsPhiDeidentified] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isEhrModalOpen, setIsEhrModalOpen] = useState<boolean>(false);
  const [activeFhirCase, setActiveFhirCase] = useState<TriageCase | null>(cases[0] || null);

  // Loading States
  const [isLoadingTriage, setIsLoadingTriage] = useState<boolean>(false);

  // Active translation dictionary
  const t = translations[currentLanguage] || translations.en;

  // Selected Case Reference
  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0] || null;

  // Fetch latest cases and audit logs on initial mount
  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => {
        const caseList = Array.isArray(data) ? data : data?.cases;
        if (Array.isArray(caseList) && caseList.length > 0) {
          setCases(caseList);
        }
      })
      .catch(err => console.log('Initial cases fetch error:', err));

    fetch('/api/hipaa/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.logs) && data.logs.length > 0) {
          setAuditLogs(data.logs);
        }
      })
      .catch(err => console.log('Initial audit logs fetch error:', err));
  }, []);

  // Handle Triage Submission
  const handleAnalyzeTriage = async (formData: {
    chiefComplaint: string;
    detailedSymptoms: string;
    painScale: number;
    vitals: VitalSigns;
    attachments: MediaAttachment[];
    labResults: LabResultItem[];
    photoBase64?: string;
    photoMimeType?: string;
    audioBase64?: string;
    audioMimeType?: string;
    medicalRecordText?: string;
  }) => {
    setIsLoadingTriage(true);
    try {
      const response = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          chiefComplaint: formData.chiefComplaint,
          detailedSymptoms: formData.detailedSymptoms,
          painScale: formData.painScale,
          vitals: formData.vitals,
          attachments: formData.attachments,
          labResults: formData.labResults,
          language: currentLanguage,
          photoBase64: formData.photoBase64,
          photoMimeType: formData.photoMimeType,
          audioBase64: formData.audioBase64,
          audioMimeType: formData.audioMimeType,
          medicalRecordText: formData.medicalRecordText
        })
      });

      const data = await response.json();
      if (data.analysis && data.caseItem) {
        setCurrentResult(data.analysis);
        setCases(prev => [data.caseItem, ...prev]);
        setSelectedCaseId(data.caseItem.id);
        setActiveFhirCase(data.caseItem);
        setActiveTab('result');

        // Log audit trail
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: 'Patient',
          actorName: `${patient.firstName} ${patient.lastName}`,
          action: 'EHR_TRIAGE_RUN',
          resourceType: 'TRIAGE_ANALYSIS',
          details: `AI Triage evaluation initiated. Resulting ESI Acuity: ${data.analysis.esiLevel}`,
          ipMasked: '192.168.***.***'
        };
        setAuditLogs(prev => [newLog, ...prev]);

        // If ESI 1 or 2, prompt emergency modal after 1.5s
        if (data.analysis.esiLevel <= 2) {
          setTimeout(() => {
            setIsEmergencyModalOpen(true);
          }, 1200);
        }
      }
    } catch (err) {
      console.error('Triage analysis error:', err);
    } finally {
      setIsLoadingTriage(false);
    }
  };

  // Handle Clinician Disposition Update
  const handleUpdateDisposition = async (
    caseId: string,
    updates: {
      clinicianOverrideEsi?: EsiLevel;
      clinicianNotes?: string;
      clinicianDisposition?: CareSetting;
      assignedClinician?: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/disposition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.case) {
        setCases(prev => prev.map(c => c.id === caseId ? data.case : c));
        if (selectedCaseId === caseId) {
          setSelectedCaseId(data.case.id);
        }

        // Add audit log
        const newLog: AuditLogEntry = {
          id: `log-audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: 'Emergency Physician',
          actorName: updates.assignedClinician || 'Attending Physician',
          action: 'CLINICAL_DISPOSITION_SIGNED',
          resourceType: 'DISPOSITION_CHANGE',
          details: `Physician verified disposition: ${updates.clinicianDisposition}, ESI: ${updates.clinicianOverrideEsi}`,
          ipMasked: '10.0.***.***'
        };
        setAuditLogs(prev => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Failed to update disposition:', err);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (
    text: string,
    isUrgent?: boolean,
    attachment?: { name: string; type: string; url?: string }
  ) => {
    const senderName = activeRole === 'patient' 
      ? (isPhiDeidentified ? 'PATIENT-89421' : `${patient.firstName} ${patient.lastName}`)
      : 'Dr. Marcus Chen, MD';

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      caseId: selectedCaseId || 'TRG-104',
      sender: activeRole,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      isUrgent: !!isUrgent,
      isRead: false,
      attachment
    };

    setMessages(prev => [...prev, newMessage]);

    // Send to backend
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
    } catch (err) {
      console.error('Message post error:', err);
    }
  };

  // De-identified Patient View Representation
  const displayPatient: PatientProfile = isPhiDeidentified
    ? {
        ...patient,
        firstName: 'PATIENT',
        lastName: '#89421',
        mrn: 'MRN-***4190',
        dateOfBirth: '1974-**-**',
        contactPhone: '(***) ***-9988'
      }
    : patient;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Global Clinical Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={(role) => setActiveRole(role)}
        selectedLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenEhr={() => {
          setActiveFhirCase(currentCase);
          setIsEhrModalOpen(true);
        }}
        isDeidentified={isPhiDeidentified}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Clinician Mode View */}
        {activeRole === 'clinician' ? (
          <ClinicianDashboard
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => setSelectedCaseId(id)}
            onUpdateDisposition={handleUpdateDisposition}
            onOpenMessaging={(caseId) => {
              setSelectedCaseId(caseId);
              setActiveTab('messages');
            }}
            onViewFhir={(caseItem) => {
              setActiveFhirCase(caseItem);
              setIsEhrModalOpen(true);
            }}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        ) : (
          /* Patient Mode View */
          <div className="space-y-6">
            
            {/* Patient Navigation Tabs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="tab-intake-btn"
                  onClick={() => setActiveTab('intake')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'intake'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Symptom Intake</span>
                </button>

                {currentResult && (
                  <button
                    type="button"
                    id="tab-result-btn"
                    onClick={() => setActiveTab('result')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'result'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Triage Result</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black text-white ${
                      currentResult.esiLevel <= 2 ? 'bg-rose-600' : currentResult.esiLevel === 3 ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      ESI {currentResult.esiLevel}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  id="tab-history-btn"
                  onClick={() => setActiveTab('history')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>{t.userHistoryTab}</span>
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-mono">
                    {cases.length}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-messages-btn"
                  onClick={() => setActiveTab('messages')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'messages'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.secureMessagingTab}</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3 px-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">Encrypted Cloud Sync</span>
                </span>
              </div>
            </div>

            {/* Tab 1: Intake Form */}
            {activeTab === 'intake' && (
              <TriageIntakeForm
                patient={displayPatient}
                language={currentLanguage}
                onSubmitTriage={handleAnalyzeTriage}
                isLoading={isLoadingTriage}
              />
            )}

            {/* Tab 2: Triage Result */}
            {activeTab === 'result' && currentResult && (
              <TriageResultCard
                result={currentResult}
                onOpenMessaging={() => setActiveTab('messages')}
                onOpenEmergency={() => setIsEmergencyModalOpen(true)}
                onViewFhir={() => {
                  setActiveFhirCase(currentCase);
                  setIsEhrModalOpen(true);
                }}
                onConnectClinician={() => setActiveRole('clinician')}
                onReset={() => setActiveTab('intake')}
              />
            )}

            {/* Tab 3: History */}
            {activeTab === 'history' && (
              <UserHistoryView
                cases={cases}
                onSelectCase={(c) => {
                  setSelectedCaseId(c.id);
                  if (c.analysis) {
                    setCurrentResult(c.analysis);
                    setActiveTab('result');
                  }
                }}
                onViewFhir={(c) => {
                  setActiveFhirCase(c);
                  setIsEhrModalOpen(true);
                }}
                onStartNewTriage={() => setActiveTab('intake')}
              />
            )}

            {/* Tab 4: Secure Messaging */}
            {activeTab === 'messages' && (
              <SecureMessagingPortal
                messages={messages}
                currentRole={activeRole}
                patientName={`${displayPatient.firstName} ${displayPatient.lastName}`}
                clinicianName="Dr. Marcus Chen, MD (Emergency Medicine)"
                onSendMessage={handleSendMessage}
                onOpenEmergency={() => setIsEmergencyModalOpen(true)}
                language={currentLanguage}
              />
            )}

          </div>
        )}

      </main>

      {/* Global Modals */}
      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        caseId={currentCase?.id}
        patientName={`${displayPatient.firstName} ${displayPatient.lastName}`}
        chiefComplaint={currentCase?.chiefComplaint || 'Acute medical triage evaluation'}
      />

      <HipaaPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        auditLogs={auditLogs}
        isPhiDeidentified={isPhiDeidentified}
        onToggleDeidentification={() => setIsPhiDeidentified(!isPhiDeidentified)}
      />

      <EhrIntegrationModal
        isOpen={isEhrModalOpen}
        onClose={() => setIsEhrModalOpen(false)}
        triageCase={activeFhirCase}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AegisTriage Clinical AI™</span>
            <span>•</span>
            <span>Emergency Severity Index (ESI v4) & FHIR R4 Compliant</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Security Rule Validated
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">Build 2026.4.1</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
