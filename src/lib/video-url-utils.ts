const UNSUPPORTED_VIDEO_HOSTS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /drive\.google\.com/i, label: "Google Drive" },
  { pattern: /docs\.google\.com/i, label: "Google Drive" },
  { pattern: /youtube\.com/i, label: "YouTube" },
  { pattern: /youtu\.be/i, label: "YouTube" },
  { pattern: /vimeo\.com/i, label: "Vimeo" },
  { pattern: /dropbox\.com/i, label: "Dropbox" },
  { pattern: /onedrive\.live\.com/i, label: "OneDrive" },
  { pattern: /1drv\.ms/i, label: "OneDrive" },
];

export function getUnsupportedVideoUrlWarning(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Storage paths (Supabase) are fine — not http(s) share pages
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null;
  }

  const match = UNSUPPORTED_VIDEO_HOSTS.find(({ pattern }) => pattern.test(trimmed));
  if (!match) return null;

  return `${match.label} share links cannot play in this player. Upload an MP4 file above, or use a direct .mp4/.webm URL (e.g. from Supabase Storage or your own CDN).`;
}

export function isUnsupportedVideoUrl(url: string): boolean {
  return getUnsupportedVideoUrlWarning(url) !== null;
}
