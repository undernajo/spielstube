// „Fragewand“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.wand.
// Tafel aus Kategorien × vier Stufen (10, 20, 30, 50 Punkte). Reihum wählt jemand ein Feld und beantwortet die Frage –
// nur wer gewählt hat. Richtig = Punkte des Feldes, falsch = keine (kein Abzug, kein Nachlegen, kein Zeitlimit).
// Eingetippte Antworten, die nicht automatisch erkannt werden, beurteilen die Mitspieler („zählt“ / „zählt nicht“).
(function (root) {
  const PTS = [10, 20, 30, 50];
  const data = () => root.SCHLAU10_WAND || [];
  const L = () => root.S10Logic;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const catOf = (key) => data().find((c) => c.key === key);
  const keyOf = (cat, r, i) => cat + ":" + PTS[r] + ":" + i;
  const qOf = (st, k, r) => { const cell = st.board[k][r]; return catOf(st.cats[k]).q[PTS[r]][cell.i]; };
  const active = (s, id) => { const p = s.players.find((x) => x.id === id); return !!(p && p.connected && !p.paused); };

  // Kategorien: gewählte zuerst, Rest auslosen; Thema „suedtirol“ nimmt Südtirol sicher mit, „welt“ lässt es weg
  function pickCats(opts) {
    const n = Math.max(1, Math.min(opts.n || 5, data().length));
    let pool = data();
    if (opts.theme === "welt") pool = pool.filter((c) => !c.st);
    const chosen = (opts.cats || []).filter((k) => pool.some((c) => c.key === k)).slice(0, n);
    if (opts.theme === "suedtirol" && !chosen.some((k) => catOf(k).st)) chosen.unshift(...pool.filter((c) => c.st).map((c) => c.key).slice(0, 1));
    const rest = shuffle(pool.filter((c) => !chosen.includes(c.key))).map((c) => c.key);
    return [...chosen, ...rest].slice(0, n);
  }

  function start(s, opts, now) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (seats.length < 2 || !data().length) return false;
    const cats = pickCats(opts), avoid = new Set(opts.avoid || []);
    // je Kategorie und Stufe eine Frage – bevorzugt eine, die in dieser Stube noch nicht dran war
    const board = cats.map((key) => PTS.map((pt, r) => {
      const all = catOf(key).q[pt].map((_, i) => i), fresh = all.filter((i) => !avoid.has(keyOf(key, r, i)));
      const from = fresh.length ? fresh : all;
      return { i: from[Math.floor(Math.random() * from.length)], done: null };
    }));
    s.game = "wand"; s.phase = "wand";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.wand = { opts: { cats: (opts.cats || []).slice(), n: opts.n || 5, theme: opts.theme || null }, cats, board, seats,
      turn: Math.floor(Math.random() * seats.length), score: Object.fromEntries(seats.map((id) => [id, 0])),
      step: "pick", cur: null, last: null, winners: null, round: 0 };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    return true;
  }

  const chooser = (st) => st.seats[st.turn % st.seats.length];
  // nächster Wählender: reihum, Getrennte und Pausierte überspringen
  function advance(s) {
    const st = s.wand;
    for (let k = 1; k <= st.seats.length; k++) {
      const i = (st.turn + k) % st.seats.length;
      if (active(s, st.seats[i])) { st.turn = i; return; }
    }
    st.turn = (st.turn + 1) % st.seats.length;
  }
  const judges = (s, st) => st.seats.filter((id) => id !== (st.cur && st.cur.by) && active(s, id));

  // checked: der Antwortende hat die Lösung schon gesehen und „Weiter“ getippt (dann keine Ergebnis-Karte mehr)
  function resolve(s, ok, judged, checked) {
    const st = s.wand, c = st.cur, q = qOf(st, c.k, c.r), pts = PTS[c.r];
    st.board[c.k][c.r].done = { by: c.by, ok: !!ok };
    if (ok) st.score[c.by] = (st.score[c.by] || 0) + pts;
    st.round++;
    st.last = { n: st.round, k: c.k, r: c.r, by: c.by, given: c.given || "", ok: !!ok, judged: !!judged, checked: !!checked, appeal: !!st.cur.appeal, a: q.a, t: q.t, pts, key: keyOf(st.cats[c.k], c.r, st.board[c.k][c.r].i) };
    st.cur = null;
    if (st.board.every((col) => col.every((cell) => cell.done))) {
      st.step = "final";
      const max = Math.max(...st.seats.map((id) => st.score[id] || 0));
      st.winners = st.seats.filter((id) => (st.score[id] || 0) === max);
      s.winners = st.winners;
    } else { st.step = "pick"; advance(s); }
  }

  function apply(s, pid, a, isHost, now) {
    const st = s.wand;
    if (!st) return false;
    switch (a.type) {
      case "fwPick": {
        const k = Number(a.k), r = Number(a.r);
        if (st.step !== "pick" || pid !== chooser(st) || !st.board[k] || !st.board[k][r] || st.board[k][r].done) return false;
        st.cur = { k, r, by: pid, given: "" }; st.step = "answer"; return true;
      }
      case "fwAnswer": {
        if (st.step !== "answer" || pid !== st.cur.by) return false;
        const q = qOf(st, st.cur.k, st.cur.r), text = String(a.text || "").trim().slice(0, 80);
        if (a.pass) { st.cur.given = ""; resolve(s, false); return true; } // „Weiß ich nicht“
        if (!text) return false;
        st.cur.given = text;
        if (q.c) { resolve(s, text === q.a); return true; }
        // kleine Abweichungen zählen (wie beim Zehnkampf); Zahlen: auch „drei“, „8 Minuten“, „1.991“
        let ok = L().textMatches(q.a, text, q.alt || [], false);
        if (!ok && /^\d+$/.test(String(q.a).trim())) {
          const want = [q.a, ...(q.alt || [])].flatMap((x) => L().parseNumCandidates(x));
          const m = /-?\d[\d.,]*/.exec(text), got = [...L().parseNumCandidates(text), ...(m ? L().parseNumCandidates(m[0]) : [])];
          ok = got.some((v) => want.includes(v));
        }
        if (ok) { resolve(s, true); return true; }
        // nicht erkannt: der Antwortende sieht die Lösung und tippt „Weiter“ oder legt Einspruch ein
        st.step = "check"; return true;
      }
      case "fwContinue": // Lösung gesehen, war falsch
        if (st.step !== "check" || pid !== st.cur.by) return false;
        resolve(s, false, false, true); return true;
      case "fwAppeal": // Einspruch: die anderen urteilen
        if (st.step !== "check" || pid !== st.cur.by || !judges(s, st).length) return false;
        st.cur.appeal = true; st.step = "judge"; return true;
      case "fwJudge": {
        if (st.step !== "judge" || !judges(s, st).includes(pid)) return false;
        resolve(s, !!a.ok, true); return true;
      }
      case "fwSkip": { // Gastgeber: getrennten Wählenden überspringen (bzw. offene Frage ohne Punkte schließen)
        if (!isHost || st.step === "final") return false;
        if (st.cur) { resolve(s, false); return true; }
        advance(s); return true;
      }
    }
    return false;
  }

  function publicState(s) {
    const st = s.wand;
    if (!st) return null;
    const cur = st.cur ? (() => { const q = qOf(st, st.cur.k, st.cur.r);
      return { k: st.cur.k, r: st.cur.r, by: st.cur.by, t: q.t, c: q.c ? q.c.slice() : null, pts: PTS[st.cur.r],
        given: st.step === "judge" || st.step === "check" ? st.cur.given : "", judges: st.step === "judge" || st.step === "check" ? judges(s, st) : [], appeal: !!st.cur.appeal,
        // die richtige Antwort erst nach der Antwort zeigen (Lösung ansehen bzw. urteilen)
        a: st.step === "judge" || st.step === "check" ? q.a : null }; })() : null;
    return {
      step: st.step, seats: st.seats.slice(), chooser: st.step === "final" ? null : chooser(st), score: { ...st.score }, round: st.round,
      cats: st.cats.map((key) => { const c = catOf(key); return { key, ico: c.ico, name: c.name }; }),
      // Felder: offen = null; erledigt = wer, richtig?, die Antwort
      board: st.board.map((col, k) => col.map((cell, r) => cell.done ? { by: cell.done.by, ok: cell.done.ok, a: catOf(st.cats[k]).q[PTS[r]][cell.i].a } : null)),
      cur, last: st.last, winners: st.winners, pts: PTS,
    };
  }

  root.S10Wand = { start, apply, publicState, PTS, cats: () => data().map((c) => ({ key: c.key, ico: c.ico, name: c.name, st: !!c.st })), keyOf };
})(typeof window !== "undefined" ? window : globalThis);
