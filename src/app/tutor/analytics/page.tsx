"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { mockTutorAnalytics } from "@/lib/mock-data";

export default function TutorAnalyticsPage() {
  const analytics = mockTutorAnalytics;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Analytics</h1>
        <p className="text-muted-foreground">Track student engagement and course performance.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", value: analytics.totalStudents.toLocaleString(), icon: Users },
          { label: "Completion Rate", value: `${analytics.completionRate}%`, icon: TrendingUp },
          { label: "Monthly Revenue", value: `$${analytics.monthlyRevenue.toLocaleString()}`, icon: BarChart3 },
          { label: "Student Growth", value: `+${analytics.studentGrowth}%`, icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Popular Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.popularCourses.map((course) => {
              const pct = Math.round((course.enrollments / analytics.totalStudents) * 100);
              return (
                <div key={course.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{course.name}</span>
                    <span className="font-medium">{course.enrollments} enrollments</span>
                  </div>
                  <ProgressBar value={pct} showLabel={false} size="sm" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Lesson Completion", value: 72 },
              { label: "Video Watch Rate", value: 85 },
              { label: "Notes Usage", value: 45 },
              { label: "Live Class Attendance", value: 58 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{metric.label}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <ProgressBar value={metric.value} showLabel={false} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentEnrollments.map((e) => (
                  <tr key={`${e.student}-${e.date}`} className="border-b last:border-0">
                    <td className="py-3 font-medium">{e.student}</td>
                    <td className="py-3 text-muted-foreground">{e.course}</td>
                    <td className="py-3 text-muted-foreground">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
