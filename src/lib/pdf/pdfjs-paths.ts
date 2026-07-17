import { createRequire } from "module";
import path from "path";

export function getPdfJsPackageRoot() {
  const require = createRequire(import.meta.url);
  return path.dirname(require.resolve("pdfjs-dist/package.json"));
}
