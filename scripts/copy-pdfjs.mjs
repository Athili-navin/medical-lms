import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgRoot = path.join(root, "node_modules", "pdfjs-dist");
const outRoot = path.join(root, "public", "pdfjs");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(path.join(pkgRoot, "package.json"))) {
  console.warn("copy-pdfjs: pdfjs-dist not installed, skipping");
  process.exit(0);
}

copyFile(
  path.join(pkgRoot, "legacy", "build", "pdf.min.mjs"),
  path.join(outRoot, "legacy", "build", "pdf.min.mjs")
);
copyFile(
  path.join(pkgRoot, "legacy", "build", "pdf.worker.min.mjs"),
  path.join(outRoot, "legacy", "build", "pdf.worker.min.mjs")
);
copyDir(path.join(pkgRoot, "standard_fonts"), path.join(outRoot, "standard_fonts"));

console.log("copy-pdfjs: synced pdf.js runtime assets to public/pdfjs");
