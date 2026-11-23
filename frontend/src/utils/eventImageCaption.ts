export type EventImageCaptionFontFamily = 'system' | 'sans' | 'serif' | 'script';

export interface EventImageCaption {
  text: string;
  xPercent: number;
  yPercent: number;
  fontFamily: EventImageCaptionFontFamily;
  fontSizePx: number;
}

export const EVENT_IMAGE_CAPTION_FONT_OPTIONS: Array<{
  value: EventImageCaptionFontFamily;
  label: string;
}> = [
  { value: 'sans', label: 'Sans (default)' },
  { value: 'system', label: 'System' },
  { value: 'serif', label: 'Serif' },
  { value: 'script', label: 'Script' },
];

export const EVENT_IMAGE_CAPTION_SIZE_OPTIONS = [16, 20, 24, 28, 32, 40, 48, 56, 64, 72] as const;

export interface EventImageValue {
  url: string;
  publicId: string;
  caption: EventImageCaption | null;
}

export function createEmptyEventImage(): EventImageValue {
  return {
    url: '',
    publicId: '',
    caption: { ...DEFAULT_EVENT_IMAGE_CAPTION },
  };
}

export const DEFAULT_EVENT_IMAGE_CAPTION: EventImageCaption = {
  text: '',
  xPercent: 50,
  yPercent: 72,
  fontFamily: 'sans',
  fontSizePx: 32,
};

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export function parseEventImageCaption(raw: unknown): EventImageCaption | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    try {
      return parseEventImageCaption(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  if (typeof raw !== 'object') return null;

  const o = raw as Record<string, unknown>;
  const text = typeof o.text === 'string' ? o.text : '';
  if (!text.trim()) return null;

  const fontFamily = EVENT_IMAGE_CAPTION_FONT_OPTIONS.some((f) => f.value === o.fontFamily)
    ? (o.fontFamily as EventImageCaptionFontFamily)
    : 'sans';

  const fontSizePx =
    typeof o.fontSizePx === 'number' && o.fontSizePx >= 12 && o.fontSizePx <= 96
      ? Math.round(o.fontSizePx)
      : 32;

  return {
    text,
    xPercent: typeof o.xPercent === 'number' ? clampPercent(o.xPercent) : 50,
    yPercent: typeof o.yPercent === 'number' ? clampPercent(o.yPercent) : 72,
    fontFamily,
    fontSizePx,
  };
}

export function captionForApi(caption: EventImageCaption | null | undefined): EventImageCaption | null {
  if (!caption?.text?.trim()) return null;
  return {
    ...caption,
    text: caption.text.trim(),
    xPercent: clampPercent(caption.xPercent),
    yPercent: clampPercent(caption.yPercent),
  };
}

export function eventImageCaptionFontStack(fontFamily: EventImageCaptionFontFamily): string {
  switch (fontFamily) {
    case 'serif':
      return 'Georgia, "Times New Roman", Times, serif';
    case 'script':
      return '"Brush Script MT", "Segoe Script", "Apple Chancery", cursive';
    case 'system':
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    case 'sans':
    default:
      return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}