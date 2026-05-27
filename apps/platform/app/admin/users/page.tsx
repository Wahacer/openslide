'use client';

import { useEffect, useState } from 'react';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: { slides: number; usageLogs: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('q', search);
    fetch(`/api/admin/users?${params}`)
      .then((r) => (r.ok ? r.json() : { users: [], total: 0 }))
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page, search]);

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
      <div className="mt-4">
        <input
          type="text"
          placeholder="搜索邮箱或用户名…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs text-neutral-500">
            <tr>
              <th className="px-3 py-2">邮箱</th>
              <th className="px-3 py-2">用户名</th>
              <th className="px-3 py-2">角色</th>
              <th className="px-3 py-2">演示数</th>
              <th className="px-3 py-2">注册时间</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-400">
                  加载中…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-400">
                  无结果
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-neutral-50">
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.name || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-2">{u._count.slides}</td>
                  <td className="px-3 py-2">{new Date(u.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleRole(u.id, u.role)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {u.role === 'ADMIN' ? '降为用户' : '设为管理员'}
                    </button>
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
            {page} / {totalPages}（共 {total} 人）
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
