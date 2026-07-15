import { GLOSSARY_IMAGE_BUCKET } from "@/lib/supabase/storage-constants";
import {
  extractStoragePath,
  isNoteStoragePath,
  storageImageProxyUrl,
} from "@/lib/storage/image-path";

export { extractStoragePath, isNoteStoragePath } from "@/lib/storage/image-path";

export function getNoteImageSrc(storagePath: string): string {
  if (!storagePath) return "";
  if (isNoteStoragePath(storagePath)) {
    const path = extractStoragePath(storagePath) ?? storagePath;
    return storageImageProxyUrl(path);
  }
  return storagePath;
}

export async function fetchNoteImageUrl(storagePath: string): Promise<string> {
  return getNoteImageSrc(storagePath);
}

export { GLOSSARY_IMAGE_BUCKET };
