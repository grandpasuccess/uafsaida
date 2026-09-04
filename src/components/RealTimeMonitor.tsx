// UAFSAIDA — Real-Time Activity Monitor Component
// Shows live agent activity, online users, and collaboration status

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Users, Bot, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Agent, AgentStatus } from '@/types';

interface ActivityEvent {
  id: string;
  type: 'agent_start' | 'agent_complete' | 'agent_error' | 'user_join' | 'user_leave';
  message: string;
  timestamp: Date;
  agentRole?: string;
}

interface RealTimeMonitorProps {
  projectId: string | null;
}

export function RealTimeMonitor({ projectId }: RealTimeMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addActivity = useCallback((event: ActivityEvent) => {
    setActivities((prev) => [event, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!projectId) return;

    // Simulate real-time activity (in production, connect via WebSocket)
    const interval = setInterval(() => {
      const roles = ['Product Intelligence', 'Frontend Developer', 'Backend Developer', 'QA Engineer'];
      const types: ActivityEvent['type'][] = ['agent_start', 'agent_complete'];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];

      if (Math.random() > 0.7) {
        addActivity({
          id: crypto.randomUUID(),
          type: randomType,
          message: `${randomRole} ${randomType === 'agent_start' ? 'started working' : 'completed task'}`,
          timestamp: new Date(),
          agentRole: randomRole.replace(' ', '-').toLowerCase(),
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, addActivity]);

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case 'working': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'agent_start': return <Zap className="h-3 w-3 text-yellow-500" />;
      case 'agent_complete': return <Activity className="h-3 w-3 text-green-500" />;
      case 'agent_error': return <Activity className="h-3 w-3 text-red-500" />;
      case 'user_join': return <Users className="h-3 w-3 text-blue-500" />;
      case 'user_leave': return <Users className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="border-t bg-card">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span>Activity Monitor</span>
          <span className="flex h-2 w-2">
            <span className={`absolute inline-flex h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground'} opacity-75`} />
            {isConnected && (
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-500 animate-ping" />
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {onlineUsers}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-48 overflow-y-auto px-4 py-2">
          {/* Agents */}
          {agents.length > 0 && (
            <div className="mb-3">
              <h4 className="mb-1 text-xs font-medium text-muted-foreground">Agents</h4>
              <div className="space-y-1">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2 text-xs">
                    <Bot className={`h-3 w-3 ${getStatusColor(agent.status)}`} />
                    <span>{agent.name}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className={getStatusColor(agent.status)}>{agent.status}</span>
                    {agent.progress > 0 && (
                      <span className="text-muted-foreground">({agent.progress}%)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          {activities.length > 0 ? (
            <div className="space-y-1">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 text-xs">
                  {getActivityIcon(activity.type)}
                  <span className="flex-1 text-foreground">{activity.message}</span>
                  <span className="text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No activity yet</p>
          )}
        </div>
      )}
    </div>
  );
}
