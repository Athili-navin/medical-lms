import { createClient } from "@/lib/supabase/client";

export const LECTURE_VIDEO_BUCKET = "lecture-videos";

/** ~50MB — Supabase free tier default; increase in Supabase dashboard if needed */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadLectureVideo(file: File, chapterId: string) {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `File is ${formatFileSize(file.size)}. Max ${formatFileSize(MAX_VIDEO_BYTES)} on the default Supabase plan. Compress the video or raise the limit in Supabase → Storage → Settings.`
    );
  }

  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Session expired. Log out and sign in again at Tutor login, then retry.");
  }

  const signRes = await fetch("/api/videos/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ chapterId, fileName: file.name }),
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({ error: signRes.statusText }));
    throw new Error(err.error || "Could not start upload (are you logged in as tutor?)");
  }

  const { path, token } = (await signRes.json()) as { path: string; token: string };

  const { error: uploadError } = await supabase.storage
    .from(LECTURE_VIDEO_BUCKET)
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type || "video/mp4",
    });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes("row-level security") || uploadError.message.includes("policy")
        ? `${uploadError.message} — Run supabase/schema.sql storage policies and confirm your account role is tutor.`
        : uploadError.message
    );
  }

  return path;
}
