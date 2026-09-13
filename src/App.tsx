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
  PhoneCall,
  Ambulance,
  Building2,
  CreditCard,
  Sliders
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
import { Header, AppPageId } from './components/Header';
import { MinimalistEmergencyTriage } from './components/MinimalistEmergencyTriage';
import { AmbulanceDispatchPage } from './components/AmbulanceDispatchPage';
import { HospitalFinderPage } from './components/HospitalFinderPage';
import { AbhaHealthLockerPage } from './components/AbhaHealthLockerPage';
import { TriageIntakeForm } from './components/TriageIntakeForm';
import { TriageResultCard } from './components/TriageResultCard';
import { ClinicianDashboard } from './components/ClinicianDashboard';
import { SecureMessagingPortal } from './components/SecureMessagingPortal';
import { UserHistoryView } from './components/UserHistoryView';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { HipaaPrivacyModal } from './components/HipaaPrivacyModal';
import { EhrIntegrationModal } from './components/EhrIntegrationModal';
import { HomePageHub } from './components/HomePageHub';
import { evaluateClinicalRules } from './utils/clinicalRulesEngine';

export default function App() {
  // Navigation & Page State
  const [activeRole, setActiveRole] = useState<'patient' | 'clinician'>('patient');
  const [activePage, setActivePage] = useState<AppPageId>('home');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  
  // Triage view mode: 'minimalist' (default for emergency) or 'comprehensive'
  const [triageMode, setTriageMode] = useState<'minimalist' | 'comprehensive'>('minimalist');
  const [comprehensiveTab, setComprehensiveTab] = useState<'intake' | 'result'>('intake');

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
  const isHindi = currentLanguage === 'hi';
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

  // Handle Triage Submission (both Minimalist and Comprehensive)
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

    // Instant clinical rule-based triage assessment (<5ms)
    const instantRuleAnalysis = evaluateClinicalRules({
      chiefComplaint: formData.chiefComplaint,
      detailedSymptoms: formData.detailedSymptoms,
      vitals: formData.vitals,
      patient,
      painScale: formData.painScale,
      language: currentLanguage
    });

    // Immediately display fast, tailored rule-based results so user doesn't wait
    setCurrentResult(instantRuleAnalysis);

    const localCaseId = `TRG-${Math.floor(100 + Math.random() * 900)}`;
    const localCaseItem: TriageCase = {
      id: localCaseId,
      timestamp: new Date().toISOString(),
      patient,
      chiefComplaint: formData.chiefComplaint || 'Emergency triage assessment',
      detailedSymptoms: formData.detailedSymptoms || '',
      onset: 'Acute onset',
      duration: 'Under 2 hours',
      painScale: formData.painScale || 5,
      vitals: formData.vitals,
      attachments: formData.attachments || [],
      labResults: formData.labResults || [],
      analysis: instantRuleAnalysis,
      status: instantRuleAnalysis.esiLevel <= 2 ? 'emergency_escalated' : 'ai_evaluated',
      messages: [],
      language: currentLanguage
    };

    setCases(prev => [localCaseItem, ...prev]);
    setSelectedCaseId(localCaseId);
    setActiveFhirCase(localCaseItem);
    setComprehensiveTab('result');

    // If critical ESI 1 or 2, open emergency 102 modal prompt
    if (instantRuleAnalysis.esiLevel <= 2) {
      setTimeout(() => {
        setIsEmergencyModalOpen(true);
      }, 1000);
    }

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
      const serverAnalysis = data.analysis || (data.esiLevel ? data : null);
      if (serverAnalysis) {
        // If server provided enhanced analysis (e.g. multimodal findings), update smoothly
        setCurrentResult(serverAnalysis);
        if (data.caseItem) {
          setCases(prev => [data.caseItem, ...prev.filter(c => c.id !== localCaseId)]);
          setSelectedCaseId(data.caseItem.id);
          setActiveFhirCase(data.caseItem);
        }
      }

      // Log audit trail
      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorRole: 'Patient',
        actorName: `${patient.firstName} ${patient.lastName}`,
        action: 'EHR_TRIAGE_RUN',
        resourceType: 'TRIAGE_ANALYSIS',
        details: `Rule-based triage evaluation completed. Resulting ESI Acuity: ${instantRuleAnalysis.esiLevel}`,
        ipMasked: '103.21.***.***'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.warn('Network sync notice (local rule engine provided full results):', err);
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
        dateOfBirth: '1988-**-**',
        contactPhone: '+91 98*** 0021'
      }
    : patient;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Global Minimalist Header */}
      <Header
        currentRole={activeRole}
        onRoleChange={(role) => {
          setActiveRole(role);
          if (role === 'clinician') {
            setActivePage('clinician');
          } else if (activePage === 'clinician') {
            setActivePage('triage');
          }
        }}
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          if (page === 'clinician') {
            setActiveRole('clinician');
          } else {
            setActiveRole('patient');
          }
        }}
        language={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        isSyncing={false}
        activeCaseCount={cases.filter(c => (c.clinicianOverrideEsi || c.analysis?.esiLevel || 3) <= 2).length}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        
        {/* Page 0: Interactive Visual Home Page Hub */}
        {activePage === 'home' && (
          <HomePageHub
            onNavigate={(page) => {
              setActivePage(page);
              if (page === 'clinician') {
                setActiveRole('clinician');
              } else {
                setActiveRole('patient');
              }
            }}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
            language={currentLanguage}
            activeCaseCount={cases.filter(c => (c.clinicianOverrideEsi || c.analysis?.esiLevel || 3) <= 2).length}
          />
        )}

        {/* Page 1: Triage (Emergency Minimalist Default) */}
        {activePage === 'triage' && (
          <div className="space-y-4">
            
            {/* View Mode Sub-Toggle: Fast Minimalist vs. Comprehensive Form */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">
                  {triageMode === 'minimalist' 
                    ? (isHindi ? 'त्वरित आपातकालीन मोड (1-टैप ट्राइएज)' : 'Emergency Zero-Friction Mode')
                    : (isHindi ? 'विस्तृत क्लिनिकल फॉर्म' : 'Comprehensive Clinical Intake Form')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTriageMode(triageMode === 'minimalist' ? 'comprehensive' : 'minimalist')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {triageMode === 'minimalist' 
                      ? (isHindi ? 'विस्तृत फॉर्म देखें' : 'Switch to Detailed Form')
                      : (isHindi ? 'त्वरित मोड पर लौटें' : 'Switch to Minimalist')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('history')}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isHindi ? 'इतिहास' : 'History'} ({cases.length})</span>
                </button>
              </div>
            </div>

            {/* Minimalist Emergency View */}
            {triageMode === 'minimalist' ? (
              <MinimalistEmergencyTriage
                patient={displayPatient}
                language={currentLanguage}
                onAnalyze={handleAnalyzeTriage}
                isLoading={isLoadingTriage}
                currentResult={currentResult}
                onOpen102Modal={() => setIsEmergencyModalOpen(true)}
                onNavigateToAmbulancePage={() => setActivePage('ambulance')}
                onNavigateToHospitalsPage={() => setActivePage('hospitals')}
              />
            ) : (
              /* Comprehensive Mode (Detailed Vitals, Media, Form) */
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setComprehensiveTab('intake')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      comprehensiveTab === 'intake'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Intake Form
                  </button>
                  {currentResult && (
                    <button
                      type="button"
                      onClick={() => setComprehensiveTab('result')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        comprehensiveTab === 'result'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      AI Triage Result (ESI {currentResult.esiLevel})
                    </button>
                  )}
                </div>

                {comprehensiveTab === 'intake' ? (
                  <TriageIntakeForm
                    patient={displayPatient}
                    language={currentLanguage}
                    onSubmitTriage={handleAnalyzeTriage}
                    isLoading={isLoadingTriage}
                  />
                ) : (
                  currentResult && (
                    <TriageResultCard
                      result={currentResult}
                      onOpenMessaging={() => setActivePage('messages')}
                      onOpenEmergency={() => setIsEmergencyModalOpen(true)}
                      onViewFhir={() => {
                        setActiveFhirCase(currentCase);
                        setIsEhrModalOpen(true);
                      }}
                      onConnectClinician={() => {
                        setActiveRole('clinician');
                        setActivePage('clinician');
                      }}
                      onReset={() => setComprehensiveTab('intake')}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Page 2: 102 Ambulance Dispatch Live Tracking */}
        {activePage === 'ambulance' && (
          <AmbulanceDispatchPage
            language={currentLanguage}
            patientName={`${displayPatient.firstName} ${displayPatient.lastName}`}
            onBackToTriage={() => setActivePage('triage')}
          />
        )}

        {/* Page 3: Emergency Casualty Hospitals Finder */}
        {activePage === 'hospitals' && (
          <HospitalFinderPage
            language={currentLanguage}
            onBackToTriage={() => setActivePage('triage')}
            onCallAmbulance={() => setActivePage('ambulance')}
          />
        )}

        {/* Page 4: ABHA Digital Health Locker & Ayushman Card */}
        {activePage === 'abha' && (
          <AbhaHealthLockerPage
            patient={displayPatient}
            language={currentLanguage}
            onBackToTriage={() => setActivePage('triage')}
            onOpenFhirModal={() => {
              setActiveFhirCase(currentCase);
              setIsEhrModalOpen(true);
            }}
          />
        )}

        {/* Page 5: Clinician Command Dashboard */}
        {activePage === 'clinician' && (
          <ClinicianDashboard
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => setSelectedCaseId(id)}
            onUpdateDisposition={handleUpdateDisposition}
            onOpenMessaging={(caseId) => {
              setSelectedCaseId(caseId);
              setActivePage('messages');
            }}
            onViewFhir={(caseItem) => {
              setActiveFhirCase(caseItem);
              setIsEhrModalOpen(true);
            }}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {/* Page 6: Patient History */}
        {activePage === 'history' && (
          <UserHistoryView
            cases={cases}
            onSelectCase={(c) => {
              setSelectedCaseId(c.id);
              if (c.analysis) {
                setCurrentResult(c.analysis);
                setActivePage('triage');
              }
            }}
            onViewFhir={(c) => {
              setActiveFhirCase(c);
              setIsEhrModalOpen(true);
            }}
            onStartNewTriage={() => setActivePage('triage')}
          />
        )}

        {/* Page 7: Secure Messaging */}
        {activePage === 'messages' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setActivePage('triage')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer"
            >
              <span>← Back to Triage</span>
            </button>
            <SecureMessagingPortal
              messages={messages}
              currentRole={activeRole}
              patientName={`${displayPatient.firstName} ${displayPatient.lastName}`}
              clinicianName="Dr. Marcus Chen, MD (Emergency Medicine)"
              onSendMessage={handleSendMessage}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              language={currentLanguage}
            />
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

      {/* Aesthetic Micro Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">MySwaasth India</span>
            <span>•</span>
            <span className="font-medium text-slate-600">102 National Ambulance Service</span>
            <span>•</span>
            <span className="text-teal-700 font-medium">ABDM & ESI v4 Compliant</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">Emergency Helpline: 102 / 108 / 112</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
