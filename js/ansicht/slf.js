// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, SLF, app, esc, headBrandHtml, invite, leave, render, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Stadt, Land, Fluss: Darstellung ----------
  let slfLocal = { key: null, answers: {} }, slfDraftTimer = null, slfSubmitted = null, slfDeadline = 0, slfRendered = null;
  const slfKeyOf = (v) => v.code + ":" + v.slf.round + ":" + v.slf.letter;
  function slfLoadLocal(v) {
    const key = slfKeyOf(v);
    if (slfLocal.key === key) return;
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("s10-slf-" + key)); } catch {}
    slfLocal = { key, answers: saved || {} };
  }
  function slfSaveLocal() { try { sessionStorage.setItem("s10-slf-" + slfLocal.key, JSON.stringify(slfLocal.answers)); } catch {} }
  function slfSend(final) {
    if (!G.view || !G.view.slf) return;
    send({ type: final ? "slfSubmit" : "slfDraft", round: G.view.slf.round, answers: slfLocal.answers });
  }
  const fmtClock = (ms) => { const t = Math.ceil(ms / 1000); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
  setInterval(() => {
    const el = document.getElementById("slf-timer");
    if (!el || !G.view || !G.view.slf || G.view.slf.step !== "writing") return;
    // während der Buchstabe sich dreht, steht die Uhr noch still
    const ms = Math.max(0, slfDeadline - Math.max(Date.now(), slfStartAt));
    el.textContent = fmtClock(ms); el.classList.toggle("urgent", ms <= 10000);
    const st = G.view.slf;
    if (Date.now() >= slfStartAt) sfx.countdown("slf:" + G.view.code + ":" + st.round, ms, !(st.done[G.myId] || (st.stuck && st.stuck[G.myId])));
  }, 250);

  function slfChips(v, st) {
    return v.players.map((p, i) => {
      let badge = "";
      if (st.step === "writing") badge = st.done[p.id] ? "fertig ✓" : st.stuck && st.stuck[p.id] ? "weiß nicht weiter 🤷" : "schreibt …";
      else if (st.step === "review") badge = st.ready && st.ready[p.id] ? "bereit ✓" : "prüft …";
      const rp = st.roundPoints && st.roundPoints[p.id] != null && st.step === "review" ? ` <span class="pill-rp">+${st.roundPoints[p.id]}</span>` : "";
      const done = st.done[p.id] || (st.stuck && st.stuck[p.id]) || (st.ready && st.ready[p.id]);
      // kompakte Pille wie bei „Wo liegt das?“ und „Höher oder tiefer“
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${esc(badge)}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span>
        <b>${st.total[p.id] || 0}</b>${rp}${badge ? `<span class="geo-mark">${done ? "✓" : "…"}</span>` : ""}</span>`;
    }).join("");
  }

  // Buchstabe dreht sich vor jeder Runde: Zeichen wechseln erst schnell, dann immer langsamer, bis der echte stehen bleibt
  let slfStartAt = 0, slfSpinKey = null, slfSpinTimer = null, slfLastSt = null;
  function slfSpin(key, letter, ms) {
    if (slfSpinKey === key) return;
    slfSpinKey = key;
    const LET = "ABDEFGHIKLMNOPRSTUVWZ", end = Date.now() + ms;
    let delay = 55;
    const step = () => {
      const el = document.getElementById("slf-letter");
      if (slfSpinKey !== key || !el) return;
      const left = end - Date.now();
      if (left <= delay) { el.textContent = letter; return; }
      let ch; do { ch = LET[Math.floor(Math.random() * LET.length)]; } while (ch === el.textContent || ch === letter);
      el.textContent = ch; sfx.tick();
      delay = Math.min(420, delay * 1.13);
      setTimeout(step, delay);
    };
    step();
    clearTimeout(slfSpinTimer);
    slfSpinTimer = setTimeout(() => { if (slfSpinKey !== key) return; sfx.turn(); slfRendered = null; render(); }, ms);
  }
  // Knopf „Stopp!“ / „Fertig“: Stopp gibt es erst, wenn alle Felder ausgefüllt sind
  function slfDoneState(st) {
    if (st.done[G.myId]) return { off: true, text: "Fertig – warte auf die anderen …" };
    if (Date.now() < slfStartAt) return { off: true, text: "Gleich geht's los …" };
    const empty = st.cats.filter((c) => !String(slfLocal.answers[c] || "").trim()).length;
    if (st.timer === "stopp") return empty ? { off: true, text: `Stopp! – noch ${empty} ${empty === 1 ? "Feld" : "Felder"} leer` } : { off: false, text: "Stopp! Ich bin fertig" };
    return { off: false, text: "Fertig" };
  }
  function slfUpdDone(st) {
    const b = app.querySelector("#slf-done"); if (b) { const d = slfDoneState(st); b.disabled = d.off; b.textContent = d.text; }
    const k = app.querySelector("#slf-stuck"); if (k) k.outerHTML = slfStuckHtml(st);
    const on = app.querySelector("#slf-stuck"); if (on) on.onclick = () => { slfSaveLocal(); send({ type: "slfStuck", answers: slfLocal.answers }); };
  }
  // „Mir fällt nichts mehr ein“: stimmen alle zu (oder sind schon fertig), endet die Schreibzeit sofort
  function slfStuckHtml(st) {
    if (st.done[G.myId] || Date.now() < slfStartAt) return `<div id="slf-stuck"></div>`;
    const ids = G.view.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    const n = ids.filter((id) => st.stuck && st.stuck[id]).length, mine = st.stuck && st.stuck[G.myId];
    return `<div id="slf-stuck" class="slf-stuck"><button type="button" class="btn ghost sm ${mine ? "on" : ""}">${mine ? "↩ Doch noch was eingefallen" : "🤷 Mir fällt nichts mehr ein"}</button>
      ${n ? `<span class="muted small">${n} von ${ids.length} wissen nicht weiter – stimmen alle zu, ist die Runde vorbei.</span>` : ""}</div>`;
  }

  function renderSlf() {
    const v = G.view, st = v.slf;
    if (!st) return;
    slfLoadLocal(v);
    // Zeiten nur bei einem neuen Spielstand übernehmen – beim Neuzeichnen ohne neuen Stand wären sie veraltet
    if (st !== slfLastSt) { slfLastSt = st; slfDeadline = Date.now() + (st.endsIn || 0); slfStartAt = st.step === "writing" ? Date.now() + (st.startsIn || 0) : 0; }
    const spinning = st.step === "writing" && Date.now() < slfStartAt;
    if (st.step === "collecting" && slfSubmitted !== slfLocal.key) { slfSubmitted = slfLocal.key; slfSend(true); }
    const key = slfLocal.key + ":" + st.step + (spinning ? ":spin" : "") + (st.step === "review" ? ":" + st.ci : "");
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    if (st.step === "writing" && slfRendered === key && app.querySelector(".slf-form")) {
      // Eingaben nicht neu zeichnen – nur Spieler, Stopp-Hinweis und Knopf aktualisieren
      app.querySelector(".players").innerHTML = slfChips(v, st);
      app.querySelector("#slf-stop").innerHTML = slfStopHtml(st, nameOf);
      slfUpdDone(st);
      return;
    }
    const fresh = slfRendered !== key; // Kacheln nur bei neuer Kategorie einblenden, nicht bei „bereit“ oder Stimmen
    slfRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    let main = "";
    if (st.step === "writing") {
      const d = slfDoneState(st);
      main = `
        <div class="slf-head">
          <div class="slf-headrow">
            <div id="slf-letter" class="slf-letter ${spinning ? "spinning" : "landed"}" aria-label="Buchstabe ${spinning ? "wird gezogen" : st.letter}">${spinning ? "?" : st.letter}</div>
            <div class="slf-clock"><div id="slf-timer" class="slf-timer">${fmtClock(Math.max(0, st.endsIn - (st.startsIn || 0)))}</div><div id="slf-stop" class="muted small slf-rule">${slfStopHtml(st, nameOf)}</div></div>
          </div>
        </div>
        <form class="slf-form ${spinning ? "waiting" : ""}" autocomplete="off" onsubmit="return false">
          ${st.cats.map((c, i) => `<label class="slf-field ${c === st.surpriseCat ? "surprise" : ""}"><span>${c === st.surpriseCat ? "🎁 " : ""}${esc(c)}</span>
            <input data-cat="${i}" maxlength="60" autocapitalize="words" spellcheck="false" ${spinning ? "disabled" : ""} placeholder="${spinning ? "…" : st.letter + " …"}" value="${esc(slfLocal.answers[c] || "")}"></label>`).join("")}
        </form>
        <button id="slf-done" class="btn primary big" ${d.off ? "disabled" : ""}>${d.text}</button>
        ${slfStuckHtml(st)}`;
    } else if (st.step === "collecting") {
      main = `<div class="slf-wait"><div class="slf-letter small">${st.letter}</div><p><b>Zeit ist um!</b> Die Antworten werden eingesammelt …</p></div>`;
    } else if (st.step === "review") {
      const ci = st.ci, cat = st.cats[ci], row = st.table[cat], iReady = st.ready && st.ready[G.myId], last = ci >= st.cats.length - 1;
      const canVote = st.answered.includes(G.myId);
      const cards = st.answered.map((pid) => {
        const cell = row[pid], mine = pid === G.myId, iVoted = cell.voters.includes(G.myId), n = cell.voters.length;
        const tag = !cell.text ? "keine Antwort" : !cell.valid ? (cell.auto ? "von der Mehrheit abgelehnt" : "falscher Anfangsbuchstabe")
          : cell.overridden ? "von der Mehrheit anerkannt" : cell.dup ? "doppelt" : cell.points === 20 ? "einzige gültige Antwort" : "";
        const btn = !cell.text || mine || !canVote ? (n ? `<span class="slf-votes" title="Stimmen der anderen">${cell.auto ? "👎" : "👍"} ${n}</span>` : "")
          : `<button type="button" class="slf-vote ${iVoted ? "on" : ""}" data-pid="${esc(pid)}" title="${cell.auto ? "Gilt nicht" : "Gilt doch"} – ${n} von ${cell.need} nötigen Stimmen">${cell.auto ? "👎" : "👍"}${n ? ` <b>${n}</b>` : ""}</button>`;
        return `<div class="slf-card ${cell.valid ? "" : "bad"} ${mine ? "mine" : ""}" style="--pc:${colorOf(pid)}">
            <div class="slf-card-top"><span class="pdot"></span><span class="slf-name">${esc(nameOf(pid))}${mine ? " (du)" : ""}</span><b class="slf-pts">${cell.points ? "+" + cell.points : "0"}</b></div>
            <div class="slf-card-ans">${cell.text ? esc(cell.text) : "—"}</div>
            <div class="slf-card-foot"><span class="slf-tag">${tag}</span>${btn}</div>
          </div>`;
      }).join("");
      main = `
        <div class="slf-revhead">
          <div class="slf-letter small">${st.letter}</div>
          <div class="slf-revtitle"><div class="game-label">Runde ${st.round} · Kategorie ${ci + 1} von ${st.cats.length}</div>
            <h3>${cat === st.surpriseCat ? "🎁 " : ""}${esc(cat)}</h3>
            <div class="slf-dots">${st.cats.map((c, i) => `<span class="${i < ci ? "done" : i === ci ? "cur" : ""}"></span>`).join("")}</div></div>
        </div>
        <div class="slf-cards ${fresh ? "enter" : ""}">${cards}</div>
        <p class="muted small slf-hint">Tippe 👎, wenn eine Antwort nicht gilt – stimmt die Mehrheit der anderen dagegen, zählt sie nicht.</p>
        <div class="slf-actions">
          ${G.nextBtnsHtml({ attr: 'id="slf-ready"', hostAttr: 'id="slf-next"', cls: "big", label: !last ? "Weiter zur nächsten Kategorie" : st.round >= st.rounds ? "Passt – zum Endstand" : "Passt – nächste Runde", ready: !!iReady, waiting: G.waitingNames(v, st.ready) })}
        </div>`;
    } else if (st.step === "final") {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      main = `
        <div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((p) => st.winners.includes(p.id)).map((p) => esc(p.name)).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="slf-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((p, i) => `
          <div class="slf-rank" style="--pc:${colorOf(p.id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
            <span class="slf-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span><b>${st.total[p.id] || 0} Punkte</b></div>`).join("")}
          <p class="muted small">${st.rounds} Runden · Buchstaben: ${(st.used || []).join(" · ")}</p></div>`;
    }
    app.innerHTML = `
      <main class="screen game slf">
        <header class="top topbar">
          ${headBrandHtml("slf")}
          <div class="meta">Runde ${st.round}/${st.rounds}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="players">${slfChips(v, st)}</section>
        <section class="slf-main">${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#slf-done", () => { if (slfDoneState(st).off) return; slfSaveLocal(); send({ type: "slfDone", answers: slfLocal.answers }); });
    slfUpdDone(st);
    on("#slf-ready", () => send({ type: "slfReady" }));
    on("#slf-next", () => send({ type: "slfNext" }));
    on("#slf-restart", () => send({ type: "slfRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll(".slf-vote").forEach((b) => b.onclick = () => send({ type: "slfVote", pid: b.dataset.pid, cat: st.cats[st.ci] }));
    const inputs = [...app.querySelectorAll(".slf-form input")];
    inputs.forEach((inp, i) => {
      const cat = st.cats[Number(inp.dataset.cat)];
      const mark = () => inp.classList.toggle("wrong", !!inp.value.trim() && SLF.firstLetter(inp.value) !== st.letter);
      mark();
      inp.oninput = () => {
        slfLocal.answers[cat] = inp.value; slfSaveLocal(); mark(); slfUpdDone(st);
        clearTimeout(slfDraftTimer); slfDraftTimer = setTimeout(() => slfSend(false), 800);
      };
      inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); (inputs[i + 1] || inp).focus(); } };
    });
    if (spinning) slfSpin(key, st.letter, slfStartAt - Date.now());
    else if (st.step === "writing" && inputs.length && !inputs.some((x) => x.value) && matchMedia("(pointer: fine)").matches) inputs[0].focus();
  }
  function slfStopHtml(st, nameOf) {
    // steht in derselben Zeile wie die Zeitregel unter der Uhr – der Kasten wird dadurch nicht höher
    if (!st.stoppedBy) return esc(st.timerName);
    return `<span class="slf-stopped">⏱ <b>${esc(nameOf(st.stoppedBy))}</b> hat Stopp gerufen!</span>`;
  }


  return {
    renderSlf,
  };
});
