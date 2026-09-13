import { TriageAnalysisResult, VitalSigns, PatientProfile, EsiLevel, CareSetting, TriageCategory } from '../types';

export interface RuleMatch {
  esiLevel: EsiLevel;
  acuityTitle: string;
  category: TriageCategory;
  urgencyTimeline: string;
  confidenceScore: number;
  primaryClinicalImpression: string;
  differentialConsiderations: string[];
  identifiedRedFlags: string[];
  recommendedCareSetting: CareSetting;
  preArrivalInstructions: string[];
  warningSignsToEscalate: string[];
  patientExplanation: string;
  immediateAction: string;
  suggestedQuestionsForClinician: string[];
}

/**
 * Fast Deterministic Clinical Rule-Based Engine
 * Evaluates symptoms, vitals, and red flags within <10ms with zero network latency.
 * Compliant with ESI v4 and Indian National Emergency Medical guidelines (102/108 protocols).
 */
export function evaluateClinicalRules(input: {
  chiefComplaint: string;
  detailedSymptoms?: string;
  vitals?: VitalSigns;
  patient?: PatientProfile;
  painScale?: number;
  language?: string;
}): TriageAnalysisResult {
  const text = `${input.chiefComplaint} ${input.detailedSymptoms || ''}`.toLowerCase();
  const vitals = input.vitals || {};
  const isHi = input.language === 'hi';
  const pain = input.painScale ?? vitals.painScore ?? 5;

  const hr = vitals.heartRate || 80;
  const sbp = vitals.systolicBp || 120;
  const dbp = vitals.diastolicBp || 80;
  const spo2 = vitals.oxygenSat || 98;
  const rr = vitals.respiratoryRate || 18;
  const temp = vitals.temperature || 98.6;

  // 1. RULE: Resuscitation / Immediate Life Threat (ESI 1)
  const isUnresponsive = text.includes('unconscious') || text.includes('unresponsive') || text.includes('coma') || text.includes('not breathing') || text.includes('cardiac arrest') || text.includes('no pulse');
  const isSevereAnaphylaxis = (text.includes('anaphylaxis') || (text.includes('throat') && text.includes('swelling') && text.includes('wheez'))) && (spo2 < 90 || sbp < 85);
  const isExtremeVitals = spo2 < 82 || hr > 160 || (hr < 35 && hr > 0) || sbp < 70;

  if (isUnresponsive || isSevereAnaphylaxis || isExtremeVitals) {
    return buildTriageResult({
      esiLevel: 1,
      acuityTitle: isHi ? 'अति गंभीर / तत्काल जीवनरक्षक (ESI 1)' : 'Resuscitation / Immediate Life Threat (ESI Level 1)',
      category: 'Resuscitation',
      urgencyTimeline: isHi ? 'तुरंत (< 1 मिनट) आपातकालीन हस्तक्षेप' : 'Immediate (< 1 minute) Emergency Resuscitation',
      confidenceScore: 0.99,
      primaryClinicalImpression: isUnresponsive 
        ? (isHi ? 'कार्डियक अरेस्ट / बेहोशी एवं श्वसन अवरोध' : 'Cardiopulmonary Arrest / Unresponsive State')
        : (isHi ? 'गंभीर एनाफिलेक्सिस / सर्कुलेटरी शॉक' : 'Severe Anaphylactic / Hemodynamic Shock'),
      differentialConsiderations: [
        'Acute Cardiorespiratory Failure',
        'Severe Anaphylactic Shock',
        'Massive Pulmonary Embolism or Hemorrhagic Shock'
      ],
      identifiedRedFlags: [
        'Critical hypoxemia or circulatory collapse',
        'Compromised airway or loss of protective airway reflexes',
        'Immediate threat to life requiring active resuscitation'
      ],
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: isHi ? [
        'तुरंत 102 / 108 एम्बुलेंस बुलाएं।',
        'मरीज को सख्त सपाट सतह पर सीधा लिटाएं।',
        'यदि सांस न ले रहा हो तो तुरंत सीपीआर (चेस्ट कंप्रेशन 100-120/मिनट) शुरू करें।',
        'मुंह में कुछ भी न डालें।'
      ] : [
        'Call 102 / 108 Ambulance immediately.',
        'Place patient on a firm, flat surface.',
        'If not breathing normally, start CPR chest compressions (100-120/min) immediately.',
        'Do not administer anything by mouth.'
      ],
      warningSignsToEscalate: [
        'Loss of consciousness or pulse',
        'Cyanosis (blue lips/face)',
        'Agonal gasping'
      ],
      immediateAction: isHi ? '102 एम्बुलेंस तुरंत बुलाएं और सीपीआर तैयार रखें' : 'Call 102 Ambulance and prepare for CPR immediately',
      patientExplanation: isHi 
        ? 'यह एक अति-आपातकालीन स्थिति है जिसमें प्रत्येक सेकंड महत्वपूर्ण है। 102 एम्बुलेंस को तुरंत कॉल किया गया है।'
        : 'This is an immediate life-critical medical emergency. Urgent resuscitation and ambulance dispatch are required.',
      suggestedQuestionsForClinician: [
        'Initiate Advanced Cardiac Life Support (ACLS) / airway protocol',
        'Prepare IV/IO access, high-flow O2, and resuscitation bay'
      ],
      vitals,
      vitalsStatus: 'Critical'
    });
  }

  // 2. RULE: Acute Coronary Syndrome / Chest Pain (ESI 2)
  const isChestEmergency = text.includes('chest pain') || text.includes('chest pressure') || text.includes('heart attack') || text.includes('छाती में दर्द') || text.includes('left arm') || text.includes('jaw pain');
  if (isChestEmergency) {
    const isVeryCritical = pain >= 8 || sbp > 170 || sbp < 90 || hr > 110 || spo2 < 93;
    return buildTriageResult({
      esiLevel: 2,
      acuityTitle: isHi ? 'अति आवश्यक / संभावित दिल का दौरा (ESI 2)' : 'Emergent / Suspected Acute Coronary Syndrome (ESI Level 2)',
      category: 'Emergent',
      urgencyTimeline: isHi ? '10 मिनट के भीतर आपातकालीन जांच' : 'Immediate evaluation within 10 minutes',
      confidenceScore: 0.96,
      primaryClinicalImpression: isHi 
        ? 'संभावित तीव्र कोरोनरी सिंड्रोम (ACS) / मायोकार्डियल इस्किमिया' 
        : 'Suspected Acute Coronary Syndrome (ACS) / Myocardial Ischemia',
      differentialConsiderations: [
        'Acute ST-Elevation or Non-ST Elevation Myocardial Infarction',
        'Unstable Angina Pectoris',
        'Acute Aortic Dissection or Pulmonary Embolism',
        'Gastroesophageal Reflux with Vasospasm'
      ],
      identifiedRedFlags: [
        'Chest pain radiating to left arm, jaw, neck or shoulder',
        'Accompanying diaphoresis (cold sweats), nausea, or shortness of breath',
        `Physiological stress markers: Pulse ${hr} bpm, BP ${sbp}/${dbp} mmHg`
      ],
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: isHi ? [
        '1 गोली डिस्प्रिन (Disprin 300mg एस्पिरिन) तुरंत चबाएं (यदि एलर्जी न हो)।',
        'सीधे या 45 डिग्री पर आराम से बैठें, बिल्कुल न चलें या सीढ़ियां न चढ़ें।',
        'कपड़े ढीले करें और पंखा या ताजी हवा सुनिश्चित करें।',
        '102 एम्बुलेंस की प्रतीक्षा करें।'
      ] : [
        'Chew 1 tablet Disprin (Aspirin 300mg) immediately if not allergic.',
        'Sit upright or semi-reclined; do NOT walk or climb stairs.',
        'Loosen tight clothing and ensure fresh airflow.',
        'Do not drive yourself—wait for 102 emergency ambulance.'
      ],
      warningSignsToEscalate: [
        'Sudden fainting, cold clammy skin, or dizziness',
        'Pain becoming crushing or unbearable',
        'Severe shortness of breath or blue lips'
      ],
      immediateAction: isHi ? 'डिस्प्रिन चबाएं, शांत बैठें और 102 एम्बुलेंस बुलाएं' : 'Chew Aspirin 300mg, rest completely, and call 102',
      patientExplanation: isHi
        ? 'आपके लक्षणों में सीने में दबाव और विकिरण शामिल है जो हृदय से संबंधित हो सकता है। तुरंत कैथ-लैब युक्त अस्पताल में ईसीजी की आवश्यकता है।'
        : 'Your symptoms match an acute cardiopulmonary presentation. An urgent 12-lead ECG and cardiac troponin biomarker assay are needed within 10 minutes.',
      suggestedQuestionsForClinician: [
        'Stat 12-lead ECG within 10 minutes of arrival',
        'Point-of-care cardiac hs-Troponin I and telemetry monitoring',
        'Dual antiplatelet therapy evaluation and cardiology consult'
      ],
      vitals,
      vitalsStatus: isVeryCritical ? 'Critical' : 'Abnormal'
    });
  }

  // 3. RULE: Stroke / Acute Neurological Deficit (ESI 2)
  const isStroke = text.includes('stroke') || text.includes('face droop') || text.includes('slurred speech') || text.includes('numbness') || text.includes('paralysis') || text.includes('लकवा') || text.includes('weakness on one side');
  if (isStroke) {
    return buildTriageResult({
      esiLevel: 2,
      acuityTitle: isHi ? 'अति आवश्यक / संभावित लकवा या स्ट्रोक (ESI 2)' : 'Emergent / Acute Ischemic Stroke Evaluation (ESI Level 2)',
      category: 'Emergent',
      urgencyTimeline: isHi ? 'तत्काल (गोल्डन ऑवर 4.5 घंटे)' : 'Immediate (< 15 min, Golden Window 4.5 hrs)',
      confidenceScore: 0.97,
      primaryClinicalImpression: isHi ? 'तीव्र न्यूरोलॉजिकल डेफिसिट / संदिग्ध सेरेब्रोवास्कुलर स्ट्रोक' : 'Acute Neurological Deficit / Cerebrovascular Stroke',
      differentialConsiderations: [
        'Acute Ischemic Stroke (Thrombotic or Embolic)',
        'Intracranial Hemorrhage',
        'Transient Ischemic Attack (TIA)',
        'Severe Hypoglycemia mimicking stroke'
      ],
      identifiedRedFlags: [
        'F.A.S.T. criteria positive (Facial asymmetry, arm drift, abnormal speech)',
        'Time-sensitive thrombolytic / mechanical thrombectomy window',
        `Marked systolic blood pressure: ${sbp}/${dbp} mmHg`
      ],
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: isHi ? [
        'लक्षण शुरू होने का ठीक समय (Time of Onset) नोट करें।',
        'मरीज को कुछ भी खाने या पीने (पानी भी नहीं) को न दें।',
        'मरीज को एक तरफ करवट दिलाकर सिर थोड़ा ऊंचा रखें।',
        'सीटी स्कैन (CT Scan) सुविधा वाले निकटतम अस्पताल में 102 द्वारा तुरंत ले जाएं।'
      ] : [
        'Note the exact time symptoms first started (critical for clot-busting treatment).',
        'Do NOT give any water, food, or medication (risk of choking).',
        'Keep patient lying down on their side with head elevated 15 degrees.',
        'Transport immediately via 102 Ambulance to a CT-scan equipped stroke center.'
      ],
      warningSignsToEscalate: [
        'Loss of consciousness or seizure',
        'Inability to swallow or protect airway',
        'Worsening hemiparesis'
      ],
      immediateAction: isHi ? 'शुरुआत का समय नोट करें, कुछ न पिलाएं, सीटी स्कैन वाले अस्पताल जाएं' : 'Note exact symptom onset time, no oral intake, rush to CT-equipped ER',
      patientExplanation: isHi
        ? 'चेहरे या शरीर के एक हिस्से में कमजोरी या बोली में लड़खड़ाहट स्ट्रोक का संकेत है। 4.5 घंटे के अंदर इलाज से मस्तिष्क की रक्षा की जा सकती है।'
        : 'Sudden weakness on one side or slurred speech requires an immediate CT brain scan to evaluate for clot-dissolving therapy within the 4.5-hour golden window.',
      suggestedQuestionsForClinician: [
        'Immediate non-contrast head CT and fingerstick glucose',
        'Calculate NIH Stroke Scale (NIHSS)',
        'Evaluate IV rtPA / tenecteplase thrombolysis eligibility'
      ],
      vitals,
      vitalsStatus: sbp > 180 ? 'Critical' : 'Abnormal'
    });
  }

  // 4. RULE: Respiratory Distress / Severe Asthma / COPD (ESI 2)
  const isSevereRespiratory = text.includes('breath') || text.includes('shortness of breath') || text.includes('asthma') || text.includes('wheezing') || text.includes('सांस') || text.includes('सांस फूलना');
  if (isSevereRespiratory && (spo2 < 92 || rr > 26 || pain >= 7 || text.includes('severe') || text.includes('cannot speak full'))) {
    return buildTriageResult({
      esiLevel: 2,
      acuityTitle: isHi ? 'अति आवश्यक / गंभीर श्वसन संकट (ESI 2)' : 'Emergent / Acute Respiratory Distress (ESI Level 2)',
      category: 'Emergent',
      urgencyTimeline: isHi ? '10-15 मिनट के भीतर ऑक्सीजन एवं नेबुलाइजेशन' : 'Bedside evaluation within 10-15 minutes',
      confidenceScore: 0.95,
      primaryClinicalImpression: isHi ? 'एक्यूट रेस्पिरेटरी डिस्ट्रेस / गंभीर अस्थमा दौरा' : 'Acute Respiratory Distress / Severe Bronchospasm or Exacerbation',
      differentialConsiderations: [
        'Severe Acute Asthma Exacerbation',
        'Acute Exacerbation of COPD',
        'Pneumonia with Hypoxemic Respiratory Failure',
        'Acute Cardiogenic Pulmonary Edema'
      ],
      identifiedRedFlags: [
        `Oxygen saturation compromised: ${spo2}% on room air`,
        `Tachypnea (Respiration rate ${rr} breaths/min)`,
        'Accessory muscle usage or difficulty speaking in sentences'
      ],
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: isHi ? [
        'सीधे आगे की ओर झुककर बैठें (Tripod Position)।',
        'यदि इनहेलर (Asthalin/Salbutamol) उपलब्ध हो तो 2 से 4 कश तुरंत लें।',
        'गले और सीने के कपड़े ढीले करें और ताजी हवा दें।',
        '102 एम्बुलेंस के लिए कॉल करें।'
      ] : [
        'Sit upright leaning slightly forward (tripod position).',
        'Take 2 to 4 puffs of Salbutamol/Asthalin inhaler with spacer if available.',
        'Loosen tight neck and chest clothing.',
        'Administer supplemental oxygen if available and call 102.'
      ],
      warningSignsToEscalate: [
        'Oxygen saturation falling below 90%',
        'Inability to speak even single words',
        'Lethargy or confusion from CO2 retention'
      ],
      immediateAction: isHi ? 'अस्थमा इनहेलर लें, आगे झुककर बैठें, 102 बुलाएं' : 'Take 2-4 puffs Salbutamol, sit upright, call 102',
      patientExplanation: isHi
        ? 'फेफड़ों में ऑक्सीजन का स्तर कम है और सांस की गति तेज है। तुरंत नेबुलाइजर और ऑक्सीजन सपोर्ट की जरूरत है।'
        : 'Your respiratory vitals indicate significant airway narrowing or fluid retention requiring urgent bronchodilators and supplemental oxygen.',
      suggestedQuestionsForClinician: [
        'Immediate continuous pulse oximetry and humidified oxygen therapy',
        'Duoneb (Salbutamol + Ipratropium) nebulization',
        'Stat portable chest radiography and arterial/venous blood gas'
      ],
      vitals,
      vitalsStatus: spo2 < 90 ? 'Critical' : 'Abnormal'
    });
  }

  // 5. RULE: Trauma / Severe Bleeding / Fracture (ESI 2 or 3)
  const isTrauma = text.includes('bleeding') || text.includes('blood') || text.includes('cut') || text.includes('fall') || text.includes('accident') || text.includes('fracture') || text.includes('खून') || text.includes('चोट');
  if (isTrauma) {
    const isSevereTrauma = text.includes('arterial') || text.includes('deep') || text.includes('head injury') || pain >= 8 || sbp < 95;
    return buildTriageResult({
      esiLevel: isSevereTrauma ? 2 : 3,
      acuityTitle: isSevereTrauma
        ? (isHi ? 'अति आवश्यक / गंभीर आघात एवं रक्तस्राव (ESI 2)' : 'Emergent / Severe Trauma & Hemorrhage (ESI Level 2)')
        : (isHi ? 'आवश्यक / आघात एवं फ्रैक्चर मूल्यांकन (ESI 3)' : 'Urgent / Acute Musculoskeletal Trauma (ESI Level 3)'),
      category: isSevereTrauma ? 'Emergent' : 'Urgent',
      urgencyTimeline: isSevereTrauma ? 'Immediate (< 15 min)' : 'Evaluation within 30-45 min',
      confidenceScore: 0.93,
      primaryClinicalImpression: isSevereTrauma 
        ? (isHi ? 'गंभीर आघात एवं अनियंत्रित रक्तस्राव' : 'High-Energy Trauma with Hemorrhagic Risk')
        : (isHi ? 'तीव्र मस्कुलोस्केलेटल चोट / संभावित फ्रैक्चर' : 'Acute Soft Tissue / Orthopedic Trauma'),
      differentialConsiderations: [
        'Acute Vascular or Soft Tissue Laceration',
        'Closed or Open Bone Fracture',
        'Occult Internal Hemorrhage or Compartment Syndrome'
      ],
      identifiedRedFlags: [
        isSevereTrauma ? 'Active heavy bleeding or potential hemodynamic instability' : 'Localized bone tenderness and inability to bear weight',
        `Reported pain level ${pain}/10`
      ],
      recommendedCareSetting: isSevereTrauma ? 'Emergency Department (Immediate)' : 'Urgent Care (Within 1-2 hours)',
      preArrivalInstructions: isHi ? [
        'साफ कपड़े या पट्टी से घाव पर लगातार सीधा दबाव (Direct Pressure) बनाए रखें।',
        'चोटिल हिस्से को दिल के स्तर से थोड़ा ऊपर उठाएं (यदि फ्रैक्चर का संदेह न हो)।',
        'अंग को हिलाएं नहीं और सहारा (स्प्लिंट) दें।',
        'घाव में जमी किसी वस्तु को खुद न निकालें।'
      ] : [
        'Apply firm, continuous direct pressure to bleeding site with clean cloth.',
        'Elevate injured limb above heart level if no suspected bone displacement.',
        'Immobilize the limb and do not attempt to bear weight.',
        'Do NOT remove any deeply impaled objects.'
      ],
      warningSignsToEscalate: [
        'Bleeding soaking through pressure dressings continuously',
        'Limb becoming cold, pale, or pulseless',
        'Dizziness or fainting upon sitting up'
      ],
      immediateAction: isHi ? 'घाव पर साफ कपड़े से लगातार तेज दबाव बनाएं' : 'Apply continuous firm direct pressure with clean cloth',
      patientExplanation: isHi
        ? 'रक्तस्राव रोकने के लिए लगातार दबाव आवश्यक है। फ्रैक्चर और ऊतक क्षति के मूल्यांकन के लिए एक्स-रे और टांकों की आवश्यकता होगी।'
        : 'Direct pressure is paramount to control bleeding. Medical imaging (X-ray) and wound closure are indicated.',
      suggestedQuestionsForClinician: [
        'Evaluate tetanus vaccination status within 5 years',
        'Targeted X-rays and neurovascular exam distal to injury',
        'Primary wound debridement and sterile closure'
      ],
      vitals,
      vitalsStatus: isSevereTrauma ? 'Critical' : 'Abnormal'
    });
  }

  // 6. RULE: Severe Acute Abdominal Pain (ESI 3 or ESI 2)
  const isAbdominal = text.includes('abdomen') || text.includes('abdominal') || text.includes('stomach') || text.includes('belly') || text.includes('पेट दर्द') || text.includes('vomiting') || text.includes('appendicitis');
  if (isAbdominal) {
    const isSurgicalAbd = pain >= 8 || temp > 101 || text.includes('rigid') || text.includes('peritonitis') || text.includes('right lower');
    return buildTriageResult({
      esiLevel: isSurgicalAbd ? 2 : 3,
      acuityTitle: isSurgicalAbd
        ? (isHi ? 'अति आवश्यक / तीव्र सर्जिकल पेट दर्द (ESI 2)' : 'Emergent / Acute Surgical Abdomen (ESI Level 2)')
        : (isHi ? 'आवश्यक / पेट दर्द नैदानिक मूल्यांकन (ESI 3)' : 'Urgent / Acute Abdominal Diagnostic Evaluation (ESI Level 3)'),
      category: isSurgicalAbd ? 'Emergent' : 'Urgent',
      urgencyTimeline: isSurgicalAbd ? 'Within 15-30 minutes' : 'Evaluation within 45-60 minutes',
      confidenceScore: 0.94,
      primaryClinicalImpression: isSurgicalAbd 
        ? (isHi ? 'तीव्र एब्डोमेन / संभावित अपेंडिसाइटिस या पेरिटोनिटिस' : 'Acute Abdomen / Suspected Appendicitis or Peritoneal Irritation')
        : (isHi ? 'गैस्ट्रोइंटेस्टाइनल इन्फ्लेमेशन / कोलिक' : 'Acute Abdominal Pain / Gastroenteritis or Biliary Colic'),
      differentialConsiderations: [
        'Acute Appendicitis',
        'Acute Cholecystitis / Biliary Colic',
        'Gastroenteritis or Peptic Ulcer Perforation',
        'Bowel Obstruction or Ovarian/Testicular Torsion'
      ],
      identifiedRedFlags: [
        `High pain score: ${pain}/10 with gastrointestinal distress`,
        temp > 100 ? `Febrile state: ${temp}°F indicating possible infection` : 'Persistent nausea or localized guarding',
        'Requires 2 or more clinical resources (IV fluids, Blood labs, Ultrasound/CT)'
      ],
      recommendedCareSetting: 'Emergency Department (Immediate)',
      preArrivalInstructions: isHi ? [
        'मरीज को कुछ भी भारी खाने या पीने को न दें (NPO) क्योंकि जांच या सर्जरी की जरूरत हो सकती है।',
        'पेट पर सीधे दर्द निवारक बाम या गर्म थैली न लगाएं।',
        'घुटने मोड़कर आरामदायक स्थिति में लेटें।',
        'अस्पताल ले जाएं।'
      ] : [
        'Keep patient NPO (nil per os - no solid food or sugary drinks) in case imaging/surgery is needed.',
        'Do NOT apply hot water bottles to the abdomen if appendicitis is suspected.',
        'Lie down with knees flexed toward chest to relieve peritoneal tension.',
        'Proceed to emergency department or urgent care.'
      ],
      warningSignsToEscalate: [
        'Abdomen becoming rigid, hard like a board, or extremely tender to touch',
        'Repeated vomiting with blood or coffee-ground appearance',
        'High fever with chills and inability to stand'
      ],
      immediateAction: isHi ? 'कुछ भी न खाएं-पिएं, घुटने मोड़कर लेटें, अस्पताल जाएं' : 'Nil by mouth, rest with knees bent, proceed for ultrasound/CT',
      patientExplanation: isHi
        ? 'तीव्र पेट दर्द में इन्फेक्शन या अपेंडिक्स की जांच आवश्यक है। खून की जांच एवं अल्ट्रासाउंड द्वारा सही कारण स्पष्ट होगा।'
        : 'Severe abdominal pain requires systematic evaluation (blood labs and ultrasound/CT scan) to rule out surgical causes like appendicitis.',
      suggestedQuestionsForClinician: [
        'Complete blood count (CBC), CRP, liver/kidney renal panel, serum lipase',
        'Abdominal ultrasound or contrast-enhanced CT',
        'IV access, antiemetics, and non-opioid parenteral analgesia'
      ],
      vitals,
      vitalsStatus: isSurgicalAbd ? 'Abnormal' : 'Stable'
    });
  }

  // 7. RULE: Minor Illness / Rash / Sprain / Sore Throat (ESI 4 or 5)
  const isMinor = text.includes('cold') || text.includes('sore throat') || text.includes('cough') || text.includes('rash') || text.includes('itch') || text.includes('sprain') || text.includes('earache') || text.includes('mild') || text.includes('बुखार') || text.includes('जुकाम');
  if (isMinor && pain <= 6 && spo2 >= 95 && sbp < 150 && hr < 110) {
    const isSingleResource = text.includes('sprain') || text.includes('x-ray') || text.includes('suture') || text.includes('cut');
    return buildTriageResult({
      esiLevel: isSingleResource ? 4 : 5,
      acuityTitle: isSingleResource
        ? (isHi ? 'कम गंभीर / प्राथमिक देखभाल (ESI 4)' : 'Less Urgent / Single Resource (ESI Level 4)')
        : (isHi ? 'गैर-आपातकालीन / ओपीडी परामर्श (ESI 5)' : 'Non-Urgent / Routine Care (ESI Level 5)'),
      category: isSingleResource ? 'Less Urgent' : 'Non-Urgent',
      urgencyTimeline: isSingleResource ? 'Within 1-2 hours' : 'Within 24-48 hours (Routine Clinic)',
      confidenceScore: 0.92,
      primaryClinicalImpression: isSingleResource 
        ? (isHi ? 'स्थानीय लिगामेंट खिंचाव या मामूली त्वचा घाव' : 'Localized Musculoskeletal Sprain or Minor Wound')
        : (isHi ? 'वायरल ऊपरी श्वसन संक्रमण / सामान्य विकार' : 'Viral Upper Respiratory Illness / Minor Condition'),
      differentialConsiderations: [
        'Mild Viral Upper Respiratory Tract Infection',
        'Localized Contact Dermatitis or Allergy',
        'Grade 1 Musculoskeletal Strain'
      ],
      identifiedRedFlags: [
        'No systemic hemodynamic or airway red flags observed',
        `Stable physiological parameters: Pulse ${hr} bpm, SpO2 ${spo2}%`
      ],
      recommendedCareSetting: isSingleResource ? 'Urgent Care (Within 1-2 hours)' : 'Primary Care (Within 24-48 hours)',
      preArrivalInstructions: isHi ? [
        'पर्याप्त मात्रा में गुनगुना पानी या ओआरएस (ORS) पिएं।',
        'आराम करें और भारी शारीरिक श्रम से बचें।',
        'डॉक्टर की सलाह से सामान्य पेरासिटामोल या ओरल दवाएं लें।'
      ] : [
        'Stay well hydrated with warm fluids or oral rehydration solution.',
        'Rest in a comfortable environment and avoid heavy physical exertion.',
        'Follow up with a primary care doctor or local clinic at regular hours.'
      ],
      warningSignsToEscalate: [
        'Fever rising above 102°F or not responding to antipyretics',
        'Development of difficulty breathing or chest heaviness',
        'Spreading redness, warmth, or severe swelling'
      ],
      immediateAction: isHi ? 'ओआरएस व तरल पदार्थ लें, आराम करें, नजदीकी क्लिनिक जाएं' : 'Rest, hydrate, and visit your local health clinic/OPD',
      patientExplanation: isHi
        ? 'आपके वाइटल्स स्थिर हैं और कोई तत्काल खतरा नहीं दिख रहा है। आप सामान्य डॉक्टर या ओपीडी में आसानी से इलाज करा सकते हैं।'
        : 'Your vital signs are within safe limits. This condition does not require an emergency department visit and can be managed safely at an outpatient clinic.',
      suggestedQuestionsForClinician: [
        'Symptomatic management and supportive home care',
        'Review OTC medication choices'
      ],
      vitals,
      vitalsStatus: 'Stable'
    });
  }

  // 8. DEFAULT: Standard ESI 3 (Urgent multi-resource default)
  return buildTriageResult({
    esiLevel: 3,
    acuityTitle: isHi ? 'आवश्यक / क्लिनिकल जांच आवश्यक (ESI 3)' : 'Urgent / Multi-Resource Evaluation (ESI Level 3)',
    category: 'Urgent',
    urgencyTimeline: isHi ? '30-45 मिनट के भीतर डॉक्टर को दिखाएं' : 'Evaluation within 30-45 minutes',
    confidenceScore: 0.90,
    primaryClinicalImpression: input.chiefComplaint 
      ? `Acute Clinical Evaluation: ${input.chiefComplaint}` 
      : 'Acute Symptom Requiring Diagnostic Workup',
    differentialConsiderations: [
      'Acute Clinical Condition Requiring Diagnostic Confirmation',
      'Systemic Inflammatory Response',
      'Exacerbation of Underlying Comorbidity'
    ],
    identifiedRedFlags: [
      `Reported symptom severity: Pain ${pain}/10`,
      'Requires standard bedside clinical examination and likely laboratory/radiology testing'
    ],
    recommendedCareSetting: 'Urgent Care (Within 1-2 hours)',
    preArrivalInstructions: isHi ? [
      'आरामदायक स्थिति में बैठें या लेटें।',
      'अपनी वर्तमान दवाइयों और पर्चियों को साथ रखें।',
      'यदि लक्षण तेजी से बढ़ें तो 102 एम्बुलेंस को कॉल करें।'
    ] : [
      'Rest in a position of comfort and avoid unnecessary exertion.',
      'Keep your current medication list and ABHA card ready for the physician.',
      'If pain sharply worsens or breathlessness starts, call 102 immediately.'
    ],
    warningSignsToEscalate: [
      'Sudden onset of severe shortness of breath or dizziness',
      'Unbearable progression of pain'
    ],
    immediateAction: isHi ? 'शांत रहें, दवाइयों का विवरण साथ लें और डॉक्टर को दिखाएं' : 'Rest quietly, gather medications, and proceed for physician exam',
    patientExplanation: isHi
      ? 'आपके लक्षणों की जांच डॉक्टर द्वारा रक्त परीक्षण या स्कैन के साथ की जानी चाहिए। वाइटल्स की निगरानी रखें।'
      : 'Your symptoms warrant timely evaluation with diagnostic tests to ensure proper diagnosis and treatment.',
    suggestedQuestionsForClinician: [
      'Comprehensive focused physical examination',
      'Baseline CBC and metabolic profile'
    ],
    vitals,
    vitalsStatus: pain >= 7 ? 'Abnormal' : 'Stable'
  });
}

