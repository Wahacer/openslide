'use client';

import { useState } from 'react';

export type AssetItem = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime: string;
  width: number | null;
  height: number | null;
  slideId: string | null;
  createdAt: string;
};

type AssetGridProps = {
  assets: AssetItem[];
  onDelete?: (id: string) => void;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetGrid({ assets, onDelete }: AssetGridProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(id);
    } finally {
      setDeleting(null);
    }
  }

  if (assets.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-neutral-400">
        暂无资产，上传文件后将在此显示
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <div key={asset.id} className="group relative overflow-hidden rounded-lg border bg-white">
          <div className="aspect-square bg-neutral-50 flex items-center justify-center">
            {asset.mime.startsWith('image/') ? (
              <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-neutral-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-xs">{asset.mime.split('/')[1]?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="p-2">
            <p className="truncate text-xs font-medium">{asset.filename}</p>
            <p className="text-xs text-neutral-400">
              {formatSize(asset.size)}
              {asset.width && asset.height && ` · ${asset.width}×${asset.height}`}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(asset.id);
            }}
            disabled={deleting === asset.id}
            className="absolute top-1.5 right-1.5 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
            aria-label="删除"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
