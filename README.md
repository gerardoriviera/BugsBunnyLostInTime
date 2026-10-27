# Bugs Bunny: Lost in Time — versione browser

Il gioco PlayStation (versione europea) gira nel browser tramite [EmulatorJS](https://emulatorjs.org) 4.2.3 (core PCSX-ReARMed, BIOS emulato HLE). Il disco arriva in streaming: il gioco parte in pochi secondi e scarica solo i blocchi che servono, mentre il resto viene caricato in background.

## Struttura

- `site/` — la cartella da pubblicare (è tutto il sito).
  - `index.html` — pagina di gioco: monta nell'emulatore un disco virtuale che legge i blocchi a richiesta.
  - `game/b/0000…1192` — immagine del CD divisa in blocchi da 512 KB, ognuno compresso con gzip.
  - `game/manifest.json` — dimensioni del disco e numero di blocchi.
  - `_headers` — header di cache per Netlify.
- `scripts/build-blocks.js` — rigenera i blocchi da un file `.bin`: `node scripts/build-blocks.js "percorso/del/gioco.bin"`
- `netlify.toml` — dice a Netlify di pubblicare `site/`.

## Pubblicare su Netlify

**Da GitHub (consigliato):** Netlify → *Add new site* → *Import an existing project* → GitHub → questo repository. Le impostazioni vengono lette da `netlify.toml`, non serve nessun comando di build.

**Trascinando la cartella:** Netlify → *Add new site* → *Deploy manually* → trascina la cartella `site`.

## Comandi e trucchi

- **Smartphone:** pad touch con croce direzionale, △ □ ○ ✕, L1/R1/L2/R2, Select e Start.
- **Controller Xbox (predefinito):** levetta sinistra o croce per muoversi, A salto, B accucciarsi, X calcio, Y guardarsi intorno, LB/RB/LT/RT = L1/R1/L2/R2, Menu = Start, View = Select.
- **Desktop:** il tasto **Tab** mostra (e ripremendolo nasconde) la legenda dei tasti di tastiera e controller e il pulsante *Trucchi*. La legenda si aggiorna quando i tasti vengono cambiati dal menu Controlli. L2 da tastiera è su W.
- **Trucchi:** il pulsante *Trucchi* (sempre visibile su smartphone) inserisce in automatico i codici ufficiali del gioco (versione PAL). Vanno usati nella schermata Selezione Epoca (la macchina del tempo). *Sblocca tutti i livelli* rende visitabili tutte le epoche.

## Versione per PC (Windows, senza installazione)

La cartella `desktop/` crea un'app portatile con Electron: doppio clic sull'eseguibile e il gioco parte, senza internet e senza installare niente. L'emulatore e le librerie vengono inclusi nella cartella; i salvataggi finiscono in `salvataggi/` accanto all'eseguibile.

```
cd desktop
npm install
npm run build
```

Il risultato è in `desktop/out/Bugs Bunny Lost in Time-win32-x64/`.

## Note

- Al primo avvio il gioco parte dopo pochi secondi; in basso a destra si vede quanta parte del disco è già caricata. Le visite successive usano la cache del browser.
- Per provare lo streaming puro (senza caricamento in background) apri la pagina con `?nopreload`.
- I salvataggi (memory card e salvataggi rapidi) restano nel browser di chi gioca.
- Serve un browser recente (Chrome, Edge, Firefox, Safari).
- Il gioco è protetto da copyright: tieni il repository privato.
