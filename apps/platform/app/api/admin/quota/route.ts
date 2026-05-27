import type { QuotaType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { resetQuota, setQuotaLimit } from '@/lib/quota';

const VALID_TYPES: QuotaType[] = ['TOKEN', 'IMAGE_GEN', 'CREDIT', 'SLIDE_COUNT', 'STORAGE_BYTES'];

/**
 * Admin: set or reset quota for a user.
 * PATCH /api/admin/quota
 * Body: { userId, type, limit } — set limit
 * Body: { userId, type, action: "reset" } — reset used to 0
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // Check admin role
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, type, limit, action } = body;

  if (!userId || !type) {
    return NextResponse.json({ error: 'userId 和 type 为必填项' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: '无效的 QuotaType' }, { status: 400 });
  }

  // Verify target user exists
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  if (action === 'reset') {
    await resetQuota(userId, type);
    return NextResponse.json({ ok: true, action: 'reset' });
  }

  if (limit === undefined || limit === null) {
    return NextResponse.json({ error: 'limit 为必填项（-1 表示无限）' }, { status: 400 });
  }

  await setQuotaLimit(userId, type, BigInt(limit));
  return NextResponse.json({ ok: true, type, limit: limit.toString() });
}
