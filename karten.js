// „Siebzehn und Vier“ und „Geheimgebot“ – Kartenspiele mit dem eigenen Blatt (läuft beim Gastgeber, testbar in Node).
// Zustand in s.karten, alle Spieler spielen gleichzeitig.
//  siebzehn: jeder für sich gegen die anderen – wer am nächsten an 21 liegt, gewinnt die Runde (über 21 = raus).
//            Zwei Asse („Feuer“) schlagen alles, genau 21 gibt einen Bonuspunkt. Die eigenen Karten sieht nur man selbst.
//  gebot:    jeder hat Sieben bis Ass einer Farbe als Gebotskarten. Eine Punktekarte wird aufgedeckt, alle bieten verdeckt –
//            das höchste Gebot holt die Punkte; bei Gleichstand bleiben sie liegen und kommen zur nächsten Punktekarte dazu.
(function (root) {
  const MODES = { siebzehn: { name: "Siebzehn und Vier" }, gebot: { name: "Geheimgebot" } };
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
    s.karten = { opts: { mode, rounds }, mode, seats, total: Object.fromEntries(seats.map((id) => [id, 0])), round: 0, history: [] };
    s.players.forEach((p) => { p.waiting = !seats.includes(p.id); p.status = "active"; });
    if (mode === "siebzehn") { s.karten.rounds = rounds; nextSiebzehn(s.karten); }
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
      case "kgReady": {
        if (st.step !== "reveal") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = s.players.filter((p) => p.connected && st.seats.includes(p.id)).map((p) => p.id);
        if (ids.length && ids.every((id) => st.ready[id])) (st.mode === "siebzehn" ? nextSiebzehn : nextGebot)(st);
        return true;
      }
      case "kgNext":
        if (!isHost || st.step !== "reveal") return false;
        (st.mode === "siebzehn" ? nextSiebzehn : nextGebot)(st); return true;
      case "kgRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts, now);
    }
    return false;
  }

  // Wer die Verbindung verliert, blockiert die Runde nicht: der Gastgeber kann weiterschalten (kgNext) – zusätzlich
  // gilt ein getrennter Spieler bei Siebzehn und Vier als „Genug“ und bietet beim Geheimgebot seine kleinste Karte.
  function tick(s) {
    if (s.phase !== "karten" || !s.karten || s.karten.step !== "play") return false;
    const st = s.karten, off = st.seats.filter((id) => { const p = s.players.find((x) => x.id === id); return !p || !p.connected; });
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
    const out = { mode: st.mode, modeName: MODES[st.mode].name, step: st.step, round: st.round, rounds: st.rounds, roundNo: st.round, seats: st.seats.slice(),
      total: { ...st.total }, ready: { ...(st.ready || {}) } };
    if (st.mode === "siebzehn") {
      out.count = Object.fromEntries(st.seats.map((id) => [id, (st.hands[id] || []).length]));
      out.done = Object.fromEntries(st.seats.map((id) => [id, st.step === "play" ? (st.done[id] ? "fertig" : "") : st.done[id] || ""]));
    } else {
      out.prize = st.prize; out.pot = st.pot; out.left = st.prizes.length - st.round;
      out.hand = Object.fromEntries(st.seats.map((id) => [id, st.hand[id].slice()])); // was noch übrig ist, wissen alle
      out.bid = Object.fromEntries(st.seats.map((id) => [id, !!st.bids[id]]));
    }
    if (st.result) out.result = st.result;
    if (st.step === "final") { const max = Math.max(...Object.values(st.total)); out.winners = st.seats.filter((id) => st.total[id] === max); }
    return out;
  }

  root.S10Karten = { MODES, ROUND_CHOICES, VALUE, start, apply, tick, publicState, privateState, sum, isFeuer, deck };
})(typeof window !== "undefined" ? window : globalThis);
