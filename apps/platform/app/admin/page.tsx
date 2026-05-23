export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">管理后台</h1>
      <p className="mt-2 text-sm text-neutral-500">系统概览和管理功能</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">总用户数</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">今日活跃</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Token 消耗</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">图片生成</div>
          <div className="mt-1 text-2xl font-semibold">—</div>
        </div>
      </div>
    </div>
  );
}
