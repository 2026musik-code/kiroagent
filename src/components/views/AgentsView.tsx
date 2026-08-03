import { Bot, Plus, MoreVertical, Play, Square, Settings2 } from 'lucide-react';
import { Agent } from '../../types';
import { useState } from 'react';

const MOCK_AGENTS: Agent[] = [
  { id: '1', name: 'Researcher Alpha', role: 'Data Gatherer', model: 'gemini-3.1-pro', status: 'running', uptime: '4h 12m' },
  { id: '2', name: 'Coder Beta', role: 'Full-stack Dev', model: 'gemini-3.1-pro', status: 'idle', uptime: '-' },
  { id: '3', name: 'DevOps Gamma', role: 'Deployment', model: 'gemini-3.1-flash', status: 'running', uptime: '12d 5h' },
];

export function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">AI Agents</h2>
          <p className="text-slate-400 mt-1">Manage and monitor your autonomous workers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition-colors">
          <Plus size={18} />
          Spawn Agent
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${agent.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{agent.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{agent.id.padStart(4, '0')}</p>
                </div>
              </div>
              <button className="text-slate-500 hover:text-slate-300">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Role</span>
                <span className="text-slate-300">{agent.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Model</span>
                <span className="text-slate-300">{agent.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
                  <span className={`capitalize ${agent.status === 'running' ? 'text-emerald-400' : 'text-slate-400'}`}>{agent.status}</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-800 pt-4">
              {agent.status === 'running' ? (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-sm font-medium transition-colors">
                  <Square size={16} /> Stop
                </button>
              ) : (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm font-medium transition-colors">
                  <Play size={16} /> Start
                </button>
              )}
              <button className="p-2 bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
                <Settings2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
