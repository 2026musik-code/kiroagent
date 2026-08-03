import { useState, useEffect } from 'react';
import { Save, Key, Network, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../../types';

export function SettingsView() {
  const [config, setConfig] = useState<AppConfig>({
    apiKey: '',
    baseUrl: 'https://autoapp.biz.id/v1',
    model: 'kiro/qwen3-coder-next',
    serverIp: '127.0.0.1',
    autoDeploy: true,
    maxConcurrentAgents: 5
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('kiro_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse config');
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('kiro_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Configuration</h2>
        <p className="text-slate-400 mt-1">Manage API keys and local deployment settings</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        
        {/* API Settings */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <Key size={20} />
            <h3 className="font-semibold text-slate-200">API Authentication</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">OpenAI Compatible API Key</label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">API Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Model Name</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="gpt-4o"
                  className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Network & Deploy Settings */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <Network size={20} />
            <h3 className="font-semibold text-slate-200">VPS / Deployment Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Host IP Binding</label>
              <input
                type="text"
                value={config.serverIp}
                onChange={(e) => setConfig({ ...config, serverIp: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Max Concurrent Agents</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxConcurrentAgents}
                onChange={(e) => setConfig({ ...config, maxConcurrentAgents: parseInt(e.target.value) })}
                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="autoDeploy"
                checked={config.autoDeploy}
                onChange={(e) => setConfig({ ...config, autoDeploy: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-[#0a0a0a] text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900"
              />
              <label htmlFor="autoDeploy" className="text-sm text-slate-300">
                Auto-deploy web apps to localhost upon workflow completion
              </label>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end items-center gap-4">
          {saved && (
            <span className="flex items-center gap-2 text-sm text-emerald-400 font-medium animate-pulse">
              <ShieldCheck size={16} /> Saved Successfully
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Save size={18} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
