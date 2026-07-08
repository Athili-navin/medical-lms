import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

export async function GET() {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const { data, error } = await auth.supabase!
    .from("chapter_progress")
    .select("chapter_id")
    .eq("user_id", auth.user.id);

  if (error) return apiError(error.message);
  return NextResponse.json(data?.map((row) => row.chapter_id) ?? []);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const { chapter_id } = await request.json();
  if (!chapter_id) return apiError("chapter_id required", 400);

  const { error } = await auth.supabase!
    .from("chapter_progress")
    .upsert({ user_id: auth.user.id, chapter_id });

  if (error) return apiError(error.message);
  return NextResponse.json({ chapter_id, completed: true });
}
