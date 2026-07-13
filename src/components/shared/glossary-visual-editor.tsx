"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MousePointerClick, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotesContentRenderer } from "@/components/shared/notes-content-renderer";
import { useCourses } from "@/hooks/use-courses";
import { apiClient } from "@/lib/api/client";
import { glossaryToRichMap, mergeGlossaryMaps } from "@/lib/glossary-map";
import { NOTE_GLOSSARY } from "@/lib/glossary";
import { uploadGlossaryImage } from "@/lib/supabase/upload-pdf";
import type { GlossaryEntry, GlossaryTooltip } from "@/types";

const staticGlossary: Record<string, GlossaryTooltip> = Object.fromEntries(
  Object.entries(NOTE_GLOSSARY).map(([k, v]) => [k, { definition: v }])
);

interface ChapterOption {
  id: string;
  courseId: string;
  label: string;
  content: string;
}

export function GlossaryVisualEditor() {
  const { courses, loading: coursesLoading } = useCourses();
  const [chapterId, setChapterId] = useState("");
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [definition, setDefinition] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const notesRef = useRef<HTMLDivElement>(null);

  const chapters: ChapterOption[] = useMemo(
    () =>
      courses.flatMap((course) =>
        course.lessons.flatMap((lesson) =>
          lesson.chapters.map((ch) => ({
            id: ch.id,
            courseId: course.id,
            label: `${course.title} / ${lesson.title} / ${ch.title}`,
            content: ch.content,
          }))
        )
      ),
    [courses]
  );

  const selectedChapter = chapters.find((c) => c.id === chapterId);

  const previewGlossary = useMemo(() => {
    const chapterEntries = entries.filter((e) => e.chapter_id === chapterId || !e.chapter_id);
    return mergeGlossaryMaps(staticGlossary, glossaryToRichMap(chapterEntries));
  }, [entries, chapterId]);

  const loadEntries = useCallback(() => {
    setLoadingEntries(true);
    apiClient
      .getGlossary(chapterId || undefined)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoadingEntries(false));
  }, [chapterId]);

  useEffect(() => {
    if (!chapterId && chapters[0]) setChapterId(chapters[0].id);
  }, [chapters, chapterId]);

  useEffect(() => {
    if (chapterId) loadEntries();
  }, [chapterId, loadEntries]);

  const loadTermDetails = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setEditingId(null);
      setDefinition("");
      setImagePath("");
      setImagePreview("");
      setImageFile(null);
      return;
    }

    const existing = entries.find(
      (e) => e.chapter_id === chapterId && e.term.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setEditingId(existing.id);
      setDefinition(existing.definition);
      setImagePath(existing.image_url || "");
      setImagePreview(existing.image_preview_url || "");
      setImageFile(null);
    } else {
      setEditingId(null);
      setDefinition("");
      setImagePath("");
      setImagePreview("");
      setImageFile(null);
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!text || text.length > 120) return;
    if (!notesRef.current?.contains(selection?.anchorNode ?? null)) return;

    setSelectedText(text);
    loadTermDetails(text);
  };

  const handleImagePick = (file: File | null) => {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!chapterId || !selectedText.trim() || !definition.trim()) return;
    setSaving(true);
    setError("");
    try {
      let image_url = imagePath;
      if (imageFile) {
        image_url = await uploadGlossaryImage(imageFile, chapterId);
      }

      const payload = {
        term: selectedText.trim(),
        definition: definition.trim(),
        chapter_id: chapterId,
        course_id: null,
        image_url: image_url || "",
      };

      if (editingId) {
        await apiClient.updateGlossary({ id: editingId, ...payload });
      } else {
        await apiClient.createGlossary(payload);
      }

      setSelectedText("");
      setDefinition("");
      setImageFile(null);
      setImagePath("");
      setImagePreview("");
      setEditingId(null);
      loadEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this tooltip keyword?")) return;
    await apiClient.deleteGlossary(id);
    loadEntries();
  };

  const chapterEntries = entries.filter((e) => e.chapter_id === chapterId);

  if (coursesLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. Choose chapter notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MousePointerClick className="h-4 w-4" />
              Select a word in the notes below (long-press on phone), or type it manually in step 3.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">2. Select words in your notes</CardTitle>
          </CardHeader>
          <CardContent
            ref={notesRef}
            className="prose prose-sm dark:prose-invert max-w-none cursor-text select-text rounded-md border bg-background p-4"
            onPointerUp={handleSelection}
            onMouseUp={handleSelection}
          >
            {selectedChapter ? (
              <NotesContentRenderer
                content={selectedChapter.content}
                glossary={previewGlossary}
                protect={false}
                interactiveGlossary={false}
              />
            ) : (
              <p className="text-muted-foreground">Create chapter notes first under Tutor → Chapters.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">3. Tooltip for selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-term">Word or phrase</Label>
              <Input
                id="manual-term"
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                onBlur={(e) => loadTermDetails(e.target.value)}
                placeholder="Type or select a word from notes"
              />
            </div>
            {selectedText ? (
              <>
                <div className="space-y-2">
                  <Label>Tooltip explanation</Label>
                  <Textarea
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="What should students see when they tap the word?"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tooltip image (optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="glossary-image"
                    onChange={(e) => handleImagePick(e.target.files?.[0] ?? null)}
                  />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor="glossary-image" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload image
                    </label>
                  </Button>
                  {imagePreview && (
                    <div className="relative mt-2 aspect-video overflow-hidden rounded-md border">
                      <Image src={imagePreview} alt="Tooltip preview" fill className="object-contain" unoptimized />
                    </div>
                  )}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" onClick={handleSave} disabled={saving || !definition.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update tooltip" : "Save tooltip"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select text in the notes panel or type a word above to create a tooltip.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Keywords in this chapter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingEntries ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            ) : chapterEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tooltips yet for this chapter.</p>
            ) : (
              chapterEntries.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-2 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{entry.term}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{entry.definition}</p>
                    {entry.image_url && (
                      <p className="mt-1 text-xs text-primary">Has image</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedText(entry.term);
                        setEditingId(entry.id);
                        setDefinition(entry.definition);
                        setImagePath(entry.image_url || "");
                        setImagePreview(entry.image_preview_url || "");
                        setImageFile(null);
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
