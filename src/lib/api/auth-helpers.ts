import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeSubscriptionPlan } from "@/lib/subscription/access";
import {
  isActiveSessionValid,
  readActiveSessionCookie,
} from "@/lib/auth/active-session";
import type { User, UserRole } from "@/types";

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  subscription_plan?: string;
  subscription_expiry?: string;
  subscription_exempt?: boolean;
  active_session_id?: string | null;
  joined_at: string;
}

export async function getSession() {
  if (!isSupabaseConfigured()) {
    return { supabase: null, user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { supabase, user, profile: profile as DbProfile | null };
}

export function mapProfile(profile: DbProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar || "",
    role: profile.role,
    subscriptionPlan: normalizeSubscriptionPlan(profile.subscription_plan),
    subscriptionExpiry: profile.subscription_expiry,
    subscriptionExempt: profile.subscription_exempt === true,
    joinedAt: profile.joined_at,
  };
}

export async function isProfileSessionValid(profile: DbProfile) {
  const cookieSessionId = await readActiveSessionCookie();
  return isActiveSessionValid(profile.active_session_id, cookieSessionId);
}

export async function requireAuth(role?: UserRole, options?: { requireActiveSession?: boolean }) {
  if (!isSupabaseConfigured()) {
    return { error: apiError("Backend not configured", 503) };
  }

  const { supabase, user, profile } = await getSession();

  if (!user || !profile) {
    return { error: apiError("Unauthorized", 401) };
  }

  if (role && profile.role !== role) {
    return { error: apiError("Forbidden", 403) };
  }

  if (options?.requireActiveSession && !(await isProfileSessionValid(profile))) {
    return {
      error: apiError(
        "Your account was signed in on another device. Please log in again.",
        401
      ),
    };
  }

  return { supabase, user, profile, profileUser: mapProfile(profile) };
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
