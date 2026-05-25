import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getQuotaUsage } from '@/lib/quota';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const usage = await getQuotaUsage(session.user.id);

  // Serialize BigInt to string for JSON
  const serialized = usage.map((q) => ({
    type: q.type,
    limit: q.limit.toString(),
    used: q.used.toString(),
    remaining: q.remaining.toString(),
  }));

  return NextResponse.json(serialized);
}
