import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未登录' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { slideId, source } = body as {
    slideId: string;
    source: string;
  };

  if (!slideId || !source) {
    return Response.json({ error: 'slideId 和 source 为必填项' }, { status: 400 });
  }

  const slide = await db.slide.findFirst({
    where: { id: slideId, userId },
  });

  if (!slide) {
    return Response.json({ error: '未找到该演示' }, { status: 404 });
  }

  await db.slide.update({
    where: { id: slideId },
    data: { source },
  });

  return Response.json({ success: true, source });
}
