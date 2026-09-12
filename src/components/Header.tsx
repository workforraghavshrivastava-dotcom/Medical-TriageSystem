import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  PhoneCall, 
  UserCheck, 
  Stethoscope, 
  Globe, 
  RefreshCw,
  Lock
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  currentRole: 'patient' | 'clinician';
  onRoleChange: (role: 'patient' | 'clinician') => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenPrivacy: () => void;
  onOpenEmergency: () => void;
  isSyncing: boolean;
  activeCaseCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  onOpenPrivacy,
  onOpenEmergency,
  isSyncing,
  activeCaseCount = 0
}) => {
  const t = translations[language] || translations.en;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  Aegis<span className="text-teal-600">Triage</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  HIPAA Secured
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 font-medium">
                Clinical AI Multimodal Emergency Severity Triage
              </p>
            </div>
          </div>

          {/* Center Actions: Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold">
            <button
              id="role-patient-btn"
              onClick={() => onRoleChange('patient')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentRole === 'patient'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>{t.patientMode}</span>
            </button>
            <button
              id="role-clinician-btn"
              onClick={() => onRoleChange('clinician')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
                currentRole === 'clinician'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>{t.clinicianMode}</span>
              {activeCaseCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                  {activeCaseCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Controls: Sync, Language, Privacy, Emergency */}
          <div className="flex items-center gap-2">
            {/* Real-time Sync Indicator */}
            <div 
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg"
              title="Real-time device synchronization active"
            >
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
              <span className="font-medium text-[11px]">Sync Active</span>
            </div>

            {/* Language Switcher */}
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                id="language-select"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                aria-label="Select Application Language"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="zh">中文 (简体)</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* HIPAA Compliance & Security Shield */}
            <button
              id="hipaa-privacy-btn"
              onClick={onOpenPrivacy}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-lg transition-colors"
              title="View HIPAA safeguards, audit trails & PHI settings"
            >
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span>HIPAA Vault</span>
            </button>

            {/* 911 Emergency Alert Trigger */}
            <button
              id="emergency-alert-btn"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm shadow-rose-600/30 transition-all"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="tracking-wide">911 Alert</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
