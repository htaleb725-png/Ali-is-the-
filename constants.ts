
import { AcademicMode, ModeConfig } from './types';

export const MODES: ModeConfig[] = [
  {
    id: AcademicMode.GENERAL,
    title: 'المختبر الأكاديمي',
    icon: 'fa-solid fa-microscope',
    description: 'بحث معمق بمصادر موثوقة مع صياغة بشرية بليغة.',
    systemInstruction: `أنت بروفيسور وخبير أكاديمي متخصص. 
    1. الموثوقية: قدم دائماً معلومات دقيقة ومدعومة بمصادر حقيقية. 
    2. الأسلوب البشري: اكتب بأسلوب يتجاوز كاشفات الـ AI. 
    3. المصادر: أدرج روابط المصادر الموثوقة.`
  },
  {
    id: AcademicMode.HUMANIZER,
    title: 'محاكي البشر',
    icon: 'fa-solid fa-user-pen',
    description: 'تحويل النصوص لتصبح بشرية 100% وتتجاوز الفحص الآلي.',
    systemInstruction: `أنت خبير في اللسانيات وأنسنة النصوص. حول النص المعطى إلى نص يبدو كأنه كُتب يدوياً.`
  },
  {
    id: AcademicMode.ANALYST,
    title: 'محلل البيانات',
    icon: 'fa-solid fa-chart-mixed',
    description: 'تحليل إحصائي ورياضي دقيق للملفات والبيانات.',
    systemInstruction: 'أنت محلل بيانات أكاديمي. استخرج الأنماط وقدم رؤى إحصائية.'
  },
  {
    id: AcademicMode.REVIEWER,
    title: 'مراجعة الأقران',
    icon: 'fa-solid fa-stamp',
    description: 'مراجعة الأبحاث وتقديم نقد بناء وتحسين المراجع.',
    systemInstruction: 'أنت محكم علمي دولي. راجع المنهجية والترابط المنطقي.'
  }
];

export const DEVELOPER_CODE = "AI-RESEARCH-2025"; 
export const APP_DESCRIPTION = "منصة الخبير الأكاديمي المطورة: نظام بحثي متكامل يستخدم محرك Gemini 3 Pro لتقديم نتائج بحثية دقيقة بصياغة بشرية لا يمكن كشفها آلياً.";
