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
  function quizChips(v, st) {
    return v.players.map((p, i) => {
      const done = st.step === "ask" ? st.submitted.includes(p.id) : st.step === "reveal" ? !!st.ready[p.id] : false;
      const mark = st.step === "ask" ? (done ? "✓" : "…") : done ? "✓" : "";
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><span class="pdot ${p.connected ? "" : "off"}"></span>
        <span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span><b>${st.total[p.id] || 0}</b>${mark ? `<span class="geo-mark">${mark}</span>` : ""}</span>`;
    }).join("");
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
    if (draw) { // jeder Teilumriss einzeln: Strich läuft einmal herum (pathLength 1), danach füllt er sich; leises Stiftgeräusch
      const K = window.S10Klang; if (K) K.play(sfx, (c, t) => K.noise(c, t, 1.1, { type: "bandpass", freq: 3200, q: 1.2, a: 0.05, peak: 0.05, sweepTo: 4200 }));
      return `<svg class="umriss-svg fx-draw" style="--sw:${(Math.max(w, h) / 140).toFixed(4)}" viewBox="${(x0 - pad).toFixed(3)} ${(y0 - pad).toFixed(3)} ${(w + 2 * pad).toFixed(3)} ${(h + 2 * pad).toFixed(3)}" preserveAspectRatio="xMidYMid meet">
        <path class="u-fill" d="${d}" fill="#ffd24d" fill-rule="evenodd"/>${ds.map((x) => `<path class="u-line" d="${x}" pathLength="1" fill="none" stroke="#fff6cf" stroke-linejoin="round"/>`).join("")}</svg>`;
    }
    return `<svg class="umriss-svg" viewBox="${(x0 - pad).toFixed(3)} ${(y0 - pad).toFixed(3)} ${(w + 2 * pad).toFixed(3)} ${(h + 2 * pad).toFixed(3)}" preserveAspectRatio="xMidYMid meet">
      <path d="${d}" fill="#ffd24d" fill-opacity=".9" stroke="#fff6cf" stroke-width="${(Math.max(w, h) / 220).toFixed(4)}" fill-rule="evenodd" stroke-linejoin="round"/></svg>`;
  }
  function quizHintsHtml(st) {
    const it = st.item; if (!it || !it.hints) return "";
    return `<ol class="quiz-hints">${it.hints.map((h, i) => `<li class="${i === it.hints.length - 1 && st.step === "ask" ? "new" : ""}"><span class="qh-n">${i + 1}</span>${esc(h)}</li>`).join("")}</ol>`;
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
    if (el) { el.textContent = Math.ceil(ms / 1000) + " s"; el.classList.toggle("urgent", ms <= 10000); sfx.countdown("quiz:" + G.view.code + ":" + st.round, ms, quizSent !== st.round); }
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
    const key = v.code + ":" + st.round + ":" + st.step;
    if (quizRendered === key && app.querySelector(".quiz-main")) {
      const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = quizChips(v, st);
      const hl = app.querySelector(".quiz-hintbox"); if (hl && st.mode === "hinweis" && hl.dataset.n !== String(st.item.hints.length)) {
        hl.dataset.n = st.item.hints.length; hl.querySelector(".quiz-hints").outerHTML = quizHintsHtml(st);
        const pts = app.querySelector("#quiz-pts"); if (pts) pts.textContent = 6 - st.item.hints.length;
      }
      const rs = app.querySelector(".geo-results"); if (rs && st.result) rs.innerHTML = quizResultsHtml(v, st);
      if (st.step === "reveal") { const rb = app.querySelector("#quiz-ready"); if (rb) rb.textContent = st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Weiter"; }
      return;
    }
    if (st.step === "ask" && (!quizRendered || !quizRendered.startsWith(v.code + ":" + st.round + ":"))) { quizSent = null; quizMine = null; }
    if (st.step === "ask" && st.submitted.includes(G.myId) && quizSent !== st.round) { quizSent = st.round; }
    // Schätzen: Auflösung direkt nach dem Tippen (nicht nach Neuladen) wird animiert
    const estFresh = st.mode === "schaetzen" && st.step === "reveal" && quizRendered === v.code + ":" + st.round + ":ask"
      && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    // Umriss-Rätsel: neue Frage (nicht nach Neuladen) – der Umriss zeichnet sich wie mit dem Stift gezogen
    const umrissFresh = st.mode === "umriss" && st.step === "ask" && (quizRendered !== null || st.round === 1) && !(quizRendered || "").startsWith(v.code + ":" + st.round + ":")
      && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    quizRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const label = `<span class="game-label">${st.step === "reveal" ? "Auflösung · " : ""}Runde ${st.round}/${st.rounds}${st.mode === "umriss" ? " · " + esc(LAND.REGION_NAMES[st.region] || "") : ""}</span>`;
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
      if (st.mode === "schaetzen") q = `<div class="quiz-q">${esc(it.q)}</div>${st.step === "reveal" ? `<div class="quiz-answer">${quizFmt(it.v)}${it.unit ? " " + esc(it.unit) : ""}</div>${estLineHtml(v, st)}` : ""}`;
      else if (st.mode === "hinweis") q = `<div class="quiz-hintbox" data-n="${it.hints ? it.hints.length : 0}">${st.step === "reveal" ? `<div class="quiz-answer">${esc(it.a)}</div>` : `<div class="quiz-q small">Wer oder was ist gemeint?</div>`}
          ${quizHintsHtml(st)}${st.step === "ask" ? `<p class="muted small">Richtig jetzt: <b id="quiz-pts">${6 - (it.hints || [1]).length}</b> Punkte · <span id="quiz-nexthint"></span></p>` : ""}</div>`;
      else q = `<div class="umriss-box">${umrissSvg(it.c, umrissFresh)}</div>${st.step === "reveal" ? `<div class="quiz-answer">${esc(it.a)}</div>` : `<div class="quiz-q small">${umrissFrage(it.c)}</div>`}`;
      const foot = st.step === "ask" ? `<div class="quiz-foot">${sent ? "" : `<form class="quiz-form" onsubmit="return false">
          <input id="quiz-in" ${st.mode === "schaetzen" ? `inputmode="decimal" placeholder="Deine Schätzung"` : `placeholder="Deine Antwort"`} autocomplete="off" maxlength="60">
          ${st.mode === "schaetzen" && it.unit ? `<span class="quiz-unit">${esc(it.unit)}</span>` : ""}<button class="btn primary" id="quiz-go">${st.mode === "schaetzen" ? "Festlegen" : "Antworten"}</button></form>
          ${st.mode !== "schaetzen" ? `<p class="muted small quiz-note">Nur ein Versuch – kleine Tippfehler sind kein Problem.</p>` : `<p class="muted small quiz-note">Kommazahlen mit Komma, z. B. 9,1</p>`}`}</div>`
        : `<div class="geo-results">${quizResultsHtml(v, st)}</div>
           <div class="geo-actions"><button id="quiz-ready" class="btn primary">${st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Weiter"}</button>
             ${G.isHost ? `<button id="quiz-next" class="btn ghost sm">Als Gastgeber sofort weiter</button>` : ""}</div>`;
      main = `<div class="geo-bar">${label}<div class="geo-scores">${quizChips(v, st)}</div>
          ${st.step === "ask" ? `<div id="quiz-timer" class="slf-timer">${Math.ceil((st.endsIn || 0) / 1000)} s</div>` : ""}</div>
        <div class="panel quiz-card">${q}${foot}</div>`;
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
