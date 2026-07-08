"use client";

import { motion } from "framer-motion";
import { ProfileCard } from "@/components/shared/profile-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { useAuthStore } from "@/stores";
import { useCourses } from "@/hooks/use-courses";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { courses, loading } = useCourses();
  const overallProgress = courses.length
    ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
    : 0;

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Profile</h1>
        <p className="text-muted-foreground">Your account information and learning progress.</p>
      </motion.div>

      <ProfileCard user={user} overallProgress={overallProgress} />

      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No course progress yet.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{course.title}</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <ProgressBar value={course.progress} showLabel={false} size="sm" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
