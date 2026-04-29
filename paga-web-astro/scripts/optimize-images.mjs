#!/usr/bin/env node
/**
 * Optimiza recursivamente todas las imágenes de /public:
 *   - Re-codifica PNG/JPG con compresión moderna.
 *   - Genera variante .webp al lado del original.
 *   - Redimensiona a un ancho máximo (default 1920px) preservando aspecto.
 *
 * USO:
 *   node scripts/optimize-images.mjs           # dry-run (no escribe)
 *   node scripts/optimize-images.mjs --apply   # sobrescribe + genera .webp
 *   node scripts/optimize-images.mjs --apply --max-width=1280
 *
 * Crea backups en /public-original/ la primera vez que se ejecuta con --apply.
 */
import { readdir, stat, mkdir, copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const BACKUP_DIR = path.join(ROOT, "public-original");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const MAX_WIDTH = Number(
  (args.find((a) => a.startsWith("--max-width=")) || "").split("=")[1] || 1920
);
const QUALITY_JPG = 80;
const QUALITY_WEBP = 78;
const QUALITY_PNG_EFFORT = 8;

const RAW_EXT = new Set([".jpg", ".jpeg", ".png"]);

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}

async function processFile(file, totals) {
  const ext = path.extname(file).toLowerCase();
  if (!RAW_EXT.has(ext)) return;

  const origStat = await stat(file);
  const origSize = origStat.size;

  let pipeline = sharp(file).rotate(); // respeta EXIF
  const metadata = await sharp(file).metadata();

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  // Re-codifica el formato original
  let reencoded;
  if (ext === ".png") {
    reencoded = await pipeline
      .clone()
      .png({ compressionLevel: 9, palette: true, effort: QUALITY_PNG_EFFORT })
      .toBuffer();
  } else {
    reencoded = await pipeline
      .clone()
      .jpeg({ quality: QUALITY_JPG, mozjpeg: true })
      .toBuffer();
  }

  // Variante WebP siempre
  const webpBuffer = await pipeline.clone().webp({ quality: QUALITY_WEBP }).toBuffer();
  const webpPath = file.replace(/\.(jpe?g|png)$/i, ".webp");

  const newSize = reencoded.length;
  const webpSize = webpBuffer.length;
  const savings = origSize - newSize;

  totals.files += 1;
  totals.origBytes += origSize;
  totals.newBytes += newSize;
  totals.webpBytes += webpSize;

  const rel = path.relative(PUBLIC_DIR, file);
  console.log(
    `  ${rel.padEnd(60)} ${fmtBytes(origSize).padStart(10)} → ${fmtBytes(newSize).padStart(10)}  +webp ${fmtBytes(webpSize).padStart(10)}  (${savings > 0 ? "-" : "+"}${fmtBytes(Math.abs(savings))})`
  );

  if (!APPLY) return;

  // Backup la primera vez
  const backupPath = path.join(BACKUP_DIR, rel);
  if (!(await exists(backupPath))) {
    await mkdir(path.dirname(backupPath), { recursive: true });
    await copyFile(file, backupPath);
  }

  // Sólo sobrescribe si es más pequeño
  if (newSize < origSize) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(file, reencoded);
  }
  const { writeFile } = await import("node:fs/promises");
  await writeFile(webpPath, webpBuffer);
}

async function main() {
  if (!(await exists(PUBLIC_DIR))) {
    console.error(`No existe ${PUBLIC_DIR}`);
    process.exit(1);
  }
  console.log(
    `\n${APPLY ? "APLICANDO" : "DRY-RUN"} | max-width=${MAX_WIDTH}px | calidad jpg=${QUALITY_JPG} webp=${QUALITY_WEBP}\n`
  );

  const totals = { files: 0, origBytes: 0, newBytes: 0, webpBytes: 0 };
  for await (const f of walk(PUBLIC_DIR)) {
    try {
      await processFile(f, totals);
    } catch (err) {
      console.error(`  ERROR ${f}:`, err.message);
    }
  }

  console.log("\n────────────────────────────────");
  console.log(`Archivos procesados: ${totals.files}`);
  console.log(`Original total:      ${fmtBytes(totals.origBytes)}`);
  console.log(`Re-codificado:       ${fmtBytes(totals.newBytes)}  (${(((totals.origBytes - totals.newBytes) / totals.origBytes) * 100).toFixed(1)}% menos)`);
  console.log(`WebP total:          ${fmtBytes(totals.webpBytes)}  (${(((totals.origBytes - totals.webpBytes) / totals.origBytes) * 100).toFixed(1)}% menos vs original)`);
  if (!APPLY) console.log(`\n⚠  Esto fue un DRY-RUN. Re-ejecuta con --apply para sobrescribir.`);
  if (APPLY) console.log(`\n✔ Backups en: ${path.relative(ROOT, BACKUP_DIR)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
