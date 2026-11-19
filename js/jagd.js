// Auf der Jagd – Spiellogik (läuft beim Gastgeber). Jeder versteckt sein Wild im eigenen Revier,
// dann schießen alle gleichzeitig: jede Runde ein Schuss ins Revier des Nachbarn (im Kreis: jeder jagt bei genau einem).
//
// Regeln:
//  1. Revier 9 × 9, Gelände für alle gleich. Wild: Fuchs 1 Feld (überall), Hirschpaar 2 (Wald), Gamsrudel 3 (Fels),
//     Murmeltier-Kolonie 4 (Wiese). Formen frei, aber zusammenhängend; verschiedene Tiere berühren sich nicht.
//  2. Schuss: Treffer / 🐾 Fuchsspur (der Fuchs steht direkt daneben) / nichts – sofort aufgelöst und für alle sichtbar.
//  3. Hochsitz: einmal pro Partie, kostet keinen Schuss – 3 × 3 beobachten (nur man selbst sieht das Ergebnis).
//  4. Punkte: jeder Treffer +1, wer ein Tier fertig macht, erlegt es (+ Bonus je Tier). Ende nach der Rundenzahl (kurz 12,
//     lang 20; „ganze Jagd“ ohne Grenze) oder sobald
//     jemand das Revier seines Nachbarn leergejagt hat (am Ende dieser Runde). Meiste Punkte gewinnt.
(function (root) {
  // ---------- Revier ----------
  const MAP = ["fffffgfff", "fffggggff", "ffgggggff", "gggwwgggf", "ggwwwwggf", "wwwwggwww", "wwgggggww", "gggggwwgg", "ggwwwgfff"];
  const N = 9, CELLS = N * N, T = MAP.join("").split("");
  const NAMES = { g: "Wiese", w: "Wald", f: "Fels" };
  const rc = (i) => [Math.floor(i / N), i % N], at = (r, c) => r * N + c;
  const nb4 = (i) => { const [r, c] = rc(i), o = []; if (r) o.push(i - N); if (r < N - 1) o.push(i + N); if (c) o.push(i - 1); if (c < N - 1) o.push(i + 1); return o; };
  const area3 = (center) => { const [r, c] = rc(center), o = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < N && cc >= 0 && cc < N) o.push(at(rr, cc)); } return o; };

  // ---------- Wild ----------
  // kill: Bonus fürs Erlegen (kleine Tiere sind schwerer zu finden)
  const ANIMALS = [
    { id: "fuchs", name: "Fuchs", terr: null, len: 1, kill: 4 },
    { id: "hirsch", name: "Hirschpaar", terr: "w", len: 2, kill: 2 },
    { id: "gams", name: "Gamsrudel", terr: "f", len: 3, kill: 3 },
    { id: "murmel", name: "Murmeltier-Kolonie", terr: "g", len: 4, kill: 4 },
  ];
  const HIT = 1;
  // ganze Jagd: bis jemand alles Wild seines Nachbarn erlegt hat (spätestens nach 81 Runden ist jedes Revier leer)
  const LENGTHS = { kurz: { name: "Kurze Jagd", rounds: 12, desc: "12 Runden" }, normal: { name: "Lange Jagd", rounds: 20, desc: "20 Runden" },
    ganz: { name: "Ganze Jagd", rounds: CELLS, open: true, desc: "bis einer alles Wild seines Nachbarn erlegt hat" } };

  const connected = (cells) => { if (!cells.length) return true; const seen = new Set([cells[0]]), q = [cells[0]];
    while (q.length) { const i = q.pop(); for (const j of nb4(i)) if (cells.includes(j) && !seen.has(j)) { seen.add(j); q.push(j); } } return seen.size === cells.length; };
  // passt das Tier hierhin? Gelände, zusammenhängend, kein anderes Tier auf oder direkt neben den Feldern
  function fits(a, cells, occupied) {
    if (!Array.isArray(cells) || cells.length !== a.len || new Set(cells).size !== cells.length || !connected(cells)) return false;
    for (const i of cells) {
      if (!Number.isInteger(i) || i < 0 || i >= CELLS) return false;
      if (a.terr && T[i] !== a.terr) return false;
      if (occupied.has(i) || nb4(i).some((j) => occupied.has(j) && !cells.includes(j))) return false;
    }
    return true;
  }
  // alle möglichen Verstecke eines Tiers (zusammenhängende Formen auf passendem Gelände), einmal berechnet
  const PLACE = {};
  function allPlacements(a) {
    if (PLACE[a.id]) return PLACE[a.id];
    const ok = (i) => !a.terr || T[i] === a.terr, seen = new Set(), out = [];
    const grow = (cells) => { const key = cells.slice().sort((x, y) => x - y).join(","); if (seen.has(key)) return; seen.add(key);
      if (cells.length === a.len) { out.push(cells.slice().sort((x, y) => x - y)); return; }
      for (const i of cells) for (const j of nb4(i)) if (ok(j) && !cells.includes(j)) grow(cells.concat(j)); };
    for (let i = 0; i < CELLS; i++) if (ok(i)) grow([i]);
    return (PLACE[a.id] = out);
  }
  function validHide(h) {
    if (!h || typeof h !== "object") return false;
    const occ = new Set();
    for (const a of ANIMALS.slice().sort((x, y) => y.len - x.len)) {
      if (!fits(a, h[a.id], occ)) return false;
      h[a.id].forEach((i) => occ.add(i));
    }
    return true;
  }
  function randomHide() {
    for (let tries = 0; tries < 500; tries++) {
      const occ = new Set(), hide = {};
      let ok = true;
      for (const a of ANIMALS.slice().sort((x, y) => y.len - x.len)) {
        const opts = allPlacements(a).filter((c) => fits(a, c, occ));
        if (!opts.length) { ok = false; break; }
        const c = opts[Math.floor(Math.random() * opts.length)]; hide[a.id] = c.slice(); c.forEach((i) => occ.add(i));
      }
      if (ok) return hide;
    }
    return null;
  }
  const ownerOf = (hide, i) => (hide ? Object.keys(hide).find((k) => hide[k].includes(i)) || null : null);
  // Schussergebnis: Treffer / Fuchsspur (nur der Fuchs hinterlässt Spuren) / nichts
  const resolveShot = (hide, i) => (ownerOf(hide, i) ? "hit" : nb4(i).some((j) => ownerOf(hide, j) === "fuchs") ? "track" : "miss");

  // ---------- Ablauf ----------
  function start(s, opts) {
    opts = opts || {};
    const length = LENGTHS[opts.length] ? opts.length : "normal";
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (seats.length < 2) return false;
    s.game = "jagd"; s.phase = "jagd";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    // Kreis: jeder jagt im Revier des nächsten (Anna → Berta → Chris → Anna); zu zweit jagt man beim anderen
    const target = Object.fromEntries(seats.map((id, k) => [id, seats[(k + 1) % seats.length]]));
    s.jagd = { opts: { length }, rounds: LENGTHS[length].rounds, round: 0, seats, target, step: "hide", hide: {}, ready: {}, cleared: [], cur: [],
      shots: Object.fromEntries(seats.map((id) => [id, {}])), pick: {}, scout: {}, pts: Object.fromEntries(seats.map((id) => [id, 0])),
      kills: [], last: [], news: [], endReason: "", winners: null };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    return true;
  }
  const activeSeats = (s) => s.jagd.seats.filter((id) => (s.players.find((p) => p.id === id) || {}).connected);
  const killed = (st, t, a) => st.kills.some((k) => k.t === t && k.a === a);
  const hasWild = (st, t) => ANIMALS.some((a) => !killed(st, t, a.id));

  function finish(s, reason) {
    const st = s.jagd;
    st.step = "final"; st.endReason = reason; st.pick = {};
    const best = Math.max(...st.seats.map((id) => st.pts[id] || 0));
    st.winners = st.seats.filter((id) => (st.pts[id] || 0) === best);
  }
  // Schuss sofort auflösen (jedes Revier hat nur einen Schützen – das Ergebnis verrät niemandem etwas):
  // Treffer +1, ist das Tier damit ganz getroffen, ist es erlegt (+ Bonus)
  function shoot(s, pid, t, i) {
    const st = s.jagd, r = resolveShot(st.hide[t], i);
    st.shots[t][i] = { r, by: [pid], round: st.round };
    if (r === "hit") st.pts[pid] = (st.pts[pid] || 0) + HIT;
    st.cur.push({ by: pid, t, i, r });
    const a = ANIMALS.find((x) => (st.hide[t][x.id] || []).includes(i));
    if (a && !killed(st, t, a.id) && st.hide[t][a.id].every((c) => st.shots[t][c] && st.shots[t][c].r === "hit")) {
      st.pts[pid] = (st.pts[pid] || 0) + a.kill;
      st.kills.push({ t, a: a.id, cells: st.hide[t][a.id].slice(), by: [pid], round: st.round });
      st.news.push({ round: st.round, t, a: a.id, by: [pid], pts: a.kill + HIT });
    }
  }
  // Runde abschließen, wenn alle geschossen haben: Ende prüfen, sonst nächste Runde
  function endRound(s) {
    const st = s.jagd;
    st.last = st.cur; st.cur = []; st.pick = {};
    st.cleared = st.seats.filter((pid) => !hasWild(st, st.target[pid])); // wer das Revier seines Nachbarn leergejagt hat
    if (st.cleared.length) return finish(s, "leer");
    if (st.round >= st.rounds) return finish(s, "runden");
    st.round++;
  }
  function tick(s) {
    if (s.phase !== "jagd" || !s.jagd) return false;
    const st = s.jagd, act = activeSeats(s);
    if (!act.length) return false;
    if (st.step === "hide" && act.every((id) => st.ready[id])) {
      // wer (getrennt) noch nicht versteckt hat, bekommt ein zufälliges Versteck
      st.seats.forEach((id) => { if (!st.hide[id]) { st.hide[id] = randomHide(); st.ready[id] = true; } });
      st.step = "play"; st.round = 1; return true;
    }
    if (st.step === "play" && act.every((id) => st.pick[id] || !canShoot(st, id))) { endRound(s); return true; }
    return false;
  }
  // geschossen wird nur im Revier des Nachbarn (solange dort noch Wild ist)
  const canShoot = (st, pid) => hasWild(st, st.target[pid]);
  const validTarget = (st, pid, t, i) => t === st.target[pid] && hasWild(st, t) && Number.isInteger(i) && i >= 0 && i < CELLS;

  function apply(s, pid, a) {
    if (!a || typeof a !== "object" || !s.jagd) return false;
    const st = s.jagd, seated = st.seats.includes(pid);
    switch (a.type) {
      case "jgHide": {
        if (st.step !== "hide" || !seated || st.ready[pid]) return false;
        const h = {};
        for (const an of ANIMALS) h[an.id] = Array.isArray(a.hide && a.hide[an.id]) ? a.hide[an.id].map(Number) : null;
        if (!validHide(h)) return false;
        st.hide[pid] = h; st.ready[pid] = true;
        tick(s); return true;
      }
      case "jgShoot": {
        if (st.step !== "play" || !seated || st.pick[pid] || a.round !== st.round) return false;
        const t = st.target[pid], i = Number(a.i);
        if (!validTarget(st, pid, t, i) || st.shots[t][i]) return false;
        st.pick[pid] = { t, i };
        shoot(s, pid, t, i);
        tick(s); return true;
      }
      case "jgScout": { // Hochsitz: kostet keinen Schuss, Ergebnis nur für den Spieler selbst
        if (st.step !== "play" || !seated || st.scout[pid] || st.pick[pid]) return false;
        const t = st.target[pid], c = Number(a.i);
        if (!validTarget(st, pid, t, c)) return false;
        const cells = area3(c).filter((i) => !st.shots[t][i]);
        const seen = {}, res = {}; // seen: Feld → gesichtetes Tier
        cells.forEach((i) => { const o = ownerOf(st.hide[t], i); if (o) seen[i] = o; else res[i] = resolveShot(st.hide[t], i); });
        st.scout[pid] = { t, center: c, cells, seen, res, round: st.round };
        return true;
      }
      case "jgRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts);
    }
    return false;
  }

  // ---------- Was alle sehen dürfen (keine Verstecke!) ----------
  function publicState(s) {
    const st = s.jagd;
    if (!st) return null;
    return {
      step: st.step, round: st.round, rounds: LENGTHS[st.opts.length].open ? null : st.rounds, seats: st.seats, target: st.target, cleared: st.cleared || [], ready: Object.keys(st.ready), picked: Object.keys(st.pick),
      shots: st.shots, kills: st.kills, pts: st.pts, last: st.last, cur: st.cur || [], news: st.news.slice(-8), scoutUsed: Object.keys(st.scout),
      left: Object.fromEntries(st.seats.map((t) => [t, ANIMALS.filter((a) => !killed(st, t, a.id)).map((a) => a.id)])),
      endReason: st.endReason, winners: st.winners, lengthName: LENGTHS[st.opts.length].name,
      // am Ende alle Verstecke aufdecken
      reveal: st.step === "final" ? st.hide : null,
    };
  }
  // ---------- Was nur der Spieler selbst sieht ----------
  function privateState(s, pid) {
    const st = s.jagd;
    if (!st || !st.seats.includes(pid)) return null;
    return { jagd: true, hide: st.hide[pid] || null, scout: st.scout[pid] || null, pick: st.pick[pid] || null, round: st.round };
  }

  root.S10Jagd = { start, apply, tick, publicState, privateState, MAP, N, T, NAMES, ANIMALS, HIT, LENGTHS, nb4, area3, connected, fits, allPlacements, randomHide, validHide, ownerOf };
})(typeof window !== "undefined" ? window : globalThis);
