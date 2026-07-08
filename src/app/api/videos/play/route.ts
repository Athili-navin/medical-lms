import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { gateStudentSubscription } from "@/lib/api/require-subscription";
import { mapVideo } from "@/lib/api/mock-store";

const VIDEO_BUCKET = "lecture-videos";

async function resolvePlayUrl(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAuth>>["supabase"]>,
  rawUrl: string
) {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  const { data, error } = await supabase.storage.from(VIDEO_BUCKET).createSignedUrl(rawUrl, 3600);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not generate secure video URL");
  }
  return data.signedUrl;
}

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("Video id required", 400);

  const { data: video, error } = await auth.supabase!
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !video) return apiError("Video not found", 404);

  try {
    const streamUrl = await resolvePlayUrl(auth.supabase!, video.url);
    return NextResponse.json({
      ...mapVideo(video),
      streamUrl,
    });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Failed to load video");
  }
}
