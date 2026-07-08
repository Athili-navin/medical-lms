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

  const lessonId = new URL(request.url).searchParams.get("lessonId");

  let query = auth.supabase!.from("chapters").select("*").order("order_index");
  if (lessonId) query = query.eq("lesson_id", lessonId);

  const { data, error } = await query;
  if (error) return apiError(error.message);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { lesson_id, title, content, order_index, duration } = await request.json();
  if (!lesson_id || !title) return apiError("lesson_id and title required", 400);

  const { data, error } = await auth.supabase!
    .from("chapters")
    .insert({
      lesson_id,
      title,
      content: content || "",
      order_index: order_index ?? 1,
      duration: duration ?? 15,
    })
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

  const { data, error } = await auth.supabase!.from("chapters").update(updates).eq("id", id).select().single();
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

  const { error } = await auth.supabase!.from("chapters").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
