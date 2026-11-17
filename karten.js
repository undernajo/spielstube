// „Siebzehn und Vier“ und „Geheimgebot“ – Kartenspiele mit dem eigenen Blatt (läuft beim Gastgeber, testbar in Node).
// Zustand in s.karten, alle Spieler spielen gleichzeitig.
//  siebzehn: jeder für sich gegen die anderen – wer am nächsten an 21 liegt, gewinnt die Runde (über 21 = raus).
//            Zwei Asse („Feuer“) schlagen alles, genau 21 gibt einen Bonuspunkt. Die eigenen Karten sieht nur man selbst.
//  gebot:    jeder hat Sieben bis Ass einer Farbe als Gebotskarten. Eine Punktekarte wird aufgedeckt, alle bieten verdeckt –
//            das höchste Gebot holt die Punkte; bei Gleichstand bleiben sie liegen und kommen zur nächsten Punktekarte dazu.
(function (root) {
  const MODES = { siebzehn: { name: "Siebzehn und Vier" }, gebot: { name: "Geheimgebot" }, bus: { name: "Busfahrt" } };
  const SUITS = ["herz", "laub", "eichel", "schelle"];
  const RANKS = ["7", "8", "9", "10", "U", "O", "K", "A"];
  const VALUE = { 7: 7, 8: 8, 9: 9, 10: 10, U: 2, O: 3, K: 4, A: 11 }; // Siebzehn und Vier
  const ROUND_CHOICES = [3, 5, 8];
  const PLACE_PTS = [3, 2, 1];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const deck = (n) => { const d = []; for (let k = 0; k < n; k++) SUITS.forEach((s) => RANKS.forEach((r) => d.push(s + "-" + r))); return shuffle(d); };
  const rankOf = (id) => id.split("-")[1];
  const sum = (hand) => hand.reduce((n, id) => n + VALUE[rankOf(id)], 0);
  const isFeuer = (hand) => hand.length === 2 && hand.every((id) => rankOf(id) === "A");

  function start(s, opts, now) {
    opts = opts || {};
    const mode = MODES[opts.mode] ? opts.mode : "siebzehn";
    const seats = s.players.filter((p) => p.connected).map((p) => p.id);
    if (!seats.length) return false;
    const rn = Number(opts.rounds), rounds = ROUND_CHOICES.includes(rn) || (opts.free && Number.isInteger(rn) && rn > 0 && rn <= 10) ? rn : 5;
    s.game = mode; s.phase = "karten";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.karten = { gid: Math.random().toString(36).slice(2, 9), opts: { mode, rounds }, mode, seats, total: Object.fromEntries(seats.map((id) => [id, 0])), round: 0, history: [] };
    s.players.forEach((p) => { p.waiting = !seats.includes(p.id); p.status = "active"; });
    if (mode === "siebzehn") { s.karten.rounds = rounds; nextSiebzehn(s.karten); }
    else if (mode === "bus") startBus(s.karten, now, opts);
    else startGebot(s.karten, opts);
    return true;
  }

  // ---------- Siebzehn und Vier ----------
  function nextSiebzehn(st) {
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.deck = deck(Math.max(1, Math.ceil(st.seats.length / 4))); // ab fünf Spielern zwei Blätter
    st.hands = {}; st.done = {}; st.result = null; st.ready = {};
    st.seats.forEach((id) => { st.hands[id] = [st.deck.pop(), st.deck.pop()]; if (isFeuer(st.hands[id])) st.done[id] = "stand"; });
    st.step = "play";
    checkSiebzehn(st);
  }
  function checkSiebzehn(st) {
    if (!st.seats.every((id) => st.done[id])) return false;
    const val = (id) => (isFeuer(st.hands[id]) ? 100 : sum(st.hands[id]) > 21 ? -1 : sum(st.hands[id]));
    const alive = st.seats.filter((id) => val(id) >= 0).sort((a, b) => val(b) - val(a));
    const res = {};
    st.seats.forEach((id) => {
      const v = val(id), feuer = v === 100, bust = v < 0;
      const place = bust ? null : alive.findIndex((x) => val(x) === v) + 1;
      const pts = bust ? 0 : (PLACE_PTS[place - 1] || 0) + (feuer || v === 21 ? 1 : 0);
      res[id] = { hand: st.hands[id].slice(), sum: sum(st.hands[id]), feuer, bust, place, points: pts };
      st.total[id] += pts;
    });
    st.result = res; st.step = "reveal"; st.ready = {};
    st.history.push({ points: Object.fromEntries(Object.entries(res).map(([k, r]) => [k, r.points])) });
    return true;
  }

  // ---------- Geheimgebot ----------
  function startGebot(st) {
    // Punktekarten: eine eigene Farbreihe, Sieben = 1 Punkt … Ass = 8 Punkte
    st.prizes = shuffle(RANKS.map((r) => "schelle-" + r));
    st.rounds = st.prizes.length;
    st.hand = Object.fromEntries(st.seats.map((id, i) => [id, RANKS.map((r) => SUITS[i % 3] + "-" + r)])); // Herz, Laub, Eichel – Schelle sind die Punktekarten
    st.pot = 0; st.round = 0;
    nextGebot(st);
  }
  const prizePts = (id) => RANKS.indexOf(rankOf(id)) + 1;
  const bidVal = (id) => RANKS.indexOf(rankOf(id)) + 1;
  function nextGebot(st) {
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.prize = st.prizes[st.round - 1];
    st.pot += prizePts(st.prize);
    st.bids = {}; st.result = null; st.ready = {};
    st.step = "play";
  }
  function checkGebot(st) {
    if (!st.seats.every((id) => st.bids[id])) return false;
    const vals = st.seats.map((id) => bidVal(st.bids[id])), max = Math.max(...vals);
    const top = st.seats.filter((id) => bidVal(st.bids[id]) === max);
    const winner = top.length === 1 ? top[0] : null;
    const res = { bids: { ...st.bids }, winner, points: winner ? st.pot : 0, carried: winner ? 0 : st.pot, prize: st.prize };
    if (winner) { st.total[winner] += st.pot; st.pot = 0; }
    st.seats.forEach((id) => { st.hand[id] = st.hand[id].filter((c) => c !== st.bids[id]); });
    st.result = res; st.step = "reveal"; st.ready = {};
    st.history.push({ points: Object.fromEntries(st.seats.map((id) => [id, id === winner ? res.points : 0])) });
    return true;
  }

  // ---------- Busfahrt (Leiter mit Aussteigen) ----------
  // Pro Runde fünf Stationen. Alle tippen gleichzeitig; richtig = Punkte der Station in den Rundentopf, falsch = Topf weg
  // („Bus verunglückt“). Ab Station 2 kann man stattdessen aussteigen und den Topf sicher mitnehmen.
  // Bei Station 2 und 3 zählt ein gleich hoher Wert zugunsten des Spielers. Figuren: Unter, Ober, König, Ass (4 von 8 Werten).
  const BUS_Q = [
    { key: "figur", pts: 1, text: "Wird deine erste Karte eine Figur oder eine Zahl?", opts: [["fig", "Figur (Unter, Ober, König, Ass)"], ["zahl", "Zahl (Sieben bis Zehner)"]] },
    { key: "hoeher", pts: 1, text: "Ist die nächste Karte höher oder tiefer als deine erste?", opts: [["hoch", "Höher"], ["tief", "Tiefer"]] },
    { key: "zwischen", pts: 2, text: "Liegt die nächste Karte zwischen deinen ersten beiden oder außerhalb?", opts: [["in", "Zwischen"], ["out", "Außerhalb"]] },
    { key: "suit", pts: 10, text: "Welche Farbe hat die nächste Karte genau?", opts: [["herz", "Herz"], ["laub", "Laub"], ["eichel", "Eichel"], ["schelle", "Schelle"]] },
    { key: "wert", pts: 30, text: "Welchen Wert hat die letzte Karte genau?", opts: RANKS.map((r) => [r, { 7: "Sieben", 8: "Acht", 9: "Neun", 10: "Zehner", U: "Unter", O: "Ober", K: "König", A: "Ass" }[r]]) },
  ];
  const BUS_SHOW_MS = 3000, BUS_ROUNDS = [1, 3, 5];
  const rk = (id) => RANKS.indexOf(rankOf(id));
  const suitOf = (id) => id.split("-")[0];
  const isHL = (id) => suitOf(id) === "herz" || suitOf(id) === "laub";
  function startBus(st, now, opts) {
    const rn = Number(opts && opts.rounds);
    st.rounds = BUS_ROUNDS.includes(rn) ? rn : 3;
    st.round = 0; nextBusRound(st, now);
  }
  function nextBusRound(st, now) {
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.deck = deck(st.seats.length * 5 > 32 ? 2 : 1);
    st.hands = Object.fromEntries(st.seats.map((id) => [id, []]));
    st.pot = Object.fromEntries(st.seats.map((id) => [id, 0]));
    st.status = Object.fromEntries(st.seats.map((id) => [id, "ride"])); // ride | out (ausgestiegen) | crash | done (alle 5 geschafft)
    st.gain = Object.fromEntries(st.seats.map((id) => [id, 0]));
    st.q = 0; st.res = null; st.ready = {};
    busAsk(st);
  }
  const riders = (st) => st.seats.filter((id) => st.status[id] === "ride");
  function busAsk(st) { st.step = "guess"; st.guesses = {}; st.until = 0; }
  function busCheck(st, now) { if (riders(st).every((id) => st.guesses[id])) busDeal(st, now); }
  // Alle Fahrenden haben getippt (oder sind ausgestiegen): Karten austeilen und werten
  function busDeal(st, now) {
    const q = BUS_Q[st.q], res = {};
    riders(st).forEach((id) => {
      const g = st.guesses[id];
      if (g === "_out") { st.status[id] = "out"; st.gain[id] = st.pot[id]; st.total[id] += st.pot[id]; res[id] = { out: true, pts: st.pot[id] }; return; }
      const c = st.deck.pop(), h = st.hands[id];
      let ok;
      if (q.key === "figur") ok = (g === "fig") === ["U", "O", "K", "A"].includes(rankOf(c));
      else if (q.key === "hoeher") ok = rk(c) === rk(h[0]) || (g === "hoch" ? rk(c) > rk(h[0]) : rk(c) < rk(h[0])); // gleich hoch = zu deinen Gunsten
      else if (q.key === "zwischen") { const lo = Math.min(rk(h[0]), rk(h[1])), hi = Math.max(rk(h[0]), rk(h[1]));
        ok = rk(c) === lo || rk(c) === hi || (g === "in" ? rk(c) > lo && rk(c) < hi : rk(c) < lo || rk(c) > hi); }
      else if (q.key === "suit") ok = suitOf(c) === g;
      else ok = rankOf(c) === g;
      h.push(c);
      if (ok) {
        st.pot[id] += q.pts;
        if (st.q === BUS_Q.length - 1) { st.status[id] = "done"; st.gain[id] = st.pot[id]; st.total[id] += st.pot[id]; }
      } else { st.status[id] = "crash"; st.gain[id] = 0; }
      res[id] = { card: c, guess: g, ok, pts: q.pts, lost: ok ? 0 : st.pot[id] };
      if (!ok) st.pot[id] = 0;
    });
    st.res = res; st.step = "show"; st.until = now + BUS_SHOW_MS;
  }
  function busNext(st, now) {
    if (st.step !== "show") return;
    st.q++;
    if (!riders(st).length || st.q >= BUS_Q.length) { st.step = "roundEnd"; st.until = 0; st.ready = {};
      st.history.push({ points: { ...st.gain } }); return; }
    busAsk(st);
  }

  function apply(s, pid, a, isHost, now) {
    if (!a || typeof a !== "object" || !s.karten) return false;
    const st = s.karten, seated = st.seats.includes(pid);
    switch (a.type) {
      case "kgHit": // Siebzehn und Vier: noch eine Karte
        if (st.mode !== "siebzehn" || st.step !== "play" || !seated || st.done[pid] || a.round !== st.round) return false;
        if (!st.deck.length) st.deck = deck(1).filter((c) => !Object.values(st.hands).flat().includes(c));
        st.hands[pid].push(st.deck.pop());
        if (sum(st.hands[pid]) > 21) st.done[pid] = "bust";
        else if (sum(st.hands[pid]) === 21) st.done[pid] = "stand";
        checkSiebzehn(st); return true;
      case "kgStand":
        if (st.mode !== "siebzehn" || st.step !== "play" || !seated || st.done[pid] || a.round !== st.round) return false;
        st.done[pid] = "stand"; checkSiebzehn(st); return true;
      case "kgBid": // Geheimgebot: verdeckt bieten (bis alle geboten haben, darf man umentscheiden)
        if (st.mode !== "gebot" || st.step !== "play" || !seated || a.round !== st.round || !st.hand[pid].includes(a.card)) return false;
        st.bids[pid] = a.card; checkGebot(st); return true;
      case "kgGuess": // Busfahrt: tippen oder aussteigen („_out“, ab Station 2 mit Punkten im Topf); bis alle dran waren, umentscheidbar
        if (st.mode !== "bus" || st.step !== "guess" || st.status[pid] !== "ride" || a.station !== st.q || a.round !== st.round) return false;
        if (a.g === "_out" ? !(st.q > 0 && st.pot[pid] > 0) : !BUS_Q[st.q].opts.some((o) => o[0] === a.g)) return false;
        st.guesses[pid] = a.g; busCheck(st, now);
        return true;
      case "kgReady": {
        if (st.step !== "reveal" && st.step !== "roundEnd") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = s.players.filter((p) => p.connected && st.seats.includes(p.id)).map((p) => p.id);
        if (ids.length && ids.every((id) => st.ready[id])) (st.mode === "siebzehn" ? nextSiebzehn : st.mode === "bus" ? (x) => nextBusRound(x, now) : nextGebot)(st);
        return true;
      }
      case "kgNext":
        if (!isHost || (st.step !== "reveal" && st.step !== "roundEnd")) return false;
        (st.mode === "siebzehn" ? nextSiebzehn : st.mode === "bus" ? (x) => nextBusRound(x, now) : nextGebot)(st); return true;
      case "kgRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts, now);
    }
    return false;
  }

  // Wer die Verbindung verliert, blockiert die Runde nicht: der Gastgeber kann weiterschalten (kgNext) – zusätzlich
  // gilt ein getrennter Spieler bei Siebzehn und Vier als „Genug“ und bietet beim Geheimgebot seine kleinste Karte.
  function tick(s, now) {
    if (s.phase !== "karten" || !s.karten) return false;
    const st = s.karten, off = st.seats.filter((id) => { const p = s.players.find((x) => x.id === id); return !p || !p.connected; });
    if (st.mode === "bus") {
      now = now || Date.now();
      if (st.step === "guess" && off.length) { // getrennte Spieler steigen aus (bzw. tippen an Station 1 zufällig)
        let ch = false;
        off.forEach((id) => { if (st.status[id] === "ride" && !st.guesses[id]) { st.guesses[id] = st.q > 0 && st.pot[id] > 0 ? "_out" : BUS_Q[st.q].opts[0][0]; ch = true; } });
        if (ch) busCheck(st, now);
        return ch;
      }
      if (st.step === "show" && st.until && now >= st.until) { busNext(st, now); return true; }
      return false;
    }
    if (st.step !== "play") return false;
    if (!off.length) return false;
    let changed = false;
    off.forEach((id) => {
      if (st.mode === "siebzehn" && !st.done[id]) { st.done[id] = "stand"; changed = true; }
      if (st.mode === "gebot" && !st.bids[id] && st.hand[id].length) { st.bids[id] = st.hand[id][0]; changed = true; }
    });
    if (changed) (st.mode === "siebzehn" ? checkSiebzehn : checkGebot)(st);
    return changed;
  }

  // Siebzehn und Vier: eigene Karten nur für einen selbst
  function privateState(s, id) {
    const st = s.karten;
    if (!st || st.mode !== "siebzehn" || st.step !== "play" || !st.hands[id]) return null;
    return { roundNo: st.round, hand: st.hands[id].slice(), sum: sum(st.hands[id]), feuer: isFeuer(st.hands[id]) };
  }

  function publicState(s) {
    const st = s.karten;
    if (!st) return null;
    const out = { gid: st.gid, mode: st.mode, modeName: MODES[st.mode].name, step: st.step, round: st.round, rounds: st.rounds, roundNo: st.round, seats: st.seats.slice(),
      total: { ...st.total }, ready: { ...(st.ready || {}) } };
    if (st.mode === "siebzehn") {
      out.count = Object.fromEntries(st.seats.map((id) => [id, (st.hands[id] || []).length]));
      out.done = Object.fromEntries(st.seats.map((id) => [id, st.step === "play" ? (st.done[id] ? "fertig" : "") : st.done[id] || ""]));
    } else if (st.mode === "bus") {
      out.q = st.q; out.question = BUS_Q[Math.min(st.q, BUS_Q.length - 1)]; out.stations = BUS_Q.map((x) => x.pts);
      out.hands = Object.fromEntries(st.seats.map((id) => [id, (st.hands[id] || []).slice()]));
      out.pot = { ...st.pot }; out.status = { ...st.status }; out.gain = { ...st.gain }; out.res = st.res;
      out.guessed = Object.fromEntries(st.seats.map((id) => [id, !!(st.guesses && st.guesses[id])]));
    } else {
      out.prize = st.prize; out.pot = st.pot; out.left = st.prizes.length - st.round;
      out.hand = Object.fromEntries(st.seats.map((id) => [id, st.hand[id].slice()])); // was noch übrig ist, wissen alle
      out.bid = Object.fromEntries(st.seats.map((id) => [id, !!st.bids[id]]));
    }
    if (st.result) out.result = st.result;
    if (st.step === "final") { const max = Math.max(...Object.values(st.total)); out.winners = st.seats.filter((id) => st.total[id] === max); }
    return out;
  }

  root.S10Karten = { MODES, ROUND_CHOICES, VALUE, BUS_Q, BUS_ROUNDS, isHL, start, apply, tick, publicState, privateState, sum, isFeuer, deck };
})(typeof window !== "undefined" ? window : globalThis);
