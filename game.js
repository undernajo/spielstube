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
  let chosenTarget = store.get("s10-target"); // Auswahl in der Lobby merken (Lobby wird bei jedem Update neu gezeichnet)
  const params = new URLSearchParams(location.search);
  const urlRoom = (params.get("room") || "").toUpperCase();
  const urlBroker = params.has("b") ? Number(params.get("b")) : null;

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
    S.hostId = myId;
    L.addPlayer(S, myId, name);
    hostOpen(0);
  }

  function hostResume(saved) {
    isHost = true; roomCode = saved.code; S = saved.state;
    if (saved.hostId) { myId = saved.hostId; setTabId(myId); }
    S.hostId = myId;
    S.players.forEach((p) => { if (p.id !== myId) p.connected = false; });
    hostOpen(saved.broker || 0);
  }

  async function hostOpen(idx, tries = 0) {
    status = "Raum wird geöffnet …";
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
      c.subscribe(T("up"), { qos: 1 });
      sendSealed(T("host"), "online", { qos: 1, retain: true });
      publish();
    });
    c.on("reconnect", () => { if (opened) { status = "Verbindung unterbrochen – verbinde neu …"; render(); } });
    c.on("message", async (topic, buf) => {
      const m = await unseal(buf);
      if (!m || typeof m !== "object") return;
      const cid = String(m.clientId || "").slice(0, 40);
      if (!cid || cid === myId) return;
      lastSeen.set(cid, Date.now());
      const p = S.players.find((x) => x.id === cid);
      if (m.type === "join") { L.addPlayer(S, cid, cleanName(m.name)); publish(); }
      else if (m.type === "report" && m.report && typeof m.report === "object") { addReport(m.report); toast(`${cleanName(m.report.by)} hat eine Karte gemeldet.`, "info"); }
      else if (m.type === "leave") { if (p) { L.setConnected(S, cid, false); publish(); } }
      else if (m.type === "action" || m.type === "ping") {
        let changed = false;
        if (p && !p.connected) { p.connected = true; changed = true; }
        if (m.type === "action" && L.applyAction(S, CARDS, cid, m.action, false)) changed = true;
        if (changed) publish();
      }
    });
  }

  // Mitspieler ohne Lebenszeichen als getrennt markieren
  setInterval(() => {
    if (!isHost || !S) return;
    const gone = S.players.filter((p) => p.id !== myId && p.connected && Date.now() - (lastSeen.get(p.id) || 0) > 35000).map((p) => p.id);
    gone.forEach((id) => L.setConnected(S, id, false));
    if (gone.length) publish();
  }, 5000);

  function act(pid, action) {
    if (L.applyAction(S, CARDS, pid, action, pid === myId)) publish();
  }

  function publish() {
    view = L.publicState(S, CARDS, roomCode);
    seq = Math.max(Date.now(), seq + 1); // steigt immer, auch nach einem Neustart des Gastgebers
    view.seq = seq;
    store.set("s10-host", { code: roomCode, state: S, hostId: myId, broker: brokerIdx, ts: Date.now() });
    if (S.seen) store.set("s10-seen", S.seen);
    if (mq && roomTopic) sendSealed(T("state"), view, { qos: 1, retain: true });
    render();
  }

  // ---------- Mitspieler ----------
  function sendUp(msg) {
    if (!mq || !roomTopic) return false;
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
      status = view ? "" : `Suche Raum ${code} …`; render();
      c.subscribe([T("state"), T("host")], { qos: 1 });
      sendUp({ type: "join", name: myName });
    });
    c.on("reconnect", () => { if (mq === c) { status = "Verbindung unterbrochen – verbinde neu …"; render(); } });
    c.on("message", async (topic, buf) => {
      if (mq !== c) return;
      if (!buf.length) { // gelöschte Nachricht = Gastgeber hat beendet
        if (topic === T("state")) { status = "Der Gastgeber hat das Spiel beendet."; render(); }
        return;
      }
      const m = await unseal(buf);
      if (m === undefined || mq !== c) return;
      if (topic === T("host")) {
        status = m === "offline" ? "Der Gastgeber ist gerade offline – warte auf ihn …" : "";
        render(); return;
      }
      if (!m || !m.players) return;
      if (m.seq && m.seq <= lastSeq) return; // veralteten Stand ignorieren
      lastSeq = m.seq || lastSeq;
      view = m;
      if (status.startsWith("Suche Raum")) status = "";
      if (!m.players.some((p) => p.id === myId) && Date.now() - lastRejoin > 3000) { lastRejoin = Date.now(); sendUp({ type: "join", name: myName }); }
      render();
    });
    // Raum nicht gefunden? -> beim anderen Server suchen (außer der Link legt den Server fest)
    findTimer = setTimeout(() => {
      if (view || mq !== c) return;
      if (fixed) { status = `Raum „${code}“ nicht gefunden. Ist das Spiel beim Gastgeber offen? Ich warte weiter …`; render(); return; }
      guestJoin(code, name, brokerIdx + 1, false);
      status = `Raum „${code}“ noch nicht gefunden – suche weiter …`; render();
    }, 6000);
  }

  setInterval(() => { if (!isHost && mq && mq.connected && view) sendUp({ type: "ping" }); }, 10000);

  function send(action) {
    if (isHost) return act(myId, action);
    if (!sendUp({ type: "action", action })) toast("Verbindung wackelt – Zug wird nachgeschickt …", "bad");
  }

  async function leave() {
    if (isHost && !confirm("Spiel wirklich beenden? Alle Mitspieler fliegen dann raus.")) return;
    store.del(isHost ? "s10-host" : "s10-guest");
    const go = () => { location.href = location.pathname; };
    if (!mq || !roomTopic) return go();
    if (isHost) {
      mq.publish(T("state"), "", { qos: 1, retain: true });
      mq.publish(T("host"), "", { qos: 1, retain: true });
    } else { sendUp({ type: "leave" }); await outChain; }
    setTimeout(() => { try { mq.end(); } catch {} go(); }, 400);
  }

  // ---------- Darstellung ----------
  function toast(text, kind) {
    toastEl.textContent = text;
    toastEl.className = "toast show " + (kind || "");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { toastEl.className = "toast " + (kind || ""); }, 3800);
  }

  function render() {
    if (!view) return renderStart();
    if (view.phase === "lobby") renderLobby(); else renderGame();
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
    };
    if (prev) {
      const needsMe = (now.myTurn && !prev.myTurn) || (now.mustJudge && !prev.mustJudge) || (now.mustVote && !prev.mustVote);
      if (needsMe) { sfx.turn(); if (navigator.vibrate) try { navigator.vibrate(120); } catch {} }
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
    <details class="rules"><summary>Spielregeln</summary>
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
        <h1 class="logo">Schlaue<span>10</span></h1>
        <p class="tag">Das Quiz mit zehn Antworten – online, zu zweit oder mehr.</p>
        <div class="panel">
          <label class="field"><span>Dein Name</span>
            <input id="name" maxlength="20" autocomplete="nickname" value="${esc(myName)}" placeholder="z. B. Josef"></label>
          ${code ? `
            <p class="invite">Du wurdest in Raum <b>${esc(code)}</b> eingeladen.</p>
            <button id="joinUrl" class="btn primary big">Raum ${esc(code)} beitreten</button>
          ` : `
            <button id="create" class="btn primary big">Neues Spiel erstellen</button>
            <div class="divider"><span>oder beitreten</span></div>
            <div class="row">
              <input id="code" maxlength="5" placeholder="CODE" autocapitalize="characters" value="${esc(guestSaved ? guestSaved.code : "")}">
              <button id="join" class="btn">Beitreten</button>
            </div>`}
          ${resumable && !code ? `<button id="resume" class="btn ghost">Spiel ${esc(saved.code)} fortsetzen</button>` : ""}
          <p class="err">${esc(errorMsg || status)}</p>
        </div>
        ${rulesHtml}
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
      if (!/^[A-Z]{5}$/.test(c)) { errorMsg = "Der Raum-Code hat 5 Buchstaben."; return renderStart(); }
      const n = getName(); if (n) guestJoin(c, n, 0, false);
    };
    on("#join", joinCode);
    const codeIn = app.querySelector("#code");
    if (codeIn) codeIn.onkeydown = (e) => { if (e.key === "Enter") joinCode(); };
  }

  function renderLobby() {
    const isFile = location.protocol === "file:";
    app.innerHTML = `
      <main class="screen lobby">
        <h1 class="logo small">Schlaue<span>10</span></h1>
        <div class="panel">
          <p class="muted">Raum-Code</p>
          <div class="code">${esc(view.code)}</div>
          ${isHost ? `
            ${isFile ? `<p class="muted small">Schick deinen Mitspielern diesen Code. Sie öffnen das Spiel bei sich und geben ihn unter „Beitreten“ ein.</p>` : `
            <div class="row"><input id="link" readonly value="${esc(shareLink())}"><button id="copy" class="btn">Link kopieren</button></div>
            <p class="muted small">Schick deinen Mitspielern den Link oder den Code.</p>`}` : ""}
          <h3>Spieler</h3>
          <ul class="plist">${view.players.map((p) => `<li><span class="dot ${p.connected ? "on" : ""}"></span>${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}${p.id === view.hostId ? ` <span class="host-tag">Gastgeber</span>` : ""}</li>`).join("")}</ul>
          ${view.players.length < 2 ? `<p class="muted small waiting">Warte auf Mitspieler …</p>` : ""}
          ${isHost ? `
            ${setPickerHtml()}
            ${S && S.seen && S.seen.length ? `<div class="seen-row"><span class="muted small">${S.seen.length} Karte${S.seen.length === 1 ? "" : "n"} schon gespielt – die kommen erst wieder, wenn alle durch sind.</span>
              <button id="resetSeen" class="btn ghost sm">Gespielte Karten vergessen</button></div>` : ""}
            <label class="field"><span>Spielen bis</span>
              <select id="target">${[10, 15, 20, 30, 40].map((t) => `<option value="${t}" ${t === (chosenTarget || view.target || 30) ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
            <button id="start" class="btn primary big" ${view.players.length < 1 || !currentSets().length ? "disabled" : ""}>Spiel starten</button>
            ${view.players.length < 2 ? `<p class="muted small">Du kannst auch allein starten, um es auszuprobieren.</p>` : ""}
          ` : `<p class="muted">Warte, bis der Gastgeber das Spiel startet …</p>`}
          <p class="err">${esc(status)}</p>
          <button id="leave" class="btn ghost">Verlassen</button>
        </div>
        ${rulesHtml}
        ${reportsHtml()}
      </main>`;
    bindReports(renderLobby);
    const copy = app.querySelector("#copy");
    if (copy) copy.onclick = () => {
      const t = app.querySelector("#link");
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(
        () => toast("Link kopiert!", "ok"), () => { t.select(); document.execCommand("copy"); toast("Link kopiert!", "ok"); });
    };
    const start = app.querySelector("#start");
    const tsel = app.querySelector("#target");
    if (tsel) tsel.onchange = () => { chosenTarget = Number(tsel.value); store.set("s10-target", chosenTarget); };
    const reset = app.querySelector("#resetSeen");
    if (reset) reset.onclick = () => {
      if (!confirm("Alle gespielten Karten vergessen? Danach kann jede Karte wieder vorkommen.")) return;
      S.seen = []; store.set("s10-seen", []); publish(); toast("Speicher gelöscht – alle Karten sind wieder neu.", "ok");
    };
    app.querySelectorAll(".setopt input").forEach((cb) => cb.onchange = () => {
      chosenSets = [...app.querySelectorAll(".setopt input:checked")].map((x) => x.value);
      store.set("s10-sets", chosenSets); renderLobby();
    });
    const all = app.querySelector("#setall");
    if (all) all.onclick = () => { chosenSets = L.SET_KEYS.slice(); store.set("s10-sets", chosenSets); renderLobby(); };
    if (start) start.onclick = () => { if (currentSets().length) send({ type: "start", target: Number(tsel.value), set: currentSets() }); };
    app.querySelector("#leave").onclick = leave;
  }

  const fmt = (card, a) => L.fmt(card, a);
  const PLAYER_COLORS = ["#ffc83d", "#4fc3f7", "#f472b6", "#a3e635", "#fb923c", "#c084fc", "#2dd4bf", "#f87171"];
  const statusLabel = { active: "spielt", passed: "gepasst", out: "raus" };

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
      const rp = v.phase === "playing" ? (p.status === "out" ? "Runde: 0" : `Runde: ${p.roundPts ? "+" + p.roundPts : 0}`) : res ? `Runde: ${res.gained ? "+" + res.gained : 0}` : "";
      const badge = v.phase === "playing" ? (turn ? "am Zug" : p.waiting ? "ab nächster Runde" : statusLabel[p.status]) : "";
      return `<div class="chip ${turn ? "turn" : ""} st-${p.status} ${p.waiting ? "waiting" : ""} ${v.winners && v.winners.includes(p.id) ? "winner" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}">
        <div class="chip-l1"><span class="pdot ${p.connected ? "" : "off"}" title="${p.connected ? "verbunden" : "getrennt"}"></span>
          <span class="chip-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span>
          <span class="chip-score"><b>${p.score}</b><small>/${v.target}</small></span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="chip-l2"><span class="rpts ${res && res.gained ? "pos" : ""}">${rp}</span>
          ${p.id === v.hostId ? `<span class="host-tag" title="Das Spiel läuft auf diesem Gerät">Gastgeber</span>` : ""}
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
        ? `<div class="banner me row"><div class="banner-text"><b>Du bist dran!</b> Wähle eine Antwort${me.roundPts ? ` – oder sichere deine ${me.roundPts} Punkt${me.roundPts > 1 ? "e" : ""}` : ""}.</div>
            <button id="pass" class="btn">Passen${me.roundPts ? ` (+${me.roundPts})` : ""}</button></div>`
        : `<div class="banner row"><div class="banner-text"><span class="pdot" style="--pc:${colorOf(cur.id)}"></span> <b>${esc(cur.name)}</b> ist am Zug …</div>
            ${isHost && !cur.connected ? `<button id="skip" class="btn ghost sm">Getrennt – überspringen</button>` : ""}</div>`;
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
        <header class="top">
          <div class="logo tiny">Schlaue<span>10</span></div>
          <div class="meta">${setLabel(v.cardSet)}Runde ${v.round} · bis ${v.target} · Raum <b>${esc(v.code)}</b></div>
          <div class="top-actions">
            <button id="mute" class="btn ghost sm" title="Ton an/aus" aria-label="Ton an/aus">${sfx.muted ? "🔇" : "🔊"}</button>
            <button id="invite" class="btn sm" title="Link zum Beitreten teilen">＋ Einladen</button>
            <button id="leave" class="btn ghost sm" title="Verlassen" aria-label="Verlassen"><span class="lbl-long">Verlassen</span><span class="lbl-short">✕</span></button>
          </div>
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <div class="game-grid">
          <section class="players">${chips}</section>
          <section class="action">${banner}${undoHtml(v, nameOf)}</section>
          <section class="board">
            <div class="ring ${card.emoji ? "emo" : ""}">
              <div class="center">
                <div class="qtype">${({ tf: "Finde die zutreffenden", num: "Zahl eintippen", rank: "Rang 1–10", decade: "Jahrzehnt", estimate: `Schätzen · ±${Math.round((card.tol || 0.1) * 100)} % zählt` })[card.type] || "Antwort eintippen"}</div>
                <div class="q">${esc(card.q)}</div>
                ${card.hint ? `<div class="hint">${esc(card.hint)}</div>` : ""}
                <div class="progress">${card.items.filter((it) => it.r && !it.r.pending && it.r.by).length} von 10 aufgedeckt</div>
              </div>
              ${slots}
            </div>
          </section>
          <div class="card-tools"><button id="report" class="btn ghost sm">⚑ Karte melden</button></div>
          <section class="log"><h3>Verlauf</h3><ol>${v.log.filter((l) => !/ist beigetreten|hat den Raum verlassen/.test(l)).map((l) => `<li>${esc(l)}</li>`).join("") || `<li class="muted">Noch keine Züge.</li>`}</ol></section>
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
  const SET_NAMES = { standard: "Standard", suedtirol: "Südtirol", wirtschaft: "Wirtschaft", emoji: "Emoji & Flaggen", winter: "Weihnachten & Winter", film: "Film & Serien", mixed: "Gemischt" };

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
    if (x) x.onclick = () => { if (confirm("Alle Meldungen löschen?")) { store.del("s10-reports"); rerender(); } };
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
      try { await navigator.share({ title: "Schlaue Zehn", text: `Spiel mit! Raum ${roomCode}`, url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); toast("Einladungslink kopiert – einfach verschicken!", "ok"); }
    catch { prompt("Diesen Link verschicken:", url); }
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
        ${est ? `<p class="muted small">Zählt, wenn du höchstens ${Math.round((card.tol || 0.1) * 100)} % danebenliegst.</p>` : ""}`;
    }
    modalEl.innerHTML = `
      <div class="modal-back">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="m-q">${esc(card.q)}</div>
          <div class="m-item ${card.emoji ? "emo" : ""}">${esc(it.t)}</div>
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
