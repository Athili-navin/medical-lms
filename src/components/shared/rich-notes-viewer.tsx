"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { splitHtmlIntoPages } from "@/lib/notes/rich-notes";
import { cn } from "@/lib/utils";

export const RICH_NOTES_SANITIZE_CONFIG = {
  ADD_ATTR: ["style", "colspan", "rowspan", "data-page-break", "href", "target", "rel", "src", "alt"],
  ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "img", "a", "mark", "span"],
};

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, RICH_NOTES_SANITIZE_CONFIG);
}

function isStorageImagePath(src: string) {
  return !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:");
}

async function resolveImagePaths(html: string): Promise<string> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(doc.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || !isStorageImagePath(src)) return;

      try {
        const res = await fetch(`/api/notes/image-url?path=${encodeURIComponent(src)}`);
        if (!res.ok) return;
        const { url } = (await res.json()) as { url: string };
        img.setAttribute("src", url);
      } catch {
        // Keep original path if resolution fails
      }
    })
  );

  return doc.body.innerHTML;
}

interface RichNotesViewerProps {
  content: string;
  className?: string;
}

export function RichNotesViewer({ content, className }: RichNotesViewerProps) {
  const [resolvedPages, setResolvedPages] = useState(() => splitHtmlIntoPages(content));

  useEffect(() => {
    let cancelled = false;
    const pageList = splitHtmlIntoPages(content);

    void (async () => {
      const next = await Promise.all(pageList.map((page) => resolveImagePaths(page)));
      if (!cancelled) setResolvedPages(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <div className={cn("notes-pages-view space-y-8", className)}>
      {resolvedPages.map((pageHtml, index) => (
        <div key={index} className="notes-page-canvas mx-auto">
          <div className="notes-page">
            <div
              className="rich-notes-prose"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(pageHtml) }}
            />
            <p className="notes-page-number">Page {index + 1}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
