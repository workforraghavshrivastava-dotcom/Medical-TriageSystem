import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  CheckCircle2, 
  X, 
  Server, 
  Key, 
  History, 
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface HipaaPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
  isPhiDeidentified: boolean;
  onToggleDeidentification: () => void;
}

export const HipaaPrivacyModal: React.FC<HipaaPrivacyModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  isPhiDeidentified,
  onToggleDeidentification
}) => {
  const [activeTab, setActiveTab] = useState<'SAFEGUARDS' | 'AUDIT_LOG' | 'DEIDENTIFY'>('SAFEGUARDS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 border border-teal-400/30 rounded-2xl text-teal-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                  HIPAA Security & Privacy Rule
                </span>
                <span className="text-xs text-slate-300 font-semibold">45 CFR Part 160 & 164</span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">
                Data Privacy, Encryption & Audit Assurance
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="close-privacy-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 border-b border-slate-200 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            id="tab-safeguards-btn"
            onClick={() => setActiveTab('SAFEGUARDS')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'SAFEGUARDS'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security Safeguards
          </button>
          <button
            type="button"
            id="tab-deidentify-btn"
            onClick={() => setActiveTab('DEIDENTIFY')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'DEIDENTIFY'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PHI De-Identification
          </button>
          <button
            type="button"
            id="tab-audit-btn"
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'AUDIT_LOG'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Immutable Audit Trail</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: Safeguards Overview */}
          {activeTab === 'SAFEGUARDS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                    <Key className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Technical Safeguards (§ 164.312)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    All ePHI in transit is strictly encrypted using TLS 1.3 with forward secrecy. At rest, data is protected by AES-256 cryptographic standards with automated key rotation.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Role-Based Access (RBAC)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Granular permission separation between Patient Self-Service and Licensed Clinician stations. Only assigned providers can inspect full longitudinal records.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Separation
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <History className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Audit Controls (§ 164.312(b))
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Hardware-stamped immutable logs record every PHI access, AI triage execution, clinician override, and message delivery with IP masking.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Real-Time Logging
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                    <Server className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Minimum Necessary Standard
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Diagnostic models only receive clinical tokens strictly required for ESI severity ranking. Demographic identifiers are scrubbed or tokenized.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Safe Harbor Compliant
                  </span>
                </div>

              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Business Associate Agreement (BAA) provisions verified for all underlying server-side processing nodes.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PHI De-Identification Toggle */}
          {activeTab === 'DEIDENTIFY' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {isPhiDeidentified ? <EyeOff className="w-4 h-4 text-teal-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
                      Anonymized Clinical Mode (Safe Harbor Protocol)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      When enabled, patient names, date of birth, and medical record numbers are obfuscated on-screen to prevent unauthorized visual inspection in open triage areas.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="toggle-deidentify-btn"
                    onClick={onToggleDeidentification}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isPhiDeidentified
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isPhiDeidentified ? 'Anonymization Active' : 'Enable Masking'}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block mb-1">Standard Display:</span>
                    <span className="font-bold text-slate-800">Eleanor Vance (MRN-7734190)</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block mb-1">De-identified Masked Output:</span>
                    <span className="font-mono font-bold text-teal-700">PATIENT-89421 (MRN-***4190)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Immutable Audit Trail */}
          {activeTab === 'AUDIT_LOG' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tamper-evident chronological access record:</span>
                <span className="font-mono">Total Log Entries: {auditLogs.length}</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 grid grid-cols-12 gap-2">
                  <span className="col-span-3">Timestamp / Actor</span>
                  <span className="col-span-3">Action Type</span>
                  <span className="col-span-4">Audit Details</span>
                  <span className="col-span-2 text-right">IP (Masked)</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="px-3 py-2 grid grid-cols-12 gap-2 items-center hover:bg-slate-50">
                      <div className="col-span-3">
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {log.actorName} ({log.actorRole})
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="font-semibold text-teal-800 block truncate">
                          {log.action}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-mono">
                          {log.resourceType}
                        </span>
                      </div>
                      <div className="col-span-4 text-slate-600 truncate text-[11px]" title={log.details}>
                        {log.details}
                      </div>
                      <div className="col-span-2 text-right font-mono text-[10px] text-slate-400">
                        {log.ipMasked}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>Encrypted Session Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
