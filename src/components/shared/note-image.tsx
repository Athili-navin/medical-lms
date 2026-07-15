"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getNoteImageSrc, isNoteStoragePath } from "@/lib/notes/note-image-utils";
import { cn } from "@/lib/utils";

interface NoteImageProps {
  storagePath: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function NoteImage({ storagePath, alt, className, style }: NoteImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const src = useMemo(() => {
    if (!storagePath) return "";
    if (isNoteStoragePath(storagePath)) return getNoteImageSrc(storagePath);
    return storagePath;
  }, [storagePath]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src) return null;

  if (failed) {
    return (
      <div className="my-4 flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/40 text-sm text-muted-foreground">
        Image could not be loaded
      </div>
    );
  }

  return (
    <div className="relative">
      {!loaded && (
        <div className="my-4 flex h-48 items-center justify-center rounded-md bg-muted/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? "Note image"}
        className={cn("my-4 block max-w-full rounded-md", !loaded && "hidden", className)}
        style={style}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
