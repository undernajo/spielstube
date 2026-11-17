// Stadt, Land, Fluss – Spiellogik (läuft beim Gastgeber, testbar in Node).
// Der Zustand liegt in s.slf; Spieler (s.players) teilt sich das Spiel mit Schlaue Zehn.
(function (root) {
  const LETTERS = "ABDEFGHIKLMNOPRSTUVWZ".split(""); // ohne C, J, Q, X, Y
  const PRESETS = {
    klassisch: { name: "Klassisch", cats: ["Stadt", "Land", "Fluss", "Name", "Tier", "Beruf"] },
    gemischt: { name: "Gemischt", cats: ["Stadt", "Land", "Tier", "Essen", "Berühmte Person", "Marke"] },
    spass: { name: "Spaß", cats: ["Etwas im Kühlschrank", "Ausrede fürs Zuspätkommen", "Schlechtes Geschenk", "Grund für einen Streit", "Etwas im Rucksack", "Berühmte Person"] },
    suedtirol: { name: "Südtirol", cats: ["Südtiroler Ort", "Berg oder Gipfel", "Essen & Trinken", "Dialektwort", "Etwas auf der Alm", "Vorname"] },
  };
  const TIMERS = {
    stopp: { name: "„Stopp!“ + 10 Sekunden", limit: 180000, grace: 10000 },
    t90: { name: "90 Sekunden fest", limit: 90000 },
    t60: { name: "60 Sekunden fest", limit: 60000 },
  };
  const ROUND_CHOICES = [3, 5, 8];

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clean = (t, n) => String(t == null ? "" : t).replace(/\s+/g, " ").trim().slice(0, n);

  function categoriesFrom(opts) {
    if (opts && opts.preset === "eigene") {
      const list = String(opts.custom || "").split(/[,\n;]/).map((c) => clean(c, 30)).filter(Boolean);
      const uniq = [...new Set(list)].slice(0, 10);
      if (uniq.length) return uniq;
    }
    return (PRESETS[opts && opts.preset] || PRESETS.klassisch).cats.slice();
  }

  function start(s, opts, now) {
    opts = opts || {};
    const rn = Number(opts.rounds), rounds = ROUND_CHOICES.includes(rn) || (opts.free && Number.isInteger(rn) && rn > 0 && rn <= 10) ? rn : 5; // free: Querbeet
    const timer = TIMERS[opts.timer] ? opts.timer : "stopp";
    s.game = "slf"; s.phase = "slf";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.slf = {
      opts: { preset: opts.preset || "klassisch", custom: clean(opts.custom, 400), rounds, timer },
      cats: categoriesFrom(opts), rounds, timer, round: 0, used: [], total: {}, history: [],
    };
    s.players.forEach((p) => { s.slf.total[p.id] = 0; p.waiting = false; p.status = "active"; });
    nextRound(s, now);
  }

  function nextRound(s, now) {
    const st = s.slf;
    st.round++;
    const free = LETTERS.filter((l) => !st.used.includes(l));
    st.letter = shuffle(free.length ? free : LETTERS.slice())[0];
    st.used.push(st.letter);
    st.step = "writing";
    st.deadline = now + TIMERS[st.timer].limit;
    st.stoppedBy = null; st.done = {}; st.drafts = {}; st.submitted = {};
    st.review = null; st.ready = {}; st.collectUntil = null;
  }

  const activeIds = (s) => s.players.filter((p) => p.connected).map((p) => p.id);

  function cleanAnswers(st, answers) {
    const out = {};
    if (answers && typeof answers === "object") st.cats.forEach((c) => { out[c] = clean(answers[c], 60); });
    return out;
  }

  // ---------- Prüfung & Punkte ----------
  const firstLetter = (t) => {
    const ch = String(t).trim().charAt(0).toUpperCase();
    return ({ "Ä": "A", "Ö": "O", "Ü": "U" })[ch] || ch.normalize("NFD").charAt(0);
  };
  function sameAnswer(a, b) {
    const M = root.S10Logic && root.S10Logic.textMatches;
    if (M) return M(a, b) || M(b, a);
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }
  // Berechnet für jede Kategorie und jeden Spieler: Text, gültig?, automatisch geprüft?, doppelt?, Punkte
  function scoreTable(s) {
    const st = s.slf, rv = st.review, ids = Object.keys(rv.answers);
    const table = {};
    st.cats.forEach((cat) => {
      const row = {};
      ids.forEach((pid) => {
        const text = (rv.answers[pid] || {})[cat] || "";
        const auto = !!text && firstLetter(text) === st.letter;
        const ov = rv.ov[pid + "|" + cat];
        row[pid] = { text, auto, valid: ov ? ov === "ok" : auto, overridden: !!ov, dup: false, points: 0 };
      });
      const valid = ids.filter((pid) => row[pid].valid);
      valid.forEach((pid) => {
        row[pid].dup = valid.some((o) => o !== pid && sameAnswer(row[pid].text, row[o].text));
        row[pid].points = valid.length === 1 && ids.length > 1 ? 20 : row[pid].dup ? 5 : 10;
      });
      table[cat] = row;
    });
    return table;
  }
  function roundPoints(s) {
    const table = scoreTable(s), pts = {};
    Object.keys(s.slf.review.answers).forEach((pid) => { pts[pid] = s.slf.cats.reduce((n, c) => n + table[c][pid].points, 0); });
    return pts;
  }

  function buildReview(s) {
    const st = s.slf;
    const answers = {};
    // alle aktuell verbundenen Spieler plus alle, die etwas abgegeben haben
    new Set([...activeIds(s), ...Object.keys(st.drafts)]).forEach((pid) => {
      if (s.players.some((p) => p.id === pid)) answers[pid] = st.drafts[pid] || {};
    });
    st.review = { answers, ov: {} };
    st.step = "review"; st.ready = {};
  }

  function finishRound(s, now) {
    const st = s.slf, pts = roundPoints(s);
    Object.entries(pts).forEach(([pid, n]) => { st.total[pid] = (st.total[pid] || 0) + n; });
    st.history.push({ round: st.round, letter: st.letter, points: pts });
    if (st.round >= st.rounds) st.step = "final";
    else nextRound(s, now);
  }

  // Zeitsteuerung beim Gastgeber; true = Zustand hat sich geändert
  function tick(s, now) {
    if (s.phase !== "slf" || !s.slf) return false;
    const st = s.slf, ids = activeIds(s);
    if (st.step === "writing") {
      const allDone = ids.length > 0 && ids.every((id) => st.done[id]);
      if (now >= st.deadline || allDone) { st.step = "collecting"; st.collectUntil = now + 3000; return true; }
    } else if (st.step === "collecting") {
      const allIn = ids.every((id) => st.submitted[id]);
      if (now >= st.collectUntil || allIn) { buildReview(s); return true; }
    }
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.slf) return false;
    const st = s.slf;
    switch (a.type) {
      case "slfDone":
        if (st.step !== "writing" || st.done[pid]) return false;
        st.done[pid] = true;
        if (st.timer === "stopp" && !st.stoppedBy) { st.stoppedBy = pid; st.deadline = Math.min(st.deadline, now + TIMERS.stopp.grace); }
        tick(s, now);
        return true;
      case "slfDraft":
        if (a.round !== st.round || (st.step !== "writing" && st.step !== "collecting")) return false;
        st.drafts[pid] = cleanAnswers(st, a.answers);
        return false; // Entwürfe werden nicht veröffentlicht
      case "slfSubmit":
        if (a.round !== st.round || (st.step !== "writing" && st.step !== "collecting")) return false;
        st.drafts[pid] = cleanAnswers(st, a.answers);
        st.submitted[pid] = true;
        return tick(s, now);
      case "slfToggle": {
        if (st.step !== "review" || !st.review.answers[a.pid] || !st.cats.includes(a.cat)) return false;
        const table = scoreTable(s), cell = table[a.cat][a.pid], key = a.pid + "|" + a.cat;
        const want = cell.valid ? "bad" : "ok";
        if ((want === "ok") === cell.auto) delete st.review.ov[key]; else st.review.ov[key] = want;
        st.ready = {}; // nach einer Änderung bestätigen alle neu
        return true;
      }
      case "slfReady": {
        if (st.step !== "review") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = activeIds(s).filter((id) => st.review.answers[id]);
        if (ids.length && ids.every((id) => st.ready[id])) finishRound(s, now);
        return true;
      }
      case "slfNext":
        if (!isHost || st.step !== "review") return false;
        finishRound(s, now); return true;
      case "slfRestart":
        if (st.step !== "final") return false;
        start(s, st.opts, now); return true;
    }
    return false;
  }

  function publicState(s, now) {
    const st = s.slf;
    if (!st) return null;
    const out = {
      cats: st.cats, rounds: st.rounds, round: st.round, letter: st.letter, step: st.step, timer: st.timer,
      timerName: TIMERS[st.timer].name, stoppedBy: st.stoppedBy, used: st.used.slice(), done: { ...st.done }, total: { ...st.total },
      endsIn: st.step === "writing" ? Math.max(0, st.deadline - now) : 0,
    };
    if (st.step === "review" || st.step === "final") {
      out.ready = { ...st.ready };
      if (st.review) { out.table = scoreTable(s); out.roundPoints = roundPoints(s); out.answered = Object.keys(st.review.answers); }
    }
    if (st.step === "final") {
      const max = Math.max(...Object.values(st.total));
      out.winners = Object.keys(st.total).filter((id) => st.total[id] === max);
    }
    return out;
  }

  root.S10Slf = { start, apply, tick, publicState, PRESETS, TIMERS, ROUND_CHOICES, firstLetter, categoriesFrom };
})(typeof window !== "undefined" ? window : globalThis);
