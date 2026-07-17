import { NextResponse } from "next/server";
import { getSession, isProfileSessionValid, mapProfile } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";

export async function GET() {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const { user, profile } = await getSession();
  if (user && profile) {
    const sessionValid = await isProfileSessionValid(profile);
    const needsSessionRegistration = !profile.active_session_id;
    return NextResponse.json({ user: mapProfile(profile), sessionValid, needsSessionRegistration });
  }
  return NextResponse.json({ user: null, sessionValid: false, needsSessionRegistration: false });
}
