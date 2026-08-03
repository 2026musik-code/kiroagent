import React from 'react';
import {
  Terminal,
  LayoutDashboard,
  Users,
  GitBranch,
  Settings,
  LogOut,
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'agents', label: 'Agents', icon: <Users size={20} /> },
    { id: 'workflows', label: 'Workflows', icon: <GitBranch size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Terminal size={18} />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 tracking-tight">Kiro AI</h1>
          <p className="text-xs text-slate-500 font-mono">CLI Manager v1.0</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
          <LogOut size={20} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
