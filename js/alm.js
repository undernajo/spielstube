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
// Gipfel sind ein Langzeitziel: jede Gipfelfläche ist ein ganzes Felsmassiv (7–10 Felder) weit weg vom Hof. Wer gezielt
// auf beide Gipfel geht, schafft das nur in etwa 4 von 10 Spielen und gewinnt nicht öfter als die anderen
// (vorher: 3–4 Fels-Felder je Gipfel, beide Gipfel bis Woche 8 und deutlich zu oft der Sieg).
(function (root) {
  // ---------- Die Täler (alle 11 × 8, damit Bedienung und Bildschirmaufteilung gleich bleiben) ----------
  // Gelände: g Wiese, w Wald, f Fels, b Bach, h Hof (Start). Flächen: gleicher Buchstabe = eine Fläche für die Wertung, H = Hof.
  // Regeln für jedes Tal (geprüft): Hof grenzt an Wiese, Wald und Bach; Flächen 3–6 Felder (Gipfelmassive 7–10),
  // ein Gelände, zusammenhängend;
  // 4 Hütten auf Wiesen, 2 Gipfel auf Fels; ähnliche Geländeanteile, damit die Würfel überall gleich gut passen.
  const MAP_DEFS = {
    hochtal: { name: "Hochtal", desc: "der Bach mitten durchs Tal, Gipfel in beiden oberen Ecken",
      terrain: ["ffffggbgfff", "fffgggbgfff", "fgggggbgggf", "gggggwbgggg", "wwggwwbggww", "wwwgghbgwww", "wwggggbggww", "wgggggbbggg"],
      region: ["aaaaeexlccc", "aaafeexlccc", "aggfffxlmmc", "ggghhpynmmm", "qqhhppynnss", "qqqiiHyntts", "rrjiikzoott", "rjjjkkzzooo"],
      huts: [[2, 2], [8, 2], [3, 7], [8, 6]], peaks: [[0, 0], [10, 0]], start: [5, 5] },
    bergsee: { name: "Bergsee", desc: "ein See in der Mitte, der Bach fließt zum Hof hinunter",
      terrain: ["fffgggggfff", "fffggbbgfff", "fgggbbbbggf", "gggggbbgggg", "wwgggbgggww", "wwwggbggwww", "wwggwhgggww", "gggwwgggggw"],
      region: ["aaaeefffccc", "aaaeexxfccc", "agggxxyyhhc", "jjjkkzyiihh", "ppkkkziiiss", "qppllznntts", "qqllrHnnntt", "mmmrrooooot"],
      huts: [[3, 1], [8, 2], [2, 6], [7, 7]], peaks: [[1, 0], [9, 0]], start: [5, 6] },
    waldhang: { name: "Waldhang", desc: "dichte Wälder an den Seiten, der Bach quer durchs untere Tal, oben ein Felsgrat mit zwei Gipfeln und einem Joch dazwischen",
      terrain: ["gffffgfffgg", "ggfffgfffgw", "wgfffgfffww", "wwggggggwww", "wwwwhggggww", "wwbbbbggggw", "gggggbbbggg", "gggggggbbbg"],
      region: ["eaaaajcccgg", "eeaaajcccgr", "peaaajcccsr", "ppiiijjjssr", "pqqqHjjkksr", "qqxxxykkklr", "mmnnnyyzlll", "mmnnooozzzl"],
      huts: [[1, 1], [9, 1], [2, 7], [9, 6]], peaks: [[3, 0], [7, 0]], start: [4, 4] },
  };
  const NAMES = { g: "Wiese", w: "Wald", f: "Fels", b: "Bach", h: "Hof" };
  const BONUS = { hut: 2, peak: 5, first: 2 }; // Zusatzpunkte einer Fläche je Hütte / Gipfel; Erstbonus auf Hütten- und Gipfelflächen

  // Tal aufbauen: alles, was mit Feldern rechnet, hängt am Tal
  function buildMap(id) {
    const d = MAP_DEFS[id];
    const COLS = d.terrain[0].length, ROWS = d.terrain.length, at = (c, r) => r * COLS + c;
    const TERRAIN = d.terrain.join("").split(""), REGION = d.region.join("").split("");
    const HUTS = d.huts.map(([c, r]) => at(c, r)), PEAKS = d.peaks.map(([c, r]) => at(c, r)), START = at(...d.start);
    const REGIONS = {}; // Buchstabe -> Felder (ohne Hof)
    REGION.forEach((k, i) => { if (k !== "H") (REGIONS[k] = REGIONS[k] || []).push(i); });
    const neighbors = (i) => {
      const c = i % COLS, r = Math.floor(i / COLS), out = [];
      if (c > 0) out.push(i - 1); if (c < COLS - 1) out.push(i + 1); if (r > 0) out.push(i - COLS); if (r < ROWS - 1) out.push(i + COLS);
      return out;
    };
    // Wert einer Fläche: Felder + Zusatzpunkte je Hütte / Gipfel (steht auf der Karte)
    const regionValue = (k) => REGIONS[k].length + BONUS.hut * REGIONS[k].filter((i) => HUTS.includes(i)).length
      + BONUS.peak * REGIONS[k].filter((i) => PEAKS.includes(i)).length;
    const SPECIAL = Object.keys(REGIONS).filter((k) => REGIONS[k].some((i) => HUTS.includes(i) || PEAKS.includes(i)));
    const doneRegions = (marked) => Object.keys(REGIONS).filter((k) => REGIONS[k].every((i) => marked.has(i)));
    // Zug prüfen (auch in der Ansicht nutzbar): marked = Set der angekreuzten Felder
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
    return { id, name: d.name, desc: d.desc, COLS, ROWS, TERRAIN, REGION, REGIONS, HUTS, PEAKS, START, SPECIAL, neighbors, regionValue, doneRegions, checkCells };
  }
  const MAPS = Object.fromEntries(Object.keys(MAP_DEFS).map((id) => [id, buildMap(id)]));
  const map = (id) => MAPS[id] || MAPS.hochtal;

  // ---------- Würfel ----------
  const TERRAIN_FACES = ["g", "g", "w", "f", "b", "sun"]; // Wiese doppelt (häufigstes Gelände), Sonne = beliebiges Gelände
  const NUMBERS = [1, 2, 3, 4, 5];
  const STORM_CHANCE = 1 / 9; // je Würfel – pro Woche ≈ 30 % Gewitter
  const LENGTHS = {
    normal: { name: "Ganzer Sommer", desc: "bis 14 Wochen, beim 5. Gewitter ist Schluss", weeks: 14, storms: 5 },
    kurz: { name: "Kurzer Sommer", desc: "8 Wochen, ohne Gewitter", weeks: 8, storms: 0 },
  };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- Spielablauf ----------
  function start(s, opts) {
    opts = opts || {};
    const length = LENGTHS[opts.length] ? opts.length : "normal";
    // Tal: fest gewählt oder „zufall“ (bei „Nochmal spielen“ wird dann neu gelost)
    const mapChoice = opts.map === "zufall" || MAP_DEFS[opts.map] ? opts.map : "hochtal";
    const mapId = mapChoice === "zufall" ? rnd(Object.keys(MAP_DEFS)) : mapChoice;
    // Querbeet: eigene Wochenzahl / ohne Gewitter (free)
    const weeks = opts.free && Number.isInteger(opts.weeks) && opts.weeks > 0 && opts.weeks <= 20 ? opts.weeks : LENGTHS[length].weeks;
    const storms = opts.free && Number.isInteger(opts.storms) && opts.storms >= 0 ? opts.storms : LENGTHS[length].storms;
    const seats = s.players.filter((p) => p.connected).map((p) => p.id);
    if (!seats.length) return false;
    s.game = "alm"; s.phase = "alm";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    // pending: Kreuze der laufenden Woche – erst am Wochenende ins Tal übernommen (die anderen sehen sie erst nach ihrem eigenen Zug)
    s.alm = { opts: { length, map: mapChoice }, map: mapId, weeks, stormLimit: storms, week: 0, storms: 0, seats, dice: null, step: "play", done: {}, pending: {},
      boards: Object.fromEntries(seats.map((id) => [id, [MAPS[mapId].START]])), extra: Object.fromEntries(seats.map((id) => [id, 0])),
      claimed: {}, news: [], endReason: "", winners: null };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    nextWeek(s);
    return true;
  }

  const total = (st, id, cells) => { const M = map(st.map); return M.doneRegions(new Set(cells || st.boards[id])).reduce((a, k) => a + M.regionValue(k), 0) + (st.extra[id] || 0); };

  function nextWeek(s) {
    const st = s.alm;
    if (st.week >= st.weeks) return finish(s, "weeks");
    st.week++; st.done = {}; st.pending = {};
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
    const st = s.alm, fresh = {}, M = map(st.map);
    for (const [id, cells] of Object.entries(st.pending)) st.boards[id] = st.boards[id].concat(cells);
    st.pending = {};
    st.seats.forEach((id) => M.doneRegions(new Set(st.boards[id])).forEach((k) => {
      if (M.SPECIAL.includes(k) && !st.claimed[k]) (fresh[k] = fresh[k] || []).push(id);
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
        if (map(st.map).checkCells(marked, t, a.cells, d.n)) return false;
        st.pending[pid] = a.cells.slice();
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
      map: st.map, mapName: map(st.map).name, step: st.step, week: st.week, weeks: st.weeks, storms: st.storms, stormLimit: st.stormLimit, dice: st.dice, seats: st.seats,
      boards: st.boards, pending: st.pending || {}, done: Object.keys(st.done), totals: Object.fromEntries(st.seats.map((id) => [id, total(st, id)])),
      // Punkte inklusive der Kreuze dieser Woche (nur für Spieler, die ihren Zug schon gemacht haben)
      totalsLive: Object.fromEntries(st.seats.map((id) => [id, total(st, id, st.boards[id].concat((st.pending || {})[id] || []))])),
      extra: st.extra, claimed: st.claimed, news: st.news.slice(-6), endReason: st.endReason, winners: st.winners,
      lengthName: LENGTHS[st.opts.length].name,
    };
  }

  // map(id): Tal mit Feldern und Rechenfunktionen; MAP_LIST für die Auswahl in der Lobby
  const MAP_LIST = Object.entries(MAP_DEFS).map(([id, d]) => ({ id, name: d.name, desc: d.desc }));
  root.S10Alm = { start, apply, tick, publicState, map, MAP_LIST, NAMES, BONUS, LENGTHS };
})(typeof window !== "undefined" ? window : globalThis);
