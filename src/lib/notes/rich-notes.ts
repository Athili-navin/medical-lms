export function splitHtmlIntoPages(html: string): string[] {
  if (!html.trim()) return [""];

  const parts = html.split(/<div[^>]*data-page-break="true"[^>]*>[\s\S]*?<\/div>/gi);
  const pages = parts.map((part) => part.trim()).filter(Boolean);
  return pages.length > 0 ? pages : [html];
}

export function isHtmlNotesContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  return trimmed.startsWith("<") && /<(p|h[1-6]|ul|ol|table|div|blockquote|strong|em)\b/i.test(trimmed);
}
