// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Kaum zu glauben ----------
  let kuRendered = null;
  const ABC = ["A", "B", "C"];

  function renderKurios() {
    const v = G.view, st = v.kurios;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me);
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const key = [v.code, st.move, st.step, JSON.stringify(st.score)].join("|");
    if (kuRendered === key && app.querySelector(".ku-main")) return;
    kuRendered = key;
    const myPick = st.step === "pick" && st.chooser === me, c = st.cur, mine = c && c.by === me;

    // Tafel: offene Felder zeigen nur das Stichwort, erledigte die Farbe des Spielers und ✓/✗
    const tiles = st.board.map((t, k) => {
      const on = c && c.k === k;
      if (t.done) return `<div class="ku-tile done ${t.done.ok ? "ok" : "bad"} ${on ? "on" : ""}" style="--pc:${colorOf(t.done.by)}"><span class="ico">${t.ico}</span><b>${esc(t.tag)}</b><i>${t.done.ok ? "✓" : "✗"} ${esc(nameOf(t.done.by))}</i></div>`;
      return `<button type="button" class="ku-tile ${on ? "on" : ""}" ${myPick ? `data-kupick="${k}"` : "disabled"}><span class="ico">${t.ico}</span><b>${esc(t.tag)}</b></button>`;
    }).join("");

    let panel = "";
    if (st.step === "pick") {
      panel = myPick ? `<div class="ku-hint">👆 <b>Du bist dran:</b> Wähle ein Feld auf der Tafel.</div>`
        : `<div class="fq-wait2" style="--pc:${colorOf(st.chooser)}"><span class="ico">🤔</span><div><b>${esc(nameOf(st.chooser))}</b> wählt ein Feld<span class="fq-dotsanim"><i></i><i></i><i></i></span></div></div>`;
    } else if (c) {
      const open = st.step === "reveal";
      const opts = c.s.map((txt, i) => {
        const cls = open ? (i === c.right ? "right" : i === c.pick ? "wrong" : "dim") : "";
        return `<button type="button" class="ku-opt ${cls}" ${!open && mine ? `data-kuans="${i}"` : "disabled"}><span class="l">${ABC[i]}</span><span class="t">${esc(txt)}</span>${open && i === c.pick ? `<em style="--pc:${colorOf(c.by)}">${esc((nameOf(c.by)[0] || "?").toUpperCase())}</em>` : ""}</button>`;
      }).join("");
      const ok = open && c.pick === c.right;
      panel = `<div class="ku-q"><span class="ico">${c.ico}</span><div><small>${mine ? "Deine Frage" : esc(nameOf(c.by)) + " ist dran"}</small><b>${esc(c.tag)}</b></div></div>
        <p class="ku-ask">${open ? (ok ? `✓ ${mine ? "Richtig – du bekommst" : esc(nameOf(c.by)) + " liegt richtig und bekommt"} 1 Punkt!` : `✗ ${mine ? "Leider daneben." : esc(nameOf(c.by)) + " liegt daneben."}`) : `Nur eine Aussage stimmt – ${mine ? "welche?" : "welche nimmt " + esc(nameOf(c.by)) + "?"}`}</p>
        <div class="ku-opts">${opts}</div>
        ${open ? `<div class="ku-expl"><span>💡 Kaum zu glauben, aber wahr</span><p>${esc(c.e)}</p></div>
          ${seated || G.isHost ? `<div class="wer-row pult-move"><button type="button" id="ku-next" class="btn primary next-btn">${st.round >= st.turns ? "Zum Ergebnis" : "Weiter"}</button></div>` : ""}` : ""}`;
    }
    if (st.step === "final") {
      const items = st.seats.map((id) => ({ id, name: nameOf(id), pts: st.score[id] || 0, txt: `${st.score[id] || 0} ${st.score[id] === 1 ? "Punkt" : "Punkte"}` }));
      panel = G.podiumHtml({ items, winners: st.winners || [], restartId: "ku-restart" });
    }

    // Spielpult (ab 1200 px): Platzierung, wer dran ist, Kamera fest eingebaut, „Weiter“ unten
    const played = (id) => st.board.filter((t) => t.done && t.done.by === id).length;
    const pult = st.seats.map((id) => { const turn = st.step !== "final" && (c ? c.by === id : st.chooser === id), n = played(id);
      return { id, name: nameOf(id), pts: st.score[id] || 0, turn, done: !turn && st.step === "reveal" && c && c.by === id,
        txt: turn ? (st.step === "pick" ? "wählt ein Feld" : st.step === "answer" ? "überlegt …" : "ist dran") : n ? `${st.score[id] || 0} von ${n} richtig` : "noch nicht dran" }; });
    const stack = `<div class="ku-stack">${st.step !== "final" && !c ? `<div class="ku-board" style="--cols:${st.cols}">${tiles}</div>` : ""}<div class="panel quiz-card qz-card ku-card">${panel}</div></div>`;
    const board = st.seats.map((id) => `<li style="--pc:${colorOf(id)}" class="${st.chooser === id ? "on" : ""}"><i class="pdot"></i><span>${esc(nameOf(id))}${id === me ? " (du)" : ""}${st.chooser === id ? " · ist dran" : ""}</span><b>${st.score[id] || 0}</b></li>`).join("");
    app.innerHTML = `
      <main class="screen game ku">
        <header class="top topbar">
          ${headBrandHtml("kurios")}
          <div class="meta">${st.step === "final" ? "Ende" : `Zug ${Math.min(st.round + (st.step === "reveal" ? 0 : 1), st.turns)}/${st.turns}`}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="ku-main">
          ${st.step !== "final" ? G.pultWrap(stack, pult) : stack}
          <aside class="tk-side"><div class="wer-flbl">Punkte</div><ul class="tk-board">${board}</ul></aside>
          ${!seated ? `<p class="muted small du-watch">Du schaust zu.</p>` : ""}
        </section>
      </main>`;

    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#ku-restart", () => send({ type: "kuRestart" }));
    on("#ku-next", () => send({ type: "kuNext", move: st.move }));
    app.querySelectorAll("[data-kupick]").forEach((b) => b.onclick = () => send({ type: "kuPick", k: Number(b.dataset.kupick), move: st.move }));
    app.querySelectorAll("[data-kuans]").forEach((b) => b.onclick = () => { app.querySelectorAll("[data-kuans]").forEach((x) => x.disabled = true); b.classList.add("chosen"); send({ type: "kuAnswer", c: Number(b.dataset.kuans), move: st.move }); });
  }

  return {
    renderKurios,
  };
});
