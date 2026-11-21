// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Listen-Duell ----------
  let duRendered = null, duSent = null, duTimer = null;
  // Spalten am Computer: bis 16 Antworten zwei (große Felder), dann mehr – alle Felder gleich groß
  const duCols = (n) => n <= 16 ? 2 : n <= 24 ? 3 : 4;
  function renderDuell() {
    const v = G.view, st = v.duell;
    if (!st) return;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const seated = st.seats.includes(G.myId), opp = (id) => st.seats.find((x) => x !== id);
    const myTurn = st.step === "turn" && st.turn === G.myId;
    // Zeit: lokal weiterzählen
    const endAt = st.deadlineIn ? Date.now() + st.deadlineIn : 0;
    clearInterval(duTimer);
    if (endAt) duTimer = setInterval(() => {
      const bar = app.querySelector(".du-time i"), txt = app.querySelector(".du-time b");
      if (!bar || G.view.phase !== "duell") return clearInterval(duTimer);
      const left = Math.max(0, endAt - Date.now());
      bar.style.width = (100 * left / st.timerMs) + "%"; txt.textContent = Math.ceil(left / 1000) + " s";
      bar.parentNode.classList.toggle("urgent", left < 6000);
      sfx.countdown("du:" + v.code + ":" + st.round + ":" + st.turn + ":" + st.moves.length, left, st.step === "turn" && st.turn === G.myId);
    }, 200);
    const key = [v.code, st.round, st.step, st.turn, st.moves.length, st.judge ? st.judge.text : ""].join(":");
    // Duell-Arena: die beiden Spieler stehen sich links und rechts gegenüber, wer dran ist, leuchtet
    const side = (id) => { const on = st.step === "turn" && st.turn === id;
      return `<div class="du-side ${on ? "turn" : ""}" style="--pc:${colorOf(id)}"><span class="du-av">${esc((nameOf(id)[0] || "?").toUpperCase())}</span>
        <b class="du-nm">${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</b><span class="du-sc">${st.score[id]}<small>/${st.target}</small></span>
        <span class="du-tag">${on ? (id === G.myId ? "du bist dran" : "ist dran") : st.step === "turn" ? "wartet" : st.step === "judge" ? (opp(st.judge.by) === id ? "entscheidet" : "wartet") : st.result && !st.result.voided && st.result.winner === id ? "Punkt!" : "–"}</span></div>`; };
    if (duRendered === key && app.querySelector(".du-main")) { const a = app.querySelector(".du-sa"), b = app.querySelector(".du-sb"); if (a) a.innerHTML = side(st.seats[0]); if (b) b.innerHTML = side(st.seats[1]); return; }
    duRendered = key;
    const rows = st.items.map((it, i) => {
      const found = it.by != null;
      return `<li class="du-row ${found ? "found" : it.t ? "missed" : ""} ${st.judge && it.t === st.judge.t && !found ? "" : ""}" style="${found ? `--pc:${colorOf(it.by)}` : ""}">
        <span class="du-no">${i + 1}</span><span class="du-t">${it.t ? esc(it.t) : "?"}</span>${found ? `<span class="du-by" title="${esc(nameOf(it.by))}">${esc((nameOf(it.by)[0] || "?").toUpperCase())}</span>` : ""}</li>`;
    }).join("");
    const last = st.moves.slice(-1)[0];
    const why = { wrong: "gehört nicht dazu", dup: "wurde schon genannt", time: "", full: "" };
    let action = "";
    if (st.step === "turn") {
      action = myTurn
        ? `<form class="du-form" autocomplete="off"><input id="du-in" maxlength="60" placeholder="Deine Antwort …" enterkeyhint="send" autocapitalize="sentences"><button class="btn primary">Nennen</button></form>`
        : `<p class="du-wait"><b style="color:${colorOf(st.turn)}">${esc(nameOf(st.turn))}</b> ist dran …</p>`;
      if (st.timerMs) action = `<div class="du-time" style="--pc:${colorOf(st.turn)}"><i style="width:${100 * st.deadlineIn / st.timerMs}%"></i><b>${Math.ceil(st.deadlineIn / 1000)} s</b></div>` + action;
    } else if (st.step === "judge") {
      const j = st.judge, judge = opp(j.by) === G.myId;
      action = `<div class="banner judge du-judge"><div class="judge-q"><b>${esc(nameOf(j.by))}</b> sagt: „${esc(j.text)}“</div>
        ${judge ? `<div class="judge-ask">Meint ${esc(nameOf(j.by))} damit <b>${esc(j.t)}</b>? Zählt das?</div>
          <div class="banner-actions"><button class="btn primary" data-dujudge="1">✓ Zählt</button><button class="btn ghost" data-dujudge="0">✗ Zählt nicht</button></div>`
          : `<div class="muted small">Ähnlich wie eine Antwort auf der Liste – ${esc(nameOf(opp(j.by)))} entscheidet, ob es zählt …</div>`}</div>`;
    } else {
      const r = st.result, iWon = !r.voided && r.winner === G.myId, cp = st.complaint;
      const reason = r.why === "full" ? `Alle ${st.items.length} gefunden – ${esc(nameOf(r.winner))} hat die letzte genannt.`
        : r.why === "time" ? `Bei ${esc(nameOf(r.loser))} ist die Zeit abgelaufen.`
        : `${esc(nameOf(r.loser))}: „${esc(last ? last.text : "")}“ ${why[r.why]}.`;
      if (st.step === "roundEnd") action = `<div class="banner ${iWon ? "win" : seated ? "lose" : ""}"><b>Punkt für ${esc(nameOf(r.winner))}${iWon ? " – das bist du!" : ""}</b>
          <div class="small">${reason}</div>
          <div class="banner-actions">${seated || G.isHost ? `<button id="du-next" class="btn primary next-btn">Nächste Runde</button>` : ""}</div></div>`;
      else action = `<div class="banner win"><div class="trophy">🏆</div><b>${esc(nameOf(r.winner))} gewinnt ${st.score[r.winner]} : ${st.score[opp(r.winner)]}!</b>
          <div class="small">${reason}</div>
          <div class="banner-actions"><button id="du-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>`;
    }
    const log = st.moves.slice().reverse().slice(0, 4).map((m) => `<li style="--pc:${colorOf(m.by)}"><i class="pdot"></i>${esc(nameOf(m.by))}: ${m.text ? `„${esc(m.text)}“` : "keine Antwort"} ${m.ok ? "✓" : "✗"}</li>`).join("");
    app.innerHTML = `
      <main class="screen game slf du">
        <header class="top topbar">
          ${headBrandHtml("duell")}
          <div class="meta">Runde ${st.round} · bis ${st.target}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="du-main du-arena">
          <div class="du-sa">${side(st.seats[0])}</div><div class="du-sb">${side(st.seats[1])}</div>
          <div class="du-mid">
          <div class="du-title">${st.list.cat ? `<div class="du-cat">${esc(st.list.cat)}</div>` : ""}<h2>${esc(st.list.q)}</h2><div class="du-count">${st.items.filter((x) => x.by).length} von ${st.items.length} gefunden</div>${st.list.note ? `<div class="muted small">${esc(st.list.note)}</div>` : ""}</div>
          <div class="du-action">${action}</div>
          <ol class="du-list ${duCols(st.items.length) > 2 ? "many" : ""}" style="--cols:${duCols(st.items.length)};--rows:${Math.ceil(st.items.length / duCols(st.items.length))};--mcols:${st.items.length > 10 ? 2 : 1};--mrows:${Math.ceil(st.items.length / (st.items.length > 10 ? 2 : 1))}">${rows}</ol>
          ${log ? `<ul class="du-log">${log}</ul>` : ""}
          ${!seated ? `<p class="muted small du-watch">Du schaust zu – es spielen ${esc(nameOf(st.seats[0]))} und ${esc(nameOf(st.seats[1]))}.</p>` : ""}
          </div>
        </section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#du-next", () => send({ type: "duNext" }));
    on("#du-restart", () => send({ type: "duRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-dujudge]").forEach((b) => b.onclick = () => send({ type: "duJudge", ok: b.dataset.dujudge === "1" }));
    const form = app.querySelector(".du-form");
    if (form) {
      const inp = form.querySelector("#du-in");
      inp.focus();
      form.onsubmit = (e) => {
        e.preventDefault();
        const t = inp.value.trim(); if (!t) return;
        const k = st.round + ":" + st.moves.length; if (duSent === k) return; duSent = k; // nicht doppelt schicken
        inp.disabled = true; form.querySelector("button").disabled = true;
        send({ type: "duAnswer", round: st.round, text: t });
      };
    }
  }


  return {
    renderDuell,
  };
});
