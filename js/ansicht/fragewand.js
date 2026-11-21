// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Fragewand ----------
  // Animationen nur für Neues (nicht nach Neuladen): Frage wächst aus dem Feld, Ergebnis kurz zeigen, dann dreht sich das Feld um.
  // Zeitbasiert, damit Neuzeichnen sie nur fortsetzt.
  const RES_MS = 4500, FLIP_MS = 600;
  let fwKey = null, fwOpenAt = { key: null, t: 0 }, fwRes = { n: null, t: 0 }, fwTimer = null, fwSent = null;
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function renderWand() {
    const v = G.view, st = v.wand;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me);
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const now = Date.now();
    // Ergebnis der letzten Frage: neu (nach dem ersten Zeichnen) → kurz zeigen; nach Neuladen nur still übernehmen
    if (st.last && fwRes.n !== st.last.n) fwRes = { n: st.last.n, t: fwRes.n === null && fwKey === null ? 0 : now };
    if (!st.last) fwRes = { n: 0, t: 0 };
    const resAge = fwRes.t ? now - fwRes.t : Infinity, resMs = st.last && st.last.checked ? 0 : RES_MS;
    const showRes = resAge < resMs && st.step !== "answer" && st.step !== "judge" && st.step !== "check";
    clearTimeout(fwTimer);
    if (showRes) fwTimer = setTimeout(() => { if (G.view && G.view.phase === "wand") renderWand(); }, resMs - resAge + 30);

    // Schlüssel: nur bei echten Änderungen neu zeichnen (Eingabe bleibt erhalten); sonst nur die Punkte-Chips
    const key = [v.code, st.round, st.step, st.cur ? st.cur.k + "/" + st.cur.r + (st.cur.appeal ? "E" : "") : "", showRes ? "res" : "", st.chooser,
      v.players.map((p) => p.id + (p.connected ? 1 : 0)).join(",")].join(":");
    const chips = () => st.seats.map((id) => `<span class="geo-score ${st.chooser === id && st.step === "pick" ? "fw-turn" : ""} ${st.cur && st.cur.by === id ? "fw-turn" : ""}" style="--pc:${colorOf(id)}"><span class="pdot"></span><span class="geo-score-name">${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}</span><b>${st.score[id] || 0}</b></span>`).join("");
    if (fwKey === key && app.querySelector(".fw-main")) { const c = app.querySelector(".fw-chips"); if (c) c.innerHTML = chips(); return; }
    const fresh = fwKey !== null;
    fwKey = key;

    // Tafel
    const open = st.board.reduce((n, col) => n + col.filter((c) => !c).length, 0);
    const left = st.step === "final" ? 0 : Math.max(0, Math.min(open, (st.turns || open) - st.round));
    const myPick = st.step === "pick" && st.chooser === me;
    const lastKR = st.last ? st.last.k + "/" + st.last.r : "";
    let board = st.cats.map((c) => `<div class="fw-cat"><span class="ico">${c.ico}</span><span class="nm">${esc(c.name)}</span></div>`).join("");
    st.pts.forEach((pt, r) => st.cats.forEach((c, k) => {
      const d = st.board[k][r], picked = st.cur && st.cur.k === k && st.cur.r === r;
      // gerade aufgelöst: Feld dreht sich erst um, wenn das Ergebnis verschwindet
      const flipNew = d && lastKR === k + "/" + r && fwRes.t && !reduce() && resAge < resMs + FLIP_MS;
      const back = d ? `<div class="fc back"><div>${d.ok ? `<div class="who" style="--pc:${colorOf(d.by)}"><i></i>${esc(nameOf(d.by))}</div>` : `<div class="who"><s>✗ ${esc(nameOf(d.by))}</s></div>`}<div class="ans">${esc(d.a)}</div></div></div>` : `<div class="fc back"></div>`;
      board += `<button class="fw-tile ${d ? "done" : ""} ${d && d.ok ? "got" : ""} ${picked ? "picked" : ""} ${flipNew ? "flip" : ""}" data-k="${k}" data-r="${r}"
        style="${d && d.ok ? `--pc:${colorOf(d.by)};` : ""}${flipNew ? `--fd:${resMs - resAge}ms;` : ""}" ${d || !myPick ? "disabled" : ""} aria-label="${esc(c.name)} für ${pt}">
        <div class="fc front">${pt}</div>${back}</button>`;
    }));

    // Karte über der Tafel: Frage, Urteil, Ergebnis oder Endstand
    let card = "";
    const head = (c, cat, pts, kind) => `<div class="fw-meta"><span>${cat.ico} ${esc(cat.name)}</span>${kind ? `<span class="tag-kind">${kind}</span>` : ""}<span class="pts">${pts}</span></div>
      <div class="fw-text">${esc(c)}</div>`;
    if (st.step === "answer" || st.step === "judge" || st.step === "check") {
      const c = st.cur, cat = st.cats[c.k], mine = c.by === me;
      // Öffnen-Animation nur für eine frisch gewählte Frage
      const ok = c.k + "/" + c.r + ":" + st.round;
      if (fwOpenAt.key !== ok) fwOpenAt = { key: ok, t: fresh && !reduce() ? now : 0 };
      const age = fwOpenAt.t ? now - fwOpenAt.t : 9999;
      const tile = [c.k, c.r], ox = ((tile[0] + .5) / st.cats.length * 100).toFixed(0) + "%", oy = ((tile[1] + 1.5) / (st.pts.length + 1) * 100).toFixed(0) + "%";
      let body = "";
      if (st.step === "answer") {
        if (mine) body = c.c ? `<div class="fw-opts">${c.c.map((o) => `<button class="btn ghost" data-fwopt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`
          : `<form class="fw-form"><input id="fw-in" autocomplete="off" autocapitalize="off" placeholder="Deine Antwort" maxlength="80"><button class="btn primary">Antworten</button></form>`;
        else body = `<div class="fw-who" style="--pc:${colorOf(c.by)}"><b>${esc(nameOf(c.by))}</b> antwortet …</div>${c.c ? `<div class="fw-opts watch">${c.c.map((o) => `<span class="fw-o">${esc(o)}</span>`).join("")}</div>` : ""}`;
        if (mine) body = `<div class="fw-who"><b>Du</b> antwortest</div>${body}<button class="fw-pass" id="fw-pass">Weiß ich nicht</button>`;
      } else if (st.step === "check") {
        // nicht erkannt: Lösung zeigen – der Antwortende tippt „Weiter“ oder legt Einspruch ein
        body = G.checkHtml({ given: c.given, solution: c.a, mine, who: nameOf(c.by), color: colorOf(c.by), appeal: c.judges.length > 0 });
      } else {
        const iJudge = c.judges.includes(me);
        body = `<div class="fw-judge">${c.appeal ? `<div class="fw-appeal">⚖️ ${mine ? "Dein Einspruch" : `Einspruch von ${esc(nameOf(c.by))}`} – zählt die Antwort doch?</div>` : ""}<div class="fw-line" style="--pc:${colorOf(c.by)}"><span class="pdot"></span><b>${esc(nameOf(c.by))}</b><span class="g">„${esc(c.given)}“</span></div>
          <div class="fw-right">Gesucht war: <b>${esc(c.a)}</b></div>
          ${iJudge ? `<div class="fw-jbtns"><button class="btn primary" data-fwjudge="1">✓ zählt</button><button class="btn ghost" data-fwjudge="0">✗ zählt nicht</button></div>`
            : `<div class="fw-who">${mine ? "Die anderen entscheiden, ob deine Antwort zählt …" : "Die anderen entscheiden …"}</div>`}</div>`;
      }
      card = `<div class="fw-card ${age < 450 ? "opening" : ""}" style="--ox:${ox};--oy:${oy};animation-delay:${-Math.min(age, 450)}ms">
        ${head(c.t, cat, c.pts, c.c ? "4 Antworten zur Auswahl" : "eintippen")}${body}</div>`;
    } else if (showRes) {
      const l = st.last, cat = st.cats[l.k];
      // Wertungskarte: große Plakette (+Punkte bzw. ✗), Frage, richtige Antwort, Stand; verschwindet von selbst (Balken)
      const mineR = l.by === me, who = mineR ? "dich" : esc(nameOf(l.by)), lane = st.seats.indexOf(l.by) >= st.seats.length / 2;
      const said = l.given ? `${mineR ? "du sagtest" : esc(nameOf(l.by)) + " sagte"} <span class="du-q">„${esc(l.given)}“</span>` : `${mineR ? "du wusstest" : esc(nameOf(l.by)) + " wusste"} es nicht`;
      const judged = l.judged ? (l.ok ? " · Einspruch anerkannt" : " · Einspruch abgelehnt") : "";
      const stand = st.seats.map((id) => `${id === me ? "Du" : esc(nameOf(id))} ${st.score[id] || 0}`).join(" · ");
      card = `<div class="du-score fw-score ${lane ? "from-r" : ""} ${l.ok ? "" : "lose"}" style="--pc:${l.ok ? colorOf(l.by) : "#8a7fb8"};--rms:${Math.max(0, resMs - resAge)}ms">
        <span class="du-plq ${String(l.pts).length > 1 ? "n2" : ""}">${l.ok ? "+" + l.pts : "✗"}</span>
        <h3>${l.ok ? (mineR ? `Richtig – ${l.pts} Punkte für dich!` : `${l.pts} Punkte für ${who}`) : mineR ? "Leider falsch" : `${esc(nameOf(l.by))} lag falsch`}</h3>
        <p>„${esc(l.t)}“${l.ok ? judged : ` – ${said}${judged}. Die ${l.pts} Punkte bekommt niemand.`}<br><span class="fw-sans">${esc(l.a)}</span></p>
        <div class="du-score-nb"><span class="du-stand">${stand}</span></div><span class="fw-sbar"><i></i></span></div>`;
    } else if (st.step === "final") {
      const rank = st.seats.slice().sort((a, b) => (st.score[b] || 0) - (st.score[a] || 0));
      const w = st.winners || [];
      card = `<div class="fw-card fw-end"><div class="trophy">🏆</div>
        <b class="fw-win">${w.map((id) => esc(nameOf(id))).join(" & ")} ${w.length > 1 ? "gewinnen" : "gewinnt"} mit ${st.score[w[0]] || 0} Punkten!</b>
        ${open ? `<div class="fw-who">Gleich viele Züge für alle – ${open} ${open === 1 ? "Feld bleibt" : "Felder bleiben"} offen.</div>` : ""}
        <div class="fw-res">${rank.map((id, i) => `<div class="fw-line" style="--pc:${colorOf(id)}"><span class="pdot"></span><b>${1 + rank.filter((x) => (st.score[x] || 0) > (st.score[id] || 0)).length}. ${esc(nameOf(id))}${id === me ? " <em>(du)</em>" : ""}</b><span class="g"></span><b>${st.score[id] || 0}</b></div>`).join("")}</div>
        ${v.qb ? "" : `<div class="banner-actions"><button id="fw-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div>`}</div>`;
    }

    // Zeile unter der Tafel: wer ist dran?
    const cp = v.players.find((p) => p.id === st.chooser);
    let line = "";
    if (st.step === "pick") line = myPick ? `<b>Du bist dran</b> – wähle ein Feld.` : `<b style="color:${colorOf(st.chooser)}">${esc(nameOf(st.chooser))}</b> wählt ein Feld …`;
    const skip = G.isHost && st.step !== "final" && ((st.step === "pick" && cp && !cp.connected) || (st.cur && !(v.players.find((p) => p.id === st.cur.by) || {}).connected))
      ? `<button id="fw-skip" class="btn ghost sm">${esc(nameOf(st.cur ? st.cur.by : st.chooser))} ist getrennt – überspringen</button>` : "";

    app.innerHTML = `
      <main class="screen game fw">
        <header class="top topbar">
          ${headBrandHtml("wand")}
          <div class="meta">${left} ${left === 1 ? "Zug" : "Züge"} übrig<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="fw-main">
          <div class="fw-chips geo-scores">${chips()}</div>
          <div class="fw-board-wrap ${card ? "has-card" : ""}">
            <div class="fw-board ${st.cats.length < 5 ? "narrow" : ""}" style="--cols:${st.cats.length}">${board}</div>
            ${card ? `<div class="fw-q">${card}</div>` : ""}
          </div>
          <div class="fw-status">${line} ${skip}</div>
          ${!seated ? `<p class="muted small">Du schaust zu.</p>` : ""}
        </section>
      </main>`;

    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#fw-restart", () => send({ type: "fwRestart" }));
    on("#fw-skip", () => send({ type: "fwSkip" }));
    on('[data-chk="appeal"]', () => once(() => send({ type: "fwAppeal" })));
    on('[data-chk="ok"]', () => once(() => send({ type: "fwContinue" })));
    const once = (fn) => { const k = st.round + ":" + st.step; if (fwSent === k) return; fwSent = k; fn(); };
    on("#fw-pass", () => once(() => send({ type: "fwAnswer", pass: true })));
    app.querySelectorAll(".fw-tile:not(:disabled)").forEach((b) => b.onclick = () => {
      if (window.S10Klang) window.S10Klang.play(sfx, (c, t) => { window.S10Klang.noise(c, t, 0.05, { type: "bandpass", freq: 1800, q: 1.2, peak: 0.12 }); window.S10Klang.tone(c, t, 0.12, { type: "triangle", f0: 660, f1: 990, peak: 0.06 }); });
      b.classList.add("picked"); send({ type: "fwPick", k: Number(b.dataset.k), r: Number(b.dataset.r) });
    });
    app.querySelectorAll("[data-fwopt]").forEach((b) => b.onclick = () => once(() => { b.classList.add("sel"); send({ type: "fwAnswer", text: b.dataset.fwopt }); }));
    app.querySelectorAll("[data-fwjudge]").forEach((b) => b.onclick = () => once(() => send({ type: "fwJudge", ok: b.dataset.fwjudge === "1" })));
    const form = app.querySelector(".fw-form");
    if (form) {
      const inp = form.querySelector("input");
      if (innerWidth > 640 || fresh) setTimeout(() => inp.focus(), 60);
      form.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return inp.focus(); once(() => { inp.disabled = true; form.querySelector("button").disabled = true; send({ type: "fwAnswer", text: t }); }); };
    }
  }

  return {
    renderWand,
  };
});
