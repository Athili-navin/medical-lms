import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PDFJS_DIR = path.join("node_modules", "pdfjs-dist");

function moduleDir() {
  return path.dirname(fileURLToPath(import.meta.url));
}

/** Locate traced pdfjs-dist on disk (Netlify bundles it without npm resolution). */
export function getPdfJsPackageRoot() {
  let dir = moduleDir();

  for (let depth = 0; depth < 12; depth++) {
    const candidate = path.join(dir, PDFJS_DIR);
    if (fs.existsSync(path.join(candidate, "package.json"))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  const fromCwd = path.join(process.cwd(), PDFJS_DIR);
  if (fs.existsSync(path.join(fromCwd, "package.json"))) {
    return fromCwd;
  }

  throw new Error("pdfjs-dist not found in server bundle");
}

export function getPdfJsAssetPath(...segments: string[]) {
  const assetPath = path.join(getPdfJsPackageRoot(), ...segments);
  if (!fs.existsSync(assetPath)) {
    throw new Error(`pdfjs asset missing: ${segments.join("/")}`);
  }
  return assetPath;
}
