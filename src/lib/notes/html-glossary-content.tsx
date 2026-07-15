"use client";

import React from "react";
import { KeywordTooltip } from "@/components/shared/keyword-tooltip";
import { NoteImage } from "@/components/shared/note-image";
import { findGlossaryMatches } from "@/lib/glossary";
import { isNoteStoragePath } from "@/lib/notes/note-image-utils";
import type { GlossaryTooltip } from "@/types";

const VOID_TAGS = new Set(["br", "hr", "img", "input", "meta", "col", "embed", "source", "track", "wbr"]);

const ALLOWED_ATTRS = ["href", "target", "rel", "src", "alt", "colspan", "rowspan", "class"];

function MissingNoteImage({ reason }: { reason: string }) {
  return (
    <div className="my-4 flex min-h-[8rem] items-center justify-center rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-4 text-center text-sm text-muted-foreground">
      {reason}
    </div>
  );
}

function parseInlineStyle(style: string): React.CSSProperties {
  return style.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split(":").map((s) => s.trim());
    if (!key || !value) return acc;
    const camel = key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
    acc[camel] = value;
    return acc;
  }, {});
}

function renderTextWithGlossary(
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

function domNodeToReact(
  node: ChildNode,
  glossary: Record<string, GlossaryTooltip | string>,
  keyPrefix: string,
  interactiveGlossary: boolean
): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (!text) return null;
    return (
      <React.Fragment key={keyPrefix}>
        {renderTextWithGlossary(text, keyPrefix, glossary, interactiveGlossary)}
      </React.Fragment>
    );
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === "p" && el.classList.contains("word-image-placeholder")) {
    return (
      <MissingNoteImage
        key={keyPrefix}
        reason="Image missing — ask your tutor to re-upload using the image button."
      />
    );
  }

  const props: Record<string, unknown> = { key: keyPrefix };
  ALLOWED_ATTRS.forEach((attr) => {
    const val = el.getAttribute(attr);
    if (!val) return;
    if (attr === "class") props.className = val;
    else props[attr] = val;
  });

  const style = el.getAttribute("style");
  if (style) props.style = parseInlineStyle(style);

  if (VOID_TAGS.has(tag)) {
    if (tag === "img") {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "";
      if (!src || src.startsWith("file:") || src.startsWith("blob:")) {
        return (
          <MissingNoteImage
            key={keyPrefix}
            reason="Image missing — ask your tutor to re-upload using the image button."
          />
        );
      }
      if (isNoteStoragePath(src)) {
        return (
          <NoteImage
            key={keyPrefix}
            storagePath={src}
            alt={alt}
            className={props.className as string | undefined}
            style={props.style as React.CSSProperties | undefined}
          />
        );
      }
    }
    return React.createElement(tag, props);
  }

  const children = Array.from(el.childNodes).map((child, i) =>
    domNodeToReact(child, glossary, `${keyPrefix}-${i}`, interactiveGlossary)
  );

  return React.createElement(tag, props, ...children);
}

interface HtmlGlossaryContentProps {
  html: string;
  glossary: Record<string, GlossaryTooltip | string>;
  interactiveGlossary?: boolean;
}

export function HtmlGlossaryContent({
  html,
  glossary,
  interactiveGlossary = true,
}: HtmlGlossaryContentProps) {
  if (typeof window === "undefined") {
    return <div className="rich-notes-prose" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return (
    <div className="rich-notes-prose">
      {Array.from(doc.body.childNodes).map((node, i) =>
        domNodeToReact(node, glossary, `block-${i}`, interactiveGlossary)
      )}
    </div>
  );
}
