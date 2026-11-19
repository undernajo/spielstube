// Schnapsen (66) zu zweit – Spiellogik beim Gastgeber, testbar in Node. Zustand in s.schnapsen.
// 20 Karten: Unter (2), Ober (3), König (4), Zehner (10), Ass (11) in Herz, Schelle, Laub, Eichel.
(function (root) {
  const SUITS = ["herz", "schelle", "laub", "eichel"];
  const SUIT_NAMES = { herz: "Herz", schelle: "Schelle", laub: "Laub", eichel: "Eichel" };
  const RANKS = ["U", "O", "K", "10", "A"];
  const RANK_NAMES = { U: "Unter", O: "Ober", K: "König", 10: "Zehner", A: "Ass" };
  const VALUE = { U: 2, O: 3, K: 4, 10: 10, A: 11 };
  const MODES = { gemuetlich: "Gemütlich – Augen werden angezeigt", klassisch: "Klassisch – selbst mitzählen und „Aus!“ sagen" };
  const TARGET = 7; // Punkte pro Bummerl
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const deck = () => SUITS.flatMap((s) => RANKS.map((r) => s + "-" + r));
  const suitOf = (c) => c.split("-")[0], rankOf = (c) => c.split("-")[1];
  const val = (c) => VALUE[rankOf(c)];
  const cardName = (c) => SUIT_NAMES[suitOf(c)] + "-" + RANK_NAMES[rankOf(c)];
  const other = (st, pid) => st.seats.find((x) => x !== pid);

  function start(s, opts) {
    opts = opts || {};
    const mode = MODES[opts.mode] ? opts.mode : "gemuetlich";
    const seats = s.players.filter((p) => p.connected && !p.paused).slice(0, 2).map((p) => p.id);
    if (seats.length < 2) return false;
    s.game = "schnapsen"; s.phase = "schnapsen";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.schnapsen = { opts: { mode }, mode, seats, score: { [seats[0]]: 0, [seats[1]]: 0 }, bummerl: { [seats[0]]: 0, [seats[1]]: 0 },
      dealer: seats[Math.floor(Math.random() * 2)], roundNo: 0, history: [], winners: null };
    deal(s.schnapsen, true);
    return true;
  }

  function deal(st, first) {
    if (!first) st.dealer = other(st, st.dealer);
    st.roundNo++;
    const d = shuffle(deck()), vh = other(st, st.dealer);
    const r = {
      hands: { [vh]: d.slice(0, 5), [st.dealer]: d.slice(5, 10) },
      pile: d.slice(10, 19), atout: d[19], trump: suitOf(d[19]),
      closedBy: null, closedOppTricks: 0, leader: vh, trick: [], lastTrick: null,
      won: { [vh]: [], [st.dealer]: [] }, points: { [vh]: 0, [st.dealer]: 0 }, pending: { [vh]: 0, [st.dealer]: 0 },
      tricks: { [vh]: 0, [st.dealer]: 0 }, announced: [], mustLead: null, result: null, ready: {}, shown: {},
    };
    st.round = r; st.step = "play";
  }

  const talonOpen = (r) => !r.closedBy && (r.pile.length > 0 || !!r.atout);
  const strict = (r) => !talonOpen(r); // zugedreht oder Stapel leer: Farb- und Stichzwang

  function beats(a, b, trump) { // schlägt b (zweite Karte) die Karte a?
    if (suitOf(a) === suitOf(b)) return val(b) > val(a);
    return suitOf(b) === trump;
  }

  function legalCards(hand, r) {
    if (r.trick.length === 0) {
      if (r.mustLead) return hand.filter((c) => suitOf(c) === r.mustLead && (rankOf(c) === "K" || rankOf(c) === "O"));
      return hand.slice();
    }
    if (!strict(r)) return hand.slice();
    const led = r.trick[0].card, same = hand.filter((c) => suitOf(c) === suitOf(led));
    if (same.length) { const higher = same.filter((c) => val(c) > val(led)); return higher.length ? higher : same; }
    const trumps = hand.filter((c) => suitOf(c) === r.trump);
    return trumps.length ? trumps : hand.slice();
  }

  function gamePoints(r, loser) { return r.tricks[loser] === 0 ? 3 : r.points[loser] < 33 ? 2 : 1; }

  function endRound(st, winner, pts, reason) {
    const r = st.round;
    st.score[winner] += pts;
    r.result = { winner, points: pts, reason, augen: { ...r.points } };
    st.history.push({ round: st.roundNo, winner, points: pts, reason });
    st.step = "roundEnd"; r.ready = {};
    if (st.score[winner] >= TARGET) {
      st.bummerl[other(st, winner)] += 1; // der Verlierer bekommt ein Bummerl
      st.step = "final"; st.winners = [winner];
    }
  }

  function checkAus(st, pid) { // gemütlich: automatisch bei 66
    const r = st.round;
    if (st.mode === "gemuetlich" && r.points[pid] >= 66) { endRound(st, pid, gamePoints(r, other(st, pid)), "aus"); return true; }
    return false;
  }

  function finishTrick(st) {
    const r = st.round, [l, f] = r.trick;
    const win = beats(l.card, f.card, r.trump) ? f.pid : l.pid, lose = other(st, win);
    r.points[win] += val(l.card) + val(f.card) + r.pending[win]; r.pending[win] = 0;
    r.tricks[win]++; r.won[win].push([l.card, f.card]);
    r.lastTrick = { cards: r.trick.slice(), winner: win }; r.trick = []; r.leader = win; r.mustLead = null;
    if (talonOpen(r)) { // nachziehen: Gewinner zuerst
      for (const pid of [win, lose]) {
        if (r.pile.length) r.hands[pid].push(r.pile.shift());
        else if (r.atout) { r.hands[pid].push(r.atout); r.atout = null; }
      }
    }
    if (checkAus(st, win)) return;
    if (r.hands[win].length === 0) { // alle Karten gespielt
      if (r.closedBy) {
        const c = r.closedBy, o = other(st, c);
        if (r.points[c] >= 66) endRound(st, c, gamePoints(r, o), "zugedreht");
        else endRound(st, o, r.closedOppTricks === 0 ? 3 : 2, "zudrehen-misslungen");
      } else endRound(st, win, gamePoints(r, lose), "letzter-stich");
    }
  }

  const leading = (st, pid) => st.step === "play" && st.round.trick.length === 0 && st.round.leader === pid;
  function options(st, pid) {
    const r = st.round, out = { ansage: [], tausch: false, zudrehen: false, aus: false };
    if (!r || st.step !== "play") return out;
    const hand = r.hands[pid] || [];
    if (leading(st, pid) && !r.mustLead) {
      out.ansage = SUITS.filter((su) => !r.announced.includes(su) && hand.includes(su + "-K") && hand.includes(su + "-O"));
      out.tausch = talonOpen(r) && !!r.atout && r.pile.length >= 1 && hand.includes(r.trump + "-U");
      out.zudrehen = talonOpen(r) && !!r.atout && r.pile.length >= 1;
    }
    out.aus = st.mode === "klassisch" && st.seats.includes(pid);
    return out;
  }

  function apply(s, pid, a, isHost) {
    if (!a || typeof a !== "object" || !s.schnapsen) return false;
    const st = s.schnapsen, r = st.round;
    if (!st.seats.includes(pid) && a.type !== "xNext") return false;
    const opt = options(st, pid);
    switch (a.type) {
      case "xPlay": {
        if (st.step !== "play") return false;
        const turn = r.trick.length === 0 ? r.leader : other(st, r.trick[0].pid);
        if (turn !== pid) return false;
        const hand = r.hands[pid];
        if (!hand.includes(a.card) || !legalCards(hand, r).includes(a.card)) return false;
        hand.splice(hand.indexOf(a.card), 1);
        r.trick.push({ pid, card: a.card });
        if (r.trick.length === 2) finishTrick(st);
        return true;
      }
      case "xAnsage": {
        if (!opt.ansage.includes(a.suit)) return false;
        const pts = a.suit === r.trump ? 40 : 20;
        r.announced.push(a.suit); r.mustLead = a.suit;
        if (r.tricks[pid] > 0) r.points[pid] += pts; else r.pending[pid] += pts; // zählt erst mit dem ersten Stich
        (r.calls = r.calls || []).push({ pid, suit: a.suit, pts });
        checkAus(st, pid);
        return true;
      }
      case "xTausch": {
        if (!opt.tausch) return false;
        const h = r.hands[pid], u = r.trump + "-U";
        h.splice(h.indexOf(u), 1, r.atout); r.atout = u; return true;
      }
      case "xZudrehen":
        if (!opt.zudrehen) return false;
        r.closedBy = pid; r.closedOppTricks = r.tricks[other(st, pid)]; return true;
      case "xAus": { // klassisch: selbst „Aus!“ sagen
        if (!opt.aus) return false;
        const o = other(st, pid);
        if (r.points[pid] >= 66) endRound(st, pid, gamePoints(r, o), "aus");
        else endRound(st, o, r.tricks[pid] === 0 ? 3 : 2, "falsches-aus");
        return true;
      }
      case "xShow":
        if (st.step !== "roundEnd" && st.step !== "final") return false;
        r.shown[pid] = true; return true;
      case "xNext":
        if (st.step !== "roundEnd") return false;
        if (st.seats.includes(pid)) r.ready[pid] = !r.ready[pid];
        if (isHost && a.force) r.ready = { [st.seats[0]]: true, [st.seats[1]]: true };
        if (st.seats.every((id) => r.ready[id])) deal(st);
        return true;
      case "xRestart":
        if (st.step !== "final") return false;
        st.score = { [st.seats[0]]: 0, [st.seats[1]]: 0 }; st.history = []; st.winners = null;
        deal(st); return true;
    }
    return false;
  }

  function publicState(s) {
    const st = s.schnapsen;
    if (!st) return null;
    const r = st.round, ended = st.step === "roundEnd" || st.step === "final";
    const showPts = st.mode === "gemuetlich" || ended;
    return {
      step: st.step, mode: st.mode, modeName: MODES[st.mode], target: TARGET, seats: st.seats.slice(), score: { ...st.score }, bummerl: { ...st.bummerl },
      dealer: st.dealer, roundNo: st.roundNo, winners: st.winners, history: st.history.slice(),
      trump: r.trump, atout: r.atout, talon: r.pile.length + (r.atout ? 1 : 0), closedBy: r.closedBy, strict: strict(r),
      leader: r.leader, trick: r.trick.slice(), lastTrick: r.lastTrick, won: { ...r.won }, tricks: { ...r.tricks },
      turn: st.step !== "play" ? null : r.trick.length === 0 ? r.leader : other(st, r.trick[0].pid),
      mustLead: r.mustLead, calls: (r.calls || []).slice(),
      points: showPts ? { ...r.points } : null, pending: showPts ? { ...r.pending } : null,
      handCount: Object.fromEntries(st.seats.map((id) => [id, r.hands[id].length])),
      result: r.result, ready: { ...r.ready }, shown: { ...r.shown },
      reveal: ended ? Object.fromEntries(Object.keys(r.shown).map((id) => [id, r.hands[id].slice()])) : null,
    };
  }
  function privateState(s, pid) {
    const st = s.schnapsen;
    if (!st || !st.round || !st.seats.includes(pid)) return null;
    const r = st.round, hand = r.hands[pid], myTurn = st.step === "play" && (r.trick.length === 0 ? r.leader === pid : r.trick[0].pid !== pid);
    return { roundNo: st.roundNo, hand: hand.slice(), legal: myTurn ? legalCards(hand, r) : [], options: options(st, pid),
      myPoints: r.points[pid], myPending: r.pending[pid] };
  }

  root.S10Schnapsen = { start, apply, publicState, privateState, legalCards, beats, cardName, deck, gamePoints,
    SUITS, SUIT_NAMES, RANKS, RANK_NAMES, VALUE, MODES, TARGET };
})(typeof window !== "undefined" ? window : globalThis);
