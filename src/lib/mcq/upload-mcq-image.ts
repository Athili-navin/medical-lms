import { createClient } from "@/lib/supabase/client";
import { GLOSSARY_IMAGE_BUCKET } from "@/lib/supabase/storage-constants";

export async function uploadMcqImage(chapterId: string, file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Session expired. Log in again as tutor.");

  const signRes = await fetch("/api/mcq/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ chapterId, fileName: file.name }),
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to get upload URL");
  }

  const { path, token } = (await signRes.json()) as { path: string; token: string };
  const { error } = await supabase.storage
    .from(GLOSSARY_IMAGE_BUCKET)
    .uploadToSignedUrl(path, token, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });

  if (error) throw new Error(error.message);
  return path;
}
