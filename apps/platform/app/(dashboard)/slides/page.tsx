'use client';

import { useEffect, useState } from 'react';

type SlideItem = {
  id: string;
  slug: string;
  title: string | null;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SlidesPage() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/slides')
      .then((res) => res.json())
      .then(setSlides)
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这个演示？')) return;
    const res = await fetch(`/api/slides/${id}`, { method: 'DELETE' });
    if (res.ok) setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">我的演示</h1>
          <p className="mt-1 text-sm text-neutral-500">管理你创建的所有 slide deck</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 py-12 text-center text-sm text-neutral-400">加载中…</div>
      ) : slides.length === 0 ? (
        <div className="mt-8 py-12 text-center text-sm text-neutral-400">
          暂无演示，创建你的第一个 slide deck
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium">{slide.title || slide.slug}</p>
                <p className="text-xs text-neutral-400">
                  /{slide.slug} · 更新于 {formatDate(slide.updatedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(slide.id)}
                className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-red-50 hover:text-red-600"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
