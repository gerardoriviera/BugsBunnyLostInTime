// Divide l'immagine .bin del gioco in blocchi da 512 KB compressi singolarmente
// con gzip, cosi' il browser puo' scaricare solo le parti di disco che servono.
//
// Uso: node scripts/build-blocks.js "<percorso del file .bin>"
// Output: site/game/b/0000, 0001, ... + site/game/manifest.json

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BLOCK_SIZE = 512 * 1024;

const src = process.argv[2];
if (!src) {
  console.error('Uso: node scripts/build-blocks.js "<file .bin>"');
  process.exit(1);
}

const gameDir = path.join(__dirname, "..", "site", "game");
const blockDir = path.join(gameDir, "b");
fs.rmSync(blockDir, { recursive: true, force: true });
fs.mkdirSync(blockDir, { recursive: true });

const size = fs.statSync(src).size;
const blocks = Math.ceil(size / BLOCK_SIZE);
const fd = fs.openSync(src, "r");
const buf = Buffer.alloc(BLOCK_SIZE);
let compressedSize = 0;

for (let i = 0; i < blocks; i++) {
  const n = fs.readSync(fd, buf, 0, BLOCK_SIZE, i * BLOCK_SIZE);
  const gz = zlib.gzipSync(buf.subarray(0, n), { level: 9 });
  fs.writeFileSync(path.join(blockDir, String(i).padStart(4, "0")), gz);
  compressedSize += gz.length;
}
fs.closeSync(fd);

const manifest = {
  fileName: path.basename(src),
  size,
  blockSize: BLOCK_SIZE,
  blocks,
  compressedSize,
};
fs.writeFileSync(path.join(gameDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`${blocks} blocchi, ${(compressedSize / 1048576).toFixed(1)} MB compressi su ${(size / 1048576).toFixed(1)} MB`);
