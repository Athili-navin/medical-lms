"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, CheckCircle2, ChevronLeft, ChevronRight, ListChecks, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterCard } from "@/components/shared/chapter-card";
import { NotesEditor } from "@/components/shared/notes-editor";
import { NotesContentRenderer } from "@/components/shared/notes-content-renderer";
import { ChapterMcqPanel } from "@/components/shared/chapter-mcq-panel";
import { CourseMissingState } from "@/components/shared/course-missing-state";
import { useCourse } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import { glossaryToRichMap, mergeGlossaryMaps } from "@/lib/glossary-map";
import { NOTE_GLOSSARY } from "@/lib/glossary";
import type { GlossaryTooltip } from "@/types";
import { useProgressStore, useVideoModalStore } from "@/stores";

const staticGlossary: Record<string, GlossaryTooltip> = Object.fromEntries(
  Object.entries(NOTE_GLOSSARY).map(([k, v]) => [k, { definition: v }])
);

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string; chapterId: string }>;
}

export default function ChapterPage({ params }: PageProps) {
  const { courseId, lessonId, chapterId } = use(params);
  const [activeTab, setActiveTab] = useState("notes");
  const [glossary, setGlossary] = useState<Record<string, GlossaryTooltip>>({});
  const { course, loading } = useCourse(courseId);
  const { isCompleted, markComplete, loadProgress } = useProgressStore();
  const openVideo = useVideoModalStore((s) => s.openVideo);

  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const chapter = lesson?.chapters.find((c) => c.id === chapterId);

  useEffect(() => {
    setActiveTab("notes");
  }, [chapterId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    apiClient
      .getGlossary(chapterId, courseId, true)
      .then((entries) => setGlossary(mergeGlossaryMaps(staticGlossary, glossaryToRichMap(entries))))
      .catch(() => setGlossary(staticGlossary));
  }, [chapterId, courseId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course || !chapter || !lesson) return <CourseMissingState />;

  const completed = isCompleted(chapterId) || chapter.isCompleted;
  const chapterIndex = lesson.chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapterIndex > 0 ? lesson.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < lesson.chapters.length - 1 ? lesson.chapters[chapterIndex + 1] : null;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm text-muted-foreground">{course.title} / {lesson.title}</p>
        <h1 className="text-2xl font-bold mt-1">{chapter.title}</h1>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-2 order-2 lg:order-1">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Chapters</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] lg:h-[calc(100vh-280px)]">
              <div className="px-2 pb-2">
                {lesson.chapters.map((ch) => (
                  <ChapterCard
                    key={ch.id}
                    chapter={ch}
                    href={`/dashboard/courses/${courseId}/${lessonId}/${ch.id}`}
                    isActive={ch.id === chapterId}
                    compact
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 order-1 lg:order-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <CardTitle className="text-base">
                  {activeTab === "notes" ? "Chapter Notes" : "Chapter MCQ Quiz"}
                </CardTitle>
                <TabsList>
                  <TabsTrigger value="notes" className="gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="mcq" className="gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    MCQ Quiz
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapter.videoId && (
                  <Button size="sm" variant="outline" onClick={() => openVideo(chapter.videoId!)}>
                    <Play className="mr-1 h-4 w-4" />
                    Play Video
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={activeTab === "mcq" ? "default" : "outline"}
                  onClick={() => setActiveTab("mcq")}
                >
                  <ListChecks className="mr-1 h-4 w-4" />
                  MCQ Quiz
                </Button>
                <Button
                  size="sm"
                  variant={completed ? "secondary" : "default"}
                  onClick={() => markComplete(chapterId)}
                  disabled={completed}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  {completed ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <TabsContent value="notes" className="mt-0 prose prose-sm dark:prose-invert max-w-none">
                <NotesContentRenderer content={chapter.content} glossary={glossary} />
              </TabsContent>
              <TabsContent value="mcq" className="mt-0">
                <ChapterMcqPanel chapterId={chapterId} />
              </TabsContent>
            </CardContent>
          </Tabs>
          <div className="flex items-center justify-between border-t p-4">
            {prevChapter ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/courses/${courseId}/${lessonId}/${prevChapter.id}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextChapter && (
              <Button size="sm" asChild>
                <Link href={`/dashboard/courses/${courseId}/${lessonId}/${nextChapter.id}`}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-3 order-3">
          <CardContent className="pt-6">
            <NotesEditor chapterId={chapterId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
