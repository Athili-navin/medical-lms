import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signOut() {
  if (!isSupabaseConfigured()) return;

  try {
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
  } catch {
    // ignore cookie cleanup failures
  }

  const supabase = createClient();
  await supabase.auth.signOut();
}
