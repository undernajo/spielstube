// „Wo liegt das?“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.geo.
(function (root) {
  const ROUND_CHOICES = [5, 10, 15];
  const TIMERS = { t30: { name: "30 Sekunden", ms: 30000 }, t60: { name: "60 Sekunden", ms: 60000 }, none: { name: "ohne Zeitlimit", ms: 0 } };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const data = () => root.SCHLAU10_GEO || {};

  // Entfernung zweier Punkte auf der Erde in km (Haversine)
  function distanceKm(a, b) {
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  const pointsFor = (km, scale) => Math.round(1000 * Math.exp(-km / scale));

  function start(s, opts, now) {
    opts = opts || {};
    const region = data()[opts.region] ? opts.region : "europa";
    const rounds = ROUND_CHOICES.includes(Number(opts.rounds)) ? Number(opts.rounds) : 10;
    const timer = TIMERS[opts.timer] ? opts.timer : "t30";
    const n = data()[region].places.length;
    s.game = "geo"; s.phase = "geo";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.geo = { opts: { region, rounds, timer }, region, rounds: Math.min(rounds, n), timer,
      order: shuffle(Array.from({ length: n }, (_, i) => i)), round: 0, total: {}, history: [] };
    s.players.forEach((p) => { s.geo.total[p.id] = 0; p.waiting = false; p.status = "active"; });
    nextRound(s, now);
  }

  function nextRound(s, now) {
    const st = s.geo;
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.place = st.order[st.round - 1];
    st.step = "guess"; st.guesses = {}; st.ready = {}; st.result = null;
    st.deadline = TIMERS[st.timer].ms ? now + TIMERS[st.timer].ms : 0;
  }

  const activeIds = (s) => s.players.filter((p) => p.connected).map((p) => p.id);

  function reveal(s) {
    const st = s.geo, reg = data()[st.region], pl = reg.places[st.place], target = [pl[2], pl[3]];
    const res = {};
    s.players.forEach((p) => {
      const g = st.guesses[p.id];
      if (!g) { res[p.id] = { lat: null, lng: null, km: null, points: 0 }; return; }
      const km = distanceKm(target, [g.lat, g.lng]);
      res[p.id] = { lat: g.lat, lng: g.lng, km: Math.round(km * 10) / 10, points: pointsFor(km, reg.scale) };
    });
    Object.entries(res).forEach(([pid, r]) => { st.total[pid] = (st.total[pid] || 0) + r.points; });
    st.result = res;
    st.history.push({ place: pl[0], points: Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.points])) });
    st.step = "reveal"; st.ready = {};
  }

  function tick(s, now) {
    if (s.phase !== "geo" || !s.geo || s.geo.step !== "guess") return false;
    const st = s.geo, ids = activeIds(s);
    const allIn = ids.length > 0 && ids.every((id) => st.guesses[id]);
    if (allIn || (st.deadline && now >= st.deadline + 1500)) { reveal(s); return true; }
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.geo) return false;
    const st = s.geo;
    switch (a.type) {
      case "geoGuess": {
        if (st.step !== "guess" || a.round !== st.round || st.guesses[pid]) return false;
        const lat = Number(a.lat), lng = Number(a.lng);
        if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
        st.guesses[pid] = { lat, lng };
        tick(s, now);
        return true;
      }
      case "geoReady": {
        if (st.step !== "reveal") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = activeIds(s);
        if (ids.length && ids.every((id) => st.ready[id])) nextRound(s, now);
        return true;
      }
      case "geoNext":
        if (!isHost || st.step !== "reveal") return false;
        nextRound(s, now); return true;
      case "geoRestart":
        if (st.step !== "final") return false;
        start(s, st.opts, now); return true;
    }
    return false;
  }

  function publicState(s, now) {
    const st = s.geo;
    if (!st) return null;
    const reg = data()[st.region], pl = reg.places[st.place];
    const out = {
      step: st.step, round: st.round, rounds: st.rounds, region: st.region, regionName: reg.name, bounds: reg.bounds,
      timerName: TIMERS[st.timer].name, endsIn: st.step === "guess" && st.deadline ? Math.max(0, st.deadline - now) : null,
      place: pl ? { name: pl[0], kind: pl[1] } : null, submitted: Object.keys(st.guesses || {}), total: { ...st.total }, ready: { ...(st.ready || {}) },
    };
    if (st.step === "reveal" || st.step === "final") {
      if (pl) out.answer = { lat: pl[2], lng: pl[3] };
      out.result = st.result;
    }
    if (st.step === "final") {
      const max = Math.max(...Object.values(st.total));
      out.winners = Object.keys(st.total).filter((id) => st.total[id] === max);
      out.history = st.history;
    }
    return out;
  }

  root.S10Geo = { start, apply, tick, publicState, distanceKm, pointsFor, ROUND_CHOICES, TIMERS };
})(typeof window !== "undefined" ? window : globalThis);
