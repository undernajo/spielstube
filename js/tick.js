// „Wie tickst du?“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.tick.
// Reihum bekommt einer (der Hinweisgeber) eine Skala zwischen zwei Gegensätzen und heimlich eine Zahl von 1 bis 10.
// Er nennt etwas (Film, Essen, Situation …), das für ihn genau auf diese Zahl passt – laut (Standard) oder eingetippt.
// Die anderen tippen, welche Zahl gemeint war, ohne Zeitdruck und ohne die Tipps der anderen zu sehen.
// Punkte: genau 3, eins daneben 2, zwei daneben 1. Der Hinweisgeber bekommt den Durchschnitt der Ratenden (gerundet).
// Zu zweit spielt man damit als Team (beide haben immer gleich viele Punkte).
(function (root) {
  const ROUNDS = { "1": { name: "Jeder gibt 1 Hinweis", n: 1 }, "2": { name: "Jeder gibt 2 Hinweise", n: 2 }, "3": { name: "Jeder gibt 3 Hinweise", n: 3 } };
  const MODES = { laut: { name: "Hinweis laut sagen – im Videoanruf oder am selben Tisch" }, tippen: { name: "Hinweis eintippen" } };
  const MAX = 10, REROLLS = 2;
  const PTS = (d) => d === 0 ? 3 : d === 1 ? 2 : d === 2 ? 1 : 0;
  const data = () => root.SCHLAU10_TICK || [];
  const key = (i) => data()[i].join("|");
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function start(s, opts) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (seats.length < 2) return false;
    const rounds = ROUNDS[String(opts.rounds)] ? String(opts.rounds) : "2", mode = MODES[opts.mode] ? opts.mode : "laut";
    const avoid = new Set(opts.avoid || []), all = data().map((_, i) => i);
    const deck = [...shuffle(all.filter((i) => !avoid.has(key(i)))), ...shuffle(all.filter((i) => avoid.has(key(i))))];
    s.game = "tick"; s.phase = "tick";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.tick = { opts: { rounds, mode }, seats, order: shuffle(seats.slice()), total: seats.length * ROUNDS[rounds].n, turnNo: 0, deck, di: -1, move: 0,
      score: Object.fromEntries(seats.map((id) => [id, 0])), history: [], step: "guess" };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    nextTurn(s);
    return true;
  }
  const connectedIds = (s) => new Set(s.players.filter((p) => p.connected).map((p) => p.id));
  const guessers = (s) => { const st = s.tick, c = connectedIds(s); return st.seats.filter((id) => id !== st.giver && c.has(id)); };
  function drawScale(st) { st.di = (st.di + 1) % st.deck.length; st.scale = st.deck[st.di]; st.target = 1 + Math.floor(Math.random() * MAX); }

  function nextTurn(s) {
    const st = s.tick;
    st.turnNo++; st.move++;
    if (st.turnNo > st.total) { st.step = "final"; st.giver = null; return; }
    st.giver = st.order[(st.turnNo - 1) % st.order.length];
    drawScale(st);
    st.hint = ""; st.guesses = {}; st.rerolls = 0; st.result = null; st.step = "guess";
  }
  function reveal(s) {
    const st = s.tick, pts = {};
    Object.entries(st.guesses).forEach(([id, g]) => { pts[id] = PTS(Math.abs(g - st.target)); });
    const vals = Object.values(pts), gp = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    pts[st.giver] = gp;
    Object.entries(pts).forEach(([id, p]) => { st.score[id] = (st.score[id] || 0) + p; });
    st.result = { pts };
    st.history.push({ giver: st.giver, scale: data()[st.scale].slice(), target: st.target, hint: st.hint, guesses: { ...st.guesses }, pts });
    st.step = "reveal"; st.move++;
  }

  function tick(s) {
    if (s.phase !== "tick" || !s.tick) return false;
    const st = s.tick;
    if (st.step !== "guess") return false;
    const c = connectedIds(s), need = guessers(s);
    if (!c.has(st.giver) && need.length) { nextTurn(s); return true; } // Hinweisgeber ist weg: weiter (ohne Punkte)
    if (need.length && need.every((id) => st.guesses[id] != null)) { reveal(s); return true; }
    return false;
  }

  function apply(s, pid, a, isHost) {
    if (!a || typeof a !== "object" || !s.tick) return false;
    const st = s.tick, giver = pid === st.giver;
    if (a.move !== st.move) return false; // veralteter Klick
    switch (a.type) {
      case "tkHint": { // Hinweis aufschreiben (beim Eintippen Pflicht, beim lauten Spielen freiwillig)
        if (st.step !== "guess" || !giver) return false;
        st.hint = String(a.text || "").trim().slice(0, 120);
        return true;
      }
      case "tkReroll": // andere Skala (und neue Zahl), solange noch niemand getippt hat
        if (st.step !== "guess" || !giver || st.rerolls >= REROLLS || Object.keys(st.guesses).length || st.hint) return false;
        st.rerolls++; drawScale(st); st.move++;
        return true;
      case "tkGuess": {
        const v = Number(a.v);
        if (st.step !== "guess" || giver || !st.seats.includes(pid) || st.guesses[pid] != null || !Number.isInteger(v) || v < 1 || v > MAX) return false;
        if (st.opts.mode === "tippen" && !st.hint) return false;
        st.guesses[pid] = v;
        const need = guessers(s);
        if (need.every((id) => st.guesses[id] != null)) reveal(s);
        return true;
      }
      case "tkReveal": // nicht alle haben getippt: Hinweisgeber oder Gastgeber löst mit den Tipps bisher auf
        if (st.step !== "guess" || (!giver && !isHost) || !Object.keys(st.guesses).length) return false;
        reveal(s); return true;
      case "tkNext":
        if (st.step !== "reveal" || (!st.seats.includes(pid) && !isHost)) return false;
        nextTurn(s); return true;
    }
    return false;
  }

  // Die Zahl sieht während der Runde nur der Hinweisgeber
  function privateState(s, id) {
    const st = s.tick;
    if (!st || st.step !== "guess" || id !== st.giver) return null;
    return { tick: true, move: st.move, turnNo: st.turnNo, target: st.target };
  }
  function publicState(s) {
    const st = s.tick;
    if (!st) return null;
    const open = st.step === "reveal";
    return {
      step: st.step, move: st.move, turnNo: st.turnNo, total: st.total, giver: st.giver, seats: st.seats.slice(), order: st.order.slice(), opts: { ...st.opts },
      scale: st.giver ? data()[st.scale].slice() : null, hint: st.hint || "", rerollsLeft: st.giver ? REROLLS - st.rerolls : 0,
      guessed: Object.keys(st.guesses || {}), need: st.step === "guess" ? guessers(s) : [],
      target: open ? st.target : null, guesses: open ? { ...st.guesses } : null, result: open ? st.result : null,
      score: { ...st.score }, history: st.step === "final" ? st.history.slice() : [], maxPerTurn: 3,
    };
  }
  const usedKeys = (st) => st.deck.slice(0, st.di + 1).map(key);

  root.S10Tick = { start, apply, tick, publicState, privateState, usedKeys, key, ROUNDS, MODES, MAX, PTS };
})(typeof window !== "undefined" ? window : globalThis);
