import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const slides = await db.slide.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      folderId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(slides);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { slug, title, source, folderId } = body;

  if (!slug) {
    return NextResponse.json({ error: 'slug 为必填项' }, { status: 400 });
  }

  const existing = await db.slide.findUnique({
    where: { userId_slug: { userId: session.user.id, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: '该 slug 已存在' }, { status: 409 });
  }

  const slide = await db.slide.create({
    data: {
      slug,
      title: title || null,
      source: source ?? {},
      folderId: folderId || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(slide, { status: 201 });
}
