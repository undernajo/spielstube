// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    SCH, WCARDS, app, askConfirm, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml,
    store, toast, topActionsHtml
  } = G;

  // ---------- Schnapsen ----------
  let xShown = { round: 0, n: 0 }, xHold = null, xFly = null, xLaid = null;
  // Nachziehen sichtbar machen: neue Karten fliegen vom Stapel in die Hand (nach der Stich-Pause)
  let xPrev = null, xDraw = { round: 0, cards: [], opp: 0 }, xPrevAtout = null;
  // Erklärung im rechten Rand: „Was jetzt?“-Tipp passend zur Lage + kurze Anleitung
  // Regeln: am Computer anfangs offen, am Handy zu (dort zählt der Spieltisch); danach gilt, was man selbst zuletzt gewählt hat
  const xhelpOpen = () => { const o = store.get("s10-xhelp-open"); return o === true || (o == null && innerWidth > 640); };
  function schHelpHtml(st, opt, myTurn) {
    const sn = (su) => SCH.SUIT_NAMES[su];
    let tip;
    if (st.step !== "play") tip = "Die Runde ist vorbei. Wer 7 Punkte hat, gewinnt – der andere bekommt ein Bummerl.";
    else if (!myTurn) tip = st.trick.length ? "Dein Gegner überlegt, welche Karte er wirft." : "Dein Gegner wirft aus.";
    else if (st.mustLead) tip = `Du hast angesagt – wirf jetzt König oder Ober in ${sn(st.mustLead)} aus.`;
    else if (st.trick.length) tip = st.strict ? "Farbzwang: gleiche Farbe werfen und wenn möglich höher, sonst mit Trumpf stechen." : "Freies Werfen: du darfst jede Karte werfen. Willst du den Stich, wirf eine höhere Karte derselben Farbe oder einen Trumpf.";
    else tip = (opt.ansage.length ? `Du hast König und Ober in ${opt.ansage.map(sn).join(" und ")} – sag ${opt.ansage.map((su) => su === st.trump ? 40 : 20).join(" bzw. ")} an! ` : "")
      + (opt.tausch ? "Mit dem Trumpf-Unter kannst du die aufgedeckte Trumpfkarte holen. " : "")
      + "Wirf eine Karte aus – ein hohes Ass oder Zehner bringt viele Augen, ein Trumpf sticht alles andere.";
    return `<div class="wmode xhelp"><div class="xtip"><b>Was jetzt?</b> ${esc(tip)}</div>
      <details ${xhelpOpen() ? "open" : ""}><summary>So geht Schnapsen</summary>
      <ol>
        <li><b>Ziel:</b> Als Erster <b>66 Augen</b> sammeln. Augen bringen die Karten in deinen Stichen: Ass 11 · Zehner 10 · König 4 · Ober 3 · Unter 2.</li>
        <li><b>Stich:</b> Einer wirft aus, der andere wirft eine Karte dazu. Es gewinnt die höhere Karte derselben Farbe – oder ein <b>Trumpf</b> (${esc(sn(st.trump))}). Der Gewinner wirft als Nächster aus.</li>
        <li><b>Nachziehen:</b> Nach jedem Stich ziehen beide eine Karte vom Stapel, der Gewinner zuerst. Solange der Stapel offen ist, darfst du <b>jede Karte</b> werfen.</li>
        <li><b>20 und 40:</b> Hast du König und Ober einer Farbe, sag sie beim Auswerfen an: 20 Augen, in Trumpf 40. Sie zählen ab deinem ersten Stich.</li>
        <li><b>Tauschen:</b> Mit dem Trumpf-Unter holst du dir die aufgedeckte Trumpfkarte.</li>
        <li><b>Zudrehen:</b> Du schließt den Stapel, wenn du glaubst, mit deinen Karten auf 66 zu kommen. Dann gilt – wie bei leerem Stapel – <b>Farbzwang</b>: Farbe bedienen und höher stechen, sonst trumpfen.</li>
        <li><b>Punkte:</b> 3 wenn der andere keinen Stich hat, 2 wenn er unter 33 Augen hat, sonst 1. Bei 7 Punkten ist die Partie aus – der Verlierer bekommt ein <b>Bummerl</b> (✕).</li>
        <li><b>Spielweise:</b> ${st.mode === "klassisch" ? "Klassisch – die Augen sind versteckt. Zähl mit und drück „Aus!“, sobald du 66 hast. Zu früh kostet die Runde." : "Gemütlich – die Augen stehen bei den Namen, bei 66 endet die Runde von selbst."}</li>
      </ol></details></div>`;
  }
  function renderSchnapsen() {
    const v = G.view, st = v.schnapsen;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me), opp = seated ? st.seats.find((x) => x !== me) : st.seats[1];
    const self = seated ? me : st.seats[0];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const priv = seated && G.wattenPriv && G.wattenPriv.roundNo === st.roundNo ? G.wattenPriv : null;
    const hand = priv ? priv.hand : [], legal = priv ? priv.legal : [], opt = priv ? priv.options : { ansage: [] };
    const sn = (su) => SCH.SUIT_NAMES[su];
    // fertigen Stich kurz in der Mitte zeigen
    const nTricks = st.seats.reduce((a, id) => a + st.tricks[id], 0);
    const laid = nTricks * st.seats.length + st.trick.length; // Karte auf dem Tisch: kurzes Klatschen (nicht nach Neuladen / neuer Runde)
    if (xLaid && xLaid.round === st.roundNo && laid > xLaid.n) sfx.lay();
    xLaid = { round: st.roundNo, n: laid };
    if (xShown.round !== st.roundNo) { xShown = { round: st.roundNo, n: nTricks }; xHold = null; }
    if (xHold && st.trick.length) { xShown.n = nTricks; xHold = null; sfx.sweep(); } // schnell weitergespielt: Stich trotzdem hörbar einsammeln
    if (nTricks > xShown.n && !xHold && st.lastTrick && !st.trick.length) {
      const held = xHold = { winner: st.lastTrick.winner, cards: st.lastTrick.cards }, hr = st.roundNo;
      // Stich in Ruhe zeigen, dann wandern die Karten zum Stapel des Gewinners
      setTimeout(() => {
        if (xHold !== held || xShown.round !== hr) return;
        const tr = app.querySelector(".wtrick");
        sfx.sweep(); // Stich wird eingesammelt
        xFly = { winner: held.winner, from: tr ? [...tr.querySelectorAll(".wcard")].map((c) => c.getBoundingClientRect()) : [] };
        xShown.n = nTricks; xHold = null; if (G.view && G.view.phase === "schnapsen") renderSchnapsen();
      }, 1800);
    }
    const shown = xHold ? xHold.cards : st.trick;
    const table = shown.length ? `<div class="wtrick">${shown.map((t) => `<div class="wplayed"><span class="muted small">${esc(nameOf(t.pid))}</span>${G.wCard(t.card)}</div>`).join("")}
        ${xHold ? `<p class="muted small wlast">Stich für ${xHold.winner === me ? "dich" : esc(nameOf(xHold.winner))}</p>` : ""}</div>`
      : `<div class="wtrick empty"><span class="muted">${st.step === "play" ? "Noch keine Karte gespielt" : ""}</span></div>`;
    const pile = (id, pos) => {
      let g = (st.won && st.won[id]) || []; if (xHold && xHold.winner === id) g = g.slice(0, -1);
      const openLast = !xHold && st.trick.length === 0 && st.lastTrick && st.lastTrick.winner === id;
      return `<div class="wpile ${pos}" data-pile="${id}">${g.map((cs, i) => `<div class="wpile-g ${i === g.length - 1 ? "newest" : ""}" style="--i:${i}">${cs.map((c) => openLast && i === g.length - 1 ? G.wCard(c, "xs") : `<div class="wcard xs back">${WCARDS.back()}</div>`).join("")}</div>`).join("")}</div>`;
    };
    // Talon mit Trumpf-Karte (links in der Mitte)
    const talon = `<div class="xtalon">${st.atout ? `<div class="xatout">${G.wCard(st.atout, "sm")}</div>` : ""}
        ${st.talon > (st.atout ? 1 : 0) ? `<div class="xstack ${st.closedBy ? "closed" : ""}">${G.wBack()}<span class="xcount">${st.talon - (st.atout ? 1 : 0)}</span></div>` : ""}
        ${st.closedBy ? `<span class="wcall">zugedreht</span>` : !st.talon ? `<span class="wcall">Stapel leer</span>` : ""}</div>`;
    const myTurn = st.turn === me;
    // gemütlich: Augen und bereits angesagte 20er/40er direkt beim Spieler
    // Augen nur im gemütlichen Modus; angesagte 20er/40er sieht jeder (sie werden ja laut angesagt)
    const augen = (id) => (st.points ? `<span class="wcall">${st.points[id]} Augen${st.pending && st.pending[id] ? ` (+${st.pending[id]} noch offen)` : ""}</span>` : "")
      + st.calls.filter((c) => c.pid === id).map((c) => `<span class="wcall xcallchip" title="${c.pts}er in ${sn(c.suit)}${c.pts === 40 ? " (Trumpf)" : ""}">${c.pts}er <span class="wsuit">${WCARDS.sym(c.suit, 1)}</span></span>`).join("");
    const combo = `<div class="wcombo" title="Trumpf ${sn(st.trump)}"><span class="wsuit big">${WCARDS.sym(st.trump, 1)}</span><b>Trumpf</b>
        <span class="wvalue">${st.strict ? "Farbzwang!" : "freies Werfen"}</span></div>`;
    const turnBadge = myTurn ? `<div class="wturn me">Du bist dran!</div>`
      : st.turn ? `<div class="wturn other">${esc(nameOf(st.turn))} ist dran …</div>` : "";
    // Knöpfe auf dem Spielfeld
    const btns = [];
    if (seated && st.step === "play") {
      opt.ansage.forEach((su) => btns.push(`<button class="btn primary" data-ansage="${su}">${su === st.trump ? 40 : 20} ansagen (${sn(su)})</button>`));
      if (opt.tausch) btns.push(`<button class="btn ghost" id="x-tausch">Trumpf-Unter tauschen</button>`);
      if (opt.zudrehen) btns.push(`<button class="btn ghost" id="x-zu">Zudrehen</button>`);
      if (opt.aus) btns.push(`<button class="btn ${priv && priv.myPoints >= 66 ? "primary" : "ghost"}" id="x-aus">Aus! (66)</button>`);
    }
    const decide = btns.length ? `<div class="wdecide wbidbox">${btns.join("")}</div>` : "";
    let action = "", hint = "";
    // Hinweise kommen aufs Spielfeld; der rechte Rand zeigt während des Spiels nur Punkte und Hilfe
    if (st.step === "play") {
      if (myTurn && st.mustLead) hint = `Wirf König oder Ober in ${sn(st.mustLead)} aus.`;
      else if (myTurn && st.strict && st.trick.length) hint = "<b>Farbzwang:</b> Farbe werfen und wenn möglich höher stechen, sonst trumpfen.";
    } else if (st.result) {
      const r = st.result, why = { aus: "mit 66 Augen", "letzter-stich": "mit dem letzten Stich", zugedreht: "nach dem Zudrehen", "zudrehen-misslungen": "– Zudrehen misslungen", "falsches-aus": "– falsches „Aus“" }[r.reason] || "";
      action = `<div class="banner ${r.winner === me ? "win" : ""}"><b>${esc(nameOf(r.winner))} gewinnt die Runde ${why}: +${r.points}</b>
        <div class="muted small">Augen: ${st.seats.map((id) => `${esc(nameOf(id))} ${r.augen[id]}`).join(" · ")}</div>
        ${st.step === "final" ? `<div style="margin-top:6px">🏆 <b>${esc(nameOf(st.winners[0]))} gewinnt – ${esc(nameOf(st.seats.find((x) => x !== st.winners[0])))} bekommt ein Bummerl!</b></div>` : ""}
        ${seated && st.handCount[me] ? `<div class="wshow">${st.shown[me] ? `<span class="muted small">Deine Karten sind aufgedeckt.</span>` : `<button id="x-show" class="btn ghost sm">Meine Karten zeigen</button>`}</div>` : ""}
        <div class="banner-actions">${st.step === "final"
          ? `<button id="x-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
          : seated ? G.nextBtnsHtml({ attr: 'id="x-next"', hostAttr: 'id="x-force"', label: "Nächste Runde", ready: !!st.ready[me], waiting: G.waitingNames(v, st.ready, st.seats, true) }) : ""}</div></div>`;
    }
    // Punkteblock: Punkte je Runde, Summe oben, Bummerl als Kreuzl
    const cols = [self, opp];
    const rows = st.history.map((h) => cols.map((id) => id === h.winner ? `<td>${h.points}</td>` : `<td class="wdash">–</td>`).join(""));
    const block = `<table class="wblock"><thead><tr>${cols.map((id) => `<th><div class="wgeber">${id === st.dealer ? "Geber" : ""}</div>
        <span class="wsum ${st.turn === id ? "dran" : ""}">${st.score[id]}</span>${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}
        <div class="wkreuz" title="Bummerl">${st.bummerl[id] ? "✕".repeat(Math.min(st.bummerl[id], 10)) : ""}</div></th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${r}</tr>`).join("") || `<tr><td colspan="2" class="muted small">noch keine Punkte</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2" class="muted small">bis ${st.target} Punkte · ✕ = Bummerl</td></tr></tfoot></table>`;
    const oppCards = st.reveal && st.reveal[opp] ? st.reveal[opp].map((c) => G.wCard(c, "sm")).join("") : Array.from({ length: st.handCount[opp] || 0 }, G.wBack).join("");
    // neu gezogene Karten merken (eigene und Anzahl beim Gegner)
    if (xDraw.round !== st.roundNo) xDraw = { round: st.roundNo, cards: [], opp: 0 };
    if (xPrev && xPrev.round === st.roundNo) {
      hand.filter((c) => !xPrev.cards.includes(c)).forEach((c) => { if (!xDraw.cards.includes(c)) xDraw.cards.push(c); });
      const oc = st.handCount[opp] || 0; if (oc > xPrev.opp) xDraw.opp += oc - xPrev.opp;
    }
    xPrev = { round: st.roundNo, cards: hand.slice(), opp: st.handCount[opp] || 0 };
    const waitDraw = !!xHold; // während der Stich noch in der Mitte liegt, bleiben neue Karten unsichtbar
    const myCards = !seated ? Array.from({ length: st.handCount[self] || 0 }, G.wBack).join("")
      : hand.map((c) => { const ok = myTurn && legal.includes(c); const d = xDraw.cards.includes(c);
          return G.wCard(c, (ok ? "play" : myTurn ? "dim" : "") + (d ? " drawn" : "") + (d && waitDraw ? " pre-draw" : ""), (ok ? `data-card="${c}" role="button" tabindex="0" aria-label="${esc(SCH.cardName(c))} spielen"` : "") + ` data-cid="${c}"`); }).join("");
    // Trumpf-Unter getauscht? Alte Position der Karte merken, damit sie sichtbar zum Trumpfplatz fliegen kann
    let xSwapFrom = null, xSwapBy = null;
    if (xPrevAtout && xPrevAtout.round === st.roundNo && st.atout && xPrevAtout.card && st.atout !== xPrevAtout.card) {
      const mineEl = app.querySelector(`.whand.mine [data-cid="${st.atout}"]`), oppEl = app.querySelector(".whand.opp");
      xSwapBy = mineEl ? me : opp;
      xSwapFrom = (mineEl || oppEl) ? (mineEl || oppEl).getBoundingClientRect() : null;
    }
    xPrevAtout = { round: st.roundNo, card: st.atout };
    app.innerHTML = `
      <main class="screen game slf geo watten">
        <header class="top topbar">
          ${headBrandHtml("schnapsen")}
          <div class="meta">Runde ${st.roundNo}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <div class="wlayout">
          <section class="wtable">
            <div class="wtop">${combo}${myTurn ? "" : turnBadge}</div>${pile(opp, "top")}${pile(self, "bottom")}${talon}
            <div class="wside"><span class="muted small wname">${esc(nameOf(opp))} ${augen(opp)}</span><div class="whand opp">${oppCards}</div></div>
            ${action && !xHold ? `<div class="wtrick wresult">${action}</div>` : table}
            ${myTurn ? turnBadge : ""}${hint ? `<p class="whint">${hint}</p>` : ""}${decide}
            <div class="wside"><span class="muted small wname">${seated ? "Deine Karten" : esc(nameOf(self))} ${augen(self)}</span><div class="whand mine">${myCards}</div></div>
          </section>
          <aside class="wpanel">
            <div class="geo-bar wblock-wrap">${G.scoreFold(block, `${esc(nameOf(self))}${self === me ? " <em>(du)</em>" : ""} <b>${st.score[self]}</b> : <b>${st.score[opp]}</b> ${esc(nameOf(opp))}<span class="muted"> · bis ${st.target}</span>`)}</div>
            ${schHelpHtml(st, opt, myTurn)}
          </aside>
        </div>
      </main>`;
    G.bindScoreFold();
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    G.stackHands();
    if (xSwapFrom) { // Trumpf-Unter fliegt aus der Hand an den Trumpfplatz unter dem Stapel
      const el = app.querySelector(".xatout .wcard");
      if (el && el.animate) {
        const t = el.getBoundingClientRect();
        const dx = xSwapFrom.left + xSwapFrom.width / 2 - (t.left + t.width / 2), dy = xSwapFrom.top + xSwapFrom.height / 2 - (t.top + t.height / 2);
        el.animate([{ transform: `translate(${dx}px, ${dy}px) rotate(-90deg) scale(1.3)` }, { transform: "translate(0, 0) rotate(0) scale(1)" }],
          { duration: 700, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
      }
      toast(xSwapBy === me ? "Getauscht: Dein Trumpf-Unter liegt jetzt unter dem Stapel." : `${nameOf(xSwapBy)} hat mit dem Trumpf-Unter getauscht.`, "info");
    }
    if (xFly) { // Stichkarten von der Mitte zum Stapel fliegen lassen
      const cards = [...app.querySelectorAll(`[data-pile="${xFly.winner}"] .wpile-g.newest .wcard`)];
      cards.forEach((el, i) => {
        const f = xFly.from[i]; if (!f || !el.animate) return;
        const t = el.getBoundingClientRect();
        el.animate([{ transform: `translate(${f.left - t.left}px, ${f.top - t.top}px) scale(${f.width / t.width})`, transformOrigin: "top left" },
          { transform: "translate(0, 0) scale(1)", transformOrigin: "top left" }], { duration: 600, delay: i * 80, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" });
      });
      xFly = null;
    }
    if (!waitDraw && (xDraw.cards.length || xDraw.opp)) {
      const src = app.querySelector(".xstack .wcard, .xatout .wcard, .xtalon");
      const from = src ? src.getBoundingClientRect() : null;
      const targets = [...xDraw.cards.map((c) => app.querySelector(`.whand.mine [data-cid="${c}"]`)),
        ...[...app.querySelectorAll(".whand.opp .wcard")].slice(-xDraw.opp)].filter(Boolean);
      targets.forEach((el, i) => {
        if (!from || !el.animate) return;
        const to = el.getBoundingClientRect();
        const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
        const z = el.style.zIndex; el.style.zIndex = "50"; // nur während des Flugs ganz oben
        const an = el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.55) rotate(-8deg)`, opacity: .6 }, { transform: "translate(0, 0) scale(1) rotate(0)", opacity: 1 }],
          { duration: 650, delay: i * 180, easing: "cubic-bezier(.25,.8,.3,1)", fill: "backwards" });
        an.onfinish = an.oncancel = () => { el.style.zIndex = z; };
      });
      xDraw = { round: st.roundNo, cards: [], opp: 0 };
    }
    const hd = app.querySelector(".xhelp details");
    if (hd) hd.ontoggle = () => store.set("s10-xhelp-open", hd.open);
    on("#x-tausch", () => send({ type: "xTausch" }));
    on("#x-zu", async () => { if (await askConfirm("Zudrehen?", "Ab jetzt gilt Farbzwang. Schaffst du keine 66 Augen, bekommt dein Gegner die Punkte.", "Zudrehen")) send({ type: "xZudrehen" }); });
    on("#x-aus", async () => { if (await askConfirm("„Aus!“ sagen?", "Hast du schon 66 Augen? Wenn nicht, verlierst du die Runde.", "Aus!")) send({ type: "xAus" }); });
    on("#x-show", () => send({ type: "xShow" }));
    on("#x-next", () => send({ type: "xNext" }));
    on("#x-force", () => send({ type: "xNext", force: true }));
    on("#x-restart", () => send({ type: "xRestart" }));
    app.querySelectorAll("[data-ansage]").forEach((b) => b.onclick = () => send({ type: "xAnsage", suit: b.dataset.ansage }));
    app.querySelectorAll("[data-card]").forEach((el) => {
      const go = () => { el.classList.add("going"); send({ type: "xPlay", card: el.dataset.card }); };
      el.onclick = go; el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
  }


  return {
    renderSchnapsen,
  };
});
