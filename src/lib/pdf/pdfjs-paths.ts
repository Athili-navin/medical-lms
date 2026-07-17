import { createRequire } from "module";
import path from "path";

export function getPdfJsPackageRoot() {
  const nodeRequire = createRequire(import.meta.url);
  return path.dirname(nodeRequire.resolve(["pdfjs-dist", "package.json"].join("/")));
}
