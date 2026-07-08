"use client";

import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ChapterCard } from "@/components/shared/chapter-card";
import type { Lesson } from "@/types";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: Lesson;
  courseId: string;
  defaultOpen?: boolean;
  className?: string;
}

export function LessonCard({ lesson, courseId, defaultOpen, className }: LessonCardProps) {
  const completedCount = lesson.chapters.filter((c) => c.isCompleted).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("rounded-lg border bg-card", className)}
    >
      <Accordion type="single" collapsible defaultValue={defaultOpen ? lesson.id : undefined}>
        <AccordionItem value={lesson.id} className="border-none">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex flex-1 items-center gap-3 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {lesson.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{lesson.title}</p>
                <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 hidden sm:flex">
                {completedCount}/{lesson.chapters.length} chapters
              </Badge>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground sm:hidden" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2 pl-11">
              {lesson.chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  href={`/dashboard/courses/${courseId}/${lesson.id}/${chapter.id}`}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

export function LessonCardCompact({ lesson, courseId }: LessonCardProps) {
  return (
    <Link
      href={`/dashboard/courses/${courseId}/${lesson.id}/${lesson.chapters[0]?.id}`}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {lesson.order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">{lesson.chapters.length} chapters</p>
      </div>
      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
