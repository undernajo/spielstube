// Almsommer – Roll & Write mit Südtirol-Bezug (läuft beim Gastgeber, testbar in Node). Zustand in s.alm.
//
// Regeln:
//  1. Jede Woche fallen 3 Würfel – für alle dieselben. Jeder Würfel zeigt Gelände und Zahl. Jeder nimmt einen (auch denselben).
//  2. Kreuze bis zu so viele Felder dieses Geländes an – zusammenhängend und angrenzend an Angekreuztes (Start: Hof).
//  3. Jede Fläche hat eine Zahl. Ist sie ganz angekreuzt, bekommst du diese Punkte.
//     Wer eine Fläche mit Hütte oder Gipfel als Erster fertig macht (gleiche Woche = alle), bekommt +2.
//  4. Zeigt ein Würfel ⚡, gibt's ein Gewitter. Beim 5. Gewitter ist der Sommer vorbei (spätestens nach 14 Wochen).
//
// Abgestimmt per Simulation (4 Computerspieler): 14 Wochen / 5 Gewitter ≈ 12 Wochen im Schnitt, die Hälfte des Tals
// wird angekreuzt; Erstbonus +2 belebt das Rennen, ohne dass der Führende davonzieht (bei +3 schon deutlich mehr).
(function (root) {
  // ---------- Das Tal (11 × 8) ----------
  // Gelände: g Wiese, w Wald, f Fels, b Bach, h Hof (Start)
  const TERRAIN_ROWS = [
    "ffffggbgfff",
    "fffgggbggff",
    "fgggggbgggf",
    "gggggwbgggg",
    "wwggwwbggww",
    "wwwgghbgwww",
    "wwggggbggww",
    "wgggggbbggg",
  ];
  // Flächen (gleicher Buchstabe = eine Fläche für die Wertung); x/y/z = drei Bachabschnitte, H = Hof
  const REGION_ROWS = [
    "aaaaeexlccc",
    "bbbfeexlldd",
    "bggfffxlmmd",
    "ggghhpynmmm",
    "qqhhppynnss",
    "qqqiiHyntts",
    "rrjiikzoott",
    "rjjjkkzzooo",
  ];
  const COLS = TERRAIN_ROWS[0].length, ROWS = TERRAIN_ROWS.length;
  const at = (c, r) => r * COLS + c;
  const HUTS = [at(2, 2), at(8, 2), at(3, 7), at(8, 6)];   // C3, I3, D8, I7
  const PEAKS = [at(0, 0), at(10, 0)];                     // A1, K1
  const START = at(5, 5);                                  // F6 (Hof: grenzt an Wald, Wiese und Bach)
  const TERRAIN = TERRAIN_ROWS.join("").split("");
  const REGION = REGION_ROWS.join("").split("");
  const NAMES = { g: "Wiese", w: "Wald", f: "Fels", b: "Bach", h: "Hof" };
  const REGIONS = {}; // Buchstabe -> Felder (ohne Hof)
  REGION.forEach((k, i) => { if (k !== "H") (REGIONS[k] = REGIONS[k] || []).push(i); });
  const neighbors = (i) => {
    const c = i % COLS, r = Math.floor(i / COLS), out = [];
    if (c > 0) out.push(i - 1); if (c < COLS - 1) out.push(i + 1); if (r > 0) out.push(i - COLS); if (r < ROWS - 1) out.push(i + COLS);
    return out;
  };

  // ---------- Wertung ----------
  const BONUS = { hut: 2, peak: 5, first: 2 }; // Zusatzpunkte einer Fläche je Hütte / Gipfel; Erstbonus auf Hütten- und Gipfelflächen
  const regionValue = (k) => REGIONS[k].length + BONUS.hut * REGIONS[k].filter((i) => HUTS.includes(i)).length
    + BONUS.peak * REGIONS[k].filter((i) => PEAKS.includes(i)).length;
  const SPECIAL = Object.keys(REGIONS).filter((k) => REGIONS[k].some((i) => HUTS.includes(i) || PEAKS.includes(i)));
  const doneRegions = (marked) => Object.keys(REGIONS).filter((k) => REGIONS[k].every((i) => marked.has(i)));

  // ---------- Würfel ----------
  const TERRAIN_FACES = ["g", "g", "w", "f", "b", "sun"]; // Wiese doppelt (häufigstes Gelände), Sonne = beliebiges Gelände
  const NUMBERS = [1, 2, 3, 4, 5];
  const STORM_CHANCE = 1 / 9; // je Würfel – pro Woche ≈ 30 % Gewitter
  const LENGTHS = {
    normal: { name: "Ganzer Sommer", desc: "bis 14 Wochen, beim 5. Gewitter ist Schluss", weeks: 14, storms: 5 },
    kurz: { name: "Kurzer Sommer", desc: "8 Wochen, ohne Gewitter", weeks: 8, storms: 0 },
  };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  // Zug prüfen (auch in der Ansicht nutzbar): Brett = Set der angekreuzten Felder
  function checkCells(marked, t, cells, max) {
    if (!NAMES[t] || t === "h") return "Bitte ein Gelände für die Sonne wählen.";
    if (!Array.isArray(cells) || !cells.length) return "Mindestens ein Feld ankreuzen.";
    if (cells.length > max) return `Höchstens ${max} ${max === 1 ? "Feld" : "Felder"}.`;
    const set = new Set(cells);
    if (set.size !== cells.length) return "Jedes Feld nur einmal.";
    for (const i of cells) {
      if (!Number.isInteger(i) || i < 0 || i >= TERRAIN.length) return "Ungültiges Feld.";
      if (marked.has(i)) return "Das Feld ist schon angekreuzt.";
      if (TERRAIN[i] !== t) return `Nur ${NAMES[t]}-Felder.`;
    }
    const seen = new Set([cells[0]]), q = [cells[0]];
    while (q.length) { const i = q.pop(); for (const j of neighbors(i)) if (set.has(j) && !seen.has(j)) { seen.add(j); q.push(j); } }
    if (seen.size !== cells.length) return "Die Felder müssen zusammenhängen.";
    if (!cells.some((i) => neighbors(i).some((j) => marked.has(j)))) return "Die Felder müssen an schon Angekreuztes grenzen.";
    return null;
  }

  // ---------- Spielablauf ----------
  function start(s, opts) {
    opts = opts || {};
    const length = LENGTHS[opts.length] ? opts.length : "normal";
    // Querbeet: eigene Wochenzahl / ohne Gewitter (free)
    const weeks = opts.free && Number.isInteger(opts.weeks) && opts.weeks > 0 && opts.weeks <= 20 ? opts.weeks : LENGTHS[length].weeks;
    const storms = opts.free && Number.isInteger(opts.storms) && opts.storms >= 0 ? opts.storms : LENGTHS[length].storms;
    const seats = s.players.filter((p) => p.connected).map((p) => p.id);
    if (!seats.length) return false;
    s.game = "alm"; s.phase = "alm";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.alm = { opts: { length }, weeks, stormLimit: storms, week: 0, storms: 0, seats, dice: null, step: "play", done: {},
      boards: Object.fromEntries(seats.map((id) => [id, [START]])), extra: Object.fromEntries(seats.map((id) => [id, 0])),
      claimed: {}, news: [], endReason: "", winners: null };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    nextWeek(s);
    return true;
  }

  const total = (st, id) => doneRegions(new Set(st.boards[id])).reduce((a, k) => a + regionValue(k), 0) + (st.extra[id] || 0);

  function nextWeek(s) {
    const st = s.alm;
    if (st.week >= st.weeks) return finish(s, "weeks");
    st.week++; st.done = {};
    // ohne Gewitter (kurzer Sommer) zeigen die Würfel auch kein ⚡
    st.dice = [0, 1, 2].map(() => (st.stormLimit && Math.random() < STORM_CHANCE ? { storm: true } : { t: rnd(TERRAIN_FACES), n: rnd(NUMBERS) }));
    if (st.stormLimit && st.dice.some((d) => d.storm)) {
      st.storms++;
      if (st.storms >= st.stormLimit) return finish(s, "storm");
    }
  }
  function finish(s, reason) {
    const st = s.alm;
    st.step = "final"; st.endReason = reason;
    const best = Math.max(...st.seats.map((id) => total(st, id)));
    st.winners = st.seats.filter((id) => total(st, id) === best);
  }

  // Woche abschließen: Erstbonus für Hütten-/Gipfelflächen, die in dieser Woche zum ersten Mal jemand fertig hat
  function endWeek(s) {
    const st = s.alm, fresh = {};
    st.seats.forEach((id) => doneRegions(new Set(st.boards[id])).forEach((k) => {
      if (SPECIAL.includes(k) && !st.claimed[k]) (fresh[k] = fresh[k] || []).push(id);
    }));
    for (const [k, ids] of Object.entries(fresh)) {
      st.claimed[k] = { ids, week: st.week };
      ids.forEach((id) => { st.extra[id] = (st.extra[id] || 0) + BONUS.first; });
      st.news.push({ week: st.week, k, ids });
    }
    nextWeek(s);
  }

  // Gastgeber prüft regelmäßig: sind alle (verbundenen) Mitspieler fertig?
  const activeSeats = (s) => s.alm.seats.filter((id) => (s.players.find((p) => p.id === id) || {}).connected);
  function tick(s) {
    if (s.phase !== "alm" || !s.alm || s.alm.step !== "play") return false;
    const act = activeSeats(s);
    if (act.length && act.every((id) => s.alm.done[id])) { endWeek(s); return true; }
    return false;
  }

  function apply(s, pid, a) {
    if (!a || typeof a !== "object" || !s.alm) return false;
    const st = s.alm, seated = st.seats.includes(pid);
    switch (a.type) {
      case "almMove": {
        if (st.step !== "play" || !seated || st.done[pid] || a.week !== st.week) return false;
        const d = st.dice[a.di];
        if (!d || d.storm) return false;
        const t = d.t === "sun" ? a.terrain : d.t, marked = new Set(st.boards[pid]);
        if (checkCells(marked, t, a.cells, d.n)) return false;
        st.boards[pid] = st.boards[pid].concat(a.cells);
        st.done[pid] = { di: a.di, n: a.cells.length };
        tick(s);
        return true;
      }
      case "almRest":
        if (st.step !== "play" || !seated || st.done[pid] || a.week !== st.week) return false;
        st.done[pid] = { rest: true };
        tick(s);
        return true;
      case "almRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts);
    }
    return false;
  }

  function publicState(s) {
    const st = s.alm;
    if (!st) return null;
    return {
      step: st.step, week: st.week, weeks: st.weeks, storms: st.storms, stormLimit: st.stormLimit, dice: st.dice, seats: st.seats,
      boards: st.boards, done: Object.keys(st.done), totals: Object.fromEntries(st.seats.map((id) => [id, total(st, id)])),
      extra: st.extra, claimed: st.claimed, news: st.news.slice(-6), endReason: st.endReason, winners: st.winners,
      lengthName: LENGTHS[st.opts.length].name,
    };
  }

  root.S10Alm = { start, apply, tick, publicState, checkCells, regionValue, doneRegions, neighbors,
    COLS, ROWS, TERRAIN, REGION, REGIONS, HUTS, PEAKS, START, NAMES, SPECIAL, BONUS, LENGTHS };
})(typeof window !== "undefined" ? window : globalThis);
