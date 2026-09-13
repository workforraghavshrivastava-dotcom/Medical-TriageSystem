import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Mic, 
  MicOff, 
  Send, 
  Ambulance, 
  Heart, 
  ShieldAlert, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Camera, 
  FileText, 
  Activity, 
  Sparkles,
  RefreshCw,
  Info,
  Navigation
} from 'lucide-react';
import { 
  TriageAnalysisResult, 
  VitalSigns, 
  SupportedLanguage, 
  PatientProfile, 
  MediaAttachment, 
  LabResultItem 
} from '../types';
import { AudioRecorder } from './AudioRecorder';
import { INDIAN_EMERGENCY_HOSPITALS } from '../mockData';

interface MinimalistEmergencyTriageProps {
  patient: PatientProfile;
  language: SupportedLanguage;
  onAnalyze: (formData: {
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
  }) => Promise<void>;
  isLoading: boolean;
  currentResult: TriageAnalysisResult | null;
  onOpen102Modal: () => void;
  onNavigateToAmbulancePage: () => void;
  onNavigateToHospitalsPage: () => void;
}

// 1-Tap Emergency Symptom Presets tailored for India
interface EmergencyChip {
  id: string;
  icon: string;
  enTitle: string;
  hiTitle: string;
  sub: string;
  vitals: VitalSigns;
  pain: number;
  acuityHint: 'red' | 'yellow' | 'green';
  immediateAdviceEn: string;
  immediateAdviceHi: string;
}

