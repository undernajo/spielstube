// „Länder finden“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.land.
// Ein Land wird genannt, alle tippen gleichzeitig auf der Karte (nur Umrisse, keine Namen) auf das Land.
// Richtig = 100 Punkte, dazu ein Bonus für die Schnellsten unter den Richtigen (+30, +20, +10).
(function (root) {
  const ROUND_CHOICES = [5, 10, 15, 20];
  const LEVELS = { leicht: { name: "Leicht" }, gemischt: { name: "Gemischt" }, profi: { name: "Profi" } };
  const TIMERS = { t15: { name: "15 Sekunden", ms: 15000 }, t30: { name: "30 Sekunden", ms: 30000 }, none: { name: "ohne Zeitlimit", ms: 0 } };
  const BASE = 100, BONUS = [30, 20, 10];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const REGION_KEYS = ["europa", "afrika", "asien", "amerika", "welt", "de", "at", "it", "ch"];
  const REGION_NAMES = { europa: "Europa", afrika: "Afrika", asien: "Asien", amerika: "Amerika", welt: "Welt",
    de: "Deutsche Bundesländer", at: "Österreichische Bundesländer", it: "Italienische Regionen", ch: "Schweizer Kantone" };
  const data = () => root.SCHLAU10_LAND || { regions: {}, countries: [] };
  const region = (k) => data().regions[k] || data().regions.europa;
  let byCode = null, byCodeOf = null;
  // Länder und Bundesländer/Regionen/Kantone (subs) über ihr Kürzel
  const country = (c) => {
    if (byCodeOf !== data()) { byCodeOf = data(); byCode = Object.fromEntries(byCodeOf.countries.concat(byCodeOf.subs || []).map((x) => [x.c, x])); }
    return byCode[c];
  };

  // Kürzel der Länder, die zur Schwierigkeit passen
  function poolFor(reg, level) {
    const cs = ((region(reg) || { codes: [] }).codes || []).map(country).filter(Boolean);
    if (level === "leicht") return cs.filter((c) => c.l === 1).map((c) => c.c);
    if (level === "profi") return cs.filter((c) => c.l !== 1).map((c) => c.c);
    return cs.map((c) => c.c);
  }
  // Wie viele Länder dieser Auswahl wurden noch nicht gespielt? (seen = { region: [Kürzel] })
  function countNew(seen, reg, level) {
    const list = (seen && seen[reg]) || [], pool = poolFor(reg, level);
    return { fresh: pool.filter((c) => !list.includes(c)).length, total: pool.length };
  }
  const nameOf = (reg, c) => { const x = country(c); return x ? x.n : null; };

  function start(s, opts, now) {
    opts = opts || {};
    const reg = data().regions[opts.region] ? opts.region : "europa";
    const level = LEVELS[opts.level] ? opts.level : "gemischt";
    const rn = Number(opts.rounds), rounds = ROUND_CHOICES.includes(rn) || (opts.free && Number.isInteger(rn) && rn > 0 && rn <= 20) ? rn : 10; // free: Querbeet
    const timer = TIMERS[opts.timer] ? opts.timer : "t30";
    const pool = poolFor(reg, level);
    // Ungespielte zuerst. Reichen sie nicht mehr für eine Partie, beginnt diese Auswahl von vorn.
    if (!s.landSeen || typeof s.landSeen !== "object") s.landSeen = {};
    let seen = Array.isArray(s.landSeen[reg]) ? s.landSeen[reg] : [];
    let fresh = pool.filter((c) => !seen.includes(c));
    if (fresh.length < Math.min(rounds, pool.length)) { seen = seen.filter((c) => !pool.includes(c)); fresh = pool.slice(); }
    s.landSeen[reg] = seen;
    s.game = "land"; s.phase = "land";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.land = { opts: { region: reg, level, rounds, timer }, region: reg, level, rounds: Math.min(rounds, pool.length), timer,
      order: shuffle(fresh).concat(shuffle(pool.filter((c) => !fresh.includes(c)))), round: 0, total: {}, history: [] };
    s.players.forEach((p) => { s.land.total[p.id] = 0; p.waiting = false; p.status = "active"; });
    nextRound(s, now);
    return true;
  }

  function nextRound(s, now) {
    const st = s.land;
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.target = st.order[st.round - 1];
    const seen = s.landSeen[st.region] || (s.landSeen[st.region] = []);
    if (!seen.includes(st.target)) seen.push(st.target);
    st.step = "guess"; st.picks = {}; st.ready = {}; st.result = null;
    st.startedAt = now;
    st.deadline = TIMERS[st.timer].ms ? now + TIMERS[st.timer].ms : 0;
  }

  const activeIds = (s) => s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);

  function reveal(s) {
    const st = s.land, res = {};
    const right = Object.entries(st.picks).filter(([, p]) => p.c === st.target).sort((a, b) => a[1].at - b[1].at).map(([id]) => id);
    s.players.forEach((p) => {
      const g = st.picks[p.id];
      if (!g) { res[p.id] = { c: null, ok: false, points: 0 }; return; }
      const ok = g.c === st.target, rank = right.indexOf(p.id);
      res[p.id] = { c: g.c, ok, points: ok ? BASE + (BONUS[rank] || 0) : 0, fast: ok && rank === 0 && right.length > 1 };
    });
    Object.entries(res).forEach(([pid, r]) => { st.total[pid] = (st.total[pid] || 0) + r.points; });
    st.result = res;
    st.history.push({ c: st.target, points: Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.points])) });
    st.step = "reveal"; st.ready = {};
  }

  function tick(s, now) {
    if (s.phase !== "land" || !s.land || s.land.step !== "guess") return false;
    const st = s.land, ids = activeIds(s);
    const allIn = ids.length > 0 && ids.every((id) => st.picks[id]);
    if (allIn || (st.deadline && now >= st.deadline + 1500)) { reveal(s); return true; }
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.land) return false;
    const st = s.land;
    switch (a.type) {
      case "landPick": {
        if (st.step !== "guess" || a.round !== st.round || st.picks[pid]) return false;
        if (!country(a.c)) return false; // auch Länder außerhalb der Region (dann eben falsch)
        st.picks[pid] = { c: a.c, at: now - (st.startedAt || now) };
        tick(s, now);
        return true;
      }
      case "landReady": {
        if (st.step !== "reveal") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = activeIds(s);
        if (ids.length && ids.every((id) => st.ready[id])) nextRound(s, now);
        return true;
      }
      case "landNext":
        if (!isHost || st.step !== "reveal") return false;
        nextRound(s, now); return true;
      case "landRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts, now);
    }
    return false;
  }

  function publicState(s, now) {
    const st = s.land;
    if (!st) return null;
    const out = { // ohne Kartendaten (noch nicht geladen) nur ohne Ländernamen
      step: st.step, round: st.round, rounds: st.rounds, region: st.region, regionName: REGION_NAMES[st.region] || st.region, levelName: LEVELS[st.level].name,
      timerName: TIMERS[st.timer].name, timerMs: TIMERS[st.timer].ms, endsIn: st.step === "guess" && st.deadline ? Math.max(0, st.deadline - now) : null,
      target: st.target, targetName: nameOf(st.region, st.target),
      submitted: Object.keys(st.picks || {}), total: { ...st.total }, ready: { ...(st.ready || {}) },
    };
    if (st.step === "reveal" || st.step === "final") out.result = st.result;
    if (st.step === "final") {
      const max = Math.max(...Object.values(st.total));
      out.winners = Object.keys(st.total).filter((id) => st.total[id] === max);
      out.history = st.history;
    }
    return out;
  }

  root.S10Land = { start, apply, tick, publicState, poolFor, countNew, nameOf, country, REGION_KEYS, REGION_NAMES, ROUND_CHOICES, TIMERS, LEVELS, BASE, BONUS };
})(typeof window !== "undefined" ? window : globalThis);
