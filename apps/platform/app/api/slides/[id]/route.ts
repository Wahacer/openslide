import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const slide = await db.slide.findFirst({
    where: { id, userId: session.user.id },
    include: { assets: true },
  });

  if (!slide) {
    return NextResponse.json({ error: '未找到' }, { status: 404 });
  }

  return NextResponse.json(slide);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.slide.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: '未找到' }, { status: 404 });
  }

  const body = await request.json();
  const { title, source, folderId } = body;

  const slide = await db.slide.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(source !== undefined && { source }),
      ...(folderId !== undefined && { folderId }),
    },
  });

  return NextResponse.json(slide);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.slide.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: '未找到' }, { status: 404 });
  }

  await db.slide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
