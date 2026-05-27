import PptxGenJS from 'pptxgenjs';

export type SlideElement = {
  type: 'text' | 'image' | 'table' | 'shape';
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
  src?: string;
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  bgColor?: string;
  tableData?: string[][];
};

export type SlideData = {
  elements: SlideElement[];
  background?: string;
};

export type ExportOptions = {
  title?: string;
  author?: string;
  slides: SlideData[];
};

export async function generatePptx(options: ExportOptions): Promise<Buffer> {
  const pptx = new PptxGenJS();

  if (options.title) pptx.title = options.title;
  if (options.author) pptx.author = options.author;
  pptx.layout = 'LAYOUT_WIDE';

  for (const slideData of options.slides) {
    const slide = pptx.addSlide();

    if (slideData.background) {
      slide.background = { color: slideData.background.replace('#', '') };
    }

    for (const el of slideData.elements) {
      const pos = { x: el.x, y: el.y, w: el.w, h: el.h };

      switch (el.type) {
        case 'text':
          slide.addText(el.content || '', {
            ...pos,
            fontSize: el.fontSize || 18,
            fontFace: el.fontFace || 'Arial',
            color: el.color?.replace('#', '') || '333333',
            bold: el.bold || false,
            italic: el.italic || false,
            align: el.align || 'left',
            valign: 'top',
          });
          break;

        case 'image':
          if (el.src) {
            slide.addImage({ ...pos, path: el.src });
          }
          break;

        case 'table':
          if (el.tableData) {
            slide.addTable(
              el.tableData.map((row) =>
                row.map((cell) => ({ text: cell, options: { fontSize: 12 } })),
              ),
              { ...pos, border: { type: 'solid', pt: 0.5, color: 'CCCCCC' } },
            );
          }
          break;

        case 'shape':
          slide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
            ...pos,
            fill: { color: el.bgColor?.replace('#', '') || 'F0F0F0' },
          });
          break;
      }
    }
  }

  const output = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(output as ArrayBuffer);
}
