import { cleanWordMarkup, isWordHtml, stripInvalidNoteImages } from "@/lib/notes/clean-word-html";
import { extractStoragePath } from "@/lib/notes/note-image-utils";
import { uploadNoteImage } from "@/lib/notes/upload-note-image";

function pastedFileName(index: number, mime: string): string {
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  return `pasted-${Date.now()}-${index}.${ext}`;
}

export function extractClipboardImageFiles(data: DataTransfer): File[] {
  const files: File[] = [];
  for (const item of Array.from(data.items)) {
    if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  return files;
}

export async function extractImagesFromClipboardItems(items: ClipboardItem[]): Promise<File[]> {
  const files: File[] = [];
  for (const item of items) {
    for (const type of item.types) {
      if (!type.startsWith("image/")) continue;
      const blob = await item.getType(type);
      files.push(new File([blob], pastedFileName(files.length, type), { type }));
    }
  }
  return files;
}

function dataUrlToFile(dataUrl: string, index: number): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header?.match(/data:([^;]+)/i)?.[1] ?? "image/png";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], pastedFileName(index, mime), { type: mime });
}

function isExternalHttpImage(src: string): boolean {
  return (
    (src.startsWith("http://") || src.startsWith("https://")) &&
    !src.includes("localhost") &&
    extractStoragePath(src) === null
  );
}

function imageNeedsUpload(src: string): boolean {
  if (!src) return true;
  if (src.startsWith("data:image/")) return true;
  if (src.startsWith("notes/") || src.startsWith("chapters/")) return false;
  if (extractStoragePath(src)) return false;
  if (isExternalHttpImage(src)) return false;
  return true;
}

export function pasteNeedsImageUpload(data: DataTransfer): boolean {
  const html = data.getData("text/html").trim();
  const clipboardFiles = extractClipboardImageFiles(data);

  if (clipboardFiles.length > 0 && !html) return true;

  if (!html) return false;
  if (/data:image\//i.test(html)) return true;

  if (!html.includes("<img")) return false;

  if (typeof DOMParser === "undefined") return true;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const needsUpload = Array.from(doc.querySelectorAll("img")).some((img) =>
    imageNeedsUpload((img.getAttribute("src") ?? "").trim())
  );

  if (needsUpload && clipboardFiles.length > 0) return true;
  return needsUpload;
}

export async function resolvePastedHtmlImages(
  chapterId: string,
  html: string,
  clipboardFiles: File[]
): Promise<string> {
  if (!html && clipboardFiles.length === 0) return html;

  if (!html.includes("<img") && clipboardFiles.length > 0) {
    const uploads = await Promise.all(clipboardFiles.map((file) => uploadNoteImage(chapterId, file)));
    return uploads
      .map((path) => `<img src="${path}" data-storage-path="${path}" alt="Pasted image" />`)
      .join("");
  }

  if (!html.includes("<img")) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img"));
  const fileQueue = [...clipboardFiles];
  let uploadIndex = 0;

  for (const img of imgs) {
    const src = (img.getAttribute("src") ?? "").trim();

    if (!imageNeedsUpload(src)) {
      const storagePath = extractStoragePath(src) ?? (src.startsWith("notes/") || src.startsWith("chapters/") ? src : null);
      if (storagePath) {
        img.setAttribute("src", storagePath);
        img.setAttribute("data-storage-path", storagePath);
      }
      continue;
    }

    if (src.startsWith("data:image/")) {
      const file = dataUrlToFile(src, uploadIndex++);
      const path = await uploadNoteImage(chapterId, file);
      img.setAttribute("src", path);
      img.setAttribute("data-storage-path", path);
      continue;
    }

    if (fileQueue.length > 0) {
      const file = fileQueue.shift()!;
      const path = await uploadNoteImage(chapterId, file);
      img.setAttribute("src", path);
      img.setAttribute("data-storage-path", path);
    }
  }

  return stripInvalidNoteImages(doc.body.innerHTML);
}

export async function processPastedContent(
  chapterId: string,
  data: DataTransfer
): Promise<{ html: string; imageOnly: boolean }> {
  const clipboardFiles = extractClipboardImageFiles(data);
  let html = data.getData("text/html");

  if (html && isWordHtml(html)) {
    html = cleanWordMarkup(html);
  }

  const plainText = data.getData("text/plain").trim();
  const imageOnly = !html && clipboardFiles.length > 0;

  if (imageOnly) {
    const resolved = await resolvePastedHtmlImages(chapterId, "", clipboardFiles);
    return { html: resolved, imageOnly: true };
  }

  if (html) {
    const resolved = await resolvePastedHtmlImages(chapterId, html, clipboardFiles);
    return { html: resolved, imageOnly: false };
  }

  if (plainText) {
    const paragraphs = plainText
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
    return { html: paragraphs, imageOnly: false };
  }

  return { html: "", imageOnly: false };
}

export async function processClipboardItems(
  chapterId: string,
  items: ClipboardItem[]
): Promise<string | null> {
  const clipboardFiles = await extractImagesFromClipboardItems(items);

  for (const item of items) {
    if (!item.types.includes("text/html")) continue;
    const blob = await item.getType("text/html");
    const html = cleanWordMarkup(await blob.text());
    if (!html && clipboardFiles.length === 0) continue;
    return resolvePastedHtmlImages(chapterId, html, clipboardFiles);
  }

  if (clipboardFiles.length > 0) {
    return resolvePastedHtmlImages(chapterId, "", clipboardFiles);
  }

  for (const item of items) {
    if (!item.types.includes("text/plain")) continue;
    const blob = await item.getType("text/plain");
    const text = (await blob.text()).trim();
    if (!text) continue;
    return text
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  return null;
}
