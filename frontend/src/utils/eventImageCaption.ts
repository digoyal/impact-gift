export type EventImageCaptionFontFamily = 'system' | 'sans' | 'serif' | 'script';

export interface EventImageCaption {
  text: string;
  xPercent: number;
  yPercent: number;
  /** Width of caption box as % of image container (optional for legacy captions). */
  widthPercent?: number;
  /** Height of caption box as % of image container (optional for legacy captions). */
  heightPercent?: number;
  fontFamily: EventImageCaptionFontFamily;
  fontSizePx: number;
}

export const DEFAULT_CAPTION_WIDTH_PERCENT = 55;
export const DEFAULT_CAPTION_HEIGHT_PERCENT = 22;
export const MIN_CAPTION_WIDTH_PERCENT = 20;
export const MAX_CAPTION_WIDTH_PERCENT = 95;
export const MIN_CAPTION_HEIGHT_PERCENT = 10;
export const MAX_CAPTION_HEIGHT_PERCENT = 55;

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
  widthPercent: DEFAULT_CAPTION_WIDTH_PERCENT,
  heightPercent: DEFAULT_CAPTION_HEIGHT_PERCENT,
  fontFamily: 'sans',
  fontSizePx: 32,
};

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}

function clampWidthPercent(n: number): number {
  return Math.min(MAX_CAPTION_WIDTH_PERCENT, Math.max(MIN_CAPTION_WIDTH_PERCENT, n));
}

function clampHeightPercent(n: number): number {
  return Math.min(MAX_CAPTION_HEIGHT_PERCENT, Math.max(MIN_CAPTION_HEIGHT_PERCENT, n));
}

export function applyCaptionLayoutDefaults(caption: EventImageCaption): EventImageCaption {
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

  return applyCaptionLayoutDefaults({
    text,
    xPercent: typeof o.xPercent === 'number' ? clampPercent(o.xPercent) : 50,
    yPercent: typeof o.yPercent === 'number' ? clampPercent(o.yPercent) : 72,
    widthPercent: typeof o.widthPercent === 'number' ? o.widthPercent : undefined,
    heightPercent: typeof o.heightPercent === 'number' ? o.heightPercent : undefined,
    fontFamily,
    fontSizePx,
  });
}

export function captionForApi(caption: EventImageCaption | null | undefined): EventImageCaption | null {
  if (!caption?.text?.trim()) return null;
  const layout = applyCaptionLayoutDefaults(caption);
  return {
    ...layout,
    text: caption.text.trim(),
    xPercent: clampPercent(layout.xPercent),
    yPercent: clampPercent(layout.yPercent),
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