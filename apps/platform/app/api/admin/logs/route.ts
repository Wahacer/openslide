import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const admin = await db.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');
  const pageSize = 30;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (type) where.type = type;

  const [logs, total] = await Promise.all([
    db.usageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.usageLog.count({ where }),
  ]);

  const serialized = logs.map((log) => ({
    ...log,
    amount: log.amount.toString(),
    createdAt: log.createdAt.toISOString(),
  }));

  return NextResponse.json({ logs: serialized, total, page, pageSize });
}
