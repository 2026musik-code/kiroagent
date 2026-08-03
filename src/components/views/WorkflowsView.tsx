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
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Agent Chat</h2>
          <p className="text-slate-400 mt-1">Multi-agent collaboration interface</p>
        </div>
      </header>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl relative">
        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className={`flex flex-col max-w-[80%] ${log.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-medium text-slate-400">
                  {log.sender === 'user' ? 'You' : log.sender === 'agent' ? log.agentName || 'Agent' : 'System'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className={`px-4 py-2 rounded-2xl text-sm ${
                log.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : log.sender === 'system'
                  ? 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                  : 'bg-emerald-900/30 text-slate-200 border border-emerald-800/50 rounded-bl-none'
              }`}>
                {log.sender === 'agent' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{log.text}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{log.text}</span>
                )}
              </div>
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 text-slate-400 mt-4 text-sm mr-auto bg-slate-800/50 px-4 py-2 rounded-2xl rounded-bl-none border border-slate-700/50 w-fit">
              <Loader2 size={14} className="animate-spin text-emerald-500" />
              <span>Agent is typing...</span>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleStartWorkflow} className="relative flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isRunning}
              placeholder="Ask the agent to perform a task..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-full pl-4 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isRunning || !prompt.trim()}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
