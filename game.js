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
  // Symbol für Watten: drei aufgefächerte Wattkarten (Herz, Laub, Eichel aus dem eigenen Blatt)
  // Watten: drei aufgefächerte Karten, vorne der Weli mit lila Band
  function wattenIcon() {
    const C = window.S10WattenCards;
    const sym = (suit, x, y, w) => C ? `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="-16 -16 32 32">${C.sym(suit, 1).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>` : "";
    const card = (rot, inner) => `<g transform="rotate(${rot} 32 58)"><rect x="20" y="10" width="24" height="36" rx="3.5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>${inner}</g>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      ${card(-22, sym("laub", 20.5, 12, 14))}${card(-6, sym("herz", 20.5, 12, 14))}
      ${card(14, `${sym("schelle", 23, 12, 8)}${sym("schelle", 33, 12, 8)}${sym("schelle", 23, 36, 8)}${sym("schelle", 33, 36, 8)}
        <path d="M18.5 24 H45.5 L43.5 31 H20.5Z" fill="#7b2fb5"/><text x="32" y="29.8" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="5.6" fill="#fff" letter-spacing=".6">WELI</text>`)}</svg>`;
  }
  // Schnapsen: Ass und König mit goldener „66“-Plakette
  function schnapsenIcon() {
    const C = window.S10WattenCards;
    const sym = (suit, x, y, w) => C ? `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="-16 -16 32 32">${C.sym(suit, 1).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>` : "";
    const card = (rot, inner) => `<g transform="rotate(${rot} 32 58)"><rect x="20" y="10" width="24" height="36" rx="3.5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>${inner}</g>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      ${card(-14, `${sym("herz", 24, 13, 16)}${sym("herz", 24, 28, 16)}`)}
      ${card(10, `${sym("eichel", 20.5, 12, 12)}<path d="M26 26 L28 20 L31 24 L32 18 L33 24 L36 20 L38 26Z" fill="#ffc83d" stroke="#a37400" stroke-width=".8"/>
        <circle cx="32" cy="31" r="4.2" fill="#f3d2b0" stroke="#3a2a10" stroke-width=".8"/><path d="M27 44 C27 38 29 36 32 36 C35 36 37 38 37 44Z" fill="#c9883a" stroke="#3a2a10" stroke-width=".8"/>`)}
      <circle cx="47" cy="47" r="12" fill="#ffc83d" stroke="#a37400" stroke-width="1.6"/>
      <text x="47" y="52.2" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#2a1d00">66</text></svg>`;
  }
  // Symbol für „Schlaue Zehn“: der Ring mit zehn Antwortkärtchen um eine goldene „10“ (wie das Spielfeld)
  function zehnIcon() {
    const tiles = Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * Math.PI / 180, x = 32 + 23 * Math.cos(a), y = 32 + 23 * Math.sin(a);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.6" fill="${i < 3 ? "#2fbf71" : "#fbf6ea"}" stroke="#2a2170" stroke-width="1"/>`;
    }).join("");
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${tiles}
      <circle cx="32" cy="32" r="14.5" fill="#170f4d" stroke="#ffc83d" stroke-width="2"/>
      <text x="32" y="38.3" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#ffc83d">10</text></svg>`;
  }
  // Weitere gezeichnete Spielsymbole im gleichen Stil
  const svgIcon = (inner) => `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  // Wo liegt das?: gefaltete Landkarte mit roter Stecknadel
  const geoIcon = () => svgIcon(`
    <path d="M10 18 L24 13 L40 18 L54 13 V47 L40 52 L24 47 L10 52Z" fill="#e8f1dc" stroke="#5b6e4a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M24 13 V47 M40 18 V52" stroke="#5b6e4a" stroke-width="1" opacity=".6"/>
    <path d="M10 36 C18 32 22 40 30 36 S44 30 54 34" stroke="#4aa8ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M14 24 L20 22 M44 24 L50 22" stroke="#7ba05b" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 8 C30 8 26 12.5 26 18 C26 25 36 33 36 33 C36 33 46 25 46 18 C46 12.5 42 8 36 8Z" fill="#ef4b5a" stroke="#a32f3b" stroke-width="1.2"/>
    <circle cx="36" cy="18" r="3.6" fill="#fff"/>`);
  // Von oben: Satellitenbild im Sucher
  const obenIcon = () => svgIcon(`
    <rect x="12" y="12" width="40" height="40" rx="6" fill="#3d7a4a"/>
    <path d="M12 38 C22 34 26 44 36 40 S48 30 52 32 V46 a6 6 0 0 1 -6 6 H18 a6 6 0 0 1 -6 -6Z" fill="#3b7fbf"/>
    <path d="M18 18 h9 v7 h-9Z M31 20 h6 v5 h-6Z M20 28 h5 v4 h-5Z" fill="#d9c8a2"/>
    <path d="M12 30 L52 22" stroke="#e8e0c8" stroke-width="2" opacity=".8"/>
    <path d="M8 18 V8 H18 M46 8 H56 V18 M56 46 V56 H46 M18 56 H8 V46" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="3" fill="none" stroke="#ffc83d" stroke-width="1.6"/>`);
  // Stadt, Land, Fluss: Notizblock mit Buchstaben-Würfel
  const slfIcon = () => svgIcon(`
    <rect x="12" y="10" width="34" height="44" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
    <path d="M17 10 V7 M24 10 V7 M31 10 V7 M38 10 V7" stroke="#8a7a5a" stroke-width="2" stroke-linecap="round"/>
    <path d="M17 22 H40 M17 30 H40 M17 38 H40 M17 46 H32" stroke="#b9ad92" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M17 22 H29 M17 30 H33" stroke="#3ccf8e" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="34" y="34" width="22" height="22" rx="5" fill="#ffc83d" stroke="#c48f0a" stroke-width="1.4"/>
    <text x="45" y="51" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="16" fill="#2a1d00">A</text>`);
  // Gleiche Wellenlänge: zwei Sprechblasen mit derselben Welle
  const wlIcon = () => svgIcon(`
    <path d="M8 14 h22 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-14 l-6 6 v-6 h-2 a5 5 0 0 1 -5 -5 v-12 a5 5 0 0 1 5 -5Z" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.3"/>
    <path d="M34 26 h22 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-2 v6 l-6 -6 h-14 a5 5 0 0 1 -5 -5 v-12 a5 5 0 0 1 5 -5Z" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.3"/>
    <path d="M9 25 q3.5 -6 7 0 t7 0 t7 0" stroke="#ff6fae" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M35 37 q3.5 -6 7 0 t7 0 t7 0" stroke="#ff6fae" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
  // Listen-Duell: Liste mit nummerierten Zeilen, zwei Spielerfarben haken ab
  function duellIcon() {
    const rows = [0, 1, 2, 3, 4].map((r) => {
      const y = 16 + r * 8.2, done = r < 3, col = r % 2 ? "#4fc3f7" : "#ffc83d";
      return `<circle cx="20" cy="${y}" r="2.6" fill="${done ? col : "#d6cfb8"}"/><path d="M26 ${y} H${done ? 44 - r * 3 : 38}" stroke="${done ? "#5a4a2a" : "#cbbf9f"}" stroke-width="2.2" stroke-linecap="round"/>`;
    }).join("");
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="8" width="40" height="48" rx="5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>${rows}
      <circle cx="47" cy="47" r="11" fill="#ef4b5a" stroke="#a32f3b" stroke-width="1.4"/><text x="47" y="51.6" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#fff">?</text></svg>`;
  }
  // Antwort sucht Frage: Karte mit „= 3“ und ein Fragezeichen in der Sprechblase
  function frageIcon() {
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="16" width="26" height="36" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4" transform="rotate(-8 22 34)"/>
      <text x="22" y="41" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#2a1d00" transform="rotate(-8 22 34)">3</text>
      <path d="M32 10 h20 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-8 l-6 6 v-6 h-6 a6 6 0 0 1 -6 -6 v-14 a6 6 0 0 1 6 -6Z" fill="#c084fc" stroke="#7e3fb8" stroke-width="1.4"/>
      <text x="42" y="30" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#fff">?</text></svg>`;
  }
  // Symbol für „Höher oder tiefer“: zwei Karten, grüner Pfeil nach oben, roter nach unten
  function hlIcon() {
    const card = (x, rot, up) => `<g transform="rotate(${rot} ${x + 11} 50)"><rect x="${x}" y="14" width="22" height="34" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
      <path d="${up ? `M${x + 11} 21 L${x + 19} 33 H${x + 14.5} V41 H${x + 7.5} V33 H${x + 3}Z` : `M${x + 11} 41 L${x + 19} 29 H${x + 14.5} V21 H${x + 7.5} V29 H${x + 3}Z`}"
        fill="${up ? "#2fbf71" : "#ef4b5a"}" stroke="${up ? "#1d7a48" : "#a32f3b"}" stroke-width="1" stroke-linejoin="round"/></g>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${card(9, -10, true)}${card(33, 10, false)}</svg>`;
  }
  const GAMES = [
    { key: "zehn", color: "#8b7cff", name: "Schlaue Zehn", desc: "Quiz mit zehn Antworten", icon: zehnIcon() },
    { key: "hl", color: "#ffa64d", name: "Höher oder tiefer", desc: "Welcher Wert ist größer?", icon: hlIcon() },
    { key: "duell", color: "#3ccf8e", name: "Listen-Duell", desc: "Abwechselnd nennen – wer patzt, verliert", icon: duellIcon() },
    { key: "frage", color: "#c084fc", name: "Antwort sucht Frage", desc: "Antwort ist vorgegeben – erfinde die Frage", icon: frageIcon() },
    { key: "geo", color: "#4aa8ff", name: "Wo liegt das?", desc: "Orte auf der Karte finden", icon: geoIcon() },
    { key: "oben", color: "#2fd4c8", name: "Von oben", desc: "Satellitenbild erkennen", icon: obenIcon() },
    { key: "watten", color: "#e05a5a", name: "Watten", desc: "Kartenspiel zu zweit", icon: wattenIcon() },
    { key: "schnapsen", color: "#c9883a", name: "Schnapsen", desc: "66 – Kartenspiel zu zweit", icon: schnapsenIcon() },
    { key: "slf", color: "#3ccf8e", name: "Stadt, Land, Fluss", desc: "Buchstabe, Kategorien, Stopp!", icon: slfIcon() },
    { key: "wl", color: "#ff6fae", name: "Gleiche Wellenlänge", desc: "Gemeinsam auf dasselbe Wort kommen", icon: wlIcon() },
  ];
  const GEO = window.S10Geo, GEODATA = window.SCHLAU10_GEO || {}, LF = window.L; // LF = Leaflet (Kartenbibliothek)
  let geoOpts = Object.assign({ region: "suedtirol", level: "gemischt", rounds: 10, timer: "t30" }, store.get("s10-geo") || {});
  const WL = window.S10Wl;
  const HL = window.S10Hl, HLDATA = window.SCHLAU10_HL || {};
  let hlOpts = Object.assign({ length: "mittel" }, store.get("s10-hl") || {});
  const DU = window.S10Duell, DUDATA = window.SCHLAU10_DUELL || [];
  let duOpts = Object.assign({ target: 5, timer: "30" }, store.get("s10-du") || {});
  const FQ = window.S10Frage, FQDATA = window.SCHLAU10_FRAGE || [];
  let fqOpts = Object.assign({ target: 5, write: "0", answer: "0" }, store.get("s10-fq") || {});
  const fqAllKeys = () => FQDATA.flatMap((c, ci) => c.answers.map((_, ai) => FQ.keyOf(ci, ai)));
  const WAT = window.S10Watten, WCARDS = window.S10WattenCards;
  let wattenOpts = Object.assign({ target: 15, weli: "schell" }, store.get("s10-watten") || {});
  const SCH = window.S10Schnapsen;
  let schOpts = Object.assign({ mode: "gemuetlich" }, store.get("s10-schnapsen") || {});
  let wattenPriv = null; // eigene Hand (bei Gästen privat vom Gastgeber geschickt)
  let wlOpts = Object.assign({ pack: "mix", rounds: 5 }, store.get("s10-wl") || {});
  let chosenGame = GAMES.some((g) => g.key === store.get("s10-game")) ? store.get("s10-game") : "zehn";
  let slfOpts = Object.assign({ preset: "klassisch", custom: "", rounds: 5, timer: "stopp" }, store.get("s10-slf") || {}); // Auswahl in der Lobby merken (Lobby wird bei jedem Update neu gezeichnet)
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
    isHost = true; roomCode = genCode();
    S = L.newGame(CARDS.length);
    S.seen = store.get("s10-seen") || [];
    S.geoSeen = store.get("s10-geo-seen") || {};
    S.hostId = myId;
    S.game = chosenGame;
    L.addPlayer(S, myId, name);
    hostOpen(0);
  }

  function hostResume(saved) {
    isHost = true; roomCode = saved.code; S = saved.state;
    if (!S.geoSeen) S.geoSeen = store.get("s10-geo-seen") || {};
    if (saved.hostId) { myId = saved.hostId; setTabId(myId); }
    S.hostId = myId;
    S.players.forEach((p) => { if (p.id !== myId) p.connected = false; });
    hostOpen(saved.broker || 0);
  }

  async function hostOpen(idx, tries = 0) {
    status = "Spielstube wird geöffnet …";
    view = L.publicState(S, CARDS, roomCode); render();
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
    if ((S.phase === "slf" && SLF.tick(S, Date.now())) || (S.phase === "wl" && WL.tick(S)) || (S.phase === "geo" && GEO.tick(S, Date.now())) || (S.phase === "hl" && HL.tick(S, Date.now())) || (S.phase === "duell" && DU.tick(S, Date.now())) || (S.phase === "frage" && FQ.tick(S, Date.now()))) publish();
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
      if (!host || S.phase !== "lobby" || !GAMES.some((g) => g.key === action.game)) return false;
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
    if (type === "start" && host && S.phase === "lobby") S.wishes = {}; // Wünsche gelten bis zum Spielstart
    if (type === "start" && action.game === "slf") {
      if (!host || S.phase !== "lobby") return false;
      SLF.start(S, action.opts, now); return true;
    }
    if (type === "start" && action.game === "wl") {
      if (!host || S.phase !== "lobby") return false;
      WL.start(S, action.opts); return true;
    }
    if (type === "start" && action.game === "geo") {
      if (!host || S.phase !== "lobby") return false;
      GEO.start(S, action.opts, now); return true;
    }
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
    if (type.startsWith("geo")) return S.phase === "geo" && GEO.apply(S, pid, action, host, now);
    if (type.startsWith("slf")) return S.phase === "slf" && SLF.apply(S, pid, action, host, now);
    if (type.startsWith("wl")) return S.phase === "wl" && WL.apply(S, pid, action, host);
    if (type === "start") S.game = "zehn";
    if (type === "lobby" && host) { S.slf = null; S.wl = null; S.geo = null; S.hl = null; S.duell = null; S.frage = null; S.watten = null; S.schnapsen = null; }
    return L.applyAction(S, CARDS, pid, action, host);
  }

  function publish() {
    // In der Lobby keine „Geister“: getrennte Spieler entfernen (z. B. nach einem Spiel oder Neustart des Gastgebers).
    // Wer noch da ist, meldet sich automatisch wieder an.
    if (S.phase === "lobby") S.players = S.players.filter((p) => p.connected || p.id === myId);
    view = L.publicState(S, CARDS, roomCode);
    view.game = S.game || "zehn";
    if (S.phase === "lobby") view.lobby = {
      wishes: Object.fromEntries(Object.entries(S.wishes || {}).filter(([id]) => S.players.some((p) => p.id === id))),
      sets: currentSets(), target: chosenTarget || 30,
      slf: { preset: slfOpts.preset, cats: SLF.categoriesFrom(slfOpts), rounds: Number(slfOpts.rounds), timer: slfOpts.timer },
      wl: { pack: wlOpts.pack, rounds: Number(wlOpts.rounds) },
      geo: { region: geoOpts.region, level: geoOpts.level, rounds: Number(geoOpts.rounds), timer: geoOpts.timer },
      hl: { length: hlOpts.length },
      duell: { target: Number(duOpts.target), timer: duOpts.timer },
      frage: { target: Number(fqOpts.target), write: fqOpts.write, answer: fqOpts.answer },
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
    view.duell = S.phase === "duell" ? DU.publicState(S, Date.now()) : null;
    view.frage = S.phase === "frage" ? FQ.publicState(S, Date.now()) : null;
    if (view.frage) { // gespielte Aufgaben merken – erst wieder, wenn alle durch sind
      const k = FQ.keyOf(...S.frage.order[S.frage.li]), seen = store.get("s10-fq-seen") || [];
      if (!seen.includes(k)) { const all = fqAllKeys(), next = seen.concat(k).filter((x) => all.includes(x)); store.set("s10-fq-seen", all.every((x) => next.includes(x)) ? [k] : next); }
    }
    if (view.duell) { // gespielte Themen merken: sie kommen erst wieder, wenn alle einmal dran waren (wie bei Schlaue Zehn)
      const q = view.duell.list.q, seen = store.get("s10-du-seen") || [];
      if (!seen.includes(q)) {
        const next = seen.concat(q).filter((x) => DUDATA.some((l) => l.q === x));
        store.set("s10-du-seen", DUDATA.every((l) => next.includes(l.q)) ? [q] : next); // alles durch: von vorn
      }
    }
    view.watten = S.phase === "watten" ? WAT.publicState(S) : null;
    view.schnapsen = S.phase === "schnapsen" ? SCH.publicState(S) : null;
    const CARD_GAMES = { watten: WAT, schnapsen: SCH, frage: FQ }; // private Infos nur an den jeweiligen Spieler
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
  function rtcSend(to, msg) { if (mq && roomTopic) sendSealed(T("rtc/" + to), { ...msg, from: myId }, { qos: 1 }); }
  // Kamera und Mikrofon getrennt schaltbar; bei jeder Änderung wird die Verbindung zu allen neu aufgebaut
  async function mediaSet(wantCam, wantMic) {
    let next = null;
    if (wantCam || wantMic) {
      try {
        next = await navigator.mediaDevices.getUserMedia({
          // HD-Auflösung, damit das Bild auch im großen Anruf-Fenster scharf ist; bei schwacher Leitung regelt der Browser selbst herunter
          video: wantCam ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 }, facingMode: "user" } : false,
          audio: wantMic ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false });
      } catch (e) { toast(wantMic && !wantCam ? "Mikrofon nicht verfügbar oder nicht erlaubt." : "Kamera/Mikrofon nicht verfügbar oder nicht erlaubt.", "bad"); return; }
    }
    if (camStream) camStream.getTracks().forEach((t) => t.stop());
    camStream = next; camOn = !!wantCam; micOn = !!wantMic;
    for (const [id, pc] of pcOut) { pc.close(); rtcSend(id, { t: "bye" }); }
    pcOut.clear(); camOpen = true;
    camSync(); renderCamDock(); render();
  }
  const camToggle = () => mediaSet(!camOn, micOn);
  const micToggle = () => mediaSet(camOn, !micOn);
  const camPeers = () => (view && view.players ? view.players.filter((p) => p.id !== myId && p.connected).map((p) => p.id) : []);
  async function camSync() {
    const ps = camPeers();
    for (const id of [...remoteCams.keys()]) if (!ps.includes(id)) { const pc = pcIn.get(id); if (pc) pc.close(); pcIn.delete(id); remoteCams.delete(id); renderCamDock(); }
    if (!camStream || !mq || !roomTopic) return;
    for (const [id, pc] of pcOut) if (!ps.includes(id) || pc.connectionState === "failed" || pc.connectionState === "closed") { pc.close(); pcOut.delete(id); }
    for (const id of ps) if (!pcOut.has(id)) {
      const pc = new RTCPeerConnection(RTC_CFG); pcOut.set(id, pc);
      camStream.getTracks().forEach((t) => pc.addTrack(t, camStream));
      pc.onicecandidate = (e) => { if (e.candidate) rtcSend(id, { t: "ice", dir: "out", c: e.candidate.toJSON() }); };
      try { await pc.setLocalDescription(await pc.createOffer()); rtcSend(id, { t: "offer", sdp: pc.localDescription.sdp }); } catch { pcOut.delete(id); }
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
        const pc = new RTCPeerConnection(RTC_CFG); pcIn.set(id, pc);
        pc.ontrack = (e) => { remoteCams.set(id, e.streams[0] || new MediaStream([e.track])); renderCamDock(); };
        pc.onicecandidate = (e) => { if (e.candidate) rtcSend(id, { t: "ice", dir: "in", c: e.candidate.toJSON() }); };
        pc.onconnectionstatechange = () => { if (pc.connectionState === "failed" && pcIn.get(id) === pc) { remoteCams.set(id, "failed"); renderCamDock(); } };
        await pc.setRemoteDescription({ type: "offer", sdp: m.sdp }); await flushIce("in:" + id, pc);
        await pc.setLocalDescription(await pc.createAnswer());
        rtcSend(id, { t: "answer", sdp: pc.localDescription.sdp });
      } else if (m.t === "answer") {
        const pc = pcOut.get(id);
        if (pc && pc.signalingState === "have-local-offer") { await pc.setRemoteDescription({ type: "answer", sdp: m.sdp }); await flushIce("out:" + id, pc); }
      } else if (m.t === "ice" && m.c) {
        if (m.dir === "out") await addIce("in:" + id, pcIn.get(id), m.c); else await addIce("out:" + id, pcOut.get(id), m.c);
      } else if (m.t === "bye") {
        const pc = pcIn.get(id); if (pc) pc.close(); pcIn.delete(id); remoteCams.delete(id); renderCamDock();
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
    const hasVideo = stream && stream !== "failed" && stream.getVideoTracks().some((t) => t.readyState === "live");
    const hasAudio = stream && stream !== "failed" && stream.getAudioTracks().length > 0;
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
    camDock.classList.toggle("pip", !!camStream && camOn && remoteCams.size > 0);
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
    camDock.querySelector(".camtoggle").textContent = camOpen ? "–" : "+";
    const anyAudio = [...remoteCams.values()].some((st) => st && st !== "failed" && st.getAudioTracks().length);
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
    if (!dock) renderCamDock();
    else {
      camDock.classList.remove("stage"); camBack.classList.remove("show");
      const sz = camDock.querySelector(".camsize"); if (sz) { sz.textContent = "⤢"; sz.title = "Großes Anruf-Fenster öffnen"; } document.body.style.setProperty("--cam-h", "0px"); document.body.style.setProperty("--cam-w", "0px");
    } // in der Lobby liegt die Kamera in der Spalte – Hinweise ganz unten
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
  function render() {
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
    if (view.phase === "lobby") renderLobby(); else if (view.phase === "slf") renderSlf(); else if (view.phase === "wl") renderWl(); else if (view.phase === "geo") renderGeo(); else if (view.phase === "hl") renderHl(); else if (view.phase === "duell") renderDuell(); else if (view.phase === "frage") renderFrage(); else if (view.phase === "watten") renderWatten(); else if (view.phase === "schnapsen") renderSchnapsen(); else renderGame();
    camDockPlace();
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
      toggle() { muted = !muted; store.set("s10-muted", muted); if (!muted) { unlock(); this.turn(); } },
      // bewusst sparsam: nur wenn man gebraucht wird und am Spielende
      turn: () => play(() => { tone(880, 0, 0.14, "sine", 0.12); tone(1175, 0.15, 0.24, "sine", 0.12); }),
      win: () => play(() => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle", 0.1)); }),
      lose: () => play(() => { tone(392, 0, 0.22, "triangle", 0.08); tone(330, 0.2, 0.35, "triangle", 0.08); }),
    };
  })();

  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas"), dpr = devicePixelRatio || 1;
    cv.className = "confetti"; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    document.body.appendChild(cv);
    const c = cv.getContext("2d"); c.scale(dpr, dpr);
    const colors = ["#ffc83d", "#2fbf71", "#ef4b5a", "#5b48c9", "#ffffff", "#4fc3f7"];
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, col: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      const age = (t - t0) / 1000;
      c.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = Math.max(0, 1 - age / 3.5);
        c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
      });
      if (age < 3.5) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  const BASE_TITLE = document.title;
  let prev = null; // vorheriger Zustand, um Wechsel zu erkennen
  function reactToChanges(v) {
    const cur = v.players && v.players[v.turn];
    const now = {
      phase: v.phase, round: v.round,
      myTurn: v.phase === "playing" && cur && cur.id === myId && !v.pending && !v.undoReq,
      mustJudge: !!(v.phase === "playing" && v.pending && v.pending.judges.includes(myId) && v.pending.by !== myId),
      mustVote: !!(v.undoReq && v.undoReq.approvers.includes(myId)),
      slfKey: v.slf ? v.slf.round + ":" + v.slf.step : null,
      wlKey: v.wl ? v.wl.impulse + ":" + v.wl.attempt + ":" + v.wl.step : null,
      geoKey: v.geo ? v.geo.round + ":" + v.geo.step : null,
      hlKey: v.hl ? v.hl.catNo + ":" + v.hl.pos + ":" + v.hl.step : null,
      wMine: !!(v.watten && ((v.watten.turn === myId) || (v.watten.step === "schlag" && v.watten.vorhand === myId) ||
        (v.watten.step === "trumpf" && v.watten.dealer === myId) || (v.watten.bid && v.watten.bid.by !== myId))),
      wStep: v.watten ? v.watten.step : null,
      xMine: !!(v.schnapsen && v.schnapsen.turn === myId),
      xStep: v.schnapsen ? v.schnapsen.step : null,
    };
    if (prev) {
      const needsMe = (now.myTurn && !prev.myTurn) || (now.mustJudge && !prev.mustJudge) || (now.mustVote && !prev.mustVote);
      if (needsMe) { sfx.turn(); if (navigator.vibrate) try { navigator.vibrate(120); } catch {} }
      if (now.geoKey && now.geoKey !== prev.geoKey) {
        if (v.geo.step === "guess") sfx.turn();
        if (v.geo.step === "final") { if (v.geo.winners.includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      if (now.wMine && !prev.wMine) { sfx.turn(); if (navigator.vibrate) try { navigator.vibrate(80); } catch {} }
      if (now.xMine && !prev.xMine) sfx.turn();
      if (now.xStep === "final" && prev.xStep !== "final") { if ((v.schnapsen.winners || []).includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      if (now.wStep === "final" && prev.wStep !== "final") { if ((v.watten.winners || []).includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      if (now.hlKey && now.hlKey !== prev.hlKey) {
        if (v.hl.step === "reveal" && v.hl.result && myId in v.hl.result.ok) { if (v.hl.result.ok[myId]) sfx.turn(); }
        if (v.hl.step === "final") { if (v.hl.winners.includes(myId)) sfx.win(); else sfx.lose(); confetti(); }
      }
      if (now.wlKey && now.wlKey !== prev.wlKey) {
        if (v.wl.step === "reveal" && v.wl.result) { if (v.wl.result.hit) { sfx.win(); confetti(); } else sfx.lose(); }
        if (v.wl.step === "final") confetti();
      }
      if (now.slfKey && now.slfKey !== prev.slfKey) {
        if (v.slf.step === "writing") sfx.turn();
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
    <details class="rules"><summary>Regeln: Schlaue Zehn</summary>
      <ul>
        <li>Jede Karte hat eine Frage und <b>10 Antworten</b>.</li>
        <li>Wer dran ist, wählt eine noch offene Antwort und beantwortet sie – oder <b>passt</b>.</li>
        <li>Richtig: +1 Punkt für diese Runde, dann ist der Nächste dran.</li>
        <li>Falsch: <b>alle Punkte dieser Runde sind weg</b> und du bist für die Runde raus.</li>
        <li>Wer passt, sichert seine Rundenpunkte. Die Runde endet, wenn alle raus sind, gepasst haben oder alle 10 Antworten aufgedeckt sind.</li>
        <li>Wer zuerst die Zielpunktzahl erreicht, gewinnt (bei Gleichstand: beide).</li>
      </ul>
    </details>`;

  function renderStart() {
    const saved = store.get("s10-host");
    const resumable = saved && saved.state && Date.now() - saved.ts < 24 * 3600e3;
    const guestSaved = store.get("s10-guest");
    const code = urlRoom || "";
    app.innerHTML = `
      <main class="screen start">
        <h1 class="logo">${LOGO}</h1>
        <p class="tag">${GAMES.length} Spiele für gemütliche Runden – online gemeinsam spielen.</p>
        <div class="start-games" aria-label="Spiele">${GAMES.map((g) => `<span class="gt-icon sm" style="--gc:${g.color}" title="${esc(g.name)}">${g.icon}</span>`).join("")}</div>
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
          <ul class="game-list">${GAMES.map((g) => `<li style="--gc:${g.color}"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span><span><b>${esc(g.name)}</b> – ${esc(g.desc)}</span></li>`).join("")}</ul>
          <p class="muted small">Eine Spielstube eröffnen, Freunde per Link einladen, in der Lobby das Spiel wählen. Die genauen Regeln stehen dort beim jeweiligen Spiel.</p>
        </details>
        ${reportsHtml()}
      </main>`;
    bindReports(renderStart);
    const nameIn = app.querySelector("#name");
    const getName = () => {
      const n = nameIn.value.trim();
      if (!n) { errorMsg = "Bitte gib zuerst deinen Namen ein."; renderStart(); app.querySelector("#name").focus(); return null; }
      errorMsg = ""; myName = cleanName(n); store.set("s10-name", myName); return myName;
    };
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#create", () => { const n = getName(); if (n) hostCreate(n); });
    on("#resume", () => { const n = getName(); if (n) hostResume(saved); });
    on("#joinUrl", () => { const n = getName(); if (n) guestJoin(code, n, urlBroker ?? 0, urlBroker !== null); });
    const joinCode = () => {
      const c = app.querySelector("#code").value.trim().toUpperCase();
      if (!/^[A-Z]{5}$/.test(c)) { errorMsg = "Der Stuben-Code hat 5 Buchstaben."; return renderStart(); }
      const n = getName(); if (n) guestJoin(c, n, 0, false);
    };
    on("#join", joinCode);
    const codeIn = app.querySelector("#code");
    if (codeIn) codeIn.onkeydown = (e) => { if (e.key === "Enter") joinCode(); };
  }

  function renderLobby() {
    const isFile = location.protocol === "file:";
    const rules = ({ slf: slfRulesHtml, wl: wlRulesHtml, geo: geoRulesHtml, oben: obenRulesHtml, hl: hlRulesHtml, duell: duRulesHtml, frage: fqRulesHtml, watten: wattenRulesHtml, schnapsen: schRulesHtml })[isHost ? chosenGame : view.game] || rulesHtml;
    const settings = !isHost ? "" : `
          ${chosenGame === "slf" ? slfSettingsHtml() : ""}
          ${chosenGame === "wl" ? wlSettingsHtml() : ""}
          ${chosenGame === "geo" || chosenGame === "oben" ? geoSettingsHtml(chosenGame === "oben") : ""}
          ${chosenGame === "hl" ? hlSettingsHtml() : ""}
          ${chosenGame === "duell" ? duSettingsHtml() : ""}
          ${chosenGame === "frage" ? fqSettingsHtml() : ""}
          ${chosenGame === "watten" ? wattenSettingsHtml() : ""}
          ${chosenGame === "schnapsen" ? schSettingsHtml() : ""}
          ${chosenGame === "zehn" ? `
            ${setPickerHtml()}
            ${S && S.seen && S.seen.length ? `<div class="seen-row"><span class="muted small">${S.seen.length} Karte${S.seen.length === 1 ? "" : "n"} schon gespielt – die kommen erst wieder, wenn alle durch sind.</span>
              <button id="resetSeen" class="btn ghost sm">Gespielte Karten vergessen</button></div>` : ""}
            <label class="field"><span>Spielen bis</span>
              <select id="target">${[10, 15, 20, 30, 40].map((t) => `<option value="${t}" ${t === (chosenTarget || view.target || 30) ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
            <button id="start" class="btn primary big" ${view.players.length < 1 || !currentSets().length ? "disabled" : ""}>Spiel starten</button>
            ${view.players.length < 2 ? `<p class="muted small">Du kannst auch allein starten, um es auszuprobieren.</p>` : ""}
          ` : ""}`;
    // Am Computer: Gastgeber in drei Spalten (Stube & Spieler · Spiel wählen · Einstellungen), Gäste in zwei
    app.innerHTML = `
      <main class="screen lobby ${isHost ? "lobby-host" : "lobby-guest"}">
        <h1 class="logo small">${LOGO}</h1>
        <div class="lobby-cols">
          <div class="panel lobby-col">
            <button type="button" class="code code-copy" id="copycode" title="Code kopieren" aria-label="Stuben-Code ${esc(view.code)} – zum Kopieren tippen">${esc(view.code)}</button>
            ${isFile ? `<p class="muted small">Schick deinen Mitspielern diesen Code. Sie öffnen das Spiel bei sich und geben ihn unter „Beitreten“ ein.</p>`
              : `<input id="link" type="hidden" value="${esc(shareLink())}"><button id="lobbyInvite" class="btn">🔗 Mitspieler einladen</button>`}
            <h3>Spieler</h3>
            <ul class="plist">${view.players.map((p) => `<li><span class="dot ${p.connected ? "on" : ""}"></span>${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}${p.id === view.hostId ? ` <span class="host-tag">Gastgeber</span>` : ""}</li>`).join("")}</ul>
            ${view.players.length < 2 ? `<p class="muted small waiting">Warte auf Mitspieler …</p>` : ""}
            <p class="err">${esc(status)}</p>
            ${camOK ? `<div class="row2"><button class="btn ghost ${camOn ? "cam-on" : ""}" data-cam title="${camOn ? "Kamera ausschalten" : "Kamera einschalten"}">📷 Kamera${camOn ? " ✓" : ""}</button>
              <button class="btn ghost ${micOn ? "cam-on" : ""}" data-mic title="${micOn ? "Mikrofon ausschalten" : "Mikrofon einschalten"}">🎤 Mikro${micOn ? " ✓" : ""}</button></div>
              <div id="camslot"></div>` : ""}
            <button id="leave" class="btn ghost">${isHost ? "Stube schließen" : "Verlassen"}</button>
            ${reportsHtml()}
          </div>
          ${isHost ? `<div class="lobby-col lobby-games"><div class="panel">${gamePickerHtml()}</div><div class="rules-desk">${rules}</div></div>
          <div class="lobby-col lobby-settings"><div class="panel">${settings}</div><div class="rules-mob">${rules}</div></div>`
          : `<div class="lobby-col lobby-games"><div class="panel">${guestGamesHtml()}</div></div>
          <div class="lobby-col lobby-settings"><div class="panel">${gameBannerHtml()}${guestSettingsHtml()}
              <p class="muted">Warte, bis der Gastgeber das Spiel startet …</p></div>${rules}</div>`}
        </div>
      </main>`;
    bindReports(renderLobby);
    bindGamePicker();
    app.querySelectorAll("[data-wish]").forEach((b) => b.onclick = () => {
      if (b.dataset.wish === view.game) return toast("Das wird gerade gespielt.", "info");
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
    const reset = app.querySelector("#resetSeen");
    if (reset) reset.onclick = async () => {
      if (!(await askConfirm("Gespielte Karten vergessen?", "Danach kann jede Karte wieder vorkommen.", "Vergessen"))) return;
      S.seen = []; store.set("s10-seen", []); publish(); toast("Speicher gelöscht – alle Karten sind wieder neu.", "ok");
    };
    app.querySelectorAll('.setopt input[type="checkbox"]').forEach((cb) => cb.onchange = () => {
      chosenSets = [...app.querySelectorAll('.setopt input[type="checkbox"]:checked')].map((x) => x.value);
      store.set("s10-sets", chosenSets); publish();
    });
    const all = app.querySelector("#setall");
    if (all) all.onclick = () => { chosenSets = L.SET_KEYS.slice(); store.set("s10-sets", chosenSets); publish(); };
    if (start) start.onclick = () => {
      if (chosenGame === "slf") return send({ type: "start", game: "slf", opts: slfOpts });
      if (chosenGame === "wl") return send({ type: "start", game: "wl", opts: wlOpts });
      if (chosenGame === "geo") return send({ type: "start", game: "geo", opts: { ...geoOpts, mode: "karte" } });
      if (chosenGame === "hl") return send({ type: "start", game: "hl", opts: hlOpts });
      if (chosenGame === "duell") return send({ type: "start", game: "duell", opts: duOpts });
      if (chosenGame === "frage") return send({ type: "start", game: "frage", opts: fqOpts });
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
      const pct = Math.min(100, (p.score / v.target) * 100);
      // Rundenpunkte nur zeigen, wenn es welche gibt: „+3 offen“ während der Runde, „+3“ nach der Runde
      const rp = v.phase === "playing" ? (p.status !== "out" && p.roundPts ? `+${p.roundPts} offen` : "") : res && res.gained ? `+${res.gained}` : "";
      const badge = v.phase === "playing" ? (turn ? "am Zug" : p.waiting ? "ab nächster Runde" : statusLabel[p.status]) : "";
      return `<div class="chip ${turn ? "turn" : ""} st-${p.status} ${p.waiting ? "waiting" : ""} ${v.winners && v.winners.includes(p.id) ? "winner" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}">
        <div class="chip-l1"><span class="pdot ${p.connected ? "" : "off"}" title="${p.connected ? "verbunden" : "getrennt"}"></span>
          <span class="chip-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
          <span class="chip-score"><b>${p.score}</b><small>/${v.target}</small></span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="chip-l2"><span class="rpts ${res && res.gained ? "pos" : ""}">${rp}</span>
          ${badge ? `<span class="badge">${badge}</span>` : ""}</div>
      </div>`;
    }).join("");

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
      return `<button class="slot ${cls} ${r && r.by ? "has-by" : ""} ${selected === pos ? "sel" : ""}" style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%${pc}" data-pos="${pos}" ${myTurn && !r ? "" : "disabled"}>
        <span class="slot-t">${esc(it.t)}</span>${ans}${by}</button>`;
    }).join("");

    let banner;
    if (pend) {
      const item = card.items[pend.pos];
      const iJudge = pend.judges.includes(myId);
      const self = pend.by === myId;
      banner = `<div class="banner judge">
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
        ? `<button id="pass" class="btn pass-btn">${me.roundPts ? `Passen und ${me.roundPts} Punkt${me.roundPts > 1 ? "e" : ""} sichern` : "Passen"}</button>`
        : isHost && !cur.connected ? `<div class="banner row"><div class="banner-text"><b>${esc(cur.name)}</b> ist getrennt.</div><button id="skip" class="btn ghost sm">Überspringen</button></div>` : "";
    } else if (v.phase === "roundEnd") {
      banner = `<div class="banner end row"><div class="banner-text"><b>Runde ${v.round} vorbei.</b> Alle Antworten sind aufgedeckt.</div>
        <button id="next" class="btn primary">Nächste Runde</button></div>`;
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
          <div class="meta">${setLabel(v.cardSet)}Runde ${v.round} · bis ${v.target} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <div class="game-grid">
          <section class="players">${chips}</section>
          <section class="action">${banner}${undoHtml(v, nameOf)}</section>
          <section class="board">
            <div class="ring ${myTurn && v.phase === "playing" ? "myturn" : ""} ${card.emoji ? "emo" : ""} ${card.emoji && card.items.every((it) => graphemes(it.t) === 1) ? "emo-solo" : ""}">
              <div class="center">
                ${myTurn && v.phase === "playing" ? `<div class="zturn">Du bist dran!</div>` : ""}
                <div class="qtype">${({ tf: "Finde die zutreffenden", num: "Zahl eintippen", rank: "Rang 1–10", decade: "Jahrzehnt", estimate: new Set(card.items.map((x) => x.tol)).size > 1 ? "Schätzen · Toleranz je nach Begriff" : `Schätzen · ±${Math.round((card.tol || 0.1) * 100)} % zählt` })[card.type] || "Antwort eintippen"}</div>
                <div class="q">${esc(card.q)}</div>
                ${card.hint ? `<div class="hint">${esc(card.hint)}</div>` : ""}
                <div class="progress">${card.items.filter((it) => it.r && !it.r.pending && it.r.by).length} von 10 aufgedeckt</div>
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
  const SET_NAMES = { standard: "Standard", suedtirol: "Südtirol", wirtschaft: "Wirtschaft", emoji: "Emoji & Flaggen", winter: "Weihnachten & Winter", film: "Film & Serien", kindheit: "Kindheit der 2000er", mixed: "Gemischt" };

  // ---------- Spielauswahl & Einstellungen ----------
  function gamePickerHtml() {
    return `<div class="field"><span>Spiel wählen</span><div class="gamegrid" role="radiogroup">${GAMES.map((g) => `
      <label class="gametile ${chosenGame === g.key ? "on" : ""}" style="--gc:${g.color}">
        <input type="radio" name="game" value="${g.key}" ${chosenGame === g.key ? "checked" : ""}>
        <span class="gt-icon" aria-hidden="true">${g.icon}</span>
        <span class="gt-name">${g.name}</span><span class="gt-desc">${g.desc}</span>
        ${wishTagHtml(g.key)}
        <span class="gt-check" aria-hidden="true">✓</span></label>`).join("")}</div></div>`;
  }
  // Wer wünscht sich dieses Spiel? (kleines Abzeichen auf der Kachel)
  function wishTagHtml(key) {
    const w = (view.lobby && view.lobby.wishes) || {};
    const ids = Object.entries(w).filter(([, k]) => k === key).map(([id]) => id);
    const names = ids.map((id) => id === myId ? "Dein Wunsch" : esc((view.players.find((p) => p.id === id) || { name: "?" }).name));
    return names.length ? `<span class="gt-wish">💡 ${names.join(", ")}</span>` : "";
  }
  // Gäste: alle Spiele sehen und sich eines wünschen
  function guestGamesHtml() {
    const myWish = view.lobby && view.lobby.wishes && view.lobby.wishes[myId];
    return `<div class="field"><span>Alle Spiele – tippe, um dir eines zu wünschen</span><div class="gamegrid">${GAMES.map((g) => `
      <button type="button" class="gametile wishtile ${view.game === g.key ? "on" : ""} ${myWish === g.key ? "wished" : ""}" style="--gc:${g.color}" data-wish="${g.key}"
        title="${view.game === g.key ? "Wird gerade gespielt" : myWish === g.key ? "Wunsch zurücknehmen" : "Wünsch dir " + esc(g.name)}">
        <span class="gt-icon" aria-hidden="true">${g.icon}</span>
        <span class="gt-name">${g.name}</span><span class="gt-desc">${g.desc}</span>
        ${view.game === g.key ? `<span class="gt-wish now">wird gespielt</span>` : wishTagHtml(g.key)}
        <span class="gt-check" aria-hidden="true">${myWish === g.key ? "💡" : "✓"}</span></button>`).join("")}</div></div>`;
  }
  function slfSettingsHtml() {
    const presetCats = slfOpts.preset !== "eigene" && SLF.PRESETS[slfOpts.preset] ? SLF.PRESETS[slfOpts.preset].cats : null;
    return `<label class="field"><span>Kategorien</span>
        <select id="slf-preset">${Object.entries(SLF.PRESETS).map(([k, p]) => `<option value="${k}" ${slfOpts.preset === k ? "selected" : ""}>${p.name}</option>`).join("")}
          <option value="eigene" ${slfOpts.preset === "eigene" ? "selected" : ""}>Eigene Kategorien …</option></select></label>
      ${presetCats ? `<p class="muted small">${presetCats.map(esc).join(" · ")}</p>`
        : `<label class="field"><span>Eigene Kategorien (mit Komma getrennt, höchstens 10)</span>
            <textarea id="slf-custom" rows="2" maxlength="400" placeholder="z. B. Stadt, Pizzabelag, Ausrede, Promi">${esc(slfOpts.custom)}</textarea></label>`}
      <div class="row2">
        <label class="field"><span>Runden</span><select id="slf-rounds">${SLF.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(slfOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>
        <label class="field"><span>Zeit</span><select id="slf-timer">${Object.entries(SLF.TIMERS).map(([k, t]) => `<option value="${k}" ${slfOpts.timer === k ? "selected" : ""}>${t.name}</option>`).join("")}</select></label>
      </div>
      <button id="start" class="btn primary big" ${view.players.length < 1 ? "disabled" : ""}>Spiel starten</button>
      ${view.players.length < 2 ? `<p class="muted small">Du kannst auch allein starten, um es auszuprobieren.</p>` : ""}`;
  }
  // Für Gäste: gut sichtbar, welches Spiel der Gastgeber gewählt hat
  // Kleines Spielsymbol mit Namen für die Kopfzeile der Spielbildschirme
  function gameTagHtml(key) {
    const g = GAMES.find((x) => x.key === key) || GAMES[0];
    return `<span class="gtag" style="--gc:${g.color}"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span><b>${esc(g.name)}</b></span>`;
  }
  // Kopfzeile der Spielbildschirme: Marke Spielstube · großer Spieltitel · Infos · Knöpfe
  function headBrandHtml(key) {
    const g = GAMES.find((x) => x.key === key) || GAMES[0];
    return `<div class="brand" title="Spielstube">${LOGO}</div>
      <div class="gtitle" style="--gc:${g.color}"><span class="gt-icon" aria-hidden="true">${g.icon}</span><b>${esc(g.name)}</b></div>`;
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
    // radio = Einfachauswahl beim Gastgeber -> runder Punkt statt Häkchen
    const row = (on, name, detail, radio) => `<div class="setopt ro ${on ? "on" : ""} ${radio ? "radio" : ""}"><span class="ro-mark">${on && !radio ? "✓" : ""}</span>
      <span class="setname">${name}</span><span class="setcount">${detail}</span></div>`;
    if (view.game === "slf") {
      const presets = Object.entries(SLF.PRESETS).map(([k, p]) => row(lb.slf.preset === k, esc(p.name), esc(p.cats.join(" · ")), true));
      if (lb.slf.preset === "eigene") presets.push(row(true, "Eigene", esc(lb.slf.cats.join(" · ")), true));
      return `<div class="field"><span>Kategorien (wählt der Gastgeber)</span><div class="setlist">${presets.join("")}</div></div>
        <p class="muted small">${lb.slf.rounds} Runden · ${esc((SLF.TIMERS[lb.slf.timer] || SLF.TIMERS.stopp).name)}</p>`;
    }
    if ((view.game === "geo" || view.game === "oben") && lb.geo) {
      if (view.game === "oben") {
        return `<p class="muted small">${lb.geo.rounds} Runden · ${GEO.OBEN.steps * GEO.OBEN.stepMs / 1000} Sekunden pro Runde</p>`;
      }
      const regs = Object.entries(GEODATA).filter(([, r]) => !r.hidden).map(([k, r]) => row(lb.geo.region === k, esc(r.name), "", true));
      return `<div class="field"><span>Regionen (wählt der Gastgeber)</span><div class="setlist">${regs.join("")}</div></div>
        <p class="muted small">${esc((GEO.LEVELS[lb.geo.level] || GEO.LEVELS.gemischt).name)} · ${lb.geo.rounds} Runden · ${esc((GEO.TIMERS[lb.geo.timer] || GEO.TIMERS.t30).name)} pro Runde</p>`;
    }
    if (view.game === "schnapsen" && lb.schnapsen) {
      return `<p class="muted small">Zu zweit · ${esc(SCH.MODES[lb.schnapsen.mode] || SCH.MODES.gemuetlich)} · ${SCH.TARGET} Punkte pro Bummerl</p>`;
    }
    if (view.game === "watten" && lb.watten) {
      return `<p class="muted small">Zu zweit · bis ${lb.watten.target} Punkte · Weli ist ${lb.watten.weli === "trumpf" ? "der kleinste Trumpf" : "die kleinste Schelle"}</p>`;
    }
    if (view.game === "frage" && lb.frage) {
      return `<p class="muted small">Zu zweit · bis ${lb.frage.target} Punkte · ${esc((FQ.WRITE[lb.frage.write] || FQ.WRITE["0"]).name)} zum Ausdenken · ${esc((FQ.ANSWER[lb.frage.answer] || FQ.ANSWER["0"]).name)} zum Antworten</p>`;
    }
    if (view.game === "duell" && lb.duell) {
      return `<p class="muted small">Zu zweit · bis ${lb.duell.target} Punkte · ${esc((DU.TIMERS[lb.duell.timer] || DU.TIMERS["30"]).name)} pro Antwort · ${DUDATA.length} Themen</p>`;
    }
    if (view.game === "hl" && lb.hl) {
      return `<p class="muted small">${(HL.LENGTHS[lb.hl.length] || HL.LENGTHS.mittel).cats} von ${Object.keys(HLDATA).length} Kategorien (z. B. Berge, Flüsse, Tiere, Filme, Lieder) · je ${HL.PER_CAT} Vergleiche</p>`;
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
    app.querySelectorAll('input[name="game"]').forEach((r) => r.onchange = () => {
      chosenGame = r.value; store.set("s10-game", chosenGame); send({ type: "setGame", game: chosenGame }); publish();
    });
    const saveOpts = () => store.set("s10-slf", slfOpts);
    const ps = app.querySelector("#slf-preset");
    if (ps) ps.onchange = () => { slfOpts.preset = ps.value; saveOpts(); publish(); };
    const cu = app.querySelector("#slf-custom");
    if (cu) { cu.oninput = () => { slfOpts.custom = cu.value; saveOpts(); }; cu.onchange = () => publish(); } // erst beim Verlassen des Felds teilen
    const ro = app.querySelector("#slf-rounds");
    if (ro) ro.onchange = () => { slfOpts.rounds = Number(ro.value); saveOpts(); publish(); };
    const ti = app.querySelector("#slf-timer");
    if (ti) ti.onchange = () => { slfOpts.timer = ti.value; saveOpts(); publish(); };
    const wp = app.querySelector("#wl-pack");
    if (wp) wp.onchange = () => { wlOpts.pack = wp.value; store.set("s10-wl", wlOpts); publish(); };
    const saveGeo = () => { store.set("s10-geo", geoOpts); publish(); };
    const gr = app.querySelector("#geo-region");
    if (gr) gr.onchange = () => { geoOpts.region = gr.value; saveGeo(); };
    const gn = app.querySelector("#geo-rounds");
    if (gn) gn.onchange = () => { geoOpts.rounds = Number(gn.value); saveGeo(); };
    const gt = app.querySelector("#geo-timer");
    if (gt) gt.onchange = () => { geoOpts.timer = gt.value; saveGeo(); };
    const gl = app.querySelector("#geo-level");
    if (gl) gl.onchange = () => { geoOpts.level = gl.value; saveGeo(); };
    const gx = app.querySelector("#geo-reset");
    if (gx) gx.onclick = async () => {
      if (!(await askConfirm("Gespielte Orte vergessen?", "Danach sind in allen Regionen wieder alle Orte neu.", "Vergessen"))) return;
      S.geoSeen = {}; store.set("s10-geo-seen", {}); publish(); toast("Speicher gelöscht – alle Orte sind wieder neu.", "ok");
    };
    const xM = app.querySelector("#sch-mode");
    if (xM) xM.onchange = () => { schOpts.mode = xM.value; store.set("s10-schnapsen", schOpts); publish(); };
    const wT = app.querySelector("#watten-target");
    if (wT) wT.onchange = () => { wattenOpts.target = Number(wT.value); store.set("s10-watten", wattenOpts); publish(); };
    const wW = app.querySelector("#watten-weli");
    if (wW) wW.onchange = () => { wattenOpts.weli = wW.value; store.set("s10-watten", wattenOpts); publish(); };
    [["#fq-target", "target"], ["#fq-write", "write"], ["#fq-answer", "answer"]].forEach(([id, k]) => {
      const el = app.querySelector(id);
      if (el) el.onchange = () => { fqOpts[k] = k === "target" ? Number(el.value) : el.value; store.set("s10-fq", fqOpts); publish(); };
    });
    const duT = app.querySelector("#du-target"), duZ = app.querySelector("#du-timer");
    if (duT) duT.onchange = () => { duOpts.target = Number(duT.value); store.set("s10-du", duOpts); publish(); };
    if (duZ) duZ.onchange = () => { duOpts.timer = duZ.value; store.set("s10-du", duOpts); publish(); };
    const hlL = app.querySelector("#hl-length");
    if (hlL) hlL.onchange = () => { hlOpts.length = hlL.value; store.set("s10-hl", hlOpts); publish(); };
    const wr = app.querySelector("#wl-rounds");
    if (wr) wr.onchange = () => { wlOpts.rounds = Number(wr.value); store.set("s10-wl", wlOpts); publish(); };
  }
  function geoSettingsHtml(oben) {
    const level = oben ? "gemischt" : GEO.LEVELS[geoOpts.level] ? geoOpts.level : "gemischt";
    const region = oben ? "oben" : geoOpts.region;
    const nw = GEODATA[region] ? GEO.countNew(S && S.geoSeen, region, level) : null;
    return `${oben ? `<p class="muted small">Die wichtigsten Städte und ein paar Orte, die man von oben gut erkennt – von Bozen und Meran bis Venedig, München und Paris.</p>` : `<div class="row2">
        <label class="field"><span>Region</span><select id="geo-region">${Object.entries(GEODATA).filter(([, r]) => !r.hidden).map(([k, r]) =>
          `<option value="${k}" ${geoOpts.region === k ? "selected" : ""}>${esc(r.name)} (${GEO.poolFor(k, level).length} Orte)</option>`).join("")}</select></label>
        <label class="field"><span>Schwierigkeit</span><select id="geo-level">${Object.entries(GEO.LEVELS).map(([k, l]) =>
          `<option value="${k}" ${level === k ? "selected" : ""}>${esc(l.name)}</option>`).join("")}</select></label>
      </div>`}
      ${nw ? `<p class="muted small geo-new">${nw.fresh === nw.total ? `Alle ${nw.total} Orte sind neu.` : `Noch ${nw.fresh} von ${nw.total} Orten neu – gespielte kommen erst wieder, wenn alle durch sind.`}
        ${nw.fresh < nw.total ? `<button id="geo-reset" class="btn ghost sm">Gespielte Orte vergessen</button>` : ""}</p>` : ""}
      <div class="row2">
        <label class="field"><span>Runden</span><select id="geo-rounds">${GEO.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(geoOpts.rounds) === n ? "selected" : ""}>${n} Runden</option>`).join("")}</select></label>
        ${oben ? `<div class="field"><span>Zeit pro Runde</span><p class="muted small">${GEO.OBEN.steps * GEO.OBEN.stepMs / 1000} Sekunden – alle ${GEO.OBEN.stepMs / 1000} Sekunden zoomt das Bild weiter heraus.</p></div>`
          : `<label class="field"><span>Zeit pro Runde</span><select id="geo-timer">${Object.entries(GEO.TIMERS).map(([k, t]) => `<option value="${k}" ${geoOpts.timer === k ? "selected" : ""}>${t.name}</option>`).join("")}</select></label>`}
      </div>
      <button id="start" class="btn primary big" ${view.players.length < 1 || !LF ? "disabled" : ""}>Spiel starten</button>
      ${!LF ? `<p class="err small">Die Kartenbibliothek konnte nicht geladen werden.</p>` : view.players.length < 2 ? `<p class="muted small">Du kannst auch allein starten, um es auszuprobieren.</p>` : ""}`;
  }
  function hlSettingsHtml() {
    return `<label class="field"><span>Länge</span><select id="hl-length">${Object.entries(HL.LENGTHS).map(([k, l]) =>
        `<option value="${k}" ${hlOpts.length === k ? "selected" : ""}>${esc(l.name)}</option>`).join("")}</select></label>
      <p class="muted small">${Object.keys(HLDATA).length} Kategorien, zufällig gezogen – z. B. Berge, Flüsse, Tiere, Filme, Lieder.</p>
      <button id="start" class="btn primary big" ${view.players.length < 1 ? "disabled" : ""}>Spiel starten</button>
      ${view.players.length < 2 ? `<p class="muted small">Du kannst auch allein starten, um es auszuprobieren.</p>` : ""}`;
  }
  function fqSettingsHtml() {
    const n = view.players.filter((p) => p.connected).length;
    const sel = (id, obj, val) => `<select id="${id}">${Object.entries(obj).map(([k, t]) => `<option value="${k}" ${String(val) === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>`;
    const seen = store.get("s10-fq-seen") || [], all = fqAllKeys(), fresh = all.filter((k) => !seen.includes(k)).length;
    return `<label class="field"><span>Spielen bis</span><select id="fq-target">${FQ.TARGETS.map((t) =>
        `<option value="${t}" ${Number(fqOpts.target) === t ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
      <label class="field"><span>Zeit zum Frage-Ausdenken</span>${sel("fq-write", FQ.WRITE, fqOpts.write)}</label>
      <label class="field"><span>Zeit zum Antworten</span>${sel("fq-answer", FQ.ANSWER, fqOpts.answer)}</label>
      <p class="muted small"><b>${fresh} von ${all.length} Aufgaben noch neu</b> · ${FQDATA.length} Kategorien, z. B. ${FQDATA.slice(0, 4).map((c) => esc(c.cat)).join(", ")} …</p>
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      <p class="muted small">${n < 2 ? "„Antwort sucht Frage“ braucht zwei Spieler – lade jemanden ein." : n > 2 ? "Es spielen die ersten beiden Spieler, die anderen schauen zu." : "Zu zweit, abwechselnd fragen und antworten."}</p>`;
  }
  const fqRulesHtml = `
    <details class="rules"><summary>Regeln: Antwort sucht Frage</summary>
      <ul>
        <li>Einer ist <b>Fragensteller</b>: Er bekommt eine <b>Kategorie</b> und eine <b>Antwort</b>, z. B. „Religion“ und „3“. Die Antwort sieht nur er.</li>
        <li>Er denkt sich eine <b>Frage</b> aus, die in die Kategorie passt und genau diese Antwort hat – z. B. „Wie viele Weise kamen zur Krippe?“.</li>
        <li>Der andere sieht die Frage und tippt seine <b>Antwort</b>. Stimmt sie, bekommt <b>er</b> den Punkt – sonst der <b>Fragensteller</b>.</li>
        <li>Ist die Antwort nicht wörtlich gleich (z. B. „die drei Könige“), entscheidet der Fragensteller ehrlich, ob sie zählt.</li>
        <li>Fällt dem Fragensteller keine Frage ein, kann er <b>passen</b> – dann bekommt der andere den Punkt (ebenso, wenn die Zeit abläuft); antwortet der andere nicht rechtzeitig, der Fragensteller.</li>
        <li><b>Beschwerde:</b> Hat der Antwortende den Punkt verloren und findet die Frage danach unpassend (passt nicht zur Antwort oder Kategorie, nicht eindeutig), kann er sich beschweren. Gibt der Fragensteller ihm recht, zählt die Runde nicht.</li>
        <li>Die Rollen wechseln jede Runde. Wer zuerst die Zielpunkte hat, gewinnt.</li>
      </ul>
    </details>`;
  function duSettingsHtml() {
    const n = view.players.filter((p) => p.connected).length;
    return `<label class="field"><span>Spielen bis</span><select id="du-target">${DU.TARGETS.map((t) =>
        `<option value="${t}" ${Number(duOpts.target) === t ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
      <label class="field"><span>Zeit pro Antwort</span><select id="du-timer">${Object.entries(DU.TIMERS).map(([k, t]) =>
        `<option value="${k}" ${String(duOpts.timer) === k ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select></label>
      <p class="muted small">${(() => { const seen = store.get("s10-du-seen") || [], fresh = DUDATA.filter((l) => !seen.includes(l.q)).length;
        return `<b>${fresh} von ${DUDATA.length} Themen noch neu</b> – gespielte kommen erst wieder, wenn alle durch sind.`; })()}</p>
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      <p class="muted small">${n < 2 ? "Das Listen-Duell braucht zwei Spieler – lade jemanden ein." : n > 2 ? "Es spielen die ersten beiden Spieler, die anderen schauen zu." : "Listen-Duell zu zweit."}</p>`;
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
    const n = view.players.filter((p) => p.connected).length;
    return `<label class="field"><span>Spielweise</span><select id="sch-mode">${Object.entries(SCH.MODES).map(([k, m]) =>
        `<option value="${k}" ${schOpts.mode === k ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></label>
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      <p class="muted small">${n < 2 ? "Schnapsen braucht zwei Spieler – lade jemanden ein." : n > 2 ? "Es spielen die ersten beiden Spieler, die anderen schauen zu." : `Schnapsen zu zweit, ${SCH.TARGET} Punkte pro Bummerl.`}</p>`;
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
    const n = view.players.filter((p) => p.connected).length;
    return `<label class="field"><span>Spielen bis</span><select id="watten-target">${WAT.TARGETS.map((t) =>
        `<option value="${t}" ${Number(wattenOpts.target) === t ? "selected" : ""}>${t} Punkte (gestrichen ab ${t - 2})</option>`).join("")}</select></label>
      <label class="field"><span>Weli</span><select id="watten-weli">
        <option value="schell" ${wattenOpts.weli !== "trumpf" ? "selected" : ""}>kleinste Schelle (Guter beim Schell-Ass, als Schlag der Rechte)</option>
        <option value="trumpf" ${wattenOpts.weli === "trumpf" ? "selected" : ""}>kleinster Trumpf (als Schlag die beste Karte, kein Guter)</option></select></label>
      <button id="start" class="btn primary big" ${n < 2 ? "disabled" : ""}>Spiel starten</button>
      <p class="muted small">${n < 2 ? "Watten braucht zwei Spieler – lade jemanden ein." : n > 2 ? "Es spielen die ersten beiden Spieler, die anderen schauen zu." : "Watten zu zweit nach Südtiroler Regeln."}</p>`;
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
  function wlSettingsHtml() {
    const best = store.get("s10-wl-best");
    return `<div class="row2">
        <label class="field"><span>Impulse</span><select id="wl-pack">
          <option value="mix" ${wlOpts.pack === "mix" ? "selected" : ""}>Alle gemischt</option>
          ${Object.entries(WL.PACKS).map(([k, p]) => `<option value="${k}" ${wlOpts.pack === k ? "selected" : ""}>${p.name}</option>`).join("")}</select></label>
        <label class="field"><span>Länge</span><select id="wl-rounds">${WL.ROUND_CHOICES.map((n) => `<option value="${n}" ${Number(wlOpts.rounds) === n ? "selected" : ""}>${n} Impulse</option>`).join("")}</select></label>
      </div>
      ${best != null ? `<p class="muted small">Euer Rekord: <b>${best} Punkte</b></p>` : ""}
      <button id="start" class="btn primary big" ${view.players.length < 2 ? "disabled" : ""}>Spiel starten</button>
      ${view.players.length < 2 ? `<p class="muted small">Für dieses Spiel braucht ihr mindestens zwei Spieler.</p>` : ""}`;
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
        <li>Wer fertig ist, ruft <b>„Stopp!“</b> – dann haben alle anderen noch 10 Sekunden. (Oder ihr spielt mit fester Zeit.)</li>
        <li><b>Punkte:</b> 10 für eine eigene Antwort, 5 wenn jemand dasselbe hat, 20 wenn nur du in der Kategorie etwas hast.</li>
        <li>Bei der Auswertung kann jeder Antworten anzweifeln (✗) oder anerkennen (✓). Weiter geht's, wenn alle bestätigt haben.</li>
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
    return `<div class="field"><span>Fragen – beliebig kombinierbar</span>
      <div class="setlist">${L.SET_KEYS.map((k) => {
        const on = cur.includes(k), f = fresh([k]);
        return `<label class="setopt ${on ? "on" : ""}"><input type="checkbox" value="${k}" ${on ? "checked" : ""}>
          <span class="setname">${SET_NAMES[k]}</span><span class="setcount">${count(k)} Karten${f !== null ? ` · ${f} neu` : ""}</span></label>`;
      }).join("")}</div>
      <div class="setsum">${cur.length
        ? `<span class="muted small">Zusammen: <b>${total}</b> Karten${S ? ` (${fresh(cur)} neu)` : ""}</span>`
        : `<span class="err small">Bitte mindestens ein Set auswählen.</span>`}
        ${cur.length < L.SET_KEYS.length ? `<button id="setall" class="btn ghost sm">Alle auswählen</button>` : ""}</div></div>`;
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

  // ---------- Stadt, Land, Fluss: Darstellung ----------
  let slfLocal = { key: null, answers: {} }, slfDraftTimer = null, slfSubmitted = null, slfDeadline = 0, slfRendered = null;
  const slfKeyOf = (v) => v.code + ":" + v.slf.round + ":" + v.slf.letter;
  function slfLoadLocal(v) {
    const key = slfKeyOf(v);
    if (slfLocal.key === key) return;
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("s10-slf-" + key)); } catch {}
    slfLocal = { key, answers: saved || {} };
  }
  function slfSaveLocal() { try { sessionStorage.setItem("s10-slf-" + slfLocal.key, JSON.stringify(slfLocal.answers)); } catch {} }
  function slfSend(final) {
    if (!view || !view.slf) return;
    send({ type: final ? "slfSubmit" : "slfDraft", round: view.slf.round, answers: slfLocal.answers });
  }
  const fmtClock = (ms) => { const t = Math.ceil(ms / 1000); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
  setInterval(() => {
    const el = document.getElementById("slf-timer");
    if (!el || !view || !view.slf || view.slf.step !== "writing") return;
    const ms = Math.max(0, slfDeadline - Date.now());
    el.textContent = fmtClock(ms); el.classList.toggle("urgent", ms <= 10000);
  }, 250);

  function slfChips(v, st) {
    return v.players.map((p, i) => {
      let badge = "";
      if (st.step === "writing") badge = st.done[p.id] ? "fertig ✓" : "schreibt …";
      else if (st.step === "review") badge = st.ready && st.ready[p.id] ? "bereit ✓" : "prüft …";
      const rp = st.roundPoints && st.roundPoints[p.id] != null && st.step === "review" ? ` <span class="pill-rp">+${st.roundPoints[p.id]}</span>` : "";
      const done = st.done[p.id] || (st.ready && st.ready[p.id]);
      // kompakte Pille wie bei „Wo liegt das?“ und „Höher oder tiefer“
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${esc(badge)}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
        <b>${st.total[p.id] || 0}</b>${rp}${badge ? `<span class="geo-mark">${done ? "✓" : "…"}</span>` : ""}</span>`;
    }).join("");
  }

  function renderSlf() {
    const v = view, st = v.slf;
    if (!st) return;
    slfLoadLocal(v);
    slfDeadline = Date.now() + (st.endsIn || 0);
    if (st.step === "collecting" && slfSubmitted !== slfLocal.key) { slfSubmitted = slfLocal.key; slfSend(true); }
    const key = slfLocal.key + ":" + st.step;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    if (st.step === "writing" && slfRendered === key && app.querySelector(".slf-form")) {
      // Eingaben nicht neu zeichnen – nur Spieler, Stopp-Hinweis und Knopf aktualisieren
      app.querySelector(".players").innerHTML = slfChips(v, st);
      app.querySelector("#slf-stop").innerHTML = slfStopHtml(st, nameOf);
      const done = app.querySelector("#slf-done");
      if (done && st.done[myId]) { done.disabled = true; done.textContent = "Fertig – warte auf die anderen …"; }
      return;
    }
    slfRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    let main = "";
    if (st.step === "writing") {
      main = `
        <div class="slf-head">
          <div class="slf-headrow">
            <div class="slf-letter" aria-label="Buchstabe ${st.letter}">${st.letter}</div>
            <div class="slf-clock"><div id="slf-timer" class="slf-timer">${fmtClock(st.endsIn)}</div><div id="slf-stop" class="muted small slf-rule">${slfStopHtml(st, nameOf)}</div></div>
          </div>
        </div>
        <form class="slf-form" autocomplete="off" onsubmit="return false">
          ${st.cats.map((c, i) => `<label class="slf-field"><span>${esc(c)}</span>
            <input data-cat="${i}" maxlength="60" autocapitalize="words" spellcheck="false" placeholder="${st.letter} …" value="${esc(slfLocal.answers[c] || "")}"></label>`).join("")}
        </form>
        <button id="slf-done" class="btn primary big" ${st.done[myId] ? "disabled" : ""}>${st.done[myId] ? "Fertig – warte auf die anderen …" : st.timer === "stopp" ? "Stopp! Ich bin fertig" : "Fertig"}</button>`;
    } else if (st.step === "collecting") {
      main = `<div class="slf-wait"><div class="slf-letter small">${st.letter}</div><p><b>Zeit ist um!</b> Die Antworten werden eingesammelt …</p></div>`;
    } else if (st.step === "review") {
      const iReady = st.ready && st.ready[myId];
      main = `
        <div class="banner row"><div class="banner-text"><b>Runde ${st.round} – Buchstabe ${st.letter}.</b> Prüft die Antworten: ✗ zweifelt an, ✓ erkennt an.</div></div>
        <div class="slf-review">${st.cats.map((c, ci) => `
          <div class="slf-cat"><h4>${esc(c)}</h4>
            ${st.answered.map((pid) => { const cell = st.table[c][pid]; return `
              <div class="slf-row ${cell.valid ? "" : "bad"}" style="--pc:${colorOf(pid)}">
                <span class="pdot"></span><span class="slf-name">${esc(nameOf(pid))}</span>
                <span class="slf-ans">${cell.text ? esc(cell.text) : "—"}${cell.dup ? ` <em>doppelt</em>` : ""}${cell.overridden ? ` <em>${cell.valid ? "anerkannt" : "angezweifelt"}</em>` : ""}</span>
                <b class="slf-pts">${cell.points}</b>
                ${cell.text ? `<button class="slf-tog btn ghost sm" data-pid="${esc(pid)}" data-cat="${ci}" title="${cell.valid ? "Antwort anzweifeln" : "Antwort anerkennen"}">${cell.valid ? "✗" : "✓"}</button>` : `<span class="slf-tog-space"></span>`}
              </div>`; }).join("")}
          </div>`).join("")}</div>
        <div class="slf-actions">
          <button id="slf-ready" class="btn ${iReady ? "ghost" : "primary"} big">${iReady ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Passt – zum Endstand" : "Passt – nächste Runde"}</button>
          ${isHost ? `<button id="slf-next" class="btn ghost sm">Als Gastgeber sofort weiter</button>` : ""}
        </div>`;
    } else if (st.step === "final") {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      main = `
        <div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((p) => st.winners.includes(p.id)).map((p) => esc(p.name)).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="slf-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((p, i) => `
          <div class="slf-rank" style="--pc:${colorOf(p.id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
            <span class="slf-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span><b>${st.total[p.id] || 0} Punkte</b></div>`).join("")}
          <p class="muted small">${st.rounds} Runden · Buchstaben: ${(st.used || []).join(" · ")}</p></div>`;
    }
    app.innerHTML = `
      <main class="screen game slf">
        <header class="top topbar">
          ${headBrandHtml("slf")}
          <div class="meta">Runde ${st.round}/${st.rounds} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="players">${slfChips(v, st)}</section>
        <section class="slf-main">${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#slf-done", () => { slfSend(false); send({ type: "slfDone" }); });
    on("#slf-ready", () => send({ type: "slfReady" }));
    on("#slf-next", () => send({ type: "slfNext" }));
    on("#slf-restart", () => send({ type: "slfRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll(".slf-tog").forEach((b) => b.onclick = () => send({ type: "slfToggle", pid: b.dataset.pid, cat: st.cats[Number(b.dataset.cat)] }));
    const inputs = [...app.querySelectorAll(".slf-form input")];
    inputs.forEach((inp, i) => {
      const cat = st.cats[Number(inp.dataset.cat)];
      const mark = () => inp.classList.toggle("wrong", !!inp.value.trim() && SLF.firstLetter(inp.value) !== st.letter);
      mark();
      inp.oninput = () => {
        slfLocal.answers[cat] = inp.value; slfSaveLocal(); mark();
        clearTimeout(slfDraftTimer); slfDraftTimer = setTimeout(() => slfSend(false), 800);
      };
      inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); (inputs[i + 1] || inp).focus(); } };
    });
    if (st.step === "writing" && inputs.length && !inputs.some((x) => x.value) && matchMedia("(pointer: fine)").matches) inputs[0].focus();
  }
  function slfStopHtml(st, nameOf) {
    // steht in derselben Zeile wie die Zeitregel unter der Uhr – der Kasten wird dadurch nicht höher
    if (!st.stoppedBy) return esc(st.timerName);
    return `<span class="slf-stopped">⏱ <b>${esc(nameOf(st.stoppedBy))}</b> hat Stopp gerufen!</span>`;
  }

  // ---------- Gleiche Wellenlänge: Darstellung ----------
  let wlRendered = null, wlMine = "";
  function wlChips(v, st) {
    return v.players.map((p, i) => {
      const sub = st.submitted.includes(p.id);
      const badge = st.step === "writing" ? (sub ? "abgegeben ✓" : "denkt …") : "";
      return `<span class="geo-score ${sub && st.step === "writing" ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${esc(badge)}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
        ${badge ? `<span class="geo-mark">${sub ? "✓" : "…"}</span>` : ""}</span>`;
    }).join("");
  }
  function wlStatusHtml(st) {
    if (!st.submitted.includes(myId)) return "";
    return `Dein Wort: <b>„${esc(wlMine)}“</b> – warte auf die anderen … <span class="muted">(zum Ändern einfach neu abgeben)</span>`;
  }
  function renderWl() {
    const v = view, st = v.wl;
    if (!st) return;
    const key = v.code + ":" + st.impulse + ":" + st.attempt + ":" + st.step;
    if (st.step === "writing" && wlRendered === key && app.querySelector("#wl-word")) {
      app.querySelector(".players").innerHTML = wlChips(v, st);
      app.querySelector("#wl-status").innerHTML = wlStatusHtml(st);
      return;
    }
    if (st.step === "writing" && (!wlRendered || !wlRendered.startsWith(v.code + ":" + st.impulse + ":" + st.attempt + ":"))) wlMine = "";
    wlRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    // Gedankenkette: jeder Versuch als Reihe farbiger Wort-Kärtchen, verbunden mit „+“, Pfeil zum nächsten Versuch
    const chainHtml = st.chain.length ? `<div class="wl-chain">${st.chain.map((c, i) => `
        <div class="wl-chainrow"><span class="wl-step">${i + 1}.</span>${Object.entries(c.words).map(([pid, w]) => `<span class="wl-chip" style="--pc:${colorOf(pid)}">${esc(w)}</span>`).join(`<span class="wl-plus">+</span>`)}</div>`).join(`<div class="wl-arrow">↓</div>`)}
        <div class="wl-arrow">↓</div></div>` : "";
    const teamBar = `<div class="wl-team"><span>Teampunkte <b>${st.total}</b></span><span>Impuls <b>${st.impulse}/${st.rounds}</b></span>${st.step !== "final" ? `<span>Versuch <b>${st.attempt}/${st.maxTries}</b> · Treffer bringt <b>+${st.nextPoints}</b></span>` : ""}</div>`;
    let main = "";
    if (st.step === "writing") {
      main = `
        ${teamBar}
        <div class="wl-card">
          ${chainHtml}
          <div class="wl-prompt">${esc(st.prompt)}</div>
        </div>
        <form class="wl-form" autocomplete="off">
          <input id="wl-word" maxlength="40" spellcheck="false" autocapitalize="sentences" placeholder="Dein Wort …" value="${esc(wlMine)}">
          <button class="btn primary" type="submit">Abgeben</button>
        </form>
        <p id="wl-warn" class="err small"></p>
        <p id="wl-status" class="wl-status">${wlStatusHtml(st)}</p>
        ${st.attempt > 1 ? `<div class="slf-actions"><button id="wl-giveup" class="btn ghost sm">Impuls aufgeben (0 Punkte)</button></div>` : ""}`;
    } else if (st.step === "reveal") {
      const r = st.result;
      main = `
        ${teamBar}
        <div class="wl-card"><div class="wl-prompt small">${esc(st.prompt)}</div></div>
        <div class="wl-words ${r.hit ? "has-hit" : ""}">${Object.entries(st.words).map(([pid, w]) => `
          <div class="wl-word ${r.ids.includes(pid) ? "hit" : ""}" style="--pc:${colorOf(pid)}"><span class="wl-who"><i class="pdot"></i>${esc(nameOf(pid))}</span><b>${esc(w)}</b></div>`).join("")}</div>
        ${r.hit
          ? `<div class="banner win"><div class="trophy">🎉</div><b>Gleiche Wellenlänge!</b> „${esc(r.word)}“ – +${st.nextPoints} Punkte
              <div class="banner-actions"><button id="wl-next" class="btn primary">${st.impulse >= st.rounds ? "Zum Ergebnis" : "Nächster Impuls"}</button></div></div>`
          : `<div class="banner row"><div class="banner-text"><b>Knapp daneben!</b> ${st.attempt >= st.maxTries ? "Das war der letzte Versuch." : "Im nächsten Versuch werden eure Wörter zum Impuls."}</div>
              <div class="banner-actions"><button id="wl-next" class="btn primary">${st.attempt >= st.maxTries ? "Weiter" : "Nächster Versuch"}</button>
              ${st.attempt < st.maxTries ? `<button id="wl-giveup" class="btn ghost sm">Aufgeben</button>` : ""}</div></div>`}`;
    } else if (st.step === "final") {
      const max = st.rounds * 10;
      main = `
        <div class="banner win"><div class="trophy">${st.total >= max * 0.6 ? "🏆" : "🤝"}</div><b>Ihr habt ${st.total} von ${max} Punkten!</b>
          ${st.newRecord ? " <span class=\"host-tag\">Neuer Rekord!</span>" : st.best != null ? ` Rekord: ${st.best}` : ""}
          <div class="banner-actions"><button id="wl-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${st.history.map((h) => `
          <div class="slf-rank"><span class="slf-medal">${h.success ? "✅" : "❌"}</span>
            <span class="slf-name">${esc(h.base)}${h.word ? ` → <b>„${esc(h.word)}“</b>` : ""}</span>
            <span class="muted small">${h.attempts} Versuch${h.attempts > 1 ? "e" : ""}</span><b>+${h.points}</b></div>`).join("")}</div>`;
    }
    app.innerHTML = `
      <main class="screen game slf wl">
        <header class="top topbar">
          ${headBrandHtml("wl")}
          <div class="meta">Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="players">${wlChips(v, st)}</section>
        <section class="slf-main">${main}</section>
      </main>`;
    // Treffer: die gleichen Wörter fliegen aufeinander zu
    if (st.step === "reveal" && st.result && st.result.hit) {
      const hits = [...app.querySelectorAll(".wl-word.hit")];
      if (hits.length >= 2 && hits[0].animate) {
        const rs = hits.map((h) => h.getBoundingClientRect()), cx = rs.reduce((a, r) => a + r.left + r.width / 2, 0) / rs.length;
        hits.forEach((h, i) => {
          const dx = cx - (rs[i].left + rs[i].width / 2);
          h.animate([{ transform: "translateX(0) scale(1)" }, { transform: `translateX(${dx * .55}px) scale(1.12)`, offset: .45 }, { transform: "translateX(0) scale(1)" }],
            { duration: 1100, easing: "cubic-bezier(.3,.7,.3,1)" });
        });
      }
    }
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#wl-next", () => send({ type: "wlNext" }));
    on("#wl-giveup", async () => { if (await askConfirm("Impuls aufgeben?", "Dafür gibt es 0 Punkte.", "Aufgeben")) send({ type: "wlGiveUp" }); });
    on("#wl-restart", () => send({ type: "wlRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    const form = app.querySelector(".wl-form");
    if (form) {
      const inp = form.querySelector("#wl-word"), warn = app.querySelector("#wl-warn");
      if (matchMedia("(pointer: fine)").matches && !st.submitted.includes(myId)) inp.focus();
      inp.oninput = () => { warn.textContent = ""; };
      form.onsubmit = (e) => {
        e.preventDefault();
        const w = inp.value.trim();
        if (!w) return;
        if (st.used.some((u) => WL.same(u, w))) { warn.textContent = `„${w}“ wurde schon genannt – such ein anderes Wort.`; return; }
        wlMine = w; send({ type: "wlWord", word: w });
        app.querySelector("#wl-status").innerHTML = wlStatusHtml({ ...st, submitted: st.submitted.includes(myId) ? st.submitted : st.submitted.concat(myId) });
      };
    }
  }

  // ---------- Wo liegt das?: Darstellung ----------
  let geoMap = null, geoRendered = null, geoMine = null, geoMarker = null, geoDeadline = 0, geoSent = null;
  let obenMap = null, obenZoom = null, geoStart = 0; // „Von oben“: Bildkarte, aktuelle Zoomstufe, Startzeit der Runde
  // Satellitenbilder ohne Beschriftungen (Esri World Imagery, ohne API-Schlüssel nutzbar)
  const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  // Kompakter Punktestand im Kopf-Element (spart Platz für die Karte)
  function geoChips(v, st) {
    return v.players.map((p, i) => {
      const done = st.step === "guess" ? st.submitted.includes(p.id) : st.step === "reveal" ? !!st.ready[p.id] : false;
      const mark = st.step === "guess" ? (done ? "✓" : "…") : done ? "✓" : "";
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${st.step === "guess" ? (done ? "festgelegt" : "sucht noch") : done ? "bereit" : ""}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
        <b>${(st.total[p.id] || 0).toLocaleString("de-DE")}</b>${mark ? `<span class="geo-mark">${mark}</span>` : ""}</span>`;
    }).join("");
  }
  // Auflösung: Entfernung, Rundenpunkte, Gesamtstand und wer schon weiter will
  function geoResults(v, st) {
    const fmt = (km) => km == null ? "keine Nadel" : (km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km).toLocaleString("de-DE")) + " km";
    return v.players.map((p, i) => ({ p, i })).filter(({ p }) => st.result[p.id])
      .sort((a, b) => st.result[b.p.id].points - st.result[a.p.id].points).map(({ p, i }) => {
        const r = st.result[p.id];
        return `<div class="geo-res ${st.ready[p.id] ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><span class="pdot ${p.connected ? "" : "off"}"></span>
          <span class="geo-score-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}${st.ready[p.id] ? ` <span class="geo-mark">✓</span>` : ""}</span>
          <span class="muted small">${fmt(r.km)}${r.factor != null && r.factor !== 1 && r.km != null ? ` · ×${String(r.factor).replace(".", ",")}` : ""}</span><b>+${r.points}</b><span class="geo-total" title="Gesamt">${(st.total[p.id] || 0).toLocaleString("de-DE")}</span></div>`;
      }).join("");
  }
  function geoSubmit() {
    const st = view && view.geo;
    if (!st || !geoMine || st.step !== "guess" || geoSent === st.round) return;
    geoSent = st.round;
    send({ type: "geoGuess", round: st.round, lat: geoMine.lat, lng: geoMine.lng });
    const b = app.querySelector("#geo-lock");
    if (b) { b.disabled = true; b.textContent = "Festgelegt ✓ – warte auf die anderen …"; }
  }
  setInterval(() => {
    const st = view && view.geo, el = document.getElementById("geo-timer");
    if (!st || st.step !== "guess" || !el || st.endsIn == null) return;
    const ms = Math.max(0, geoDeadline - Date.now());
    el.textContent = Math.ceil(ms / 1000) + " s"; el.classList.toggle("urgent", ms <= 10000);
    if (ms <= 300) geoSubmit(); // gesetzte Nadel bei Zeitablauf automatisch abgeben
    if (st.mode === "oben" && st.pic && obenMap) obenUpdate(st.pic);
  }, 250);
  function obenUpdate(pic) {
    const step = Math.max(0, Math.min(pic.steps - 1, Math.floor((Date.now() - geoStart) / pic.stepMs)));
    const z = pic.zoom - step;
    if (obenZoom !== z) { obenZoom = z; obenMap.setView([pic.lat, pic.lng], z, { animate: true, duration: 0.8 }); }
    const f = app.querySelector("#oben-factor");
    if (f) f.textContent = "Punkte ×" + String(pic.factors[step]).replace(".", ",");
  }
  function geoMakeMap(el, bounds) {
    if (geoMap) { geoMap.remove(); geoMap = null; }
    const b = LF.latLngBounds(bounds);
    geoMap = LF.map(el, { zoomControl: true, attributionControl: true, worldCopyJump: false, maxBounds: b.pad(0.6), maxBoundsViscosity: 0.8 });
    LF.tileLayer(TILE_URL, { maxZoom: 17, attribution: "Bilder © Esri, Maxar, Earthstar Geographics und GIS-Community" }).addTo(geoMap);
    geoMap.fitBounds(b);
    geoMap.setMinZoom(Math.max(1, geoMap.getZoom() - 1));
    return geoMap;
  }
  // ---------- Höher oder tiefer ----------
  let hlRendered = null;
  function hlChips(v, st) {
    return v.players.map((p, i) => {
      const done = st.step === "guess" && st.submitted && st.submitted.includes(p.id);
      const ok = st.step === "reveal" && st.result ? st.result.ok[p.id] : undefined;
      const mark = st.step === "guess" ? (done ? "✓" : "…") : ok === true ? "✓" : ok === false ? "✗" : "";
      return `<span class="geo-score ${done || ok ? "done" : ""} ${ok === false ? "miss" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
        <b>${st.total[p.id] || 0}</b>${mark ? `<span class="geo-mark">${mark}</span>` : ""}</span>`;
    }).join("");
  }
  function renderHl() {
    const v = view, st = v.hl;
    if (!st) return;
    const key = v.code + ":" + st.catNo + ":" + st.pos + ":" + st.step;
    if (hlRendered === key && app.querySelector(".hl-main")) {
      const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = hlChips(v, st);
      return;
    }
    hlRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    let main = "";
    if (st.step !== "final") {
      const up = st.cat.year ? "später" : "höher", down = st.cat.year ? "früher" : "tiefer";
      const mine = st.step === "guess" ? hlMine(st) : st.picks && st.picks[myId];
      const right = st.result && st.result.right;
      const whoPicked = (dir) => st.step === "reveal" ? Object.entries(st.picks).filter(([, d]) => d === dir).map(([pid]) => `<i class="pdot" style="--pc:${colorOf(pid)}"></i>`).join("") : "";
      const btn = (dir, label, icon) => `<button class="hl-btn ${mine === dir ? "on" : ""} ${right && (right === dir || right === "both") ? "right" : ""}" data-dir="${dir}" ${st.step !== "guess" ? "disabled" : ""}>
          <span class="hl-ico">${icon}</span><span>${label}</span><span class="hl-who">${whoPicked(dir)}</span></button>`;
      const okMe = st.step === "reveal" && st.result ? st.result.ok[myId] : undefined;
      main = `
        <div class="geo-scores hl-pills">${hlChips(v, st)}</div>
        <div class="hl-title"><div class="hl-catname">${esc(st.cat.name)}</div>
          <div class="muted small">${esc(st.cat.q)}${st.cat.approx ? " · Werte ca." : ""}${st.cat.note ? " · " + esc(st.cat.note) : ""}</div></div>
        <div class="hl-main">
          <div class="hl-cards">
            <div class="hl-card known"><div class="hl-name">${esc(st.prev.name)}</div><div class="hl-val">${esc(st.prev.value)}</div></div>
            <div class="hl-vs ${st.step === "reveal" ? "res" : ""}">${st.step === "reveal" ? (right === "up" ? "▲" : right === "down" ? "▼" : "=") : "VS"}</div>
            <div class="hl-card ${st.step === "reveal" ? "shown" + (okMe === true ? " good" : okMe === false ? " badres" : "") : "unknown"}"><div class="hl-name">${esc(st.cur.name)}</div>
              <div class="hl-val" ${st.step === "reveal" ? `data-count="${esc(st.cur.value)}"` : ""}>${st.step === "reveal" ? esc(st.cur.value) : "?"}</div></div>
          </div>
          <div class="hl-btns">${btn("up", up, "▲")}${btn("down", down, "▼")}</div>
          <p class="muted small hl-status">${st.step === "guess"
            ? (mine ? `Du hast „${mine === "up" ? up : down}“ gewählt – warte auf die anderen … (du kannst noch umentscheiden)` : "")
            : okMe === true ? "✓ Richtig! Gleich geht es weiter …" : okMe === false ? "✗ Leider falsch. Gleich geht es weiter …" : "Gleich geht es weiter …"}</p>
          ${st.chain.length ? `<div class="hl-chain"><span class="hl-link">${esc(st.start.name)} <b>${esc(st.start.value)}</b></span>${st.chain.map((c) =>
            `<span class="hl-arrow">${c.right === "up" ? "▲" : c.right === "down" ? "▼" : "="}</span><span class="hl-link">${esc(c.name)} <b>${esc(c.value)}</b></span>`).join("")}</div>` : ""}
        </div>`;
    } else {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      main = `
        <div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((p) => st.winners.includes(p.id)).map((p) => esc(p.name)).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="hl-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((p, i) => `
          <div class="slf-rank" style="--pc:${colorOf(p.id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
            <span class="slf-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span><b>${st.total[p.id] || 0} von ${st.max}</b></div>`).join("")}
          <p class="muted small">Kategorien: ${st.cats.map(esc).join(" · ")}</p></div>`;
    }
    app.innerHTML = `
      <main class="screen game slf geo hl">
        <header class="top topbar">
          ${headBrandHtml("hl")}
          <div class="meta">${st.step !== "final" ? `Kategorie ${st.catNo}/${st.catCount} · Vergleich ${st.pos}/${st.steps} · ` : ""}Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="slf-main">${main}</section>
      </main>`;
    // Auflösung: Wert zählt hoch
    const cnt = app.querySelector(".hl-val[data-count]");
    if (cnt) {
      const full = cnt.dataset.count, m = /^([\d.,]+)(.*)$/.exec(full);
      if (m) {
        const raw = m[1], dec = raw.includes(",") ? raw.split(",")[1].length : 0, target = Number(raw.replace(/\./g, "").replace(",", "."));
        const year = st.cat.year, t0 = performance.now(), dur = 900;
        const fmtN = (x) => year ? String(Math.round(x)) : x.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const stepF = (now) => {
          const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          const from = year ? Math.max(0, target - 120) : 0;
          cnt.textContent = (k < 1 ? fmtN(from + (target - from) * e) : raw) + m[2];
          if (k < 1 && cnt.isConnected) requestAnimationFrame(stepF);
        };
        requestAnimationFrame(stepF);
      }
    }
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#hl-restart", () => send({ type: "hlRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll(".hl-btn").forEach((b) => b.onclick = () => {
      if (st.step !== "guess") return;
      hlPick = { key: st.ci + ":" + st.pos, dir: b.dataset.dir };
      send({ type: "hlPick", ci: st.ci, pos: st.pos, dir: b.dataset.dir });
      hlRendered = null; renderHl();
    });
  }
  let hlPick = null; // eigene Wahl (sofort anzeigen, bevor der Gastgeber bestätigt)
  const hlMine = (st) => hlPick && hlPick.key === st.ci + ":" + st.pos ? hlPick.dir : null;

  // ---------- Antwort sucht Frage ----------
  let fqRendered = null, fqTimer = null, fqSent = null;
  function renderFrage() {
    const v = view, st = v.frage;
    if (!st) return;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const seated = st.seats.includes(myId), iAsk = st.asker === myId, iGuess = st.guesser === myId;
    const priv = iAsk && wattenPriv && wattenPriv.roundNo === st.round && wattenPriv.li === st.li ? wattenPriv : null;
    const endAt = st.deadlineIn ? Date.now() + st.deadlineIn : 0;
    clearInterval(fqTimer);
    if (endAt) fqTimer = setInterval(() => {
      const bar = app.querySelector(".du-time i"), txt = app.querySelector(".du-time b");
      if (!bar || view.phase !== "frage") return clearInterval(fqTimer);
      const left = Math.max(0, endAt - Date.now());
      bar.style.width = (100 * left / st.timerMs) + "%";
      txt.textContent = left >= 60000 ? Math.floor(left / 60000) + ":" + String(Math.floor(left / 1000) % 60).padStart(2, "0") + " min" : Math.ceil(left / 1000) + " s";
      bar.parentNode.classList.toggle("urgent", left < 10000);
    }, 250);
    const key = [v.code, st.round, st.step, st.li, priv ? priv.answer : "", st.question, st.guess, st.complaint ? st.complaint.state : "", st.result && st.result.voided].join(":");
    const activeId = st.step === "write" || st.step === "judge" ? st.asker : st.step === "answer" ? st.guesser : null;
    const players = () => st.seats.map((id) => {
      const ask = id === st.asker, dots = Array.from({ length: st.target }, (_, k) => `<i class="${k < st.score[id] ? "on" : ""}"></i>`).join("");
      return `<div class="fq-player ${activeId === id ? "active" : ""}" style="--pc:${colorOf(id)}">
        <div class="fq-ava">${esc((nameOf(id) || "?").charAt(0).toUpperCase())}</div>
        <div class="fq-pinfo"><div class="fq-pname">${esc(nameOf(id))}${id === myId ? " <em>(du)</em>" : ""}</div>
          <div class="fq-badge ${ask ? "ask" : "guess"}">${ask ? "✍️ fragt" : "💡 antwortet"}</div></div>
        <div class="fq-score"><b>${st.score[id]}</b><div class="fq-dots">${dots}</div></div></div>`;
    }).join("");
    if (fqRendered === key && app.querySelector(".fq-main")) { const sc = app.querySelector(".fq-players"); if (sc) sc.innerHTML = players(); return; }
    fqRendered = key;
    if (st.step === "reveal" || st.step === "final") fqSent = null; // Schutz gegen doppeltes Abschicken gilt nur innerhalb einer Runde
    const fmtLeft = (ms) => ms >= 60000 ? Math.floor(ms / 60000) + ":" + String(Math.floor(ms / 1000) % 60).padStart(2, "0") + " min" : Math.ceil(ms / 1000) + " s";
    const time = () => st.timerMs && st.deadlineIn ? `<div class="du-time"><i style="width:${100 * st.deadlineIn / st.timerMs}%"></i><b>${fmtLeft(st.deadlineIn)}</b></div>` : "";
    const stepNo = st.step === "write" ? 0 : st.step === "answer" || st.step === "judge" ? 1 : 2;
    const steps = `<ol class="fq-steps">${["Frage ausdenken", "Antworten", "Auflösung"].map((t, k) =>
      `<li class="${k < stepNo ? "done" : k === stepNo ? "on" : ""}"><span>${k < stepNo ? "✓" : k + 1}</span>${t}</li>`).join("")}</ol>`;
    const catTile = `<div class="fq-tile cat"><span>Kategorie</span><b>${esc(st.cat)}</b></div>`;
    const secret = (a) => `<div class="fq-tile secret"><span>Gesuchte Antwort</span><b>${esc(a)}</b>${iAsk && stepNo < 2 ? `<small>🤫 nur du siehst sie</small>` : ""}</div>`;
    const bubble = st.question ? `<div class="fq-bubble ${stepNo === 2 ? "small" : ""}" style="--pc:${colorOf(st.asker)}">
        <div class="fq-bubble-who"><i class="fq-mini" style="--pc:${colorOf(st.asker)}">${esc(nameOf(st.asker).charAt(0).toUpperCase())}</i>${iAsk ? "Deine Frage" : esc(nameOf(st.asker)) + " fragt"}</div>
        <div class="fq-bubble-q">${esc(st.question)}</div></div>` : "";
    const waiting = (id, text, icon) => `<div class="fq-wait"><div class="fq-wait-ico">${icon}</div><div><b style="color:${colorOf(id)}">${esc(nameOf(id))}</b> ${text}<span class="fq-dotsanim"><i></i><i></i><i></i></span></div></div>`;
    let body = "";
    if (st.step === "write") {
      if (iAsk) body = `<div class="fq-task">${catTile}${priv ? secret(priv.answer) : `<div class="fq-tile secret"><span>Gesuchte Antwort</span><b>…</b></div>`}</div>
        ${time()}
        <form class="fq-form" autocomplete="off"><label for="fq-q">Deine Frage</label>
          <textarea id="fq-q" rows="3" maxlength="300" placeholder="Eine Frage, deren Antwort „${priv ? esc(priv.answer) : "…"}“ ist …"></textarea>
          <div class="fq-row"><button type="button" id="fq-pass" class="btn ghost">Passen</button><button class="btn primary">Frage stellen</button></div></form>
        <p class="muted small fq-hint">Die Frage soll in die Kategorie passen und eindeutig sein.<span class="fq-keys"> Enter schickt ab, Umschalt+Enter macht eine neue Zeile.</span></p>`;
      else body = `<div class="fq-task one">${catTile}</div>${time()}${waiting(st.asker, "denkt sich eine Frage aus", "✍️")}`;
    } else if (st.step === "answer") {
      body = `${bubble}${time()}` + (iGuess
        ? `<form class="du-form fq-aform" autocomplete="off"><input id="fq-a" maxlength="80" placeholder="Deine Antwort …" enterkeyhint="send"><button class="btn primary">Antworten</button></form>`
        : `${iAsk && priv ? `<div class="fq-task one">${secret(priv.answer)}</div>` : ""}${waiting(st.guesser, "überlegt", "💡")}`);
    } else if (st.step === "judge") {
      body = `${bubble}<div class="fq-said"><span>${iGuess ? "Deine Antwort" : esc(nameOf(st.guesser)) + " antwortet"}</span><b>${esc(st.guess)}</b></div>
        <div class="banner judge du-judge">${iAsk ? `<div class="judge-ask">Gesuchte Antwort: <b>${priv ? esc(priv.answer) : "…"}</b> – zählt das?</div>
          <div class="banner-actions"><button class="btn primary" data-fqjudge="1">✓ Zählt</button><button class="btn ghost" data-fqjudge="0">✗ Zählt nicht</button></div>`
          : `<div class="muted small">Nicht wörtlich gleich – ${esc(nameOf(st.asker))} entscheidet, ob es zählt …</div>`}</div>`;
    } else {
      const r = st.result, iWon = !r.voided && r.winner === myId, cp = st.complaint;
      const G = iGuess ? null : esc(nameOf(st.guesser)), A = iAsk ? null : esc(nameOf(st.asker));
      const reason = { right: G ? `${G} wusste die Antwort.` : "Du wusstest die Antwort.", wrong: G ? `${G} lag daneben.` : "Du lagst daneben.",
        time: G ? `${G} hat nicht rechtzeitig geantwortet.` : "Du hast nicht rechtzeitig geantwortet.",
        noq: A ? `${A} ist keine Frage eingefallen.` : "Dir ist keine Frage eingefallen.", pass: A ? `${A} hat gepasst.` : "Du hast gepasst." }[r.why];
      const ok = r.why === "right";
      body = `${bubble}<div class="fq-compare">
          <div class="fq-tile secret"><span>🎯 Gesuchte Antwort</span><b>${esc(st.answer)}</b></div>
          ${st.guess ? `<div class="fq-tile given ${ok ? "ok" : "bad"}"><span>💬 ${iGuess ? "Deine Antwort" : esc(nameOf(st.guesser)) + " sagte"}</span><b>${esc(st.guess)}</b><i class="fq-mark">${ok ? "✓" : "✗"}</i></div>`
            : `<div class="fq-tile given none"><span>💬 Antwort</span><b>—</b></div>`}</div>
        ${cp && cp.state === "open" ? `<div class="banner judge du-judge"><div class="judge-q">${iGuess ? "Du findest" : `<b>${esc(nameOf(st.guesser))}</b> findet`} die Frage unpassend.</div>
          ${iAsk ? `<div class="judge-ask">Passt die Frage nicht zur Antwort oder Kategorie, oder war sie nicht eindeutig? Dann zählt die Runde nicht.</div>
            <div class="banner-actions"><button class="btn primary" data-fqcomplaint="1">Stimmt – Runde zählt nicht</button><button class="btn ghost" data-fqcomplaint="0">Nein, die Frage war fair</button></div>`
            : `<div class="muted small">${esc(nameOf(st.asker))} entscheidet …</div>`}</div>` : ""}
        <div class="banner fq-result ${iWon ? "win" : seated && !r.voided ? "lose" : ""}">${st.step === "final" ? `<div class="trophy">🏆</div><b>${iWon ? "Du gewinnst" : esc(nameOf(r.winner)) + " gewinnt"} ${st.score[r.winner]} : ${st.score[st.seats.find((x) => x !== r.winner)]}!</b>`
          : r.voided ? `<b>Diese Runde zählt nicht</b>` : `<b>${iWon ? "Punkt für dich!" : "Punkt für " + esc(nameOf(r.winner))}</b>`}
          <div class="small">${r.voided ? `Beschwerde angenommen – die Frage war unpassend.` : reason}${cp && cp.state === "rejected" ? ` Beschwerde abgelehnt – ${esc(nameOf(st.asker))} fand die Frage fair.` : ""}</div>
          <div class="banner-actions">${iGuess && r.winner === st.asker && !r.voided && !cp ? `<button id="fq-complain" class="btn ghost">👎 Frage war unpassend</button>` : ""}
            ${cp && cp.state === "open" ? "" : st.step === "final" ? `<button id="fq-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
            : seated || isHost ? `<button id="fq-next" class="btn primary">Nächste Runde</button>` : ""}</div></div>`;
    }
    app.innerHTML = `
      <main class="screen game slf du fq">
        <header class="top topbar">
          ${headBrandHtml("frage")}
          <div class="meta">Runde ${st.round} · bis ${st.target} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="fq-main">
          <div class="fq-players">${players()}</div>
          ${steps}
          <div class="fq-stage">${st.step !== "write" ? `<div class="fq-catchip"><span>Kategorie</span>${esc(st.cat)}</div>` : ""}${body}</div>
          ${!seated ? `<p class="muted small du-watch">Du schaust zu – es spielen ${esc(nameOf(st.seats[0]))} und ${esc(nameOf(st.seats[1]))}.</p>` : ""}
        </section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#fq-next", () => send({ type: "fqNext" }));
    on("#fq-restart", () => send({ type: "fqRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-fqjudge]").forEach((b) => b.onclick = () => send({ type: "fqJudge", ok: b.dataset.fqjudge === "1" }));
    on("#fq-complain", () => send({ type: "fqComplain" }));
    on("#fq-pass", async () => {
      if (!(await askConfirm("Passen?", `Dann bekommt ${nameOf(st.guesser)} den Punkt.`, "Passen"))) return;
      send({ type: "fqPass", round: st.round });
    });
    app.querySelectorAll("[data-fqcomplaint]").forEach((b) => b.onclick = () => send({ type: "fqComplaint", ok: b.dataset.fqcomplaint === "1" }));
    const qf = app.querySelector(".fq-form");
    if (qf) {
      const ta = qf.querySelector("#fq-q");
      // Entwurf bleibt nur innerhalb derselben Runde erhalten (z. B. beim Neuzeichnen), danach ist das Feld leer
      const dKey = "s10-fq-draft", dId = [v.code, st.round, st.li, st.asker].join(":");
      try { const d = JSON.parse(sessionStorage.getItem(dKey) || "null"); if (d && d.id === dId) ta.value = d.text; else sessionStorage.removeItem(dKey); } catch (e) {}
      ta.oninput = () => { try { sessionStorage.setItem(dKey, JSON.stringify({ id: dId, text: ta.value })); } catch (e) {} };
      ta.focus();
      ta.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); qf.requestSubmit(); } };
      qf.onsubmit = (e) => {
        e.preventDefault(); const t = ta.value.trim(); if (!t) return;
        const k = "q" + st.round; if (fqSent === k) return; fqSent = k;
        try { sessionStorage.removeItem("s10-fq-draft"); } catch (e) {}
        send({ type: "fqQuestion", round: st.round, text: t });
      };
    }
    const af = app.querySelector(".du-form");
    if (af) {
      const inp = af.querySelector("#fq-a"); inp.focus();
      af.onsubmit = (e) => {
        e.preventDefault(); const t = inp.value.trim(); if (!t) return;
        const k = "a" + st.round; if (fqSent === k) return; fqSent = k;
        inp.disabled = true; send({ type: "fqGuess", round: st.round, text: t });
      };
    }
  }

  // ---------- Listen-Duell ----------
  let duRendered = null, duSent = null, duTimer = null;
  // Spalten am Computer: bis 16 Antworten zwei (große Felder), dann mehr – alle Felder gleich groß
  const duCols = (n) => n <= 16 ? 2 : n <= 24 ? 3 : 4;
  function renderDuell() {
    const v = view, st = v.duell;
    if (!st) return;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const seated = st.seats.includes(myId), opp = (id) => st.seats.find((x) => x !== id);
    const myTurn = st.step === "turn" && st.turn === myId;
    // Zeit: lokal weiterzählen
    const endAt = st.deadlineIn ? Date.now() + st.deadlineIn : 0;
    clearInterval(duTimer);
    if (endAt) duTimer = setInterval(() => {
      const bar = app.querySelector(".du-time i"), txt = app.querySelector(".du-time b");
      if (!bar || view.phase !== "duell") return clearInterval(duTimer);
      const left = Math.max(0, endAt - Date.now());
      bar.style.width = (100 * left / st.timerMs) + "%"; txt.textContent = Math.ceil(left / 1000) + " s";
      bar.parentNode.classList.toggle("urgent", left < 6000);
    }, 200);
    const key = [v.code, st.round, st.step, st.turn, st.moves.length, st.judge ? st.judge.text : ""].join(":");
    const pills = () => st.seats.map((id) => `<div class="du-pill ${st.step === "turn" && st.turn === id ? "on" : ""}" style="--pc:${colorOf(id)}">
        <i class="pdot"></i><span>${esc(nameOf(id))}${id === myId ? " <em>(du)</em>" : ""}</span><b>${st.score[id]}</b><small>/${st.target}</small></div>`).join("");
    if (duRendered === key && app.querySelector(".du-main")) { const sc = app.querySelector(".du-pills"); if (sc) sc.innerHTML = pills(); return; }
    duRendered = key;
    const rows = st.items.map((it, i) => {
      const found = it.by != null;
      return `<li class="du-row ${found ? "found" : it.t ? "missed" : ""} ${st.judge && it.t === st.judge.t && !found ? "" : ""}" style="${found ? `--pc:${colorOf(it.by)}` : ""}">
        <span class="du-no">${i + 1}</span><span class="du-t">${it.t ? esc(it.t) : "?"}</span>${found ? `<span class="du-by">${esc(nameOf(it.by))}</span>` : ""}</li>`;
    }).join("");
    const last = st.moves.slice(-1)[0];
    const why = { wrong: "gehört nicht dazu", dup: "wurde schon genannt", time: "", full: "" };
    let action = "";
    if (st.step === "turn") {
      action = myTurn
        ? `<form class="du-form" autocomplete="off"><input id="du-in" maxlength="60" placeholder="Deine Antwort …" enterkeyhint="send" autocapitalize="sentences"><button class="btn primary">Nennen</button></form>`
        : `<p class="du-wait"><b style="color:${colorOf(st.turn)}">${esc(nameOf(st.turn))}</b> ist dran …</p>`;
      if (st.timerMs) action = `<div class="du-time"><i style="width:${100 * st.deadlineIn / st.timerMs}%"></i><b>${Math.ceil(st.deadlineIn / 1000)} s</b></div>` + action;
    } else if (st.step === "judge") {
      const j = st.judge, judge = opp(j.by) === myId;
      action = `<div class="banner judge du-judge"><div class="judge-q"><b>${esc(nameOf(j.by))}</b> sagt: „${esc(j.text)}“</div>
        ${judge ? `<div class="judge-ask">Meint ${esc(nameOf(j.by))} damit <b>${esc(j.t)}</b>? Zählt das?</div>
          <div class="banner-actions"><button class="btn primary" data-dujudge="1">✓ Zählt</button><button class="btn ghost" data-dujudge="0">✗ Zählt nicht</button></div>`
          : `<div class="muted small">Ähnlich wie eine Antwort auf der Liste – ${esc(nameOf(opp(j.by)))} entscheidet, ob es zählt …</div>`}</div>`;
    } else {
      const r = st.result, iWon = !r.voided && r.winner === myId, cp = st.complaint;
      const reason = r.why === "full" ? `Alle ${st.items.length} gefunden – ${esc(nameOf(r.winner))} hat die letzte genannt.`
        : r.why === "time" ? `Bei ${esc(nameOf(r.loser))} ist die Zeit abgelaufen.`
        : `${esc(nameOf(r.loser))}: „${esc(last ? last.text : "")}“ ${why[r.why]}.`;
      if (st.step === "roundEnd") action = `<div class="banner ${iWon ? "win" : seated ? "lose" : ""}"><b>Punkt für ${esc(nameOf(r.winner))}${iWon ? " – das bist du!" : ""}</b>
          <div class="small">${reason}</div>
          <div class="banner-actions">${seated || isHost ? `<button id="du-next" class="btn primary">Nächste Runde</button>` : ""}</div></div>`;
      else action = `<div class="banner win"><div class="trophy">🏆</div><b>${esc(nameOf(r.winner))} gewinnt ${st.score[r.winner]} : ${st.score[opp(r.winner)]}!</b>
          <div class="small">${reason}</div>
          <div class="banner-actions"><button id="du-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>`;
    }
    const log = st.moves.slice().reverse().slice(0, 4).map((m) => `<li style="--pc:${colorOf(m.by)}"><i class="pdot"></i>${esc(nameOf(m.by))}: ${m.text ? `„${esc(m.text)}“` : "keine Antwort"} ${m.ok ? "✓" : "✗"}</li>`).join("");
    app.innerHTML = `
      <main class="screen game slf du">
        <header class="top topbar">
          ${headBrandHtml("duell")}
          <div class="meta">Runde ${st.round} · bis ${st.target} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="du-main">
          <div class="du-pills">${pills()}</div>
          <div class="du-title">${st.list.cat ? `<div class="du-cat">${esc(st.list.cat)}</div>` : ""}<h2>${esc(st.list.q)}</h2><div class="du-count">${st.items.filter((x) => x.by).length} von ${st.items.length} gefunden</div>${st.list.note ? `<div class="muted small">${esc(st.list.note)}</div>` : ""}</div>
          <div class="du-action">${action}</div>
          <ol class="du-list ${duCols(st.items.length) > 2 ? "many" : ""}" style="--cols:${duCols(st.items.length)};--rows:${Math.ceil(st.items.length / duCols(st.items.length))};--mcols:${st.items.length > 10 ? 2 : 1};--mrows:${Math.ceil(st.items.length / (st.items.length > 10 ? 2 : 1))}">${rows}</ol>
          ${log ? `<ul class="du-log">${log}</ul>` : ""}
          ${!seated ? `<p class="muted small du-watch">Du schaust zu – es spielen ${esc(nameOf(st.seats[0]))} und ${esc(nameOf(st.seats[1]))}.</p>` : ""}
        </section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#du-next", () => send({ type: "duNext" }));
    on("#du-restart", () => send({ type: "duRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-dujudge]").forEach((b) => b.onclick = () => send({ type: "duJudge", ok: b.dataset.dujudge === "1" }));
    const form = app.querySelector(".du-form");
    if (form) {
      const inp = form.querySelector("#du-in");
      inp.focus();
      form.onsubmit = (e) => {
        e.preventDefault();
        const t = inp.value.trim(); if (!t) return;
        const k = st.round + ":" + st.moves.length; if (duSent === k) return; duSent = k; // nicht doppelt schicken
        inp.disabled = true; form.querySelector("button").disabled = true;
        send({ type: "duAnswer", round: st.round, text: t });
      };
    }
  }

  // ---------- Watten ----------
  const wCard = (id, extra = "", attrs = "") => `<div class="wcard ${extra}" ${attrs}>${WCARDS.svg(id)}</div>`;
  const wBack = () => `<div class="wcard back">${WCARDS.back()}</div>`;
  const wSuitIcon = (suit) => `<span class="wsuit">${WCARDS.sym(suit, 1)}</span>`;
  // Stich-Animation: fertiger Stich bleibt kurz in der Mitte, dann wandern die Karten zum Stapel des Gewinners
  let wShown = { round: 0, n: 0 }, wHold = null, wFly = null;
  // Kurzinfo zum Spielmodus im rechten Rand
  function wattenModeHtml(st) {
    const tr = st.weliMode === "trumpf";
    return `<details class="wmode" ${store.get("s10-wmode-open") === true ? "open" : ""}><summary>Spielmodus: Weli ist ${tr ? "kleinster Trumpf" : "kleinste Schelle"} · bis ${st.target}</summary>
      <ul>
        <li><b>Rangfolge:</b> Guter → Rechter → andere Schläge → Trümpfe → ausgeworfene Farbe.</li>
        <li><b>Guter:</b> Trumpf einen Rang über dem Schlag. Beim Ass: ${tr ? "die Trumpf-Sieben" : "die Trumpf-Sieben, bei Trumpf Schelle der Weli"}.</li>
        <li><b>Weli</b> ${tr ? "zählt immer als kleinster Trumpf (muss beim Trumpf zugeben mitgegeben werden)" : "ist eine Schell-Sechs, nur Trumpf wenn Schelle Trumpf ist"}.
          Als Schlag: ${tr ? "beste Karte, kein Guter" : "der Rechte, Guter ist die Trumpf-Sieben"}.</li>
        <li><b>Trumpf zugeben:</b> Wird Trumpf ausgeworfen (nicht der Gute), muss man Trumpf geben oder stechen.</li>
        <li><b>Punkte:</b> 2, Bieten +1 (abgelehnt = bisheriger Wert). Gestrichen ab ${st.target - 2}: kein Bieten; bei mind. 4 Rückstand des anderen gehen 4 – halten oder gehen (Gegner +2).</li>
      </ul></details>`;
  }
  function renderWatten() {
    const v = view, st = v.watten;
    if (!st) return;
    const nTricks = st.seats.reduce((a, id) => a + st.tricks[id], 0);
    if (wShown.round !== st.roundNo) { wShown = { round: st.roundNo, n: nTricks }; wHold = null; }
    if (wHold && st.trick.length) { wShown.n = nTricks; wHold = null; } // neue Karte liegt: alten Stich nicht mehr zeigen
    if (nTricks > wShown.n && !wHold && st.lastTrick && !st.trick.length) {
      wHold = { winner: st.lastTrick.winner, cards: st.lastTrick.cards };
      const held = wHold, heldRound = st.roundNo;
      setTimeout(() => {
        if (wHold !== held || wShown.round !== heldRound) return; // inzwischen neue Runde
        const tr = app.querySelector(".wtrick");
        wFly = { winner: held.winner, from: tr ? [...tr.querySelectorAll(".wcard")].map((c) => c.getBoundingClientRect()) : [] };
        wShown.n = nTricks; wHold = null; if (view && view.phase === "watten") renderWatten();
      }, 1800); // wie beim Schnapsen: Stich in Ruhe zeigen
    }
    const me = myId, seated = st.seats.includes(me), opp = seated ? st.seats.find((x) => x !== me) : st.seats[1];
    const self = seated ? me : st.seats[0];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const priv = seated && wattenPriv && wattenPriv.roundNo === st.roundNo ? wattenPriv : null;
    const hand = priv ? priv.hand : [], legal = priv ? priv.legal : [];
    const rankName = (r) => WAT.RANK_NAMES[r], suitName = (s) => WAT.SUIT_NAMES[s];
    // Wattblock: je Spieler eine Spalte, pro Runde die gewonnenen Punkte (die Summe steht oben neben dem Namen).
    // Wer gestrichen ist (2 vor dem Ziel), bekommt einen Strich unter die Zahl. Oben: gewonnene Partien als Kreuzl.
    const wattBlock = () => {
      const cols = [self, opp], run = { [self]: 0, [opp]: 0 }, struck = { [self]: false, [opp]: false };
      const rows = st.history.map((h) => {
        run[h.winner] += h.points;
        const strich = !struck[h.winner] && run[h.winner] >= st.target - 2 && run[h.winner] < st.target;
        if (strich) struck[h.winner] = true;
        return cols.map((id) => id === h.winner
          ? `<td class="${strich ? "strich" : ""} ${run[id] >= st.target ? "sieg" : ""}" title="+${h.points}${h.reason === "aufgegeben" ? " (gegangen)" : h.reason === "abgelehnt" ? " (Bieten abgelehnt)" : ""}">${h.points}</td>`
          : `<td class="wdash">–</td>`).join("");
      });
      const tally = (n) => n ? "✕".repeat(Math.min(n, 10)) + (n > 10 ? " " + n : "") : "";
      return `<table class="wblock">
        <thead><tr>${cols.map((id) => `<th style="--pc:${colorOf(id)}"><div class="wgeber">${id === st.dealer ? "Geber" : ""}</div><span class="wsum ${st.turn === id ? "dran" : ""}">${st.scores[id]}</span>${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}
          ${st.gestrichen[id] ? `<span class="wtag">gestrichen</span>` : ""}
          <div class="wkreuz" title="gewonnene Partien">${tally((st.games || {})[id] || 0)}</div></th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${r}</tr>`).join("") || `<tr><td colspan="2" class="muted small">noch keine Punkte</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2" class="muted small">bis ${st.target} · gestrichen ab ${st.target - 2}</td></tr></tfoot></table>`;
    };
    const scorePill = (id) => `<span class="geo-score ${st.turn === id ? "done" : ""}" style="--pc:${colorOf(id)}"><span class="pdot"></span>
        <span class="geo-score-name">${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}</span><b>${st.scores[id]}</b><span class="geo-mark">/ ${st.target}</span>
        ${st.gestrichen[id] ? `<span class="wtag">gestrichen</span>` : ""}${id === st.dealer ? `<span class="wtag dim">Geber</span>` : ""}</span>`;
    const myMove = (st.step === "play" && st.mustDecide === me) || (st.step === "schlag" && st.vorhand === me) || (st.step === "trumpf" && st.dealer === me) ||
      (st.step === "play" && (st.bid ? st.bid.by !== me && seated : st.turn === me));
    const whoMoves = st.step === "schlag" ? st.vorhand : st.step === "trumpf" ? st.dealer : st.step === "play" ? (st.bid ? st.seats.find((x) => x !== st.bid.by) : st.turn) : null;
    // „Du bist dran“ unten rechts (bei den eigenen Karten), „… ist dran“ oben rechts (beim Gegner)
    const myLabel = st.step === "schlag" ? "Sag den Schlag an!" : st.step === "trumpf" ? "Sag den Trumpf an!" : st.mustDecide === me ? "Halten oder gehen?" : st.bid && st.bid.by !== me ? "Halten oder gehen?" : "Du bist dran!";
    const turnBadge = myMove ? `<div class="wturn me">${myLabel}</div>`
      : whoMoves ? `<div class="wturn other">${esc(nameOf(whoMoves))} ist dran …</div>` : "";
    const callTag = (id) => {
      if (id === st.vorhand && st.schlag) return `<span class="wcall">Schlag: <b>${rankName(st.schlag)}</b></span>`;
      if (id === st.dealer && st.trump) return `<span class="wcall">Trumpf: ${wSuitIcon(st.trump)} <b>${suitName(st.trump)}</b></span>`;
      if (id === st.vorhand && st.step === "schlag") return `<span class="wcall wait">sagt Schlag an …</span>`;
      if (id === st.dealer && st.step === "trumpf") return `<span class="wcall wait">sagt Trumpf an …</span>`;
      return "";
    };
    const tricksDots = (id) => `<span class="wdots">${[0, 1, 2].map((i) => `<i class="${i < st.tricks[id] ? "on" : ""}"></i>`).join("")}</span>`;
    // kompakt: Trumpf-Symbol und daneben der Wert des Schlags
    // Trumpf-Symbol mit Schlagwert sitzt auf dem Spielfeld (rechts, mittig neben dem Stich)
    const combo = st.schlag || st.trump ? `<div class="wcombo" title="${st.trump ? "Trumpf " + suitName(st.trump) : "Trumpf noch offen"}${st.schlag ? " · Schlag " + rankName(st.schlag) : ""}">
          ${st.trump ? `<span class="wsuit big">${WCARDS.sym(st.trump, 1)}</span>` : `<span class="wq">?</span>`}<b>${st.schlag ? rankName(st.schlag) : "?"}</b>
          <span class="wvalue">Es gehen <b>${st.value}</b></span></div>` : "";
    const ann = "";
    // Mitte: aktueller Stich, sonst kurz der letzte
    let table;
    const shownTrick = wHold ? wHold.cards : st.trick;
    if (shownTrick.length) table = `<div class="wtrick">${shownTrick.map((t) => `<div class="wplayed ${wHold && t.pid === wHold.winner ? "won" : ""}"><span class="muted small">${esc(nameOf(t.pid))}</span>${wCard(t.card)}</div>`).join("")}
        ${wHold ? `<p class="muted small wlast">Stich für ${wHold.winner === me ? "dich" : esc(nameOf(wHold.winner))}</p>` : ""}</div>`;
    else table = `<div class="wtrick empty"><span class="muted">${st.step === "play" ? "Noch keine Karte gespielt" : ""}</span></div>`;
    // Stiche-Stapel links: oben der Gegner, unten ich (während der Animation ohne den neuesten Stich)
    const pile = (id, pos) => {
      let groups = (st.won && st.won[id]) || [];
      if (wHold && wHold.winner === id) groups = groups.slice(0, -1);
      // Nur der zuletzt gemachte Stich bleibt offen – sobald die nächste Karte gespielt ist, wird er umgedreht
      const openLast = !wHold && st.trick.length === 0 && st.lastTrick && st.lastTrick.winner === id;
      return `<div class="wpile ${pos}" data-pile="${id}">${groups.map((g, i) => {
        const open = openLast && i === groups.length - 1;
        return `<div class="wpile-g ${i === groups.length - 1 ? "newest" : ""}" style="--i:${i}">${g.map((c) => open ? wCard(c, "xs") : `<div class="wcard xs back">${WCARDS.back()}</div>`).join("")}</div>`;
      }).join("")}</div>`;
    };
    // Aktionen
    let action = "", decide = "";
    // Hinweise fürs Spielfeld (über den eigenen Karten); der rechte Rand bleibt während des Spiels frei
    let hint = "";
    if (st.step === "schlag" && st.vorhand === me) hint = "Tippe auf eine deiner Karten – ihr Wert wird der Schlag.";
    if (st.step === "trumpf" && st.dealer === me) hint = `Tippe auf eine deiner Karten – ihre Farbe wird Trumpf (Schlag: ${rankName(st.schlag)}).`;
    if (st.step === "play") {
      // Halten-oder-gehen-Entscheidung kommt aufs Spielfeld (rechts unten)
      if (st.bid) {
        if (st.bid.by === me) hint = `Du hast ${st.bid.to} geboten – ${esc(nameOf(opp))} entscheidet …`;
        if (seated && st.bid.by !== me) decide = `<div class="wdecide"><p><b>${esc(nameOf(st.bid.by))} bietet ${st.bid.to}.</b></p>
            <button class="btn primary" id="w-hold">Halten (um ${st.bid.to})</button>
            <button class="btn ghost" id="w-fold">Gehen (${esc(nameOf(st.bid.by))} +${st.value})</button></div>`;
      } else if (st.mustDecide === me) {
        decide = `<div class="wdecide"><p><b>Du bist gestrichen – es gehen 4.</b></p>
            <button class="btn primary" id="w-hold4">Halten (um 4)</button>
            <button class="btn ghost" id="w-go">Gehen (${esc(nameOf(opp))} +2)</button></div>`;
      }
      else if (st.turn === me && st.follow === "pflicht") hint = `<b>Trumpf ausgeworfen:</b> Trumpf zugeben oder mit einem Schlag stechen${legal.length === hand.length ? " – du hast keinen, also freie Wahl" : ""}.`;
      else if (st.turn === me && st.follow === "guter") hint = "Der <b>Gute</b> wurde ausgeworfen – kein Trumpf-Zwang.";
      else if (st.mustDecide && st.mustDecide !== me) hint = `${esc(nameOf(st.mustDecide))} entscheidet: halten oder gehen …`;
      // Bieten (und ggf. Aufgeben) als Knöpfe auf dem Spielfeld rechts unten
      if (!decide && (st.canBid[me] || st.giveUpBy === me)) decide = `<div class="wdecide wbidbox">
          ${st.canBid[me] ? `<button class="btn primary" id="w-bid">${st.value + 1} bieten</button>` : ""}
          ${st.giveUpBy === me ? `<button class="btn ghost" id="w-giveup">Aufgeben (${esc(nameOf(opp))} +2)</button>` : ""}</div>`;
    } else if (st.step === "roundEnd" || st.step === "final") {
      const r = st.result, why = { stiche: "mit 3 Stichen", abgelehnt: "– Bieten abgelehnt", aufgegeben: "– der andere hat aufgegeben" }[r.reason] || "";
      action = `<div class="banner ${r.winner === me ? "win" : ""}"><b>${esc(nameOf(r.winner))} gewinnt die Runde ${why}: +${r.points}</b>
        ${st.step === "final" ? `<div style="margin-top:6px">🏆 <b>${esc(nameOf(st.winners[0]))} gewinnt die Partie!</b></div>` : ""}
        ${seated && st.handCount[me] ? `<div class="wshow">${st.shown && st.shown[me] ? `<span class="muted small">Deine Karten sind aufgedeckt.</span>` : `<button id="w-show" class="btn ghost sm">Meine Karten zeigen</button>`}</div>` : ""}
        <div class="banner-actions">${st.step === "final"
          ? `<button id="w-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
          : seated ? `<button id="w-next" class="btn primary">${st.ready[me] ? "Warte auf den anderen … (zurücknehmen)" : "Nächste Runde"}</button>${isHost ? `<button id="w-force" class="btn ghost sm">Sofort weiter</button>` : ""}` : ""}</div></div>`;
    }
    const oppCards = st.reveal && st.reveal[opp] ? st.reveal[opp].map((c) => wCard(c, "sm")).join("") : Array.from({ length: st.handCount[opp] || 0 }, wBack).join("");
    const myCards = !seated ? (st.reveal && st.reveal[self] ? st.reveal[self].map((c) => wCard(c)).join("") : Array.from({ length: st.handCount[self] || 0 }, wBack).join(""))
      : hand.map((c) => {
          // Ansagen über die eigenen Karten: Schlag = Wert der Karte (nicht der Weli), Trumpf = Farbe der Karte
          if (st.step === "schlag" && st.vorhand === me) {
            const r = c.split("-")[1], ok = true; // auch der Weli darf Schlag sein
            return wCard(c, ok ? "play" : "dim", ok ? `data-schlag="${r}" role="button" tabindex="0" aria-label="Schlag ${rankName(r)} ansagen" title="Schlag: ${rankName(r)}"` : "");
          }
          if (st.step === "trumpf" && st.dealer === me) {
            const su = c.split("-")[0];
            return wCard(c, "play", `data-trumpf="${su}" role="button" tabindex="0" aria-label="Trumpf ${suitName(su)} ansagen" title="Trumpf: ${suitName(su)}"`);
          }
          const ok = st.step === "play" && !st.bid && st.turn === me && legal.includes(c);
          return wCard(c, (ok ? "play" : st.turn === me && st.step === "play" && !st.bid ? "dim" : "") + (c === st.guter ? " guter" : ""), ok ? `data-card="${c}" role="button" tabindex="0" aria-label="${esc(WAT.cardName(c))} spielen"` : "");
        }).join("");
    app.innerHTML = `
      <main class="screen game slf geo watten">
        <header class="top topbar">
          ${headBrandHtml("watten")}
          <div class="meta">Runde ${st.roundNo} · bis ${st.target} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <div class="wlayout">
          <section class="wtable">
            <div class="wtop">${combo}${myMove ? "" : turnBadge}</div>${pile(opp, "top")}${pile(self, "bottom")}
            <div class="wside"><span class="muted small wname">${esc(nameOf(opp))} ${tricksDots(opp)} ${callTag(opp)}</span><div class="whand opp">${oppCards}</div></div>
            ${table}
            ${myMove ? turnBadge : ""}${hint ? `<p class="whint">${hint}</p>` : ""}${decide}
            <div class="wside"><span class="muted small wname">${seated ? "Deine Karten" : esc(nameOf(self))} ${tricksDots(self)} ${callTag(self)}</span><div class="whand mine">${myCards}</div></div>
          </section>
          <aside class="wpanel">
            <div class="geo-bar wblock-wrap">${wattBlock()}${ann}</div>
            <section class="waction">${action}</section>
            ${wattenModeHtml(st)}
          </aside>
        </div>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#w-bid", () => send({ type: "wBid" }));
    on("#w-hold", () => send({ type: "wBidAnswer", accept: true }));
    on("#w-fold", () => send({ type: "wBidAnswer", accept: false }));
    const md = app.querySelector(".wmode");
    if (md) md.ontoggle = () => store.set("s10-wmode-open", md.open);
    stackHands();
    on("#w-hold4", () => send({ type: "wHold" }));
    on("#w-go", () => send({ type: "wGiveUp" }));
    on("#w-giveup", async () => { if (await askConfirm("Wirklich aufgeben?", "Dein Gegner bekommt 2 Punkte.", "Aufgeben")) send({ type: "wGiveUp" }); });
    on("#w-show", () => send({ type: "wShow" }));
    on("#w-next", () => send({ type: "wNext" }));
    on("#w-force", () => send({ type: "wNext", force: true }));
    on("#w-restart", () => send({ type: "wRestart" }));
    const key = (el, fn) => { el.onclick = fn; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }; };
    app.querySelectorAll("[data-schlag]").forEach((b) => key(b, () => { b.classList.add("going"); send({ type: "wSchlag", rank: b.dataset.schlag }); }));
    app.querySelectorAll("[data-trumpf]").forEach((b) => key(b, () => { b.classList.add("going"); send({ type: "wTrumpf", suit: b.dataset.trumpf }); }));
    if (wFly) { // jede Stichkarte fliegt von ihrem Platz in der Mitte zum Stapel
      [...app.querySelectorAll(`[data-pile="${wFly.winner}"] .wpile-g.newest .wcard`)].forEach((el, i) => {
        const f = wFly.from[i]; if (!f || !el.animate) return;
        const t = el.getBoundingClientRect();
        el.animate([{ transform: `translate(${f.left - t.left}px, ${f.top - t.top}px) scale(${f.width / t.width})`, transformOrigin: "top left" },
          { transform: "translate(0, 0) scale(1)", transformOrigin: "top left" }], { duration: 600, delay: i * 80, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
      });
      wFly = null;
    }
    app.querySelectorAll("[data-card]").forEach((el) => {
      const go = () => { el.classList.add("going"); send({ type: "wPlay", card: el.dataset.card }); };
      el.onclick = go; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
  }

  // Handkarten fest von links nach rechts stapeln (links unten, rechts oben)
  function stackHands() {
    app.querySelectorAll(".whand").forEach((h) => [...h.children].forEach((el, i) => { el.style.position = "relative"; el.style.zIndex = String(i + 1); }));
  }
  // ---------- Schnapsen ----------
  let xShown = { round: 0, n: 0 }, xHold = null, xFly = null;
  // Nachziehen sichtbar machen: neue Karten fliegen vom Stapel in die Hand (nach der Stich-Pause)
  let xPrev = null, xDraw = { round: 0, cards: [], opp: 0 }, xPrevAtout = null;
  // Erklärung im rechten Rand: „Was jetzt?“-Tipp passend zur Lage + kurze Anleitung
  function schHelpHtml(st, opt, myTurn) {
    const sn = (su) => SCH.SUIT_NAMES[su];
    let tip;
    if (st.step !== "play") tip = "Die Runde ist vorbei. Wer 7 Punkte hat, gewinnt – der andere bekommt ein Bummerl.";
    else if (!myTurn) tip = st.trick.length ? "Dein Gegner überlegt, welche Karte er wirft." : "Dein Gegner wirft aus.";
    else if (st.mustLead) tip = `Du hast angesagt – wirf jetzt König oder Ober in ${sn(st.mustLead)} aus.`;
    else if (st.trick.length) tip = st.strict ? "Farbzwang: gleiche Farbe werfen und wenn möglich höher, sonst mit Trumpf stechen." : "Freies Werfen: du darfst jede Karte werfen. Willst du den Stich, wirf eine höhere Karte derselben Farbe oder einen Trumpf.";
    else tip = (opt.ansage.length ? `Du hast König und Ober in ${opt.ansage.map(sn).join(" und ")} – sag ${opt.ansage.map((su) => su === st.trump ? 40 : 20).join(" bzw. ")} an! ` : "")
      + (opt.tausch ? "Mit dem Trumpf-Unter kannst du die aufgedeckte Trumpfkarte holen. " : "")
      + "Wirf eine Karte aus – ein hohes Ass oder Zehner bringt viele Augen, ein Trumpf sticht alles andere.";
    return `<div class="wmode xhelp"><div class="xtip"><b>Was jetzt?</b> ${esc(tip)}</div>
      <details ${store.get("s10-xhelp-open") === false ? "" : "open"}><summary>So geht Schnapsen</summary>
      <ol>
        <li><b>Ziel:</b> Als Erster <b>66 Augen</b> sammeln. Augen bringen die Karten in deinen Stichen: Ass 11 · Zehner 10 · König 4 · Ober 3 · Unter 2.</li>
        <li><b>Stich:</b> Einer wirft aus, der andere wirft eine Karte dazu. Es gewinnt die höhere Karte derselben Farbe – oder ein <b>Trumpf</b> (${esc(sn(st.trump))}). Der Gewinner wirft als Nächster aus.</li>
        <li><b>Nachziehen:</b> Nach jedem Stich ziehen beide eine Karte vom Stapel, der Gewinner zuerst. Solange der Stapel offen ist, darfst du <b>jede Karte</b> werfen.</li>
        <li><b>20 und 40:</b> Hast du König und Ober einer Farbe, sag sie beim Auswerfen an: 20 Augen, in Trumpf 40. Sie zählen ab deinem ersten Stich.</li>
        <li><b>Tauschen:</b> Mit dem Trumpf-Unter holst du dir die aufgedeckte Trumpfkarte.</li>
        <li><b>Zudrehen:</b> Du schließt den Stapel, wenn du glaubst, mit deinen Karten auf 66 zu kommen. Dann gilt – wie bei leerem Stapel – <b>Farbzwang</b>: Farbe bedienen und höher stechen, sonst trumpfen.</li>
        <li><b>Punkte:</b> 3 wenn der andere keinen Stich hat, 2 wenn er unter 33 Augen hat, sonst 1. Bei 7 Punkten ist die Partie aus – der Verlierer bekommt ein <b>Bummerl</b> (✕).</li>
        <li><b>Spielweise:</b> ${st.mode === "klassisch" ? "Klassisch – die Augen sind versteckt. Zähl mit und drück „Aus!“, sobald du 66 hast. Zu früh kostet die Runde." : "Gemütlich – die Augen stehen bei den Namen, bei 66 endet die Runde von selbst."}</li>
      </ol></details></div>`;
  }
  function renderSchnapsen() {
    const v = view, st = v.schnapsen;
    if (!st) return;
    const me = myId, seated = st.seats.includes(me), opp = seated ? st.seats.find((x) => x !== me) : st.seats[1];
    const self = seated ? me : st.seats[0];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const priv = seated && wattenPriv && wattenPriv.roundNo === st.roundNo ? wattenPriv : null;
    const hand = priv ? priv.hand : [], legal = priv ? priv.legal : [], opt = priv ? priv.options : { ansage: [] };
    const sn = (su) => SCH.SUIT_NAMES[su];
    // fertigen Stich kurz in der Mitte zeigen
    const nTricks = st.seats.reduce((a, id) => a + st.tricks[id], 0);
    if (xShown.round !== st.roundNo) { xShown = { round: st.roundNo, n: nTricks }; xHold = null; }
    if (xHold && st.trick.length) { xShown.n = nTricks; xHold = null; }
    if (nTricks > xShown.n && !xHold && st.lastTrick && !st.trick.length) {
      const held = xHold = { winner: st.lastTrick.winner, cards: st.lastTrick.cards }, hr = st.roundNo;
      // Stich in Ruhe zeigen, dann wandern die Karten zum Stapel des Gewinners
      setTimeout(() => {
        if (xHold !== held || xShown.round !== hr) return;
        const tr = app.querySelector(".wtrick");
        xFly = { winner: held.winner, from: tr ? [...tr.querySelectorAll(".wcard")].map((c) => c.getBoundingClientRect()) : [] };
        xShown.n = nTricks; xHold = null; if (view && view.phase === "schnapsen") renderSchnapsen();
      }, 1800);
    }
    const shown = xHold ? xHold.cards : st.trick;
    const table = shown.length ? `<div class="wtrick">${shown.map((t) => `<div class="wplayed"><span class="muted small">${esc(nameOf(t.pid))}</span>${wCard(t.card)}</div>`).join("")}
        ${xHold ? `<p class="muted small wlast">Stich für ${xHold.winner === me ? "dich" : esc(nameOf(xHold.winner))}</p>` : ""}</div>`
      : `<div class="wtrick empty"><span class="muted">${st.step === "play" ? "Noch keine Karte gespielt" : ""}</span></div>`;
    const pile = (id, pos) => {
      let g = (st.won && st.won[id]) || []; if (xHold && xHold.winner === id) g = g.slice(0, -1);
      const openLast = !xHold && st.trick.length === 0 && st.lastTrick && st.lastTrick.winner === id;
      return `<div class="wpile ${pos}" data-pile="${id}">${g.map((cs, i) => `<div class="wpile-g ${i === g.length - 1 ? "newest" : ""}" style="--i:${i}">${cs.map((c) => openLast && i === g.length - 1 ? wCard(c, "xs") : `<div class="wcard xs back">${WCARDS.back()}</div>`).join("")}</div>`).join("")}</div>`;
    };
    // Talon mit Trumpf-Karte (links in der Mitte)
    const talon = `<div class="xtalon">${st.atout ? `<div class="xatout">${wCard(st.atout, "sm")}</div>` : ""}
        ${st.talon > (st.atout ? 1 : 0) ? `<div class="xstack ${st.closedBy ? "closed" : ""}">${wBack()}<span class="xcount">${st.talon - (st.atout ? 1 : 0)}</span></div>` : ""}
        ${st.closedBy ? `<span class="wcall">zugedreht</span>` : !st.talon ? `<span class="wcall">Stapel leer</span>` : ""}</div>`;
    const myTurn = st.turn === me;
    // gemütlich: Augen und bereits angesagte 20er/40er direkt beim Spieler
    // Augen nur im gemütlichen Modus; angesagte 20er/40er sieht jeder (sie werden ja laut angesagt)
    const augen = (id) => (st.points ? `<span class="wcall">${st.points[id]} Augen${st.pending && st.pending[id] ? ` (+${st.pending[id]} noch offen)` : ""}</span>` : "")
      + st.calls.filter((c) => c.pid === id).map((c) => `<span class="wcall xcallchip" title="${c.pts}er in ${sn(c.suit)}${c.pts === 40 ? " (Trumpf)" : ""}">${c.pts}er <span class="wsuit">${WCARDS.sym(c.suit, 1)}</span></span>`).join("");
    const combo = `<div class="wcombo" title="Trumpf ${sn(st.trump)}"><span class="wsuit big">${WCARDS.sym(st.trump, 1)}</span><b>Trumpf</b>
        <span class="wvalue">${st.strict ? "Farbzwang!" : "freies Werfen"}</span></div>`;
    const turnBadge = myTurn ? `<div class="wturn me">Du bist dran!</div>`
      : st.turn ? `<div class="wturn other">${esc(nameOf(st.turn))} ist dran …</div>` : "";
    // Knöpfe auf dem Spielfeld
    const btns = [];
    if (seated && st.step === "play") {
      opt.ansage.forEach((su) => btns.push(`<button class="btn primary" data-ansage="${su}">${su === st.trump ? 40 : 20} ansagen (${sn(su)})</button>`));
      if (opt.tausch) btns.push(`<button class="btn ghost" id="x-tausch">Trumpf-Unter tauschen</button>`);
      if (opt.zudrehen) btns.push(`<button class="btn ghost" id="x-zu">Zudrehen</button>`);
      if (opt.aus) btns.push(`<button class="btn ${priv && priv.myPoints >= 66 ? "primary" : "ghost"}" id="x-aus">Aus! (66)</button>`);
    }
    const decide = btns.length ? `<div class="wdecide wbidbox">${btns.join("")}</div>` : "";
    let action = "", hint = "";
    // Hinweise kommen aufs Spielfeld; der rechte Rand zeigt während des Spiels nur Punkte und Hilfe
    if (st.step === "play") {
      if (myTurn && st.mustLead) hint = `Wirf König oder Ober in ${sn(st.mustLead)} aus.`;
      else if (myTurn && st.strict && st.trick.length) hint = "<b>Farbzwang:</b> Farbe werfen und wenn möglich höher stechen, sonst trumpfen.";
    } else if (st.result) {
      const r = st.result, why = { aus: "mit 66 Augen", "letzter-stich": "mit dem letzten Stich", zugedreht: "nach dem Zudrehen", "zudrehen-misslungen": "– Zudrehen misslungen", "falsches-aus": "– falsches „Aus“" }[r.reason] || "";
      action = `<div class="banner ${r.winner === me ? "win" : ""}"><b>${esc(nameOf(r.winner))} gewinnt die Runde ${why}: +${r.points}</b>
        <div class="muted small">Augen: ${st.seats.map((id) => `${esc(nameOf(id))} ${r.augen[id]}`).join(" · ")}</div>
        ${st.step === "final" ? `<div style="margin-top:6px">🏆 <b>${esc(nameOf(st.winners[0]))} gewinnt – ${esc(nameOf(st.seats.find((x) => x !== st.winners[0])))} bekommt ein Bummerl!</b></div>` : ""}
        ${seated && st.handCount[me] ? `<div class="wshow">${st.shown[me] ? `<span class="muted small">Deine Karten sind aufgedeckt.</span>` : `<button id="x-show" class="btn ghost sm">Meine Karten zeigen</button>`}</div>` : ""}
        <div class="banner-actions">${st.step === "final"
          ? `<button id="x-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
          : seated ? `<button id="x-next" class="btn primary">${st.ready[me] ? "Warte auf den anderen … (zurücknehmen)" : "Nächste Runde"}</button>${isHost ? `<button id="x-force" class="btn ghost sm">Sofort weiter</button>` : ""}` : ""}</div></div>`;
    }
    // Punkteblock: Punkte je Runde, Summe oben, Bummerl als Kreuzl
    const cols = [self, opp];
    const rows = st.history.map((h) => cols.map((id) => id === h.winner ? `<td>${h.points}</td>` : `<td class="wdash">–</td>`).join(""));
    const block = `<table class="wblock"><thead><tr>${cols.map((id) => `<th><div class="wgeber">${id === st.dealer ? "Geber" : ""}</div>
        <span class="wsum ${st.turn === id ? "dran" : ""}">${st.score[id]}</span>${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}
        <div class="wkreuz" title="Bummerl">${st.bummerl[id] ? "✕".repeat(Math.min(st.bummerl[id], 10)) : ""}</div></th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${r}</tr>`).join("") || `<tr><td colspan="2" class="muted small">noch keine Punkte</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2" class="muted small">bis ${st.target} Punkte · ✕ = Bummerl</td></tr></tfoot></table>`;
    const oppCards = st.reveal && st.reveal[opp] ? st.reveal[opp].map((c) => wCard(c, "sm")).join("") : Array.from({ length: st.handCount[opp] || 0 }, wBack).join("");
    // neu gezogene Karten merken (eigene und Anzahl beim Gegner)
    if (xDraw.round !== st.roundNo) xDraw = { round: st.roundNo, cards: [], opp: 0 };
    if (xPrev && xPrev.round === st.roundNo) {
      hand.filter((c) => !xPrev.cards.includes(c)).forEach((c) => { if (!xDraw.cards.includes(c)) xDraw.cards.push(c); });
      const oc = st.handCount[opp] || 0; if (oc > xPrev.opp) xDraw.opp += oc - xPrev.opp;
    }
    xPrev = { round: st.roundNo, cards: hand.slice(), opp: st.handCount[opp] || 0 };
    const waitDraw = !!xHold; // während der Stich noch in der Mitte liegt, bleiben neue Karten unsichtbar
    const myCards = !seated ? Array.from({ length: st.handCount[self] || 0 }, wBack).join("")
      : hand.map((c) => { const ok = myTurn && legal.includes(c); const d = xDraw.cards.includes(c);
          return wCard(c, (ok ? "play" : myTurn ? "dim" : "") + (d ? " drawn" : "") + (d && waitDraw ? " pre-draw" : ""), (ok ? `data-card="${c}" role="button" tabindex="0" aria-label="${esc(SCH.cardName(c))} spielen"` : "") + ` data-cid="${c}"`); }).join("");
    // Trumpf-Unter getauscht? Alte Position der Karte merken, damit sie sichtbar zum Trumpfplatz fliegen kann
    let xSwapFrom = null, xSwapBy = null;
    if (xPrevAtout && xPrevAtout.round === st.roundNo && st.atout && xPrevAtout.card && st.atout !== xPrevAtout.card) {
      const mineEl = app.querySelector(`.whand.mine [data-cid="${st.atout}"]`), oppEl = app.querySelector(".whand.opp");
      xSwapBy = mineEl ? me : opp;
      xSwapFrom = (mineEl || oppEl) ? (mineEl || oppEl).getBoundingClientRect() : null;
    }
    xPrevAtout = { round: st.roundNo, card: st.atout };
    app.innerHTML = `
      <main class="screen game slf geo watten">
        <header class="top topbar">
          ${headBrandHtml("schnapsen")}
          <div class="meta">Runde ${st.roundNo} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <div class="wlayout">
          <section class="wtable">
            <div class="wtop">${combo}${myTurn ? "" : turnBadge}</div>${pile(opp, "top")}${pile(self, "bottom")}${talon}
            <div class="wside"><span class="muted small wname">${esc(nameOf(opp))} ${augen(opp)}</span><div class="whand opp">${oppCards}</div></div>
            ${table}
            ${myTurn ? turnBadge : ""}${hint ? `<p class="whint">${hint}</p>` : ""}${decide}
            <div class="wside"><span class="muted small wname">${seated ? "Deine Karten" : esc(nameOf(self))} ${augen(self)}</span><div class="whand mine">${myCards}</div></div>
          </section>
          <aside class="wpanel">
            <div class="geo-bar wblock-wrap">${block}</div>
            <section class="waction">${action}</section>
            ${schHelpHtml(st, opt, myTurn)}
          </aside>
        </div>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    stackHands();
    if (xSwapFrom) { // Trumpf-Unter fliegt aus der Hand an den Trumpfplatz unter dem Stapel
      const el = app.querySelector(".xatout .wcard");
      if (el && el.animate) {
        const t = el.getBoundingClientRect();
        const dx = xSwapFrom.left + xSwapFrom.width / 2 - (t.left + t.width / 2), dy = xSwapFrom.top + xSwapFrom.height / 2 - (t.top + t.height / 2);
        el.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(-90deg) scale(1.3)` }, { transform: "translate(0, 0) rotate(0) scale(1)" }],
          { duration: 700, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
      }
      toast(xSwapBy === me ? "Getauscht: Dein Trumpf-Unter liegt jetzt unter dem Stapel." : `${nameOf(xSwapBy)} hat mit dem Trumpf-Unter getauscht.`, "info");
    }
    if (xFly) { // Stichkarten von der Mitte zum Stapel fliegen lassen
      const cards = [...app.querySelectorAll(`[data-pile="${xFly.winner}"] .wpile-g.newest .wcard`)];
      cards.forEach((el, i) => {
        const f = xFly.from[i]; if (!f || !el.animate) return;
        const t = el.getBoundingClientRect();
        el.animate([{ transform: `translate(${f.left - t.left}px, ${f.top - t.top}px) scale(${f.width / t.width})`, transformOrigin: "top left" },
          { transform: "translate(0, 0) scale(1)", transformOrigin: "top left" }], { duration: 600, delay: i * 80, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
      });
      xFly = null;
    }
    if (!waitDraw && (xDraw.cards.length || xDraw.opp)) {
      const src = app.querySelector(".xstack .wcard, .xatout .wcard, .xtalon");
      const from = src ? src.getBoundingClientRect() : null;
      const targets = [...xDraw.cards.map((c) => app.querySelector(`.whand.mine [data-cid="${c}"]`)),
        ...[...app.querySelectorAll(".whand.opp .wcard")].slice(-xDraw.opp)].filter(Boolean);
      targets.forEach((el, i) => {
        if (!from || !el.animate) return;
        const to = el.getBoundingClientRect();
        const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
        const z = el.style.zIndex; el.style.zIndex = "50"; // nur während des Flugs ganz oben
        const an = el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.55) rotate(-8deg)`, opacity: .6 }, { transform: "translate(0, 0) scale(1) rotate(0)", opacity: 1 }],
          { duration: 650, delay: i * 180, easing: "cubic-bezier(.25,.8,.3,1)", fill: "backwards" });
        an.onfinish = an.oncancel = () => { el.style.zIndex = z; };
      });
      xDraw = { round: st.roundNo, cards: [], opp: 0 };
    }
    const hd = app.querySelector(".xhelp details");
    if (hd) hd.ontoggle = () => store.set("s10-xhelp-open", hd.open);
    on("#x-tausch", () => send({ type: "xTausch" }));
    on("#x-zu", async () => { if (await askConfirm("Zudrehen?", "Ab jetzt gilt Farbzwang. Schaffst du keine 66 Augen, bekommt dein Gegner die Punkte.", "Zudrehen")) send({ type: "xZudrehen" }); });
    on("#x-aus", async () => { if (await askConfirm("„Aus!“ sagen?", "Hast du schon 66 Augen? Wenn nicht, verlierst du die Runde.", "Aus!")) send({ type: "xAus" }); });
    on("#x-show", () => send({ type: "xShow" }));
    on("#x-next", () => send({ type: "xNext" }));
    on("#x-force", () => send({ type: "xNext", force: true }));
    on("#x-restart", () => send({ type: "xRestart" }));
    app.querySelectorAll("[data-ansage]").forEach((b) => b.onclick = () => send({ type: "xAnsage", suit: b.dataset.ansage }));
    app.querySelectorAll("[data-card]").forEach((el) => {
      const go = () => { el.classList.add("going"); send({ type: "xPlay", card: el.dataset.card }); };
      el.onclick = go; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
  }

  const pin = (color, big) => LF.divIcon({ className: "geo-pin-wrap", html: `<span class="geo-pin ${big ? "big" : ""}" style="--pc:${color}"></span>`, iconSize: [big ? 30 : 22, big ? 30 : 22], iconAnchor: [big ? 15 : 11, big ? 15 : 11] });

  function renderGeo() {
    const v = view, st = v.geo;
    if (!st) return;
    geoDeadline = st.endsIn != null ? Date.now() + st.endsIn : 0;
    const key = v.code + ":" + st.round + ":" + st.step;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    if (geoRendered === key && app.querySelector(".geo-wrap, .slf-final")) {
      { const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = geoChips(v, st); const rs = app.querySelector(".geo-results"); if (rs) rs.innerHTML = geoResults(v, st); }
      if (st.step === "reveal") { const rb = app.querySelector("#geo-ready"); if (rb) rb.textContent = st.ready[myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Nächster Ort"; }
      return;
    }
    if (st.step === "guess" && (!geoRendered || !geoRendered.startsWith(v.code + ":" + st.round + ":"))) { geoMine = null; geoSent = null; }
    geoRendered = key;
    let main = "";
    const oben = st.mode === "oben";
    if (oben && st.step === "guess") geoStart = Date.now() - (st.elapsed || 0);
    if (st.step === "guess") {
      const locked = st.submitted.includes(myId);
      main = `
        <div class="geo-bar">
          <div class="geo-target"><span class="game-label">Runde ${st.round}/${st.rounds} · ${esc(st.regionName)}</span>
            ${oben ? `<div class="geo-name">Was ist das?</div><div class="muted small">Gesucht: ${esc(st.place.kind)} · <span id="oben-factor">Punkte ×1</span></div>`
              : `<div class="geo-name">${esc(st.place.name)} <span class="geo-kind">${esc(st.place.kind)}</span></div>`}</div>
          <div class="geo-scores">${geoChips(v, st)}</div>
          ${st.endsIn != null ? `<div id="geo-timer" class="slf-timer">${Math.ceil(st.endsIn / 1000)} s</div>` : ""}
          <button id="geo-lock" class="btn primary" ${locked || !geoMine ? "disabled" : ""}>${locked ? "Festgelegt ✓ – warte auf die anderen …" : geoMine ? "Nadel festlegen" : "Tippe auf die Karte"}</button>
        </div>
        ${oben ? `<div class="oben-grid"><div class="geo-wrap oben-pic"><div id="oben-pic" class="geo-map"></div><span class="oben-tag">Von oben</span></div>
          <div class="geo-wrap"><div id="geo-map" class="geo-map"></div></div></div>` : `<div class="geo-wrap"><div id="geo-map" class="geo-map"></div></div>`}`;
    } else if (st.step === "reveal") {
      main = `
        <div class="geo-bar">
          <div class="geo-target"><span class="game-label">Auflösung · Runde ${st.round}/${st.rounds}</span><div class="geo-name">${esc(st.place.name)}</div></div>
          <div class="geo-results">${geoResults(v, st)}</div>
          <div class="geo-actions"><button id="geo-ready" class="btn primary">${st.ready[myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Nächster Ort"}</button>
            ${isHost ? `<button id="geo-next" class="btn ghost sm">Als Gastgeber sofort weiter</button>` : ""}</div>
        </div>
        <div class="geo-wrap"><div id="geo-map" class="geo-map"></div></div>`;
    } else {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      main = `
        <div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((p) => st.winners.includes(p.id)).map((p) => esc(p.name)).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="geo-restart" class="btn primary">Nochmal spielen</button>${isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((p, i) => `
          <div class="slf-rank" style="--pc:${colorOf(p.id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
            <span class="slf-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span><b>${(st.total[p.id] || 0).toLocaleString("de-DE")} Punkte</b></div>`).join("")}
          <p class="muted small">${esc(st.regionName)} · ${st.rounds} Runden · max. ${(st.rounds * 1000).toLocaleString("de-DE")} Punkte</p></div>`;
    }
    if (geoMap) { geoMap.remove(); geoMap = null; }
    if (obenMap) { obenMap.remove(); obenMap = null; obenZoom = null; }
    app.innerHTML = `
      <main class="screen game slf geo ${oben ? "oben" : ""}">
        <header class="top topbar">
          ${headBrandHtml(oben ? "oben" : "geo")}
          <div class="meta">${esc(st.regionName)} · Stube <b>${esc(v.code)}</b></div>
          ${topActionsHtml()}
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="slf-main">${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#geo-lock", geoSubmit);
    on("#geo-ready", () => send({ type: "geoReady" }));
    on("#geo-next", () => send({ type: "geoNext" }));
    on("#geo-restart", () => send({ type: "geoRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    const mapEl = app.querySelector("#geo-map");
    if (!mapEl || !LF) return;
    const map = geoMakeMap(mapEl, st.bounds);
    const picEl = app.querySelector("#oben-pic");
    if (picEl && st.pic) {
      obenMap = LF.map(picEl, { zoomControl: false, attributionControl: true, dragging: false, touchZoom: false, scrollWheelZoom: false,
        doubleClickZoom: false, boxZoom: false, keyboard: false, zoomSnap: 1 });
      obenMap.attributionControl.setPrefix(false);
      LF.tileLayer(TILE_URL, { maxZoom: 18, maxNativeZoom: 17, attribution: "© Esri, Maxar, Earthstar Geographics" }).addTo(obenMap);
      obenZoom = null; obenUpdate(st.pic);
      setTimeout(() => obenMap && obenMap.invalidateSize(), 50);
    }
    if (st.step === "guess") {
      const locked = st.submitted.includes(myId);
      if (geoMine) geoMarker = LF.marker([geoMine.lat, geoMine.lng], { icon: pin(colorOf(myId)) }).addTo(map);
      if (!locked) map.on("click", (e) => {
        if (geoSent === st.round) return;
        geoMine = { lat: e.latlng.lat, lng: LF.Util.wrapNum(e.latlng.lng, [-180, 180], true) };
        if (geoMarker && map.hasLayer(geoMarker)) geoMarker.setLatLng(e.latlng); else geoMarker = LF.marker(e.latlng, { icon: pin(colorOf(myId)) }).addTo(map);
        const b = app.querySelector("#geo-lock"); if (b) { b.disabled = false; b.textContent = "Nadel festlegen"; }
      });
    } else if (st.step === "reveal") {
      const target = [st.answer.lat, st.answer.lng], pts = [target];
      LF.marker(target, { icon: LF.divIcon({ className: "geo-pin-wrap", html: `<span class="geo-goal">★</span>`, iconSize: [34, 34], iconAnchor: [17, 17] }), zIndexOffset: 1000 })
        .addTo(map).bindTooltip(esc(st.place.name), { permanent: true, direction: "top", offset: [0, -14], className: "geo-tip goal" });
      v.players.forEach((p) => {
        const r = st.result[p.id];
        if (!r || r.lat == null) return;
        const g = [r.lat, r.lng]; pts.push(g);
        LF.polyline([target, g], { color: colorOf(p.id), weight: 3, dashArray: "6 6", opacity: .9 }).addTo(map);
        LF.marker(g, { icon: pin(colorOf(p.id)) }).addTo(map)
          .bindTooltip(`${esc(p.name)}: ${r.km < 10 ? r.km.toFixed(1).replace(".", ",") : Math.round(r.km).toLocaleString("de-DE")} km`, { permanent: true, direction: "bottom", offset: [0, 10], className: "geo-tip" });
      });
      if (pts.length > 1) map.fitBounds(LF.latLngBounds(pts).pad(0.25), { maxZoom: 12 }); else map.setView(target, Math.max(map.getZoom(), 8));
    }
    setTimeout(() => map.invalidateSize(), 50);
  }

  // ---------- Antwort-Dialog ----------
  let modalFor = null;
  function syncModal() {
    const v = view;
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
        ${card.type === "choice" ? `<p class="muted small">Erkennt das Spiel deine Antwort nicht sicher, entscheidet dein Mitspieler.</p>` : ""}`;
    } else {
      const est = card.type === "estimate";
      controls = `<form class="numform"><input id="num" type="text" inputmode="${est ? "text" : "decimal"}" autocomplete="off" placeholder="${est ? "z. B. 1.500 oder 1,5 Mio" : "Zahl"}">${card.unit ? `<span class="unit">${esc(card.unit)}</span>` : ""}<button class="btn primary" type="submit">OK</button></form>
        ${est ? `<p class="muted small">Zählt, wenn du höchstens ${Math.round(((it.tol != null ? it.tol : card.tol) || 0.1) * 100)} % danebenliegst.</p>` : ""}`;
    }
    modalEl.innerHTML = `
      <div class="modal-back">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="m-q">${esc(card.q)}</div>
          <div class="m-item ${card.emoji ? "emo" : ""} ${card.emoji && graphemes(it.t) === 1 ? "solo" : ""}">${esc(it.t)}</div>
          ${controls}
          <button class="btn ghost" data-close>Andere Antwort wählen</button>
        </div>
      </div>`;
    const submit = (value) => { const pos = selected; selected = null; modalFor = null; modalEl.innerHTML = ""; send({ type: "answer", pos, value }); render(); };
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

  if (!hasCrypto) {
    errorMsg = "Dieser Browser bietet hier keine Verschlüsselung an. Bitte die Seite über https:// (z. B. GitHub Pages) oder http://localhost öffnen.";
  }
  if (typeof mqtt === "undefined") {
    errorMsg = "Die Netzwerk-Bibliothek konnte nicht geladen werden. Bist du online?";
  }
  render();
})();
