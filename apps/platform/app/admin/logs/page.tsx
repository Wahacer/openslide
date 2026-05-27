'use client';

import { useEffect, useState } from 'react';

type LogEntry = {
  id: string;
  userId: string;
  type: string;
  amount: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
  user: { email: string; name: string | null };
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 30;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (typeFilter) params.set('type', typeFilter);
    fetch(`/api/admin/logs?${params}`)
      .then((r) => (r.ok ? r.json() : { logs: [], total: 0 }))
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page, typeFilter]);

  const totalPages = Math.ceil(total / pageSize);
  const types = ['TOKEN', 'IMAGE_GEN', 'CREDIT', 'SLIDE_COUNT', 'STORAGE_BYTES'];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">操作日志</h1>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTypeFilter('');
            setPage(1);
          }}
          className={`rounded px-2 py-1 text-xs ${!typeFilter ? 'bg-neutral-800 text-white' : 'bg-neutral-100'}`}
        >
          全部
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTypeFilter(t);
              setPage(1);
            }}
            className={`rounded px-2 py-1 text-xs ${typeFilter === t ? 'bg-neutral-800 text-white' : 'bg-neutral-100'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs text-neutral-500">
            <tr>
              <th className="px-3 py-2">时间</th>
              <th className="px-3 py-2">用户</th>
              <th className="px-3 py-2">类型</th>
              <th className="px-3 py-2">数量</th>
              <th className="px-3 py-2">元数据</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-400">
                  加载中…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-400">
                  暂无记录
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-neutral-50">
                  <td className="px-3 py-2 text-xs">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-3 py-2">{log.user.email}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{log.type}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{log.amount}</td>
                  <td className="max-w-48 truncate px-3 py-2 text-xs text-neutral-400">
                    {log.meta ? JSON.stringify(log.meta) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-neutral-500">
            {page} / {totalPages}（共 {total} 条）
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
