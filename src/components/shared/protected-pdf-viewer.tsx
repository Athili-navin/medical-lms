"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContentProtection } from "@/hooks/use-content-protection";
import { cn } from "@/lib/utils";

interface ProtectedPdfViewerProps {
  chapterId: string;
  title: string;
  className?: string;
}

const PAGE_FETCH_TIMEOUT_MS = 120_000;

function ProtectedPageImage({ chapterId, page }: { chapterId: string; page: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS);

    setLoading(true);
    setError("");
    setSrc(null);

    fetch(
      `/api/pdfs/page?chapterId=${encodeURIComponent(chapterId)}&page=${page}`,
      { credentials: "include", cache: "no-store", signal: controller.signal }
    )
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || "Failed to load page");
        }
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") {
          setError("Page took too long to load. Try again or use Next page.");
        } else {
          setError(e instanceof Error ? e.message : "Failed to load page");
        }
        setLoading(false);
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [chapterId, page]);

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-md bg-white">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Rendering page {page}…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-md bg-white px-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? undefined}
      alt={`Page ${page}`}
      draggable={false}
      className="mx-auto block h-auto w-full max-w-full select-none rounded-md bg-white shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    />
  );
}

export function ProtectedPdfViewer({ chapterId, title, className }: ProtectedPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useContentProtection(true, containerRef);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS);

    setLoading(true);
    setError("");
    setCurrentPage(1);
    setPageCount(0);

    fetch(`/api/pdfs/info?chapterId=${encodeURIComponent(chapterId)}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || "Failed to load PDF");
        }
        return res.json() as Promise<{ pageCount: number }>;
      })
      .then((data) => {
        if (!cancelled) setPageCount(data.pageCount);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") {
          setError("PDF took too long to open. Please try again.");
        } else {
          setError(e instanceof Error ? e.message : "Failed to load PDF");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        window.clearTimeout(timeout);
      });

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [chapterId]);

  const goPrev = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(
    () => setCurrentPage((p) => Math.min(pageCount, p + 1)),
    [pageCount]
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentPage, chapterId]);

  return (
    <div
      ref={containerRef}
      aria-label={title}
      className={cn(
        "protected-pdf relative flex h-full min-h-0 flex-1 flex-col select-none bg-muted/30",
        className
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`@media print { .protected-pdf, .protected-pdf * { display: none !important; } }`}</style>

      {loading && (
        <div className="flex flex-1 items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Opening PDF…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && pageCount > 0 && (
        <>
          <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-2">
            <Button type="button" size="sm" variant="outline" onClick={goPrev} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={goNext}
              disabled={currentPage >= pageCount}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className="h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y p-4"
          >
            <ProtectedPageImage key={`${chapterId}-${currentPage}`} chapterId={chapterId} page={currentPage} />
          </div>
        </>
      )}

      <p className="shrink-0 border-t px-4 py-2 text-xs text-muted-foreground">
        Secure view — pages are rendered as images. Copy and download are blocked in the app.
      </p>
    </div>
  );
}
