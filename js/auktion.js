// „Unterm Hammer“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.auktion.
// Ein Sortiment kommt nacheinander unter den Hammer. Jeder bietet, wann er will (ohne Zeitdruck), bis alle außer dem
// Höchstbietenden ausgestiegen sind – dann Zuschlag und Auflösung mit dem echten Preis.
// Wertung: Endstand = Restgeld + echter Wert aller gekauften Produkte, also Startgeld + Σ (echter Preis − bezahlt).
// Unter Wert gekauft = Plus, überboten = Minus, nicht ausgegebenes Geld zählt mit. Der höchste Endstand gewinnt.
// Standard: Preise und Punkte bleiben bis zum Kassensturz am Ende verdeckt (dann Produkt für Produkt aufdecken).
// Alle Beträge im Zustand in Cent (Preise in den Daten in Euro mit Cent, Gebote auf den Cent genau).
// Wahlweise der Auktionshammer: Kommt eine Weile kein höheres Gebot, fällt er von selbst („Zum Ersten, zum Zweiten, zum Dritten“).
(function (root) {
  const SIZES = { "6": { name: "Kurz (6 Produkte)", n: 6 }, "8": { name: "Mittel (8 Produkte)", n: 8 }, "10": { name: "Lang (10 Produkte)", n: 10 } };
  // Wann die echten Preise aufgedeckt werden: am Ende alle nacheinander (Kassensturz) oder gleich nach jedem Zuschlag
  const REVEALS = { ende: { name: "Am Ende (Kassensturz)" }, sofort: { name: "Nach jedem Zuschlag" } };
  // Auktionshammer: so lange nach dem letzten Gebot, dann Zuschlag (läuft erst, wenn jemand geboten hat)
  const HAMMERS = { aus: { name: "Aus – ohne Zeitdruck", ms: 0 }, "15": { name: "15 Sekunden nach dem letzten Gebot", ms: 15000 }, "30": { name: "30 Sekunden nach dem letzten Gebot", ms: 30000 } };
  const MIN = 1;          // kleinstes Gebot: 1 Cent
  const STEPS = [500, 1000, 2500, 10000]; // Schnellknöpfe in Cent: so viel über dem Höchstgebot
  const cents = (eur) => Math.round(Number(eur) * 100);
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
    const hammer = HAMMERS[opts.hammer] ? String(opts.hammer) : "aus";
    // per: Stubenmeisterschaft – feste Zahl an Produkten (z. B. 5)
    const per = Number(opts.per) > 0 ? Math.round(Number(opts.per)) : 0;
    const n = Math.min(per || SIZES[size].n, data().length);
    const avoid = new Set(opts.avoid || []), all = data().map((_, i) => i);
    const fresh = all.filter((i) => !avoid.has(key(i))), old = all.filter((i) => avoid.has(key(i)));
    // Gute Mischung: aus jeder Kategorie höchstens ein, zwei Produkte; günstige, mittlere und teure dabei.
    // Unter mehreren Ziehungen (Ungespielte zuerst) die nehmen, bei der das teuerste Produkt am besten zum knappen Budget passt
    // (sonst müsste das Startgeld wegen eines einzigen teuren Produkts für alle steigen und das Geld wäre nicht mehr knapp).
    const nCat = new Set(data().map((x) => x.k)).size || 1, maxPer = Math.max(1, Math.ceil(n / nCat));
    const tier = (i) => { const p = data()[i].p; return p < 50 ? 0 : p <= 250 ? 1 : 2; }; // günstig = 10–50 € (billigere gibt es nicht)
    const need = n >= 6 ? [2, 2, 1] : [1, 1, 1]; // mindestens so viele günstige / mittlere / teure
    const fit = (ps) => { const pr = ps.map((i) => data()[i].p); return Math.max(...pr) * 1.1 / (pr.reduce((a, b) => a + b, 0) * 0.6 / seats.length); };
    const draw = () => { // der Reihe nach (Ungespielte zuerst) nehmen, solange die Kategorie noch Platz hat
      const order = [...shuffle(fresh.slice()), ...shuffle(old.slice())], cnt = {}, ps = [];
      for (const i of order) { if (ps.length >= n) break; const k = data()[i].k || "-"; if ((cnt[k] || 0) >= maxPer) continue; cnt[k] = (cnt[k] || 0) + 1; ps.push(i); }
      for (const i of order) { if (ps.length >= n) break; if (!ps.includes(i)) ps.push(i); } // zu wenige Kategorien: auffüllen
      return ps;
    };
    let picks = null, best = Infinity;
    for (let t = 0; t < 400 && best > 1; t++) {
      const ps = draw(), tiers = [0, 0, 0]; ps.forEach((i) => tiers[tier(i)]++);
      const miss = need.reduce((a, m, j) => a + Math.max(0, m - tiers[j]), 0);
      const f = fit(ps) + miss * 10; // fehlende Preisstufen wiegen schwerer als ein knappes Budget
      if (f < best) { best = f; picks = ps; }
    }
    shuffle(picks);
    const budget = budgetFor(picks.map((i) => data()[i].p), seats.length) * 100;
    s.game = "auktion"; s.phase = "auktion";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.auktion = { opts: { size, reveal, hammer, per }, reveal, hammerMs: HAMMERS[hammer].ms, lastAt: 0, seats, budget0: budget,
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
    const it = st.items[st.idx], price = cents(data()[it.i].p);
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

  function tick(s, now) {
    if (s.phase !== "auktion" || !s.auktion) return false;
    const st = s.auktion;
    // Auktionshammer: seit dem letzten Gebot ist die Zeit um – alle anderen gelten als ausgestiegen
    if (st.step === "bid" && st.hammerMs && st.high && now && now - st.lastAt >= st.hammerMs) {
      st.seats.forEach((id) => { if (id !== st.high.by) st.out[id] = true; });
    }
    return checkHammer(s); // z. B. jemand ist gegangen oder pausiert
  }

  function apply(s, pid, a, isHost) {
    const st = s.auktion;
    if (!st || !a) return false;
    switch (a.type) {
      case "auBid": { // feste Beträge statt Aufschläge: kommt ein Gebot zu spät (schon überboten), wird es abgelehnt
        const amt = Math.round(Number(a.amt)); // in Cent
        if (st.step !== "bid" || Number(a.k) !== st.idx || !st.seats.includes(pid) || isOut(s, pid)) return false;
        if (!(amt >= MIN) || amt > st.budget[pid] || (st.high && (amt <= st.high.amt || st.high.by === pid))) return false;
        st.high = { by: pid, amt }; st.bids++; st.move++; st.lastAt = Date.now();
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
      kl.slice(0, st.kidx).forEach((i) => { const it = st.items[i]; if (it.buyer) gain[it.buyer] += cents(D[it.i].p) - it.paid; });
    }
    return {
      reveal: st.reveal, kidx: st.kidx, ktotal: kl.length, kcur: st.step === "kasse" && st.kidx > 0 ? kl[st.kidx - 1] : null,
      got: Object.fromEntries(st.seats.map((id) => [id, st.items.filter((it) => it.buyer === id).length])),
      step: st.step, move: st.move, seats: st.seats.slice(), idx: st.idx, total: st.items.length, budget0: st.budget0,
      budget: { ...st.budget }, gain,
      high: st.high ? { ...st.high } : null, bids: st.bids, min: MIN, steps: STEPS.slice(),
      // Restzeit statt Uhrzeit: die Uhren der Geräte gehen verschieden
      hammerMs: st.hammerMs, hammerIn: st.step === "bid" && st.hammerMs && st.high ? Math.max(0, st.hammerMs - (Date.now() - st.lastAt)) : null,
      out: Object.fromEntries(st.seats.map((id) => [id, st.step === "bid" && isOut(s, id) && !(st.high && st.high.by === id)])),
      passed: { ...st.out },
      // Was noch kommt, bleibt geheim: nur schon versteigerte Produkte und das aktuelle (auch nicht im übertragenen Zustand)
      items: st.items.map((it, i) => !it.sold && !(i === st.idx && (st.step === "bid" || st.step === "sold")) ? { hidden: true }
        : { e: D[it.i].e, n: D[it.i].n, b: D[it.i].b || "", k: ((root.SCHLAU10_AUKTION_KAT || {})[D[it.i].k] || {}).name || "", sold: it.sold, buyer: it.buyer, paid: it.paid, p: shown(i) ? cents(D[it.i].p) : null, d: shown(i) ? D[it.i].d : null }),
      winners: st.winners,
    };
  }
  const usedKeys = (st) => st.items.filter((it) => it.sold).map((it) => key(it.i));

  root.S10Auktion = { start, apply, tick, publicState, usedKeys, key, SIZES, REVEALS, HAMMERS, budgetFor };
})(typeof window !== "undefined" ? window : globalThis);
