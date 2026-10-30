import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  Brain,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Attachment, ModeType } from '../types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments: Attachment[]) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  activeMode: ModeType;
  deepReasoning: boolean;
  onToggleDeepReasoning: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  activeMode,
  deepReasoning,
  onToggleDeepReasoning,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [content]);

  // Web Speech Recognition for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = async (files: File[]) => {
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      const id = 'att_' + Math.random().toString(36).substring(2, 9);
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        // Read image as base64
        const base64 = await readFileAsBase64(file);
        newAttachments.push({
          id,
          name: file.name,
          size: file.size,
          type: 'image',
          mimeType: file.type,
          data: base64,
        });
      } else {
        // Read text or document content
        const text = await readFileAsText(file);
        newAttachments.push({
          id,
          name: file.name,
          size: file.size,
          type: 'document',
          mimeType: file.type || 'text/plain',
          textContent: text,
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve(`[Failed to parse ${file.name}]`);
      reader.readAsText(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if (isStreaming) {
      onStopGeneration();
      return;
    }

    if (!content.trim() && attachments.length === 0) return;

    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4">
      {/* Drag & Drop Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            await processFiles(Array.from(e.dataTransfer.files));
          }
        }}
        className={`relative rounded-2xl bg-neutral-900/90 border transition-all duration-200 shadow-xl backdrop-blur-md ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-500/20'
            : 'border-neutral-750 hover:border-neutral-650 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20'
        }`}
      >
        {/* Attachment Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b border-neutral-800/80">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 shadow-sm"
              >
                {att.type === 'image' && att.data ? (
                  <img
                    src={att.data}
                    alt={att.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span className="max-w-[120px] truncate text-[11px] font-medium">
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="flex items-end px-3.5 pt-3 pb-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'code'
                ? 'Ask for architecture, code generation, debugging, or refactoring...'
                : activeMode === 'research'
                ? 'Inquire for deep analytical research, trade-offs, or synthesis...'
                : activeMode === 'write'
                ? 'Draft an essay, email, script, or creative copy...'
                : activeMode === 'summarize'
                ? 'Paste text or upload a document to get an executive summary...'
                : 'Ask UPSEEK anything, or type @ to mention concepts...'
            }
            className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 resize-none focus:outline-none max-h-48 leading-relaxed"
          />
        </div>

        {/* Control Footer */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-xs">
          {/* Left tools: Attachment, DeepReason, Mic */}
          <div className="flex items-center gap-1.5">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.csv,.pdf,.py,.js,.ts,.tsx,.html"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Attach images, documents or code"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* DeepReason Toggle */}
            <button
              type="button"
              onClick={onToggleDeepReasoning}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                deepReasoning
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-sm shadow-violet-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Toggle Deep Step-by-Step Reasoning"
            >
              <Brain className={`w-3.5 h-3.5 ${deepReasoning ? 'text-violet-400' : ''}`} />
              <span>DeepReason</span>
            </button>

            {/* Mic Dictation */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-colors ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={isRecording ? 'Listening... click to stop' : 'Voice dictation'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right: Send / Stop button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-neutral-500">
              Shift + Return for new line
            </span>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 transition-all shadow-md active:scale-95 flex items-center justify-center"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!content.trim() && attachments.length === 0}
                className={`p-2 rounded-xl transition-all shadow-md flex items-center justify-center active:scale-95 ${
                  content.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 hover:opacity-95'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
