"use client";

const WATERMARK_TEXT = "ENAMEL ROADS";

interface PdfWatermarkOverlayProps {
  /** Shown in watermark (e.g. student email) to trace screenshots. */
  viewerLabel?: string;
}

export function PdfWatermarkOverlay({ viewerLabel }: PdfWatermarkOverlayProps) {
  const line = viewerLabel ? `${WATERMARK_TEXT} · ${viewerLabel}` : WATERMARK_TEXT;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute -inset-[50%] grid grid-cols-3 gap-x-12 gap-y-16 opacity-[0.22] sm:grid-cols-4"
        style={{ transform: "rotate(-30deg)" }}
      >
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-center text-sm font-bold tracking-wide text-gray-900 sm:text-base"
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
