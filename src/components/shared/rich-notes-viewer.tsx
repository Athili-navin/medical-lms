"use client";

import DOMPurify from "dompurify";
import { splitHtmlIntoPages } from "@/lib/notes/rich-notes";
import { cn } from "@/lib/utils";

const SANITIZE_CONFIG = {
  ADD_ATTR: ["style", "colspan", "rowspan", "data-page-break"],
  ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td"],
};

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

interface RichNotesViewerProps {
  content: string;
  className?: string;
  glossary?: Record<string, import("@/types").GlossaryTooltip | string>;
}

export function RichNotesViewer({ content, className }: RichNotesViewerProps) {
  const pages = splitHtmlIntoPages(content);

  return (
    <div className={cn("notes-pages-view space-y-8", className)}>
      {pages.map((pageHtml, index) => (
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
