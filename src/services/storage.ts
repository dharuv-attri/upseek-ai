import { Conversation, UserProfile, PlatformSettings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'upseek_conversations',
  ACTIVE_CONVERSATION: 'upseek_active_conversation',
  USER_PROFILE: 'upseek_user_profile',
  PLATFORM_SETTINGS: 'upseek_settings',
  THEME: 'upseek_theme',
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr_premium_01',
  name: 'Alex Carter',
  email: 'alex.carter@upseek.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Pro Member',
  tokenUsage: 142850,
  createdAt: '2026-01-15',
};

export const DEFAULT_SETTINGS: PlatformSettings = {
  theme: 'dark',
  defaultModelId: 'upseek-hyper',
  defaultMode: 'general',
  customSystemPrompt: '',
  soundEnabled: true,
  autoSpeak: false,
  speechSpeed: 1.0,
};

// Initial welcome conversation for first-time visitors
export const createInitialConversation = (): Conversation => {
  const convId = 'conv_welcome_' + Date.now();
  return {
    id: convId,
    title: 'Welcome to UPSEEK AI',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    modelId: 'upseek-hyper',
    mode: 'general',
    isPinned: true,
    messages: [
      {
        id: 'msg_sys_intro',
        role: 'assistant',
        timestamp: Date.now(),
        content: `### Welcome to UPSEEK AI 🌌
**Think Smarter. Discover More.**

I am your next-generation intelligence partner, engineered for deep reasoning, high-speed coding, research synthesis, and creative discovery.

Here is what you can explore:
- ⚡ **Real-Time Streaming:** Ask complex questions and see step-by-step reasoning emerge instantly.
- 💻 **Software Engineering & Architecture:** Full-stack design, algorithmic optimization, bug diagnostics, and refactoring.
- 🔬 **Deep Research & Analysis:** Synthesize scientific concepts, business strategies, and multi-factor decisions.
- 📎 **Multimodal Analysis:** Upload images, screenshots, code files, or documents for in-depth inspection.
- 🌐 **Multi-Model Intelligence:** Switch between **UPSEEK Hyper 3.8**, **DeepReason R1**, or explore Claude 3.7 Sonnet and GPT-4o architecture bridges.

Try asking me:
* "Explain the mathematical difference between Transformer attention and State Space Models."
* "Review this React architecture and recommend performance bottlenecks."
* "Draft an executive summary comparing quantum computing architectures."

How can I help you think smarter today?`,
      },
    ],
  };
};

export const storage = {
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!data) {
        const initial = [createInitialConversation()];
        this.saveConversations(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load conversations:', e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  },

  getActiveConversationId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  },

  setActiveConversationId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return DEFAULT_USER;
      return JSON.parse(data);
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUserProfile(profile: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getSettings(): PlatformSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: PlatformSettings) {
    localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
  },

  getTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // default to premium futuristic dark mode
  },

  saveTheme(theme: 'dark' | 'light') {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  },
};
