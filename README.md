# Bugs Bunny: Lost in Time — versione browser

Il gioco PlayStation (versione europea) gira nel browser tramite [EmulatorJS](https://emulatorjs.org) 4.2.3 (core PCSX-ReARMed, BIOS emulato HLE).

## Struttura

- `site/` — la cartella da pubblicare (è tutto il sito).
  - `index.html` — pagina di gioco: scarica i pezzi, li decomprime nel browser e avvia l'emulatore.
  - `game/game.part000…006` — immagine del CD compressa con gzip e divisa in pezzi da 45 MB (limite GitHub: 100 MB per file).
  - `game/manifest.json` — elenco dei pezzi e dimensioni.
  - `_headers` — header di cache per Netlify.
- `scripts/build-parts.js` — rigenera i pezzi da un file `.bin`: `node scripts/build-parts.js "percorso/del/gioco.bin"`
- `netlify.toml` — dice a Netlify di pubblicare `site/`.

## Pubblicare su Netlify

**Da GitHub (consigliato):** Netlify → *Add new site* → *Import an existing project* → GitHub → questo repository. Le impostazioni vengono lette da `netlify.toml`, non serve nessun comando di build.

**Trascinando la cartella:** Netlify → *Add new site* → *Deploy manually* → trascina la cartella `site`.

## Note

- Al primo avvio vengono scaricati circa 280 MB; poi i pezzi restano nella cache del browser.
- I salvataggi (memory card e salvataggi rapidi) restano nel browser di chi gioca.
- Serve un browser recente (Chrome, Edge, Firefox, Safari) con supporto a `DecompressionStream`.
- Il gioco è protetto da copyright: tieni il repository privato.
