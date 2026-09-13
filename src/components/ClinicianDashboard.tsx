import React, { useState } from 'react';
import { 
  Stethoscope, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Filter, 
  FileCode2, 
  MessageSquare, 
  PhoneCall, 
  FileText, 
  Image as ImageIcon, 
  Heart, 
  ShieldAlert, 
  User, 
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TriageCase, EsiLevel, CareSetting } from '../types';

interface ClinicianDashboardProps {
  cases: TriageCase[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onUpdateDisposition: (caseId: string, updates: {
    clinicianOverrideEsi?: EsiLevel;
    clinicianNotes?: string;
    clinicianDisposition?: CareSetting;
    assignedClinician?: string;
  }) => Promise<void>;
  onOpenMessaging: (caseId: string) => void;
  onViewFhir: (caseItem: TriageCase) => void;
  onOpenEmergency: () => void;
}

export const ClinicianDashboard: React.FC<ClinicianDashboardProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onUpdateDisposition,
  onOpenMessaging,
  onViewFhir,
  onOpenEmergency
}) => {
  const [filterAcuity, setFilterAcuity] = useState<'ALL' | 'CRITICAL' | 'URGENT' | 'LOW'>('ALL');
  
  // Selected case
  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0] || null;

  // Clinician edits
  const [overrideEsi, setOverrideEsi] = useState<EsiLevel | null>(null);
  const [clinicianNotes, setClinicianNotes] = useState<string>('');
  const [disposition, setDisposition] = useState<CareSetting>('Emergency Department (Immediate)');
  const [clinicianName, setClinicianName] = useState<string>('Dr. Marcus Chen, MD (Attending ER)');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state when active case changes
  React.useEffect(() => {
    if (activeCase) {
      setOverrideEsi(activeCase.clinicianOverrideEsi || activeCase.analysis?.esiLevel || 3);
      setClinicianNotes(activeCase.clinicianNotes || '');
      setDisposition(activeCase.clinicianDisposition || activeCase.analysis?.recommendedCareSetting || 'Emergency Department (Immediate)');
      setClinicianName(activeCase.assignedClinician || 'Dr. Marcus Chen, MD (Attending ER)');
      setSaveSuccess(false);
    }
  }, [activeCase?.id]);

  // Filter cases
  const filteredCases = cases.filter(c => {
    const level = c.clinicianOverrideEsi || c.analysis?.esiLevel || 3;
    if (filterAcuity === 'CRITICAL') return level <= 2;
    if (filterAcuity === 'URGENT') return level === 3;
    if (filterAcuity === 'LOW') return level >= 4;
    return true;
  }).sort((a, b) => {
    const levelA = a.clinicianOverrideEsi || a.analysis?.esiLevel || 5;
    const levelB = b.clinicianOverrideEsi || b.analysis?.esiLevel || 5;
    return levelA - levelB; // ESI 1 first
  });

  const handleSaveDisposition = async () => {
    if (!activeCase) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateDisposition(activeCase.id, {
        clinicianOverrideEsi: overrideEsi || undefined,
        clinicianNotes,
        clinicianDisposition: disposition,
        assignedClinician: clinicianName
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving disposition:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getEsiBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-rose-600 text-white font-black';
      case 2:
        return 'bg-orange-600 text-white font-black';
      case 3:
        return 'bg-amber-500 text-slate-900 font-bold';
      case 4:
        return 'bg-emerald-600 text-white font-bold';
      case 5:
      default:
        return 'bg-blue-600 text-white font-bold';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Clinician Station Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Emergency Department Clinician Command Center</h2>
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active Duty: ER Triage Station 1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live multi-patient acuity queue with AI decision support, EHR synchronization, and direct intervention controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="clinician-emergency-alert-btn"
            onClick={onOpenEmergency}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>EMS Code Alert</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Queue (1/3), Right Inspector (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Triage Queue */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          
          {/* Queue Header & Filters */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">Triage Intake Queue</h3>
                <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {filteredCases.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Live Sync
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="filter-all-btn"
                onClick={() => setFilterAcuity('ALL')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  filterAcuity === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({cases.length})
              </button>
              <button
                type="button"
                id="filter-critical-btn"
                onClick={() => setFilterAcuity('CRITICAL')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  filterAcuity === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                ESI 1-2
              </button>
              <button
                type="button"
                id="filter-urgent-btn"
                onClick={() => setFilterAcuity('URGENT')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  filterAcuity === 'URGENT'
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                ESI 3
              </button>
              <button
                type="button"
                id="filter-low-btn"
                onClick={() => setFilterAcuity('LOW')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  filterAcuity === 'LOW'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                ESI 4-5
              </button>
            </div>
          </div>

          {/* Queue List */}
          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredCases.map((c) => {
              const esi = c.clinicianOverrideEsi || c.analysis?.esiLevel || 3;
              const isSelected = activeCase?.id === c.id;

              return (
                <div
                  key={c.id}
                  id={`queue-case-${c.id}`}
                  onClick={() => onSelectCase(c.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-teal-50/70 border-l-4 border-l-teal-600 shadow-inner' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${getEsiBadge(esi)}`}>
                        {esi}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate max-w-[160px]">
                          {c.patient.firstName} {c.patient.lastName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.patient.mrn} • {c.patient.age}y {c.patient.sex}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.chiefComplaint}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {c.vitals.heartRate && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                        HR: {c.vitals.heartRate}
                      </span>
                    )}
                    {c.vitals.systolicBp && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                        BP: {c.vitals.systolicBp}/{c.vitals.diastolicBp}
                      </span>
                    )}
                    {c.attachments.length > 0 && (
                      <span className="text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.2 rounded">
                        +{c.attachments.length} media
                      </span>
                    )}
                    {c.status === 'clinician_verified' && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                        Signed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Case Inspector & Decision Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {activeCase ? (
            <>
              {/* Patient Banner & Medical Alerts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeCase.patient.firstName} {activeCase.patient.lastName}
                    </h3>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      MRN: {activeCase.patient.mrn}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      Case #{activeCase.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    DOB: {activeCase.patient.dateOfBirth} ({activeCase.patient.age}y) • Sex: {activeCase.patient.sex} • Blood: {activeCase.patient.bloodType} • Weight: {activeCase.patient.weightKg} kg
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="clinician-dispatch-102-btn"
                    onClick={onOpenEmergency}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Dispatch 102</span>
                  </button>

                  <button
                    type="button"
                    id="clinician-msg-btn"
                    onClick={() => onOpenMessaging(activeCase.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Chat Patient</span>
                  </button>

                  <button
                    type="button"
                    id="clinician-fhir-export-btn"
                    onClick={() => onViewFhir(activeCase)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-300 transition-colors cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sync EHR / FHIR</span>
                  </button>
                </div>
              </div>

              {/* Allergy Warning Banner */}
              {activeCase.patient.allergies.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-rose-900 font-bold block">ALLERGY WARNING:</strong>
                    <span className="text-rose-800 font-medium">
                      {activeCase.patient.allergies.map(a => `${a.allergen}: ${a.reaction} (${a.severity})`).join(' | ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Chief Complaint & Vitals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block">
                    Reported Chief Complaint
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {activeCase.chiefComplaint}
                  </p>
                  {activeCase.detailedSymptoms && (
                    <p className="text-slate-600 text-xs leading-relaxed border-t border-slate-200 pt-2 mt-2">
                      {activeCase.detailedSymptoms}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1 text-slate-500 font-semibold">
                    <span>Pain: {activeCase.painScale}/10</span>
                    <span>•</span>
                    <span>Onset: {activeCase.onset}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Recorded Vital Signs
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {activeCase.vitals.heartRate ? `${activeCase.vitals.heartRate} bpm` : '--'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">BP (Sys/Dia)</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {activeCase.vitals.systolicBp ? `${activeCase.vitals.systolicBp}/${activeCase.vitals.diastolicBp}` : '--'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">SpO2 (O2)</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {activeCase.vitals.oxygenSat ? `${activeCase.vitals.oxygenSat}%` : '--'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Resp Rate</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {activeCase.vitals.respiratoryRate ? `${activeCase.vitals.respiratoryRate}/min` : '--'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Temperature</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {activeCase.vitals.temperature ? `${activeCase.vitals.temperature}°F` : '--'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Pain Score</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {activeCase.vitals.painScore ?? activeCase.painScale}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multimodal Evidence Panel (Photos, Labs, Audio) */}
              {(activeCase.attachments.length > 0 || activeCase.labResults.length > 0) && (
                <div className="p-4 bg-cyan-50/40 border border-cyan-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-700" />
                    Multimodal Attachments & Laboratory Findings
                  </h4>

                  {/* Photo / Audio Attachments */}
                  {activeCase.attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCase.attachments.map((att, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-cyan-100 flex items-start gap-3">
                          {att.type === 'photo' && att.dataUrl ? (
                            <img src={att.dataUrl} alt={att.name} className="w-16 h-16 object-cover rounded border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="text-xs overflow-hidden">
                            <span className="font-bold text-slate-800 block truncate">{att.name}</span>
                            <span className="text-[11px] text-slate-500 block mb-1">Type: {att.type}</span>
                            {att.analysisSnippet && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2">
                                {att.analysisSnippet}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Labs Table */}
                  {activeCase.labResults.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 flex justify-between">
                        <span>Laboratory Panel Results</span>
                        <span>Flag</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {activeCase.labResults.map((lab, i) => (
                          <div key={i} className="px-3 py-2 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800">{lab.testName}: </span>
                              <span className="font-mono text-slate-900">{lab.value} {lab.unit} </span>
                              <span className="text-[11px] text-slate-400 font-mono">(Ref: {lab.referenceRange})</span>
                              {lab.clinicalSignificance && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{lab.clinicalSignificance}</p>
                              )}
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                              lab.status === 'Critical' ? 'bg-rose-100 text-rose-800' :
                              lab.status === 'High' ? 'bg-amber-100 text-amber-800' :
                              lab.status === 'Low' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {lab.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Triage Impression & Recommendation */}
              {activeCase.analysis && (
                <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      AI Decision Support Impression
                    </span>
                    <span className="font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                      AI Acuity: ESI {activeCase.analysis.esiLevel} ({activeCase.analysis.category})
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {activeCase.analysis.primaryClinicalImpression}
                  </p>
                  <p className="text-slate-700">
                    Differential: {activeCase.analysis.differentialConsiderations.join(', ')}
                  </p>
                  {activeCase.analysis.suggestedQuestionsForClinician && (
                    <div className="mt-2 pt-2 border-t border-teal-200/60">
                      <span className="font-bold text-teal-900 block mb-1">Recommended Clinician Inquiries:</span>
                      <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                        {activeCase.analysis.suggestedQuestionsForClinician.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Clinician Action / Disposition / ESI Override Form */}
              <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    Clinician Evaluation & Formal Disposition Sign-Off
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Physician digital signature logged in HIPAA audit trail
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* ESI Level Confirmation / Override */}
                  <div>
                    <label htmlFor="clinician-esi-select" className="block text-slate-300 font-bold mb-1">
                      Confirmed Emergency Severity Index (ESI Level):
                    </label>
                    <select
                      id="clinician-esi-select"
                      value={overrideEsi ?? 3}
                      onChange={(e) => setOverrideEsi(Number(e.target.value) as EsiLevel)}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold focus:ring-2 focus:ring-teal-400"
                    >
                      <option value={1}>ESI 1 - Resuscitation / Immediate Life Threat</option>
                      <option value={2}>ESI 2 - Emergent / High Risk Potential</option>
                      <option value={3}>ESI 3 - Urgent / Multi-Resource Required</option>
                      <option value={4}>ESI 4 - Less Urgent / Single Resource</option>
                      <option value={5}>ESI 5 - Non-Urgent / Clinic Care</option>
                    </select>
                  </div>

                  {/* Disposition */}
                  <div>
                    <label htmlFor="clinician-disposition-select" className="block text-slate-300 font-bold mb-1">
                      Clinical Disposition Order:
                    </label>
                    <select
                      id="clinician-disposition-select"
                      value={disposition}
                      onChange={(e) => setDisposition(e.target.value as CareSetting)}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="Emergency Department (Immediate)">Admit to Emergency Department (Immediate)</option>
                      <option value="Urgent Care (Within 1-2 hours)">Route to Urgent Care Center (1-2 Hours)</option>
                      <option value="Primary Care (Within 24-48 hours)">Schedule Outpatient Primary Care (24-48h)</option>
                      <option value="Telehealth Consultation">Initiate Live Telehealth Virtual Consult</option>
                      <option value="Home Care & Self-Monitoring">Discharge with Home Monitoring Instructions</option>
                    </select>
                  </div>
                </div>

                {/* Clinical Notes Field */}
                <div>
                  <label htmlFor="clinician-notes-textarea" className="block text-slate-300 text-xs font-bold mb-1">
                    Attending Physician / Triage Nurse Clinical Notes:
                  </label>
                  <textarea
                    id="clinician-notes-textarea"
                    rows={3}
                    value={clinicianNotes}
                    onChange={(e) => setClinicianNotes(e.target.value)}
                    placeholder="Document clinical assessment, differential justification, planned interventions, or medication orders..."
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                {/* Sign-Off Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Signed by:</span>
                    <input
                      type="text"
                      value={clinicianName}
                      onChange={(e) => setClinicianName(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-teal-300 px-2.5 py-1 rounded text-xs font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Signed & Updated
                      </span>
                    )}
                    <button
                      type="button"
                      id="save-disposition-btn"
                      onClick={handleSaveDisposition}
                      disabled={isSaving}
                      className="px-5 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {isSaving ? 'Synchronizing with EHR...' : 'Confirm & Sign Clinical Disposition'}
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <Stethoscope className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Select a triage case from the queue to review.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
