import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api/auth-helpers";
import { resolveStorageUrl } from "@/lib/api/resolve-storage-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { GLOSSARY_IMAGE_BUCKET } from "@/lib/supabase/storage-constants";
import { contentTypeForPath, storageImageProxyUrl } from "@/lib/storage/image-path";

/** Stream image bytes through the app (works with user session + storage RLS). */
export async function streamStorageImage(userSupabase: SupabaseClient, path: string) {
  const { data, error } = await userSupabase.storage.from(GLOSSARY_IMAGE_BUCKET).download(path);
  if (error || !data) {
    return apiError(error?.message ?? "Image not found", 404);
  }

  const buffer = await data.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": data.type || contentTypeForPath(path),
      "Cache-Control": "private, max-age=1800",
    },
  });
}

/** JSON { url } for clients — prefers service-role signed URL, falls back to same-origin proxy. */
export async function resolveStorageImageUrl(_userSupabase: SupabaseClient, path: string) {
  const admin = createAdminClient();
  if (admin) {
    try {
      const url = await resolveStorageUrl(admin, GLOSSARY_IMAGE_BUCKET, path, 3600);
      return NextResponse.json({ url });
    } catch {
      // Fall back to proxy URL below.
    }
  }

  return NextResponse.json({ url: storageImageProxyUrl(path) });
}
