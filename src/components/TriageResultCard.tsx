import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Building2, 
  CheckCircle, 
  FileCode2, 
  MessageSquare, 
  PhoneCall, 
  Stethoscope, 
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';
import { TriageAnalysisResult, EsiLevel } from '../types';

interface TriageResultCardProps {
  result: TriageAnalysisResult;
  onOpenMessaging: () => void;
  onOpenEmergency: () => void;
  onViewFhir: () => void;
  onConnectClinician: () => void;
  onReset: () => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({
  result,
  onOpenMessaging,
  onOpenEmergency,
  onViewFhir,
  onConnectClinician,
  onReset
}) => {
  const getEsiTheme = (level: EsiLevel) => {
    switch (level) {
      case 1:
        return {
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          border: 'border-rose-500',
          glow: 'shadow-rose-500/30',
          cardBg: 'bg-rose-50/50',
          textColor: 'text-rose-950',
          desc: 'Immediate Life Threat / Resuscitation'
        };
      case 2:
        return {
          badgeBg: 'bg-orange-600',
          badgeText: 'text-white',
          border: 'border-orange-500',
          glow: 'shadow-orange-500/30',
          cardBg: 'bg-orange-50/50',
          textColor: 'text-orange-950',
          desc: 'Emergent / High Risk Potential'
        };
      case 3:
        return {
          badgeBg: 'bg-amber-500',
          badgeText: 'text-slate-900',
          border: 'border-amber-400',
          glow: 'shadow-amber-500/20',
          cardBg: 'bg-amber-50/50',
          textColor: 'text-amber-950',
          desc: 'Urgent / Multiple Diagnostic Resources'
        };
      case 4:
        return {
          badgeBg: 'bg-emerald-600',
          badgeText: 'text-white',
          border: 'border-emerald-500',
          glow: 'shadow-emerald-500/20',
          cardBg: 'bg-emerald-50/40',
          textColor: 'text-emerald-950',
          desc: 'Less Urgent / Single Resource Required'
        };
      case 5:
      default:
        return {
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          border: 'border-blue-500',
          glow: 'shadow-blue-500/20',
          cardBg: 'bg-blue-50/40',
          textColor: 'text-blue-950',
          desc: 'Non-Urgent / Routine Clinical Care'
        };
    }
  };

  const theme = getEsiTheme(result.esiLevel);
  const isHighAcuity = result.esiLevel <= 2;

  return (
    <div className="space-y-6">
      
      {/* Critical Acuity Red Alert Banner (if ESI 1 or 2) */}
      {isHighAcuity && (
        <div className="bg-rose-600 text-white rounded-2xl p-5 shadow-lg shadow-rose-600/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-rose-400 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl shrink-0 mt-0.5">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-rose-700 text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Critical Clinical Alert
                </span>
                <span className="text-rose-100 text-xs font-semibold">
                  ESI Acuity Level {result.esiLevel}
                </span>
              </div>
              <h3 className="text-lg font-black mt-1">
                Immediate Emergency Medical Attention Required
              </h3>
              <p className="text-xs text-rose-100 mt-1 max-w-2xl leading-relaxed">
                Your reported symptoms indicate high clinical risk. Do not attempt to drive yourself.
                Connect with emergency dispatch (911) or proceed immediately to the nearest Emergency Department.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              id="emergency-dispatch-btn"
              onClick={onOpenEmergency}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-rose-700 hover:bg-rose-50 font-black text-sm rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call 911 / Dispatch EMS</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Clinical Triage Header Card */}
      <div className={`bg-white border-2 ${theme.border} rounded-2xl p-6 shadow-md ${theme.glow}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-start gap-4">
            {/* ESI Acuity Badge */}
            <div className={`w-16 h-16 rounded-2xl ${theme.badgeBg} ${theme.badgeText} flex flex-col items-center justify-center shadow-md shrink-0`}>
              <span className="text-[10px] uppercase font-bold tracking-wider">ESI</span>
              <span className="text-2xl font-black leading-none">{result.esiLevel}</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                  {result.category}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {result.urgencyTimeline}
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  AI Confidence: {Math.round(result.confidenceScore * 100)}%
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {result.acuityTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {theme.desc}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="view-fhir-btn"
              onClick={onViewFhir}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              title="Inspect HL7 / FHIR R4 clinical bundle"
            >
              <FileCode2 className="w-3.5 h-3.5 text-teal-600" />
              <span>FHIR R4 EHR</span>
            </button>

            <button
              id="connect-clinician-btn"
              onClick={onConnectClinician}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Route to Clinician</span>
            </button>
          </div>
        </div>

        {/* Clinical Impression & Differential Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="md:col-span-2 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Primary Clinical Impression
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {result.primaryClinicalImpression}
              </h3>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Differential Considerations (Potential Etiologies)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.differentialConsiderations.map((diff, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                    {diff}
                  </span>
                ))}
              </div>
            </div>

            {/* Vitals Assessment */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  result.vitalsAssessment.status === 'Critical' ? 'bg-rose-500' :
                  result.vitalsAssessment.status === 'Abnormal' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                Hemodynamic & Vital Signs Assessment ({result.vitalsAssessment.status})
              </span>
              <p className="text-slate-600 leading-relaxed">
                {result.vitalsAssessment.details}
              </p>
            </div>
          </div>

          {/* Recommended Care Pathway */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Recommended Care Setting
              </span>
              <h4 className="text-sm font-extrabold text-teal-950 mt-1">
                {result.recommendedCareSetting}
              </h4>
            </div>

            <div className="text-xs text-teal-900 space-y-1">
              <span className="font-bold block">Evaluation Window:</span>
              <span className="font-medium bg-white/80 px-2 py-1 rounded border border-teal-200 block">
                {result.urgencyTimeline}
              </span>
            </div>

            <button
              id="chat-care-team-btn"
              onClick={onOpenMessaging}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message Care Team</span>
            </button>
          </div>
        </div>

        {/* Identified Red Flags (Alert Box) */}
        {result.identifiedRedFlags && result.identifiedRedFlags.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Identified Clinical Red Flags & Escalation Triggers
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-rose-950">
              {result.identifiedRedFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Multimodal Analysis Findings Highlight (if present) */}
        {result.multimodalFindings && (result.multimodalFindings.photoAnalysis || result.multimodalFindings.audioFindings || result.multimodalFindings.documentAnalysis) && (
          <div className="mt-4 p-4 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs">
            <h4 className="font-bold text-cyan-900 flex items-center gap-1.5 mb-2">
              <Eye className="w-4 h-4 text-cyan-700" />
              Multimodal Clinical Extraction Findings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.multimodalFindings.photoAnalysis && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-100">
                  <strong className="text-cyan-900 block mb-1">Visual / Photo Analysis:</strong>
                  <p className="text-slate-700">{result.multimodalFindings.photoAnalysis}</p>
                </div>
              )}
              {result.multimodalFindings.audioFindings && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-100">
                  <strong className="text-cyan-900 block mb-1">Acoustic / Speech Analysis:</strong>
                  <p className="text-slate-700">{result.multimodalFindings.audioFindings}</p>
                </div>
              )}
              {result.multimodalFindings.documentAnalysis && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-100">
                  <strong className="text-cyan-900 block mb-1">Laboratory Biomarker Findings:</strong>
                  <p className="text-slate-700">{result.multimodalFindings.documentAnalysis}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pre-arrival Guidance & Warning Signs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-200 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Pre-Arrival & Immediate Self-Care Instructions
            </h4>
            <ul className="space-y-1.5 text-slate-700">
              {result.preArrivalInstructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Warning Signs Requiring Immediate 911 Escalation
            </h4>
            <ul className="space-y-1.5 text-slate-700">
              {result.warningSignsToEscalate.map((warn, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Patient-Friendly Explanation */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-1.5 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Plain-Language Patient Guidance
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {result.patientExplanation}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            type="button"
            id="start-new-triage-btn"
            onClick={onReset}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ← Start New Triage Assessment
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="open-messaging-portal-btn"
              onClick={onOpenMessaging}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Secure Chat</span>
            </button>
            <button
              type="button"
              id="connect-provider-portal-btn"
              onClick={onConnectClinician}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinician Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
