import { DOMMatrix, Path2D } from "@napi-rs/canvas";

/** Required by pdfjs-dist on Node.js / Netlify before PDF modules load. */
export function ensurePdfNodePolyfills() {
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
