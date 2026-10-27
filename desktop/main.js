// App desktop: serve il sito da un server locale (solo 127.0.0.1) e lo apre
// in una finestra. Nella versione portatile i salvataggi stanno nella cartella
// "salvataggi" accanto all'eseguibile.

const { app, BrowserWindow, shell } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Porta fissa: i salvataggi del browser sono legati all'indirizzo, quindi
// deve restare la stessa a ogni avvio.
const PORT = 47391;
const SITE_DIR = path.join(__dirname, "app", "site");

if (app.isPackaged) {
  app.setPath("userData", path.join(path.dirname(process.execPath), "salvataggi"));
}
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    const file = path.join(SITE_DIR, path.normalize(urlPath));
    if (!file.startsWith(SITE_DIR)) {
      res.writeHead(403);
      return res.end();
    }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) {
        res.writeHead(404);
        return res.end();
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
        "Content-Length": st.size,
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(file).pipe(res);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    backgroundColor: "#0d0b1a",
    autoHideMenuBar: true,
    title: "Bugs Bunny Lost in Time",
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  win.setMenu(null);

  // F11 = schermo intero.
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });

  // Alla chiusura salva la memory card e aspetta che venga scritta su disco.
  let closing = false;
  win.on("close", event => {
    if (closing) return;
    closing = true;
    event.preventDefault();
    win.webContents.executeJavaScript("window.bbSaveNow && window.bbSaveNow()")
      .catch(() => {})
      .finally(() => setTimeout(() => win.destroy(), 500));
  });

  // I link esterni (es. crediti dell'emulatore) si aprono nel browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.loadURL(`http://127.0.0.1:${PORT}/?autostart`);
}

app.whenReady().then(async () => {
  try {
    await startServer();
  } catch (e) {
    const { dialog } = require("electron");
    dialog.showErrorBox("Bugs Bunny Lost in Time",
      `Impossibile avviare il gioco: la porta ${PORT} è occupata (forse il gioco è già aperto).`);
    app.quit();
    return;
  }
  createWindow();
});

app.on("window-all-closed", () => app.quit());
