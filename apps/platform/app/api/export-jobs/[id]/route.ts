import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  const job = await db.exportJob.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) {
    return Response.json({ error: '未找到该任务' }, { status: 404 });
  }

  return Response.json(job);
}
