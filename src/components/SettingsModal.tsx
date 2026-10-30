import React, { useState } from 'react';
import {
  X,
  Settings,
  Moon,
  Sun,
  Volume2,
  Trash2,
  Download,
  Shield,
  Sparkles,
} from 'lucide-react';
import { PlatformSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => void;
  onClearAllChats: () => void;
  onExportAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllChats,
  onExportAllData,
}) => {
  const [localSettings, setLocalSettings] = useState<PlatformSettings>(settings);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">Platform Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 space-y-5 max-h-[65vh] overflow-y-auto pr-1 text-sm">
          {/* Appearance */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Appearance
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  localSettings.theme === 'dark'
                    ? 'bg-neutral-800 border-cyan-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Futuristic Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  localSettings.theme === 'light'
                    ? 'bg-neutral-800 border-cyan-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Refined Light</span>
              </button>
            </div>
          </div>

          {/* Custom System Instruction / Persona */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Custom Instructions
              </label>
              <span className="text-[10px] text-neutral-500">Persistent persona</span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. Always respond with concise bullet points; prioritize TypeScript examples; assume senior engineering background."
              value={localSettings.customSystemPrompt}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, customSystemPrompt: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Speech & Audio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Voice & Audio
            </label>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Speech Synthesis Speed
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {localSettings.speechSpeed}x
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={localSettings.speechSpeed}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    speechSpeed: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Data Management */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Data & Storage
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onExportAllData}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-xs text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Export All Conversations (JSON)</span>
                </div>
                <span className="text-neutral-500">Backup</span>
              </button>

              {confirmClear ? (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
                  <p className="text-xs text-red-300">
                    Are you sure? This will delete all saved chats permanently.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllChats();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-950 hover:bg-red-950/20 border border-neutral-800 text-xs text-red-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Conversations</span>
                  </div>
                  <span className="text-neutral-500 text-[11px]">Destructive</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
