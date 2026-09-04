// UAFSAIDA — File Upload Hook
'use client';

import { useState, useCallback, useRef } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string | null;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface UseFileUploadOptions {
  maxSize?: number; // in bytes
  accept?: string[];
  multiple?: boolean;
  onUpload?: (files: UploadedFile[]) => void;
}

export function useFileUpload({
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  multiple = true,
  onUpload,
}: UseFileUploadOptions = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = useCallback((file: File): UploadedFile | null => {
    // Validate size
    if (file.size > maxSize) {
      return null;
    }

    // Validate type
    if (accept.length > 0 && !accept.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type || file.name.endsWith(type);
    })) {
      return null;
    }

    // Generate preview for images
    const isImage = file.type.startsWith('image/');
    const preview = isImage ? URL.createObjectURL(file) : null;

    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview,
      status: 'pending',
      progress: 0,
    };
  }, [maxSize, accept]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const processed: UploadedFile[] = [];
    
    for (const file of Array.from(newFiles)) {
      const uploaded = processFile(file);
      if (uploaded) {
        processed.push(uploaded);
      }
    }

    if (processed.length > 0) {
      setFiles(prev => [...prev, ...processed]);
      if (onUpload) onUpload(processed);
    }
  }, [processFile, onUpload]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  }, [files]);

  const updateFileStatus = useCallback((id: string, status: UploadedFile['status'], progress?: number) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status, progress: progress ?? f.progress } : f
    ));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    files,
    isDragging,
    inputRef,
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFilePicker,
    formatFileSize,
  };
}
