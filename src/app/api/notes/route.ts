import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

function mapNote(row: { chapter_id: string; content: string; updated_at: string }) {
  return {
    chapterId: row.chapter_id,
    content: row.content ?? "",
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const chapterId = new URL(request.url).searchParams.get("chapterId");

  if (chapterId) {
    const { data, error } = await auth.supabase!
      .from("personal_notes")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("chapter_id", chapterId)
      .maybeSingle();
    if (error) return apiError(error.message);
    return NextResponse.json(data ? mapNote(data) : null);
  }

  const { data, error } = await auth.supabase!
    .from("personal_notes")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });
  if (error) return apiError(error.message);
  return NextResponse.json((data ?? []).map(mapNote));
}

export async function PUT(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const { chapter_id, content } = await request.json();
  if (!chapter_id) return apiError("chapter_id required", 400);

  const { data, error } = await auth.supabase!
    .from("personal_notes")
    .upsert(
      {
        user_id: auth.user.id,
        chapter_id,
        content: content ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,chapter_id" }
    )
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json({
    chapterId: data.chapter_id,
    content: data.content,
    updatedAt: data.updated_at,
  });
}
