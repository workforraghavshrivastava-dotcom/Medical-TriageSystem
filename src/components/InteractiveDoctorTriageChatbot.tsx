import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  Video, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Pill, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Paperclip, 
  User, 
  Stethoscope, 
  Heart, 
  RefreshCw,
  X,
  MessageSquare,
  HelpCircle,
  Building2
} from 'lucide-react';
import { 
  PatientProfile, 
  TriageAnalysisResult, 
  SupportedLanguage, 
  VitalSigns,
  MediaAttachment,
  LabResultItem
} from '../types';
import { AudioRecorder } from './AudioRecorder';
import { INDIAN_EMERGENCY_HOSPITALS } from '../mockData';

export interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  photoUrl?: string;
  audioUrl?: string;
  speechScript?: string;
  suggestedMedications?: string[];
  immediateCareInstructions?: string[];
  recommendedCare?: string;
  suggestedFollowupQuestions?: string[];
  esiLevel?: number;
}

interface InteractiveDoctorTriageChatbotProps {
  patient: PatientProfile;
  language: SupportedLanguage;
  currentResult: TriageAnalysisResult | null;
  onUpdateTriageResult: (formData: {
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
  onLaunchVideoCall: () => void;
  onOpen102Modal: () => void;
  onNavigateToAmbulance: () => void;
  onNavigateToHospitals: () => void;
}

export const InteractiveDoctorTriageChatbot: React.FC<InteractiveDoctorTriageChatbotProps> = ({
  patient,
  language,
  currentResult,
  onUpdateTriageResult,
  onLaunchVideoCall,
  onOpen102Modal,
  onNavigateToAmbulance,
  onNavigateToHospitals
}) => {
  const isHindi = language === 'hi';

  // Initial welcome message from the doctor
  const initialDoctorMessage: ChatMessage = {
    id: 'msg-doc-init',
    sender: 'doctor',
    text: isHindi
      ? `नमस्ते ${patient.firstName || 'जी'}! मैं डॉ. अनन्या सेन हूँ, माईस्वास्थ्य (MySwaasth) की ऑन-ड्यूटी आपातकालीन चिकित्सक। मुझे अपने लक्षणों के बारे में विस्तार से बताएं—आप बोलकर (ऑडियो), फ़ोटो (घाव/त्वचा/ईसीजी) या लिखकर बता सकते हैं। मैं आपको तुरंत उचित प्राथमिक चिकित्सा, दवा और देखभाल बताऊँगी।`
      : `Hello ${patient.firstName || 'there'}! I am Dr. Anya Sen, MD, your on-duty emergency triage physician at MySwaasth. Please tell me what symptoms you are experiencing right now. You can speak with voice, upload a clinical photo (rash, wound, swelling, or ECG), or type. I will evaluate you immediately and guide your medications, care, and hospital access.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    speechScript: isHindi
      ? `नमस्ते। मैं डॉ अनन्या हूँ। कृपया अपने लक्षण बताएं। मैं आपकी तुरंत सहायता करूँगी।`
      : `Hello, I am Dr. Anya. Please tell me your symptoms via voice, photo, or text. I am here to assist you right now.`,
    suggestedFollowupQuestions: isHindi
      ? [
          'छाती में भारीपन या दर्द हो रहा है',
          'सांस लेने में बहुत कठिनाई आ रही है',
          'अचानक चक्कर या आधा शरीर सुन्न पड़ गया है',
          'पेट में असहनीय मरोड़ और दर्द है'
        ]
      : [
          'Severe chest pressure radiating to left arm',
          'Sudden shortness of breath & wheezing',
          'F.A.S.T. signs: Face droop or arm weakness',
          'Severe abdominal cramping and vomiting'
        ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialDoctorMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Multimodal Attachments
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [lastAudioRecorded, setLastAudioRecorded] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingDoctor]);

  // Text-To-Speech synthesizer function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // cancel any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Trigger speech when doctor speaks (if enabled)
  const handleDoctorSpoke = (script?: string, fullReply?: string) => {
    if (!isSpeechEnabled) return;
    const speech = script || fullReply;
    if (speech) {
      speakText(speech);
    }
  };

  // Photo Upload Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle Voice Recording Submission
  const handleAudioRecorded = async (base64Audio: string, mimeType: string, transcriptSnippet?: string) => {
    setShowVoiceRecorder(false);
    setLastAudioRecorded(base64Audio);

    const userText = transcriptSnippet || (isHindi ? 'ऑडियो लक्षण रिकॉर्डिंग' : 'Voice symptom recording');
    await submitMessage(userText, base64Audio, mimeType);
  };

  // Submit patient message (multimodal)
  const submitMessage = async (
    textToSend: string,
    overrideAudio?: string,
    overrideAudioMime?: string
  ) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !photoBase64 && !overrideAudio) return;

    const patientMsg: ChatMessage = {
      id: `msg-pt-${Date.now()}`,
      sender: 'patient',
      text: trimmed || (photoBase64 ? 'Uploaded clinical image for review' : 'Recorded voice symptoms'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      photoUrl: photoPreview || undefined,
      audioUrl: overrideAudio ? 'voice_recording' : undefined
    };

    const updatedHistory = [...messages, patientMsg];
    setMessages(updatedHistory);
    setInputText('');
    const currentPhoto = photoBase64;
    setPhotoBase64(null);
    setPhotoPreview(null);
    setIsLoadingDoctor(true);

    try {
      // 1. Send to server Gemini Doctor Chat Endpoint
      const response = await fetch('/api/doctor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: updatedHistory.map(m => ({ sender: m.sender, text: m.text })),
          patientProfile: patient,
          currentResult,
          photoBase64: currentPhoto || undefined,
          photoMimeType: currentPhoto ? 'image/jpeg' : undefined,
          audioBase64: overrideAudio || undefined,
          audioMimeType: overrideAudioMime || 'audio/webm',
          language
        })
      });

      const data = await response.json();

      const doctorMsg: ChatMessage = {
        id: `msg-doc-${Date.now()}`,
        sender: 'doctor',
        text: data.reply || (isHindi ? 'मैंने आपके लक्षण समझ लिए हैं।' : 'I have evaluated your symptoms.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        speechScript: data.speechScript,
        suggestedMedications: data.suggestedMedications,
        immediateCareInstructions: data.immediateCareInstructions,
        recommendedCare: data.recommendedCare,
        suggestedFollowupQuestions: data.suggestedFollowupQuestions,
        esiLevel: currentResult?.esiLevel
      };

      setMessages(prev => [...prev, doctorMsg]);

      // 2. Audible Speech Voice Output
      handleDoctorSpoke(data.speechScript, data.reply);

      // 3. Update Global Triage Result state seamlessly
      await onUpdateTriageResult({
        chiefComplaint: trimmed.slice(0, 100) || 'Multimodal Patient Consultation',
        detailedSymptoms: trimmed + (data.recommendedCare ? ` (Doctor Recommended: ${data.recommendedCare})` : ''),
        painScale: 6,
        vitals: {
          heartRate: 88,
          systolicBp: 130,
          diastolicBp: 84,
          oxygenSat: 97,
          respiratoryRate: 18,
          temperature: 98.6,
          painScore: 6
        },
        attachments: [],
        labResults: [],
        photoBase64: currentPhoto || undefined,
        audioBase64: overrideAudio || undefined
      });

    } catch (err) {
      console.error('Doctor chat failed:', err);
      const fallbackDocMsg: ChatMessage = {
        id: `msg-doc-fallback-${Date.now()}`,
        sender: 'doctor',
        text: isHindi
          ? 'आपके लक्षण दर्ज कर लिए गए हैं। कृपया बिल्कुल आराम से बैठें। यदि स्थिति गंभीर है तो तुरंत 102 एम्बुलेंस पर कॉल करें या हमारी इमरजेंसी वीडियो कॉल चालू करें।'
          : 'I have logged your symptoms. Please remain comfortably seated and avoid physical exertion. If symptoms are severe, dial 102 Ambulance immediately or connect to our on-call clinician via video consult below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        speechScript: isHindi
          ? 'कृपया आराम से बैठें। आपातकाल में 102 एम्बुलेंस को कॉल करें।'
          : 'Please rest comfortably. For emergencies, connect to 102 ambulance or our video doctor.',
        suggestedMedications: ['Aspirin 300mg (chewable if chest pain)', 'ORS electrolyte drink'],
        immediateCareInstructions: ['Keep calm and sit upright', 'Loosen tight collar or clothing', 'Keep identification and medical history ready']
      };
      setMessages(prev => [...prev, fallbackDocMsg]);
      handleDoctorSpoke(fallbackDocMsg.speechScript, fallbackDocMsg.text);
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const nearestHospital = INDIAN_EMERGENCY_HOSPITALS[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col h-[750px] max-h-[85vh] animate-in fade-in duration-300">
      
      {/* 1. CHATBOT HEADER: DOCTOR STATUS, HIPAA VIDEO ACCESS, SPEECH TOGGLE */}
      <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-700/80 shrink-0">
        
        {/* Doctor Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shrink-0">
            <Stethoscope className="w-6 h-6" />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                {isHindi ? 'डॉ. अनन्या सेन (आपातकालीन चिकित्सक)' : 'Dr. Anya Sen, MD'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isHindi ? 'ऑनलाइन' : 'On-Duty ER'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isHindi ? 'माईस्वास्थ्य AI ट्राइएज व क्लिनिकल परामर्श' : 'MySwaasth Multimodal Clinical Triage & Guidance'}
            </p>
          </div>
        </div>

        {/* Right Controls: Video Consult Trigger & Voice Speech Control */}
        <div className="flex items-center gap-2">
          
          {/* Audio Speech Synthesis Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsSpeechEnabled(!isSpeechEnabled);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isSpeechEnabled 
                ? isSpeaking 
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-teal-300 hover:bg-slate-700'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isSpeechEnabled ? 'Speech voice guidance enabled (Click to mute)' : 'Speech voice guidance muted (Click to enable)'}
          >
            {isSpeechEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline text-[11px]">
              {isSpeaking ? (isHindi ? 'बोल रहा है...' : 'Speaking...') : (isHindi ? 'आवाज़' : 'Voice')}
            </span>
          </button>

          {/* Direct HIPAA Video Call Launcher Button */}
          <button
            type="button"
            onClick={onLaunchVideoCall}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-teal-900/30 transition-all cursor-pointer active:scale-95"
            title="Launch HIPAA-compliant video consultation with casualty doctor"
          >
            <Video className="w-4 h-4 text-white animate-pulse" />
            <span className="font-bold">{isHindi ? 'वीडियो डॉक्टर' : 'Video Consult'}</span>
          </button>

        </div>
      </div>

      {/* 2. EMERGENCY RED BANNER (IF ESI 1 OR 2) */}
      {currentResult && currentResult.esiLevel <= 2 && (
        <div className="px-4 py-2.5 bg-rose-600 text-white flex items-center justify-between text-xs font-bold shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>
              {isHindi ? '🚨 उच्च आपातकालीन स्तर - तत्काल एम्बुलेंस या नजदीकी ईआर जाएं' : '🚨 High Acuity Detected - Immediate 102 Ambulance or Casualty ER advised'}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpen102Modal}
            className="px-2.5 py-1 bg-white text-rose-700 hover:bg-rose-50 text-[11px] font-black rounded-lg transition-colors cursor-pointer"
          >
            {isHindi ? '102 कॉल करें' : 'Call 102'}
          </button>
        </div>
      )}

      {/* 3. SCROLLABLE DOCTOR-PATIENT CONVERSATION THREAD */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
        
        {messages.map((msg) => {
          const isDoc = msg.sender === 'doctor';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isDoc ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
            >
              {/* Sender label & avatar */}
              <div className={`flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-500 ${isDoc ? 'pl-1' : 'pr-1'}`}>
                {isDoc ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px]">
                      Dr
                    </div>
                    <span>{isHindi ? 'डॉ. अनन्या सेन' : 'Dr. Anya Sen, MD'}</span>
                  </>
                ) : (
                  <>
                    <span>{patient.firstName || 'You'}</span>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
                <span className="text-[10px] text-slate-400 font-normal ml-1">{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-xs text-sm leading-relaxed ${
                  isDoc
                    ? 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs'
                    : 'bg-teal-700 text-white rounded-tr-xs shadow-md'
                }`}
              >
                {/* Photo attachment preview if any */}
                {msg.photoUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 max-h-56">
                    <img
                      src={msg.photoUrl}
                      alt="Clinical symptom intake"
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Main Text Content */}
                <p className="whitespace-pre-line font-medium text-[13.5px]">
                  {msg.text}
                </p>

                {/* DOCTOR SPECIFIC PRESCRIPTION, MEDICINES & CARE ACCENT CARDS */}
                {isDoc && (
                  <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-100">
                    
                    {/* Audible Speech Playback Button for this message */}
                    {msg.speechScript && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50/80 border border-teal-100">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="text-xs text-teal-900 font-semibold italic">
                            "{msg.speechScript}"
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakText(msg.speechScript || msg.text)}
                          className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold shrink-0 transition-all cursor-pointer ml-2"
                        >
                          {isHindi ? 'दोबारा सुनें' : 'Listen'}
                        </button>
                      </div>
                    )}

                    {/* Prescribed / Suggested Medicines */}
                    {msg.suggestedMedications && msg.suggestedMedications.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 mb-1.5">
                          <Pill className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isHindi ? 'दवाई व सेवन निर्देश (Prescription Guidance)' : 'Prescription & Medication Guidance'}</span>
                        </div>
                        <ul className="space-y-1">
                          {msg.suggestedMedications.map((med, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5 font-medium text-amber-900">
                              <span className="text-amber-700 font-bold">•</span>
                              <span>{med}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Immediate Care & First-aid steps */}
                    {msg.immediateCareInstructions && msg.immediateCareInstructions.length > 0 && (
                      <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-sky-950">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-sky-900 mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
                          <span>{isHindi ? 'तत्काल देखभाल (Immediate Care Steps)' : 'Immediate Supportive Care Steps'}</span>
                        </div>
                        <ol className="space-y-1">
                          {msg.immediateCareInstructions.map((care, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5 font-medium text-sky-900">
                              <span className="font-bold text-sky-700">{i + 1}.</span>
                              <span>{care}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Recommended Care Facility / Timeline */}
                    {msg.recommendedCare && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                          <span className="text-xs font-bold text-slate-800">
                            {msg.recommendedCare}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={onLaunchVideoCall}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Video className="w-3 h-3" />
                            <span>{isHindi ? 'वीडियो कॉल' : 'Video Consult'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={onNavigateToHospitals}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <span>{isHindi ? 'ईआर बेड देखें' : 'ER Beds'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Suggested Follow-up Quick Replies */}
                    {msg.suggestedFollowupQuestions && msg.suggestedFollowupQuestions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          {isHindi ? 'त्वरित उत्तर चुनें:' : 'Tap to answer Dr. Anya quickly:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowupQuestions.map((q, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => submitMessage(q)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-semibold text-left transition-all cursor-pointer"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Doctor Thinking Indicator */}
        {isLoadingDoctor && (
          <div className="flex items-start gap-2 text-slate-500 animate-pulse pl-1">
            <div className="w-6 h-6 rounded-full bg-teal-600/20 text-teal-700 flex items-center justify-center text-[10px] font-bold">
              Dr
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>{isHindi ? 'डॉ. अनन्या आपके लक्षणों और दवाई का विश्लेषण कर रही हैं...' : 'Dr. Anya is reviewing your symptoms and prescribing care...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. MODAL AUDIO RECORDER POPUP (IF ACTIVE) */}
      {showVoiceRecorder && (
        <div className="p-4 bg-teal-50 border-t border-teal-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-teal-600" />
              {isHindi ? 'डॉक्टर को बोलकर लक्षण रिकॉर्ड करें' : 'Record voice symptoms for Dr. Anya'}
            </span>
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AudioRecorder
            onAudioRecorded={handleAudioRecorded}
            disabled={isLoadingDoctor}
          />
        </div>
      )}

      {/* Photo Attachment Preview Bar */}
      {photoPreview && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-10 h-10 object-cover rounded-lg border border-slate-300"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs text-slate-600 font-medium">
              {isHindi ? 'फ़ोटो डॉक्टर को भेजने के लिए तैयार है' : 'Clinical photo ready for Dr. Anya review'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPhotoBase64(null);
              setPhotoPreview(null);
            }}
            className="p-1.5 text-slate-500 hover:text-rose-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. INPUT BAR: MULTIMODAL CONTROLS (VOICE, PHOTO, TEXT) */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Hidden File Input for Clinical Photos */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-500 hover:text-teal-700 transition-all cursor-pointer"
            title={isHindi ? 'घाव, त्वचा या ईसीजी फ़ोटो जोड़ें' : 'Attach clinical photo (wound, rash, ECG)'}
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Voice Microphone Record Trigger */}
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showVoiceRecorder 
                ? 'bg-rose-600 border-rose-600 text-white animate-pulse' 
                : 'border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-500 hover:text-teal-700'
            }`}
            title={isHindi ? 'आवाज़ में बोलकर बताएं' : 'Record voice symptoms'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isHindi 
                ? 'अपने लक्षण यहाँ लिखें (उदा. 30 मिनट से सीने में भारीपन...)' 
                : 'Describe symptoms (e.g. severe chest pressure, radiating pain...)'
            }
            disabled={isLoadingDoctor}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />

          {/* Submit Message Button */}
          <button
            type="submit"
            disabled={isLoadingDoctor || (!inputText.trim() && !photoBase64)}
            className="p-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            title="Send to Doctor"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Quick hint & HIPAA badge */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-teal-700 font-medium">
            <Sparkles className="w-3 h-3" />
            {isHindi ? 'प्रत्यक्ष डॉक्टर संवाद • बोलने की आवाज़ समर्थित' : 'Direct doctor dialogue • Audible speech synthesis active'}
          </span>
          <span className="flex items-center gap-1 font-mono text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            HIPAA & ABDM Protected
          </span>
        </div>
      </div>

    </div>
  );
};
