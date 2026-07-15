"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, SquarePen, Trash2, Loader2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoteImage } from "@/components/shared/note-image";
import { McqOptionEditor } from "@/components/shared/mcq-option-editor";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import {
  createMcqForm,
  mcqFormFromQuestion,
  mcqFormToPayload,
  MCQ_TYPE_LABELS,
  optionHasContent,
  validateMcqForm,
  type McqFormState,
} from "@/lib/mcq/form-utils";
import { uploadMcqImage } from "@/lib/mcq/upload-mcq-image";
import { defaultStatementOptions } from "@/lib/mock-data/mcq";
import type { MCQQuestion, McqQuestionType } from "@/types";

export default function TutorMcqPage() {
  const { courses, loading: coursesLoading } = useCourses();
  const [chapterId, setChapterId] = useState("");
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loadingMcq, setLoadingMcq] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MCQQuestion | null>(null);
  const [form, setForm] = useState<McqFormState>(createMcqForm("normal"));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingOptionIndex, setUploadingOptionIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const setQuestionType = (type: McqQuestionType) => {
    setForm(createMcqForm(type));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(createMcqForm("normal"));
    setSaveError(null);
    setOpen(true);
  };

  const openEdit = (mcq: MCQQuestion) => {
    setEditing(mcq);
    setForm(mcqFormFromQuestion(mcq));
    setSaveError(null);
    setOpen(true);
  };

  const applyStandardOptions = () => {
    const count = form.statements.filter((s) => s.trim()).length || 3;
    setForm({ ...form, options: defaultStatementOptions(count) });
  };

  const handleImageUpload = async (file: File) => {
    if (!chapterId) return;
    setUploadingImage(true);
    try {
      const path = await uploadMcqImage(chapterId, file);
      setForm((prev) => ({ ...prev, image_path: path }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOptionImageUpload = async (index: number, file: File) => {
    if (!chapterId) return;
    setUploadingOptionIndex(index);
    try {
      const path = await uploadMcqImage(chapterId, file);
      setForm((prev) => {
        const option_images = [...prev.option_images];
        option_images[index] = path;
        return { ...prev, option_images };
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingOptionIndex(null);
    }
  };

  const handleSave = async () => {
    const error = validateMcqForm(form);
    if (error) {
      setSaveError(error);
      return;
    }

    if (!chapterId) {
      setSaveError("Select a chapter first.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = mcqFormToPayload(form);
      if (editing) {
        await apiClient.updateMcq({ id: editing.id, ...payload });
      } else {
        await apiClient.createMcq({ chapter_id: chapterId, ...payload });
      }
      setOpen(false);
      setQuestions(await apiClient.getMcq(chapterId));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
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
        <p className="text-muted-foreground">
          Normal, statement-wise, or image-based multiple choice questions.
        </p>
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
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{MCQ_TYPE_LABELS[q.questionType]}</Badge>
                  </div>
                  <p className="font-medium">
                    Q{i + 1}. {q.question}
                  </p>
                  {q.imagePath && (
                    <div className="mt-2 max-w-xs">
                      <NoteImage storagePath={q.imagePath} alt="MCQ" className="my-0 max-h-32 object-contain" />
                    </div>
                  )}
                  {q.statements?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {q.statements.map((s, idx) => (
                        <li key={idx}>
                          {idx + 1}. {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    Correct: {String.fromCharCode(65 + q.correctIndex)}
                    {q.options[q.correctIndex] ? ` — ${q.options[q.correctIndex]}` : q.optionImages?.[q.correctIndex] ? " (image)" : ""}
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
            <DialogTitle>{editing ? "Edit MCQ" : "Add MCQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Question type</Label>
              <Select
                value={form.question_type}
                onValueChange={(v) => setQuestionType(v as McqQuestionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MCQ_TYPE_LABELS) as McqQuestionType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {MCQ_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{form.question_type === "statement" ? "Question stem" : "Question"}</Label>
              <Textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder={
                  form.question_type === "statement"
                    ? "Which of the following statement(s) is/are correct?"
                    : "Enter your question…"
                }
                rows={3}
              />
            </div>

            {form.question_type === "image" && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <Label>Question image</Label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
                {form.image_path ? (
                  <NoteImage storagePath={form.image_path} alt="MCQ preview" className="max-h-48 object-contain" />
                ) : (
                  <p className="text-sm text-muted-foreground">Upload a radiograph, diagram, or clinical photo.</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!chapterId || uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {form.image_path ? "Replace image" : "Upload image"}
                </Button>
              </div>
            )}

            {form.question_type === "statement" && (
              <div className="space-y-3">
                <Label>Statements (minimum 2)</Label>
                {form.statements.map((stmt, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Statement {i + 1}</Label>
                    <Textarea
                      value={stmt}
                      onChange={(e) => {
                        const statements = [...form.statements];
                        statements[i] = e.target.value;
                        setForm({ ...form, statements });
                      }}
                      placeholder={`Enter statement ${i + 1}…`}
                      rows={2}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, statements: [...form.statements, ""] })}
                  >
                    Add statement
                  </Button>
                  {form.statements.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm({ ...form, statements: form.statements.slice(0, -1) })}
                    >
                      Remove last
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Answer options</Label>
                {form.question_type === "statement" && (
                  <Button type="button" variant="outline" size="sm" onClick={applyStandardOptions}>
                    Use standard options
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Each option can have text, an image, or both.
              </p>
              {form.options.map((opt, i) => (
                <McqOptionEditor
                  key={i}
                  index={i}
                  text={opt}
                  imagePath={form.option_images[i] ?? ""}
                  placeholder={
                    form.question_type === "statement" ? "e.g. (1) and (2) only" : "Enter option text…"
                  }
                  disabled={saving}
                  uploading={uploadingOptionIndex === i}
                  onTextChange={(value) => {
                    const options = [...form.options];
                    options[i] = value;
                    setForm({ ...form, options });
                  }}
                  onUpload={(file) => void handleOptionImageUpload(i, file)}
                  onClearImage={() => {
                    const option_images = [...form.option_images];
                    option_images[i] = "";
                    setForm({ ...form, option_images });
                  }}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Label>Correct answer</Label>
              <Select
                value={String(form.correct_index)}
                onValueChange={(v) => setForm({ ...form, correct_index: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {form.options.map((opt, i) => {
                    const img = form.option_images[i];
                    const label = opt.trim() || (img ? "(image)" : "");
                    return (
                      <SelectItem key={i} value={String(i)} disabled={!optionHasContent(opt, img)}>
                        {String.fromCharCode(65 + i)}
                        {label ? ` — ${label}` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Explain why the correct option is right…"
              />
            </div>
          </div>
          {saveError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {saveError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.question || uploadingImage || uploadingOptionIndex !== null}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
