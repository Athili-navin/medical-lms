"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotesStore } from "@/stores";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface NotesEditorProps {
  chapterId: string;
  className?: string;
}

export function NotesEditor({ chapterId, className }: NotesEditorProps) {
  const { getNote, saveNote, setSaving } = useNotesStore();
  const existingNote = getNote(chapterId);
  const [content, setContent] = useState(existingNote?.content ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setContent(existingNote?.content ?? "");
    setError("");
  }, [chapterId, existingNote?.content]);

  const persistNote = useCallback(
    async (value: string) => {
      saveNote(chapterId, value);
      try {
        await apiClient.saveNote(chapterId, value);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save note");
      }
    },
    [chapterId, saveNote]
  );

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setSaving(chapterId, true);
    await persistNote(content);
    setSaveStatus("saved");
    setSaving(chapterId, false);
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [chapterId, content, persistNote, setSaving]);

  useEffect(() => {
    apiClient
      .getNote(chapterId)
      .then((note) => {
        if (note?.content) {
          setContent(note.content);
          saveNote(chapterId, note.content);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load note"));
  }, [chapterId, saveNote]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== (existingNote?.content ?? "") && content.length > 0) {
        setSaveStatus("saving");
        setSaving(chapterId, true);
        void persistNote(content).finally(() => {
          setSaveStatus("saved");
          setSaving(chapterId, false);
          setTimeout(() => setSaveStatus("idle"), 1500);
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, chapterId, existingNote?.content, persistNote, setSaving]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Personal Notes</h3>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="mr-1 h-3 w-3" />
            Save
          </Button>
        </div>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your personal study notes here..."
        className="min-h-[300px] flex-1 resize-none font-mono text-sm leading-relaxed"
        aria-label="Personal notes editor"
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {existingNote?.lastSaved && saveStatus === "idle" && (
        <p className="mt-2 text-xs text-muted-foreground">Last saved at {existingNote.lastSaved}</p>
      )}
    </div>
  );
}
