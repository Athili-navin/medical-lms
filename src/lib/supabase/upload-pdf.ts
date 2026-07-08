import { createClient } from "@/lib/supabase/client";
import { CHAPTER_PDF_BUCKET, MAX_PDF_BYTES, formatFileSize } from "@/lib/supabase/storage-constants";

export { CHAPTER_PDF_BUCKET, MAX_PDF_BYTES, formatFileSize };

export async function uploadChapterPdf(file: File, chapterId: string) {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error(`PDF is ${formatFileSize(file.size)}. Max ${formatFileSize(MAX_PDF_BYTES)}.`);
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Session expired. Log in again as tutor.");

  const signRes = await fetch("/api/pdfs/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ chapterId, fileName: file.name }),
  });
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({ error: signRes.statusText }));
    throw new Error(err.error || "Could not start PDF upload");
  }

  const { path, token } = (await signRes.json()) as { path: string; token: string };
  const { error } = await supabase.storage.from(CHAPTER_PDF_BUCKET).uploadToSignedUrl(path, token, file, {
    contentType: "application/pdf",
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function uploadGlossaryImage(file: File, chapterId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Session expired. Log in again as tutor.");

  const signRes = await fetch("/api/glossary/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ chapterId, fileName: file.name }),
  });
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({ error: signRes.statusText }));
    throw new Error(err.error || "Could not upload image");
  }

  const { path, token } = (await signRes.json()) as { path: string; token: string };

  const { error } = await supabase.storage.from("glossary-images").uploadToSignedUrl(path, token, file, {
    contentType: file.type || "image/png",
  });
  if (error) throw new Error(error.message);
  return path;
}
