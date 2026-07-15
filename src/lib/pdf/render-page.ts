import path from "path";
import { pathToFileURL } from "url";
import "@/lib/pdf/node-polyfills";
type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfDocument = Awaited<ReturnType<PdfJsModule["getDocument"]>["promise"]>;

type CanvasFactory = {
  create: (
    w: number,
    h: number
  ) => {
    canvas: { toBuffer: (mime: string, quality?: number) => Buffer };
    context: CanvasRenderingContext2D;
  };
};

let pdfjsLib: PdfJsModule | null = null;
let pdfjsInit: Promise<PdfJsModule> | null = null;

const bytesCache = new Map<string, { bytes: Uint8Array; expires: number }>();
const docCache = new Map<string, { doc: PdfDocument; expires: number }>();
const chapterQueues = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const RENDER_SCALE = 2;

const pdfAssetRoot = path.join(process.cwd(), "node_modules", "pdfjs-dist");

function toFactoryUrl(...segments: string[]) {
  return `${path.join(pdfAssetRoot, ...segments).replace(/\\/g, "/")}/`;
}

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (pdfjsInit) return pdfjsInit;

  pdfjsInit = (async () => {
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const workerPath = path.join(pdfAssetRoot, "legacy", "build", "pdf.worker.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    return pdfjsLib;
  })();
  return pdfjsInit;
}

function cloneBytes(bytes: Uint8Array) {
  return new Uint8Array(bytes);
}

function runQueued<T>(chapterId: string, task: () => Promise<T>) {
  const prev = chapterQueues.get(chapterId) ?? Promise.resolve();
  const next = prev.then(task, task);
  chapterQueues.set(chapterId, next.finally(() => {
    if (chapterQueues.get(chapterId) === next) chapterQueues.delete(chapterId);
  }));
  return next;
}

export function rememberPdfBytes(chapterId: string, bytes: Uint8Array) {
  bytesCache.set(chapterId, { bytes: cloneBytes(bytes), expires: Date.now() + CACHE_TTL_MS });
}

export function getRememberedPdfBytes(chapterId: string) {
  const entry = bytesCache.get(chapterId);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    bytesCache.delete(chapterId);
    docCache.delete(chapterId);
    return null;
  }
  return entry.bytes;
}

async function loadDocument(bytes: Uint8Array, cacheKey?: string) {
  if (cacheKey) {
    const cached = docCache.get(cacheKey);
    if (cached && Date.now() <= cached.expires) {
      return cached.doc;
    }
  }

  const pdfjs = await getPdfJs();
  const doc = await pdfjs
    .getDocument({
      data: cloneBytes(bytes),
      useSystemFonts: true,
      disableFontFace: true,
      useWorkerFetch: false,
      cMapUrl: toFactoryUrl("cmaps"),
      cMapPacked: true,
      standardFontDataUrl: toFactoryUrl("standard_fonts"),
    })
    .promise;

  if (cacheKey) {
    docCache.set(cacheKey, { doc, expires: Date.now() + CACHE_TTL_MS });
  }

  return doc;
}

export async function getPdfPageCount(bytes: Uint8Array, cacheKey?: string) {
  const doc = await loadDocument(bytes, cacheKey);
  return doc.numPages;
}

export async function renderPdfPageFromDoc(doc: PdfDocument, pageNumber: number, scale = RENDER_SCALE) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvasFactory = (doc as PdfDocument & { canvasFactory?: CanvasFactory }).canvasFactory;
  if (!canvasFactory) {
    throw new Error("PDF canvas factory unavailable");
  }

  const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

  await page.render({
    canvasContext: canvasAndContext.context,
    viewport,
    canvas: canvasAndContext.canvas as unknown as HTMLCanvasElement,
  }).promise;

  page.cleanup();

  return canvasAndContext.canvas.toBuffer("image/jpeg", 92);
}

export async function renderPdfPageToJpeg(
  bytes: Uint8Array,
  pageNumber: number,
  scale = RENDER_SCALE,
  cacheKey?: string
) {
  const doc = await loadDocument(bytes, cacheKey);
  return renderPdfPageFromDoc(doc, pageNumber, scale);
}

export async function renderPdfPageForChapter(
  bytes: Uint8Array,
  chapterId: string,
  pageNumber: number
) {
  return runQueued(chapterId, async () => {
    const doc = await loadDocument(bytes, chapterId);
    if (pageNumber > doc.numPages) {
      throw new Error("Page not found");
    }
    return renderPdfPageFromDoc(doc, pageNumber);
  });
}

export async function getPdfPageCountForChapter(bytes: Uint8Array, chapterId: string) {
  return runQueued(chapterId, async () => {
    const doc = await loadDocument(bytes, chapterId);
    return doc.numPages;
  });
}
