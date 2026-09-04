// UAFSAIDA — Main Workspace Page
'use client';

import { useState, useCallback } from 'react';
import { useProjectStore } from '@/lib/store';
import { ChatPanel } from '@/components/ChatPanel';
import { WorkspacePanel } from '@/components/WorkspacePanel';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { RealTimeMonitor } from '@/components/RealTimeMonitor';
import { Project, ChatMessage } from '@/types';

export default function WorkspacePage() {
  const { currentProject, addMessage, isGenerating } = useProjectStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'chat' | 'preview' | 'files' | 'terminal'>('chat');

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

    // Trigger AI generation
    // This would call the orchestration engine
  }, [addMessage]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <div className="flex flex-1 overflow-hidden">
          {currentProject ? (
            <>
              {/* Chat / Main Panel */}
              <div className={`flex flex-1 flex-col ${activePanel === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                <ChatPanel
                  project={currentProject}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                />
                {/* Real-time activity monitor */}
                <RealTimeMonitor projectId={currentProject.id} />
              </div>

              {/* Workspace Panel (Preview, Files, Terminal) */}
              <div className={`w-full border-l md:w-[450px] lg:w-[550px] ${activePanel !== 'chat' ? 'flex' : 'hidden md:flex'}`}>
                <WorkspacePanel
                  project={currentProject}
                  activePanel={activePanel}
                />
              </div>
            </>
          ) : (
            <WelcomeScreen onNewProject={() => setActivePanel('chat')} />
          )}
        </div>
      </div>
    </div>
  );
}
