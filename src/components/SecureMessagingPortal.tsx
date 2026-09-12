import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Message, SupportedLanguage } from '../types';

interface SecureMessagingPortalProps {
  messages: Message[];
  currentRole: 'patient' | 'clinician';
  patientName: string;
  clinicianName: string;
  onSendMessage: (text: string, isUrgent?: boolean, attachment?: { name: string; type: string; url?: string }) => Promise<void>;
  onOpenEmergency: () => void;
  language: SupportedLanguage;
}

const CLINICAL_MACROS_PATIENT = [
  'My symptoms have suddenly worsened.',
  'My pain is now rated 8/10.',
  'I took my prescribed medication as directed.',
  'Can I take acetaminophen or ibuprofen while waiting?'
];

const CLINICAL_MACROS_CLINICIAN = [
  'Please rest in an upright position and avoid physical movement.',
  'Medic Unit 9 is en route with an estimated ETA of 5 minutes.',
  'Please monitor your breathing and keep your phone line open.',
  'An emergency bed has been pre-allocated in Trauma Bay 2.'
];

export const SecureMessagingPortal: React.FC<SecureMessagingPortalProps> = ({
  messages,
  currentRole,
  patientName,
  clinicianName,
  onSendMessage,
  onOpenEmergency,
  language
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(textToSend, isUrgent);
      setIsUrgent(false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const applyMacro = (macro: string) => {
    setInputText(macro);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
      
      {/* Portal Top Bar */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">Secure HIPAA Clinical Messaging</h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                End-to-End Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct communication between {patientName} and {clinicianName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="messaging-911-alert-btn"
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>Escalate 911</span>
          </button>
        </div>
      </div>

      {/* HIPAA Compliance Seal Banner */}
      <div className="bg-slate-100 px-4 py-1.5 text-[11px] text-slate-600 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Protected Health Information (PHI) encrypted with AES-256-GCM. All audit trails logged.</span>
        </div>
        <span className="font-mono text-slate-500">Session ID: ENC-{Date.now().toString().slice(-6)}</span>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = (currentRole === 'patient' && msg.sender === 'patient') || (currentRole === 'clinician' && msg.sender === 'clinician');
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-2xs max-w-lg text-center">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">{msg.text}</span>
                  <span className="text-[10px] text-amber-700 ml-auto font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 px-1">
                {msg.sender === 'clinician' ? (
                  <Stethoscope className="w-3 h-3 text-teal-600" />
                ) : (
                  <User className="w-3 h-3 text-slate-600" />
                )}
                <span className="font-bold text-slate-700">{msg.senderName}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.isUrgent && (
                  <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                    URGENT
                  </span>
                )}
              </div>

              <div
                className={`max-w-md md:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                } ${msg.isUrgent ? 'border-2 border-rose-500' : ''}`}
              >
                <p>{msg.text}</p>
                {msg.attachment && (
                  <div className="mt-2 pt-2 border-t border-white/20 text-[11px] font-semibold flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>Attachment: {msg.attachment.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1">
                <CheckCheck className="w-3 h-3 text-teal-600" />
                <span>Delivered & Logged</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Clinical Macro Shortcuts */}
      <div className="p-2.5 bg-slate-100/90 border-t border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" /> Quick Messages:
          </span>
          {(currentRole === 'patient' ? CLINICAL_MACROS_PATIENT : CLINICAL_MACROS_CLINICIAN).map((macro, idx) => (
            <button
              key={idx}
              type="button"
              id={`macro-btn-${idx}`}
              onClick={() => applyMacro(macro)}
              className="text-[11px] bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              {macro}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="mark-urgent-btn"
            onClick={() => setIsUrgent(!isUrgent)}
            className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              isUrgent 
                ? 'bg-rose-500 text-white border-rose-600' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle urgent clinical priority flag"
          >
            Urgent
          </button>
        </div>

        <input
          id="message-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentRole === 'patient' 
              ? 'Send clinical question or symptom update to attending physician...' 
              : 'Type clinical direction, triage orders, or instructions to patient...'
          }
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400"
        />

        <button
          type="submit"
          id="send-message-btn"
          disabled={!inputText.trim() || isSending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
};
