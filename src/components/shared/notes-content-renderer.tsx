"use client";

import React from "react";
import { RichNotesViewer } from "@/components/shared/rich-notes-viewer";
import { ProtectedContent } from "@/components/shared/protected-content";
import { KeywordTooltip } from "@/components/shared/keyword-tooltip";
import { isHtmlNotesContent } from "@/lib/notes/rich-notes";
import { findGlossaryMatches } from "@/lib/glossary";
import type { GlossaryTooltip } from "@/types";

function renderTextWithTooltips(
  text: string,
  keyPrefix: string,
  glossary: Record<string, GlossaryTooltip | string>,
  interactiveGlossary: boolean
): React.ReactNode {
  const matches = findGlossaryMatches(text, glossary);
  if (matches.length === 0) return text;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (interactiveGlossary) {
      nodes.push(
        <KeywordTooltip
          key={`${keyPrefix}-kw-${i}`}
          term={match.term}
          definition={match.definition}
          imageUrl={match.imageUrl}
        />
      );
    } else {
      nodes.push(
        <span
          key={`${keyPrefix}-kw-${i}`}
          className="border-b border-dotted border-primary/50 font-medium"
        >
          {match.term}
        </span>
      );
    }
    lastIndex = match.index + match.length;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderInlineText(
  text: string,
  keyPrefix: string,
  glossary: Record<string, GlossaryTooltip | string>,
  interactiveGlossary: boolean
): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <strong key={`${keyPrefix}-bold-${i}`}>
          {renderTextWithTooltips(inner, `${keyPrefix}-bold-${i}`, glossary, interactiveGlossary)}
        </strong>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}-text-${i}`}>
        {renderTextWithTooltips(part, `${keyPrefix}-text-${i}`, glossary, interactiveGlossary)}
      </React.Fragment>
    );
  });
}

function renderMarkdownLine(
  line: string,
  index: number,
  glossary: Record<string, GlossaryTooltip | string>,
  interactiveGlossary: boolean
) {
  if (line.startsWith("# ")) {
    return (
      <h1 key={index} className="mb-2 mt-4 text-2xl font-bold">
        {renderInlineText(line.slice(2), `h1-${index}`, glossary, interactiveGlossary)}
      </h1>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h2 key={index} className="mb-2 mt-4 text-xl font-semibold">
        {renderInlineText(line.slice(3), `h2-${index}`, glossary, interactiveGlossary)}
      </h2>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <li key={index} className="ml-4 list-disc text-muted-foreground">
        {renderInlineText(line.slice(2), `li-${index}`, glossary, interactiveGlossary)}
      </li>
    );
  }
  if (line.match(/^\d+\./)) {
    return (
      <li key={index} className="ml-4 list-decimal text-muted-foreground">
        {renderInlineText(line.replace(/^\d+\.\s*/, ""), `oli-${index}`, glossary, interactiveGlossary)}
      </li>
    );
  }
  if (line.startsWith("**") && line.endsWith("**")) {
    return (
      <p key={index} className="mt-2 font-semibold">
        {renderInlineText(line.slice(2, -2), `bold-p-${index}`, glossary, interactiveGlossary)}
      </p>
    );
  }
  if (line.trim() === "") {
    return <br key={index} />;
  }
  return (
    <p key={index} className="leading-relaxed text-muted-foreground">
      {renderInlineText(line, `p-${index}`, glossary, interactiveGlossary)}
    </p>
  );
}

export function NotesContentRenderer({
  content,
  glossary,
  protect = true,
  interactiveGlossary = true,
}: {
  content: string;
  glossary?: Record<string, GlossaryTooltip | string>;
  protect?: boolean;
  interactiveGlossary?: boolean;
}) {
  const terms = glossary ?? {};

  const body = isHtmlNotesContent(content) ? (
    <RichNotesViewer content={content} />
  ) : (
    <>
      {content.split("\n").map((line, i) => renderMarkdownLine(line, i, terms, interactiveGlossary))}
    </>
  );

  if (protect) {
    return <ProtectedContent>{body}</ProtectedContent>;
  }

  return <>{body}</>;
}
