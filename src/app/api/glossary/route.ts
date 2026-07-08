import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { requireBackend } from "@/lib/api/route-utils";
import { resolveStorageUrl } from "@/lib/api/resolve-storage-url";
import { GLOSSARY_IMAGE_BUCKET } from "@/lib/supabase/storage-constants";
import type { GlossaryEntry } from "@/types";
import { gateStudentSubscription } from "@/lib/api/require-subscription";

async function mapGlossaryRows(
  supabase: NonNullable<Awaited<ReturnType<typeof requireAuth>>["supabase"]>,
  rows: GlossaryEntry[],
  withSignedImages: boolean
) {
  if (!withSignedImages) return rows;
  return Promise.all(
    rows.map(async (row) => {
      if (!row.image_url || row.image_url.startsWith("http")) {
        return { ...row, image_preview_url: row.image_url || undefined };
      }
      try {
        const signed = await resolveStorageUrl(supabase!, GLOSSARY_IMAGE_BUCKET, row.image_url);
        return { ...row, image_preview_url: signed };
      } catch {
        return row;
      }
    })
  );
}

export async function GET(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId") ?? undefined;
  const courseId = searchParams.get("courseId") ?? undefined;
  const signedImages = searchParams.get("signedImages") === "1";

  let query = auth.supabase!.from("glossary_terms").select("*").order("term");

  if (chapterId) {
    query = query.or(`chapter_id.eq.${chapterId},chapter_id.is.null`);
  } else if (courseId) {
    query = query.or(`course_id.eq.${courseId},course_id.is.null`);
  }

  const { data, error } = await query;
  if (error) return apiError(error.message);
  const mapped = await mapGlossaryRows(auth.supabase!, (data ?? []) as GlossaryEntry[], signedImages);
  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { term, definition, chapter_id, course_id, image_url } = await request.json();
  if (!term || !definition) return apiError("term and definition required", 400);

  const { data, error } = await auth.supabase!
    .from("glossary_terms")
    .insert({ term, definition, chapter_id, course_id, image_url: image_url || "" })
    .select()
    .single();

  if (error) return apiError(error.message);
  const [mapped] = await mapGlossaryRows(auth.supabase!, [data as GlossaryEntry], true);
  return NextResponse.json(mapped, { status: 201 });
}

export async function PATCH(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { id, ...updates } = await request.json();
  if (!id) return apiError("id required", 400);

  const { data, error } = await auth.supabase!.from("glossary_terms").update(updates).eq("id", id).select().single();
  if (error) return apiError(error.message);
  const [mapped] = await mapGlossaryRows(auth.supabase!, [data as GlossaryEntry], true);
  return NextResponse.json(mapped);
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { error } = await auth.supabase!.from("glossary_terms").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
