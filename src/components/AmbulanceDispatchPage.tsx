import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Ambulance, 
  MapPin, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  User, 
  ArrowLeft,
  Share2,
  HelpCircle
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface AmbulanceDispatchPageProps {
  language: SupportedLanguage;
  patientName?: string;
  onBackToTriage: () => void;
}

export const AmbulanceDispatchPage: React.FC<AmbulanceDispatchPageProps> = ({
  language,
  patientName = 'Priya Sharma',
  onBackToTriage
}) => {
  const isHindi = language === 'hi';
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [status, setStatus] = useState<'Dispatched' | 'En Route' | 'Arriving' | 'At Location'>('En Route');
  const [isCopied, setIsCopied] = useState(false);

  // Countdown timer for realistic ETA
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => {
        if (prev <= 1) {
          setStatus('Arriving');
          return 1;
        }
        return prev - 1;
      });
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const handleShareLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('SOS: 102 Ambulance called for patient at Green Park / Safdarjung, New Delhi. Current coordinates: 28.5672, 77.2100.');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Back button & Title Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToTriage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHindi ? 'वापस ट्राइएज पर जाएं' : 'Back to Triage'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {isHindi ? '102 आपातकालीन लाइव डिस्पैच' : '102 Emergency Dispatch Active'}
          </span>
        </div>
      </div>

      {/* Main Status & Map Tracker Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
              <Ambulance className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest bg-white/20 text-rose-200 px-2 py-0.5 rounded">
                  {status}
                </span>
                <span className="text-xs text-slate-300">ALS Unit DL-01-EA-4021</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                {isHindi ? '102 राष्ट्रीय एम्बुलेंस रास्ते में है' : '102 National Ambulance En Route'}
              </h2>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:px-5 flex items-center gap-3 border border-white/10 text-right">
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                {isHindi ? 'पहुंचने का अनुमानित समय' : 'Estimated Arrival'}
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                ~{etaMinutes} min
              </span>
            </div>
            <Clock className="w-6 h-6 text-amber-400 shrink-0" />
          </div>
        </div>

        {/* Live Map Telemetry Simulation */}
        <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden flex items-center justify-center">
          
          {/* Stylized Grid Lines for GPS Map */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Simulated Road Paths */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-700/60" strokeWidth="6" fill="none">
            <path d="M 50 160 Q 200 80, 400 140 T 800 120" stroke="#334155" strokeWidth="12" />
            <path d="M 50 160 Q 200 80, 400 140 T 800 120" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="8 6" />
          </svg>

          {/* Hospital Destination Marker */}
          <div className="absolute top-12 right-16 sm:right-28 flex flex-col items-center animate-pulse">
            <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-500/40 border-2 border-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="mt-1 px-2.5 py-0.5 rounded-md bg-slate-900/90 text-teal-300 text-[11px] font-bold shadow-md border border-teal-500/40">
              AIIMS Apex Trauma Centre
            </span>
          </div>

          {/* Moving 102 Ambulance Marker */}
          <div className="absolute top-24 left-1/3 sm:left-2/5 flex flex-col items-center">
            <div className="relative p-3 rounded-2xl bg-rose-600 text-white shadow-2xl shadow-rose-600/50 border-2 border-white animate-bounce">
              <Ambulance className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded bg-rose-950 text-white text-[10px] font-black border border-rose-500/50 shadow">
              102 AMBULANCE (~{etaMinutes} min)
            </span>
          </div>

          {/* Patient GPS Pin */}
          <div className="absolute bottom-10 left-12 sm:left-20 flex flex-col items-center">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-lg border-2 border-white">
              <User className="w-5 h-5" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              {patientName} (Your Location)
            </span>
          </div>

          {/* Geolocation Tag Overlay */}
          <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Green Park / Safdarjung, New Delhi (28.5672° N, 77.2100° E)</span>
          </div>
        </div>

        {/* Driver, Paramedic & Vehicle Details */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 bg-slate-50/50 text-xs">
          
          {/* Driver details */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isHindi ? 'एम्बुलेंस चालक एवं पायलट' : 'Assigned Driver & Pilot'}
            </span>
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-slate-900 text-sm block">Rajesh Kumar Sharma</strong>
                <span className="text-slate-500">Badge #DL-EMS-402</span>
              </div>
              <a
                href="tel:+919811200102"
                className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                title="Call Driver"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Medical Equipment Onboard */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isHindi ? 'उपलब्ध चिकित्सा उपकरण' : 'Medical Capabilities Onboard'}
            </span>
            <div className="space-y-1 text-slate-700 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> High-Flow O₂ Oxygen Cylinders
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Automated External Defibrillator (AED)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Spine Board & Fracture Splints
              </span>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isHindi ? 'त्वरित कार्रवाई' : 'Quick Actions'}
            </span>
            
            <a
              href="tel:102"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition-all active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isHindi ? '102 हेल्पलाइन पर बात करें' : 'Call 102 Control Room'}</span>
            </a>

            <button
              type="button"
              onClick={handleShareLocation}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? (isHindi ? 'कॉपी हो गया!' : 'Location Copied!') : (isHindi ? 'परिजनों को लोकेशन भेजें' : 'Share SOS with Family')}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Critical Checklist while waiting for 102 Ambulance */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-3">
        <h3 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <span>
            {isHindi 
              ? 'एम्बुलेंस आने तक परिजनों के लिए महत्वपूर्ण निर्देश (चेकलिस्ट):' 
              : 'Critical Checklist While Awaiting 102 Ambulance:'}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-800">
          <div className="p-3 bg-white rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="text-slate-900 block font-bold">1. Unlock Main Gate & Doors:</strong>
            <p className="text-slate-600">Ensure the building entry and street gate are open so paramedics don't lose time.</p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="text-slate-900 block font-bold">2. Keep Documents Ready:</strong>
            <p className="text-slate-600">Gather Aadhaar Card, ABHA Health ID, and any recent prescription or ECG strips.</p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="text-slate-900 block font-bold">3. No Heavy Food or Water:</strong>
            <p className="text-slate-600">Do not feed the patient anything oral in case emergency anesthesia or surgery is required.</p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-amber-200/60 space-y-1">
            <strong className="text-slate-900 block font-bold">4. Rest Quietly:</strong>
            <p className="text-slate-600">Keep patient seated comfortably or in recovery position. Do not allow them to walk.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
