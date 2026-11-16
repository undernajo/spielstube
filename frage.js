// „Antwort sucht Frage“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.frage.
// Zwei Spieler. Der Fragensteller bekommt eine Kategorie und eine Antwort (z. B. Religion → 3) und denkt sich
// eine passende Frage aus. Der andere beantwortet sie: richtig = Punkt für ihn, sonst Punkt für den Fragensteller.
// Die gesuchte Antwort sieht bis zur Auflösung nur der Fragensteller (privat, wie Handkarten).
(function (root) {
  const TARGETS = [3, 5, 7];
  const WRITE = { "60": { name: "1 Minute", ms: 60000 }, "120": { name: "2 Minuten", ms: 120000 }, "180": { name: "3 Minuten", ms: 180000 }, "300": { name: "5 Minuten", ms: 300000 }, "0": { name: "ohne Zeitlimit", ms: 0 } };
  const ANSWER = { "15": { name: "15 Sekunden", ms: 15000 }, "30": { name: "30 Sekunden", ms: 30000 }, "45": { name: "45 Sekunden", ms: 45000 }, "60": { name: "1 Minute", ms: 60000 }, "0": { name: "ohne Zeitlimit", ms: 0 } };
  const data = () => root.SCHLAU10_FRAGE || [];
  const L = () => root.S10Logic;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const keyOf = (ci, ai) => data()[ci].cat + "|" + data()[ci].answers[ai][0];

  // Zahlen auch als Wort: „3“ = „drei“
  const ONES = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn",
    "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
  const TENS = { 20: "zwanzig", 30: "dreißig", 40: "vierzig", 50: "fünfzig", 60: "sechzig", 70: "siebzig", 80: "achtzig", 90: "neunzig" };
  function numWords(n) {
    if (n < 20) return n === 1 ? ["eins", "ein", "eine"] : [ONES[n]];
    if (n < 100) { const t = n - (n % 10), o = n % 10; return [o ? (o === 1 ? "ein" : ONES[o]) + "und" + TENS[t] : TENS[t]]; }
    if (n === 100) return ["hundert", "einhundert"];
    if (n === 1000) return ["tausend", "eintausend"];
    return [];
  }
  const norm = (x) => String(x).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
  function variants(a) {
    const v = [a[0], ...(a[1] || [])];
    if (/^\d+$/.test(a[0])) v.push(...numWords(Number(a[0])));
    return v;
  }
  function correct(a, text) {
    const g = norm(text);
    if (!g) return false;
    const vs = variants(a);
    if (vs.some((v) => norm(v) === g)) return true;
    if (/^\d+$/.test(a[0])) { const m = String(text).match(/\d+/g); return !!m && m.length === 1 && m[0] === a[0]; } // „3 Könige“ zählt bei 3
    return L().textMatches(a[0], text, vs.slice(1), false);
  }

  function start(s, opts, now) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected).slice(0, 2).map((p) => p.id);
    if (seats.length < 2) return false;
    const target = TARGETS.includes(Number(opts.target)) ? Number(opts.target) : 5;
    const write = WRITE[String(opts.write)] ? String(opts.write) : "0";
    const answer = ANSWER[String(opts.answer)] ? String(opts.answer) : "0";
    const avoid = new Set(opts.avoid || []);
    const all = []; data().forEach((c, ci) => c.answers.forEach((_, ai) => all.push([ci, ai])));
    const fresh = shuffle(all.filter(([ci, ai]) => !avoid.has(keyOf(ci, ai)))), old = shuffle(all.filter(([ci, ai]) => avoid.has(keyOf(ci, ai))));
    s.game = "frage"; s.phase = "frage";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.frage = { opts: { target, write, answer }, seats, score: { [seats[0]]: 0, [seats[1]]: 0 }, order: [...fresh, ...old], li: -1, round: 0,
      asker: seats[Math.random() < 0.5 ? 0 : 1], history: [] };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    nextRound(s, now);
    return true;
  }
  const other = (st, id) => st.seats.find((x) => x !== id);
  const cur = (st) => { const [ci, ai] = st.order[st.li]; return { cat: data()[ci].cat, a: data()[ci].answers[ai] }; };

  function nextRound(s, now) {
    const st = s.frage;
    st.round++;
    if (st.round > 1) st.asker = other(st, st.asker); // abwechselnd fragen
    st.rerolled = false;
    pick(st);
    st.question = ""; st.guess = ""; st.result = null; st.step = "write";
    setDeadline(st, now, "write");
  }
  function pick(st) { st.li = (st.li + 1) % st.order.length; }
  function setDeadline(st, now, kind) {
    const ms = (kind === "write" ? WRITE[st.opts.write] : ANSWER[st.opts.answer]).ms;
    st.deadline = ms ? now + ms : 0;
  }
  function finish(s, winner, why) {
    const st = s.frage;
    st.score[winner]++;
    st.result = { winner, why };
    st.history.push({ key: keyOf(...st.order[st.li]), winner });
    st.deadline = 0;
    st.step = st.score[winner] >= st.opts.target ? "final" : "reveal";
  }

  function tick(s, now) {
    if (s.phase !== "frage" || !s.frage) return false;
    const st = s.frage;
    if (!st.deadline || now < st.deadline) return false;
    if (st.step === "write") { finish(s, other(st, st.asker), "noq"); return true; }   // keine Frage gestellt
    if (st.step === "answer") { finish(s, st.asker, "time"); return true; }             // keine Antwort
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.frage) return false;
    const st = s.frage, guesser = other(st, st.asker);
    switch (a.type) {
      case "fqQuestion": {
        if (st.step !== "write" || pid !== st.asker || a.round !== st.round) return false;
        const q = String(a.text || "").trim().slice(0, 300);
        if (!q) return false;
        st.question = q; st.step = "answer"; setDeadline(st, now, "answer");
        return true;
      }
      case "fqReroll": // einmal pro Runde eine andere Antwort (gleiche Regeln, keine Strafe)
        if (st.step !== "write" || pid !== st.asker || st.rerolled) return false;
        st.rerolled = true; pick(st); setDeadline(st, now, "write");
        return true;
      case "fqGuess": {
        if (st.step !== "answer" || pid !== guesser || a.round !== st.round) return false;
        const g = String(a.text || "").trim().slice(0, 80);
        if (!g) return false;
        st.guess = g;
        if (correct(cur(st).a, g)) finish(s, guesser, "right");
        else { st.step = "judge"; st.deadline = 0; } // nicht wörtlich gleich – der Fragensteller entscheidet
        return true;
      }
      case "fqJudge":
        if (st.step !== "judge" || pid !== st.asker) return false;
        finish(s, a.ok ? guesser : st.asker, a.ok ? "right" : "wrong");
        return true;
      case "fqNext":
        if (st.step !== "reveal" || (!st.seats.includes(pid) && !isHost)) return false;
        nextRound(s, now); return true;
    }
    return false;
  }

  // Die gesuchte Antwort bekommt während der Runde nur der Fragensteller
  function privateState(s, id) {
    const st = s.frage;
    if (!st || id !== st.asker || st.step === "reveal" || st.step === "final") return null;
    return { roundNo: st.round, li: st.li, answer: cur(st).a[0] };
  }

  function publicState(s, now) {
    const st = s.frage;
    if (!st) return null;
    const c = cur(st), open = st.step === "reveal" || st.step === "final";
    return {
      step: st.step, round: st.round, seats: st.seats.slice(), score: { ...st.score }, target: st.opts.target, asker: st.asker, guesser: other(st, st.asker),
      cat: c.cat, question: st.step === "write" ? "" : st.question, guess: st.step === "judge" || open ? st.guess : "", rerolled: st.rerolled, li: st.li,
      deadlineIn: st.deadline ? Math.max(0, st.deadline - now) : 0,
      timerMs: (st.step === "write" ? WRITE[st.opts.write] : ANSWER[st.opts.answer]).ms,
      writeName: WRITE[st.opts.write].name, answerName: ANSWER[st.opts.answer].name,
      answer: open ? c.a[0] : null, result: st.result ? { ...st.result } : null, history: st.history.slice(),
    };
  }

  root.S10Frage = { start, apply, tick, publicState, privateState, correct, numWords, keyOf, TARGETS, WRITE, ANSWER };
})(typeof window !== "undefined" ? window : globalThis);
