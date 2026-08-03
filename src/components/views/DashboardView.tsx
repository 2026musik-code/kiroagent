import { Server, Cpu, Activity, Clock } from 'lucide-react';

export function DashboardView() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">System Overview</h2>
        <p className="text-slate-400 mt-1">Real-time status of your Kiro AI deployment</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Server Status', value: 'Online', icon: Server, color: 'text-emerald-400' },
          { label: 'CPU Usage', value: '12%', icon: Cpu, color: 'text-blue-400' },
          { label: 'Active Agents', value: '3', icon: Activity, color: 'text-amber-400' },
          { label: 'Uptime', value: '14d 6h', icon: Clock, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-2">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-slate-800/50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-100 mb-4">Recent Deployments</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">LocalHost Web Port {3000 + i}</p>
                    <p className="text-xs text-slate-500">Deployed 2 hours ago</p>
                  </div>
                </div>
                <button className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors">View Logs</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-100 mb-4">CLI Terminal Activity</h3>
          <div className="bg-black/50 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400 h-[220px] overflow-y-auto space-y-2">
            <p><span className="text-emerald-400">kiro@vps:~$</span> systemctl status kiro-agent</p>
            <p className="text-slate-300">● kiro-agent.service - Kiro AI Orchestration Agent</p>
            <p className="text-slate-300">   Loaded: loaded (/etc/systemd/system/kiro-agent.service; enabled)</p>
            <p className="text-slate-300">   Active: <span className="text-emerald-400">active (running)</span> since Sun 2026-08-02 12:00:00 UTC</p>
            <p><span className="text-emerald-400">kiro@vps:~$</span> tail -f /var/log/kiro/deploy.log</p>
            <p className="text-slate-500">[INFO] Received deployment request for 'Research Web App'</p>
            <p className="text-slate-500">[INFO] Provisioning local port 3004...</p>
            <p className="text-emerald-500/80">[SUCCESS] Deployment ready at http://localhost:3004</p>
          </div>
        </div>
      </div>
    </div>
  );
}
