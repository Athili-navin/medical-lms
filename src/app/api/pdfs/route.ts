import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { mapChapterPdf } from "@/lib/api/mock-store";
import { CHAPTER_PDF_BUCKET } from "@/lib/supabase/storage-constants";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await auth.supabase!.from("chapter_pdfs").select("*").eq("id", id).maybeSingle();
    if (error) return apiError(error.message);
    return NextResponse.json(data ? mapChapterPdf(data) : null);
  }

  if (chapterId) {
    const { data, error } = await auth.supabase!
      .from("chapter_pdfs")
      .select("*")
      .eq("chapter_id", chapterId)
      .maybeSingle();
    if (error) return apiError(error.message);
    return NextResponse.json(data ? mapChapterPdf(data) : null);
  }

  return apiError("id or chapterId required", 400);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { chapter_id, title, url, file_name } = await request.json();
  if (!chapter_id || !url) return apiError("chapter_id and url required", 400);

  const { data: existing } = await auth.supabase!
    .from("chapter_pdfs")
    .select("id")
    .eq("chapter_id", chapter_id)
    .maybeSingle();

  const row = {
    title: title || "Chapter PDF",
    url,
    file_name: file_name || "",
  };

  if (existing) {
    const { data, error } = await auth.supabase!
      .from("chapter_pdfs")
      .update(row)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return apiError(error.message);
    return NextResponse.json(mapChapterPdf(data));
  }

  const { data, error } = await auth.supabase!
    .from("chapter_pdfs")
    .insert({ chapter_id, ...row })
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(mapChapterPdf(data), { status: 201 });
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { data: pdf } = await auth.supabase!.from("chapter_pdfs").select("url").eq("id", id).maybeSingle();
  if (pdf?.url && !pdf.url.startsWith("http")) {
    await auth.supabase!.storage.from(CHAPTER_PDF_BUCKET).remove([pdf.url]);
  }

  const { error } = await auth.supabase!.from("chapter_pdfs").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
