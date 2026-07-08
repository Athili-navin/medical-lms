import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { fetchChapterPdfBytes } from "@/lib/pdf/chapter-pdf-bytes";
import { getPdfPageCountForChapter, getRememberedPdfBytes, rememberPdfBytes } from "@/lib/pdf/render-page";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) return apiError("chapterId required", 400);

  try {
    let bytes = getRememberedPdfBytes(chapterId);
    if (!bytes) {
      const loaded = await fetchChapterPdfBytes(auth.supabase!, chapterId);
      bytes = loaded.bytes;
      rememberPdfBytes(chapterId, bytes);
    }

    const pageCount = await getPdfPageCountForChapter(bytes, chapterId);

    return NextResponse.json(
      { pageCount },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Could not read PDF", 500);
  }
}
