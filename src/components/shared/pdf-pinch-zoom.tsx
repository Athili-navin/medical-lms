"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.35;

interface PdfPinchZoomProps {
  children: ReactNode;
  resetKey?: string | number;
  className?: string;
}

function touchDistance(touches: Pick<TouchList, "length"> & { 0?: Touch; 1?: Touch }) {
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return 0;
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

export function PdfPinchZoom({ children, resetKey, className }: PdfPinchZoomProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(MIN_SCALE);
  const offsetRef = useRef({ x: 0, y: 0 });
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(MIN_SCALE);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const lastTap = useRef(0);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const applyScale = useCallback((next: number) => {
    const clamped = clampScale(next);
    scaleRef.current = clamped;
    setScale(clamped);
    if (clamped === MIN_SCALE) {
      offsetRef.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
    }
  }, []);

  const applyOffset = useCallback((x: number, y: number) => {
    offsetRef.current = { x, y };
    setOffset({ x, y });
  }, []);

  useEffect(() => {
    scaleRef.current = MIN_SCALE;
    offsetRef.current = { x: 0, y: 0 };
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  }, [resetKey]);

  const zoomIn = () => applyScale(scaleRef.current + SCALE_STEP);
  const zoomOut = () => applyScale(scaleRef.current - SCALE_STEP);
  const resetZoom = () => {
    applyScale(MIN_SCALE);
    applyOffset(0, 0);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      pinchStartDistance.current = touchDistance(event.touches);
      pinchStartScale.current = scaleRef.current;
      panStart.current = null;
      return;
    }

    if (event.touches.length === 1 && scaleRef.current > MIN_SCALE) {
      const touch = event.touches[0];
      panStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        ox: offsetRef.current.x,
        oy: offsetRef.current.y,
      };
    }
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && pinchStartDistance.current) {
      event.preventDefault();
      const distance = touchDistance(event.touches);
      const ratio = distance / pinchStartDistance.current;
      applyScale(pinchStartScale.current * ratio);
      return;
    }

    if (event.touches.length === 1 && panStart.current && scaleRef.current > MIN_SCALE) {
      event.preventDefault();
      const touch = event.touches[0];
      applyOffset(
        panStart.current.ox + (touch.clientX - panStart.current.x),
        panStart.current.oy + (touch.clientY - panStart.current.y)
      );
    }
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (event.touches.length < 2) {
      pinchStartDistance.current = null;
    }
    if (event.touches.length === 0) {
      panStart.current = null;
    }

    const now = Date.now();
    if (event.changedTouches.length === 1 && now - lastTap.current < 300) {
      resetZoom();
    }
    lastTap.current = now;
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-background/95 px-3 py-2">
        <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={zoomOut} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[3.5rem] text-center text-xs text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={zoomIn} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={resetZoom}
          disabled={scale === MIN_SCALE && offset.x === 0 && offset.y === 0}
          aria-label="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={viewportRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-auto overscroll-contain",
          scale > MIN_SCALE ? "touch-none" : "touch-pan-y"
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="mx-auto w-full max-w-full origin-top p-4 transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
