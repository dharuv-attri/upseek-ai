import { Message, AIModel, ModeType } from '../types';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onThought?: (thought: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export const api = {
  // Real-time SSE Streaming
  async streamChat({
    messages,
    modelId,
    mode,
    deepReasoning,
    customSystemPrompt,
    signal,
    callbacks,
  }: {
    messages: Message[];
    modelId: string;
    mode: ModeType;
    deepReasoning?: boolean;
    customSystemPrompt?: string;
    signal?: AbortSignal;
    callbacks: StreamCallbacks;
  }) {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          modelId,
          mode,
          deepReasoning,
          customSystemPrompt,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available from server.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'chunk' && data.text) {
                callbacks.onChunk(data.text);
              } else if (data.type === 'thought' && data.text) {
                callbacks.onThought?.(data.text);
              } else if (data.type === 'error') {
                callbacks.onError(data.error || 'Unknown error occurred.');
              } else if (data.type === 'done') {
                callbacks.onDone();
                return;
              }
            } catch (err) {
              console.warn('Failed to parse SSE line:', jsonStr, err);
            }
          }
        }
      }

      callbacks.onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
        callbacks.onDone();
      } else {
        console.error('Stream chat request error:', err);
        callbacks.onError(err.message || 'Network error communicating with UPSEEK AI.');
      }
    }
  },

  // Generate 3-5 word Title for Conversation
  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const res = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage }),
      });
      if (!res.ok) return firstMessage.slice(0, 30);
      const data = await res.json();
      return data.title || firstMessage.slice(0, 30);
    } catch {
      return firstMessage.slice(0, 30);
    }
  },

  // Generate Follow-up Suggested Prompts
  async getSuggestedFollowUps(context: string): Promise<string[]> {
    try {
      const res = await fetch('/api/suggested-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.suggestions || [];
    } catch {
      return [];
    }
  },

  // Fetch Available Models
  async getModels(): Promise<AIModel[]> {
    try {
      const res = await fetch('/api/models');
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      return data.models;
    } catch (err) {
      console.warn('Using fallback model list:', err);
      return [
        {
          id: 'upseek-hyper',
          name: 'UPSEEK Hyper 3.8',
          provider: 'gemini',
          geminiModel: 'gemini-3.8-flash',
          tagline: 'Lightning-fast, multimodal & highly intelligent',
          badge: 'Default',
          contextWindow: '1M tokens',
          capabilities: ['text', 'code', 'vision', 'documents'],
          isOnline: true,
        },
        {
          id: 'upseek-deepreason',
          name: 'UPSEEK DeepReason R1',
          provider: 'gemini',
          geminiModel: 'gemini-3.8-flash',
          tagline: 'Deep step-by-step mathematical & structural reasoning',
          badge: 'Reasoning',
          contextWindow: '1M tokens',
          capabilities: ['deep-thought', 'math', 'architecture', 'logic'],
          isOnline: true,
        },
        {
          id: 'claude-3-7-sonnet',
          name: 'Claude 3.7 Sonnet',
          provider: 'anthropic',
          tagline: 'Nuanced writing, complex analysis & hybrid reasoning',
          badge: 'Anthropic Ready',
          contextWindow: '200K tokens',
          capabilities: ['writing', 'analysis', 'coding'],
          isOnline: false,
          routingNote: 'Architecture ready. Connects via proxy / API key.',
        },
        {
          id: 'gpt-4o',
          name: 'GPT-4o Omniverse',
          provider: 'openai',
          tagline: 'High-speed omni intelligence & versatile code generation',
          badge: 'OpenAI Ready',
          contextWindow: '128K tokens',
          capabilities: ['multimodal', 'creative', 'speed'],
          isOnline: false,
          routingNote: 'Architecture ready. Connects via proxy / API key.',
        },
      ];
    }
  },
};
