import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ShieldCheck, 
  Lock, 
  Activity, 
  MessageSquare, 
  User, 
  Stethoscope, 
  Maximize2, 
  Clock, 
  Building2, 
  MapPin, 
  PhoneCall, 
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { PatientProfile, TriageAnalysisResult, SupportedLanguage } from '../types';
import { INDIAN_EMERGENCY_HOSPITALS } from '../mockData';

interface HipaaVideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  currentResult: TriageAnalysisResult | null;
  language: SupportedLanguage;
  targetHospitalName?: string;
  clinicianName?: string;
}

export const HipaaVideoCallModal: React.FC<HipaaVideoCallModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentResult,
  language,
  targetHospitalName,
  clinicianName = 'Dr. Vikramaditya Rathore, MD (Casualty Chief)'
}) => {
  const isHindi = language === 'hi';
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isSecureVerified, setIsSecureVerified] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const hospital = targetHospitalName 
    ? INDIAN_EMERGENCY_HOSPITALS.find(h => h.name.includes(targetHospitalName)) || INDIAN_EMERGENCY_HOSPITALS[0]
    : INDIAN_EMERGENCY_HOSPITALS[0];

  // Initialize camera and connect call
  useEffect(() => {
    if (!isOpen) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      setCallStatus('connecting');
      setCallDuration(0);
      return;
    }

    setCallStatus('connecting');
    setIsSecureVerified(false);

    // Setup local user video
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err: any) {
        console.warn('Camera access in iframe/device notice:', err.message);
        setCameraError(err.message || 'Camera preview restricted in sandboxed view');
      }
    };

    startCamera();

    // Simulated secure handshake (< 2.2 seconds)
    const connectTimer = window.setTimeout(() => {
      setCallStatus('connected');
      setIsSecureVerified(true);
    }, 2200);

    return () => {
      window.clearTimeout(connectTimer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen]);

  // Duration Timer
  useEffect(() => {
    let interval: number | null = null;
    if (callStatus === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsVideoEnabled(prev => !prev);
    } else {
      setIsVideoEnabled(prev => !prev);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsAudioEnabled(prev => !prev);
    } else {
      setIsAudioEnabled(prev => !prev);
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* TOP BAR: HIPAA & ABDM Security & Clinician Info */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
              <Stethoscope className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{clinicianName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  HIPAA & ABDM Compliant
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {hospital.name} • {hospital.address}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callStatus === 'connected' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleEndCall}
              className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all"
            >
              {isHindi ? 'कॉल समाप्त' : 'Leave Call'}
            </button>
          </div>
        </div>

        {/* MAIN VIDEO FEEDS VIEW */}
        <div className="relative flex-1 bg-slate-950 min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          
          {/* Remote Clinician Feed (Simulated high-res clinical consultation feed) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            {callStatus === 'connecting' ? (
              <div className="text-center space-y-4 p-6">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-600/20 text-teal-400 border border-teal-500/40 animate-pulse">
                  <Video className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {isHindi ? 'डॉक्टर से सुरक्षित एन्क्रिप्टेड वीडियो संपर्क जुड़ रहा है...' : 'Connecting to Casualty ER Clinician...'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isHindi ? '256-बिट सुरक्षित पीयर-टू-पीयर टनल • अस्पताल ट्रौमा टीम अलर्ट' : 'Establishing ABDM / HIPAA 256-bit WebRTC tunnel • AIIMS/Casualty Network'}
                  </p>
                </div>
                <div className="flex justify-center gap-1.5 pt-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-200" />
                </div>
              </div>
            ) : callStatus === 'ended' ? (
              <div className="text-center space-y-2 p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">
                  {isHindi ? 'टेली-परामर्श संपन्न हुआ' : 'Clinical Tele-Consultation Ended'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isHindi ? 'ईएचआर रिकॉर्ड और प्रिस्क्रिप्शन आपके आभा लॉकर में सुरक्षित सेव है।' : 'EHR encounter notes and prescriptions have been synchronized to your ABHA health record.'}
                </p>
              </div>
            ) : (
              /* Active Simulated Remote Clinician Video Feed */
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                  {/* Styled clinician simulated room / backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-teal-950/40 to-slate-900 opacity-90" />
                  
                  {/* Remote Doctor Avatar & Badge */}
                  <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-3">
                    <div className="relative w-28 h-28 rounded-full bg-teal-800/80 border-4 border-teal-400/80 flex items-center justify-center text-white shadow-2xl overflow-hidden">
                      <Stethoscope className="w-14 h-14 text-teal-200" />
                      <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    </div>

                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-900/80 text-teal-300 border border-teal-600/50 mb-1">
                        🔴 LIVE HD CLINICAL FEED
                      </span>
                      <h3 className="text-xl font-black text-white">{clinicianName}</h3>
                      <p className="text-xs text-teal-300 font-medium">
                        Senior Trauma Surgeon • On-Call Emergency Room
                      </p>
                    </div>

                    {/* Speech / Live transcript bubble */}
                    <div className="max-w-md p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 shadow-xl text-left">
                      <span className="font-bold text-teal-400 block mb-1">Dr. Vikramaditya:</span>
                      "Hello {patient.firstName}, I see your intake details and ESI score. Please stay calm and comfortably seated. I am reviewing your vital signs right now. Can you tell me if the pain is radiating?"
                    </div>
                  </div>

                  {/* Remote Video Watermark & Telemetry */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Lock className="w-3 h-3" />
                      <span>AES-256 GCM TLS 1.3</span>
                    </div>
                    <span>Latency: 14ms • 1080p 60fps</span>
                    <span>Hospital: {hospital.name.slice(0, 24)}...</span>
                  </div>

                  {/* Active Patient Vitals HUD on Screen */}
                  {currentResult && (
                    <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-xs font-mono space-y-1 text-slate-300 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentResult.esiLevel <= 2 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        ESI Acuity Level {currentResult.esiLevel}
                      </span>
                      <div className="text-[11px] text-slate-400">HR: 88 bpm • SpO2: 96%</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Self User Video Pip (Bottom-Right Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-36 sm:w-48 h-28 sm:h-36 rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden z-20">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500">
                <VideoOff className="w-6 h-6 mb-1 text-slate-600" />
                <span className="text-[10px]">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-medium text-slate-300">
              You ({patient.firstName})
            </div>
          </div>

        </div>

        {/* BOTTOM CONTROLS DOCK */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Audio / Video Toggles */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                isAudioEnabled 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-rose-600 text-white'
              }`}
              title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleVideo}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                isVideoEnabled 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-rose-600 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleEndCall}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-rose-900/30 active:scale-95 transition-all cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>{isHindi ? 'कॉल समाप्त' : 'End Consult'}</span>
            </button>
          </div>

          {/* Quick Helpline Backup within call */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{isHindi ? 'आपातकाल बैकअप:' : 'Hospital Casualty Direct:'}</span>
            <a
              href={`tel:${hospital.emergencyPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-950 text-teal-300 border border-teal-800/80 rounded-xl font-mono font-bold hover:bg-teal-900"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
              <span>{hospital.emergencyPhone}</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
