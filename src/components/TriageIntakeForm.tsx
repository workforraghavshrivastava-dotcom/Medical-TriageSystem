import React, { useState } from 'react';
import { 
  Camera, 
  FileText, 
  UploadCloud, 
  Heart, 
  Thermometer, 
  Wind, 
  Gauge, 
  Sparkles, 
  X, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PatientProfile, VitalSigns, MediaAttachment, LabResultItem, SupportedLanguage } from '../types';
import { AudioRecorder } from './AudioRecorder';
import { translations } from '../translations';

interface TriageIntakeFormProps {
  patient: PatientProfile;
  language: SupportedLanguage;
  onSubmitTriage: (formData: {
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
    medicalRecordText?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const COMMON_SYMPTOM_PRESETS = [
  { label: 'Chest Pressure & Dyspnea', complaint: 'Crushing chest pressure radiating to left arm and neck with cold sweats', pain: 8, vitals: { heartRate: 104, systolicBp: 168, diastolicBp: 98, oxygenSat: 93, respiratoryRate: 22, temperature: 98.6 } },
  { label: 'Severe Abdominal Pain (RLQ)', complaint: 'Sharp pain in right lower quadrant with nausea, migrating from navel', pain: 7, vitals: { heartRate: 88, systolicBp: 122, diastolicBp: 78, oxygenSat: 98, respiratoryRate: 16, temperature: 100.8 } },
  { label: 'Acute Severe Headache ("Worst Ever")', complaint: 'Sudden onset thunderclap occipital headache with photophobia and stiff neck', pain: 9, vitals: { heartRate: 96, systolicBp: 172, diastolicBp: 102, oxygenSat: 99, respiratoryRate: 18, temperature: 99.0 } },
  { label: 'Anaphylaxis / Swelling & Wheezing', complaint: 'Sudden facial swelling, throat tightness, hives, and wheezing after eating shellfish', pain: 8, vitals: { heartRate: 128, systolicBp: 86, diastolicBp: 52, oxygenSat: 91, respiratoryRate: 28, temperature: 98.4 } },
  { label: 'Sprained Ankle & Swelling', complaint: 'Inversion injury to right lateral malleolus playing basketball, cannot bear weight', pain: 4, vitals: { heartRate: 74, systolicBp: 118, diastolicBp: 74, oxygenSat: 99, respiratoryRate: 14, temperature: 98.2 } },
  { label: 'Skin Rash & Localized Erythema', complaint: 'Expanding warm red circular rash on forearm with central clearing, mild itchiness', pain: 2, vitals: { heartRate: 70, systolicBp: 116, diastolicBp: 72, oxygenSat: 99, respiratoryRate: 14, temperature: 98.6 } }
];

export const TriageIntakeForm: React.FC<TriageIntakeFormProps> = ({
  patient,
  language,
  onSubmitTriage,
  isLoading
}) => {
  const t = translations[language] || translations.en;

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [detailedSymptoms, setDetailedSymptoms] = useState('');
  const [painScale, setPainScale] = useState(5);
  
  // Vitals
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [systolicBp, setSystolicBp] = useState<number | ''>('');
  const [diastolicBp, setDiastolicBp] = useState<number | ''>('');
  const [respiratoryRate, setRespiratoryRate] = useState<number | ''>('');
  const [oxygenSat, setOxygenSat] = useState<number | ''>('');
  const [temperature, setTemperature] = useState<number | ''>('');

  // Multimodal states
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');

  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);

  const [extractedLabs, setExtractedLabs] = useState<LabResultItem[]>([]);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [docSummary, setDocSummary] = useState<string | null>(null);

  // Quick Preset Click
  const applyPreset = (preset: typeof COMMON_SYMPTOM_PRESETS[0]) => {
    setChiefComplaint(preset.complaint);
    setDetailedSymptoms(`Onset approximately 1-2 hours ago. Intensity rated ${preset.pain}/10 on numerical rating scale. No previous episode of this severity.`);
    setPainScale(preset.pain);
    setHeartRate(preset.vitals.heartRate);
    setSystolicBp(preset.vitals.systolicBp);
    setDiastolicBp(preset.vitals.diastolicBp);
    setRespiratoryRate(preset.vitals.respiratoryRate);
    setOxygenSat(preset.vitals.oxygenSat);
    setTemperature(preset.vitals.temperature);
  };

  // Photo Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      setPhotoMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Lab Document Handler
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/records/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: file.type,
            fileName: file.name
          })
        });
        const data = await res.json();
        if (data.labResults && Array.isArray(data.labResults)) {
          setExtractedLabs(data.labResults);
          setDocSummary(data.summary || `Parsed ${data.labResults.length} test items from ${file.name}`);
        }
      } catch (err) {
        console.error('Document parse error:', err);
      } finally {
        setIsParsingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Audio Handler
  const handleAudioRecorded = (base64: string, mime: string, transcript?: string) => {
    setAudioBase64(base64);
    setAudioMimeType(mime);
    if (transcript) {
      setAudioTranscript(transcript);
      if (!chiefComplaint) {
        setChiefComplaint(transcript);
      } else {
        setDetailedSymptoms((prev) => `${prev ? prev + '\n\n' : ''}[Voice Note]: ${transcript}`);
      }
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim() && !audioBase64) return;

    const attachments: MediaAttachment[] = [];
    if (photoPreview && photoMimeType) {
      attachments.push({
        id: `att-img-${Date.now()}`,
        type: 'photo',
        name: photoName || 'clinical_photo.jpg',
        dataUrl: photoPreview,
        mimeType: photoMimeType,
        timestamp: new Date().toISOString()
      });
    }
    if (audioBase64 && audioMimeType) {
      attachments.push({
        id: `att-aud-${Date.now()}`,
        type: 'audio',
        name: 'voice_symptom_recording.webm',
        dataUrl: audioBase64,
        mimeType: audioMimeType,
        analysisSnippet: audioTranscript || undefined,
        timestamp: new Date().toISOString()
      });
    }

    const vitalsObj: VitalSigns = {};
    if (heartRate !== '') vitalsObj.heartRate = Number(heartRate);
    if (systolicBp !== '') vitalsObj.systolicBp = Number(systolicBp);
    if (diastolicBp !== '') vitalsObj.diastolicBp = Number(diastolicBp);
    if (respiratoryRate !== '') vitalsObj.respiratoryRate = Number(respiratoryRate);
    if (oxygenSat !== '') vitalsObj.oxygenSat = Number(oxygenSat);
    if (temperature !== '') vitalsObj.temperature = Number(temperature);
    vitalsObj.painScore = painScale;

    await onSubmitTriage({
      chiefComplaint,
      detailedSymptoms,
      painScale,
      vitals: vitalsObj,
      attachments,
      labResults: extractedLabs,
      photoBase64: photoPreview || undefined,
      photoMimeType: photoMimeType || undefined,
      audioBase64: audioBase64 || undefined,
      audioMimeType: audioMimeType || undefined,
      medicalRecordText: docSummary || undefined
    });
  };

  const getPainColor = (val: number) => {
    if (val === 0) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val <= 3) return 'text-teal-600 bg-teal-50 border-teal-200';
    if (val <= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (val <= 8) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Top Banner / Fast Presets */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold">Multimodal AI Symptom Evaluation</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Describe symptoms via text, voice recording, camera photo, or uploaded lab results.
              The triage engine correlates symptoms with your patient history and physiological vitals under ESI-4 clinical protocol.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted PHI Protocol</span>
          </div>
        </div>

        {/* Clinical Scenario Quick Presets */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
            Load Clinical Test Scenarios (One-Click Auto Fill):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SYMPTOM_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                id={`preset-btn-${idx}`}
                onClick={() => applyPreset(preset)}
                className="text-xs bg-slate-800/90 hover:bg-teal-800/70 border border-slate-700 hover:border-teal-400 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg transition-all text-left cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Background Card (Contextual EHR linkage) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Active Patient EHR Context: {patient.firstName} {patient.lastName} ({patient.sex}, {patient.age}y)
            </h3>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {patient.mrn}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Blood: <strong className="text-slate-800">{patient.bloodType}</strong></span>
            <span className="text-slate-500">Weight: <strong className="text-slate-800">{patient.weightKg} kg</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-2">
            <span className="font-bold text-rose-800 block mb-0.5">Known Allergies:</span>
            <span className="text-rose-900 font-medium">
              {patient.allergies.map(a => `${a.allergen} (${a.reaction})`).join(', ')}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <span className="font-bold text-slate-700 block mb-0.5">Chronic Conditions:</span>
            <span className="text-slate-600">{patient.chronicConditions.join(', ')}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <span className="font-bold text-slate-700 block mb-0.5">Active Medications:</span>
            <span className="text-slate-600">{patient.medications.map(m => m.name).join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Primary Chief Complaint & Detailed Symptoms */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <label htmlFor="chief-complaint-input" className="block text-sm font-bold text-slate-800 mb-1">
            {t.chiefComplaintLabel} <span className="text-rose-500">*</span>
          </label>
          <input
            id="chief-complaint-input"
            type="text"
            required
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder={t.chiefComplaintPlaceholder}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label htmlFor="detailed-symptoms-input" className="block text-sm font-bold text-slate-800 mb-1">
            {t.detailedSymptomsLabel}
          </label>
          <textarea
            id="detailed-symptoms-input"
            rows={3}
            value={detailedSymptoms}
            onChange={(e) => setDetailedSymptoms(e.target.value)}
            placeholder={t.detailedSymptomsPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Pain Scale (0-10) with visual feedback */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="pain-scale-slider" className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>Pain Severity Scale</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getPainColor(painScale)}`}>
                Score: {painScale} / 10
              </span>
            </label>
            <span className="text-xs font-semibold text-slate-500">
              {painScale === 0 && '0 - No Pain'}
              {painScale >= 1 && painScale <= 3 && '1-3 - Mild Pain'}
              {painScale >= 4 && painScale <= 6 && '4-6 - Moderate Pain'}
              {painScale >= 7 && painScale <= 8 && '7-8 - Severe Pain'}
              {painScale >= 9 && '9-10 - Unbearable / Worst Possible'}
            </span>
          </div>
          <input
            id="pain-scale-slider"
            type="range"
            min="0"
            max="10"
            step="1"
            value={painScale}
            onChange={(e) => setPainScale(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
            <span>0 (None)</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8 (Severe)</span>
            <span>10 (Worst)</span>
          </div>
        </div>
      </div>

      {/* Multimodal Inputs Section (Photo, Voice, Lab Document) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-600" />
            Multimodal Uploads: Photo, Audio & Lab Records
          </h3>
          <span className="text-xs text-slate-500">Enhance triage accuracy</span>
        </div>

        {/* Audio Recorder Component */}
        <AudioRecorder onAudioRecorded={handleAudioRecorded} />

        {/* Photo and Document Dropzones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Photo Upload */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <Camera className="w-4 h-4 text-teal-600" />
              Clinical Photo (Rash, Wound, Swelling, ECG)
            </span>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload an image for multimodal dermatologic or visual trauma analysis.
            </p>

            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white p-1">
                <img 
                  src={photoPreview} 
                  alt="Clinical evidence preview" 
                  className="w-full h-36 object-cover rounded"
                />
                <button
                  type="button"
                  id="remove-photo-btn"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoMimeType(null);
                    setPhotoName('');
                  }}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full text-xs cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="p-1 text-[11px] text-slate-600 truncate font-mono">
                  {photoName}
                </div>
              </div>
            ) : (
              <label 
                htmlFor="photo-upload-input"
                className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 hover:border-teal-500 rounded-lg bg-white cursor-pointer transition-all"
              >
                <UploadCloud className="w-6 h-6 text-teal-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Choose image file</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, HEIC up to 15MB</span>
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Medical Records / Lab Results Document Upload */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              EHR / Lab Results Document Parser
            </span>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload bloodwork, CMP/CBC, or cardiology reports to extract values.
            </p>

            {extractedLabs.length > 0 ? (
              <div className="bg-white border border-teal-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    {extractedLabs.length} Tests Extracted
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedLabs([]);
                      setDocSummary(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 text-xs pr-1">
                  {extractedLabs.map((lab, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700 truncate max-w-[140px] font-medium">{lab.testName}</span>
                      <span className={`font-mono font-semibold text-[11px] px-1.5 py-0.2 rounded ${
                        lab.status === 'Critical' ? 'bg-rose-100 text-rose-800 font-bold' :
                        lab.status === 'High' ? 'bg-amber-100 text-amber-800' :
                        lab.status === 'Low' ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
                      }`}>
                        {lab.value} {lab.unit} ({lab.status})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <label 
                htmlFor="document-upload-input"
                className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 hover:border-cyan-500 rounded-lg bg-white cursor-pointer transition-all"
              >
                <FileText className="w-6 h-6 text-cyan-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  {isParsingDoc ? 'Parsing lab report with AI...' : 'Upload lab report / PDF'}
                </span>
                <span className="text-[10px] text-slate-400">PDF, image, or clinical scan</span>
                <input
                  id="document-upload-input"
                  type="file"
                  accept=".pdf,image/*,.txt"
                  onChange={handleDocumentUpload}
                  disabled={isParsingDoc}
                  className="hidden"
                />
              </label>
            )}
          </div>

        </div>
      </div>

      {/* Vital Signs (Optional / Smart Watch or Device Synced) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              Vital Signs & Hemodynamics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter available readings or sync from connected health monitor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              // Simulated smart-device bluetooth sync
              setHeartRate(78);
              setSystolicBp(126);
              setDiastolicBp(82);
              setOxygenSat(98);
              setRespiratoryRate(16);
              setTemperature(98.6);
            }}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
          >
            Auto-Sync Smart Device
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Heart Rate */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label htmlFor="heart-rate-input" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" />
              Heart Rate (bpm)
            </label>
            <input
              id="heart-rate-input"
              type="number"
              min="30"
              max="240"
              placeholder="e.g. 76"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Norm: 60-100</span>
          </div>

          {/* Systolic BP */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label htmlFor="systolic-bp-input" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-600" />
              Systolic BP (mmHg)
            </label>
            <input
              id="systolic-bp-input"
              type="number"
              min="50"
              max="260"
              placeholder="e.g. 120"
              value={systolicBp}
              onChange={(e) => setSystolicBp(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Norm: 90-120</span>
          </div>

          {/* Diastolic BP */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label htmlFor="diastolic-bp-input" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-600" />
              Diastolic BP
            </label>
            <input
              id="diastolic-bp-input"
              type="number"
              min="30"
              max="150"
              placeholder="e.g. 80"
              value={diastolicBp}
              onChange={(e) => setDiastolicBp(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Norm: 60-80</span>
          </div>

          {/* SpO2 */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label htmlFor="oxygen-sat-input" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Wind className="w-3 h-3 text-teal-600" />
              Oxygen SpO2 (%)
            </label>
            <input
              id="oxygen-sat-input"
              type="number"
              min="60"
              max="100"
              placeholder="e.g. 98"
              value={oxygenSat}
              onChange={(e) => setOxygenSat(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Norm: 95-100%</span>
          </div>

          {/* Respiratory Rate */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label htmlFor="resp-rate-input" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Wind className="w-3 h-3 text-slate-500" />
              Resp Rate (/min)
            </label>
            <input
              id="resp-rate-input"
              type="number"
              min="8"
              max="50"
              placeholder="e.g. 16"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Norm: 12-20</span>
          </div>

          {/* Temperature */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label htmlFor="temp-input" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-500" />
              Temp (°F)
            </label>
            <input
              id="temp-input"
              type="number"
              step="0.1"
              min="92"
              max="108"
              placeholder="e.g. 98.6"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">Norm: 97.8-99.1</span>
          </div>
        </div>
      </div>

      {/* Action Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>If you are experiencing a life-threatening emergency, call 911 or visit the nearest ER immediately.</span>
        </div>

        <button
          type="submit"
          id="run-triage-assessment-btn"
          disabled={isLoading || (!chiefComplaint.trim() && !audioBase64)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-700/20 active:scale-98 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Clinical Severity...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.runAnalysisBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </form>
  );
};
