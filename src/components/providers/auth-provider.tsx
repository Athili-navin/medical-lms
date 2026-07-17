"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User } from "@/types";

const SESSION_CHECK_MS = 45_000;

async function fetchAuthState() {
  const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
  if (!res.ok) return { user: null, sessionValid: false, needsSessionRegistration: false };
  return res.json() as Promise<{
    user: User | null;
    sessionValid?: boolean;
    needsSessionRegistration?: boolean;
  }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);
  const kickedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function enforceSession(message?: string) {
      if (kickedRef.current) return;
      kickedRef.current = true;
      await logout();
      if (!cancelled) {
        const params = message ? `?reason=${encodeURIComponent(message)}` : "";
        router.replace(`/login${params}`);
      }
    }

    async function syncSession() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAuthState();
        if (cancelled) return;

        if (data.user && data.sessionValid === false) {
          if (data.needsSessionRegistration) {
            const registerRes = await fetch("/api/auth/session", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
            });

            if (registerRes.ok) {
              const retry = await fetchAuthState();
              if (retry.user && retry.sessionValid !== false) {
                setUser(retry.user);
                return;
              }
            }
          } else {
            await enforceSession("Your account was signed in on another device.");
            return;
          }
        }

        setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function recheckSession() {
      if (!isSupabaseConfigured() || kickedRef.current) return;
      try {
        const data = await fetchAuthState();
        if (data.user && data.sessionValid === false && !data.needsSessionRegistration) {
          await enforceSession("Your account was signed in on another device.");
        }
      } catch {
        // ignore transient network errors
      }
    }

    void syncSession();

    const interval = window.setInterval(() => {
      void recheckSession();
    }, SESSION_CHECK_MS);

    const onFocus = () => {
      void recheckSession();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [logout, router, setLoading, setUser]);

  return <>{children}</>;
}
