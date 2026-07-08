"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProtectedVideoPlayer } from "@/components/shared/protected-video-player";
import { useVideoModalStore } from "@/stores";
import { apiClient } from "@/lib/api/client";
import { formatDuration } from "@/lib/utils";
import type { Video } from "@/types";

export function VideoModal() {
  const { isOpen, videoId, closeVideo } = useVideoModalStore();
  const [video, setVideo] = useState<(Video & { streamUrl?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !videoId) {
      setVideo(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    apiClient
      .getVideoPlayUrl(videoId)
      .then(setVideo)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load video"))
      .finally(() => setLoading(false));
  }, [isOpen, videoId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeVideo()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
        {loading && (
          <div className="flex aspect-video items-center justify-center bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        )}

        {!loading && error && (
          <div className="flex aspect-video flex-col items-center justify-center bg-muted px-6 text-center">
            <ShieldAlert className="mb-2 h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && video?.streamUrl && (
          <>
            <ProtectedVideoPlayer streamUrl={video.streamUrl} title={video.title} />
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>{video.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 pt-1">
                  <Clock className="h-4 w-4" />
                  Duration: {formatDuration(video.duration)}
                </DialogDescription>
              </DialogHeader>
              <p className="mt-3 text-xs text-muted-foreground">
                Streamed via signed URL — expires after 1 hour. For studio-grade protection use a DRM
                provider (Widevine + FairPlay); see project docs in .env.example.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
