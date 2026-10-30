import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  FolderArchive,
  MoreVertical,
} from 'lucide-react';
import { Conversation, UserProfile } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onExportConversation: (id: string, format: 'md' | 'json') => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onExportConversation,
  isOpen,
  onToggleOpen,
  user,
  onOpenAuth,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Filter conversations
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group conversations by date
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const pinned = filtered.filter((c) => c.isPinned);
  const today = filtered.filter((c) => !c.isPinned && now - c.updatedAt < ONE_DAY);
  const yesterday = filtered.filter(
    (c) => !c.isPinned && now - c.updatedAt >= ONE_DAY && now - c.updatedAt < ONE_DAY * 2
  );
  const previous7Days = filtered.filter(
    (c) => !c.isPinned && now - c.updatedAt >= ONE_DAY * 2 && now - c.updatedAt < ONE_DAY * 7
  );
  const older = filtered.filter((c) => !c.isPinned && now - c.updatedAt >= ONE_DAY * 7);

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const renderConversationItem = (conv: Conversation) => {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;
    const isMenuOpen = menuOpenId === conv.id;

    return (
      <div
        key={conv.id}
        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
          isActive
            ? 'bg-neutral-800/90 text-white font-medium shadow-md border border-cyan-500/30'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
        }`}
        onClick={() => {
          if (!isEditing) onSelectConversation(conv.id);
        }}
      >
        <MessageSquare
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-neutral-400'
          }`}
        />

        {isEditing ? (
          <div className="flex items-center gap-1 flex-1 z-10" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename(conv.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              className="w-full bg-neutral-900 border border-cyan-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => saveRename(conv.id)}
              className="p-1 hover:text-emerald-400"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="p-1 hover:text-red-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="truncate flex-1 text-[13px]">{conv.title}</span>
        )}

        {/* Action icons */}
        {!isEditing && (
          <div
            className={`flex items-center gap-1 shrink-0 ${
              isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onTogglePinConversation(conv.id)}
              className={`p-1 rounded hover:bg-neutral-700/60 ${
                conv.isPinned ? 'text-cyan-400' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={conv.isPinned ? 'Unpin chat' : 'Pin chat'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            {/* Quick dropdown for rename/export/delete */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpenId(isMenuOpen ? null : conv.id)}
                className="p-1 rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-neutral-200"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-neutral-900 border border-neutral-700/80 shadow-2xl py-1 z-50 text-xs backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => startRename(conv)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 text-neutral-300"
                  >
                    <Edit2 className="w-3 h-3 text-cyan-400" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportConversation(conv.id, 'md');
                      setMenuOpenId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 text-neutral-300"
                  >
                    <Download className="w-3 h-3 text-blue-400" />
                    Export (.md)
                  </button>
                  <div className="my-1 border-t border-neutral-800" />
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteConversation(conv.id);
                      setMenuOpenId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleOpen}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-neutral-950/95 lg:bg-neutral-950 border-r border-neutral-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isOpen ? 'lg:w-72' : 'lg:w-0 lg:overflow-hidden lg:border-r-0'}`}
      >
        {/* Top Header / Brand in Sidebar */}
        <div className="p-4 border-b border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                UPSEEK AI
              </div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                Intelligence Core
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-indigo-600/20 hover:from-cyan-500/30 hover:via-blue-600/30 hover:to-indigo-600/30 border border-cyan-500/40 text-cyan-300 font-medium text-sm transition-all duration-200 shadow-sm group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              <span>New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-900 border border-neutral-700 text-neutral-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List Scrollable */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No conversations yet.<br />Start by clicking &quot;New Chat&quot;!
            </div>
          ) : null}

          {/* Pinned Section */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-cyan-400 tracking-wider uppercase">
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">{pinned.map(renderConversationItem)}</div>
            </div>
          )}

          {/* Today Section */}
          {today.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-500 tracking-wider uppercase">
                Today
              </div>
              <div className="space-y-0.5 mt-1">{today.map(renderConversationItem)}</div>
            </div>
          )}

          {/* Yesterday Section */}
          {yesterday.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-500 tracking-wider uppercase">
                Yesterday
              </div>
              <div className="space-y-0.5 mt-1">{yesterday.map(renderConversationItem)}</div>
            </div>
          )}

          {/* Previous 7 Days */}
          {previous7Days.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-500 tracking-wider uppercase">
                Previous 7 Days
              </div>
              <div className="space-y-0.5 mt-1">{previous7Days.map(renderConversationItem)}</div>
            </div>
          )}

          {/* Older */}
          {older.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-500 tracking-wider uppercase">
                Older
              </div>
              <div className="space-y-0.5 mt-1">{older.map(renderConversationItem)}</div>
            </div>
          )}
        </div>

        {/* User Profile & Platform Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/80">
          <div
            onClick={onOpenAuth}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-900 cursor-pointer transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1.5">
                {user.name}
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-medium border border-cyan-500/30">
                  {user.role}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 truncate">{user.email}</div>
            </div>
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
