// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, askConfirm, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Antwort sucht Frage ----------
  let fqRendered = null, fqTimer = null, fqSent = null, fqPick = null;
  function renderFrage() {
    const v = G.view, st = v.frage;
    if (!st) return;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const seated = st.seats.includes(G.myId), iAsk = st.asker === G.myId, iGuess = st.guesser === G.myId;
    const priv = iAsk && G.wattenPriv && G.wattenPriv.roundNo === st.round && (G.wattenPriv.li === st.li || (st.step === "write" && G.wattenPriv.options)) ? G.wattenPriv : null;
    const pickSel = fqPick && fqPick.round === st.round && fqPick.code === v.code ? fqPick.i : null;
    const endAt = st.deadlineIn ? Date.now() + st.deadlineIn : 0;
    clearInterval(fqTimer);
    if (endAt) fqTimer = setInterval(() => {
      const bar = app.querySelector(".du-time i"), txt = app.querySelector(".du-time b");
      if (!bar || G.view.phase !== "frage") return clearInterval(fqTimer);
      const left = Math.max(0, endAt - Date.now());
      bar.style.width = (100 * left / st.timerMs) + "%";
      txt.textContent = left >= 60000 ? Math.floor(left / 60000) + ":" + String(Math.floor(left / 1000) % 60).padStart(2, "0") + " min" : Math.ceil(left / 1000) + " s";
      bar.parentNode.classList.toggle("urgent", left < 10000);
      sfx.countdown("fq:" + v.code + ":" + st.round + ":" + st.step, left, (st.step === "write" || st.step === "judge" ? st.asker : st.step === "answer" ? st.guesser : null) === G.myId);
    }, 250);
    const key = [v.code, st.round, st.step, st.li, priv ? priv.answer + (priv.options ? "+" + priv.options.length : "") : "", st.question, st.guess, st.complaint ? st.complaint.state : "", st.result && st.result.voided].join(":");
    const activeId = st.step === "write" || st.step === "judge" ? st.asker : st.step === "answer" ? st.guesser : null;
    const players = () => st.seats.map((id) => {
      const ask = id === st.asker, dots = Array.from({ length: st.target }, (_, k) => `<i class="${k < st.score[id] ? "on" : ""}"></i>`).join("");
      return `<div class="fq-player ${activeId === id ? "active" : ""}" style="--pc:${colorOf(id)}">
        <div class="fq-ava">${esc((nameOf(id) || "?").charAt(0).toUpperCase())}</div>
        <div class="fq-pinfo"><div class="fq-pname">${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</div>
          <div class="fq-badge ${ask ? "ask" : "guess"}">${ask ? "✍️ fragt" : "💡 antwortet"}</div></div>
        <div class="fq-score"><b>${st.score[id]}</b><div class="fq-dots">${dots}</div></div></div>`;
    }).join("");
    if (fqRendered === key && app.querySelector(".fq-main")) { const sc = app.querySelector(".fq-players"); if (sc) sc.innerHTML = players(); return; }
    fqRendered = key;
    if (st.step === "reveal" || st.step === "final") fqSent = null; // Schutz gegen doppeltes Abschicken gilt nur innerhalb einer Runde
    const fmtLeft = (ms) => ms >= 60000 ? Math.floor(ms / 60000) + ":" + String(Math.floor(ms / 1000) % 60).padStart(2, "0") + " min" : Math.ceil(ms / 1000) + " s";
    const time = () => st.timerMs && st.deadlineIn ? `<div class="du-time"><i style="width:${100 * st.deadlineIn / st.timerMs}%"></i><b>${fmtLeft(st.deadlineIn)}</b></div>` : "";
    const stepNo = st.step === "write" ? 0 : st.step === "answer" || st.step === "judge" ? 1 : 2;
    const steps = `<ol class="fq-steps">${["Frage ausdenken", "Antworten", "Auflösung"].map((t, k) =>
      `<li class="${k < stepNo ? "done" : k === stepNo ? "on" : ""}"><span>${k < stepNo ? "✓" : k + 1}</span>${t}</li>`).join("")}</ol>`;
    const catTile = `<div class="fq-tile cat"><span>Kategorie</span><b>${esc(st.cat)}</b></div>`;
    const secret = (a) => `<div class="fq-tile secret"><span>Gesuchte Antwort</span><b>${esc(a)}</b>${iAsk && stepNo < 2 ? `<small>🤫 nur du siehst sie</small>` : ""}</div>`;
    const bubble = st.question ? `<div class="fq-bubble ${stepNo === 2 ? "small" : ""}" style="--pc:${colorOf(st.asker)}">
        <div class="fq-bubble-who"><i class="fq-mini" style="--pc:${colorOf(st.asker)}">${esc(nameOf(st.asker).charAt(0).toUpperCase())}</i>${iAsk ? "Deine Frage" : esc(nameOf(st.asker)) + " fragt"}${st.cat ? `<span class="fq-bubble-cat">${esc(st.cat)}</span>` : ""}</div>
        <div class="fq-bubble-q">${esc(st.question)}</div></div>` : "";
    const waiting = (id, text, icon) => `<div class="fq-wait"><div class="fq-wait-ico">${icon}</div><div><b style="color:${colorOf(id)}">${esc(nameOf(id))}</b> ${text}<span class="fq-dotsanim"><i></i><i></i><i></i></span></div></div>`;
    let body = "";
    if (st.step === "write") {
      const choose = iAsk && priv && priv.options;
      if (choose) body = `<div class="fq-task one">${catTile}</div>
        <p class="fq-choose-h"><b>Wähle eine Antwort</b> <span class="muted small">– zu der dir die gemeinste Frage einfällt · 🤫 nur du siehst sie</span></p>
        <div class="fq-choices">${priv.options.map((o, i) => `<button type="button" class="fq-choice ${pickSel === i ? "on" : ""}" data-fqpick="${i}"><b>${esc(o.answer)}</b></button>`).join("")}</div>
        ${time()}`;
      else if (iAsk) body = `<div class="fq-task">${catTile}${priv ? secret(priv.answer) : `<div class="fq-tile secret"><span>Gesuchte Antwort</span><b>…</b></div>`}</div>
        ${time()}`;
      if (iAsk) body += `
        <form class="fq-form" autocomplete="off"><label for="fq-q">Deine Frage</label>
          <textarea id="fq-q" rows="3" maxlength="300" placeholder="${choose ? (pickSel != null ? `Eine Frage, deren Antwort „${esc(priv.options[pickSel].answer)}“ ist …` : "Wähle oben zuerst eine Antwort …") : `Eine Frage, deren Antwort „${priv ? esc(priv.answer) : "…"}“ ist …`}"></textarea>
          <div class="fq-row"><button type="button" id="fq-pass" class="btn ghost">Passen</button><button class="btn primary">Frage stellen</button></div></form>
        <p class="muted small fq-hint">Die Frage soll in die Kategorie passen und eindeutig sein.<span class="fq-keys"> Enter schickt ab, Umschalt+Enter macht eine neue Zeile.</span></p>`;
      else body = `<div class="fq-task one">${catTile}</div>${time()}${waiting(st.asker, st.choices > 1 ? `wählt eine von ${st.choices} Antworten und denkt sich eine Frage aus` : "denkt sich eine Frage aus", "✍️")}`;
    } else if (st.step === "answer") {
      body = `${bubble}${time()}` + (iGuess
        ? `<form class="du-form fq-aform" autocomplete="off"><input id="fq-a" maxlength="80" placeholder="Deine Antwort …" enterkeyhint="send"><button class="btn primary">Antworten</button></form>`
        : `${iAsk && priv ? `<div class="fq-task one">${secret(priv.answer)}</div>` : ""}${waiting(st.guesser, "überlegt", "💡")}`);
    } else if (st.step === "judge") {
      body = `${bubble}<div class="fq-said"><span>${iGuess ? "Deine Antwort" : esc(nameOf(st.guesser)) + " antwortet"}</span><b>${esc(st.guess)}</b></div>
        <div class="banner judge du-judge">${iAsk ? `<div class="judge-ask">Gesuchte Antwort: <b>${priv ? esc(priv.answer) : "…"}</b> – zählt das?</div>
          <div class="banner-actions"><button class="btn primary" data-fqjudge="1">✓ Zählt</button><button class="btn ghost" data-fqjudge="0">✗ Zählt nicht</button></div>`
          : `<div class="muted small">Nicht wörtlich gleich – ${esc(nameOf(st.asker))} entscheidet, ob es zählt …</div>`}</div>`;
    } else {
      const r = st.result, iWon = !r.voided && r.winner === G.myId, cp = st.complaint;
      const gName = iGuess ? null : esc(nameOf(st.guesser)), A = iAsk ? null : esc(nameOf(st.asker));
      const reason = { right: gName ? `${gName} wusste die Antwort.` : "Du wusstest die Antwort.", wrong: gName ? `${gName} lag daneben.` : "Du lagst daneben.",
        time: gName ? `${gName} hat nicht rechtzeitig geantwortet.` : "Du hast nicht rechtzeitig geantwortet.",
        noq: A ? `${A} ist keine Frage eingefallen.` : "Dir ist keine Frage eingefallen.", pass: A ? `${A} hat gepasst.` : "Du hast gepasst." }[r.why];
      const ok = r.why === "right";
      body = `${bubble}<div class="fq-compare">
          <div class="fq-tile secret"><span>🎯 Gesuchte Antwort</span><b>${esc(st.answer)}</b></div>
          ${st.guess ? `<div class="fq-tile given ${ok ? "ok" : "bad"}"><span>💬 ${iGuess ? "Deine Antwort" : esc(nameOf(st.guesser)) + " sagte"}</span><b>${esc(st.guess)}</b><i class="fq-mark">${ok ? "✓" : "✗"}</i></div>`
            : `<div class="fq-tile given none"><span>💬 Antwort</span><b>—</b></div>`}</div>
        ${cp && cp.state === "open" ? `<div class="banner judge du-judge"><div class="judge-q">${iGuess ? "Du findest" : `<b>${esc(nameOf(st.guesser))}</b> findet`} die Frage unpassend.</div>
          ${iAsk ? `<div class="judge-ask">Passt die Frage nicht zur Antwort oder Kategorie, oder war sie nicht eindeutig? Dann zählt die Runde nicht.</div>
            <div class="banner-actions"><button class="btn primary" data-fqcomplaint="1">Stimmt – Runde zählt nicht</button><button class="btn ghost" data-fqcomplaint="0">Nein, die Frage war fair</button></div>`
            : `<div class="muted small">${esc(nameOf(st.asker))} entscheidet …</div>`}</div>` : ""}
        <div class="banner fq-result ${iWon ? "win" : seated && !r.voided ? "lose" : ""}">${st.step === "final" ? `<div class="trophy">🏆</div><b>${iWon ? "Du gewinnst" : esc(nameOf(r.winner)) + " gewinnt"} ${st.score[r.winner]} : ${st.score[st.seats.find((x) => x !== r.winner)]}!</b>`
          : r.voided ? `<b>Diese Runde zählt nicht</b>` : `<b>${iWon ? "Punkt für dich!" : "Punkt für " + esc(nameOf(r.winner))}</b>`}
          <div class="small">${r.voided ? `Beschwerde angenommen – die Frage war unpassend.` : reason}${cp && cp.state === "rejected" ? ` Beschwerde abgelehnt – ${esc(nameOf(st.asker))} fand die Frage fair.` : ""}</div>
          <div class="banner-actions">${iGuess && r.winner === st.asker && !r.voided && !cp ? `<button id="fq-complain" class="btn ghost">👎 Frage war unpassend</button>` : ""}
            ${cp && cp.state === "open" ? "" : st.step === "final" ? `<button id="fq-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
            : seated || G.isHost ? `<button id="fq-next" class="btn primary next-btn">Nächste Runde</button>` : ""}</div></div>`;
    }
    app.innerHTML = `
      <main class="screen game slf du fq">
        <header class="top topbar">
          ${headBrandHtml("frage")}
          <div class="meta">Runde ${st.round} · bis ${st.target}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="fq-main">
          <div class="fq-players">${players()}</div>
          ${steps}
          <div class="fq-stage">${st.step !== "write" ? `<div class="fq-catchip"><span>Kategorie</span>${esc(st.cat)}</div>` : ""}${body}</div>
          ${!seated ? `<p class="muted small du-watch">Du schaust zu – es spielen ${esc(nameOf(st.seats[0]))} und ${esc(nameOf(st.seats[1]))}.</p>` : ""}
        </section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#fq-next", () => send({ type: "fqNext" }));
    on("#fq-restart", () => send({ type: "fqRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-fqjudge]").forEach((b) => b.onclick = () => send({ type: "fqJudge", ok: b.dataset.fqjudge === "1" }));
    on("#fq-complain", () => send({ type: "fqComplain" }));
    on("#fq-pass", async () => {
      if (!(await askConfirm("Passen?", `Dann bekommt ${nameOf(st.guesser)} den Punkt.`, "Passen"))) return;
      send({ type: "fqPass", round: st.round });
    });
    app.querySelectorAll("[data-fqcomplaint]").forEach((b) => b.onclick = () => send({ type: "fqComplaint", ok: b.dataset.fqcomplaint === "1" }));
    // Auswahl der Antwort: nur lokal merken (Frage wird erst mit „Frage stellen“ verschickt)
    app.querySelectorAll("[data-fqpick]").forEach((b) => b.onclick = () => {
      const i = Number(b.dataset.fqpick); fqPick = { code: v.code, round: st.round, i };
      app.querySelectorAll("[data-fqpick]").forEach((x) => x.classList.toggle("on", x === b));
      const ta = app.querySelector("#fq-q"), o = priv && priv.options && priv.options[i];
      if (ta && o) { ta.placeholder = `Eine Frage, deren Antwort „${o.answer}“ ist …`; ta.focus(); }
    });
    const qf = app.querySelector(".fq-form");
    if (qf) {
      const ta = qf.querySelector("#fq-q");
      // Entwurf bleibt nur innerhalb derselben Runde erhalten (z. B. beim Neuzeichnen), danach ist das Feld leer
      const dKey = "s10-fq-draft", dId = [v.code, st.round, st.asker].join(":");
      try { const d = JSON.parse(sessionStorage.getItem(dKey) || "null"); if (d && d.id === dId) ta.value = d.text; else sessionStorage.removeItem(dKey); } catch (e) {}
      ta.oninput = () => { try { sessionStorage.setItem(dKey, JSON.stringify({ id: dId, text: ta.value })); } catch (e) {} };
      ta.focus();
      ta.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); qf.requestSubmit(); } };
      qf.onsubmit = (e) => {
        e.preventDefault(); const t = ta.value.trim(); if (!t) return;
        const k = "q" + st.round; if (fqSent === k) return; fqSent = k;
        try { sessionStorage.removeItem("s10-fq-draft"); } catch (e) {}
        const pk = fqPick && fqPick.round === st.round && fqPick.code === v.code ? fqPick.i : null; // aktuelle Wahl, nicht die vom Zeichnen
        if (priv && priv.options && pk == null) { const ch = app.querySelector(".fq-choices"); if (ch) { ch.classList.remove("shake"); void ch.offsetWidth; ch.classList.add("shake"); } fqSent = null; return; }
        send({ type: "fqQuestion", round: st.round, text: t, pick: pk });
      };
    }
    const af = app.querySelector(".du-form");
    if (af) {
      const inp = af.querySelector("#fq-a"); inp.focus();
      af.onsubmit = (e) => {
        e.preventDefault(); const t = inp.value.trim(); if (!t) return;
        const k = "a" + st.round; if (fqSent === k) return; fqSent = k;
        inp.disabled = true; send({ type: "fqGuess", round: st.round, text: t });
      };
    }
  }


  return {
    renderFrage,
  };
});
