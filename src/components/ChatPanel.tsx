// UAFSAIDA — Enhanced Chat Panel with Voice & File Upload
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Sparkles, X, Image, FileText } from 'lucide-react';
import { Project, ChatMessage } from '@/types';
import { useProjectStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useFileUpload } from '@/hooks/useFileUpload';

interface ChatPanelProps {
  project: Project | null;
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
}

export function ChatPanel({ project, onSendMessage, isGenerating }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = useProjectStore();

  const { isListening, transcript, startListening, stopListening, isSupported: voiceSupported } = useVoiceInput({
    onResult: (result) => {
      setInput(prev => prev + result);
    },
  });

  const { files, isDragging, addFiles, removeFile, handleDragOver, handleDragLeave, handleDrop, openFilePicker, formatFileSize } = useFileUpload();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/5">
            <div className="text-center">
              <Paperclip className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-primary">Drop files here</p>
            </div>
          </div>
        )}
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="border-t bg-muted/30 p-2">
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs">{file.name}</span>
                <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                <button onClick={() => removeFile(file.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => setShowUpload(!showUpload)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Text Input */}
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

            {/* Voice Input Button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Upload Panel */}
          {showUpload && (
            <div className="mt-2 rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">Upload Files</h4>
                <button onClick={() => setShowUpload(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div
                onClick={openFilePicker}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Image className="mb-2 h-8 w-8 text-muted-foreground" aria-label="Upload files" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">Images, PDFs, documents up to 5MB</p>
              </div>
              <input
                ref={inputRef => { if (inputRef) inputRef.style.display = 'none'; }}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                }}
                className="hidden"
              />
            </div>
          )}

          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
