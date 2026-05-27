'use client';

import { useCallback, useEffect, useState } from 'react';
import { AssetGrid, type AssetItem } from '@/app/components/asset-grid';
import { UploadZone } from '@/app/components/upload-zone';
import type { UploadResult } from '@/lib/upload';

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    const res = await fetch('/api/assets');
    if (res.ok) {
      setAssets(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleUpload = (result: UploadResult) => {
    setAssets((prev) => [
      {
        ...result,
        slideId: null,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">资产管理</h1>
      <p className="mt-1 text-sm text-neutral-500">管理你上传的图片和文件</p>

      <div className="mt-6">
        <UploadZone onUpload={handleUpload} onError={(msg) => setError(msg)} />
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 underline">
            关闭
          </button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-400">加载中…</div>
        ) : (
          <AssetGrid assets={assets} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
