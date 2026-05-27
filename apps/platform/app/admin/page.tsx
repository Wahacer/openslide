'use client';

import { useEffect, useState } from 'react';

type Stats = {
  totalUsers: number;
  todayActive: number;
  tokenUsageMonth: string;
  imageGenMonth: string;
  totalSlides: number;
  totalAssets: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: '总用户数', value: stats.totalUsers },
        { label: '今日活跃', value: stats.todayActive },
        { label: '本月 Token 消耗', value: Number(stats.tokenUsageMonth).toLocaleString() },
        { label: '本月图片生成', value: stats.imageGenMonth },
        { label: '演示总数', value: stats.totalSlides },
        { label: '资产总数', value: stats.totalAssets },
      ]
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">管理后台</h1>
      <p className="mt-2 text-sm text-neutral-500">系统概览</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards
          ? cards.map((c) => (
              <div key={c.label} className="rounded-lg border p-4">
                <div className="text-sm text-neutral-500">{c.label}</div>
                <div className="mt-1 text-2xl font-semibold">{c.value}</div>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="rounded-lg border p-4">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-100" />
                <div className="mt-2 h-7 w-12 animate-pulse rounded bg-neutral-100" />
              </div>
            ))}
      </div>
    </div>
  );
}
