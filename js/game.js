(() => {
  const CARDS = window.SCHLAU10_CARDS;
  const L = window.S10Logic;
  const NS = "schlaue10/v2/";
  const app = document.getElementById("app");
  const modalEl = document.getElementById("modal");
  const toastEl = document.getElementById("toast");

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  // Kennung pro Tab (bleibt beim Neuladen erhalten, ist aber in jedem Tab anders)
  const setTabId = (id) => { try { sessionStorage.setItem("s10-id", id); } catch {} };
  let myId = null;
  try { myId = sessionStorage.getItem("s10-id"); } catch {}
  if (!myId) { myId = "p" + Math.random().toString(36).slice(2, 10); setTabId(myId); }
  let myName = store.get("s10-name") || "";
  let isHost = false, roomCode = null, mq = null, brokerIdx = 0, findTimer = null, lastRejoin = 0;
  let S = null;        // vollständiger Zustand (nur Gastgeber)
  let view = null;     // öffentlicher Zustand (alle)
  let selected = null; // gewähltes Feld
  let status = "";
  let errorMsg = "";
  let lastToastId = null;
  // zuletzt gewählte Fragen-Sets merken (alte Einzelauswahl wird übernommen)
  let chosenSets = store.get("s10-sets");
  if (!Array.isArray(chosenSets)) { const old = store.get("s10-set"); chosenSets = old ? L.normSets(old) : null; }
  let chosenTarget = store.get("s10-target");
  const SLF = window.S10Slf;
  // Spielsymbole stehen in js/symbole.js
  const {
    busIcon, duellIcon, frageIcon, geoIcon, hinweisIcon, hlIcon, landIcon, obenIcon, qbIcon,
    schaetzenIcon, schnapsenIcon, siebzehnIcon, slfIcon, stichIcon, umrissIcon, wattenIcon, wlIcon,
    zehnIcon, almIcon, jagdIcon, wandIcon
  } = window.S10Icons;
  // Gemeinsamer Kontext für die Ansichten in js/ansicht/ (wird unten befüllt)
  const G = {};
  const GAMES = [
    { key: "querbeet", color: "#ff8a5c", name: "Stubenmeisterschaft", short: "Meisterschaft", desc: "Quer durch die Spiele – Etappe für Etappe", icon: qbIcon() },
    { key: "zehn", color: "#8b7cff", name: "Zehnkampf", desc: "Quiz mit zehn Antworten", icon: zehnIcon() },
    { key: "wand", min2: true, color: "#f5a524", name: "Fragewand", desc: "Feld wählen, Punkte holen", icon: wandIcon() },
    { key: "hinweis", color: "#7fd1ff", name: "Hinweis für Hinweis", desc: "Früh raten lohnt sich", icon: hinweisIcon() },
    { key: "duell", two: true, color: "#3ccf8e", name: "Listen-Duell", desc: "Nennen, bis einer patzt", icon: duellIcon() },
    { key: "frage", two: true, color: "#c084fc", name: "Antwort sucht Frage", desc: "Erfinde die Frage", icon: frageIcon() },
    { key: "hl", color: "#ffa64d", name: "Höher oder tiefer", desc: "Welcher Wert ist größer?", icon: hlIcon() },
    { key: "schaetzen", color: "#ffb347", name: "Schätzen", desc: "Wer liegt am nächsten?", icon: schaetzenIcon() },
    { key: "siebzehn", color: "#2fbf71", name: "Siebzehn und Vier", desc: "So nah wie möglich an 21", icon: siebzehnIcon() },
    { key: "bus", color: "#ffc83d", name: "Busfahrt", desc: "Weiter oder aussteigen?", icon: busIcon() },
    // Erdkunde
    { key: "geo", color: "#4aa8ff", name: "Wo liegt das?", desc: "Orte auf der Karte finden", icon: geoIcon() },
    { key: "land", color: "#ffd24d", name: "Länder finden", desc: "Länder auf der Karte", icon: landIcon() },
    { key: "umriss", color: "#ffd24d", name: "Umriss-Rätsel", desc: "Gebiet am Umriss erkennen", icon: umrissIcon() },
    { key: "oben", color: "#2fd4c8", name: "Von oben", desc: "Satellitenbild erkennen", icon: obenIcon() },
    // Spielarten der Sammelkachel „Klassiker zu zweit“ – in der Lobby über die Kachel, die Spielart in den Einstellungen
    { key: "stich", min2: true, color: "#6f8cff", name: "Stichhaltig", desc: "Stiche genau ansagen", icon: stichIcon() },
    { key: "klassik", two: true, color: "#e05a5a", name: "Klassiker zu zweit", desc: "Watten · Schnapsen", icon: wattenIcon(), modes: ["watten", "schnapsen"] },
    { key: "watten", group: "klassik", two: true, color: "#e05a5a", name: "Watten", desc: "Der Südtiroler Klassiker", icon: wattenIcon() },
    { key: "schnapsen", group: "klassik", two: true, color: "#c9883a", name: "Schnapsen", desc: "66 – Bummerl für Bummerl", icon: schnapsenIcon() },
    { key: "slf", color: "#3ccf8e", name: "Stadt, Land, Fluss", desc: "Buchstabe & Kategorien", icon: slfIcon() },
    { key: "wl", hidden: true, min2: true, color: "#ff6fae", name: "Gleiche Wellenlänge", desc: "Aufs selbe Wort kommen", icon: wlIcon() },
    { key: "alm", color: "#7cc95a", name: "Almsommer", desc: "Würfeln & ankreuzen", icon: almIcon() },
    { key: "jagd", min2: true, color: "#c98a3c", name: "Auf der Jagd", desc: "Wild verstecken & jagen", icon: jagdIcon() },
  ];
  const GEO = window.S10Geo, GEODATA = window.SCHLAU10_GEO || {}, LF = window.L; // LF = Leaflet (Kartenbibliothek)
  let geoOpts = Object.assign({ region: "suedtirol", level: "gemischt", rounds: 10, timer: "t30" }, store.get("s10-geo") || {});
  const QZ = window.S10Quiz;
  const KG = window.S10Karten;
  let kgOpts = Object.assign({ rounds: 5, busRounds: 3, stichRounds: 6 }, store.get("s10-kg") || {});
  let quizOpts = Object.assign({ rounds: 5, theme: "mix", region: "europa", level: "gemischt" }, store.get("s10-quiz") || {});
  const QB = window.S10Querbeet;
  let qbOpts = Object.assign({ length: 8, off: [], joker: true }, store.get("s10-qb") || {});
  const LAND = window.S10Land;
  // Länderkarte (gut 400 KB) erst laden, wenn „Länder finden“ gebraucht wird – gleiche Versionsnummer wie game.js
  const ASSET_V = ((document.currentScript && /[?&]v=([\w.]+)/.exec(document.currentScript.src)) || [])[1] || "1";
  let landLoading = null;
  function needLandData() {
    if (window.SCHLAU10_LAND) return true;
    if (!landLoading) {
      landLoading = document.createElement("script");
      landLoading.src = "data/laender-data.js?v=" + ASSET_V;
      landLoading.onload = () => { if (isHost && S) publish(); else render(); };
      landLoading.onerror = () => { landLoading.remove(); landLoading = null; toast("Die Länderkarte konnte nicht geladen werden – bitte neu laden.", "bad"); };
      document.head.appendChild(landLoading);
    }
    return false;
  }
  let landOpts = Object.assign({ region: "europa", level: "gemischt", rounds: 10, timer: "t30" }, store.get("s10-land") || {});
  const WL = window.S10Wl;
  const HL = window.S10Hl, HLDATA = window.SCHLAU10_HL || {};
  let hlOpts = Object.assign({ length: "mittel", theme: "mix", level: "gemischt" }, store.get("s10-hl") || {});
  // Höher oder tiefer: Kategorien mit Südtirol-Bezug (für „Ohne Südtirol“; „Nur Südtirol“ wären zu wenige Kategorien)
  const HL_ST = ["suedtirolBerge", "gemeinden"];
  const HL_THEMES = { mix: "Gemischt", allgemein: "Ohne Südtirol" };
  const hlCatCount = (theme) => Object.keys(HLDATA).filter((k) => theme !== "allgemein" || !HL_ST.includes(k)).length;
  const DU = window.S10Duell, DUDATA = window.SCHLAU10_DUELL || [];
  let duOpts = Object.assign({ target: 5, timer: "30" }, store.get("s10-du") || {});
  const WAND = window.S10Wand, WANDDATA = window.SCHLAU10_WAND || [];
  let fwOpts = Object.assign({ cats: [] }, store.get("s10-fw") || {}); // in der Lobby gewählte Kategorien (Rest wird ausgelost)
  const fwAllKeys = () => WANDDATA.flatMap((c) => WAND.PTS.flatMap((pt, r) => c.q[pt].map((_, i) => WAND.keyOf(c.key, r, i))));
  const FQ = window.S10Frage, FQDATA = window.SCHLAU10_FRAGE || [];
  let fqOpts = Object.assign({ target: 5, write: "0", answer: "0", choices: "3" }, store.get("s10-fq") || {});
  const fqAllKeys = () => FQDATA.flatMap((c, ci) => c.answers.map((_, ai) => FQ.keyOf(ci, ai)));
  const WAT = window.S10Watten, WCARDS = window.S10WattenCards;
  let wattenOpts = Object.assign({ target: 15, weli: "schell" }, store.get("s10-watten") || {});
  const SCH = window.S10Schnapsen;
  let schOpts = Object.assign({ mode: "gemuetlich" }, store.get("s10-schnapsen") || {});
  let wattenPriv = null; // eigene Hand (bei Gästen privat vom Gastgeber geschickt)
  let wlOpts = Object.assign({ pack: "mix", rounds: 5 }, store.get("s10-wl") || {});
  const ALM = window.S10Alm;
  let almOpts = Object.assign({ length: "normal", map: "zufall" }, store.get("s10-alm") || {});
  const almMapOk = (m) => m === "zufall" || ALM.MAP_LIST.some((x) => x.id === m);
  const JG = window.S10Jagd;
  let jagdOpts = Object.assign({ length: "normal", map: "zufall" }, store.get("s10-jagd") || {});
  const jagdMapOk = (m) => m === "zufall" || JG.MAP_LIST.some((x) => x.id === m);
  // Kacheln in Lobby und Startseite, nach Abschnitten geordnet (Querbeet oben ohne Überschrift)
  const SECTIONS = [["", ["querbeet"]], ["Quiz & Wissen", ["zehn", "wand", "hinweis", "hl", "schaetzen", "duell", "slf", "frage"]], ["Erdkunde", ["geo", "land", "umriss", "oben"]], ["Karten, Würfel & Taktik", ["siebzehn", "bus", "stich", "klassik", "alm", "jagd"]]];
  // Gleiche Wellenlänge ist ausgeblendet (hidden) – Code bleibt, Zurückholen: hidden entfernen und hier wieder einen Abschnitt eintragen
  {
    const listed = new Set(SECTIONS.flatMap(([, ks]) => ks));
    const rest = GAMES.filter((g) => !g.group && !g.hidden && !listed.has(g.key)).map((g) => g.key); // neue Spiele ohne Abschnitt landen im letzten
    if (rest.length) SECTIONS[SECTIONS.length - 1][1].push(...rest);
  }
  const gameByKey = (k) => GAMES.find((g) => g.key === k);
  const TILES = SECTIONS.flatMap(([, ks]) => ks.map(gameByKey)).filter(Boolean);
  function tileSectionsHtml(tile) {
    return SECTIONS.map(([name, ks]) => `${name ? `<div class="gsec">${esc(name)}</div>` : ""}<div class="gamegrid ${name ? "" : "gamegrid-top"}">${ks.map(gameByKey).filter(Boolean).map(tile).join("")}</div>`).join("");
  }
  const groupOf = (key) => { const g = GAMES.find((x) => x.key === key); return g ? g.group || g.key : key; };
  const isMode = (key) => GAMES.some((g) => g.key === key && g.group);
  let chosenGame = GAMES.some((g) => g.key === store.get("s10-game") && !g.modes && !g.hidden) ? store.get("s10-game") : "zehn";
  let slfOpts = Object.assign({ preset: "klassisch", custom: "", rounds: 5, timer: "stopp", surprise: true, letters: "alle" }, store.get("s10-slf") || {}); // Auswahl in der Lobby merken (Lobby wird bei jedem Update neu gezeichnet)
  const params = new URLSearchParams(location.search);
  const urlRoom = (params.get("room") || "").toUpperCase();
  const urlBroker = params.has("b") ? Number(params.get("b")) : null;

  // Logo: „Spielstube“ mit gelber Würfel-Münze
  // Logo: ein kleines Haus (die Stube), dessen Vorderseite ein Würfel mit fünf Augen ist
  const MARK = `<svg class="mark-svg" viewBox="0 -5 32 37" aria-hidden="true"><path d="M20.5 5.5 V0.5 h5.5 V9.8Z" fill="#c48f0a" stroke="#8a5f00" stroke-width=".9" stroke-linejoin="round"/><rect x="19.8" y="-0.3" width="6.9" height="1.8" rx=".6" fill="#a87400" stroke="#8a5f00" stroke-width=".6"/><circle cx="24.5" cy="-2.3" r="1.5" fill="#e6e2f5" opacity=".85"/><circle cx="26.6" cy="-3.6" r="1.1" fill="#e6e2f5" opacity=".6"/><path d="M16 2.6 30 13.4v13.4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V13.4Z" fill="#c48f0a"/><path d="M16 1.6 30 12.4v13.4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V12.4Z" fill="#ffc83d" stroke="#8a5f00" stroke-width="1" stroke-linejoin="round"/><path d="M16 1.6 30 12.4v1.6L16 3.2 2 14v-1.6Z" fill="#fff" opacity=".35"/><g fill="#2a1d00"><circle cx="9.5" cy="16" r="2"/><circle cx="22.5" cy="16" r="2"/><circle cx="16" cy="20.3" r="2"/><circle cx="9.5" cy="24.6" r="2"/><circle cx="22.5" cy="24.6" r="2"/></g></svg>`;
  const LOGO = `<span class="mark">${MARK}</span><span class="brand-name">Spielstube</span>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cleanName = (n) => String(n || "").trim().slice(0, 20) || "Spieler";
  const genCode = () => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");
  // Server-Index nur anhängen, wenn der Ersatzserver genutzt wird (Standard 0 = Hauptserver)
  const shareLink = () => location.origin + location.pathname + "?room=" + roomCode + (brokerIdx ? "&b=" + brokerIdx : "");

  // ---------- Verbindung über einen öffentlichen MQTT-Vermittlungsserver ----------
  // Alle Nachrichten laufen über den Server, daher klappt es hinter jedem Router.
  // Inhalte sind mit einem Schlüssel aus dem Raum-Code verschlüsselt (AES-GCM),
  // und auch der Kanalname verrät den Code nicht.
  const BROKERS = ["wss://broker.hivemq.com:8884/mqtt", "wss://broker.emqx.io:8084/mqtt"];
  let roomTopic = null, cryptoKey = null, cryptoCode = null;
  const T = (k) => NS + roomTopic + "/" + k;
  const enc = new TextEncoder(), dec = new TextDecoder();
  const hasCrypto = !!(window.crypto && crypto.subtle);

  async function ensureCrypto(code) {
    if (cryptoCode === code) return;
    const h = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode("schlaue10-raum:" + code)));
    roomTopic = [...h.slice(0, 12)].map((b) => b.toString(16).padStart(2, "0")).join("");
    const base = await crypto.subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveKey"]);
    cryptoKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("schlaue10-v2"), iterations: 150000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    cryptoCode = code;
  }
  const toB64 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); };
  const fromB64 = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  async function seal(obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, enc.encode(JSON.stringify(obj))));
    const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
    return toB64(out);
  }
  async function unseal(buf) {
    try {
      const raw = fromB64(buf.toString());
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12) }, cryptoKey, raw.slice(12));
      return JSON.parse(dec.decode(pt));
    } catch { return undefined; } // falscher Schlüssel oder fremde Nachricht -> ignorieren
  }
  // Verschlüsselte Nachrichten der Reihe nach senden (Reihenfolge bleibt erhalten)
  let outChain = Promise.resolve();
  function sendSealed(topic, obj, opts) {
    const c = mq;
    outChain = outChain.then(async () => { const p = await seal(obj); if (c) c.publish(topic, p, opts); }).catch(() => {});
    return outChain;
  }

  function connectBroker(idx, will) {
    brokerIdx = ((idx % BROKERS.length) + BROKERS.length) % BROKERS.length;
    return mqtt.connect(BROKERS[brokerIdx], {
      clientId: "s10_" + myId + "_" + Math.random().toString(36).slice(2, 6),
      clean: true, keepalive: 20, reconnectPeriod: 2000, connectTimeout: 8000, will,
    });
  }

  // ---------- Gastgeber ----------
  const lastSeen = new Map();
  let seq = 0;

  function hostCreate(name) {
    if (!hasCrypto) { toast(errorMsg, "bad"); return; }
    if (isHost) return;
    isHost = true; roomCode = genCode();
    S = L.newGame(CARDS.length);
    S.seen = store.get("s10-seen") || [];
    S.geoSeen = store.get("s10-geo-seen") || {};
    S.quizSeen = store.get("s10-quiz-seen") || {};
    S.landSeen = store.get("s10-land-seen") || {};
    S.hostId = myId;
    S.game = chosenGame;
    L.addPlayer(S, myId, name);
    hostOpen(0);
  }

  function hostResume(saved) {
    if (isHost) return; // schon am Öffnen (doppelt getippt)
    isHost = true; roomCode = saved.code; S = saved.state;
    if (!S.geoSeen) S.geoSeen = store.get("s10-geo-seen") || {};
    if (!S.quizSeen) S.quizSeen = store.get("s10-quiz-seen") || {};
    if (!S.landSeen) S.landSeen = store.get("s10-land-seen") || {};
    if (saved.hostId) { myId = saved.hostId; setTabId(myId); }
    S.hostId = myId;
    S.players.forEach((p) => { if (p.id !== myId) p.connected = false; });
    hostOpen(saved.broker || 0);
  }

  async function hostOpen(idx, tries = 0) {
    status = "Spielstube wird geöffnet …";
    // Sofort den vollständigen Spielstand zeigen (auch mitten im Spiel), nicht erst nach dem Verbinden.
    // mq ist hier noch nicht (oder nicht mehr) verbunden, publish() zeichnet also nur und sendet nichts.
    mq = null; publish();
    await ensureCrypto(roomCode);
    const willPayload = await seal("offline");
    const c = mq = connectBroker(idx, { topic: T("host"), payload: willPayload, qos: 1, retain: true });
    let opened = false;
    const fail = setTimeout(() => {
      if (opened || mq !== c) return;
      c.end(true);
      if (tries + 1 < BROKERS.length) hostOpen(idx + 1, tries + 1);
      else { status = "Kein Vermittlungsserver erreichbar. Internetverbindung prüfen und Seite neu laden."; render(); }
    }, 9000);
    c.on("connect", () => {
      opened = true; clearTimeout(fail); status = "";
      c.subscribe([T("up"), T("rtc/" + myId)], { qos: 1 });
      sendSealed(T("host"), "online", { qos: 1, retain: true });
      publish();
    });
    c.on("reconnect", () => { if (opened) { status = "Verbindung unterbrochen – verbinde neu …"; render(); } });
    c.on("message", async (topic, buf) => {
      const m = await unseal(buf);
      if (!m || typeof m !== "object") return;
      if (topic === T("rtc/" + myId)) { onRtc(m); return; }
      const cid = String(m.clientId || "").slice(0, 40);
      if (!cid || cid === myId) return;
      lastSeen.set(cid, Date.now());
      const p = S.players.find((x) => x.id === cid);
      if (m.type === "join") {
        if ((S.kicked || []).includes(cid)) return; // entfernt: kein erneutes Beitreten
        const nm = cleanName(m.name);
        // Gleicher Name, alter Eintrag getrennt (z. B. neuer Tab): in der Lobby den alten Eintrag entfernen
        if (S.phase === "lobby") S.players = S.players.filter((x) => x.id === cid || x.connected || x.name.toLowerCase() !== nm.toLowerCase());
        L.addPlayer(S, cid, nm); publish();
      }
      else if (m.type === "report" && m.report && typeof m.report === "object") { addReport(m.report); toast(`${cleanName(m.report.by)} hat eine Karte gemeldet.`, "info"); }
      else if (m.type === "leave") { if (p) { L.setConnected(S, cid, false); publish(); } }
      else if (m.type === "action" || m.type === "ping") {
        let changed = false;
        if (p && !p.connected) { p.connected = true; changed = true; }
        if (m.type === "action" && applyAny(cid, m.action)) changed = true;
        if (changed) publish();
      }
    });
  }

  // Zeitsteuerung für Stadt, Land, Fluss (nur beim Gastgeber)
  setInterval(() => {
    if (!isHost || !S) return;
    if ((S.phase === "slf" && SLF.tick(S, Date.now())) || (S.phase === "wl" && WL.tick(S)) || (S.phase === "geo" && GEO.tick(S, Date.now())) || (S.phase === "hl" && HL.tick(S, Date.now())) || (S.phase === "duell" && DU.tick(S, Date.now())) || (S.phase === "frage" && FQ.tick(S, Date.now())) || (S.phase === "land" && LAND.tick(S, Date.now())) || (S.phase === "quiz" && QZ.tick(S, Date.now())) || (S.phase === "karten" && KG.tick(S, Date.now())) || (S.phase === "alm" && ALM.tick(S)) || (S.phase === "jagd" && JG.tick(S))) publish();
  }, 400);

  // Mitspieler ohne Lebenszeichen als getrennt markieren
  setInterval(() => {
    if (!isHost || !S) return;
    const gone = S.players.filter((p) => p.id !== myId && p.connected && Date.now() - (lastSeen.get(p.id) || 0) > 35000).map((p) => p.id);
    gone.forEach((id) => L.setConnected(S, id, false));
    if (gone.length) publish();
  }, 5000);

  function act(pid, action) {
    if (applyAny(pid, action)) publish();
  }
  // Verteilt eine Aktion an das richtige Spiel; true = Zustand geändert
  function applyAny(pid, action) {
    if (!action || typeof action !== "object") return false;
    const host = pid === myId, now = Date.now(), type = String(action.type || "");
    if (type === "setGame") {
      if (!host || S.phase !== "lobby" || !GAMES.some((g) => g.key === action.game && !g.modes)) return false;
      S.game = action.game; return true;
    }
    if (type === "wish") { // Gast wünscht sich ein Spiel (nochmal tippen = zurücknehmen)
      if (S.phase !== "lobby" || (action.game && !GAMES.some((g) => g.key === action.game))) return false;
      S.wishes = S.wishes || {};
      if (!action.game || S.wishes[pid] === action.game) delete S.wishes[pid];
      else {
        S.wishes[pid] = action.game;
        const p = S.players.find((x) => x.id === pid), g = GAMES.find((x) => x.key === action.game);
        if (!host && p && g) toast(`${p.name} wünscht sich ${g.name}${/[?!]$/.test(g.name) ? "" : "."}`, "info");
      }
      return true;
    }
    if (type === "kick") { // Gastgeber entfernt jemanden aus der Stube (nur in der Lobby)
      if (!host || S.phase !== "lobby" || action.id === myId || !S.players.some((p) => p.id === action.id)) return false;
      S.kicked = (S.kicked || []).concat(String(action.id)).slice(-30);
      S.players = S.players.filter((p) => p.id !== action.id);
      if (S.wishes) delete S.wishes[action.id];
      return true;
    }
    if (type === "pause") { // in der Lobby pausieren: bleibt in der Stube, spielt aber nicht mit (jeder für sich, der Gastgeber für alle)
      const p = S.players.find((x) => x.id === action.id);
      if (S.phase !== "lobby" || !p || (!host && action.id !== pid)) return false;
      p.paused = !!action.on; return true;
    }
    // Pausierte schauen nur zu: ihre Spielzüge werden verworfen; Steuerung (Weiter, Neustart, Lobby …) bleibt erlaubt,
    // damit auch ein pausierter Gastgeber das Spiel lenken kann
    const me = S.players.find((x) => x.id === pid);
    if (me && me.paused && S.phase !== "lobby" && !/^(lobby|start|restart|next|skip|ping|qb\w*)$|(Next|Restart|Force)$/.test(type)) return false;
    if (type === "start" && host && S.phase === "lobby") S.wishes = {}; // Wünsche gelten bis zum Spielstart
    if (type === "start" && action.game === "querbeet") {
      if (!host || S.phase !== "lobby") return false;
      const q = QB.create(action.opts, S.players.filter((p) => p.connected && !p.paused).length);
      if (!q) return false;
      S.qb = q; S.game = "querbeet"; S.phase = "querbeet";
      S.players.forEach((p) => { p.waiting = false; p.status = "active"; });
      return true;
    }
    if (type.startsWith("qb")) return qbAction(pid, action, host, now);
    // In Querbeet kein „Nochmal spielen“ / „Nächste Runde“ innerhalb einer Etappe – weiter geht es über die Querbeet-Leiste
    if (S.qb && S.phase !== "querbeet" && (/Restart$/.test(type) || type === "restart" || type === "next")) return false;
    if (type === "start" && action.game === "slf") {
      if (!host || S.phase !== "lobby") return false;
      SLF.start(S, action.opts, now); return true;
    }
    if (type === "start" && action.game === "jagd") {
      if (!host || S.phase !== "lobby") return false;
      return JG.start(S, action.opts);
    }
    if (type === "start" && action.game === "alm") {
      if (!host || S.phase !== "lobby") return false;
      return ALM.start(S, action.opts);
    }
    if (type === "start" && action.game === "wl") {
      if (!host || S.phase !== "lobby") return false;
      WL.start(S, action.opts); return true;
    }
    if (type === "start" && action.game === "geo") {
      if (!host || S.phase !== "lobby") return false;
      GEO.start(S, action.opts, now); return true;
    }
    if (type === "start" && action.game === "land") {
      if (!host || S.phase !== "lobby") return false;
      return LAND.start(S, action.opts, now);
    }
    if (type.startsWith("land")) return S.phase === "land" && LAND.apply(S, pid, action, host, now);
    if (type === "start" && action.game === "watten") {
      if (!host || S.phase !== "lobby") return false;
      return WAT.start(S, action.opts);
    }
    if (/^w[A-Z]/.test(type)) return S.phase === "watten" && WAT.apply(S, pid, action, host);
    if (type === "start" && action.game === "schnapsen") {
      if (!host || S.phase !== "lobby") return false;
      return SCH.start(S, action.opts);
    }
    if (/^x[A-Z]/.test(type)) return S.phase === "schnapsen" && SCH.apply(S, pid, action, host);
    if (type === "start" && action.game === "hl") {
      if (!host || S.phase !== "lobby") return false;
      HL.start(S, action.opts, now); return true;
    }
    if (type.startsWith("hl")) return S.phase === "hl" && HL.apply(S, pid, action, host, now);
    if (type === "start" && action.game === "duell") {
      if (!host || S.phase !== "lobby") return false;
      return DU.start(S, { ...action.opts, avoid: store.get("s10-du-seen") || [] }, now);
    }
    if (type === "start" && action.game === "wand") {
      if (!host || S.phase !== "lobby") return false;
      return WAND.start(S, { ...action.opts, avoid: store.get("s10-fw-seen") || [] }, now);
    }
    if (type === "fwRestart" && S.phase === "wand" && S.wand && S.wand.step === "final")
      return WAND.start(S, { ...S.wand.opts, avoid: store.get("s10-fw-seen") || [] }, now);
    if (type.startsWith("fw")) return S.phase === "wand" && WAND.apply(S, pid, action, host, now);
    if (type === "start" && action.game === "frage") {
      if (!host || S.phase !== "lobby") return false;
      return FQ.start(S, { ...action.opts, avoid: store.get("s10-fq-seen") || [] }, now);
    }
    if (type === "fqRestart" && S.phase === "frage" && S.frage && S.frage.step === "final")
      return FQ.start(S, { ...S.frage.opts, avoid: store.get("s10-fq-seen") || [] }, now);
    if (type.startsWith("fq")) return S.phase === "frage" && FQ.apply(S, pid, action, host, now);
    if (type === "duRestart" && S.phase === "duell" && S.duell && S.duell.step === "final")
      return DU.start(S, { ...S.duell.opts, avoid: store.get("s10-du-seen") || [] }, now);
    if (type.startsWith("du")) return S.phase === "duell" && DU.apply(S, pid, action, host, now);
    if (type === "start" && QZ.MODES[action.game]) {
      if (!host || S.phase !== "lobby") return false;
      if (action.game === "umriss" && !needLandData()) return false;
      return QZ.start(S, { ...action.opts, mode: action.game }, now);
    }
    if (type.startsWith("quiz")) return S.phase === "quiz" && QZ.apply(S, pid, action, host, now);
    if (type === "start" && KG.MODES[action.game]) {
      if (!host || S.phase !== "lobby") return false;
      return KG.start(S, { ...action.opts, mode: action.game }, now);
    }
    if (type.startsWith("kg")) return S.phase === "karten" && KG.apply(S, pid, action, host, now);
    if (type.startsWith("geo")) return S.phase === "geo" && GEO.apply(S, pid, action, host, now);
    if (type.startsWith("slf")) return S.phase === "slf" && SLF.apply(S, pid, action, host, now);
    if (type.startsWith("wl")) return S.phase === "wl" && WL.apply(S, pid, action, host);
    if (type.startsWith("alm")) return S.phase === "alm" && ALM.apply(S, pid, action, host);
    if (type.startsWith("jg")) return S.phase === "jagd" && JG.apply(S, pid, action, host);
    if (type === "start") S.game = "zehn";
    if (type === "lobby" && host) { S.slf = null; S.wl = null; S.geo = null; S.hl = null; S.duell = null; S.frage = null; S.wand = null; S.land = null; S.watten = null; S.schnapsen = null; S.qb = null; S.quiz = null; S.karten = null; S.alm = null; S.jagd = null; }
    return L.applyAction(S, CARDS, pid, action, host);
  }

  // ---------- Querbeet (nur beim Gastgeber) ----------
  const qbStage = () => S.qb && S.qb.idx >= 0 ? S.qb.plan[S.qb.idx] : null;
  // Ist die laufende Etappe zu Ende (Endstand des Spiels erreicht)?
  function qbStageDone() {
    const st = qbStage();
    if (!st || S.phase === "querbeet") return false;
    switch (st.game) {
      case "zehn": return (S.phase === "roundEnd" || S.phase === "gameOver") && !S.undoReq;
      case "hl": return !!S.hl && S.hl.step === "final";
      case "geo": case "oben": return !!S.geo && S.geo.step === "final";
      case "land": return !!S.land && S.land.step === "final";
      case "slf": return !!S.slf && S.slf.step === "final";
      case "duell": return !!S.duell && S.duell.step === "final";
      case "wand": return !!S.wand && S.wand.step === "final";
      case "frage": return !!S.frage && S.frage.step === "final" && !(S.frage.complaint && S.frage.complaint.state === "open");
      case "schaetzen": case "hinweis": case "umriss": return !!S.quiz && S.quiz.step === "final";
      case "siebzehn": case "stich": case "bus": return !!S.karten && S.karten.step === "final";
      case "alm": return !!S.alm && S.alm.step === "final";
      case "jagd": return !!S.jagd && S.jagd.step === "final";
    }
    return false;
  }
  // Punkte der Etappe im jeweiligen Spiel (werden in Platzierungen umgerechnet)
  function qbScores() {
    const st = qbStage(), all = (o) => Object.fromEntries(S.players.map((p) => [p.id, (o && o[p.id]) || 0]));
    switch (st.game) {
      case "zehn": return Object.fromEntries(S.players.map((p) => [p.id, p.score || 0]));
      case "hl": return all(S.hl.total);
      case "geo": case "oben": return all(S.geo.total);
      case "land": return all(S.land.total);
      case "slf": return all(S.slf.total);
      case "duell": return all(S.duell.score);
      case "wand": return all(S.wand.score);
      case "frage": return all(S.frage.score);
      case "schaetzen": case "hinweis": case "umriss": return all(S.quiz.total);
      case "siebzehn": case "stich": case "bus": return all(S.karten.total);
      case "alm": return all(ALM.publicState(S).totals);
      case "jagd": return all(S.jagd.pts);
    }
    return all({});
  }
  function qbStartStage(now) {
    const q = S.qb, st = q.plan[q.idx], o = st.opts;
    q.ready = {}; q.done = false;
    let ok = true;
    switch (st.game) {
      case "zehn": // über die normale Start-Aktion (verlangt die Lobby-Phase); Ziel 100 = nach einer Karte ist Schluss
        S.phase = "lobby";
        ok = L.applyAction(S, CARDS, myId, { type: "start", target: 100, set: o.sets || (currentSets().length ? currentSets() : ["standard"]) }, true);
        S.game = "zehn"; break;
      case "hl": HL.start(S, o, now); break;
      case "geo": case "oben": GEO.start(S, { ...o, free: true }, now); break;
      case "land": LAND.start(S, o, now); break;
      case "slf": SLF.start(S, { ...o, free: true }, now); break;
      case "duell": ok = DU.start(S, { ...o, free: true, avoid: store.get("s10-du-seen") || [] }, now); break;
      case "wand": ok = WAND.start(S, { ...o, avoid: store.get("s10-fw-seen") || [] }, now); break;
      case "frage": ok = FQ.start(S, { ...o, free: true, avoid: store.get("s10-fq-seen") || [] }, now); break;
      case "schaetzen": case "hinweis": case "umriss": ok = QZ.start(S, { ...o, free: true }, now); break;
      case "siebzehn": case "stich": case "bus": ok = KG.start(S, { ...o, free: true }, now); break;
      case "alm": ok = ALM.start(S, { ...o, free: true }); break;
      case "jagd": ok = JG.start(S, { ...o, free: true }); break;
    }
    if (!ok) { q.plan[q.idx] = { game: "hl", opts: QB.stageOpts("hl") }; HL.start(S, q.plan[q.idx].opts, now); } // z. B. jemand ist gegangen
    return true;
  }
  // Nach einer Etappe: Spielzustand aufräumen, es geht im Querbeet-Bildschirm weiter
  function qbCleanup() {
    S.slf = null; S.hl = null; S.geo = null; S.land = null; S.duell = null; S.frage = null; S.wand = null; S.quiz = null; S.karten = null; S.alm = null; S.jagd = null;
    S.cardIdx = null; S.pending = null; S.undo = null; S.undoReq = null; S.winners = null; S.roundResult = null;
    S.players.forEach((p) => { p.score = 0; p.roundPts = 0; p.status = "active"; p.waiting = false; });
    S.game = "querbeet"; S.phase = "querbeet";
  }
  function qbAdvance(now) {
    const q = S.qb;
    if (S.phase !== "querbeet") { QB.finishStage(q, qbScores(), S.players.filter((p) => !p.paused).map((p) => p.id)); qbCleanup(); return true; }
    if (q.step === "final") return false;
    if (q.plan[q.idx + 1] && ["land", "umriss"].includes(q.plan[q.idx + 1].game) && !needLandData()) { toast("Die Länderkarte wird noch geladen – einen Moment.", "info"); return false; }
    q.idx++; q.step = "play";
    return qbStartStage(now);
  }
  function qbAction(pid, a, host, now) {
    const q = S.qb;
    if (!q) return false;
    if (a.type === "qbReady" || a.type === "qbGo") {
      const waiting = S.phase === "querbeet" ? q.step === "intro" || q.step === "break" : qbStageDone();
      if (!waiting) return false;
      if (a.type === "qbGo") { if (!host) return false; return qbAdvance(now); }
      q.ready[pid] = !q.ready[pid];
      const ids = S.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
      if (ids.length && ids.every((id) => q.ready[id])) qbAdvance(now);
      return true;
    }
    if (a.type === "qbJoker") return S.phase === "querbeet" && QB.setJoker(q, pid, !!a.on);
    if (a.type === "qbSkip") return host && S.phase === "querbeet" && QB.skipStage(q, S.players.filter((p) => p.connected && !p.paused).length);
    if (a.type === "qbRestart") {
      if (!host || q.step !== "final") return false;
      const nq = QB.create(q.opts, S.players.filter((p) => p.connected && !p.paused).length);
      if (!nq) return false;
      S.qb = nq; return true;
    }
    return false;
  }
  // Kurzbeschreibung einer Etappe (z. B. „5 Gebiete · Schweizer Kantone“)
  function qbDetail(st) {
    if (!st) return "";
    const D = QB.STAGES[st.game], o = st.opts || {};
    // Stufe nur nennen, wenn sie von „Gemischt“ abweicht (z. B. „5 Gebiete · Europa · Profi“)
    const lvl = o.level && o.level !== "gemischt" && QB.LEVELS[o.level] ? ` · ${QB.LEVELS[o.level].name}` : "";
    if (st.game === "geo") return `${D.short} · ${(GEODATA[o.region] || {}).name || ""}${lvl}`;
    if (st.game === "land") return `${D.short} · ${LAND.REGION_NAMES[o.region] || ""}${lvl}`;
    const easyL = o.letters === "leicht" ? " · leichte Buchstaben" : "";
    if (st.game === "slf") return o.preset === "zufall" ? `${D.short} · ${o.classics ? `${o.classics} Klassiker + ${SLF.PRESETS.zufall.random - o.classics} zufällige Kategorien` : "Kategorien zufällig"}${easyL}`
      : `${D.short} · Kategorien „${(SLF.PRESETS[o.preset] || {}).name || ""}“${easyL}`;
    if (st.game === "hl" && lvl) return `${D.short}${lvl}`;
    if (st.game === "umriss") return `${D.short} · ${LAND.REGION_NAMES[o.region] || ""}${lvl}`;
    if ((st.game === "schaetzen" || st.game === "hinweis") && o.theme === "suedtirol") return `${D.short} · Südtirol`;
    return D.short;
  }
  function qbView() {
    const LAND_RULE = { de: "Tippt das genannte Bundesland auf der Karte an.", at: "Tippt das genannte Bundesland auf der Karte an.",
      it: "Tippt die genannte Region auf der Karte an.", ch: "Tippt den genannten Kanton auf der Karte an." };
    const rule = (st) => st.game === "land" ? LAND_RULE[st.opts.region] || "Tippt das genannte Land auf der Karte an." : QB.STAGES[st.game].rule;
    const q = S.qb, info = (st) => st ? { game: st.game, name: QB.STAGES[st.game].name, detail: qbDetail(st), rule: rule(st), how: QB.HOWTO[st.game] || null } : null;
    const nextSt = q.step === "intro" || q.step === "break" ? q.plan[q.idx + 1] : null;
    return {
      step: q.step, idx: q.idx, n: q.plan.length, plan: q.plan.map((p) => p.game), pts: { ...q.pts }, ready: { ...q.ready },
      done: qbStageDone(), cur: info(qbStage()), next: info(nextSt), lastDouble: q.idx + 1 === q.plan.length - 1,
      stages: q.stages.map((x) => ({ game: x.game, res: x.res })), winners: q.step === "final" ? QB.winners(q) : null,
      skipped: q.skipped && q.skipped.at === q.idx + 1 && (q.step === "intro" || q.step === "break") ? QB.STAGES[q.skipped.from].name : null,
      joker: { ...(q.joker || {}) }, jokerOn: q.opts.joker !== false, theme: q.opts.theme || "mix", titles: q.step === "final" ? QB.titles(q, S.players.map((p) => p.id)) : null,
    };
  }

  function publish() {
    // In der Lobby keine „Geister“: getrennte Spieler entfernen (z. B. nach einem Spiel oder Neustart des Gastgebers).
    // Wer noch da ist, meldet sich automatisch wieder an.
    if (S.phase === "lobby") S.players = S.players.filter((p) => p.connected || p.id === myId);
    view = L.publicState(S, CARDS, roomCode);
    view.game = S.game || "zehn";
    view.kicked = (S.kicked || []).slice();
    if (S.phase === "lobby") view.lobby = {
      wishes: Object.fromEntries(Object.entries(S.wishes || {}).filter(([id]) => S.players.some((p) => p.id === id))),
      sets: currentSets(), target: chosenTarget || 30,
      slf: { preset: slfOpts.preset, cats: SLF.categoriesFrom(slfOpts), rounds: Number(slfOpts.rounds), timer: slfOpts.timer, surprise: slfOpts.surprise !== false, letters: SLF.LETTER_SETS[slfOpts.letters] ? slfOpts.letters : "alle" },
      wl: { pack: wlOpts.pack, rounds: Number(wlOpts.rounds) },
      alm: { length: ALM.LENGTHS[almOpts.length] ? almOpts.length : "normal", map: almMapOk(almOpts.map) ? almOpts.map : "zufall" },
      jagd: { length: JG.LENGTHS[jagdOpts.length] ? jagdOpts.length : "normal", map: jagdMapOk(jagdOpts.map) ? jagdOpts.map : "zufall" },
      geo: { region: geoOpts.region, level: geoOpts.level, rounds: Number(geoOpts.rounds), timer: geoOpts.timer },
      hl: { length: hlOpts.length, theme: hlOpts.theme, level: HL.LEVELS[hlOpts.level] ? hlOpts.level : "gemischt" },
      qb: { length: Number(qbOpts.length), off: qbOpts.off.slice(), theme: qbOpts.theme || "mix", level: QB.LEVELS[qbOpts.level] ? qbOpts.level : "gemischt", joker: qbOpts.joker !== false },
      kg: { rounds: Number(kgOpts.rounds), busRounds: Number(kgOpts.busRounds), stichRounds: Number(kgOpts.stichRounds) },
      quiz: { rounds: Number(quizOpts.rounds), theme: quizOpts.theme, region: quizOpts.region, level: quizOpts.level },
      land: { region: landOpts.region, level: landOpts.level, rounds: Number(landOpts.rounds), timer: landOpts.timer },
      duell: { target: Number(duOpts.target), timer: duOpts.timer },
      frage: { target: Number(fqOpts.target), write: fqOpts.write, answer: fqOpts.answer, choices: fqOpts.choices },
      wand: { cats: fwOpts.cats.filter((k) => WANDDATA.some((c) => c.key === k)) },
      watten: { target: Number(wattenOpts.target), weli: wattenOpts.weli },
      schnapsen: { mode: schOpts.mode },
    };
    view.slf = S.phase === "slf" ? SLF.publicState(S, Date.now()) : null;
    if (S.phase === "wl" && S.wl && S.wl.step === "final" && S.wl.best == null) {
      // Rekord (nur beim Gastgeber gespeichert)
      const prevBest = store.get("s10-wl-best");
      S.wl.best = Math.max(prevBest || 0, S.wl.total);
      S.wl.newRecord = prevBest == null || S.wl.total > prevBest;
      store.set("s10-wl-best", S.wl.best);
    }
    view.wl = S.phase === "wl" ? WL.publicState(S) : null;
    view.geo = S.phase === "geo" ? GEO.publicState(S, Date.now()) : null;
    view.hl = S.phase === "hl" ? HL.publicState(S, Date.now()) : null;
    view.land = S.phase === "land" ? LAND.publicState(S, Date.now()) : null;
    view.quiz = S.phase === "quiz" ? QZ.publicState(S, Date.now()) : null;
    view.karten = S.phase === "karten" ? KG.publicState(S) : null;
    view.alm = S.phase === "alm" ? ALM.publicState(S) : null;
    view.jagd = S.phase === "jagd" ? JG.publicState(S) : null;
    view.duell = S.phase === "duell" ? DU.publicState(S, Date.now()) : null;
    view.frage = S.phase === "frage" ? FQ.publicState(S, Date.now()) : null;
    view.wand = S.phase === "wand" ? WAND.publicState(S) : null;
    if (view.wand && view.wand.last) { // gespielte Fragen merken – erst wieder, wenn alle durch sind
      const k = view.wand.last.key, seen = store.get("s10-fw-seen") || [];
      if (!seen.includes(k)) { const all = fwAllKeys(), next = seen.concat(k).filter((x) => all.includes(x)); store.set("s10-fw-seen", all.every((x) => next.includes(x)) ? [k] : next); }
    }
    if (view.frage) { // gespielte Aufgaben merken – erst wieder, wenn alle durch sind
      const k = FQ.curKey(S.frage), seen = store.get("s10-fq-seen") || [];
      if (S.frage.step !== "write" && !seen.includes(k)) { const all = fqAllKeys(), next = seen.concat(k).filter((x) => all.includes(x)); store.set("s10-fq-seen", all.every((x) => next.includes(x)) ? [k] : next); }
    }
    if (view.duell) { // gespielte Themen merken: sie kommen erst wieder, wenn alle einmal dran waren (wie bei Zehnkampf)
      const q = view.duell.list.q, seen = store.get("s10-du-seen") || [];
      if (!seen.includes(q)) {
        const next = seen.concat(q).filter((x) => DUDATA.some((l) => l.q === x));
        store.set("s10-du-seen", DUDATA.every((l) => next.includes(l.q)) ? [q] : next); // alles durch: von vorn
      }
    }
    view.qb = S.qb ? qbView() : null;
    if (S.qb && S.qb.plan.some((p) => p.game === "land" || p.game === "umriss")) needLandData(); // Länderkarte rechtzeitig laden
    view.watten = S.phase === "watten" ? WAT.publicState(S) : null;
    view.schnapsen = S.phase === "schnapsen" ? SCH.publicState(S) : null;
    const CARD_GAMES = { watten: WAT, schnapsen: SCH, frage: FQ, karten: KG, jagd: JG }; // private Infos nur an den jeweiligen Spieler
    if (CARD_GAMES[S.phase]) {
      // Hände nur privat verteilen: eigene direkt, Gäste über ihren eigenen Kanal
      const M = CARD_GAMES[S.phase];
      wattenPriv = M.privateState(S, myId);
      if (mq && roomTopic) S[S.phase].seats.filter((id) => id !== myId).forEach((id) =>
        sendSealed(T("hand/" + id), { seq: Date.now(), priv: M.privateState(S, id) }, { qos: 1, retain: true }));
    }
    seq = Math.max(Date.now(), seq + 1); // steigt immer, auch nach einem Neustart des Gastgebers
    view.seq = seq;
    store.set("s10-host", { code: roomCode, state: S, hostId: myId, broker: brokerIdx, ts: Date.now() });
    if (S.seen) store.set("s10-seen", S.seen);
    if (S.geoSeen) store.set("s10-geo-seen", S.geoSeen);
    if (S.quizSeen) store.set("s10-quiz-seen", S.quizSeen);
    if (S.landSeen) store.set("s10-land-seen", S.landSeen);
    if (mq && roomTopic) sendSealed(T("state"), view, { qos: 1, retain: true });
    render();
  }

  // ---------- Mitspieler ----------
  let leaving = false; // nach „Verlassen“ nichts mehr senden (sonst meldet sich der Gast automatisch wieder an)
  function sendUp(msg) {
    if (!mq || !roomTopic || leaving) return false;
    sendSealed(T("up"), { ...msg, clientId: myId }, { qos: 1 });
    return mq.connected;
  }

  let lastSeq = 0;
  async function guestJoin(code, name, idx, fixed) {
    if (!hasCrypto) { toast(errorMsg, "bad"); return; }
    isHost = false; roomCode = code; myName = name;
    store.set("s10-guest", { code, name });
    if (mq) mq.end(true);
    clearTimeout(findTimer);
    status = "Verbinde …"; render();
    await ensureCrypto(code);
    const willPayload = await seal({ type: "leave", clientId: myId });
    const c = mq = connectBroker(idx, { topic: T("up"), payload: willPayload, qos: 1, retain: false });
    c.on("connect", () => {
      if (mq !== c) return;
      status = view ? "" : `Suche Stube ${code} …`; render();
      c.subscribe([T("state"), T("host"), T("hand/" + myId), T("rtc/" + myId)], { qos: 1 });
      sendUp({ type: "join", name: myName });
    });
    c.on("reconnect", () => { if (mq === c) { status = "Verbindung unterbrochen – verbinde neu …"; render(); } });
    c.on("message", async (topic, buf) => {
      if (mq !== c) return;
      if (!buf.length) { // gelöschte Nachricht = Gastgeber hat beendet
        if (topic === T("state")) { status = "Der Gastgeber hat die Spielstube geschlossen."; render(); }
        return;
      }
      const m = await unseal(buf);
      if (m === undefined || mq !== c) return;
      if (topic === T("rtc/" + myId)) { onRtc(m); return; }
      if (topic === T("hand/" + myId)) {
        if (m && (!wattenPriv || !wattenPriv._seq || m.seq >= wattenPriv._seq)) { wattenPriv = m.priv ? { ...m.priv, _seq: m.seq } : null; render(); }
        return;
      }
      if (topic === T("host")) {
        status = m === "offline" ? "Der Gastgeber ist gerade offline – warte auf ihn …" : "";
        render(); return;
      }
      if (!m || !m.players) return;
      if (m.seq && m.seq <= lastSeq) return; // veralteten Stand ignorieren
      lastSeq = m.seq || lastSeq;
      view = m;
      if (status.startsWith("Suche Stube")) status = "";
      if ((m.kicked || []).includes(myId)) { // vom Gastgeber entfernt
        store.del("s10-guest"); leaving = true; try { c.end(true); } catch {} mq = null; view = null;
        errorMsg = "Der Gastgeber hat dich aus der Stube entfernt."; history.replaceState(null, "", location.pathname);
        return renderStart();
      }
      if (!m.players.some((p) => p.id === myId) && Date.now() - lastRejoin > 3000) { lastRejoin = Date.now(); sendUp({ type: "join", name: myName }); }
      render();
    });
    // Raum nicht gefunden? -> beim anderen Server suchen (außer der Link legt den Server fest)
    findTimer = setTimeout(() => {
      if (view || mq !== c) return;
      if (fixed) { status = `Stube „${code}“ nicht gefunden. Ist die Spielstube beim Gastgeber offen? Ich warte weiter …`; render(); return; }
      guestJoin(code, name, brokerIdx + 1, false);
      status = `Stube „${code}“ noch nicht gefunden – suche weiter …`; render();
    }, 6000);
  }

  setInterval(() => { if (!isHost && mq && mq.connected && view) sendUp({ type: "ping" }); }, 10000);

  function send(action) {
    if (isHost) return act(myId, action);
    if (!sendUp({ type: "action", action })) toast("Verbindung wackelt – Zug wird nachgeschickt …", "bad");
  }

  // Sicherheitsfrage im Stil der Seite (statt des Browser-Dialogs). Liefert ein Promise<boolean>.
  function askConfirm(title, text, okLabel = "Ja", cancelLabel = "Abbrechen", danger = false) {
    return new Promise((resolve) => {
      const box = document.createElement("div");
      box.className = "modal-back confirm-back";
      box.innerHTML = `<div class="modal confirm" role="alertdialog" aria-modal="true" aria-labelledby="cf-title">
          <h3 id="cf-title">${esc(title)}</h3>${text ? `<p class="muted">${esc(text)}</p>` : ""}
          <div class="confirm-actions"><button class="btn ghost" data-v="0">${esc(cancelLabel)}</button>
            <button class="btn ${danger ? "danger" : "primary"}" data-v="1">${esc(okLabel)}</button></div></div>`;
      const done = (v) => { document.removeEventListener("keydown", onKey, true); box.remove(); resolve(v); };
      const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); done(false); } };
      box.addEventListener("click", (e) => { if (e.target === box) done(false); const b = e.target.closest("[data-v]"); if (b) done(b.dataset.v === "1"); });
      document.addEventListener("keydown", onKey, true);
      document.body.appendChild(box);
      box.querySelector('[data-v="1"]').focus();
    });
  }

  // ---------- Kamera (nur Video, direkt von Gerät zu Gerät per WebRTC) ----------
  // Verbindungsaufbau über den verschlüsselten Kanal der Stube (rtc/<id>), das Bild selbst geht direkt zwischen den Geräten.
  const RTC_CFG = { iceServers: [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }] };
  const camOK = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection);
  let camStream = null, camOpen = true, camOn = false, micOn = false, camMuteAll = false;
  const pcOut = new Map(), pcIn = new Map(), remoteCams = new Map(), iceWait = new Map();
  const remoteMedia = new Map(); // ID → { cam, mic }: was der andere gerade eingeschaltet hat (Spuren bleiben bestehen, auch wenn aus)
  function rtcSend(to, msg) { if (mq && roomTopic) sendSealed(T("rtc/" + to), { ...msg, from: myId }, { qos: 1 }); }
  // Kamera und Mikrofon getrennt schaltbar. Ein- und Ausschalten tauscht nur die jeweilige Spur aus (replaceTrack):
  // die Verbindungen zu den anderen bleiben stehen, das andere (Bild oder Ton) läuft ohne Unterbrechung weiter.
  const MEDIA = {
    // HD aufnehmen, damit das Bild im großen Anruf-Fenster scharf ist; verschickt wird je nach Ansicht des Empfängers kleiner (siehe QUALITY)
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 }, facingMode: "user" },
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  };
  function mediaError(e, kind) {
    const what = kind === "audio" ? "Mikrofon" : "Kamera", n = e && e.name;
    if (n === "NotAllowedError" || n === "SecurityError") return `Zugriff auf ${what} verweigert. Erlauben kannst du es im Browser über das Schloss- bzw. Kamera-Symbol neben der Adresse – danach nochmal tippen.`;
    if (n === "NotFoundError" || n === "OverconstrainedError") return kind === "audio" ? "Kein Mikrofon gefunden." : "Keine Kamera gefunden.";
    if (n === "NotReadableError" || n === "AbortError") return `${what} wird gerade von einer anderen App benutzt. Dort schließen und nochmal versuchen.`;
    return `${what} nicht verfügbar.`;
  }
  const liveTrack = (kind) => (camStream ? camStream.getTracks().find((t) => t.kind === kind && t.readyState === "live") : null) || null;
  // Spur einer Art in allen ausgehenden Verbindungen tauschen; fehlt dort ein passender Kanal, wird nur diese Verbindung neu aufgebaut
  async function swapTrack(kind, track) {
    for (const [id, pc] of [...pcOut]) {
      const tr = pc.getTransceivers().find((x) => x.receiver && x.receiver.track && x.receiver.track.kind === kind);
      if (tr && tr.sender) { try { await tr.sender.replaceTrack(track); if (track && kind === "video") applyQuality(id); continue; } catch {} }
      if (track) { pc.close(); pcOut.delete(id); rtcSend(id, { t: "bye" }); }
    }
  }
  let mediaBusy = false;
  async function mediaToggle(kind) {
    if (mediaBusy) return;
    mediaBusy = true;
    try {
      const isOn = kind === "video" ? camOn : micOn;
      if (isOn) { // ausschalten: Spur beenden (Kamera-Lämpchen geht aus), Verbindungen bleiben
        const t = liveTrack(kind); if (t) { t.stop(); camStream.removeTrack(t); }
        if (kind === "video") camOn = false; else micOn = false;
        if (!camOn && !micOn) return mediaOff();
        await swapTrack(kind, null);
      } else {
        let t;
        try { t = (await navigator.mediaDevices.getUserMedia({ [kind]: MEDIA[kind] })).getTracks()[0]; }
        catch (e) { toast(mediaError(e, kind), "bad"); return; }
        if (!camStream) camStream = new MediaStream();
        camStream.addTrack(t);
        if (kind === "video") camOn = true; else micOn = true;
        camOpen = true;
        await swapTrack(kind, t);
      }
      sendMediaState(); camSync(); renderCamDock(); render();
    } finally { mediaBusy = false; }
  }
  // beides aus: alles beenden und die Verbindungen schließen
  function mediaOff() {
    if (camStream) camStream.getTracks().forEach((t) => t.stop());
    camStream = null; camOn = micOn = false;
    for (const [id, pc] of pcOut) { pc.close(); rtcSend(id, { t: "bye" }); }
    pcOut.clear(); camOpen = true;
    renderCamDock(); render();
  }
  const camToggle = () => mediaToggle("video");
  const micToggle = () => mediaToggle("audio");
  const mediaState = () => ({ cam: camOn, mic: micOn });
  function sendMediaState() { for (const id of pcOut.keys()) rtcSend(id, { t: "media", ...mediaState() }); }

  // Bildqualität je Empfänger: Jeder meldet, wie groß er das Bild gerade sieht; geschickt wird nur so viel, wie dort ankommt.
  // Die Kamera nimmt weiter in HD auf – verkleinert wird nur beim Versenden, im laufenden Betrieb und ohne Neuaufbau.
  const QUALITY = {
    closed: { active: false },                                         // Kamerafenster zugeklappt: Bild pausieren (Ton läuft weiter)
    small: { height: 180, maxBitrate: 250000, maxFramerate: 15 },      // kleines Kamerafenster im Spiel
    big: { height: 360, maxBitrate: 600000, maxFramerate: 24 },        // vergrößert im Spiel / Spalte in der Lobby
    stage: { height: 720, maxBitrate: 1500000, maxFramerate: 30 },     // großes Anruf-Fenster in der Lobby
  };
  const isQ = (q) => typeof q === "string" && Object.prototype.hasOwnProperty.call(QUALITY, q);
  const wantQ = new Map(); // Empfänger-ID → gewünschte Stufe
  async function applyQuality(id) {
    const pc = pcOut.get(id), t = liveTrack("video");
    if (!pc || !t) return;
    const tr = pc.getTransceivers().find((x) => x.sender && x.sender.track === t);
    if (!tr) return;
    const p = tr.sender.getParameters();
    if (!p.encodings || !p.encodings.length) return; // noch nicht ausgehandelt – wird nach der Antwort nachgeholt
    const q = QUALITY[wantQ.get(id)] || QUALITY.small, e = p.encodings[0];
    e.active = q.active !== false;
    if (q.height) {
      const h = (t.getSettings && t.getSettings().height) || 720;
      e.scaleResolutionDownBy = Math.max(1, h / q.height); e.maxBitrate = q.maxBitrate; e.maxFramerate = q.maxFramerate;
    }
    try { await tr.sender.setParameters(p); } catch { /* ältere Browser: dann bleibt es bei voller Qualität */ }
  }
  // was ich selbst gerade sehe, allen melden, deren Bild ich empfange (nur bei Änderung)
  const myQ = () => !camOpen ? "closed" : camStage ? "stage" : (camBig || camDock.classList.contains("docked")) ? "big" : "small";
  const sentQ = new Map();
  function sendView() {
    const q = myQ();
    for (const id of pcIn.keys()) if (sentQ.get(id) !== q) { sentQ.set(id, q); rtcSend(id, { t: "view", q }); }
  }
  const forgetPeer = (id) => { remoteMedia.delete(id); sentQ.delete(id); };
  const camPeers = () => (view && view.players ? view.players.filter((p) => p.id !== myId && p.connected).map((p) => p.id) : []);
  async function camSync() {
    const ps = camPeers();
    for (const id of [...remoteCams.keys()]) if (!ps.includes(id)) { const pc = pcIn.get(id); if (pc) pc.close(); pcIn.delete(id); remoteCams.delete(id); forgetPeer(id); renderCamDock(); }
    for (const id of [...wantQ.keys()]) if (!ps.includes(id)) wantQ.delete(id);
    if (!camStream || !mq || !roomTopic) return;
    for (const [id, pc] of pcOut) if (!ps.includes(id) || pc.connectionState === "failed" || pc.connectionState === "closed") { pc.close(); pcOut.delete(id); }
    for (const id of ps) if (!pcOut.has(id)) {
      const pc = new RTCPeerConnection(RTC_CFG); pcOut.set(id, pc);
      // für Bild und Ton je einen Kanal – auch wenn eines gerade aus ist, damit späteres Einschalten nur die Spur tauscht
      for (const kind of ["audio", "video"]) { const t = liveTrack(kind); if (t) pc.addTrack(t, camStream); else pc.addTransceiver(kind, { direction: "sendonly", streams: [camStream] }); }
      pc.onicecandidate = (e) => { if (e.candidate) rtcSend(id, { t: "ice", dir: "out", c: e.candidate.toJSON() }); };
      try { await pc.setLocalDescription(await pc.createOffer()); rtcSend(id, { t: "offer", sdp: pc.localDescription.sdp, ...mediaState() }); } catch { pcOut.delete(id); }
    }
  }
  setInterval(camSync, 4000);
  async function addIce(key, pc, c) {
    if (pc && pc.remoteDescription) { try { await pc.addIceCandidate(c); } catch {} }
    else { if (!iceWait.has(key)) iceWait.set(key, []); iceWait.get(key).push(c); }
  }
  async function flushIce(key, pc) { for (const c of iceWait.get(key) || []) { try { await pc.addIceCandidate(c); } catch {} } iceWait.delete(key); }
  async function onRtc(m) {
    if (!m || typeof m !== "object" || !m.from || m.from === myId) return;
    const id = String(m.from).slice(0, 40);
    try {
      if (m.t === "offer") { // jemand schickt mir sein Kamerabild
        const old = pcIn.get(id); if (old) old.close();
        remoteMedia.set(id, { cam: m.cam !== false, mic: m.mic !== false }); sentQ.delete(id);
        const pc = new RTCPeerConnection(RTC_CFG); pcIn.set(id, pc);
        pc.ontrack = (e) => { remoteCams.set(id, e.streams[0] || new MediaStream([e.track])); renderCamDock(); };
        pc.onicecandidate = (e) => { if (e.candidate) rtcSend(id, { t: "ice", dir: "in", c: e.candidate.toJSON() }); };
        pc.onconnectionstatechange = () => { if (pc.connectionState === "failed" && pcIn.get(id) === pc) { remoteCams.set(id, "failed"); renderCamDock(); } };
        await pc.setRemoteDescription({ type: "offer", sdp: m.sdp }); await flushIce("in:" + id, pc);
        await pc.setLocalDescription(await pc.createAnswer());
        const q = myQ(); sentQ.set(id, q);
        rtcSend(id, { t: "answer", sdp: pc.localDescription.sdp, q }); // gleich mitteilen, wie groß ich das Bild sehe
      } else if (m.t === "answer") {
        const pc = pcOut.get(id);
        if (pc && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription({ type: "answer", sdp: m.sdp }); await flushIce("out:" + id, pc);
          if (isQ(m.q)) wantQ.set(id, m.q);
          applyQuality(id);
        }
      } else if (m.t === "view") { // der andere sieht mein Bild jetzt größer oder kleiner
        if (isQ(m.q)) { wantQ.set(id, m.q); applyQuality(id); }
      } else if (m.t === "media") { // der andere hat Kamera oder Mikrofon ein-/ausgeschaltet
        remoteMedia.set(id, { cam: !!m.cam, mic: !!m.mic }); renderCamDock();
      } else if (m.t === "ice" && m.c) {
        if (m.dir === "out") await addIce("in:" + id, pcIn.get(id), m.c); else await addIce("out:" + id, pcOut.get(id), m.c);
      } else if (m.t === "bye") {
        const pc = pcIn.get(id); if (pc) pc.close(); pcIn.delete(id); remoteCams.delete(id); forgetPeer(id); renderCamDock();
      }
    } catch (e) { /* einzelne Fehler beim Verbindungsaufbau ignorieren – camSync versucht es erneut */ }
  }
  // Kamera-Leiste: liegt außerhalb von #app, damit die Bilder beim Neuzeichnen nicht flackern
  const camDock = document.createElement("div"); camDock.id = "camdock"; document.body.appendChild(camDock);
  const camVideos = new Map();
  let camBig = store.get("s10-cam-big") === true;
  // In der Lobby öffnet „Vergrößern“ ein großes Anruf-Fenster im Vordergrund – zum Plaudern ohne zu spielen
  let camStage = false;
  const camBack = document.createElement("div"); camBack.id = "camback"; document.body.appendChild(camBack);
  const inLobby = () => !!view && view.phase === "lobby";
  function setCamStage(on) { camStage = on && inLobby(); camDockPlace(); }
  camBack.onclick = () => setCamStage(false);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && camStage) setCamStage(false); });
  function camPlace(x, y) { // im sichtbaren Bereich halten
    const w = camDock.offsetWidth, h = camDock.offsetHeight;
    camDock.style.left = Math.max(4, Math.min(innerWidth - w - 4, x)) + "px";
    camDock.style.top = Math.max(4, Math.min(innerHeight - h - 4, y)) + "px";
    camDock.style.bottom = "auto";
  }
  addEventListener("resize", () => { const p = store.get("s10-cam-pos"); if (p && p.rx != null && camDock.classList.contains("show")) camPlace(p.rx * innerWidth - camDock.offsetWidth, p.by * innerHeight - camDock.offsetHeight); });
  function camTile(id, stream, label, mirror) {
    let tile = camVideos.get(id);
    if (!tile) {
      tile = document.createElement("div"); tile.className = "camtile";
      tile.innerHTML = `<video autoplay playsinline></video><span class="caminit"></span><span class="camname"></span>`;
      camVideos.set(id, tile);
    }
    const vid = tile.querySelector("video");
    vid.muted = id === "me" || camMuteAll; // eigenes Mikrofon nie selbst hören
    if (stream === "failed") { tile.classList.add("failed"); vid.srcObject = null; }
    else {
      tile.classList.remove("failed");
      if (vid.srcObject !== stream) { vid.srcObject = stream; const pl = vid.play(); if (pl && pl.catch) pl.catch(() => camNeedTap(true)); }
    }
    const md = id === "me" ? mediaState() : remoteMedia.get(id) || { cam: true, mic: true };
    const hasVideo = stream && stream !== "failed" && md.cam && stream.getVideoTracks().some((t) => t.readyState === "live");
    const hasAudio = stream && stream !== "failed" && md.mic && stream.getAudioTracks().length > 0;
    tile.classList.toggle("novideo", !hasVideo && stream !== "failed");
    tile.querySelector(".caminit").textContent = (label || "?").charAt(0).toUpperCase();
    vid.classList.toggle("mirror", !!mirror);
    tile.querySelector(".camname").textContent = stream === "failed" ? label + " – keine Verbindung" : label + (hasAudio ? " 🎤" : "");
    return tile;
  }
  function renderCamDock() {
    const nameOf = (id) => (view && view.players ? (view.players.find((p) => p.id === id) || {}).name : "") || "?";
    const items = [];
    if (camStream && camOn) items.push(["me", camStream, "Du", true]);
    for (const [id, st] of remoteCams) items.push([id, st, nameOf(id), false]);
    for (const [id, tile] of camVideos) if (!items.some((x) => x[0] === id)) { tile.remove(); camVideos.delete(id); }
    camDock.classList.toggle("show", items.length > 0);
    // Bild-im-Bild: Mitspieler groß, das eigene Bild klein in der Ecke (wie bei einem Videoanruf)
    // im großen Anruf-Fenster schwebt das eigene Bild nur bei genau einem Gegenüber, sonst ist es eine normale Kachel
    // Bild-im-Bild nur bei genau einem Gegenüber (in der Lobby-Spalte wie bisher); bei mehreren ist das eigene Bild eine normale Kachel
    camDock.classList.toggle("pip", !!camStream && camOn && remoteCams.size > 0 && !(remoteCams.size > 1 && !camDock.classList.contains("docked")));
    camDock.classList.toggle("closed", !camOpen);
    if (!camDock.querySelector(".camhead")) {
      camDock.innerHTML = `<div class="camhead"><span class="camgrip" title="Zum Verschieben ziehen">⠿ Kamera</span>
          <span class="cambtns"><button type="button" class="camaud" title="Ton der Mitspieler an/aus"></button><button type="button" class="camsize" title="Größer/kleiner">⤢</button><button type="button" class="camtoggle" title="Ein-/ausklappen"></button></span></div><div class="camtiles"></div>`;
      camDock.querySelector(".camtoggle").onclick = () => { camOpen = !camOpen; renderCamDock(); };
      camDock.querySelector(".camaud").onclick = () => { camMuteAll = !camMuteAll; camNeedTap(false); renderCamDock(); camDock.querySelectorAll("video").forEach((v) => v.play && v.play().catch(() => {})); };
      camDock.querySelector(".camsize").onclick = () => {
        if (inLobby()) return setCamStage(!camStage);
        camBig = !camBig; store.set("s10-cam-big", camBig); renderCamDock();
      };
      // verschieben per Maus oder Finger; Position wird pro Gerät gemerkt
      const grip = camDock.querySelector(".camhead");
      grip.onpointerdown = (e) => {
        if (e.target.closest("button") || camStage) return;
        const r = camDock.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
        grip.setPointerCapture(e.pointerId);
        grip.onpointermove = (ev) => camPlace(ev.clientX - dx, ev.clientY - dy);
        grip.onpointerup = () => { grip.onpointermove = null; const q = camDock.getBoundingClientRect(); store.set("s10-cam-pos", { rx: q.right / innerWidth, by: q.bottom / innerHeight }); };
      };
    }
    dockGridLayout(items.length);
    camDock.querySelector(".camtoggle").textContent = camOpen ? "–" : "+";
    const anyAudio = [...remoteCams].some(([id, st]) => st && st !== "failed" && st.getAudioTracks().length && (remoteMedia.get(id) || { mic: true }).mic);
    const ab = camDock.querySelector(".camaud"); ab.style.display = anyAudio ? "" : "none"; ab.textContent = camMuteAll ? "🔇" : "🔊";
    camDock.classList.toggle("big", camBig && !camStage);
    camDock.classList.toggle("stage", camStage);
    if (camStage) camDock.classList.remove("closed");
    camBack.classList.toggle("show", camStage && camDock.classList.contains("show"));
    const sz = camDock.querySelector(".camsize");
    sz.textContent = camStage ? "✕" : "⤢";
    sz.title = camStage ? "Großes Anruf-Fenster schließen" : inLobby() ? "Großes Anruf-Fenster öffnen" : "Größer/kleiner";
    // Position merkt sich die Ecke rechts unten – beim Vergrößern/Verkleinern bleibt sie stehen
    const pos = store.get("s10-cam-pos");
    if (!camStage && pos && pos.rx != null && camDock.classList.contains("show") && !camDock.classList.contains("docked")) camPlace(pos.rx * innerWidth - camDock.offsetWidth, pos.by * innerHeight - camDock.offsetHeight);
    // Hinweise (Toasts) unten rechts nicht unter dem Kamerafenster verstecken
    // (am Computer stehen sie links neben dem Kamerafenster, damit sie nicht über die rechte Spalte rutschen, z. B. „Zählt das?“)
    const camCorner = !camStage && camDock.classList.contains("show") && !camDock.classList.contains("docked") && !(pos && pos.rx != null);
    document.body.style.setProperty("--cam-h", camCorner ? camDock.offsetHeight + 16 + "px" : "0px");
    document.body.style.setProperty("--cam-w", camCorner ? camDock.offsetWidth + 16 + "px" : "0px");
    const box = camDock.querySelector(".camtiles");
    items.forEach(([id, st, label, mirror]) => { const t = camTile(id, st, label, mirror); t.classList.toggle("self", id === "me"); if (t.parentNode !== box) box.appendChild(t); });
    stageLayout();
    sendView();
  }
  // Kleines Kamerafenster im Spiel bei mehreren Gegenübern: Größe bleibt etwa wie bei einem Mitspieler,
  // die Bilder werden kleiner und stehen im Raster (2 Spalten, ab 5 Bildern 3) – sonst wächst das Fenster über Knöpfe und Karten
  function dockGridLayout(n) {
    const box = camDock.querySelector(".camtiles");
    if (!box) return;
    const grid = !camStage && !camDock.classList.contains("docked") && remoteCams.size > 1;
    camDock.classList.toggle("grid", grid);
    if (!grid) { box.style.removeProperty("--bw"); return; }
    const cols = n <= 4 ? 2 : 3, gap = 6, phone = innerWidth <= 640;
    const W = camBig ? (phone ? 300 : 420) : (phone ? 170 : 250); // Gesamtbreite des Rasters
    const tw = Math.floor((W - (cols - 1) * gap) / cols);
    box.style.setProperty("--tw", tw + "px");
    box.style.setProperty("--bw", cols * tw + (cols - 1) * gap + "px");
  }
  // Großes Anruf-Fenster: Spaltenzahl so wählen, dass die Kacheln möglichst groß werden (wie bei Videokonferenzen),
  // eine unvollständige letzte Reihe steht mittig; im Hochformat (Handy) sind die Kacheln hochkant
  function stageLayout() {
    const box = camDock.querySelector(".camtiles");
    if (!box) return;
    if (!camStage) { box.style.width = ""; return; }
    const pip = camDock.classList.contains("pip");
    const n = [...box.children].filter((t) => !(pip && t.classList.contains("self"))).length;
    if (!n) return;
    const cs = getComputedStyle(camDock), num = (k) => parseFloat(cs[k]) || 0;
    const padX = num("paddingLeft") + num("paddingRight") + num("borderLeftWidth") + num("borderRightWidth");
    const padY = num("paddingTop") + num("paddingBottom") + num("borderTopWidth") + num("borderBottomWidth");
    const head = camDock.querySelector(".camhead"), gap = 10;
    const W = Math.min(innerWidth * 0.96, 1600) - padX, H = innerHeight * 0.92 - padY - (head ? head.offsetHeight : 0);
    const ratio = innerWidth < innerHeight ? 3 / 4 : 16 / 9;
    const opts = [];
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      opts.push({ cols, w: Math.min((W - (cols - 1) * gap) / cols, ((H - (rows - 1) * gap) / rows) * ratio) });
    }
    // fast gleich große Kacheln (bis 10 % kleiner): lieber die breitere Anordnung statt einer schmalen Säule
    const maxW = Math.max(...opts.map((o) => o.w));
    const best = opts.filter((o) => o.w >= maxW * 0.9).sort((a, b) => b.cols * b.w - a.cols * a.w)[0];
    const tw = Math.max(80, Math.floor(best.w));
    box.style.setProperty("--tw", tw + "px");
    box.style.setProperty("--ta", String(ratio));
    box.style.width = best.cols * tw + (best.cols - 1) * gap + "px"; // Fenster schmiegt sich an die Kacheln
  }
  // In der Lobby (am Computer) sitzt das Kamerafenster fest in der linken Spalte statt über den Einstellungen zu schweben
  function camDockPlace() {
    if (camStage && !inLobby()) camStage = false; // beim Spielstart schließt das große Fenster
    const slot = app.querySelector("#camslot"), dock = !camStage && !!slot && innerWidth >= 1100;
    const target = dock ? slot : document.body;
    if (camDock.parentNode !== target) {
      // Beim Wechsel aus der Lobby ins Spiel: Kamera wieder unten rechts (danach weiter frei verschiebbar)
      if (!dock) { store.del("s10-cam-pos"); camDock.style.left = camDock.style.top = camDock.style.bottom = ""; }
      target.appendChild(camDock);
      camDock.querySelectorAll("video").forEach((v) => { if (v.srcObject) v.play().catch(() => {}); });
    }
    camDock.classList.toggle("docked", dock);
    // immer neu zeichnen – auch beim Zurückwechseln in die Lobby-Spalte, sonst bleibt die Anordnung des großen Fensters hängen
    renderCamDock();
    if (dock) {
      camDock.classList.remove("stage"); camBack.classList.remove("show");
      const sz = camDock.querySelector(".camsize"); if (sz) { sz.textContent = "⤢"; sz.title = "Großes Anruf-Fenster öffnen"; } document.body.style.setProperty("--cam-h", "0px"); document.body.style.setProperty("--cam-w", "0px");
    } // in der Lobby liegt die Kamera in der Spalte – Hinweise ganz unten
    sendView();
  }
  addEventListener("resize", () => camDockPlace());
  // Browser blockieren Ton manchmal, bis man einmal tippt
  function camNeedTap(on) {
    let b = camDock.querySelector(".camtap");
    if (on && !b) { b = document.createElement("button"); b.className = "camtap btn primary sm"; b.textContent = "🔊 Ton aktivieren"; camDock.appendChild(b);
      b.onclick = () => { camDock.querySelectorAll("video").forEach((v) => v.play().catch(() => {})); camNeedTap(false); }; }
    if (!on && b) b.remove();
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest) return;
    if (e.target.closest("[data-cam]")) camToggle();
    else if (e.target.closest("[data-mic]")) micToggle();
  });

  async function leave() {
    if (isHost && !(await askConfirm("Spielstube schließen?", "Alle Mitspieler fliegen dann raus.", "Stube schließen", "Abbrechen", true))) return;
    store.del(isHost ? "s10-host" : "s10-guest");
    const go = () => { location.href = location.pathname; };
    if (!mq || !roomTopic) return go();
    if (isHost) {
      mq.publish(T("state"), "", { qos: 1, retain: true });
      mq.publish(T("host"), "", { qos: 1, retain: true });
      setTimeout(() => { try { mq.end(); } catch {} go(); }, 400);
      return;
    }
    // Gast: Abmeldung wirklich zustellen (auf Bestätigung des Servers warten), erst dann die Seite verlassen
    leaving = true;
    const c = mq;
    let done = false; const finish = () => { if (done) return; done = true; try { c.end(true); } catch {} go(); };
    setTimeout(finish, 1500);
    try {
      await outChain;
      const payload = await seal({ type: "leave", clientId: myId });
      c.publish(T("up"), payload, { qos: 1 }, () => finish());
    } catch { finish(); }
  }

  // ---------- Darstellung ----------
  function toast(text, kind) {
    toastEl.textContent = text;
    toastEl.className = "toast show " + (kind || "");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { toastEl.className = "toast " + (kind || ""); }, 3800);
  }

  // Kopfzeilen-Knöpfe aller Spiele; der Gastgeber kann jederzeit alle zurück in die Lobby holen
  // Hinweisbalken in den Spielen. „Verbinde …“-Hinweise nur, wenn es Mitspieler gibt – allein betrifft das niemanden.
  const iPause = () => !!(view && view.phase !== "lobby" && view.players && (view.players.find((p) => p.id === myId) || {}).paused);
  function statusBarHtml() {
    // pausiert: Hinweis über dem Spiel (Eingaben sind gesperrt, siehe .s10-paused in style.css)
    const pz = iPause() ? `<div class="pause-note">⏸ Du pausierst und schaust zu. ${isHost ? "Als Gastgeber steuerst du das Spiel weiter." : ""} Wieder mitspielen kannst du in der Lobby – ab dem nächsten Spiel.</div>` : "";
    if (!status) return pz;
    const busy = /…$/.test(status);
    if (busy && view && view.players && !view.players.some((p) => p.id !== myId)) return "";
    return pz + `<div class="status ${busy ? "busy" : ""}">${esc(status)}</div>`;
  }
  // Handy: Karten (Wo liegt das?, Von oben, Länder finden) so bemessen, dass die Seite genau auf den Bildschirm passt –
  // sonst schiebt Wischen auf der Karte manchmal die Seite statt der Karte. Vor dem Anlegen der Leaflet-Karte aufrufen.
  function fitGeoMaps() {
    if (innerWidth > 640) return;
    const maps = [...app.querySelectorAll(".geo-map")];
    const over = document.documentElement.scrollHeight - innerHeight;
    if (!maps.length || over <= 0) return;
    const cut = Math.ceil(over / maps.length);
    maps.forEach((m) => { m.style.height = Math.max(200, m.getBoundingClientRect().height - cut) + "px"; });
  }
  function topActionsHtml() {
    return `<div class="top-actions">
      ${camOK ? `<button class="btn ghost sm ${camOn ? "cam-on" : ""}" data-cam title="${camOn ? "Kamera aus" : "Kamera an"}" aria-label="Kamera an/aus">📷</button>
        <button class="btn ghost sm ${micOn ? "cam-on" : ""}" data-mic title="${micOn ? "Mikrofon aus" : "Mikrofon an"}" aria-label="Mikrofon an/aus">🎤</button>` : ""}
      <button id="mute" class="btn ghost sm" title="Ton an/aus" aria-label="Ton an/aus">${sfx.muted ? "🔇" : "🔊"}</button>
      <button id="invite" class="btn sm" title="Link zum Beitreten teilen" aria-label="Einladen"><span class="lbl-long">＋ Einladen</span><span class="lbl-short">＋</span></button>
      ${isHost ? `<button id="hostLobby" class="btn ghost sm" title="Spiel beenden – alle zurück in die Lobby" aria-label="Zur Lobby"><span class="lbl-long">Zur Lobby</span><span class="lbl-short">⌂</span></button>` : ""}
      <button id="leave" class="btn ghost sm" title="${isHost ? "Stube schließen" : "Verlassen"}" aria-label="${isHost ? "Stube schließen" : "Verlassen"}"><span class="lbl-long">${isHost ? "Stube schließen" : "Verlassen"}</span><span class="lbl-short">✕</span></button>
    </div>`;
  }
  document.addEventListener("click", async (e) => {
    if (!e.target.closest || !e.target.closest("#hostLobby") || !isHost) return;
    if (await askConfirm("Zurück in die Lobby?", "Das Spiel wird für alle beendet, der aktuelle Spielstand geht verloren.", "Zur Lobby")) {
      selected = null; send({ type: "lobby" });
    }
  });
  let lastLobbyGame = null, lastPhase = null;
  // Punkte-Chips (oben in vielen Spielen, Jagdstrecke): ändert sich ein Punktestand, zählt die Zahl hoch, der Chip leuchtet in der
  // Spielerfarbe und „+3“ steigt auf (Abzug: Zahl ruckt rot). Zeitbasiert je Spieler, damit Neuzeichnen die Animation fortsetzt.
  const chipPts = new Map(), chipAnim = new Map();
  function chipFx() {
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, now = Date.now();
    app.querySelectorAll(".geo-score, .jsrow").forEach((el) => {
      const nm = el.querySelector(".geo-score-name, .jsname"), b = el.querySelector(".geo-score > b, .jspts");
      if (!nm || !b) return;
      const key = view.phase + ":" + nm.textContent.replace(/\(du\)/, "").trim(), pts = Number(b.textContent);
      if (!Number.isFinite(pts)) return;
      const prev = chipPts.get(key);
      chipPts.set(key, pts);
      // neue Änderung (nicht beim ersten Anzeigen, nicht beim Zurücksetzen auf 0 für eine neue Partie)
      if (prev !== undefined && pts !== prev && !(pts === 0 && prev > 0) && !reduce) chipAnim.set(key, { from: prev, to: pts, t: now });
      const a = chipAnim.get(key);
      if (!a || a.to !== pts || now - a.t > 1300) return;
      const e = now - a.t, d = a.to - a.from;
      el.classList.add(d > 0 ? "fx-gain" : "fx-loss"); el.style.animationDelay = -e + "ms"; b.style.animationDelay = -e + "ms";
      if (d > 0) el.insertAdjacentHTML("beforeend", `<span class="chip-plus" style="animation-delay:${-e}ms">+${d}</span>`);
      const step = () => { if (!b.isConnected) return; const q = Math.min(1, (Date.now() - a.t) / 600); b.textContent = Math.round(a.from + d * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); };
      step();
    });
  }
  function render() {
    document.documentElement.classList.toggle("s10-guest", !!view && !isHost); // Gäste am Handy: Kopfleiste ohne Organisatorisches
    document.documentElement.classList.toggle("s10-paused", iPause() && !isHost); // pausierte Gäste: Spiel nur ansehen
    if (!view) return renderStart();
    if (!isHost && view.phase === "lobby" && lastPhase && lastPhase !== "lobby") toast("Der Gastgeber hat das Spiel beendet – ihr seid wieder in der Lobby.", "info");
    lastPhase = view.phase;
    if (!isHost && view.phase === "lobby") {
      if (lastLobbyGame && view.game !== lastLobbyGame) {
        const g = GAMES.find((x) => x.key === view.game);
        if (g) toast(`Der Gastgeber hat „${g.name}“ gewählt.`, "info");
      }
      lastLobbyGame = view.game;
    }
    document.body.classList.toggle("qb-play", !!(view.qb && view.phase !== "querbeet" && view.phase !== "lobby"));
    if (view.phase !== "lobby") qbStartBar();
    if (view.phase !== "watten" && view.phase !== "schnapsen") G.dealReset();
    if (view.phase === "lobby") renderLobby(); else if (view.phase === "querbeet") G.renderQuerbeet(); else if (view.phase === "slf") G.renderSlf(); else if (view.phase === "wl") G.renderWl(); else if (view.phase === "geo") G.renderGeo(); else if (view.phase === "land") G.renderLand(); else if (view.phase === "quiz") G.renderQuiz(); else if (view.phase === "karten") G.renderKarten(); else if (view.phase === "hl") G.renderHl(); else if (view.phase === "duell") G.renderDuell(); else if (view.phase === "frage") G.renderFrage(); else if (view.phase === "wand") G.renderWand(); else if (view.phase === "watten") G.renderWatten(); else if (view.phase === "schnapsen") G.renderSchnapsen(); else if (view.phase === "alm") G.renderAlm(); else if (view.phase === "jagd") G.renderJagd(); else renderGame();
    camDockPlace();
    chipFx();
    G.qbBarRender();
    if (view.lastEvent && view.lastEvent.id !== lastToastId) {
      if (lastToastId !== null && view.phase !== "lobby") {
        toast(view.lastEvent.text, view.lastEvent.kind);
      }
      lastToastId = view.lastEvent.id;
    }
    reactToChanges(view);
    syncModal();
  }

  // ---------- Töne, Konfetti, Tab-Titel ----------
  const sfx = (() => {
    let ctx = null, muted = store.get("s10-muted") === true;
    const unlock = () => {
      if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
      if (ctx && ctx.state === "suspended") ctx.resume();
    };
    ["pointerdown", "keydown", "touchstart"].forEach((e) => addEventListener(e, unlock, { passive: true }));
    function tone(freq, start, dur, type, vol, slideTo) {
      const t0 = ctx.currentTime + start, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.05);
    }
    const play = (fn) => { if (muted || !ctx) return; if (ctx.state === "suspended") ctx.resume(); try { fn(); } catch {} };
    return {
      get muted() { return muted; },
      // eigene Klänge eines Spiels (z. B. Auf der Jagd) im selben Audio-Kontext – stumm geschaltet passiert nichts
      audio: (fn) => play(() => fn(ctx)),
      toggle() { muted = !muted; store.set("s10-muted", muted); if (!muted) { unlock(); this.turn(); } },
      // bewusst sparsam: nur wenn man gebraucht wird und am Spielende
      turn: () => play(() => { tone(880, 0, 0.14, "sine", 0.12); tone(1175, 0.15, 0.24, "sine", 0.12); }),
      tick: () => play(() => tone(1500, 0, 0.03, "square", 0.025)),
      // In einer Querbeet-Etappe nur ein kurzer, leiser Ton – gejubelt wird bei der Siegerehrung
      win: () => play(() => { if (qbQuiet) return tone(659, 0, 0.18, "triangle", 0.06); [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle", 0.1)); }),
      lose: () => play(() => { if (qbQuiet) return; tone(392, 0, 0.22, "triangle", 0.08); tone(330, 0.2, 0.35, "triangle", 0.08); }),
      // Fanfare für die Querbeet-Siegerehrung
      // kurzes „Klack“ für jede ausgeteilte oder umgedrehte Karte
      card: (n = 1, gap = 0.16, start = 0) => play(() => { for (let i = 0; i < n; i++) { tone(1400, start + i * gap, 0.035, "square", 0.025); tone(700, start + i * gap + 0.01, 0.05, "triangle", 0.03); } }),
      fanfare: () => play(() => {
        [[523, 0, .16], [523, .16, .16], [523, .32, .16], [659, .5, .5], [587, 1.02, .16], [659, 1.2, .16], [784, 1.38, .7]].forEach(([f, t, d]) => tone(f, t, d, "triangle", 0.11));
        [[262, .5, .5], [330, 1.38, .7], [392, 1.38, .7]].forEach(([f, t, d]) => tone(f, t, d, "sine", 0.06));
      }),
    };
  })();
  // weitere Klänge über die Bausteine aus klang.js (Nachhall, Rauschen)
  {
    const K = window.S10Klang, P = (fn) => K && K.play(sfx, fn);
    let cd = { key: null, s: null, mine: false }, gongAt = 0;
    Object.assign(sfx, {
      // Uhr: leises Holz-Ticken in den letzten 5 s (letzte 3 heller), Gong bei 0
      tickLow: () => P((c, t) => { K.noise(c, t, 0.025, { type: "bandpass", freq: 2200, q: 4, peak: 0.22 }); K.tone(c, t, 0.04, { f0: 900, peak: 0.05 }); }),
      tickHigh: () => P((c, t) => { K.noise(c, t, 0.025, { type: "bandpass", freq: 3200, q: 4, peak: 0.28 }); K.tone(c, t, 0.05, { f0: 1300, peak: 0.07 }); }),
      gong: () => { gongAt = Date.now(); P((c, t) => { [[196, .16], [294, .07], [392, .05], [523, .025]].forEach(([f, p]) => K.tone(c, t, 1.4, { f0: f, a: 0.004, peak: p, rev: 0.5 })); K.noise(c, t, 0.05, { freq: 600, peak: 0.12 }); }); },
      // Countdown je Timer-Takt melden: key = Runde, ms = Restzeit, mine = man muss selbst noch etwas abgeben.
      // Beim ersten Melden (Neuladen, Rundenbeginn) kein Ton; der Gong kommt, wenn man kurz vor 0 noch dran war.
      countdown(key, ms, mine) {
        const s = Math.ceil(Math.max(0, ms - 300) / 1000); // 0,3 s früher: bei Zeitablauf wird automatisch abgegeben und die Runde endet sofort
        if (cd.key !== key) { cd = { key, s, mine }; return; }
        if (s === cd.s) return; // „mine“ zählt zu Beginn jeder Sekunde (Abgabe bei Zeitablauf stört den Gong nicht)
        const was = cd.s, wasMine = cd.mine; cd.s = s; if (s > 0) cd.mine = mine;
        if (s > was) return;
        if (s === 0) { if (wasMine) sfx.gong(); return; }
        if (!mine) return;
        if (s <= 3) sfx.tickHigh(); else if (s <= 5) sfx.tickLow();
      },
      // richtig / falsch
      right: () => P((c, t) => { K.tone(c, t, 0.35, { type: "triangle", f0: 1318, peak: 0.13, rev: 0.35 }); K.tone(c, t + 0.07, 0.45, { type: "triangle", f0: 1976, peak: 0.09, rev: 0.35 }); }),
      wrong: () => P((c, t) => { K.tone(c, t, 0.45, { f0: 175, f1: 120, peak: 0.28 }); K.tone(c, t, 0.3, { type: "triangle", f0: 233, f1: 165, peak: 0.07, filter: { type: "lowpass", freq: 900 } }); K.noise(c, t, 0.06, { freq: 400, peak: 0.15 }); }),
      // Watten/Schnapsen: Karte auf den Tisch, Stich einsammeln
      layAt: 0,
      lay: () => (sfx.layAt = Date.now()) && P((c, t) => { K.noise(c, t, 0.06, { type: "bandpass", freq: 1500, q: 0.9, peak: 0.35, sweepTo: 700 }); K.tone(c, t, 0.07, { f0: 160, f1: 90, peak: 0.12 }); }),
      sweep: () => P((c, t) => { for (let i = 0; i < 3; i++) K.noise(c, t + i * 0.05, 0.12, { type: "bandpass", freq: 2600 - i * 400, q: 0.8, a: 0.02, peak: 0.12 }); K.noise(c, t + 0.15, 0.08, { type: "bandpass", freq: 900, q: 1, peak: 0.18 }); }),
      // Lobby: jemand kommt dazu
      join: () => P((c, t) => { K.tone(c, t, 0.18, { type: "triangle", f0: 1046, peak: 0.08, rev: 0.25 }); K.tone(c, t + 0.1, 0.3, { type: "triangle", f0: 784, peak: 0.08, rev: 0.25 }); }),
      // Erdkunde-Auflösung: Ziel erscheint, Nadel fällt
      // (direkt nach dem Gong kein zweiter Ton)
      goal: () => Date.now() - gongAt > 800 && P((c, t) => { K.tone(c, t, 0.5, { type: "triangle", f0: 1568, peak: 0.08, rev: 0.4 }); K.tone(c, t + 0.06, 0.5, { type: "triangle", f0: 2093, peak: 0.05, rev: 0.4 }); }),
      plop: () => P((c, t) => { K.tone(c, t, 0.12, { f0: 520, f1: 180, peak: 0.2 }); K.noise(c, t, 0.03, { freq: 1200, peak: 0.08 }); }),
      // Stubenmeisterschaft: jemand überholt
      whoosh: () => P((c, t) => { K.noise(c, t, 0.35, { type: "bandpass", freq: 350, q: 1.4, a: 0.12, peak: 0.25, sweepTo: 2600 }); }),
    });
  }

  let qbQuiet = false; // während einer Querbeet-Etappe: kein Konfetti, leise Töne
  // Großes Finale: mehrere Wellen von links, rechts und aus der Mitte
  function confettiGrand() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [[0.5, 0], [0.12, 450], [0.88, 450], [0.5, 1100], [0.25, 1700], [0.75, 1700], [0.5, 2400]].forEach(([x, ms]) => setTimeout(() => confetti(x, 220, 5), ms));
  }
  function confetti(xFrac = 0.5, count = 160, life = 3.5) {
    if (qbQuiet) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas"), dpr = devicePixelRatio || 1;
    cv.className = "confetti"; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    document.body.appendChild(cv);
    const c = cv.getContext("2d"); c.scale(dpr, dpr);
    const colors = ["#ffc83d", "#2fbf71", "#ef4b5a", "#5b48c9", "#ffffff", "#4fc3f7"];
    const parts = Array.from({ length: count }, () => ({
      x: innerWidth * xFrac + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, col: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      const age = (t - t0) / 1000;
      c.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = Math.max(0, 1 - age / life);
        c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
      });
      if (age < life) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  const BASE_TITLE = document.title;
  let prev = null; // vorheriger Zustand, um Wechsel zu erkennen
  function reactToChanges(v) {
    qbQuiet = !!(v.qb && v.phase !== "querbeet");
    const cur = v.players && v.players[v.turn];
    const now = {
      phase: v.phase, round: v.round,
      myTurn: v.phase === "playing" && cur && cur.id === myId && !v.pending && !v.undoReq,
      mustJudge: !!(v.phase === "playing" && v.pending && v.pending.judges.includes(myId) && v.pending.by !== myId),
      mustVote: !!(v.undoReq && v.undoReq.approvers.includes(myId)),
      slfKey: v.slf ? v.slf.round + ":" + v.slf.step : null,
      wlKey: v.wl ? v.wl.impulse + ":" + v.wl.attempt + ":" + v.wl.step : null,
      geoKey: v.geo ? v.geo.round + ":" + v.geo.step : null,
      landKey: v.land ? v.land.round + ":" + v.land.step : null,
      quizKey: v.quiz ? v.quiz.round + ":" + v.quiz.step : null,
      kgKey: v.karten ? v.karten.round + ":" + v.karten.step : null,
      kgMyTurn: !!(v.karten && v.karten.mode === "stich" && v.karten.step === "play" && v.karten.turn === myId),
      qbKey: v.qb ? v.qb.idx + ":" + v.qb.step + ":" + v.qb.done : null,
      hlKey: v.hl ? v.hl.catNo + ":" + v.hl.pos + ":" + v.hl.step : null,
      wMine: !!(v.watten && ((v.watten.turn === myId) || (v.watten.step === "schlag" && v.watten.vorhand === myId) ||
        (v.watten.step === "trumpf" && v.watten.dealer === myId) || (v.watten.bid && v.watten.bid.by !== myId))),
      wStep: v.watten ? v.watten.step : null,
      xMine: !!(v.schnapsen && v.schnapsen.turn === myId),
      xStep: v.schnapsen ? v.schnapsen.step : null,
      // Watten/Schnapsen: Anzahl gelegter Karten in der Runde (neue Karte = Klatschen)
      laid: [v.watten, v.schnapsen].filter(Boolean).map((st) => st.roundNo + ":" + (st.seats.reduce((a, id) => a + st.tricks[id], 0) * st.seats.length + st.trick.length))[0] || null,
      zRes: v.phase === "playing" && v.card ? v.round + ":" + v.card.q + ":" + v.card.items.filter((it) => it.r && !it.r.pending).length : null,
      duFin: !!(v.duell && v.duell.step === "final"), fqFin: !!(v.frage && v.frage.step === "final"),
      fwLast: v.wand && v.wand.last ? v.wand.last.n : 0, fwFin: !!(v.wand && v.wand.step === "final"),
      fwCheck: v.wand && v.wand.step === "check" && v.wand.cur ? v.wand.round + ":" + v.wand.cur.k + "/" + v.wand.cur.r : null,
      fwMine: !!(v.wand && ((v.wand.step === "pick" && v.wand.chooser === myId) || (v.wand.step === "judge" && v.wand.cur && v.wand.cur.judges.includes(myId)))),
      lobbyIds: v.phase === "lobby" ? v.players.map((p) => p.id) : null,
    };
    if (prev) {
      const needsMe = (now.myTurn && !prev.myTurn) || (now.mustJudge && !prev.mustJudge) || (now.mustVote && !prev.mustVote);
      // Zehnkampf: gerade wurde ein Feld aufgedeckt (Pling/Bong) – „Du bist dran“ erst danach
      const zFresh = now.zRes && prev.zRes && now.zRes !== prev.zRes && now.zRes.split(":").slice(0, 2).join() === prev.zRes.split(":").slice(0, 2).join();
      if (needsMe) { if (zFresh) setTimeout(sfx.turn, 700); else sfx.turn(); if (navigator.vibrate) try { navigator.vibrate(120); } catch {} }
      if (now.geoKey && now.geoKey !== prev.geoKey) {
        if (v.geo.step === "guess") sfx.turn();
        if (v.geo.step === "final") { if (v.geo.winners.includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      if (now.qbKey && now.qbKey !== prev.qbKey) {
        if (v.qb.done || v.qb.step === "break") sfx.turn();
        if (v.qb.step === "final") { sfx.fanfare(); confettiGrand(); } // Siegerehrung: für alle ordentlich feiern
      }
      if (now.kgKey && now.kgKey !== prev.kgKey) {
        if (v.karten.step === "play" && v.karten.mode !== "stich") sfx.turn();
        if (v.karten.step === "bid") sfx.turn();
        if (v.karten.step === "reveal" && v.karten.result) {
          // Gewinn-/Verlust-Ton erst, wenn die entscheidende Karte fertig aufgedeckt ist
          const r = v.karten.result[myId];
          const win = r && (v.karten.mode === "stich" ? r.bid === r.got : r.points > 0), lose = r && (v.karten.mode === "stich" ? r.bid !== r.got : r.bust || r.outcome === "lose");
          if (win || lose) setTimeout(() => (win ? sfx.win() : sfx.lose()), G.kgOutcomeDelay);
        }
        if (v.karten.step === "final") { if ((v.karten.winners || []).includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      // Stichhaltig: kurzer Ton, wenn man selbst ausspielen muss
      if (now.kgMyTurn && !prev.kgMyTurn) sfx.turn();
      if (now.quizKey && now.quizKey !== prev.quizKey) {
        if (v.quiz.step === "ask") sfx.turn();
        if (v.quiz.step === "reveal" && v.quiz.result && v.quiz.result[myId] && v.quiz.result[myId].points > 0) sfx.win();
        if (v.quiz.step === "final") { if ((v.quiz.winners || []).includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      if (now.landKey && now.landKey !== prev.landKey) {
        if (v.land.step === "guess") sfx.turn();
        if (v.land.step === "reveal" && v.land.result && v.land.result[myId] && v.land.result[myId].ok) sfx.win();
        if (v.land.step === "final") { if (v.land.winners.includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      // gerade wurde eine Karte gelegt: „Du bist dran“ erst nach dem Klatschen
      const laidFresh = now.laid && prev.laid && now.laid !== prev.laid && now.laid.split(":")[0] === prev.laid.split(":")[0];
      const turnSoon = () => { const d = laidFresh ? 450 : 450 - (Date.now() - sfx.layAt); if (d > 0) setTimeout(sfx.turn, d); else sfx.turn(); };
      if (now.wMine && !prev.wMine) { turnSoon(); if (navigator.vibrate) try { navigator.vibrate(80); } catch {} }
      if (now.xMine && !prev.xMine) turnSoon();
      if (now.xStep === "final" && prev.xStep !== "final") { if ((v.schnapsen.winners || []).includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      if (now.wStep === "final" && prev.wStep !== "final") { if ((v.watten.winners || []).includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      // Listen-Duell / Erfinde die Frage: Sieg oder Niederlage (Zuschauer feiern nur mit)
      for (const [k, f] of [["duell", "duFin"], ["frage", "fqFin"]]) {
        if (!now[f] || prev[f]) continue;
        const st = v[k];
        if (st.seats.includes(myId)) { if (st.score[myId] >= st.target) sfx.win(); else sfx.lose(); }
        confetti();
      }
      // Fragewand: Auflösung für alle hörbar (Pling/Bong), „Du bist dran“ erst danach; am Ende Sieg/Niederlage
      if (v.wand) {
        const fresh = now.fwLast > prev.fwLast;
        if (fresh && !v.wand.last.checked) (v.wand.last.ok ? sfx.right : sfx.wrong)(); // nach „Weiter“ war das Bong schon
        if (now.fwCheck && now.fwCheck !== prev.fwCheck) sfx.wrong(); // nicht erkannt: Lösung erscheint
        if (now.fwMine && !prev.fwMine) setTimeout(sfx.turn, fresh ? 700 : 0);
        if (now.fwFin && !prev.fwFin) { setTimeout(() => (v.wand.winners.includes(myId) ? sfx.win() : v.wand.seats.includes(myId) && sfx.lose()), 900); confetti(); }
      }
      // Lobby: leises „Pling-plong“, wenn jemand Neues hereinkommt (nicht für den, der selbst gerade beitritt)
      if (now.lobbyIds && prev.lobbyIds && now.lobbyIds.some((id) => id !== myId && !prev.lobbyIds.includes(id))) sfx.join();
      if (now.hlKey && now.hlKey !== prev.hlKey) {
        if (v.hl.step === "reveal" && v.hl.result && myId in v.hl.result.ok) { const ok = v.hl.result.ok[myId]; setTimeout(() => (ok ? sfx.right() : sfx.wrong()), 900); } // wenn der Wert fertig hochgezählt ist
        if (v.hl.step === "final") { if (v.hl.winners.includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      if (now.wlKey && now.wlKey !== prev.wlKey) {
        if (v.wl.step === "final") confetti();
      }
      if (now.slfKey && now.slfKey !== prev.slfKey) {
        if (v.slf.step === "final") { if (v.slf.winners.includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      if (now.phase === "gameOver" && prev.phase !== "gameOver") {
        if (v.winners && v.winners.includes(myId)) { sfx.win(); confetti(); } else { sfx.lose(); confetti(); }
      }
    }
    prev = now;
    const attention = now.myTurn || now.mustJudge || now.mustVote;
    document.title = attention && document.hidden ? (now.myTurn ? "● Du bist dran! – " : "● Deine Entscheidung – ") + BASE_TITLE : BASE_TITLE;
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) document.title = BASE_TITLE; else if (view) reactToChanges(view); });

  const rulesHtml = `
    <details class="rules"><summary>Regeln: Zehnkampf</summary>
      <ul>
        <li>Jede Karte hat eine Frage und <b>10 Antworten</b>.</li>
        <li>Wer dran ist, wählt eine noch offene Antwort und beantwortet sie – oder <b>passt</b>.</li>
        <li>Richtig: +1 Punkt für diese Runde, dann ist der Nächste dran.</li>
        <li>Falsch: <b>alle Punkte dieser Runde sind weg</b> und du bist für die Runde raus.</li>
        <li>Kleine Tippfehler zählen. Erkennt das Spiel eine Antwort nicht, siehst du die Lösung: <b>„Weiter“</b> (zählt als falsch) oder <b>„⚖️ Einspruch“</b> – dann entscheiden die anderen.</li>
        <li>Wer passt, sichert seine Rundenpunkte. Die Runde endet, wenn alle raus sind, gepasst haben oder alle 10 Antworten aufgedeckt sind.</li>
        <li>Wer zuerst die Zielpunktzahl erreicht, gewinnt (bei Gleichstand: beide).</li>
      </ul>
    </details>`;

  let startActAt = 0; // letzter Klick auf Eröffnen/Beitreten/Fortsetzen
  function renderStart() {
    const saved = store.get("s10-host");
    const resumable = saved && saved.state && Date.now() - saved.ts < 24 * 3600e3;
    const guestSaved = store.get("s10-guest");
    const code = urlRoom || "";
    app.innerHTML = `
      <main class="screen start">
        <h1 class="logo">${LOGO}</h1>
        <p class="tag">${TILES.length} Spiele für gemütliche Runden – online gemeinsam spielen.</p>
        <div class="start-games" aria-label="Spiele">${TILES.map((g) => `<span class="gt-icon sm" style="--gc:${g.color}" title="${esc(g.name)}">${g.icon}</span>`).join("")}</div>
        <div class="panel">
          <label class="field"><span>Dein Name</span>
            <input id="name" maxlength="20" autocomplete="nickname" value="${esc(myName)}" placeholder="z. B. Josef"></label>
          ${code ? `
            <p class="invite">Du wurdest in die Spielstube <b>${esc(code)}</b> eingeladen.</p>
            <button id="joinUrl" class="btn primary big">Stube ${esc(code)} beitreten</button>
          ` : `
            <button id="create" class="btn primary big">Neue Spielstube eröffnen</button>
            <div class="divider"><span>oder beitreten</span></div>
            <div class="row">
              <input id="code" maxlength="5" placeholder="CODE" autocapitalize="characters" value="${esc(guestSaved ? guestSaved.code : "")}">
              <button id="join" class="btn">Beitreten</button>
            </div>`}
          ${resumable && !code ? `<button id="resume" class="btn ghost">Spielstube ${esc(saved.code)} fortsetzen</button>` : ""}
          <p class="err">${esc(errorMsg || status)}</p>
        </div>
        <details class="rules"><summary>Die Spiele</summary>
          <ul class="game-list">${TILES.map((g) => `<li style="--gc:${g.color}"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span><span><b>${esc(g.name)}</b> – ${esc(g.desc)}</span></li>`).join("")}</ul>
          <p class="muted small">Eine Spielstube eröffnen, Freunde per Link einladen, in der Lobby das Spiel wählen. Die genauen Regeln stehen dort beim jeweiligen Spiel.</p>
        </details>
        ${reportsHtml()}
        <p class="app-version">Version ${esc(ASSET_V)}</p>
      </main>`;
    bindReports(renderStart);
    // Felder erst beim Klick lesen: die Startseite wird beim Verbinden neu gezeichnet („Verbinde …“)
    const getName = () => {
      const nameIn = app.querySelector("#name"), n = nameIn ? nameIn.value.trim() : myName;
      if (!n) { errorMsg = "Bitte gib zuerst deinen Namen ein."; renderStart(); const f = app.querySelector("#name"); if (f) f.focus(); return null; }
      errorMsg = ""; myName = cleanName(n); store.set("s10-name", myName); return myName;
    };
    // Doppelklick nicht zweimal ausführen (sonst zwei Beitritte oder zwei Stuben)
    const once = (fn) => { if (Date.now() - startActAt < 1500) return; startActAt = Date.now(); fn(); };
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#create", () => { const n = getName(); if (n) once(() => hostCreate(n)); });
    on("#resume", () => { const n = getName(); if (n) once(() => hostResume(saved)); });
    on("#joinUrl", () => { const n = getName(); if (n) once(() => guestJoin(code, n, urlBroker ?? 0, urlBroker !== null)); });
    const joinCode = () => {
      const codeEl = app.querySelector("#code");
      if (!codeEl) return;
      const c = codeEl.value.trim().toUpperCase();
      if (!/^[A-Z]{5}$/.test(c)) { errorMsg = "Der Stuben-Code hat 5 Buchstaben."; return renderStart(); }
      const n = getName(); if (n) once(() => guestJoin(c, n, 0, false));
    };
    on("#join", joinCode);
    const codeIn = app.querySelector("#code");
    if (codeIn) codeIn.onkeydown = (e) => { if (e.key === "Enter") joinCode(); };
  }

  // Computer: Einstellungsspalte bleibt beim Scrollen stehen, wenn sie ganz auf den Bildschirm passt;
  // ist sie länger, scrollt sie normal mit und „Spiel starten“ klebt unten am Bildschirmrand
  function fitLobbySettings() {
    const col = app.querySelector(".lobby-host .lobby-settings, .lobby-guest .lobby-settings");
    if (!col) return;
    col.classList.toggle("fits", col.scrollHeight <= innerHeight - 24);
  }
  addEventListener("resize", () => fitLobbySettings());
  // Einheitliche Zeile „Noch X von Y … neu“ mit Knopf „Gespielte … vergessen“ (für alle Spiele gleich)
  // extra: kurzer Zusatz hinter dem Text (z. B. welche Pakete zusammengezählt sind)
  function freshHtml(fresh, total, unit, kind, extra) {
    const dat = /[ns]$/.test(unit) ? unit : unit + "n"; // „von 100 Begriffen“, „von 50 Ländern“, aber „von 300 Karten“
    const txt = (fresh >= total ? `Alle ${total} ${unit} sind neu` : `Noch <b>${fresh}</b> von ${total} ${dat} neu`) + (extra ? ` · ${extra}` : fresh >= total ? "." : "");
    return `<div class="fresh-row"><span class="muted small">${txt}</span>${kind && fresh < total
      ? `<button type="button" class="btn ghost sm" data-forget="${kind}" data-unit="${esc(unit)}" title="Gespielte ${esc(unit)} vergessen">Vergessen</button>` : ""}</div>`;
  }
  const FORGET = {
    zehn: () => { S.seen = []; store.set("s10-seen", []); },
    geo: () => { S.geoSeen = {}; store.set("s10-geo-seen", {}); },
    quiz: () => { S.quizSeen = {}; store.set("s10-quiz-seen", {}); },
    land: () => { S.landSeen = {}; store.set("s10-land-seen", {}); },
    duell: () => store.set("s10-du-seen", []),
    frage: () => store.set("s10-fq-seen", []),
    wand: () => store.set("s10-fw-seen", []),
  };
  // Einheitliche Anmerkung unter „Spiel starten“ bei Spielen ab 2 Spielern – nur wenn sie etwas erklärt
  function playerNoteHtml(n, onlyTwo) {
    if (n < 2) return `<p class="muted small">Mindestens zwei Spieler nötig – lade jemanden ein.</p>`;
    if (onlyTwo && n > 2) return `<p class="muted small">Es spielen die ersten beiden, die anderen schauen zu.</p>`;
    return "";
  }
  // Gäste am Handy: kompakte Lobby – oben eine Leiste (Code, Mitspieler, Kamera/Mikro/Einladen/Verlassen), dann groß das
  // gewählte Spiel; Einstellungen, Regeln und die Spielübersicht zum Wünschen zum Aufklappen. Das Organisatorische macht der Gastgeber.
  const compactGuest = () => !isHost && innerWidth <= 640;
  const gcOpen = { set: false, rules: false, more: false };
  let gcLast = null;
  addEventListener("resize", () => { const c = compactGuest(); if (view && view.phase === "lobby" && gcLast !== null && c !== gcLast) renderLobby(); });
  function compactGuestLobbyHtml() {
    const host = view.players.find((p) => p.id === view.hostId);
    const chips = view.players.map((p, i) => `<span class="gc-chip ${p.connected ? "" : "off"} ${p.paused ? "paused" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><i></i>${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}${p.id === view.hostId ? " 👑" : ""}${p.paused ? " ⏸" : ""}</span>`).join("");
    const meP = view.players.find((p) => p.id === myId);
    const det = (key, label, body) => body ? `<details class="gc-det" data-gc="${key}" ${gcOpen[key] ? "open" : ""}><summary>${label}</summary><div class="gc-body">${body}</div></details>` : "";
    return `
      <main class="screen lobby lobby-guest gc">
        <div class="panel gc-bar">
          <div class="gc-top"><button type="button" class="gc-code" id="copycode" title="Code kopieren" aria-label="Stuben-Code ${esc(view.code)} – zum Kopieren tippen">${esc(view.code)}</button>
            <span class="gc-btns">${camOK ? `<button class="btn ghost sm ${camOn ? "cam-on" : ""}" data-cam title="${camOn ? "Kamera ausschalten" : "Kamera einschalten"}" aria-label="Kamera">📷</button>
              <button class="btn ghost sm ${micOn ? "cam-on" : ""}" data-mic title="${micOn ? "Mikrofon ausschalten" : "Mikrofon einschalten"}" aria-label="Mikrofon">🎤</button>` : ""}
              <input id="link" type="hidden" value="${esc(shareLink())}"><button id="lobbyInvite" class="btn ghost sm" title="Mitspieler einladen" aria-label="Mitspieler einladen">🔗</button>
              <button id="leave" class="btn ghost sm" title="Stube verlassen" aria-label="Verlassen">✕</button></span></div>
          <div class="gc-chips">${chips}</div>
          ${meP ? `<div class="gc-pause">${meP.paused ? `<span class="muted small">Du pausierst – du schaust bei den Spielen nur zu.</span>` : ""}${pauseBtnHtml(meP, true)}</div>` : ""}
          ${status ? `<p class="err">${esc(status)}</p>` : ""}
        </div>
        <section class="panel gc-now">
          ${gameBannerHtml()}
          <p class="gc-wait">⏳ Warte, bis ${host ? `<b>${esc(host.name)}</b>` : "der Gastgeber"} das Spiel startet …</p>
          ${det("set", "Einstellungen ansehen", guestSettingsHtml())}
          ${det("rules", "So geht's", rulesViewHtml(view.game))}
        </section>
        ${det("more", guestInfo ? "Spiele ansehen & wünschen" : "Alle Spiele ansehen & wünschen", guestGamesHtml())}
        ${reportsHtml()}
      </main>`;
  }
  // Pausieren: eigener Knopf für jeden, beim Gastgeber an jeder Zeile
  function pauseBtnHtml(p, big) {
    if (p.id !== myId && !isHost) return "";
    const self = p.id === myId, label = p.paused ? (self ? "▶ Mitspielen" : "▶") : (self ? "⏸ Pause" : "⏸");
    const title = p.paused ? `${self ? "Wieder" : esc(p.name) + " wieder"} mitspielen lassen` : `${self ? "Pausieren" : esc(p.name) + " pausieren"}: bleibt in der Stube, spielt aber bei den nächsten Spielen nicht mit`;
    return `<button type="button" class="pause-btn ${big ? "btn ghost sm" : ""} ${p.paused ? "on" : ""}" data-pause="${esc(p.id)}" data-on="${p.paused ? "" : "1"}" title="${title}" aria-label="${title}">${label}</button>`;
  }
  function renderLobby() {
    const isFile = location.protocol === "file:";
    const settings = !isHost ? "" : `
          ${setHeadHtml()}
          ${isMode(chosenGame) ? modeSwitchHtml() : ""}
          ${chosenGame === "slf" ? slfSettingsHtml() : ""}
          ${chosenGame === "wl" ? wlSettingsHtml() : ""}
          ${chosenGame === "alm" ? almSettingsHtml() : ""}
          ${chosenGame === "jagd" ? jagdSettingsHtml() : ""}
          ${chosenGame === "geo" || chosenGame === "oben" ? geoSettingsHtml(chosenGame === "oben") : ""}
          ${chosenGame === "land" ? landSettingsHtml() : ""}
          ${chosenGame === "querbeet" ? qbSettingsHtml() : ""}
          ${QZ.MODES[chosenGame] ? quizSettingsHtml(chosenGame) : ""}
          ${KG.MODES[chosenGame] ? kgSettingsHtml(chosenGame) : ""}
          ${chosenGame === "hl" ? hlSettingsHtml() : ""}
          ${chosenGame === "duell" ? duSettingsHtml() : ""}
          ${chosenGame === "frage" ? fqSettingsHtml() : ""}
          ${chosenGame === "wand" ? fwSettingsHtml() : ""}
          ${chosenGame === "watten" ? wattenSettingsHtml() : ""}
          ${chosenGame === "schnapsen" ? schSettingsHtml() : ""}
          ${chosenGame === "zehn" ? `
            ${setPickerHtml()}
            <label class="field"><span>Spielen bis</span>
              <select id="target">${[10, 15, 20, 30, 40].map((t) => `<option value="${t}" ${t === (chosenTarget || view.target || 30) ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
            <button id="start" class="btn primary big" ${playing().length < 1 || !currentSets().length ? "disabled" : ""}>Spiel starten</button>
            
          ` : ""}`;
    // Am Computer: Gastgeber in drei Spalten (Stube & Spieler · Spiel wählen · Einstellungen), Gäste in zwei
    // Scroll-Stellung der Spalten merken: die Lobby wird bei jeder Änderung neu gezeichnet (z. B. nach einem Wunsch)
    const keepScroll = [...app.querySelectorAll(".lobby .lobby-col")].map((c) => c.scrollTop), keepY = scrollY;
    gcLast = compactGuest();
    if (gcLast) {
      if (guestInfo) gcOpen.more = true; // Erklärung eines Spiels offen → Bereich aufgeklappt lassen
      app.innerHTML = compactGuestLobbyHtml();
      app.querySelectorAll("[data-gc]").forEach((d) => d.addEventListener("toggle", () => { gcOpen[d.dataset.gc] = d.open; }));
    } else app.innerHTML = `
      <main class="screen lobby ${isHost ? "lobby-host" : "lobby-guest"}">
        <h1 class="logo small">${LOGO}</h1>
        <div class="lobby-cols">
          <div class="panel lobby-col">
            <button type="button" class="code code-copy" id="copycode" title="Code kopieren" aria-label="Stuben-Code ${esc(view.code)} – zum Kopieren tippen">${esc(view.code)}</button>
            ${isFile ? `<p class="muted small">Schick deinen Mitspielern diesen Code. Sie öffnen das Spiel bei sich und geben ihn unter „Beitreten“ ein.</p>`
              : `<input id="link" type="hidden" value="${esc(shareLink())}"><button id="lobbyInvite" class="btn">🔗 Mitspieler einladen</button>`}
            <h3>Spieler</h3>
            <ul class="plist">${view.players.map((p, i) => `<li class="${p.paused ? "paused" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><span class="dot pc ${p.connected ? "on" : ""}" title="Deine Farbe im Spiel"></span><span class="pl-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
              <span class="pl-right">${p.id === view.hostId ? `<span class="host-tag">Gastgeber</span>` : ""}${p.paused && p.id !== myId ? `<span class="pause-tag">⏸ pausiert</span>` : ""}${pauseBtnHtml(p)}${isHost && p.id !== myId ? `<button type="button" class="kick" data-kick="${esc(p.id)}" title="${esc(p.name)} aus der Stube entfernen" aria-label="${esc(p.name)} entfernen">✕</button>` : ""}</span></li>`).join("")}</ul>
            ${view.players.length < 2 ? `<p class="muted small waiting">Warte auf Mitspieler …</p>` : ""}
            <p class="err">${esc(status)}</p>
            <div class="lobby-tools ${camOK ? "" : "nocam"}">${camOK ? `<button class="btn ghost ${camOn ? "cam-on" : ""}" data-cam title="${camOn ? "Kamera ausschalten" : "Kamera einschalten"}">📷 Kamera${camOn ? " ✓" : ""}</button>
              <button class="btn ghost ${micOn ? "cam-on" : ""}" data-mic title="${micOn ? "Mikrofon ausschalten" : "Mikrofon einschalten"}">🎤 Mikro${micOn ? " ✓" : ""}</button>` : ""}
              <button id="leave" class="btn ghost">${isHost ? "Stube schließen" : "Verlassen"}</button></div>
            ${camOK ? `<div id="camslot"></div>` : ""}
            ${reportsHtml()}
          </div>
          ${isHost ? `<div class="lobby-col lobby-games"><div class="panel">${gamePickerHtml()}</div></div>
          <div class="lobby-col lobby-settings"><div class="panel">${settings}</div></div>`
          : `<div class="lobby-col lobby-games"><div class="panel">${guestGamesHtml()}</div></div>
          <div class="lobby-col lobby-settings"><div class="panel">${gameBannerHtml()}${guestSettingsHtml()}
              <p class="muted">Warte, bis der Gastgeber das Spiel startet …</p></div></div>`}
        </div>
      </main>`;
    app.querySelectorAll(".lobby .lobby-col").forEach((c, i) => { if (keepScroll[i]) c.scrollTop = keepScroll[i]; });
    if (keepY && scrollY !== keepY) scrollTo(0, keepY);
    fitLobbySettings();
    qbStartBar();
    bindReports(renderLobby);
    bindGamePicker();
    app.querySelectorAll("[data-pause]").forEach((b) => b.onclick = () => send({ type: "pause", id: b.dataset.pause, on: !!b.dataset.on }));
    app.querySelectorAll("[data-kick]").forEach((b) => b.onclick = async () => {
      const p = view.players.find((x) => x.id === b.dataset.kick);
      if (!p || !(await askConfirm(`${p.name} entfernen?`, "Die Person fliegt aus der Stube und kann mit diesem Gerät nicht wieder beitreten, solange die Stube offen ist.", "Entfernen", "Abbrechen", true))) return;
      send({ type: "kick", id: p.id });
    });
    app.querySelectorAll("[data-info]").forEach((b) => b.onclick = () => {
      guestInfo = b.dataset.info; guestInfoMode = null; renderLobby();
      const f = app.querySelector(".lobby-games"); // am Handy: Erklärung beginnt evtl. oberhalb des Sichtbaren
      if (f && f.getBoundingClientRect().top < 0) f.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    app.querySelectorAll("[data-infomode]").forEach((b) => b.onclick = () => { guestInfoMode = b.dataset.infomode; renderLobby(); });
    app.querySelectorAll("[data-infoback]").forEach((b) => b.onclick = () => { guestInfo = null; renderLobby(); });
    app.querySelectorAll("[data-wish]").forEach((b) => b.onclick = () => {
      if (b.dataset.wish === groupOf(view.game)) return toast("Das wird gerade gespielt.", "info");
      send({ type: "wish", game: b.dataset.wish });
    });
    const li = app.querySelector("#lobbyInvite");
    if (li) li.onclick = invite;
    const cc = app.querySelector("#copycode");
    if (cc) cc.onclick = () => (navigator.clipboard ? navigator.clipboard.writeText(view.code) : Promise.reject()).then(
      () => toast("Code kopiert ✓", "ok"), () => toast("Code: " + view.code, "info"));
    const start = app.querySelector("#start");
    const tsel = app.querySelector("#target");
    if (tsel) tsel.onchange = () => { chosenTarget = Number(tsel.value); store.set("s10-target", chosenTarget); publish(); };
    app.querySelectorAll("[data-forget]").forEach((b) => b.onclick = async () => {
      const unit = b.dataset.unit, fn = FORGET[b.dataset.forget];
      if (!fn || !(await askConfirm(`Gespielte ${unit} vergessen?`, `Danach können alle ${unit} wieder vorkommen.`, "Vergessen"))) return;
      fn(); publish(); renderLobby(); toast(`Alle ${unit} sind wieder neu.`, "ok");
    });
    app.querySelectorAll('.setopt input[type="checkbox"]:not([data-qbgame]):not(#slf-surprise)').forEach((cb) => cb.onchange = () => {
      chosenSets = [...app.querySelectorAll('.setopt input[type="checkbox"]:not([data-qbgame]):not(#slf-surprise):checked')].map((x) => x.value);
      store.set("s10-sets", chosenSets); publish();
    });
    const all = app.querySelector("#setall");
    if (all) all.onclick = () => { chosenSets = L.SET_KEYS.slice(); store.set("s10-sets", chosenSets); publish(); };
    // alle angehakt: „Keine auswählen“ nimmt alle Haken weg (dann gezielt einzelne Sets anhaken)
    const none = app.querySelector("#setnone");
    if (none) none.onclick = () => { chosenSets = []; store.set("s10-sets", chosenSets); publish(); };
    if (start) start.onclick = () => {
      if (chosenGame === "slf") return send({ type: "start", game: "slf", opts: slfOpts });
      if (chosenGame === "wl") return send({ type: "start", game: "wl", opts: wlOpts });
      if (chosenGame === "alm") return send({ type: "start", game: "alm", opts: almOpts });
      if (chosenGame === "jagd") return send({ type: "start", game: "jagd", opts: jagdOpts });
      if (chosenGame === "geo") return send({ type: "start", game: "geo", opts: { ...geoOpts, mode: "karte" } });
      if (chosenGame === "hl") return send({ type: "start", game: "hl", opts: { length: hlOpts.length, level: hlOpts.level, ...(hlOpts.theme === "allgemein" ? { not: HL_ST } : {}) } });
      if (chosenGame === "land") return send({ type: "start", game: "land", opts: landOpts });
      if (chosenGame === "querbeet") return send({ type: "start", game: "querbeet", opts: qbOpts });
      if (QZ.MODES[chosenGame]) return send({ type: "start", game: chosenGame, opts: quizOpts });
      if (KG.MODES[chosenGame]) return send({ type: "start", game: chosenGame, opts: chosenGame === "bus" ? { rounds: kgOpts.busRounds } : chosenGame === "stich" ? { rounds: kgOpts.stichRounds } : kgOpts });
      if (chosenGame === "duell") return send({ type: "start", game: "duell", opts: duOpts });
      if (chosenGame === "frage") return send({ type: "start", game: "frage", opts: fqOpts });
      if (chosenGame === "wand") return send({ type: "start", game: "wand", opts: { cats: fwOpts.cats } });
      if (chosenGame === "watten") return send({ type: "start", game: "watten", opts: wattenOpts });
      if (chosenGame === "schnapsen") return send({ type: "start", game: "schnapsen", opts: schOpts });
      if (chosenGame === "oben") return send({ type: "start", game: "geo", opts: { ...geoOpts, mode: "oben" } });
      if (currentSets().length) send({ type: "start", target: Number(tsel.value), set: currentSets() });
    };
    app.querySelector("#leave").onclick = leave;
  }

  const fmt = (card, a) => L.fmt(card, a);
  // Anzahl sichtbarer Zeichen (eine Flagge = 1, obwohl sie aus zwei Codepunkten besteht)
  const graphemes = (t) => (window.Intl && Intl.Segmenter ? [...new Intl.Segmenter("de", { granularity: "grapheme" }).segment(t)].length : [...t].length);
  const PLAYER_COLORS = ["#ffc83d", "#4fc3f7", "#f472b6", "#a3e635", "#fb923c", "#c084fc", "#2dd4bf", "#f87171"];
  const statusLabel = { active: "spielt", passed: "gepasst", out: "raus" };

  // Verlauf kompakt: nur echte Spielzüge, die letzten 3 sichtbar, der Rest zum Aufklappen
  function zehnLogHtml(v) {
    const moves = v.log.filter((l) => !/ist beigetreten|hat den Raum verlassen|hat die Stube verlassen|beginnt\.$|^Runde \d+ beendet\.$/.test(l));
    if (!moves.length) return "";
    const last = moves.slice(0, 3), older = moves.slice(3); // neueste zuerst
    return `<section class="log compact"><h3>Letzte Züge</h3><ul>${last.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
      ${older.length ? `<details><summary>Ganzer Verlauf (${moves.length})</summary><ul>${older.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></details>` : ""}</section>`;
  }
  // Zehnkampf: Felder drehen sich beim Aufdecken um (richtig: grüner Lichtring, falsch: rotes Rucken; am Kartenende nacheinander).
  // Zeitbasiert je Feld, damit Neuzeichnen die Animation nur fortsetzt; beim ersten Anzeigen (Neuladen) ist alles alt.
  const slotBorn = new Map();
  let slotSeeded = false;
  function slotAge(key, pos, batch, cls) {
    if (!slotBorn.has(key)) {
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      slotBorn.set(key, !slotSeeded || reduce ? null : { t: Date.now(), k: batch.n++ });
      if (slotBorn.get(key) && batch.flip) { const k = slotBorn.get(key).k; setTimeout(() => window.S10Klang && window.S10Klang.play(sfx, (c, t) => window.S10Klang.noise(c, t, 0.05, { type: "bandpass", freq: 1800, q: 1.2, peak: 0.08 })), k * 150); }
      // frisch beantwortet: „Pling“ für richtig, „Bong“ für falsch (auch mit „Bewegung reduzieren“, aber nicht nach Neuladen)
      else if (slotSeeded && cls === "ok") sfx.right();
      else if (slotSeeded && cls === "bad") sfx.wrong();
    }
    const b = slotBorn.get(key);
    return b ? { e: Date.now() - b.t, k: b.k } : null;
  }
  function renderGame() {
    const v = view, card = v.card;
    const cur = v.players[v.turn];
    const me = v.players.find((p) => p.id === myId);
    const pend = v.phase === "playing" ? v.pending : null;
    const myTurn = v.phase === "playing" && cur && cur.id === myId && !pend && !v.undoReq;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;

    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const chips = v.players.map((p, i) => {
      const turn = v.phase === "playing" && i === v.turn;
      const res = v.roundResult && v.roundResult.find((r) => r.id === p.id);
      const pct = v.qb ? (p.score / 10) * 100 : Math.min(100, (p.score / v.target) * 100); // Querbeet: nur eine Karte
      // Rundenpunkte nur zeigen, wenn es welche gibt: „+3 offen“ während der Runde, „+3“ nach der Runde
      const rp = v.phase === "playing" ? (p.status !== "out" && p.roundPts ? `+${p.roundPts} offen` : "") : res && res.gained ? `+${res.gained}` : "";
      const badge = v.phase === "playing" ? (turn ? "am Zug" : p.paused ? "pausiert" : p.waiting ? "ab nächster Runde" : statusLabel[p.status]) : "";
      return `<div class="chip ${turn ? "turn" : ""} st-${p.status} ${p.waiting ? "waiting" : ""} ${p.paused ? "paused" : ""} ${v.winners && v.winners.includes(p.id) ? "winner" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}">
        <div class="chip-l1"><span class="pdot ${p.connected ? "" : "off"}" title="${p.connected ? "verbunden" : "getrennt"}"></span>
          <span class="chip-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
          <span class="chip-score"><b>${p.score}</b>${v.qb ? "" : `<small>/${v.target}</small>`}</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="chip-l2"><span class="rpts ${res && res.gained ? "pos" : ""}">${rp}</span>
          ${badge ? `<span class="badge">${badge}</span>` : ""}</div>
      </div>`;
    }).join("");

    // Lichterkranz der Show-Bühne (28 ruhige Lämpchen am Rand)
    const ZK_BULBS = Array.from({ length: 28 }, (_, k) => { const a = k / 28 * 2 * Math.PI; return `<i style="left:${(50 + 50 * Math.cos(a)).toFixed(2)}%;top:${(50 + 50 * Math.sin(a)).toFixed(2)}%"></i>`; }).join("");
    const cardKey = v.code + ":" + v.round + ":" + card.q, batchOk = { n: 0 }, batchShown = { n: 0, flip: true };
    const slots = card.items.map((it, pos) => {
      const ang = (-90 + pos * 36) * Math.PI / 180;
      const x = 50 + 40.5 * Math.cos(ang), y = 50 + 40.5 * Math.sin(ang);
      const r = it.r;
      const cls = r ? (r.pending ? "pending" : r.ok === true ? "ok" : r.ok === false ? "bad" : "shown") : myTurn ? "open" : "";
      const ans = r ? r.pending ? `<span class="slot-a">„${esc(r.given)}“ ?</span>` : (r.ok === false && card.type !== "tf"
        ? `<span class="slot-a"><s>${esc(fmt(card, r.given))}</s> ${esc(fmt(card, r.a))}</span>`
        : `<span class="slot-a">${esc(fmt(card, r.a))}</span>`) : "";
      const by = r && r.by ? `<span class="slot-by"><i class="pdot" style="--pc:${colorOf(r.by)}"></i>${esc(nameOf(r.by))}</span>` : "";
      const pc = r && r.by ? `;--pc:${colorOf(r.by)}` : "";
      // aufgedeckt (nicht „wird geprüft“): einmal umdrehen – die am Kartenende aufgedeckten nacheinander
      let fx = "", fxStyle = "";
      if (r && !r.pending) {
        const a = slotAge(cardKey + ":" + pos + ":" + cls, pos, cls === "shown" ? batchShown : batchOk, cls);
        if (a) { const d = (cls === "shown" ? a.k * 150 : 0) - a.e;
          if (d > -1100) { fx = cls === "bad" ? "fx-shake" : "fx-flip"; fxStyle = `;animation-delay:${d}ms${cls === "bad" ? `, ${d + 350}ms` : cls === "ok" ? `, ${d}ms` : ""}`; } }
      }
      return `<button class="slot ${cls} ${fx} ${r && r.by ? "has-by" : ""} ${selected === pos ? "sel" : ""}" style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%${pc}${fxStyle}" data-pos="${pos}" ${myTurn && !r ? "" : "disabled"}>
        <span class="slot-t">${esc(it.t)}</span>${ans}${by}</button>`;
    }).join("");
    slotSeeded = true;

    let banner;
    if (pend) {
      const item = card.items[pend.pos];
      const iJudge = pend.judges.includes(myId);
      const self = pend.by === myId;
      banner = pend.check && !iJudge && self ? "" : pend.check && !iJudge ? `<div class="banner judge">
          <div class="judge-q">„${esc(item.t)}“</div>
          ${checkHtml({ given: pend.given, solution: fmt(card, item.r.a), mine: false, who: nameOf(pend.by), color: colorOf(pend.by), zero: false })}
        </div>` : `<div class="banner judge">
          ${pend.appeal ? `<div class="judge-appeal">⚖️ ${self ? "Dein Einspruch" : `Einspruch von ${esc(nameOf(pend.by))}`} – zählt die Antwort doch?</div>` : ""}
          <div class="judge-q">${self ? "Du sagst" : `<b>${esc(nameOf(pend.by))}</b> sagt`} bei „${esc(item.t)}“:</div>
          <div class="judge-given">„${esc(pend.given)}“</div>
          <div class="judge-sol">Lösung laut Karte: <b>${esc(fmt(card, item.r.a))}</b></div>
          ${iJudge
            ? `<div class="judge-ask">${self ? "Niemand sonst ist online – entscheide ehrlich:" : "Zählt das?"}</div>
               <div class="banner-actions"><button id="acc" class="btn opt yes">✓ Zählt</button><button id="rej" class="btn opt no">✗ Zählt nicht</button></div>`
            : `<div class="muted">${self ? "Warte, ob dein Mitspieler die Antwort gelten lässt …" : "Die Mitspieler entscheiden …"}</div>`}
        </div>`;
    } else if (v.phase === "playing") {
      banner = myTurn
        ? `<button id="pass" class="btn pass-btn">${me.roundPts ? `✋ Passen und ${me.roundPts} Punkt${me.roundPts > 1 ? "e" : ""} sichern` : "✋ Passen"}</button>`
        : isHost && !cur.connected ? `<div class="banner row"><div class="banner-text"><b>${esc(cur.name)}</b> ist getrennt.</div><button id="skip" class="btn ghost sm">Überspringen</button></div>` : "";
    } else if (v.phase === "roundEnd" && v.roundResult && v.roundResult.find((r) => r.id === myId && r.how !== "pause")) {
      // Wertungskarte: was hast du in dieser Runde gesichert oder verloren?
      const r = v.roundResult.find((x) => x.id === myId), g = r.gained;
      const plq = r.how === "wrong" ? "✗" : g > 0 ? "+" + g : "0";
      const h = r.how === "wrong" ? (r.lost ? `Raus – ${r.lost} ${r.lost === 1 ? "Punkt" : "Punkte"} weg` : "Raus in dieser Runde") : g > 0 ? `${g} ${g === 1 ? "Punkt" : "Punkte"} gesichert!` : "Diesmal nichts geholt";
      const best = v.roundResult.filter((x) => x.id !== myId && x.gained > 0).sort((a, b) => b.gained - a.gained)[0];
      const p = r.how === "wrong" ? `<span class="du-q">„${esc(r.item)}“</span> war falsch.${r.lost ? ` Deine ${r.lost} offenen Punkte sind verloren.` : ""}`
        : g > 0 ? (r.how === "passed" ? "Du hast rechtzeitig gepasst." : "Alle Felder sind aufgedeckt – deine Punkte zählen.")
        : best ? `${esc(nameOf(best.id))} hat ${best.gained} ${best.gained === 1 ? "Punkt" : "Punkte"} gesichert.` : "Niemand hat in dieser Runde gepunktet.";
      banner = `<div class="du-score zk-score ${r.how === "wrong" ? "lose" : g > 0 ? "" : "zero"}" style="--pc:${g > 0 ? colorOf(myId) : "#8a7fb8"}"><span class="du-plq">${plq}</span>
        <h3>${h}</h3><p>${p}</p>
        <div class="du-score-nb">${nextBtnsHtml({ attr: 'id="next"', hostAttr: 'id="next-now"', label: "Nächste Runde", ready: !!(v.ready && v.ready[myId]), waiting: waitingNames(v, v.ready) })}<span class="du-stand">Gesamt ${me.score} / ${v.target}</span></div></div>`;
    } else if (v.phase === "roundEnd") {
      banner = `<div class="banner end row"><div class="banner-text"><b>Runde ${v.round} vorbei.</b> Alle Antworten sind aufgedeckt.</div>
        <div class="banner-actions">${nextBtnsHtml({ attr: 'id="next"', hostAttr: 'id="next-now"', label: "Nächste Runde", ready: !!(v.ready && v.ready[myId]), waiting: waitingNames(v, v.ready) })}</div></div>`;
    } else {
      const w = v.players.filter((p) => v.winners.includes(p.id));
      const iWon = v.winners.includes(myId);
      banner = `<div class="banner win"><div class="trophy">🏆</div><b>${w.map((p) => esc(p.name)).join(" & ")} ${w.length > 1 ? "gewinnen" : "gewinnt"}!</b>
        ${iWon ? "Glückwunsch!" : "Revanche?"}
        <div class="banner-actions"><button id="restart" class="btn primary">Nochmal spielen</button>
        ${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>`;
    }

    app.innerHTML = `
      <main class="screen game">
        <header class="top topbar">
          ${headBrandHtml("zehn")}
          <div class="meta">${setLabel(v.cardSet)}${v.qb ? "Meisterschafts-Etappe · 1 Karte" : `Runde ${v.round} · bis ${v.target}`}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <div class="game-grid">
          <section class="players">${chips}</section>
          <section class="action">${banner}${undoHtml(v, nameOf)}</section>
          <section class="board">
            <div class="ring ${myTurn && v.phase === "playing" ? "myturn" : ""} ${card.emoji ? "emo" : ""} ${card.emoji && card.items.every((it) => graphemes(it.t) === 1) ? "emo-solo" : ""}">
              <div class="zk-bulbs">${ZK_BULBS}</div>
              <div class="center">
                ${myTurn && v.phase === "playing" ? `<div class="zturn">Du bist dran!</div>` : ""}
                <div class="qtype">${({ tf: "Finde die zutreffenden", num: "Zahl eintippen", rank: "Rang 1–10", decade: "Jahrzehnt", estimate: new Set(card.items.map((x) => x.tol)).size > 1 ? "Schätzen · Toleranz je nach Begriff" : `Schätzen · ±${Math.round((card.tol || 0.1) * 100)} % zählt` })[card.type] || "Antwort eintippen"}</div>
                <div class="q">${esc(card.q)}</div>
                ${card.hint ? `<div class="hint">${esc(card.hint)}</div>` : ""}
                <div class="progress">${card.items.filter((it) => it.r && !it.r.pending && it.r.by).length} von 10 aufgedeckt${SET_NAMES[card.set] ? ` · <span class="zset">Set ${esc(SET_NAMES[card.set])}</span>` : ""}</div>
              </div>
              ${slots}
            </div>
          </section>
          <div class="card-tools"><button id="report" class="btn ghost sm">⚑ Karte melden</button></div>
          ${zehnLogHtml(v)}
        </div>
      </main>`;

    app.querySelectorAll(".slot").forEach((b) => b.onclick = () => { selected = Number(b.dataset.pos); render(); });
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#pass", () => { selected = null; send({ type: "pass" }); });
    on("#skip", () => send({ type: "skip" }));
    on("#acc", () => send({ type: "judge", accept: true }));
    on("#rej", () => send({ type: "judge", accept: false }));
    on("#next", () => send({ type: "next" }));
    on("#next-now", () => send({ type: "next", now: true }));
    on("#restart", () => send({ type: "restart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    on("#leave", leave);
    on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#report", () => { reportOpen = true; renderReport(); });
    on("#uback", () => send({ type: "undoReq", kind: "undo" }));
    on("#uflip", () => send({ type: "undoReq", kind: "flip" }));
    on("#uyes", () => send({ type: "undoVote", accept: true }));
    on("#uno", () => send({ type: "undoVote", accept: false }));
  }

  function undoHtml(v, nameOf) {
    if (v.undoReq) {
      const req = v.undoReq, iApprove = req.approvers.includes(myId);
      return `<div class="banner judge">
        <div><b>${esc(nameOf(req.by))}</b> erhebt Einspruch: <b>${req.kind === "flip" ? "Wertung umdrehen" : "Zug zurücknehmen"}</b></div>
        <div class="judge-sol">„${esc(v.undo ? v.undo.text : "")}“</div>
        ${iApprove ? `<div class="judge-ask">Einverstanden?</div>
          <div class="banner-actions"><button id="uyes" class="btn opt yes">✓ Ja</button><button id="uno" class="btn opt no">✗ Nein</button></div>`
          : `<div class="muted">Warte auf Zustimmung …</div>`}</div>`;
    }
    if (!v.undo) return "";
    return `<div class="undo-bar"><span class="small">Einspruch zum letzten Zug?</span><span class="undo-actions">
      ${v.undo.canFlip ? `<button id="uflip" class="btn ghost sm" title="richtig ↔ falsch">⇄ Wertung umdrehen</button>` : ""}
      <button id="uback" class="btn ghost sm" title="z. B. bei Fehlklick">↶ Zug zurücknehmen</button></span></div>`;
  }

  // ---------- Karten melden ----------
  let reportOpen = false;
  // Gastgeber am Handy: feste Leiste unten mit gewähltem Spiel und „Spiel starten“ (tippt den echten Startknopf an)
  const startBarEl = document.createElement("div");
  startBarEl.id = "startbar"; document.body.appendChild(startBarEl);
  startBarEl.addEventListener("click", (e) => {
    if (e.target.closest("[data-gostart]")) { const b = app.querySelector("#start"); if (b && !b.disabled) b.click(); }
    if (e.target.closest("[data-goset]")) { const s = app.querySelector(".lobby-settings"); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  function qbStartBar() {
    const on = isHost && view && view.phase === "lobby";
    document.body.classList.toggle("has-startbar", !!on);
    if (!on) { startBarEl.innerHTML = ""; return; }
    const g = GAMES.find((x) => x.key === chosenGame) || GAMES[0], b = app.querySelector("#start");
    startBarEl.innerHTML = `<button type="button" class="sb-game" data-goset style="--gc:${g.color}" title="Zu den Einstellungen"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span>
        <span><b>${esc(g.name)}</b><small>Einstellungen ›</small></span></button>
      <button type="button" class="btn primary" data-gostart ${!b || b.disabled ? "disabled" : ""}>${b ? esc(b.textContent.trim()) : "Spiel starten"}</button>`;
  }
  const SET_NAMES = { standard: "Standard", suedtirol: "Südtirol", wirtschaft: "Wirtschaft", emoji: "Emoji & Flaggen", winter: "Weihnachten & Winter", film: "Film & Serien", kindheit: "Kindheit der 2000er", mixed: "Gemischt" };

  // ---------- Spielauswahl & Einstellungen ----------
  // Regeltext eines Spiels (als aufklappbarer Kasten) bzw. nur der Inhalt (für die Regel-Ansicht des Gastgebers)
  function rulesFor(key) {
    return ({ alm: almRulesHtml, jagd: jagdRulesHtml, slf: slfRulesHtml, wl: wlRulesHtml, geo: geoRulesHtml, oben: obenRulesHtml, land: landRulesHtml, querbeet: qbRulesHtml, hl: hlRulesHtml,
      duell: duRulesHtml, frage: fqRulesHtml, wand: fwRulesHtml, watten: wattenRulesHtml, schnapsen: schRulesHtml, schaetzen: schaetzenRulesHtml, hinweis: hinweisRulesHtml, umriss: umrissRulesHtml, siebzehn: siebzehnRulesHtml, stich: stichRulesHtml, bus: busRulesHtml })[key] || rulesHtml;
  }
  const rulesBody = (key) => rulesFor(key).replace(/^\s*<details[^>]*>\s*<summary>[\s\S]*?<\/summary>/, "").replace(/<\/details>\s*$/, "");
  let rulesOpen = false; // Gastgeber: Spielauswahl oder „So geht's“ des gewählten Spiels
  // Kopf der Spielfläche (Gastgeber und Gäste): Beschriftung links, „So geht's: …“ rechts; offen = Regeln statt Kacheln
  function pickHeadHtml(label, key) {
    const cur = GAMES.find((g) => g.key === key) || GAMES[0];
    return `<div class="pick-head"><span>${rulesOpen ? "So geht's" : label}</span>
      ${rulesOpen ? `<button type="button" id="rulesToggle" class="linkbtn" style="--gc:${cur.color}">‹ Zurück zur Spielauswahl</button>` : ""}</div>`;
  }
  // Kopf der Einstellungen beim Gastgeber: gewähltes Spiel + „So geht's“
  function setHeadHtml() {
    const tile = GAMES.find((g) => g.key === groupOf(chosenGame)) || GAMES[0];
    return `<div class="set-head" style="--gc:${tile.color}"><span class="gt-icon" aria-hidden="true">${tile.icon}</span>
      <div class="set-head-txt"><span class="game-label">Gewählt</span><b>${esc(tile.name)}</b></div>
      <button type="button" class="linkbtn" data-rules>${rulesOpen ? "Erklärung offen" : "So geht's ›"}</button></div>`;
  }
  function rulesViewHtml(key) {
    const cur = GAMES.find((g) => g.key === key) || GAMES[0];
    return `<div class="rules-view" style="--gc:${cur.color}">
        <div class="rv-title"><span class="gt-icon" aria-hidden="true">${cur.icon}</span><div><b>${esc(cur.name)}</b><div class="muted small">${esc(cur.desc)}</div></div></div>
        <div class="rv-body">${rulesBody(key)}</div></div>`;
  }
  function gamePickerHtml() {
    const head = pickHeadHtml("Spiel wählen", chosenGame);
    if (rulesOpen) return `<div class="field">${head}${rulesViewHtml(chosenGame)}</div>`;
    return `<div class="field">${head}<div class="gamesecs" role="radiogroup">${tileSectionsHtml((g) => `
      <label class="gametile ${groupOf(chosenGame) === g.key ? "on" : ""} ${twoCls(g)}" style="--gc:${g.color}" title="${esc(g.desc)}">${twoTagHtml(g)}
        <input type="radio" name="game" value="${g.key}" ${groupOf(chosenGame) === g.key ? "checked" : ""}>
        <span class="gt-icon" aria-hidden="true">${g.icon}</span>
        <span class="gt-name">${g.name}</span><span class="gt-desc">${g.desc}</span>
        ${guestTagHtml(g.key, true)}
        <span class="gt-check" aria-hidden="true">✓</span></label>`)}</div></div>`;
  }
  // Spielart bei zusammengefassten Spielen (Klassiker zu zweit: Watten · Schnapsen)
  // cur = gewählte Spielart; Gäste sehen die Auswahl nur (readOnly), wählen kann der Gastgeber
  function modeSwitchHtml(cur = chosenGame, readOnly = false) {
    const grp = GAMES.find((g) => g.key === groupOf(cur));
    return `<div class="field"><span>${readOnly ? "Spielarten (wählt der Gastgeber)" : "Spielart"}</span><div class="modeswitch ${readOnly ? "ro" : ""}" style="--n:${grp.modes.length}" role="radiogroup">${grp.modes.map((k) => {
      const g = GAMES.find((x) => x.key === k);
      return `<${readOnly ? "div" : "button type=\"button\""} class="modebtn ${cur === k ? "on" : ""}" style="--gc:${g.color}" ${readOnly ? "" : `data-mode="${k}"`} role="radio" aria-checked="${cur === k}">
        <span class="gt-icon xs" aria-hidden="true">${g.icon}</span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small>${readOnly && cur === k ? `<span class="mode-now">gewählt</span>` : ""}</${readOnly ? "div" : "button"}>`;
    }).join("")}</div></div>`;
  }
  // Wer wünscht sich dieses Spiel? (kleines Abzeichen auf der Kachel)
  function wishTagHtml(key) {
    const w = (view.lobby && view.lobby.wishes) || {};
    const ids = Object.entries(w).filter(([, k]) => groupOf(k) === key).map(([id]) => id);
    const names = ids.map((id) => id === myId ? "Dein Wunsch" : esc((view.players.find((p) => p.id === id) || { name: "?" }).name));
    return names.length ? `<span class="gt-wish">💡 ${names.join(", ")}</span>` : "";
  }
  // Gäste: alle Spiele sehen und sich eines wünschen
  // Gäste-Kachel: kurzes Etikett oben rechts – „läuft“ oder Wünsche („💡 Du“, „💡 Maria“, „💡 Du +1“, „💡 3“); volle Namen im Tooltip
  // Spiele zu zweit: Etikett oben links; sind mehr als zwei da, spielen nur zwei mit (Kachel abgeblendet)
  const playing = () => view.players.filter((p) => p.connected && !p.paused); // wer beim nächsten Spiel mitspielt (nicht pausiert)
  const twoCrowd = () => playing().length > 2;
  // Schild an der Kachel: „ab 2“ bei Spielen, für die man mindestens zu zweit sein muss;
  // bei reinen Zweierspielen und mehr als zwei Spielern stattdessen der Hinweis „nur 2 spielen“
  const twoTagHtml = (g) => !(g.two || g.min2) ? "" : g.two && twoCrowd()
    ? `<span class="gt-two warn" title="Ihr seid mehr als zwei – es spielen nur die ersten beiden, die anderen schauen zu.">nur 2 spielen</span>`
    : `<span class="gt-two" title="Mindestens zwei Spieler nötig">ab 2</span>`;
  const twoCls = (g) => g.two && twoCrowd() ? "crowd" : "";
  // forHost: beim Gastgeber ohne „läuft“ (dort zeigt das Häkchen die Auswahl)
  function guestTagHtml(key, forHost) {
    if (!forHost && groupOf(view.game) === key) return `<span class="gt-wish now" title="Wird gerade gespielt">läuft</span>`;
    const w = (view.lobby && view.lobby.wishes) || {};
    const ids = Object.entries(w).filter(([, k]) => groupOf(k) === key).map(([id]) => id);
    if (!ids.length) return "";
    const names = ids.map((id) => id === myId ? "Du" : (view.players.find((p) => p.id === id) || { name: "?" }).name);
    const mine = ids.includes(myId), others = ids.length - (mine ? 1 : 0);
    const short = mine ? (others ? `Du +${others}` : "Du") : ids.length === 1 ? names[0] : String(ids.length);
    return `<span class="gt-wish" title="Gewünscht von: ${esc(names.join(", "))}">💡 ${esc(short)}</span>`;
  }
  // Gäste: Kachel antippen zeigt die Erklärung des Spiels, dort kann man es sich wünschen
  let guestInfo = null, guestInfoMode = null;
  function guestGamesHtml() {
    const myWish = view.lobby && view.lobby.wishes && view.lobby.wishes[myId];
    if (guestInfo) {
      const tile = TILES.find((g) => g.key === guestInfo) || TILES[0];
      const modes = tile.modes || null;
      const key = modes ? (modes.includes(guestInfoMode) ? guestInfoMode : modes.includes(view.game) ? view.game : modes[0]) : tile.key;
      const playing = groupOf(view.game) === tile.key, wished = myWish && groupOf(myWish) === tile.key;
      return `<div class="field"><div class="pick-head"><span>So geht's</span>
          <button type="button" class="linkbtn" data-infoback style="--gc:${tile.color}">‹ Zurück zu allen Spielen</button></div>
        ${modes ? `<div class="info-tabs" style="--n:${modes.length}">${modes.map((k) => { const g = GAMES.find((x) => x.key === k);
          return `<button type="button" class="info-tab ${k === key ? "on" : ""}" style="--gc:${g.color}" data-infomode="${k}"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span>${esc(g.name)}</button>`; }).join("")}</div>` : ""}
        ${rulesViewHtml(key)}
        <div class="info-actions">${playing ? `<span class="gt-wish now">wird gerade gespielt</span>`
          : `<button type="button" class="btn ${wished ? "ghost" : "primary"}" data-wish="${tile.key}">${wished ? "Wunsch zurücknehmen" : "💡 Das wünsch ich mir"}</button>`}
          ${wishTagHtml(tile.key)}</div></div>`;
    }
    return `<div class="field"><span>Alle Spiele – tippe für Erklärung und Wunsch</span><div class="gamesecs">${tileSectionsHtml((g) => `
      <button type="button" class="gametile wishtile ${groupOf(view.game) === g.key ? "on" : ""} ${myWish === g.key ? "wished" : ""} ${twoCls(g)}" style="--gc:${g.color}" data-info="${g.key}"
        title="So geht's: ${esc(g.name)}">${twoTagHtml(g)}
        <span class="gt-icon" aria-hidden="true">${g.icon}</span>
        <span class="gt-name">${g.name}</span><span class="gt-desc">${g.desc}</span>
        ${guestTagHtml(g.key)}</button>`)}</div></div>`;
  }

  // Kategorien-Auswahl als Kacheln mit kurzem Vorgeschmack (Gastgeber wählt, Gäste sehen sie nur)
  const SLF_TILES = [
    ["zufall", "🎲", "Jede Runde neu", "Superkraft, Etwas Rundes …"],
    ["klassisch", "📍", "Klassisch", "Stadt, Land, Fluss …"],
    ["spass", "😄", "Spaß", "Schlechtes Geschenk, Ausrede …"],
    ["suedtirol", "🏔", "Südtirol", "Dialektwort, Alm, Gipfel …"],
    ["gemischt", "🔀", "Gemischt", "Stadt, Tier, Etwas Rundes …"],
    ["eigene", "✏️", "Eigene", "Eure Kategorien"],
  ];
  function slfPresetTilesHtml(cur, readOnly) {
    return `<div class="field"><span>${readOnly ? "Kategorien (wählt der Gastgeber)" : "Kategorien"}</span>
      <div class="modeswitch slf-presets ${readOnly ? "ro" : ""}" style="--n:2" role="radiogroup">${SLF_TILES.map(([k, ic, name, teaser]) =>
        `<button type="button" class="modebtn ${cur === k ? "on" : ""}" style="--gc:#3ccf8e" ${readOnly ? "disabled" : `data-slfpreset="${k}"`} role="radio" aria-checked="${cur === k}">
          <b>${ic} ${esc(name)}</b><small>${esc(teaser)}</small></button>`).join("")}</div></div>`;
  }
  function slfSettingsHtml() {
    const presetCats = slfOpts.preset !== "eigene" && SLF.PRESETS[slfOpts.preset] ? SLF.PRESETS[slfOpts.preset].cats : null;
    return `${slfPresetTilesHtml(slfOpts.preset, false)}
      ${slfOpts.preset === "zufall" ? `<p class="muted small">Jede Runde ${SLF.PRESETS.zufall.random} neue Kategorien aus ${SLF.POOL.length} – von „Tier“ bis „Ausrede fürs Zuspätkommen“.</p>`
        : presetCats ? `<p class="muted small">${presetCats.map(esc).join(" · ")}</p>`
        : `<label class="field"><span>Eigene Kategorien (mit Komma getrennt, höchstens 10)</span>
            <textarea id="slf-custom" rows="2" maxlength="400" placeholder="z. B. Stadt, Pizzabelag, Ausrede, Promi">${esc(slfOpts.custom)}</textarea></label>`}
      <div class="row2">
        <label class="field"><span>Runden</span><select id="slf-rounds">${SLF.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(slfOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>
        <label class="field"><span>Zeit</span><select id="slf-timer">${Object.entries(SLF.TIMERS).map(([k, t]) => `<option value="${k}" ${slfOpts.timer === k ? "selected" : ""}>${t.name}</option>`).join("")}</select></label>
      </div>
      <label class="field"><span>Buchstaben</span><select id="slf-letters">${Object.entries(SLF.LETTER_SETS).map(([k, l]) =>
        `<option value="${k}" ${(SLF.LETTER_SETS[slfOpts.letters] ? slfOpts.letters : "alle") === k ? "selected" : ""}>${esc(l.name)} (${esc(l.desc)})</option>`).join("")}</select></label>
      ${slfOpts.preset === "zufall" ? "" : `<label class="setopt ${slfOpts.surprise !== false ? "on" : ""}"><input type="checkbox" id="slf-surprise" ${slfOpts.surprise !== false ? "checked" : ""}>
        <span class="setname">🎁 Jede Runde eine Überraschungskategorie dazu</span><span></span></label>`}
      <button id="start" class="btn primary big" ${playing().length < 1 ? "disabled" : ""}>Spiel starten</button>
      `;
  }
  // Für Gäste: gut sichtbar, welches Spiel der Gastgeber gewählt hat
  // Kleines Spielsymbol mit Namen für die Kopfzeile der Spielbildschirme
  function gameTagHtml(key) {
    const g = GAMES.find((x) => x.key === key) || GAMES[0];
    return `<span class="gtag" style="--gc:${g.color}"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span><b>${esc(g.name)}</b></span>`;
  }
  // Kopfzeile der Spielbildschirme: Marke Spielstube · großer Spieltitel · Infos · Knöpfe
  // Gemeinsamer „Weiter“-Knopf für alle Spiele: gelb, solange man selbst noch nicht bereit ist; danach ruhig mit
  // „✓ Bereit – warte auf …“ (nochmal tippen nimmt zurück). Der Gastgeber bekommt daneben „Als Gastgeber sofort weiter“.
  // attr / hostAttr: z. B. 'id="geo-ready"' bzw. 'id="geo-next"'; waiting: Namen derer, auf die man noch wartet.
  function nextBtnsHtml({ attr, hostAttr, label, ready, waiting = [], cls = "" }) {
    const who = !waiting.length ? "gleich geht's weiter" : waiting.length <= 2 ? "warte auf " + waiting.map(esc).join(" & ") : `warte auf ${waiting.length} Mitspieler`;
    return `<button ${attr} class="btn primary next-btn ${cls} ${ready ? "is-ready" : ""}">${ready
      ? `<span class="nb-main">✓ Bereit</span> <span class="nb-wait">– ${who}</span><span class="nb-undo">zurücknehmen</span>` : esc(label)}</button>`
      + (isHost && hostAttr ? `<button ${hostAttr} class="btn ghost sm next-host">Als Gastgeber sofort weiter</button>` : "")
      + nextOffHtml(waiting.offline);
  }
  // Hinweis unter dem Weiter-Knopf: wer als getrennt gilt, zählt beim Weiter nicht mit
  function nextOffHtml(off) {
    if (!off || !off.length) return "";
    const n = off.length <= 2 ? off.map(esc).join(" & ") : `${off.length} Mitspieler`;
    return `<span class="next-off">📵 ${n} ${off.length > 1 ? "sind" : "ist"} gerade getrennt – es wird nicht auf ${off.length > 1 ? "sie" : n} gewartet.</span>`;
  }
  // Gemeinsamer Baustein „nicht erkannt“ (Zehnkampf und Fragewand, Gestaltung wie ursprünglich bei der Fragewand):
  // Lösung groß, darunter die Antwort in Spielerfarbe; für den Antwortenden „Weiter“ (falsch) und „⚖️ Einspruch“
  // (die anderen entscheiden) – Knöpfe mit data-chk="ok" / "appeal"
  // zero: „0“ am Zeilenende (Fragewand: Punkte des Feldes; beim Zehnkampf weggelassen)
  function checkHtml({ given, solution, mine, who, color, appeal = true, zero = true }) {
    return `<div class="chk">
      <div class="chk-sol">✗ Gesucht war: ${esc(solution)}</div>
      <div class="chk-line" style="--pc:${color}"><span class="pdot"></span><b>${esc(who)}</b><span class="g">„${esc(given)}“</span>${zero ? `<b class="no">0</b>` : ""}</div>
      ${mine ? `<div class="chk-btns"><button class="btn primary" data-chk="ok">Weiter</button>${appeal ? `<button class="btn ghost" data-chk="appeal">⚖️ Einspruch – das stimmt doch</button>` : ""}</div>`
        : `<div class="chk-wait">${esc(who)} schaut sich die Lösung an …</div>`}</div>`;
  }
  // beim Zwischenaktualisieren (ohne neu zu zeichnen) nur den Weiter-Knopf und den Getrennt-Hinweis austauschen
  function nextBtnSwap(sel, opts, fn) {
    const el = app.querySelector(sel); if (!el) return;
    const t = document.createElement("div"); t.innerHTML = nextBtnsHtml({ ...opts, hostAttr: null });
    const nb = t.firstElementChild, box = el.parentNode; el.replaceWith(nb); nb.onclick = fn;
    box.querySelectorAll(".next-off").forEach((x) => x.remove());
    const off = t.querySelector(".next-off"); if (off) box.appendChild(off);
  }
  // Namen der verbundenen, nicht pausierten Mitspieler (ohne mich), die noch nicht bereit sind;
  // dazu .offline: Namen derer, die gerade als getrennt gelten (zählen beim Weiter nicht mit)
  // all = true: Spiele zu zweit (Watten, Schnapsen) warten auch auf Getrennte – dann kein Hinweis, sondern „warte auf …“
  function waitingNames(v, ready, ids, all) {
    const isReady = (id) => (Array.isArray(ready) ? ready.includes(id) : !!(ready && ready[id]));
    const mine = v.players.filter((p) => !p.paused && p.id !== myId && (!ids || ids.includes(p.id)));
    const out = mine.filter((p) => (all || p.connected) && !isReady(p.id)).map((p) => p.name);
    out.offline = all ? [] : mine.filter((p) => !p.connected).map((p) => p.name);
    return out;
  }

  function headBrandHtml(key) {
    const g = GAMES.find((x) => x.key === key) || GAMES[0];
    // In Querbeet steht die Etappe als kleines Abzeichen neben dem Spielnamen (statt einer Leiste, die etwas überdecken könnte)
    const q = view && view.qb, inStage = q && q.cur && !q.done && view.phase !== "querbeet" && view.phase !== "lobby";
    const qbTag = inStage ? `<span class="qb-tag" title="Stubenmeisterschaft · Etappe ${q.idx + 1} von ${q.n}${q.idx === q.n - 1 ? " · Finale, zählt doppelt" : ""}">🧩 Etappe ${q.idx + 1}/${q.n}${q.idx === q.n - 1 ? " · Finale ×2" : ""}</span>` : "";
    return `<div class="brand" title="Spielstube">${LOGO}</div>
      <div class="gtitle" style="--gc:${g.color}"><span class="gt-icon" aria-hidden="true">${g.icon}</span><b>${g.short ? `<span class="nm-long">${esc(g.name)}</span><span class="nm-short">${esc(g.short)}</span>` : esc(g.name)}</b>${qbTag}</div>`;
  }
  function gameBannerHtml() {
    const g = GAMES.find((x) => x.key === view.game) || GAMES[0];
    return `<div class="game-banner" style="--gc:${g.color}"><span class="gt-icon big" aria-hidden="true">${g.icon}</span>
      <div><div class="game-label">Gespielt wird</div><div class="game-name">${esc(g.name)}</div><div class="muted small">${esc(g.desc)}</div></div></div>`;
  }
  // Für Gäste: Einstellungen des Gastgebers nur anzeigen (ändern kann nur der Gastgeber)
  function guestSettingsHtml() {
    const lb = view.lobby;
    if (!lb) return "";
    if (isMode(view.game)) return modeSwitchHtml(view.game, true) + guestModeSettingsHtml(lb);
    return guestModeSettingsHtml(lb);
  }
  function guestModeSettingsHtml(lb) {
    // radio = Einfachauswahl beim Gastgeber -> runder Punkt statt Häkchen
    const row = (on, name, detail, radio) => `<div class="setopt ro ${on ? "on" : ""} ${radio ? "radio" : ""}"><span class="ro-mark">${on && !radio ? "✓" : ""}</span>
      <span class="setname">${name}</span><span class="setcount">${detail}</span></div>`;
    if (view.game === "slf") {
      const list = lb.slf.preset === "zufall" ? "Jede Runde neue Kategorien" : (lb.slf.cats || []).map(esc).join(" · ");
      return `${slfPresetTilesHtml(lb.slf.preset, true)}
        ${list ? `<p class="muted small">${list}</p>` : ""}
        <p class="muted small">${lb.slf.rounds} Runden · ${esc((SLF.TIMERS[lb.slf.timer] || SLF.TIMERS.stopp).name)}${lb.slf.letters === "leicht" ? " · nur leichte Buchstaben" : ""}${lb.slf.preset !== "zufall" && lb.slf.surprise ? " · mit Überraschungskategorie 🎁" : ""}</p>`;
    }
    if ((view.game === "geo" || view.game === "oben") && lb.geo) {
      if (view.game === "oben") {
        return `<p class="muted small">${lb.geo.rounds} Runden · ${GEO.OBEN.steps * GEO.OBEN.stepMs / 1000} Sekunden pro Runde</p>`;
      }
      const regs = Object.entries(GEODATA).filter(([, r]) => !r.hidden).map(([k, r]) => row(lb.geo.region === k, esc(r.name), "", true));
      return `<div class="field"><span>Regionen (wählt der Gastgeber)</span><div class="setlist">${regs.join("")}</div></div>
        <p class="muted small">${esc((GEO.LEVELS[lb.geo.level] || GEO.LEVELS.gemischt).name)} · ${lb.geo.rounds} Runden · ${esc((GEO.TIMERS[lb.geo.timer] || GEO.TIMERS.t30).name)} pro Runde</p>`;
    }
    if (KG.MODES[view.game] && lb.kg) {
      return `<p class="muted small">${view.game === "siebzehn" ? `${lb.kg.rounds} Runden · alle gegeneinander, wer am nächsten an 21 liegt, gewinnt (allein: gegen die Bank)` : view.game === "bus" ? `${lb.kg.busRounds} ${lb.kg.busRounds === 1 ? "Runde" : "Runden"} · 5 Stationen, nach jeder: weiterfahren oder aussteigen` : `${lb.kg.stichRounds || 6} Runden · Stiche ansagen und genau so viele holen`}</p>`;
    }
    if (QZ.MODES[view.game] && lb.quiz) {
      const det = view.game === "umriss" ? esc(LAND.REGION_NAMES[lb.quiz.region] || "Europa") + " · " + esc((QZ.LEVELS[lb.quiz.level] || QZ.LEVELS.gemischt).name)
        : esc((QZ.THEMES[lb.quiz.theme] || QZ.THEMES.mix).name);
      return `<p class="muted small">${det} · ${lb.quiz.rounds} Runden</p>`;
    }
    if (view.game === "querbeet" && lb.qb) {
      return `${qbGamesHtml(lb.qb.off, true)}
        <p class="muted small">Thema: ${esc((QB.THEMES[lb.qb.theme] || QB.THEMES.mix).name)} · Schwierigkeit: ${esc((QB.LEVELS[lb.qb.level] || QB.LEVELS.gemischt).name)} · ${lb.qb.joker ? "mit Joker" : "ohne Joker"} · ${esc((QB.LENGTHS[lb.qb.length] || QB.LENGTHS[8]).name)} · Platz 1 = ${QB.POINTS[0]} Partypunkte, Platz 2 = ${QB.POINTS[1]}, Platz 3 = ${QB.POINTS[2]}, sonst 1 · Finale zählt doppelt</p>`;
    }
    if (view.game === "land" && lb.land) {
      const maps = LAND.REGION_KEYS.map((k) => row(lb.land.region === k, esc(LAND.REGION_NAMES[k]), "", true));
      return `<div class="field"><span>Karten (wählt der Gastgeber)</span><div class="setlist">${maps.join("")}</div></div>
        <p class="muted small">${esc(LAND.REGION_NAMES[lb.land.region] || "Europa")} · ${esc((LAND.LEVELS[lb.land.level] || LAND.LEVELS.gemischt).name)} · ${lb.land.rounds} Runden · ${esc((LAND.TIMERS[lb.land.timer] || LAND.TIMERS.t30).name)} pro Runde</p>`;
    }
    if (view.game === "schnapsen" && lb.schnapsen) {
      return `<p class="muted small">Zu zweit · ${esc(SCH.MODES[lb.schnapsen.mode] || SCH.MODES.gemuetlich)} · ${SCH.TARGET} Punkte pro Bummerl</p>`;
    }
    if (view.game === "watten" && lb.watten) {
      return `<p class="muted small">Zu zweit · bis ${lb.watten.target} Punkte · Weli ist ${lb.watten.weli === "trumpf" ? "der kleinste Trumpf" : "die kleinste Schelle"}</p>`;
    }
    if (view.game === "frage" && lb.frage) {
      return `<p class="muted small">Zu zweit · bis ${lb.frage.target} Punkte · ${lb.frage.choices === "1" ? "1 Antwort vorgegeben" : "3 Antworten zur Auswahl"} · ${esc((FQ.WRITE[lb.frage.write] || FQ.WRITE["0"]).name)} zum Ausdenken · ${esc((FQ.ANSWER[lb.frage.answer] || FQ.ANSWER["0"]).name)} zum Antworten</p>`;
    }
    if (view.game === "wand" && lb.wand) {
      const names = lb.wand.cats.map((k) => { const c = WANDDATA.find((x) => x.key === k); return c ? c.ico + " " + esc(c.name) : ""; }).filter(Boolean);
      return `<p class="muted small">5 Kategorien · ${names.length ? names.join(", ") + (names.length < 5 ? ` · ${5 - names.length} werden ausgelost` : "") : "alle werden ausgelost"} · reihum wählen</p>`;
    }
    if (view.game === "duell" && lb.duell) {
      return `<p class="muted small">Zu zweit · bis ${lb.duell.target} Punkte · ${esc((DU.TIMERS[lb.duell.timer] || DU.TIMERS["30"]).name)} pro Antwort · ${DUDATA.length} Themen</p>`;
    }
    if (view.game === "hl" && lb.hl) {
      return `<p class="muted small">${(HL.LENGTHS[lb.hl.length] || HL.LENGTHS.mittel).cats} von ${hlCatCount(lb.hl.theme)} Kategorien${lb.hl.theme === "allgemein" ? " · ohne Südtirol" : ""} · je ${HL.PER_CAT} Vergleiche · ${esc((HL.LEVELS[lb.hl.level] || HL.LEVELS.gemischt).name)}</p>`;
    }
    if (view.game === "jagd" && lb.jagd) {
      const l = JG.LENGTHS[lb.jagd.length] || JG.LENGTHS.normal, m = JG.MAP_LIST.find((x) => x.id === lb.jagd.map);
      return `<p class="muted small">Jagdgebiet: ${m ? `<b>${esc(m.name)}</b> – ${esc(m.desc)}` : "<b>Zufall</b> – eines der Gebiete wird ausgelost"} · ${esc(l.name)} – ${esc(l.desc)} · 2 bis 8 Spieler · jeder jagt im Revier seines Nachbarn, alle gleichzeitig</p>`;
    }
    if (view.game === "alm" && lb.alm) {
      const l = ALM.LENGTHS[lb.alm.length] || ALM.LENGTHS.normal;
      const m = ALM.MAP_LIST.find((x) => x.id === lb.alm.map);
      return `<p class="muted small">Tal: ${m ? `<b>${esc(m.name)}</b> – ${esc(m.desc)}` : "<b>Zufall</b> – eines der Täler wird ausgelost"} · ${esc(l.name)} – ${esc(l.desc)} · 1 bis 8 Spieler, alle gleichzeitig</p>`;
    }
    if (view.game === "wl") {
      const packs = [["mix", "Alle gemischt", "alle Pakete durcheinander"]].concat(Object.entries(WL.PACKS).map(([k, p]) => [k, p.name, p.prompts.slice(0, 3).join(" · ") + " …"]));
      return `<div class="field"><span>Impuls-Pakete (wählt der Gastgeber)</span><div class="setlist">${packs.map(([k, n]) => row(lb.wl.pack === k, esc(n), "", true)).join("")}</div></div>
        <p class="muted small">${lb.wl.rounds} Impulse</p>`;
    }
    const sets = L.SET_KEYS.map((k) => row(lb.sets.includes(k), esc(SET_NAMES[k]), `${CARDS.filter((c) => (c.set || "standard") === k).length} Karten`));
    const total = CARDS.filter((c) => lb.sets.includes(c.set || "standard")).length;
    return `<div class="field"><span>Fragen-Sets (wählt der Gastgeber)</span><div class="setlist inline-count">${sets.join("")}</div></div>
      <p class="muted small">Zusammen ${total} Karten · Spielen bis ${lb.target} Punkte</p>`;
  }
  function bindGamePicker() {
    const pickGame = (key) => {
      const g = GAMES.find((x) => x.key === key);
      if (g && g.modes) key = g.modes.includes(store.get("s10-" + key)) ? store.get("s10-" + key) : g.modes[0]; // zuletzt gewählte Spielart
      if (isMode(key)) store.set("s10-" + groupOf(key), key);
      chosenGame = key; store.set("s10-game", chosenGame); send({ type: "setGame", game: chosenGame }); publish();
    };
    app.querySelectorAll('input[name="game"]').forEach((r) => r.onchange = () => pickGame(r.value));
    const rt = app.querySelector("#rulesToggle");
    if (rt) rt.onclick = () => { rulesOpen = !rulesOpen; renderLobby(); };
    const rl = app.querySelector("[data-rules]");
    if (rl) rl.onclick = () => {
      rulesOpen = true; renderLobby();
      if (innerWidth < 1100) { const gc = app.querySelector(".lobby-games"); if (gc) gc.scrollIntoView({ behavior: "smooth", block: "start" }); }
    };
    app.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => { if (b.dataset.mode !== chosenGame) pickGame(b.dataset.mode); });
    const saveOpts = () => store.set("s10-slf", slfOpts);
    const ps = app.querySelector("#slf-preset");
    if (ps) ps.onchange = () => { slfOpts.preset = ps.value; saveOpts(); publish(); };
    const cu = app.querySelector("#slf-custom");
    if (cu) { cu.oninput = () => { slfOpts.custom = cu.value; saveOpts(); }; cu.onchange = () => publish(); } // erst beim Verlassen des Felds teilen
    const ro = app.querySelector("#slf-rounds");
    if (ro) ro.onchange = () => { slfOpts.rounds = Number(ro.value); saveOpts(); publish(); };
    const ti = app.querySelector("#slf-timer");
    if (ti) ti.onchange = () => { slfOpts.timer = ti.value; saveOpts(); publish(); };
    const su = app.querySelector("#slf-surprise");
    if (su) su.onchange = () => { slfOpts.surprise = su.checked; saveOpts(); publish(); };
    const sl = app.querySelector("#slf-letters");
    if (sl) sl.onchange = () => { slfOpts.letters = sl.value; saveOpts(); publish(); };
    app.querySelectorAll("[data-slfpreset]").forEach((b) => b.onclick = () => { slfOpts.preset = b.dataset.slfpreset; saveOpts(); publish(); });
    const wp = app.querySelector("#wl-pack");
    if (wp) wp.onchange = () => { wlOpts.pack = wp.value; store.set("s10-wl", wlOpts); publish(); };
    const almL = app.querySelector("#alm-length");
    if (almL) almL.onchange = () => { almOpts.length = almL.value; store.set("s10-alm", almOpts); publish(); };
    const almM = app.querySelector("#alm-map");
    if (almM) almM.onchange = () => { almOpts.map = almM.value; store.set("s10-alm", almOpts); publish(); };
    const jgL = app.querySelector("#jagd-length");
    if (jgL) jgL.onchange = () => { jagdOpts.length = jgL.value; store.set("s10-jagd", jagdOpts); publish(); };
    const jgM = app.querySelector("#jagd-map");
    if (jgM) jgM.onchange = () => { jagdOpts.map = jgM.value; store.set("s10-jagd", jagdOpts); publish(); };
    const saveGeo = () => { store.set("s10-geo", geoOpts); publish(); };
    const gr = app.querySelector("#geo-region");
    if (gr) gr.onchange = () => { geoOpts.region = gr.value; saveGeo(); };
    const gn = app.querySelector("#geo-rounds");
    if (gn) gn.onchange = () => { geoOpts.rounds = Number(gn.value); saveGeo(); };
    const gt = app.querySelector("#geo-timer");
    if (gt) gt.onchange = () => { geoOpts.timer = gt.value; saveGeo(); };
    const gl = app.querySelector("#geo-level");
    if (gl) gl.onchange = () => { geoOpts.level = gl.value; saveGeo(); };
    const qbJ = app.querySelector("#qb-joker");
    if (qbJ) qbJ.onchange = () => { qbOpts.joker = qbJ.value === "1"; store.set("s10-qb", qbOpts); publish(); };
    const qbT = app.querySelector("#qb-theme");
    if (qbT) qbT.onchange = () => { qbOpts.theme = qbT.value; store.set("s10-qb", qbOpts); publish(); };
    const qbLv = app.querySelector("#qb-level");
    if (qbLv) qbLv.onchange = () => { qbOpts.level = qbLv.value; store.set("s10-qb", qbOpts); publish(); };
    const kgR = app.querySelector("#kg-rounds");
    if (kgR) kgR.onchange = () => { kgOpts.rounds = Number(kgR.value); store.set("s10-kg", kgOpts); publish(); };
    const kgB = app.querySelector("#kg-busrounds");
    if (kgB) kgB.onchange = () => { kgOpts.busRounds = Number(kgB.value); store.set("s10-kg", kgOpts); publish(); };
    const kgS = app.querySelector("#kg-stichrounds");
    if (kgS) kgS.onchange = () => { kgOpts.stichRounds = Number(kgS.value); store.set("s10-kg", kgOpts); publish(); };
    [["#quiz-rounds", "rounds"], ["#quiz-theme", "theme"], ["#quiz-region", "region"], ["#quiz-level", "level"]].forEach(([id, k]) => {
      const el = app.querySelector(id);
      if (el) el.onchange = () => { quizOpts[k] = k === "rounds" ? Number(el.value) : el.value; store.set("s10-quiz", quizOpts); publish(); };
    });
    app.querySelectorAll("[data-qbmix]").forEach((b) => b.onclick = () => { qbOpts.off = QB.mixOff(b.dataset.qbmix); store.set("s10-qb", qbOpts); publish(); });
    const qbAll = app.querySelector("#qb-all");
    if (qbAll) qbAll.onclick = () => { qbOpts.off = []; store.set("s10-qb", qbOpts); publish(); };
    // alle angehakt: „Keine auswählen“ nimmt alle Haken weg (dann einzelne gezielt wieder anhaken)
    const qbNone = app.querySelector("#qb-none");
    if (qbNone) qbNone.onclick = () => { qbOpts.off = QB.ORDER.slice(); store.set("s10-qb", qbOpts); publish(); };
    const qbL = app.querySelector("#qb-length");
    if (qbL) qbL.onchange = () => { qbOpts.length = Number(qbL.value); store.set("s10-qb", qbOpts); publish(); };
    app.querySelectorAll("[data-qbgame]").forEach((cb) => cb.onchange = () => {
      qbOpts.off = [...app.querySelectorAll("[data-qbgame]")].filter((x) => !x.checked).map((x) => x.value);
      store.set("s10-qb", qbOpts); publish();
    });
    const saveLand = () => { store.set("s10-land", landOpts); publish(); };
    [["#land-region", "region"], ["#land-level", "level"], ["#land-rounds", "rounds"], ["#land-timer", "timer"]].forEach(([id, k]) => {
      const el = app.querySelector(id);
      if (el) el.onchange = () => { landOpts[k] = k === "rounds" ? Number(el.value) : el.value; saveLand(); };
    });
    const xM = app.querySelector("#sch-mode");
    if (xM) xM.onchange = () => { schOpts.mode = xM.value; store.set("s10-schnapsen", schOpts); publish(); };
    const wT = app.querySelector("#watten-target");
    if (wT) wT.onchange = () => { wattenOpts.target = Number(wT.value); store.set("s10-watten", wattenOpts); publish(); };
    const wW = app.querySelector("#watten-weli");
    if (wW) wW.onchange = () => { wattenOpts.weli = wW.value; store.set("s10-watten", wattenOpts); publish(); };
    [["#fq-target", "target"], ["#fq-write", "write"], ["#fq-answer", "answer"], ["#fq-choices", "choices"]].forEach(([id, k]) => {
      const el = app.querySelector(id);
      if (el) el.onchange = () => { fqOpts[k] = k === "target" ? Number(el.value) : el.value; store.set("s10-fq", fqOpts); publish(); };
    });
    app.querySelectorAll("[data-fwcat]").forEach((b) => b.onclick = () => {
      const k = b.dataset.fwcat, i = fwOpts.cats.indexOf(k);
      if (i >= 0) fwOpts.cats.splice(i, 1);
      else if (fwOpts.cats.length < 5) fwOpts.cats.push(k);
      else return toast("Es sind schon 5 Kategorien gewählt – erst eine abwählen.", "info");
      store.set("s10-fw", fwOpts); publish();
    });
    const fwNone = app.querySelector("#fw-none");
    if (fwNone) fwNone.onclick = () => { fwOpts.cats = []; store.set("s10-fw", fwOpts); publish(); };
    const duT = app.querySelector("#du-target"), duZ = app.querySelector("#du-timer");
    if (duT) duT.onchange = () => { duOpts.target = Number(duT.value); store.set("s10-du", duOpts); publish(); };
    if (duZ) duZ.onchange = () => { duOpts.timer = duZ.value; store.set("s10-du", duOpts); publish(); };
    const hlL = app.querySelector("#hl-length");
    if (hlL) hlL.onchange = () => { hlOpts.length = hlL.value; store.set("s10-hl", hlOpts); publish(); };
    const hlT = app.querySelector("#hl-theme");
    if (hlT) hlT.onchange = () => { hlOpts.theme = hlT.value; store.set("s10-hl", hlOpts); publish(); };
    const hlLv = app.querySelector("#hl-level");
    if (hlLv) hlLv.onchange = () => { hlOpts.level = hlLv.value; store.set("s10-hl", hlOpts); publish(); };
    const wr = app.querySelector("#wl-rounds");
    if (wr) wr.onchange = () => { wlOpts.rounds = Number(wr.value); store.set("s10-wl", wlOpts); publish(); };
  }
  function geoSettingsHtml(oben) {
    const level = oben ? "gemischt" : GEO.LEVELS[geoOpts.level] ? geoOpts.level : "gemischt";
    const region = oben ? "oben" : geoOpts.region;
    const nw = GEODATA[region] ? GEO.countNew(S && S.geoSeen, region, level) : null;
    return `${oben ? "" : `<div class="row2">
        <label class="field"><span>Region</span><select id="geo-region">${Object.entries(GEODATA).filter(([, r]) => !r.hidden).map(([k, r]) =>
          `<option value="${k}" ${geoOpts.region === k ? "selected" : ""}>${esc(r.name)} (${GEO.poolFor(k, level).length} Orte)</option>`).join("")}</select></label>
        <label class="field"><span>Schwierigkeit</span><select id="geo-level">${Object.entries(GEO.LEVELS).map(([k, l]) =>
          `<option value="${k}" ${level === k ? "selected" : ""}>${esc(l.name)}</option>`).join("")}</select></label>
      </div>`}
      ${nw ? freshHtml(nw.fresh, nw.total, "Orte", "geo") : ""}
      <div class="row2">
        <label class="field"><span>Runden</span><select id="geo-rounds">${GEO.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(geoOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>
        ${oben ? `<div class="field"><span>Zeit pro Runde</span><p class="muted small">${GEO.OBEN.steps * GEO.OBEN.stepMs / 1000} Sekunden – alle ${GEO.OBEN.stepMs / 1000} Sekunden zoomt das Bild weiter heraus.</p></div>`
          : `<label class="field"><span>Zeit pro Runde</span><select id="geo-timer">${Object.entries(GEO.TIMERS).map(([k, t]) => `<option value="${k}" ${geoOpts.timer === k ? "selected" : ""}>${t.name}</option>`).join("")}</select></label>`}
      </div>
      <button id="start" class="btn primary big" ${playing().length < 1 || !LF ? "disabled" : ""}>Spiel starten</button>
      ${!LF ? `<p class="err small">Die Kartenbibliothek konnte nicht geladen werden.</p>` : ""}`;
  }
  // Liste der Querbeet-Spiele: beim Gastgeber zum Anhaken, bei Gästen gleich aussehend, aber nur zum Ansehen
  function qbGamesHtml(off, readOnly) {
    const two = playing().length === 2, solo = playing().length < 2;
    const mx = QB.mixOf(off), mxTxt = mx && QB.MIXES[mx].games ? ` · ${QB.MIXES[mx].icon} ${esc(QB.MIXES[mx].name)}` : "";
    const head = readOnly ? `<span>Mit dabei (wählt der Gastgeber)${mxTxt}</span>`
      : `<div class="pick-head"><span>Mit dabei</span>${off.length ? `<button type="button" id="qb-all" class="linkbtn" style="--gc:var(--accent)">Alle auswählen</button>`
        : `<button type="button" id="qb-none" class="linkbtn" style="--gc:var(--accent)">Keine auswählen</button>`}</div>`;
    return `<div class="field">${head}<div class="setlist qb-games ${readOnly ? "qb-ro" : ""}">${QB.ORDER.map((k) => { const D = QB.STAGES[k], dis = (D.two && !two) || (D.min2 && solo);
        return `<label class="setopt ${!off.includes(k) && !dis ? "on" : ""} ${dis ? "dis" : ""}"><input type="checkbox" ${readOnly ? `tabindex="-1" aria-readonly="true"` : "data-qbgame"} value="${k}" ${!off.includes(k) ? "checked" : ""} ${dis ? "disabled" : ""}>
          <span class="setname">${esc(D.name)}</span><span class="setcount">${esc(D.two ? (two ? D.short : "nur zu zweit") : D.min2 && solo ? "ab 2 Spielern" : D.short)}</span></label>`; }).join("")}</div></div>`;
  }
  function quizSettingsHtml(mode) {
    const um = mode === "umriss";
    if (um && !needLandData()) return `<p class="muted">Länderkarte wird geladen …</p><button id="start" class="btn primary big" disabled>Spiel starten</button>`;
    const sel = (id, obj, val) => `<select id="${id}">${Object.entries(obj).map(([k, t]) => `<option value="${k}" ${String(val) === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>`;
    const o = { theme: QZ.THEMES[quizOpts.theme] ? quizOpts.theme : "mix", region: QZ.UMRISS_REGIONS.includes(quizOpts.region) ? quizOpts.region : "europa",
      level: QZ.LEVELS[quizOpts.level] ? quizOpts.level : "gemischt" };
    const nw = QZ.countNew(S && S.quizSeen, mode, o);
    const regions = Object.fromEntries(QZ.UMRISS_REGIONS.map((k) => [k, { name: `${LAND.REGION_NAMES[k]} (${QZ.pool("umriss", { region: k, level: "gemischt" }).length})` }]));
    const levels = Object.fromEntries(Object.entries(QZ.LEVELS).map(([k, l]) => [k, { name: `${l.name} (${QZ.pool("umriss", { region: o.region, level: k }).length})` }]));
    const themes = Object.fromEntries(Object.entries(QZ.THEMES).map(([k, t]) => [k, { name: `${t.name} (${QZ.pool(mode, { theme: k }).length})` }]));
    return `${um ? `<label class="field"><span>Karte</span>${sel("quiz-region", regions, o.region)}</label>
        <label class="field"><span>Schwierigkeit</span>${sel("quiz-level", levels, o.level)}</label>` : `<label class="field"><span>Fragen</span>${sel("quiz-theme", themes, o.theme)}</label>`}
      <label class="field"><span>Runden</span><select id="quiz-rounds">${QZ.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(quizOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>
      ${freshHtml(nw.fresh, nw.total, { schaetzen: "Fragen", hinweis: "Begriffe", umriss: "Umrisse" }[mode] || "Fragen", "quiz")}
      <button id="start" class="btn primary big" ${playing().length < 1 || !nw.total ? "disabled" : ""}>Spiel starten</button>
      `;
  }
  function kgSettingsHtml(mode) {
    return `${mode === "siebzehn" ? `<label class="field"><span>Runden</span><select id="kg-rounds">${KG.ROUND_CHOICES.map((n) =>
        `<option value="${n}" ${Number(kgOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>`
        : mode === "bus" ? `<label class="field"><span>Runden</span><select id="kg-busrounds">${KG.BUS_ROUNDS.map((n) =>
            `<option value="${n}" ${Number(kgOpts.busRounds) === n ? "selected" : ""}>${n} ${n === 1 ? "Runde" : "Runden"}</option>`).join("")}</select></label>`
        : `<label class="field"><span>Runden</span><select id="kg-stichrounds">${KG.STICH_ROUNDS.map((n) =>
            `<option value="${n}" ${Number(kgOpts.stichRounds) === n ? "selected" : ""}>${n} Runden (1 bis ${n} Karten)</option>`).join("")}</select></label>`}
      <button id="start" class="btn primary big" ${playing().length < (mode === "stich" ? 2 : 1) ? "disabled" : ""}>Spiel starten</button>
      ${mode === "stich" ? playerNoteHtml(view.players.length, false) : ""}`;
  }
  function qbSettingsHtml() {
    const n = playing().length;
    const games = QB.eligible(qbOpts.off, n);
    return `<div class="row2"><label class="field"><span>Länge</span><select id="qb-length">${Object.entries(QB.LENGTHS).map(([k, l]) =>
        `<option value="${k}" ${Number(qbOpts.length) === Number(k) ? "selected" : ""} title="${esc(l.name)}">${k} Etappen</option>`).join("")}</select></label>
      <label class="field"><span>Thema</span><select id="qb-theme">${Object.entries(QB.THEMES).map(([k, t]) =>
        `<option value="${k}" ${(qbOpts.theme || "mix") === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select></label></div>
      <label class="field"><span>Schwierigkeit <small class="muted">· Landkarten-Spiele, Höher oder tiefer, Stadt, Land, Fluss</small></span><select id="qb-level">${Object.entries(QB.LEVELS).map(([k, t]) =>
        `<option value="${k}" ${(QB.LEVELS[qbOpts.level] ? qbOpts.level : "gemischt") === k ? "selected" : ""}>${esc(t.name)} – ${esc(t.desc)}</option>`).join("")}</select></label>
      <label class="field"><span>Joker</span><select id="qb-joker"><option value="1" ${qbOpts.joker !== false ? "selected" : ""}>Mit Joker – jeder darf eine Etappe doppelt zählen lassen</option>
        <option value="0" ${qbOpts.joker === false ? "selected" : ""}>Ohne Joker</option></select></label>
      <div class="field"><span>Mischung je nach Stimmung</span><div class="qb-mixes">${Object.entries(QB.MIXES).map(([k, m]) =>
        `<button type="button" class="qb-mix ${QB.mixOf(qbOpts.off) === k ? "on" : ""}" data-qbmix="${k}">${m.icon} ${esc(m.name)}</button>`).join("")}</div></div>
      ${qbGamesHtml(qbOpts.off, false)}
      <p class="muted small">Jede Etappe ist eine Kurzfassung. Pro Etappe zählt die Platzierung: ${QB.POINTS[0]} · ${QB.POINTS[1]} · ${QB.POINTS[2]} Partypunkte, alle anderen 1. Das Finale zählt doppelt.</p>
      <button id="start" class="btn primary big" ${!games.length || n < 1 ? "disabled" : ""}>Meisterschaft starten</button>
      ${!games.length ? `<p class="err small">Bitte mindestens ein Spiel auswählen.</p>` : ""}`;
  }
  function landSettingsHtml() {
    if (!needLandData()) return `<p class="muted">Länderkarte wird geladen …</p><button id="start" class="btn primary big" disabled>Spiel starten</button>`;
    const D = window.SCHLAU10_LAND;
    const level = LAND.LEVELS[landOpts.level] ? landOpts.level : "gemischt", reg = D.regions[landOpts.region] ? landOpts.region : "europa";
    const nw = LAND.countNew(S && S.landSeen, reg, level);
    const sel = (id, obj, val) => `<select id="${id}">${Object.entries(obj).map(([k, t]) => `<option value="${k}" ${String(val) === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>`;
    const regions = Object.fromEntries(LAND.REGION_KEYS.filter((k) => D.regions[k]).map((k) => [k, { name: `${D.regions[k].name} (${D.regions[k].codes.length})` }]));
    const unit = D.regions[reg].unit || "Länder";
    const levels = Object.fromEntries(Object.entries(LAND.LEVELS).map(([k, l]) => [k, { name: `${l.name} (${LAND.poolFor(reg, k).length})` }]));
    return `<label class="field"><span>Karte</span>${sel("land-region", regions, reg)}</label>
      <label class="field"><span>Schwierigkeit</span>${sel("land-level", levels, level)}</label>
      ${freshHtml(nw.fresh, nw.total, unit, "land")}
      <div class="row2">
        <label class="field"><span>Runden</span><select id="land-rounds">${LAND.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(landOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>
        <label class="field"><span>Zeit pro Runde</span>${sel("land-timer", LAND.TIMERS, landOpts.timer)}</label>
      </div>
      <button id="start" class="btn primary big" ${playing().length < 1 || !LF ? "disabled" : ""}>Spiel starten</button>
      ${!LF ? `<p class="err small">Die Kartenbibliothek konnte nicht geladen werden.</p>` : ""}`;
  }
  function hlSettingsHtml() {
    return `<label class="field"><span>Länge</span><select id="hl-length">${Object.entries(HL.LENGTHS).map(([k, l]) =>
        `<option value="${k}" ${hlOpts.length === k ? "selected" : ""}>${esc(l.name)}</option>`).join("")}</select></label>
      <label class="field"><span>Kategorien</span><select id="hl-theme">${Object.entries(HL_THEMES).map(([k, n]) =>
        `<option value="${k}" ${hlOpts.theme === k ? "selected" : ""}>${n} (${hlCatCount(k)})</option>`).join("")}</select></label>
      <label class="field"><span>Schwierigkeit</span><select id="hl-level">${Object.entries(HL.LEVELS).map(([k, l]) =>
        `<option value="${k}" ${(HL.LEVELS[hlOpts.level] ? hlOpts.level : "gemischt") === k ? "selected" : ""}>${esc(l.name)} – ${esc(l.desc)}</option>`).join("")}</select></label>
      <button id="start" class="btn primary big" ${playing().length < 1 ? "disabled" : ""}>Spiel starten</button>
      `;
  }
  function fqSettingsHtml() {
    const n = playing().length;
    const sel = (id, obj, val) => `<select id="${id}">${Object.entries(obj).map(([k, t]) => `<option value="${k}" ${String(val) === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>`;
    const seen = store.get("s10-fq-seen") || [], all = fqAllKeys(), fresh = all.filter((k) => !seen.includes(k)).length;
    return `<label class="field"><span>Spielen bis</span><select id="fq-target">${FQ.TARGETS.map((t) =>
        `<option value="${t}" ${Number(fqOpts.target) === t ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
      <label class="field"><span>Antworten für den Fragensteller</span>${sel("fq-choices", FQ.CHOICES, fqOpts.choices)}</label>
      <label class="field"><span>Zeit zum Frage-Ausdenken</span>${sel("fq-write", FQ.WRITE, fqOpts.write)}</label>
      <label class="field"><span>Zeit zum Antworten</span>${sel("fq-answer", FQ.ANSWER, fqOpts.answer)}</label>
      ${freshHtml(fresh, all.length, "Aufgaben", "frage")}
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      ${playerNoteHtml(n, true)}`;
  }
  const fqRulesHtml = `
    <details class="rules"><summary>Regeln: Antwort sucht Frage</summary>
      <ul>
        <li>Einer ist <b>Fragensteller</b>: Er bekommt eine <b>Kategorie</b> und eine <b>Antwort</b>, z. B. „Religion“ und „3“. Die Antwort sieht nur er.</li>
        <li>Er denkt sich eine <b>Frage</b> aus, die in die Kategorie passt und genau diese Antwort hat – z. B. „Wie viele Weise kamen zur Krippe?“.</li>
        <li>Mit <b>„3 Antworten zur Auswahl“</b> (einstellbar in der Lobby) bekommt der Fragensteller zur Kategorie drei Antworten und sucht sich die aus, zu der ihm die kniffligste Frage einfällt.</li>
        <li>Der andere sieht die Frage und tippt seine <b>Antwort</b>. Stimmt sie, bekommt <b>er</b> den Punkt – sonst der <b>Fragensteller</b>.</li>
        <li>Wird die Antwort nicht erkannt (z. B. „die drei Könige“), sieht der Antwortende die Lösung: „Weiter“, wenn er danebenlag, oder „⚖️ Einspruch“ – dann entscheidet der Fragensteller ehrlich, ob sie zählt. Im selben Moment kann er auch „👎 Die Frage war unpassend“ melden.</li>
        <li>Fällt dem Fragensteller keine Frage ein, kann er <b>passen</b> – dann bekommt der andere den Punkt (ebenso, wenn die Zeit abläuft); antwortet der andere nicht rechtzeitig, der Fragensteller.</li>
        <li><b>Beschwerde:</b> Findet der Antwortende beim Ansehen der Lösung die Frage unpassend (passt nicht zur Antwort oder Kategorie, nicht eindeutig), tippt er „👎 Die Frage war unpassend“ (auch möglich, wenn seine Zeit abgelaufen ist). Gibt der Fragensteller ihm recht, zählt die Runde nicht.</li>
        <li>Die Rollen wechseln jede Runde. Wer zuerst die Zielpunkte hat, gewinnt.</li>
      </ul>
    </details>`;
  function duSettingsHtml() {
    const n = playing().length;
    return `<label class="field"><span>Spielen bis</span><select id="du-target">${DU.TARGETS.map((t) =>
        `<option value="${t}" ${Number(duOpts.target) === t ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
      <label class="field"><span>Zeit pro Antwort</span><select id="du-timer">${Object.entries(DU.TIMERS).map(([k, t]) =>
        `<option value="${k}" ${String(duOpts.timer) === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select></label>
      ${(() => { const seen = store.get("s10-du-seen") || [], fresh = DUDATA.filter((l) => !seen.includes(l.q)).length;
        return freshHtml(fresh, DUDATA.length, "Themen", "duell"); })()}
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      ${playerNoteHtml(n, true)}`;
  }
  const fwRulesHtml = `
    <details class="rules"><summary>Regeln: Fragewand</summary>
      <ul>
        <li>Auf der Tafel stehen <b>5 Kategorien</b> mit je vier Fragen: <b>10, 20, 30 und 50 Punkte</b> – je mehr Punkte, desto schwerer.</li>
        <li><b>Reihum</b> wählt jeder ein Feld und beantwortet die Frage – nur wer gewählt hat.</li>
        <li>Leichte Fragen haben oft <b>vier Antworten zur Auswahl</b>, sonst wird die Antwort eingetippt. Kleine Tippfehler zählen.</li>
        <li>Kleine Abweichungen und Tippfehler erkennt das Spiel als richtig. Erkennt es eine Antwort nicht, sieht man die Lösung und tippt <b>„Weiter“</b> – oder legt <b>Einspruch</b> ein, wenn die eigene Antwort doch stimmt; dann entscheiden die anderen.</li>
        <li>Richtig: die Punkte des Feldes. Falsch: keine Punkte, aber auch kein Abzug. Es gibt kein Zeitlimit.</li>
        <li>Alle kommen gleich oft dran: Gehen die Felder nicht genau auf, endet das Spiel nach der letzten vollen Runde (z. B. zu dritt nach 18 von 20 Feldern). Es gewinnt, wer die meisten Punkte hat.</li>
      </ul>
    </details>`;
  // Lobby: bis zu 5 Kategorien wählen, der Rest wird beim Start ausgelost
  function fwSettingsHtml() {
    const n = playing().length, sel = fwOpts.cats.filter((k) => WANDDATA.some((c) => c.key === k));
    const seen = store.get("s10-fw-seen") || [], all = fwAllKeys(), fresh = all.filter((k) => !seen.includes(k)).length;
    return `<div class="field"><span>Kategorien <small class="muted">${sel.length ? `${sel.length} gewählt${sel.length < 5 ? ` · ${5 - sel.length} werden ausgelost` : ""}` : "bis zu 5 wählen – sonst wird ausgelost"}</small></span>
        <div class="fw-catpick">${WANDDATA.map((c) => `<button type="button" class="fw-catchip ${sel.includes(c.key) ? "on" : ""}" data-fwcat="${c.key}" aria-pressed="${sel.includes(c.key)}"><span>${c.ico}</span>${esc(c.name)}</button>`).join("")}</div>
        ${sel.length ? `<button type="button" id="fw-none" class="btn ghost sm">Alle abwählen</button>` : ""}</div>
      ${freshHtml(fresh, all.length, "Fragen", "wand")}
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      ${playerNoteHtml(n)}`;
  }
  const duRulesHtml = `
    <details class="rules"><summary>Regeln: Listen-Duell</summary>
      <ul>
        <li>Es erscheint ein Thema mit einer festen Zahl von Antworten – meist zehn (z. B. „Die 10 größten Städte Österreichs“), manchmal mehr (z. B. „Die 27 EU-Länder“). Die Reihenfolge ist egal.</li>
        <li>Ihr nennt <b>abwechselnd</b> je eine Antwort. Für jede Antwort gibt es ein Feld mit „?“ – richtige Antworten werden dort aufgedeckt.</li>
        <li>Wer eine <b>falsche</b> oder eine <b>schon genannte</b> Antwort gibt oder die <b>Zeit</b> überzieht, verliert die Runde – der andere bekommt den Punkt.</li>
        <li>Sind alle gefunden, bekommt den Punkt, wer die <b>letzte</b> genannt hat.</li>
        <li>Kleine Tippfehler zählen. Ist eine Antwort nur ähnlich, entscheidet der Gegner, ob sie gilt.</li>
        <li>Wer anfängt, wechselt jede Runde. Wer zuerst die Zielpunkte hat, gewinnt.</li>
      </ul>
    </details>`;
  function schSettingsHtml() {
    const n = playing().length;
    return `<label class="field"><span>Spielweise</span><select id="sch-mode">${Object.entries(SCH.MODES).map(([k, m]) =>
        `<option value="${k}" ${schOpts.mode === k ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></label>
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      ${playerNoteHtml(n, true)}`;
  }
  const schRulesHtml = `
    <details class="rules"><summary>Regeln: Schnapsen</summary>
      <ul>
        <li>20 Karten: Ass (11 Augen), Zehner (10), König (4), Ober (3), Unter (2) in vier Farben. Jeder hat 5 Karten, die aufgedeckte Karte unter dem Stapel ist Trumpf.</li>
        <li>Solange der Stapel offen ist, darf man jede Karte werfen. Nach jedem Stich ziehen beide nach – der Gewinner zuerst.</li>
        <li><b>20 / 40 ansagen:</b> Wer auswirft und König und Ober einer Farbe hat, sagt 20 an (in Trumpf 40) und wirft eine der beiden aus. Die Augen zählen ab dem ersten eigenen Stich.</li>
        <li><b>Tauschen:</b> Mit dem Trumpf-Unter darf man die aufgedeckte Trumpfkarte holen. <b>Zudrehen:</b> Stapel schließen – ab dann muss man Farbe bedienen, höher stechen oder trumpfen.</li>
        <li>Wer zuerst <b>66 Augen</b> hat, gewinnt die Runde: 3 Punkte, wenn der andere keinen Stich hat, 2 wenn er unter 33 Augen hat, sonst 1. Wer zuerst 7 Punkte hat, gewinnt – der andere bekommt ein Bummerl.</li>
        <li>Gemütlich: die Augen werden angezeigt und „Aus“ geht automatisch. Klassisch: selbst mitzählen und „Aus!“ sagen – zu früh kostet die Runde.</li>
      </ul>
    </details>`;
  function wattenSettingsHtml() {
    const n = playing().length;
    return `<label class="field"><span>Spielen bis</span><select id="watten-target">${WAT.TARGETS.map((t) =>
        `<option value="${t}" ${Number(wattenOpts.target) === t ? "selected" : ""}>${t} Punkte (gestrichen ab ${t - 2})</option>`).join("")}</select></label>
      <label class="field"><span>Weli</span><select id="watten-weli">
        <option value="schell" ${wattenOpts.weli !== "trumpf" ? "selected" : ""}>kleinste Schelle (Guter beim Schell-Ass, als Schlag der Rechte)</option>
        <option value="trumpf" ${wattenOpts.weli === "trumpf" ? "selected" : ""}>kleinster Trumpf (als Schlag die beste Karte, kein Guter)</option></select></label>
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      ${playerNoteHtml(n, true)}`;
  }
  const wattenRulesHtml = `
    <details class="rules"><summary>Regeln: Watten zu zweit</summary>
      <ul>
        <li>33 Karten (7 bis Ass in Herz, Schelle, Laub, Eichel und der Weli – je nach Einstellung kleinste Schelle oder kleinster Trumpf). Jeder bekommt 5 Karten, der Geber wechselt.</li>
        <li>Der Nicht-Geber sagt den <b>Schlag</b> an, indem er auf eine seiner Karten tippt (deren Wert zählt). Ist der Weli Schlag, ist er der einzige Schlag: als kleinste Schelle ist er der Rechte und die Trumpf-Sieben der Gute, als kleinster Trumpf ist er die beste Karte (kein Guter). Dann tippt der Geber auf eine seiner Karten – deren Farbe wird <b>Trumpf</b>.</li>
        <li>Rangfolge: <b>Guter</b> (Trumpf einen Rang über dem Schlag, beim Ass die Trumpf-Sieben; ist der Weli die kleinste Schelle, ist beim Schell-Ass der Weli der Gute) · <b>Rechter</b> (Schlag in Trumpf) · andere Schläge (der erste gewinnt) · Trümpfe · ausgeworfene Farbe.</li>
        <li><b>Trumpf zugeben:</b> Wird Trumpf ausgeworfen (nicht der Gute), muss man Trumpf geben oder mit einem Schlag stechen, falls möglich. Sonst darf man jede Karte werfen.</li>
        <li>Wer zuerst 3 Stiche hat, gewinnt die Runde: 2 Punkte. <b>Bieten</b> erhöht um 1; lehnt der andere ab, bekommt der Bieter den bisherigen Wert.</li>
        <li><b>Gestrichen</b> ist man 2 Punkte vor dem Ziel: dann darf man nicht mehr bieten, aber vor der ersten eigenen Karte aufgeben (Gegner +2). Liegt der andere mindestens 4 zurück, gehen 4: Der Gestrichene muss vor seiner ersten Karte <b>halten</b> (um 4) oder <b>gehen</b> (Gegner +2). Sind beide gestrichen, wird nicht geboten.</li>
      </ul>
    </details>`;
  const hlRulesHtml = `
    <details class="rules"><summary>Regeln: Höher oder tiefer</summary>
      <ul>
        <li>Ein Begriff wird mit seinem Wert gezeigt (z. B. „Schlern – 2.563 m“), daneben der nächste Begriff ohne Wert.</li>
        <li>Tippe, ob der Wert des neuen Begriffs <b>höher</b> oder <b>tiefer</b> ist (bei Jahreszahlen: später oder früher). Alle wählen gleichzeitig, ohne Zeitdruck.</li>
        <li>Sobald alle gewählt haben, wird aufgedeckt: richtig = 1 Punkt. Der neue Begriff wird zur nächsten Vergleichszahl.</li>
        <li>Pro Kategorie ${HL.PER_CAT} Vergleiche, dann kommt die nächste Kategorie. Die meisten Punkte gewinnen.</li>
      </ul>
    </details>`;
  const obenRulesHtml = `
    <details class="rules"><summary>Regeln: Von oben</summary>
      <ul>
        <li>Du siehst einen Ort ganz nah von oben (Satellitenbild) – meistens eine bekannte Stadt.</li>
        <li>Alle ${GEO.OBEN.stepMs / 1000} Sekunden zoomt das Bild ein Stück heraus. Tippe auf der zweiten Karte, wo das ist, und lege deine Nadel fest.</li>
        <li>Punkte wie bei „Wo liegt das?“ (bis 1000, je näher, desto mehr), aber mal einem Faktor: früh getippt ×1, dann ×0,85, ×0,7 … bis ×0,4.</li>
        <li>Es kommen nur die wichtigsten Städte und ein paar Orte dran, die man von oben gut erkennt. Sie wiederholen sich erst, wenn alle dran waren.</li>
      </ul>
    </details>`;
  const siebzehnRulesHtml = `
    <details class="rules"><summary>Regeln: Siebzehn und Vier</summary>
      <ul>
        <li>Jeder bekommt zwei Karten, die nur er selbst sieht. Kartenwerte: Sieben bis Zehn zählen ihre Zahl, Unter 2, Ober 3, König 4, Ass 11.</li>
        <li>Alle entscheiden gleichzeitig: <b>„Weitere Karte“</b> zieht noch eine, <b>„Genug“</b> hört auf. Wer über 21 kommt, ist für die Runde raus.</li>
        <li>Wenn alle fertig sind, wird aufgedeckt: Wer am nächsten an 21 liegt, bekommt 3 Punkte, der Zweite 2, der Dritte 1. Genau 21 gibt einen Bonuspunkt.</li>
        <li><b>Feuer:</b> Zwei Asse auf der Hand schlagen alles (und zählen wie 21).</li>
        <li><b>Allein gegen die Bank:</b> Spielst du allein, zeigt die Bank eine Karte offen. Bist du fertig, deckt sie auf und zieht, bis sie mindestens 17 hat. Wer näher an 21 liegt, holt die Runde; über 21 verliert sofort, Gleichstand zählt für keinen. Wer mehr Runden holt, gewinnt.</li>
        <li>Von den anderen sieht man nur, wie viele Karten sie haben und ob sie schon fertig sind.</li>
      </ul>
    </details>`;
  const busRulesHtml = `
    <details class="rules"><summary>Regeln: Busfahrt</summary>
      <ul>
        <li>Alle fahren im <b>selben Bus</b>: Jede Runde hat <b>5 Stationen</b>, an jeder wird eine Karte für alle aufgedeckt. Vorher tippt jeder gleichzeitig und geheim:
          1. Figur (Unter, Ober, König, Ass) oder Zahl (Sieben bis Zehner)? (1 Punkt) · 2. Höher oder tiefer als die erste Karte? (1) · 3. Zwischen den ersten beiden oder außerhalb? (2) ·
          4. Welche Farbe genau? (10) · 5. Welcher Wert genau? (30)</li>
        <li><b>Richtig:</b> Die Punkte der Station kommen in deinen Rundentopf. <b>Falsch:</b> Dein Bus ist verunglückt – der Topf dieser Runde ist weg.</li>
        <li>Ab Station 2 kannst du statt zu tippen <b>aussteigen</b> und deinen Topf sicher mitnehmen. Wer alle 5 Stationen schafft, bekommt 44 Punkte.</li>
        <li>Werte von klein nach groß: Sieben, Acht, Neun, Zehner, Unter, Ober, König, Ass. Ist die neue Karte bei Station 2 oder 3 gleich hoch wie eine der Vergleichskarten, zählt das als richtig.</li>
        <li>Nach allen Runden gewinnt, wer die meisten Punkte hat.</li>
      </ul>
    </details>`;
  const stichRulesHtml = `
    <details class="rules"><summary>Regeln: Stichhaltig</summary>
      <ul>
        <li>Runde 1: Jeder bekommt 1 Karte, Runde 2: 2 Karten und so weiter. Die nächste Karte vom Stapel wird aufgedeckt – ihre Farbe ist <b>Trumpf</b>.</li>
        <li>Alle sagen <b>gleichzeitig und geheim</b> an, wie viele Stiche sie machen werden. Aufgedeckt wird erst, wenn alle angesagt haben.</li>
        <li>Dann wird reihum gespielt. Die angespielte Farbe musst du <b>bedienen</b>, wenn du kannst – sonst darfst du trumpfen oder abwerfen.</li>
        <li>Den Stich holt der höchste Trumpf, sonst die höchste Karte der angespielten Farbe. Wer sticht, spielt als Nächstes an.</li>
        <li>Reihenfolge in jeder Farbe: Sieben, Acht, Neun, Zehner, Unter, Ober, König, Ass.</li>
        <li><b>Punkte:</b> Genau getroffen = 10 + 2 pro Stich. Daneben = −2 pro Stich Abweichung.</li>
      </ul>
    </details>`;
  const schaetzenRulesHtml = `
    <details class="rules"><summary>Regeln: Schätzen</summary>
      <ul>
        <li>Eine Frage mit einer Zahl als Antwort, z. B. „Wie hoch ist der Ortler?“. Alle schätzen gleichzeitig (45 Sekunden).</li>
        <li>Wer am nächsten dran ist, bekommt 3 Punkte, der Zweite 2, der Dritte 1. Liegt man auf 1 % genau, gibt es einen Volltreffer-Bonus (+1).</li>
        <li>Kommazahlen mit Komma eingeben (z. B. 9,1). Tausenderpunkte sind erlaubt (1.370).</li>
        <li>Fragen: gemischt, nur Südtirol oder ohne Südtirol. Gespielte Fragen kommen erst wieder, wenn alle dran waren.</li>
      </ul>
    </details>`;
  const hinweisRulesHtml = `
    <details class="rules"><summary>Regeln: Hinweis für Hinweis</summary>
      <ul>
        <li>Gesucht ist ein Begriff, eine Person oder ein Ort. Alle 8 Sekunden kommt ein neuer, leichterer Hinweis – fünf insgesamt.</li>
        <li>Jeder hat <b>nur einen Versuch</b>. Wer beim 1. Hinweis richtig liegt, bekommt 5 Punkte, beim 2. Hinweis 4 … beim 5. Hinweis 1 Punkt.</li>
        <li>Kleine Tippfehler werden verziehen.</li>
      </ul>
    </details>`;
  const umrissRulesHtml = `
    <details class="rules"><summary>Regeln: Umriss-Rätsel</summary>
      <ul>
        <li>Man sieht nur den Umriss eines Landes – oder eines Bundeslandes, einer Region oder eines Kantons. Welches Gebiet ist das?</li>
        <li>Jeder hat einen Versuch (30 Sekunden). Richtig = 2 Punkte, wer als Erster richtig liegt, bekommt +1.</li>
        <li>Karten: Europa, Welt, deutsche und österreichische Bundesländer, italienische Regionen, Schweizer Kantone.</li>
        <li>Schwierigkeit: „Leicht“ nimmt nur bekannte Gebiete, „Profi“ nur die schwereren, „Gemischt“ alle. Sehr kleine Gebiete kommen nicht vor.</li>
      </ul>
    </details>`;
  const qbRulesHtml = `
    <details class="rules"><summary>Regeln: Stubenmeisterschaft</summary>
      <ul>
        <li>Ihr spielt euch quer durch die Spiele – jede Etappe ist eine Kurzfassung (z. B. 1 Karte Zehnkampf, 3 Orte bei „Wo liegt das?“, 1 Buchstabe Stadt, Land, Fluss).</li>
        <li>Pro Etappe zählt nur die Platzierung: Platz 1 bekommt ${QB.POINTS[0]} Partypunkte, Platz 2 ${QB.POINTS[1]}, Platz 3 ${QB.POINTS[2]}, alle anderen 1. Bei Gleichstand bekommen alle die höhere Punktzahl.</li>
        <li>Die letzte Etappe ist das Finale und zählt doppelt.</li>
        <li><b>Joker</b> (wenn der Gastgeber ihn einschaltet): Jeder hat einen Joker pro Partie. Vor einer Etappe gesetzt, zählen deine Partypunkte dieser Etappe doppelt (nicht im Finale).</li>
        <li><b>Thema:</b> „Südtirol“ oder „Welt“ wählt passende Inhalte für alle Etappen, „Gemischt“ alles durcheinander.</li>
        <li><b>Schwierigkeit:</b> „Leicht“ = bekannte Orte und Länder, deutliche Unterschiede bei Höher oder tiefer und nur leichte Buchstaben bei Stadt, Land, Fluss; „Profi“ = nur schwere Orte und Länder und möglichst knappe Vergleiche; „Gemischt“ = wie es kommt.</li>
        <li>Bei der Siegerehrung gibt es Auszeichnungen, z. B. Kartenleser, Wandelndes Lexikon oder Aufholjagd.</li>
        <li>Zwischen den Etappen gibt es eine Pause mit Zwischenstand und einer kurzen Erklärung des nächsten Spiels. Weiter geht es, wenn alle „Bereit“ getippt haben.</li>
        <li>Listen-Duell und Antwort sucht Frage sind nur dabei, wenn ihr genau zu zweit seid.</li>
      </ul>
    </details>`;
  const landRulesHtml = `
    <details class="rules"><summary>Regeln: Länder finden</summary>
      <ul>
        <li>Karten: Europa, Afrika, Asien, Amerika oder die ganze Welt – oder die deutschen und österreichischen Bundesländer, die italienischen Regionen und die Schweizer Kantone. Was außerhalb liegt, ist dunkel und zählt nicht.</li>
        <li>Ein Land wird genannt – tippe es auf der Karte an. Die Karte zeigt nur die Umrisse, keine Namen. Zum Ändern einfach ein anderes Land antippen, dann festlegen.</li>
        <li>Sehr kleine Länder (z. B. Vatikanstadt, Monaco, Inselstaaten) sind als kleine Kreise eingezeichnet. Mit zwei Fingern (oder dem Mausrad) kannst du hineinzoomen.</li>
        <li>Richtig = ${LAND.BASE} Punkte. Wer unter den Richtigen am schnellsten war, bekommt +${LAND.BONUS[0]}, der Zweite +${LAND.BONUS[1]}, der Dritte +${LAND.BONUS[2]}.</li>
        <li>Bei der Auflösung leuchtet das gesuchte Land grün; falsch getippte Länder werden mit Namen gezeigt.</li>
        <li>Schwierigkeit: „Leicht“ nimmt die bekannten Länder, „Profi“ nur die kleineren und schwereren, „Gemischt“ alle. Länder wiederholen sich erst, wenn alle dran waren.</li>
      </ul>
    </details>`;
  const geoRulesHtml = `
    <details class="rules"><summary>Regeln: Wo liegt das?</summary>
      <ul>
        <li>Ein Ort wird genannt – tippe auf der Karte (ohne Beschriftungen) dorthin, wo du ihn vermutest, und lege deine Nadel fest.</li>
        <li>Sind alle fertig oder ist die Zeit um, wird aufgelöst: richtige Stelle, alle Nadeln und die Entfernungen.</li>
        <li>Bis zu 1000 Punkte pro Runde – je näher, desto mehr. Die Skala passt sich der Region an.</li>
        <li>Schwierigkeit: „Leicht“ nimmt nur bekannte Orte, „Profi“ nur schwere, „Gemischt“ alle.</li>
        <li>Orte wiederholen sich erst, wenn alle der gewählten Auswahl einmal dran waren.</li>
      </ul>
    </details>`;
  function almSettingsHtml() {
    const mapSel = almMapOk(almOpts.map) ? almOpts.map : "zufall";
    return `<label class="field"><span>Tal</span><select id="alm-map"><option value="zufall" ${mapSel === "zufall" ? "selected" : ""}>🎲 Zufall – eines der Täler auslosen</option>
        ${ALM.MAP_LIST.map((m) => `<option value="${m.id}" ${mapSel === m.id ? "selected" : ""}>${esc(m.name)} – ${esc(m.desc)}</option>`).join("")}</select></label>
      <label class="field"><span>Länge</span><select id="alm-length">${Object.entries(ALM.LENGTHS).map(([k, l]) =>
        `<option value="${k}" ${(ALM.LENGTHS[almOpts.length] ? almOpts.length : "normal") === k ? "selected" : ""}>${esc(l.name)} – ${esc(l.desc)}</option>`).join("")}</select></label>
      <button id="start" class="btn primary big" ${playing().length < 1 ? "disabled" : ""}>Spiel starten</button>`;
  }
  function jagdSettingsHtml() {
    const len = JG.LENGTHS[jagdOpts.length] ? jagdOpts.length : "normal", mapSel = jagdMapOk(jagdOpts.map) ? jagdOpts.map : "zufall";
    return `<label class="field"><span>Jagdgebiet</span><select id="jagd-map"><option value="zufall" ${mapSel === "zufall" ? "selected" : ""}>🎲 Zufall – eines der Gebiete auslosen</option>
        ${JG.MAP_LIST.map((m) => `<option value="${m.id}" ${mapSel === m.id ? "selected" : ""}>${esc(m.name)} – ${esc(m.desc)}</option>`).join("")}</select></label>
      <label class="field"><span>Länge</span><select id="jagd-length">${Object.entries(JG.LENGTHS).map(([k, l]) =>
        `<option value="${k}" ${len === k ? "selected" : ""}>${esc(l.name)} – ${esc(l.desc)}</option>`).join("")}</select></label>
      <button id="start" class="btn primary big" ${playing().length < 2 ? "disabled" : ""}>Spiel starten</button>`;
  }
  const jagdRulesHtml = `
    <details class="rules"><summary>Regeln: Auf der Jagd</summary>
      <ul>
        <li>Jeder versteckt sein Wild im eigenen Revier – alle haben dasselbe Gelände (${JG.MAP_LIST.length} Jagdgebiete zur Wahl: ${JG.MAP_LIST.map((m) => m.name).join(", ")}): <b>Fuchs</b> (1 Feld, überall), <b>Hirschpaar</b> (2 Felder, Wald), <b>Gamsrudel</b> (3 Felder, Fels), <b>Murmeltier-Kolonie</b> (4 Felder, Wiese). Die Form ist frei, die Felder müssen aber zusammenhängen; verschiedene Tiere berühren sich nicht.</li>
        <li>Jeder jagt im <b>Revier seines Nachbarn</b> (im Kreis: Anna bei Berta, Berta bei Chris, Chris bei Anna; zu zweit beim anderen). Jede Runde schießen <b>alle gleichzeitig</b> einmal – ob du getroffen hast, siehst du sofort; die nächste Runde beginnt, wenn alle geschossen haben.</li>
        <li><b>Treffer</b> = Wild getroffen, <b>🐾 Fuchsspur</b> = direkt daneben (oben, unten, links, rechts) steht der Fuchs, sonst nichts. Nur der Fuchs hinterlässt Spuren.</li>
        <li><b>Punkte:</b> jeder Treffer +${JG.HIT}. Wer ein Tier fertig trifft, erlegt es und bekommt dazu ${JG.ANIMALS.map((a) => `${a.name} +${a.kill}`).join(", ")}.</li>
        <li><b>🔭 Hochsitz:</b> einmal pro Partie, kostet keinen Schuss: einen 3×3-Bereich im Revier deines Nachbarn beobachten. Nur du siehst das Ergebnis; gesichtetes Wild musst du danach noch schießen.</li>
        <li>Die Jagd endet nach der Rundenzahl (kurz 12, lang 20) – oder sobald jemand das Revier seines Nachbarn leergejagt hat (am Ende dieser Runde); die <b>ganze Jagd</b> geht genau so lange. Die größte Strecke (meiste Punkte) gewinnt.</li>
      </ul>
    </details>`;
  const almRulesHtml = `
    <details class="rules"><summary>Regeln: Almsommer</summary>
      <ul>
        <li>Jeder hat sein eigenes Tal (alle dasselbe – ${ALM.MAP_LIST.length} Täler zur Wahl: ${ALM.MAP_LIST.map((m) => m.name).join(", ")}). Jede Woche fallen <b>3 Würfel – für alle dieselben</b>. Jeder Würfel zeigt Gelände und Zahl. <b>Nimm einen</b> – auch denselben wie die anderen.</li>
        <li>Kreuze <b>bis zu so viele</b> Felder dieses Geländes an – zusammenhängend und angrenzend an schon Angekreuztes. Du startest am Hof 🏡. ☀️ Sonne = beliebiges Gelände.</li>
        <li><b>Jede Fläche hat eine Zahl.</b> Ist sie ganz angekreuzt, bekommst du diese Punkte. Flächen mit Hütte 🏠 oder Gipfel ⛰️ sind mehr wert – wer sie <b>als Erster</b> fertig hat, bekommt <b>+${ALM.BONUS.first}</b> (in derselben Woche alle).</li>
        <li>Zeigt ein Würfel ⚡, gibt's ein Gewitter. <b>Beim 5. Gewitter ist der Sommer vorbei</b> – sonst nach 14 Wochen. Wer dann die meisten Punkte hat, gewinnt.</li>
        <li>Alle spielen gleichzeitig; sobald alle angekreuzt haben, fallen die nächsten Würfel. Was die anderen in einer Woche ankreuzen, siehst du erst nach deinem eigenen Zug – nicht abschauen 😉</li>
      </ul>
    </details>`;
  function wlSettingsHtml() {
    const best = store.get("s10-wl-best");
    return `<div class="row2">
        <label class="field"><span>Impulse</span><select id="wl-pack">
          <option value="mix" ${wlOpts.pack === "mix" ? "selected" : ""}>Alle gemischt</option>
          ${Object.entries(WL.PACKS).map(([k, p]) => `<option value="${k}" ${wlOpts.pack === k ? "selected" : ""}>${p.name}</option>`).join("")}</select></label>
        <label class="field"><span>Länge</span><select id="wl-rounds">${WL.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(wlOpts.rounds) === n ? "selected" : ""}>${n} Impulse</option>`).join("")}</select></label>
      </div>
      ${best != null ? `<p class="muted small">Euer Rekord: <b>${best} Punkte</b></p>` : ""}
      <button id="start" class="btn primary big" ${playing().length < 2 ? "disabled" : ""}>Spiel starten</button>
      ${playerNoteHtml(view.players.length, false)}`;
  }
  const wlRulesHtml = `
    <details class="rules"><summary>Regeln: Gleiche Wellenlänge</summary>
      <ul>
        <li>Ihr spielt <b>zusammen</b>: Alle sehen denselben Impuls und schreiben geheim ein passendes Wort.</li>
        <li>Haben mindestens zwei dasselbe Wort, habt ihr die gleiche Wellenlänge 🎉</li>
        <li>Wenn nicht, werden eure Wörter der neue Impuls („Was verbindet … und …?“). Schon genannte Wörter sind tabu.</li>
        <li>Punkte fürs Team: 10 im 1. Versuch, dann 8, 6, 4, 2, 1. Nach 8 Versuchen oder beim Aufgeben gibt es 0.</li>
      </ul>
    </details>`;
  const slfRulesHtml = `
    <details class="rules"><summary>Regeln: Stadt, Land, Fluss</summary>
      <ul>
        <li>Jede Runde gibt es einen Buchstaben. Finde zu jeder Kategorie ein passendes Wort mit diesem Anfangsbuchstaben.</li>
        <li>Wer <b>alle Felder ausgefüllt</b> hat, darf <b>„Stopp!“</b> rufen – dann haben alle anderen noch 10 Sekunden. (Oder ihr spielt mit fester Zeit.)</li>
        <li>Mit „Jede Runde neu“ gibt es jede Runde andere Kategorien; sonst kommt auf Wunsch jede Runde eine 🎁 Überraschungskategorie dazu.</li>
        <li>Wisst ihr alle nicht mehr weiter, tippt jeder „🤷 Mir fällt nichts mehr ein“ – sind alle einverstanden, endet die Runde sofort.</li>
        <li><b>Punkte:</b> 10 für eine eigene Antwort, 5 wenn jemand dasselbe hat, 20 wenn nur du in der Kategorie etwas hast.</li>
        <li><b>Auswertung Kategorie für Kategorie:</b> Tippe 👎 bei einer Antwort, die nicht gilt. Stimmt die Mehrheit der anderen dagegen, zählt sie nicht. Mit 👍 lässt die Mehrheit eine Antwort mit falschem Anfangsbuchstaben doch gelten.</li>
      </ul>
    </details>`;

  // ---------- Fragen-Sets (Mehrfachauswahl) ----------
  function currentSets() {
    if (Array.isArray(chosenSets)) return L.SET_KEYS.filter((k) => chosenSets.includes(k));
    return L.normSets(view && view.cardSet);
  }
  function setLabel(sets) {
    const arr = L.normSets(sets);
    if (arr.length === 1 && arr[0] === "standard") return "";
    if (arr.length === L.SET_KEYS.length) return "Alle Sets · ";
    return arr.map((k) => SET_NAMES[k]).join(" + ") + " · ";
  }
  function setPickerHtml() {
    const cur = currentSets();
    const count = (k) => CARDS.filter((c) => (c.set || "standard") === k).length;
    const fresh = (sets) => (S ? L.unseenCount(CARDS, sets, S.seen) : null);
    const total = cur.reduce((n, k) => n + count(k), 0);
    return `<div class="field"><div class="pick-head"><span>Fragen – beliebig kombinierbar</span>${cur.length < L.SET_KEYS.length ? `<button type="button" id="setall" class="linkbtn" style="--gc:var(--accent)">Alle auswählen</button>`
      : `<button type="button" id="setnone" class="linkbtn" style="--gc:var(--accent)">Keine auswählen</button>`}</div>
      <div class="setlist">${L.SET_KEYS.map((k) => {
        const on = cur.includes(k), f = fresh([k]);
        return `<label class="setopt ${on ? "on" : ""}"><input type="checkbox" value="${k}" ${on ? "checked" : ""}>
          <span class="setname">${SET_NAMES[k]}</span><span class="setcount">${count(k)} Karten${f !== null ? ` · ${f} neu` : ""}</span></label>`;
      }).join("")}</div>
      ${cur.length ? (S ? freshHtml(fresh(cur), total, "Karten", "zehn", cur.length > 1 && cur.length < L.SET_KEYS.length ? cur.map((k) => esc(SET_NAMES[k])).join(" + ") : cur.length > 1 ? "alle Pakete" : "") : `<div class="fresh-row"><span class="muted small">Zusammen: <b>${total}</b> Karten</span></div>`)
        : `<div class="fresh-row"><span class="err small">Bitte mindestens ein Set auswählen.</span></div>`}</div>`;
  }
  function addReport(rep) {
    const r = {
      ts: Number(rep.ts) || Date.now(), by: cleanName(rep.by), set: String(rep.set || "").slice(0, 20),
      q: String(rep.q || "").slice(0, 200), item: rep.item ? String(rep.item).slice(0, 200) : "",
      answer: rep.answer ? String(rep.answer).slice(0, 100) : "", note: String(rep.note || "").slice(0, 500),
    };
    // Gastgeber kennt die Lösung auch für noch verdeckte Antworten
    if (isHost && S && S.cardIdx != null && !r.answer && r.item) {
      const c = CARDS[S.cardIdx];
      const it = c.q === r.q && c.items.find((x) => x[0] === r.item);
      if (it) r.answer = L.fmt(c, it[1]);
    }
    const list = store.get("s10-reports") || [];
    list.push(r); store.set("s10-reports", list.slice(-300));
  }
  function reportText(list) {
    return list.map((x, i) => `${i + 1}. [${x.set ? SET_NAMES[x.set] || x.set : "?"}] „${x.q}“` +
      (x.item ? ` → „${x.item}“` : " (ganze Karte)") + (x.answer ? ` – Karte sagt: ${x.answer}` : "") +
      (x.note ? `\n   Notiz: ${x.note}` : "") + `\n   (${x.by}, ${new Date(x.ts).toLocaleDateString("de-DE")})`).join("\n");
  }
  function reportsHtml() {
    const list = store.get("s10-reports") || [];
    if (!list.length) return "";
    return `<details class="rules reports"><summary>Gemeldete Karten (${list.length})</summary>
      <p class="muted small">Kopiere die Liste und schick sie mir – dann korrigiere ich die Karten.</p>
      <pre class="reptext">${esc(reportText(list))}</pre>
      <div class="row"><button id="repcopy" class="btn">Kopieren</button><button id="repclear" class="btn ghost">Liste leeren</button></div></details>`;
  }
  function bindReports(rerender) {
    const c = app.querySelector("#repcopy"), x = app.querySelector("#repclear");
    if (c) c.onclick = async () => {
      const t = reportText(store.get("s10-reports") || []);
      try { await navigator.clipboard.writeText(t); toast("Liste kopiert!", "ok"); } catch { prompt("Liste kopieren:", t); }
    };
    if (x) x.onclick = async () => { if (await askConfirm("Alle Meldungen löschen?", "", "Löschen", "Abbrechen", true)) { store.del("s10-reports"); rerender(); } };
  }
  function renderReport() {
    const m = document.getElementById("modal2");
    if (!reportOpen || !view || !view.card) { reportOpen = false; m.innerHTML = ""; return; }
    const card = view.card;
    m.innerHTML = `
      <div class="modal-back">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="m-item">⚑ Karte melden</div>
          <div class="m-q">„${esc(card.q)}“</div>
          <label class="field"><span>Welche Antwort?</span>
            <select id="repitem"><option value="">Die ganze Karte</option>
              ${card.items.map((it, i) => `<option value="${i}">${esc(it.t)}${it.r && it.r.a !== undefined ? ` (Karte: ${esc(L.fmt(card, it.r.a))})` : ""}</option>`).join("")}</select></label>
          <label class="field"><span>Was stimmt nicht? (optional)</span>
            <textarea id="repnote" rows="3" maxlength="500" placeholder="z. B. Die richtige Antwort ist …"></textarea></label>
          <button id="repsend" class="btn primary">Melden</button>
          <button class="btn ghost" data-close>Abbrechen</button>
        </div>
      </div>`;
    const close = () => { reportOpen = false; m.innerHTML = ""; };
    m.querySelector("[data-close]").onclick = close;
    m.querySelector(".modal-back").onclick = (e) => { if (e.target.classList.contains("modal-back")) close(); };
    m.querySelector("#repsend").onclick = () => {
      const idx = m.querySelector("#repitem").value, it = idx === "" ? null : card.items[Number(idx)];
      const rep = { ts: Date.now(), by: myName, set: card.set || "standard", q: card.q, item: it ? it.t : "",
        answer: it && it.r && it.r.a !== undefined ? L.fmt(card, it.r.a) : "", note: m.querySelector("#repnote").value.trim() };
      addReport(rep);
      if (!isHost) sendUp({ type: "report", report: rep });
      close(); toast("Danke! Karte gemeldet – die Liste findest du in der Lobby und auf der Startseite.", "ok");
    };
  }

  // Einladungslink teilen (Handy: Teilen-Menü, sonst in die Zwischenablage)
  async function invite() {
    const url = shareLink();
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title: "Spielstube", text: `Spiel mit! Spielstube ${roomCode}`, url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); toast("Einladungslink kopiert – einfach verschicken!", "ok"); }
    catch { prompt("Diesen Link verschicken:", url); }
  }

  // ---------- Antwort-Dialog ----------
  let modalFor = null, modalWait = null; // modalWait: abgeschickte Freitext-Antwort – Fenster bleibt offen, bis das Spiel sie geprüft hat
  function syncModal() {
    const v = view;
    // nicht erkannt: im selben Fenster Lösung zeigen – „Weiter“ (falsch) oder „Einspruch“ (die anderen entscheiden)
    const pend = v && v.phase === "playing" ? v.pending : null;
    if (pend && pend.check && pend.by === myId && !pend.judges.length) {
      const key = "chk:" + v.round + ":" + pend.pos;
      modalWait = null; selected = null;
      if (modalFor === key) return;
      modalFor = key;
      const card = v.card, it = card.items[pend.pos];
      modalEl.innerHTML = `
      <div class="modal-back zk-back">
        <div class="modal zk" role="dialog" aria-modal="true">
          <div class="m-q">${esc(card.q)}</div>
          <div class="m-item ${card.emoji ? "emo" : ""} ${card.emoji && graphemes(it.t) === 1 ? "solo" : ""}">${esc(it.t)}</div>
          ${checkHtml({ given: pend.given, solution: fmt(card, it.r.a), mine: true, who: (v.players.find((p) => p.id === myId) || { name: "Du" }).name,
            color: PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === myId)) % PLAYER_COLORS.length], zero: false })}
        </div>
      </div>`;
      const once = (t) => () => { modalEl.querySelectorAll("button").forEach((b) => b.disabled = true); send({ type: t }); };
      modalEl.querySelector('[data-chk="ok"]').onclick = once("checkOk");
      modalEl.querySelector('[data-chk="appeal"]').onclick = once("checkAppeal");
      return;
    }
    // abgeschickt, Prüfung läuft noch: Fenster offen lassen (statt kurz zu schließen und wieder zu öffnen)
    if (modalWait !== null && v && v.phase === "playing" && !pend && v.card && v.card.items[modalWait] && !v.card.items[modalWait].r) return;
    modalWait = null;
    const valid = v && v.phase === "playing" && !v.pending && !v.undoReq && v.players[v.turn] && v.players[v.turn].id === myId &&
      selected !== null && v.card.items[selected] && !v.card.items[selected].r;
    if (!valid) { selected = null; modalFor = null; modalEl.innerHTML = ""; return; }
    const key = v.round + ":" + selected;
    if (modalFor === key) return; // nicht neu zeichnen (Eingabe behalten)
    modalFor = key;
    const card = v.card, it = card.items[selected];
    let controls;
    if (card.type === "tf") {
      controls = `<p class="muted">Wähle nur, wenn du sicher bist, dass es <b>zutrifft</b>. Trifft es nicht zu, bist du raus.</p>
        <div class="opts"><button class="btn opt yes" data-v="true">Ja, das trifft zu!</button></div>`;
    } else if (card.type === "rank") {
      controls = `<div class="opts rank">${Array.from({ length: 10 }, (_, i) => `<button class="btn opt" data-v="${i + 1}">${i + 1}</button>`).join("")}</div>`;
    } else if (card.type === "choice" || card.type === "decade") {
      const ph = card.type === "decade" ? "z. B. 80er oder 1980er" : "Deine Antwort";
      controls = `<form class="numform textform"><input id="num" type="text" maxlength="60" autocomplete="off" autocapitalize="sentences" placeholder="${ph}"><button class="btn primary" type="submit">OK</button></form>
        ${card.type === "choice" ? `<p class="muted small">Kleine Tippfehler zählen. Erkennt das Spiel deine Antwort nicht, siehst du hier die Lösung.</p>` : ""}`;
    } else {
      const est = card.type === "estimate";
      controls = `<form class="numform"><input id="num" type="text" inputmode="${est ? "text" : "decimal"}" autocomplete="off" placeholder="${est ? "z. B. 1.500 oder 1,5 Mio" : "Zahl"}">${card.unit ? `<span class="unit">${esc(card.unit)}</span>` : ""}<button class="btn primary" type="submit">OK</button></form>
        ${est ? `<p class="muted small">Zählt, wenn du höchstens ${Math.round(((it.tol != null ? it.tol : card.tol) || 0.1) * 100)} % danebenliegst.</p>` : ""}`;
    }
    modalEl.innerHTML = `
      <div class="modal-back zk-back">
        <div class="modal zk" role="dialog" aria-modal="true">
          <div class="m-q">${esc(card.q)}</div>
          <div class="m-item ${card.emoji ? "emo" : ""} ${card.emoji && graphemes(it.t) === 1 ? "solo" : ""}">${esc(it.t)}</div>
          ${controls}
          <button class="btn ghost" data-close>Andere Antwort wählen</button>
        </div>
      </div>`;
    const submit = (value) => {
      const pos = selected; selected = null; modalFor = null;
      if (card.type === "choice") { // offen lassen: gleich kommt entweder das Ergebnis oder „Weiter / Einspruch“
        modalWait = pos; modalEl.querySelectorAll("button, input").forEach((x) => x.disabled = true);
        const f = modalEl.querySelector(".numform"); if (f) f.insertAdjacentHTML("afterend", `<p class="muted small m-wait">Wird geprüft …</p>`);
      } else modalEl.innerHTML = "";
      send({ type: "answer", pos, value }); render();
    };
    modalEl.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
      const d = b.dataset.v; submit(card.type === "tf" ? d === "true" : card.type === "rank" ? Number(d) : d);
    });
    const form = modalEl.querySelector(".numform");
    if (form) {
      const inp = form.querySelector("#num");
      setTimeout(() => inp.focus(), 30);
      form.onsubmit = (e) => {
        e.preventDefault();
        const raw = inp.value.trim();
        const isNum = card.type === "num" || card.type === "estimate";
        if (raw === "" || (isNum && !L.parseNumCandidates(raw).length) || (card.type === "decade" && !L.parseDecade(raw))) { inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 400); return; }
        submit(raw);
      };
    }
    const close = () => { selected = null; modalFor = null; modalEl.innerHTML = ""; render(); };
    modalEl.querySelector("[data-close]").onclick = close;
    modalEl.querySelector(".modal-back").onclick = (e) => { if (e.target.classList.contains("modal-back")) close(); };
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && selected !== null) { selected = null; render(); } });

  // ---------- Ansichten anschließen (js/ansicht/*.js) ----------
  // Feste Helfer direkt, veränderliche Zustände als Getter/Setter. Danach legt jede Ansicht ihre Funktionen in G ab.
  Object.defineProperties(G, Object.getOwnPropertyDescriptors({
    GAMES,
    LAND,
    LF,
    PLAYER_COLORS,
    QB,
    QZ,
    SCH,
    SLF,
    WAT,
    WCARDS,
    WL,
    app,
    askConfirm,
    confetti,
    esc,
    fitGeoMaps,
    headBrandHtml,
    nextBtnsHtml,
    checkHtml,
    nextBtnSwap,
    waitingNames,
    invite,
    get isHost() { return isHost; }, set isHost(v) { isHost = v; },
    leave,
    get myId() { return myId; }, set myId(v) { myId = v; },
    needLandData,
    render,
    send,
    sfx,
    statusBarHtml,
    store,
    toast,
    topActionsHtml,
    get view() { return view; }, set view(v) { view = v; },
    get wattenPriv() { return wattenPriv; }, set wattenPriv(v) { wattenPriv = v; },
  }));
  for (const f of window.S10Views || []) Object.defineProperties(G, Object.getOwnPropertyDescriptors(f(G)));

  if (!hasCrypto) {
    errorMsg = "Dieser Browser bietet hier keine Verschlüsselung an. Bitte die Seite über https:// (z. B. GitHub Pages) oder http://localhost öffnen.";
  }
  if (typeof mqtt === "undefined") {
    errorMsg = "Die Netzwerk-Bibliothek konnte nicht geladen werden. Bist du online?";
  }
  render();
})();
