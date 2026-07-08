import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, apiError } from "@/lib/api/auth-helpers";
import { gateStudentSubscription } from "@/lib/api/require-subscription";
import { requireBackend } from "@/lib/api/route-utils";
import { mapCourse, mapLesson, mapChapter } from "@/lib/api/mock-store";
import type { Chapter, Lesson } from "@/types";

async function fetchCoursesFromSupabase() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*, profiles:instructor_id(name)")
    .order("created_at");

  if (error) throw error;
  if (!courses?.length) return [];

  const { data: lessons } = await supabase.from("lessons").select("*").order("order_index");
  const { data: chapters } = await supabase.from("chapters").select("*").order("order_index");
  const { data: videos } = await supabase.from("videos").select("id, chapter_id");
  const { data: pdfs } = await supabase.from("chapter_pdfs").select("id, chapter_id");

  const videoByChapter = new Map(videos?.map((v) => [v.chapter_id, v.id]) ?? []);
  const pdfByChapter = new Map(pdfs?.map((p) => [p.chapter_id, p.id]) ?? []);

  const chaptersByLesson = new Map<string, Chapter[]>();
  chapters?.forEach((ch) => {
    const list = chaptersByLesson.get(ch.lesson_id) ?? [];
    list.push(mapChapter(ch, videoByChapter.get(ch.id), pdfByChapter.get(ch.id)));
    chaptersByLesson.set(ch.lesson_id, list);
  });

  const lessonsByCourse = new Map<string, Lesson[]>();
  lessons?.forEach((ls) => {
    const list = lessonsByCourse.get(ls.course_id) ?? [];
    list.push(mapLesson(ls, chaptersByLesson.get(ls.id) ?? []));
    lessonsByCourse.set(ls.course_id, list);
  });

  return courses.map((c) =>
    mapCourse(
      { ...c, instructor_name: (c.profiles as { name?: string } | null)?.name },
      lessonsByCourse.get(c.id) ?? []
    )
  );
}

export async function GET() {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth();
  if ("error" in auth && auth.error) return auth.error;
  const subError = gateStudentSubscription(auth.profile);
  if (subError) return subError;

  try {
    const courses = await fetchCoursesFromSupabase();
    return NextResponse.json(courses);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Failed to load courses");
  }
}

export async function POST(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { title, description, thumbnail, category } = await request.json();
  if (!title) return apiError("Title is required", 400);

  const { data, error } = await auth.supabase!
    .from("courses")
    .insert({
      title,
      description: description || "",
      thumbnail: thumbnail || "",
      category: category || "dental",
      instructor_id: auth.user.id,
    })
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(mapCourse({ ...data, instructor_name: auth.profileUser.name }, []), {
    status: 201,
  });
}

export async function PATCH(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const { id, ...updates } = await request.json();
  if (!id) return apiError("Course id required", 400);

  const { data, error } = await auth.supabase!
    .from("courses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError(error.message);
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const backendError = requireBackend();
  if (backendError) return backendError;

  const auth = await requireAuth("tutor");
  if ("error" in auth && auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("Course id required", 400);

  const { error } = await auth.supabase!.from("courses").delete().eq("id", id);
  if (error) return apiError(error.message);
  return NextResponse.json({ success: true });
}
