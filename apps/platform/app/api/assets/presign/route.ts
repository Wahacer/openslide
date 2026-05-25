import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getUploadUrl, assetKey } from '@/lib/storage';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { filename, mime, size, slideId, width, height } = body;

  if (!filename || !mime) {
    return NextResponse.json({ error: 'filename 和 mime 为必填项' }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024;
  if (size && size > maxSize) {
    return NextResponse.json({ error: '文件大小不能超过 10MB' }, { status: 400 });
  }

  const key = assetKey(session.user.id, `${Date.now()}-${filename}`);
  const uploadUrl = await getUploadUrl(key, mime);

  const asset = await db.asset.create({
    data: {
      userId: session.user.id,
      slideId: slideId || null,
      filename,
      storageKey: key,
      url: '',
      size: size ?? 0,
      mime,
      width: width ?? null,
      height: height ?? null,
    },
  });

  return NextResponse.json({ uploadUrl, assetId: asset.id, storageKey: key }, { status: 201 });
}
