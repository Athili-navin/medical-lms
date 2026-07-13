"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordTooltipProps {
  term: string;
  definition: string;
  imageUrl?: string;
}

/** Tap/click-friendly glossary term — works on mobile and desktop. */
export function KeywordTooltip({ term, definition, imageUrl }: KeywordTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline cursor-pointer border-b border-dotted border-primary/50 font-medium text-foreground underline-offset-2 transition-colors",
          "hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          open && "border-primary text-primary"
        )}
      >
        {term}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-[100] mt-2 block w-[min(440px,92vw)] rounded-md border bg-popover p-4 text-left text-sm leading-relaxed text-popover-foreground shadow-lg"
        >
          <button
            type="button"
            aria-label="Close definition"
            className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="pr-6">{definition}</p>
          {imageUrl && (
            <div className="relative mx-auto mt-3 h-[280px] w-full min-w-[240px] overflow-hidden rounded-md border bg-background">
              <Image
                src={imageUrl}
                alt={term}
                fill
                className="object-contain p-1"
                unoptimized
                sizes="440px"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          )}
        </span>
      )}
    </span>
  );
}
