// Ansicht: Seilschaft (Koop-Jump'n'Run). G = gemeinsamer Kontext aus game.js.
// Jeder steuert seine Figur auf dem eigenen Gerät (allein: beide, Q wechselt); Positionen und Felsen gehen ca. 15× pro Sekunde
// über den Live-Kanal der Stube an die anderen, die sie weich nachziehen. Gatter und Platten rechnet jedes Gerät gleich aus.
// Sammeln, Neustart (wer verunglückt) und Sieg meldet man dem Gastgeber, der den Spielstand führt.
(window.S10Views = window.S10Views || []).push((G) => {
  const { app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml } = G;
  const SG = window.S10Seil;
  const K = window.S10Klang;
  const H = 15, DT = 1 / 120, GRAV = 38;
  const SPEC = {
    kraxler: { w: 0.8, h: 1.5, speed: 6, jump: 13, jumps: 1, name: "Kraxler" },
    gams: { w: 0.7, h: 0.75, speed: 8, jump: 13.5, jumps: 2, name: "Gams" },
  };
  const GCOL = { A: "#ffc83d", B: "#4fc3f7", C: "#c084fc", E: "#7ee2b1", bridge: "#ff9f5a" };

  // ---------- lokaler Zustand ----------
  let L = null, GR = null, W = 0;          // Level, Gelände-Raster, Breite
  const S = { open: {} };                  // Gatter (jedes Gerät rechnet gleich)
  let bodies = {}, boulders = [];
  let cur = { gid: null, seq: -1 };       // welche Level-Runde gerade geladen ist
  let active = "kraxler";                  // allein: welche Figur gesteuert wird
  let gotLocal = {}, sentWin = false, sentDie = false, t0 = 0, frozen = false;
  const remote = { kraxler: [], gams: [] }; // empfangene Positionen (für Figuren anderer Geräte)
  let built = null, mapSel = null, loopOn = false;

  const st = () => (G.view && G.view.seil) || null;
  const myRoles = () => { const s = st(); if (!s) return []; if (s.mode === "solo") return s.roles.kraxler === G.myId ? ["kraxler", "gams"] : [];
    return ["kraxler", "gams"].filter((w) => s.roles[w] === G.myId); };
  const may = () => { const s = st(); return !!s && (G.isHost || s.roles.kraxler === G.myId || s.roles.gams === G.myId); };
  const nameOf = (id) => ((G.view.players || []).find((p) => p.id === id) || {}).name || "?";
  const got = () => Object.assign({}, (st() || {}).got, gotLocal);

  // ---------- Klänge (live über js/klang.js; 🔇 schaltet sie mit ab) ----------
  const notes = (list, type = "triangle", peak = 0.12) => K.play(sfx, (c, t) => list.forEach((f, i) => K.tone(c, t + i * 0.09, 0.28, { type, f0: f, peak, rev: 0.25 })));
  const SND = { edel: () => notes([988, 1319]), key: () => notes([784, 1175, 1568]), win: () => notes([523, 659, 784, 1047]),
    fail: () => notes([392, 330, 262], "sine", 0.16), gate: () => notes([440, 660], "sine", 0.06), jump: () => K.play(sfx, (c, t) => K.tone(c, t, 0.12, { type: "square", f0: 300, f1: 520, peak: 0.03 })) };

  // ---------- Level laden ----------
  function loadLevel(n, seq) {
    L = SG.LEVELS[n - 1]; W = L.W; GR = SG.grid(L);
    const mk = (who) => ({ who, x: L.start[who], y: 13 - SPEC[who].h, w: SPEC[who].w, h: SPEC[who].h, vx: 0, vy: 0, ground: false, jl: 0, face: 1, coyote: 0 });
    bodies = { kraxler: mk("kraxler"), gams: mk("gams") };
    boulders = L.boulders.map((b) => ({ x: b.x, y: b.y, w: 0.96, h: 1, vy: 0, hx: b.x, hy: b.y }));
    S.open = { A: false, B: false, C: false, E: false, bridge: false }; for (const g of L.inv || []) S.open[g] = true;
    gotLocal = {}; sentWin = false; sentDie = false; frozen = false; t0 = performance.now(); camX = 0;
    remote.kraxler = []; remote.gams = [];
    const roles = myRoles(); active = roles.includes("kraxler") ? "kraxler" : roles[0] || "kraxler";
    cur = { gid: st().gid, seq };
  }

  // ---------- Kollision ----------
  function solidAt(tx, ty, who) {
    if (tx < 0 || tx >= W || ty >= H) return true;
    if (ty < 0) return false;
    switch (GR[ty][tx]) {
      case "#": case "r": return true;
      case "A": case "B": case "C": case "E": return !S.open[GR[ty][tx]];
      case "D": return !got().key;
      case "i": return who !== "kraxler" || S.open.bridge;
      default: return false;
    }
  }
  function tileHits(b, who) {
    const out = [], x0 = Math.floor(b.x), x1 = Math.floor(b.x + b.w - 1e-6), y0 = Math.floor(b.y), y1 = Math.floor(b.y + b.h - 1e-6);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solidAt(tx, ty, who)) out.push({ x: tx, y: ty, w: 1, h: 1 });
    return out;
  }
  const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const touchesTile = (b, ch) => { const x0 = Math.floor(b.x), x1 = Math.floor(b.x + b.w - 1e-6), y0 = Math.floor(b.y), y1 = Math.floor(b.y + b.h - 1e-6);
    for (let ty = Math.max(0, y0); ty <= Math.min(H - 1, y1); ty++) for (let tx = Math.max(0, x0); tx <= Math.min(W - 1, x1); tx++) if (GR[ty][tx] === ch) return true; return false; };
  function moveX(b, dx, who, boxes) {
    b.x += dx;
    const hs = tileHits(b, who).concat(boxes.filter((o) => o !== b && ov(b, o)));
    if (!hs.length) return false;
    if (dx > 0) b.x = Math.min(...hs.map((h) => h.x)) - b.w; else b.x = Math.max(...hs.map((h) => h.x + h.w));
    return true;
  }
  function moveY(b, dy, who, boxes, tops) {
    const bottom0 = b.y + b.h, top0 = b.y;
    b.y += dy;
    // Felsen nur, wenn man wirklich von oben bzw. unten kommt (sonst würde man aus ihnen „herausgedrückt“)
    let hs = tileHits(b, who).concat(boxes.filter((o) => o !== b && ov(b, o) && (dy > 0 ? bottom0 <= o.y + 0.05 : top0 >= o.y + o.h - 0.05)));
    if (dy > 0) hs = hs.concat(tops.filter((o) => bottom0 <= o.y + 0.02 && ov(b, o)));
    if (!hs.length) return false;
    if (dy > 0) b.y = Math.min(...hs.map((h) => h.y)) - b.h; else b.y = Math.max(...hs.map((h) => h.y + h.h));
    return true;
  }

  // ---------- Physik ----------
  const pushing = (b, o) => Math.abs(b.y + b.h - (o.y + o.h)) < 0.6 && Math.abs((b.face > 0 ? b.x + b.w : b.x) - (b.face > 0 ? o.x : o.x + o.w)) < 0.05;
  function stepBody(b, input, others, ownsBoulders) {
    const sp = SPEC[b.who];
    const target = (input.r ? 1 : 0) - (input.l ? 1 : 0);
    if (target) b.face = target;
    b.vx = target * sp.speed;
    b.coyote = b.ground ? 0.08 : Math.max(0, b.coyote - DT);
    if (input.jump) {
      if (b.ground || b.coyote > 0) { b.vy = -sp.jump; b.jl = 1; b.coyote = 0; SND.jump(); }
      else if (b.jl < sp.jumps) { b.vy = -sp.jump * 0.9; b.jl++; SND.jump(); }
    }
    if (!input.jheld && b.vy < -4) b.vy += GRAV * 1.2 * DT; // kurz tippen = kleiner Sprung
    b.vy = Math.min(b.vy + GRAV * DT, 22);
    const isK = b.who === "kraxler";
    const dx = b.vx * DT * (isK && boulders.some((o) => pushing(b, o)) ? 0.6 : 1);
    if (dx) {
      moveX(b, dx, b.who, isK ? [] : boulders);
      if (isK) for (const o of boulders) {
        if (!ov(b, o)) continue;
        const pen = b.y + b.h - o.y; // wie tief die Füße unter der Felskante sind
        if (pen <= 0.02) continue;
        if (pen < 0.3 && !b.ground) { b.y = o.y - b.h; b.vy = Math.min(b.vy, 0); continue; } // knapp drüber: auf den Fels steigen
        if (ownsBoulders && b.ground) { // schieben nur mit festem Stand, nicht im Sprung
          const want = dx > 0 ? b.x + b.w - o.x : b.x - (o.x + o.w);
          moveX(o, want, "boulder", boulders.concat(others.filter((x) => x.who === "gams")));
        }
        if (ov(b, o)) b.x = dx > 0 ? o.x - b.w : o.x + o.w;
      }
    }
    const tops = others.filter((o) => o !== b).map((o) => ({ x: o.x, y: o.y, w: o.w, h: 0.25 }));
    const hit = moveY(b, b.vy * DT, b.who, boulders, tops);
    b.ground = false;
    if (hit) { if (b.vy > 0) { b.ground = true; b.jl = 0; } b.vy = 0; }
    if (touchesTile(b, "w")) die(b.who, "wasser"); else if (b.y > H) die(b.who, "sturz");
  }
  function stepBoulders() {
    for (const o of boulders) {
      o.vy = Math.min(o.vy + GRAV * DT, 22);
      if (moveY(o, o.vy * DT, "boulder", boulders, [])) o.vy = 0;
      if (touchesTile(o, "w") || o.y > H) { o.x = o.hx; o.y = o.hy; o.vy = 0; }
    }
  }
  function plateDown(p, list) {
    const zone = { x: p.x + 0.1, y: p.y - 0.4, w: 0.8, h: 0.4 };
    return list.some((b) => (!p.heavy || b.who === "kraxler" || b.who == null) && ov(zone, b));
  }
  function updateWorld(list) {
    const all = list.concat(boulders), before = JSON.stringify(S.open);
    for (const g of ["A", "B", "C", "E"]) {
      const ps = L.plates.filter((p) => p.opens.includes(g)); if (!ps.length) { S.open[g] = false; continue; }
      const groups = {}; ps.forEach((p, i) => { (groups[p.grp || "s" + i] = groups[p.grp || "s" + i] || []).push(p); });
      const pressed = Object.values(groups).some((gr) => gr.every((p) => plateDown(p, all)));
      const want = (L.inv || []).includes(g) ? !pressed : pressed;
      S.open[g] = want || (S.open[g] && all.some((b) => touchesTile(b, g))); // nie jemanden einklemmen
    }
    const br = L.plates.some((p) => p.opens.includes("bridge") && plateDown(p, all));
    S.open.bridge = br || (S.open.bridge && list.some((b) => b.who === "kraxler" && touchesTile({ x: b.x, y: b.y + 0.1, w: b.w, h: b.h }, "i")));
    if (JSON.stringify(S.open) !== before) SND.gate();
    const s = st(); if (!s) return;
    const g = got();
    for (const it of L.items) {
      if (g[it.id]) continue;
      const box = { x: it.x + 0.15, y: it.y + 0.15, w: 0.7, h: 0.7 };
      if (list.some((b) => b.local && ov(box, b))) { gotLocal[it.id] = true; send({ type: "sgGet", id: it.id, seq: cur.seq }); it.key ? SND.key() : SND.edel(); }
    }
    if (!sentWin && list.length === 2 && list.every((b) => b.x >= L.goalX) && list.some((b) => b.local)) { sentWin = true; frozen = true; send({ type: "sgWin", seq: cur.seq }); }
  }
  function die(who, why) {
    if (sentDie || frozen) return;
    sentDie = true; frozen = true; SND.fail();
    send({ type: "sgDie", seq: cur.seq, who, why });
  }

  // ---------- Live-Kanal: Positionen der anderen ----------
  G.onLive((m) => {
    const s = st();
    if (!s || m.gid !== s.gid || m.seq !== cur.seq || m.t !== "pos" || !remote[m.who]) return;
    if (myRoles().includes(m.who)) return; // eigene Figur nie von außen
    const arr = remote[m.who]; arr.push({ at: performance.now(), x: m.x, y: m.y, f: m.f, g: m.g, vx: m.vx }); if (arr.length > 30) arr.shift();
    if (m.b && !myRoles().includes("kraxler")) m.b.forEach((p, i) => { if (boulders[i]) { boulders[i].x = p[0]; boulders[i].y = p[1]; } });
  });
  function remoteBody(who) {
    const s = remote[who]; if (!s.length) return null;
    const t = performance.now() - 100; // 100 ms hinterher, zwischen zwei Ständen weich nachziehen
    let a = s[0], b = s[s.length - 1];
    for (let i = s.length - 1; i > 0; i--) if (s[i - 1].at <= t) { a = s[i - 1]; b = s[i]; break; }
    const k = b.at === a.at ? 1 : Math.max(0, Math.min(1, (t - a.at) / (b.at - a.at)));
    const sp = SPEC[who];
    return { who, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: sp.w, h: sp.h, face: b.f, ground: b.g, vx: b.vx, local: false };
  }
  // alle Figuren: eigene (gesteuert) + die der anderen Geräte (nachgezogen)
  function allBodies() {
    const mine = myRoles();
    return ["kraxler", "gams"].map((w) => (mine.includes(w) ? Object.assign(bodies[w], { local: true }) : remoteBody(w))).filter(Boolean);
  }

  // ---------- Eingabe ----------
  const keys = { l: false, r: false, j: false };
  let jumpQueued = false;
  const KEYMAP = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "j", w: "j", W: "j", " ": "j" };
  const playingNow = () => { const s = st(); return !!s && G.view.phase === "seil" && s.step === "play" && !!L; };
  addEventListener("keydown", (e) => {
    if (!playingNow() || e.target.closest && e.target.closest("input, textarea, select")) return;
    const k = KEYMAP[e.key];
    if (k && myRoles().length) { e.preventDefault(); if (k === "j" && !keys.j) jumpQueued = true; keys[k] = true; }
    if ((e.key === "q" || e.key === "Q" || e.key === "Tab") && myRoles().length === 2) { e.preventDefault(); switchFig(); }
    if ((e.key === "r" || e.key === "R") && may() && !st().dead) send({ type: "sgDie", seq: cur.seq, who: null, why: "neu" });
    if (e.key === "Escape" && may()) send({ type: "sgMap" });
  });
  addEventListener("keyup", (e) => { const k = KEYMAP[e.key]; if (k) keys[k] = false; });
  function switchFig() { active = active === "kraxler" ? "gams" : "kraxler"; keys.l = keys.r = false; }

  // ---------- Zeichnen ----------
  let cv = null, ctx = null, T = 32, camX = 0;
  function resize() {
    if (!cv) return;
    const w = cv.parentElement.clientWidth, portrait = innerHeight > innerWidth, coarse = matchMedia("(pointer: coarse)").matches;
    // Handy quer: Knöpfe liegen über dem Spielfeld, also fast die ganze Höhe nutzen
    const h = portrait ? Math.min(Math.round(w * 0.95), Math.round(innerHeight * 0.55)) : Math.min(Math.round(w * 9 / 16), innerHeight - (coarse ? 84 : 150), 640);
    const dpr = devicePixelRatio || 1;
    cv.width = Math.round(w * dpr); cv.height = Math.round(Math.max(220, h) * dpr); cv.style.height = Math.max(220, h) + "px";
    T = cv.height / H;
  }
  addEventListener("resize", resize);
  const MTN = [0, .55, 4, .25, 7, .42, 10, .18, 13, .4, 17, .22, 20, .5, 24, .28, 27, .35, 31, .15, 34, .45, 38, .3, 42, .5, 46, .2, 50, .38, 54, .26, 58, .5, 62, .3];
  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, cv.height);
    g.addColorStop(0, "#3b3f94"); g.addColorStop(0.55, "#9a7bc4"); g.addColorStop(0.8, "#f4a978"); g.addColorStop(1, "#f7c98f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    const layer = (pts, par, top, col, snow) => {
      const off = -camX * T * par;
      ctx.beginPath(); ctx.moveTo(off, cv.height);
      for (let i = 0; i < pts.length; i += 2) ctx.lineTo(off + pts[i] * T * 1.1, top + pts[i + 1] * cv.height * 0.6);
      ctx.lineTo(off + 64 * T * 1.1, cv.height); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      if (snow) { ctx.save(); ctx.clip(); ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(0, 0, cv.width, top + 0.24 * cv.height * 0.6); ctx.restore(); }
    };
    layer(MTN, 0.15, cv.height * 0.12, "#6c5a9e", true);
    layer(MTN.map((v, i) => (i % 2 ? Math.min(0.9, v + 0.35) : v * 1.3 + 2)), 0.4, cv.height * 0.3, "#4f7a5a", false);
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function signAt(sx, sy, t, big) {
    const px = (sx - camX) * T; ctx.fillStyle = "#7a4e2a"; ctx.fillRect(px - T * 0.05, (sy - 1) * T, T * 0.1, T);
    ctx.font = `700 ${T * (big ? 0.34 : 0.26)}px Nunito`; ctx.textAlign = "center"; const w = ctx.measureText(t).width + T * 0.3;
    ctx.fillStyle = big ? "#ffc83d" : "#c48a4a"; rr(px - w / 2, (sy - 1.65) * T, w, T * (big ? 0.58 : 0.48), 5); ctx.fill(); ctx.fillStyle = "#2a1300"; ctx.fillText(t, px, (sy - 1.65 + (big ? 0.41 : 0.33)) * T);
  }
  function drawTiles(now) {
    const x0 = Math.max(0, Math.floor(camX)), x1 = Math.min(W - 1, Math.ceil(camX + cv.width / T));
    if (L.hut) { // Almhütte im Hintergrund
      const hx = (L.hut.x0 - camX) * T, hw = (L.hut.x1 - L.hut.x0) * T;
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(hx, 8 * T, hw, 5 * T);
      ctx.fillStyle = "#6e4426"; for (let k = 0; k < 5; k++) ctx.fillRect(hx, (8 + k) * T + T * 0.92, hw, T * 0.08);
      ctx.fillStyle = "#cfe8ff"; rr(hx + 0.2 * T, 9 * T, 0.7 * T, 0.7 * T, 3); ctx.fill(); rr(hx + hw - 0.9 * T, 9 * T, 0.7 * T, 0.7 * T, 3); ctx.fill();
      ctx.fillStyle = "#e06b6b"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(hx + 0.35 * T + k * 0.2 * T, 9.85 * T, 0.09 * T, 0, 7); ctx.fill(); } // Geranien
      ctx.fillStyle = "#fff8e6"; ctx.font = `700 ${T * 0.32}px Fredoka`; ctx.textAlign = "center"; ctx.fillText(L.hut.name, hx + hw / 2, 6.75 * T);
    }
    for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) {
      const c = GR[y][x], px = (x - camX) * T, py = y * T;
      if (c === "#") {
        ctx.fillStyle = "#6b5d52"; ctx.fillRect(px, py, T + 0.5, T + 0.5);
        ctx.fillStyle = "#5a4d44"; if ((x * 7 + y * 3) % 5 === 0) ctx.fillRect(px + T * 0.2, py + T * 0.5, T * 0.25, T * 0.18);
        if ((x * 5 + y * 11) % 7 === 0) ctx.fillRect(px + T * 0.6, py + T * 0.2, T * 0.2, T * 0.15);
        const above = y > 0 ? GR[y - 1][x] : "#";
        if (above !== "#" && above !== "r") { ctx.fillStyle = "#5bbf4a"; ctx.fillRect(px, py, T + 0.5, T * 0.22); ctx.fillStyle = "#7fd96a"; ctx.fillRect(px, py, T + 0.5, T * 0.08); }
      } else if (c === "r") {
        ctx.fillStyle = "#9b3d2e"; ctx.fillRect(px, py + T * 0.3, T + 0.5, T * 0.7);
        ctx.fillStyle = "#7d2e22"; ctx.fillRect(px, py + T * 0.62, T + 0.5, T * 0.08);
      } else if ("ABCE".includes(c)) {
        ctx.globalAlpha = S.open[c] ? 0.22 : 1;
        ctx.fillStyle = "#a8743a"; ctx.fillRect(px + T * 0.15, py, T * 0.16, T + 0.5); ctx.fillRect(px + T * 0.69, py, T * 0.16, T + 0.5);
        ctx.fillStyle = GCOL[c]; ctx.fillRect(px, py + T * 0.25, T, T * 0.16); ctx.fillRect(px, py + T * 0.65, T, T * 0.16);
        ctx.globalAlpha = 1;
        if (y === 0 || !"ABCE".includes(GR[y - 1][x])) { ctx.fillStyle = GCOL[c]; ctx.font = `700 ${T * 0.42}px Fredoka`; ctx.textAlign = "center"; ctx.fillText((L.inv || []).includes(c) ? "⊘" : "●", px + T / 2, py - T * 0.08); }
      } else if (c === "D") {
        if (!got().key) { ctx.fillStyle = "#5e3a1f"; ctx.fillRect(px + T * 0.05, py, T * 0.9, T + 0.5); ctx.fillStyle = "#4a2d17"; ctx.fillRect(px + T * 0.45, py, T * 0.1, T + 0.5);
          if (y === 10) { ctx.fillStyle = "#ffd84a"; ctx.beginPath(); ctx.arc(px + T * 0.72, py + T * 0.5, T * 0.1, 0, 7); ctx.fill(); } }
        else { ctx.fillStyle = "#2b1a10"; ctx.fillRect(px + T * 0.05, py, T * 0.9, T + 0.5); }
      } else if (c === "i") {
        if (S.open.bridge) { ctx.fillStyle = "#a8743a"; ctx.fillRect(px, py, T + 0.5, T * 0.32); ctx.fillStyle = "#7a5228"; ctx.fillRect(px + T * 0.48, py, T * 0.05, T * 0.32); }
        else { ctx.fillStyle = "rgba(200,236,255,.85)"; ctx.fillRect(px, py, T + 0.5, T * 0.2); ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + T * 0.2, py + T * 0.05); ctx.lineTo(px + T * 0.4, py + T * 0.16); ctx.lineTo(px + T * 0.55, py + T * 0.06); ctx.stroke(); }
        ctx.fillStyle = "#2f7fc4"; ctx.fillRect(px, py + T * 0.2, T + 0.5, T * 0.8);
      } else if (c === "w") {
        ctx.fillStyle = "#256aa8"; ctx.fillRect(px, py, T + 0.5, T + 0.5);
        ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(px + ((now / 30 + x * 9) % T), py + T * 0.3, T * 0.25, 2);
      }
    }
    const everyone = allBodies().concat(boulders);
    for (const p of L.plates) {
      const down = plateDown(p, everyone), px = (p.x - camX) * T, top = p.y * T - (down ? 0.08 : 0.2) * T;
      ctx.fillStyle = p.heavy ? "#e0484f" : GCOL[p.opens[0]]; rr(px + T * 0.08, top, T * 0.84, T * 0.24, 4); ctx.fill();
      if (p.heavy) { ctx.fillStyle = GCOL[p.opens[0]]; ctx.fillRect(px + T * 0.2, top + T * 0.08, T * 0.6, T * 0.08); }
      if (p.opens.length > 1) { ctx.fillStyle = GCOL[p.opens[1]]; ctx.fillRect(px + T * 0.5, top, T * 0.42, T * 0.24); }
      if (p.heavy && !down) { ctx.fillStyle = "#fff"; ctx.font = `700 ${T * 0.18}px Fredoka`; ctx.textAlign = "center"; ctx.fillText("kg", px + T / 2, top - T * 0.03); }
    }
    for (const s of L.signs) signAt(s.x, s.y, s.t, false);
    if (L.goal) signAt(L.goal.x, L.goal.y, L.goal.t, true);
  }
  function drawItems(now) {
    for (const it of L.items) {
      if (got()[it.id]) continue;
      const cx = (it.x + 0.5 - camX) * T, cy = (it.y + 0.5) * T + Math.sin(now / 300 + it.x) * T * 0.06;
      if (it.key) {
        ctx.fillStyle = "#ffd84a"; ctx.strokeStyle = "#b8860b"; ctx.lineWidth = T * 0.05;
        ctx.beginPath(); ctx.arc(cx - T * 0.15, cy, T * 0.17, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillRect(cx - T * 0.02, cy - T * 0.05, T * 0.36, T * 0.1); ctx.fillRect(cx + T * 0.2, cy, T * 0.08, T * 0.14);
      } else {
        ctx.fillStyle = "#fffdf2";
        for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * T * 0.17, cy + Math.sin(a) * T * 0.17, T * 0.15, T * 0.07, a, 0, 7); ctx.fill(); }
        ctx.fillStyle = "#f5c542"; ctx.beginPath(); ctx.arc(cx, cy, T * 0.09, 0, 7); ctx.fill();
      }
    }
    for (const o of boulders) {
      const bx = (o.x + o.w / 2 - camX) * T, by = (o.y + o.h / 2) * T;
      ctx.fillStyle = "#8d8a94"; ctx.beginPath(); ctx.ellipse(bx, by + T * 0.03, T * 0.5, T * 0.48, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#a9a6b0"; ctx.beginPath(); ctx.ellipse(bx - T * 0.13, by - T * 0.14, T * 0.2, T * 0.12, -0.5, 0, 7); ctx.fill();
    }
  }
  function drawFig(b, now, mine) {
    const px = (b.x - camX) * T, py = b.y * T, w = b.w * T, h = b.h * T, f = b.face || 1;
    const walk = b.ground && Math.abs(b.vx) > 0.1 ? Math.sin(now / 70) : 0;
    ctx.save(); ctx.translate(px + w / 2, py); ctx.scale(f, 1);
    if (b.who === "kraxler") {
      ctx.fillStyle = "#5a3a1e"; ctx.fillRect(-w * 0.35 + walk * 3, h * 0.7, w * 0.25, h * 0.3); ctx.fillRect(w * 0.1 - walk * 3, h * 0.7, w * 0.25, h * 0.3);
      ctx.fillStyle = "#7a4e2a"; ctx.fillRect(-w * 0.42, h * 0.52, w * 0.84, h * 0.22);
      ctx.fillStyle = "#d6453d"; rr(-w * 0.45, h * 0.26, w * 0.9, h * 0.3, 4); ctx.fill();
      ctx.fillStyle = "#3f7a3a"; ctx.fillRect(-w * 0.28, h * 0.26, w * 0.1, h * 0.3); ctx.fillRect(w * 0.18, h * 0.26, w * 0.1, h * 0.3);
      ctx.fillStyle = "#f2c9a0"; ctx.beginPath(); ctx.arc(0, h * 0.16, w * 0.3, 0, 7); ctx.fill();
      ctx.fillStyle = "#8a5a33"; ctx.beginPath(); ctx.arc(0, h * 0.22, w * 0.27, 0.1, Math.PI - 0.1); ctx.fill();
      ctx.fillStyle = "#231d4d"; ctx.fillRect(w * 0.08, h * 0.12, w * 0.08, w * 0.08);
      ctx.fillStyle = "#2f6b35"; rr(-w * 0.36, -h * 0.02, w * 0.72, h * 0.08, 3); ctx.fill(); rr(-w * 0.22, -h * 0.1, w * 0.44, h * 0.1, 3); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillRect(-w * 0.3, -h * 0.16, w * 0.05, h * 0.12);
    } else {
      ctx.fillStyle = "#5b4636"; ctx.fillRect(-w * 0.38 + walk * 2, h * 0.65, w * 0.12, h * 0.35); ctx.fillRect(w * 0.22 - walk * 2, h * 0.65, w * 0.12, h * 0.35);
      ctx.fillStyle = "#8b6a4f"; rr(-w * 0.45, h * 0.28, w * 0.85, h * 0.42, 8); ctx.fill();
      ctx.fillStyle = "#3a2c22"; ctx.fillRect(-w * 0.45, h * 0.3, w * 0.85, h * 0.07);
      ctx.fillStyle = "#8b6a4f"; rr(w * 0.2, -h * 0.02, w * 0.38, h * 0.42, 6); ctx.fill();
      ctx.fillStyle = "#f4efe6"; ctx.fillRect(w * 0.34, h * 0.02, w * 0.1, h * 0.36);
      ctx.fillStyle = "#231d4d"; ctx.fillRect(w * 0.47, h * 0.12, w * 0.06, w * 0.06);
      ctx.strokeStyle = "#2a1e16"; ctx.lineWidth = Math.max(2, T * 0.06); ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.02); ctx.quadraticCurveTo(w * 0.28, -h * 0.3, w * 0.1, -h * 0.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.02); ctx.quadraticCurveTo(w * 0.44, -h * 0.28, w * 0.26, -h * 0.3); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = mine ? "#ffc83d" : "rgba(255,255,255,.75)"; ctx.font = `700 ${T * 0.28}px Fredoka`; ctx.textAlign = "center";
    ctx.fillText(mine ? "▼" : SPEC[b.who].name, px + w / 2, py - T * (b.who === "gams" ? 0.4 : 0.25));
  }

  function drawDead(now, d) {
    const nm = d.who ? (d.who === "kraxler" ? "Der Kraxler" : "Die Gams") : "";
    ctx.fillStyle = "rgba(14,11,40,.6)"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = `700 ${T * 0.85}px Fredoka`;
    ctx.fillText(d.why === "wasser" ? `💦 ${nm} ist ins Wasser gefallen!` : d.why === "sturz" ? `😵 ${nm} ist abgestürzt!` : "↺ Neustart", cv.width / 2, cv.height * 0.45);
    ctx.font = `700 ${T * 0.42}px Nunito`; ctx.fillStyle = "#ffc83d"; ctx.fillText("Die Seilschaft fängt das Level von vorn an …", cv.width / 2, cv.height * 0.56);
  }

  // ---------- Spielschleife ----------
  let acc = 0, last = performance.now(), lastSend = 0;
  function frame(now) {
    const s = st();
    if (!s || G.view.phase !== "seil" || !cv || !cv.isConnected || s.step === "map") { loopOn = false; return; }
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    const mine = myRoles();
    if (s.step === "play" && !s.dead && !frozen && L) {
      while (acc >= DT) {
        acc -= DT;
        const input = { l: keys.l, r: keys.r, jump: jumpQueued, jheld: keys.j }; jumpQueued = false;
        const list = allBodies();
        mine.forEach((w) => stepBody(bodies[w], w === active || mine.length === 1 ? input : { l: false, r: false, jump: false, jheld: false }, list, mine.includes("kraxler")));
        if (mine.includes("kraxler")) stepBoulders();
        updateWorld(allBodies());
        if (frozen) break;
      }
      // eigene Positionen (und als Kraxler die Felsen) ca. 15× pro Sekunde an die anderen
      if (now - lastSend > 66 && mine.length) { lastSend = now;
        mine.forEach((w) => { const b = bodies[w];
          G.liveSend({ t: "pos", gid: s.gid, seq: cur.seq, who: w, x: +b.x.toFixed(3), y: +b.y.toFixed(3), f: b.face, g: b.ground, vx: +b.vx.toFixed(2),
            b: w === "kraxler" ? boulders.map((o) => [+o.x.toFixed(3), +o.y.toFixed(3)]) : null }); }); }
    } else acc = 0;
    if (!mine.length && L && s.step === "play") updateWorld(allBodies()); // Zuschauer: Gatter trotzdem mitrechnen
    draw(now, s);
    requestAnimationFrame(frame);
  }
  function draw(now, s) {
    if (!L) return;
    const list = allBodies(), mine = myRoles();
    const focus = mine.length ? bodies[mine.length === 2 ? active : mine[0]] : list[0] || bodies.kraxler;
    const viewW = cv.width / T;
    camX += (Math.max(0, Math.min(W - viewW, focus.x + focus.w / 2 - viewW / 2)) - camX) * 0.12;
    drawSky(); drawTiles(now); drawItems(now);
    list.slice().sort((a, b) => (a === focus) - (b === focus)).forEach((b) => drawFig(b, now, b === focus && mine.length > 0));
    if (s.dead) drawDead(now, s.dead);
    hud(s);
  }
  function hud(s) {
    const el = app.querySelector(".sg-hud"); if (!el) return;
    const g = got(), n = L.items.filter((i) => !i.key && g[i.id]).length, secs = Math.round((performance.now() - t0) / 1000), mine = myRoles();
    const who = mine.length === 2 ? `Du steuerst: <b>${SPEC[active].name}</b> <small>(Q wechselt)</small>` : mine.length ? `Du bist: <b>${SPEC[mine[0]].name}</b>` : "Du schaust zu";
    const html = `<span>Level ${L.n}: <b>${esc(L.name)}</b></span><span>${who}</span><span>Edelweiß <b>${n}/${SG.edelMax(L)}</b></span>${L.items.some((i) => i.key) ? `<span>🔑 ${g.key ? "<b>✓</b>" : "–"}</span>` : ""}<span>⏱ ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</span>`;
    if (el.innerHTML !== html) el.innerHTML = html;
  }

  // ---------- Tourenkarte ----------
  // Gezeichnete Symbole der Stationen (48 × 48)
  const HUT_SVG = {
    1: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="42" rx="17" ry="3" fill="#000" opacity=".18"/>
      <circle cx="35" cy="7" r="2.6" fill="#e8e4f0" opacity=".8"/><circle cx="38" cy="3.5" r="2" fill="#e8e4f0" opacity=".6"/>
      <rect x="31" y="10" width="4.5" height="9" fill="#6b5d52"/><rect x="30.5" y="9" width="5.5" height="2" fill="#4f453d"/>
      <rect x="10" y="22" width="28" height="19" fill="#b07a42"/><path d="M10 26.5h28M10 31h28M10 35.5h28" stroke="#8a5a2e" stroke-width="1"/>
      <path d="M5 25 L24 9.5 L43 25 Z" fill="#c2463a"/><path d="M5 25 L24 9.5 L43 25" fill="none" stroke="#8e2e24" stroke-width="2" stroke-linejoin="round"/>
      <rect x="21" y="30" width="7" height="11" rx="1" fill="#5e3a1f"/><circle cx="26.3" cy="35.5" r=".8" fill="#ffd84a"/>
      <rect x="12.5" y="27" width="6" height="5.5" fill="#cfe8ff" stroke="#5e3a1f" stroke-width="1.2"/><path d="M15.5 27v5.5M12.5 29.7h6" stroke="#5e3a1f" stroke-width=".8"/>
      <rect x="11.5" y="32.5" width="8" height="2.2" fill="#6e4426"/><circle cx="13.2" cy="32.2" r="1.2" fill="#e84a5f"/><circle cx="15.6" cy="31.8" r="1.2" fill="#ff7a8a"/><circle cx="18" cy="32.2" r="1.2" fill="#e84a5f"/>
      <rect x="31" y="28" width="5" height="5" fill="#cfe8ff" stroke="#5e3a1f" stroke-width="1.2"/></svg>`,
    2: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="42" rx="19" ry="3" fill="#000" opacity=".18"/>
      ${[0, 1, 2, 3, 4].map((k) => `<rect x="8" y="${22 + k * 3.8}" width="30" height="3.8" rx="1.9" fill="${k % 2 ? "#8a5a33" : "#9e6a3c"}"/><circle cx="8.5" cy="${23.9 + k * 3.8}" r="1.9" fill="#d9a56b"/><circle cx="37.5" cy="${23.9 + k * 3.8}" r="1.9" fill="#d9a56b"/>`).join("")}
      <path d="M4 24 L23 10 L42 24 Z" fill="#4e3322"/><path d="M4 24 L23 10 L42 24" fill="none" stroke="#2f1f14" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10 20.5 L36 20.5 M14 17 L32 17 M18.5 13.7 L27.5 13.7" stroke="#3a261a" stroke-width="1"/>
      <rect x="19" y="29" width="7" height="12" fill="#3a261a"/><rect x="28.5" y="26" width="5" height="4.5" fill="#ffe7a8" stroke="#3a261a" stroke-width="1"/>
      ${[[40, 38], [44, 38], [42, 34.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#e0b075" stroke="#8a5a33" stroke-width=".8"/><circle cx="${x}" cy="${y}" r=".8" fill="none" stroke="#a87a48" stroke-width=".6"/>`).join("")}</svg>`,
    3: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="18" ry="3" fill="#000" opacity=".18"/>
      <path d="M5 42 L10 33 L18 31 L26 33 L34 30 L42 34 L45 42 Z" fill="#8f8799"/><path d="M10 33 L18 31 L26 33 L34 30" fill="none" stroke="#b3abc0" stroke-width="1.5"/>
      <path d="M11 33 L11 21 Q11 12 24 12 Q37 12 37 21 L37 33 Z" fill="#ff8a3d"/><path d="M11 21 Q11 12 24 12 Q37 12 37 21" fill="none" stroke="#c75f1d" stroke-width="2"/>
      <path d="M11 25h26" stroke="#e46f26" stroke-width="1.5"/><path d="M15 33V14.5M33 33V14.5" stroke="#e46f26" stroke-width="1"/>
      <rect x="20" y="22" width="8" height="11" rx="1" fill="#7a3a12"/><rect x="29" y="18" width="5" height="4" rx="1" fill="#cfe8ff" stroke="#7a3a12" stroke-width="1"/>
      <path d="M19 14 Q24 11.5 29 14" stroke="#fff" stroke-width="2" opacity=".55" fill="none" stroke-linecap="round"/></svg>`,
    4: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="19" ry="3" fill="#000" opacity=".18"/>
      <rect x="7" y="21" width="32" height="21" fill="#cfc6b6"/>
      ${[[7, 24, 7], [15, 24, 9], [25, 24, 6], [32, 24, 7], [7, 29, 10], [18, 29, 7], [26, 29, 13], [7, 34, 6], [14, 34, 10], [30, 34, 9]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="4.4" fill="none" stroke="#a49a88" stroke-width=".8"/>`).join("")}
      <path d="M3 23 L23 9 L43 23 Z" fill="#5d5868"/><path d="M3 23 L23 9 L43 23" fill="none" stroke="#3f3b4a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M8.5 19.2 Q14 17 18 14 Q23 11 28 14 Q32 17 37.5 19.2 L43 23 L37 22 Q30 18 23 15 Q16 18 9 22 L3 23 Z" fill="#fff" opacity=".9"/>
      <rect x="19.5" y="31" width="7" height="11" fill="#5e3a1f"/>
      <rect x="10" y="26" width="6" height="5" fill="#cfe8ff"/><rect x="8" y="26" width="2" height="5" fill="#3f8a4a"/><rect x="16" y="26" width="2" height="5" fill="#3f8a4a"/>
      <rect x="30" y="26" width="6" height="5" fill="#cfe8ff"/><rect x="28" y="26" width="2" height="5" fill="#3f8a4a"/><rect x="36" y="26" width="2" height="5" fill="#3f8a4a"/>
      <path d="M41 42V7" stroke="#6b5d52" stroke-width="1.4"/><path d="M41 7.5 L47 9.2 L41 11 Z" fill="#e0484f"/><path d="M41 11 L47 12.7 L41 14.4 Z" fill="#fff"/></svg>`,
    5: `<svg viewBox="0 0 48 48"><circle cx="24" cy="18" r="16" fill="#ffd84a" opacity=".28"/><circle cx="24" cy="18" r="10" fill="#ffe89a" opacity=".35"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = k * Math.PI / 4; return `<path d="M${(24 + Math.cos(a) * 12).toFixed(1)} ${(18 + Math.sin(a) * 12).toFixed(1)} L${(24 + Math.cos(a) * 19).toFixed(1)} ${(18 + Math.sin(a) * 19).toFixed(1)}" stroke="#ffd84a" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>`; }).join("")}
      <path d="M6 44 L14 36 L20 37 L24 33 L29 36 L35 35 L42 44 Z" fill="#8f8799"/><path d="M14 36 L20 37 L24 33 L29 36" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>
      <rect x="22" y="8" width="4.4" height="29" rx="1" fill="#7a4e2a"/><rect x="14.5" y="15" width="19.4" height="4" rx="1" fill="#7a4e2a"/>
      <rect x="22.8" y="9" width="1.2" height="27" fill="#a06a3c"/><rect x="15.5" y="15.8" width="17" height="1.1" fill="#a06a3c"/>
      <path d="M19.5 9.5 L24.2 4.5 L28.9 9.5 Z" fill="#5b3a22"/>
      <circle cx="24.2" cy="17" r="1.6" fill="#ffd84a"/>
      <rect x="27.5" y="27" width="4.5" height="3.5" rx=".6" fill="#c0c7d2" stroke="#6b5d52" stroke-width=".6"/></svg>`,
  };
  // Berg (Karte 600 × 640): linke und rechte Flanke als Linienzug; der Weg bleibt immer mit Abstand dazwischen
  const FLANK_L = [[0, 640], [0, 340], [55, 260], [105, 180], [155, 115], [210, 62], [262, 30], [300, 16]];
  const FLANK_R = [[300, 16], [338, 30], [390, 62], [445, 115], [495, 180], [545, 260], [600, 340], [600, 640]];
  const edgeX = (pts, y) => { for (let k = 0; k < pts.length - 1; k++) { const [x1, y1] = pts[k], [x2, y2] = pts[k + 1]; const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
    if (y >= lo && y <= hi && hi > lo) return x1 + (x2 - x1) * (y - y1) / (y2 - y1); } return pts[pts.length - 1][0]; };
  // Wegpunkte: je Welt 3 Level + Hütte, in Serpentinen (Welt 1 nach rechts, Welt 2 nach links, …); ganz oben das Gipfelkreuz
  const SKY = 50; // Himmel über dem Gipfel, damit das Gipfelkreuz ganz zu sehen ist
  const ROUTE = (() => {
    const out = []; let y = 618;
    for (let k = 0; k < 5; k++) for (let j = 0; j < 4; j++) {
      const i = k * 4 + j, hut = j === 3;
      if (i > 0) y -= hut || j === 0 ? 35.5 : 26; // vor und nach einer Hütte mehr Platz
      const L = edgeX(FLANK_L, y), R = edgeX(FLANK_R, y), m = Math.min(40, (R - L) * 0.16);
      const t = hut ? 1 : 0.16 + j * 0.29, x = k % 2 === 0 ? L + m + t * (R - L - 2 * m) : R - m - t * (R - L - 2 * m);
      const last = i === 19;
      out.push([hut ? "H" : "L", hut ? k + 1 : k * 3 + j + 1, (last ? 300 : x) / 6, ((last ? 20 : y) + SKY) / 6.9]);
    }
    return out;
  })();
  function mapSvg(doneUpTo) {
    const pts = ROUTE.map((r) => [r[2] * 6, r[3] * 6.9 - SKY]);
    const line = (a) => "M" + a.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L");
    const mtn = "M" + FLANK_L.concat(FLANK_R.slice(1)).map((p) => p.join(",")).join(" L") + "Z";
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); // immer gleiches „Zufalls“-Bild
    const inside = (x, y, pad) => x > edgeX(FLANK_L, y) + pad && x < edgeX(FLANK_R, y) - pad;
    const nearRoute = (x, y, d) => pts.some(([px, py]) => Math.hypot(px - x, py - y) < d);
    // der Bach entspringt oben im Wald und rauscht direkt am Level „Wilder Bach“ (5) vorbei
    const BROOK = [[372, 342], [364, 362], [368, 384], [376, 404], [370, 424], [358, 442], [352, 458], [358, 474], [370, 490], [380, 508], [376, 528], [370, 546], [380, 566], [392, 584], [388, 606], [380, 624], [384, 640]];
    const nearBrook = (x, y) => BROOK.some(([bx, by]) => Math.hypot(bx - x, by - y) < 11);
    // Fichtenwald: Baumgrenze wellig, hinten kleine dunkle, vorne große hellere Bäume
    const treeTop = (x) => 330 + Math.sin(x / 37) * 12 + Math.sin(x / 13) * 5;
    const forestFloor = `M0 640 L0 ${treeTop(0)}` + Array.from({ length: 61 }, (_, k) => ` L${k * 10} ${treeTop(k * 10).toFixed(1)}`).join("") + " L600 640Z";
    const trees = [];
    for (let y = 338; y <= 492; y += 9) for (let x = -4; x < 604; x += 11 + rnd() * 7) {
      const yy = y + rnd() * 6, f = (yy - 330) / 160; // 0 hinten … 1 vorne
      if (yy < treeTop(x) + 6 || !inside(x, yy, 8) || nearRoute(x, yy - 10, 17) || nearBrook(x, yy - 6)) continue;
      if (yy > 455 && rnd() < (yy - 455) / 45) continue; // zum Waldrand hin lichter
      trees.push({ x, y: yy, s: 0.6 + f * 0.75 + rnd() * 0.2, c: ["#1f4a33", "#2a5a3c", "#33693f", "#3d7646"][Math.min(3, Math.floor(f * 3 + rnd() * 1.4))] });
    }
    const spruce = ({ x, y, s, c }) => { const h = 22 * s, w = 8 * s;
      return `<g><rect x="${(x - 1.2 * s).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="${(2.4 * s).toFixed(1)}" height="${(4 * s).toFixed(1)}" fill="#4a3020"/>`
        + [0, 1, 2].map((k) => { const ty = y - k * h * 0.27, tw = w * (1 - k * 0.24); return `<path d="M${x} ${(ty - h * 0.42).toFixed(1)} L${(x - tw).toFixed(1)} ${ty.toFixed(1)} L${(x + tw).toFixed(1)} ${ty.toFixed(1)}Z" fill="${c}"/>`; }).join("")
        + `<path d="M${x} ${(y - h * 0.96).toFixed(1)} L${(x + w * 0.5).toFixed(1)} ${(y - h * 0.5).toFixed(1)} L${x} ${(y - h * 0.55).toFixed(1)}Z" fill="#fff" opacity=".07"/></g>`; };
    // Almwiese: Blumen
    const flowers = []; for (let k = 0; k < 70; k++) { const x = rnd() * 600, y = 505 + rnd() * 130; if (!nearRoute(x, y, 16)) flowers.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + rnd()).toFixed(1)}" fill="${["#fff8e6", "#ffd84a", "#e9a0d8", "#fff"][k % 4]}" opacity=".85"/>`); }
    // Felsrippen und Geröll in der Felszone
    const ribs = [[215, 250, 180, 330], [300, 205, 285, 300], [390, 235, 420, 320], [250, 170, 235, 215], [350, 165, 372, 215], [160, 285, 120, 330], [455, 275, 490, 330]]
      .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + 8} ${(y1 + y2) / 2} ${x2} ${y2}" stroke="#6f6680" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`).join("");
    return `<svg viewBox="0 ${-SKY} 600 ${640 + SKY}" aria-hidden="true">
      <defs>
        <linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9fe0"/><stop offset=".55" stop-color="#bcd3f2"/><stop offset="1" stop-color="#f6dcb6"/></linearGradient>
        <linearGradient id="trock" x1="0" y1="0" x2="0" y2="640" gradientUnits="userSpaceOnUse"><stop offset=".08" stop-color="#c9c4d6"/><stop offset=".3" stop-color="#a59db3"/><stop offset=".52" stop-color="#8a8196"/></linearGradient>
        <linearGradient id="tmeadow" x1="0" y1="440" x2="0" y2="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5f9e4f"/><stop offset=".35" stop-color="#78b862"/><stop offset="1" stop-color="#8cc66f"/></linearGradient>
        <linearGradient id="tforest" x1="0" y1="320" x2="0" y2="500" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#244a34"/><stop offset="1" stop-color="#3b6e44"/></linearGradient>
        <linearGradient id="tsnow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f5fc"/><stop offset="1" stop-color="#cdd9ee"/></linearGradient>
        <clipPath id="tclip"><path d="${mtn}"/></clipPath>
      </defs>
      <rect y="${-SKY}" width="600" height="${640 + SKY}" fill="url(#tsky)"/>
      <circle cx="92" cy="74" r="24" fill="#fff6d8" opacity=".85"/>
      <path d="M0 330 L60 250 L110 280 L170 200 L230 250 L290 170 L350 230 L420 160 L480 220 L540 180 L600 240 L600 640 L0 640Z" fill="#9db0d6" opacity=".55"/>
      <path d="M-10 380 L80 300 L150 340 L250 280 L330 320 L430 270 L520 310 L610 290 L610 640 L-10 640Z" fill="#8fa5cc" opacity=".45"/>
      <g clip-path="url(#tclip)">
        <rect width="600" height="640" fill="url(#trock)"/>
        <path d="M300 16 L338 30 L390 62 L445 115 L495 180 L545 260 L600 340 L600 640 L380 640 Q360 400 330 260 Q315 120 300 16Z" fill="#3a2f5a" opacity=".16"/>
        ${ribs}
        <path d="M150 128 Q200 150 240 118 Q275 140 305 112 Q335 140 370 118 Q410 150 452 128 L390 62 L338 30 L300 16 L262 30 L210 62Z" fill="url(#tsnow)"/>
        <!-- Gletscher: Eiszunge vom Schneefeld talwärts, verjüngt sich in einer Rinne, unten zerklüftet; seitlich Moräne -->
        <path d="M244 126 Q252 160 270 186 Q284 208 288 232 Q290 250 296 262 L302 254 L308 266 L314 255 L320 264 L325 252 Q332 236 336 214 Q342 188 356 162 Q368 140 372 124 Q340 132 306 120 Q276 132 244 126Z" fill="#e6f0fb"/>
        <path d="M306 120 Q312 170 316 214 Q318 240 314 255 L320 264 L325 252 Q332 236 336 214 Q342 188 356 162 Q368 140 372 124 Q340 132 306 120Z" fill="#c4d7ef"/>
        <path d="M262 156 q12 5 24 -1 M300 150 q14 6 28 -1 M276 186 q10 4 20 -1 M310 182 q12 5 24 -1 M288 214 q9 4 18 -1 M314 212 q9 4 18 0 M296 238 q8 3 16 0"
          stroke="#93add6" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M240 130 Q250 170 268 196 Q282 220 286 250 Q290 266 300 272" stroke="#7d7488" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="1 6" opacity=".7"/>
        <path d="M376 128 Q366 158 350 184 Q338 212 334 240 Q330 262 322 272" stroke="#7d7488" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="1 6" opacity=".7"/>
        <path d="${forestFloor}" fill="url(#tforest)"/>
        <path d="M0 640 L0 470 Q80 450 160 466 Q250 486 330 462 Q420 438 500 458 Q560 472 600 462 L600 640Z" fill="url(#tmeadow)"/>
        ${trees.filter((t) => t.y < 360).map(spruce).join("")}
        <path d="M${BROOK.map((p) => p.join(" ")).join(" L")}" stroke="#7fc3ee" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M${BROOK.map((p) => p.join(" ")).join(" L")}" stroke="#d8f0ff" stroke-width="1.5" fill="none" opacity=".8" stroke-dasharray="6 10"/>
        ${trees.filter((t) => t.y >= 360).sort((a, b) => a.y - b.y).map(spruce).join("")}
        ${flowers.join("")}
      </g>
      <path d="${mtn}" fill="none" stroke="#4d4466" stroke-width="2" opacity=".35"/>
      <path d="${line(pts)}" fill="none" stroke="#fff8e6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
      <path d="${line(pts)}" fill="none" stroke="#7a4e2a" stroke-width="3.5" stroke-dasharray="2 7" stroke-linecap="round"/>
      ${doneUpTo > 0 ? `<path d="${line(pts.slice(0, doneUpTo + 1))}" fill="none" stroke="#ffc83d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
    </svg>`;
  }

  const stars = (k) => "★".repeat(k) + "☆".repeat(3 - k);
  function mapHtml(s) {
    const canPick = may(), prog = s.prog;
    const unlocked = (n) => n === 1 || !!prog[n - 1];
    const next = SG.PLAN.find((l) => SG.playable(l.n) && !prog[l.n]);
    if (mapSel == null) mapSel = next ? next.n : 1;
    let doneUpTo = 0;
    ROUTE.forEach((r, i) => { if (r[0] === "L" && prog[r[1]]) doneUpTo = i; if (r[0] === "H" && SG.PLAN.filter((l) => l.w === r[1]).every((l) => prog[l.n])) doneUpTo = i; });
    const totS = SG.PLAN.reduce((a, l) => a + ((prog[l.n] || {}).stars || 0), 0), totE = SG.PLAN.reduce((a, l) => a + ((prog[l.n] || {}).edel || 0), 0);
    const nodes = ROUTE.map((r) => {
      if (r[0] === "H") { const w = SG.WORLDS[r[1] - 1], plan = !SG.PLAN.filter((l) => l.w === w.n).every((l) => SG.playable(l.n));
        return `<div class="tour-hut ${plan ? "plan" : ""} ${w.n === 5 ? "peak" : ""}" style="left:${r[2]}%;top:${r[3]}%"><span class="hut-ico">${HUT_SVG[w.n]}</span><b>${w.hut}</b></div>`; }
      const l = SG.PLAN[r[1] - 1], pr = prog[l.n], ok = SG.playable(l.n) && unlocked(l.n);
      const cls = !SG.playable(l.n) ? "plan" : pr ? "done" : !ok ? "lock" : next && next.n === l.n ? "next" : "";
      return `<button class="tour-node ${cls} ${mapSel === l.n ? "sel" : ""} ${l.w === 5 ? "side" : ""}" style="left:${r[2]}%;top:${r[3]}%" data-sel="${l.n}" title="${esc(l.name)}"><i>${!SG.playable(l.n) || ok ? l.n : "🔒"}</i><b>${esc(l.name)}</b>${pr ? `<em>${stars(pr.stars)}</em>` : ""}</button>`;
    }).join("");
    const worldTags = [1, 2, 3, 4, 5].map((n) => `<span class="tour-world" style="top:${ROUTE[(n - 1) * 4 + 1][3]}%">Welt ${n} · ${SG.WORLDS[n - 1].name}</span>`).join("");
    const l = SG.PLAN[mapSel - 1], pr = prog[l.n], ok = SG.playable(l.n) && unlocked(l.n);
    const tag = !SG.playable(l.n) ? `<span class="tag plan">geplant</span>` : pr ? `<span class="tag ok">geschafft · ${stars(pr.stars)}</span>` : ok ? `<span class="tag">spielbar</span>` : `<span class="tag">🔒 erst Level ${l.n - 1} schaffen</span>`;
    const team = s.mode === "solo" ? `🙋 <b>${esc(nameOf(s.roles.kraxler))}</b> spielt allein – beide Figuren, <b>Q</b> wechselt`
      : `🧔 Kraxler: <b>${esc(nameOf(s.roles.kraxler))}</b> · 🐐 Gams: <b>${esc(nameOf(s.roles.gams))}</b>${G.isHost ? ` <button class="btn ghost sm" id="sg-swap">⇄ tauschen</button>` : ""}`;
    return `<div class="tour"><div class="tour-head"><h2>🗺️ Tourenkarte</h2><small>Vom Tal bis zum Gipfelkreuz · 5 Welten, 15 Etappen</small></div>
      <div class="tour-team">${team}</div>
      <div class="tour-map">${mapSvg(doneUpTo)}${worldTags}${nodes}</div>
      <div class="tour-info"><div class="ti-h"><b>Level ${l.n}: ${esc(l.name)}</b>${tag}<span class="sp"></span><small>Welt ${l.w} · ${SG.WORLDS[l.w - 1].name}</small></div>
        <p>${esc(l.idea)}</p>
        <div class="row"><small>⭐ ${totS}/${SG.PLAN.length * 3} · Edelweiß ${totE}/${SG.PLAN.length * 3} · spielbar: Level 1–${SG.LEVELS.length}</small><span class="sp"></span>
          ${ok && canPick ? `<button class="btn primary" data-go="${l.n}">Los geht's ➜</button>` : ok ? `<small>Die Seilschaft wählt das Level …</small>` : ""}</div></div></div>`;
  }
  function wonHtml(s) {
    const w = s.won, canPick = may(), last = L.n % 3 === 0, wNow = SG.WORLDS[Math.ceil(L.n / 3) - 1], wNext = SG.WORLDS[Math.ceil(L.n / 3)];
    const time = (x) => `${Math.floor(x / 60)}:${String(x % 60).padStart(2, "0")}`;
    const inW = SG.PLAN.filter((x) => x.w === wNow.n), wS = inW.reduce((a, x) => a + ((s.prog[x.n] || {}).stars || 0), 0), wE = inW.reduce((a, x) => a + ((s.prog[x.n] || {}).edel || 0), 0);
    const btns = canPick ? `<div class="row"><button class="btn ghost" data-a="again">Nochmal</button><button class="btn ghost" data-a="map">Karte</button>${SG.playable(L.n + 1) ? `<button class="btn primary" data-a="next">Weiter ➜</button>` : ""}</div>`
      : `<p class="muted2">Die Seilschaft entscheidet, wie es weitergeht …</p>`;
    return last ? `<div class="sg-card"><div class="big hut-big">${HUT_SVG[wNow.n]}</div><h2>${wNow.hut} erreicht!</h2>
        <p>Welt ${wNow.n} geschafft – Zeit für eine Rast: Kaiserschmarrn mit Preiselbeeren und ein Krug Buttermilch.</p>
        <div class="stats"><span>${stars(w.stars)}</span><span>Edelweiß ${w.edel}/${SG.edelMax(L)}</span><span>⏱ ${time(w.secs)}</span></div>
        <p class="muted2">Gesamt Welt ${wNow.n}: ⭐ ${wS}/9 · Edelweiß ${wE}/9${wNext ? `<br>Nächste Welt: ${wNext.name}${SG.playable(L.n + 1) ? "" : " – geplant, siehe Tourenkarte"}` : ""}</p>${btns}</div>`
      : `<div class="sg-card"><div class="big">⛳</div><h2>Etappe ${L.n} geschafft!</h2>
        <div class="stats"><span>${stars(w.stars)}</span><span>Edelweiß ${w.edel}/${SG.edelMax(L)}</span><span>⏱ ${time(w.secs)} <small>(Ziel ${time(L.par)})</small></span></div>
        <p class="muted2">Sterne: ⭐ geschafft · ⭐ alle Edelweiß · ⭐ unter der Zielzeit</p>${btns}</div>`;
  }

  // ---------- Bildschirm ----------
  function renderSeil() {
    const v = G.view, s = st();
    if (!s) return;
    if (s.step !== "map" && (cur.gid !== s.gid || cur.seq !== s.seq) && s.lv) loadLevel(s.lv, s.seq);
    if (s.step === "won" && !built?.includes("|won")) SND.win();
    const key = [s.gid, s.step, s.step === "map" ? JSON.stringify(s.prog) + s.roles.kraxler + s.roles.gams + mapSel : s.seq, G.isHost].join("|");
    const meta = s.step === "map" ? "Tourenkarte" : `Level ${L.n}: ${esc(L.name)}`;
    if (built !== key) {
      built = key;
      const touch = myRoles().length && s.step === "play" ? `<div class="sg-touch"><div><button data-k="l" aria-label="links">◀</button><button data-k="r" aria-label="rechts">▶</button></div>
          <div>${myRoles().length === 2 ? `<button data-k="sw" aria-label="Figur wechseln">⇄</button>` : ""}<button data-k="j" aria-label="springen">⤒</button></div></div>` : "";
      app.innerHTML = `<main class="screen game seil">
        <header class="top topbar">${headBrandHtml("seil")}<div class="meta">${meta}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>${topActionsHtml()}</header>
        <div class="sg-status">${statusBarHtml()}</div>
        <section class="sg-main">${s.step === "map" ? mapHtml(s) : `<div class="sg-game"><canvas class="sg-cv"></canvas><div class="sg-hud"></div>${s.step === "won" ? `<div class="sg-over">${wonHtml(s)}</div>` : ""}</div>${touch}
          ${s.step === "play" ? `<p class="sg-keys">${myRoles().length ? `←/→ oder A/D laufen · ↑/W/Leertaste springen (länger = höher)${myRoles().length === 2 ? " · <b>Q</b> Figur wechseln" : ""} · R neu starten · Esc Tourenkarte` : "Du schaust der Seilschaft zu."}</p>` : ""}`}</section></main>`;
      bind(s);
      if (s.step !== "map") { cv = app.querySelector(".sg-cv"); ctx = cv.getContext("2d"); resize(); if (!loopOn) { loopOn = true; last = performance.now(); requestAnimationFrame(frame); } }
    } else {
      const sb = app.querySelector(".sg-status"); if (sb) { const h = statusBarHtml(); if (sb.innerHTML !== h) sb.innerHTML = h; }
    }
  }
  function bind(s) {
    const on = (sel, fn) => { const el = app.querySelector(sel); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#sg-swap", () => send({ type: "sgSwap" }));
    app.querySelectorAll("[data-sel]").forEach((b) => b.onclick = () => { mapSel = +b.dataset.sel; built = null; renderSeil(); });
    app.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => send({ type: "sgLevel", lv: +b.dataset.go }));
    app.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => { const a = b.dataset.a;
      if (a === "again") send({ type: "sgLevel", lv: L.n }); else if (a === "next") send({ type: "sgLevel", lv: L.n + 1 }); else send({ type: "sgMap" }); });
    app.querySelectorAll(".sg-touch button").forEach((b) => {
      const k = b.dataset.k;
      const down = (e) => { e.preventDefault(); b.classList.add("on"); if (k === "sw") { switchFig(); return; } if (k === "j" && !keys.j) jumpQueued = true; keys[k] = true; };
      const up = (e) => { e.preventDefault(); b.classList.remove("on"); if (k !== "sw") keys[k] = false; };
      b.addEventListener("pointerdown", down); b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("pointerleave", up);
    });
  }
  // Testhilfe (nur für die automatischen Tests)
  window.__seilView = { bodies: () => bodies, boulders: () => boulders, keys, jump: () => { jumpQueued = true; }, setActive: (w) => { active = w; }, open: () => S.open, L: () => L };

  return { renderSeil };
});
