// Prepara desktop/app/site: copia del sito (../site) con l'emulatore e le
// librerie salvati in locale, cosi' l'app funziona senza internet.

const fs = require("fs");
const path = require("path");

const EJS_VERSION = "4.2.3";
const EJS_CDN = `https://cdn.emulatorjs.org/${EJS_VERSION}/data/`;
const EJS_FILES = [
  "loader.js",
  "emulator.min.js",
  "emulator.min.css",
  "localization/it-IT.json",
  "cores/reports/pcsx_rearmed.json",
  "cores/pcsx_rearmed-wasm.data",
  "cores/pcsx_rearmed-legacy-wasm.data",
  "cores/pcsx_rearmed-thread-wasm.data",
  "compression/extract7z.js",
  "compression/extractzip.js",
];
const PAKO_URL = "https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako_inflate.min.js";

const siteSrc = path.join(__dirname, "..", "site");
const siteOut = path.join(__dirname, "app", "site");
const vendorCache = path.join(__dirname, ".vendor-cache");

async function download(url, dest) {
  if (fs.existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: errore ${res.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("scaricato", url);
}

function replaceOnce(text, from, to) {
  if (!text.includes(from)) throw new Error(`Testo non trovato in index.html: ${from}`);
  return text.replace(from, to);
}

async function main() {
  for (const f of EJS_FILES) {
    await download(EJS_CDN + f, path.join(vendorCache, "ejs", f));
  }
  await download(PAKO_URL, path.join(vendorCache, "pako_inflate.min.js"));

  fs.rmSync(siteOut, { recursive: true, force: true });
  fs.cpSync(siteSrc, siteOut, { recursive: true });
  fs.cpSync(vendorCache, path.join(siteOut, "vendor"), { recursive: true });

  const indexPath = path.join(siteOut, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  html = replaceOnce(html, PAKO_URL, "vendor/pako_inflate.min.js");
  html = replaceOnce(html, `const EJS_DATA = "${EJS_CDN}";`, 'const EJS_DATA = "vendor/ejs/";');
  html = replaceOnce(html, "const USE_CACHE = true;", "const USE_CACHE = false;");
  fs.writeFileSync(indexPath, html);
  console.log("sito pronto in", siteOut);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
