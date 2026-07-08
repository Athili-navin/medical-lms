"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Loader2, Upload, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import { uploadLectureVideo, formatFileSize, MAX_VIDEO_BYTES } from "@/lib/supabase/upload-video";
import { getUnsupportedVideoUrlWarning } from "@/lib/video-url-utils";

export default function TutorVideosPage() {
  const { courses, loading, refresh } = useCourses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapter_id: "", title: "", url: "", thumbnail: "", duration: 15 });
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState("");
  const [savePhase, setSavePhase] = useState<"idle" | "uploading" | "saving">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlWarning = getUnsupportedVideoUrlWarning(form.url);

  const chapters = courses.flatMap((c) =>
    c.lessons.flatMap((l) =>
      l.chapters.map((ch) => ({
        id: ch.id,
        label: `${c.title} / ${l.title} / ${ch.title}`,
        videoId: ch.videoId,
      }))
    )
  );

  const openCreate = () => {
    setForm({ chapter_id: chapters[0]?.id ?? "", title: "", url: "", thumbnail: "", duration: 15 });
    setSelectedFile(null);
    setSaveError("");
    setSavePhase("idle");
    setOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setSaveError("");
    if (file && file.size > MAX_VIDEO_BYTES) {
      setSaveError(
        `File is ${formatFileSize(file.size)}. Max ${formatFileSize(MAX_VIDEO_BYTES)} unless you raise the limit in Supabase Storage settings.`
      );
    }
    if (file && !form.title) {
      setForm((prev) => ({ ...prev, title: file.name.replace(/\.[^.]+$/, "") }));
    }
  };

  const handleSave = async () => {
    if (!form.chapter_id || !form.title) return;
    if (selectedFile && selectedFile.size > MAX_VIDEO_BYTES) return;

    setSaving(true);
    setSaveError("");
    try {
      let videoUrl = form.url.trim();

      if (selectedFile) {
        setSavePhase("uploading");
        videoUrl = await uploadLectureVideo(selectedFile, form.chapter_id);
      }

      if (!videoUrl) {
        throw new Error("Upload a video file or paste a direct MP4/WebM URL.");
      }

      const unsupportedWarning = getUnsupportedVideoUrlWarning(videoUrl);
      if (unsupportedWarning) {
        throw new Error(unsupportedWarning);
      }

      setSavePhase("saving");
      await apiClient.createVideo({ ...form, url: videoUrl });
      setOpen(false);
      setSelectedFile(null);
      setSavePhase("idle");
      refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
      setSavePhase("idle");
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Remove this video?")) return;
    await apiClient.deleteVideo(videoId);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold lg:text-3xl">Video Management</h1>
          <p className="text-muted-foreground">Upload lecture videos to Supabase Storage or link a direct file URL.</p>
        </motion.div>
        <Button onClick={openCreate} disabled={chapters.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex gap-3 py-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1 text-muted-foreground">
            <p>
              <strong className="text-foreground">Recommended:</strong> upload an MP4 file — it is stored in Supabase
              bucket <code className="rounded bg-muted px-1">lecture-videos</code>.
            </p>
            <p>YouTube, Google Drive, Vimeo, Dropbox, and OneDrive share links will not play. Upload an MP4 or use a direct file URL.</p>
            <p>Students must be logged in. Each chapter can have one video.</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : chapters.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Create a course, lessons, and chapters first, then attach videos here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {chapters
            .filter((c) => c.videoId)
            .map((ch) => (
              <Card key={ch.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ch.label}</p>
                    <p className="text-xs text-muted-foreground">Video linked</p>
                  </div>
                  {ch.videoId && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.videoId!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={form.chapter_id} onValueChange={(v) => setForm({ ...form, chapter_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
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
              <Label>Upload video file (MP4 recommended)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose file
                </Button>
                {selectedFile && (
                  <span className="truncate text-sm text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Max {formatFileSize(MAX_VIDEO_BYTES)} per file on default Supabase plans.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Or direct video URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com/lecture.mp4"
                disabled={Boolean(selectedFile)}
                aria-invalid={Boolean(urlWarning)}
              />
              {urlWarning && !selectedFile && (
                <p className="flex gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{urlWarning}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Storage path example after manual upload: <code>chapters/uuid/lecture.mp4</code>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              />
            </div>
          </div>
          {saveError && (
            <p className="flex gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{saveError}</span>
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !form.title ||
                (!form.url && !selectedFile) ||
                Boolean(urlWarning && !selectedFile) ||
                Boolean(selectedFile && selectedFile.size > MAX_VIDEO_BYTES)
              }
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savePhase === "uploading"
                ? "Uploading file..."
                : savePhase === "saving"
                  ? "Saving..."
                  : "Save video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
