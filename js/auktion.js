// „Unterm Hammer“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.auktion.
// Ein Sortiment kommt nacheinander unter den Hammer. Jeder bietet, wann er will (ohne Zeitdruck), bis alle außer dem
// Höchstbietenden ausgestiegen sind – dann Zuschlag und Auflösung mit dem echten Preis.
// Wertung: Endstand = Restgeld + echter Wert aller gekauften Produkte, also Startgeld + Σ (echter Preis − bezahlt).
// Unter Wert gekauft = Plus, überboten = Minus, nicht ausgegebenes Geld zählt mit. Der höchste Endstand gewinnt.
// Standard: Preise und Punkte bleiben bis zum Kassensturz am Ende verdeckt (dann Produkt für Produkt aufdecken).
(function (root) {
  const SIZES = { "6": { name: "Kurz (6 Produkte)", n: 6 }, "8": { name: "Mittel (8 Produkte)", n: 8 }, "10": { name: "Lang (10 Produkte)", n: 10 } };
  // Wann die echten Preise aufgedeckt werden: am Ende alle nacheinander (Kassensturz) oder gleich nach jedem Zuschlag
  const REVEALS = { ende: { name: "Am Ende (Kassensturz)" }, sofort: { name: "Nach jedem Zuschlag" } };
  const MIN = 1;          // kleinstes Gebot in Euro
  const STEPS = [5, 10, 25, 100]; // Schnellknöpfe: so viel über dem Höchstgebot
  const data = () => root.SCHLAU10_AUKTION || [];
  const key = (i) => data()[i].n;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const active = (s, id) => { const p = s.players.find((x) => x.id === id); return !!(p && p.connected && !p.paused); };
  // Budget: zusammen deutlich weniger als das Sortiment wert ist (knapp), aber jeder kann jedes einzelne Produkt
  // zum echten Preis bezahlen – sonst würde das teuerste Produkt zum Wettrennen, wer zuerst alles setzt.
  const budgetFor = (prices, n) => Math.ceil(Math.max(prices.reduce((a, b) => a + b, 0) * 0.6 / n, Math.max(...prices) * 1.1) / 10) * 10;

  function start(s, opts) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (seats.length < 2 || !data().length) return false;
    const size = SIZES[String(opts.size)] ? String(opts.size) : "8";
    const reveal = REVEALS[opts.reveal] ? opts.reveal : "ende";
    const n = Math.min(SIZES[size].n, data().length);
    const avoid = new Set(opts.avoid || []), all = data().map((_, i) => i);
    const fresh = all.filter((i) => !avoid.has(key(i))), old = all.filter((i) => avoid.has(key(i)));
    // Ungespielte zuerst. Unter mehreren Ziehungen die nehmen, bei der das teuerste Produkt am besten zum knappen Budget passt
    // (sonst müsste das Startgeld wegen eines einzigen teuren Produkts für alle steigen und das Geld wäre nicht mehr knapp).
    const fit = (ps) => { const pr = ps.map((i) => data()[i].p); return Math.max(...pr) * 1.1 / (pr.reduce((a, b) => a + b, 0) * 0.6 / seats.length); };
    let picks = null, best = Infinity;
    for (let t = 0; t < 300 && best > 1; t++) {
      const ps = [...shuffle(fresh.slice()), ...shuffle(old.slice())].slice(0, n), f = fit(ps);
      if (f < best) { best = f; picks = ps; }
    }
    shuffle(picks);
    const budget = budgetFor(picks.map((i) => data()[i].p), seats.length);
    s.game = "auktion"; s.phase = "auktion";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.auktion = { opts: { size, reveal }, reveal, seats, budget0: budget,
      budget: Object.fromEntries(seats.map((id) => [id, budget])),
      gain: Object.fromEntries(seats.map((id) => [id, 0])), // Σ (echter Preis − bezahlt)
      items: picks.map((i) => ({ i, buyer: null, paid: null, sold: false })),
      idx: 0, step: "bid", high: null, out: {}, bids: 0, move: 0, winners: null, kidx: 0 };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    return true;
  }

  // Wer bei diesem Produkt nicht mehr mitbieten kann: ausgestiegen, weg/pausiert oder nicht genug Geld für das nächste Gebot
  function isOut(s, id) {
    const st = s.auktion;
    if (st.out[id] || !active(s, id)) return true;
    return st.budget[id] < (st.high ? st.high.amt + 1 : MIN);
  }
  // Zuschlag, wenn außer dem Höchstbietenden keiner mehr bieten kann; ohne Gebot: unverkauft, wenn keiner mehr bieten kann
  function checkHammer(s) {
    const st = s.auktion;
    if (st.step !== "bid") return false;
    const others = st.seats.filter((id) => !st.high || id !== st.high.by);
    if (!others.every((id) => isOut(s, id))) return false;
    const it = st.items[st.idx], price = data()[it.i].p;
    it.sold = true;
    if (st.high) {
      const { by, amt } = st.high;
      it.buyer = by; it.paid = amt;
      st.budget[by] -= amt;
      st.gain[by] += price - amt;
    }
    st.step = "sold"; st.move++;
    return true;
  }
  function next(s) {
    const st = s.auktion;
    st.idx++; st.high = null; st.out = {}; st.bids = 0; st.move++;
    // vorbei, wenn alles versteigert ist oder keiner mehr Geld hat
    if (st.idx >= st.items.length || st.seats.every((id) => st.budget[id] < MIN)) {
      st.idx = Math.min(st.idx, st.items.length);
      if (st.reveal === "ende") { st.step = "kasse"; st.kidx = 0; } else finish(s);
    } else st.step = "bid";
  }
  function finish(s) {
    const st = s.auktion;
    st.step = "final"; st.move++;
    const top = Math.max(...st.seats.map((id) => st.gain[id]));
    st.winners = st.seats.filter((id) => st.gain[id] === top); s.winners = st.winners;
  }
  // Kassensturz: die versteigerten Produkte (auch unverkaufte) in der Reihenfolge der Versteigerung
  const kasseList = (st) => st.items.map((it, i) => it.sold ? i : -1).filter((i) => i >= 0);

  function tick(s) {
    if (s.phase !== "auktion" || !s.auktion) return false;
    return checkHammer(s); // z. B. jemand ist gegangen oder pausiert
  }

  function apply(s, pid, a, isHost) {
    const st = s.auktion;
    if (!st || !a) return false;
    switch (a.type) {
      case "auBid": { // feste Beträge statt Aufschläge: kommt ein Gebot zu spät (schon überboten), wird es abgelehnt
        const amt = Math.round(Number(a.amt));
        if (st.step !== "bid" || Number(a.k) !== st.idx || !st.seats.includes(pid) || isOut(s, pid)) return false;
        if (!(amt >= MIN) || amt > st.budget[pid] || (st.high && (amt <= st.high.amt || st.high.by === pid))) return false;
        st.high = { by: pid, amt }; st.bids++; st.move++;
        checkHammer(s);
        return true;
      }
      case "auPass": { // aussteigen gilt für das ganze Produkt; der Höchstbietende kann nicht aussteigen
        const who = a.who && isHost ? a.who : pid; // Gastgeber kann jemanden aussteigen lassen, der nicht reagiert
        if (st.step !== "bid" || Number(a.k) !== st.idx || !st.seats.includes(who) || st.out[who] || (st.high && st.high.by === who)) return false;
        st.out[who] = true; st.move++;
        checkHammer(s);
        return true;
      }
      case "auNext":
        if (st.step !== "sold" || Number(a.k) !== st.idx || (!st.seats.includes(pid) && !isHost)) return false;
        next(s); return true;
      case "auReveal": { // nächstes Produkt aufdecken (a.all: alle auf einmal); sind alle offen, geht es zum Ergebnis
        const n = kasseList(st).length;
        if (st.step !== "kasse" || Number(a.kidx) !== st.kidx || (!st.seats.includes(pid) && !isHost)) return false;
        if (st.kidx >= n) { finish(s); return true; }
        st.kidx = a.all ? n : st.kidx + 1; st.move++;
        return true;
      }
    }
    return false;
  }

  function publicState(s) {
    const st = s.auktion;
    if (!st) return null;
    const D = data(), kl = kasseList(st);
    // Preise und Punkte: sofort-Modus nach dem Zuschlag, beim Kassensturz die schon aufgedeckten, am Ende alle
    const shown = (i) => st.step === "final" || (st.reveal === "sofort" && st.items[i].sold) || (st.step === "kasse" && kl.indexOf(i) >= 0 && kl.indexOf(i) < st.kidx);
    // gain: bisheriger Gewinn/Verlust; noch nicht aufgedeckte Käufe zählen bis dahin zum bezahlten Preis (±0)
    let gain = null;
    if (st.step === "final" || st.reveal === "sofort") gain = { ...st.gain };
    else if (st.step === "kasse") {
      gain = Object.fromEntries(st.seats.map((id) => [id, 0]));
      kl.slice(0, st.kidx).forEach((i) => { const it = st.items[i]; if (it.buyer) gain[it.buyer] += D[it.i].p - it.paid; });
    }
    return {
      reveal: st.reveal, kidx: st.kidx, ktotal: kl.length, kcur: st.step === "kasse" && st.kidx > 0 ? kl[st.kidx - 1] : null,
      got: Object.fromEntries(st.seats.map((id) => [id, st.items.filter((it) => it.buyer === id).length])),
      step: st.step, move: st.move, seats: st.seats.slice(), idx: st.idx, total: st.items.length, budget0: st.budget0,
      budget: { ...st.budget }, gain,
      high: st.high ? { ...st.high } : null, bids: st.bids, min: MIN, steps: STEPS.slice(),
      out: Object.fromEntries(st.seats.map((id) => [id, st.step === "bid" && isOut(s, id) && !(st.high && st.high.by === id)])),
      passed: { ...st.out },
      // Was noch kommt, bleibt geheim: nur schon versteigerte Produkte und das aktuelle (auch nicht im übertragenen Zustand)
      items: st.items.map((it, i) => !it.sold && !(i === st.idx && (st.step === "bid" || st.step === "sold")) ? { hidden: true }
        : { e: D[it.i].e, n: D[it.i].n, sold: it.sold, buyer: it.buyer, paid: it.paid, p: shown(i) ? D[it.i].p : null, d: shown(i) ? D[it.i].d : null }),
      winners: st.winners,
    };
  }
  const usedKeys = (st) => st.items.filter((it) => it.sold).map((it) => key(it.i));

  root.S10Auktion = { start, apply, tick, publicState, usedKeys, key, SIZES, REVEALS, budgetFor };
})(typeof window !== "undefined" ? window : globalThis);
