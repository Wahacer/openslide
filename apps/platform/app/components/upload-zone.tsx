'use client';

import { useCallback, useRef, useState } from 'react';
import { type UploadProgress, type UploadResult, uploadFile, validateFile } from '@/lib/upload';

type UploadZoneProps = {
  slideId?: string;
  onUpload?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  className?: string;
  compact?: boolean;
};

export function UploadZone({ slideId, onUpload, onError, className, compact }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          onError?.(error);
          continue;
        }
        try {
          const result = await uploadFile(file, {
            slideId,
            onProgress: setProgress,
          });
          onUpload?.(result);
        } catch (e) {
          onError?.((e as Error).message);
        }
      }
      setProgress(null);
    },
    [slideId, onUpload, onError],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter(Boolean) as File[];
      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const uploading = progress && progress.phase !== 'done' && progress.phase !== 'error';

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: drag-drop zone needs div for DnD API
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-drop zone needs div for DnD API
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      onClick={() => inputRef.current?.click()}
      className={[
        'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
        'focus-within:ring-2 focus-within:ring-accent/40',
        dragOver ? 'border-accent bg-accent/5' : 'border-neutral-300 hover:border-neutral-400',
        compact ? 'p-4' : 'p-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        className="sr-only"
        aria-label="上传文件"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-1.5 w-48 rounded-full bg-neutral-200 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="text-xs text-neutral-500">
            {progress.phase === 'presign' && '准备上传…'}
            {progress.phase === 'uploading' && '上传中…'}
            {progress.phase === 'confirming' && '处理中…'}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-neutral-500">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
            />
          </svg>
          {!compact && <p className="text-sm">拖拽文件到此处，或点击选择</p>}
          <p className="text-xs text-neutral-400">
            支持 PNG / JPG / WebP / GIF / SVG / PDF，最大 10MB
          </p>
        </div>
      )}
    </div>
  );
}
