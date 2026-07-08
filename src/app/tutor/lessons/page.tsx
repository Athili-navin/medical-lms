"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import type { Lesson } from "@/types";

export default function TutorLessonsPage() {
  const { courses, loading, refresh } = useCourses();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [courseId, setCourseId] = useState("");
  const [form, setForm] = useState({ title: "", description: "", order_index: 1 });
  const [saving, setSaving] = useState(false);

  const openCreate = (cid: string) => {
    setEditing(null);
    setCourseId(cid);
    const course = courses.find((c) => c.id === cid);
    setForm({ title: "", description: "", order_index: (course?.lessons.length ?? 0) + 1 });
    setOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson);
    setCourseId(lesson.courseId);
    setForm({ title: lesson.title, description: lesson.description, order_index: lesson.order });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiClient.updateLesson({ id: editing.id, title: form.title, description: form.description, order_index: form.order_index });
      } else {
        await apiClient.createLesson({ course_id: courseId, ...form });
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
    if (!confirm("Delete this lesson?")) return;
    await apiClient.deleteLesson(id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Lesson Management</h1>
        <p className="text-muted-foreground">Organize lessons across your courses.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <Tabs defaultValue={courses[0]?.id}>
          <TabsList className="flex-wrap h-auto">
            {courses.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>{c.title.split(" ")[0]}</TabsTrigger>
            ))}
          </TabsList>
          {courses.map((course) => (
            <TabsContent key={course.id} value={course.id} className="mt-4 space-y-3">
              <Button size="sm" onClick={() => openCreate(course.id)}><Plus className="mr-1 h-4 w-4" /> Add Lesson</Button>
              {course.lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{lesson.order}</Badge>
                      <CardTitle className="text-base">{lesson.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(lesson)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{lesson.chapters.length} chapters · {lesson.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Lesson" : "Add Lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
