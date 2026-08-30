// UAFSAIDA — Terminal Panel Component
'use client';

import { useState, useRef, useEffect } from 'react';
import { Project } from '@/types';
import { Terminal as TermIcon, X, Plus, Copy, Trash2 } from 'lucide-react';

interface TerminalPanelProps {
  project: Project;
}

interface CommandEntry {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
}

export function TerminalPanel({ project }: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [history]);

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    const output = executeCommand(cmd.trim());
    setHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        command: cmd.trim(),
        output,
        timestamp: new Date(),
      },
    ]);
    setCommandHistory((prev) => [cmd.trim(), ...prev]);
    setInput('');
    setHistoryIndex(-1);
  };

  const executeCommand = (cmd: string): string => {
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        return `Available commands:
  help              - Show this help message
  clear             - Clear terminal
  echo <text>       - Print text
  date              - Show current time
  ls                - List files (simulated)
  pwd               - Show current directory
  whoami            - Show current user
  node -v           - Show Node.js version
  npm <args>        - Run npm commands (simulated)
  git <args>        - Run git commands (simulated)`;

      case 'clear':
        setHistory([]);
        return '';

      case 'echo':
        return args.join(' ');

      case 'date':
        return new Date().toString();

      case 'ls':
        return 'src/\nnode_modules/\npackage.json\ntsconfig.json\nnext.config.js';

      case 'pwd':
        return '/project';

      case 'whoami':
        return 'developer';

      case 'node':
        if (args[0] === '-v') return 'v20.11.0';
        return 'Node.js v20.11.0';

      case 'git':
        if (args[0] === 'status') return 'On branch main\nnothing to commit, working tree clean';
        if (args[0] === 'log') return 'commit abc1234 - Initial commit';
        return `git: ${args[0] || 'command'}`;

      case 'npm':
        if (args[0] === 'run' && args[1] === 'dev') return 'Starting development server on port 3000...\nReady on http://localhost:3000';
        if (args[0] === 'install') return 'added 1 package in 2s';
        return 'npm command executed';

      case 'vercel':
        return 'Vercel CLI 33.0.0\nDeployment ready.';

      case 'exit':
        return 'Use Ctrl+W to close the panel.';

      default:
        return `command not found: ${command}. Type 'help' for available commands.`;
    }
  };

  return (
    <div className="flex h-full flex-col bg-black text-green-400 font-mono text-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-green-900 px-3 py-2">
        <div className="flex items-center gap-2">
          <TermIcon className="h-4 w-4" />
          <span>Terminal</span>
        </div>
        <div className="flex gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded hover:bg-green-900 text-green-400">
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => setHistory([])}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-green-900 text-green-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div ref={terminalRef} className="flex-1 overflow-auto p-3">
        <div className="mb-2 text-green-500">
          Welcome to UAFSAIDA Terminal. Type 'help' for available commands.
        </div>
        {history.map((entry) => (
          <div key={entry.id} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">$</span>
              <span className="text-green-400">{entry.command}</span>
            </div>
            {entry.output && <pre className="mt-1 whitespace-pre-wrap text-green-300">{entry.output}</pre>}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center gap-2">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand(input);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                  const newIndex = historyIndex + 1;
                  setHistoryIndex(newIndex);
                  setInput(commandHistory[newIndex]);
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                  const newIndex = historyIndex - 1;
                  setHistoryIndex(newIndex);
                  setInput(commandHistory[newIndex]);
                } else {
                  setHistoryIndex(-1);
                  setInput('');
                }
              }
            }}
            className="flex-1 bg-transparent text-green-400 outline-none"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
