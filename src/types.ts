export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  data?: string; // base64 string
  textContent?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  modelId?: string;
  mode?: string;
  isStreaming?: boolean;
  thought?: string;
  thinkingDuration?: number;
  liked?: boolean | null;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
  modelId: string;
  mode: ModeType;
}

export type ModeType = 'general' | 'write' | 'code' | 'research' | 'summarize';

export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'anthropic' | 'openai';
  geminiModel?: string;
  tagline: string;
  badge: string;
  contextWindow: string;
  capabilities: string[];
  isOnline: boolean;
  routingNote?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  tokenUsage: number;
  createdAt: string;
}

export interface PlatformSettings {
  theme: 'dark' | 'light' | 'system';
  defaultModelId: string;
  defaultMode: ModeType;
  customSystemPrompt: string;
  soundEnabled: boolean;
  autoSpeak: boolean;
  speechSpeed: number;
}
