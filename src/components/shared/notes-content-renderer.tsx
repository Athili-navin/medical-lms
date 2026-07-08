"use client";

import React from "react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RichNotesViewer } from "@/components/shared/rich-notes-viewer";
import { isHtmlNotesContent } from "@/lib/notes/rich-notes";
import { findGlossaryMatches } from "@/lib/glossary";
import type { GlossaryTooltip } from "@/types";

function KeywordTooltip({
  term,
  definition,
  imageUrl,
}: {
  term: string;
  definition: string;
  imageUrl?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="cursor-help border-b border-dotted border-primary/50 font-medium text-foreground underline-offset-2 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          {term}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="z-[100] w-[min(440px,92vw)] max-w-none space-y-3 border bg-popover p-4 text-left text-sm leading-relaxed text-popover-foreground shadow-lg"
      >
        <p>{definition}</p>
        {imageUrl && (
          <div className="relative mx-auto h-[280px] w-full min-w-[280px] overflow-hidden rounded-md border bg-background">
            <Image
              src={imageUrl}
              alt={term}
              fill
              className="object-contain p-1"
              unoptimized
              sizes="440px"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function renderTextWithTooltips(
  text: string,
  keyPrefix: string,
  glossary: Record<string, GlossaryTooltip | string>
): React.ReactNode {
  const matches = findGlossaryMatches(text, glossary);
  if (matches.length === 0) return text;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <KeywordTooltip
        key={`${keyPrefix}-kw-${i}`}
        term={match.term}
        definition={match.definition}
        imageUrl={match.imageUrl}
      />
    );
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
  glossary: Record<string, GlossaryTooltip | string>
): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <strong key={`${keyPrefix}-bold-${i}`}>
          {renderTextWithTooltips(inner, `${keyPrefix}-bold-${i}`, glossary)}
        </strong>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}-text-${i}`}>
        {renderTextWithTooltips(part, `${keyPrefix}-text-${i}`, glossary)}
      </React.Fragment>
    );
  });
}

function renderMarkdownLine(
  line: string,
  index: number,
  glossary: Record<string, GlossaryTooltip | string>
) {
  if (line.startsWith("# ")) {
    return (
      <h1 key={index} className="mb-2 mt-4 text-2xl font-bold">
        {renderInlineText(line.slice(2), `h1-${index}`, glossary)}
      </h1>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h2 key={index} className="mb-2 mt-4 text-xl font-semibold">
        {renderInlineText(line.slice(3), `h2-${index}`, glossary)}
      </h2>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <li key={index} className="ml-4 list-disc text-muted-foreground">
        {renderInlineText(line.slice(2), `li-${index}`, glossary)}
      </li>
    );
  }
  if (line.match(/^\d+\./)) {
    return (
      <li key={index} className="ml-4 list-decimal text-muted-foreground">
        {renderInlineText(line.replace(/^\d+\.\s*/, ""), `oli-${index}`, glossary)}
      </li>
    );
  }
  if (line.startsWith("**") && line.endsWith("**")) {
    return (
      <p key={index} className="mt-2 font-semibold">
        {renderInlineText(line.slice(2, -2), `bold-p-${index}`, glossary)}
      </p>
    );
  }
  if (line.trim() === "") {
    return <br key={index} />;
  }
  return (
    <p key={index} className="leading-relaxed text-muted-foreground">
      {renderInlineText(line, `p-${index}`, glossary)}
    </p>
  );
}

export function NotesContentRenderer({
  content,
  glossary,
}: {
  content: string;
  glossary?: Record<string, GlossaryTooltip | string>;
}) {
  const terms = glossary ?? {};

  if (isHtmlNotesContent(content)) {
    return (
      <TooltipProvider delayDuration={200}>
        <RichNotesViewer content={content} glossary={terms} />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      {content.split("\n").map((line, i) => renderMarkdownLine(line, i, terms))}
    </TooltipProvider>
  );
}
