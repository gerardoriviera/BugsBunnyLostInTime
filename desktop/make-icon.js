// Crea icon.ico (16-256 px) da icon-source.png. Serve ffmpeg nel PATH.
// Scala "nearest neighbor" per tenere i pixel netti.
// Uso: node make-icon.js

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SIZES = [256, 128, 64, 48, 32, 16];
const src = path.join(__dirname, "icon-source.png");

const images = SIZES.map(size => execFileSync("ffmpeg", [
  "-v", "error", "-i", src,
  "-vf", `scale=${size}:${size}:flags=neighbor,format=rgba`,
  "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "-",
]));

// Formato ICO: intestazione, una voce di 16 byte per immagine, poi i PNG.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((png, i) => {
  const e = Buffer.alloc(16);
  const size = SIZES[i];
  e.writeUInt8(size >= 256 ? 0 : size, 0);
  e.writeUInt8(size >= 256 ? 0 : size, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
fs.writeFileSync(path.join(__dirname, "icon.ico"), Buffer.concat([header, ...entries, ...images]));
console.log("icon.ico creata");
