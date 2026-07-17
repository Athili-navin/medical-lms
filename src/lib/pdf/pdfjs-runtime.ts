import { pathToFileURL } from "url";
import "@/lib/pdf/node-polyfills";
import { getPdfJsAssetPath } from "@/lib/pdf/pdfjs-paths";

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

export async function getPdfJs(): Promise<PdfJsModule> {
  if (pdfjsLib) return pdfjsLib;
  if (pdfjsInit) return pdfjsInit;

  pdfjsInit = (async () => {
    const workerPath = getPdfJsAssetPath("legacy", "build", "pdf.worker.mjs");

    if (!globalThis.pdfjsWorker?.WorkerMessageHandler) {
      globalThis.pdfjsWorker = await runtimeImport<PdfWorkerModule>(
        pathToFileURL(workerPath).href
      );
    }

    const pdfPath = getPdfJsAssetPath("legacy", "build", "pdf.mjs");
    pdfjsLib = await runtimeImport<PdfJsModule>(pathToFileURL(pdfPath).href);

    // Prevent pdf.js from dynamic-importing a webpack module id as workerSrc.
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

    return pdfjsLib;
  })();

  return pdfjsInit;
}
