import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-neutral-50 p-4">
        <div className="mb-6 text-lg font-semibold">open-slide</div>
        <nav className="space-y-1 text-sm">
          <a href="/" className="block rounded-md px-3 py-2 hover:bg-neutral-100">工作台</a>
          <a href="/slides" className="block rounded-md px-3 py-2 hover:bg-neutral-100">我的演示</a>
          <a href="/assets" className="block rounded-md px-3 py-2 hover:bg-neutral-100">资产管理</a>
        </nav>
        <div className="mt-auto pt-6 text-xs text-neutral-400">
          {session.user?.email}
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
