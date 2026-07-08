import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { apiError } from "@/lib/api/auth-helpers";

export function requireBackend() {
  if (!isSupabaseConfigured()) {
    return apiError(SUPABASE_SETUP_MESSAGE, 503);
  }
  return null;
}
