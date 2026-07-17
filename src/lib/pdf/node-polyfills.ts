import { DOMMatrix, Path2D } from "@napi-rs/canvas";
import * as pdfWorkerModule from "pdfjs-dist/legacy/build/pdf.worker.mjs";

declare global {
  var pdfjsWorker: typeof pdfWorkerModule | undefined;
}

/** Required by pdfjs-dist on Node.js / Netlify before pdf.mjs loads. */
export function ensurePdfNodePolyfills() {
  globalThis.pdfjsWorker = pdfWorkerModule;

  if (typeof globalThis.DOMMatrix === "undefined") {
    globalThis.DOMMatrix = DOMMatrix as typeof globalThis.DOMMatrix;
  }
  if (typeof globalThis.Path2D === "undefined") {
    globalThis.Path2D = Path2D as typeof globalThis.Path2D;
  }
  if (!globalThis.navigator?.language) {
    globalThis.navigator = {
      language: "en-US",
      platform: "",
      userAgent: "",
    } as Navigator;
  }
}

ensurePdfNodePolyfills();
