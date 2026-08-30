// UAFSAIDA — Preview Panel Component
'use client';

import { useState } from 'react';
import { Project } from '@/types';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Maximize2 } from 'lucide-react';

interface PreviewPanelProps {
  project: Project;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function PreviewPanel({ project }: PreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const deviceWidths: Record<DeviceMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              deviceMode === 'desktop' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              deviceMode === 'tablet' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              deviceMode === 'mobile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div
          className="mx-auto h-full overflow-auto rounded-lg border bg-background shadow-sm transition-all duration-300"
          style={{ maxWidth: deviceWidths[deviceMode] }}
        >
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="h-full w-full"
              title="Preview"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <Monitor className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No Preview Available</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Build your project to see a live preview here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
