// Durchlauf aller Spiele: Gastgeber und Gast (zwei getrennte Browser-Profile) eröffnen eine Stube,
// starten jedes Spiel, tippen ein paar Knöpfe an und sammeln JavaScript-Fehler.
//
//   cd tests && npm install && npm test          alle Spiele
//   npm test -- watten schnapsen                 nur bestimmte Spiele
//   CHROME_PATH=/pfad/zu/chrome npm test         anderer Browser
//
// Die Seite selbst braucht keinen Build-Schritt; nur dieser Test braucht Node und puppeteer-core.
// Achtung: Die Spielzüge laufen wie beim echten Spielen über den öffentlichen MQTT-Server, es braucht also Internet.
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "..");
const ALL = ["zehn", "hl", "schaetzen", "hinweis", "umriss", "geo", "land", "oben", "duell", "frage",
  "siebzehn", "bus", "stich", "watten", "schnapsen", "slf", "wl", "alm", "querbeet"];
const GAMES = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const candidates = [process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"];
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) { console.error("Kein Chrome gefunden – bitte CHROME_PATH setzen."); process.exit(2); }
  return found;
}

// Kleiner Webserver für den Projektordner (wie `python3 -m http.server`)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json", ".svg": "image/svg+xml" };
function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = path.join(ROOT, rel === "/" ? "index.html" : rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

// Spiele, bei denen ein paar zufällige Klicks nicht weit genug kommen: gezielt eine ganze Runde durchspielen
const DEEP = {
  // Antwort sucht Frage: Frage stellen, nicht wortgleich antworten, Fragesteller entscheidet „Zählt“ → Auflösung muss erscheinen
  async frage(host, guest, errs) {
    const asker = (await host.evaluate(() => !!document.querySelector("#fq-q"))) ? host : guest, guesser = asker === host ? guest : host;
    const until = async (p, sel, ms = 8000) => { for (let i = 0; i < ms / 250; i++) { if (await p.evaluate((x) => !!document.querySelector(x), sel)) return true; await sleep(250); } return false; };
    if (!(await until(asker, "#fq-q"))) return errs.push("Antwort sucht Frage: kein Eingabefeld für die Frage");
    // bei „3 Antworten zur Auswahl“ (Standard) zuerst eine Antwort wählen
    if (await asker.evaluate(() => { const c = document.querySelector("[data-fqpick]"); if (c) c.click(); return !!c; })) await sleep(800);
    await asker.type("#fq-q", "Was ist das für eine Testfrage?");
    await asker.evaluate(() => document.querySelector(".fq-form").requestSubmit());
    if (!(await until(guesser, "#fq-a"))) return errs.push("Antwort sucht Frage: Antwortfeld erscheint nicht");
    await guesser.type("#fq-a", "etwas ganz anderes");
    await guesser.evaluate(() => document.querySelector(".fq-aform").requestSubmit());
    if (!(await until(asker, "[data-fqjudge]"))) return errs.push("Antwort sucht Frage: Knöpfe „Zählt / Zählt nicht“ erscheinen nicht");
    await asker.evaluate(() => document.querySelector('[data-fqjudge="1"]').click());
    for (const [p, who] of [[asker, "Fragesteller"], [guesser, "Antwortender"]])
      if (!(await until(p, "#fq-next"))) errs.push(`Antwort sucht Frage: nach „Zählt“ keine Auflösung beim ${who}`);
  },
};

async function playGame(browser, base, game) {
  const errs = [];
  const ctxHost = await browser.createBrowserContext(), ctxGuest = await browser.createBrowserContext();
  const page = async (ctx, who) => {
    const p = await ctx.newPage();
    await p.setViewport({ width: 1280, height: 900 });
    p.on("dialog", (d) => d.dismiss().catch(() => {}));
    p.on("pageerror", (e) => errs.push(`${who}: ${e.message}`));
    // Ladefehler von Kartenbildern (Esri) ignorieren, die hängen nicht an uns
    p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|arcgisonline|tile/i.test(m.text())) errs.push(`${who} (Konsole): ${m.text()}`); });
    return p;
  };
  try {
    const host = await page(ctxHost, "Gastgeber");
    await host.goto(base, { waitUntil: "load" });
    await host.evaluate((g) => { localStorage.setItem("s10-name", JSON.stringify("Anna")); localStorage.setItem("s10-game", JSON.stringify(g)); }, game);
    await host.reload({ waitUntil: "load" });
    await host.click("#create");
    let code = null;
    for (let i = 0; i < 60 && !code; i++) { await sleep(250); code = await host.evaluate(() => (/Spielstube\s+([A-Z]{5})/.exec(document.querySelector("#app").innerText) || [])[1]); }
    if (!code) return { started: false, errs: [...errs, "Stube wurde nicht eröffnet"] };

    const guest = await page(ctxGuest, "Gast");
    await guest.goto(base, { waitUntil: "load" });
    await guest.evaluate(() => localStorage.setItem("s10-name", JSON.stringify("Bert")));
    await guest.reload({ waitUntil: "load" });
    await guest.type("#code", code);
    await guest.click("#join");

    let started = false;
    for (let i = 0; i < 160 && !started; i++) { // bis 40 s: der öffentliche Server reicht den Beitritt manchmal langsam weiter
      await sleep(250);
      started = await host.evaluate(() => {
        const b = document.querySelector("#start");
        if (b && !b.disabled && document.body.innerText.includes("Bert")) { b.click(); return true; }
        return false;
      });
    }
    if (!started) return { started, errs: [...errs, "Spiel ließ sich nicht starten (Gast nicht angekommen?)"] };
    await sleep(4000);
    if (DEEP[game]) { await DEEP[game](host, guest, errs); return { started, errs }; }
    // ein paar Spielknöpfe antippen (nicht Verlassen, Lobby usw.)
    for (const p of [guest, host]) {
      await p.evaluate(() => {
        const skip = /verlassen|lobby|beenden|melden|zurück|schließen/i;
        [...document.querySelectorAll("#app button:not([disabled]), #app [data-card]")]
          .filter((b) => !skip.test(b.textContent) && !b.closest("header")).slice(0, 3)
          .forEach((b) => { try { b.click(); } catch {} });
      });
      await sleep(1200);
    }
    const inGame = await host.evaluate(() => !!document.querySelector("header.topbar"));
    if (!inGame) errs.push("Nach dem Start ist keine Spielansicht zu sehen");
    return { started, errs };
  } catch (e) {
    return { started: false, errs: [...errs, "Abbruch: " + e.message] };
  } finally {
    await ctxHost.close().catch(() => {}); await ctxGuest.close().catch(() => {});
  }
}

(async () => {
  const unknown = GAMES.filter((g) => !ALL.includes(g));
  if (unknown.length) { console.error("Unbekannte Spiele:", unknown.join(", "), "\nMöglich:", ALL.join(" ")); process.exit(2); }
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, protocolTimeout: 30000, args: ["--mute-audio"] });
  let bad = 0;
  for (const g of GAMES) {
    const { errs } = await playGame(browser, base, g);
    if (errs.length) bad++;
    console.log(`${errs.length ? "✗" : "✓"} ${g}`);
    errs.slice(0, 5).forEach((e) => console.log("    " + e.split("\n")[0].slice(0, 200)));
  }
  await browser.close(); server.close();
  console.log(bad ? `\n${bad} von ${GAMES.length} Spielen mit Fehlern.` : `\nAlle ${GAMES.length} Spiele ohne Fehler.`);
  process.exit(bad ? 1 : 0);
})();
