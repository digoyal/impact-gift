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
  /** Text color as `#RRGGBB` (optional for legacy captions). */
  color?: string;
  bold?: boolean;
  italic?: boolean;
  /** When false, caption is stored but not shown on the public page or in the edit overlay. */
  enabled?: boolean;
}

export const DEFAULT_CAPTION_COLOR = '#ffffff';

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
  fontSizePx: 20,
  color: DEFAULT_CAPTION_COLOR,
  bold: false,
  italic: false,
  enabled: false,
};

/** Legacy captions without `enabled`: on when text is non-empty, otherwise off. */
export function resolveCaptionEnabled(caption: Pick<EventImageCaption, 'enabled' | 'text'>): boolean {
  if (typeof caption.enabled === 'boolean') return caption.enabled;
  return Boolean(caption.text?.trim());
}

export function isCaptionDisplayed(caption: EventImageCaption | null | undefined): boolean {
  if (!caption) return false;
  const c = applyCaptionDefaults(caption);
  return resolveCaptionEnabled(c) && Boolean(c.text.trim());
}

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}

function clampWidthPercent(n: number): number {
  return Math.min(MAX_CAPTION_WIDTH_PERCENT, Math.max(MIN_CAPTION_WIDTH_PERCENT, n));
}

function clampHeightPercent(n: number): number {
  return Math.min(MAX_CAPTION_HEIGHT_PERCENT, Math.max(MIN_CAPTION_HEIGHT_PERCENT, n));
}

export function normalizeCaptionColor(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_CAPTION_COLOR;
  const trimmed = raw.trim();
  const match = trimmed.match(/^#([0-9A-Fa-f]{6})$/);
  return match ? `#${match[1].toLowerCase()}` : DEFAULT_CAPTION_COLOR;
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

export function applyCaptionDefaults(caption: EventImageCaption): EventImageCaption {
  const withLayout = applyCaptionLayoutDefaults(caption);
  return {
    ...withLayout,
    color: normalizeCaptionColor(caption.color),
    bold: Boolean(caption.bold),
    italic: Boolean(caption.italic),
    enabled: resolveCaptionEnabled(caption),
  };
}

export function eventImageCaptionTextStyle(caption: EventImageCaption): {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  color: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
} {
  const c = applyCaptionDefaults(caption);
  return {
    fontFamily: eventImageCaptionFontStack(c.fontFamily),
    fontSize: `${c.fontSizePx}px`,
    lineHeight: 1.25,
    color: c.color!,
    fontWeight: c.bold ? 700 : 400,
    fontStyle: c.italic ? 'italic' : 'normal',
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
  const hasEnabledFlag = typeof o.enabled === 'boolean';
  if (!text.trim() && !hasEnabledFlag) return null;

  const fontFamily = EVENT_IMAGE_CAPTION_FONT_OPTIONS.some((f) => f.value === o.fontFamily)
    ? (o.fontFamily as EventImageCaptionFontFamily)
    : 'sans';

  const fontSizePx =
    typeof o.fontSizePx === 'number' && o.fontSizePx >= 12 && o.fontSizePx <= 96
      ? Math.round(o.fontSizePx)
      : 20;

  return applyCaptionDefaults({
    text,
    xPercent: typeof o.xPercent === 'number' ? clampPercent(o.xPercent) : 50,
    yPercent: typeof o.yPercent === 'number' ? clampPercent(o.yPercent) : 72,
    widthPercent: typeof o.widthPercent === 'number' ? o.widthPercent : undefined,
    heightPercent: typeof o.heightPercent === 'number' ? o.heightPercent : undefined,
    fontFamily,
    fontSizePx,
    color: typeof o.color === 'string' ? o.color : undefined,
    bold: o.bold === true,
    italic: o.italic === true,
    enabled: hasEnabledFlag ? Boolean(o.enabled) : undefined,
  });
}

export function captionForApi(caption: EventImageCaption | null | undefined): EventImageCaption | null {
  if (!caption) return null;
  const textTrimmed = (caption.text ?? '').trim();
  const normalized = applyCaptionDefaults(caption);
  if (!textTrimmed && !normalized.enabled) return null;
  /** Non-empty text saved from Details implies caption should display (enabled on). */
  const enabled = textTrimmed.length > 0 ? true : normalized.enabled;
  return {
    ...normalized,
    text: textTrimmed.length > 0 ? textTrimmed : caption.text ?? '',
    xPercent: clampPercent(normalized.xPercent),
    yPercent: clampPercent(normalized.yPercent),
    enabled,
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