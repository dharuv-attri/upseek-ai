import React from 'react';
import { X, Check, Brain, Zap, Cpu, Sparkles, Layers, Info } from 'lucide-react';
import { AIModel } from '../types';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: AIModel[];
  activeModelId: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  models,
  activeModelId,
  onSelectModel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select AI Engine</h3>
              <p className="text-xs text-neutral-400">
                Choose the underlying intelligence and reasoning engine for UPSEEK.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Cards List */}
        <div className="my-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {models.map((model) => {
            const isSelected = model.id === activeModelId;
            return (
              <div
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl border mt-0.5 ${
                        model.provider === 'gemini'
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : model.provider === 'anthropic'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {model.id === 'upseek-deepreason' ? (
                        <Brain className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-cyan-200 transition-colors">
                          {model.name}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                            model.isOnline
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {model.tagline}
                      </p>

                      {/* Capabilities pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-300">
                          {model.contextWindow}
                        </span>
                        {model.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded text-[10px] bg-neutral-800/80 text-neutral-400"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      {model.routingNote && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-neutral-400 italic">
                          <Info className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{model.routingNote}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500 text-black'
                          : 'border-neutral-700 bg-neutral-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>UPSEEK Multi-Model Router Active</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
