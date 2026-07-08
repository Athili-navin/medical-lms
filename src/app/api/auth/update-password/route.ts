import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireBackend } from "@/lib/api/route-utils";
import { apiError } from "@/lib/api/auth-helpers";

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const { password } = await request.json();
  if (!password || typeof password !== "string" || password.length < 6) {
    return apiError("Password must be at least 6 characters", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return apiError("Auth session missing! Please open the reset link from your email again.", 401);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return apiError(error.message, 400);

  return NextResponse.json({ success: true });
}
