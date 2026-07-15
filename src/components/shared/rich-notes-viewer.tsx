"use client";

import DOMPurify from "dompurify";
import { splitHtmlIntoPages } from "@/lib/notes/rich-notes";
import { HtmlGlossaryContent } from "@/lib/notes/html-glossary-content";
import type { GlossaryTooltip } from "@/types";
import { cn } from "@/lib/utils";

export const RICH_NOTES_SANITIZE_CONFIG = {
  ADD_ATTR: [
    "style",
    "colspan",
    "rowspan",
    "data-page-break",
    "data-storage-path",
    "href",
    "target",
    "rel",
    "src",
    "alt",
    "class",
  ],
  ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "img", "a", "mark", "span", "strong", "em", "u", "b", "i"],
};

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, RICH_NOTES_SANITIZE_CONFIG);
}

interface RichNotesViewerProps {
  content: string;
  className?: string;
  glossary?: Record<string, GlossaryTooltip | string>;
  interactiveGlossary?: boolean;
}

export function RichNotesViewer({
  content,
  className,
  glossary,
  interactiveGlossary = true,
}: RichNotesViewerProps) {
  const pages = splitHtmlIntoPages(content);
  const terms = glossary ?? {};

  return (
    <div className={cn("notes-pages-view space-y-8", className)}>
      {pages.map((pageHtml, index) => (
        <div key={index} className="notes-page-canvas mx-auto">
          <div className="notes-page">
            <HtmlGlossaryContent
              html={sanitizeHtml(pageHtml)}
              glossary={terms}
              interactiveGlossary={interactiveGlossary}
            />
            <p className="notes-page-number">Page {index + 1}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
