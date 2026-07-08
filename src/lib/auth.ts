import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { normalizeSubscriptionPlan } from "@/lib/subscription/access";
import type { User, UserRole } from "@/types";

function backendError() {
  return { user: null, error: SUPABASE_SETUP_MESSAGE };
}

export async function signIn(email: string, password: string, expectedRole?: UserRole) {
  if (!isSupabaseConfigured()) return backendError();

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  if (!profile) return { user: null, error: "Profile not found. Contact support." };

  if (expectedRole && profile.role !== expectedRole) {
    await supabase.auth.signOut();
    return {
      user: null,
      error:
        expectedRole === "tutor"
          ? "This account is not a tutor account"
          : "Please use the tutor login portal",
    };
  }

  return {
    user: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || "",
      role: profile.role as UserRole,
      subscriptionPlan: normalizeSubscriptionPlan(profile.subscription_plan),
      subscriptionExpiry: profile.subscription_expiry,
      subscriptionExempt: profile.subscription_exempt === true,
      joinedAt: profile.joined_at,
    } satisfies User,
    error: null,
  };
}

export async function signUp(name: string, email: string, password: string, role: UserRole = "student") {
  if (!isSupabaseConfigured()) return backendError();

  const supabase = createClient();
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, avatar: "" },
      emailRedirectTo,
    },
  });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: "Signup failed" };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

  return {
    user: profile
      ? {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar || "",
          role: profile.role as UserRole,
          subscriptionPlan: normalizeSubscriptionPlan(profile.subscription_plan),
          joinedAt: profile.joined_at,
        }
      : null,
    error: profile ? null : "Account created. Check your email to confirm before signing in.",
  };
}

export { signOut } from "@/lib/auth/sign-out";

export async function fetchSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar || "",
    role: profile.role as UserRole,
    subscriptionPlan: normalizeSubscriptionPlan(profile.subscription_plan),
    subscriptionExpiry: profile.subscription_expiry,
    subscriptionExempt: profile.subscription_exempt === true,
    joinedAt: profile.joined_at,
  };
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured()) return { error: SUPABASE_SETUP_MESSAGE };

  const supabase = createClient();
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: error.message };
  return { error: null };
}

export async function changePassword(currentPassword: string, newPassword: string, email: string) {
  if (!isSupabaseConfigured()) return { error: SUPABASE_SETUP_MESSAGE };

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (signInError) return { error: "Current password is incorrect" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}
