"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { StickyNote, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/stores";
import { useCourses } from "@/hooks/use-courses";
import { buildChapterMap } from "@/lib/course-utils";
import { apiClient } from "@/lib/api/client";

export default function NotesPage() {
  const saveNote = useNotesStore((s) => s.saveNote);
  const { courses, loading: coursesLoading } = useCourses();
  const [remoteNotes, setRemoteNotes] = useState<
    Array<{ chapterId: string; content: string; updatedAt: string }>
  >([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [error, setError] = useState("");

  const chapterMap = buildChapterMap(courses);

  useEffect(() => {
    apiClient
      .getAllNotes()
      .then((notes) => {
        notes.forEach((note) => saveNote(note.chapterId, note.content));
        setRemoteNotes(notes.filter((n) => n.content.trim()));
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load notes"))
      .finally(() => setNotesLoading(false));
  }, [saveNote]);

  const savedNotes = useMemo(
    () => remoteNotes.filter((n) => n.content.trim()),
    [remoteNotes]
  );

  const loading = coursesLoading || notesLoading;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">My Notes</h1>
        <p className="text-muted-foreground">All your personal study notes saved to your account.</p>
      </motion.div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : savedNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <StickyNote className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No notes yet</h3>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Open a chapter and use the Personal Notes panel on the right. Notes auto-save to Supabase.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {savedNotes.map((note, i) => {
            const meta = chapterMap.get(note.chapterId);
            return (
              <motion.div
                key={note.chapterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1 text-base">
                      {meta?.chapterTitle ?? "Chapter Note"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {meta ? `${meta.courseTitle} · ${meta.lessonTitle}` : "Saved to your account"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-4 text-sm text-muted-foreground">{note.content}</p>
                    {meta && (
                      <Button variant="link" size="sm" className="mt-2 px-0" asChild>
                        <Link href={`/dashboard/courses/${meta.courseId}/${meta.lessonId}/${note.chapterId}`}>
                          Open Chapter <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