const EMERGENCY_CHIPS: EmergencyChip[] = [
  {
    id: 'chest-pain',
    icon: '🫀',
    enTitle: 'Severe Chest Pain',
    hiTitle: 'छाती में तेज़ दर्द / दौरा',
    sub: 'Radiating to jaw/left arm, sweating, heavy pressure',
    vitals: { heartRate: 108, systolicBp: 158, diastolicBp: 96, oxygenSat: 94, respiratoryRate: 22, temperature: 98.6, painScore: 9 },
    pain: 9,
    acuityHint: 'red',
    immediateAdviceEn: 'Chew 1 tablet Disprin (Aspirin 300mg) immediately. Sit upright, rest completely, and call 102 Ambulance.',
    immediateAdviceHi: 'तुरंत 1 गोली डिस्प्रिन (Disprin 300mg) चबाएं। सीधे बैठें, बिल्कुल न चलें और 102 पर कॉल करें।'
  },
  {
    id: 'breathlessness',
    icon: '🫁',
    enTitle: 'Severe Breathlessness',
    hiTitle: 'सांस लेने में भारी तकलीफ',
    sub: 'Cannot speak full sentences, blue lips, wheezing',
    vitals: { heartRate: 122, systolicBp: 138, diastolicBp: 88, oxygenSat: 88, respiratoryRate: 30, temperature: 99.1, painScore: 7 },
    pain: 7,
    acuityHint: 'red',
    immediateAdviceEn: 'Sit leaning slightly forward. Take 2-4 puffs of Asthalin/Salbutamol inhaler with spacer if available. Call 102.',
    immediateAdviceHi: 'आगे झुककर बैठें। अस्थमा इनहेलर (Asthalin) लें। कपड़े ढीले करें और 102 एम्बुलेंस बुलाएं।'
  },
  {
    id: 'stroke',
    icon: '🧠',
    enTitle: 'Stroke / Face Droop',
    hiTitle: 'लकवा / चेहरे का टेढ़ापन',
    sub: 'F.A.S.T.: Face droop, arm weakness, slurred speech',
    vitals: { heartRate: 88, systolicBp: 184, diastolicBp: 110, oxygenSat: 96, respiratoryRate: 18, temperature: 98.4, painScore: 5 },
    pain: 5,
    acuityHint: 'red',
    immediateAdviceEn: 'Do NOT give any food, water, or medicine. Note exact time symptoms began. Rush to hospital with CT Scan.',
    immediateAdviceHi: 'कुछ भी खाने-पीने को न दें। लक्षण शुरू होने का ठीक समय नोट करें और तुरंत सीटी स्कैन वाले अस्पताल ले जाएं।'
  },
  {
    id: 'trauma-bleeding',
    icon: '🩸',
    enTitle: 'Severe Bleeding / Trauma',
    hiTitle: 'गंभीर चोट / तेज खून बहना',
    sub: 'Road accident, deep cut, arterial bleeding',
    vitals: { heartRate: 115, systolicBp: 100, diastolicBp: 62, oxygenSat: 97, respiratoryRate: 24, temperature: 98.2, painScore: 8 },
    pain: 8,
    acuityHint: 'red',
    immediateAdviceEn: 'Apply firm, continuous direct pressure with a clean cloth. Elevate wound if possible. Do not remove soaked cloth.',
    immediateAdviceHi: 'साफ कपड़े से घाव पर लगातार तेज दबाव बनाएं रखें। मरीज को गर्म रखें और तुरंत अस्पताल ले जाएं।'
  },
  {
    id: 'snakebite',
    icon: '🐍',
    enTitle: 'Snakebite / Poisoning',
    hiTitle: 'सांप का काटना / विषैला डंक',
    sub: 'Fang marks, swelling, vomiting, neurotoxicity',
    vitals: { heartRate: 110, systolicBp: 110, diastolicBp: 70, oxygenSat: 95, respiratoryRate: 20, temperature: 98.6, painScore: 8 },
    pain: 8,
    acuityHint: 'red',
    immediateAdviceEn: 'Keep patient completely still and calm. Immobilize limb below heart level. DO NOT cut, suck, or tie tourniquet.',
    immediateAdviceHi: 'मरीज को बिल्कुल शांत रखें। डंक वाले अंग को न हिलाएं। चीरा न लगाएं, न ही कसकर बांधें। तुरंत एंटी-वेनम अस्पताल जाएं।'
  },
  {
    id: 'pregnancy-emergency',
    icon: '🤰',
    enTitle: 'Labor / Pregnancy Crisis',
    hiTitle: 'प्रसव पीड़ा / गर्भावस्था आपातकाल',
    sub: 'Severe cramps, active bleeding, fluid break, seizures',
    vitals: { heartRate: 98, systolicBp: 140, diastolicBp: 92, oxygenSat: 98, respiratoryRate: 20, temperature: 98.8, painScore: 8 },
    pain: 8,
    acuityHint: 'red',
    immediateAdviceEn: 'Call 102 Janani Shishu Suraksha free ambulance. Keep mother lying on her left side with knees bent.',
    immediateAdviceHi: '102 जननी शिशु सुरक्षा मुफ्त एम्बुलेंस बुलाएं। गर्भवती को बाईं करवट (left side) पर लिटाएं।'
  }
];

