import { NextResponse } from "next/server";
import { getSession, mapProfile } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";

export async function GET() {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const { user, profile } = await getSession();
  if (user && profile) {
    return NextResponse.json({ user: mapProfile(profile) });
  }
  return NextResponse.json({ user: null });
}
