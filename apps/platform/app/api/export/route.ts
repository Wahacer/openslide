import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { generatePptx, parseSlideSource } from '@/lib/export';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { slideId, format } = body;

  if (!slideId) {
    return NextResponse.json({ error: 'slideId 为必填项' }, { status: 400 });
  }

  const slide = await db.slide.findFirst({
    where: { id: slideId, userId: session.user.id },
  });

  if (!slide) {
    return NextResponse.json({ error: '演示不存在' }, { status: 404 });
  }

  const source = typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source);

  if (format === 'pptx') {
    const slides = parseSlideSource(source);
    const buffer = await generatePptx({
      title: slide.title || slide.slug,
      slides,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${slide.slug}.pptx"`,
      },
    });
  }

  if (format === 'html') {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${slide.title || slide.slug}</title>
<style>body{margin:0;font-family:system-ui}
.slide{width:1920px;height:1080px;overflow:hidden;position:relative}</style>
</head><body><div class="slide">${source}</div></body></html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slide.slug}.html"`,
      },
    });
  }

  return NextResponse.json({ error: '不支持的导出格式，可选: pptx, html' }, { status: 400 });
}
