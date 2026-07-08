"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, SquarePen, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import type { MCQQuestion } from "@/types";

export default function TutorMcqPage() {
  const { courses, loading: coursesLoading } = useCourses();
  const [chapterId, setChapterId] = useState("");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loadingMcq, setLoadingMcq] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MCQQuestion | null>(null);
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_index: 0,
    explanation: "",
  });
  const [saving, setSaving] = useState(false);

  const chapters = courses.flatMap((course) =>
    course.lessons.flatMap((lesson) =>
      lesson.chapters.map((ch) => ({
        id: ch.id,
        label: `${course.title} / ${lesson.title} / ${ch.title}`,
      }))
    )
  );

  useEffect(() => {
    if (!chapterId && chapters[0]) setChapterId(chapters[0].id);
  }, [chapters, chapterId]);

  useEffect(() => {
    if (!chapterId) return;
    setLoadingMcq(true);
    apiClient
      .getMcq(chapterId)
      .then(setQuestions)
      .finally(() => setLoadingMcq(false));
  }, [chapterId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" });
    setOpen(true);
  };

  const openEdit = (mcq: MCQQuestion) => {
    setEditing(mcq);
    setForm({
      question: mcq.question,
      options: [...mcq.options],
      correct_index: mcq.correctIndex,
      explanation: mcq.explanation,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiClient.updateMcq({
          id: editing.id,
          question: form.question,
          options: form.options,
          correct_index: form.correct_index,
          explanation: form.explanation,
        });
      } else {
        await apiClient.createMcq({ chapter_id: chapterId, ...form });
      }
      setOpen(false);
      setQuestions(await apiClient.getMcq(chapterId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await apiClient.deleteMcq(id);
    setQuestions(await apiClient.getMcq(chapterId));
  };

  const loading = coursesLoading || loadingMcq;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">MCQ Questions</h1>
        <p className="text-muted-foreground">Manage quiz questions per chapter.</p>
      </motion.div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[280px] space-y-2">
          <Label>Chapter</Label>
          <Select value={chapterId} onValueChange={setChapterId}>
            <SelectTrigger>
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} disabled={!chapterId}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">
                    Q{i + 1}. {q.question}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Correct: {String.fromCharCode(65 + q.correctIndex)} — {q.options[q.correctIndex]}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                    <SquarePen className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            {form.options.map((opt, i) => (
              <div key={i} className="space-y-2">
                <Label>Option {String.fromCharCode(65 + i)}</Label>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const options = [...form.options];
                    options[i] = e.target.value;
                    setForm({ ...form, options });
                  }}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select
                value={String(form.correct_index)}
                onValueChange={(v) => setForm({ ...form, correct_index: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String.fromCharCode(65 + i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.question}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
