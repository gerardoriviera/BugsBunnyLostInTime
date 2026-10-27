// Comprime l'immagine .bin del gioco con gzip e la divide in pezzi
// sotto il limite di 100 MB per file di GitHub.
//
// Uso: node scripts/build-parts.js "<percorso del file .bin>"
// Output: site/game/game.part000, game.part001, ... + site/game/manifest.json

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PART_SIZE = 45 * 1024 * 1024;

const src = process.argv[2];
if (!src) {
  console.error('Uso: node scripts/build-parts.js "<file .bin>"');
  process.exit(1);
}

const outDir = path.join(__dirname, "..", "site", "game");
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) {
  if (f.startsWith("game.part")) fs.unlinkSync(path.join(outDir, f));
}

const originalSize = fs.statSync(src).size;
const parts = [];
let current = null;
let currentSize = 0;
let totalSize = 0;

function openPart() {
  const name = "game.part" + String(parts.length).padStart(3, "0");
  parts.push({ name, size: 0 });
  current = fs.openSync(path.join(outDir, name), "w");
  currentSize = 0;
}

function write(buf) {
  let offset = 0;
  while (offset < buf.length) {
    if (current === null || currentSize === PART_SIZE) {
      if (current !== null) fs.closeSync(current);
      openPart();
    }
    const n = Math.min(PART_SIZE - currentSize, buf.length - offset);
    fs.writeSync(current, buf, offset, n);
    offset += n;
    currentSize += n;
    totalSize += n;
    parts[parts.length - 1].size += n;
  }
}

const gzip = zlib.createGzip({ level: 9 });
gzip.on("data", write);
gzip.on("end", () => {
  if (current !== null) fs.closeSync(current);
  const manifest = {
    fileName: path.basename(src),
    originalSize,
    compressedSize: totalSize,
    parts,
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`${parts.length} pezzi, ${(totalSize / 1048576).toFixed(1)} MB compressi su ${(originalSize / 1048576).toFixed(1)} MB`);
});
fs.createReadStream(src).pipe(gzip);
