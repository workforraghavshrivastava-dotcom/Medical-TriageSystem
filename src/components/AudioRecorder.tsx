import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (base64Audio: string, mimeType: string, transcriptSnippet?: string) => void;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscriptionText(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          await processAudio(base64Data, 'audio/webm');
        };
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting audio recorder:', err);
      setErrorMessage(err.message || 'Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (base64Data: string, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64Data, mimeType })
      });

      const data = await response.json();
      const text = data.transcript || data.extractedChiefComplaint || 'Voice input transcribed.';
      setTranscriptionText(text);
      onAudioRecorded(base64Data, mimeType, text);
    } catch (err) {
      console.warn('Transcription service error, using fallback:', err);
      const fallbackText = 'Audio recording captured for clinician review.';
      setTranscriptionText(fallbackText);
      onAudioRecorded(base64Data, mimeType, fallbackText);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-teal-600" />
            Voice Symptom Dictation & Audio Triage
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Describe symptoms naturally. AI will transcribe and extract clinical timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              id="start-record-audio-btn"
              onClick={startRecording}
              disabled={disabled || isTranscribing}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Record Symptoms</span>
            </button>
          ) : (
            <button
              type="button"
              id="stop-record-audio-btn"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs animate-pulse transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop ({formatSeconds(recordingDuration)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Visual Wave State */}
      {isRecording && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-semibold text-rose-800">
              Listening to your description... Speak clearly about pain, onset, and triggers.
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" />
            <span className="w-1 h-6 bg-rose-600 rounded-full animate-bounce [animation-delay:0.1s]" />
          </div>
        </div>
      )}

      {/* Processing Loader */}
      {isTranscribing && (
        <div className="mt-3 p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2 text-xs text-teal-800">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          <span>Transcribing vocal audio & extracting clinical chief complaint...</span>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage} (You can also type your symptoms directly in the text field).</span>
        </div>
      )}

      {/* Transcribed Output */}
      {transcriptionText && (
        <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Transcribed Voice Note
            </span>
            <button
              type="button"
              onClick={() => {
                setTranscriptionText(null);
                startRecording();
              }}
              className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCcw className="w-3 h-3" /> Re-record
            </button>
          </div>
          <p className="text-xs text-slate-800 italic leading-relaxed">
            "{transcriptionText}"
          </p>
        </div>
      )}
    </div>
  );
};
