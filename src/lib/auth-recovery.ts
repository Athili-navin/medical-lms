import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";

function waitForRecoverySession(supabase: ReturnType<typeof createClient>, timeoutMs = 5000) {
  return new Promise<{ ready: boolean; error: string | null }>((resolve) => {
    let settled = false;

    const finish = (ready: boolean, error: string | null) => {
      if (settled) return;
      settled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
      resolve({ ready, error });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        finish(true, null);
      }
    });

    const timer = setTimeout(async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (user && !userError) {
        finish(true, null);
      } else {
        finish(false, "Your reset link is invalid or has expired. Please request a new one.");
      }
    }, timeoutMs);
  });
}

export async function establishRecoverySession() {
  if (typeof window === "undefined") return { ready: false, error: "Invalid environment" };

  const supabase = createClient();
  const url = new URL(window.location.href);

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const queryError = url.searchParams.get("error");

  if (queryError) {
    return { ready: false, error: decodeURIComponent(queryError.replace(/\+/g, " ")) };
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ready: false, error: error.message };
    window.history.replaceState({}, "", "/reset-password");
    return waitForRecoverySession(supabase);
  }

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error) return { ready: false, error: error.message };
    window.history.replaceState({}, "", "/reset-password");
    return waitForRecoverySession(supabase);
  }

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const hashType = hashParams.get("type");

    if (accessToken && refreshToken && hashType === "recovery") {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return { ready: false, error: error.message };
      window.history.replaceState({}, "", "/reset-password");
      return waitForRecoverySession(supabase);
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (user && !userError) {
    return { ready: true, error: null };
  }

  return {
    ready: false,
    error: "Your reset link is invalid or has expired. Please request a new one.",
  };
}

export async function setPasswordFromReset(newPassword: string) {
  if (!isSupabaseConfigured()) return { error: SUPABASE_SETUP_MESSAGE };

  const response = await fetch("/api/auth/update-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.error ?? "Failed to update password" };
  }

  return { error: null };
}
