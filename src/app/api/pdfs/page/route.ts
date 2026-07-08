import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { fetchChapterPdfBytes } from "@/lib/pdf/chapter-pdf-bytes";
import { getRememberedPdfBytes, rememberPdfBytes, renderPdfPageForChapter } from "@/lib/pdf/render-page";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const url = new URL(request.url);
  const chapterId = url.searchParams.get("chapterId");
  const pageParam = url.searchParams.get("page");

  if (!chapterId || !pageParam) return apiError("chapterId and page required", 400);

  const page = Number.parseInt(pageParam, 10);
  if (!Number.isFinite(page) || page < 1) return apiError("Invalid page number", 400);

  try {
    let bytes = getRememberedPdfBytes(chapterId);
    if (!bytes) {
      const loaded = await fetchChapterPdfBytes(auth.supabase!, chapterId);
      bytes = loaded.bytes;
      rememberPdfBytes(chapterId, bytes);
    }

    const image = await renderPdfPageForChapter(bytes, chapterId, page);

    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not render page";
    if (message === "Page not found") return apiError(message, 404);
    return apiError(message, 500);
  }
}
