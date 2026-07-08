"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, CreditCard, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { CourseCard } from "@/components/shared/course-card";
import { CoursesEmptyState } from "@/components/shared/courses-empty-state";
import { useAuthStore } from "@/stores";
import { useCourses } from "@/hooks/use-courses";
import { mockActivities } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { courses, loading } = useCourses();
  const overallProgress = courses.length
    ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
    : 0;
  const continueCourse = courses[0];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">Continue your medical education journey.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <div className="gradient-medical p-6 text-white">
              <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                {user?.subscriptionExempt
                  ? "Testing Access"
                  : user?.subscriptionPlan === "yearly"
                    ? "Yearly Plan Active"
                    : user?.subscriptionPlan === "monthly"
                      ? "Legacy Plan Active"
                      : "Subscribe to Access"}
              </Badge>
              <h2 className="text-xl font-bold">Keep up the great work!</h2>
              <p className="mt-2 text-white/80">
                You&apos;re {overallProgress}% through your enrolled courses. Stay consistent to reach your goals.
              </p>
            </div>
            <CardContent className="pt-6">
              <ProgressBar value={overallProgress} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Subscription */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">
                {user?.subscriptionExempt ? "Testing" : user?.subscriptionPlan === "none" ? "None" : "Yearly"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.subscriptionExpiry
                  ? `Valid until ${formatDate(user.subscriptionExpiry)}`
                  : user?.subscriptionExempt
                    ? "Full platform access"
                    : "Subscribe for ₹2,000/year"}
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/subscription">Manage Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : continueCourse ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold">{continueCourse.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {continueCourse.totalLessons} lessons · {continueCourse.totalChapters} chapters
                    </p>
                    <ProgressBar value={continueCourse.progress} size="sm" className="mt-3" />
                  </div>
                  <Button asChild>
                    <Link href={`/dashboard/courses/${continueCourse.id}`}>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No courses to continue yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses yet.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="mr-2 truncate">{course.title}</span>
                      <span className="font-medium text-primary">{course.progress}%</span>
                    </div>
                    <ProgressBar value={course.progress} showLabel={false} size="sm" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Your Courses</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <CoursesEmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
