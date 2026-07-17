import { createRequire } from "module";
import { pathToFileURL } from "url";
import "@/lib/pdf/node-polyfills";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfWorkerModule = typeof import("pdfjs-dist/legacy/build/pdf.worker.mjs");

declare global {
  var pdfjsWorker: PdfWorkerModule | undefined;
}

let pdfjsLib: PdfJsModule | null = null;
let pdfjsInit: Promise<PdfJsModule> | null = null;

/** Hidden from webpack static analysis so Netlify gets real file paths, not module ids. */
const runtimeImport = new Function(
  "specifier",
  "return import(specifier)"
) as <T>(specifier: string) => Promise<T>;

function resolvePdfJsModule(...segments: string[]) {
  const nodeRequire = createRequire(import.meta.url);
  return nodeRequire.resolve(["pdfjs-dist", ...segments].join("/"));
}

export async function getPdfJs(): Promise<PdfJsModule> {
  if (pdfjsLib) return pdfjsLib;
  if (pdfjsInit) return pdfjsInit;

  pdfjsInit = (async () => {
    if (!globalThis.pdfjsWorker?.WorkerMessageHandler) {
      const workerPath = resolvePdfJsModule("legacy", "build", "pdf.worker.mjs");
      globalThis.pdfjsWorker = await runtimeImport<PdfWorkerModule>(
        pathToFileURL(workerPath).href
      );
    }

    const pdfPath = resolvePdfJsModule("legacy", "build", "pdf.mjs");
    pdfjsLib = await runtimeImport<PdfJsModule>(pathToFileURL(pdfPath).href);
    return pdfjsLib;
  })();

  return pdfjsInit;
}
