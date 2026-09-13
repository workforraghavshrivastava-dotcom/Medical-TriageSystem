import { SupportedLanguage } from './types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  patientMode: string;
  clinicianMode: string;
  hipaaBadge: string;
  realtimeSync: string;
  emergency911: string;
  emergency102: string;
  newTriage: string;
  myHistory: string;
  secureMessages: string;
  ehrIntegration: string;
  privacySettings: string;
  auditTrail: string;
  chiefComplaintLabel: string;
  chiefComplaintPlaceholder: string;
  detailedSymptomsLabel: string;
  detailedSymptomsPlaceholder: string;
  vitalSignsLabel: string;
  multimodalUploadLabel: string;
  runAnalysisBtn: string;
  analyzingSymptoms: string;
  esiLevel: string;
  acuityLevel: string;
  redFlags: string[];
  recommendedAction: string;
  disposition: string;
  sendToClinician: string;
  voiceInputTitle: string;
  photoInputTitle: string;
  documentUploadTitle: string;
  callEmergencyNow: string;
  phiProtected: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'MySwaasth AI',
    tagline: 'Clinical Multimodal Emergency Severity Triage System',
    patientMode: 'Patient Portal',
    clinicianMode: 'Clinician Command',
    hipaaBadge: 'HIPAA Compliant & PHI Encrypted',
    realtimeSync: 'Real-Time Sync Active',
    emergency911: 'Emergency Alert (102)',
    emergency102: 'Emergency Ambulance (102)',
    newTriage: 'Symptom Triage Intake',
    myHistory: 'Medical History & Past Visits',
    secureMessages: 'Secure Clinical Messaging',
    ehrIntegration: 'EHR / FHIR Interop',
    privacySettings: 'Privacy & Security',
    auditTrail: 'Compliance Audit Log',
    chiefComplaintLabel: 'Primary Chief Complaint',
    chiefComplaintPlaceholder: 'e.g., Severe chest pressure radiating to left arm, shortness of breath...',
    detailedSymptomsLabel: 'Detailed Symptom Progression & Context',
    detailedSymptomsPlaceholder: 'When did it start? What makes it better or worse? Any nausea, dizziness, or sweating?',
    vitalSignsLabel: 'Vital Signs (Optional or Smart-Device Synced)',
    multimodalUploadLabel: 'Multimodal Clinical Inputs (Photo, Voice, Lab Records)',
    runAnalysisBtn: 'Run AI Multimodal Triage Assessment',
    analyzingSymptoms: 'Analyzing symptoms with clinical AI protocol...',
    esiLevel: 'ESI Acuity Score',
    acuityLevel: 'Acuity Level',
    redFlags: ['Cardiac Red Flag', 'Respiratory Distress', 'Neurological Alert', 'Anaphylaxis Risk'],
    recommendedAction: 'Recommended Clinical Disposition',
    disposition: 'Care Pathway',
    sendToClinician: 'Connect to On-Call Physician',
    voiceInputTitle: 'Audio Voice Symptom Recording',
    photoInputTitle: 'Photo / Clinical Image Upload',
    documentUploadTitle: 'Lab Results / Medical Document Upload',
    callEmergencyNow: 'Call Emergency Services (911)',
    phiProtected: 'All PHI is de-identified and encrypted adhering to HIPAA standards.'
  },
  es: {
    appName: 'MySwaasth IA',
    tagline: 'Sistema Clínico Multimodal de Triaje de Severidad',
    patientMode: 'Portal del Paciente',
    clinicianMode: 'Comando Clínico',
    hipaaBadge: 'Cumple con HIPAA y PHI Cifrado',
    realtimeSync: 'Sincronización en Tiempo Real',
    emergency911: 'Alerta de Emergencia (102)',
    emergency102: 'Ambulancia de Emergencia (102)',
    newTriage: 'Ingreso de Triaje de Síntomas',
    myHistory: 'Historial Médico y Consultas',
    secureMessages: 'Mensajería Clínica Segura',
    ehrIntegration: 'Integración EHR / FHIR',
    privacySettings: 'Privacidad y Seguridad',
    auditTrail: 'Registro de Auditoría HIPAA',
    chiefComplaintLabel: 'Motivo Principal de Consulta',
    chiefComplaintPlaceholder: 'ej., Presión severa en el pecho que irradia al brazo izquierdo...',
    detailedSymptomsLabel: 'Progresión y Contexto de los Síntomas',
    detailedSymptomsPlaceholder: '¿Cuándo comenzó? ¿Qué lo alivia o empeora? ¿Náuseas, mareos?',
    vitalSignsLabel: 'Signos Vitales (Opcional o Sincronizado)',
    multimodalUploadLabel: 'Entradas Multimodales (Foto, Voz, Resultados)',
    runAnalysisBtn: 'Ejecutar Evaluación de Triaje con IA',
    analyzingSymptoms: 'Analizando síntomas según protocolo clínico...',
    esiLevel: 'Nivel de Gravedad ESI',
    acuityLevel: 'Nivel de Severidad',
    redFlags: ['Alerta Cardíaca', 'Dificultad Respiratoria', 'Alerta Neurológica', 'Riesgo Anafiláctico'],
    recommendedAction: 'Disposición Clínica Recomendada',
    disposition: 'Vía de Atención',
    sendToClinician: 'Conectar con Médico de Guardia',
    voiceInputTitle: 'Grabación de Voz de Síntomas',
    photoInputTitle: 'Subir Foto o Imagen Clínica',
    documentUploadTitle: 'Subir Resultados de Laboratorio',
    callEmergencyNow: 'Llamar a Emergencias (911)',
    phiProtected: 'Toda la información médica está cifrada y protegida por HIPAA.'
  },
  zh: {
    appName: 'MySwaasth 智能医疗分诊',
    tagline: '多模态多维度临床急诊分级系统',
    patientMode: '患者端',
    clinicianMode: '医生工作站',
    hipaaBadge: '符合 HIPAA 隐私与加密标准',
    realtimeSync: '实时多端同步已激活',
    emergency911: '紧急救援警报 (102)',
    emergency102: '国家救护车紧急呼叫 (102)',
    newTriage: '智能症状分诊评估',
    myHistory: '既往病史与就诊记录',
    secureMessages: '端到端加密医患交流',
    ehrIntegration: '电子病历 EHR / FHIR 互联',
    privacySettings: '隐私与数据安全',
    auditTrail: '合规审计日志',
    chiefComplaintLabel: '主诉（主要不适症状）',
    chiefComplaintPlaceholder: '例如：突发剧烈胸痛放射至左臂，伴有呼吸急促...',
    detailedSymptomsLabel: '症状进展与伴随情况',
    detailedSymptomsPlaceholder: '何时开始发作？是否有缓解或加重因素？有无恶心、头晕？',
    vitalSignsLabel: '生命体征数据（选填或智能设备同步）',
    multimodalUploadLabel: '多模态医疗输入（影像、语音、化验单）',
    runAnalysisBtn: '启动 AI 多模态临床分诊',
    analyzingSymptoms: 'AI 正在依据急诊分级标准深度推理分析...',
    esiLevel: 'ESI 急诊分级评分',
    acuityLevel: '分诊等级',
    redFlags: ['心脏急症红旗', '呼吸窘迫预警', '神经系统危象', '严重过敏风险'],
    recommendedAction: '建议临床处置方案',
    disposition: '就医通道',
    sendToClinician: '立即转接值班主治医生',
    voiceInputTitle: '语音录音描述病情',
    photoInputTitle: '病灶照片与检查图像上传',
    documentUploadTitle: '化验单及既往病历上传',
    callEmergencyNow: '立即拨打紧急救援电话 (102)',
    phiProtected: '患者所有健康信息均受合规加密与去标识化保护。'
  },
  fr: {
    appName: 'MySwaasth IA',
    tagline: 'Système Clinique Multimodal de Triage Médical d’Urgence',
    patientMode: 'Portail Patient',
    clinicianMode: 'Poste Clinique',
    hipaaBadge: 'Conforme HIPAA & Données Chiffrées',
    realtimeSync: 'Synchronisation en Temps Réel',
    emergency911: 'Alerte Urgence (102)',
    emergency102: 'Ambulance d’Urgence (102)',
    newTriage: 'Évaluation des Symptômes',
    myHistory: 'Historique Médical & Visites',
    secureMessages: 'Messagerie Sécurisée',
    ehrIntegration: 'Intégration DPI / FHIR',
    privacySettings: 'Confidentialité & Sécurité',
    auditTrail: 'Journal d’Audit Réglementaire',
    chiefComplaintLabel: 'Motif Principal de Consultation',
    chiefComplaintPlaceholder: 'ex: Douleur thoracique aiguë irradiant vers le bras gauche...',
    detailedSymptomsLabel: 'Progression et Contexte des Symptômes',
    detailedSymptomsPlaceholder: 'Début, facteurs déclenchants, essoufflement, nausées...',
    vitalSignsLabel: 'Signes Vitaux (Optionnel / Connecté)',
    multimodalUploadLabel: 'Données Multimodales (Photo, Voix, Bilans)',
    runAnalysisBtn: 'Lancer le Triage Médical par IA',
    analyzingSymptoms: 'Analyse clinique en cours selon protocole d’urgence...',
    esiLevel: 'Niveau d’Urgence ESI',
    acuityLevel: 'Niveau d’Acuité',
    redFlags: ['Alerte Cardiaque', 'Détresse Respiratoire', 'Signe Neurologique', 'Risque Choc'],
    recommendedAction: 'Orientation Médicale Recommandée',
    disposition: 'Filière de Soins',
    sendToClinician: 'Contacter le Médecin de Garde',
    voiceInputTitle: 'Enregistrement Vocal des Symptômes',
    photoInputTitle: 'Télécharger Photo / Lésion',
    documentUploadTitle: 'Bilans Biologiques / Documents',
    callEmergencyNow: 'Appeler les Secours Immédiatement (102)',
    phiProtected: 'Données de santé protégées et anonymisées conformément à HIPAA.'
  },
  ar: {
    appName: 'MySwaasth الذكي',
    tagline: 'نظام الفرز الطبي السريري الذكي متعدد الوسائط',
    patientMode: 'بوابة المريض',
    clinicianMode: 'محطة الطبيب',
    hipaaBadge: 'متوافق مع معايير HIPAA وتشفير البيانات',
    realtimeSync: 'المزامنة الفورية نشطة',
    emergency911: 'تنبيه الطوارئ الفوري (102)',
    emergency102: 'إسعاف الطوارئ الوطني (102)',
    newTriage: 'بدء فرز الأعراض',
    myHistory: 'السجل الطبي والزيارات السابقة',
    secureMessages: 'المراسلة الآمنة المشفرة',
    ehrIntegration: 'ربط السجلات الطبية FHIR',
    privacySettings: 'الخصوصية والأمان',
    auditTrail: 'سجل التدقيق الأمني',
    chiefComplaintLabel: 'الشكوى الطبية الرئيسية',
    chiefComplaintPlaceholder: 'مثال: ألم شديد في الصدر يمتد للذراع اليسرى مع ضيق في التنفس...',
    detailedSymptomsLabel: 'تفاصيل تطور الأعراض والسياق',
    detailedSymptomsPlaceholder: 'متى بدأ الألم؟ هل يزداد مع الحركة؟ هل يوجد غثيان أو تعرق؟',
    vitalSignsLabel: 'العلامات الحيوية (اختياري)',
    multimodalUploadLabel: 'المدخلات متعددة الوسائط (صور، صوت، تحاليل)',
    runAnalysisBtn: 'بدء الفرز الطبي بالذكاء الاصطناعي',
    analyzingSymptoms: 'جاري تقييم الحالة وفق بروتوكول الطوارئ السريري...',
    esiLevel: 'مستوى خطورة الحالة (ESI)',
    acuityLevel: 'مستوى الخطورة',
    redFlags: ['علامات خطر قلبية', 'ضيق تنفس حاد', 'أعراض عصبية طارئة', 'تحسس حاد'],
    recommendedAction: 'المسار العلاجي الموصى به',
    disposition: 'مسار الرعاية',
    sendToClinician: 'تحويل إلى الطبيب المناوب',
    voiceInputTitle: 'تسجيل صوتي لوصف الأعراض',
    photoInputTitle: 'رفع صورة العرض أو الجرح',
    documentUploadTitle: 'رفع نتائج التحاليل والتقارير',
    callEmergencyNow: 'الاتصال بالطوارئ فوراً (102)',
    phiProtected: 'جميع البيانات الصحية مشفرة ومحمية وفق معايير الخصوصية الطبية.'
  },
  hi: {
    appName: 'MySwaasth (माय स्वास्थ्य)',
    tagline: 'मल्टीमॉडल एआई क्लिनिकल इमरजेंसी ट्राइएज सिस्टम',
    patientMode: 'रोगी पोर्टल',
    clinicianMode: 'डॉक्टर कमांड सेंटर',
    hipaaBadge: 'HIPAA अनुपालन और एन्क्रिप्टेड डेटा',
    realtimeSync: 'रियल-टाइम डिवाइस सिंक सक्रिय',
    emergency911: 'आपातकालीन अलर्ट (102)',
    emergency102: 'राष्ट्रीय एम्बुलेंस (102)',
    newTriage: 'लक्षण ट्राइएज जांच',
    myHistory: 'चिकित्सा इतिहास व पिछली जांचें',
    secureMessages: 'सुरक्षित क्लिनिकल मैसेजिंग',
    ehrIntegration: 'EHR / FHIR एकीकरण',
    privacySettings: 'गोपनीयता और डेटा सुरक्षा',
    auditTrail: 'ऑडिट लॉग व सुरक्षा रिकॉर्ड',
    chiefComplaintLabel: 'मुख्य स्वास्थ्य समस्या',
    chiefComplaintPlaceholder: 'उदा., सीने में तेज दर्द जो बाएं हाथ तक जा रहा है, सांस लेने में तकलीफ...',
    detailedSymptomsLabel: 'लक्षणों का विस्तृत विवरण व समय',
    detailedSymptomsPlaceholder: 'यह कब शुरू हुआ? चलने या लेटने पर क्या असर होता है? पसीना या चक्कर?',
    vitalSignsLabel: 'वाइटल साइन्स (रक्तचाप, पल्स, तापमान)',
    multimodalUploadLabel: 'मल्टीमॉडल इनपुट (फोटो, आवाज, लैब रिपोर्ट)',
    runAnalysisBtn: 'एआई मल्टीमॉडल ट्राइएज शुरू करें',
    analyzingSymptoms: 'क्लिनिकल इमरजेंसी मानकों के अनुसार विश्लेषण हो रहा है...',
    esiLevel: 'ESI तात्कालिकता स्तर',
    acuityLevel: 'गंभीरता श्रेणी',
    redFlags: ['हृदय आपात चेतावनी', 'श्वसन संकट', 'न्यूरोलॉजिकल अलर्ट', 'तीव्र एलर्जी खतरा'],
    recommendedAction: 'अनुशंसित क्लिनिकल कदम',
    disposition: 'उपचार मार्ग',
    sendToClinician: 'ऑन-कॉल डॉक्टर से संपर्क करें',
    voiceInputTitle: 'लक्षणों की आवाज रिकॉर्डिंग',
    photoInputTitle: 'घाव या लक्षण की फोटो अपलोड करें',
    documentUploadTitle: 'लैब रिपोर्ट व मेडिकल रिकॉर्ड अपलोड करें',
    callEmergencyNow: 'तुरंत 102 एम्बुलेंस सेवा को कॉल करें',
    phiProtected: 'सभी स्वास्थ्य रिकॉर्ड उच्च एन्क्रिप्शन और गोपनीयता मानकों के तहत सुरक्षित हैं।'
  }
};
