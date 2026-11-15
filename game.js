(() => {
  const CARDS = window.SCHLAU10_CARDS;
  const L = window.S10Logic;
  const NS = "schlaue10/v1/";
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
  let chosenSet = store.get("s10-set");       // zuletzt gewähltes Fragen-Set merken
  let chosenTarget = store.get("s10-target"); // Auswahl in der Lobby merken (Lobby wird bei jedem Update neu gezeichnet)
  const params = new URLSearchParams(location.search);
  const urlRoom = (params.get("room") || "").toUpperCase();
  const urlBroker = params.has("b") ? Number(params.get("b")) : null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cleanName = (n) => String(n || "").trim().slice(0, 20) || "Spieler";
  const genCode = () => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");
  const shareLink = () => location.origin + location.pathname + "?room=" + roomCode + "&b=" + brokerIdx;

  // ---------- Verbindung über einen öffentlichen MQTT-Vermittlungsserver ----------
  // Alle Nachrichten laufen über den Server, daher klappt es hinter jedem Router.
  const BROKERS = ["wss://broker.hivemq.com:8884/mqtt", "wss://broker.emqx.io:8084/mqtt"];
  const T = (k) => NS + roomCode + "/" + k;

  function connectBroker(idx, will) {
    brokerIdx = ((idx % BROKERS.length) + BROKERS.length) % BROKERS.length;
    return mqtt.connect(BROKERS[brokerIdx], {
      clientId: "s10_" + myId + "_" + Math.random().toString(36).slice(2, 6),
      clean: true, keepalive: 20, reconnectPeriod: 2000, connectTimeout: 8000, will,
    });
  }
  const parse = (buf) => { try { return JSON.parse(buf.toString()); } catch { return null; } };

  // ---------- Gastgeber ----------
  const lastSeen = new Map();

  function hostCreate(name) {
    isHost = true; roomCode = genCode();
    S = L.newGame(CARDS.length);
    S.seen = store.get("s10-seen") || [];
    L.addPlayer(S, myId, name);
    hostOpen(0);
  }

  function hostResume(saved) {
    isHost = true; roomCode = saved.code; S = saved.state;
    if (saved.hostId) { myId = saved.hostId; setTabId(myId); }
    S.players.forEach((p) => { if (p.id !== myId) p.connected = false; });
    hostOpen(saved.broker || 0);
  }

  function hostOpen(idx, tries = 0) {
    status = "Raum wird geöffnet …";
    view = L.publicState(S, CARDS, roomCode); render();
    const c = mq = connectBroker(idx, { topic: T("host"), payload: "offline", qos: 1, retain: true });
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
      c.publish(T("host"), "online", { qos: 1, retain: true });
      publish();
    });
    c.on("reconnect", () => { if (opened) { status = "Verbindung unterbrochen – verbinde neu …"; render(); } });
    c.on("message", (topic, buf) => {
      const m = parse(buf);
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
    store.set("s10-host", { code: roomCode, state: S, hostId: myId, broker: brokerIdx, ts: Date.now() });
    if (S.seen) store.set("s10-seen", S.seen);
    if (mq) mq.publish(T("state"), JSON.stringify(view), { qos: 1, retain: true });
    render();
  }

  // ---------- Mitspieler ----------
  function sendUp(msg) {
    if (!mq) return false;
    mq.publish(T("up"), JSON.stringify({ ...msg, clientId: myId }), { qos: 1 });
    return mq.connected;
  }

  function guestJoin(code, name, idx, fixed) {
    isHost = false; roomCode = code; myName = name;
    store.set("s10-guest", { code, name });
    if (mq) mq.end(true);
    clearTimeout(findTimer);
    status = "Verbinde …"; render();
    const c = mq = connectBroker(idx, { topic: T("up"), payload: JSON.stringify({ type: "leave", clientId: myId }), qos: 1, retain: false });
    c.on("connect", () => {
      if (mq !== c) return;
      status = view ? "" : `Suche Raum ${code} …`; render();
      c.subscribe([T("state"), T("host")], { qos: 1 });
      sendUp({ type: "join", name: myName });
    });
    c.on("reconnect", () => { if (mq === c) { status = "Verbindung unterbrochen – verbinde neu …"; render(); } });
    c.on("message", (topic, buf) => {
      if (mq !== c) return;
      const s = buf.toString();
      if (topic === T("host")) {
        status = s === "offline" ? "Der Gastgeber ist gerade offline – warte auf ihn …" : "";
        render(); return;
      }
      if (!s) { status = "Der Gastgeber hat das Spiel beendet."; render(); return; }
      const st = parse(buf);
      if (!st || !st.players) return;
      view = st;
      if (status.startsWith("Suche Raum")) status = "";
      if (!st.players.some((p) => p.id === myId) && Date.now() - lastRejoin > 3000) { lastRejoin = Date.now(); sendUp({ type: "join", name: myName }); }
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

  function leave() {
    if (isHost && !confirm("Spiel wirklich beenden? Alle Mitspieler fliegen dann raus.")) return;
    store.del(isHost ? "s10-host" : "s10-guest");
    const go = () => { location.href = location.pathname; };
    if (!mq) return go();
    if (isHost) {
      mq.publish(T("state"), "", { qos: 1, retain: true });
      mq.publish(T("host"), "", { qos: 1, retain: true });
    } else sendUp({ type: "leave" });
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
      if (lastToastId !== null && view.phase !== "lobby") toast(view.lastEvent.text, view.lastEvent.kind);
      lastToastId = view.lastEvent.id;
    }
    syncModal();
  }

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
          <ul class="plist">${view.players.map((p) => `<li><span class="dot ${p.connected ? "on" : ""}"></span>${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</li>`).join("")}</ul>
          ${view.players.length < 2 ? `<p class="muted small waiting">Warte auf Mitspieler …</p>` : ""}
          ${isHost ? `
            <label class="field"><span>Fragen</span>
              <select id="cardset">${[["standard", "Standard"], ["suedtirol", "Südtirol"], ["wirtschaft", "Wirtschaft"], ["mixed", "Gemischt (alle Fragen)"]].map(([k, n]) =>
                `<option value="${k}" ${k === (chosenSet || view.cardSet || "standard") ? "selected" : ""}>${n} – ${CARDS.filter((c) => k === "mixed" || (k === "standard" ? !c.set : c.set === k)).length} Karten${isHost && S ? ` (${L.unseenCount(CARDS, k, S.seen)} neu)` : ""}</option>`).join("")}</select></label>
            ${S && S.seen && S.seen.length ? `<div class="seen-row"><span class="muted small">${S.seen.length} Karte${S.seen.length === 1 ? "" : "n"} schon gespielt – die kommen erst wieder, wenn alle durch sind.</span>
              <button id="resetSeen" class="btn ghost sm">Gespielte Karten vergessen</button></div>` : ""}
            <label class="field"><span>Spielen bis</span>
              <select id="target">${[10, 15, 20, 30, 40].map((t) => `<option value="${t}" ${t === (chosenTarget || view.target || 30) ? "selected" : ""}>${t} Punkte</option>`).join("")}</select></label>
            <button id="start" class="btn primary big" ${view.players.length < 1 ? "disabled" : ""}>Spiel starten</button>
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
    const ssel = app.querySelector("#cardset");
    if (ssel) ssel.onchange = () => { chosenSet = ssel.value; store.set("s10-set", chosenSet); };
    if (start) start.onclick = () => send({ type: "start", target: Number(tsel.value), set: ssel.value });
    app.querySelector("#leave").onclick = leave;
  }

  const fmt = (card, a) => L.fmt(card, a);
  const statusLabel = { active: "spielt", passed: "gepasst", out: "raus" };

  function renderGame() {
    const v = view, card = v.card;
    const cur = v.players[v.turn];
    const me = v.players.find((p) => p.id === myId);
    const pend = v.phase === "playing" ? v.pending : null;
    const myTurn = v.phase === "playing" && cur && cur.id === myId && !pend && !v.undoReq;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;

    const chips = v.players.map((p, i) => {
      const turn = v.phase === "playing" && i === v.turn;
      const res = v.roundResult && v.roundResult.find((r) => r.id === p.id);
      const pct = Math.min(100, (p.score / v.target) * 100);
      return `<div class="chip ${turn ? "turn" : ""} st-${p.status} ${p.waiting ? "waiting" : ""} ${v.winners && v.winners.includes(p.id) ? "winner" : ""}">
        <div class="chip-top"><span class="dot ${p.connected ? "on" : ""}" title="${p.connected ? "verbunden" : "getrennt"}"></span>
          <span class="chip-name">${esc(p.name)}${p.id === myId ? " <em>(du)</em>" : ""}</span></div>
        <div class="chip-score"><b>${p.score}</b><small>/ ${v.target}</small></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="chip-round">${v.phase === "playing"
          ? `<span class="tokens">${"●".repeat(p.roundPts) || "–"}</span> <span class="badge">${turn ? "am Zug" : p.waiting ? "ab nächster Runde" : statusLabel[p.status]}</span>`
          : res ? `<span class="gain ${res.gained ? "pos" : ""}">+${res.gained}</span>` : ""}</div>
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
      const by = r && r.by ? `<span class="slot-by">${esc(nameOf(r.by))}</span>` : "";
      return `<button class="slot ${cls} ${selected === pos ? "sel" : ""}" style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%" data-pos="${pos}" ${myTurn && !r ? "" : "disabled"}>
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
        ? `<div class="banner me"><b>Du bist dran!</b> Wähle eine Antwort${me.roundPts ? ` – oder passe und sichere ${me.roundPts} Punkt${me.roundPts > 1 ? "e" : ""}` : ""}.
            <div class="banner-actions"><button id="pass" class="btn">Passen${me.roundPts ? ` (+${me.roundPts} sichern)` : ""}</button></div></div>`
        : `<div class="banner"><b>${esc(cur.name)}</b> ist am Zug …
            ${isHost && !cur.connected ? `<div class="banner-actions"><button id="skip" class="btn ghost">${esc(cur.name)} ist getrennt – überspringen</button></div>` : ""}</div>`;
    } else if (v.phase === "roundEnd") {
      banner = `<div class="banner end"><b>Runde ${v.round} vorbei.</b> Alle Antworten sind jetzt aufgedeckt.
        <div class="banner-actions"><button id="next" class="btn primary">Nächste Runde</button></div></div>`;
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
          <div class="meta">${v.cardSet && v.cardSet !== "standard" ? (SET_NAMES[v.cardSet] || v.cardSet) + " · " : ""}Runde ${v.round} · bis ${v.target} · Raum <b>${esc(v.code)}</b></div>
          <button id="invite" class="btn sm" title="Link zum Beitreten teilen">＋ Einladen</button>
          <button id="leave" class="btn ghost sm">Verlassen</button>
        </header>
        ${status ? `<div class="status">${esc(status)}</div>` : ""}
        <section class="players">${chips}</section>
        ${banner}
        ${undoHtml(v, nameOf)}
        <section class="board">
          <div class="ring">
            <div class="center">
              <div class="qtype">${({ tf: "Finde die zutreffenden", num: "Zahl eintippen", rank: "Rang 1–10", decade: "Jahrzehnt", estimate: `Schätzen · ±${Math.round((card.tol || 0.1) * 100)} % zählt` })[card.type] || "Antwort eintippen"}</div>
              <div class="q">${esc(card.q)}</div>
              ${card.hint ? `<div class="hint">${esc(card.hint)}</div>` : ""}
            </div>
            ${slots}
          </div>
        </section>
        <div class="card-tools"><button id="report" class="btn ghost sm">⚑ Karte melden</button></div>
        <section class="log"><h3>Verlauf</h3><ol>${v.log.map((l) => `<li>${esc(l)}</li>`).join("")}</ol></section>
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
  const SET_NAMES = { standard: "Standard", suedtirol: "Südtirol", wirtschaft: "Wirtschaft", mixed: "Gemischt" };
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
      const rep = { ts: Date.now(), by: myName, set: view.cardSet, q: card.q, item: it ? it.t : "",
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
          <div class="m-item">${esc(it.t)}</div>
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

  if (typeof mqtt === "undefined") {
    errorMsg = "Die Netzwerk-Bibliothek konnte nicht geladen werden. Bist du online?";
  }
  render();
})();
