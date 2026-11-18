// Ansicht: Almsommer (Roll & Write). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, confetti, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, toast, topActionsHtml
  } = G;
  const ALM = window.S10Alm;
  const NAMES = ALM.NAMES;
  const ICON = { g: "🌿", w: "🌲", f: "🪨", b: "💧", sun: "☀️" };

  // eigene Auswahl in der laufenden Woche (nur lokal, bis „Ankreuzen“)
  let almSel = { key: null, di: null, terrain: null, cells: [] };
  let almSent = null;     // Woche, für die schon abgeschickt wurde
  let almNewsSeen = null; // zuletzt gemeldete Erstbonus-Nachricht
  let almLook = null;     // welches Tal groß gezeigt wird (eigenes oder angetipptes)
  let almConfetti = null;

  // ---------- Feldgrafiken: illustrierte Wanderkarte (SVG, 40 × 40) ----------
  // Je Gelände drei Varianten (nach Feldnummer gewählt), damit das Tal nicht wie Tapete aussieht.
  // Details bleiben kontrastarm, damit Kreuze und Punktabzeichen darüber gut lesbar sind.
  const svg40 = (inner, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${inner}</svg>`;
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const tuft = (x, y, c = "#5d9c3f") => `<path d="M${x} ${y} l-1.6 -4.2 M${x} ${y} l0 -5 M${x} ${y} l1.6 -4.2" stroke="${c}" stroke-width="1.2" stroke-linecap="round" fill="none"/>`;
  const flower = (x, y, petal) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<circle cx="0" cy="-1.5" r="1.1" fill="${petal}" transform="rotate(${r})"/>`).join("")}<circle r=".9" fill="#ffd34d"/></g>`;
  const spruce = (x, y, h) => { // Fichte mit Licht- (links) und Schattenseite (rechts)
    const w = h * 0.62, t = (k) => y - h + k * h * 0.3;
    const tier = (k, ww) => `<path d="M${x} ${t(k)} L${x - ww / 2} ${t(k) + h * 0.42} H${x + ww / 2}Z" fill="#1f5c36"/><path d="M${x} ${t(k)} L${x - ww / 2} ${t(k) + h * 0.42} H${x}Z" fill="#3d8f55"/>`;
    return `<rect x="${x - 0.9}" y="${y - h * 0.12}" width="1.8" height="${h * 0.14}" fill="#5b3a22"/>${tier(0, w * 0.62)}${tier(1, w * 0.82)}${tier(2, w)}`;
  };
  const rock = (pts, light, dark) => { // Brocken: helle und dunkle Facette
    const [a, b, c, d] = pts;
    return `<path d="M${a} L${b} L${c}Z" fill="${light}"/><path d="M${a} L${c} L${d}Z" fill="${dark}"/>`;
  };
  const TILE_SVG = {
    g: [
      svg40(`<rect width="40" height="40" fill="url(#gw)"/><circle cx="7" cy="9" r=".8" fill="#c4ec9c"/><circle cx="31" cy="27" r=".8" fill="#c4ec9c"/>${tuft(11, 32)}${tuft(29, 15)}${flower(27, 31, "#fff")}`, grad("gw", "#a2dc78", "#7ec25a")),
      svg40(`<rect width="40" height="40" fill="url(#gw)"/><circle cx="20" cy="6" r=".8" fill="#c4ec9c"/>${tuft(8, 17)}${tuft(31, 34)}${tuft(22, 26, "#6aab4a")}${flower(12, 30, "#f2a7d8")}`, grad("gw", "#9fda74", "#7bbf57")),
      svg40(`<rect width="40" height="40" fill="url(#gw)"/><circle cx="33" cy="8" r=".8" fill="#c4ec9c"/><circle cx="6" cy="28" r=".8" fill="#c4ec9c"/>${tuft(18, 35)}${tuft(33, 22)}${flower(10, 12, "#fff")}${flower(24, 16, "#b9a7ff")}`, grad("gw", "#a4dd7b", "#80c45c")),
    ],
    w: [
      svg40(`<rect width="40" height="40" fill="url(#ww)"/>${spruce(12, 30, 20)}${spruce(28, 37, 17)}`, grad("ww", "#4b9a5f", "#2d6d43")),
      svg40(`<rect width="40" height="40" fill="url(#ww)"/>${spruce(9, 22, 14)}${spruce(22, 33, 18)}${spruce(33, 21, 13)}`, grad("ww", "#489559", "#2b6940")),
      svg40(`<rect width="40" height="40" fill="url(#ww)"/>${spruce(25, 32, 24)}${spruce(9, 37, 14)}`, grad("ww", "#4d9c61", "#2e6f45")),
    ],
    f: [
      svg40(`<rect width="40" height="40" fill="url(#fw)"/>${rock(["8 30", "15 16", "24 30", "16 33"], "#c8c6d1", "#7d7b88")}${rock(["24 22", "30 12", "36 24", "29 26"], "#bdbbc7", "#73717e")}<circle cx="6" cy="10" r="1" fill="#7f7d8a"/><circle cx="33" cy="34" r="1.2" fill="#7f7d8a"/>`, grad("fw", "#aeacb9", "#8d8b99")),
      svg40(`<rect width="40" height="40" fill="url(#fw)"/>${rock(["10 24", "20 9", "31 26", "19 29"], "#c9c7d2", "#7a7885")}<circle cx="9" cy="34" r="1.1" fill="#7f7d8a"/><circle cx="14" cy="36" r=".8" fill="#7f7d8a"/><circle cx="31" cy="35" r="1" fill="#7f7d8a"/>`, grad("fw", "#acaab7", "#8b8997")),
      svg40(`<rect width="40" height="40" fill="url(#fw)"/>${rock(["4 20", "10 10", "17 21", "10 23"], "#c4c2cd", "#777582")}${rock(["17 34", "25 20", "35 35", "25 37"], "#c9c7d2", "#7c7a87")}<circle cx="31" cy="9" r="1" fill="#7f7d8a"/>`, grad("fw", "#afadba", "#8e8c9a")),
    ],
    b: [0, 1, 2].map((k) => svg40(`<rect width="40" height="40" fill="url(#bw)"/>${[6 + k * 2, 17 + k * 2, 28 + k * 2].map((y, j) =>
      `<path d="M-4 ${y} q5 -3.2 10 0 t10 0 t10 0 t10 0 t10 0" stroke="${j === 1 ? "#d7f0ff" : "#a8dcff"}" stroke-width="${j === 1 ? 1.6 : 1.2}" fill="none" stroke-linecap="round" opacity=".85"/>`).join("")}
      <circle cx="${12 + k * 9}" cy="${11 + k * 3}" r=".9" fill="#fff" opacity=".8"/><circle cx="${30 - k * 6}" cy="${33 - k * 2}" r=".7" fill="#fff" opacity=".7"/>`, grad("bw", "#5dbcf2", "#3a93d6"))),
  };
  // Sonderfelder als eigene Zeichnung im Feld (Hof, Almhütte, Gipfel mit Kreuz)
  const SYMBOL_SVG = {
    hof: `<svg viewBox="0 0 40 40" class="asvg"><ellipse cx="20" cy="35" rx="15" ry="2.5" fill="#000" opacity=".15"/>
      <rect x="9" y="22" width="22" height="12" fill="#f6efe2" stroke="#7a6a52" stroke-width=".8"/>
      <rect x="8" y="14.5" width="24" height="8.5" fill="#9a6235" stroke="#5e3b1f" stroke-width=".8"/><path d="M8 19 H32" stroke="#6d4325" stroke-width="1"/>
      <path d="M4 15.5 L20 6.5 L36 15.5Z" fill="#6a4a37" stroke="#3e2a1d" stroke-width=".9" stroke-linejoin="round"/>
      <rect x="12" y="25" width="4" height="4" fill="#3a4a66"/><rect x="24" y="25" width="4" height="4" fill="#3a4a66"/>
      <rect x="18" y="27" width="4" height="7" rx="1" fill="#6d4325"/><circle cx="13" cy="30" r=".9" fill="#e2453b"/><circle cx="15" cy="30" r=".9" fill="#e2453b"/><circle cx="25" cy="30" r=".9" fill="#e2453b"/><circle cx="27" cy="30" r=".9" fill="#e2453b"/></svg>`,
    hut: `<svg viewBox="0 0 40 40" class="asvg"><ellipse cx="20" cy="34" rx="12" ry="2.2" fill="#000" opacity=".15"/>
      <rect x="10" y="20" width="20" height="13" fill="#a8703f" stroke="#5e3b1f" stroke-width=".8"/>
      ${[23.5, 27, 30.5].map((y) => `<path d="M10 ${y} H30" stroke="#7d4e28" stroke-width=".8"/>`).join("")}
      <path d="M7 21 L20 11 L33 21Z" fill="#7b6a5d" stroke="#3e2f25" stroke-width=".9" stroke-linejoin="round"/>
      <circle cx="15" cy="17.5" r="1.2" fill="#b3aca4"/><circle cx="24" cy="16.5" r="1.1" fill="#b3aca4"/>
      <rect x="17.5" y="25" width="5" height="8" fill="#4a2f1a"/><rect x="24.5" y="23.5" width="3" height="3" fill="#ffd34d" opacity=".9"/></svg>`,
    peak: `<svg viewBox="0 0 40 40" class="asvg"><path d="M3 35 L17 12 L22 19 L26 14 L38 35Z" fill="#7f7d8b"/><path d="M17 12 L22 19 L19 35 H3Z" fill="#a9a7b5"/>
      <path d="M17 12 L13.2 18.3 L16 17.2 L18 19 L20.3 16.4Z" fill="#fff"/><path d="M26 14 L23.6 18 L25.5 17.3 L27.8 17.8Z" fill="#fff"/>
      <path d="M17 3.5 V12 M14.4 6.2 H19.6" stroke="#5b3a22" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  };
  // Hintergrundbilder einmal als CSS anlegen: .acell.g.v0 … .acell.b.v2
  (() => {
    const el = document.createElement("style"); el.id = "alm-tiles";
    el.textContent = Object.entries(TILE_SVG).map(([t, vs]) => vs.map((x, k) =>
      `.acell.${t}.v${k}{background-image:url("data:image/svg+xml,${encodeURIComponent(x.replace(/\s+/g, " "))}");background-size:cover}`).join("")).join("");
    document.head.appendChild(el);
  })();
  const variant = (i) => (i * 7 + Math.floor(i / 11) * 3) % 3;
  // Punktabzeichen einer Fläche: erstes Feld ohne Zeichnung (Hof, Hütte, Gipfel bleiben frei sichtbar)
  const BADGE_CELL = Object.fromEntries(Object.entries(ALM.REGIONS).map(([k, cs]) =>
    [k, cs.find((i) => !ALM.HUTS.includes(i) && !ALM.PEAKS.includes(i) && i !== ALM.START) ?? cs[0]]));
  const rotated = () => innerWidth < 560 && innerHeight > innerWidth;

  // Tal als Raster; opts: { interactive, marked, sel, hintFrom, small }
  function boardHtml(v, st, marked, o) {
    const done = new Set(ALM.doneRegions(marked).flatMap((k) => ALM.REGIONS[k]));
    const soon = o.soon || [];
    const rot = !o.small && rotated();
    const order = [];
    if (!rot) for (let i = 0; i < ALM.TERRAIN.length; i++) order.push(i);
    else for (let c = 0; c < ALM.COLS; c++) for (let r = ALM.ROWS - 1; r >= 0; r--) order.push(r * ALM.COLS + c);
    const ROT = { bt: "br", bb: "bl", bl: "bt", br: "bb" };
    const cells = order.map((i) => {
      const ter = ALM.TERRAIN[i], c = i % ALM.COLS, r = Math.floor(i / ALM.COLS), k = ALM.REGION[i];
      const sym = i === ALM.START ? "🏡" : ALM.HUTS.includes(i) ? "🏠" : ALM.PEAKS.includes(i) ? "⛰️" : "";
      const symSvg = i === ALM.START ? SYMBOL_SVG.hof : ALM.HUTS.includes(i) ? SYMBOL_SVG.hut : ALM.PEAKS.includes(i) ? SYMBOL_SVG.peak : "";
      const fresh = o.fresh && o.fresh.includes(i);
      if (o.small) return `<i class="ac ${ter} ${marked.has(i) && i !== ALM.START ? "x" : ""} ${fresh ? "new" : ""} ${done.has(i) ? "done" : ""}"></i>`;
      const edge = (j) => ALM.TERRAIN[j] === ter && ALM.REGION[j] !== k;
      const edges = [r > 0 && edge(i - ALM.COLS) ? "bt" : "", r < ALM.ROWS - 1 && edge(i + ALM.COLS) ? "bb" : "",
        c > 0 && edge(i - 1) ? "bl" : "", c < ALM.COLS - 1 && edge(i + 1) ? "br" : ""].filter(Boolean).map((e) => (rot ? ROT[e] : e)).join(" ");
      const isMarked = marked.has(i), chosen = o.sel && o.sel.includes(i);
      const can = o.interactive && !isMarked && ter === o.terrain;
      const hint = can && !o.sel.length && ALM.neighbors(i).some((j) => marked.has(j));
      const first = BADGE_CELL[k] === i;
      let badge = "";
      if (first) {
        const cl = st.claimed[k], race = ALM.SPECIAL.includes(k);
        const mine = cl && cl.ids.includes(G.myId);
        const flag = cl ? `<b class="ab-flag" title="Erstbonus: ${esc(cl.ids.map((id) => nameOf(v, id)).join(" & "))}">${mine ? "🏆" : "🚩"}</b>` : "";
        badge = `<span class="ab ${done.has(i) ? "full" : soon.includes(k) ? "soon" : ""}" title="${race && !cl ? `Wer sie als Erster fertig hat: +${ALM.BONUS.first}` : ""}">${done.has(i) ? "✓" : ""}${ALM.regionValue(k)}${race && !cl ? `<small>+${ALM.BONUS.first}</small>` : ""}${flag}</span>`;
      }
      const name = `${String.fromCharCode(65 + c)}${r + 1} · ${NAMES[ter]}${sym === "🏠" ? " · Hütte" : sym === "⛰️" ? " · Gipfel" : ""}`;
      return `<div class="acell ${ter} v${variant(i)} ${edges} ${isMarked && i !== ALM.START ? "x" : ""} ${fresh ? "new" : ""} ${done.has(i) ? "done" : ""} ${can ? "can" : ""} ${hint ? "hint" : ""} ${chosen ? "sel" : ""}" data-ai="${i}" title="${name}">${badge}${symSvg ? `<span class="as">${symSvg}</span>` : ""}</div>`;
    }).join("");
    const cols = o.small ? ALM.COLS : rot ? ALM.ROWS : ALM.COLS;
    return `<div class="${o.small ? "alm-mini" : "alm-board"}" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${cells}</div>`
      + (o.small ? "" : `<div class="alm-coords">${rot ? Array.from({ length: ALM.ROWS }, (_, k) => `<span>${ALM.ROWS - k}</span>`).join("") : Array.from({ length: ALM.COLS }, (_, c) => `<span>${String.fromCharCode(65 + c)}</span>`).join("")}</div>
        ${rot ? `<p class="muted small alm-rot">Das Tal ist gedreht: die Gipfel sind rechts.</p>` : ""}`);
  }
  const nameOf = (v, id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
  const colorOf = (v, id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];

  function renderAlm() {
    const v = G.view, st = v.alm;
    if (!st) return;
    const seated = st.seats.includes(G.myId);
    const key = v.code + ":" + st.week + ":" + st.step;
    if (almSel.key !== key) almSel = { key, di: null, terrain: null, cells: [] };
    if (st.step === "play" && almSent && almSent !== key) almSent = null;
    const iDone = seated && (st.done.includes(G.myId) || almSent === key);
    // Kreuze der laufenden Woche: die der anderen erst sehen, wenn der eigene Zug gemacht ist (Zuschauer sehen alles)
    const reveal = !seated || st.done.includes(G.myId) || st.step === "final";
    const pend = (id) => (reveal || id === G.myId ? (st.pending && st.pending[id]) || [] : []);
    const boardOf = (id) => new Set((st.boards[id] || []).concat(pend(id)));
    const pts = (id) => (reveal ? st.totalsLive || st.totals : st.totals)[id] || 0;
    // neue Erstbonus-Meldungen kurz einblenden (nicht beim ersten Anzeigen)
    const last = st.news[st.news.length - 1], lastKey = last ? last.week + ":" + last.k : "";
    if (almNewsSeen !== null && lastKey && lastKey !== almNewsSeen) {
      st.news.filter((n) => n.week === last.week).forEach((n) => {
        const kind = ALM.REGIONS[n.k].some((i) => ALM.PEAKS.includes(i)) ? "⛰️ Gipfelfläche" : "🏠 Hüttenfläche";
        const who = n.ids.map((id) => (id === G.myId ? "Du" : nameOf(v, id))).join(" & ");
        toast(`${kind}: ${who} ${n.ids.length > 1 || n.ids[0] === G.myId ? "wart" : "war"} zuerst fertig – +${ALM.BONUS.first}!`.replace("Du wart", "Du warst"));
      });
    }
    almNewsSeen = lastKey;

    // Spielerleiste: Punkte und wer diese Woche schon fertig ist
    const chips = st.seats.map((id) => `<span class="geo-score ${st.done.includes(id) ? "done" : ""}" style="--pc:${colorOf(v, id)}">
        <span class="pdot ${(v.players.find((p) => p.id === id) || {}).connected ? "" : "off"}"></span><span class="geo-score-name">${esc(nameOf(v, id))}${id === G.myId ? " <em>(du)</em>" : ""}</span>
        <b>${pts(id)}</b>${st.step === "play" ? `<span class="geo-mark">${st.done.includes(id) ? "✓" : "…"}</span>` : ""}</span>`).join("");
    const stormTrack = st.stormLimit ? `<span class="alm-storms" title="Beim ${st.stormLimit}. Gewitter ist der Sommer vorbei">⚡ ${Array.from({ length: st.stormLimit }, (_, k) => `<i class="${k < st.storms ? "on" : ""}"></i>`).join("")}</span>` : "";

    let main;
    if (st.step === "final") {
      if (almConfetti !== key) { almConfetti = key; if (st.winners && st.winners.includes(G.myId)) confetti(); }
      const rank = st.seats.slice().sort((a, b) => (st.totals[b] || 0) - (st.totals[a] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy">🏔️</div><b>${st.endReason === "storm" ? "Ein Unwetter beendet den Sommer!" : "Der Sommer ist vorbei!"}</b>
          <div>${st.winners.map((id) => esc(nameOf(v, id))).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"} mit ${st.totals[st.winners[0]]} Punkten.</div>
          <div class="banner-actions"><button id="alm-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="alm-final">${rank.map((id, i) => `<div class="alm-fp" style="--pc:${colorOf(v, id)}">
            <div class="alm-fh"><span>${(() => { const place = rank.filter((x) => (st.totals[x] || 0) > (st.totals[id] || 0)).length; return medal[place] || place + 1 + "."; })()}</span><b>${esc(nameOf(v, id))}${id === G.myId ? " (du)" : ""}</b><b class="alm-ft">${st.totals[id]}</b></div>
            ${boardHtml(v, st, new Set(st.boards[id]), { small: true })}
            <div class="muted small">${ALM.doneRegions(new Set(st.boards[id])).length} Flächen${st.extra[id] ? ` · Erstboni +${st.extra[id]}` : ""}</div></div>`).join("")}</div>`;
    } else {
      // welches Tal groß? eigenes (wenn mitspielend), sonst angetipptes oder das erste
      const lookId = seated && (!almLook || almLook === G.myId) ? G.myId : st.seats.includes(almLook) ? almLook : st.seats[0];
      const mine = lookId === G.myId && seated;
      const marked = boardOf(lookId);
      const d = mine && !iDone && almSel.di != null ? st.dice[almSel.di] : null;
      const terrain = d && !d.storm ? (d.t === "sun" ? almSel.terrain : d.t) : null, max = d && !d.storm ? d.n : 0;
      const err = terrain && almSel.cells.length ? ALM.checkCells(marked, terrain, almSel.cells, max) : null;
      const soon = !err && almSel.cells.length ? Object.keys(ALM.REGIONS).filter((k) => ALM.REGIONS[k].some((i) => almSel.cells.includes(i))
        && ALM.REGIONS[k].every((i) => marked.has(i) || almSel.cells.includes(i))) : [];
      // nach dem Abschicken erscheinen die eigenen Kreuze als normale Kreuze (nicht mehr als Auswahl)
      const board = boardHtml(v, st, marked, { interactive: mine && !iDone && !!terrain, terrain, sel: iDone ? [] : almSel.cells, soon: iDone ? [] : soon, fresh: lookId !== G.myId ? pend(lookId) : [] });

      // Würfel und Aufgabe
      const dieHtml = (x, i) => x.storm ? `<div class="alm-die storm" title="Gewitter – nicht nutzbar"><div class="big">⚡</div><small>Gewitter</small></div>`
        : `<div class="alm-die ${x.t} ${mine && !iDone ? "pick" : ""} ${almSel.di === i && mine ? "on" : ""}" ${mine && !iDone ? `data-adi="${i}"` : ""}><div class="big">${ICON[x.t]}</div><div class="num">${x.n}</div><small>${x.t === "sun" ? "Sonne" : NAMES[x.t]}</small></div>`;
      const stormNow = st.dice.some((x) => x.storm);
      let task = "", msg = "", actions = "";
      if (!seated) task = `<p class="muted">Du schaust zu – tippe unten auf ein Tal, um es groß zu sehen.</p>`;
      else if (iDone) {
        const wait = st.seats.filter((id) => !st.done.includes(id) && (v.players.find((p) => p.id === id) || {}).connected);
        task = `<div class="alm-task">✓ Erledigt – ${wait.length ? `warte auf ${wait.map((id) => esc(nameOf(v, id))).join(", ")} …` : "gleich geht's weiter …"}</div>`;
      } else {
        const sunPick = d && d.t === "sun" ? `<div class="choice alm-sun">${["g", "w", "f", "b"].map((t) => `<button class="btn sm ${almSel.terrain === t ? "on" : ""}" data-asun="${t}">${ICON[t]} ${NAMES[t]}</button>`).join("")}</div>` : "";
        task = terrain ? `${sunPick}<div class="alm-task">Kreuze bis zu ${max} ${max === 1 ? "Feld" : "Felder"} ${NAMES[terrain]} an <span class="muted">(${almSel.cells.length}/${max})</span></div>`
          : d && d.t === "sun" ? `${sunPick}<div class="alm-task">Welches Gelände soll die Sonne sein?</div>` : `<div class="alm-task">Nimm einen Würfel</div>`;
        const pts = soon.reduce((a, k) => a + ALM.regionValue(k), 0), race = soon.filter((k) => ALM.SPECIAL.includes(k) && !st.claimed[k]).length;
        msg = !terrain || !almSel.cells.length ? "" : err ? `<div class="msg err">${esc(err)}</div>`
          : soon.length ? `<div class="msg alm-preview">Damit ${soon.length === 1 ? "wird eine Fläche" : `werden ${soon.length} Flächen`} fertig: +${pts} Punkte${race ? ` (+${race * ALM.BONUS.first}, wenn du diese Woche der/die Erste bist)` : ""}!</div>`
          : `<div class="msg ok">Passt – ankreuzen${almSel.cells.length < max ? " (oder noch mehr Felder wählen)" : ""}!</div>`;
        actions = `<div class="actions"><button class="btn primary" id="alm-go" ${terrain && almSel.cells.length && !err ? "" : "disabled"}>Ankreuzen</button>
          <button class="btn sm" id="alm-clear" ${almSel.cells.length ? "" : "disabled"}>Auswahl löschen</button><button class="btn sm" id="alm-rest">Ruhetag</button></div>`;
      }
      const dice = `<section class="panel alm-dice"><div class="alm-dicerow">${st.dice.map(dieHtml).join("")}</div>
          ${stormNow && st.stormLimit ? `<div class="alm-stormnote">⚡ Gewitter! (${st.storms} von ${st.stormLimit})</div>` : ""}${task}${msg}${actions}</section>`;

      // die anderen Täler klein (antippen = groß ansehen)
      const others = st.seats.filter((id) => id !== lookId).map((id) => `<button type="button" class="alm-thumb" data-alook="${esc(id)}" style="--pc:${colorOf(v, id)}">
          <span class="alm-tn"><span class="pdot"></span>${id === G.myId ? "Dein Tal" : esc(nameOf(v, id))}<b>${pts(id)}</b></span>${boardHtml(v, st, boardOf(id), { small: true, fresh: id !== G.myId ? pend(id) : [] })}</button>`).join("");
      main = `<div class="alm-layout">
          <section class="panel alm-boardbox">${!mine ? `<div class="alm-looking">Tal von <b style="color:${colorOf(v, lookId)}">${esc(nameOf(v, lookId))}</b>${seated ? ` · <button class="btn ghost sm" data-alook="${esc(G.myId)}">zurück zu meinem Tal</button>` : ""}</div>` : ""}${board}</section>
          ${dice}
          ${others ? `<section class="alm-others">${others}</section>` : ""}
        </div>`;
    }

    app.innerHTML = `
      <main class="screen game alm">
        <header class="top topbar">${headBrandHtml("alm")}<div class="meta">${esc(st.lengthName)} · Stube <b>${esc(v.code)}</b></div>${topActionsHtml()}</header>
        ${statusBarHtml()}
        <section class="slf-main">
          <div class="geo-bar"><span class="game-label">${st.step === "final" ? "Endstand" : `Woche ${st.week} von ${st.weeks}`}</span>${stormTrack}<div class="geo-scores">${chips}</div></div>
          ${main}
        </section>
      </main>`;

    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#alm-restart", () => send({ type: "almRestart" }));
    on("#alm-clear", () => { almSel.cells = []; renderAlm(); });
    on("#alm-rest", () => { almSent = key; send({ type: "almRest", week: st.week }); renderAlm(); });
    on("#alm-go", () => {
      const x = st.dice[almSel.di];
      almSent = key;
      send({ type: "almMove", week: st.week, di: almSel.di, terrain: x.t === "sun" ? almSel.terrain : x.t, cells: almSel.cells.slice() });
      renderAlm();
    });
    app.querySelectorAll("[data-adi]").forEach((b) => b.onclick = () => { almSel = { key, di: Number(b.dataset.adi), terrain: null, cells: [] }; renderAlm(); });
    app.querySelectorAll("[data-asun]").forEach((b) => b.onclick = () => { almSel.terrain = b.dataset.asun; almSel.cells = []; renderAlm(); });
    app.querySelectorAll("[data-alook]").forEach((b) => b.onclick = () => { almLook = b.dataset.alook; renderAlm(); });
    app.querySelectorAll(".acell.can").forEach((c) => c.onclick = () => {
      const i = Number(c.dataset.ai), k = almSel.cells.indexOf(i), x = st.dice[almSel.di];
      if (k >= 0) almSel.cells.splice(k, 1); else if (x && almSel.cells.length < x.n) almSel.cells.push(i);
      renderAlm();
    });
  }
  addEventListener("resize", () => { if (G.view && G.view.phase === "alm") renderAlm(); });

  return {
    renderAlm,
  };
});
