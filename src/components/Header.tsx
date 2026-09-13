import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  PhoneCall, 
  UserCheck, 
  Stethoscope, 
  Globe, 
  RefreshCw,
  Lock,
  Ambulance,
  Building2,
  CreditCard,
  MessageSquare,
  FileText
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../translations';

export type AppPageId = 'home' | 'triage' | 'ambulance' | 'hospitals' | 'abha' | 'clinician' | 'messages' | 'history';

interface HeaderProps {
  currentRole: 'patient' | 'clinician';
  onRoleChange: (role: 'patient' | 'clinician') => void;
  activePage: AppPageId;
  onPageChange: (page: AppPageId) => void;
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
  activePage,
  onPageChange,
  language,
  onLanguageChange,
  onOpenPrivacy,
  onOpenEmergency,
  isSyncing,
  activeCaseCount = 0
}) => {
  const isHindi = language === 'hi';
  const t = translations[language] || translations.en;

  const handleNavClick = (page: AppPageId) => {
    onPageChange(page);
    if (page === 'clinician') {
      onRoleChange('clinician');
    } else {
      onRoleChange('patient');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      
      {/* Top Tri-Color Micro Accent Bar */}
      <div className="h-1 flex w-full">
        <div className="flex-1 bg-amber-500" />
        <div className="flex-1 bg-slate-100" />
        <div className="flex-1 bg-emerald-500" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Tier: Logo, Helpline & Controls */}
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand & Identity */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-teal-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20 shrink-0">
              <Activity className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                  My<span className="text-teal-600">Swaasth</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                  India 102
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium -mt-0.5">
                {isHindi ? 'राष्ट्रीय आपातकालीन स्वास्थ्य एवं 102 एम्बुलेंस' : 'AI Medical Triage & 102 National Care'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Minimalist & Aesthetic) */}
          <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePage === 'home'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>🏠</span>
              <span>{isHindi ? 'होम' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('triage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePage === 'triage'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>🚨</span>
              <span>{isHindi ? 'ट्राइएज' : 'Quick Triage'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('ambulance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePage === 'ambulance'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'hover:text-rose-700 hover:bg-slate-200/50'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>{isHindi ? '102 एम्बुलेंस' : '102 Ambulance'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('hospitals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePage === 'hospitals'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{isHindi ? 'अस्पताल' : 'Casualty ER'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('abha')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activePage === 'abha'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHindi ? 'ABHA कार्ड' : 'ABHA ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('clinician')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer relative ${
                activePage === 'clinician'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHindi ? 'डॉक्टर स्टेशन' : 'Clinician'}</span>
              {activeCaseCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Right Controls: 1-Click Hindi Toggle, 102 Helpline Button */}
          <div className="flex items-center gap-2">
            
            {/* Direct Hindi / English Toggle for rapid switching */}
            <button
              type="button"
              onClick={() => onLanguageChange(isHindi ? 'en' : 'hi')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              title="Toggle English / हिन्दी"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>

            {/* HIPAA / ABDM Security Vault */}
            <button
              id="hipaa-privacy-btn"
              onClick={onOpenPrivacy}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="ABDM & HIPAA Protected"
            >
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden lg:inline">ABDM</span>
            </button>

            {/* 102 Emergency Ambulance Trigger (Indian National Helpline) */}
            <button
              id="emergency-alert-btn"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="tracking-wide">{isHindi ? '102 एम्बुलेंस' : '102 Helpline'}</span>
            </button>

          </div>

        </div>

        {/* Mobile Horizontal Navigation Bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 text-xs font-bold text-slate-600 gap-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'home' ? 'bg-teal-700 text-white' : 'hover:bg-slate-100'
            }`}
          >
            🏠 {isHindi ? 'होम' : 'Home'}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('triage')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'triage' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >
            🚨 {isHindi ? 'ट्राइएज' : 'Triage'}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ambulance')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'ambulance' ? 'bg-rose-600 text-white' : 'hover:bg-slate-100 text-rose-600'
            }`}
          >
            🚑 102 {isHindi ? 'एम्बुलेंस' : 'Ambulance'}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('hospitals')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'hospitals' ? 'bg-teal-700 text-white' : 'hover:bg-slate-100'
            }`}
          >
            🏥 {isHindi ? 'अस्पताल' : 'Casualty'}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('abha')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'abha' ? 'bg-amber-600 text-white' : 'hover:bg-slate-100'
            }`}
          >
            🪪 ABHA
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('clinician')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'clinician' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >
            🩺 {isHindi ? 'डॉक्टर' : 'Doctor'}
          </button>
        </div>

      </div>
    </header>
  );
};
