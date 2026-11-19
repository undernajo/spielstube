// „Listen-Duell“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.duell.
// Zwei Spieler, ein Thema mit einer festen Liste von Antworten (meist zehn, manchmal mehr oder weniger). Abwechselnd eine Antwort nennen – wer falsch liegt,
// eine schon genannte Antwort wiederholt oder die Zeit überzieht, verliert die Runde (der andere bekommt den Punkt).
// Sind alle gefunden, bekommt den Punkt, wer die letzte genannt hat.
(function (root) {
  const TARGETS = [3, 5, 7];
  const TIMERS = { "20": { name: "20 Sekunden", ms: 20000 }, "30": { name: "30 Sekunden", ms: 30000 }, "45": { name: "45 Sekunden", ms: 45000 }, "0": { name: "ohne Zeitlimit", ms: 0 } };
  const data = () => root.SCHLAU10_DUELL || [];
  const L = () => root.S10Logic;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- Antworten prüfen ----------
  const norm = (x) => String(x).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const variants = (list, item) => {
    const v = [item[0], ...(item[1] || [])];
    if (list.names) v.slice().forEach((x) => { const w = x.trim().split(/\s+/); if (w.length > 1) v.push(w[w.length - 1]); });
    return v;
  };
  // sicher richtig (wie bei Zehnkampf: kleine Tippfehler werden verziehen)
  function matches(list, item, text) {
    return L().textMatches(item[0], text, variants(list, item).slice(1), false);
  }
  // genau gleich geschrieben (hat Vorrang vor Tippfehlern, z. B. „Neon“ nicht als „Xenon“ werten)
  const exact = (list, item, text) => { const g = norm(text); return !!g && variants(list, item).some((v) => norm(v) === g); };
  // erst exakte Treffer, dann mit Tippfehler-Toleranz
  function find(list, text, ok) {
    const it = list.items;
    let i = it.findIndex((item, k) => ok(k) && exact(list, item, text));
    if (i < 0) i = it.findIndex((item, k) => ok(k) && matches(list, item, text));
    return i;
  }
  // Eingabe einordnen: genau geschrieben hat Vorrang (neu > schon genannt), erst dann Tippfehler (neu > schon genannt),
  // zuletzt „ähnlich“. So wird z. B. „Bayern“ nach Bayern München als doppelt erkannt und nicht als Tippfehler für „Bayer“.
  function classify(list, found, text) {
    const it = list.items, open = (k) => !found[k], done = (k) => !!found[k];
    let i = it.findIndex((item, k) => open(k) && exact(list, item, text)); if (i >= 0) return { kind: "hit", i };
    i = it.findIndex((item, k) => done(k) && exact(list, item, text)); if (i >= 0) return { kind: "dup", i };
    i = it.findIndex((item, k) => open(k) && matches(list, item, text)); if (i >= 0) return { kind: "hit", i };
    i = it.findIndex((item, k) => done(k) && matches(list, item, text)); if (i >= 0) return { kind: "dup", i };
    i = it.findIndex((item, k) => open(k) && near(list, item, text)); if (i >= 0) return { kind: "near", i };
    return { kind: "wrong", i: -1 };
  }
  // „ähnlich“ – dann entscheidet der Gegner, ob es zählt
  function near(list, item, text) {
    const g = norm(text);
    if (g.length < 3 || /^\d+$/.test(g)) return false;
    return variants(list, item).map(norm).some((v) => {
      if (/^\d+$/.test(v) || v.length < 3) return false;
      if (g.length >= 4 && (v.includes(g) || g.includes(v))) return true;
      return lev(v, g) <= Math.max(2, Math.floor(v.length * 0.34));
    });
  }

  function start(s, opts, now) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected && !p.paused).slice(0, 2).map((p) => p.id);
    if (seats.length < 2) return false;
    const tn = Number(opts.target), target = TARGETS.includes(tn) || (opts.free && Number.isInteger(tn) && tn > 0 && tn <= 9) ? tn : 5; // free: Querbeet
    const timer = TIMERS[String(opts.timer)] ? String(opts.timer) : "30";
    // erst Themen, die noch nicht dran waren
    const avoid = new Set(opts.avoid || []);
    const idx = data().map((_, i) => i);
    const fresh = shuffle(idx.filter((i) => !avoid.has(data()[i].q))), old = shuffle(idx.filter((i) => avoid.has(data()[i].q)));
    s.game = "duell"; s.phase = "duell";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.duell = { opts: { target, timer }, seats, score: { [seats[0]]: 0, [seats[1]]: 0 }, order: [...fresh, ...old], li: -1, round: 0,
      starter: seats[Math.random() < 0.5 ? 0 : 1], history: [] };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    nextRound(s, now);
    return true;
  }

  function nextRound(s, now) {
    const st = s.duell;
    st.li = (st.li + 1) % st.order.length;
    st.round++;
    if (st.round > 1) st.starter = st.seats.find((id) => id !== st.starter); // Anfang wechselt jede Runde
    st.turn = st.starter;
    st.found = Array(list(st).items.length).fill(null); // { by }
    st.moves = []; // { by, text, ok, item, why }
    st.judge = null; st.result = null;
    st.step = "turn";
    setDeadline(st, now);
  }
  function setDeadline(st, now) { const ms = TIMERS[st.opts.timer].ms; st.deadline = ms ? now + ms : 0; }
  const list = (st) => data()[st.order[st.li]];
  const other = (st, id) => st.seats.find((x) => x !== id);

  function reveal(s, pid, i, text, now) {
    const st = s.duell;
    st.found[i] = { by: pid };
    st.moves.push({ by: pid, text, ok: true, item: i });
    if (st.found.every(Boolean)) return endRound(s, pid, "full", now);
    st.turn = other(st, pid); st.step = "turn"; st.judge = null;
    setDeadline(st, now);
  }
  function fail(s, loser, why, text, item, now) {
    const st = s.duell;
    st.moves.push({ by: loser, text, ok: false, why, item });
    endRound(s, other(st, loser), why, now, loser);
  }
  function endRound(s, winner, why, now, loser) {
    const st = s.duell;
    st.score[winner]++;
    st.result = { winner, loser: loser || null, why };
    st.history.push({ q: list(st).q, winner });
    st.judge = null; st.deadline = 0;
    st.step = st.score[winner] >= st.opts.target ? "final" : "roundEnd";
  }

  function answer(s, pid, text, now) {
    const st = s.duell, li = list(st);
    text = String(text || "").trim().slice(0, 60);
    if (!text) return false;
    const it = li.items;
    const c = classify(li, st.found, text);
    if (c.kind === "hit") { reveal(s, pid, c.i, text, now); return true; }
    if (c.kind === "dup") { fail(s, pid, "dup", text, c.i, now); return true; }
    if (c.kind === "near") { st.step = "judge"; st.judge = { by: pid, text, item: c.i }; st.deadline = 0; return true; }
    fail(s, pid, "wrong", text, null, now); return true;
  }

  function tick(s, now) {
    if (s.phase !== "duell" || !s.duell) return false;
    const st = s.duell;
    if (st.step === "turn" && st.deadline && now >= st.deadline) { fail(s, st.turn, "time", "", null, now); return true; }
    return false;
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.duell) return false;
    const st = s.duell;
    switch (a.type) {
      case "duAnswer":
        if (st.step !== "turn" || pid !== st.turn || a.round !== st.round) return false;
        return answer(s, pid, a.text, now);
      case "duJudge": // der Gegner entscheidet, ob eine ähnliche Antwort zählt
        if (st.step !== "judge" || !st.judge || pid !== other(st, st.judge.by)) return false;
        if (a.ok) reveal(s, st.judge.by, st.judge.item, st.judge.text, now);
        else fail(s, st.judge.by, "wrong", st.judge.text, null, now);
        return true;
      case "duNext":
        if (st.step !== "roundEnd" || (!st.seats.includes(pid) && !isHost)) return false;
        nextRound(s, now); return true;
      case "duRestart":
        if (st.step !== "final") return false;
        return start(s, { ...st.opts, avoid: st.history.map((h) => h.q) }, now);
    }
    return false;
  }

  function publicState(s, now) {
    const st = s.duell;
    if (!st) return null;
    const li = list(st), open = st.step === "roundEnd" || st.step === "final";
    return {
      step: st.step, round: st.round, seats: st.seats.slice(), score: { ...st.score }, target: st.opts.target, timer: st.opts.timer,
      timerName: TIMERS[st.opts.timer].name, turn: st.turn, starter: st.starter,
      deadlineIn: st.deadline ? Math.max(0, st.deadline - now) : 0, timerMs: TIMERS[st.opts.timer].ms,
      list: { q: li.q, cat: li.cat || "", note: li.note || "" },
      // Liste füllt sich von oben in der Reihenfolge, in der genannt wurde (verrät keinen Rang);
      // verdeckte Antworten nur nach der Runde
      items: (() => {
        const got = st.moves.filter((m) => m.ok).map((m) => m.item);
        const rest = li.items.map((_, i) => i).filter((i) => !st.found[i]);
        return [...got.map((i) => ({ t: li.items[i][0], by: st.found[i].by })), ...rest.map((i) => ({ t: open ? li.items[i][0] : null, by: null }))];
      })(),
      moves: st.moves.map((m) => ({ ...m })),
      judge: st.judge ? { by: st.judge.by, text: st.judge.text, t: li.items[st.judge.item][0] } : null,
      result: st.result ? { ...st.result } : null,
      history: st.history.slice(),
    };
  }

  root.S10Duell = { start, apply, tick, publicState, matches, exact, near, find, classify, TARGETS, TIMERS };
})(typeof window !== "undefined" ? window : globalThis);
