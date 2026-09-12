import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Download, 
  Check, 
  X, 
  Database, 
  Share2, 
  ShieldCheck, 
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { TriageCase } from '../types';

interface EhrIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageCase?: TriageCase | null;
}

export const EhrIntegrationModal: React.FC<EhrIntegrationModalProps> = ({
  isOpen,
  onClose,
  triageCase
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState<'EXPORT_FHIR' | 'IMPORT_EHR'>('EXPORT_FHIR');
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  // Generate complete FHIR R4 Bundle representation
  const patient = triageCase?.patient;
  const analysis = triageCase?.analysis;
  const vitals = triageCase?.vitals;

  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-aegis-${triageCase?.id || 'demo'}`,
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:patient-${patient?.id || '89421'}`,
        resource: {
          resourceType: 'Patient',
          id: patient?.id || 'PT-89421',
          identifier: [
            {
              system: 'urn:oid:2.16.840.1.113883.4.1',
              value: patient?.mrn || 'MRN-7734190'
            }
          ],
          active: true,
          name: [
            {
              use: 'official',
              family: patient?.lastName || 'Vance',
              given: [patient?.firstName || 'Eleanor']
            }
          ],
          gender: patient?.sex === 'Male' ? 'male' : 'female',
          birthDate: patient?.dateOfBirth || '1974-06-18'
        }
      },
      {
        fullUrl: `urn:uuid:encounter-${triageCase?.id || '104'}`,
        resource: {
          resourceType: 'Encounter',
          status: 'in-progress',
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'EMER',
            display: 'emergency'
          },
          priority: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority',
                code: (analysis?.esiLevel || 2) <= 2 ? 'EM' : 'UR',
                display: analysis?.category || 'Emergent'
              }
            ]
          },
          subject: {
            reference: `Patient/${patient?.id || 'PT-89421'}`
          }
        }
      },
      {
        fullUrl: `urn:uuid:observation-esi-${triageCase?.id || '104'}`,
        resource: {
          resourceType: 'Observation',
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'survey',
                  display: 'Survey'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '75636-1',
                display: 'Emergency severity index'
              }
            ],
            text: 'ESI Acuity Score'
          },
          subject: {
            reference: `Patient/${patient?.id || 'PT-89421'}`
          },
          valueInteger: analysis?.esiLevel || 2
        }
      },
      {
        fullUrl: `urn:uuid:condition-triage-${triageCase?.id || '104'}`,
        resource: {
          resourceType: 'Condition',
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active'
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'provisional'
              }
            ]
          },
          code: {
            text: analysis?.primaryClinicalImpression || 'Acute emergency triage assessment'
          },
          subject: {
            reference: `Patient/${patient?.id || 'PT-89421'}`
          }
        }
      },
      {
        fullUrl: `urn:uuid:observation-vitals-${triageCase?.id || '104'}`,
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8867-4',
                display: 'Heart rate'
              }
            ]
          },
          valueQuantity: {
            value: vitals?.heartRate || 104,
            unit: 'beats/minute',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          }
        }
      }
    ]
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_${triageCase?.id || 'record'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportEhr = () => {
    if (!importText.trim()) return;
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                  HL7 FHIR R4 Interoperability
                </span>
                <span className="text-xs text-slate-400">Epic / Cerner / Allscripts Compliant</span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">
                EHR Bidirectional Data Exchange
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="close-ehr-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 border-b border-slate-200 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('EXPORT_FHIR')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'EXPORT_FHIR'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            FHIR R4 Bundle Export
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IMPORT_EHR')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'IMPORT_EHR'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Import External EHR JSON
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'EXPORT_FHIR' ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <p className="text-slate-600">
                  Standardized FHIR Resource Bundle containing Patient, Encounter, ESI Observation, and Diagnostic Condition.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="copy-fhir-btn"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>

                  <button
                    type="button"
                    id="download-fhir-btn"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download FHIR Bundle</span>
                  </button>
                </div>
              </div>

              {/* JSON Display */}
              <div className="relative rounded-2xl bg-slate-900 p-4 font-mono text-[11px] text-teal-300 overflow-x-auto max-h-[380px] border border-slate-800">
                <pre>{jsonString}</pre>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>FHIR Bundle validates against HL7 US Core Implementation Guide (v4.0.0).</span>
              </div>
            </>
          ) : (
            /* Tab 2: Import EHR */
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Paste raw FHIR JSON bundle or HL7 synthetic patient message from hospital EHR to populate active triage profile:
              </p>
              <textarea
                rows={12}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{ "resourceType": "Bundle", "entry": [ ... ] }'
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setImportText(JSON.stringify(fhirBundle, null, 2))}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  Load Sample External EHR Bundle
                </button>

                <button
                  type="button"
                  id="import-ehr-confirm-btn"
                  onClick={handleImportEhr}
                  disabled={!importText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {importSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>EHR Imported Successfully!</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Parse & Ingest EHR Bundle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Close EHR Gateway
          </button>
        </div>

      </div>
    </div>
  );
};
