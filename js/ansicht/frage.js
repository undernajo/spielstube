// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, askConfirm, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Antwort sucht Frage ----------
  let fqRendered = null, fqTimer = null, fqSent = null, fqPick = null;
  // Zeitring rechts oben in der Quizkarte (wie bei Schätzen & Co.); über einer Minute als „2:30“
  const FQ_RING = 2 * Math.PI * 31;
  const fqLeftTxt = (ms) => ms >= 60000 ? Math.floor(ms / 60000) + ":" + String(Math.floor(ms / 1000) % 60).padStart(2, "0") : String(Math.ceil(ms / 1000));
  function fqRingSet(el, ms, total) {
    const p = Math.max(0, Math.min(1, ms / total)), r1 = el.querySelector(".r1");
    el.style.setProperty("--rc", p > .5 ? "#7ee2b1" : p > .2 ? "#ffc83d" : "#ff7d8a");
    if (r1) r1.style.strokeDasharray = `${FQ_RING * p} ${FQ_RING}`;
    const b = el.querySelector("b"); if (b) { b.textContent = fqLeftTxt(ms); b.classList.toggle("long", ms >= 60000); }
    el.classList.toggle("urgent", ms <= 10000);
  }
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
      const ring = app.querySelector("#fq-ring");
      if (!ring || G.view.phase !== "frage") return clearInterval(fqTimer);
      const left = Math.max(0, endAt - Date.now());
      fqRingSet(ring, left, st.timerMs);
      sfx.countdown("fq:" + v.code + ":" + st.round + ":" + st.step, left, (st.step === "write" || st.step === "judge" ? st.asker : st.step === "answer" ? st.guesser : null) === G.myId);
    }, 250);
    const key = [v.code, st.round, st.step, st.li, priv ? priv.answer + (priv.options ? "+" + priv.options.length : "") : "", st.question, st.guess, st.complaint ? st.complaint.state : "", st.result && st.result.voided].join(":");
    const activeId = st.step === "write" || st.step === "judge" ? st.asker : st.step === "answer" || st.step === "check" ? st.guesser : null;
    const won = (id) => (st.step === "reveal" || st.step === "final") && st.result && !st.result.voided && st.result.winner === id;
    const side = (id) => { const on = activeId === id, ask = id === st.asker, role = ask ? "✍️ fragt" : "💡 antwortet", res = (st.step === "reveal" || st.step === "final") && st.result && !st.result.voided && !(st.complaint && st.complaint.state === "open");
      return `<div class="du-side ${on ? "turn" : ""} ${res ? (won(id) ? "won" : "dim") : ""}" style="--pc:${colorOf(id)}"><span class="du-av">${esc((nameOf(id)[0] || "?").toUpperCase())}</span>
        <b class="du-nm"><span class="fq-ri">${ask ? "✍️" : "💡"} </span>${esc(nameOf(id))}${id === G.myId ? " <em>(du)</em>" : ""}</b><span class="fq-role">${role}</span>
        <span class="du-sc">${st.score[id]}<small>/${st.target}</small></span>
        <span class="du-tag">${on ? (id === G.myId ? "du bist dran" : "ist dran") : res ? (won(id) ? "Punkt!" : "–") : "wartet"}</span></div>`; };
    if (fqRendered === key && app.querySelector(".fq-main")) { const a = app.querySelector(".du-sa"), b = app.querySelector(".du-sb"); if (a) a.innerHTML = side(st.seats[0]); if (b) b.innerHTML = side(st.seats[1]); return; }
    fqRendered = key;
    if (st.step === "reveal" || st.step === "final") fqSent = null; // Schutz gegen doppeltes Abschicken gilt nur innerhalb einer Runde

    const stepNo = st.step === "write" ? 0 : st.step === "answer" || st.step === "judge" || st.step === "check" ? 1 : 2;
    // Kopfzeile der Quizkarte: Symbol, Kategorie · Runde, Phase – rechts oben der Zeitring; darunter drei Schritte
    const phase = st.step === "judge" ? "Einspruch – zählt die Antwort?" : st.step === "check" ? "Nicht erkannt" : ["Frage ausdenken", "Antworten", st.step === "final" ? "Endstand" : "Auflösung"][stepNo];
    const ms0 = st.timerMs && st.deadlineIn ? st.deadlineIn : 0, p0 = ms0 ? Math.max(0, Math.min(1, ms0 / st.timerMs)) : 0;
    const ringHtml = ms0 && stepNo < 2 ? `<div id="fq-ring" class="qz-ring" style="--rc:${p0 > .5 ? "#7ee2b1" : p0 > .2 ? "#ffc83d" : "#ff7d8a"}"><svg viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="31" class="r0"/><circle cx="37" cy="37" r="31" class="r1" style="stroke-dasharray:${FQ_RING * p0} ${FQ_RING}"/></svg><b class="${ms0 >= 60000 ? "long" : ""}">${fqLeftTxt(ms0)}</b></div>` : "";
    const head = `<div class="qz-head"><span class="qz-ico">${["✍️", "💡", "🎯"][stepNo]}</span><div><small>${esc(st.cat || "")} · Runde ${st.round}</small>
        <b>${phase}${activeId && stepNo < 2 ? ` · <em class="fq-who">${activeId === G.myId ? "du bist dran" : esc(nameOf(activeId)) + " ist dran"}</em>` : ""}</b></div>${ringHtml}</div>
      <div class="fq-steps2">${[0, 1, 2].map((k) => `<i class="${k < stepNo ? "done" : k === stepNo ? "on" : ""}"></i>`).join("")}</div>`;
    const secret = (a) => `<div class="fq-secret"><span>Gesuchte Antwort</span><b>${esc(a)}</b>${iAsk && stepNo < 2 ? `<small>🤫 nur du</small>` : ""}</div>`;
    const bubble = st.question ? `<div class="fq-bubble2" style="--pc:${colorOf(st.asker)}"><div class="who"><i>${esc(nameOf(st.asker).charAt(0).toUpperCase())}</i>${iAsk ? "Deine Frage" : esc(nameOf(st.asker)) + " fragt"}</div>
        <div class="q">${esc(st.question)}</div></div>` : "";
    const waiting = (id, text, icon) => `<div class="fq-wait2" style="--pc:${colorOf(id)}"><span class="ico">${icon}</span><div><b>${esc(nameOf(id))}</b> ${text}<span class="fq-dotsanim"><i></i><i></i><i></i></span></div></div>`;
    let body = "";
    if (st.step === "write") {
      const choose = iAsk && priv && priv.options;
      if (choose) body = `<div class="fq-lbl">Wähle eine Antwort <small>– zu der dir die gemeinste Frage einfällt · 🤫 nur du siehst sie</small></div>
        <div class="fq-choices">${priv.options.map((o, i) => `<button type="button" class="fq-choice ${pickSel === i ? "on" : ""}" data-fqpick="${i}"><b>${esc(o.answer)}</b></button>`).join("")}</div>`;
      else if (iAsk) body = priv ? secret(priv.answer) : `<div class="fq-secret"><span>Gesuchte Antwort</span><b>…</b></div>`;
      if (iAsk) body += `
        <form class="fq-form" autocomplete="off"><label for="fq-q" class="fq-lbl">Deine Frage</label>
          <textarea id="fq-q" rows="3" maxlength="300" placeholder="${choose ? (pickSel != null ? `Eine Frage, deren Antwort „${esc(priv.options[pickSel].answer)}“ ist …` : "Wähle oben zuerst eine Antwort …") : `Eine Frage, deren Antwort „${priv ? esc(priv.answer) : "…"}“ ist …`}"></textarea>
          <div class="fq-row"><button type="button" id="fq-pass" class="btn ghost">Passen</button><button class="btn primary">Frage stellen</button></div></form>
        <p class="muted small fq-hint">Die Frage soll in die Kategorie passen und eindeutig sein.<span class="fq-keys"> Enter schickt ab, Umschalt+Enter macht eine neue Zeile.</span></p>`;
      else body = `${waiting(st.asker, st.choices > 1 ? `wählt eine von ${st.choices} Antworten und denkt sich eine Frage aus` : "denkt sich eine Frage aus", "✍️")}`;
    } else if (st.step === "answer") {
      body = bubble + (iGuess
        ? `<form class="du-form fq-aform quiz-form" autocomplete="off"><input id="fq-a" maxlength="80" placeholder="Deine Antwort …" enterkeyhint="send"><button class="btn primary">Antworten</button></form>`
        : `${iAsk && priv ? secret(priv.answer) : ""}${waiting(st.guesser, "überlegt", "💡")}`);
    } else if (st.step === "check") {
      // nicht wörtlich erkannt: der Antwortende sieht die Lösung – „Weiter“ (falsch) oder „⚖️ Einspruch“ (Fragesteller entscheidet)
      body = `${bubble}${G.checkHtml({ given: st.guess, solution: st.answer || (priv ? priv.answer : "…"), mine: iGuess, who: iGuess ? "Du" : nameOf(st.guesser), color: colorOf(st.guesser), zero: false })}
        ${iGuess ? `<button id="fq-complain" class="btn ghost fq-complain">👎 Die Frage war unpassend</button>` : ""}`;
    } else if (st.step === "judge") {
      body = `${bubble}<div class="fq-cmp"><div class="sec"><span>🎯 Gesuchte Antwort</span><b>${esc(st.answer || (priv ? priv.answer : "…"))}</b></div>
          <div class="none"><span>💬 ${iGuess ? "Deine Antwort" : esc(nameOf(st.guesser)) + " sagte"}</span><b>${esc(st.guess)}</b></div></div>
        <div class="banner judge du-judge"><div class="judge-appeal">⚖️ ${iGuess ? "Dein Einspruch" : `Einspruch von ${esc(nameOf(st.guesser))}`} – zählt die Antwort doch?</div>
        ${iAsk ? `<div class="judge-ask">Meint ${esc(nameOf(st.guesser))} dasselbe wie „${esc(st.answer || (priv ? priv.answer : ""))}“?</div>
          <div class="banner-actions"><button class="btn primary" data-fqjudge="1">✓ Zählt</button><button class="btn ghost" data-fqjudge="0">✗ Zählt nicht</button></div>`
          : `<div class="muted small">${esc(nameOf(st.asker))} entscheidet, ob es zählt …</div>`}</div>`;
    } else {
      const r = st.result, iWon = !r.voided && r.winner === G.myId, cp = st.complaint;
      const gName = iGuess ? null : esc(nameOf(st.guesser)), A = iAsk ? null : esc(nameOf(st.asker));
      const reason = { right: gName ? `${gName} wusste die Antwort.` : "Du wusstest die Antwort.", wrong: gName ? `${gName} lag daneben.` : "Du lagst daneben.",
        time: gName ? `${gName} hat nicht rechtzeitig geantwortet.` : "Du hast nicht rechtzeitig geantwortet.",
        noq: A ? `${A} ist keine Frage eingefallen.` : "Dir ist keine Frage eingefallen.", pass: A ? `${A} hat gepasst.` : "Du hast gepasst." }[r.why];
      const ok = r.why === "right";
      const appealTxt = st.appeal && (r.why === "right" || r.why === "wrong") ? (ok ? "⚖️ Einspruch anerkannt – " : "⚖️ Einspruch abgelehnt – ") : "";
      body = `${bubble}<div class="fq-cmp">
          <div class="sec"><span>🎯 Gesuchte Antwort</span><b>${esc(st.answer)}</b></div>
          ${st.guess ? `<div class="${ok ? "ok" : "bad"}"><span>💬 ${iGuess ? "Deine Antwort" : esc(nameOf(st.guesser)) + " sagte"}</span><b>${esc(st.guess)}</b></div>`
            : `<div class="none"><span>💬 Antwort</span><b>—</b></div>`}</div>
        ${cp && cp.state === "open" ? `<div class="banner judge du-judge"><div class="judge-q">${iGuess ? "Du findest" : `<b>${esc(nameOf(st.guesser))}</b> findet`} die Frage unpassend.</div>
          ${iAsk ? `<div class="judge-ask">Passt die Frage nicht zur Antwort oder Kategorie, oder war sie nicht eindeutig? Dann zählt die Runde nicht.</div>
            <div class="banner-actions"><button class="btn primary" data-fqcomplaint="1">Stimmt – Runde zählt nicht</button><button class="btn ghost" data-fqcomplaint="0">Nein, die Frage war fair</button></div>`
            : `<div class="muted small">${esc(nameOf(st.asker))} entscheidet …</div>`}</div>` : ""}
        ${cp && cp.state === "open" ? "" : st.step !== "final" && !r.voided ? `<div class="du-score ${r.winner === st.seats[1] ? "from-r" : ""} ${seated && !iWon ? "lose" : ""}" style="--pc:${colorOf(r.winner)}">
          <span class="du-plq">${seated && !iWon ? "✗" : "+1"}</span><h3>${iWon ? "Punkt für dich!" : "Punkt für " + esc(nameOf(r.winner))}</h3>
          <p>${appealTxt}${reason}${cp && cp.state === "rejected" ? ` Beschwerde abgelehnt – ${esc(nameOf(st.asker))} fand die Frage fair.` : ""}</p>
          <div class="du-score-nb">${cp && cp.state === "open" ? "" : seated || G.isHost ? `<button id="fq-next" class="btn primary next-btn">Nächste Runde</button>` : ""}
            ${iGuess && r.winner === st.asker && r.why === "time" && !cp ? `<button id="fq-complain" class="btn ghost">👎 Frage war unpassend</button>` : ""}<span class="du-stand">Stand ${st.score[st.seats[0]]} : ${st.score[st.seats[1]]}</span></div></div>`
        : `<div class="banner fq-result ${iWon ? "win" : seated && !r.voided ? "lose" : ""}">${st.step === "final" ? `<div class="trophy">🏆</div><b>${iWon ? "Du gewinnst" : esc(nameOf(r.winner)) + " gewinnt"} ${st.score[r.winner]} : ${st.score[st.seats.find((x) => x !== r.winner)]}!</b>`
          : r.voided ? `<b>Diese Runde zählt nicht</b>` : `<b>${iWon ? "Punkt für dich!" : "Punkt für " + esc(nameOf(r.winner))}</b>`}
          <div class="small">${r.voided ? `Beschwerde angenommen – die Frage war unpassend.` : reason}${cp && cp.state === "rejected" ? ` Beschwerde abgelehnt – ${esc(nameOf(st.asker))} fand die Frage fair.` : ""}</div>
          <div class="banner-actions">${iGuess && r.winner === st.asker && r.why === "time" && !r.voided && !cp ? `<button id="fq-complain" class="btn ghost">👎 Frage war unpassend</button>` : ""}
            ${cp && cp.state === "open" ? "" : st.step === "final" ? `<button id="fq-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}`
            : seated || G.isHost ? `<button id="fq-next" class="btn primary next-btn">Nächste Runde</button>` : ""}</div></div>`}`;
    }
    app.innerHTML = `
      <main class="screen game slf du fq">
        <header class="top topbar">
          ${headBrandHtml("frage")}
          <div class="meta">Runde ${st.round} · bis ${st.target}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="fq-main du-main du-arena">
          <div class="du-sa">${side(st.seats[0])}</div><div class="du-sb">${side(st.seats[1])}</div>
          <div class="du-mid"><div class="panel quiz-card qz-card fq-card">${head}${body}</div>
          ${!seated ? `<p class="muted small du-watch">Du schaust zu – es spielen ${esc(nameOf(st.seats[0]))} und ${esc(nameOf(st.seats[1]))}.</p>` : ""}</div>
        </section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#fq-next", () => send({ type: "fqNext" }));
    on("#fq-restart", () => send({ type: "fqRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll("[data-chk]").forEach((b) => b.onclick = () => send({ type: "fqCheck", round: st.round, appeal: b.dataset.chk === "appeal" }));
    app.querySelectorAll("[data-fqjudge]").forEach((b) => b.onclick = () => send({ type: "fqJudge", ok: b.dataset.fqjudge === "1" }));
    on("#fq-complain", () => send({ type: "fqComplain", round: st.round }));
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
