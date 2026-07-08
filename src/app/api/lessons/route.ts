import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const courseId = new URL(request.url).searchParams.get("courseId");

  let query = auth.supabase!.from("lessons").select("*").order("order_index");
  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query;
  if (error) return apiError(error.message);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { course_id, title, description, order_index } = await request.json();
  if (!course_id || !title) return apiError("course_id and title required", 400);

  const { data, error } = await auth.supabase!
    .from("lessons")
    .insert({ course_id, title, description, order_index: order_index ?? 1 })
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { id, ...updates } = await request.json();
  if (!id) return apiError("id required", 400);

  const { data, error } = await auth.supabase!.from("lessons").update(updates).eq("id", id).select().single();
  if (error) return apiError(error.message);
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { error } = await auth.supabase!.from("lessons").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
