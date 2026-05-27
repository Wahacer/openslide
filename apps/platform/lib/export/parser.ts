import type { SlideData, SlideElement } from './pptx';

const SLIDE_WIDTH = 13.33;
const SLIDE_HEIGHT = 7.5;

export function parseSlideSource(source: string): SlideData[] {
  const slides: SlideData[] = [];
  const elements: SlideElement[] = [];

  const textMatches = source.matchAll(
    /<(?:h[1-6]|p|span|div)[^>]*>([^<]+)<\/(?:h[1-6]|p|span|div)>/g,
  );

  let yOffset = 0.5;
  for (const match of textMatches) {
    const content = match[1].trim();
    if (!content) continue;

    const isHeading = match[0].startsWith('<h');
    const fontSize = isHeading ? 32 : 18;

    elements.push({
      type: 'text',
      x: 0.5,
      y: yOffset,
      w: SLIDE_WIDTH - 1,
      h: isHeading ? 1.0 : 0.6,
      content,
      fontSize,
      bold: isHeading,
      align: isHeading ? 'center' : 'left',
    });

    yOffset += isHeading ? 1.2 : 0.7;
    if (yOffset > SLIDE_HEIGHT - 1) break;
  }

  const imgMatches = source.matchAll(/src=["']([^"']+)["']/g);
  for (const match of imgMatches) {
    elements.push({
      type: 'image',
      x: 1,
      y: yOffset,
      w: SLIDE_WIDTH - 2,
      h: 4,
      src: match[1],
    });
    yOffset += 4.2;
  }

  let background: string | undefined;
  const bgMatch = source.match(/background(?:Color)?:\s*['"]?(#[0-9a-fA-F]{6})['"]?/);
  if (bgMatch) background = bgMatch[1];

  slides.push({ elements, background });
  return slides;
}
