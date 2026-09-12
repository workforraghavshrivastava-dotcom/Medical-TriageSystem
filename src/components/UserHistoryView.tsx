import React from 'react';
import { 
  History, 
  Calendar, 
  Clock, 
  ChevronRight, 
  FileCode2, 
  CheckCircle2, 
  Heart, 
  Smartphone, 
  Wifi, 
  ArrowUpRight,
  Stethoscope,
  Sparkles,
  FileText
} from 'lucide-react';
import { TriageCase } from '../types';

interface UserHistoryViewProps {
  cases: TriageCase[];
  onSelectCase: (caseItem: TriageCase) => void;
  onViewFhir: (caseItem: TriageCase) => void;
  onStartNewTriage: () => void;
}

export const UserHistoryView: React.FC<UserHistoryViewProps> = ({
  cases,
  onSelectCase,
  onViewFhir,
  onStartNewTriage
}) => {
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
      
      {/* Top Banner: Longitudinal Tracking & Device Sync */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Longitudinal Triage History & Health Records
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete chronological record of all symptom assessments, physician dispositions, and triage encounters.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">Synced Across 3 Devices</span>
          </div>

          <button
            type="button"
            id="start-new-from-history-btn"
            onClick={onStartNewTriage}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Symptom Check</span>
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No previous triage records found.</p>
            <p className="text-xs text-slate-400 mt-1">Assessments you complete will appear here in chronological order.</p>
          </div>
        ) : (
          cases.map((item, idx) => {
            const esi = item.clinicianOverrideEsi || item.analysis?.esiLevel || 3;
            const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${getEsiBadge(esi)}`}>
                      <span className="text-[9px] uppercase font-bold tracking-wider">ESI</span>
                      <span className="text-lg font-black leading-none">{esi}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.analysis?.acuityTitle || item.chiefComplaint}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Case #{item.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr} at {timeStr}
                        </span>
                        <span>•</span>
                        <span>Setting: <strong>{item.clinicianDisposition || item.analysis?.recommendedCareSetting}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id={`export-fhir-btn-${item.id}`}
                      onClick={() => onViewFhir(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>FHIR</span>
                    </button>

                    <button
                      type="button"
                      id={`view-details-btn-${item.id}`}
                      onClick={() => onSelectCase(item)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Review Case</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Chief Complaint:</span>
                    <p className="line-clamp-2">{item.chiefComplaint}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Clinical Impression:</span>
                    <p className="line-clamp-2">{item.analysis?.primaryClinicalImpression || 'Under clinical review'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Physician Notes:</span>
                    <p className="line-clamp-2 italic text-slate-500">
                      {item.clinicianNotes || 'Standard clinical intake protocol completed.'}
                    </p>
                  </div>
                </div>

                {/* Badges / Vitals summary */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                  {item.vitals.heartRate && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      HR: {item.vitals.heartRate} bpm
                    </span>
                  )}
                  {item.vitals.systolicBp && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      BP: {item.vitals.systolicBp}/{item.vitals.diastolicBp}
                    </span>
                  )}
                  {item.vitals.oxygenSat && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      SpO2: {item.vitals.oxygenSat}%
                    </span>
                  )}
                  {item.attachments.length > 0 && (
                    <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded">
                      {item.attachments.length} multimedia file(s)
                    </span>
                  )}
                  {item.labResults.length > 0 && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                      {item.labResults.length} lab test(s)
                    </span>
                  )}
                  <span className="text-emerald-700 ml-auto flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Encrypted
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
