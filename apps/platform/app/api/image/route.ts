import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getImageProvider } from '@/lib/ai';
import { db } from '@/lib/db';
import { checkQuota, consumeQuota } from '@/lib/quota';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { prompt, slideId, size, quality } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'prompt 为必填项' }, { status: 400 });
  }

  const quotaCheck = await checkQuota(userId, 'IMAGE_GEN', 1);
  if (!quotaCheck.allowed) {
    return NextResponse.json({ error: '图片生成配额已用尽' }, { status: 429 });
  }

  let provider: ReturnType<typeof getImageProvider> | undefined;
  try {
    provider = getImageProvider();
  } catch {
    return NextResponse.json({ error: '图片生成服务未配置' }, { status: 503 });
  }

  const result = await provider.generate(prompt, { size, quality });

  await consumeQuota(userId, 'IMAGE_GEN', 1, {
    prompt,
    model: process.env.IMAGE_MODEL || 'gpt-image-1',
  });

  if (slideId) {
    await db.asset.create({
      data: {
        userId,
        slideId,
        filename: `generated-${Date.now()}.png`,
        storageKey: `generated/${userId}/${Date.now()}.png`,
        url: result.url,
        size: 0,
        mime: 'image/png',
      },
    });
  }

  return NextResponse.json(result);
}
