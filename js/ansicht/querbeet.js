// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    GAMES, PLAYER_COLORS, QB, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Querbeet ----------
  const qbGame = (k) => GAMES.find((g) => g.key === k) || GAMES[0];
  const qbFmt = (n) => Number(n || 0).toLocaleString("de-DE");
  // Joker-Feld neben der nächsten Etappe: setzen / zurücknehmen (nicht im Finale), wer ihn hier schon gesetzt hat
  function qbJokerHtml(q, isFinal) {
    if (!q.jokerOn || !G.view.players.some((p) => p.id === G.myId)) return "";
    const next = q.idx + 1, mine = q.joker[G.myId];
    const others = Object.keys(q.joker).filter((id) => q.joker[id] === next && id !== G.myId).map((id) => esc((G.view.players.find((p) => p.id === id) || { name: "?" }).name));
    const who = others.length ? `<small class="qbj-who">Hier auch: ${others.join(", ")}</small>` : "";
    const box = (cls, inner, attr = "") => `<button type="button" class="qb-jbox ${cls}" ${attr}><span class="qbj-card" aria-hidden="true">🃏</span><span class="qbj-txt">${inner}</span></button>`;
    let b;
    if (isFinal) b = box("off", `<b>Kein Joker</b><small>Das Finale zählt ohnehin doppelt</small>`, "disabled");
    else if (mine === next) b = box("set", `<b>Joker gesetzt</b><small>Diese Etappe zählt für dich doppelt · tippen zum Zurücknehmen</small>`, `data-qbjoker="off"`);
    else if (mine != null) b = box("off", `<b>Joker verbraucht</b><small>Schon in Etappe ${mine + 1} eingesetzt</small>`, "disabled");
    else b = box("", `<b>Joker setzen</b><small>Diese Etappe zählt für dich doppelt – einmal pro Partie</small>`, `data-qbjoker="on"`);
    return `<div class="qbn-joker">${b}${who}</div>`;
  }
  function qbReadyBtnHtml(q, label) {
    const ids = G.view.players.filter((p) => p.connected && !p.paused).map((p) => p.id), n = ids.filter((id) => q.ready[id]).length;
    return `<button class="btn primary" data-qb="ready">${q.ready[G.myId] ? `Bereit ✓ – warte auf die anderen (${n}/${ids.length})` : label}</button>
      ${G.isHost ? `<button class="btn ghost sm" data-qb="go">Sofort weiter</button>` : ""}`;
  }
  // Leiste unten während einer Etappe: wo man steht, und am Ende der Etappe „Weiter zum Zwischenstand“
  const qbBarEl = document.createElement("div");
  qbBarEl.id = "qbbar"; document.body.appendChild(qbBarEl);
  qbBarEl.addEventListener("click", (e) => { const b = e.target.closest("[data-qb]"); if (b) send({ type: b.dataset.qb === "go" ? "qbGo" : "qbReady" }); });
  function qbBarRender() {
    const q = G.view && G.view.qb;
    // Während der Etappe zeigt die Kopfzeile die Etappe an; die Leiste unten kommt erst, wenn die Etappe geschafft ist
    if (!q || G.view.phase === "querbeet" || G.view.phase === "lobby" || !q.cur || !q.done) { qbBarEl.className = ""; qbBarEl.innerHTML = ""; return; }
    const g = qbGame(q.cur.game), fin = q.idx === q.n - 1;
    qbBarEl.className = "on" + (q.done ? " done" : "");
    qbBarEl.style.setProperty("--gc", "#ff8a5c");
    qbBarEl.innerHTML = `<span class="qb-chip"><span class="gt-icon xs" aria-hidden="true">${qbGame("querbeet").icon}</span><b>Querbeet</b>
        <span class="muted">Etappe ${q.idx + 1}/${q.n}${fin ? " · Finale ×2" : ""}</span></span>
      ${q.done ? `<span class="qb-done">Etappe geschafft!</span>${qbReadyBtnHtml(q, fin ? "Zur Siegerehrung" : "Weiter zum Zwischenstand")}`
        : `<span class="qb-cur muted small">${esc(g.name)} · ${esc(q.cur.detail)}</span>`}`;
  }
  function renderQuerbeet() {
    const v = G.view, q = v.qb;
    if (!q) return;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const medal = ["🥇", "🥈", "🥉"];
    const ranking = v.players.slice().sort((a, b) => (q.pts[b.id] || 0) - (q.pts[a.id] || 0));
    const maxPts = Math.max(1, ...Object.values(q.pts));
    // Weg durch alle Etappen: erledigte, aktuelle, kommende
    const path = `<div class="qb-path">${q.plan.map((k, i) => {
      const g = qbGame(k), st = i < q.stages.length ? "done" : i === q.idx + 1 && q.step !== "final" ? "next" : "";
      return `<span class="qb-stop ${st} ${i === q.n - 1 ? "fin" : ""}" style="--gc:${g.color}" title="${i + 1}. ${esc(g.name)}${i === q.n - 1 ? " (Finale ×2)" : ""}"><span class="gt-icon xs">${g.icon}</span></span>`;
    }).join(`<span class="qb-link"></span>`)}</div>`;
    const standings = (title) => `<div class="panel qb-standing"><h3>${title}</h3>${ranking.map((p, i) => {
      const place = ranking.findIndex((x) => (q.pts[x.id] || 0) === (q.pts[p.id] || 0));
      return `<div class="qb-row" style="--pc:${colorOf(p.id)}"><span class="qb-place">${medal[place] || place + 1 + "."}</span><span class="pdot"></span>
        <span class="qb-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}${q.jokerOn && q.step !== "final" && q.joker[p.id] == null ? ` <span class="qb-jk" title="Joker noch nicht eingesetzt">🃏</span>` : ""}</span>
        <span class="qb-bar"><i style="width:${Math.round(100 * (q.pts[p.id] || 0) / maxPts)}%"></i></span><b>${q.pts[p.id] || 0}</b></div>`;
    }).join("")}</div>`;
    const last = q.stages[q.stages.length - 1];
    const stageRes = (x, title) => {
      const g = qbGame(x.game);
      const rows = Object.entries(x.res).sort((a, b) => a[1].place - b[1].place);
      return `<div class="panel qb-result" style="--gc:${g.color}"><div class="qb-head"><span class="gt-icon">${g.icon}</span><div><div class="game-label">${title}</div><b>${esc(g.name)}</b></div></div>
        ${rows.map(([id, r]) => `<div class="qb-row" style="--pc:${colorOf(id)}"><span class="qb-place">${medal[r.place - 1] || r.place + "."}</span><span class="pdot"></span>
          <span class="qb-name">${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</span><span class="muted small">${x.game === "bus" ? `${qbFmt(r.score)} Punkte` : `${qbFmt(r.score)} ${x.game === "zehn" || x.game === "hl" || x.game === "land" ? "richtig" : "Punkte"}`}</span><b class="qb-plus">${r.joker ? `<span class="qb-jk" title="Joker: doppelt">🃏</span>` : ""}+${r.pts}</b></div>`).join("")}</div>`;
    };
    const nextCard = (n, isFinal) => { const g = qbGame(n.game), jk = qbJokerHtml(q, isFinal);
      return `<div class="panel qb-next ${jk ? "with-joker" : ""}" style="--gc:${g.color}">
        <div class="qbn-info"><div class="game-label">${isFinal ? "Finale – zählt doppelt!" : `Etappe ${q.idx + 2} von ${q.n}`}</div>
          <div class="qb-head"><span class="gt-icon big">${g.icon}</span><div><b class="qb-gname">${esc(n.name)}</b><div class="muted small">${esc(n.detail)}</div></div></div>
          <p>${esc(n.rule)}</p></div>
        ${jk}<div class="qbn-act">${qbReadyBtnHtml(q, isFinal ? "Bereit fürs Finale" : "Bereit")}</div></div>`; };
    let main = "";
    if (q.step === "intro") {
      main = `<div class="panel qb-intro"><h2>Querbeet – ${q.n} Etappen</h2>
          <p class="muted">${q.theme !== "mix" ? `Thema: <b>${esc(QB.THEMES[q.theme].name)}</b>. ` : ""}Jede Etappe ist eine Kurzfassung eines Spiels. Pro Etappe zählt die Platzierung: ${QB.POINTS[0]} · ${QB.POINTS[1]} · ${QB.POINTS[2]} Partypunkte, alle anderen 1. Das Finale zählt doppelt.${q.jokerOn ? " Jeder hat einen 🃏 Joker: vor einer Etappe gesetzt, zählt sie für dich doppelt." : ""}</p>${path}</div>
        ${nextCard(q.next, false)}`;
    } else if (q.step === "break") {
      main = `${path}<div class="qb-grid">${stageRes(last, `Ergebnis Etappe ${q.stages.length}`)}${standings("Zwischenstand")}</div>${nextCard(q.next, q.lastDouble)}`;
    } else {
      const w = ranking.filter((p) => (q.winners || []).includes(p.id));
      main = `<div class="banner win"><div class="trophy">🏆</div><b>${w.map((p) => esc(p.name)).join(" & ")} ${w.length > 1 ? "gewinnen" : "gewinnt"} Querbeet!</b>
          <div class="banner-actions">${G.isHost ? `<button id="qb-restart" class="btn primary">Nochmal Querbeet</button><button id="toLobby" class="btn ghost">Zur Lobby</button>` : `<span class="muted">Der Gastgeber entscheidet, wie es weitergeht.</span>`}</div></div>
        ${(q.titles || []).length ? `<div class="panel qb-titles"><h3>Auszeichnungen</h3><div class="qb-tgrid">${q.titles.map((t) => `<div class="qb-title"><b>${esc(t.name)}</b>
          <span>${t.ids.map((id) => `<span style="color:${colorOf(id)}">${esc(nameOf(id))}</span>`).join(" & ")}</span><small class="muted">${esc(t.why)}</small></div>`).join("")}</div></div>` : ""}
        ${path}<div class="qb-grid">${standings("Endstand")}${stageRes(last, "Finale (doppelte Punkte)")}</div>
        <div class="panel qb-table"><h3>Alle Etappen</h3><div class="qb-scroll"><table><thead><tr><th></th>${q.stages.map((x, i) => `<th title="${esc(qbGame(x.game).name)}"><span class="gt-icon xs">${qbGame(x.game).icon}</span><small>${i + 1}</small></th>`).join("")}<th>Σ</th></tr></thead>
          <tbody>${ranking.map((p) => `<tr><td style="--pc:${colorOf(p.id)}"><span class="pdot"></span> ${esc(p.name)}</td>${q.stages.map((x) => `<td>${x.res[p.id] ? x.res[p.id].pts : "–"}</td>`).join("")}<td><b>${q.pts[p.id] || 0}</b></td></tr>`).join("")}</tbody></table></div></div>`;
    }
    app.innerHTML = `
      <main class="screen game querbeet">
        <header class="top topbar">
          ${headBrandHtml("querbeet")}
          <div class="meta">${q.step === "final" ? "Siegerehrung" : q.step === "intro" ? `${q.n} Etappen` : `Nach Etappe ${q.stages.length} von ${q.n}`}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="qb-main">${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#qb-restart", () => send({ type: "qbRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-qb]").forEach((b) => b.onclick = () => send({ type: b.dataset.qb === "go" ? "qbGo" : "qbReady" }));
    app.querySelectorAll("[data-qbjoker]").forEach((b) => b.onclick = () => send({ type: "qbJoker", on: b.dataset.qbjoker === "on" }));
  }


  return {
    qbBarRender,
    renderQuerbeet,
  };
});
