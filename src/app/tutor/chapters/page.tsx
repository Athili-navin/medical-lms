"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichNotesEditor } from "@/components/shared/rich-notes-editor";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import { formatDuration } from "@/lib/utils";
import type { Chapter } from "@/types";

type ChapterRow = Chapter & { courseTitle: string; lessonTitle: string; lessonId: string };

const EMPTY_NOTES = "<p>Start writing your chapter notes here…</p>";

export default function TutorChaptersPage() {
  const { courses, loading, refresh } = useCourses();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ChapterRow | null>(null);
  const [lessonId, setLessonId] = useState("");
  const [form, setForm] = useState({ title: "", content: "", order_index: 1, duration: 15 });
  const [saving, setSaving] = useState(false);

  const allChapters: ChapterRow[] = courses.flatMap((course) =>
    course.lessons.flatMap((lesson) =>
      lesson.chapters.map((chapter) => ({
        ...chapter,
        courseTitle: course.title,
        lessonTitle: lesson.title,
        lessonId: lesson.id,
      }))
    )
  );

  const lessons = courses.flatMap((c) => c.lessons.map((l) => ({ ...l, courseTitle: c.title })));

  const openCreate = () => {
    setEditing(null);
    setLessonId(lessons[0]?.id ?? "");
    setForm({ title: "", content: EMPTY_NOTES, order_index: 1, duration: 15 });
    setOpen(true);
  };

  const openEdit = (chapter: ChapterRow) => {
    setEditing(chapter);
    setLessonId(chapter.lessonId);
    setForm({
      title: chapter.title,
      content: chapter.content || EMPTY_NOTES,
      order_index: chapter.order,
      duration: chapter.duration,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiClient.updateChapter({
          id: editing.id,
          title: form.title,
          content: form.content,
          order_index: form.order_index,
          duration: form.duration,
        });
      } else {
        await apiClient.createChapter({ lesson_id: lessonId, ...form });
      }
      setOpen(false);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this chapter?")) return;
    await apiClient.deleteChapter(id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold lg:text-3xl">Chapter Notes</h1>
          <p className="text-muted-foreground">
            Write rich notes with fonts, alignment, tables, and multiple pages.
          </p>
        </motion.div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Chapter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-2 pr-4">
            {allChapters.map((chapter) => (
              <Card key={chapter.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{chapter.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {chapter.courseTitle} · {chapter.lessonTitle}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline">{formatDuration(chapter.duration)}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(chapter)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(chapter.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[95vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{editing ? "Edit Chapter Notes" : "Add Chapter"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto px-6 py-4">
            {!editing && (
              <div className="space-y-2">
                <Label>Lesson</Label>
                <Select value={lessonId} onValueChange={setLessonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.courseTitle} — {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
              <div className="space-y-2">
                <Label>Chapter Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (use toolbar for formatting · page break icon for new pages)</Label>
              <RichNotesEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Write chapter notes…"
                chapterId={editing?.id}
              />
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
