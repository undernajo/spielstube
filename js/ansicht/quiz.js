// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    LAND, PLAYER_COLORS, QZ, app, esc, headBrandHtml, invite, leave, needLandData, send, sfx,
    statusBarHtml, toast, topActionsHtml
  } = G;

  // ---------- Schätzen · Hinweis für Hinweis · Umriss-Rätsel ----------
  let quizRendered = null, quizSent = null, quizMine = null, quizDeadline = 0, quizHintAt = 0;
  // Zahlen fürs Schätzen: Jahreszahlen ohne Tausenderpunkt (Fragen ohne Einheit), große Werte ohne Nachkommastellen
  let quizYear = false;
  const quizFmt = (n) => { n = Number(n);
    if (quizYear && Math.abs(n) < 10000) return String(Math.round(n));
    return n.toLocaleString("de-DE", { maximumFractionDigits: Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 3 }); };
  // Spieler-Pult (rechts neben der Quizkarte): Lämpchen leuchtet, sobald jemand geantwortet hat bzw. bereit ist
  function quizPods(v, st) {
    return `<span class="qz-lbl">Spieler</span>` + v.players.map((p, i) => {
      const done = st.step === "ask" ? st.submitted.includes(p.id) : st.step === "reveal" ? !!st.ready[p.id] : false;
      const txt = st.step === "ask" ? (done ? "hat geantwortet" : p.connected ? "überlegt …" : "getrennt") : done ? "bereit" : "schaut sich die Lösung an";
      return `<div class="qz-pod ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><span class="qz-lamp"></span>
        <div><b>${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</b><small>${txt}</small></div><span class="qz-sc">${st.total[p.id] || 0}</span></div>`;
    }).join("");
  }
  // Zeitring rechts oben in der Quizkarte (grün → gelb → rot)
  const QZ_RING = 2 * Math.PI * 31;
  const quizTotalMs = (st) => (st.mode === "hinweis" ? 4 * QZ.HINT_MS + (QZ.AFTER_LAST_HINT_MS || 15000) : (QZ.ASK_MS || {})[st.mode] || 30000);
  function quizRingSet(el, ms, total) {
    const p = Math.max(0, Math.min(1, ms / total)), r1 = el.querySelector(".r1");
    el.style.setProperty("--rc", p > .5 ? "#7ee2b1" : p > .2 ? "#ffc83d" : "#ff7d8a");
    if (r1) r1.style.strokeDasharray = `${QZ_RING * p} ${QZ_RING}`;
    const b = el.querySelector("b"); if (b) b.textContent = Math.ceil(ms / 1000);
    el.classList.toggle("urgent", ms <= 10000);
  }
  // Frage passend zur Art des Gebiets (Code ohne Bindestrich = Land, sonst Unterteilung mit Länderkürzel vorn)
  const UMRISS_ART = { DE: "Welches deutsche Bundesland", AT: "Welches österreichische Bundesland", IT: "Welche italienische Region", CH: "Welcher Schweizer Kanton" };
  const umrissFrage = (c) => (String(c).includes("-") ? UMRISS_ART[String(c).split("-")[0]] || "Welches Gebiet" : "Welches Land") + " ist das?";
  // Umriss als SVG: Hauptteil plus nahe Inseln (keine weit entfernten Überseegebiete)
  function umrissSvg(code, draw) {
    const D = window.SCHLAU10_LAND; if (!D) return "";
    const c = D.countries.concat(D.subs || []).find((x) => x.c === code); if (!c) return "";
    const ctr = (flat) => { let a = 0, b = 0, k = 0; for (let i = 0; i < flat.length; i += 2) { a += flat[i]; b += flat[i + 1]; k++; } return [a / k, b / k]; };
    let big = c.g[0]; c.g.forEach((p) => { if (p[0].length > big[0].length) big = p; });
    const [la0, ln0] = ctr(big[0]);
    const polys = c.g.filter((p) => { const [la, ln] = ctr(p[0]); return Math.abs(la - la0) < 14 && Math.abs(ln - ln0) < 22; });
    const k = Math.cos(la0 * Math.PI / 180);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    const pathOf = (flat) => { let d = ""; for (let i = 0; i < flat.length; i += 2) { const x = flat[i + 1] * k, y = -flat[i];
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); d += (i ? "L" : "M") + x.toFixed(3) + " " + y.toFixed(3); } return d + "Z"; };
    const ds = polys.flatMap((p) => p.map(pathOf)), d = ds.join("");
    const w = x1 - x0, h = y1 - y0, pad = Math.max(w, h) * 0.06;
    if (draw) { // jeder Teilumriss einzeln: Strich läuft einmal herum (pathLength 1), danach füllt er sich (ohne Geräusch)
      return `<svg class="umriss-svg fx-draw" style="--sw:${(Math.max(w, h) / 140).toFixed(4)}" viewBox="${(x0 - pad).toFixed(3)} ${(y0 - pad).toFixed(3)} ${(w + 2 * pad).toFixed(3)} ${(h + 2 * pad).toFixed(3)}" preserveAspectRatio="xMidYMid meet">
        <path class="u-fill" d="${d}" fill="#ffd24d" fill-rule="evenodd"/>${ds.map((x) => `<path class="u-line" d="${x}" pathLength="1" fill="none" stroke="#fff6cf" stroke-linejoin="round"/>`).join("")}</svg>`;
    }
    return `<svg class="umriss-svg" viewBox="${(x0 - pad).toFixed(3)} ${(y0 - pad).toFixed(3)} ${(w + 2 * pad).toFixed(3)} ${(h + 2 * pad).toFixed(3)}" preserveAspectRatio="xMidYMid meet">
      <path d="${d}" fill="#ffd24d" fill-opacity=".9" stroke="#fff6cf" stroke-width="${(Math.max(w, h) / 220).toFixed(4)}" fill-rule="evenodd" stroke-linejoin="round"/></svg>`;
  }
  // Hinweise als Kärtchen: aufgedeckte im Sandton, noch verdeckte gestrichelt (der nächste mit Countdown); rechts der Punktwert
  function quizHintsHtml(st) {
    const it = st.item; if (!it || !it.hints) return "";
    const n = it.hints.length, all = st.step === "ask" ? 5 : n;
    return `<ol class="quiz-hints">${Array.from({ length: all }, (_, i) => i < n
      ? `<li class="qz-hint ${i === n - 1 && st.step === "ask" ? "new" : ""}"><span class="qh-n">${i + 1}</span><span class="qh-t">${esc(it.hints[i])}</span><span class="qh-p">${5 - i} P.</span></li>`
      : `<li class="qz-hint lock"><span class="qh-n">${i + 1}</span><span class="qh-t" ${i === n ? 'id="quiz-nexthint"' : ""}>${i === n ? "nächster Hinweis gleich …" : "noch verdeckt"}</span><span class="qh-p">${5 - i} P.</span></li>`).join("")}</ol>`;
  }
  // Schätzen: Zahlenstrahl – richtige Antwort in der Mitte, Schätzungen als farbige Nadeln (zu tief links, zu hoch rechts)
  function estLineHtml(v, st) {
    const val = st.item.v, unit = st.item.unit ? " " + esc(st.item.unit) : "";
    const pins = v.players.map((p, i) => ({ p, color: PLAYER_COLORS[i % PLAYER_COLORS.length], r: st.result[p.id] })).filter((x) => x.r && x.r.given != null);
    if (!pins.length) return "";
    const far = Math.max(...pins.map((x) => Math.abs(x.r.given - val)), Math.abs(val) * 0.02, 1);
    let lo = val - far * 1.12, hi = val + far * 1.12;
    if (pins.every((x) => x.r.given >= 0) && val >= 0 && lo < 0) lo = 0; // keine negativen Werte auf dem Strahl
    const pos = (x) => Math.max(0, Math.min(100, ((x - lo) / (hi - lo)) * 100));
    // nah beieinander liegende Nadeln übereinander stapeln
    const sorted = pins.slice().sort((a, b) => a.r.given - b.r.given), rows = [];
    sorted.forEach((x) => { x.left = pos(x.r.given); let row = 0; while (rows[row] != null && x.left - rows[row] < 14) row++; rows[row] = x.left; x.row = row; });
    const h = 64 + Math.max(0, rows.length - 1) * 30;
    const tick = (x) => quizFmt(x);
    return `<div class="est" style="--rows:${rows.length}"><div class="est-area" style="height:${h}px">
        <div class="est-track"></div><div class="est-side lo">zu tief</div><div class="est-side hi">zu hoch</div>
        <div class="est-goal" style="left:${pos(val)}%"><span>${tick(val)}${unit}</span></div>
        ${sorted.map((x) => `<div class="est-pin ${x.r.place === 1 ? "best" : ""}" style="left:${x.left}%;--pc:${x.color};--row:${x.row}" title="${esc(x.p.name)}: ${tick(x.r.given)}${unit}">
          <i></i><b>${esc(x.p.name)}${x.p.id === G.myId ? " (du)" : ""}</b><small>${tick(x.r.given)}</small></div>`).join("")}
      </div><div class="est-scale"><span>${tick(lo)}</span><span>${tick(hi)}</span></div></div>`;
  }
  // Schätzen-Auflösung: die richtige Zahl zählt (leise tickend) hoch, dann erscheint die Ziellinie und die Tipps
  // fallen nacheinander auf den Zahlenstrahl; der Beste leuchtet zuletzt auf
  function estReveal(st) {
    const ans = app.querySelector(".quiz-answer"), est = app.querySelector(".est");
    if (!ans) return;
    const val = st.item.v, unit = st.item.unit ? " " + st.item.unit : "", dur = 900, t0 = performance.now();
    const K = window.S10Klang, tick = () => K && K.play(sfx, (c, t) => K.tone(c, t, 0.03, { f0: 1500, peak: 0.04 }));
    let lastTick = 0;
    const step = (now) => {
      if (!ans.isConnected) return;
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      ans.textContent = (k < 1 ? quizFmt(Math.round(val * e)) : quizFmt(val)) + unit;
      if (k < 1 && now - lastTick > 70) { lastTick = now; tick(); }
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    if (est) {
      est.classList.add("fx");
      est.querySelectorAll(".est-pin").forEach((p, i) => { p.style.animationDelay = dur + 350 + i * 300 + "ms"; });
      const n = est.querySelectorAll(".est-pin").length;
      est.style.setProperty("--best-at", dur + 350 + n * 300 + 200 + "ms");
      for (let i = 0; i < n; i++) setTimeout(() => { if (est.isConnected) tick(); }, dur + 350 + i * 300);
    }
  }
  function quizResultsHtml(v, st) {
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const rows = v.players.filter((p) => st.result[p.id]).map((p) => ({ p, r: st.result[p.id] })).sort((a, b) => b.r.points - a.r.points);
    return rows.map(({ p, r }) => {
      let what;
      if (st.mode === "schaetzen") what = r.given == null ? "nicht geschätzt" : `${quizFmt(r.given)}${st.item.unit ? " " + esc(st.item.unit) : ""} <span class="muted small">(${r.diff > 0 ? "+" : ""}${quizFmt(r.diff)})</span>${r.exact ? " 🎯" : ""}`;
      else what = r.given == null ? "keine Antwort" : `${r.ok ? "✓" : "✗"} ${esc(r.given)}${st.mode === "hinweis" && r.ok ? ` <span class="muted small">(${r.hint}. Hinweis)</span>` : ""}${r.fast ? " ⚡" : ""}`;
      return `<div class="geo-res ${st.ready[p.id] ? "done" : ""}" style="--pc:${colorOf(p.id)}"><span class="pdot ${p.connected ? "" : "off"}"></span>
        <span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}${st.ready[p.id] ? ` <span class="geo-mark">✓</span>` : ""}</span>
        <span class="small">${what}</span><b>+${r.points}</b><span class="geo-total" title="Gesamt">${st.total[p.id] || 0}</span></div>`;
    }).join("");
  }
  function quizSubmit() {
    const st = G.view && G.view.quiz, inp = app.querySelector("#quiz-in");
    if (!st || st.step !== "ask" || quizSent === st.round || !inp || !inp.value.trim()) return;
    if (st.mode === "schaetzen" && !isFinite(QZ.parseNum(inp.value))) { toast("Bitte eine Zahl eingeben (Kommazahlen mit Komma).", "bad"); return; }
    quizSent = st.round; quizMine = inp.value.trim();
    send({ type: "quizAnswer", round: st.round, text: quizMine });
    quizAskFoot();
  }
  // Eingabe oder „Deine Antwort … warte“ – ohne den Rest neu zu zeichnen
  function quizAskFoot() {
    const st = G.view && G.view.quiz, f = app.querySelector(".quiz-foot");
    if (!st || !f || quizSent !== st.round) return;
    f.innerHTML = `<p class="quiz-sent">Deine ${st.mode === "schaetzen" ? "Schätzung" : "Antwort"}: <b>${esc(quizMine || "")}${st.mode === "schaetzen" && st.item.unit ? " " + esc(st.item.unit) : ""}</b> – warte auf die anderen …</p>`;
  }
  setInterval(() => {
    const st = G.view && G.view.quiz;
    if (!st || st.step !== "ask") return;
    const el = document.getElementById("quiz-timer"), ms = Math.max(0, quizDeadline - Date.now());
    if (el) { quizRingSet(el, ms, quizTotalMs(st)); sfx.countdown("quiz:" + G.view.code + ":" + st.round, ms, quizSent !== st.round); }
    const nh = document.getElementById("quiz-nexthint");
    if (nh && quizHintAt) { const left = Math.max(0, Math.ceil((quizHintAt - Date.now()) / 1000)); nh.textContent = left ? `nächster Hinweis in ${left} s` : "gleich kommt der nächste Hinweis …"; }
    if (ms <= 300) quizSubmit(); // Eingetipptes bei Zeitablauf abgeben
  }, 250);
  function renderQuiz() {
    const v = G.view, st = v.quiz;
    if (!st) return;
    quizYear = st.mode === "schaetzen" && !!st.item && !st.item.unit;
    const head = (inner) => `<main class="screen game slf geo quiz"><header class="top topbar">${headBrandHtml(st.mode)}
        <div class="meta">${esc(st.modeName)}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>${topActionsHtml()}</header>${statusBarHtml()}<section class="slf-main quiz-main">${inner}</section></main>`;
    if (st.mode === "umriss" && !needLandData()) { quizRendered = null; app.innerHTML = head(`<div class="panel"><p class="muted">Länderkarte wird geladen …</p></div>`); return; }
    quizDeadline = st.endsIn != null ? Date.now() + st.endsIn : 0;
    quizHintAt = st.item && st.item.nextIn != null ? Date.now() + st.item.nextIn : 0;
    // Schlüssel je Frage (nicht nur je Runde): eine neue Partie oder Etappe mit derselben Rundennummer zählt als neue Frage
    const it0 = st.item || {}, rk = v.code + ":" + st.round + ":" + (it0.c || it0.q || (it0.hints && it0.hints[0]) || "") + ":";
    const key = rk + st.step;
    if (quizRendered === key && app.querySelector(".quiz-main")) {
      const sc = app.querySelector(".qz-side"); if (sc) sc.innerHTML = quizPods(v, st);
      const hl = app.querySelector(".quiz-hintbox"); if (hl && st.mode === "hinweis" && hl.dataset.n !== String(st.item.hints.length)) {
        hl.dataset.n = st.item.hints.length; hl.querySelector(".quiz-hints").outerHTML = quizHintsHtml(st);
        const pts = app.querySelector("#quiz-pts"); if (pts) pts.textContent = 6 - st.item.hints.length;
        const hs = app.querySelector("#quiz-hsub"); if (hs) hs.textContent = `Hinweis ${st.item.hints.length} von 5 · alle antworten gleichzeitig`;
      }
      const rs = app.querySelector(".geo-results"); if (rs && st.result) rs.innerHTML = quizResultsHtml(v, st);
      if (st.step === "reveal") G.nextBtnSwap("#quiz-ready", { attr: 'id="quiz-ready"', label: st.round >= st.rounds ? "Zum Endstand" : "Weiter", ready: !!st.ready[G.myId], waiting: G.waitingNames(v, st.ready) }, () => send({ type: "quizReady" }));
      return;
    }
    if (st.step === "ask" && (!quizRendered || !quizRendered.startsWith(rk))) { quizSent = null; quizMine = null; }
    if (st.step === "ask" && st.submitted.includes(G.myId) && quizSent !== st.round) { quizSent = st.round; }
    // Schätzen: Auflösung direkt nach dem Tippen (nicht nach Neuladen) wird animiert
    const estFresh = st.mode === "schaetzen" && st.step === "reveal" && quizRendered === rk + "ask"
      && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    // Umriss-Rätsel: neue Frage (nicht nach Neuladen) – der Umriss zeichnet sich wie mit dem Stift gezogen
    const umrissFresh = st.mode === "umriss" && st.step === "ask" && (quizRendered !== null || st.round === 1) && !(quizRendered || "").startsWith(rk)
      && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    quizRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const label = `${esc(st.modeName)} · Runde ${st.round} / ${st.rounds}${st.mode === "umriss" ? " · " + esc(LAND.REGION_NAMES[st.region] || "") : ""}`;
    let main;
    if (st.step === "final") {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((p) => (st.winners || []).includes(p.id)).map((p) => esc(p.name)).join(" & ")} ${(st.winners || []).length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="quiz-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((p, i) => `<div class="slf-rank" style="--pc:${colorOf(p.id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
          <span class="slf-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span><b>${st.total[p.id] || 0} Punkte</b></div>`).join("")}
          <p class="muted small">${esc(st.modeName)} · ${st.rounds} Runden</p></div>`;
    } else {
      const sent = quizSent === st.round, it = st.item || {};
      let q = "";
      const ask = st.step === "ask";
      if (st.mode === "schaetzen") q = `<div class="quiz-q">${esc(it.q)}</div>${!ask ? `<div class="quiz-answer">${quizFmt(it.v)}${it.unit ? " " + esc(it.unit) : ""}</div>${estLineHtml(v, st)}` : ""}`;
      else if (st.mode === "hinweis") q = `<div class="quiz-q">Wer oder was ist gemeint?</div>${!ask ? `<div class="quiz-answer">${esc(it.a)}</div>` : ""}<div class="quiz-hintbox" data-n="${it.hints ? it.hints.length : 0}">
          ${quizHintsHtml(st)}${ask ? `<p class="qz-pts">Richtig jetzt: <b id="quiz-pts">${6 - (it.hints || [1]).length}</b> Punkte</p>` : ""}</div>`;
      else q = `<div class="quiz-q">${umrissFrage(it.c)}</div><div class="umriss-box">${umrissSvg(it.c, umrissFresh)}</div>${!ask ? `<div class="quiz-answer">${esc(it.a)}</div>` : ""}`;
      // Kopfzeile: Symbol, Spiel · Runde, Stand – rechts oben der Zeitring
      const ico = { schaetzen: "🎯", hinweis: "🔎", umriss: "🗺️" }[st.mode] || "❓";
      const sub = !ask ? "Auflösung" : st.mode === "hinweis" ? `Hinweis ${(it.hints || []).length} von 5 · alle antworten gleichzeitig` : "Alle antworten gleichzeitig";
      const ms0 = st.endsIn || 0, tot = quizTotalMs(st), p0 = Math.max(0, Math.min(1, ms0 / tot));
      const ring = ask ? `<div id="quiz-timer" class="qz-ring" style="--rc:${p0 > .5 ? "#7ee2b1" : p0 > .2 ? "#ffc83d" : "#ff7d8a"}"><svg viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="31" class="r0"/><circle cx="37" cy="37" r="31" class="r1" style="stroke-dasharray:${QZ_RING * p0} ${QZ_RING}"/></svg><b>${Math.ceil(ms0 / 1000)}</b></div>` : "";
      q = `<div class="qz-head"><span class="qz-ico">${ico}</span><div><small>${label}</small><b id="quiz-hsub">${sub}</b></div>${ring}</div>` + q;
      const foot = st.step === "ask" ? `<div class="quiz-foot">${sent ? "" : `<form class="quiz-form" onsubmit="return false">
          <input id="quiz-in" ${st.mode === "schaetzen" ? `inputmode="decimal" placeholder="Deine Schätzung"` : `placeholder="Deine Antwort"`} autocomplete="off" maxlength="60">
          ${st.mode === "schaetzen" && it.unit ? `<span class="quiz-unit">${esc(it.unit)}</span>` : ""}<button class="btn primary" id="quiz-go">${st.mode === "schaetzen" ? "Festlegen" : "Antworten"}</button></form>
          ${st.mode !== "schaetzen" ? `<p class="muted small quiz-note">Nur ein Versuch – kleine Tippfehler sind kein Problem.</p>` : `<p class="muted small quiz-note">Kommazahlen mit Komma, z. B. 9,1</p>`}`}</div>`
        : `<div class="geo-results">${quizResultsHtml(v, st)}</div>
           <div class="geo-actions">${G.nextBtnsHtml({ attr: 'id="quiz-ready"', hostAttr: 'id="quiz-next"', label: st.round >= st.rounds ? "Zum Endstand" : "Weiter", ready: !!st.ready[G.myId], waiting: G.waitingNames(v, st.ready) })}</div>`;
      main = `<div class="qz-layout"><div class="panel quiz-card qz-card qz-${st.mode} ${st.step === "ask" ? "is-ask" : "is-reveal"}">${q}${foot}</div><aside class="qz-side">${quizPods(v, st)}</aside></div>`;
    }
    app.innerHTML = head(main);
    if (estFresh) estReveal(st);
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#quiz-go", quizSubmit);
    on("#quiz-ready", () => send({ type: "quizReady" }));
    on("#quiz-next", () => send({ type: "quizNext" }));
    on("#quiz-restart", () => send({ type: "quizRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    const inp = app.querySelector("#quiz-in");
    if (inp) { inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); quizSubmit(); } }; if (matchMedia("(pointer: fine)").matches) inp.focus(); }
    quizAskFoot();
  }


  return {
    renderQuiz,
  };
});
