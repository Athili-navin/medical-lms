import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { CHAPTER_PDF_BUCKET } from "@/lib/supabase/storage-constants";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) return apiError("chapterId required", 400);

  const { data: pdf, error } = await auth.supabase!
    .from("chapter_pdfs")
    .select("*")
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error) return apiError(error.message);
  if (!pdf) return apiError("PDF not found", 404);

  const { data: file, error: dlError } = await auth.supabase!.storage.from(CHAPTER_PDF_BUCKET).download(pdf.url);
  if (dlError || !file) return apiError(dlError?.message ?? "Could not load PDF", 500);

  const buffer = await file.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
