import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing with generous limit for multimodal attachments
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize GoogleGenAI server-side client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Available Model Catalog
const MODEL_CATALOG = [
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

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'UPSEEK AI',
    tagline: 'Think Smarter. Discover More.',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Models Catalog API
app.get('/api/models', (req, res) => {
  res.json({
    models: MODEL_CATALOG,
    defaultModel: 'upseek-hyper',
  });
});

// SSE Streaming Chat Endpoint
app.post('/api/chat/stream', async (req, res) => {
  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isClientDisconnected = false;
  req.on('close', () => {
    isClientDisconnected = true;
  });

  const sendEvent = (data: Record<string, unknown>) => {
    if (!isClientDisconnected && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    const {
      messages = [],
      modelId = 'upseek-hyper',
      customSystemPrompt = '',
      deepReasoning = false,
      mode = 'general', // general | write | code | research | summarize
    } = req.body;

    const selectedModel = MODEL_CATALOG.find((m) => m.id === modelId) || MODEL_CATALOG[0];

    // If third-party provider requested that is not configured, inform client with graceful architecture bridge
    if (selectedModel.provider !== 'gemini') {
      sendEvent({
        type: 'chunk',
        text: `### 🌐 Provider Bridge Notice: ${selectedModel.name}\n\n` +
          `You've selected **${selectedModel.name}** (${selectedModel.tagline}). ` +
          `The UPSEEK platform architecture is ready for multi-provider routing. ` +
          `For active production inference in this environment, UPSEEK is routing your request through our primary high-speed neural engine (**UPSEEK Hyper 3.8 / Gemini**) while maintaining the persona and formatting optimal for this mode.\n\n---\n\n`,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      sendEvent({
        type: 'error',
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is present in the Secrets panel.',
      });
      res.end();
      return;
    }

    // Build system instructions based on mode and deep reasoning
    let systemInstruction = `You are UPSEEK AI, a world-class, premium artificial intelligence platform created to help humans "Think Smarter. Discover More."
You blend the conversational clarity of ChatGPT, the creative synthesis and multimodal prowess of Gemini, and the thoughtful depth and prose elegance of Claude.
Guidelines:
- Deliver precise, insightful, and structured answers.
- Format responses beautifully using clean Markdown: headers (##, ###), bullet points, bold key terms, blockquotes, and tables where helpful.
- For code, always specify the programming language (e.g. \`\`\`tsx, \`\`\`python) with clean, idiomatic implementation and concise explanations.
- Never mention internal model names or secrets unless asked about platform capabilities.
- Address the user with professional warmth, clarity, and intellectual rigor.`;

    if (mode === 'code') {
      systemInstruction += `\nMode: Senior Software Architect. Provide production-grade code, handle edge cases, include type safety, explain architecture, and suggest optimal algorithms.`;
    } else if (mode === 'research') {
      systemInstruction += `\nMode: Deep Research & Analytical Synthesis. Break topics down systematically with hypothesis, evidence, comparative trade-offs, and clear executive conclusions.`;
    } else if (mode === 'write') {
      systemInstruction += `\nMode: Editorial & Creative Prose. Craft compelling, eloquent, and polished prose with impeccable rhythm, tone control, and vivid vocabulary.`;
    } else if (mode === 'summarize') {
      systemInstruction += `\nMode: Executive Summarization. Provide immediate TL;DR, followed by key takeaways in bullet points, actionable implications, and concise structured sections.`;
    }

    if (deepReasoning || modelId === 'upseek-deepreason') {
      systemInstruction += `\nYou are operating in DeepReason mode. Structure your output with rigorous logic: first analyze first-principles, examine potential counter-arguments, and present a methodical solution.`;
    }

    if (customSystemPrompt && customSystemPrompt.trim()) {
      systemInstruction += `\nAdditional user guidelines: ${customSystemPrompt.trim()}`;
    }

    // Transform messages into @google/genai contents format
    // Map 'assistant' role to 'model'
    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    }> = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // Multimodal attachments if attached to this message
      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.data && att.mimeType) {
            // If it's an image or document supported by inlineData
            const cleanBase64 = att.data.includes(',') ? att.data.split(',')[1] : att.data;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: cleanBase64,
              },
            });
          } else if (att.textContent) {
            parts.push({
              text: `[Attached Document: "${att.name}"]:\n${att.textContent}\n---`,
            });
          }
        }
      }

      if (msg.content && msg.content.trim()) {
        parts.push({ text: msg.content });
      }

      // If parts is empty, provide placeholder space
      if (parts.length === 0) {
        parts.push({ text: ' ' });
      }

      contents.push({ role, parts });
    }

    // If contents is empty, return error
    if (contents.length === 0) {
      sendEvent({ type: 'error', error: 'No message content provided.' });
      res.end();
      return;
    }

    // Call generateContentStream on the server
    const targetModel = 'gemini-3.8-flash';
    const stream = await ai.models.generateContentStream({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    for await (const chunk of stream) {
      if (isClientDisconnected) break;
      const textChunk = chunk.text;
      if (textChunk) {
        sendEvent({
          type: 'chunk',
          text: textChunk,
        });
      }
    }

    if (!isClientDisconnected) {
      sendEvent({ type: 'done' });
    }
  } catch (error: any) {
    console.error('Error during chat stream:', error);
    sendEvent({
      type: 'error',
      error: error?.message || 'An error occurred while generating response from UPSEEK AI.',
    });
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
});

