"use client";

import { use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, User, Layers, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { LessonCard } from "@/components/shared/lesson-card";
import { CourseMissingState } from "@/components/shared/course-missing-state";
import { useCourse } from "@/hooks/use-courses";
import { getCourseThumbnail } from "@/lib/course-utils";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailsPage({ params }: PageProps) {
  const { courseId } = use(params);
  const { course, loading } = useCourse(courseId);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) return <CourseMissingState />;

  const thumbnail = getCourseThumbnail(course.thumbnail);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl">
          <Image src={thumbnail} alt={course.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 p-6 text-white">
            <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-medium capitalize mb-2">
              {course.category}
            </span>
            <h1 className="text-2xl font-bold lg:text-3xl">{course.title}</h1>
            <p className="mt-2 text-white/80 max-w-2xl">{course.description}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{course.description}</p>
            <ProgressBar value={course.progress} />
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.totalLessons} Lessons</span>
              <span className="flex items-center gap-1"><Layers className="h-4 w-4" /> {course.totalChapters} Chapters</span>
              <span className="flex items-center gap-1"><User className="h-4 w-4" /> {course.instructor}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{course.progress}%</p>
              <p className="text-sm text-muted-foreground mt-1">Course completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Lessons</h2>
        {course.lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">This course has no lessons yet.</p>
        ) : (
          <div className="space-y-3">
            {course.lessons.map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} courseId={course.id} defaultOpen={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
