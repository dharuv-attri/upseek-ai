import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Brain,
  FileText,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { Message, UserProfile } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  user: UserProfile;
  onRegenerate?: () => void;
  onEditMessage?: (newContent: string) => void;
  onRateMessage?: (liked: boolean) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  user,
  onRegenerate,
  onEditMessage,
  onRateMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThinking, setShowThinking] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveEdit = () => {
    if (editDraft.trim() && onEditMessage) {
      onEditMessage(editDraft.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group w-full py-5 px-3 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-neutral-900/30 border-y border-neutral-900/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3.5 sm:gap-4.5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-neutral-700 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header metadata */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">
              {isUser ? user.name : 'UPSEEK AI'}
            </span>
            <span>•</span>
            <span className="text-[11px] text-neutral-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {!isUser && message.modelId && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                {message.modelId.replace('upseek-', 'UPSEEK ')}
              </span>
            )}
          </div>

          {/* Attachments preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-2">
              {message.attachments.map((att) => {
                const isImage = att.mimeType.startsWith('image/');
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-850 border border-neutral-750 text-xs text-neutral-200"
                  >
                    {isImage && att.data ? (
                      <img
                        src={att.data}
                        alt={att.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <div className="max-w-[150px] truncate">
                      <div className="truncate font-medium">{att.name}</div>
                      <div className="text-[10px] text-neutral-500">
                        {(att.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Collapsible Deep Thinking Block */}
          {message.thought && (
            <div className="my-2 rounded-xl border border-violet-500/30 bg-violet-950/20 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowThinking(!showThinking)}
                className="w-full flex items-center justify-between px-3 py-2 text-violet-300 font-medium hover:bg-violet-900/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-violet-400" />
                  <span>Thinking Process</span>
                  {message.thinkingDuration && (
                    <span className="text-neutral-400 font-normal">
                      ({message.thinkingDuration.toFixed(1)}s)
                    </span>
                  )}
                </div>
                {showThinking ? (
                  <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
                )}
              </button>

              {showThinking && (
                <div className="px-3.5 py-2.5 text-neutral-300 border-t border-violet-500/20 font-mono text-[11px] leading-relaxed whitespace-pre-wrap bg-neutral-950/40">
                  {message.thought}
                </div>
              )}
            </div>
          )}

          {/* Message Content or Edit Draft */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-neutral-900 border border-cyan-500/60 p-3 text-sm text-neutral-100 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors"
                >
                  Save & Resubmit
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-neutral-100 relative">
              <MarkdownRenderer content={message.content} />
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 translate-y-0.5 bg-cyan-400 animate-pulse rounded-sm" />
              )}
            </div>
          )}

          {/* Error Message Alert */}
          {message.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{message.error}</span>
            </div>
          )}

          {/* Action Toolbar */}
          {!message.isStreaming && (
            <div className="flex items-center gap-1 pt-1 opacity-75 group-hover:opacity-100 transition-opacity text-neutral-400">
              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Text-to-Speech Read Aloud */}
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors ${
                  isSpeaking ? 'text-cyan-400' : 'hover:text-white'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Regenerate (for assistant messages) */}
              {!isUser && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Edit (for user messages) */}
              {isUser && onEditMessage && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Like / Dislike (for assistant) */}
              {!isUser && onRateMessage && (
                <div className="flex items-center gap-0.5 ml-1 border-l border-neutral-800 pl-1.5">
                  <button
                    type="button"
                    onClick={() => onRateMessage(true)}
                    className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors ${
                      message.liked === true ? 'text-emerald-400' : 'hover:text-white'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRateMessage(false)}
                    className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors ${
                      message.liked === false ? 'text-red-400' : 'hover:text-white'
                    }`}
                    title="Needs improvement"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
