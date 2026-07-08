"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, Upload, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import { uploadChapterPdf, formatFileSize, MAX_PDF_BYTES } from "@/lib/supabase/upload-pdf";

export default function TutorPdfsPage() {
  const { courses, loading, refresh } = useCourses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapter_id: "", title: "Chapter PDF Notes" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [savePhase, setSavePhase] = useState<"idle" | "uploading" | "saving">("idle");
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chapters = courses.flatMap((c) =>
    c.lessons.flatMap((l) =>
      l.chapters.map((ch) => ({
        id: ch.id,
        label: `${c.title} / ${l.title} / ${ch.title}`,
        pdfId: ch.pdfId,
      }))
    )
  );

  const openCreate = () => {
    setForm({ chapter_id: chapters[0]?.id ?? "", title: "Chapter PDF Notes" });
    setSelectedFile(null);
    setSaveError("");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.chapter_id || !selectedFile) return;
    if (selectedFile.size > MAX_PDF_BYTES) return;

    setSaving(true);
    setSaveError("");
    try {
      setSavePhase("uploading");
      const path = await uploadChapterPdf(selectedFile, form.chapter_id);
      setSavePhase("saving");
      await apiClient.createPdf({
        chapter_id: form.chapter_id,
        title: form.title,
        url: path,
        file_name: selectedFile.name,
      });
      setOpen(false);
      setSelectedFile(null);
      refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSaving(false);
      setSavePhase("idle");
    }
  };

  const handleDelete = async (pdfId: string) => {
    if (!confirm("Remove this PDF?")) return;
    await apiClient.deletePdf(pdfId);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold lg:text-3xl">PDF Notes</h1>
          <p className="text-muted-foreground">Upload PDF notes per chapter. Students can view in-app only.</p>
        </motion.div>
        <Button onClick={openCreate} disabled={chapters.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Upload PDF
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {chapters
            .filter((c) => c.pdfId)
            .map((ch) => (
              <Card key={ch.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                    <p className="truncate font-medium">{ch.label}</p>
                  </div>
                  {ch.pdfId && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.pdfId!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={form.chapter_id} onValueChange={(v) => setForm({ ...form, chapter_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>PDF file</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose PDF
              </Button>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
              <p className="text-xs text-muted-foreground">Max {formatFileSize(MAX_PDF_BYTES)}</p>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedFile || !form.chapter_id || selectedFile.size > MAX_PDF_BYTES}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savePhase === "uploading" ? "Uploading..." : savePhase === "saving" ? "Saving..." : "Upload PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
