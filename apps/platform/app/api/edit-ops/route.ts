import { auth } from '@/auth';
import { db } from '@/lib/db';
import type { EditOp } from '@/lib/edit-ops';
import { applyEditOps, createEditOperation } from '@/lib/edit-ops';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: '未登录' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { slideId, ops, description } = body as {
    slideId: string;
    ops: EditOp[];
    description: string;
  };

  if (!slideId || !ops?.length) {
    return Response.json({ error: 'slideId 和 ops 为必填项' }, { status: 400 });
  }

  const slide = await db.slide.findFirst({
    where: { id: slideId, userId },
  });

  if (!slide) {
    return Response.json({ error: '未找到该演示' }, { status: 404 });
  }

  const sourceBefore =
    typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source);

  const sourceAfter = applyEditOps(sourceBefore, ops);

  const operation = createEditOperation(ops, description, sourceBefore, sourceAfter);

  await db.slide.update({
    where: { id: slideId },
    data: { source: sourceAfter },
  });

  return Response.json({
    operation,
    source: sourceAfter,
  });
}
