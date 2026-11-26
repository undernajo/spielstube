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
const ALL = ["zehn", "wand", "hl", "schaetzen", "hinweis", "umriss", "geo", "land", "oben", "duell", "frage", "wer", "tick", "kurios", "auktion",
  "siebzehn", "bus", "stich", "watten", "schnapsen", "slf", "alm", "jagd", "seil", "querbeet"];
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
  // Kaum zu glauben: wer dran ist, wählt ein Feld und eine Aussage → Auflösung mit Erklärung bei beiden, dann weiter
  async kurios(host, guest, errs) {
    const until = async (p, sel, ms = 8000) => { for (let i = 0; i < ms / 250; i++) { if (await p.evaluate((x) => !!document.querySelector(x), sel)) return true; await sleep(250); } return false; };
    if (!(await until(host, ".ku-board"))) return errs.push("Kaum zu glauben: keine Tafel zu sehen");
    const me = (await host.evaluate(() => !!document.querySelector("[data-kupick]"))) ? host : guest, other = me === host ? guest : host;
    if (!(await until(me, "[data-kupick]"))) return errs.push("Kaum zu glauben: niemand kann ein Feld wählen");
    await me.evaluate(() => document.querySelector("[data-kupick]").click());
    if (!(await until(me, "[data-kuans]"))) return errs.push("Kaum zu glauben: keine Aussagen zum Antippen");
    if (!(await until(other, ".ku-opt"))) errs.push("Kaum zu glauben: der andere sieht die Aussagen nicht");
    await me.evaluate(() => document.querySelector("[data-kuans]").click());
    for (const [p, w] of [[me, "Wählenden"], [other, "Zuschauenden"]]) if (!(await until(p, ".ku-expl"))) errs.push(`Kaum zu glauben: keine Erklärung beim ${w}`);
    await me.evaluate(() => document.querySelector("#ku-next").click());
    if (!(await until(other, "[data-kupick]"))) errs.push("Kaum zu glauben: danach ist nicht der andere dran");
  },
  // Unterm Hammer (Standard: Preise erst beim Kassensturz): Gast bietet, Gastgeber überbietet mit eigenem Betrag, Gast steigt aus
  // → Zuschlag ohne Preis bei beiden; die übrigen Produkte steigen beide aus → Kassensturz: eins aufdecken, alle aufdecken, Ergebnis
  async auktion(host, guest, errs) {
    const until = async (p, sel, ms = 8000) => { for (let i = 0; i < ms / 250; i++) { if (await p.evaluate((x) => !!document.querySelector(x), sel)) return true; await sleep(250); } return false; };
    const click = (p, sel) => p.evaluate((x) => { const el = document.querySelector(x); if (el) el.click(); return !!el; }, sel);
    if (!(await until(guest, "[data-aubid]"))) return errs.push("Unterm Hammer: keine Gebotsknöpfe beim Gast");
    await click(guest, "[data-aubid]");
    if (!(await until(guest, ".au-lead"))) return errs.push("Unterm Hammer: Gast führt nach seinem Gebot nicht");
    if (!(await until(host, ".au-form"))) return errs.push("Unterm Hammer: Gastgeber kann nicht mitbieten");
    const amt = await host.evaluate(() => Number(document.querySelector("#au-amt").min) + 3);
    await host.type("#au-amt", String(amt));
    await host.evaluate(() => document.querySelector(".au-form").requestSubmit());
    if (!(await until(host, ".au-lead"))) return errs.push("Unterm Hammer: eigenes Gebot des Gastgebers kommt nicht an");
    if (!(await until(guest, "#au-pass"))) return errs.push("Unterm Hammer: Gast kann nicht aussteigen");
    await click(guest, "#au-pass");
    for (const [p, w] of [[host, "Gastgeber"], [guest, "Gast"]]) if (!(await until(p, ".au-hidden"))) errs.push(`Unterm Hammer: kein Zuschlag beim ${w}`);
    if (!(await host.evaluate((a) => document.querySelector(".au-high b").textContent.includes(String(a)), amt))) errs.push("Unterm Hammer: Zuschlag nicht zum Gebot des Gastgebers");
    if (await guest.evaluate(() => /Echter Preis/i.test(document.querySelector(".au-card").innerText))) errs.push("Unterm Hammer: echter Preis schon vor dem Kassensturz zu sehen");
    // restliche Produkte: beide steigen aus, dann weiter – bis zum Kassensturz
    for (let k = 0; k < 12 && !(await host.evaluate(() => !!document.querySelector("#au-reveal"))); k++) {
      await click(guest, "#au-next"); await sleep(700);
      for (const p of [host, guest]) { await until(p, "#au-pass, #au-reveal", 4000); await click(p, "#au-pass"); await sleep(500); }
      await until(host, "#au-next, #au-reveal", 4000);
    }
    if (!(await until(guest, "#au-reveal"))) return errs.push("Unterm Hammer: kein Kassensturz am Ende");
    await click(guest, "#au-reveal");
    for (const [p, w] of [[host, "Gastgeber"], [guest, "Gast"]]) if (!(await until(p, ".au-res:not(.au-hidden)"))) errs.push(`Unterm Hammer: beim Kassensturz kein Preis beim ${w}`);
    await click(host, "#au-revall"); await sleep(1000);
    if (!(await until(host, "#au-reveal"))) return errs.push("Unterm Hammer: nach „Alle aufdecken“ kein Weiter");
    await click(host, "#au-reveal");
    for (const [p, w] of [[host, "Gastgeber"], [guest, "Gast"]]) if (!(await until(p, ".podium"))) errs.push(`Unterm Hammer: kein Ergebnis beim ${w}`);
  },
  // Wie tickst du? (laut, Standard): Hinweisgeber sieht seine Zahl und schreibt freiwillig einen Hinweis, der andere tippt → Auflösung bei beiden
  async tick(host, guest, errs) {
    const until = async (p, sel, ms = 8000) => { for (let i = 0; i < ms / 250; i++) { if (await p.evaluate((x) => !!document.querySelector(x), sel)) return true; await sleep(250); } return false; };
    if (!(await until(host, ".tk-secret, [data-tkv]"))) return errs.push("Wie tickst du?: keine Skala zu sehen");
    const giver = (await host.evaluate(() => !!document.querySelector(".tk-secret"))) ? host : guest, other = giver === host ? guest : host;
    if (!(await until(giver, ".tk-cell.target"))) errs.push("Wie tickst du?: Hinweisgeber sieht seine Zahl nicht");
    if (await other.evaluate(() => !!document.querySelector(".tk-cell.target"))) errs.push("Wie tickst du?: der Ratende sieht die geheime Zahl");
    await giver.type("#tk-h", "Ein Testhinweis");
    await giver.evaluate(() => document.querySelector(".tk-hform").requestSubmit());
    if (!(await until(other, ".tk-bubble"))) errs.push("Wie tickst du?: aufgeschriebener Hinweis kommt nicht an");
    if (!(await until(other, '[data-tkv="5"]'))) return errs.push("Wie tickst du?: Felder zum Tippen fehlen");
    await other.evaluate(() => document.querySelector('[data-tkv="5"]').click());
    await sleep(300);
    await other.evaluate(() => document.querySelector("#tk-lock").click());
    for (const [p, w] of [[giver, "Hinweisgeber"], [other, "Ratender"]]) if (!(await until(p, "#tk-next"))) errs.push(`Wie tickst du?: keine Auflösung beim ${w}`);
  },
  // Wer bin ich? (laut fragen, Standard): wer dran ist, merkt sich ein Stichwort; der andere sieht den Steckbrief und antwortet
  // gleich „Nein“ → der andere ist dran und rät laut → der Erste entscheidet „Falsch“ → der Erste ist wieder dran
  async wer(host, guest, errs) {
    const until = async (p, sel, ms = 8000) => { for (let i = 0; i < ms / 250; i++) { if (await p.evaluate((x) => !!document.querySelector(x), sel)) return true; await sleep(250); } return false; };
    if (!(await until(host, "#wer-loudguess, [data-wera]"))) return errs.push("Wer bin ich?: weder Fragen noch Antworten möglich");
    const asker = (await host.evaluate(() => !!document.querySelector("#wer-loudguess"))) ? host : guest, other = asker === host ? guest : host;
    if (!(await until(other, ".wer-stb:not(.empty)"))) errs.push("Wer bin ich?: der andere sieht keinen Steckbrief");
    // zwei Notizen hintereinander – beide müssen auf dem Notizzettel stehen bleiben
    for (const t of ["Mann?", "lebt noch?"]) { await asker.type("#wer-n", t); await asker.evaluate(() => document.querySelector(".wer-nform").requestSubmit()); await sleep(1500);
      if (await asker.evaluate(() => document.querySelector("#wer-n").value)) errs.push("Wer bin ich?: Notizfeld bleibt nach dem Notieren gefüllt"); }
    if (!(await until(other, '[data-wera="nein"]'))) return errs.push("Wer bin ich?: Antwortknöpfe erscheinen nicht");
    await sleep(800);
    await other.evaluate(() => document.querySelector('[data-wera="nein"]').click());
    if (!(await until(other, "#wer-loudguess"))) return errs.push("Wer bin ich?: nach „Nein“ ist nicht der andere dran");
    for (const p of [asker, other]) if (!(await p.evaluate(() => document.body.innerText.includes("Mann?") && document.body.innerText.includes("lebt noch?")))) errs.push("Wer bin ich?: nicht beide Notizen auf dem Notizzettel");
    await other.evaluate(() => document.querySelector("#wer-loudguess").click());
    if (!(await until(asker, "[data-werjudge]"))) return errs.push("Wer bin ich?: Knöpfe „Richtig / Falsch“ erscheinen nicht");
    await asker.evaluate(() => document.querySelector('[data-werjudge="0"]').click());
    if (!(await until(asker, "#wer-loudguess"))) errs.push("Wer bin ich?: nach falschem Tipp ist nicht wieder der Erste dran");
  },
  // Antwort sucht Frage: Frage stellen, nicht wortgleich antworten, Einspruch, Fragesteller entscheidet „Zählt“ → Auflösung muss erscheinen
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
    // nicht erkannt: der Antwortende sieht die Lösung und legt Einspruch ein, dann entscheidet der Fragesteller
    if (!(await until(guesser, "[data-chk=appeal]"))) return errs.push("Antwort sucht Frage: „Weiter / Einspruch“ erscheint nicht beim Antwortenden");
    await guesser.evaluate(() => document.querySelector("[data-chk=appeal]").click());
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
    // Erklärkarte bei beiden wegklicken (vorher nimmt der Gastgeber keine Spielzüge an)
    for (const p of [host, guest]) await p.evaluate(() => { const b = document.querySelector("#wincard.show [data-wzgo]"); if (b) b.click(); });
    await sleep(1500);
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
