/** Storage-relative path for note/glossary/mcq images (not a browser URL). */
export function isNoteStoragePath(src: string): boolean {
  if (!src || src.startsWith("data:")) return false;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return extractStoragePath(src) !== null;
  }
  return src.startsWith("notes/") || src.startsWith("chapters/") || src.startsWith("mcq/");
}

export function extractStoragePath(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("notes/") || trimmed.startsWith("chapters/") || trimmed.startsWith("mcq/")) {
    return trimmed.split("?")[0] ?? null;
  }

  const embeddedMcq = trimmed.match(/(?:^|\/)mcq\/([a-zA-Z0-9_\-./]+)/);
  if (embeddedMcq?.[0]) {
    const segment = embeddedMcq[0].replace(/^\//, "");
    return segment.split("?")[0] ?? null;
  }

  const embeddedNotes = trimmed.match(/(?:^|\/)notes\/([a-zA-Z0-9_\-./]+)/);
  if (embeddedNotes?.[0]) {
    const segment = embeddedNotes[0].replace(/^\//, "");
    return segment.split("?")[0] ?? null;
  }

  const signMatch = trimmed.match(/\/storage\/v1\/object\/sign\/glossary-images\/([^?]+)/);
  if (signMatch?.[1]) return decodeURIComponent(signMatch[1]);

  const publicMatch = trimmed.match(/\/storage\/v1\/object\/public\/glossary-images\/([^?]+)/);
  if (publicMatch?.[1]) return decodeURIComponent(publicMatch[1]);

  return null;
}

export function normalizeStorageImagePath(rawPath: string | null): string | null {
  if (!rawPath?.trim()) return null;
  const path = extractStoragePath(rawPath) ?? rawPath.trim();
  if (!path.startsWith("notes/") && !path.startsWith("chapters/") && !path.startsWith("mcq/")) {
    return null;
  }
  return path;
}

export function storageImageProxyUrl(path: string): string {
  return `/api/notes/image?path=${encodeURIComponent(path)}`;
}

export function contentTypeForPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
