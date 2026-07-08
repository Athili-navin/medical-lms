import type { Course } from "@/types";

export const DEFAULT_COURSE_THUMBNAIL =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop";

export function getCourseThumbnail(thumbnail?: string) {
  return thumbnail?.trim() ? thumbnail : DEFAULT_COURSE_THUMBNAIL;
}

export function buildChapterMap(courses: Course[]) {
  const chapterMap = new Map<
    string,
    { courseTitle: string; lessonTitle: string; chapterTitle: string; courseId: string; lessonId: string }
  >();

  courses.forEach((course) => {
    course.lessons.forEach((lesson) => {
      lesson.chapters.forEach((chapter) => {
        chapterMap.set(chapter.id, {
          courseTitle: course.title,
          lessonTitle: lesson.title,
          chapterTitle: chapter.title,
          courseId: course.id,
          lessonId: lesson.id,
        });
      });
    });
  });

  return chapterMap;
}
