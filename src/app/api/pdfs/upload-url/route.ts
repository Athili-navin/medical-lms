import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { CHAPTER_PDF_BUCKET } from "@/lib/supabase/storage-constants";

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { chapterId, fileName } = await request.json();
  if (!chapterId || !fileName) return apiError("chapterId and fileName required", 400);

  const safeName = String(fileName).replace(/[^\w.-]/g, "_");
  const path = `chapters/${chapterId}/${Date.now()}-${safeName}`;

  const { data, error } = await auth.supabase!.storage
    .from(CHAPTER_PDF_BUCKET)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) return apiError(error?.message ?? "Upload URL failed", 500);
  return NextResponse.json({ path: data.path, token: data.token });
}
