import type { Course, Chapter, Lesson, Video, MCQQuestion, McqQuestionType, ChapterPdf } from "@/types";
import { mockCourses, mockVideos, mockAnnouncements } from "@/lib/mock-data";
import { getMcqByChapterId } from "@/lib/mock-data/mcq";
import { NOTE_GLOSSARY } from "@/lib/glossary";

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  chapter_id: string | null;
  course_id: string | null;
}

interface MockStore {
  courses: Course[];
  announcements: typeof mockAnnouncements;
  glossary: GlossaryEntry[];
  mcqByChapter: Record<string, MCQQuestion[]>;
}

const store: MockStore = {
  courses: structuredClone(mockCourses),
  announcements: [...mockAnnouncements],
  glossary: Object.entries(NOTE_GLOSSARY).map(([term, definition], i) => ({
    id: `glossary-${i}`,
    term,
    definition,
    chapter_id: null,
    course_id: null,
  })),
  mcqByChapter: {},
};

export function getMockStore(): MockStore {
  return store;
}

export function mapCourse(row: Record<string, unknown>, lessons: Lesson[] = []): Course {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    thumbnail: (row.thumbnail as string) || "",
    category: row.category as Course["category"],
    instructor: (row.instructor_name as string) || "Instructor",
    totalLessons: lessons.length,
    totalChapters: lessons.reduce((n, l) => n + l.chapters.length, 0),
    progress: 0,
    lessons,
  };
}

export function mapLesson(row: Record<string, unknown>, chapters: Chapter[] = []): Lesson {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    order: row.order_index as number,
    chapters,
  };
}

export function mapChapter(row: Record<string, unknown>, videoId?: string, pdfId?: string): Chapter {
  return {
    id: row.id as string,
    lessonId: row.lesson_id as string,
    title: row.title as string,
    order: row.order_index as number,
    content: (row.content as string) || "",
    videoId,
    pdfId,
    duration: (row.duration as number) || 15,
    isCompleted: false,
  };
}

export function mapChapterPdf(row: Record<string, unknown>): ChapterPdf {
  return {
    id: row.id as string,
    chapterId: row.chapter_id as string,
    title: (row.title as string) || "Chapter PDF",
    url: row.url as string,
    fileName: (row.file_name as string) || "",
  };
}

export function mapVideo(row: Record<string, unknown>): Video {
  return {
    id: row.id as string,
    title: row.title as string,
    chapterId: row.chapter_id as string,
    duration: (row.duration as number) || 0,
    thumbnail: (row.thumbnail as string) || "",
    url: row.url as string,
  };
}

function inferQuestionType(
  row: Record<string, unknown>,
  statements: string[]
): McqQuestionType {
  const explicit = row.question_type as McqQuestionType | undefined;
  if (explicit === "normal" || explicit === "statement" || explicit === "image") return explicit;
  const imagePath = (row.image_path as string) || "";
  if (imagePath) return "image";
  if (statements.length > 0) return "statement";
  return "normal";
}

export function mapMcq(row: Record<string, unknown>): MCQQuestion {
  const rawStatements = row.statements;
  const statements = Array.isArray(rawStatements)
    ? rawStatements.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  const imagePath = (row.image_path as string) || undefined;
  const rawOptionImages = row.option_images;
  const optionImages = Array.isArray(rawOptionImages)
    ? rawOptionImages.map((p) => (typeof p === "string" ? p : ""))
    : [];

  return {
    id: row.id as string,
    chapterId: row.chapter_id as string,
    questionType: inferQuestionType(row, statements),
    question: row.question as string,
    statements,
    imagePath: imagePath || undefined,
    options: row.options as string[],
    optionImages,
    correctIndex: row.correct_index as number,
    explanation: (row.explanation as string) || "",
  };
}

export function getMockVideos(): Video[] {
  return mockVideos;
}

export function getDefaultMcqForChapter(chapterId: string): MCQQuestion[] {
  if (!store.mcqByChapter[chapterId]) {
    store.mcqByChapter[chapterId] = getMcqByChapterId(chapterId);
  }
  return store.mcqByChapter[chapterId];
}

export function filterGlossary(chapterId?: string, courseId?: string): GlossaryEntry[] {
  return store.glossary.filter(
    (g) =>
      (!chapterId && !courseId) ||
      g.chapter_id === chapterId ||
      g.course_id === courseId ||
      (!g.chapter_id && !g.course_id)
  );
}
