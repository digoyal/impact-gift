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

  if (!caption.text.trim()) {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        aria-label={editable ? 'Drag to reposition caption' : undefined}
        className={`absolute max-w-[90%] px-2 py-1 text-center text-white select-none ${
          editable
            ? `cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ring-2 ring-white/80 ring-offset-2 ring-offset-transparent rounded shadow-lg`
            : 'pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]'
        }`}
        style={{
          left: `${caption.xPercent}%`,
          top: `${caption.yPercent}%`,
          transform: 'translate(-50%, -50%)',
          fontFamily: eventImageCaptionFontStack(caption.fontFamily),
          fontSize: `${caption.fontSizePx}px`,
          lineHeight: 1.2,
          textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.45)',
        }}
        onPointerDown={
          editable
            ? (e) => {
                e.preventDefault();
                setIsDragging(true);
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerMove={
          editable
            ? (e) => {
                if (!isDragging) return;
                updatePositionFromClient(e.clientX, e.clientY);
              }
            : undefined
        }
        onPointerUp={
          editable
            ? (e) => {
                setIsDragging(false);
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              }
            : undefined
        }
        onPointerCancel={
          editable
            ? () => {
                setIsDragging(false);
              }
            : undefined
        }
      >
        {caption.text}
      </div>
    </div>
  );
};

export default EventImageCaptionOverlay;