"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import type { Course } from "@/types";
import { cn } from "@/lib/utils";
import { getCourseThumbnail } from "@/lib/course-utils";

interface CourseCardProps {
  course: Course;
  href?: string;
  className?: string;
}

export function CourseCard({ course, href, className }: CourseCardProps) {
  const linkHref = href ?? `/dashboard/courses/${course.id}`;
  const thumbnail = getCourseThumbnail(course.thumbnail);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn("h-full", className)}
    >
      <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <Badge className="absolute left-3 top-3 capitalize" variant="secondary">
            {course.category}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold leading-tight">{course.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <ProgressBar value={course.progress} size="sm" />
          <p className="mt-2 text-xs text-muted-foreground">
            {course.totalLessons} lessons · {course.totalChapters} chapters · {course.instructor}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full group-hover:bg-primary/90">
            <Link href={linkHref}>
              Open Course
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
