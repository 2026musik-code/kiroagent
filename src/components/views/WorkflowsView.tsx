import React, { useState, useRef, useEffect } from 'react';
import { Send, TerminalSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LogMessage {
  id: string;
  sender: 'system' | 'user' | 'agent';
  agentName?: string;
  text: string;
  timestamp: Date;
}

export function WorkflowsView() {
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([
    { id: '1', sender: 'system', text: 'Kiro Multi-Agent Workflow Engine initialized.', timestamp: new Date() },
    { id: '2', sender: 'system', text: 'Awaiting tasks for deployment...', timestamp: new Date() }
  ]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStartWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;

    const userPrompt = prompt;
    setLogs(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: userPrompt, timestamp: new Date() }
    ]);
    setPrompt('');
    setIsRunning(true);

    const savedConfig = localStorage.getItem('kiro_config');
    let apiKey = '';
    let baseUrl = '';
    let model = '';
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        apiKey = parsed.apiKey;
        baseUrl = parsed.baseUrl;
        model = parsed.model;
      } catch (e) {}
    }

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, apiKey, baseUrl, model })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'log') {
                setLogs(prev => [...prev, {
                  id: Date.now().toString() + Math.random(),
                  sender: data.sender,
                  agentName: data.agentName,
                  text: data.message,
                  timestamp: new Date()
                }]);
              } else if (data.type === 'done' || data.type === 'error') {
                setIsRunning(false);
              }
            } catch (err) {
              console.error('Failed to parse SSE data', dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'system',
        text: `Error connecting to backend: ${err.message}`,
        timestamp: new Date()
      }]);
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Workflow Orchestrator</h2>
          <p className="text-slate-400 mt-1">Multi-agent collaboration terminal</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium text-slate-400">
          <TerminalSquare size={14} />
          tty1
        </div>
      </header>

      <div className="flex-1 bg-[#0a0a0a] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Terminal Header */}
        <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-slate-500 font-mono ml-4">root@kiro-vps:~#</span>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-slate-600 shrink-0">
                [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              
              {log.sender === 'system' && (
                <span className="text-slate-400">{log.text}</span>
              )}
              
              {log.sender === 'user' && (
                <div className="text-slate-200">
                  <span className="text-blue-400 mr-2">➜</span>
                  {log.text}
                </div>
              )}
              
              {log.sender === 'agent' && (
                <div className="text-slate-300 flex flex-col w-full">
                  <span className="text-emerald-400 mb-0.5">[{log.agentName}]</span>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{log.text}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 text-emerald-500 mt-4">
              <Loader2 size={14} className="animate-spin" />
              <span>Agents are processing...</span>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Terminal Input */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleStartWorkflow} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 font-mono font-bold">
              $
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isRunning}
              placeholder="e.g. Deploy a new python backend on port 8080..."
              className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg pl-8 pr-12 py-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={isRunning || !prompt.trim()}
              className="absolute inset-y-0 right-2 flex items-center justify-center text-slate-500 hover:text-emerald-400 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
