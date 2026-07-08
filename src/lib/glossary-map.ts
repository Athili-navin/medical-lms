import type { GlossaryEntry, GlossaryTooltip } from "@/types";

export function glossaryToRichMap(entries: GlossaryEntry[]): Record<string, GlossaryTooltip> {
  const map: Record<string, GlossaryTooltip> = {};
  entries.forEach((e) => {
    map[e.term.toLowerCase()] = {
      definition: e.definition,
      imageUrl: e.image_preview_url || e.image_url || undefined,
    };
  });
  return map;
}

/** @deprecated use glossaryToRichMap */
export function glossaryToMap(entries: GlossaryEntry[]): Record<string, string> {
  return Object.fromEntries(entries.map((e) => [e.term.toLowerCase(), e.definition]));
}

export function mergeGlossaryMaps(
  ...maps: Record<string, GlossaryTooltip>[]
): Record<string, GlossaryTooltip> {
  return Object.assign({}, ...maps);
}
