export type ViewState = 'dashboard' | 'agents' | 'workflows' | 'settings';

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: 'idle' | 'running' | 'error';
  uptime: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentName?: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system';
}

export interface AppConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  serverIp: string;
  autoDeploy: boolean;
  maxConcurrentAgents: number;
}
