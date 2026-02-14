export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  image?: string; // Base64 data URI
  timestamp: number;
  isLoading?: boolean;
  error?: boolean;
  errorType?: 'PERMISSION_DENIED' | 'QUOTA_EXCEEDED' | 'UNKNOWN';
}

export type ModelId = 'deepseek' | 'gemini' | 'gpt';

export interface AIModel {
  id: ModelId;
  name: string;
  description: string;
  icon: string;
  type: 'text';
  baseModel: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  modelId: ModelId;
}