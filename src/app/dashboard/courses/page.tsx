"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { CourseCard } from "@/components/shared/course-card";
import { CoursesEmptyState } from "@/components/shared/courses-empty-state";
import { useCourses } from "@/hooks/use-courses";

export default function CoursesPage() {
  const { courses, loading } = useCourses();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">My Courses</h1>
        <p className="text-muted-foreground">Explore your enrolled medical courses.</p>
      </motion.div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <CoursesEmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
