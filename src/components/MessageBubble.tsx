// UAFSAIDA — Message Bubble Component
'use client';

import { ChatMessage, AgentRole } from '@/types';
import { Bot, User, Wrench, Shield, Code, Database } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

const AGENT_ICONS: Record<AgentRole, React.ComponentType<any>> = {
  orchestrator: Bot,
  'product-intelligence': Bot,
  'business-analyst': Bot,
  'solution-architect': Code,
  'frontend-developer': Code,
  'backend-developer': Code,
  'database-engineer': Database,
  'ai-integration': Wrench,
  'mobile-developer': Code,
  'desktop-developer': Code,
  devops: Wrench,
  security: Shield,
  qa: Wrench,
  debugger: Wrench,
  performance: Wrench,
  documentation: Bot,
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAgent = message.role === 'agent';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-muted px-4 py-1 text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : ''}`}>
        {message.agentRole && (
          <span className="mb-1 text-xs font-medium text-muted-foreground">
            {message.agentRole.replace('-', ' ')}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 text-sm ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <span className="mt-1 text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
