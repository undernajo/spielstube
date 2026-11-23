// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    GAMES, PLAYER_COLORS, QB, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Querbeet (Stubenmeisterschaft) ----------
  const qbGame = (k) => GAMES.find((g) => g.key === k) || GAMES[0];
  const qbFmt = (n) => Number(n || 0).toLocaleString("de-DE");
  // Joker-Feld neben der nächsten Etappe: setzen / zurücknehmen, wer ihn hier schon gesetzt hat
  function qbJokerHtml(q) {
    if (!q.jokerOn || !G.view.players.some((p) => p.id === G.myId)) return "";
    const next = q.idx + 1, mine = q.joker[G.myId];
    const others = Object.keys(q.joker).filter((id) => q.joker[id] === next && id !== G.myId).map((id) => esc((G.view.players.find((p) => p.id === id) || { name: "?" }).name));
    const who = others.length ? `<small class="qbj-who">Hier auch: ${others.join(", ")}</small>` : "";
    const box = (cls, inner, attr = "") => `<button type="button" class="qb-jbox ${cls}" ${attr}><span class="qbj-card" aria-hidden="true">🃏</span><span class="qbj-txt">${inner}</span></button>`;
    let b;
    if (mine === next) b = box("set", `<b>Joker gesetzt</b><small>Diese Etappe zählt für dich doppelt · tippen zum Zurücknehmen</small>`, `data-qbjoker="off"`);
    else if (mine != null) b = box("off", `<b>Joker verbraucht</b><small>Schon in Etappe ${mine + 1} eingesetzt</small>`, "disabled");
    else b = box("", `<b>Joker setzen</b><small>Deine Felder dieser Etappe zählen doppelt – einmal pro Meisterschaft</small>`, `data-qbjoker="on"`);
    return `<div class="qbn-joker">${b}${who}</div>`;
  }
  function qbReadyBtnHtml(q, label) {
    return G.nextBtnsHtml({ attr: 'data-qb="ready"', hostAttr: 'data-qb="go"', label, ready: !!q.ready[G.myId], waiting: G.waitingNames(G.view, q.ready) });
  }
  // Leiste unten während einer Etappe: am Ende der Etappe „Weiter zum Spielbrett“
  const qbBarEl = document.createElement("div");
  qbBarEl.id = "qbbar"; document.body.appendChild(qbBarEl);
  qbBarEl.addEventListener("click", (e) => { const b = e.target.closest("[data-qb]"); if (b) send({ type: b.dataset.qb === "go" ? "qbGo" : "qbReady" }); });
  function qbBarRender() {
    const q = G.view && G.view.qb;
    // Während der Etappe zeigt die Kopfzeile die Etappe an; die Leiste unten kommt erst, wenn die Etappe geschafft ist
    if (!q || G.view.phase === "querbeet" || G.view.phase === "lobby" || !q.cur || !q.done) { qbBarEl.className = ""; qbBarEl.innerHTML = ""; return; }
    const g = qbGame(q.cur.game);
    qbBarEl.className = "on" + (q.done ? " done" : "");
    qbBarEl.style.setProperty("--gc", "#ff8a5c");
    qbBarEl.innerHTML = `<span class="qb-chip"><span class="gt-icon xs" aria-hidden="true">${qbGame("querbeet").icon}</span><b>Meisterschaft</b>
        <span class="muted">Etappe ${q.idx + 1} · Ziel Feld ${q.target}</span></span>
      ${q.done ? `<span class="qb-done">Etappe geschafft!</span>${qbReadyBtnHtml(q, "Weiter zum Spielbrett")}`
        : `<span class="qb-cur muted small">${esc(g.name)} · ${esc(q.cur.detail)}</span>`}`;
  }

  // ---------- Spielbrett: Laufbahn als eckige Spirale, das letzte Feld ist das Ziel ----------
  const TILE = ["#ef6461", "#f4a259", "#f2cc5b", "#8cc084", "#5fb3b3", "#6c8ebf", "#a582c9"];
  const P = 100, T = 84, R = 14, FRAME = 46, STARTW = 120; // Rasterabstand, Feldgröße, Eckenradius, Rahmen, Startfeld
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))));
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };
  const star = (x, y, r1, r2) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (x + Math.cos(a) * rr).toFixed(1) + " " + (y + Math.sin(a) * rr).toFixed(1); } return d + "Z"; };
  function spiral(cols, rows) {
    const out = []; let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
    while (top <= bottom && left <= right) {
      for (let x = left; x <= right; x++) out.push([x, bottom]); bottom--;
      for (let y = bottom; y >= top; y--) out.push([right, y]); right--;
      if (top <= bottom) { for (let x = right; x >= left; x--) out.push([x, top]); top++; }
      if (left <= right) { for (let y = top; y <= bottom; y++) out.push([left, y]); left++; }
    }
    return out;
  }
  // bis 8 Felder eine gerade Leiste, darüber die kleinste Spirale, in die alle Felder passen
  function layout(fields) {
    if (fields <= 8) return { cols: fields, rows: 1, line: true, cells: Array.from({ length: fields }, (_, i) => [i, 0]) };
    for (let rows = 3; rows < 14; rows++) { const cols = Math.round(rows * 1.55), cells = spiral(cols, rows); if (fields <= cells.length) return { cols, rows, cells: cells.slice(0, fields) }; }
  }
  let board = null; // { key, spots, W, H } – Positionen der Felder (0 = Start)
  function boardGeom(target) {
    if (board && board.target === target) return board;
    const L = layout(target), W = L.cols * P + FRAME * 2 + STARTW, H = (L.line ? 1.5 : L.rows) * P + FRAME * 2;
    const ox = FRAME + STARTW, oy = FRAME + (L.line ? .25 * P : 0), cx = (c) => ox + c * P + P / 2, cy = (r) => oy + r * P + P / 2;
    const spots = [[FRAME + STARTW / 2 - 4, cy(L.rows - 1)], ...L.cells.map(([c, r]) => [cx(c), cy(r)])];
    return (board = { target, L, W, H, cx, cy, spots });
  }
  function boardSvg(target, pawns) {
    const B = boardGeom(target), { L, W, H, cx, cy, spots } = B, out = [];
    out.push(`<svg class="qbb-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spielbrett: Ziel bei Feld ${target}"><defs>
      <linearGradient id="qbbwood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a66a3c"/><stop offset=".35" stop-color="#8a5530"/><stop offset=".6" stop-color="#9c6236"/><stop offset="1" stop-color="#6f4224"/></linearGradient>
      <radialGradient id="qbbfelt" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#fbf2dc"/><stop offset="1" stop-color="#ecd9b0"/></radialGradient>
      <radialGradient id="qbbgold" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#ffc83d"/><stop offset="1" stop-color="#c98d00"/></radialGradient>
      <pattern id="qbbdots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="#d8c08c" opacity=".55"/></pattern>
      ${pawns.map((p, i) => `<radialGradient id="qbbp${i}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${shade(p.color, .55)}"/><stop offset=".45" stop-color="${p.color}"/><stop offset="1" stop-color="${shade(p.color, -.45)}"/></radialGradient>`).join("")}</defs>`);
    // Holzrahmen und Spielfläche
    out.push(`<rect width="${W}" height="${H}" rx="34" fill="url(#qbbwood)"/>`);
    for (let i = 0; i < 9; i++) out.push(`<path d="M${(10 + i * W / 9).toFixed(0)} 0 q ${20 + i * 3} ${H / 2} -6 ${H}" stroke="#5c361c" stroke-width="1.4" fill="none" opacity=".25"/>`);
    out.push(`<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="22" fill="url(#qbbfelt)"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="22" fill="url(#qbbdots)"/>
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="17" fill="none" stroke="#c9a24a" stroke-width="2" opacity=".6"/>`);
    // freie Fläche in der Mitte der Spirale: dezenter Schriftzug (nur wenn er hineinpasst)
    if (!L.line) {
      const used = new Set(L.cells.map(([c, r]) => c + ":" + r)), free = [], rowsFree = {};
      for (let r = 0; r < L.rows; r++) for (let c = 0; c < L.cols; c++) if (!used.has(c + ":" + r)) { free.push([c, r]); (rowsFree[r] = rowsFree[r] || []).push(c); }
      if (free.length >= 3) {
        const fx = free.reduce((a, [c]) => a + cx(c), 0) / free.length, fy = free.reduce((a, [, r]) => a + cy(r), 0) / free.length;
        const size = Math.min(30, (Math.max(...Object.values(rowsFree).map((cs) => cs.length)) * P - 30) / (19 * .72));
        if (size >= 13) out.push(`<text x="${fx}" y="${fy}" class="qbb-water" style="font-size:${size.toFixed(1)}px">STUBENMEISTERSCHAFT</text>`);
      }
    }
    // Startfeld und Pfeile (Laufrichtung)
    const [sx, sy] = spots[0];
    out.push(`<rect x="${sx - 52}" y="${sy - 52}" width="104" height="104" rx="22" fill="#fff8e8" stroke="#b08a4e" stroke-width="3" stroke-dasharray="8 6"/><text x="${sx}" y="${sy + 38}" class="qbb-start">START</text>`);
    for (let i = 0; i < spots.length - 1; i++) {
      const [x1, y1] = spots[i], [x2, y2] = spots[i + 1], a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      out.push(`<path transform="translate(${(x1 + x2) / 2} ${(y1 + y2) / 2}) rotate(${a.toFixed(0)})" d="M-5 -6 L4 0 L-5 6" fill="none" stroke="#b08a4e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`);
    }
    // Felder; das letzte ist das goldene Zielfeld mit Pokal
    L.cells.forEach(([c, r], i) => {
      const x = cx(c), y = cy(r), k = i + 1;
      if (k === target) {
        const Z = T + 12;
        out.push(`<rect x="${x - Z / 2 - 6}" y="${y - Z / 2 - 6}" width="${Z + 12}" height="${Z + 12}" rx="${R + 6}" fill="#ffc83d" opacity=".25"/>
          <rect x="${x - Z / 2}" y="${y - Z / 2 + 6}" width="${Z}" height="${Z}" rx="${R + 2}" fill="#a37400"/>
          <rect x="${x - Z / 2}" y="${y - Z / 2}" width="${Z}" height="${Z}" rx="${R + 2}" fill="url(#qbbgold)" stroke="#a37400" stroke-width="3"/>
          <g transform="translate(${x} ${y - 10}) scale(.5)"><path d="M-34 -40 H34 V-18 C34 6 18 20 0 22 C-18 20 -34 6 -34 -18Z" fill="#fff8de" stroke="#8a5a00" stroke-width="5"/>
            <path d="M-34 -32 C-58 -32 -56 0 -30 4 M34 -32 C58 -32 56 0 30 4" fill="none" stroke="#8a5a00" stroke-width="6"/>
            <path d="M-8 22 H8 V34 H20 V44 H-20 V34 H-8Z" fill="#fff8de" stroke="#8a5a00" stroke-width="5"/><path d="${star(0, -12, 12, 5)}" fill="#ffc83d" stroke="#8a5a00" stroke-width="2.5"/></g>
          <text x="${x}" y="${y + 30}" class="qbb-goal">ZIEL</text>`);
        return;
      }
      const col = TILE[i % TILE.length];
      out.push(`<rect x="${x - T / 2}" y="${y - T / 2 + 5}" width="${T}" height="${T}" rx="${R}" fill="${shade(col, -.35)}"/><rect x="${x - T / 2}" y="${y - T / 2}" width="${T}" height="${T}" rx="${R}" fill="${col}"/>
        <rect x="${x - T / 2 + 6}" y="${y - T / 2 + 5}" width="${T - 12}" height="${T / 2 - 8}" rx="${R - 4}" fill="#fff" opacity=".18"/><text x="${x}" y="${y + 1}" class="qbb-num">${k}</text>`);
    });
    // Spielkegel (Position setzt die Animation bzw. qbPlace)
    out.push(`<g class="qbb-pawns">${pawns.map((p, i) => `<g class="qbb-pawn" data-id="${esc(p.id)}">
        <ellipse cy="20" rx="19" ry="6" fill="#000" opacity=".28"/>
        <path d="M-17 18 C-17 6 -9 0 -8 -6 L8 -6 C9 0 17 6 17 18 C10 23 -10 23 -17 18Z" fill="url(#qbbp${i})" stroke="${shade(p.color, -.55)}" stroke-width="1.5"/>
        <ellipse cy="-7" rx="11" ry="4" fill="${shade(p.color, -.2)}"/><circle cy="-19" r="13" fill="url(#qbbp${i})" stroke="${shade(p.color, -.55)}" stroke-width="1.5"/>
        <text y="-19" class="qbb-ini">${esc((p.name[0] || "?").toUpperCase())}</text>
        <path class="qbb-crown" transform="translate(0 -40)" d="M-12 6 L-14 -6 L-6 0 L0 -10 L6 0 L14 -6 L12 6Z" fill="#ffc83d" stroke="#8a5a00" stroke-width="1.5" stroke-linejoin="round" opacity="0"/>
        <g class="qbb-bub" opacity="0"><rect x="-52" y="-86" width="104" height="30" rx="15"/><text y="-71"></text></g></g>`).join("")}</g></svg>`);
    return out.join("");
  }
  // mehrere Kegel auf einem Feld: kleines Raster
  function pawnXY(pos, id, at) {
    const same = Object.keys(at).filter((k) => at[k] === pos).sort(), idx = same.indexOf(id), n = same.length, [x, y] = board.spots[Math.min(pos, board.spots.length - 1)];
    if (n <= 1) return [x, y];
    const per = n <= 4 ? 2 : 3, gap = n <= 4 ? 24 : 20, row = Math.floor(idx / per), col = idx % per, rowsN = Math.ceil(n / per), inRow = Math.min(per, n - row * per);
    return [x + (col - (inRow - 1) / 2) * gap, y + (row - (rowsN - 1) / 2) * gap * .8];
  }

  // ---------- Vorrücken nach einer Etappe: nacheinander, vom Letzten bis zum Etappensieger ----------
  const HOP = 260, PRE = 700, BUB = 420, GAP = 320, ZERO = 650;
  function qbSchedule(q, ids) {
    const last = q.stages[q.stages.length - 1], to = {}, from = {};
    ids.forEach((id) => { to[id] = Math.min(q.target, q.pts[id] || 0); from[id] = Math.min(q.target, (q.pts[id] || 0) - (last && last.res[id] ? last.res[id].pts : 0)); });
    if (!last) return { from: to, to, moves: [], events: [], dur: 0 };
    const order = ids.filter((id) => last.res[id]).sort((a, b) => (last.res[b].place - last.res[a].place) || (a < b ? -1 : 1));
    const moves = [], events = [], at = { ...from };
    let t = PRE;
    for (const id of order) {
      const r = last.res[id], steps = to[id] - from[id];
      if (from[id] >= q.target) continue;
      if (!steps) { events.push({ t, id, bub: "±0", ms: 900 }); t += ZERO; continue; }
      events.push({ t, id, bub: `+${r.pts}${r.joker ? " 🃏" : ""}`, ms: 900 });
      const hop0 = t + BUB;
      // überholt: wer beim Losgehen vor ihm stand und nach diesem Zug hinter ihm
      const passed = ids.filter((j) => j !== id && at[j] > from[id] && at[j] < to[id]);
      if (passed.length) { const k = Math.max(...passed.map((j) => at[j])) - from[id] + 1; events.push({ t: hop0 + k * HOP, id, bub: "überholt!", ms: 1100, whoosh: true }); }
      for (let s = 1; s <= steps; s++) events.push({ t: hop0 + s * HOP, hop: true });
      moves.push({ id, from: from[id], to: to[id], hop0 });
      at[id] = to[id];
      t = hop0 + steps * HOP + GAP;
    }
    return { from, to, moves, events, dur: t };
  }
  // Stand der Figuren zum Zeitpunkt e (ms seit Beginn): ganze Felder plus der laufende Sprung
  function posAt(sch, e) {
    const at = { ...sch.from }, fly = {};
    sch.moves.forEach((m) => {
      const k = (e - m.hop0) / HOP;
      if (k <= 0) return;
      const done = Math.min(m.to - m.from, Math.floor(k));
      at[m.id] = m.from + done;
      if (done < m.to - m.from) { at[m.id] += 1; fly[m.id] = { prev: m.from + done, f: k - Math.floor(k) }; } // im Sprung: zählt schon fürs Zielfeld
    });
    return { at, fly };
  }
  let qbAnimKey = null, qbAnimT = 0, qbRaf = 0, qbLastE = -1;
  function qbPlace(svg, sch, e, live) {
    const { at, fly } = posAt(sch, e), max = Math.max(...Object.values(at));
    svg.querySelectorAll(".qbb-pawn").forEach((g) => {
      const id = g.dataset.id; if (at[id] == null) return;
      let [x, y] = pawnXY(at[id], id, at), sc = "";
      if (fly[id]) { const a = { ...at, [id]: fly[id].prev }, [x0, y0] = pawnXY(fly[id].prev, id, a), f = fly[id].f, ez = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        x = x0 + (x - x0) * ez; y = y0 + (y - y0) * ez - Math.sin(Math.PI * f) * 34; const sq = 1 - Math.sin(Math.PI * f) * .06; sc = ` scale(${(2 - sq).toFixed(3)} ${sq.toFixed(3)})`;
        g.parentNode.appendChild(g); }
      g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})${sc}`);
      g.querySelector(".qbb-crown").setAttribute("opacity", max > 0 && at[id] === max ? 1 : 0);
      const ev = sch.events.filter((x2) => x2.id === id && x2.bub && e >= x2.t && e < x2.t + x2.ms).pop(), bub = g.querySelector(".qbb-bub");
      bub.setAttribute("opacity", ev ? 1 : 0); if (ev) bub.querySelector("text").textContent = ev.bub;
    });
    // Töne nur, während man zuschaut (nicht beim Nachholen nach einem Neuzeichnen)
    if (live && qbLastE >= 0) sch.events.forEach((x2) => { if (x2.t > qbLastE && x2.t <= e) { if (x2.whoosh) sfx.whoosh(); else if (x2.hop && sfx.tick) sfx.tick(); } });
    qbLastE = e;
  }
  function qbAnimate(q, ids) {
    cancelAnimationFrame(qbRaf);
    const svg = app.querySelector(".qbb-svg"); if (!svg) return;
    const sch = qbSchedule(q, ids);
    const end = sch.dur + 1200; // bis auch die letzte Sprechblase wieder verschwunden ist
    const run = () => { const e = qbAnimT ? Date.now() - qbAnimT : 1e9; qbPlace(svg, sch, Math.min(e, 1e9), true); if (e < end && svg.isConnected) qbRaf = requestAnimationFrame(run); };
    qbLastE = qbAnimT ? Math.max(-1, Date.now() - qbAnimT - 1) : -1;
    run();
  }
  // wie lange die Figuren noch laufen (für Fanfare und Siegerbanner am Schluss)
  function qbAnimLeft() {
    const v = G.view, q = v && v.qb; if (!q || !q.stages.length) return 0;
    const sch = qbSchedule(q, v.players.map((p) => p.id)), k = v.code + ":" + q.stages.length;
    return qbAnimKey === k && qbAnimT ? Math.max(0, sch.dur - (Date.now() - qbAnimT)) : sch.dur;
  }

  // ---------- Tourenplan: gespielte Etappen (die letzten drei), die nächste und zwei kommende – das Ende ist offen ----------
  function planHtml(q, nameOf, colorOf) {
    const cur = q.step === "final" ? q.stages.length : q.idx + 1, from = Math.max(0, cur - 3), to = q.step === "final" ? cur - 1 : Math.min(q.plan.length - 1, cur + 2), out = [];
    if (from > 0) out.push(`<div class="qbt-stop done more"><div class="qbt-card">…</div><span class="nm">${from} ${from === 1 ? "Etappe" : "Etappen"} vorher</span><span class="who"></span></div>`);
    for (let i = from; i <= to; i++) {
      const g = qbGame(q.plan[i]), x = q.stages[i], done = !!x;
      const w = done ? Object.keys(x.res).filter((id) => x.res[id].place === 1) : [];
      out.push(`<div class="qbt-stop ${done ? "done" : ""} ${i === cur && q.step !== "final" ? "now" : ""}" style="${w.length ? `--wc:${colorOf(w[0])}` : ""}">
        <div class="qbt-card"><span class="gt-icon">${g.icon}</span><span class="tag">${done ? "✓" : i + 1}</span></div>
        <span class="nm">${esc(g.name)}</span><span class="who">${done ? "🏆 " + w.map((id) => esc(nameOf(id))).join(" & ") : i === cur ? "als Nächstes" : ""}</span></div>`);
    }
    out.push(`<div class="qbt-stop goal ${q.step === "final" ? "now" : ""}"><div class="qbt-card">🏆</div><span class="nm">Ziel: Feld ${q.target}</span><span class="who">${q.step === "final" ? "erreicht!" : "wer zuerst da ist"}</span></div>`);
    return `<div class="qbt">${out.join("")}</div>`;
  }

  let qbDemo = { key: null, t0: 0 }, qbModal = { key: null, hidden: false };
  // Fenster ein-/ausblenden ohne alles neu zu zeichnen (die Vorführung läuft weiter)
  // (ohne Animation: sofort sichtbar bzw. weg – zuverlässig in jedem Browser)
  function qbModalShow(show) {
    qbModal.hidden = !show; qbModal.showAt = 0;
    const m = app.querySelector(".qbm"), o = app.querySelector(".qbm-open");
    if (m) { m.classList.remove("anim"); m.classList.toggle("off", !show); }
    if (o) o.classList.toggle("off", show);
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && G.view && G.view.phase === "querbeet" && app.querySelector(".qbm:not(.off)")) qbModalShow(false); });
  function renderQuerbeet() {
    const v = G.view, q = v.qb;
    if (!q) return;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const medal = ["🥇", "🥈", "🥉"];
    const ids = v.players.map((p) => p.id), posOf = (id) => Math.min(q.target, q.pts[id] || 0);
    const ranking = v.players.slice().sort((a, b) => (q.pts[b.id] || 0) - (q.pts[a.id] || 0));
    // Animation einmal je Etappe starten (Neuzeichnen setzt fort, nach Neuladen sofort Endstand)
    {
      const ak = v.code + ":" + q.stages.length;
      if (ak !== qbAnimKey) { qbAnimT = qbAnimKey && q.stages.length && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) ? Date.now() : 0; qbAnimKey = ak; }
    }
    const animLeft = qbAnimT ? Math.max(0, qbSchedule(q, ids).dur - (Date.now() - qbAnimT)) : 0;
    const boardHtml = `<div class="qbb-board">${boardSvg(q.target, v.players.map((p) => ({ id: p.id, name: p.name, color: colorOf(p.id) })))}</div>`;
    const standList = `<div class="panel qbb-stand"><h3>${q.step === "final" ? "Endstand" : "Stand"}</h3>${ranking.map((p) => {
      const place = ranking.findIndex((x) => posOf(x.id) === posOf(p.id)), left = q.target - posOf(p.id);
      return `<div class="qbb-row" style="--pc:${colorOf(p.id)}"><span class="qb-place">${place + 1}.</span><span class="pdot"></span>
        <span class="qb-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}${q.jokerOn && q.step !== "final" && q.joker[p.id] == null ? ` <span class="qb-jk" title="Joker noch nicht eingesetzt">🃏</span>` : ""}
          <small>${left > 0 ? `noch ${left} ${left === 1 ? "Feld" : "Felder"}` : "im Ziel 🏆"}</small><span class="qbb-bar"><i style="width:${Math.round(100 * posOf(p.id) / q.target)}%"></i></span></span><b>${posOf(p.id)}</b></div>`;
    }).join("")}</div>`;
    const last = q.stages[q.stages.length - 1];
    const stageRes = (x, title) => {
      const g = qbGame(x.game);
      const rows = Object.entries(x.res).sort((a, b) => a[1].place - b[1].place);
      return `<div class="panel qb-result" style="--gc:${g.color}"><div class="qb-head"><span class="gt-icon">${g.icon}</span><div><div class="game-label">${title}</div><b>${esc(g.name)}</b></div></div>
        ${rows.map(([id, r]) => `<div class="qb-row" style="--pc:${colorOf(id)}"><span class="qb-place">${medal[r.place - 1] || r.place + "."}</span><span class="pdot"></span>
          <span class="qb-name">${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</span><span class="muted small">${x.game === "bus" ? `${qbFmt(r.score)} Punkte` : `${qbFmt(r.score)} ${x.game === "zehn" || x.game === "hl" || x.game === "land" ? "richtig" : "Punkte"}`}</span><b class="qb-plus ${r.pts ? "" : "zero"}">${r.joker ? `<span class="qb-jk" title="Joker: doppelt">🃏</span>` : ""}${r.pts ? "+" + r.pts : "±0"}</b></div>`).join("")}</div>`;
    };
    // So geht's: drei Schritte (*fett*) + Etappensieg; bei schweren Spielen dazu eine kleine Vorführung
    const bold = (t) => esc(t).replace(/\*([^*]+)\*/g, "<b>$1</b>");
    const howHtml = (n) => n.how ? `<ol class="qbn-steps">${n.how.steps.map((t, i) => `<li><span class="n">${i + 1}</span><span>${bold(t)}</span></li>`).join("")}
        <li class="win"><span class="n">🏆</span><span><b>Etappensieg:</b> ${bold(n.how.win)}</span></li></ol>` : `<p>${esc(n.rule)}</p>`;
    const nextCard = (n) => { const g = qbGame(n.game), jk = qbJokerHtml(q), demo = window.S10Demo && S10Demo.has(n.game);
      return `<div class="panel qb-next ${jk ? "with-joker" : ""} ${demo ? "with-demo" : ""}" style="--gc:${g.color}" data-demo="${demo ? esc(n.game) : ""}">
        <div class="qbn-head"><div class="game-label">Etappe ${q.idx + 2}${q.skipped ? `<span class="qb-skipped"> · statt ${esc(q.skipped)}</span>` : ""}</div>
          <div class="qb-head"><span class="gt-icon big">${g.icon}</span><div><b class="qb-gname">${esc(n.name)}</b><div class="muted small">${esc(n.detail)}</div></div></div></div>
        ${demo ? `<div class="qbn-demo">${S10Demo.html()}</div>` : ""}
        <div class="qbn-info">${howHtml(n)}</div>
        ${jk}<div class="qbn-act">${qbReadyBtnHtml(q, "Bereit")}${G.isHost ? `<button type="button" class="btn ghost qb-skip" data-qbskip>🔄 Anderes Spiel</button>` : ""}</div></div>`; };
    let main = "";
    // Die nächste Etappe kommt als Fenster über dem Spielbrett – nach einer Etappe erst, wenn die Figuren gezogen haben.
    // Schließen (✕, „Spielbrett ansehen“, Esc) zeigt das Brett; „Nächste Etappe“ holt das Fenster zurück.
    const mk = v.code + ":" + q.idx;
    if (qbModal.key !== mk) qbModal = { key: mk, hidden: false, showAt: Date.now() + animLeft };
    // Einblenden nur beim ersten Erscheinen (nach dem Ziehen der Figuren); danach steht das Fenster einfach da
    const wait = qbModal.showAt - Date.now(), anim = wait > -400 ? "anim" : "";
    const modal = (n) => { const g = qbGame(n.game);
      return `<div class="qbm ${anim} ${qbModal.hidden ? "off" : ""}" style="--d:${Math.max(0, wait)}ms" role="dialog" aria-modal="true" aria-label="Nächste Etappe: ${esc(n.name)}">
          <div class="qbm-back" data-qbmclose></div>
          <div class="qbm-win">${nextCard(n)}<button type="button" class="qbm-x" data-qbmclose aria-label="Fenster schließen und Spielbrett ansehen">✕</button>
            <button type="button" class="btn ghost sm qbm-peek" data-qbmclose>Spielbrett ansehen</button></div></div>
        <button type="button" class="btn primary qbm-open ${qbModal.hidden ? "" : "off"}" data-qbmopen style="--gc:${g.color}"><span class="gt-icon xs" aria-hidden="true">${g.icon}</span> Nächste Etappe: ${esc(n.name)}</button>`; };
    if (q.step === "intro") {
      main = `${planHtml(q, nameOf, colorOf)}${boardHtml}${modal(q.next)}`;
    } else if (q.step === "break") {
      main = `${planHtml(q, nameOf, colorOf)}<div class="qbb-grid ${boardGeom(q.target).L.line ? "line" : ""}">${boardHtml}<div class="qbb-side">${stageRes(last, `Ergebnis Etappe ${q.stages.length}`)}${standList}</div></div>${modal(q.next)}`;
    } else {
      const w = ranking.filter((p) => (q.winners || []).includes(p.id));
      main = `<div class="banner win qbb-winner" style="--d:${animLeft}ms">${animLeft ? `<div class="qbb-pre">🎲 Die Figuren ziehen … wer ist zuerst im Ziel?</div>` : ""}<div class="qbb-post"><div class="trophy">🏆</div><b>${w.map((p) => esc(p.name)).join(" & ")} ${w.length > 1 ? "sind Stubenmeister" : "ist Stubenmeister" + (/a$/i.test(w[0] ? w[0].name : "") ? "in" : "")}!</b>
          <div class="muted small">nach ${q.stages.length} ${q.stages.length === 1 ? "Etappe" : "Etappen"} im Ziel</div>
          <div class="banner-actions">${G.isHost ? `<button id="qb-restart" class="btn primary">Neue Meisterschaft</button><button id="toLobby" class="btn ghost">Zur Lobby</button>` : `<span class="muted">Der Gastgeber entscheidet, wie es weitergeht.</span>`}</div></div></div>
        ${planHtml(q, nameOf, colorOf)}<div class="qbb-grid ${boardGeom(q.target).L.line ? "line" : ""}">${boardHtml}<div class="qbb-side qbb-late" style="--d:${animLeft}ms">${standList}${stageRes(last, `Letzte Etappe · ${q.stages.length}`)}</div></div>
        ${(q.titles || []).length ? `<div class="panel qb-titles qbb-late" style="--d:${animLeft}ms"><h3>Auszeichnungen</h3><div class="qb-tgrid">${q.titles.map((t) => `<div class="qb-title"><b>${esc(t.name)}</b>
          <span>${t.ids.map((id) => `<span style="color:${colorOf(id)}">${esc(nameOf(id))}</span>`).join(" & ")}</span><small class="muted">${esc(t.why)}</small></div>`).join("")}</div></div>` : ""}
        <div class="panel qb-table"><h3>Alle Etappen</h3><div class="qb-scroll"><table><thead><tr><th></th>${q.stages.map((x, i) => `<th title="${esc(qbGame(x.game).name)}"><span class="gt-icon xs">${qbGame(x.game).icon}</span><small>${i + 1}</small></th>`).join("")}<th>Σ</th></tr></thead>
          <tbody>${ranking.map((p) => `<tr><td style="--pc:${colorOf(p.id)}"><span class="pdot"></span> ${esc(p.name)}</td>${q.stages.map((x) => `<td>${x.res[p.id] ? x.res[p.id].pts : "–"}</td>`).join("")}<td><b>${q.pts[p.id] || 0}</b></td></tr>`).join("")}</tbody></table></div></div>`;
    }
    app.innerHTML = `
      <main class="screen game querbeet">
        <header class="top topbar">
          ${headBrandHtml("querbeet")}
          <div class="meta">${q.step === "final" ? "Siegerehrung" : q.step === "intro" ? `Ziel: Feld ${q.target}` : `Nach Etappe ${q.stages.length} · Ziel Feld ${q.target}`}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="qb-main">${main}</section>
      </main>`;
    qbAnimate(q, ids);
    // Vorführung: läuft je Etappe ab dem ersten Zeigen durch, Neuzeichnen setzt an derselben Stelle fort
    const dmCard = app.querySelector(".qb-next[data-demo]:not([data-demo=''])");
    if (dmCard) {
      const dk = v.code + ":" + q.idx + ":" + dmCard.dataset.demo;
      if (qbDemo.key !== dk) qbDemo = { key: dk, t0: Date.now() };
      const go = () => S10Demo.mount(dmCard.querySelector(".qbn-demo"), dmCard.dataset.demo, qbDemo.t0);
      go();
      const rb = dmCard.querySelector(".dm-replay"); if (rb) rb.onclick = () => { qbDemo.t0 = Date.now(); go(); };
    }
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#qb-restart", () => send({ type: "qbRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-qb]").forEach((b) => b.onclick = () => send({ type: b.dataset.qb === "go" ? "qbGo" : "qbReady" }));
    app.querySelectorAll("[data-qbmclose]").forEach((b) => b.onclick = () => qbModalShow(false));
    app.querySelectorAll("[data-qbmopen]").forEach((b) => b.onclick = () => qbModalShow(true));
    app.querySelectorAll("[data-qbskip]").forEach((b) => b.onclick = () => send({ type: "qbSkip" }));
    app.querySelectorAll("[data-qbjoker]").forEach((b) => b.onclick = () => send({ type: "qbJoker", on: b.dataset.qbjoker === "on" }));
  }


  return {
    qbBarRender,
    renderQuerbeet,
    qbAnimLeft,
  };
});
