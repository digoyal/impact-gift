export type EventImageCaptionFontFamily = 'system' | 'sans' | 'serif' | 'script';

export interface EventImageCaption {
  text: string;
  xPercent: number;
  yPercent: number;
  fontFamily: EventImageCaptionFontFamily;
  fontSizePx: number;
}

const FONT_FAMILIES: EventImageCaptionFontFamily[] = ['system', 'sans', 'serif', 'script'];

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export function normalizeEventImageCaption(raw: unknown): EventImageCaption | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    try {
      return normalizeEventImageCaption(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  if (typeof raw !== 'object') return null;

  const o = raw as Record<string, unknown>;
  const text = typeof o.text === 'string' ? o.text.trim() : '';
  if (!text) return null;

  const fontFamily = FONT_FAMILIES.includes(o.fontFamily as EventImageCaptionFontFamily)
    ? (o.fontFamily as EventImageCaptionFontFamily)
    : 'sans';

  const fontSizePx =
    typeof o.fontSizePx === 'number' && o.fontSizePx >= 12 && o.fontSizePx <= 96
      ? Math.round(o.fontSizePx)
      : 32;

  const xPercent =
    typeof o.xPercent === 'number' ? clampPercent(o.xPercent) : 50;
  const yPercent =
    typeof o.yPercent === 'number' ? clampPercent(o.yPercent) : 72;

  return { text, xPercent, yPercent, fontFamily, fontSizePx };
}