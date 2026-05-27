import type { Prisma, QuotaType } from '@prisma/client';
import { db } from './db';

export type QuotaCheckResult =
  | { allowed: true; remaining: bigint }
  | { allowed: false; limit: bigint; used: bigint };

/**
 * Check if user has enough quota for the requested amount.
 * Returns { allowed: true } if quota is unlimited (-1) or sufficient.
 */
export async function checkQuota(
  userId: string,
  type: QuotaType,
  amount: number,
): Promise<QuotaCheckResult> {
  const quota = await db.quota.findUnique({
    where: { userId_type: { userId, type } },
  });

  // No quota record = unlimited (new users before admin sets limits)
  if (!quota) return { allowed: true, remaining: BigInt(-1) };

  // limit = -1 means unlimited
  if (quota.limit === BigInt(-1)) return { allowed: true, remaining: BigInt(-1) };

  const remaining = quota.limit - quota.used;
  if (remaining >= BigInt(amount)) {
    return { allowed: true, remaining };
  }

  return { allowed: false, limit: quota.limit, used: quota.used };
}

/**
 * Atomically consume quota and write a usage log entry.
 * Throws if quota is insufficient — always call checkQuota first,
 * or catch the error.
 */
export async function consumeQuota(
  userId: string,
  type: QuotaType,
  amount: number,
  meta?: Record<string, unknown>,
): Promise<void> {
  await db.$transaction(async (tx) => {
    const quota = await tx.quota.findUnique({
      where: { userId_type: { userId, type } },
    });

    // No quota record or unlimited = allow without tracking limit
    if (quota && quota.limit !== BigInt(-1)) {
      const remaining = quota.limit - quota.used;
      if (remaining < BigInt(amount)) {
        throw new Error(`Quota exceeded for ${type}`);
      }
      await tx.quota.update({
        where: { userId_type: { userId, type } },
        data: { used: { increment: amount } },
      });
    } else if (quota) {
      // Unlimited but still track usage
      await tx.quota.update({
        where: { userId_type: { userId, type } },
        data: { used: { increment: amount } },
      });
    }

    await tx.usageLog.create({
      data: {
        userId,
        type,
        amount: BigInt(amount),
        meta: (meta as Prisma.InputJsonValue) ?? undefined,
      },
    });
  });
}

/**
 * Get all quota summaries for a user.
 */
export async function getQuotaUsage(userId: string) {
  const quotas = await db.quota.findMany({ where: { userId } });
  return quotas.map((q) => ({
    type: q.type,
    limit: q.limit,
    used: q.used,
    remaining: q.limit === BigInt(-1) ? BigInt(-1) : q.limit - q.used,
  }));
}

/**
 * Reset a user's quota usage to 0 (monthly reset).
 */
export async function resetQuota(userId: string, type: QuotaType): Promise<void> {
  await db.quota.updateMany({
    where: { userId, type },
    data: { used: 0, resetAt: new Date() },
  });
}

/**
 * Admin: set quota limit for a user. Creates the record if it doesn't exist.
 */
export async function setQuotaLimit(userId: string, type: QuotaType, limit: bigint): Promise<void> {
  await db.quota.upsert({
    where: { userId_type: { userId, type } },
    update: { limit },
    create: { userId, type, limit, used: BigInt(0) },
  });
}
