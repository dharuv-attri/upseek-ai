import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Settings as SettingsIcon,
  Layers,
  ChevronDown,
  Brain,
  Code,
  PenTool,
  Search,
  FileText,
  Compass,
} from 'lucide-react';
import { ModeType, AIModel } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeModel: AIModel;
  onOpenModelSelector: () => void;
  activeMode: ModeType;
  onChangeMode: (mode: ModeType) => void;
  viewMode: 'chat' | 'landing';
  onToggleViewMode: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const MODES: Array<{ id: ModeType; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'general', label: 'General', icon: Compass },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'write', label: 'Write', icon: PenTool },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'summarize', label: 'Summarize', icon: FileText },
];

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeModel,
  onOpenModelSelector,
  activeMode,
  onChangeMode,
  viewMode,
  onToggleViewMode,
  theme,
  onToggleTheme,
  onOpenSettings,
}) => {
  return (
    <header className="h-14 px-3 sm:px-5 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-30 transition-colors">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div
          onClick={onToggleViewMode}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to toggle between 3D Showcase & Chat"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                UPSEEK AI
              </span>
              <span className="hidden md:inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                v2.5
              </span>
            </div>
            <div className="hidden lg:block text-[10px] text-neutral-400 tracking-wide font-medium">
              Think Smarter. Discover More.
            </div>
          </div>
        </div>
      </div>

      {/* Center: Model Selector & Mode Pills */}
      <div className="flex items-center gap-2">
        {/* Model Dropdown Trigger */}
        <button
          type="button"
          onClick={onOpenModelSelector}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 hover:border-cyan-500/50 hover:bg-neutral-850 text-neutral-200 text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span className="max-w-[120px] sm:max-w-none truncate">{activeModel.name}</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {activeModel.badge}
          </span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Specialized Modes Pill Selector */}
        <div className="hidden md:flex items-center p-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeMode(mode.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-neutral-800 text-cyan-300 font-medium shadow-sm border border-neutral-700/60'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: View Mode Toggle, Theme Toggle & Settings */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* 3D Showcase / Chat Studio Toggle */}
        <button
          type="button"
          onClick={onToggleViewMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
            viewMode === 'landing'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
          title={viewMode === 'landing' ? 'Open Chat Studio' : 'Open 3D Showcase & Features'}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {viewMode === 'landing' ? 'Chat Studio' : '3D Showcase'}
          </span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          title="Platform Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
