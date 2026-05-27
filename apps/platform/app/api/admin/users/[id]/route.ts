import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const admin = await db.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { slides: true, usageLogs: true, conversations: true } },
      quotas: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const admin = await db.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role, name } = body;

  const data: { role?: 'USER' | 'ADMIN'; name?: string } = {};
  if (role === 'USER' || role === 'ADMIN') data.role = role;
  if (name !== undefined) data.name = name;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: '无有效更新字段' }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json(updated);
}
