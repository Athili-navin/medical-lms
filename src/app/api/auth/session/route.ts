import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import {
  clearActiveSessionCookie,
  registerActiveSessionForUser,
  setActiveSessionCookie,
} from "@/lib/auth/active-session";

/** Claim the single allowed login slot for this account on this device. */
export async function POST() {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const sessionId = await registerActiveSessionForUser(auth.supabase!, auth.user!.id);
    const response = NextResponse.json({ ok: true });
    setActiveSessionCookie(response, sessionId);
    return response;
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Could not register session", 500);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearActiveSessionCookie(response);
  return response;
}
