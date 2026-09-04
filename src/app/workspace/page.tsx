// UAFSAIDA — Main Workspace Page
'use client';

import { useState, useCallback } from 'react';
import { Project, ChatMessage } from '@/types';

export default function WorkspacePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'chat' | 'preview' | 'files' | 'terminal'>('chat');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: '',
      role: 'user',
      agentRole: null,
      content,
      metadata: { artifacts: [], tasks: [], files: [], tokenCount: 0, processingTime: 0 },
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInput('');

    // Trigger AI generation
    // This would call the orchestration engine
  }, [addMessage]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`border-r bg-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-4">
          <h2 className="font-semibold text-gray-700">Projects</h2>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">UAFSAIDA</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePanel('chat')}
              className={`px-3 py-1.5 text-sm rounded-md ${activePanel === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActivePanel('preview')}
              className={`px-3 py-1.5 text-sm rounded-md ${activePanel === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setActivePanel('files')}
              className={`px-3 py-1.5 text-sm rounded-md ${activePanel === 'files' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Files
            </button>
          </div>
        </header>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {currentProject ? (
            <>
              <div className={`flex flex-1 flex-col ${activePanel === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <h2 className="text-2xl font-bold text-gray-700">What would you like to build?</h2>
                      <p className="mt-2 text-gray-500">Describe your idea in plain language.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-lg px-4 py-2 ${
                            message.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-gray-100 mr-auto max-w-[80%]'
                          }`}
                        >
                          {message.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t bg-white p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (input.trim()) handleSendMessage(input.trim());
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe what you want to build..."
                      className="flex-1 rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>

              <div className="w-full border-l md:w-[450px] lg:w-[550px]">
                {activePanel === 'preview' && (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No Preview Available
                  </div>
                )}
                {activePanel === 'files' && (
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-700">Files</h3>
                    <p className="text-sm text-gray-500">No files yet</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8">
              <div className="max-w-2xl text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                  Welcome to <span className="text-blue-600">UAFSAIDA</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Build complete software applications using natural language.
                </p>
                <button
                  onClick={() => {
                    setCurrentProject({
                      id: 'new-project',
                      name: 'My Project',
                      description: '',
                      status: 'draft',
                      complexity: 'moderate',
                      type: 'webapp',
                      userId: 'user-1',
                      prompt: '',
                      requirements: null,
                      architecture: null,
                      techStack: null,
                      memory: { requirements: [], architecture: [], code: [], bugs: [], user: [], decisions: [], lessonsLearned: [] },
                      repoUrl: null,
                      deployUrl: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    });
                  }}
                  className="mt-8 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
                >
                  Start Building
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
