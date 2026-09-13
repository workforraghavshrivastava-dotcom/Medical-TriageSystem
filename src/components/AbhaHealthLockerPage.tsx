import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  User, 
  Heart, 
  AlertTriangle, 
  FileText, 
  Download, 
  CheckCircle2, 
  PhoneCall, 
  ArrowLeft,
  Share2,
  Lock
} from 'lucide-react';
import { PatientProfile, SupportedLanguage } from '../types';

interface AbhaHealthLockerPageProps {
  patient: PatientProfile;
  language: SupportedLanguage;
  onBackToTriage: () => void;
  onOpenFhirModal: () => void;
}

export const AbhaHealthLockerPage: React.FC<AbhaHealthLockerPageProps> = ({
  patient,
  language,
  onBackToTriage,
  onOpenFhirModal
}) => {
  const isHindi = language === 'hi';
  const [showQrZoom, setShowQrZoom] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToTriage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHindi ? 'वापस' : 'Back to Triage'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>ABDM Ayushman Bharat Digital Mission</span>
          </span>
        </div>
      </div>

      {/* DIGITAL ABHA CARD DISPLAY (OFFICIAL AESTHETIC) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-teal-500/30">
        
        {/* Subtle Decorative Tri-Color Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-amber-500" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-emerald-500" />
        </div>

        {/* Card Top Brand */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300 font-black text-xl">
              🇮🇳
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block">
                Government of India • Ministry of Health & Family Welfare
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Ayushman Bharat Health Account (ABHA)
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              Active ABDM ID
            </span>
          </div>
        </div>

        {/* Card Main Body */}
        <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          
          {/* Patient Details */}
          <div className="space-y-4 flex-1 text-center sm:text-left">
            <div>
              <span className="text-xs text-teal-300/80 uppercase font-semibold tracking-wider block">
                {isHindi ? 'कार्डधारक का नाम' : 'Cardholder Name'}
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-0.5">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-xs text-slate-400">
                {patient.age} Yrs • {patient.sex} • Blood Group: <span className="text-rose-400 font-bold">{patient.bloodType}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  14-Digit ABHA Number
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-teal-300 tracking-wider">
                  {patient.abhaId || '91-7823-4412-9012'}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  ABHA Address (@abdm)
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {patient.abhaAddress || 'priya.sharma@abdm'}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code for Rapid Hospital Casualty Check-in */}
          <div className="flex flex-col items-center bg-white p-3 rounded-2xl text-slate-900 shrink-0 shadow-lg">
            <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center p-2">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider mt-2 text-slate-600">
              Emergency Scan
            </span>
          </div>

        </div>

        {/* Card Footer: PM-JAY Cashless Badge */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>PM-JAY Cashless Health Coverage Active (₹5,00,000 / Year)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenFhirModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span>FHIR R4 Records</span>
            </button>
          </div>
        </div>

      </div>

      {/* CRITICAL EMERGENCY MEDICAL SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Critical Allergies Alert */}
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{isHindi ? 'अति महत्वपूर्ण एलर्जी चेतावनी' : 'Critical Medical Allergies'}</span>
          </div>

          <div className="space-y-2 text-xs">
            {patient.allergies.map((a, i) => (
              <div key={i} className="p-3 bg-white rounded-2xl border border-rose-100 flex items-start justify-between gap-2">
                <div>
                  <strong className="text-rose-950 font-bold block">{a.allergen}</strong>
                  <span className="text-slate-500">{a.reaction}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <User className="w-4 h-4 text-teal-600" />
            <span>{isHindi ? 'आपातकालीन परिजन संपर्क' : 'Verified Emergency Contact'}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 font-bold block">{patient.emergencyContact.name}</strong>
              <span className="text-xs text-slate-500">{patient.emergencyContact.relationship}</span>
              <span className="text-xs font-mono text-slate-700 block mt-0.5">{patient.emergencyContact.phone}</span>
            </div>

            <a
              href={`tel:${patient.emergencyContact.phone}`}
              className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              title="Call Contact"
            >
              <PhoneCall className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
