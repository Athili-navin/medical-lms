/** Strip Microsoft Word markup (keeps image tags for paste upload handling). */
export function cleanWordMarkup(html: string): string {
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(\/?)(o:p|w:[^>]+|v:[^>]+|st1:[^>]+|xml)[^>]*>/gi, "")
    .replace(/<\/?(meta|link|style)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ");

  cleaned = cleaned.replace(/\sstyle="[^"]*mso[^"]*"/gi, "");
  cleaned = cleaned.replace(/\sclass="[^"]*Mso[^"]*"/gi, "");

  return cleaned.trim();
}

/** Strip Microsoft Word markup so pasted content works in the rich notes editor. */
export function cleanWordHtml(html: string): string {
  return stripInvalidNoteImages(cleanWordMarkup(html));
}

export function isWordHtml(html: string): boolean {
  return /mso-|Word\.Document|xmlns:w|<w:|class="?Mso/i.test(html);
}

const PLACEHOLDER =
  '<p class="word-image-placeholder"><em>Image from Word — use the toolbar image button to upload it.</em></p>';

function isValidImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:image/")) return true;
  if (src.startsWith("notes/") || src.startsWith("chapters/")) return true;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return !src.startsWith("file:") && !src.includes("localhost");
  }
  return false;
}

/** Replace Word/local/broken image tags with a hint to re-upload. */
export function stripInvalidNoteImages(html: string): string {
  if (!html.includes("<img")) return html;
  if (typeof DOMParser === "undefined") {
    return html.replace(/<img\b[^>]*>/gi, PLACEHOLDER);
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("img").forEach((img) => {
    const src = (img.getAttribute("src") ?? "").trim();
    if (isValidImageSrc(src)) return;

    const p = doc.createElement("p");
    p.className = "word-image-placeholder";
    const em = doc.createElement("em");
    em.textContent = "Image from Word — use the toolbar image button to upload it.";
    p.appendChild(em);
    img.replaceWith(p);
  });

  return doc.body.innerHTML;
}
