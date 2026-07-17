import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PDFJS_DIR = path.join("node_modules", "pdfjs-dist");

function moduleDir() {
  return path.dirname(fileURLToPath(import.meta.url));
}

/** Locate traced pdfjs-dist on disk (Netlify bundles it without npm resolution). */
export function getPdfJsPackageRoot() {
  const searchRoots = new Set<string>();
  let dir = moduleDir();

  for (let depth = 0; depth < 16; depth++) {
    searchRoots.add(dir);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  searchRoots.add(process.cwd());

  const relativeCandidates = [
    PDFJS_DIR,
    path.join(".next", "server", "node_modules", "pdfjs-dist"),
    path.join("node_modules", ".pnpm", "node_modules", "pdfjs-dist"),
  ];

  for (const root of searchRoots) {
    for (const rel of relativeCandidates) {
      const candidate = path.join(root, rel);
      if (fs.existsSync(path.join(candidate, "package.json"))) {
        return candidate;
      }
    }
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
