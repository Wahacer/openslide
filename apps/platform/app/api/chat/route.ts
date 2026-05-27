import { auth } from '@/auth';
import type { ChatMessage } from '@/lib/ai';
import { getAIProvider } from '@/lib/ai';
import { db } from '@/lib/db';
import type { EditOp } from '@/lib/edit-ops';
import { applyEditOps } from '@/lib/edit-ops';
import { checkQuota, consumeQuota } from '@/lib/quota';

const SLIDE_SYSTEM_PROMPT = `You are open-slide's AI editing assistant. You help users create and modify presentation slides written in React JSX/TSX.

When the user asks to modify a slide, respond with a JSON block containing structured edit operations. Format:

\`\`\`editops
{
  "description": "简短描述修改内容",
  "ops": [
    { "type": "set-style", "selector": "css-class-or-id", "property": "css-property", "value": "new-value" },
    { "type": "set-text", "selector": "css-class-or-id", "text": "new text content" },
    { "type": "insert-element", "parentSelector": "parent-class-or-id", "position": "last-child", "jsx": "<div>new element</div>" },
    { "type": "delete-element", "selector": "css-class-or-id" },
    { "type": "replace-source", "source": "complete new source code" }
  ]
}
\`\`\`

Rules for edit operations:
- Use "set-style" for style changes (use CSS property names like "color", "font-size")
- Use "set-text" for text content changes
- Use "insert-element" to add new elements (position: before/after/first-child/last-child)
- Use "delete-element" to remove elements
- Use "replace-source" ONLY when changes are too complex for granular ops
- Selectors match against className, id, or data-id attributes
- Prefer granular ops over replace-source for undo/redo support

When the user asks questions (not modifications), answer conversationally in Chinese without editops blocks.

Slide capabilities:
- Each slide is a React component rendering on a 1920×1080 canvas
- Inline styles use React CSSProperties objects
- Available CSS variables: --osd-bg, --osd-text, --osd-font-heading, --osd-font-body
- Images use <img> tags with imported assets or URLs
- Tables use standard HTML <table> elements
- Layout uses flexbox

Rules:
- Keep responses concise
- Use Chinese for conversational responses`;

function parseEditOpsFromResponse(response: string): { ops: EditOp[]; description: string } | null {
  const match = response.match(/```editops\s*\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.ops && Array.isArray(parsed.ops)) {
      return { ops: parsed.ops as EditOp[], description: parsed.description ?? '' };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id;

  const body = await request.json();
  const { message, conversationId, slideId } = body;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'message 为必填项' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let ai: ReturnType<typeof getAIProvider>;
  try {
    ai = getAIProvider();
  } catch {
    return new Response(JSON.stringify({ error: 'AI 服务未配置' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let conversation = conversationId
    ? await db.conversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    : null;

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        userId,
        slideId: slideId || null,
        title: message.slice(0, 50),
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  let slideContext = '';
  const targetSlideId = slideId || conversation.slideId;
  if (targetSlideId) {
    const slide = await db.slide.findFirst({
      where: { id: targetSlideId, userId },
    });
    if (slide) {
      const src = typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source);
      slideContext = `\n\nCurrent slide source (${slide.slug}):\n\`\`\`tsx\n${src}\n\`\`\``;
    }
  }

  await db.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: message,
    },
  });

  const history: ChatMessage[] = conversation.messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
  history.push({ role: 'user', content: message });

  const systemPrompt = SLIDE_SYSTEM_PROMPT + slideContext;

  const quotaCheck = await checkQuota(userId, 'TOKEN', 1);
  if (!quotaCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Token 配额已用尽' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = '';
      try {
        for await (const chunk of ai.stream(history, { systemPrompt, temperature: 0.5 })) {
          if (chunk.type === 'text') {
            fullResponse += chunk.content;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`,
              ),
            );
          } else if (chunk.type === 'done') {
            const estimatedTokens = Math.ceil((message.length + fullResponse.length) / 4);
            await db.message.create({
              data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: fullResponse,
                tokensUsed: estimatedTokens,
              },
            });
            await consumeQuota(userId, 'TOKEN', estimatedTokens, {
              conversationId: conversation.id,
              model: process.env.AI_MODEL ?? 'unknown',
            });

            const editOps = parseEditOpsFromResponse(fullResponse);
            if (editOps && targetSlideId) {
              const slide = await db.slide.findFirst({
                where: { id: targetSlideId, userId },
              });
              if (slide) {
                const src =
                  typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source);
                const newSource = applyEditOps(src, editOps.ops);
                await db.slide.update({
                  where: { id: targetSlideId },
                  data: { source: newSource },
                });
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'editops', ops: editOps.ops, description: editOps.description, source: newSource })}\n\n`,
                  ),
                );
              }
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'done', conversationId: conversation.id })}\n\n`,
              ),
            );
          } else if (chunk.type === 'error') {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', content: chunk.content })}\n\n`,
              ),
            );
          }
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', content: (e as Error).message })}\n\n`,
          ),
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
