import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkQuota, consumeQuota } from './quota';
import type { QuotaType } from '@prisma/client';

type RouteHandler = (request: Request, context?: unknown) => Promise<NextResponse>;

/**
 * Higher-order function that wraps an API route handler with quota checking.
 * Checks quota before executing the handler, consumes on success.
 *
 * Usage:
 *   export const POST = withQuota('TOKEN', 1, async (request) => { ... });
 */
export function withQuota(
  type: QuotaType,
  amount: number,
  handler: RouteHandler,
  options?: { metaFn?: (request: Request) => Record<string, unknown> },
): RouteHandler {
  return async (request: Request, context?: unknown) => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const check = await checkQuota(session.user.id, type, amount);
    if (!check.allowed) {
      return NextResponse.json(
        {
          error: '额度不足',
          detail: {
            type,
            limit: check.limit.toString(),
            used: check.used.toString(),
            required: amount,
          },
        },
        { status: 429 },
      );
    }

    const response = await handler(request, context);

    // Only consume quota if the handler succeeded (2xx)
    if (response.status >= 200 && response.status < 300) {
      const meta = options?.metaFn?.(request) ?? {};
      await consumeQuota(session.user.id, type, amount, meta);
    }

    return response;
  };
}