export const MinimalistEmergencyTriage: React.FC<MinimalistEmergencyTriageProps> = ({
  patient,
  language,
  onAnalyze,
  isLoading,
  currentResult,
  onOpen102Modal,
  onNavigateToAmbulancePage,
  onNavigateToHospitalsPage
}) => {
  const isHindi = language === 'hi';
  const [complaintText, setComplaintText] = useState('');
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Audio & Photo
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Vitals
  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 82,
    systolicBp: 124,
    diastolicBp: 80,
    oxygenSat: 98,
    respiratoryRate: 18,
    temperature: 98.4,
    painScore: 5
  });

  const handleSelectChip = async (chip: EmergencyChip) => {
    setSelectedChipId(chip.id);
    setComplaintText(isHindi ? chip.hiTitle : chip.enTitle);
    setVitals(chip.vitals);

    // Auto trigger analysis with minimum friction
    await onAnalyze({
      chiefComplaint: chip.enTitle + ': ' + chip.sub,
      detailedSymptoms: chip.sub + '. Immediate pre-hospital assessment initiated in India.',
      painScale: chip.pain,
      vitals: chip.vitals,
      attachments: [],
      labResults: []
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() && !audioBase64) return;

    await onAnalyze({
      chiefComplaint: complaintText.trim() || 'Audio/voice reported emergency',
      detailedSymptoms: complaintText.trim(),
      painScale: vitals.painScore || 5,
      vitals,
      attachments: [],
      labResults: [],
      photoBase64: photoBase64 || undefined,
      photoMimeType: photoBase64 ? 'image/jpeg' : undefined,
      audioBase64: audioBase64 || undefined,
      audioMimeType: audioBase64 ? 'audio/webm' : undefined
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoBase64(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Nearest hospital quick reference
  const nearestHospital = INDIAN_EMERGENCY_HOSPITALS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* 1. HERO 102 INSTANT AMBULANCE SOS BAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-5 sm:p-6 shadow-xl shadow-rose-900/20 border border-rose-500/40">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-rose-700 shadow-lg shrink-0">
              <PhoneCall className="w-8 h-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="bg-white/20 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  {isHindi ? 'भारत आपातकालीन सेवा' : 'India Emergency Ambulance'}
                </span>
                <span className="text-xs text-rose-100 font-semibold">
                  {isHindi ? 'निःशुल्क 24x7 सेवा' : 'Toll-Free 24x7'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {isHindi ? 'आपातकाल? तुरंत 102 पर कॉल करें' : 'Emergency? Call 102 Ambulance'}
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                {isHindi 
                  ? 'सरकारी 102 एम्बुलेंस एवं 108 मेडिकल राहत सेवा तुरंत उपलब्ध' 
                  : 'National Ambulance Service (102) & Emergency Relief (108) ready to dispatch'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
            {/* Direct Dial 102 */}
            <a
              href="tel:102"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-rose-50 active:scale-95 text-rose-700 font-black text-base rounded-2xl shadow-lg shadow-black/10 transition-all cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <span>{isHindi ? '102 डायल करें' : 'Dial 102 Now'}</span>
            </a>

            {/* Launch 102 Live Dispatch Tracker */}
            <button
              type="button"
              onClick={onOpen102Modal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-900/80 hover:bg-rose-900 active:scale-95 text-white font-bold text-sm rounded-2xl border border-rose-400/40 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Ambulance className="w-5 h-5 text-amber-300" />
              <span>{isHindi ? '102 ट्रैक करें' : 'Track 102 GPS'}</span>
            </button>
          </div>

        </div>

        {/* Subtle Decorative Indian Tri-color line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-amber-500" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-emerald-500" />
        </div>
      </div>

      {/* 2. ONE-TAP EMERGENCY SYMPTOM SELECTION (ZERO-FRICTION) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-50 text-teal-700">
                <Zap className="w-4 h-4 text-teal-600" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {isHindi ? '1-क्लिक आपातकालीन लक्षण चुनें' : '1-Tap Emergency Symptom Select'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi 
                ? 'समय न गंवाएं — नीचे दिए गए मुख्य लक्षण पर क्लिक करें और तुरंत सलाह पाएं' 
                : 'No typing needed in crisis — select what you or the patient is experiencing'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isHindi ? 'तत्काल AI विश्लेषण (<2 सेकंड)' : 'Instant Triage (<2 sec)'}</span>
          </div>
        </div>

        {/* Rapid Symptom Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMERGENCY_CHIPS.map((chip) => {
            const isSelected = selectedChipId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleSelectChip(chip)}
                disabled={isLoading}
                className={`group relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/70 shadow-md ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50/80 bg-white'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-100 group-hover:scale-110 transition-transform">
                      {chip.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wide">
                      {chip.acuityHint === 'red' ? (isHindi ? 'प्राथमिकता 1' : 'Priority 1 Red') : 'Urgent'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-700 transition-colors">
                    {isHindi ? chip.hiTitle : chip.enTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {chip.sub}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-600">
                  <span>{isHindi ? 'तुरंत सलाह देखें' : 'Get Immediate Triage'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MINIMALIST 1-SENTENCE & VOICE INPUT (FOR OTHER SYMPTOMS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-50 text-cyan-700">
              <Sparkles className="w-4 h-4 text-cyan-600" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {isHindi ? 'अन्य लक्षण? एक पंक्ति में लिखें या बोलें' : 'Other Symptoms? Type 1 line or Speak'}
            </h3>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvanced ? (isHindi ? 'कम दिखाएं' : 'Hide Details') : (isHindi ? 'फोटो / वाइटल्स जोड़ें' : '+ Add Photo / Vitals')}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder={isHindi ? 'उदा: पेट के निचले हिस्से में असहनीय दर्द और उल्टी...' : 'e.g. Severe lower abdominal pain with vomiting since 2 hours...'}
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
              
              {/* Voice Dictation Button in Input */}
              <button
                type="button"
                onClick={() => setIsListeningMic(!isListeningMic)}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                  isListeningMic 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-teal-600 hover:bg-slate-200/60'
                }`}
                title={isHindi ? 'बोलकर बताएं' : 'Voice Dictation'}
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!complaintText.trim() && !audioBase64)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-300" />
                  <span>{isHindi ? 'विश्लेषण...' : 'Triaging...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isHindi ? 'तुरंत जांचें' : 'Evaluate'}</span>
                </>
              )}
            </button>
          </div>

          {/* Voice Dictation Component Drawer */}
          {isListeningMic && (
            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 animate-in fade-in">
              <AudioRecorder
                language={language}
                onAudioRecorded={(base64, mime) => {
                  setAudioBase64(base64);
                  setIsListeningMic(false);
                }}
              />
            </div>
          )}

          {/* Optional Collapsible: Clinical Photo & Vitals */}
          {showAdvanced && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
              
              {/* Photo upload */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isHindi ? 'घाव / रैश / ईसीजी फोटो (वैकल्पिक)' : 'Clinical Photo / ECG / Rash (Optional)'}</span>
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />

                {photoPreview && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Quick Vitals */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isHindi ? 'वाइटल्स (हार्ट रेट / बीपी)' : 'Vitals (HR / BP)'}</span>
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Pulse (BPM)</label>
                    <input
                      type="number"
                      value={vitals.heartRate || ''}
                      onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      placeholder="e.g. 104"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Blood Pressure</label>
                    <input
                      type="text"
                      value={`${vitals.systolicBp || 120}/${vitals.diastolicBp || 80}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('/');
                        setVitals({
                          ...vitals,
                          systolicBp: Number(parts[0]) || 120,
                          diastolicBp: Number(parts[1]) || 80
                        });
                      }}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      placeholder="120/80"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </form>
      </div>

      {/* 4. INSTANT TRIAGE RESULT DISPLAY (HIGH IMPACT & CLEAR) */}
      {currentResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-900 shadow-xl space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          
          {/* Acuity & Indian Priority Badge Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  currentResult.esiLevel <= 2 
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/20' 
                    : currentResult.esiLevel === 3 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-emerald-600 text-white'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {currentResult.esiLevel <= 2 
                      ? (isHindi ? 'प्राथमिकता 1 (अति गंभीर / तत्काल)' : 'Priority 1 (Red / Immediate)') 
                      : currentResult.esiLevel === 3 
                        ? (isHindi ? 'प्राथमिकता 2 (अति आवश्यक / 30 मिनट)' : 'Priority 2 (Yellow / Urgent)') 
                        : (isHindi ? 'प्राथमिकता 3 (सामान्य OPD)' : 'Priority 3 (Green / Routine)')}
                  </span>
                </span>

                <span className="text-xs font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  ESI {currentResult.esiLevel} • {currentResult.urgencyTimeline || 'Immediate'}
                </span>

                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-teal-600" />
                  {isHindi ? 'त्वरित नैदानिक नियम इंजन (तत्काल)' : 'Fast Clinical Rule Engine (<10ms)'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {currentResult.primaryClinicalImpression}
              </h3>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <a
                href="tel:102"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isHindi ? '102 एम्बुलेंस' : 'Call 102'}</span>
              </a>

              <button
                type="button"
                onClick={onNavigateToHospitalsPage}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
              >
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>{isHindi ? 'नजदीकी अस्पताल' : 'Nearby ER'}</span>
              </button>
            </div>
          </div>

          {/* Immediate Action Banner if available */}
          {currentResult.immediateAction && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-rose-800 tracking-wider block">
                  {isHindi ? 'मुख्य त्वरित निर्देश' : 'Primary Immediate Action'}
                </span>
                <span className="text-sm font-black text-rose-950">
                  {currentResult.immediateAction}
                </span>
              </div>
            </div>
          )}

          {/* DO THIS RIGHT NOW (LIFE-SAVING ACTION) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <span>{isHindi ? 'तुरंत क्या करें (जीवनरक्षक निर्देश):' : 'What To Do Right Now (Immediate Life-Saving Steps):'}</span>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed pl-1">
              {currentResult.preArrivalInstructions?.length > 0 ? (
                currentResult.preArrivalInstructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-black text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{instruction}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 shrink-0">✓</span>
                  <span>{isHindi ? 'मरीज को सीधे लिटाएं, कपड़े ढीले करें और 102 पर तुरंत संपर्क करें।' : 'Keep patient resting quietly, do not exert, and prepare for 102 ambulance arrival.'}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Plain-Language Explanation */}
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <strong className="text-slate-900 block font-bold text-xs uppercase tracking-wide text-slate-500">
              {isHindi ? 'मरीज एवं परिजनों के लिए सरल निष्कर्ष' : 'Clinical Summary for Patient & Family'}
            </strong>
            <p className="text-slate-800 font-medium">{currentResult.patientExplanation}</p>
          </div>

          {/* Red Flags / Warning Signs To Escalate */}
          {currentResult.warningSignsToEscalate && currentResult.warningSignsToEscalate.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHindi ? 'तत्काल सतर्कता के लक्षण (खतरे के संकेत)' : 'Warning Signs Requiring Immediate Escalation'}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentResult.warningSignsToEscalate.map((warning, wIdx) => (
                  <span key={wIdx} className="bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium">
                    ⚠️ {warning}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearest Receiving Hospital Preview Card */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide block">
                  {isHindi ? 'नजदीकी 24/7 ट्रॉमा कैजुअल्टी अस्पताल' : 'Nearest 24/7 Trauma Emergency Centre'}
                </span>
                <strong className="text-slate-900 text-sm block">{nearestHospital.name}</strong>
                <span className="text-slate-500">{nearestHospital.distanceKm} km • ~{nearestHospital.travelTimeMins} mins via Ring Road</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${nearestHospital.emergencyPhone}`}
                className="inline-flex items-center gap-1 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{nearestHospital.emergencyPhone}</span>
              </a>

              <button
                type="button"
                onClick={onNavigateToHospitalsPage}
                className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-teal-300 text-teal-800 font-bold rounded-lg text-xs hover:bg-teal-50"
              >
                <span>{isHindi ? 'सभी देखें' : 'View All 6'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. QUICK ACCESS HELPLINES FOOTER STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        <a
          href="tel:102"
          className="p-3 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 text-center transition-all group"
        >
          <span className="text-lg font-black text-rose-600 block group-hover:scale-105 transition-transform">102</span>
          <span className="text-[11px] font-bold text-slate-700 block">Ambulance (Free)</span>
          <span className="text-[10px] text-slate-400">एम्बुलेंस सेवा</span>
        </a>

        <a
          href="tel:108"
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 text-center transition-all group"
        >
          <span className="text-lg font-black text-teal-600 block group-hover:scale-105 transition-transform">108</span>
          <span className="text-[11px] font-bold text-slate-700 block">Medical Emergency</span>
          <span className="text-[10px] text-slate-400">आपदा एवं राहत</span>
        </a>

        <a
          href="tel:112"
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 text-center transition-all group"
        >
          <span className="text-lg font-black text-blue-600 block group-hover:scale-105 transition-transform">112</span>
          <span className="text-[11px] font-bold text-slate-700 block">All Emergency</span>
          <span className="text-[10px] text-slate-400">एकीकृत आपातकाल</span>
        </a>

        <a
          href="tel:1075"
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 text-center transition-all group"
        >
          <span className="text-lg font-black text-amber-600 block group-hover:scale-105 transition-transform">1075</span>
          <span className="text-[11px] font-bold text-slate-700 block">Health Helpline</span>
          <span className="text-[10px] text-slate-400">स्वास्थ्य मंत्रालय</span>
        </a>
      </div>

    </div>
  );
};
