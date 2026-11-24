import type { ReactNode } from 'react';
import {
  applyCaptionDefaults,
  DEFAULT_CAPTION_COLOR,
  DEFAULT_EVENT_IMAGE_CAPTION,
  EVENT_IMAGE_CAPTION_FONT_OPTIONS,
  EVENT_IMAGE_CAPTION_SIZE_OPTIONS,
  normalizeCaptionColor,
  type EventImageCaption,
} from '../utils/eventImageCaption';
import EventImageCaptionOverlay from './EventImageCaptionOverlay';

const INLINE_LABEL_CLASS = 'shrink-0 text-xs font-semibold text-gray-700';

interface EventImageWithCaptionProps {
  imageUrl: string;
  alt?: string;
  imageClassName?: string;
  previewClassName?: string;
  caption: EventImageCaption;
  onCaptionChange?: (caption: EventImageCaption) => void;
  editable?: boolean;
  topRightActions?: ReactNode;
}

const BoldIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-2.14-4-4.84-4H7v14h7.04c2.34 0 4.18-1.72 4.18-4 0-.86-.31-1.65-.62-2.21zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
  </svg>
);

const ItalicIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
  </svg>
);

const EventImageWithCaption = ({
  imageUrl,
  alt = 'Event',
  imageClassName = 'w-full h-full object-cover rounded-lg',
  previewClassName = 'relative w-full h-48 sm:h-56 overflow-hidden rounded-lg bg-neutral-100',
  caption,
  onCaptionChange,
  editable = false,
  topRightActions,
}: EventImageWithCaptionProps) => {
  const workingCaption = applyCaptionDefaults(caption ?? DEFAULT_EVENT_IMAGE_CAPTION);

  const patchCaption = (patch: Partial<EventImageCaption>) => {
    if (!onCaptionChange) return;
    onCaptionChange(applyCaptionDefaults({ ...workingCaption, ...patch }));
  };

  const captionOn = workingCaption.enabled;
  const styleMuted = !captionOn;

  return (
    <div className="space-y-3">
      <div className={previewClassName}>
        <img src={imageUrl} alt={alt} className={imageClassName} />
        <EventImageCaptionOverlay
          caption={workingCaption}
          editable={editable}
          onCaptionChange={onCaptionChange}
        />
        {topRightActions}
      </div>

      {editable && (
        <div className="space-y-2">
          {captionOn && (
            <p className="text-xs text-gray-500">
              Type in the box on the image, drag the border or padding to move, pull the bottom-right corner to resize.
            </p>
          )}
          <div
            className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-4"
            role="toolbar"
            aria-label="Caption controls"
          >
            <label
              htmlFor="event-image-caption-enabled"
              className="flex min-h-[40px] shrink-0 cursor-pointer items-center gap-2"
            >
              <span className={INLINE_LABEL_CLASS}>Caption</span>
              <input
                id="event-image-caption-enabled"
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                checked={captionOn}
                onChange={(e) => patchCaption({ enabled: e.target.checked })}
              />
            </label>

            <div
              className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap sm:gap-3 ${
                styleMuted ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <div className="flex min-h-[40px] min-w-0 flex-1 items-center gap-2 sm:max-w-[11rem]">
                <label htmlFor="event-image-caption-font" className={INLINE_LABEL_CLASS}>
                  Font
                </label>
                <select
                  id="event-image-caption-font"
                  disabled={styleMuted}
                  className={`input min-w-0 flex-1 ${styleMuted ? 'cursor-not-allowed text-gray-500' : ''}`}
                  value={workingCaption.fontFamily}
                  onChange={(e) =>
                    patchCaption({ fontFamily: e.target.value as EventImageCaption['fontFamily'] })
                  }
                >
                  {EVENT_IMAGE_CAPTION_FONT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-h-[40px] shrink-0 items-center gap-2">
                <label htmlFor="event-image-caption-size" className={INLINE_LABEL_CLASS}>
                  Size
                </label>
                <select
                  id="event-image-caption-size"
                  disabled={styleMuted}
                  className={`input w-[5.5rem] min-w-0 ${styleMuted ? 'cursor-not-allowed text-gray-500' : ''}`}
                  value={workingCaption.fontSizePx}
                  onChange={(e) => patchCaption({ fontSizePx: Number(e.target.value) })}
                >
                  {EVENT_IMAGE_CAPTION_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-h-[40px] shrink-0 items-center gap-2">
                <label htmlFor="event-image-caption-color" className={INLINE_LABEL_CLASS}>
                  Color
                </label>
                <input
                  id="event-image-caption-color"
                  type="color"
                  disabled={styleMuted}
                  className={`h-10 w-10 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white p-0.5 sm:w-10 ${
                    styleMuted ? 'cursor-not-allowed' : ''
                  }`}
                  value={normalizeCaptionColor(workingCaption.color ?? DEFAULT_CAPTION_COLOR)}
                  onChange={(e) => patchCaption({ color: normalizeCaptionColor(e.target.value) })}
                  aria-label="Caption text color"
                />
              </div>

              <button
                type="button"
                disabled={styleMuted}
                aria-pressed={workingCaption.bold}
                title="Bold"
                onClick={() => patchCaption({ bold: !workingCaption.bold })}
                className={`flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-md border transition-colors ${
                  styleMuted
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                    : workingCaption.bold
                      ? 'border-primary-600 bg-primary-50 text-primary-800'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <BoldIcon />
                <span className="sr-only">Bold</span>
              </button>

              <button
                type="button"
                disabled={styleMuted}
                aria-pressed={workingCaption.italic}
                title="Italic"
                onClick={() => patchCaption({ italic: !workingCaption.italic })}
                className={`flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-md border transition-colors ${
                  styleMuted
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                    : workingCaption.italic
                      ? 'border-primary-600 bg-primary-50 text-primary-800'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <ItalicIcon />
                <span className="sr-only">Italic</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventImageWithCaption;