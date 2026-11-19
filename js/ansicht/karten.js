// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, WCARDS, app, esc, headBrandHtml, invite, leave, render, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Kartenspaß für alle: Siebzehn und Vier · Stichhaltig · Busfahrt ----------
  const KG_RANK = { 7: "Sieben", 8: "Acht", 9: "Neun", 10: "Zehner", U: "Unter", O: "Ober", K: "König", A: "Ass" };
  const kgName = (id) => { const [su, r] = id.split("-"); return `${{ herz: "Herz", laub: "Laub", eichel: "Eichel", schelle: "Schell" }[su]}-${KG_RANK[r]}`; };
  // anim: "deal" = heranfliegen, "flip" = heranfliegen und umdrehen, "turn" = nur umdrehen (an Ort und Stelle); d = Verzögerung in ms
  const kgCard = (id, cls = "", attr = "", anim = "", d = 0) => {
    const title = `title="${id ? esc(kgName(id)) : "verdeckt"}"`;
    if (!anim || anim === "deal" || !id) return `<span class="kg-card ${cls} ${anim ? "anim-deal" : ""}" style="--d:${d}ms" ${attr} ${title}>${id ? WCARDS.svg(id) : WCARDS.back()}</span>`;
    return `<span class="kg-card ${cls} anim-${anim}" style="--d:${d}ms" ${attr} ${title}><span class="kg-in"><span class="kg-face kg-front">${WCARDS.svg(id)}</span><span class="kg-face kg-back">${WCARDS.back()}</span></span></span>`;
  };
  // Welche Karten schon gezeigt wurden – nur neue werden animiert
  // Animationen zeitbasiert: wird während einer Animation neu gezeichnet (z. B. weil Karten und Spielstand getrennt
  // ankommen), läuft sie an derselben Stelle weiter statt abzubrechen. Rückgabe: { d: Verzögerung in ms (auch negativ), first }
  const kgSeen = new Map();
  function kgAnim(key, planned, dur) {
    const now = performance.now(); let e = kgSeen.get(key); const first = !e;
    if (!e) { e = { t: now, d: planned }; kgSeen.set(key, e); }
    const el = now - e.t;
    return el > e.d + dur ? null : { d: Math.round(e.d - el), first };
  }
  let kgSoundAt = 0, kgOutcomeDelay = 0; // Verzögerung für den Gewinn-/Verlust-Ton (passend zur Animation)
  const kgSound = (n, gapMs, startMs) => { if (n > 0 && Date.now() > kgSoundAt) { sfx.card(n, gapMs / 1000, startMs / 1000); kgSoundAt = Date.now() + 150; } };
  let kgRendered = null;
  function kgChips(v, st) {
    return st.seats.map((id) => {
      const i = v.players.findIndex((p) => p.id === id), p = v.players[i] || { name: "?", connected: false };
      const done = st.mode === "bus" ? (st.step === "guess" ? !!st.guessed[id] || st.status[id] !== "ride" : st.step === "roundEnd" ? !!st.ready[id] : false)
        : st.mode === "stich" ? (st.step === "bid" ? !!st.said[id] : st.step === "reveal" ? !!st.ready[id] : false)
        : st.step === "play" ? !!st.done[id] : st.step === "reveal" ? !!st.ready[id] : false;
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[Math.max(0, i) % PLAYER_COLORS.length]}"><span class="pdot ${p.connected ? "" : "off"}"></span>
        <span class="geo-score-name">${esc(p.name)}${id === G.myId ? " <em>(du)</em>" : ""}</span><b>${st.total[id] || 0}</b>${st.step !== "final" && (st.mode === "siebzehn" || (st.mode === "bus" && (st.step === "guess" || st.step === "roundEnd")) || (st.mode === "stich" && (st.step === "bid" || st.step === "reveal"))) ? `<span class="geo-mark">${done ? "✓" : "…"}</span>` : ""}</span>`;
    }).join("");
  }
  function renderKarten() {
    const v = G.view, st = v.karten;
    if (!st) return;
    const seated = st.seats.includes(G.myId);
    const priv = seated && G.wattenPriv && G.wattenPriv.roundNo === st.round ? G.wattenPriv : null;
    const key = v.code + ":" + st.gid + ":" + st.mode + ":" + st.round + ":" + st.step + ":" + (priv ? priv.hand.length : "-") + ":" + JSON.stringify(st.done || st.said || {}) + (st.mode === "stich" ? ":" + JSON.stringify(st.ready || {}) + ":" + st.turn + ":" + st.trick.length + ":" + (priv && priv.playable ? priv.playable.length : "-") : "")
      + (st.mode === "bus" ? ":" + st.q + ":" + st.revealed + ":" + JSON.stringify(st.pick || {}) + ":" + JSON.stringify(st.guessed || {}) + ":" + JSON.stringify(st.status || {}) : "");
    if (kgRendered === key && app.querySelector(".kg-main")) {
      const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = kgChips(v, st);
      if (st.step === "reveal") { const rb = app.querySelector("#kg-ready"); if (rb) rb.textContent = st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Nächste Runde"; }
      return;
    }
    kgRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const readyBtn = `<div class="geo-actions"><button id="kg-ready" class="btn primary">${st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Nächste Runde"}</button>
      ${G.isHost ? `<button id="kg-next" class="btn ghost sm">Als Gastgeber sofort weiter</button>` : ""}</div>`;
    let main = "";
    if (st.step === "final") {
      const ranking = st.seats.slice().sort((a, b) => (st.total[b] || 0) - (st.total[a] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((id) => (st.winners || []).includes(id)).map((id) => esc(nameOf(id))).join(" & ")} ${(st.winners || []).length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="kg-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((id, i) => `<div class="slf-rank" style="--pc:${colorOf(id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
          <span class="slf-name">${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</span><b>${st.total[id] || 0} Punkte</b></div>`).join("")}
          <p class="muted small">${esc(st.modeName)} · ${st.rounds} ${st.rounds === 1 ? "Runde" : "Runden"}</p></div>`;
    } else if (st.mode === "bus") {
      main = busMainHtml(v, st, colorOf, nameOf);
    } else if (st.mode === "siebzehn") {
      const gk = st.gid + ":" + st.round;
      // Hat die eigene letzte Karte die Runde beendet (21, über 21 oder als Letzter fertig), bleibt der Tisch kurz stehen:
      // erst wird die Karte ausgeteilt, dann geht es zur Auflösung
      const myR = st.step === "reveal" && st.result[G.myId], heldNew = myR ? myR.hand.filter((c) => !kgSeen.has(`${gk}:m:${c}`)) : [];
      const hold = heldNew.length ? { hand: myR.hand, sum: myR.sum, feuer: myR.feuer } : null;
      if (st.step === "reveal") kgOutcomeDelay = hold ? heldNew.length * 380 + 950 : 0;
      if (hold) setTimeout(() => { const k = G.view && G.view.karten; if (k && k.round === st.round && k.step === "reveal") { kgRendered = null; render(); } }, heldNew.length * 380 + 1700);
      if (st.step === "play" || hold) {
        const priv = hold || (seated && G.wattenPriv && G.wattenPriv.roundNo === st.round ? G.wattenPriv : null);
        const doneOf = (id) => (hold ? true : st.done[id]), countOf = (id) => (hold ? st.result[id].hand.length : st.count[id] || 0);
        let sounds = 0;
        const others = st.seats.filter((id) => id !== G.myId).map((id) => `<div class="kg-opp" style="--pc:${colorOf(id)}"><b>${esc(nameOf(id))}</b>
            <span class="kg-backs">${Array.from({ length: countOf(id) }, (_, k) => { const a = kgAnim(`${gk}:o:${id}:${k}`, k < 2 ? 450 + k * 300 : 0, 700); return kgCard(null, "mini", "", a ? "deal" : "", a ? a.d : 0); }).join("")}</span><span class="muted small">${doneOf(id) ? "fertig ✓" : "überlegt …"}</span></div>`).join("");
        // eigene Karten: neue fliegen nacheinander heran und drehen sich um; Summe und Knöpfe erst danach
        let fresh = 0;
        let lateAt = null;
        const handHtml = priv ? priv.hand.map((c) => {
          const a = kgAnim(`${gk}:m:${c}`, fresh * 380, 1000);
          if (a && a.first) fresh++;
          if (a) lateAt = Math.max(lateAt == null ? -1e9 : lateAt, a.d + 900);
          return kgCard(c, "big", "", a ? "flip" : "", a ? a.d : 0);
        }).join("") : "";
        sounds = fresh;
        const late = lateAt != null ? `kg-late" style="--d:${lateAt}ms` : "";
        const mine = priv ? `<div class="kg-hand" style="--n:${priv.hand.length}">${handHtml}</div>
            <div class="${late}">${kgMeter(priv)}
            <div class="kg-sum ${priv.feuer || priv.sum === 21 ? "top" : priv.sum > 21 ? "bust" : ""}">${priv.feuer ? "🔥 Feuer – zwei Asse!" : priv.sum > 21 ? `${priv.sum} – über 21, leider raus` : `Summe: <b>${priv.sum}</b>`}</div>
            ${hold ? `<p class="muted">Alle sind fertig – gleich wird aufgedeckt …</p>` : st.done[G.myId] ? `<p class="muted">${priv.sum > 21 && !priv.feuer ? "Warte auf die anderen …" : "Du bist fertig – warte auf die anderen …"}</p>`
              : `<div class="kg-actions"><button id="kg-hit" class="btn primary">Weitere Karte</button><button id="kg-stand" class="btn ghost">Genug</button></div>`}</div>`
          : seated ? `<p class="muted">Karten werden ausgeteilt …</p>` : `<p class="muted">Du schaust in dieser Runde zu.</p>`;
        kgSound(sounds, 380, 0);
        const valuesBox = `<div class="bus-scale kg-scale" aria-label="Kartenwerte"><span class="bs-end">Werte</span>${[["Ass", 11], ["Zehner", 10], ["Neun", 9], ["Acht", 8], ["Sieben", 7], ["König", 4], ["Ober", 3], ["Unter", 2]]
          .map(([n, v]) => `<span><em>${n}</em><b>${v}</b></span>`).join("")}<span class="kg-feuer">2 Asse = 🔥</span></div>`;
        // Handy ab der 2. Runde: Ziel ist bekannt, die Werte gibt's zum Aufklappen – der Tisch bleibt übersichtlich
        const brief = innerWidth <= 640 && st.round > 1;
        main = `<div class="panel kg-table">${brief ? "" : `<div class="kg-goal"><b>Ziel: so nah wie möglich an 21 – aber nicht darüber!</b></div>`}
          ${brief ? `<div class="bus-q-main">${mine}</div><details class="kg-valfold"><summary>Kartenwerte</summary>${valuesBox}</details>`
            : `<div class="bus-q with-scale"><div class="bus-q-main">${mine}</div>${valuesBox}</div>`}</div>
          ${others ? `<div class="kg-opps">${others}</div>` : ""}`;
      } else {
        // Auflösung: Spieler für Spieler werden die Karten der anderen aufgedeckt, dann erscheinen Summe und Punkte
        const order = st.seats.slice().sort((a, b) => st.result[b].points - st.result[a].points || st.result[b].sum - st.result[a].sum);
        const ra = kgAnim(`${gk}:reveal`, 0, 8000), animate = !!ra, off = ra ? ra.d : 0;
        let t = 300, flips = 0;
        const rows = order.map((id) => { const r = st.result[id], mine = id === G.myId;
          const cards = r.hand.map((c, k) => kgCard(c, "mini", "", animate && !mine ? "turn" : "", t + k * 160 + off)).join("");
          if (animate && !mine) { t += r.hand.length * 160; flips += r.hand.length; }
          const after = animate ? `kg-late" style="--d:${t + 150 + off}ms` : "";
          if (animate) t += 550;
          return `<div class="kg-res ${r.bust ? "bust" : r.place === 1 ? "win" : ""} ${animate ? "anim-row" : ""}" style="--pc:${colorOf(id)};--d:${t + 150 + off}ms"><span class="kg-rname"><span class="pdot"></span>${esc(nameOf(id))}${mine ? " <em>(du)</em>" : ""}</span>
            <span class="kg-hand small">${cards}</span>
            <span class="kg-rsum ${after}">${r.feuer ? "🔥 Feuer" : r.bust ? `${r.sum} – über 21` : r.sum === 21 ? "21 – Siebzehn und Vier!" : r.sum}</span><b class="qb-plus ${after}">+${r.points}</b></div>`; }).join("");
        if (ra && ra.first) { kgSound(flips, 160, 300); if (!kgOutcomeDelay) kgOutcomeDelay = t; }
        main = `<div class="panel kg-table"><div class="kg-results">${rows}</div><div class="${animate ? `kg-late" style="--d:${t + off}ms` : ""}">${readyBtn}</div></div>`;
      }
    } else {
      main = stichMainHtml(v, st, colorOf, nameOf, readyBtn);
    }
    app.innerHTML = `
      <main class="screen game slf geo kg-main kg-${st.mode}">
        <header class="top topbar">${headBrandHtml(st.mode)}<div class="meta">${esc(st.modeName)}${(st.mode === "bus" || st.mode === "siebzehn") && st.step !== "final" ? `<span class="kg-meta-round"><span>Runde</span> <b>${st.round}/${st.rounds}</b></span>` : ""}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>${topActionsHtml()}</header>
        ${statusBarHtml()}
        <section class="slf-main">${st.step !== "final" && st.mode !== "stich" ? `<div class="geo-bar"><span class="game-label">${st.mode === "bus" ? `Runde ${st.round}/${st.rounds} · ${st.step === "roundEnd" ? "Endstation" : `Station ${Math.min(st.q, 4) + 1} von 5`}` : `${st.step === "reveal" ? "Auflösung · " : ""}Runde ${st.round}/${st.rounds}${st.mode === "stich" ? ` · ${st.n} ${st.n === 1 ? "Karte" : "Karten"}` : ""}`}</span><div class="geo-scores">${kgChips(v, st)}</div></div>` : ""}${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#kg-hit", () => send({ type: "kgHit", round: st.round }));
    on("#kg-stand", () => send({ type: "kgStand", round: st.round }));
    on("#kg-ready", () => send({ type: "kgReady" }));
    on("#kg-next", () => send({ type: "kgNext" }));
    on("#kg-restart", () => send({ type: "kgRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-busg]").forEach((b) => b.onclick = () => {
      busMine = { gid: st.gid, q: st.q, r: st.round, g: b.dataset.busg };
      app.querySelectorAll("[data-busg]").forEach((x) => x.classList.toggle("on", x === b));
      const sk = app.querySelector(".bus-stakes"); if (sk) sk.innerHTML = `<span class="bs-done">${b.dataset.busg === "_out" ? "🚏 Du steigst aus" : "✓ Getippt"} – umentscheiden geht, bis alle dran sind</span>`;
      send({ type: "kgGuess", round: st.round, station: st.q, g: b.dataset.busg });
    });
    app.querySelectorAll("[data-say]").forEach((b) => b.onclick = () => {
      stMine = { gid: st.gid, r: st.round, bid: Number(b.dataset.say) };
      app.querySelectorAll("[data-say]").forEach((x) => x.classList.toggle("on", x === b));
      send({ type: "kgSay", round: st.round, bid: Number(b.dataset.say) });
    });
    app.querySelectorAll("[data-stp]").forEach((el) => {
      const go = () => { app.querySelectorAll("[data-stp]").forEach((x) => { x.removeAttribute("data-stp"); x.classList.add("off"); }); send({ type: "kgPlay", round: st.round, card: el.dataset.card }); };
      el.onclick = go; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
  }
  // Fortschrittsbalken bis 21: grün bis 16, gelb 17–20, voll bei 21, rot darüber (nur 21 als Markierung)
  function kgMeter(priv) {
    const v = priv.feuer ? 21 : priv.sum, pct = Math.min(100, (v / 21) * 100);
    const cls = v > 21 ? "bust" : v === 21 ? "full" : v >= 17 ? "near" : "";
    return `<div class="kg-meter ${cls}" aria-hidden="true"><i style="width:${pct}%"></i><span class="kg-mark end">21</span></div>`;
  }
  let busMine = null, stMine = null;
  // Stichhaltig: Kopfzeile (Runde, Trumpf, Ansagen-Bilanz), ein Kasten je Spieler (Punkte, Ansage als Kreise, was noch fehlt),
  // Stich mit festen Plätzen in Spielreihenfolge, darunter „Du bist dran“ und die eigene Hand
  const ST_SUIT = { herz: "Herz", laub: "Laub", eichel: "Eichel", schelle: "Schelle" };
  function stichMainHtml(v, st, colorOf, nameOf, readyBtn) {
    const seated = st.seats.includes(G.myId), gk = st.gid + ":st:" + st.round;
    kgOutcomeDelay = 0;
    const priv = seated && G.wattenPriv && G.wattenPriv.roundNo === st.round && G.wattenPriv.hand ? G.wattenPriv : null;
    const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
    const you = (id) => (id === G.myId ? " <em>(du)</em>" : "");
    // Ansagen werden nacheinander aufgedeckt (einmal, beim ersten Zeigen)
    const ba = st.bids ? kgAnim(`${gk}:bids`, 500, 600 + st.seats.length * 400 + 800) : null;
    const bidDelay = (i) => (ba ? ba.d + i * 400 : null);
    const lateAttr = (d) => (d != null ? `kg-late" style="--d:${d}ms` : "");
    if (ba && ba.first) kgSound(st.seats.length, 400, 500);
    const ta = st.trumpCard ? kgAnim(`${gk}:trump`, 150, 1100) : null;
    if (ta && ta.first) kgSound(1, 0, 150);

    // Kopfzeile: Runde · Trumpf · Ansagen-Bilanz (bleibt während des Spiels stehen)
    const sum = st.bids ? st.seats.reduce((x, id) => x + st.bids[id], 0) : 0;
    const balance = !st.bids ? `<span class="st-bal">${st.seats.filter((id) => st.said[id]).length} von ${st.seats.length} haben angesagt</span>`
      : `<span class="st-bal ${sum > st.n ? "over" : sum < st.n ? "under" : "even"} ${lateAttr(ba ? ba.d + st.seats.length * 400 : null)}" title="${sum > st.n ? "Mehr angesagt als Stiche da sind – mindestens einer geht leer aus" : sum < st.n ? "Weniger angesagt als Stiche da sind – jemand bekommt ungewollt einen" : "Die Ansagen können für alle aufgehen"}">
          <b>${sum}</b> angesagt · <b>${st.n}</b> zu holen · ${sum > st.n ? "zu viele" : sum < st.n ? "zu wenige" : "geht auf"}</span>`;
    const head = `<div class="st-head">
        <span class="game-label">${st.step === "reveal" ? "Auflösung · " : ""}Runde ${st.round}/${st.rounds} · ${plural(st.n, "Karte", "Karten")}</span>
        <span class="st-trumpchip">${st.trumpCard ? kgCard(st.trumpCard, "mini", "", ta ? "flip" : "", ta ? ta.d : 0) : ""}<span>Trumpf <b>${st.trump ? ST_SUIT[st.trump] : "keiner"}</b></span></span>
        ${balance}</div>`;

    if (st.step === "reveal") {
      const rows = st.seats.slice().sort((a, b) => st.result[b].points - st.result[a].points).map((id) => { const r = st.result[id], ok = r.bid === r.got;
        return `<div class="kg-res ${ok ? "win" : "bust"}" style="--pc:${colorOf(id)}"><span class="kg-rname"><span class="pdot"></span>${esc(nameOf(id))}${you(id)}</span>
          <span class="muted small">Ansage ${r.bid} · Stiche ${r.got} ${ok ? "✓ genau getroffen" : `✗ ${Math.abs(r.bid - r.got)} daneben`}</span>
          <span class="st-rtotal">gesamt ${st.total[id] || 0}${st.ready[id] ? ' · <span class="st-ready">bereit ✓</span>' : ""}</span>
          <b class="qb-plus ${r.points < 0 ? "minus" : ""}">${r.points > 0 ? "+" : ""}${r.points}</b></div>`; }).join("");
      return `<div class="panel kg-table st-table">${head}<div class="kg-results">${rows}</div>${readyBtn}</div>`;
    }

    // Spieler-Kästen: Punkte, Ansage als Kreise (gefüllt = geholt, rot = zu viel), was noch fehlt
    const seats = `<div class="st-seats">${st.seats.map((id, i) => {
      // während der fertige Stich gezeigt wird, zählt er schon für den Gewinner (das Spiel bucht ihn erst beim Einsammeln)
      const pending = st.step === "trick" && st.lastTrick && st.lastTrick.winner === id ? 1 : 0;
      const bid = st.bids ? st.bids[id] : null, got = (st.tricks[id] || 0) + pending, turn = st.step === "play" && st.turn === id;
      const leads = (st.step === "bid" || st.step === "bidShow") && id === st.lead;
      let goal, state = "", cls = "";
      if (bid == null) { goal = `<span class="st-wait">${st.said[id] ? "✓ angesagt" : "überlegt …"}</span>`; }
      else {
        const dots = Array.from({ length: Math.max(bid, got) }, (_, k) => `<i class="${k < Math.min(got, bid) ? "got" : k >= bid ? "extra" : ""}"></i>`).join("");
        goal = `<span class="st-goal ${lateAttr(bidDelay(i))}"><span class="st-dots">${dots}</span><b>${got}/${bid}</b></span>`;
        const need = bid - got;
        cls = need < 0 ? "over" : need === 0 ? "hit" : "";
        state = need > 0 ? `braucht noch ${need}` : need === 0 ? (bid === 0 ? "will keinen Stich" : "✓ genug – keinen mehr!") : `${-need} zu viel`;
      }
      return `<div class="st-seat ${turn ? "turn" : ""} ${id === G.myId ? "me" : ""} ${cls}" style="--pc:${colorOf(id)}">
          <div class="st-sname"><span class="pdot"></span><b>${id === G.myId ? "Du" : esc(nameOf(id))}</b>${turn ? '<span class="st-tag turn">am Zug</span>' : leads ? '<span class="st-tag">spielt an</span>' : ""}<span class="st-total" title="Punkte bisher">${st.total[id] || 0}</span></div>
          ${goal}<div class="st-state">${state}</div></div>`;
    }).join("")}</div>`;

    let center = "";
    if (st.step === "bid") {
      const mine = stMine && stMine.gid === st.gid && stMine.r === st.round && st.said[G.myId] ? stMine.bid : null;
      const leadTxt = st.lead === G.myId ? "Du spielst an" : `<b style="color:${colorOf(st.lead)}">${esc(nameOf(st.lead))}</b> spielt an`;
      center = seated ? `<div class="st-ask"><b>Wie viele Stiche machst du?</b><span class="muted small">${leadTxt} · alle sagen gleichzeitig und geheim an, umentscheiden geht bis zum Schluss</span></div>
          <div class="st-say">${Array.from({ length: st.n + 1 }, (_, k) => `<button type="button" class="bus-choice ${mine === k ? "on" : ""}" data-say="${k}"><b>${k}</b><small>${k === 1 ? "Stich" : "Stiche"}</small></button>`).join("")}</div>`
        : `<p class="muted">Die anderen sagen an …</p>`;
    } else if (st.step === "bidShow") {
      center = `<p class="st-msg ${lateAttr(ba ? ba.d + st.seats.length * 400 + 300 : null)}">${sum > st.n ? `Zusammen ${sum} angesagt – aber nur ${plural(st.n, "Stich", "Stiche")} da. Da geht jemand leer aus!`
        : sum < st.n ? `Zusammen ${sum} angesagt – ${plural(st.n - sum, "Stich bleibt", "Stiche bleiben")} übrig. Wer schnappt ${st.n - sum === 1 ? "ihn" : "sie"} sich ungewollt?`
        : `Zusammen genau ${sum} angesagt – das kann für alle aufgehen!`}</p>`;
    } else {
      // Stich: feste Plätze in Spielreihenfolge ab dem, der anspielt; offene Plätze gestrichelt, der nächste leuchtet
      const done = st.step === "trick", tr = done ? st.lastTrick.cards : st.trick, winner = done ? st.lastTrick.winner : null;
      const starter = tr.length ? tr[0].id : st.turn, s0 = Math.max(0, st.seats.indexOf(starter));
      const order = done ? tr.map((t) => t.id) : st.seats.slice(s0).concat(st.seats.slice(0, s0));
      let dealt = 0;
      const slots = order.map((id) => {
        const t = tr.find((x) => x.id === id);
        if (!t) return `<div class="st-slot ${id === st.turn ? "next" : ""}" style="--pc:${colorOf(id)}"><span class="st-empty">${id === st.turn ? "…" : ""}</span><span class="st-sn">${id === G.myId ? "Du" : esc(nameOf(id))}</span></div>`;
        const a = kgAnim(`${gk}:t:${t.card}`, 0, 600); if (a && a.first) dealt++;
        return `<div class="st-slot played ${winner === id ? "win" : ""}" style="--pc:${colorOf(id)}">${kgCard(t.card, "mid", "", a ? "deal" : "", a ? a.d : 0)}<span class="st-sn">${id === G.myId ? "Du" : esc(nameOf(id))}</span></div>`;
      }).join("");
      kgSound(dealt, 0, 0);
      const led = st.trick.length ? st.trick[0].card.split("-")[0] : null;
      const mustFollow = st.turn === G.myId && led && priv && priv.playable.length && priv.playable.length < priv.hand.length && priv.playable.every((c) => c.startsWith(led + "-"));
      const ledInfo = !done && led ? `<span class="st-led">angespielt: <b>${ST_SUIT[led]}</b></span>` : "";
      const msg = done ? `<p class="st-msg kg-late" style="--d:400ms"><b style="color:${colorOf(winner)}">${esc(nameOf(winner))}</b> holt den Stich!</p>`
        : st.turn === G.myId ? `<p class="st-yourturn">Du bist dran – ${st.trick.length ? (mustFollow ? `du musst <b>${ST_SUIT[led]}</b> bedienen` : "spiel eine Karte") : "spiel an"}</p>`
        : `<p class="st-msg muted"><b style="color:${colorOf(st.turn)}">${esc(nameOf(st.turn))}</b> ist dran …</p>`;
      center = `<div class="st-trick ${done ? "done" : ""}">${slots}${ledInfo}</div>${msg}`;
    }

    // eigene Hand: am Rundenanfang fliegen die Karten heran; spielbare Karten sind anklickbar
    let fresh = 0;
    const myTurn = st.step === "play" && st.turn === G.myId;
    const myBid = st.bids && seated ? st.bids[G.myId] : null;
    const myGot = (st.tricks[G.myId] || 0) + (st.step === "trick" && st.lastTrick && st.lastTrick.winner === G.myId ? 1 : 0);
    const handHead = priv ? `<div class="st-handhead">Deine Karten${myBid != null ? ` · Ziel <b>${plural(myBid, "Stich", "Stiche")}</b>, geholt <b>${myGot}</b>` : ""}</div>` : "";
    const hand = priv ? `${handHead}<div class="kg-hand st-hand ${myTurn ? "active" : ""}">${priv.hand.map((c) => {
      const a = kgAnim(`${gk}:h:${c}`, fresh * 160, 900); if (a && a.first) fresh++;
      const can = myTurn && priv.playable.includes(c);
      return kgCard(c, `big ${can ? "pickable" : myTurn ? "off" : ""}`, can ? `data-stp="1" data-card="${c}" role="button" tabindex="0"` : "", a ? "flip" : "", a ? a.d : 0);
    }).join("")}</div>` : seated ? "" : `<p class="muted">Du schaust zu.</p>`;
    kgSound(fresh, 160, 0);
    // beim Ansagen erst die eigenen Karten zeigen, dann die Knöpfe – zum Überlegen
    return `<div class="panel kg-table st-table">${head}${seats}${st.step === "bid" ? hand + center : center + hand}</div>`;
  }
  const BUS_VAL = { 7: "Sieben", 8: "Acht", 9: "Neun", 10: "Zehner", U: "Unter", O: "Ober", K: "König", A: "Ass" };
  function busMainHtml(v, st, colorOf, nameOf) {
    const gk = st.gid + ":bus:" + st.round, seated = st.seats.includes(G.myId), me = seated ? st.status[G.myId] : null;
    const rankOfId = (c) => c.split("-")[1];
    const order = seated ? [G.myId, ...st.seats.filter((id) => id !== G.myId)] : st.seats;
    let flips = 0;
    // Fortschritt: fünf Stationen mit Punkten
    const ladder = `<div class="bus-ladder">${st.stations.map((p, i) => `<div class="bus-stop ${i < st.q || st.step === "roundEnd" ? "past" : i === st.q ? "cur" : ""}"><span>Station ${i + 1}</span><b>+${p}</b></div>`).join(`<i class="bus-road"></i>`)}</div>`;
    const statusTxt = (id) => ({ ride: st.step === "guess" ? (st.guessed[id] ? "✓ getippt" : "überlegt …") : "fährt", out: `🚏 ausgestiegen · +${st.gain[id]}`, crash: "💥 verunglückt", done: `🏁 Endstation! +${st.gain[id]}` })[st.status[id]];
    const handRow = (id) => {
      const res = st.step === "show" && st.res ? st.res[id] : null, h = st.hands[id] || [];
      const cards = h.map((c, i) => {
        const a = i === h.length - 1 && res && !res.out ? kgAnim(`${gk}:h:${id}:${i}`, 150, 1000) : null;
        if (a && a.first) flips++;
        return kgCard(c, id === G.myId ? "big" : "mid", "", a ? "flip" : "", a ? a.d : 0);
      }).join("");
      const badge = res ? `<span class="bus-badge ${res.out ? "good" : res.ok ? "ok" : "bad"} ${res.out ? "" : "kg-late"}" style="--d:1100ms">${res.out ? `🚏 steigt aus mit ${res.pts}` : res.ok ? `✓ +${res.pts}` : `💥 verunglückt${res.lost ? ` – ${res.lost} weg` : ""}`}</span>` : "";
      return `<div class="bus-player ${id === G.myId ? "me" : ""} st-${st.status[id]}" style="--pc:${colorOf(id)}"><div class="bus-pname"><span class="pdot"></span><b>${esc(nameOf(id))}${id === G.myId ? " (du)" : ""}</b>
          <span class="muted small">${res ? "" : statusTxt(id)}</span>${badge}<span class="bus-pot" title="Rundentopf – noch nicht sicher">${st.status[id] === "ride" && st.pot[id] ? `Topf ${st.pot[id]}` : ""}</span><span class="bus-minus">${st.total[id] || 0}</span></div>
        <div class="kg-hand">${cards || `<span class="muted small">noch keine Karte</span>`}</div></div>`;
    };
    let top;
    if (st.step === "roundEnd") {
      const rows = st.seats.slice().sort((a, b) => st.gain[b] - st.gain[a]).map((id) => `<div class="kg-res ${st.gain[id] ? "win" : "bust"}" style="--pc:${colorOf(id)}"><span class="kg-rname"><span class="pdot"></span>${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</span>
          <span class="muted small">${st.status[id] === "crash" ? "💥 verunglückt" : st.status[id] === "done" ? "🏁 alle 5 Stationen!" : "🚏 ausgestiegen"}</span><span></span><b class="qb-plus">+${st.gain[id]}</b></div>`).join("");
      top = `${ladder}<div class="kg-results">${rows}</div>
        <div class="geo-actions"><button id="kg-ready" class="btn primary">${st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : "Nächste Runde"}</button>
          ${G.isHost ? `<button id="kg-next" class="btn ghost sm">Als Gastgeber sofort weiter</button>` : ""}</div>`;
    } else {
      const q = st.question, h = st.hands[G.myId] || [], mine = busMine && busMine.gid === st.gid && busMine.q === st.q && busMine.r === st.round && st.guessed[G.myId] ? busMine.g : null;
      const ref = st.q === 1 && h[0] ? `Deine erste Karte: <b>${esc(kgName(h[0]))}</b>` : st.q === 2 && h[1] ? `Zwischen <b>${esc(BUS_VAL[rankOfId(h[0])])}</b> und <b>${esc(BUS_VAL[rankOfId(h[1])])}</b>?` : "";
      const pot = seated ? st.pot[G.myId] : 0;
      let act = "";
      if (st.step === "guess" && me === "ride") {
        // Antwort-Kacheln mit Symbol; Bezugskarten klein als Bild
        const ICON = { fig: "👑", zahl: "🔢", hoch: "⬆️", tief: "⬇️", in: "⇥ ⇤", out: "⇤ ⇥" };
        const sym = (k) => ["herz", "laub", "eichel", "schelle"].includes(k) ? `<span class="bus-suit">${WCARDS.sym(k, 1)}</span>` : ICON[k] ? `<span class="bus-ico">${ICON[k]}</span>` : "";
        const label = (k, t) => q.key === "figur" ? `<b>${k === "fig" ? "Figur" : "Zahl"}</b><small>${k === "fig" ? "Unter · Ober · König · Ass" : "Sieben bis Zehner"}</small>` : `<b>${esc(t)}</b>`;
        act = `<div class="bus-choices ${q.opts.length > 4 ? "many" : q.opts.length > 2 ? "four" : ""}">${q.opts.map(([k, t]) =>
            `<button type="button" class="bus-choice ${mine === k ? "on" : ""}" data-busg="${k}">${sym(k)}${label(k, t)}</button>`).join("")}</div>
          ${st.q > 0 && pot > 0 ? `<div class="bus-or"><span>oder</span></div>
            <button type="button" class="bus-exit ${mine === "_out" ? "on" : ""}" data-busg="_out"><span class="bus-ico">🚏</span><span><b>Aussteigen</b><small>${pot} ${pot === 1 ? "Punkt" : "Punkte"} sicher mitnehmen</small></span></button>` : ""}
          <div class="bus-stakes">${mine ? `<span class="bs-done">${mine === "_out" ? "🚏 Du steigst aus" : "✓ Getippt"} – umentscheiden geht, bis alle dran sind</span>`
            : `<span class="bs-win">Richtig: +${q.pts}</span><span class="bs-lose">Falsch: ${pot ? `Topf (${pot}) weg` : "Bus verunglückt"}</span>`}</div>`;
      } else if (st.step === "show") act = `<p class="muted">Die Karten werden ausgeteilt …</p>`;
      else if (me === "out") act = `<p class="bus-state">🚏 Du bist mit <b>${st.gain[G.myId]}</b> ${st.gain[G.myId] === 1 ? "Punkt" : "Punkten"} ausgestiegen – schau, wie weit die anderen kommen.</p>`;
      else if (me === "crash") act = `<p class="bus-state">💥 Dein Bus ist verunglückt – du schaust bis zum Rundenende zu.</p>`;
      else if (me === "done") act = `<p class="bus-state">🏁 Endstation! Du hast alle 5 Stationen geschafft: <b>+${st.gain[G.myId]}</b></p>`;
      // Bei höher/tiefer und zwischen/außerhalb: Rangfolge der Werte rechts daneben, eigene Bezugskarten markiert
      const refs = st.q === 1 ? [h[0]] : st.q === 2 ? [h[0], h[1]] : [];
      const scale = (st.q === 1 || st.q === 2) && refs.every(Boolean) ? `<div class="bus-scale" aria-label="Reihenfolge der Werte"><span class="bs-end">hoch</span>${["A", "K", "O", "U", "10", "9", "8", "7"].map((r) =>
        `<span>${BUS_VAL[r]}</span>`).join("")}<span class="bs-end">tief</span></div>` : "";
      top = `${ladder}<div class="bus-q ${scale ? "with-scale" : ""}"><div class="bus-q-main"><div class="bus-question"><h3>${esc(q.text)}</h3>${st.q === 1 || st.q === 2 ? `<span class="bus-qnote">Gleich hoch zählt für dich</span>` : ""}</div>${act}</div>${scale}</div>`;
    }
    if (flips) kgSound(flips, 200, 150);
    return `<div class="panel kg-table bus">${top}</div><div class="bus-players">${order.map(handRow).join("")}</div>`;
  }



  return {
    get kgOutcomeDelay() { return kgOutcomeDelay; }, set kgOutcomeDelay(v) { kgOutcomeDelay = v; },
    renderKarten,
  };
});
