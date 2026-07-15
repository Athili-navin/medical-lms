"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo,
  FilePlus2,
  Loader2,
  ClipboardPaste,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageBreak } from "@/lib/notes/page-break-extension";
import { FontSize } from "@/lib/notes/font-size-extension";
import { uploadNoteImage } from "@/lib/notes/upload-note-image";
import { cleanWordHtml, isWordHtml, stripInvalidNoteImages } from "@/lib/notes/clean-word-html";
import {
  pasteNeedsImageUpload,
  processClipboardItems,
  processPastedContent,
} from "@/lib/notes/paste-note-images";
import { NoteImageExtension } from "@/lib/notes/note-image-extension";
import { extractStoragePath } from "@/lib/notes/note-image-utils";
import { useEditorImagePreview } from "@/hooks/use-editor-image-preview";
import { cn } from "@/lib/utils";

function normalizeNoteImageHtml(html: string): string {
  if (typeof window === "undefined" || !html.includes("<img")) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("img").forEach((img) => {
    const storagePath =
      img.getAttribute("data-storage-path") || extractStoragePath(img.getAttribute("src") ?? "");
    if (storagePath) {
      img.setAttribute("src", storagePath);
      img.setAttribute("data-storage-path", storagePath);
    }
  });
  return stripInvalidNoteImages(doc.body.innerHTML);
}

const FONT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const SIZE_OPTIONS = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Medium", value: "18px" },
  { label: "Large", value: "20px" },
  { label: "XL", value: "24px" },
  { label: "2XL", value: "28px" },
  { label: "3XL", value: "32px" },
];

const COLOR_OPTIONS = [
  "#000000",
  "#1d4ed8",
  "#15803d",
  "#b45309",
  "#be123c",
  "#7c3aed",
  "#0f766e",
  "#dc2626",
];

interface RichNotesEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  chapterId?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="h-8 w-8 shrink-0"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

