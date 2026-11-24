// „Höher oder tiefer“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.hl.
(function (root) {
  const LENGTHS = { kurz: { name: "Kurz – 3 Kategorien", cats: 3 }, mittel: { name: "Mittel – 5 Kategorien", cats: 5 }, lang: { name: "Lang – 8 Kategorien", cats: 8 } };
  const PER_CAT = 6;        // so viele Vergleiche pro Kategorie
  // Schwierigkeit: Abstand der verglichenen Werte. „Gemischt“ = bisher (keine einseitigen Paare, höchstens ein ganz knappes)
  const LEVELS = { leicht: { name: "Leicht", desc: "deutliche Unterschiede" }, gemischt: { name: "Gemischt", desc: "mal deutlich, mal knapp" },
    profi: { name: "Profi", desc: "möglichst knappe Vergleiche" } };
  // Punkte: Serienbonus = richtig hintereinander 1, 2, 3 … Punkte (falsch setzt die Serie zurück, Punkte bleiben)
  const SCORING = { serie: { name: "Serienbonus", desc: "richtig hintereinander = 1, 2, 3 … Punkte" }, einfach: { name: "Einfach", desc: "jeder richtige Tipp = 1 Punkt" } };
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
  // Abstand zweier Werte: Jahre als Differenz, sonst als Verhältnis (größerer durch kleineren)
  const gap = (cat, a, b) => cat.year ? Math.abs(a - b) : Math.max(a, b) / Math.min(a, b);
  // „Leicht“: deutlich verschieden (ab 1,5-fach bzw. 15 Jahre), aber nicht absurd einseitig
  const clearGap = (cat, a, b) => { const g = gap(cat, a, b); return cat.year ? g >= 15 && g <= 80 : g >= 1.5 && g <= 15; };
  // „Profi“: nach jedem Begriff einer der zwei Werte, die ihm am nächsten liegen (so knapp, wie die Kategorie es hergibt)
  function pickClose(cat) {
    const n = Math.min(PER_CAT + 1, cat.items.length), v = (i) => cat.items[i][1];
    const pool = shuffle(cat.items.map((_, i) => i)), out = [pool.shift()];
    while (out.length < n) {
      const last = v(out[out.length - 1]);
      const cand = pool.filter((i) => v(i) !== last).sort((x, y) => gap(cat, last, v(x)) - gap(cat, last, v(y)));
      if (!cand.length) break;
      const pick = cand[Math.floor(Math.random() * Math.min(2, cand.length))];
      out.push(pool.splice(pool.indexOf(pick), 1)[0]);
    }
    return out;
  }
  // Kette von Begriffen ziehen: nie gleiche Werte nebeneinander, keine viel zu einseitigen Paare,
  // höchstens ein ganz knapper Vergleich pro Kategorie (bei „Leicht“ nur deutliche Unterschiede)
  function pickItems(cat, level) {
    if (level === "profi") return pickClose(cat);
    const n = Math.min(PER_CAT + 1, cat.items.length), v = (i) => cat.items[i][1];
    for (let attempt = 0; attempt < 400; attempt++) {
      const strict = attempt < 300; // zur Not einseitige Paare erlauben
      const pool = shuffle(cat.items.map((_, i) => i)), out = [pool.shift()];
      let close = 0;
      while (out.length < n) {
        const last = v(out[out.length - 1]);
        const k = pool.findIndex((i) => {
          if (level === "leicht" && strict) return clearGap(cat, last, v(i));
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

  // Ähnliche Kategorien bilden eine Gruppe – pro Spiel möglichst nur eine davon (z. B. nicht dreimal Jahreszahlen)
  const GROUPS = { tiereGewicht: "tiere", tiereAlter: "tiere", tempo: "tiere", herzschlag: "tiere",
    suedtirolBerge: "suedtirol", gemeinden: "suedtirol", entfernung: "suedtirol", orteHoehe: "suedtirol",
    gewicht: "gewicht", sportgeraete: "gewicht" };
  const groupOf = (k) => GROUPS[k] || (data()[k] && data()[k].year ? "jahr" : k);
  // zuerst je Gruppe höchstens eine Kategorie, reicht das nicht, wird mit den übrigen aufgefüllt
  function pickCats(keys, n) {
    const pool = shuffle(keys.slice()), out = [], used = new Set();
    pool.forEach((k) => { if (out.length < n && !used.has(groupOf(k))) { out.push(k); used.add(groupOf(k)); } });
    pool.forEach((k) => { if (out.length < n && !out.includes(k)) out.push(k); });
    return out;
  }

  function start(s, opts, now) {
    opts = opts || {};
    const length = LENGTHS[opts.length] ? opts.length : "mittel";
    const level = LEVELS[opts.level] ? opts.level : "gemischt";
    const scoring = SCORING[opts.scoring] ? opts.scoring : "serie";
    const n = Number.isInteger(opts.cats) && opts.cats > 0 ? opts.cats : LENGTHS[length].cats; // Querbeet: 1 Kategorie
    // Querbeet-Themenabend: nur bestimmte Kategorien (only) oder ohne (not)
    const allKeys = Object.keys(data()).filter((k) => (!Array.isArray(opts.only) || opts.only.includes(k)) && (!Array.isArray(opts.not) || !opts.not.includes(k)));
    const keys = pickCats(allKeys.length ? allKeys : Object.keys(data()), n);
    s.game = "hl"; s.phase = "hl";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.hl = { opts: { length, level, scoring }, cats: keys, ci: -1, total: {}, streak: {}, history: [] };
    s.players.forEach((p) => { s.hl.total[p.id] = 0; p.waiting = false; p.status = "active"; });
    nextCat(s, now);
  }

  function nextCat(s, now) {
    const st = s.hl;
    st.ci++;
    if (st.ci >= st.cats.length) { st.step = "final"; return; }
    st.items = pickItems(data()[st.cats[st.ci]], st.opts.level);
    st.pos = 1; st.chain = []; st.streak = {}; // jede Kategorie beginnt eine neue Serie
    beginGuess(st);
  }
  function beginGuess(st) { st.step = "guess"; st.picks = {}; st.result = null; st.revealAt = 0; }

  const activeIds = (s) => s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
  const val = (st, k) => data()[st.cats[st.ci]].items[st.items[k]][1];

  const isFinalCat = (st) => st.cats.length > 1 && st.ci === st.cats.length - 1;
  function reveal(s, now) {
    const st = s.hl, prev = val(st, st.pos - 1), cur = val(st, st.pos);
    const right = cur > prev ? "up" : cur < prev ? "down" : "both";
    const res = {}, pts = {}, serie = (st.opts.scoring || "serie") === "serie";
    if (!st.streak) st.streak = {};
    Object.entries(st.picks).forEach(([pid, d]) => {
      const ok = right === "both" || d === right;
      res[pid] = ok;
      st.streak[pid] = ok ? (st.streak[pid] || 0) + 1 : 0;
      pts[pid] = ok ? (serie ? st.streak[pid] : 1) * (isFinalCat(st) ? 2 : 1) : 0; // letzte Kategorie zählt doppelt
      st.total[pid] = (st.total[pid] || 0) + pts[pid];
    });
    st.result = { right, ok: res, pts };
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
    if (cat.year) return v < 0 ? `${-v} v. Chr.` : String(v);
    return v.toLocaleString("de-DE", { maximumFractionDigits: 2 }) + (cat.unit ? " " + cat.unit : "");
  }

  function publicState(s, now) {
    const st = s.hl;
    if (!st) return null;
    const out = { step: st.step, final: isFinalCat(st), total: { ...st.total }, catCount: st.cats.length, catNo: Math.min(st.ci + 1, st.cats.length),
      perCat: PER_CAT, lengthName: LENGTHS[st.opts.length].name, scoring: st.opts.scoring || "serie", streak: { ...(st.streak || {}) } };
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
      const perCat = out.scoring === "serie" ? PER_CAT * (PER_CAT + 1) / 2 : PER_CAT; // Serie: 1 + 2 + … + 6
      out.max = st.cats.length * perCat + (st.cats.length > 1 ? perCat : 0); // letzte Kategorie zählt doppelt
      out.cats = st.cats.map((k) => data()[k].name);
    }
    return out;
  }

  root.S10Hl = { start, apply, tick, publicState, fmt, pickItems, pairKind, LENGTHS, PER_CAT, REVEAL_MS, LEVELS, SCORING, pickCats, groupOf };
})(typeof window !== "undefined" ? window : globalThis);