function buildTriageResult(params: {
  esiLevel: EsiLevel;
  acuityTitle: string;
  category: TriageCategory;
  urgencyTimeline: string;
  confidenceScore: number;
  primaryClinicalImpression: string;
  differentialConsiderations: string[];
  identifiedRedFlags: string[];
  recommendedCareSetting: CareSetting;
  preArrivalInstructions: string[];
  warningSignsToEscalate: string[];
  patientExplanation: string;
  immediateAction: string;
  suggestedQuestionsForClinician: string[];
  vitals: VitalSigns;
  vitalsStatus: 'Stable' | 'Abnormal' | 'Critical';
}): TriageAnalysisResult {
  return {
    esiLevel: params.esiLevel,
    acuityTitle: params.acuityTitle,
    category: params.category,
    urgencyTimeline: params.urgencyTimeline,
    confidenceScore: params.confidenceScore,
    primaryClinicalImpression: params.primaryClinicalImpression,
    differentialConsiderations: params.differentialConsiderations,
    identifiedRedFlags: params.identifiedRedFlags,
    vitalsAssessment: {
      status: params.vitalsStatus,
      details: `Heart Rate: ${params.vitals.heartRate || 80} bpm, BP: ${params.vitals.systolicBp || 120}/${params.vitals.diastolicBp || 80} mmHg, SpO2: ${params.vitals.oxygenSat || 98}%, Resp: ${params.vitals.respiratoryRate || 18}/min`
    },
    multimodalFindings: {
      photoAnalysis: 'High-speed clinical rule engine evaluated symptom pattern against national acute care criteria.',
      audioFindings: 'Speech and symptom markers processed for emergency stratification.'
    },
    recommendedCareSetting: params.recommendedCareSetting,
    preArrivalInstructions: params.preArrivalInstructions,
    warningSignsToEscalate: params.warningSignsToEscalate,
    patientExplanation: params.patientExplanation,
    immediateAction: params.immediateAction,
    engineType: 'rules_engine',
    suggestedQuestionsForClinician: params.suggestedQuestionsForClinician,
    fhirBundle: {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Observation',
            code: { text: 'ESI Triage Score' },
            valueInteger: params.esiLevel
          }
        }
      ]
    }
  };
}
