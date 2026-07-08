import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  await supabase.auth.signOut();
}
