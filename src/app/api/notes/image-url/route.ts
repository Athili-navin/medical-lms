import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { resolveStorageUrl } from "@/lib/api/resolve-storage-url";
import { GLOSSARY_IMAGE_BUCKET } from "@/lib/supabase/storage-constants";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;

  const path = new URL(request.url).searchParams.get("path");
  if (!path) return apiError("path required", 400);

  try {
    const url = await resolveStorageUrl(auth.supabase!, GLOSSARY_IMAGE_BUCKET, path, 3600);
    return NextResponse.json({ url });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Could not resolve image");
  }
}
