import { useState } from 'react';
import { ViewState } from '../types';
import { Sidebar } from './Sidebar';
import { DashboardView } from './views/DashboardView';
import { AgentsView } from './views/AgentsView';
import { WorkflowsView } from './views/WorkflowsView';
import { SettingsView } from './views/SettingsView';
import { Bell, Menu, Search } from 'lucide-react';

export function Layout() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'agents':
        return <AgentsView />;
      case 'workflows':
        return <WorkflowsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentView={currentView} onNavigate={(v) => { setCurrentView(v); setSidebarOpen(false); }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-200">
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-100 tracking-tight">Kiro AI</span>
          </div>

          <div className="hidden lg:flex items-center flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search workflows, agents..." 
              className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 border-2 border-slate-800 flex items-center justify-center font-bold text-xs shadow-lg">
              OP
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
