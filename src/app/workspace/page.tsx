// UAFSAIDA — Main Workspace Page
'use client';

import { useState, useCallback, useEffect } from 'react';

// Minimal ChatMessage type
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WorkspacePage() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'chat'>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(currentInput),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  }, [input]);

  const generateResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('ecommerce') || lower.includes('store')) {
      return "I'll build an e-commerce platform for you with product catalog, shopping cart, checkout, and admin dashboard.";
    }
    if (lower.includes('school') || lower.includes('education')) {
      return "I'll create a school management system with student registration, teacher management, attendance, and grades.";
    }
    if (lower.includes('hospital') || lower.includes('health')) {
      return "I'll build a hospital management system with patient registration, appointments, billing, and pharmacy.";
    }
    if (lower.includes('todo') || lower.includes('task')) {
      return "I'll create a todo application with task creation, editing, and tracking features.";
    }
    if (lower.includes('blog')) {
      return "I'll build a blog platform with rich text editor, categories, and comments.";
    }
    return `I understand you want to build: "${prompt}". I'll generate a complete application architecture with frontend, backend, and database. Let me start by creating the project structure...`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>U</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>UAFSAIDA</h1>
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentPage('welcome')}
            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: currentPage === 'welcome' ? '#dbeafe' : 'transparent', color: currentPage === 'welcome' ? '#1d4ed8' : '#64748b', fontSize: 14, cursor: 'pointer' }}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentPage('chat')}
            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: currentPage === 'chat' ? '#dbeafe' : 'transparent', color: currentPage === 'chat' ? '#1d4ed8' : '#64748b', fontSize: 14, cursor: 'pointer' }}
          >
            Workspace
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        {currentPage === 'welcome' ? (
          <WelcomeScreen onStart={() => setCurrentPage('chat')} />
        ) : (
          <ChatInterface
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
            isTyping={isTyping}
          />
        )}
      </main>
    </div>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>✨</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>
        Welcome to <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UAFSAIDA</span>
      </h1>
      <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto 32px' }}>
        Build complete software applications using natural language. Describe what you want — we'll handle everything else.
      </p>
      <button
        onClick={onStart}
        style={{ padding: '16px 32px', borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
      >
        Start Building
      </button>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 48 }}>
        {[
          { icon: '💻', title: 'Code Generation', desc: 'Full-stack apps from prompts' },
          { icon: '🌐', title: 'Web & Mobile', desc: 'Responsive, PWA, native' },
          { icon: '🗄️', title: 'Database Design', desc: 'PostgreSQL with Prisma' },
          { icon: '🔒', title: 'Security First', desc: 'OWASP compliant' },
          { icon: '⚡', title: 'Instant Deploy', desc: 'One-click to production' },
          { icon: '📱', title: 'Cross-Platform', desc: 'Works everywhere' },
        ].map(item => (
          <div key={item.title} style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{item.title}</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatInterface({
  messages,
  input,
  setInput,
  onSend,
  isTyping,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isTyping: boolean;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Messages */}
      <div style={{ minHeight: 400, maxHeight: '60vh', overflowY: 'auto', padding: 24 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>What would you like to build?</h2>
            <p style={{ color: '#64748b' }}>Describe your idea in plain language.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {['E-commerce Store', 'School Management', 'Hospital System', 'Blog Platform', 'Todo App'].map(idea => (
                <button
                  key={idea}
                  onClick={() => setInput(idea)}
                  style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 13, cursor: 'pointer' }}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: msg.role === 'user' ? '#dbeafe' : '#f1f5f9',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <p style={{ fontSize: 14, color: '#1e293b', margin: 0 }}>{msg.content}</p>
              </div>
            ))}
            {isTyping && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f1f5f9', alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>AI is typing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: 16 }}>
        <form
          onSubmit={e => { e.preventDefault(); onSend(); }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: input.trim() ? '#3b82f6' : '#cbd5e1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'not-allowed' }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
