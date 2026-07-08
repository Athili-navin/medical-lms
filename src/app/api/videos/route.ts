import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { mapVideo } from "@/lib/api/mock-store";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await auth.supabase!.from("videos").select("*").eq("id", id).maybeSingle();
    if (error) return apiError(error.message);
    return NextResponse.json(data ? mapVideo(data) : null);
  }

  if (chapterId) {
    const { data, error } = await auth.supabase!
      .from("videos")
      .select("*")
      .eq("chapter_id", chapterId)
      .maybeSingle();
    if (error) return apiError(error.message);
    return NextResponse.json(data ? mapVideo(data) : null);
  }

  return apiError("id or chapterId required", 400);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { chapter_id, title, url, thumbnail, duration } = await request.json();
  if (!chapter_id || !title || !url) return apiError("chapter_id, title, url required", 400);

  const { data: existing } = await auth.supabase!
    .from("videos")
    .select("id")
    .eq("chapter_id", chapter_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await auth.supabase!
      .from("videos")
      .update({ title, url, thumbnail, duration: duration ?? 0 })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return apiError(error.message);
    return NextResponse.json(mapVideo(data));
  }

  const { data, error } = await auth.supabase!
    .from("videos")
    .insert({ chapter_id, title, url, thumbnail, duration: duration ?? 0 })
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(mapVideo(data), { status: 201 });
}

export async function PATCH(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { id, ...updates } = await request.json();
  if (!id) return apiError("id required", 400);

  const { data, error } = await auth.supabase!
    .from("videos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(mapVideo(data));
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { error } = await auth.supabase!.from("videos").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
