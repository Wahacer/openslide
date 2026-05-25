import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const assets = await db.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      url: true,
      size: true,
      mime: true,
      width: true,
      height: true,
      slideId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(assets);
}
