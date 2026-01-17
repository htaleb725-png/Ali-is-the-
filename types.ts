
export enum AcademicMode {
  GENERAL = 'general',
  REVIEWER = 'reviewer',
  WRITER = 'writer',
  SUPERVISOR = 'supervisor',
  ANALYST = 'analyst',
  ENGINEER = 'engineer',
  HUMANIZER = 'humanizer'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AcademicMode;
  timestamp: Date;
  groundingUrls?: Array<{ uri: string; title: string }>;
  isHumanized?: boolean;
}

export interface ModeConfig {
  id: AcademicMode;
  title: string;
  icon: string;
  description: string;
  systemInstruction: string;
  customInstruction?: string; // لتعليمات المطور المخصصة
}
