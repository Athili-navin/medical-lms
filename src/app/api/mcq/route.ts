import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { mapMcq } from "@/lib/api/mock-store";
import { gateStudentSubscription } from "@/lib/api/require-subscription";
import {
  formatMcqDbError,
  isOutdatedMcqSchemaError,
  legacyMcqInsertRow,
  legacyMcqUpdateFields,
  needsMcqMigrationForPayload,
} from "@/lib/mcq/db-compat";

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) return apiError("chapterId required", 400);

  const { data, error } = await auth.supabase!
    .from("mcq_questions")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("order_index");

  if (error) return apiError(formatMcqDbError(error.message));
  return NextResponse.json(data?.map(mapMcq) ?? []);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const {
    chapter_id,
    question,
    question_type,
    statements,
    image_path,
    option_images,
    options,
    correct_index,
    explanation,
    order_index,
  } = body;

  if (!chapter_id || !question || !options?.length) {
    return apiError("chapter_id, question, options required", 400);
  }

  const fullRow = {
    chapter_id,
    question,
    question_type: question_type || "normal",
    statements: Array.isArray(statements) ? statements.filter(Boolean) : [],
    image_path: image_path || "",
    option_images: Array.isArray(option_images) ? option_images : [],
    options,
    correct_index: correct_index ?? 0,
    explanation: explanation || "",
    order_index: order_index ?? 1,
  };

  let { data, error } = await auth.supabase!.from("mcq_questions").insert(fullRow).select().single();

  if (error && isOutdatedMcqSchemaError(error.message)) {
    const migrationNeeded = needsMcqMigrationForPayload(fullRow);
    if (migrationNeeded) return apiError(migrationNeeded, 400);

    ({ data, error } = await auth
      .supabase!.from("mcq_questions")
      .insert(legacyMcqInsertRow(fullRow))
      .select()
      .single());
  }

  if (error) return apiError(formatMcqDbError(error.message));
  return NextResponse.json(mapMcq(data), { status: 201 });
}

export async function PATCH(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { id, ...updates } = await request.json();
  if (!id) return apiError("id required", 400);

  let { data, error } = await auth.supabase!.from("mcq_questions").update(updates).eq("id", id).select().single();

  if (error && isOutdatedMcqSchemaError(error.message)) {
    const migrationNeeded = needsMcqMigrationForPayload(updates as Parameters<typeof needsMcqMigrationForPayload>[0]);
    if (migrationNeeded) return apiError(migrationNeeded, 400);

    ({ data, error } = await auth
      .supabase!.from("mcq_questions")
      .update(legacyMcqUpdateFields(updates))
      .eq("id", id)
      .select()
      .single());
  }

  if (error) return apiError(formatMcqDbError(error.message));
  return NextResponse.json(mapMcq(data));
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { error } = await auth.supabase!.from("mcq_questions").delete().eq("id", id);
  if (error) return apiError(formatMcqDbError(error.message));
  return NextResponse.json({ success: true });
}
