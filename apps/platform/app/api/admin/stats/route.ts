import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const admin = await db.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, todayActive, tokenUsageMonth, imageGenMonth, totalSlides, totalAssets] =
    await Promise.all([
      db.user.count(),
      db.usageLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: todayStart } },
      }),
      db.usageLog.aggregate({
        where: { type: 'TOKEN', createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.usageLog.aggregate({
        where: { type: 'IMAGE_GEN', createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.slide.count(),
      db.asset.count(),
    ]);

  return NextResponse.json({
    totalUsers,
    todayActive: todayActive.length,
    tokenUsageMonth: (tokenUsageMonth._sum.amount ?? 0n).toString(),
    imageGenMonth: (imageGenMonth._sum.amount ?? 0n).toString(),
    totalSlides,
    totalAssets,
  });
}