// Non-streaming fallback endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], customSystemPrompt = '', mode = 'general' } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: `You are UPSEEK AI. Provide helpful, structured, insightful answers.\nMode: ${mode}.\n${customSystemPrompt}`,
      },
    });

    return res.json({
      text: response.text || '',
      model: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Non-streaming chat error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Title Generator for Chat Sessions
app.post('/api/generate-title', async (req, res) => {
  try {
    const { firstMessage } = req.body;
    if (!firstMessage) {
      return res.json({ title: 'New Conversation' });
    }
    const ai = getGeminiClient();
    if (!ai) {
      const fallback = firstMessage.slice(0, 32).trim() + (firstMessage.length > 32 ? '...' : '');
      return res.json({ title: fallback });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a brief 3 to 5 word title (no quotes, no punctuation, capitalize words) summarizing this user inquiry: "${firstMessage}"`,
    });

    const title = (response.text || firstMessage.slice(0, 30)).trim().replace(/["\n]/g, '');
    res.json({ title: title || 'New Conversation' });
  } catch (err) {
    res.json({ title: 'New Conversation' });
  }
});

// Smart Suggested Follow-ups Generator
app.post('/api/suggested-prompts', async (req, res) => {
  try {
    const { context } = req.body;
    const ai = getGeminiClient();
    if (!ai || !context) {
      return res.json({
        suggestions: [
          'Can you elaborate on that?',
          'Give me a practical code example',
          'What are the key trade-offs?',
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Given the last AI response:\n"${context.slice(-600)}"\n\nGenerate exactly 3 short, relevant, highly engaging follow-up questions or next actions the user might want to ask. Separate each by a newline. Do not number them. Keep each under 8 words.`,
    });

    const suggestions = (response.text || '')
      .split('\n')
      .map((s) => s.replace(/^[-*•0-9.]+\s*/, '').trim())
      .filter((s) => s.length > 3 && s.length < 80)
      .slice(0, 3);

    res.json({
      suggestions: suggestions.length > 0 ? suggestions : [
        'Explore alternative approaches',
        'Provide step-by-step implementation',
        'Summarize the core takeaways',
      ],
    });
  } catch (err) {
    res.json({ suggestions: [] });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 UPSEEK AI Server listening at http://0.0.0.0:${port}`);
  });
}

startServer();
