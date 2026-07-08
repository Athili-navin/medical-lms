"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      try {
        const { fetchSessionUser } = await import("@/lib/auth");
        const sessionUser = await fetchSessionUser();
        setUser(sessionUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
