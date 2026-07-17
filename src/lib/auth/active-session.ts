import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ACTIVE_SESSION_COOKIE = "er_active_session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function createSessionId() {
  return crypto.randomUUID();
}

export function setActiveSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(ACTIVE_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearActiveSessionCookie(response: NextResponse) {
  response.cookies.set(ACTIVE_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readActiveSessionCookie(request?: NextRequest) {
  if (request) {
    return request.cookies.get(ACTIVE_SESSION_COOKIE)?.value;
  }
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_SESSION_COOKIE)?.value;
}

export function isActiveSessionValid(
  profileSessionId: string | null | undefined,
  cookieSessionId: string | undefined
) {
  if (!profileSessionId || !cookieSessionId) return false;
  return profileSessionId === cookieSessionId;
}

export async function registerActiveSessionForUser(
  supabase: SupabaseClient,
  userId: string
) {
  const sessionId = createSessionId();
  const { error } = await supabase
    .from("profiles")
    .update({ active_session_id: sessionId })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return sessionId;
}
