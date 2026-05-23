import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">工作台</h1>
      <p className="mt-2 text-sm text-neutral-500">
        欢迎回来，{session?.user?.name ?? session?.user?.email}
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">我的演示</div>
          <div className="mt-1 text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">剩余积分</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">本月用量</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
      </div>
    </div>
  );
}
