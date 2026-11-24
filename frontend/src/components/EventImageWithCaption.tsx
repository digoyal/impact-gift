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

const LABEL_CLASS = 'block text-xs font-semibold text-gray-700 mb-1';

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
              Type in the box on the image, drag the top bar to move, pull the bottom-right corner to resize.
            </p>
          )}
          <div
            className="flex flex-wrap items-end gap-3 sm:flex-nowrap sm:gap-4"
            role="toolbar"
            aria-label="Caption controls"
          >
            <div className="shrink-0 w-auto">
              <span id="event-image-caption-enabled-label" className={LABEL_CLASS}>
                Caption
              </span>
              <label
                htmlFor="event-image-caption-enabled"
                className="flex min-h-[40px] cursor-pointer items-center gap-2 pt-0.5"
              >
                <input
                  id="event-image-caption-enabled"
                  type="checkbox"
                  aria-labelledby="event-image-caption-enabled-label"
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  checked={captionOn}
                  onChange={(e) => patchCaption({ enabled: e.target.checked })}
                />
              </label>
            </div>

            {captionOn && (
              <>
            <div className="min-w-0 w-full basis-full sm:basis-auto sm:flex-1 sm:max-w-[11rem]">
              <label htmlFor="event-image-caption-font" className={LABEL_CLASS}>
                Font
              </label>
              <select
                id="event-image-caption-font"
                className="input w-full min-w-0"
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

            <div className="min-w-0 w-[calc(50%-0.375rem)] sm:w-auto sm:min-w-[5.5rem]">
              <label htmlFor="event-image-caption-size" className={LABEL_CLASS}>
                Size
              </label>
              <select
                id="event-image-caption-size"
                className="input w-full min-w-0"
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

            <div className="shrink-0 w-[calc(50%-0.375rem)] sm:w-auto">
              <label htmlFor="event-image-caption-color" className={LABEL_CLASS}>
                Color
              </label>
              <input
                id="event-image-caption-color"
                type="color"
                className="h-10 w-full sm:w-14 cursor-pointer rounded border border-neutral-300 bg-white p-1"
                value={normalizeCaptionColor(workingCaption.color ?? DEFAULT_CAPTION_COLOR)}
                onChange={(e) => patchCaption({ color: normalizeCaptionColor(e.target.value) })}
                aria-label="Caption text color"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:pb-0.5">
              <button
                type="button"
                aria-pressed={workingCaption.bold}
                title="Bold"
                onClick={() => patchCaption({ bold: !workingCaption.bold })}
                className={`min-h-[40px] min-w-[40px] rounded-md border px-3 text-sm font-bold transition-colors ${
                  workingCaption.bold
                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                    : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                B
              </button>
              <button
                type="button"
                aria-pressed={workingCaption.italic}
                title="Italic"
                onClick={() => patchCaption({ italic: !workingCaption.italic })}
                className={`min-h-[40px] min-w-[40px] rounded-md border px-3 text-sm italic transition-colors ${
                  workingCaption.italic
                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                    : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                I
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventImageWithCaption;