// „Schätzen“, „Hinweis für Hinweis“ und „Umriss-Rätsel“ – gemeinsame Spiellogik (läuft beim Gastgeber, testbar in Node).
// Zustand in s.quiz. Alle spielen gleichzeitig, jede Runde: Frage → Antworten (jeder einmal) → Auflösung → weiter.
//  schaetzen: Zahl schätzen – am nächsten dran: 3 Punkte, dann 2, dann 1 (Gleichstand = gleiche Punkte), Volltreffer +1
//  hinweis:   bis zu 5 Hinweise, alle 8 Sekunden ein neuer – wer früh richtig liegt, bekommt mehr (5 … 1), nur ein Versuch
//  umriss:    Umriss eines Landes / Bundeslandes erkennen – richtig 2 Punkte, der schnellste Richtige +1, nur ein Versuch
(function (root) {
  const MODES = { schaetzen: { name: "Schätzen" }, hinweis: { name: "Hinweis für Hinweis" }, umriss: { name: "Umriss-Rätsel" } };
  const ROUND_CHOICES = [5, 10];
  const THEMES = { mix: { name: "Gemischt" }, suedtirol: { name: "Nur Südtirol" }, allgemein: { name: "Ohne Südtirol" } };
  const LEVELS = { leicht: { name: "Leicht" }, gemischt: { name: "Gemischt" }, profi: { name: "Profi" } }; // Umriss-Rätsel: bekannte / alle / nur schwere
  const UMRISS_REGIONS = ["europa", "welt", "de", "at", "it", "ch"];
  const ASK_MS = { schaetzen: 45000, umriss: 45000 };
  const HINT_MS = 10000, AFTER_LAST_HINT_MS = 20000;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const data = () => root.SCHLAU10_QUIZ || { schaetzen: [], hinweis: [] };
  const land = () => root.SCHLAU10_LAND || null;
  const L = () => root.S10Logic;
  // weitere gültige Namen fürs Umriss-Rätsel
  const ALIAS = {
    "Vereinigtes Königreich": ["Großbritannien", "England", "UK", "Grossbritannien"], USA: ["Vereinigte Staaten", "Amerika", "Vereinigte Staaten von Amerika"],
    Tschechien: ["Tschechische Republik"], Niederlande: ["Holland"], "Demokratische Republik Kongo": ["Kongo", "DR Kongo"], "Republik Kongo": ["Kongo"],
    Elfenbeinküste: ["Côte d'Ivoire", "Cote d'Ivoire"], "Bosnien und Herzegowina": ["Bosnien"], Nordmazedonien: ["Mazedonien"], Vatikanstadt: ["Vatikan"],
    Belarus: ["Weißrussland", "Weissrussland"], Moldau: ["Moldawien", "Moldova"], "Vereinigte Arabische Emirate": ["VAE", "Emirate"], Myanmar: ["Burma", "Birma"],
    Eswatini: ["Swasiland"], Osttimor: ["Timor-Leste"], "Kap Verde": ["Cabo Verde"], "St. Gallen": ["Sankt Gallen"], "Friaul-Julisch Venetien": ["Friaul"],
    "Trentino-Südtirol": ["Trentino-Alto Adige", "Trentino"], Aostatal: ["Valle d'Aosta", "Aosta"], Russland: ["Russische Föderation"], Türkei: ["Turkei"],
  };

  // Kandidaten je Spielart (Schlüssel bleiben stabil, damit „schon gespielt“ funktioniert)
  function pool(mode, opts) {
    if (mode === "schaetzen" || mode === "hinweis") {
      const list = data()[mode], th = opts.theme || "mix";
      return list.map((x, i) => i).filter((i) => {
        const st = mode === "schaetzen" ? list[i][3] : list[i].st;
        return th === "suedtirol" ? !!st : th === "allgemein" ? !st : true;
      }).map((i) => mode + ":" + (mode === "schaetzen" ? list[i][0] : list[i].a));
    }
    const D = land();
    if (!D) return [];
    const reg = D.regions[opts.region] || D.regions.europa;
    const all = D.countries.concat(D.subs || []);
    const lv = LEVELS[opts.level] ? opts.level : "gemischt";
    return reg.codes.map((c) => all.find((x) => x.c === c)).filter((x) => x && x.a >= (reg.sub ? 30 : 2500)
      && (lv === "leicht" ? x.l === 1 : lv === "profi" ? x.l !== 1 : true)).map((x) => "umriss:" + x.c);
  }
  const keyItem = (key) => {
    const [mode, ...rest] = key.split(":"), id = rest.join(":");
    if (mode === "schaetzen") { const x = data().schaetzen.find((q) => q[0] === id); return x && { q: x[0], v: x[1], unit: x[2] }; }
    if (mode === "hinweis") { const x = data().hinweis.find((q) => q.a === id); return x && { a: x.a, alt: x.alt || [], h: x.h }; }
    const D = land(); if (!D) return null;
    const c = D.countries.concat(D.subs || []).find((x) => x.c === id);
    return c && { c: c.c, a: c.n, alt: ALIAS[c.n] || [] };
  };
  function countNew(seen, mode, opts) {
    const p = pool(mode, opts || {}), list = (seen && seen[mode]) || [];
    return { fresh: p.filter((k) => !list.includes(k)).length, total: p.length };
  }

  function start(s, opts, now) {
    opts = opts || {};
    const mode = MODES[opts.mode] ? opts.mode : "schaetzen";
    const rn = Number(opts.rounds), rounds = ROUND_CHOICES.includes(rn) || (opts.free && Number.isInteger(rn) && rn > 0 && rn <= 20) ? rn : 5;
    const theme = THEMES[opts.theme] ? opts.theme : "mix";
    const region = UMRISS_REGIONS.includes(opts.region) ? opts.region : "europa";
    const level = LEVELS[opts.level] ? opts.level : "gemischt";
    const o = { mode, rounds, theme, region, level };
    const p = pool(mode, o);
    if (!p.length) return false;
    // Ungespielte zuerst; reichen sie nicht mehr, beginnt diese Auswahl von vorn
    if (!s.quizSeen || typeof s.quizSeen !== "object") s.quizSeen = {};
    let seen = Array.isArray(s.quizSeen[mode]) ? s.quizSeen[mode] : [];
    let fresh = p.filter((k) => !seen.includes(k));
    if (fresh.length < Math.min(rounds, p.length)) { seen = seen.filter((k) => !p.includes(k)); fresh = p.slice(); }
    s.quizSeen[mode] = seen;
    s.game = mode; s.phase = "quiz";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.quiz = { opts: o, mode, rounds: Math.min(rounds, p.length), order: shuffle(fresh).concat(shuffle(p.filter((k) => !fresh.includes(k)))),
      round: 0, total: {}, history: [],
      // Querbeet kann die Zeiten verlängern (free): Hinweis-Abstand, Zeit nach dem letzten Hinweis, Antwortzeit
      hintMs: opts.free && Number(opts.hintMs) >= 5000 && Number(opts.hintMs) <= 120000 ? Number(opts.hintMs) : HINT_MS, afterMs: opts.free && Number(opts.afterMs) >= 5000 && Number(opts.afterMs) <= 120000 ? Number(opts.afterMs) : AFTER_LAST_HINT_MS, askMs: opts.free && Number(opts.askMs) >= 5000 && Number(opts.askMs) <= 120000 ? Number(opts.askMs) : ASK_MS[mode] };
    s.players.forEach((pl) => { s.quiz.total[pl.id] = 0; pl.waiting = false; pl.status = "active"; });
    nextRound(s, now);
    return true;
  }

  function nextRound(s, now) {
    const st = s.quiz;
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.key = st.order[st.round - 1];
    const seen = s.quizSeen[st.mode] || (s.quizSeen[st.mode] = []);
    if (!seen.includes(st.key)) seen.push(st.key);
    st.step = "ask"; st.answers = {}; st.ready = {}; st.result = null; st.startedAt = now; st.hints = 1;
    st.deadline = st.mode === "hinweis" ? now + 4 * (st.hintMs || HINT_MS) + (st.afterMs || AFTER_LAST_HINT_MS) : now + (st.askMs || ASK_MS[st.mode]);
  }

  const activeIds = (s) => s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
  // Zahl lesen: „1.370“ / „1 370“ = 1370, „9,1“ = 9,1; ein Punkt mit genau drei Ziffern danach gilt als Tausenderpunkt
  const parseNum = (t) => {
    let x = String(t).trim().replace(/\s/g, "");
    if (x.includes(",")) x = x.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(x)) x = x.replace(/\./g, "");
    const n = Number(x); return x !== "" && isFinite(n) ? n : NaN;
  };
  function isRight(item, text) {
    const t = String(text || "").trim();
    if (!t) return false;
    return L().textMatches(item.a, t, item.alt || [], false);
  }

  function reveal(s) {
    const st = s.quiz, item = keyItem(st.key), res = {};
    if (st.mode === "schaetzen") {
      const ids = Object.keys(st.answers).filter((id) => isFinite(st.answers[id].n));
      const dist = (id) => Math.abs(st.answers[id].n - item.v);
      const sorted = ids.slice().sort((a, b) => dist(a) - dist(b));
      s.players.forEach((p) => {
        const a = st.answers[p.id];
        if (!a || !isFinite(a.n)) { res[p.id] = { given: null, points: 0 }; return; }
        const place = sorted.findIndex((id) => dist(id) === dist(p.id));
        const exact = dist(p.id) <= Math.abs(item.v) * 0.01;
        res[p.id] = { given: a.n, diff: a.n - item.v, place: place + 1, points: ([3, 2, 1][place] || 0) + (exact ? 1 : 0), exact };
      });
    } else {
      const right = Object.keys(st.answers).filter((id) => st.answers[id].ok).sort((a, b) => st.answers[a].at - st.answers[b].at);
      s.players.forEach((p) => {
        const a = st.answers[p.id];
        if (!a) { res[p.id] = { given: null, ok: false, points: 0 }; return; }
        let pts = 0;
        if (a.ok) pts = st.mode === "hinweis" ? 6 - a.hint : 2 + (right[0] === p.id && right.length > 1 ? 1 : 0);
        res[p.id] = { given: a.t, ok: a.ok, hint: a.hint, points: pts, fast: st.mode === "umriss" && a.ok && right[0] === p.id && right.length > 1 };
      });
    }
    // Finalrunde: Punkte der letzten Runde zählen doppelt (mehr Spannung bis zum Schluss)
    if (st.rounds > 1 && st.round === st.rounds) Object.values(res).forEach((r) => { r.points *= 2; r.double = true; });
    Object.entries(res).forEach(([id, r]) => { st.total[id] = (st.total[id] || 0) + r.points; });
    st.result = res; st.step = "reveal"; st.ready = {}; st.hints = 5;
    st.history.push({ key: st.key, points: Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.points])) });
  }

  // true = Zustand geändert (neuer Hinweis, Auflösung)
  function tick(s, now) {
    if (s.phase !== "quiz" || !s.quiz || s.quiz.step !== "ask") return false;
    const st = s.quiz, ids = activeIds(s);
    if ((ids.length && ids.every((id) => st.answers[id])) || now >= st.deadline + 800) { reveal(s); return true; }
    if (st.mode === "hinweis") {
      const h = Math.min(5, 1 + Math.floor((now - st.startedAt) / (st.hintMs || HINT_MS)));
      if (h !== st.hints) { st.hints = h; return true; }
    }
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.quiz) return false;
    const st = s.quiz;
    switch (a.type) {
      case "quizAnswer": {
        if (st.step !== "ask" || a.round !== st.round || st.answers[pid]) return false;
        const at = now - st.startedAt;
        if (st.mode === "schaetzen") {
          const n = parseNum(a.text);
          if (!isFinite(n)) return false;
          st.answers[pid] = { n, at };
        } else {
          const t = String(a.text || "").trim().slice(0, 60);
          if (!t) return false;
          st.answers[pid] = { t, at, ok: isRight(keyItem(st.key), t), hint: st.hints };
        }
        tick(s, now);
        return true;
      }
      case "quizReady": {
        if (st.step !== "reveal") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = activeIds(s);
        if (ids.length && ids.every((id) => st.ready[id])) nextRound(s, now);
        return true;
      }
      case "quizNext":
        if (!isHost || st.step !== "reveal") return false;
        nextRound(s, now); return true;
      case "quizRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts, now);
    }
    return false;
  }

  function publicState(s, now) {
    const st = s.quiz;
    if (!st) return null;
    const item = st.key ? keyItem(st.key) : null, open = st.step === "reveal" || st.step === "final";
    const out = {
      mode: st.mode, modeName: MODES[st.mode].name, step: st.step, round: st.round, rounds: st.rounds, theme: st.opts.theme, region: st.opts.region, level: st.opts.level,
      endsIn: st.step === "ask" ? Math.max(0, st.deadline - now) : null, final: st.rounds > 1 && st.round === st.rounds,
      timerMs: st.mode === "hinweis" ? 4 * (st.hintMs || HINT_MS) + (st.afterMs || AFTER_LAST_HINT_MS) : st.askMs || ASK_MS[st.mode], submitted: Object.keys(st.answers || {}), total: { ...st.total }, ready: { ...(st.ready || {}) },
    };
    if (item) {
      if (st.mode === "schaetzen") out.item = { q: item.q, unit: item.unit, v: open ? item.v : null };
      else if (st.mode === "hinweis") out.item = { hints: item.h.slice(0, open ? 5 : st.hints), a: open ? item.a : null, hintMs: st.hintMs || HINT_MS, nextIn: st.step === "ask" && st.hints < 5 ? Math.max(0, st.startedAt + st.hints * (st.hintMs || HINT_MS) - now) : null };
      else out.item = { c: item.c, a: open ? item.a : null };
    }
    if (open) out.result = st.result;
    if (st.step === "final") {
      const max = Math.max(...Object.values(st.total));
      out.winners = Object.keys(st.total).filter((id) => st.total[id] === max);
    }
    return out;
  }

  root.S10Quiz = { MODES, ROUND_CHOICES, THEMES, LEVELS, UMRISS_REGIONS, HINT_MS, ASK_MS, AFTER_LAST_HINT_MS, start, apply, tick, publicState, pool, countNew, keyItem, isRight, parseNum };
})(typeof window !== "undefined" ? window : globalThis);
