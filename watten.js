// Watten zu zweit (Südtiroler Regeln) – Spiellogik beim Gastgeber, testbar in Node. Zustand in s.watten.
// Karten: "farbe-wert", Farben herz/schelle/laub/eichel, Werte 7 8 9 10 U O K A, dazu der Weli "schelle-6".
(function (root) {
  const SUITS = ["herz", "schelle", "laub", "eichel"];
  const SUIT_NAMES = { herz: "Herz", schelle: "Schelle", laub: "Laub", eichel: "Eichel" };
  const RANKS = ["7", "8", "9", "10", "U", "O", "K", "A"]; // ansagbare Schläge
  const RANK_NAMES = { 6: "Weli", 7: "Sieben", 8: "Acht", 9: "Neun", 10: "Zehn", U: "Unter", O: "Ober", K: "König", A: "Ass" };
  const ORDER = ["6", "7", "8", "9", "10", "U", "O", "K", "A"]; // Weli = kleinste Schelle
  const TARGETS = [11, 15, 18];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const deck = () => SUITS.flatMap((s) => RANKS.map((r) => s + "-" + r)).concat("schelle-6");
  const suitOf = (c) => c.split("-")[0], rankOf = (c) => c.split("-")[1];
  const cardName = (c) => (c === "schelle-6" ? "Weli" : SUIT_NAMES[suitOf(c)] + "-" + RANK_NAMES[rankOf(c)]);

  // Guter: Trumpfkarte einen Rang über dem Schlag (beim Ass ist es die Trumpf-Sieben)
  // Ist der Weli Schlag, gibt es nur diesen einen Schlag, und der Gute ist die Trumpf-Sieben
  // Weli-Variante (Lobby): "schell" = Weli ist die kleinste Schelle, "trumpf" = Weli ist immer der kleinste Trumpf.
  // Guter beim Ass: Trumpf-Sieben – bei „schell“ und Trumpf Schelle aber der Weli (die kleinste Schelle).
  // Weli als Schlag: bei „schell“ ist der Weli der Rechte und die Trumpf-Sieben der Gute; bei „trumpf“ gibt es keinen Guten.
  function guterOf(schlag, trump, mode = "schell") {
    if (schlag === "6") return mode === "trumpf" ? null : trump + "-7";
    if (schlag === "A") return mode === "schell" && trump === "schelle" ? "schelle-6" : trump + "-7";
    return trump + "-" + RANKS[RANKS.indexOf(schlag) + 1];
  }
  const isTrump = (c, trump, mode) => suitOf(c) === trump || (mode === "trumpf" && c === "schelle-6");

  // Stärke einer Karte im Stich (höher sticht); gleich starke Schläge: der zuerst gespielte gewinnt
  function power(c, r, ledSuit) {
    const g = guterOf(r.schlag, r.trump, r.weliMode);
    if (g && c === g) return 1000;
    if (rankOf(c) === r.schlag) return suitOf(c) === r.trump || r.schlag === "6" ? 900 : 800;
    if (isTrump(c, r.trump, r.weliMode)) return 500 + ORDER.indexOf(rankOf(c));
    if (suitOf(c) === ledSuit) return 100 + ORDER.indexOf(rankOf(c));
    return 0;
  }
  // Trumpf zugeben: wird Trumpf ausgespielt (nicht der Gute), muss man Trumpf geben oder mit einem Schlag stechen
  // Was gilt für die zweite Karte? "pflicht" = Trumpf zugeben/stechen, "guter" = Guter ausgespielt (kein Zwang), "frei"
  function followRule(r) {
    if (r.trick.length !== 1) return null;
    const led = r.trick[0].card;
    const trumpLed = isTrump(led, r.trump, r.weliMode) || (r.schlag === "6" && led === "schelle-6");
    if (!trumpLed) return "frei";
    return led === guterOf(r.schlag, r.trump, r.weliMode) ? "guter" : "pflicht";
  }
  function legalCards(hand, r) {
    if (r.trick.length !== 1) return hand.slice();
    const led = r.trick[0].card;
    const trumpLed = isTrump(led, r.trump, r.weliMode) || (r.schlag === "6" && led === "schelle-6"); // Weli als Schlag zählt wie der Rechte
    if (!trumpLed || led === guterOf(r.schlag, r.trump, r.weliMode)) return hand.slice();
    const ok = hand.filter((c) => isTrump(c, r.trump, r.weliMode) || rankOf(c) === r.schlag);
    return ok.length ? ok : hand.slice();
  }

  const other = (st, pid) => st.seats.find((x) => x !== pid);
  const gestrichen = (st, pid) => (st.scores[pid] || 0) >= st.target - 2;

  function start(s, opts) {
    opts = opts || {};
    const target = TARGETS.includes(Number(opts.target)) ? Number(opts.target) : 15;
    const weliMode = opts.weli === "trumpf" ? "trumpf" : "schell";
    const seats = s.players.filter((p) => p.connected).slice(0, 2).map((p) => p.id);
    if (seats.length < 2) return false;
    s.game = "watten"; s.phase = "watten";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.watten = { opts: { target, weli: weliMode }, target, weliMode, seats, scores: { [seats[0]]: 0, [seats[1]]: 0 },
      dealer: seats[Math.floor(Math.random() * 2)], roundNo: 0, history: [], winners: null, games: { [seats[0]]: 0, [seats[1]]: 0 } };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    deal(s.watten, true);
    return true;
  }

  function deal(st, first) {
    if (!first) st.dealer = other(st, st.dealer);
    st.roundNo++;
    const d = shuffle(deck()), vorhand = other(st, st.dealer);
    const hands = { [vorhand]: d.slice(0, 5), [st.dealer]: d.slice(5, 10) };
    const r = { weliMode: st.weliMode || "schell", hands, vorhand, schlag: null, trump: null, trick: [], lastTrick: null, leader: vorhand,
      tricks: { [vorhand]: 0, [st.dealer]: 0 }, won: { [vorhand]: [], [st.dealer]: [] }, value: 2, noBid: false, bid: null, lastBidder: null,
      giveUpBy: null, decided: false, played: 0, result: null, ready: {} };
    // Gestrichen (2 Punkte vor dem Ziel): darf nicht bieten. Ist nur einer gestrichen und liegt der andere
    // mindestens 4 zurück, geht die Runde um 4 Punkte. Sind beide gestrichen, wird nicht geboten.
    const [a, b] = st.seats, ga = gestrichen(st, a), gb = gestrichen(st, b);
    if (ga && gb) r.noBid = true;
    else if (ga || gb) {
      const g = ga ? a : b, o = other(st, g);
      r.giveUpBy = g;
      if (st.scores[g] - st.scores[o] >= 4) { r.value = 4; r.noBid = true; r.vierer = true; }
    }
    st.round = r; st.step = "schlag";
  }

  function endRound(st, winner, points, reason) {
    const r = st.round;
    st.scores[winner] += points;
    r.result = { winner, points, reason };
    st.history.push({ round: st.roundNo, winner, points, reason });
    st.step = "roundEnd"; r.ready = {};
    if (st.scores[winner] >= st.target) { st.step = "final"; st.winners = [winner]; st.games[winner] = (st.games[winner] || 0) + 1; }
  }

  // Bei „4 gehen“ muss der Gestrichene vor seiner ersten Karte halten oder gehen
  const needsDecision = (r, pid) => !!(r.vierer && !r.decided && r.giveUpBy === pid && r.hands[pid].length === 5);
  function currentTurn(st) {
    const r = st.round;
    if (st.step !== "play" || r.bid) return null;
    return r.trick.length === 0 ? r.leader : other(st, r.trick[0].pid);
  }
  function canBid(st, pid) {
    const r = st.round;
    if (!r || (st.step !== "play") || r.noBid || r.bid || r.lastBidder === pid || gestrichen(st, pid)) return false;
    return r.value < st.target - st.scores[pid]; // mehr als zum Sieg nötig ergibt keinen Sinn
  }

  function apply(s, pid, a, isHost) {
    if (!a || typeof a !== "object" || !s.watten) return false;
    const st = s.watten, r = st.round;
    if (!st.seats.includes(pid) && a.type !== "wNext") return false;
    switch (a.type) {
      case "wSchlag":
        if (st.step !== "schlag" || pid !== r.vorhand || !(RANKS.includes(a.rank) || a.rank === "6")) return false;
        r.schlag = a.rank; st.step = "trumpf"; return true;
      case "wTrumpf":
        if (st.step !== "trumpf" || pid !== st.dealer || !SUITS.includes(a.suit)) return false;
        r.trump = a.suit; st.step = "play"; return true;
      case "wPlay": {
        if (currentTurn(st) !== pid) return false;
        const hand = r.hands[pid];
        if (!hand.includes(a.card) || !legalCards(hand, r).includes(a.card)) return false;
        if (needsDecision(r, pid)) return false; // Gestrichener muss bei „4 gehen“ erst halten oder gehen
        hand.splice(hand.indexOf(a.card), 1);
        r.trick.push({ pid, card: a.card }); r.played++;
        if (r.trick.length === 2) {
          const [l, f] = r.trick, ledSuit = suitOf(l.card);
          const win = power(f.card, r, ledSuit) > power(l.card, r, ledSuit) ? f.pid : l.pid;
          r.tricks[win]++; r.won[win].push([l.card, f.card]); r.lastTrick = { cards: r.trick.slice(), winner: win }; r.trick = []; r.leader = win;
          if (r.tricks[win] >= 3) endRound(st, win, r.value, "stiche");
        }
        return true;
      }
      case "wBid":
        if (!canBid(st, pid)) return false;
        r.bid = { by: pid, to: r.value + 1 }; return true;
      case "wBidAnswer":
        if (st.step !== "play" || !r.bid || r.bid.by === pid) return false;
        if (a.accept) { r.value = r.bid.to; r.lastBidder = r.bid.by; r.bid = null; }
        else { const by = r.bid.by; r.bid = null; endRound(st, by, r.value, "abgelehnt"); }
        return true;
      case "wGiveUp": // gehen: Gegner bekommt 2 (nur vor der eigenen ersten Karte)
        if (st.step !== "play" || r.giveUpBy !== pid || r.decided || r.hands[pid].length < 5 || r.bid) return false;
        endRound(st, other(st, pid), 2, "aufgegeben"); return true;
      case "wHold": // halten: um 4 weiterspielen
        if (st.step !== "play" || !needsDecision(r, pid)) return false;
        r.decided = true; return true;
      case "wNext": {
        if (st.step !== "roundEnd") return false;
        if (st.seats.includes(pid)) r.ready[pid] = !r.ready[pid];
        if (isHost && a.force) r.ready = { [st.seats[0]]: true, [st.seats[1]]: true };
        if (st.seats.every((id) => r.ready[id])) deal(st);
        return true;
      }
      case "wRestart":
        if (st.step !== "final") return false;
        st.scores = { [st.seats[0]]: 0, [st.seats[1]]: 0 }; st.history = []; st.winners = null; st.roundNo = 0;
        deal(st); return true;
    }
    return false;
  }

  function publicState(s) {
    const st = s.watten;
    if (!st) return null;
    const r = st.round;
    return {
      step: st.step, target: st.target, seats: st.seats.slice(), scores: { ...st.scores }, dealer: st.dealer, roundNo: st.roundNo,
      gestrichen: Object.fromEntries(st.seats.map((id) => [id, gestrichen(st, id)])), winners: st.winners,
      vorhand: r.vorhand, schlag: r.schlag, trump: r.trump, guter: r.schlag && r.trump ? guterOf(r.schlag, r.trump, r.weliMode) : null, weliMode: st.weliMode, follow: st.step === "play" ? followRule(r) : null,
      trick: r.trick.slice(), lastTrick: r.lastTrick, won: { ...r.won }, tricks: { ...r.tricks }, value: r.value, bid: r.bid, vierer: !!r.vierer,
      noBid: r.noBid, giveUpBy: r.giveUpBy && !r.decided && r.hands[r.giveUpBy].length === 5 ? r.giveUpBy : null, turn: currentTurn(st),
      mustDecide: r.giveUpBy && needsDecision(r, r.giveUpBy) ? r.giveUpBy : null,
      canBid: Object.fromEntries(st.seats.map((id) => [id, canBid(st, id)])),
      handCount: Object.fromEntries(st.seats.map((id) => [id, r.hands[id].length])),
      result: r.result, ready: { ...r.ready }, history: st.history.slice(), games: { ...(st.games || {}) },
      // nach der Runde dürfen beide die übrigen Karten sehen
      reveal: st.step === "roundEnd" || st.step === "final" ? { ...r.hands } : null,
    };
  }
  // Private Sicht eines Spielers: die eigene Hand und welche Karten gerade erlaubt sind
  function privateState(s, pid) {
    const st = s.watten;
    if (!st || !st.round || !st.seats.includes(pid)) return null;
    const r = st.round, hand = r.hands[pid];
    return { roundNo: st.roundNo, hand: hand.slice(), legal: currentTurn(st) === pid && !needsDecision(r, pid) ? legalCards(hand, r) : [] };
  }

  root.S10Watten = { start, apply, publicState, privateState, legalCards, power, guterOf, cardName, deck,
    SUITS, SUIT_NAMES, RANKS, RANK_NAMES, TARGETS };
})(typeof window !== "undefined" ? window : globalThis);
