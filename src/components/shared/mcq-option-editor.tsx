"use client";

import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteImage } from "@/components/shared/note-image";

interface McqOptionEditorProps {
  index: number;
  text: string;
  imagePath: string;
  placeholder?: string;
  disabled?: boolean;
  uploading?: boolean;
  onTextChange: (value: string) => void;
  onUpload: (file: File) => void;
  onClearImage: () => void;
}

export function McqOptionEditor({
  index,
  text,
  imagePath,
  placeholder,
  disabled,
  uploading,
  onTextChange,
  onUpload,
  onClearImage,
}: McqOptionEditorProps) {
  const letter = String.fromCharCode(65 + index);

  return (
    <div className="space-y-2 rounded-lg border bg-muted/10 p-3">
      <Label className="text-xs text-muted-foreground">Option {letter}</Label>
      <Input
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder ?? "Option text (optional if image added)…"}
        disabled={disabled}
      />
      {imagePath ? (
        <div className="relative max-w-xs">
          <NoteImage storagePath={imagePath} alt={`Option ${letter}`} className="my-0 max-h-28 object-contain" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 bg-background/80"
            onClick={onClearImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
      <div>
        <input
          id={`mcq-option-image-${index}`}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => document.getElementById(`mcq-option-image-${index}`)?.click()}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {imagePath ? "Replace image" : "Add option image"}
        </Button>
      </div>
    </div>
  );
}
