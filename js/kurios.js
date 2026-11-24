// „Kaum zu glauben“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.kurios.
// Tafel mit verdeckten Feldern, jedes zeigt nur ein Stichwort (z. B. „🐙 Kraken“). Reihum wählt einer ein Feld,
// dann erscheinen drei Aussagen – genau eine stimmt. Wer gewählt hat, tippt die wahre an: richtig = 1 Punkt.
// Danach Auflösung mit Erklärung. Alle kommen gleich oft dran (wie bei der Fragewand).
(function (root) {
  const SIZES = { "9": { name: "Kleine Tafel (9 Felder)", n: 9, cols: 3 }, "12": { name: "Mittlere Tafel (12 Felder)", n: 12, cols: 4 }, "16": { name: "Große Tafel (16 Felder)", n: 16, cols: 4 } };
  const data = () => root.SCHLAU10_KURIOS || [];
  const key = (i) => data()[i].tag;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const active = (s, id) => { const p = s.players.find((x) => x.id === id); return !!(p && p.connected && !p.paused); };

  function start(s, opts) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (seats.length < 2) return false;
    const size = SIZES[String(opts.size)] ? String(opts.size) : "12";
    // per: Stubenmeisterschaft – jeder bekommt so viele Fragen (Tafel 6 bis 16 Felder)
    const per = Number(opts.per) > 0 ? Number(opts.per) : 0;
    const n = Math.min(per ? Math.max(6, Math.min(16, per * seats.length)) : SIZES[size].n, data().length), cols = n <= 9 ? 3 : 4;
    const avoid = new Set(opts.avoid || []), all = data().map((_, i) => i);
    const picks = [...shuffle(all.filter((i) => !avoid.has(key(i)))), ...shuffle(all.filter((i) => avoid.has(key(i))))].slice(0, n);
    s.game = "kurios"; s.phase = "kurios";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.kurios = { opts: { size, per }, cols, seats, turn: Math.floor(Math.random() * seats.length), score: Object.fromEntries(seats.map((id) => [id, 0])),
      // je Feld: welche Frage und in welcher Reihenfolge die Aussagen erscheinen (0 = die wahre)
      board: picks.map((i) => ({ i, order: shuffle([0, 1, 2]), done: null })),
      step: "pick", cur: null, round: 0, move: 0, winners: null,
      turns: Math.floor(n / seats.length) * seats.length || n }; // gleich viele Züge für alle
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    return true;
  }
  const chooser = (st) => st.seats[st.turn % st.seats.length];
  function advance(s) {
    const st = s.kurios;
    for (let k = 1; k <= st.seats.length; k++) { const i = (st.turn + k) % st.seats.length; if (active(s, st.seats[i])) { st.turn = i; return; } }
    st.turn = (st.turn + 1) % st.seats.length;
  }
  function next(s) {
    const st = s.kurios;
    st.cur = null; st.move++;
    if (st.round >= st.turns || st.board.every((c) => c.done)) {
      st.step = "final";
      const max = Math.max(...st.seats.map((id) => st.score[id] || 0));
      st.winners = st.seats.filter((id) => (st.score[id] || 0) === max); s.winners = st.winners;
    } else { st.step = "pick"; advance(s); }
  }

  function tick(s) {
    if (s.phase !== "kurios" || !s.kurios) return false;
    const st = s.kurios;
    // wer wählen soll, ist weg: der Nächste ist dran (eine schon gewählte Frage bleibt offen auf der Tafel)
    if ((st.step === "pick" || st.step === "answer") && !active(s, chooser(st)) && st.seats.some((id) => active(s, id))) {
      if (st.cur) st.cur = null;
      st.step = "pick"; advance(s); st.move++; return true;
    }
    return false;
  }

  function apply(s, pid, a, isHost) {
    const st = s.kurios;
    if (!st || !a || a.move !== st.move) return false;
    switch (a.type) {
      case "kuPick": {
        const k = Number(a.k);
        if (st.step !== "pick" || pid !== chooser(st) || !st.board[k] || st.board[k].done) return false;
        st.cur = { k, by: pid, pick: null }; st.step = "answer"; st.move++;
        return true;
      }
      case "kuAnswer": {
        const c = Number(a.c);
        if (st.step !== "answer" || pid !== st.cur.by || ![0, 1, 2].includes(c)) return false;
        const cell = st.board[st.cur.k], ok = cell.order[c] === 0;
        st.cur.pick = c; cell.done = { by: pid, ok };
        if (ok) st.score[pid] = (st.score[pid] || 0) + 1;
        st.round++; st.step = "reveal"; st.move++;
        return true;
      }
      case "kuNext":
        if (st.step !== "reveal" || (!st.seats.includes(pid) && !isHost)) return false;
        next(s); return true;
    }
    return false;
  }

  function publicState(s) {
    const st = s.kurios;
    if (!st) return null;
    const D = data(), cols = st.cols || SIZES[st.opts.size].cols;
    const cur = st.cur ? (() => { const cell = st.board[st.cur.k], q = D[cell.i], open = st.step === "reveal";
      return { k: st.cur.k, by: st.cur.by, ico: q.ico, tag: q.tag, s: cell.order.map((o) => q.s[o]), pick: st.cur.pick,
        right: open ? cell.order.indexOf(0) : null, e: open ? q.e : null }; })() : null;
    return {
      step: st.step, move: st.move, seats: st.seats.slice(), chooser: st.step === "final" ? null : chooser(st), score: { ...st.score },
      round: st.round, turns: st.turns, cols,
      board: st.board.map((c) => ({ ico: D[c.i].ico, tag: D[c.i].tag, done: c.done ? { ...c.done } : null })),
      cur, winners: st.winners,
    };
  }
  const usedKeys = (st) => st.board.filter((c) => c.done).map((c) => key(c.i));

  root.S10Kurios = { start, apply, tick, publicState, usedKeys, key, SIZES };
})(typeof window !== "undefined" ? window : globalThis);