export function RichNotesEditor({
  value,
  onChange,
  placeholder,
  className,
  chapterId,
}: RichNotesEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const chapterIdRef = useRef(chapterId);
  chapterIdRef.current = chapterId;
  const [uploadingImage, setUploadingImage] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [savedSelection, setSavedSelection] = useState<{ from: number; to: number } | null>(null);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);

  const insertPastedHtml = useCallback((ed: Editor, html: string) => {
    if (!html) return;
    ed.chain().focus().insertContent(html).run();
  }, []);

  const runPasteUpload = useCallback(
    async (ed: Editor, data: DataTransfer) => {
      const id = chapterIdRef.current;
      if (!id) {
        alert("Save the chapter first before pasting images.");
        return;
      }

      setUploadingImage(true);
      try {
        const { html } = await processPastedContent(id, data);
        insertPastedHtml(ed, html);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Paste failed");
      } finally {
        setUploadingImage(false);
      }
    },
    [insertPastedHtml]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      NoteImageExtension.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      PageBreak,
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing your notes…",
      }),
    ],
    content: value || "<p></p>",
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed;
    },
    editorProps: {
      attributes: {
        class: "rich-notes-prose focus:outline-none min-h-full",
      },
      transformPastedHTML(html) {
        const cleaned = isWordHtml(html) ? cleanWordHtml(html) : html;
        return stripInvalidNoteImages(cleaned);
      },
      handlePaste: (_view, event) => {
        const data = event.clipboardData;
        if (!data || !chapterIdRef.current || !pasteNeedsImageUpload(data)) return false;

        event.preventDefault();
        const ed = editorRef.current;
        if (ed) void runPasteUpload(ed, data);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(normalizeNoteImageHtml(ed.getHTML()));
    },
  });

  useEditorImagePreview(editor);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  const handleImageUpload = async (file: File) => {
    if (!editor || !chapterId) return;
    setUploadingImage(true);
    try {
      const path = await uploadNoteImage(chapterId, file);
      const safeAlt = file.name.replace(/"/g, "");
      editor
        .chain()
        .focus()
        .insertContent(`<img src="${path}" alt="${safeAlt}" data-storage-path="${path}" />`)
        .run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetLink = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    const previous = editor.getAttributes("link").href as string | undefined;

    setSavedSelection({ from, to });
    setHasTextSelection(from !== to);
    setIsEditingLink(editor.isActive("link"));
    setLinkText(selectedText);
    setLinkUrl(previous ?? "https://");
    setLinkOpen(true);
  };

  const handlePasteFromWord = async () => {
    if (!editor) return;
    const id = chapterIdRef.current;
    if (!id) {
      alert("Save the chapter first before pasting images.");
      return;
    }

    setUploadingImage(true);
    try {
      const items = await navigator.clipboard.read();
      const html = await processClipboardItems(id, items);
      if (html) {
        insertPastedHtml(editor, html);
        return;
      }
      alert("Clipboard is empty. Copy your Word notes first, then try again.");
    } catch {
      alert("Paste from Word failed. Select content in Word, press Ctrl+C, then click in the editor and press Ctrl+V.");
    } finally {
      setUploadingImage(false);
    }
  };

  const applyLink = () => {
    if (!editor || !savedSelection) return;

    const rawUrl = linkUrl.trim();
    if (!rawUrl) {
      editor
        .chain()
        .focus()
        .setTextSelection(savedSelection)
        .extendMarkRange("link")
        .unsetLink()
        .run();
      setLinkOpen(false);
      return;
    }

    const href = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    if (hasTextSelection) {
      editor.chain().focus().setTextSelection(savedSelection).setLink({ href }).run();
    } else if (editor.isActive("link")) {
      editor.chain().focus().setTextSelection(savedSelection).extendMarkRange("link").setLink({ href }).run();
    } else if (linkText.trim()) {
      editor
        .chain()
        .focus()
        .setTextSelection(savedSelection.from)
        .insertContent(`<a href="${href}">${linkText.trim()}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setTextSelection(savedSelection.from)
        .insertContent(`<a href="${href}">${href}</a>`)
        .run();
    }

    setLinkOpen(false);
  };

  if (!editor) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  const currentFont = editor.getAttributes("textStyle").fontFamily ?? "default";
  const currentSize = editor.getAttributes("textStyle").fontSize ?? "16px";
  const currentColor = editor.getAttributes("textStyle").color ?? "#000000";

  return (
    <div className={cn("rich-notes-editor flex flex-col overflow-hidden rounded-lg border bg-muted/20", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-background p-2">
        <Select
          value={currentFont}
          onValueChange={(font) => {
            if (font === "default") editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(font).run();
          }}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentSize}
          onValueChange={(size) => {
            if (size === "16px") editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(size).run();
          }}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : "p"
          }
          onValueChange={(v) => {
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 }).run();
          }}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Normal</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}>
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <div className="flex items-center gap-1" title="Text color">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="color"
            value={currentColor}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="h-8 w-10 cursor-pointer border-0 p-1"
            aria-label="Text color"
          />
        </div>

        <Select
          value={currentColor}
          onValueChange={(color) => {
            if (color === "default") editor.chain().focus().unsetColor().run();
            else editor.chain().focus().setColor(color).run();
          }}
        >
          <SelectTrigger className="h-8 w-[90px] text-xs">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            {COLOR_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c }} />
                  {c}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={handleSetLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title={chapterId ? "Insert image" : "Save chapter first to add images"}
          disabled={!chapterId || uploadingImage}
          onClick={() => imageInputRef.current?.click()}
        >
          {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title={chapterId ? "Paste from Word (text + images)" : "Save chapter first to paste images"}
          disabled={!chapterId || uploadingImage}
          onClick={() => void handlePasteFromWord()}
        >
          {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardPaste className="h-4 w-4" />}
        </ToolbarButton>
        <ToolbarButton title="Insert page break" onClick={() => editor.chain().focus().setPageBreak().run()}>
          <FilePlus2 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

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

      <div className="max-h-[min(70vh,720px)] overflow-y-auto p-4">
        <div className="notes-page-canvas mx-auto">
          <div className="notes-page notes-page-editable">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-[min(100vw-2rem,28rem)]">
          <DialogHeader>
            <DialogTitle>Add hyperlink</DialogTitle>
            <DialogDescription>
              {hasTextSelection
                ? "Enter the URL for the selected text."
                : "Type the link label and URL, or select text in the editor first."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!hasTextSelection && (
              <div className="space-y-2">
                <Label htmlFor="link-text">Link text</Label>
                <Input
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Enamel"
                  autoComplete="off"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                inputMode="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditingLink && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!editor || !savedSelection) return;
                  editor
                    .chain()
                    .focus()
                    .setTextSelection(savedSelection)
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                  setLinkOpen(false);
                }}
              >
                Remove link
              </Button>
            )}
            <Button type="button" onClick={applyLink}>
              Apply link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
