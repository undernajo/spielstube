// Stadt, Land, Fluss – Spiellogik (läuft beim Gastgeber, testbar in Node).
// Der Zustand liegt in s.slf; Spieler (s.players) teilt sich das Spiel mit Zehnkampf.
// Ablauf pro Runde: Buchstabe dreht sich (SPIN_MS) → schreiben → einsammeln → Auswertung Kategorie für Kategorie
// (jeder kann fremde Antworten per Daumen anzweifeln; bei Mehrheit kippt die Wertung) → nächste Runde.
(function (root) {
  const LETTERS = "ABDEFGHIKLMNOPRSTUVWZ".split(""); // ohne C, J, Q, X, Y
  const SPIN_MS = 2600; // so lange dreht sich der Buchstabe, bevor geschrieben wird
  const PRESETS = {
    klassisch: { name: "Klassisch", cats: ["Stadt", "Land", "Fluss", "Name", "Tier", "Beruf"] },
    gemischt: { name: "Gemischt", cats: ["Stadt", "Land", "Tier", "Etwas Rundes", "Name für ein Haustier", "Etwas, das man im Supermarkt kauft"] },
    spass: { name: "Spaß", cats: ["Etwas im Kühlschrank", "Ausrede fürs Zuspätkommen", "Schlechtes Geschenk", "Grund für einen Streit", "Etwas im Rucksack", "Etwas, das stinkt"] },
    suedtirol: { name: "Südtirol", cats: ["Südtiroler Ort", "Berg oder Gipfel", "Essen & Trinken", "Dialektwort", "Etwas auf der Alm", "Vorname"] },
    zufall: { name: "Jede Runde neu", cats: [], random: 6 },
  };
  // Pool für „Jede Runde neu“ und die Überraschungskategorie – breit genug, dass es zu fast jedem Buchstaben etwas gibt
  const POOL = [
    "Stadt", "Land", "Fluss", "Vorname", "Tier", "Beruf", "Pflanze", "Essen", "Getränk", "Marke", "Berühmte Person", "Sportart",
    "Musikinstrument", "Film oder Serie", "Lied oder Band", "Körperteil", "Kleidungsstück", "Hobby", "Spiel", "Gemüse oder Obst",
    "Etwas im Kühlschrank", "Etwas im Badezimmer", "Etwas in der Küche", "Etwas im Rucksack", "Etwas Rundes", "Etwas Schweres",
    "Etwas Weiches", "Etwas Gefährliches", "Etwas, das stinkt", "Etwas Teures", "Etwas am Strand", "Etwas im Wald",
    "Etwas auf dem Bauernhof", "Etwas, das man im Winter braucht", "Schlechtes Geschenk", "Ausrede fürs Zuspätkommen",
    "Grund für einen Streit", "Harmloses Schimpfwort", "Werkzeug", "Fahrzeug", "Gebäude", "Märchen- oder Comicfigur",
    "Superkraft", "Urlaubsziel", "Schulfach", "Gefühl", "Eigenschaft eines Menschen", "Tätigkeit (Verb)", "Pizzabelag",
    "Süßigkeit", "Möbelstück", "Spielzeug", "Name für ein Haustier", "Erfindung", "Guter Vorsatz", "Name für ein Restaurant",
    "Erfundener Bandname", "Etwas, das man im Supermarkt kauft", "Wort mit mehr als 10 Buchstaben", "Etwas, das man sammeln kann",
  ];
  const TIMERS = {
    stopp: { name: "„Stopp!“ + 10 s", limit: 180000, grace: 10000 },
    t90: { name: "90 Sekunden fest", limit: 90000 },
    t60: { name: "60 Sekunden fest", limit: 60000 },
  };
  const ROUND_CHOICES = [3, 5, 8];

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clean = (t, n) => String(t == null ? "" : t).replace(/\s+/g, " ").trim().slice(0, n);
  const low = (c) => c.toLowerCase();

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
    const preset = opts.preset === "eigene" || PRESETS[opts.preset] ? opts.preset : "klassisch";
    const random = preset === "zufall" ? PRESETS.zufall.random : 0;
    s.game = "slf"; s.phase = "slf";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.slf = {
      opts: { preset, custom: clean(opts.custom, 400), rounds, timer, surprise: !!opts.surprise },
      baseCats: random ? [] : categoriesFrom({ preset, custom: opts.custom }), random, surprise: !random && !!opts.surprise,
      cats: [], surpriseCat: null, catsUsed: [], rounds, timer, round: 0, used: [], total: {}, history: [],
    };
    s.players.forEach((p) => { s.slf.total[p.id] = 0; p.waiting = false; p.status = "active"; });
    nextRound(s, now);
  }

  // n Kategorien aus dem Pool ziehen, die in dieser Partie noch nicht dran waren und nicht schon fest gesetzt sind
  function drawCats(st, n) {
    const taken = new Set([...st.baseCats, ...st.catsUsed].map(low));
    let free = POOL.filter((c) => !taken.has(low(c)));
    if (free.length < n) { st.catsUsed = []; free = POOL.filter((c) => !st.baseCats.map(low).includes(low(c))); }
    const out = shuffle(free.slice()).slice(0, n);
    st.catsUsed.push(...out);
    return out;
  }

  function nextRound(s, now) {
    const st = s.slf;
    st.round++;
    const free = LETTERS.filter((l) => !st.used.includes(l));
    st.letter = shuffle(free.length ? free : LETTERS.slice())[0];
    st.used.push(st.letter);
    st.cats = st.random ? drawCats(st, st.random) : st.baseCats.slice();
    st.surpriseCat = null;
    if (st.surprise) { const c = drawCats(st, 1)[0]; if (c) { st.cats.push(c); st.surpriseCat = c; } }
    st.step = "writing";
    st.startAt = now + SPIN_MS;
    st.deadline = st.startAt + TIMERS[st.timer].limit;
    st.stoppedBy = null; st.done = {}; st.stuck = {}; st.drafts = {}; st.submitted = {};
    st.review = null; st.ready = {}; st.collectUntil = null;
  }

  const activeIds = (s) => s.players.filter((p) => p.connected).map((p) => p.id);

  function cleanAnswers(st, answers) {
    const out = {};
    if (answers && typeof answers === "object") st.cats.forEach((c) => { out[c] = clean(answers[c], 60); });
    return out;
  }
  const allFilled = (st, answers) => st.cats.every((c) => !!(answers && answers[c]));

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
  // Wer über eine Antwort abstimmen darf: alle verbundenen Mitspieler außer dem, der sie geschrieben hat
  const votersFor = (s, pid) => activeIds(s).filter((id) => id !== pid && s.slf.review.answers[id]);
  // Berechnet für jede Kategorie und jeden Spieler: Text, gültig?, Buchstabe passt?, Stimmen, doppelt?, Punkte.
  // Gültig ist eine Antwort mit passendem Anfangsbuchstaben – außer die Mehrheit der Mitspieler stimmt dagegen.
  // Umgekehrt kann die Mehrheit eine Antwort mit „falschem“ Buchstaben doch gelten lassen.
  function scoreTable(s) {
    const st = s.slf, rv = st.review, ids = Object.keys(rv.answers);
    const table = {};
    st.cats.forEach((cat) => {
      const row = {};
      ids.forEach((pid) => {
        const text = (rv.answers[pid] || {})[cat] || "";
        const auto = !!text && firstLetter(text) === st.letter;
        const voters = Object.keys(rv.votes[pid + "|" + cat] || {});
        const elig = votersFor(s, pid).length;
        const flipped = !!text && voters.length > 0 && voters.length * 2 > elig;
        row[pid] = { text, auto, voters, need: Math.floor(elig / 2) + 1, valid: flipped ? !auto : auto, overridden: flipped, dup: false, points: 0 };
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
  // Punkte der Runde – upTo: nur die ersten upTo Kategorien (für den Zwischenstand beim Aufdecken)
  function roundPoints(s, upTo) {
    const table = scoreTable(s), pts = {}, cats = s.slf.cats.slice(0, upTo == null ? s.slf.cats.length : upTo);
    Object.keys(s.slf.review.answers).forEach((pid) => { pts[pid] = cats.reduce((n, c) => n + table[c][pid].points, 0); });
    return pts;
  }

  function buildReview(s) {
    const st = s.slf;
    const answers = {};
    // alle aktuell verbundenen Spieler plus alle, die etwas abgegeben haben
    new Set([...activeIds(s), ...Object.keys(st.drafts)]).forEach((pid) => {
      if (s.players.some((p) => p.id === pid)) answers[pid] = st.drafts[pid] || {};
    });
    st.review = { answers, votes: {}, ci: 0 };
    st.step = "review"; st.ready = {};
  }

  function finishRound(s, now) {
    const st = s.slf, pts = roundPoints(s);
    Object.entries(pts).forEach(([pid, n]) => { st.total[pid] = (st.total[pid] || 0) + n; });
    st.history.push({ round: st.round, letter: st.letter, points: pts });
    if (st.round >= st.rounds) st.step = "final";
    else nextRound(s, now);
  }
  // nächste Kategorie aufdecken – nach der letzten ist die Runde vorbei
  function nextCat(s, now) {
    const st = s.slf;
    st.review.ci++; st.ready = {};
    if (st.review.ci >= st.cats.length) finishRound(s, now);
  }

  // Zeitsteuerung beim Gastgeber; true = Zustand hat sich geändert
  function tick(s, now) {
    if (s.phase !== "slf" || !s.slf) return false;
    const st = s.slf, ids = activeIds(s);
    if (st.step === "writing") {
      // vorbei, wenn alle fertig sind oder nicht mehr weiterwissen („Mir fällt nichts mehr ein“)
      const allDone = ids.length > 0 && ids.every((id) => st.done[id] || st.stuck[id]);
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
        if (st.step !== "writing" || st.done[pid] || now < st.startAt) return false;
        if (a.answers) st.drafts[pid] = cleanAnswers(st, a.answers);
        // Stopp rufen darf nur, wer alle Felder ausgefüllt hat
        if (st.timer === "stopp" && !allFilled(st, st.drafts[pid])) return false;
        st.done[pid] = true;
        if (st.timer === "stopp" && !st.stoppedBy) { st.stoppedBy = pid; st.deadline = Math.min(st.deadline, now + TIMERS.stopp.grace); }
        tick(s, now);
        return true;
      case "slfStuck":
        // „Mir fällt nichts mehr ein“ – nochmal tippen nimmt es zurück; stimmen alle zu, endet die Schreibzeit
        if (st.step !== "writing" || st.done[pid] || now < st.startAt) return false;
        if (a.answers) st.drafts[pid] = cleanAnswers(st, a.answers);
        if (st.stuck[pid]) delete st.stuck[pid]; else st.stuck[pid] = true;
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
      case "slfVote": {
        // Daumen bei einer fremden Antwort der gerade aufgedeckten Kategorie (nochmal tippen = zurücknehmen)
        const rv = st.review;
        if (st.step !== "review" || a.cat !== st.cats[rv.ci] || a.pid === pid || !rv.answers[a.pid] || !rv.answers[pid]) return false;
        if (!(rv.answers[a.pid] || {})[a.cat]) return false;
        const key = a.pid + "|" + a.cat, v = rv.votes[key] || (rv.votes[key] = {});
        if (v[pid]) delete v[pid]; else v[pid] = true;
        st.ready = {}; // nach einer Änderung bestätigen alle neu
        return true;
      }
      case "slfReady": {
        if (st.step !== "review") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = activeIds(s).filter((id) => st.review.answers[id]);
        if (ids.length && ids.every((id) => st.ready[id])) nextCat(s, now);
        return true;
      }
      case "slfNext":
        if (!isHost || st.step !== "review") return false;
        nextCat(s, now); return true;
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
      cats: st.cats, surpriseCat: st.surpriseCat, rounds: st.rounds, round: st.round, letter: st.letter, step: st.step, timer: st.timer,
      timerName: TIMERS[st.timer].name, stoppedBy: st.stoppedBy, used: st.used.slice(), done: { ...st.done }, stuck: { ...(st.stuck || {}) }, total: { ...st.total },
      endsIn: st.step === "writing" ? Math.max(0, st.deadline - now) : 0,
      startsIn: st.step === "writing" ? Math.max(0, st.startAt - now) : 0,
    };
    if (st.step === "review" && st.review) {
      // nur die schon aufgedeckten Kategorien verschicken
      const ci = st.review.ci, full = scoreTable(s), table = {};
      st.cats.slice(0, ci + 1).forEach((c) => { table[c] = full[c]; });
      Object.assign(out, { ready: { ...st.ready }, ci, table, roundPoints: roundPoints(s, ci + 1), answered: Object.keys(st.review.answers) });
    }
    if (st.step === "final") {
      const max = Math.max(...Object.values(st.total));
      out.winners = Object.keys(st.total).filter((id) => st.total[id] === max);
    }
    return out;
  }

  root.S10Slf = { start, apply, tick, publicState, PRESETS, POOL, TIMERS, ROUND_CHOICES, SPIN_MS, firstLetter, categoriesFrom };
})(typeof window !== "undefined" ? window : globalThis);
