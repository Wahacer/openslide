import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getDownloadUrl } from '@/lib/storage';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { assetId } = body;

  if (!assetId) {
    return NextResponse.json({ error: 'assetId 为必填项' }, { status: 400 });
  }

  const asset = await db.asset.findFirst({
    where: { id: assetId, userId: session.user.id },
  });
  if (!asset) {
    return NextResponse.json({ error: '未找到' }, { status: 404 });
  }

  const url = await getDownloadUrl(asset.storageKey);

  const updated = await db.asset.update({
    where: { id: assetId },
    data: { url },
  });

  return NextResponse.json({
    id: updated.id,
    filename: updated.filename,
    url: updated.url,
    size: updated.size,
    mime: updated.mime,
    width: updated.width,
    height: updated.height,
  });
}
