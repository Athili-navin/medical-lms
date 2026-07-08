"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Video, Megaphone, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";
import { mockAnnouncements } from "@/lib/mock-data";

const quickLinks = [
  { label: "Manage Courses", href: "/tutor/courses", icon: BookOpen, description: "Create and edit courses" },
  { label: "Chapter Notes", href: "/tutor/chapters", icon: GraduationCap, description: "Write rich study notes" },
  { label: "Upload Videos", href: "/tutor/videos", icon: Video, description: "Attach lectures to chapters" },
  { label: "Announcements", href: "/tutor/announcements", icon: Megaphone, description: "Post updates for students" },
];

export default function TutorDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Tutor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user?.name?.split(" ")[0]}. Manage your courses and content below.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.div key={link.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{link.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={link.href}>
                      Open
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Announcements</CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link href="/tutor/announcements">
              Manage <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {mockAnnouncements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          ) : (
            <div className="space-y-2">
              {mockAnnouncements.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <span className="text-xs font-medium capitalize text-primary">{a.type}</span>
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
