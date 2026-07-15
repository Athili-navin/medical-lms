"use client";

import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { extractStoragePath, fetchNoteImageUrl, isNoteStoragePath } from "@/lib/notes/note-image-utils";

const LOADING_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function showImageError(img: HTMLImageElement) {
  const box = document.createElement("div");
  box.className =
    "my-4 flex min-h-[8rem] items-center justify-center rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-4 text-center text-sm text-muted-foreground";
  box.textContent = "Image could not be loaded. Re-upload using the image button.";
  img.replaceWith(box);
}

/** Resolve private storage paths to signed URLs inside the tutor editor preview. */
export function useEditorImagePreview(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return;

    const resolveImages = () => {
      const imgs = editor.view.dom.querySelectorAll("img");
      imgs.forEach((img) => {
        const src = img.getAttribute("src") ?? "";
        const rawPath =
          img.getAttribute("data-storage-path") ||
          extractStoragePath(src) ||
          src;

        if (!rawPath || !isNoteStoragePath(rawPath)) return;
        if (img.dataset.resolvedPath === rawPath && img.src.startsWith("http")) return;

        img.src = LOADING_PIXEL;
        img.style.opacity = "0.4";
        img.style.minHeight = "120px";
        img.style.background = "hsl(var(--muted))";

        void fetchNoteImageUrl(rawPath)
          .then((signed) => {
            img.src = signed;
            img.style.opacity = "1";
            img.style.minHeight = "";
            img.style.background = "";
            img.dataset.resolvedPath = rawPath;
            img.setAttribute("data-storage-path", extractStoragePath(rawPath) ?? rawPath);
          })
          .catch(() => {
            showImageError(img);
          });
      });
    };

    resolveImages();
    editor.on("update", resolveImages);
    editor.on("selectionUpdate", resolveImages);

    return () => {
      editor.off("update", resolveImages);
      editor.off("selectionUpdate", resolveImages);
    };
  }, [editor]);
}
