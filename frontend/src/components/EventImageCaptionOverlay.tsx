import { useCallback, useRef, useState } from 'react';
import {
  type EventImageCaption,
  eventImageCaptionFontStack,
} from '../utils/eventImageCaption';

interface EventImageCaptionOverlayProps {
  caption: EventImageCaption;
  editable?: boolean;
  onCaptionChange?: (caption: EventImageCaption) => void;
}

const EventImageCaptionOverlay = ({
  caption,
  editable = false,
  onCaptionChange,
}: EventImageCaptionOverlayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updatePositionFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || !onCaptionChange) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;
      onCaptionChange({
        ...caption,
        xPercent: Math.min(100, Math.max(0, xPercent)),
        yPercent: Math.min(100, Math.max(0, yPercent)),
      });
    },
    [caption, onCaptionChange]
  );

  const textStyle = {
    fontFamily: eventImageCaptionFontStack(caption.fontFamily),
    fontSize: `${caption.fontSizePx}px`,
    lineHeight: 1.25,
  } as const;

  if (!editable && !caption.text.trim()) {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden />;
  }

  const boxPositionStyle = {
    left: `${caption.xPercent}%`,
    top: `${caption.yPercent}%`,
    transform: 'translate(-50%, -50%)',
  };

  if (!editable) {
    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute max-w-[90%] px-2 py-1 text-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          style={{
            ...boxPositionStyle,
            ...textStyle,
            textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.45)',
          }}
        >
          {caption.text}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-[2]">
      <div
        className={`absolute min-w-[10rem] max-w-[min(90%,20rem)] rounded-md border-2 border-dashed border-white/90 bg-black/50 shadow-lg ring-2 ring-primary-300/80 backdrop-blur-[2px] ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={boxPositionStyle}
      >
        <div
          className={`flex items-center justify-center gap-1 border-b border-white/25 px-2 py-1 text-white/90 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          aria-label="Drag to move caption"
          onPointerDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!isDragging) return;
            updatePositionFromClient(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            setIsDragging(false);
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => setIsDragging(false)}
        >
          <svg className="h-4 w-4 shrink-0 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M7 4a1 1 0 100-2 1 1 0 000 2zm6-1a1 1 0 11-2 0 1 1 0 012 0zM7 11a1 1 0 100-2 1 1 0 000 2zm6-1a1 1 0 11-2 0 1 1 0 012 0zM7 18a1 1 0 100-2 1 1 0 000 2zm6-1a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wide">Drag to move</span>
        </div>

        <label className="sr-only" htmlFor="event-image-caption-on-image">
          Image caption text
        </label>
        <textarea
          id="event-image-caption-on-image"
          rows={2}
          value={caption.text}
          placeholder="Come celebrate with us!"
          onChange={(e) =>
            onCaptionChange?.({
              ...caption,
              text: e.target.value,
            })
          }
          className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-center text-white placeholder:text-white/55 focus:outline-none focus:ring-0 min-h-[3rem]"
          style={{
            ...textStyle,
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
          }}
        />
      </div>
    </div>
  );
};

export default EventImageCaptionOverlay;