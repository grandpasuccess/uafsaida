// UAFSAIDA — Chat Panel Component
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Sparkles } from 'lucide-react';
import { Project, ChatMessage } from '@/types';
import { useProjectStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { ExamplePrompts } from './ExamplePrompts';

interface ChatPanelProps {
  project: Project | null;
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
}

export function ChatPanel({ project, onSendMessage, isGenerating }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = useProjectStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleExampleClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!project || messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">What would you like to build?</h2>
              <p className="mt-2 text-muted-foreground">
                Describe your idea in plain language. I'll handle the rest.
              </p>
            </div>
            <ExamplePrompts onSelect={handleExampleClick} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">AI is working...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe what you want to build..."
              className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              rows={1}
              disabled={isGenerating}
            />
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
