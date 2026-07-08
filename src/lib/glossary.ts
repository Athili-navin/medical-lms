import { NOTE_GLOSSARY } from "@/lib/glossary-static";
import type { GlossaryTooltip } from "@/types";

export { NOTE_GLOSSARY } from "@/lib/glossary-static";

export function findGlossaryMatches(
  text: string,
  glossary: Record<string, GlossaryTooltip | string> = NOTE_GLOSSARY
): { index: number; length: number; term: string; definition: string; imageUrl?: string }[] {
  const normalized: Record<string, GlossaryTooltip> = {};
  Object.entries(glossary).forEach(([key, val]) => {
    normalized[key.toLowerCase()] =
      typeof val === "string" ? { definition: val } : val;
  });

  const entries = Object.entries(normalized).sort((a, b) => b[0].length - a[0].length);
  if (entries.length === 0) return [];

  const pattern = new RegExp(
    `\\b(${entries.map(([term]) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );

  const matches: { index: number; length: number; term: string; definition: string; imageUrl?: string }[] =
    [];
  const regex = new RegExp(pattern.source, pattern.flags);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const lower = match[0].toLowerCase();
    const entry = normalized[lower] ?? entries.find(([term]) => term.toLowerCase() === lower)?.[1];
    if (entry) {
      matches.push({
        index: match.index,
        length: match[0].length,
        term: match[0],
        definition: entry.definition,
        imageUrl: entry.imageUrl,
      });
    }
  }

  return matches;
}
