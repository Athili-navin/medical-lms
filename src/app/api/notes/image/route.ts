import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { normalizeStorageImagePath } from "@/lib/storage/image-path";
import { streamStorageImage } from "@/lib/storage/serve-image";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;

  const rawPath = new URL(request.url).searchParams.get("path");
  const path = normalizeStorageImagePath(rawPath);
  if (!path) return apiError("Invalid image path", 400);

  return streamStorageImage(auth.supabase!, path);
}
