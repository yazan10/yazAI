import { AIModel } from './types';

// Icons are represented as simple string names to be rendered by Lucide
export const MODELS: AIModel[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    description: 'نموذج متخصص في البرمجة والمنطق المعقد',
    icon: 'Brain',
    type: 'text',
    baseModel: 'gemini-3-flash-preview' // Switched from pro to flash to fix Quota Exceeded errors
  },
  {
    id: 'gemini',
    name: 'Gemini Flash 3.0',
    description: 'النموذج السريع من جوجل للمهام العامة',
    icon: 'Sparkles',
    type: 'text',
    baseModel: 'gemini-3-flash-preview'
  },
  {
    id: 'gpt',
    name: 'ChatGPT-4o',
    description: 'مساعد ذكي للمحادثات اليومية والإبداع',
    icon: 'MessageCircle',
    type: 'text',
    baseModel: 'gemini-3-flash-preview'
  }
];

export const SYSTEM_PROMPTS: Record<string, string> = {
  deepseek: "You are DeepSeek R1, an advanced AI assistant specialized in reasoning, coding, and complex problem solving. You provide deep, step-by-step analysis. Always answer in the language the user speaks (likely Arabic).",
  gpt: "You are ChatGPT-4o. You are helpful, creative, clever, and very friendly. You assist with writing, analysis, and general questions. Always answer in the language the user speaks (likely Arabic).",
  gemini: "You are Gemini, a helpful and capable AI assistant from Google. Always answer in the language the user speaks (likely Arabic)."
};
