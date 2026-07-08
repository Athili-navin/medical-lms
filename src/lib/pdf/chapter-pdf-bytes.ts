import { CHAPTER_PDF_BUCKET } from "@/lib/supabase/storage-constants";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchChapterPdfBytes(supabase: SupabaseClient, chapterId: string) {
  const { data: pdf, error } = await supabase
    .from("chapter_pdfs")
    .select("*")
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!pdf) throw new Error("PDF not found");

  const { data: file, error: dlError } = await supabase.storage.from(CHAPTER_PDF_BUCKET).download(pdf.url);
  if (dlError || !file) throw new Error(dlError?.message ?? "Could not load PDF");

  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    title: (pdf.title as string) || "Chapter PDF",
  };
}
