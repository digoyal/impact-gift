export type EventImageCaptionFontFamily = 'system' | 'sans' | 'serif' | 'script';

export interface EventImageCaption {
  text: string;
  xPercent: number;
  yPercent: number;
  widthPercent?: number;
  heightPercent?: number;
  fontFamily: EventImageCaptionFontFamily;
  fontSizePx: number;
}

const FONT_FAMILIES: EventImageCaptionFontFamily[] = ['system', 'sans', 'serif', 'script'];
const DEFAULT_CAPTION_WIDTH_PERCENT = 55;
const DEFAULT_CAPTION_HEIGHT_PERCENT = 22;
const MIN_CAPTION_WIDTH_PERCENT = 20;
const MAX_CAPTION_WIDTH_PERCENT = 95;
const MIN_CAPTION_HEIGHT_PERCENT = 10;
const MAX_CAPTION_HEIGHT_PERCENT = 55;

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}

function clampWidthPercent(n: number): number {
  return Math.min(MAX_CAPTION_WIDTH_PERCENT, Math.max(MIN_CAPTION_WIDTH_PERCENT, n));
}

function clampHeightPercent(n: number): number {
  return Math.min(MAX_CAPTION_HEIGHT_PERCENT, Math.max(MIN_CAPTION_HEIGHT_PERCENT, n));
}

function applyCaptionLayoutDefaults(caption: EventImageCaption): EventImageCaption {
  return {
    ...caption,
    widthPercent: clampWidthPercent(
      typeof caption.widthPercent === 'number' ? caption.widthPercent : DEFAULT_CAPTION_WIDTH_PERCENT
    ),
    heightPercent: clampHeightPercent(
      typeof caption.heightPercent === 'number' ? caption.heightPercent : DEFAULT_CAPTION_HEIGHT_PERCENT
    ),
  };
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

  const xPercent = typeof o.xPercent === 'number' ? clampPercent(o.xPercent) : 50;
  const yPercent = typeof o.yPercent === 'number' ? clampPercent(o.yPercent) : 72;

  return applyCaptionLayoutDefaults({
    text,
    xPercent,
    yPercent,
    widthPercent: typeof o.widthPercent === 'number' ? o.widthPercent : undefined,
    heightPercent: typeof o.heightPercent === 'number' ? o.heightPercent : undefined,
    fontFamily,
    fontSizePx,
  });
}