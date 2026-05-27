import { auth } from '@/auth';
import { db } from '@/lib/db';
import { processExportJob } from '@/lib/export-queue';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未登录' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { slideId, format } = body as { slideId: string; format: string };

  if (!slideId || !format) {
    return Response.json({ error: 'slideId 和 format 为必填项' }, { status: 400 });
  }

  if (!['pptx', 'html'].includes(format)) {
    return Response.json({ error: '不支持的导出格式' }, { status: 400 });
  }

  const slide = await db.slide.findFirst({
    where: { id: slideId, userId },
  });

  if (!slide) {
    return Response.json({ error: '未找到该演示' }, { status: 404 });
  }

  const job = await db.exportJob.create({
    data: { userId, slideId, format },
  });

  processExportJob(job.id).catch(() => {});

  return Response.json({ jobId: job.id, status: 'PENDING' });
}

export async function GET(_request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未登录' }, { status: 401 });
  }

  const jobs = await db.exportJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return Response.json(jobs);
}
