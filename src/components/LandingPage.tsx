import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Code2,
  Cpu,
  Search,
  PenTool,
  Layers,
  Zap,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { ThreeOrb } from './ThreeOrb';
import { AIModel } from '../types';

interface LandingPageProps {
  onStartChat: (initialPrompt?: string) => void;
  models: AIModel[];
  onOpenModelSelector: () => void;
}

const CAPABILITIES = [
  {
    icon: Zap,
    title: 'Instant Streaming Intelligence',
    description: 'Sub-millisecond token streaming powered by the latest Gemini 3.8 Flash neural architecture.',
    badge: 'Real-Time',
  },
  {
    icon: Brain,
    title: 'DeepReason R1 Engine',
    description: 'Methodical first-principles reasoning for complex mathematical, architectural, and algorithmic dilemmas.',
    badge: 'Reasoning',
  },
  {
    icon: Code2,
    title: 'Production Software Architect',
    description: 'End-to-end full-stack code synthesis with type safety, edge-case mitigation, and live snippet preview.',
    badge: 'Engineering',
  },
  {
    icon: Search,
    title: 'Multimodal Document Ingestion',
    description: 'Analyze complex PDFs, research papers, data tables, and high-resolution diagrams in one place.',
    badge: 'Multimodal',
  },
];

const PROMPT_SUGGESTIONS = [
  {
    icon: Code2,
    title: 'System Architecture',
    prompt: 'Design a high-throughput event-driven microservices architecture using Node.js, Kafka, and Redis.',
    category: 'Engineering',
  },
  {
    icon: Brain,
    title: 'Deep Logic & Math',
    prompt: 'Explain the mathematical nuances of Transformer self-attention compared to State Space Models (Mamba).',
    category: 'Reasoning',
  },
  {
    icon: PenTool,
    title: 'Executive Synthesis',
    prompt: 'Draft an executive briefing on the macroeconomic impacts of autonomous enterprise AI agents.',
    category: 'Analysis',
  },
  {
    icon: Search,
    title: 'Algorithm Optimization',
    prompt: 'Implement a concurrent LRU cache with O(1) read/write in TypeScript with full test cases.',
    category: 'Coding',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  models,
  onOpenModelSelector,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 text-neutral-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] bg-blue-600/10 blur-[160px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 mb-8 backdrop-blur-md shadow-lg shadow-black/40">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-white">UPSEEK 2.5 Active</span>
          <span className="text-neutral-500">•</span>
          <span className="text-cyan-400 font-medium">Multi-Model Architecture</span>
        </div>

        {/* Hero Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Think Smarter.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Discover More.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
          The next-generation intelligence platform inspired by the clarity of ChatGPT, the creative power of Gemini, and the thoughtful depth of Claude.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onStartChat()}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-95 group"
          >
            <span>Launch UPSEEK Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={onOpenModelSelector}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 font-medium text-sm transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Explore Models</span>
          </button>
        </div>

        {/* 3D Animated AI Orb Showcase */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center">
          <ThreeOrb mood="hyper" interactive size="lg" onOrbClick={() => onStartChat()} />
          <p className="mt-4 text-xs text-neutral-500 font-medium">
            3D UPSEEK Neural Core • Interactive WebGL Canvas • Click orb or select mood above
          </p>
        </div>
      </section>

      {/* Quick Prompt Cards Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Ready to explore? Choose a direction
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Click any starter prompt to launch real-time intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PROMPT_SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onStartChat(item.prompt)}
                className="group p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-850/90 border border-neutral-800 hover:border-cyan-500/50 cursor-pointer transition-all duration-200 shadow-md hover:shadow-cyan-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-cyan-300 border border-neutral-700/60">
                      {item.category}
                    </span>
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Start Prompt</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24 border-t border-neutral-800/80 pt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered for High-Order Thinking
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
            UPSEEK combines real-time low-latency streaming with multi-provider interoperability and multimodal inputs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase mb-1">
                    {cap.badge}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{cap.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 bg-neutral-950/90 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-neutral-300">UPSEEK AI</span>
            <span>— Think Smarter. Discover More.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 cursor-pointer">Security & Privacy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Model Interoperability</span>
            <span className="hover:text-neutral-300 cursor-pointer">API Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
