"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api/client";
import { uploadChapterPdf, formatFileSize, MAX_PDF_BYTES } from "@/lib/supabase/upload-pdf";

interface ChapterPdfUploadProps {
  chapterId: string;
  pdfId?: string;
  onChange?: () => void;
}

export function ChapterPdfUpload({ chapterId, pdfId, onChange }: ChapterPdfUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("Chapter PDF Notes");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_PDF_BYTES) {
      setError(`File exceeds ${formatFileSize(MAX_PDF_BYTES)} limit`);
      return;
    }

    setUploading(true);
    setError("");
    try {
      setPhase("uploading");
      const path = await uploadChapterPdf(selectedFile, chapterId);
      setPhase("saving");
      await apiClient.createPdf({
        chapter_id: chapterId,
        title,
        url: path,
        file_name: selectedFile.name,
      });
      setSelectedFile(null);
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setPhase("idle");
    }
  };

  const handleDelete = async () => {
    if (!pdfId || !confirm("Remove PDF notes for this chapter?")) return;
    setUploading(true);
    try {
      await apiClient.deletePdf(pdfId);
      onChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">PDF Notes</Label>
      </div>

      {pdfId ? (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
          <p className="text-sm text-muted-foreground">PDF uploaded — students can view in-app only.</p>
          <Button type="button" variant="ghost" size="icon" onClick={() => void handleDelete()} disabled={uploading}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No PDF yet. Upload notes for students to read.</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="pdf-title">PDF title</Label>
        <Input id="pdf-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          setSelectedFile(e.target.files?.[0] ?? null);
          setError("");
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          Choose PDF
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => void handleUpload()}
          disabled={uploading || !selectedFile || selectedFile.size > MAX_PDF_BYTES}
        >
          {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {phase === "uploading" ? "Uploading…" : phase === "saving" ? "Saving…" : pdfId ? "Replace PDF" : "Upload PDF"}
        </Button>
      </div>

      {selectedFile && (
        <p className="text-xs text-muted-foreground">
          {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </p>
      )}
      <p className="text-xs text-muted-foreground">Max {formatFileSize(MAX_PDF_BYTES)} · Copy and download blocked for students.</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
