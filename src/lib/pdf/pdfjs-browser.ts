/** Browser-only PDF.js helpers — loaded from CDN to avoid Netlify/server bundling issues. */

const PDFJS_VERSION = "6.1.200";
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}`;

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
export type BrowserPdfDocument = Awaited<ReturnType<PdfJsModule["getDocument"]>["promise"]> & {
  destroy(): Promise<void>;
};

let pdfjsPromise: Promise<PdfJsModule> | null = null;

const runtimeImport = new Function(
  "specifier",
  "return import(specifier)"
) as <T>(specifier: string) => Promise<T>;

export function loadBrowserPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await runtimeImport<PdfJsModule>(`${PDFJS_CDN}/legacy/build/pdf.min.mjs`);
      pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/legacy/build/pdf.worker.min.mjs`;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function openBrowserPdfDocument(data: ArrayBuffer): Promise<BrowserPdfDocument> {
  const pdfjs = await loadBrowserPdfJs();
  return pdfjs.getDocument({
    data: new Uint8Array(data),
    cMapUrl: `${PDFJS_CDN}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_CDN}/standard_fonts/`,
  }).promise as Promise<BrowserPdfDocument>;
}

export function closeBrowserPdfDocument(doc: BrowserPdfDocument | null) {
  if (doc) void doc.destroy();
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
