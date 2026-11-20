// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, WAT, WCARDS, app, askConfirm, esc, headBrandHtml, invite, leave, send, sfx,
    statusBarHtml, store, topActionsHtml
  } = G;

  // ---------- Watten ----------
  const wCard = (id, extra = "", attrs = "") => `<div class="wcard ${extra}" ${attrs}>${WCARDS.svg(id)}</div>`;
  const wBack = () => `<div class="wcard back">${WCARDS.back()}</div>`;
  const wSuitIcon = (suit) => `<span class="wsuit">${WCARDS.sym(suit, 1)}</span>`;
  // Stich-Animation: fertiger Stich bleibt kurz in der Mitte, dann wandern die Karten zum Stapel des Gewinners
  let wShown = { round: 0, n: 0 }, wHold = null, wFly = null, wLaid = null;
  // Kurzinfo zum Spielmodus im rechten Rand
  function wattenModeHtml(st) {
    const tr = st.weliMode === "trumpf";
    return `<details class="wmode" ${store.get("s10-wmode-open") === true ? "open" : ""}><summary>Spielmodus: Weli ist ${tr ? "kleinster Trumpf" : "kleinste Schelle"} · bis ${st.target}</summary>
      <ul>
        <li><b>Rangfolge:</b> Guter → Rechter → andere Schläge → Trümpfe → ausgeworfene Farbe.</li>
        <li><b>Guter:</b> Trumpf einen Rang über dem Schlag. Beim Ass: ${tr ? "die Trumpf-Sieben" : "die Trumpf-Sieben, bei Trumpf Schelle der Weli"}.</li>
        <li><b>Weli</b> ${tr ? "zählt immer als kleinster Trumpf (muss beim Trumpf zugeben mitgegeben werden)" : "ist eine Schell-Sechs, nur Trumpf wenn Schelle Trumpf ist"}.
          Als Schlag: ${tr ? "beste Karte, kein Guter" : "der Rechte, Guter ist die Trumpf-Sieben"}.</li>
        <li><b>Trumpf zugeben:</b> Wird Trumpf ausgeworfen (nicht der Gute), muss man Trumpf geben oder stechen.</li>
        <li><b>Punkte:</b> 2, Bieten +1 (abgelehnt = bisheriger Wert). Gestrichen ab ${st.target - 2}: kein Bieten; bei mind. 4 Rückstand des anderen gehen 4 – halten oder gehen (Gegner +2).</li>
      </ul></details>`;
  }
  // Handy: Punkteblock zugeklappt, sichtbar bleibt eine Zeile „Bert 3 : 5 Anna · bis 15“ (antippen = ganzer Block)
  let scoreOpen = false;
  function scoreFold(block, line) {
    if (innerWidth > 640) return block;
    return `<details class="wfold" ${scoreOpen ? "open" : ""}><summary>${line}</summary>${block}</details>`;
  }
  function bindScoreFold() {
    const d = G.app.querySelector(".wfold");
    if (d) d.ontoggle = () => { scoreOpen = d.open; };
  }
  function renderWatten() {
    const v = G.view, st = v.watten;
    if (!st) return;
    const nTricks = st.seats.reduce((a, id) => a + st.tricks[id], 0);
    const laid = nTricks * st.seats.length + st.trick.length; // Karte auf dem Tisch: kurzes Klatschen (nicht nach Neuladen / neuer Runde)
    if (wLaid && wLaid.round === st.roundNo && laid > wLaid.n) sfx.lay();
    wLaid = { round: st.roundNo, n: laid };
    if (wShown.round !== st.roundNo) { wShown = { round: st.roundNo, n: nTricks }; wHold = null; }
    if (wHold && st.trick.length) { wShown.n = nTricks; wHold = null; sfx.sweep(); } // neue Karte liegt: alten Stich nicht mehr zeigen
    if (nTricks > wShown.n && !wHold && st.lastTrick && !st.trick.length) {
      wHold = { winner: st.lastTrick.winner, cards: st.lastTrick.cards };
      const held = wHold, heldRound = st.roundNo;
      setTimeout(() => {
        if (wHold !== held || wShown.round !== heldRound) return; // inzwischen neue Runde
        const tr = app.querySelector(".wtrick");
        sfx.sweep(); // Stich wird eingesammelt
        wFly = { winner: held.winner, from: tr ? [...tr.querySelectorAll(".wcard")].map((c) => c.getBoundingClientRect()) : [] };
        wShown.n = nTricks; wHold = null; if (G.view && G.view.phase === "watten") renderWatten();
      }, 1800); // wie beim Schnapsen: Stich in Ruhe zeigen
    }
    const me = G.myId, seated = st.seats.includes(me), opp = seated ? st.seats.find((x) => x !== me) : st.seats[1];
    const self = seated ? me : st.seats[0];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const priv = seated && G.wattenPriv && G.wattenPriv.roundNo === st.roundNo ? G.wattenPriv : null;
    const hand = priv ? priv.hand : [], legal = priv ? priv.legal : [];
    const rankName = (r) => WAT.RANK_NAMES[r], suitName = (s) => WAT.SUIT_NAMES[s];
    // Wattblock: je Spieler eine Spalte, pro Runde die gewonnenen Punkte (die Summe steht oben neben dem Namen).
    // Wer gestrichen ist (2 vor dem Ziel), bekommt einen Strich unter die Zahl. Oben: gewonnene Partien als Kreuzl.
    const wattBlock = () => {
      const cols = [self, opp], run = { [self]: 0, [opp]: 0 }, struck = { [self]: false, [opp]: false };
      const rows = st.history.map((h) => {
        run[h.winner] += h.points;
        const strich = !struck[h.winner] && run[h.winner] >= st.target - 2 && run[h.winner] < st.target;
        if (strich) struck[h.winner] = true;
        return cols.map((id) => id === h.winner
          ? `<td class="${strich ? "strich" : ""} ${run[id] >= st.target ? "sieg" : ""}" title="+${h.points}${h.reason === "aufgegeben" ? " (gegangen)" : h.reason === "abgelehnt" ? " (Bieten abgelehnt)" : ""}">${h.points}</td>`
          : `<td class="wdash">–</td>`).join("");
      });
      const tally = (n) => n ? "✕".repeat(Math.min(n, 10)) + (n > 10 ? " " + n : "") : "";
      return `<table class="wblock">
        <thead><tr>${cols.map((id) => `<th style="--pc:${colorOf(id)}"><div class="wgeber">${id === st.dealer ? "Geber" : ""}</div><span class="wsum ${st.turn === id ? "dran" : ""}">${st.scores[id]}</span>${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}
          ${st.gestrichen[id] ? `<span class="wtag">gestrichen</span>` : ""}
          <div class="wkreuz" title="gewonnene Partien">${tally((st.games || {})[id] || 0)}</div></th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${r}</tr>`).join("") || `<tr><td colspan="2" class="muted small">noch keine Punkte</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2" class="muted small">bis ${st.target} · gestrichen ab ${st.target - 2}</td></tr></tfoot></table>`;
    };
    const scorePill = (id) => `<span class="geo-score ${st.turn === id ? "done" : ""}" style="--pc:${colorOf(id)}"><span class="pdot"></span>
        <span class="geo-score-name">${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}</span><b>${st.scores[id]}</b><span class="geo-mark">/ ${st.target}</span>
        ${st.gestrichen[id] ? `<span class="wtag">gestrichen</span>` : ""}${id === st.dealer ? `<span class="wtag dim">Geber</span>` : ""}</span>`;
    const myMove = (st.step === "play" && st.mustDecide === me) || (st.step === "schlag" && st.vorhand === me) || (st.step === "trumpf" && st.dealer === me) ||
      (st.step === "play" && (st.bid ? st.bid.by !== me && seated : st.turn === me));
    const whoMoves = st.step === "schlag" ? st.vorhand : st.step === "trumpf" ? st.dealer : st.step === "play" ? (st.bid ? st.seats.find((x) => x !== st.bid.by) : st.turn) : null;
    // „Du bist dran“ unten rechts (bei den eigenen Karten), „… ist dran“ oben rechts (beim Gegner)
    const myLabel = st.step === "schlag" ? "Sag den Schlag an!" : st.step === "trumpf" ? "Sag den Trumpf an!" : st.mustDecide === me ? "Halten oder gehen?" : st.bid && st.bid.by !== me ? "Halten oder gehen?" : "Du bist dran!";
    const turnBadge = myMove ? `<div class="wturn me">${myLabel}</div>`
      : whoMoves ? `<div class="wturn other">${esc(nameOf(whoMoves))} ist dran …</div>` : "";
    const callTag = (id) => {
      if (id === st.vorhand && st.schlag) return `<span class="wcall">Schlag: <b>${rankName(st.schlag)}</b></span>`;
      if (id === st.dealer && st.trump) return `<span class="wcall">Trumpf: ${wSuitIcon(st.trump)} <b>${suitName(st.trump)}</b></span>`;
      if (id === st.vorhand && st.step === "schlag") return `<span class="wcall wait">sagt Schlag an …</span>`;
      if (id === st.dealer && st.step === "trumpf") return `<span class="wcall wait">sagt Trumpf an …</span>`;
      return "";
    };
    const tricksDots = (id) => `<span class="wdots">${[0, 1, 2].map((i) => `<i class="${i < st.tricks[id] ? "on" : ""}"></i>`).join("")}</span>`;
    // kompakt: Trumpf-Symbol und daneben der Wert des Schlags
    // Trumpf-Symbol mit Schlagwert sitzt auf dem Spielfeld (rechts, mittig neben dem Stich)
    const combo = st.schlag || st.trump ? `<div class="wcombo" title="${st.trump ? "Trumpf " + suitName(st.trump) : "Trumpf noch offen"}${st.schlag ? " · Schlag " + rankName(st.schlag) : ""}">
          ${st.trump ? `<span class="wsuit big">${WCARDS.sym(st.trump, 1)}</span>` : `<span class="wq">?</span>`}<b>${st.schlag ? rankName(st.schlag) : "?"}</b>
          <span class="wvalue">Es gehen <b>${st.value}</b></span></div>` : "";
    const ann = "";
    // Mitte: aktueller Stich, sonst kurz der letzte
    let table;
    const shownTrick = wHold ? wHold.cards : st.trick;
    if (shownTrick.length) table = `<div class="wtrick">${shownTrick.map((t) => `<div class="wplayed ${wHold && t.pid === wHold.winner ? "won" : ""}"><span class="muted small">${esc(nameOf(t.pid))}</span>${wCard(t.card)}</div>`).join("")}
        ${wHold ? `<p class="muted small wlast">Stich für ${wHold.winner === me ? "dich" : esc(nameOf(wHold.winner))}</p>` : ""}</div>`;
    else table = `<div class="wtrick empty"><span class="muted">${st.step === "play" ? "Noch keine Karte gespielt" : ""}</span></div>`;
    // Stiche-Stapel links: oben der Gegner, unten ich (während der Animation ohne den neuesten Stich)
    const pile = (id, pos) => {
      let groups = (st.won && st.won[id]) || [];
      if (wHold && wHold.winner === id) groups = groups.slice(0, -1);
      // Nur der zuletzt gemachte Stich bleibt offen – sobald die nächste Karte gespielt ist, wird er umgedreht
      const openLast = !wHold && st.trick.length === 0 && st.lastTrick && st.lastTrick.winner === id;
      return `<div class="wpile ${pos}" data-pile="${id}">${groups.map((g, i) => {
        const open = openLast && i === groups.length - 1;
        return `<div class="wpile-g ${i === groups.length - 1 ? "newest" : ""}" style="--i:${i}">${g.map((c) => open ? wCard(c, "xs") : `<div class="wcard xs back">${WCARDS.back()}</div>`).join("")}</div>`;
      }).join("")}</div>`;
    };
    // Aktionen
    let action = "", decide = "";
    // Hinweise fürs Spielfeld (über den eigenen Karten); der rechte Rand bleibt während des Spiels frei
    let hint = "";
    if (st.step === "schlag" && st.vorhand === me) hint = "Tippe auf eine deiner Karten – ihr Wert wird der Schlag.";
    if (st.step === "trumpf" && st.dealer === me) hint = `Tippe auf eine deiner Karten – ihre Farbe wird Trumpf (Schlag: ${rankName(st.schlag)}).`;
    if (st.step === "play") {
      // Halten-oder-gehen-Entscheidung kommt aufs Spielfeld (rechts unten)
      if (st.bid) {
        if (st.bid.by === me) hint = `Du hast ${st.bid.to} geboten – ${esc(nameOf(opp))} entscheidet …`;
        if (seated && st.bid.by !== me) decide = `<div class="wdecide"><p><b>${esc(nameOf(st.bid.by))} bietet ${st.bid.to}.</b></p>
            <button class="btn primary" id="w-hold">Halten (um ${st.bid.to})</button>
            <button class="btn ghost" id="w-fold">Gehen (${esc(nameOf(st.bid.by))} +${st.value})</button></div>`;
      } else if (st.mustDecide === me) {
        decide = `<div class="wdecide"><p><b>Du bist gestrichen – es gehen 4.</b></p>
            <button class="btn primary" id="w-hold4">Halten (um 4)</button>
            <button class="btn ghost" id="w-go">Gehen (${esc(nameOf(opp))} +2)</button></div>`;
      }
      else if (st.turn === me && st.follow === "pflicht") hint = `<b>Trumpf ausgeworfen:</b> Trumpf zugeben oder mit einem Schlag stechen${legal.length === hand.length ? " – du hast keinen, also freie Wahl" : ""}.`;
      else if (st.turn === me && st.follow === "guter") hint = "Der <b>Gute</b> wurde ausgeworfen – kein Trumpf-Zwang.";
      else if (st.mustDecide && st.mustDecide !== me) hint = `${esc(nameOf(st.mustDecide))} entscheidet: halten oder gehen …`;
      // Bieten (und ggf. Aufgeben) als Knöpfe auf dem Spielfeld rechts unten
      if (!decide && (st.canBid[me] || st.giveUpBy === me)) decide = `<div class="wdecide wbidbox">
          ${st.canBid[me] ? `<button class="btn primary" id="w-bid">${st.value + 1} bieten</button>` : ""}
          ${st.giveUpBy === me ? `<button class="btn ghost" id="w-giveup">Aufgeben (${esc(nameOf(opp))} +2)</button>` : ""}</div>`;
    } else if (st.step === "roundEnd" || st.step === "final") {
      const r = st.result, why = { stiche: "mit 3 Stichen", abgelehnt: "– Bieten abgelehnt", aufgegeben: "– der andere hat aufgegeben" }[r.reason] || "";
      action = `<div class="banner ${r.winner === me ? "win" : ""}"><b>${esc(nameOf(r.winner))} gewinnt die Runde ${why}: +${r.points}</b>
        ${st.step === "final" ? `<div style="margin-top:6px">🏆 <b>${esc(nameOf(st.winners[0]))} gewinnt die Partie!</b></div>` : ""}
        ${seated && st.handCount[me] ? `<div class="wshow">${st.shown && st.shown[me] ? `<span class="muted small">Deine Karten sind aufgedeckt.</span>` : `<button id="w-show" class="btn ghost sm">Meine Karten zeigen</button>`}</div>` : ""}
        <div class="banner-actions">${st.step === "final"
          ? `<button id="w-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
          : seated ? G.nextBtnsHtml({ attr: 'id="w-next"', hostAttr: 'id="w-force"', label: "Nächste Runde", ready: !!st.ready[me], waiting: G.waitingNames(v, st.ready, st.seats, true) }) : ""}</div></div>`;
    }
    const oppCards = st.reveal && st.reveal[opp] ? st.reveal[opp].map((c) => wCard(c, "sm")).join("") : Array.from({ length: st.handCount[opp] || 0 }, wBack).join("");
    const myCards = !seated ? (st.reveal && st.reveal[self] ? st.reveal[self].map((c) => wCard(c)).join("") : Array.from({ length: st.handCount[self] || 0 }, wBack).join(""))
      : hand.map((c) => {
          // Ansagen über die eigenen Karten: Schlag = Wert der Karte (nicht der Weli), Trumpf = Farbe der Karte
          if (st.step === "schlag" && st.vorhand === me) {
            const r = c.split("-")[1], ok = true; // auch der Weli darf Schlag sein
            return wCard(c, ok ? "play" : "dim", ok ? `data-schlag="${r}" role="button" tabindex="0" aria-label="Schlag ${rankName(r)} ansagen" title="Schlag: ${rankName(r)}"` : "");
          }
          if (st.step === "trumpf" && st.dealer === me) {
            const su = c.split("-")[0];
            return wCard(c, "play", `data-trumpf="${su}" role="button" tabindex="0" aria-label="Trumpf ${suitName(su)} ansagen" title="Trumpf: ${suitName(su)}"`);
          }
          const ok = st.step === "play" && !st.bid && st.turn === me && legal.includes(c);
          return wCard(c, (ok ? "play" : st.turn === me && st.step === "play" && !st.bid ? "dim" : "") + (c === st.guter ? " guter" : ""), ok ? `data-card="${c}" role="button" tabindex="0" aria-label="${esc(WAT.cardName(c))} spielen"` : "");
        }).join("");
    app.innerHTML = `
      <main class="screen game slf geo watten">
        <header class="top topbar">
          ${headBrandHtml("watten")}
          <div class="meta">Runde ${st.roundNo} · bis ${st.target}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <div class="wlayout">
          <section class="wtable">
            <div class="wtop">${combo}${myMove ? "" : turnBadge}</div>${pile(opp, "top")}${pile(self, "bottom")}
            <div class="wside"><span class="muted small wname">${esc(nameOf(opp))} ${tricksDots(opp)} ${callTag(opp)}</span><div class="whand opp">${oppCards}</div></div>
            ${table}
            ${myMove ? turnBadge : ""}${hint ? `<p class="whint">${hint}</p>` : ""}${decide}
            <div class="wside"><span class="muted small wname">${seated ? "Deine Karten" : esc(nameOf(self))} ${tricksDots(self)} ${callTag(self)}</span><div class="whand mine">${myCards}</div></div>
          </section>
          <aside class="wpanel">
            <div class="geo-bar wblock-wrap">${scoreFold(wattBlock(), `${esc(nameOf(self))}${self === me ? " <em>(du)</em>" : ""} <b>${st.scores[self]}</b> : <b>${st.scores[opp]}</b> ${esc(nameOf(opp))}<span class="muted"> · bis ${st.target}</span>`)}${ann}</div>
            <section class="waction">${action}</section>
            ${wattenModeHtml(st)}
          </aside>
        </div>
      </main>`;
    bindScoreFold();
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#w-bid", () => send({ type: "wBid" }));
    on("#w-hold", () => send({ type: "wBidAnswer", accept: true }));
    on("#w-fold", () => send({ type: "wBidAnswer", accept: false }));
    const md = app.querySelector(".wmode");
    if (md) md.ontoggle = () => store.set("s10-wmode-open", md.open);
    stackHands();
    on("#w-hold4", () => send({ type: "wHold" }));
    on("#w-go", () => send({ type: "wGiveUp" }));
    on("#w-giveup", async () => { if (await askConfirm("Wirklich aufgeben?", "Dein Gegner bekommt 2 Punkte.", "Aufgeben")) send({ type: "wGiveUp" }); });
    on("#w-show", () => send({ type: "wShow" }));
    on("#w-next", () => send({ type: "wNext" }));
    on("#w-force", () => send({ type: "wNext", force: true }));
    on("#w-restart", () => send({ type: "wRestart" }));
    const key = (el, fn) => { el.onclick = fn; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }; };
    app.querySelectorAll("[data-schlag]").forEach((b) => key(b, () => { b.classList.add("going"); send({ type: "wSchlag", rank: b.dataset.schlag }); }));
    app.querySelectorAll("[data-trumpf]").forEach((b) => key(b, () => { b.classList.add("going"); send({ type: "wTrumpf", suit: b.dataset.trumpf }); }));
    if (wFly) { // jede Stichkarte fliegt von ihrem Platz in der Mitte zum Stapel
      [...app.querySelectorAll(`[data-pile="${wFly.winner}"] .wpile-g.newest .wcard`)].forEach((el, i) => {
        const f = wFly.from[i]; if (!f || !el.animate) return;
        const t = el.getBoundingClientRect();
        el.animate([{ transform: `translate(${f.left - t.left}px, ${f.top - t.top}px) scale(${f.width / t.width})`, transformOrigin: "top left" },
          { transform: "translate(0, 0) scale(1)", transformOrigin: "top left" }], { duration: 600, delay: i * 80, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
      });
      wFly = null;
    }
    app.querySelectorAll("[data-card]").forEach((el) => {
      const go = () => { el.classList.add("going"); send({ type: "wPlay", card: el.dataset.card }); };
      el.onclick = go; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
  }

  // Handkarten fest von links nach rechts stapeln (links unten, rechts oben)
  function stackHands() {
    app.querySelectorAll(".whand").forEach((h) => [...h.children].forEach((el, i) => { el.style.position = "relative"; el.style.zIndex = String(i + 1); }));
  }

  return {
    bindScoreFold,
    renderWatten,
    scoreFold,
    stackHands,
    wBack,
    wCard,
  };
});
