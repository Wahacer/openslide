import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAIProvider } from '@/lib/ai';
import { parseComments, stripCommentMarkers } from '@/lib/comments';
import { db } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

const SYSTEM_PROMPT = `You are a slide editing assistant for open-slide, a React-based presentation framework.

You will receive JSX/TSX source code for a slide that contains @slide-comment markers. Each comment is a user instruction describing a change they want applied to the slide.

Your job:
1. Read each comment's "note" field to understand what change is requested
2. Apply ALL requested changes to the source code
3. Return ONLY the modified source code with the comment markers removed
4. Do NOT add explanations, markdown fences, or anything else — just the raw modified source

Rules:
- Preserve the overall structure and imports
- Only modify what the comments ask for
- If a comment asks to change text, change that text
- If a comment asks to change style, modify the inline style object
- If a comment asks to add/remove elements, do so
- Remove all @slide-comment markers from the output
- Keep the code valid TSX/JSX`;

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const slide = await db.slide.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!slide) {
    return NextResponse.json({ error: '未找到' }, { status: 404 });
  }

  const source = typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source);

  const comments = parseComments(source);
  if (comments.length === 0) {
    return NextResponse.json({ error: '没有找到评论标记' }, { status: 400 });
  }

  const commentSummary = comments
    .map((c) => `Line ${c.line}: [${c.id}] ${c.note}${c.hint ? ` (hint: ${c.hint})` : ''}`)
    .join('\n');

  let ai: ReturnType<typeof getAIProvider>;
  try {
    ai = getAIProvider();
  } catch {
    return NextResponse.json(
      { error: 'AI 服务未配置，请设置 AI_API_KEY 环境变量' },
      { status: 503 },
    );
  }

  try {
    const modifiedSource = await ai.chat(
      [
        {
          role: 'user',
          content: `Here is the slide source code with comment markers:\n\n\`\`\`tsx\n${source}\n\`\`\`\n\nComments to apply:\n${commentSummary}\n\nApply all changes and return the modified source code only.`,
        },
      ],
      { systemPrompt: SYSTEM_PROMPT, temperature: 0.3 },
    );

    const cleaned = modifiedSource
      .replace(/^```(?:tsx|jsx|typescript)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    await db.slide.update({
      where: { id },
      data: { source: cleaned },
    });

    return NextResponse.json({
      ok: true,
      appliedComments: comments.map((c) => c.id),
      commentCount: comments.length,
    });
  } catch (e) {
    return NextResponse.json({ error: `AI 处理失败: ${(e as Error).message}` }, { status: 500 });
  }
}
