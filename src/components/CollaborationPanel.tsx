// UAFSAIDA — Collaboration Panel Component
'use client';

import { useState } from 'react';
import { Share2, Users, Copy, Check, Globe, Lock, X, Mail } from 'lucide-react';
import { usePresenceStore } from '@/lib/presence';

interface CollaborationPanelProps {
  projectId: string | null;
  projectName: string;
}

export function CollaborationPanel({ projectId, projectName }: CollaborationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const { users, currentUser } = usePresenceStore();

  const onlineUsers = Array.from(users.values());

  const handleShare = async (makePublic: boolean) => {
    if (!projectId) return;
    
    const response = await fetch(`/api/projects/${projectId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: makePublic }),
    });
    
    const data = await response.json();
    if (data.success) {
      setIsPublic(makePublic);
      setShareUrl(data.shareUrl);
    }
  };

  const handleInvite = async () => {
    if (!projectId || !inviteEmail) return;
    
    await fetch(`/api/projects/${projectId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: [inviteEmail] }),
    });
    
    setInviteEmail('');
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Share project"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {/* Collaboration Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-card p-4 shadow-lg">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Collaborate</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Online Users */}
          <div className="mb-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              Online ({onlineUsers.length + 1})
            </h4>
            <div className="space-y-2">
              {/* Current user */}
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs">{currentUser.name} (you)</span>
                </div>
              )}
              {/* Other users */}
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share Settings */}
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">Share Settings</h4>
            
            <div className="space-y-2">
              <button
                onClick={() => handleShare(!isPublic)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  isPublic ? 'border-green-500 bg-green-500/10 text-green-500' : 'hover:bg-muted'
                }`}
              >
                {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isPublic ? 'Public - Anyone with link can view' : 'Private - Only invited users'}
              </button>

              {shareUrl && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-xs"
                  />
                  <button
                    onClick={copyShareUrl}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Invite Users */}
          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">Invite by Email</h4>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-xs outline-none"
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail}
                className="flex h-9 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Mail className="h-3 w-3" />
                Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
