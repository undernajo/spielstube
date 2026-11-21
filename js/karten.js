// „Kartenspaß für alle“ – Kartenspiele mit dem eigenen Blatt (läuft beim Gastgeber, testbar in Node). Zustand in s.karten.
//  siebzehn: jeder für sich gegen die anderen – wer am nächsten an 21 liegt, gewinnt die Runde (über 21 = raus).
//            Zwei Asse („Feuer“) schlagen alles, genau 21 gibt einen Bonuspunkt. Die eigenen Karten sieht nur man selbst.
//            Allein gegen die Bank: Die Bank zeigt eine Karte offen; ist man fertig, deckt sie auf und zieht, bis sie mindestens 17 hat.
//            Wer näher an 21 liegt, bekommt die Runde (1 Punkt); über 21 verliert sofort, Gleichstand zählt für keinen.
//  bus:      Busfahrt – Station für Station tippen, weiterfahren oder aussteigen.
//  stich:    Stichhaltig – Stichspiel mit Ansage. Runde 1 eine Karte pro Spieler, Runde 2 zwei usw.; alle sagen gleichzeitig
//            geheim an, wie viele Stiche sie machen, dann wird reihum gespielt (Farbe bedienen, Trumpf sticht).
(function (root) {
  const MODES = { siebzehn: { name: "Siebzehn und Vier" }, stich: { name: "Stichhaltig" }, bus: { name: "Busfahrt" } };
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
  const rk = (id) => RANKS.indexOf(rankOf(id));

  function start(s, opts, now) {
    opts = opts || {};
    const mode = MODES[opts.mode] ? opts.mode : "siebzehn";
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (!seats.length) return false;
    const rn = Number(opts.rounds), rounds = ROUND_CHOICES.includes(rn) || (opts.free && Number.isInteger(rn) && rn > 0 && rn <= 10) ? rn : 5;
    s.game = mode; s.phase = "karten";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.karten = { gid: Math.random().toString(36).slice(2, 9), opts: { mode, rounds }, mode, seats, total: Object.fromEntries(seats.map((id) => [id, 0])), round: 0, history: [] };
    s.players.forEach((p) => { p.waiting = !seats.includes(p.id); p.status = "active"; });
    if (mode === "siebzehn") { s.karten.rounds = rounds; if (seats.length === 1) { s.karten.bank = true; s.karten.bankTotal = 0; } nextSiebzehn(s.karten); }
    else if (mode === "bus") startBus(s.karten, now, opts);
    else startStich(s.karten, now, opts);
    return true;
  }

  // ---------- Siebzehn und Vier ----------
  function nextSiebzehn(st) {
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.deck = deck(Math.max(1, Math.ceil(st.seats.length / 4))); // ab fünf Spielern zwei Blätter
    st.hands = {}; st.done = {}; st.result = null; st.ready = {};
    st.seats.forEach((id) => { st.hands[id] = [st.deck.pop(), st.deck.pop()]; if (isFeuer(st.hands[id])) st.done[id] = "stand"; });
    st.bankRes = null;
    if (st.bank) st.bankHand = [st.deck.pop(), st.deck.pop()];
    st.step = "play";
    checkSiebzehn(st);
  }
  // Allein gegen die Bank: Bank zieht bis mindestens 17 (nicht, wenn man sich schon überkauft hat)
  function bankSiebzehn(st) {
    const id = st.seats[0], me = st.hands[id], bust = sum(me) > 21, feuer = isFeuer(me);
    const bh = st.bankHand;
    if (!bust && !feuer && !isFeuer(bh)) while (sum(bh) < 17) { if (!st.deck.length) st.deck = deck(1).filter((c) => !me.concat(bh).includes(c)); bh.push(st.deck.pop()); }
    const val = (h) => (isFeuer(h) ? 100 : sum(h) > 21 ? -1 : sum(h));
    const mv = val(me), bv = val(bh);
    const outcome = mv < 0 ? "lose" : bv < 0 || mv > bv ? "win" : mv === bv ? "tie" : "lose";
    const pts = outcome === "win" ? 1 : 0;
    st.result = { [id]: { hand: me.slice(), sum: sum(me), feuer, bust, place: outcome === "win" ? 1 : null, points: pts, outcome } };
    st.bankRes = { hand: bh.slice(), sum: sum(bh), feuer: isFeuer(bh), bust: sum(bh) > 21, points: outcome === "lose" ? 1 : 0 };
    st.total[id] += pts; st.bankTotal += st.bankRes.points;
    st.step = "reveal"; st.ready = {};
    st.history.push({ points: { [id]: pts }, bank: st.bankRes.points });
    return true;
  }
  function checkSiebzehn(st) {
    if (!st.seats.every((id) => st.done[id])) return false;
    if (st.bank) return bankSiebzehn(st);
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

  // ---------- Stichhaltig (Stichspiel mit Ansage) ----------
  // Rangfolge in jeder Farbe: Sieben < Acht < Neun < Zehner < Unter < Ober < König < Ass.
  // Punkte: genau getroffen = 10 + 2 pro Stich, daneben = −2 pro Stich Abweichung.
  const STICH_ROUNDS = [4, 6, 8], STICH_BID_MS = 3200, STICH_TRICK_MS = 2000;
  const suitOfC = (id) => id.split("-")[0];
  const stichPts = (bid, got) => (bid === got ? 10 + 2 * got : -2 * Math.abs(bid - got));
  function startStich(st, now, opts) {
    const rn = Number(opts && opts.rounds);
    st.rounds = STICH_ROUNDS.includes(rn) || (opts && opts.free && Number.isInteger(rn) && rn > 0 && rn <= 10) ? rn : 6;
    st.maxCards = Math.max(1, Math.floor(32 / st.seats.length)); // mit einem Blatt (32 Karten)
    st.round = 0; nextStich(st, now);
  }
  function nextStich(st, now) {
    st.round++;
    if (st.round > st.rounds) { st.round = st.rounds; st.step = "final"; return; }
    st.n = Math.min(st.round, st.maxCards);
    const d = deck(1);
    st.hands = Object.fromEntries(st.seats.map((id) => [id, d.splice(0, st.n)]));
    st.trumpCard = d.length ? d.pop() : null; // keine Karte übrig: ohne Trumpf
    st.trump = st.trumpCard ? suitOfC(st.trumpCard) : null;
    st.lead = st.seats[(st.round - 1) % st.seats.length]; // wer anspielt, wechselt jede Runde
    st.bids = {}; st.tricks = Object.fromEntries(st.seats.map((id) => [id, 0]));
    st.trick = []; st.lastTrick = null; st.turn = null; st.until = 0; st.result = null; st.ready = {};
    st.step = "bid";
  }
  // erlaubte Karten: wer die angespielte Farbe hat, muss sie bedienen
  function legal(st, id) {
    const h = st.hands[id] || [];
    if (!st.trick.length) return h.slice();
    const led = suitOfC(st.trick[0].card), same = h.filter((c) => suitOfC(c) === led);
    return same.length ? same : h.slice();
  }
  function trickWinner(st, trick) {
    const led = suitOfC(trick[0].card);
    const score = (c) => (suitOfC(c) === st.trump ? 100 : suitOfC(c) === led ? 0 : -100) + rk(c);
    return trick.reduce((best, t) => (score(t.card) > score(best.card) ? t : best)).id;
  }
  function stichNextTurn(st) {
    const i = st.seats.indexOf(st.turn);
    st.turn = st.seats[(i + 1) % st.seats.length];
  }
  // Stich ist vollständig zu sehen gewesen: dem Gewinner gutschreiben, dann weiter oder Runde werten
  function stichCollect(st) {
    const w = st.lastTrick.winner;
    st.tricks[w]++; st.trick = []; st.turn = w; st.until = 0;
    if (st.hands[w].length) { st.step = "play"; return; }
    const res = {};
    st.seats.forEach((id) => { const pts = stichPts(st.bids[id], st.tricks[id]); res[id] = { bid: st.bids[id], got: st.tricks[id], points: pts }; st.total[id] += pts; });
    st.result = res; st.step = "reveal"; st.ready = {};
    st.history.push({ points: Object.fromEntries(Object.entries(res).map(([k, r]) => [k, r.points])) });
  }
  function stichPlay(st, id, card, now) {
    st.hands[id] = st.hands[id].filter((c) => c !== card);
    st.trick.push({ id, card });
    if (st.trick.length < st.seats.length) { stichNextTurn(st); return; }
    st.lastTrick = { cards: st.trick.slice(), winner: trickWinner(st, st.trick) };
    st.step = "trick"; st.turn = null; st.until = now + STICH_TRICK_MS;
  }
  const sortHand = (st, h) => h.slice().sort((a, b) => {
    const so = (c) => (suitOfC(c) === st.trump ? -1 : SUITS.indexOf(suitOfC(c)));
    return so(a) - so(b) || rk(b) - rk(a);
  });

  // ---------- Busfahrt (Leiter mit Aussteigen) ----------
  // Pro Runde fünf Stationen – alle fahren im selben Bus: an jeder Station wird eine Karte für alle aufgedeckt.
  // Alle tippen gleichzeitig und geheim; richtig = Punkte der Station in den eigenen Rundentopf, falsch = Topf weg
  // („Bus verunglückt“). Ab Station 2 kann man stattdessen aussteigen und den Topf sicher mitnehmen.
  // Bei Station 2 und 3 zählt ein gleich hoher Wert zugunsten der Tippenden. Figuren: Unter, Ober, König, Ass (4 von 8 Werten).
  const BUS_Q = [
    { key: "figur", pts: 1, text: "Wird die erste Karte eine Figur oder eine Zahl?", opts: [["fig", "Figur (Unter, Ober, König, Ass)"], ["zahl", "Zahl (Sieben bis Zehner)"]] },
    { key: "hoeher", pts: 1, text: "Ist die nächste Karte höher oder tiefer als die erste?", opts: [["hoch", "Höher"], ["tief", "Tiefer"]] },
    { key: "zwischen", pts: 2, text: "Liegt die nächste Karte zwischen den ersten beiden oder außerhalb?", opts: [["in", "Zwischen"], ["out", "Außerhalb"]] },
    { key: "suit", pts: 10, text: "Welche Farbe hat die nächste Karte genau?", opts: [["herz", "Herz"], ["laub", "Laub"], ["eichel", "Eichel"], ["schelle", "Schelle"]] },
    { key: "wert", pts: 30, text: "Welchen Wert hat die letzte Karte genau?", opts: RANKS.map((r) => [r, { 7: "Sieben", 8: "Acht", 9: "Neun", 10: "Zehner", U: "Unter", O: "Ober", K: "König", A: "Ass" }[r]]) },
  ];
  const BUS_SHOW_MS = 3000, BUS_ROUNDS = [1, 3, 5];
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
    st.deck = deck(1);
    st.cards = []; // die gemeinsame Fahrt: eine Karte je Station
    st.reach = Object.fromEntries(st.seats.map((id) => [id, 0])); // geschaffte Stationen je Spieler
    st.pot = Object.fromEntries(st.seats.map((id) => [id, 0]));
    st.status = Object.fromEntries(st.seats.map((id) => [id, "ride"])); // ride | out (ausgestiegen) | crash | done (alle 5 geschafft)
    st.gain = Object.fromEntries(st.seats.map((id) => [id, 0]));
    st.q = 0; st.res = null; st.ready = {};
    busAsk(st);
  }
  const riders = (st) => st.seats.filter((id) => st.status[id] === "ride");
  function busAsk(st) { st.step = "guess"; st.guesses = {}; st.until = 0; }
  function busCheck(st, now) { if (riders(st).every((id) => st.guesses[id])) busDeal(st, now); }
  // Alle Fahrenden haben getippt (oder sind ausgestiegen): die nächste gemeinsame Karte aufdecken und werten
  function busDeal(st, now) {
    const q = BUS_Q[st.q], res = {}, h = st.cards;
    // nur aufdecken, wenn noch jemand weiterfährt (steigen alle aus, endet die Fahrt hier)
    const c = riders(st).some((id) => st.guesses[id] !== "_out") ? st.deck.pop() : null;
    if (c) h.push(c);
    riders(st).forEach((id) => {
      const g = st.guesses[id];
      if (g === "_out") { st.status[id] = "out"; st.gain[id] = st.pot[id]; st.total[id] += st.pot[id]; res[id] = { out: true, pts: st.pot[id] }; return; }
      let ok;
      if (q.key === "figur") ok = (g === "fig") === ["U", "O", "K", "A"].includes(rankOf(c));
      else if (q.key === "hoeher") ok = rk(c) === rk(h[0]) || (g === "hoch" ? rk(c) > rk(h[0]) : rk(c) < rk(h[0])); // gleich hoch = zu deinen Gunsten
      else if (q.key === "zwischen") { const lo = Math.min(rk(h[0]), rk(h[1])), hi = Math.max(rk(h[0]), rk(h[1]));
        ok = rk(c) === lo || rk(c) === hi || (g === "in" ? rk(c) > lo && rk(c) < hi : rk(c) < lo || rk(c) > hi); }
      else if (q.key === "suit") ok = suitOf(c) === g;
      else ok = rankOf(c) === g;
      if (ok) {
        st.reach[id]++; st.pot[id] += q.pts;
        if (st.q === BUS_Q.length - 1) { st.status[id] = "done"; st.gain[id] = st.pot[id]; st.total[id] += st.pot[id]; }
      } else { st.status[id] = "crash"; st.gain[id] = 0; }
      res[id] = { guess: g, ok, pts: q.pts, lost: ok ? 0 : st.pot[id] };
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
      case "kgSay": { // Stichhaltig: geheim ansagen (bis alle angesagt haben, darf man umentscheiden)
        const n = Number(a.bid);
        if (st.mode !== "stich" || st.step !== "bid" || !seated || a.round !== st.round || !Number.isInteger(n) || n < 0 || n > st.n) return false;
        st.bids[pid] = n;
        if (st.seats.every((id) => st.bids[id] != null)) { st.step = "bidShow"; st.until = (typeof now === "number" ? now : Date.now()) + STICH_BID_MS; }
        return true;
      }
      case "kgPlay": // Stichhaltig: Karte ausspielen (nur wer dran ist, Farbe bedienen)
        if (st.mode !== "stich" || st.step !== "play" || st.turn !== pid || a.round !== st.round || !legal(st, pid).includes(a.card)) return false;
        stichPlay(st, pid, a.card, typeof now === "number" ? now : Date.now()); return true;
      case "kgGuess": // Busfahrt: tippen oder aussteigen („_out“, ab Station 2 mit Punkten im Topf); bis alle dran waren, umentscheidbar
        if (st.mode !== "bus" || st.step !== "guess" || st.status[pid] !== "ride" || a.station !== st.q || a.round !== st.round) return false;
        if (a.g === "_out" ? !(st.q > 0 && st.pot[pid] > 0) : !BUS_Q[st.q].opts.some((o) => o[0] === a.g)) return false;
        st.guesses[pid] = a.g; busCheck(st, now);
        return true;
      case "kgReady": {
        if (st.step !== "reveal" && st.step !== "roundEnd") return false;
        st.ready[pid] = !st.ready[pid];
        const ids = s.players.filter((p) => p.connected && st.seats.includes(p.id)).map((p) => p.id);
        if (ids.length && ids.every((id) => st.ready[id])) (st.mode === "siebzehn" ? nextSiebzehn : st.mode === "bus" ? (x) => nextBusRound(x, now) : (x) => nextStich(x, now))(st);
        return true;
      }
      case "kgNext":
        if (!isHost || (st.step !== "reveal" && st.step !== "roundEnd")) return false;
        (st.mode === "siebzehn" ? nextSiebzehn : st.mode === "bus" ? (x) => nextBusRound(x, now) : (x) => nextStich(x, now))(st); return true;
      case "kgRestart":
        if (st.step !== "final") return false;
        return start(s, st.opts, now);
    }
    return false;
  }

  // Wer die Verbindung verliert, blockiert die Runde nicht: der Gastgeber kann weiterschalten (kgNext) – zusätzlich
  // gilt ein getrennter Spieler bei Siebzehn und Vier als „Genug“; bei Stichhaltig sagt er 0 an und spielt seine kleinste erlaubte Karte.
  function tick(s, now) {
    if (s.phase !== "karten" || !s.karten) return false;
    const st = s.karten, off = st.seats.filter((id) => { const p = s.players.find((x) => x.id === id); return !p || !p.connected; });
    if (st.mode === "stich") {
      now = now || Date.now();
      if (st.step === "bidShow" && now >= st.until) { st.step = "play"; st.turn = st.lead; st.until = 0; return true; }
      if (st.step === "trick" && now >= st.until) { stichCollect(st); return true; }
      if (st.step === "bid" && off.length) {
        let ch = false;
        off.forEach((id) => { if (st.bids[id] == null) { st.bids[id] = 0; ch = true; } });
        if (ch && st.seats.every((id) => st.bids[id] != null)) { st.step = "bidShow"; st.until = now + STICH_BID_MS; }
        return ch;
      }
      if (st.step === "play" && off.includes(st.turn)) {
        const l = legal(st, st.turn).sort((x, y) => rk(x) - rk(y));
        if (l.length) { stichPlay(st, st.turn, l[0], now); return true; }
      }
      return false;
    }
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
    });
    if (changed) checkSiebzehn(st);
    return changed;
  }

  // Eigene Karten nur für einen selbst (Siebzehn und Vier, Stichhaltig)
  function privateState(s, id) {
    const st = s.karten;
    if (st && st.mode === "stich" && st.step !== "final" && st.hands && st.hands[id]) {
      return { roundNo: st.round, hand: sortHand(st, st.hands[id]), playable: st.step === "play" && st.turn === id ? legal(st, id) : [] };
    }
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
      // Bank: beim Spielen nur die erste Karte offen, danach alles
      if (st.bank) out.bank = { total: st.bankTotal, up: st.step === "play" && st.bankHand ? st.bankHand[0] : null, count: st.bankHand ? st.bankHand.length : 0, res: st.step !== "play" ? st.bankRes : null };
    } else if (st.mode === "bus") {
      out.q = st.q; out.question = BUS_Q[Math.min(st.q, BUS_Q.length - 1)]; out.stations = BUS_Q.map((x) => x.pts);
      out.cards = (st.cards || []).slice(); out.reach = { ...(st.reach || {}) };
      out.pot = { ...st.pot }; out.status = { ...st.status }; out.gain = { ...st.gain }; out.res = st.res;
      out.guessed = Object.fromEntries(st.seats.map((id) => [id, !!(st.guesses && st.guesses[id])]));
    } else if (st.mode === "stich") {
      out.n = st.n; out.trumpCard = st.trumpCard; out.trump = st.trump; out.lead = st.lead; out.turn = st.turn;
      out.trick = st.trick.slice(); out.lastTrick = st.lastTrick; out.tricks = { ...st.tricks };
      out.count = Object.fromEntries(st.seats.map((id) => [id, (st.hands[id] || []).length]));
      out.said = Object.fromEntries(st.seats.map((id) => [id, st.bids[id] != null]));
      out.bids = st.step === "bid" ? null : { ...st.bids }; // Ansagen erst zeigen, wenn alle angesagt haben
      out.untilIn = st.until ? Math.max(0, st.until - Date.now()) : 0;
    }
    if (st.result) out.result = st.result;
    if (st.step === "final") {
      const max = Math.max(...Object.values(st.total));
      out.winners = st.bank ? (max > st.bankTotal ? st.seats.slice() : []) : st.seats.filter((id) => st.total[id] === max);
      if (st.bank) out.bankWins = st.bankTotal > max;
    }
    return out;
  }

  root.S10Karten = { MODES, ROUND_CHOICES, VALUE, BUS_Q, BUS_ROUNDS, STICH_ROUNDS, isHL, start, apply, tick, publicState, privateState, sum, isFeuer, deck, stichPts };
})(typeof window !== "undefined" ? window : globalThis);
