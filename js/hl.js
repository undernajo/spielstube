// „Höher oder tiefer“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.hl.
(function (root) {
  const LENGTHS = { kurz: { name: "Kurz – 3 Kategorien", cats: 3 }, mittel: { name: "Mittel – 5 Kategorien", cats: 5 }, lang: { name: "Lang – 8 Kategorien", cats: 8 } };
  const PER_CAT = 6;        // so viele Vergleiche pro Kategorie
  const REVEAL_MS = 3500;   // so lange bleibt die Auflösung stehen, dann geht es automatisch weiter
  const data = () => root.SCHLAU10_HL || {};
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Wie schwer ist ein Vergleich? „close“ = sehr knapp, „easy“ = viel zu einseitig (z. B. Blauwal gegen Hausmaus)
  function pairKind(cat, a, b) {
    if (a === b) return "same";
    if (cat.year) { const d = Math.abs(a - b); return d <= 3 ? "close" : d > 80 ? "easy" : "ok"; }
    const r = Math.max(a, b) / Math.min(a, b);
    return r < 1.08 ? "close" : r > 15 ? "easy" : "ok";
  }
  // Kette von Begriffen ziehen: nie gleiche Werte nebeneinander, keine viel zu einseitigen Paare,
  // höchstens ein ganz knapper Vergleich pro Kategorie
  function pickItems(cat) {
    const n = Math.min(PER_CAT + 1, cat.items.length), v = (i) => cat.items[i][1];
    for (let attempt = 0; attempt < 400; attempt++) {
      const strict = attempt < 300; // zur Not einseitige Paare erlauben
      const pool = shuffle(cat.items.map((_, i) => i)), out = [pool.shift()];
      let close = 0;
      while (out.length < n) {
        const last = v(out[out.length - 1]);
        const k = pool.findIndex((i) => {
          const kind = pairKind(cat, last, v(i));
          return kind === "ok" || (kind === "close" && close === 0) || (!strict && kind === "easy");
        });
        if (k < 0) break;
        if (pairKind(cat, last, v(pool[k])) === "close") close++;
        out.push(pool.splice(k, 1)[0]);
      }
      if (out.length === n) return out;
    }
    // Notlösung: nur gleiche Werte vermeiden
    const idx = shuffle(cat.items.map((_, i) => i)), out = [idx.shift()];
    while (out.length < n && idx.length) {
      const k = idx.findIndex((i) => v(i) !== v(out[out.length - 1]));
      if (k < 0) break;
      out.push(idx.splice(k, 1)[0]);
    }
    return out;
  }

  function start(s, opts, now) {
    opts = opts || {};
    const length = LENGTHS[opts.length] ? opts.length : "mittel";
    const n = Number.isInteger(opts.cats) && opts.cats > 0 ? opts.cats : LENGTHS[length].cats; // Querbeet: 1 Kategorie
    // Querbeet-Themenabend: nur bestimmte Kategorien (only) oder ohne (not)
    const allKeys = Object.keys(data()).filter((k) => (!Array.isArray(opts.only) || opts.only.includes(k)) && (!Array.isArray(opts.not) || !opts.not.includes(k)));
    const keys = shuffle(allKeys.length ? allKeys : Object.keys(data())).slice(0, n);
    s.game = "hl"; s.phase = "hl";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.hl = { opts: { length }, cats: keys, ci: -1, total: {}, history: [] };
    s.players.forEach((p) => { s.hl.total[p.id] = 0; p.waiting = false; p.status = "active"; });
    nextCat(s, now);
  }

  function nextCat(s, now) {
    const st = s.hl;
    st.ci++;
    if (st.ci >= st.cats.length) { st.step = "final"; return; }
    st.items = pickItems(data()[st.cats[st.ci]]);
    st.pos = 1; st.chain = [];
    beginGuess(st);
  }
  function beginGuess(st) { st.step = "guess"; st.picks = {}; st.result = null; st.revealAt = 0; }

  const activeIds = (s) => s.players.filter((p) => p.connected).map((p) => p.id);
  const val = (st, k) => data()[st.cats[st.ci]].items[st.items[k]][1];

  function reveal(s, now) {
    const st = s.hl, prev = val(st, st.pos - 1), cur = val(st, st.pos);
    const right = cur > prev ? "up" : cur < prev ? "down" : "both";
    const res = {};
    Object.entries(st.picks).forEach(([pid, d]) => {
      const ok = right === "both" || d === right;
      res[pid] = ok;
      if (ok) st.total[pid] = (st.total[pid] || 0) + 1;
    });
    st.result = { right, ok: res };
    st.chain.push({ k: st.pos, right });
    st.step = "reveal"; st.revealAt = now;
  }

  function advance(s, now) {
    const st = s.hl;
    if (st.pos >= st.items.length - 1) {
      st.history.push({ cat: st.cats[st.ci] });
      nextCat(s, now);
    } else { st.pos++; beginGuess(st); }
  }

  function tick(s, now) {
    if (s.phase !== "hl" || !s.hl) return false;
    const st = s.hl;
    if (st.step === "guess") {
      const ids = activeIds(s);
      if (ids.length && ids.every((id) => st.picks[id])) { reveal(s, now); return true; }
    } else if (st.step === "reveal" && now >= st.revealAt + REVEAL_MS) { advance(s, now); return true; }
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.hl) return false;
    const st = s.hl;
    switch (a.type) {
      case "hlPick":
        if (st.step !== "guess" || a.pos !== st.pos || st.ci !== a.ci || (a.dir !== "up" && a.dir !== "down")) return false;
        st.picks[pid] = a.dir;
        tick(s, now);
        return true;
      case "hlRestart":
        if (st.step !== "final") return false;
        start(s, st.opts, now); return true;
    }
    return false;
  }

  function fmt(cat, v) {
    if (cat.year) return String(v);
    return v.toLocaleString("de-DE", { maximumFractionDigits: 2 }) + (cat.unit ? " " + cat.unit : "");
  }

  function publicState(s, now) {
    const st = s.hl;
    if (!st) return null;
    const out = { step: st.step, total: { ...st.total }, catCount: st.cats.length, catNo: Math.min(st.ci + 1, st.cats.length),
      perCat: PER_CAT, lengthName: LENGTHS[st.opts.length].name };
    if (st.step !== "final") {
      const cat = data()[st.cats[st.ci]], item = (k) => cat.items[st.items[k]];
      out.cat = { name: cat.name, q: cat.q, year: !!cat.year, approx: !!cat.approx, note: cat.note || "" };
      out.pos = st.pos; out.steps = st.items.length - 1; out.ci = st.ci;
      out.prev = { name: item(st.pos - 1)[0], value: fmt(cat, item(st.pos - 1)[1]) };
      out.cur = { name: item(st.pos)[0] };
      out.submitted = Object.keys(st.picks);
      out.chain = st.chain.map((c) => ({ name: item(c.k)[0], value: fmt(cat, item(c.k)[1]), right: c.right }));
      out.start = { name: item(0)[0], value: fmt(cat, item(0)[1]) };
      if (st.step === "reveal") {
        out.cur.value = fmt(cat, item(st.pos)[1]);
        out.picks = { ...st.picks }; out.result = st.result;
        out.nextIn = Math.max(0, st.revealAt + REVEAL_MS - now);
      }
    } else {
      const max = Math.max(...Object.values(st.total));
      out.winners = Object.keys(st.total).filter((id) => st.total[id] === max);
      out.max = st.cats.length * PER_CAT;
      out.cats = st.cats.map((k) => data()[k].name);
    }
    return out;
  }

  root.S10Hl = { start, apply, tick, publicState, fmt, pickItems, pairKind, LENGTHS, PER_CAT, REVEAL_MS };
})(typeof window !== "undefined" ? window : globalThis);
