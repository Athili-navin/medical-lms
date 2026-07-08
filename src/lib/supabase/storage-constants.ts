export const CHAPTER_PDF_BUCKET = "chapter-pdfs";
export const GLOSSARY_IMAGE_BUCKET = "glossary-images";
export const MAX_PDF_BYTES = 25 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
