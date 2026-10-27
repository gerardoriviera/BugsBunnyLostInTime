// Crea la cartella portatile per Windows in desktop/out.

const { packager } = require("@electron/packager");
const fs = require("fs");
const path = require("path");

packager({
  dir: __dirname,
  out: path.join(__dirname, "out"),
  name: "Bugs Bunny Lost in Time",
  executableName: "Bugs Bunny Lost in Time",
  platform: "win32",
  arch: "x64",
  asar: false,
  overwrite: true,
  prune: true,
  ignore: [/^\/out($|\/)/, /^\/\.vendor-cache($|\/)/, /^\/prepare\.js$/, /^\/package-win\.js$/],
  win32metadata: {
    ProductName: "Bugs Bunny Lost in Time",
    FileDescription: "Bugs Bunny Lost in Time",
  },
}).then(paths => {
  // Tiene solo le lingue dell'interfaccia di Chromium che servono.
  for (const dir of paths) {
    const locales = path.join(dir, "locales");
    for (const f of fs.readdirSync(locales)) {
      if (!["en-US.pak", "it.pak"].includes(f)) fs.unlinkSync(path.join(locales, f));
    }
  }
  console.log("Pronto:", paths.join(", "));
}).catch(e => {
  console.error(e);
  process.exit(1);
});
