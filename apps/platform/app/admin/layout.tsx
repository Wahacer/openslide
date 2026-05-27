import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  const role = (session.user as { role?: string })?.role;
  if (role !== 'ADMIN') redirect('/');

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-neutral-900 p-4 text-white">
        <div className="mb-6 text-lg font-semibold">管理后台</div>
        <nav className="space-y-1 text-sm">
          <a href="/admin" className="block rounded-md px-3 py-2 hover:bg-neutral-800">
            概览
          </a>
          <a href="/admin/users" className="block rounded-md px-3 py-2 hover:bg-neutral-800">
            用户管理
          </a>
          <a href="/admin/logs" className="block rounded-md px-3 py-2 hover:bg-neutral-800">
            操作日志
          </a>
          <a href="/admin/billing" className="block rounded-md px-3 py-2 hover:bg-neutral-800">
            计费设置
          </a>
          <a href="/admin/models" className="block rounded-md px-3 py-2 hover:bg-neutral-800">
            模型配置
          </a>
          <a href="/admin/settings" className="block rounded-md px-3 py-2 hover:bg-neutral-800">
            系统设置
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
