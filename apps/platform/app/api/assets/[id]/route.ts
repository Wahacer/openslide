import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { deleteObject } from '@/lib/storage';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const asset = await db.asset.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!asset) {
    return NextResponse.json({ error: '未找到' }, { status: 404 });
  }

  await deleteObject(asset.storageKey);
  await db.asset.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
