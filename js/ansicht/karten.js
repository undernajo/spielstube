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
      if (st.step === "reveal" || st.step === "roundEnd") G.nextBtnSwap("#kg-ready", { attr: 'id="kg-ready"', label: st.round >= st.rounds ? "Zum Endstand" : "Nächste Runde", ready: !!st.ready[G.myId], waiting: G.waitingNames(v, st.ready, st.seats) }, () => send({ type: "kgReady" }));
      return;
    }
    kgRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const readyBtn = `<div class="geo-actions">${G.nextBtnsHtml({ attr: 'id="kg-ready"', hostAttr: 'id="kg-next"', label: st.round >= st.rounds ? "Zum Endstand" : "Nächste Runde", ready: !!st.ready[G.myId], waiting: G.waitingNames(v, st.ready, st.seats) })}</div>`;
    let main = "";
    if (st.step === "final") {
      const ranking = st.seats.slice().sort((a, b) => (st.total[b] || 0) - (st.total[a] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((id) => (st.winners || []).includes(id)).map((id) => esc(nameOf(id))).join(" & ")} ${(st.winners || []).length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="kg-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((id, i) => `<div class="slf-rank" style="--pc:${colorOf(id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
          <span class="slf-name">${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</span><b>${st.total[id] || 0} Punkte</b></div>`).join("")}
          <p class="muted small">${esc(st.modeName)} · ${st.rounds} ${st.rounds === 1 ? "Runde" : "Runden"}</p></div>`;
    } else if (st.mode === "bus") {
      main = busMainHtml(v, st, colorOf, nameOf, readyBtn);
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
        // Wirtshaustisch: oben die Mitspieler mit verdeckten Karten, unten deine Hand als Fächer und ein Ring bis 21
        const seatsHtml = st.seats.filter((id) => id !== G.myId).map((id) => `<div class="sv-seat ${doneOf(id) ? "done" : ""}" style="--pc:${colorOf(id)}">
            <span class="sv-nm"><span class="pdot"></span>${esc(nameOf(id))}<em>${st.total[id] || 0}</em></span>
            <span class="sv-fan">${Array.from({ length: countOf(id) }, (_, k) => { const a = kgAnim(`${gk}:o:${id}:${k}`, k < 2 ? 450 + k * 300 : 0, 700); return kgCard(null, "sv-back", "", a ? "deal" : "", a ? a.d : 0); }).join("")}</span>
            <small>${doneOf(id) ? "✋ fertig" : "überlegt …"}</small></div>`).join("");
        // eigene Karten: neue fliegen nacheinander heran und drehen sich um; Summe und Knöpfe erst danach
        let fresh = 0;
        let lateAt = null;
        const n = priv ? priv.hand.length : 0;
        const handHtml = priv ? priv.hand.map((c, i) => {
          const a = kgAnim(`${gk}:m:${c}`, fresh * 380, 1000);
          if (a && a.first) fresh++;
          if (a) lateAt = Math.max(lateAt == null ? -1e9 : lateAt, a.d + 900);
          const r = (i - (n - 1) / 2) * 7;
          return `<span class="sv-c" style="--r:${r}deg;--y:${Math.abs(r) * .6}px">${kgCard(c, "sv-card", "", a ? "flip" : "", a ? a.d : 0)}</span>`;
        }).join("") : "";
        sounds = fresh;
        const late = lateAt != null ? `kg-late" style="--d:${lateAt}ms` : "";
        let me = "";
        if (priv) {
          const v = priv.feuer ? 21 : priv.sum, over = v > 21, top = priv.feuer || v === 21, C = 2 * Math.PI * 56;
          const tone = over ? "over" : top ? "top" : v >= 17 ? "near" : "";
          const msg = priv.feuer ? "🔥 Feuer – zwei Asse!" : over ? `${priv.sum} – über 21, leider raus` : v === 21 ? "21 – Siebzehn und Vier!" : st.done[G.myId] || hold ? `Du bleibst bei ${v}` : `noch ${21 - v} bis 21`;
          me = `<div class="sv-me"><div class="sv-hand">${handHtml}</div>
              <div class="sv-dial ${tone} ${late}"><svg viewBox="0 0 132 132" aria-hidden="true"><circle cx="66" cy="66" r="56" class="sv-ring0"/>
                <circle cx="66" cy="66" r="56" class="sv-ring" style="stroke-dasharray:${C * Math.min(1, v / 21)} ${C}"/></svg>
                <div><b>${priv.feuer ? "🔥" : v}</b><small>von 21</small></div></div></div>
            <div class="sv-foot ${late}"><div class="sv-msg ${tone}">${msg}<span class="sv-mine">Deine Punkte: <b>${st.total[G.myId] || 0}</b></span></div>
              ${hold ? `<p class="sv-wait">Alle sind fertig – gleich wird aufgedeckt …</p>` : st.done[G.myId] ? `<p class="sv-wait">${priv.sum > 21 && !priv.feuer ? "Warte auf die anderen …" : "Du bist fertig – warte auf die anderen …"}</p>`
                : `<div class="sv-acts"><button id="kg-hit" class="sv-hit">🂠 Karte!</button><button id="kg-stand" class="sv-stand">✋ Genug</button></div>`}</div>`;
        } else me = `<p class="sv-wait sv-solo">${seated ? "Karten werden ausgeteilt …" : "Du schaust in dieser Runde zu."}</p>`;
        kgSound(sounds, 380, 0);
        const legend = `<div class="sv-legend" aria-label="Kartenwerte">${[["Ass", 11], ["Zehner", 10], ["Neun", 9], ["Acht", 8], ["Sieben", 7], ["König", 4], ["Ober", 3], ["Unter", 2]]
          .map(([nm, v]) => `<span>${nm} <b>${v}</b></span>`).join("")}<span>2 Asse = 🔥</span></div>`;
        main = `<div class="sv-rim"><div class="sv-felt">${seatsHtml ? `<div class="sv-seats">${seatsHtml}</div>` : ""}${me}${legend}</div></div>`;
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
        main = `<div class="sv-rim"><div class="sv-felt sv-reveal"><div class="kg-results">${rows}</div><div class="${animate ? `kg-late" style="--d:${t + off}ms` : ""}">${readyBtn}</div></div></div>`;
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
    if (st.mode === "bus") busDrive();
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
    // Leiste oben: Trumpf · Spieler als Chips (Ring „geholt/angesagt“, Punkte, was noch fehlt) · Runde und Ansagen-Bilanz
    const trumpBox = `<div class="sc-trump">${st.trumpCard ? kgCard(st.trumpCard, "sc-tcard", "", ta ? "flip" : "", ta ? ta.d : 0) : ""}<div><small>Trumpf</small><b>${st.trump ? ST_SUIT[st.trump] : "keiner"}</b></div></div>`;
    const roundBox = `<div class="sc-round"><small>${st.step === "reveal" ? "Auflösung" : "Runde"}</small><b>${st.round} / ${st.rounds}</b><span class="sc-n">${plural(st.n, "Karte", "Karten")}</span></div>`;
    const balRow = `<div class="sc-balrow">${balance}</div>`;
    const R = 17, CIRC = 2 * Math.PI * R;
    const chips = `<div class="sc-chips">${st.seats.map((id, i) => {
      // während der fertige Stich gezeigt wird, zählt er schon für den Gewinner (das Spiel bucht ihn erst beim Einsammeln)
      const pending = st.step === "trick" && st.lastTrick && st.lastTrick.winner === id ? 1 : 0;
      const bid = st.bids ? st.bids[id] : null, got = (st.tricks[id] || 0) + pending, turn = st.step === "play" && st.turn === id;
      const leads = (st.step === "bid" || st.step === "bidShow") && id === st.lead;
      let ring, state, cls = "";
      if (bid == null) { ring = `<span class="sc-ring wait">${st.said[id] ? "✓" : "…"}</span>`; state = st.said[id] ? "angesagt" : "überlegt …"; }
      else {
        const need = bid - got, col = need < 0 ? "#ff7d8a" : need === 0 ? "#7ee2b1" : "#ffc83d", pct = bid ? Math.min(1, got / bid) : got ? 1 : 0;
        cls = need < 0 ? "over" : need === 0 ? "hit" : "need";
        ring = `<span class="sc-ring ${lateAttr(bidDelay(i))}"><svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="${R}" class="sc-r0"/><circle cx="21" cy="21" r="${R}" class="sc-r1" style="stroke:${col};stroke-dasharray:${CIRC * pct} ${CIRC}"/></svg>${got}/${bid}</span>`;
        state = need > 0 ? `braucht noch ${need}` : need === 0 ? (bid === 0 ? "will keinen Stich" : "genau – keinen mehr!") : `${-need} zu viel`;
      }
      return `<div class="sc-chip ${turn ? "turn" : ""} ${id === G.myId ? "me" : ""} ${cls}" style="--pc:${colorOf(id)}">${ring}
          <div><b><span class="pdot"></span>${id === G.myId ? "Du" : esc(nameOf(id))} · ${st.total[id] || 0}</b><small>${turn ? "am Zug" : leads ? "spielt an" : state}</small></div></div>`;
    }).join("")}</div>`;
    const bar = `<div class="sc-bar">${trumpBox}${chips}${roundBox}</div>${balRow}`;

    if (st.step === "reveal") {
      const rows = st.seats.slice().sort((a, b) => st.result[b].points - st.result[a].points).map((id) => { const r = st.result[id], ok = r.bid === r.got;
        return `<div class="kg-res ${ok ? "win" : "bust"}" style="--pc:${colorOf(id)}"><span class="kg-rname"><span class="pdot"></span>${esc(nameOf(id))}${you(id)}</span>
          <span class="muted small">Ansage ${r.bid} · Stiche ${r.got} ${ok ? "✓ genau getroffen" : `✗ ${Math.abs(r.bid - r.got)} daneben`}</span>
          <span class="st-rtotal">gesamt ${st.total[id] || 0}${st.ready[id] ? ' · <span class="st-ready">bereit ✓</span>' : ""}</span>
          <b class="qb-plus ${r.points < 0 ? "minus" : ""}">${r.points > 0 ? "+" : ""}${r.points}</b></div>`; }).join("");
      return `<div class="kg-table st-table sc-table">${bar}<div class="kg-results sc-results">${rows}</div>${readyBtn}</div>`;
    }

    // Mitte: links der Stich als Kartenhaufen, rechts groß, was gerade los ist bzw. was du tun musst
    const myBid = st.bids && seated ? st.bids[G.myId] : null;
    const myGot = (st.tricks[G.myId] || 0) + (st.step === "trick" && st.lastTrick && st.lastTrick.winner === G.myId ? 1 : 0);
    const myNeed = myBid == null ? null : myBid - myGot;
    const needChip = myNeed == null ? "" : `<span class="sc-need ${myNeed === 0 ? "ok" : myNeed < 0 ? "over" : ""}">Du: ${myNeed > 0 ? `braucht noch ${myNeed}` : myNeed === 0 ? (myBid === 0 ? "keinen Stich holen" : "genau – keinen mehr holen!") : `${-myNeed} zu viel`}</span>`;
    let pile = "", info = "", ask = "";
    if (st.step === "bid") {
      const mine = stMine && stMine.gid === st.gid && stMine.r === st.round && st.said[G.myId] ? stMine.bid : null;
      const leadTxt = st.lead === G.myId ? "Du spielst an" : `<b style="color:${colorOf(st.lead)}">${esc(nameOf(st.lead))}</b> spielt an`;
      info = seated ? `<span class="sc-yt">Wie viele Stiche machst du?</span><p>Alle sagen gleichzeitig und geheim an – umentscheiden geht bis zum Schluss. ${leadTxt}.</p>` : `<span class="sc-yt sc-calm">Die anderen sagen an …</span>`;
      ask = seated ? `<div class="st-say sc-say">${Array.from({ length: st.n + 1 }, (_, k) => `<button type="button" class="bus-choice ${mine === k ? "on" : ""}" data-say="${k}"><b>${k}</b><small>${k === 1 ? "Stich" : "Stiche"}</small></button>`).join("")}</div>` : "";
    } else if (st.step === "bidShow") {
      info = `<span class="sc-yt ${lateAttr(ba ? ba.d + st.seats.length * 400 + 300 : null)}">${sum > st.n ? "Zu viele Ansagen!" : sum < st.n ? "Zu wenige Ansagen!" : "Geht genau auf!"}</span>
        <p class="${lateAttr(ba ? ba.d + st.seats.length * 400 + 300 : null)}">${sum > st.n ? `Zusammen ${sum} angesagt – aber nur ${plural(st.n, "Stich", "Stiche")} da. Da geht jemand leer aus!`
        : sum < st.n ? `Zusammen ${sum} angesagt – ${plural(st.n - sum, "Stich bleibt", "Stiche bleiben")} übrig. Wer schnappt ${st.n - sum === 1 ? "ihn" : "sie"} sich ungewollt?`
        : `Zusammen genau ${sum} angesagt – das kann für alle aufgehen!`}</p>${needChip}`;
    } else {
      const done = st.step === "trick", tr = done ? st.lastTrick.cards : st.trick, winner = done ? st.lastTrick.winner : null;
      let dealt = 0;
      const n = tr.length, spread = Math.min(64, 200 / Math.max(1, st.seats.length - 1));
      // höchste Karte bisher (wer den Stich gerade hätte) – leuchtet dezent
      const led = tr.length ? tr[0].card.split("-")[0] : null;
      const rkOf = (c) => ["7", "8", "9", "10", "U", "O", "K", "A"].indexOf(c.split("-")[1]);
      const score = (c) => (c.split("-")[0] === st.trump ? 100 : c.split("-")[0] === led ? 0 : -100) + rkOf(c);
      const best = tr.length ? tr.reduce((a, b) => (score(b.card) > score(a.card) ? b : a)) : null;
      pile = `<div class="sc-pile" style="--n:${Math.max(1, n)}">${tr.map((t, i) => {
        const a = kgAnim(`${gk}:t:${t.card}`, 0, 600); if (a && a.first) dealt++;
        const rot = [-10, 4, 12, -5, 8, -12][i % 6], dy = [6, -4, 8, -6, 4, 0][i % 6], x = (i - (n - 1) / 2) * spread;
        return `<span class="sc-pc ${(done ? winner === t.id : best && best.id === t.id) ? (done ? "win" : "best") : ""}" style="--x:${x}px;--y:${dy}px;--r:${rot}deg;--pc:${colorOf(t.id)}">${kgCard(t.card, "sc-card", "", a ? "deal" : "", a ? a.d : 0)}<i>${t.id === G.myId ? "Du" : esc(nameOf(t.id))}</i></span>`;
      }).join("")}${!n ? `<span class="sc-empty">${st.turn === G.myId ? "Spiel an!" : "noch leer"}</span>` : ""}</div>`;
      kgSound(dealt, 0, 0);
      const mustFollow = st.turn === G.myId && led && priv && priv.playable.length && priv.playable.length < priv.hand.length && priv.playable.every((c) => c.startsWith(led + "-"));
      const bestTxt = best ? `Höchste Karte bisher: <b>${esc(kgName(best.card))}</b> von ${best.id === G.myId ? "dir" : esc(nameOf(best.id))}.` : "";
      if (done) info = `<span class="sc-yt kg-late" style="--d:400ms"><span style="color:${colorOf(winner)}">${winner === G.myId ? "Du holst" : `${esc(nameOf(winner))} holt`}</span> den Stich!</span>${needChip}`;
      else if (st.turn === G.myId) info = `<span class="sc-yt">Du bist dran</span><p>${!tr.length ? "Du spielst an – leg eine beliebige Karte." : mustFollow ? `Angespielt ist <b>${ST_SUIT[led]}</b> – du musst bedienen. ${bestTxt}` : `Angespielt ist <b>${ST_SUIT[led]}</b> – du hast keins: trumpfen oder abwerfen. ${bestTxt}`}</p>${needChip}`;
      else info = `<span class="sc-yt sc-calm"><span style="color:${colorOf(st.turn)}">${esc(nameOf(st.turn))}</span> ist dran …</span>${tr.length ? `<p>Angespielt ist <b>${ST_SUIT[led]}</b>. ${bestTxt}</p>` : ""}${needChip}`;
    }
    const center = `<div class="sc-center ${pile ? "" : "nopile"}">${pile}<div class="sc-info">${info}</div></div>${ask}`;

    // eigene Hand: am Rundenanfang fliegen die Karten heran; spielbare sind angehoben, die übrigen abgeblendet
    let fresh = 0;
    const myTurn = st.step === "play" && st.turn === G.myId;
    const hand = priv ? `<div class="kg-hand st-hand sc-hand ${myTurn ? "active" : ""}">${priv.hand.map((c) => {
      const a = kgAnim(`${gk}:h:${c}`, fresh * 160, 900); if (a && a.first) fresh++;
      const can = myTurn && priv.playable.includes(c);
      return kgCard(c, `big ${can ? "pickable" : myTurn ? "off" : ""}`, can ? `data-stp="1" data-card="${c}" role="button" tabindex="0"` : "", a ? "flip" : "", a ? a.d : 0);
    }).join("")}</div>` : seated ? "" : `<p class="muted">Du schaust zu.</p>`;
    kgSound(fresh, 160, 0);
    return `<div class="kg-table st-table sc-table">${bar}${center}${hand}</div>`;
  }
  // Bus fährt von Station zu Station: Lage als Prozent der Stationsleiste (passt bei jeder Breite), Fahrt zeitbasiert –
  // wird währenddessen neu gezeichnet, fährt er an derselben Stelle weiter; neue Runde = sofort an Station 1
  let busPos = { key: null, idx: 0, from: 0, t0: 0 };
  const BUS_DRIVE_MS = 1100;
  function busDrive() {
    const bus = app.querySelector(".bb-bus"), row = bus && bus.parentElement, stops = row ? [...row.querySelectorAll(".bb-stop")] : [];
    if (!bus || !stops.length) return;
    const idx = Number(bus.dataset.i), key = bus.dataset.k, w = row.getBoundingClientRect().width || 1;
    const at = (i) => { const r = stops[i].getBoundingClientRect(); return (r.left - row.getBoundingClientRect().left + r.width / 2) / w * 100; };
    if (busPos.key !== key) busPos = { key, idx, from: idx, t0: 0 };
    else if (busPos.idx !== idx) busPos = { key, idx, from: busPos.idx, t0: performance.now() };
    bus.style.left = at(idx) + "%";
    const e = performance.now() - busPos.t0, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!busPos.t0 || e >= BUS_DRIVE_MS || reduce || !bus.animate) return;
    const dx = (at(busPos.from) - at(idx)) / 100 * w;
    // anfahren, rollen, bremsen; dabei leicht schaukeln und eine kleine Staubwolke hinter sich lassen
    bus.animate([{ transform: `translateX(calc(-50% + ${dx}px))` }, { transform: "translateX(-50%)" }],
      { duration: BUS_DRIVE_MS, easing: "cubic-bezier(.55, 0, .3, 1)", fill: "backwards" }).currentTime = e;
    bus.firstElementChild.animate([{ transform: "none" }, { transform: "translateY(-2px) rotate(-3deg)", offset: .15 }, { transform: "translateY(0) rotate(1deg)", offset: .35 },
      { transform: "translateY(-2px) rotate(-2deg)", offset: .55 }, { transform: "translateY(0) rotate(2deg)", offset: .82 }, { transform: "rotate(-1deg)", offset: .92 }, { transform: "none" }],
      { duration: BUS_DRIVE_MS, easing: "ease-in-out" }).currentTime = e;
    const puff = document.createElement("i"); puff.className = "bb-puff"; puff.textContent = "💨";
    puff.style.left = `calc(${at(busPos.from)}% - 18px)`; row.appendChild(puff);
    puff.animate([{ opacity: 0, transform: "translateX(0) scale(.6)" }, { opacity: .9, offset: .15 }, { opacity: 0, transform: "translateX(-14px) scale(1.2)" }],
      { duration: 900, easing: "ease-out", fill: "forwards" }).currentTime = e;
  }
  const rk2 = (id) => ["7", "8", "9", "10", "U", "O", "K", "A"].indexOf(id.split("-")[1]);
  const BUS_VAL = { 7: "Sieben", 8: "Acht", 9: "Neun", 10: "Zehner", U: "Unter", O: "Ober", K: "König", A: "Ass" };
  // Busfahrt – alle im selben Bus: oben die fünf Stationen, darunter je ein Kartenfeld; an jeder Station wird eine Karte
  // für alle aufgedeckt. Darunter Frage und Antworten; rechts (am Handy darunter) die Mitfahrer mit ihrem Fortschritt.
  function busMainHtml(v, st, colorOf, nameOf, readyBtn) {
    const gk = st.gid + ":bus:" + st.round, seated = st.seats.includes(G.myId), me = seated ? st.status[G.myId] : null;
    const rankOfId = (c) => c.split("-")[1], end = st.step === "roundEnd";
    let flips = 0;
    // dein Unfall: an welcher Station, wie viel weg ist; Effekte erst, wenn die Karte umgedreht ist
    const myReach = seated ? (st.reach || {})[G.myId] || 0 : 0, myRes = st.step === "show" && st.res && seated ? st.res[G.myId] : null;
    const myLost = st.stations.slice(0, myReach).reduce((a, b) => a + b, 0);
    const crashNow = myRes && !myRes.out && !myRes.ok;
    const fxBad = crashNow ? kgAnim(`${gk}:bad:${myReach}`, 1150, 600) : null, fxBoom = crashNow ? kgAnim(`${gk}:boom:${myReach}`, 1150, 2600) : null;
    // die gemeinsamen Karten in fünf Feldern; die gerade aufgedeckte dreht sich um
    const cards = st.cards || [];
    const slots = Array.from({ length: 5 }, (_, i) => { const c = cards[i];
      if (!c) return `<div class="bb-slot ${!end && i === cards.length && i === st.q && st.seats.some((id) => st.status[id] === "ride") ? "cur" : ""}"></div>`;
      const a = i === cards.length - 1 && st.step === "show" ? kgAnim(`${gk}:c:${i}`, 150, 1000) : null;
      if (a && a.first) flips++;
      const bad = seated && me === "crash" && i === myReach;
      return `<div class="bb-slot full ${bad ? "crash" : ""} ${bad && fxBad ? "fx" : ""}" ${bad && fxBad ? `style="--d:${fxBad.d}ms"` : ""}>${kgCard(c, "bb", "", a ? "flip" : "", a ? a.d : 0)}</div>`; }).join("");
    // Stationen aus deiner Sicht: geschafft (grün ✓), Unfall (rot ✕), ausgestiegen (gelb 🚏), danach ohne dich (blass);
    // wer zuschaut, sieht die Fahrt des Busses
    const stops = st.stations.map((p, i) => {
      let cls;
      if (!seated || me === "ride") cls = i < st.q || end ? "past" : i === st.q ? "cur" : "";
      else if (me === "done") cls = "past";
      else cls = i < myReach ? "past" : i === myReach ? (me === "crash" ? "crash" : "exit") : "gone";
      const late = (cls === "crash" && fxBad) ? `style="--d:${fxBad.d}ms"` : "";
      return `<div class="bb-stop ${cls} ${late ? "fx" : ""}" ${late}><small>Station ${i + 1}</small><b>${cls === "crash" ? "✕" : cls === "exit" ? "🚏" : `+${p}`}</b></div>`; }).join("");
    const pot = seated ? st.pot[G.myId] || 0 : 0;
    const potBox = !seated ? "" : me === "ride" ? `<div class="bb-pot"><small>Topf</small><b>${pot}</b></div>`
      : me === "crash" ? `<div class="bb-pot lost ${fxBad ? "kg-late" : ""}" ${fxBad ? `style="--d:${fxBad.d}ms"` : ""}><small>Topf weg</small><b>${myLost ? `<s>${myLost}</s>` : "0"}</b></div>`
      : `<div class="bb-pot safe"><small>Gesichert</small><b>+${st.gain[G.myId] || 0}</b></div>`;
    // Unfall-Einblendung: groß über der Kartenreihe, sobald die Karte umgedreht ist (läuft beim Neuzeichnen weiter)
    const boom = fxBoom ? `<div class="bb-boom" style="--d:${fxBoom.d}ms"><b>💥 Unfall!</b><span>${myLost ? `Dein Topf (${myLost}) ist weg` : "Falsch getippt"}</span></div>` : "";
    const track = `<div class="bb-track ${seated ? "" : "watch"}"><div class="bb-stops">${stops}<i class="bb-bus" aria-hidden="true" data-i="${end ? Math.max(0, cards.length - 1) : Math.min(st.q, 4)}" data-k="${gk}"><span>🚌</span></i></div><div class="bb-slots">${slots}</div>${potBox}${boom}</div>`;

    let body;
    if (end) {
      const rows = st.seats.slice().sort((a, b) => st.gain[b] - st.gain[a]).map((id) => `<div class="kg-res ${st.gain[id] ? "win" : "bust"}" style="--pc:${colorOf(id)}"><span class="kg-rname"><span class="pdot"></span>${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</span>
          <span class="muted small">${st.status[id] === "crash" ? "💥 verunglückt" : st.status[id] === "done" ? "🏁 alle 5 Stationen!" : "🚏 ausgestiegen"}</span><span></span><b class="qb-plus">+${st.gain[id]}</b></div>`).join("");
      // was dir passiert ist, bleibt über der Rundenwertung stehen (schmal), damit man es nicht verpasst
      const mineLine = !seated ? "" : me === "crash" ? `<div class="bb-note-box bad slim"><b>💥 Unfall an Station ${myReach + 1}</b><span>${myLost ? `dein Topf (${myLost}) ist weg` : "keine Punkte in dieser Runde"}</span></div>`
        : me === "out" ? `<div class="bb-note-box safe slim"><b>🚏 Ausgestiegen an Station ${myReach + 1}</b><span><b>${st.gain[G.myId]}</b> ${st.gain[G.myId] === 1 ? "Punkt" : "Punkte"} gesichert</span></div>`
        : me === "done" ? `<div class="bb-note-box safe slim"><b>🏁 Endstation!</b><span>alle 5 Stationen geschafft: <b>+${st.gain[G.myId]}</b></span></div>` : "";
      body = `${mineLine}<div class="kg-results bb-results ${st.seats.length > 3 ? "two" : ""}">${rows}</div>${readyBtn}`;
    } else {
      const q = st.question, h = cards, mine = busMine && busMine.gid === st.gid && busMine.q === st.q && busMine.r === st.round && st.guessed[G.myId] ? busMine.g : null;
      let act = "";
      if (st.step === "guess" && me === "ride") {
        // Antworten als kleine Karten aus dem eigenen Blatt: Bild (Beispielkarten, Pfeil, Farbsymbol oder Wert) + Beschriftung
        const mini = (id) => `<span class="bb-mini">${WCARDS.svg(id)}</span>`, dot = `<i class="bb-dot"></i>`;
        const [c0, c1] = [h[0], h[1]], lo = c0 && c1 ? (rk2(c0) <= rk2(c1) ? c0 : c1) : null, hi = lo ? (lo === c0 ? c1 : c0) : null;
        const face = (k, t) => {
          if (q.key === "figur") return k === "fig" ? [mini("herz-K") + mini("eichel-U"), "Figur", "Unter · Ober · König · Ass"] : [mini("laub-9") + mini("schelle-7"), "Zahl", "Sieben bis Zehner"];
          if (q.key === "hoeher") return k === "hoch" ? [`<i class="bb-arrow">▲</i>${mini(c0)}`, "Höher", `als ${BUS_VAL[rankOfId(c0)]}`] : [`${mini(c0)}<i class="bb-arrow dn">▼</i>`, "Tiefer", `als ${BUS_VAL[rankOfId(c0)]}`];
          if (q.key === "zwischen") return k === "in" ? [mini(lo) + dot + mini(hi), "Zwischen", `${BUS_VAL[rankOfId(lo)]} bis ${BUS_VAL[rankOfId(hi)]}`] : [dot + mini(lo) + mini(hi) + dot, "Außerhalb", "tiefer oder höher"];
          if (q.key === "suit") return [`<span class="bb-suit">${WCARDS.sym(k, 1)}</span>`, esc(t), ""];
          return ["", { 10: "10" }[k] || k, esc(t)];
        };
        act = `<div class="bb-act"><div class="bb-choices n${q.opts.length}">${q.opts.map(([k, t]) => { const [ill, b, sm] = face(k, t);
            return `<button type="button" class="bb-choice ${mine === k ? "on" : ""}" data-busg="${k}">${ill ? `<span class="bb-ill">${ill}</span>` : ""}<b>${b}</b>${sm ? `<small>${sm}</small>` : ""}</button>`; }).join("")}</div>
          ${st.q > 0 && pot > 0 ? `<button type="button" class="bb-halt ${mine === "_out" ? "on" : ""}" data-busg="_out"><span class="bb-knopf"><span>STOP</span></span>
            <span class="bb-htxt"><b>Aussteigen</b><small>${pot} ${pot === 1 ? "Punkt" : "Punkte"} sicher mitnehmen</small></span></button>` : ""}</div>
          <div class="bus-stakes bb-stakes">${mine ? `<span class="bs-done">${mine === "_out" ? "🚏 Du steigst aus" : "✓ Getippt"} – umentscheiden geht, bis alle dran sind</span>`
            : `<span class="bs-win">Richtig: +${q.pts}</span><span class="bs-lose">Falsch: ${pot ? `Topf (${pot}) weg` : "Bus verunglückt"}</span>`}</div>`;
      } else if (me === "crash") act = `<div class="bb-note-box bad ${fxBad ? "kg-late" : ""}" ${fxBad ? `style="--d:${fxBad.d}ms"` : ""}><b>💥 Unfall an Station ${myReach + 1}</b>
          <span>Falsch getippt – ${myLost ? `dein Topf (${myLost} ${myLost === 1 ? "Punkt" : "Punkte"}) ist weg` : "diese Runde gibt es keine Punkte"}. Du fährst nicht mehr mit und schaust zu, wie weit die anderen kommen.</span></div>`;
      else if (me === "out") act = `<div class="bb-note-box safe"><b>🚏 Ausgestiegen an Station ${myReach + 1}</b>
          <span><b>${st.gain[G.myId]}</b> ${st.gain[G.myId] === 1 ? "Punkt" : "Punkte"} sicher – schau zu, wie weit die anderen kommen.</span></div>`;
      else if (st.step === "show") act = `<p class="bb-state muted">Die Karte wird aufgedeckt …</p>`;
      else if (me === "done") act = `<p class="bb-state">🏁 Endstation! Du hast alle 5 Stationen geschafft: <b>+${st.gain[G.myId]}</b></p>`;
      // höher/tiefer und zwischen/außerhalb: Wertereihe als Zeile, deine Bezugskarten markiert
      const refs = st.q === 1 ? [h[0]] : st.q === 2 ? [h[0], h[1]] : [];
      const scale = (st.q === 1 || st.q === 2) && refs.every(Boolean) && me === "ride" ? `<div class="bb-scale" aria-label="Reihenfolge der Werte"><em>tief</em>${["7", "8", "9", "10", "U", "O", "K", "A"].map((r) =>
        `<span class="${refs.some((c) => rankOfId(c) === r) ? "ref" : ""}">${BUS_VAL[r]}</span>`).join("")}<em>hoch</em></div>` : "";
      body = `<div class="bb-question"><h3>${esc(q.text)}</h3>${(st.q === 1 || st.q === 2) && me === "ride" ? `<span class="bb-note">Gleich hoch zählt für dich</span>` : ""}</div>${scale}${act}`;
    }
    // Mitfahrer (auch du): Name, Status, Topf, Punkte und wie weit jeder mitgefahren ist (geschafft ✓, verunglückt ✕, ausgestiegen 🚏)
    const statusTxt = (id) => { const res = st.step === "show" && st.res ? st.res[id] : null;
      if (res) return `<span class="bus-badge ${res.out ? "good" : res.ok ? "ok" : "bad"} ${res.out ? "" : "kg-late"}" style="--d:1100ms">${res.out ? `🚏 steigt aus mit ${res.pts}` : res.ok ? `✓ +${res.pts}` : `💥 verunglückt${res.lost ? ` – ${res.lost} weg` : ""}`}</span>`;
      return `<span class="bb-st">${({ ride: st.step === "guess" ? (st.guessed[id] ? "✓ getippt" : "überlegt …") : "fährt", out: `🚏 ausgestiegen · +${st.gain[id]}`, crash: "💥 verunglückt", done: `🏁 Endstation · +${st.gain[id]}` })[st.status[id]]}</span>`; };
    const order = seated ? [G.myId, ...st.seats.filter((id) => id !== G.myId)] : st.seats;
    const riders = order.map((id) => `<div class="bb-rider st-${st.status[id]} ${id === G.myId ? "me" : ""}" style="--pc:${colorOf(id)}">
        <div class="bb-rhead"><span class="pdot"></span><b>${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</b>${statusTxt(id)}
          <span class="bb-rpot">${st.status[id] === "ride" && st.pot[id] ? `Topf ${st.pot[id]}` : ""}</span><span class="bb-rtotal">${st.total[id] || 0}</span></div>
        <div class="bb-rtrip">${Array.from({ length: 5 }, (_, i) => { const r = (st.reach || {})[id] || 0, s2 = st.status[id];
          const cls = i < r ? "ok" : i === r && s2 === "crash" ? "bad" : i === r && s2 === "out" ? "out" : i === r && s2 === "ride" && !end ? "cur" : "";
          return `<i class="${cls}">${cls === "ok" ? "✓" : cls === "bad" ? "✕" : cls === "out" ? "🚏" : ""}</i>`; }).join("")}</div></div>`).join("");
    if (flips) kgSound(flips, 200, 150);
    return `<div class="bb-layout"><div class="panel bb-board">${track}${body}</div><div class="panel bb-riders"><div class="game-label">Mitfahrer</div>${riders}</div></div>`;
  }


  return {
    get kgOutcomeDelay() { return kgOutcomeDelay; }, set kgOutcomeDelay(v) { kgOutcomeDelay = v; },
    renderKarten,
  };
});
