"use client";

import { useEffect, useRef } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useVisibilityProtection } from "@/hooks/use-content-protection";
import { cn } from "@/lib/utils";

interface ProtectedVideoPlayerProps {
  streamUrl: string;
  title: string;
  className?: string;
}

export function ProtectedVideoPlayer({ streamUrl, title, className }: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isBlocked, blockReason } = useVisibilityProtection(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isBlocked) video.pause();
  }, [isBlocked]);

  return (
    <div
      className={cn("protected-video relative aspect-video select-none overflow-hidden bg-black", className)}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        title={title}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        className={cn(
          "h-full w-full object-contain transition-all duration-300",
          isBlocked && "blur-xl brightness-50"
        )}
        onContextMenu={(e) => e.preventDefault()}
      />

      {isBlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 px-6 text-center text-white">
          <ShieldAlert className="mb-3 h-10 w-10 text-destructive" />
          <p className="text-lg font-semibold">Content protected</p>
          <p className="mt-2 max-w-sm text-sm text-white/80">
            {blockReason ?? "Return to this tab to resume playback."}
          </p>
        </div>
      )}

      {!streamUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}
    </div>
  );
}
