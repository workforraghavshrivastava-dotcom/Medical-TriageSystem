import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Ambulance, 
  Building2, 
  CreditCard, 
  Stethoscope, 
  MessageSquare, 
  History, 
  PhoneCall, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  HeartPulse, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  MapPin, 
  FileText, 
  Lock, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  Volume2
} from 'lucide-react';
import { AppPageId } from './Header';
import { SupportedLanguage } from '../types';

interface HomePageHubProps {
  onNavigate: (page: AppPageId) => void;
  onOpenEmergencyModal: () => void;
  onOpenPrivacyModal: () => void;
  language: SupportedLanguage;
  activeCaseCount?: number;
}

type FeatureCategory = 'all' | 'emergency' | 'patient' | 'clinical';

interface FeatureCardData {
  id: AppPageId;
  number: string;
  category: 'emergency' | 'patient' | 'clinical';
  titleEn: string;
  titleHi: string;
  taglineEn: string;
  taglineHi: string;
  descriptionEn: string;
  descriptionHi: string;
  metrics: { label: string; value: string };
  badgeText: string;
  badgeColor: string;
  icon: React.ElementType;
  themeColor: string;
  bgGlow: string;
  highlightsEn: string[];
  highlightsHi: string[];
}

export const HomePageHub: React.FC<HomePageHubProps> = ({
  onNavigate,
  onOpenEmergencyModal,
  onOpenPrivacyModal,
  language,
  activeCaseCount = 1
}) => {
  const isHindi = language === 'hi';
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bpm, setBpm] = useState(72);
  const [isAlertRhythm, setIsAlertRhythm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated ECG Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const height = canvas.height;
    const width = canvas.width;
    const midY = height / 2;

    ctx.strokeStyle = isAlertRhythm ? '#e11d48' : '#0d9488';
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = isAlertRhythm ? 'rgba(225, 29, 72, 0.6)' : 'rgba(13, 148, 136, 0.6)';

    // Pre-clear canvas with subtle dark grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }
      ctx.strokeStyle = isAlertRhythm ? '#f43f5e' : '#14b8a6';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = isAlertRhythm ? 'rgba(244, 63, 94, 0.7)' : 'rgba(20, 184, 166, 0.7)';
    };

    drawGrid();

    let step = 0;
    const animate = () => {
      step++;
      const currentSpeed = isAlertRhythm ? 3.5 : 2.2;
      x = (x + currentSpeed) % width;

      // Wipe slice ahead
      ctx.fillStyle = '#0f172a';
      ctx.shadowBlur = 0;
      ctx.fillRect(x, 0, 16, height);

      // Draw ECG wave point
      let y = midY;
      const cyclePos = (x % (isAlertRhythm ? 75 : 110));

      if (cyclePos > 15 && cyclePos < 25) {
        // P-wave
        y = midY - 6;
      } else if (cyclePos >= 30 && cyclePos < 35) {
        // Q-wave
        y = midY + 4;
      } else if (cyclePos >= 35 && cyclePos < 42) {
        // R-spike
        y = midY - (isAlertRhythm ? 34 : 26);
      } else if (cyclePos >= 42 && cyclePos < 48) {
        // S-drop
        y = midY + 14;
      } else if (cyclePos >= 58 && cyclePos < 72) {
        // T-wave
        y = midY - 9;
      }

      ctx.strokeStyle = isAlertRhythm ? '#f43f5e' : '#14b8a6';
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = isAlertRhythm ? 'rgba(244, 63, 94, 0.8)' : 'rgba(20, 184, 166, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = isAlertRhythm ? '#fda4af' : '#5eead4';
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAlertRhythm]);

  const features: FeatureCardData[] = [
    {
      id: 'triage',
      number: '01',
      category: 'emergency',
      titleEn: 'Instant AI Emergency Triage',
      titleHi: 'त्वरित एआई आपातकालीन ट्राइएज',
      taglineEn: 'Zero-Friction 1-Tap Intake • ESI Acuity 1 to 5',
      taglineHi: '1-टैप आपातकालीन चेक • ESI 1 से 5 स्तर निर्धारण',
      descriptionEn: 'Evaluates acute chest pain, breathlessness, trauma, and stroke with evidence-based ESI v4 scoring, multimodal audio/photo diagnostics, and pre-arrival actions.',
      descriptionHi: 'सीने में दर्द, सांस की तकलीफ, आघात और स्ट्रोक के लक्षणों का तत्काल विश्लेषण कर अस्पताल पूर्व जीवन रक्षक सलाह देता है।',
      metrics: { label: isHindi ? 'औसत ट्राइएज समय' : 'Avg AI Triage', value: '< 2.4s' },
      badgeText: 'Priority Engine',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: Activity,
      themeColor: 'from-rose-500 to-red-600',
      bgGlow: 'hover:shadow-rose-500/10 hover:border-rose-300',
      highlightsEn: ['1-Tap Emergency Symptom Chips', 'Multimodal Voice & Photo Capture', 'Immediate Pre-Arrival First Aid'],
      highlightsHi: ['1-टैप त्वरित लक्षण चयन', 'आवाज व घाव फोटो विश्लेषण', 'तुरंत प्राथमिक उपचार सलाह']
    },
    {
      id: 'ambulance',
      number: '02',
      category: 'emergency',
      titleEn: '102 National Ambulance Dispatch',
      titleHi: '102 राष्ट्रीय एम्बुलेंस ट्रैकिंग',
      taglineEn: 'Real-Time Telemetry • DL-01-EA-4021 ALS Unit',
      taglineHi: 'लाइव जीपीएस ट्रैकिंग • एडवांस्ड लाइफ सपोर्ट यूनिट',
      descriptionEn: 'One-click SOS to dispatch 102 ambulances with GPS coordinate transmission, dynamic arrival countdown, driver telephone link, and 108/112 helplines.',
      descriptionHi: 'जीपीएस लोकेशन के साथ 102 एम्बुलेंस तुरंत कॉल करें, लाइव मैप पर वाहन देखें और चालक व कंट्रोल रूम से सीधे बात करें।',
      metrics: { label: isHindi ? 'अनुमानित आगमन' : 'Estimated ETA', value: '~5 Mins' },
      badgeText: 'National 102 NAS',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      icon: Ambulance,
      themeColor: 'from-red-500 to-rose-700',
      bgGlow: 'hover:shadow-red-500/10 hover:border-red-300',
      highlightsEn: ['Live Paramedic Unit Telemetry', 'Direct 1-Click Dialing (102 / 108 / 112)', 'Emergency Resuscitation Guidance'],
      highlightsHi: ['पैरामेडिक यूनिट लाइव ट्रैकिंग', '1-टैप डायरेक्ट हेल्पलाइन डायल', 'हार्ट अटैक व स्ट्रोक इमरजेंसी गाइड']
    },
    {
      id: 'hospitals',
      number: '03',
      category: 'emergency',
      titleEn: '24/7 Casualty & Trauma Hospital Finder',
      titleHi: '24/7 आपातकालीन ट्रौमा अस्पताल खोज',
      taglineEn: 'AIIMS Apex Trauma • Safdarjung • Live ICU Beds',
      taglineHi: 'एम्स ट्रौमा • सफदरजंग • लाइव आईसीयू बेड स्टेटस',
      descriptionEn: 'Locates accredited 24/7 emergency casualty centers with real-time ICU and emergency bed availability counters, Ayushman PM-JAY verification, and turn-by-turn navigation.',
      descriptionHi: 'निकटतम 24 घंटे खुले आपातकालीन ट्रौमा वार्ड, उपलब्ध आईसीयू बेड और आयुष्मान कार्ड स्वीकार करने वाले अस्पतालों की सूची।',
      metrics: { label: isHindi ? 'निकटतम सुविधा' : 'Nearest Level 1', value: '2.4 km' },
      badgeText: '24/7 Casualty',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: Building2,
      themeColor: 'from-teal-600 to-emerald-600',
      bgGlow: 'hover:shadow-teal-500/10 hover:border-teal-300',
      highlightsEn: ['AIIMS Trauma & Safdarjung Ward', 'Live ICU & Emergency Bed Counters', 'PM-JAY Cashless Admission Filter'],
      highlightsHi: ['एम्स जेपीएन ट्रौमा सेंटर रूटिंग', 'खाली आईसीयू व इमरजेंसी बेड ट्रैकर', 'आयुष्मान कैशलेस अस्पताल फिल्टर']
    },
    {
      id: 'abha',
      number: '04',
      category: 'patient',
      titleEn: 'ABHA Digital Health Locker',
      titleHi: 'ABHA डिजिटल हेल्थ लॉकर व कार्ड',
      taglineEn: 'Ayushman Bharat ID • ₹5,00,000 PM-JAY Cover',
      taglineHi: 'आयुष्मान भारत आईडी • ₹5 लाख कैशलेस सुरक्षा',
      descriptionEn: 'Integrated 14-digit ABHA ID card with ABDM QR scanner, linked digital health records (FHIR compliant), and active PM-JAY ₹5,00,000 cashless family cover verification.',
      descriptionHi: '14 अंकों का डिजिटल आभा कार्ड, क्यूआर कोड, पिछले डिस्चार्ज रिकॉर्ड और ₹5 लाख तक का सरकारी स्वास्थ्य बीमा विवरण।',
      metrics: { label: isHindi ? 'स्वास्थ्य बीमा' : 'PM-JAY Cover', value: '₹5,00,000' },
      badgeText: 'ABDM Verified',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: CreditCard,
      themeColor: 'from-amber-500 to-orange-600',
      bgGlow: 'hover:shadow-amber-500/10 hover:border-amber-300',
      highlightsEn: ['14-Digit ABHA ID & QR Scanner', 'FHIR Diagnostic Data Links', 'ABDM Safe Harbor Compliance'],
      highlightsHi: ['14 अंकों का सुरक्षित आभा नंबर', 'डिजिटल टीकाकरण व लैब रिकॉर्ड', 'सरकारी नेशनल डिजिटल हेल्थ अप्रूव्ड']
    },
    {
      id: 'clinician',
      number: '05',
      category: 'clinical',
      titleEn: 'Clinician Emergency Command Station',
      titleHi: 'डॉक्टर आपातकालीन कमांड सेंटर',
      taglineEn: 'Real-Time ED Queue • Signed Clinical Orders',
      taglineHi: 'इमरजेंसी वार्ड केस क्यू • डॉक्टर अंतिम निर्णय',
      descriptionEn: 'High-density workstation for emergency physicians to monitor triage queues, review AI differential diagnoses, override ESI with audit logging, and sign disposition orders.',
      descriptionHi: 'आपातकालीन डॉक्टरों के लिए रोगी प्राथमिकता कतार, एआई डायग्नोसिस समीक्षा और सीधे भर्ती या डिस्चार्ज आदेश जारी करने का पोर्टल।',
      metrics: { label: isHindi ? 'सक्रिय केस' : 'Active Queue', value: `${activeCaseCount} Urgent` },
      badgeText: 'Physician Workstation',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: Stethoscope,
      themeColor: 'from-slate-800 to-slate-950',
      bgGlow: 'hover:shadow-slate-500/10 hover:border-slate-400',
      highlightsEn: ['Real-Time Acuity Priority Queue', 'ESI Acuity Override & Justification', 'Cryptographic Disposition Sign-off'],
      highlightsHi: ['गंभीरता अनुसार मरीजों की प्राथमिकता', 'डॉक्टर द्वारा ट्राइएज स्तर संशोधन', 'हस्ताक्षरित डिजिटल उपचार निर्देश']
    },
    {
      id: 'messages',
      number: '06',
      category: 'patient',
      titleEn: 'Secure Clinical Tele-Messaging',
      titleHi: 'सुरक्षित डॉक्टर-रोगी संदेश सेवा',
      taglineEn: 'End-to-End Encrypted • Urgent Clinical Alert',
      taglineHi: 'एंड-टू-एंड एन्क्रिप्टेड • आपातकालीन डॉक्टर अलर्ट',
      descriptionEn: 'Direct, HIPAA- and ABDM-compliant encrypted messaging portal between patient and attending emergency physicians with urgent red-flag alert flags and file attachments.',
      descriptionHi: 'अस्पताल के ऑन-ड्यूटी डॉक्टर से सीधे सुरक्षित बातचीत करें, रिपोर्ट व फोटो भेजें और तत्काल चिकित्सीय मार्गदर्शन पाएं।',
      metrics: { label: isHindi ? 'सुरक्षा मानक' : 'Security', value: 'E2E 256-Bit' },
      badgeText: 'Encrypted Portal',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      icon: MessageSquare,
      themeColor: 'from-cyan-600 to-blue-600',
      bgGlow: 'hover:shadow-cyan-500/10 hover:border-cyan-300',
      highlightsEn: ['Direct On-Call Physician Channel', 'Urgent Escalation Flagging', 'Safe Harbor PHI De-identification'],
      highlightsHi: ['ड्यूटी डॉक्टर से त्वरित संपर्क', 'हाई-प्रायोरिटी अर्जेंट फ्लैग', 'मरीज पहचान पूर्णतः सुरक्षित']
    },
    {
      id: 'history',
      number: '07',
      category: 'patient',
      titleEn: 'Medical History & HL7 FHIR Records',
      titleHi: 'चिकित्सा इतिहास व FHIR रिकॉर्ड्स',
      taglineEn: 'Chronological Encounters • FHIR R4 Bundle Export',
      taglineHi: 'पिछले ट्राइएज केस • 1-क्लिक FHIR डेटा एक्सपोर्ट',
      descriptionEn: 'Chronological audit trail of past triage encounters, vitals logs, clinician notes, and 1-click HL7 FHIR R4 Bundle JSON export for hospital EHR integration.',
      descriptionHi: 'पिछली सभी जांचों, वाइटल्स चार्ट और डॉक्टर नोट्स का सुरक्षित इतिहास, जिसे किसी भी बड़े अस्पताल में तुरंत भेजा जा सकता है।',
      metrics: { label: isHindi ? 'फॉर्मेट' : 'Format', value: 'HL7 FHIR R4' },
      badgeText: 'EHR Interop',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: History,
      themeColor: 'from-emerald-600 to-teal-700',
      bgGlow: 'hover:shadow-emerald-500/10 hover:border-emerald-300',
      highlightsEn: ['Complete Historical Case Timeline', 'Differential Diagnoses Archive', '1-Click JSON FHIR Bundle Download'],
      highlightsHi: ['तिथि अनुसार सभी पुरानी जांचें', 'संभावित बीमारियों का पुराना रिकॉर्ड', 'अस्पताल के लिए डायरेक्ट डेटा एक्सपोर्ट']
    }
  ];

  const filteredFeatures = features.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchText = (
      item.titleEn + ' ' + 
      item.titleHi + ' ' + 
      item.descriptionEn + ' ' + 
      item.descriptionHi + ' ' +
      item.taglineEn + ' ' +
      item.taglineHi
    ).toLowerCase();
    return matchesCategory && matchText.includes(query);
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* SECTION 1: HERO & LIVE HEALTH TELEMETRY DECK */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
        
        {/* Subtle Background Glow Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Typography & 1-Click Launchers */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Micro Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                {isHindi ? '102 राष्ट्रीय आपातकालीन एम्बुलेंस' : 'National 102 Emergency Dispatch'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isHindi ? 'ABDM एवं ESI v4 प्रमाणित' : 'ABDM & ESI v4 Validated'}
              </span>
            </div>

            {/* Main Brand Title */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                My<span className="text-teal-400">Swaasth</span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-300 mt-2">
                {isHindi 
                  ? 'आपका संपूर्ण डिजिटल आपातकालीन स्वास्थ्य एवं एम्बुलेंस पोर्टल' 
                  : 'AI Emergency Medical Triage & National Care System'}
              </p>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-2 leading-relaxed">
                {isHindi
                  ? 'तत्काल लक्षण मूल्यांकन, 102 एम्बुलेंस लाइव डिस्पैच, नजदीकी ट्रौमा अस्पताल, और आयुष्मान भारत ABHA डिजिटल रिकॉर्ड्स - एक ही प्लेटफॉर्म पर।'
                  : 'Instant AI symptom acuity triage, live 102 National Ambulance dispatch, nearest 24/7 trauma emergency casualty finder, and verified ABHA digital health records.'}
              </p>
            </div>

            {/* Action Buttons: Instant Emergency & Interactive Tour */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id="hero-launch-triage-btn"
                onClick={() => onNavigate('triage')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-teal-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                <span>{isHindi ? 'त्वरित ट्राइएज शुरू करें' : 'Start Emergency Triage'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="hero-102-sos-btn"
                onClick={onOpenEmergencyModal}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer border border-rose-400/40"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>{isHindi ? '102 एम्बुलेंस SOS' : 'Emergency 102 SOS'}</span>
              </button>
            </div>

            {/* Quick Speed Dial Strip for India */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-bold text-slate-300">{isHindi ? 'आपातकालीन नंबर:' : 'India Helplines:'}</span>
              <a href="tel:102" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-300 border border-rose-900/60 font-mono font-bold transition-colors">
                📞 102 (Ambulance)
              </a>
              <a href="tel:108" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold transition-colors">
                📞 108 (Disaster / ALS)
              </a>
              <a href="tel:112" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold transition-colors">
                📞 112 (National Unified)
              </a>
            </div>

          </div>

          {/* Right Column: Live Animated ECG Monitor & Interactive Telemetry */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 shadow-inner space-y-4">
            
            {/* Monitor Top Status */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isAlertRhythm ? 'bg-rose-500 animate-ping' : 'bg-teal-400 animate-pulse'}`} />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                  {isAlertRhythm ? 'CRITICAL TACHYCARDIA (ALERT)' : 'NORMAL SINUS RHYTHM • LEAD II'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                25mm/s • 10mm/mV
              </span>
            </div>

            {/* The Live Canvas Oscilloscope */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
              <canvas
                ref={canvasRef}
                width={460}
                height={130}
                className="w-full h-[120px] block"
              />
              <div className="absolute top-2 right-2 text-right pointer-events-none">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Real-time Pulse</span>
                <span className={`text-2xl font-black font-mono ${isAlertRhythm ? 'text-rose-400' : 'text-teal-400'}`}>
                  {bpm} <span className="text-xs text-slate-400">BPM</span>
                </span>
              </div>
            </div>

            {/* Quick Vital Parameter Readouts */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SpO2 (Pulse Ox)</span>
                <span className="text-sm font-black text-emerald-400">{isAlertRhythm ? '89%' : '98%'}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">BP (mmHg)</span>
                <span className="text-sm font-black text-slate-200">{isAlertRhythm ? '168/104' : '120/80'}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Status</span>
                <span className={`text-sm font-black ${isAlertRhythm ? 'text-rose-400' : 'text-teal-400'}`}>
                  {isAlertRhythm ? 'ESI Level 1' : 'Stable'}
                </span>
              </div>
            </div>

            {/* Interactive Rhythm Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {isHindi ? 'लाइव वेवफॉर्म सिम्युलेटर:' : 'Interactive Waveform Test:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isAlertRhythm) {
                    setIsAlertRhythm(false);
                    setBpm(72);
                  } else {
                    setIsAlertRhythm(true);
                    setBpm(138);
                  }
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  isAlertRhythm
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700'
                }`}
              >
                {isAlertRhythm ? 'Restore Normal' : 'Simulate Acute Code Red'}
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 2: INTERACTIVE FEATURE DIRECTORY & SEARCH */}
      <section className="space-y-6">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                07 Core Pillars
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isHindi ? 'माय स्वास्थ्य सुविधाएं एवं मॉड्यूल' : 'Explore MySwaasth Modules'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isHindi
                ? 'सिस्टम की सभी 7 मुख्य कार्यप्रणालियों का सीधा नेविगेशन'
                : 'Direct interactive access to all medical, emergency, and clinical subsystems'}
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'सुविधा खोजें...' : 'Search features...'}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {isHindi ? 'सभी (7)' : 'All (7)'}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('emergency')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'emergency' ? 'bg-rose-600 text-white shadow-xs' : 'hover:text-rose-600'
                }`}
              >
                🚨 {isHindi ? 'आपातकाल' : 'Emergency'}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('patient')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'patient' ? 'bg-teal-700 text-white shadow-xs' : 'hover:text-teal-700'
                }`}
              >
                🪪 {isHindi ? 'रोगी सेवाएं' : 'Patient'}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('clinical')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeCategory === 'clinical' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                🩺 {isHindi ? 'डॉक्टर' : 'Clinician'}
              </button>
            </div>

          </div>
        </div>

        {/* Feature Cards Grid (Interactive & Sharp) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-400 p-5 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${item.bgGlow}`}
                >
                  
                  {/* Top Header inside Card */}
                  <div className="space-y-3">
                    
                    {/* Number & Badge Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-400 group-hover:text-slate-700 transition-colors">
                          #{item.number}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                          {item.badgeText}
                        </span>
                      </div>

                      {/* Micro Metric Badge */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block">{item.metrics.label}</span>
                        <span className="text-xs font-black font-mono text-slate-800">{item.metrics.value}</span>
                      </div>
                    </div>

                    {/* Icon & Title Row */}
                    <div className="flex items-start gap-3 pt-1">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${item.themeColor} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                          {isHindi ? item.titleHi : item.titleEn}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                          {isHindi ? item.taglineHi : item.taglineEn}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {isHindi ? item.descriptionHi : item.descriptionEn}
                    </p>

                    {/* Highlight Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {(isHindi ? item.highlightsHi : item.highlightsEn).map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{point}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Card Bottom: Direct Action Link */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 group-hover:text-slate-900 transition-colors">
                      {isHindi ? 'मॉड्यूल खोलें' : 'Launch Module'}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center text-slate-700 transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </section>

      {/* SECTION 3: INTERACTIVE EMERGENCY RESCUE BANNER */}
      <section className="bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-rose-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            {isHindi ? 'तत्काल सहायता मोड' : 'Critical Escalation Subsystem'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isHindi ? 'क्या आप या मरीज गंभीर संकट में हैं?' : 'Experiencing an Immediate Medical Emergency?'}
          </h3>
          <p className="text-xs sm:text-sm text-rose-200 max-w-xl leading-relaxed">
            {isHindi
              ? 'बिना किसी देरी के 102 एम्बुलेंस एक्टिवेट करें, जीपीएस लोकेशन साझा करें और एम्स व सफदरजंग ट्रौमा सेंटर को अलर्ट करें।'
              : 'Dispatch the nearest 102 National Ambulance, lock GPS coordinates, and notify the casualty trauma center at AIIMS.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-600/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Ambulance className="w-5 h-5" />
            <span>{isHindi ? '102 एम्बुलेंस भेजें' : 'Trigger 102 Ambulance'}</span>
          </button>

          <a
            href="tel:102"
            className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>{isHindi ? 'कॉल 102' : 'Call 102 Direct'}</span>
          </a>
        </div>
      </section>

    </div>
  );
};
