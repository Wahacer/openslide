import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slideId = searchParams.get('slideId');

  const where: { userId: string; slideId?: string } = {
    userId: session.user.id,
  };
  if (slideId) where.slideId = slideId;

  const conversations = await db.conversation.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slideId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
    take: 50,
  });

  return NextResponse.json(conversations);
}
