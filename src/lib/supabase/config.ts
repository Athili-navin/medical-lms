export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-anon-key" &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("PASTE_")
  );
}

export const SUPABASE_SETUP_MESSAGE =
  "Authentication backend is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local";
