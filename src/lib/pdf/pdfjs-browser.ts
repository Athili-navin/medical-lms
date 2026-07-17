/** Browser-only PDF.js helpers — assets served from /public/pdfjs (see scripts/copy-pdfjs.mjs). */

const PDFJS_CDN = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

export type BrowserPdfDocument = Awaited<ReturnType<PdfJsModule["getDocument"]>["promise"]>;

let pdfjsPromise: Promise<PdfJsModule> | null = null;

function pdfJsBaseUrl() {
  if (typeof window === "undefined") return "/pdfjs";
  return `${window.location.origin}/pdfjs`;
}

const runtimeImport = new Function(
  "specifier",
  "return import(specifier)"
) as <T>(specifier: string) => Promise<T>;

export function loadBrowserPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const base = pdfJsBaseUrl();
      const pdfjs = await runtimeImport<PdfJsModule>(`${base}/legacy/build/pdf.min.mjs`);
      pdfjs.GlobalWorkerOptions.workerSrc = `${base}/legacy/build/pdf.worker.min.mjs`;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function openBrowserPdfDocument(data: ArrayBuffer): Promise<BrowserPdfDocument> {
  const pdfjs = await loadBrowserPdfJs();
  const base = pdfJsBaseUrl();
  return pdfjs.getDocument({
    data: new Uint8Array(data),
    cMapUrl: `${PDFJS_CDN}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}/standard_fonts/`,
  }).promise;
}

export function closeBrowserPdfDocument(doc: BrowserPdfDocument | null) {
  if (!doc) return;
  try {
    if (typeof doc.cleanup === "function") void doc.cleanup();
  } catch {
    // ignore teardown errors
  }
  try {
    const task = doc.loadingTask as { destroy?: () => Promise<void> } | undefined;
    if (task && typeof task.destroy === "function") void task.destroy();
  } catch {
    // ignore teardown errors
  }
}

export async function renderBrowserPdfPage(
  doc: BrowserPdfDocument,
  pageNumber: number,
  scale = 1.75
) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
    background: "rgb(255, 255, 255)",
  }).promise;

  page.cleanup();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Could not render page"))),
      "image/jpeg",
      0.92
    );
  });

  return blob;
}
