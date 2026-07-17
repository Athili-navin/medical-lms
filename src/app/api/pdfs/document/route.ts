import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { fetchChapterPdfBytes } from "@/lib/pdf/chapter-pdf-bytes";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

/** Authenticated PDF bytes for in-browser rendering (students + tutors). */
export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth(undefined, { requireActiveSession: true });
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) return apiError("chapterId required", 400);

  try {
    const { bytes } = await fetchChapterPdfBytes(auth.supabase!, chapterId);

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Could not load PDF", 500);
  }
}
