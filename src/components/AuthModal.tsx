import React, { useState } from 'react';
import { X, User, Check, Zap, Shield, Mail, LogOut, Plus } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr_premium_01',
    name: 'Alex Carter',
    email: 'alex.carter@upseek.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Pro Member',
    tokenUsage: 142850,
    createdAt: '2026-01-15',
  },
  {
    id: 'usr_research_02',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@quantum.org',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Research Fellow',
    tokenUsage: 389200,
    createdAt: '2025-11-20',
  },
  {
    id: 'usr_architect_03',
    name: 'Marcus Vance',
    email: 'marcus.v@cloudscale.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Staff Architect',
    tokenUsage: 512400,
    createdAt: '2025-08-10',
  },
  {
    id: 'usr_guest_04',
    name: 'Anonymous Guest',
    email: 'guest@upseek.ai',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    role: 'Standard',
    tokenUsage: 12400,
    createdAt: '2026-10-01',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [tab, setTab] = useState<'profile' | 'switch' | 'create'>('profile');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (!isOpen) return null;

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      email: newEmail.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Pro Member',
      tokenUsage: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSelectUser(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-750 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">UPSEEK Account</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 my-4 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'profile' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Current Profile
          </button>
          <button
            type="button"
            onClick={() => setTab('switch')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'switch' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Switch Account
          </button>
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              tab === 'create' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            New User
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-850/60 border border-neutral-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base truncate">{currentUser.name}</h4>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{currentUser.email}</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Member since {currentUser.createdAt}
                </p>
              </div>
            </div>

            {/* Usage Stats Card */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Monthly Intelligence Quota
                </span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {currentUser.tokenUsage.toLocaleString()} / 1,000,000
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                  style={{
                    width: `${Math.min(100, (currentUser.tokenUsage / 1000000) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Enterprise Data Isolation Active
                </span>
                <span>Pro Tier</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Switch Account */}
        {tab === 'switch' && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {PRESET_ACCOUNTS.map((acc) => {
              const isSelected = acc.id === currentUser.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    onSelectUser(acc);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800/90 border-cyan-500'
                      : 'bg-neutral-850/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{acc.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                          {acc.role}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">{acc.email}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Create Profile */}
        {tab === 'create' && (
          <form onSubmit={handleCreateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jordan Lee"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="jordan@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              Sign In to Profile
            </button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-neutral-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
