import { createClient } from "@/lib/supabase/client";
import { GLOSSARY_IMAGE_BUCKET } from "@/lib/supabase/storage-constants";

export async function uploadNoteImage(chapterId: string, file: File): Promise<string> {
  const signRes = await fetch("/api/notes/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapterId, fileName: file.name }),
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to get upload URL");
  }

  const { path, token } = (await signRes.json()) as { path: string; token: string };
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(GLOSSARY_IMAGE_BUCKET)
    .uploadToSignedUrl(path, token, file, { upsert: true });

  if (error) throw new Error(error.message);
  return path;
}
