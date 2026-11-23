import type { ReactNode } from 'react';
import {
  DEFAULT_EVENT_IMAGE_CAPTION,
  EVENT_IMAGE_CAPTION_FONT_OPTIONS,
  EVENT_IMAGE_CAPTION_SIZE_OPTIONS,
  type EventImageCaption,
} from '../utils/eventImageCaption';
import EventImageCaptionOverlay from './EventImageCaptionOverlay';

const LABEL_CLASS = 'block text-sm font-semibold text-gray-700 mb-1';

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
  const workingCaption = caption ?? DEFAULT_EVENT_IMAGE_CAPTION;

  const patchCaption = (patch: Partial<EventImageCaption>) => {
    if (!onCaptionChange) return;
    onCaptionChange({ ...workingCaption, ...patch });
  };

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
          <p className="text-xs text-gray-500">
            Type in the box on the image, use the top bar to drag it, and adjust font and size below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label htmlFor="event-image-caption-font" className={LABEL_CLASS}>
                Font
              </label>
              <select
                id="event-image-caption-font"
                className="input w-full"
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
            <div className="min-w-0">
              <label htmlFor="event-image-caption-size" className={LABEL_CLASS}>
                Size
              </label>
              <select
                id="event-image-caption-size"
                className="input w-full"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default EventImageWithCaption;