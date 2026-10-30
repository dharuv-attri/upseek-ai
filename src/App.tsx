/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowDown,
  Brain,
  Code2,
  PenTool,
  Search,
  FileText,
  Compass,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  Conversation,
  Message,
  Attachment,
  AIModel,
  UserProfile,
  PlatformSettings,
  ModeType,
} from './types';
import { storage, DEFAULT_USER, DEFAULT_SETTINGS, createInitialConversation } from './services/storage';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';

const EMPTY_PROMPTS = [
  {
    icon: Code2,
    title: 'Code Architecture',
    subtitle: 'Full-stack TypeScript / React pattern',
    prompt: 'Implement a reactive state management system in TypeScript with subscriber batching and time-travel debugging.',
    mode: 'code' as ModeType,
  },
  {
    icon: Brain,
    title: 'Deep Reasoning',
    subtitle: 'Mathematical & algorithmic analysis',
    prompt: 'Provide a rigorous mathematical breakdown of the attention mechanism in Transformers vs State Space Models.',
    mode: 'research' as ModeType,
  },
  {
    icon: PenTool,
    title: 'Executive Writing',
    subtitle: 'Strategic briefing or publication',
    prompt: 'Draft an executive perspective on enterprise generative AI deployment, evaluating data privacy, latency, and cost.',
    mode: 'write' as ModeType,
  },
  {
    icon: Search,
    title: 'Research Synthesis',
    subtitle: 'Comprehensive deep dive',
    prompt: 'Synthesize the current state of Quantum Computing: superconducting qubits vs photonic vs trapped ions.',
    mode: 'research' as ModeType,
  },
];

export default function App() {
  // State: Core Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string>('upseek-hyper');
  const [activeMode, setActiveMode] = useState<ModeType>('general');
  const [deepReasoning, setDeepReasoning] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // State: Navigation & Modals
  const [viewMode, setViewMode] = useState<'chat' | 'landing'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // State: Chat Runtime
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize on mount
  useEffect(() => {
    // 1. Theme
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    storage.saveTheme(savedTheme);

    // 2. Settings
    const loadedSettings = storage.getSettings();
    setSettings(loadedSettings);
    setActiveModelId(loadedSettings.defaultModelId || 'upseek-hyper');
    setActiveMode(loadedSettings.defaultMode || 'general');

    // 3. User Profile
    const loadedUser = storage.getUserProfile();
    setUser(loadedUser);

    // 4. Conversations
    const loadedConversations = storage.getConversations();
    setConversations(loadedConversations);

    const savedActiveId = storage.getActiveConversationId();
    if (savedActiveId && loadedConversations.some((c) => c.id === savedActiveId)) {
      setActiveConversationId(savedActiveId);
    } else if (loadedConversations.length > 0) {
      setActiveConversationId(loadedConversations[0].id);
      storage.setActiveConversationId(loadedConversations[0].id);
    }

    // 5. Fetch Models from API
    api.getModels().then((data) => {
      setModels(data);
    });

    // Mobile screen responsive sidebar default
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Sync active conversation
  const currentConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const activeModel =
    models.find((m) => m.id === activeModelId) || {
      id: 'upseek-hyper',
      name: 'UPSEEK Hyper 3.8',
      provider: 'gemini' as const,
      geminiModel: 'gemini-3.8-flash',
      tagline: 'Lightning-fast, multimodal & highly intelligent',
      badge: 'Default',
      contextWindow: '1M tokens',
      capabilities: ['text', 'code', 'vision'],
      isOnline: true,
    };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations]);

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom(false);
    }
  }, [isStreaming, currentConversation?.messages]);

  // Monitor scroll position for "Scroll to bottom" button
  const handleScroll = () => {
    const container = chatScrollContainerRef.current;
    if (!container) return;
    const isFarFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight > 200;
    setShowScrollBottom(isFarFromBottom);
  };

  // Switch / Create New Chat
  const handleNewChat = (mode: ModeType = activeMode) => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: activeModelId,
      mode: mode,
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversationId(newConv.id);
    storage.saveConversations(updated);
    storage.setActiveConversationId(newConv.id);
    setFollowUpSuggestions([]);
    setViewMode('chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    storage.setActiveConversationId(id);
    setFollowUpSuggestions([]);
    setViewMode('chat');
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    storage.saveConversations(filtered);
    if (activeConversationId === id) {
      const nextId = filtered[0]?.id || null;
      setActiveConversationId(nextId);
      if (nextId) storage.setActiveConversationId(nextId);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    setConversations(updated);
    storage.saveConversations(updated);
  };

  const handleTogglePin = (id: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, isPinned: !c.isPinned } : c
    );
    setConversations(updated);
    storage.saveConversations(updated);
  };

  const handleExportConversation = (id: string, format: 'md' | 'json') => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    let content = '';
    let filename = `${conv.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    if (format === 'json') {
      content = JSON.stringify(conv, null, 2);
      filename += '.json';
    } else {
      content = `# ${conv.title}\n*Exported from UPSEEK AI on ${new Date().toLocaleString()}*\n\n`;
      conv.messages.forEach((m) => {
        const role = m.role === 'user' ? 'User' : 'UPSEEK AI';
        content += `### ${role} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n\n---\n\n`;
      });
      filename += '.md';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send Message & Stream Response
  const handleSendMessage = async (
    textContent: string,
    attachments: Attachment[] = []
  ) => {
    if (isStreaming) return;
    if (!textContent.trim() && attachments.length === 0) return;

    let targetConvId = activeConversationId;
    let currentConv = conversations.find((c) => c.id === targetConvId);

    // If no active conversation, create one
    if (!currentConv) {
      const newConv: Conversation = {
        id: 'conv_' + Date.now(),
        title: textContent.slice(0, 30) || 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelId: activeModelId,
        mode: activeMode,
      };
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
      storage.saveConversations([newConv, ...conversations]);
      storage.setActiveConversationId(newConv.id);
      currentConv = newConv;
      targetConvId = newConv.id;
    }

    const userMessage: Message = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: textContent,
      timestamp: Date.now(),
      attachments,
    };

    const assistantMessageId = 'msg_a_' + Date.now();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: activeModelId,
      mode: activeMode,
      isStreaming: true,
    };

    const updatedMessages = [...currentConv.messages, userMessage, assistantMessage];
    const updatedConv = {
      ...currentConv,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    const newConversations = conversations.map((c) =>
      c.id === targetConvId ? updatedConv : c
    );
    setConversations(newConversations);
    storage.saveConversations(newConversations);

    // Setup streaming
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);
    setFollowUpSuggestions([]);

    let streamedText = '';
    const startTime = Date.now();

    // Context messages to send (excluding empty placeholder)
    const contextMessages = [...currentConv.messages, userMessage];

    await api.streamChat({
      messages: contextMessages,
      modelId: activeModelId,
      mode: activeMode,
      deepReasoning,
      customSystemPrompt: settings.customSystemPrompt,
      signal: controller.signal,
      callbacks: {
        onChunk: (chunk: string) => {
          streamedText += chunk;

          // Check if thinking format is present
          let cleanContent = streamedText;
          let thought = '';
          const thinkMatch = streamedText.match(/<think>([\s\S]*?)<\/think>/);
          if (thinkMatch) {
            thought = thinkMatch[1].trim();
            cleanContent = streamedText.replace(/<think>[\s\S]*?<\/think>/, '').trim();
          }

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      content: cleanContent,
                      thought: thought || undefined,
                      thinkingDuration: (Date.now() - startTime) / 1000,
                    };
                  }
                  return m;
                }),
              };
            })
          );
        },
        onDone: () => {
          setIsStreaming(false);
          abortControllerRef.current = null;

          // Mark message not streaming
          setConversations((prev) => {
            const final = prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return { ...m, isStreaming: false };
                  }
                  return m;
                }),
              };
            });
            storage.saveConversations(final);
            return final;
          });

          // Increment user token usage
          setUser((prev) => {
            const updated = {
              ...prev,
              tokenUsage: prev.tokenUsage + Math.ceil(streamedText.length / 4) + 60,
            };
            storage.saveUserProfile(updated);
            return updated;
          });

          // Generate title if first message
          if (currentConv.messages.length === 0) {
            api.generateTitle(textContent).then((title) => {
              handleRenameConversation(targetConvId!, title);
            });
          }

          // Generate suggested follow-up questions
          if (streamedText.trim()) {
            api.getSuggestedFollowUps(streamedText).then((suggestions) => {
              setFollowUpSuggestions(suggestions);
            });
          }
        },
        onError: (errorText: string) => {
          setIsStreaming(false);
          abortControllerRef.current = null;

          setConversations((prev) => {
            const final = prev.map((c) => {
              if (c.id !== targetConvId) return c;
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === assistantMessageId) {
                    return {
                      ...m,
                      isStreaming: false,
                      error: errorText,
                    };
                  }
                  return m;
                }),
              };
            });
            storage.saveConversations(final);
            return final;
          });
        },
      },
    });
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (!currentConversation || isStreaming) return;
    const msgs = currentConversation.messages;
    if (msgs.length === 0) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const userMsg = msgs[lastUserIndex];
    // Trim messages up to the user message
    const trimmed = msgs.slice(0, lastUserIndex);
    const updatedConv = {
      ...currentConversation,
      messages: trimmed,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversation.id ? updatedConv : c))
    );

    // Resend user message
    handleSendMessage(userMsg.content, userMsg.attachments || []);
  };

  // Edit Message
  const handleEditMessage = (newContent: string) => {
    if (!currentConversation || isStreaming) return;
    handleSendMessage(newContent);
  };

  // Rate message
  const handleRateMessage = (messageId: string, liked: boolean) => {
    if (!currentConversation) return;
    const updated = conversations.map((c) => {
      if (c.id !== currentConversation.id) return c;
      return {
        ...c,
        messages: c.messages.map((m) => (m.id === messageId ? { ...m, liked } : m)),
      };
    });
    setConversations(updated);
    storage.saveConversations(updated);
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storage.saveTheme(nextTheme);
  };

  // Settings Save
  const handleSaveSettings = (newSettings: PlatformSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    if (newSettings.theme !== theme) {
      setTheme(newSettings.theme === 'light' ? 'light' : 'dark');
      storage.saveTheme(newSettings.theme === 'light' ? 'light' : 'dark');
    }
  };

  // Clear all chats
  const handleClearAllChats = () => {
    setConversations([]);
    setActiveConversationId(null);
    storage.saveConversations([]);
    handleNewChat();
  };

  // Export all data
  const handleExportAllData = () => {
    const data = {
      app: 'UPSEEK AI',
      exportedAt: new Date().toISOString(),
      user,
      conversations,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upseek_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => handleNewChat()}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePin}
        onExportConversation={handleExportConversation}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeModel={activeModel}
          onOpenModelSelector={() => setIsModelModalOpen(true)}
          activeMode={activeMode}
          onChangeMode={(mode) => setActiveMode(mode)}
          viewMode={viewMode}
          onToggleViewMode={() =>
            setViewMode((prev) => (prev === 'chat' ? 'landing' : 'chat'))
          }
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* View Switch: 3D Landing Showcase vs Chat Studio */}
        {viewMode === 'landing' ? (
          <LandingPage
            onStartChat={(prompt) => {
              handleNewChat();
              if (prompt) {
                setTimeout(() => handleSendMessage(prompt), 150);
              }
            }}
            models={models}
            onOpenModelSelector={() => setIsModelModalOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            {/* Messages Scroll Area */}
            <div
              ref={chatScrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden relative"
            >
              {/* Empty Chat Greeting / Starter Prompts */}
              {(!currentConversation || currentConversation.messages.length === 0) && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8 flex flex-col items-center text-center">
                  {/* Subtle Glowing Neural Icon */}
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/25 mb-5 ring-4 ring-cyan-500/10">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Where will your intellect venture?
                  </h2>
                  <p className="mt-2 text-sm text-neutral-400 max-w-md">
                    UPSEEK is primed for high-speed multi-model discovery, production engineering, and deep step-by-step reasoning.
                  </p>

                  {/* 4 Categorized Starter Cards */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                    {EMPTY_PROMPTS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveMode(item.mode);
                            handleSendMessage(item.prompt);
                          }}
                          className="p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-850/90 border border-neutral-800 hover:border-cyan-500/50 cursor-pointer transition-all duration-200 group flex items-start gap-3.5 shadow-md"
                        >
                          <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-750 text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 self-center" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chat Message List */}
              {currentConversation?.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  user={user}
                  onRegenerate={handleRegenerate}
                  onEditMessage={handleEditMessage}
                  onRateMessage={(liked) => handleRateMessage(message.id, liked)}
                />
              ))}

              {/* Suggested Follow-up Questions */}
              {followUpSuggestions.length > 0 && !isStreaming && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-neutral-400">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Suggested Next Directions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {followUpSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-3.5 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-750 hover:border-cyan-500/50 text-xs text-neutral-300 hover:text-white transition-all shadow-sm text-left active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-6" />
            </div>

            {/* Scroll to Bottom Floating Pill */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-24 right-8 p-2 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border border-neutral-600 shadow-xl transition-all z-20"
                title="Scroll to bottom"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            )}

            {/* Chat Input Container */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              isStreaming={isStreaming}
              activeMode={activeMode}
              deepReasoning={deepReasoning}
              onToggleDeepReasoning={() => setDeepReasoning(!deepReasoning)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        models={models}
        activeModelId={activeModelId}
        onSelectModel={(id) => {
          setActiveModelId(id);
          if (id === 'upseek-deepreason') setDeepReasoning(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onSelectUser={(newProfile) => {
          setUser(newProfile);
          storage.saveUserProfile(newProfile);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllChats={handleClearAllChats}
        onExportAllData={handleExportAllData}
      />
    </div>
  );
}
