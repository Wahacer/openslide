import { db } from '@/lib/db';
import { parseSlideSource } from '@/lib/export/parser';
import { generatePptx } from '@/lib/export/pptx';

function buildHtmlExport(source: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
body { margin: 0; font-family: system-ui, sans-serif; background: #111; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.slide { width: 1920px; height: 1080px; transform: scale(0.5); transform-origin: center; background: white; overflow: hidden; }
</style>
</head>
<body>
<div class="slide">
${source}
</div>
</body>
</html>`;
}

export async function processExportJob(jobId: string): Promise<void> {
  await db.exportJob.update({
    where: { id: jobId },
    data: { status: 'PROCESSING' },
  });

  try {
    const job = await db.exportJob.findUniqueOrThrow({
      where: { id: jobId },
    });

    const slide = await db.slide.findUniqueOrThrow({
      where: { id: job.slideId },
    });

    const source = typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source);

    let fileBuffer: Buffer;

    if (job.format === 'pptx') {
      const slides = parseSlideSource(source);
      fileBuffer = await generatePptx({
        slides,
        title: slide.title ?? slide.slug,
      });
    } else {
      const html = buildHtmlExport(source, slide.title ?? slide.slug);
      fileBuffer = Buffer.from(html, 'utf-8');
    }

    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:application/octet-stream;base64,${base64Data}`;

    await db.exportJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        fileUrl: dataUrl,
        fileSize: fileBuffer.length,
      },
    });
  } catch (e) {
    await db.exportJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: (e as Error).message,
      },
    });
  }
}
