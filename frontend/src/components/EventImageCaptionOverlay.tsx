import { useCallback, useRef, useState } from 'react';
import {
  applyCaptionLayoutDefaults,
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
  const layout = applyCaptionLayoutDefaults(caption);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeStartRef = useRef<{
    widthPercent: number;
    heightPercent: number;
    clientX: number;
    clientY: number;
  } | null>(null);

  const updatePositionFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || !onCaptionChange) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;
      onCaptionChange(
        applyCaptionLayoutDefaults({
          ...layout,
          xPercent: Math.min(100, Math.max(0, xPercent)),
          yPercent: Math.min(100, Math.max(0, yPercent)),
        })
      );
    },
    [layout, onCaptionChange]
  );

  const textStyle = {
    fontFamily: eventImageCaptionFontStack(layout.fontFamily),
    fontSize: `${layout.fontSizePx}px`,
    lineHeight: 1.25,
  } as const;

  const boxPositionStyle = {
    left: `${layout.xPercent}%`,
    top: `${layout.yPercent}%`,
    width: `${layout.widthPercent}%`,
    height: `${layout.heightPercent}%`,
    transform: 'translate(-50%, -50%)',
  };

  if (!editable && !layout.text.trim()) {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden />;
  }

  if (!editable) {
    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute flex items-center justify-center overflow-hidden px-2 py-1 text-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          style={{
            ...boxPositionStyle,
            ...textStyle,
            textShadow: '0 1px 4px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.45)',
          }}
        >
          <p className="w-full break-words whitespace-pre-wrap">{layout.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-[2]">
      <div
        className={`absolute flex flex-col overflow-hidden rounded-md border-2 border-dashed border-white/90 bg-black/50 shadow-lg ring-2 ring-primary-300/80 backdrop-blur-[2px] ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={boxPositionStyle}
      >
        <div
          className={`flex shrink-0 items-center justify-center gap-1 border-b border-white/25 px-2 py-1 text-white/90 ${
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
          value={layout.text}
          placeholder="Come celebrate with us!"
          onChange={(e) =>
            onCaptionChange?.(
              applyCaptionLayoutDefaults({
                ...layout,
                text: e.target.value,
              })
            )
          }
          className="min-h-0 flex-1 w-full resize-none border-0 bg-transparent px-3 py-2 text-center text-white placeholder:text-white/55 focus:outline-none focus:ring-0 overflow-auto"
          style={{
            ...textStyle,
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
          }}
        />

        <button
          type="button"
          aria-label="Resize caption box"
          className={`absolute bottom-0 right-0 z-10 flex h-10 w-10 items-end justify-end p-1 touch-manipulation ${
            isResizing ? 'cursor-nwse-resize' : 'cursor-nwse-resize'
          }`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            resizeStartRef.current = {
              widthPercent: layout.widthPercent!,
              heightPercent: layout.heightPercent!,
              clientX: e.clientX,
              clientY: e.clientY,
            };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!isResizing || !resizeStartRef.current || !onCaptionChange) return;
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const dx = ((e.clientX - resizeStartRef.current.clientX) / rect.width) * 100;
            const dy = ((e.clientY - resizeStartRef.current.clientY) / rect.height) * 100;
            onCaptionChange(
              applyCaptionLayoutDefaults({
                ...layout,
                widthPercent: resizeStartRef.current.widthPercent + dx * 2,
                heightPercent: resizeStartRef.current.heightPercent + dy * 2,
              })
            );
          }}
          onPointerUp={(e) => {
            setIsResizing(false);
            resizeStartRef.current = null;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            setIsResizing(false);
            resizeStartRef.current = null;
          }}
        >
          <span
            className="mb-0.5 mr-0.5 block h-3 w-3 rounded-sm border-b-2 border-r-2 border-white/90 bg-white/20"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
};

export default EventImageCaptionOverlay;