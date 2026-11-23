// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Wie tickst du? ----------
  let tkRendered = null, tkSel = null, tkDraft = { text: "", key: "" };
  const N = 10;
  // Farbverlauf der Skala von links (kühl) nach rechts (warm)
  const hue = (v) => 210 - (v - 1) * (190 / (N - 1));

  function renderTick() {
    const v = G.view, st = v.tick;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me), iGive = st.giver === me;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const priv = iGive && G.wattenPriv && G.wattenPriv.tick && G.wattenPriv.turnNo === st.turnNo ? G.wattenPriv : null;
    const turnKey = v.code + ":" + st.turnNo;
    if (tkDraft.key !== turnKey) { tkDraft = { text: "", key: turnKey }; tkSel = null; }
    const myGuess = st.guesses ? st.guesses[me] : null, iGuessed = st.guessed.includes(me);
    const key = [v.code, st.move, st.step, st.guessed.join(), st.hint, priv ? priv.target : "", tkSel, JSON.stringify(st.score)].join("|");
    if (tkRendered === key && app.querySelector(".tk-main")) return;
    tkRendered = key;
    const loud = st.opts.mode === "laut", canGuess = st.step === "guess" && seated && !iGive && !iGuessed && (loud || !!st.hint);

    // Skala: 10 Felder, links und rechts die Gegensätze
    const marks = (n) => st.step === "reveal" ? Object.entries(st.guesses).filter(([, g]) => g === n)
      .map(([id]) => `<i class="tk-mk" style="--pc:${colorOf(id)}" title="${esc(nameOf(id))}">${esc((nameOf(id)[0] || "?").toUpperCase())}</i>`).join("") : "";
    const target = st.step === "reveal" ? st.target : priv ? priv.target : null;
    const cells = Array.from({ length: N }, (_, i) => i + 1).map((n) => `<button type="button" class="tk-cell ${target === n ? "target" : ""} ${tkSel === n && canGuess ? "sel" : ""}"
        style="--h:${hue(n)}" ${canGuess ? `data-tkv="${n}"` : "disabled"}><b>${n}</b>${target === n ? `<span class="tk-flag">🎯</span>` : ""}<span class="tk-mks">${marks(n)}</span></button>`).join("");
    const scale = st.scale ? `<div class="tk-scale"><div class="tk-poles"><span class="l">◀ ${esc(st.scale[0])}</span><span class="r">${esc(st.scale[1])} ▶</span></div>
        <div class="tk-cells">${cells}</div></div>` : "";

    const bubble = st.hint ? `<div class="fq-bubble2 tk-bubble" style="--pc:${colorOf(st.giver)}"><div class="who"><i>${esc(nameOf(st.giver).charAt(0).toUpperCase())}</i>${iGive ? "Dein Hinweis" : esc(nameOf(st.giver)) + " sagt"}</div><div class="q">${esc(st.hint)}</div></div>` : "";
    const who = (id) => `<b style="color:${colorOf(id)}">${esc(nameOf(id))}</b>`;
    const tipped = st.need.length ? `<ul class="wer-tally">${st.need.map((id) => `<li style="--pc:${colorOf(id)}" class="${st.guessed.includes(id) ? "a-ja" : ""}"><i class="pdot"></i>${esc(nameOf(id))}${id === me ? " (du)" : ""}<b>${st.guessed.includes(id) ? "✓ getippt" : "…"}</b></li>`).join("")}</ul>` : "";
    let body = "";
    if (st.step === "guess" && iGive) {
      body = `<div class="tk-secret">Deine Zahl: <b>${priv ? priv.target : "…"}</b> <small>🤫 nur du</small></div>
        <p class="tk-how">${loud ? "Sag laut" : "Schreib"} etwas – einen Film, ein Essen, eine Person, eine Situation …, das für dich genau auf die <b>${priv ? priv.target : "…"}</b> zwischen „${esc(st.scale[0])}“ und „${esc(st.scale[1])}“ passt.</p>
        ${bubble}
        ${!st.hint ? `<form class="du-form tk-hform" autocomplete="off"><input id="tk-h" maxlength="120" placeholder="${loud ? "Hinweis auch aufschreiben (freiwillig)" : "Dein Hinweis …"}" enterkeyhint="send"><button class="btn ${loud ? "ghost" : "primary"}">${loud ? "Zeigen" : "Hinweis geben"}</button></form>` : ""}
        ${!st.hint && !st.guessed.length && st.rerollsLeft > 0 ? `<div class="wer-row"><button type="button" id="tk-reroll" class="btn ghost sm">🎲 Andere Skala (noch ${st.rerollsLeft}×)</button></div>` : ""}
        ${tipped}`;
    } else if (st.step === "guess") {
      const wait = !loud && !st.hint;
      body = (bubble || (loud ? `<div class="fq-wait2" style="--pc:${colorOf(st.giver)}"><span class="ico">🗣️</span><div>${who(st.giver)} nennt laut einen Hinweis</div></div>`
          : `<div class="fq-wait2" style="--pc:${colorOf(st.giver)}"><span class="ico">✍️</span><div>${who(st.giver)} denkt sich einen Hinweis aus<span class="fq-dotsanim"><i></i><i></i><i></i></span></div></div>`))
        + (!seated ? "" : iGuessed ? `<p class="tk-done">✓ Getippt – warte auf die anderen …</p>`
          : wait ? "" : `<p class="tk-how">Welche Zahl hat ${who(st.giver)} wohl? Tippe auf ein Feld der Skala.</p>
            <div class="wer-row"><button type="button" id="tk-lock" class="btn primary" ${tkSel ? "" : "disabled"}>${tkSel ? `Tipp abgeben: ${tkSel}` : "Erst ein Feld wählen"}</button></div>`)
        + tipped;
    } else if (st.step === "reveal") {
      const r = st.result.pts, rows = Object.entries(st.guesses).sort((a, b) => Math.abs(a[1] - st.target) - Math.abs(b[1] - st.target))
        .map(([id, g]) => `<li style="--pc:${colorOf(id)}"><i class="pdot"></i><span class="nm">${esc(nameOf(id))}${id === me ? " (du)" : ""}</span><b>${g}</b><span>${g === st.target ? "🎯 Volltreffer" : Math.abs(g - st.target) + " daneben"}</span><em>+${r[id]}</em></li>`).join("");
      body = `${bubble}<div class="tk-res"><span>Gesucht war</span><b style="--h:${hue(st.target)}">${st.target}</b></div>
        <ul class="tk-rows">${rows}<li class="giver" style="--pc:${colorOf(st.giver)}"><i class="pdot"></i><span class="nm">${esc(nameOf(st.giver))}${iGive ? " (du)" : ""} als Hinweisgeber</span><b></b><span>Durchschnitt der Ratenden</span><em>+${r[st.giver]}</em></li></ul>
        ${seated || G.isHost ? `<div class="wer-row pult-move"><button type="button" id="tk-next" class="btn primary next-btn">${st.turnNo >= st.total ? "Zum Ergebnis" : "Nächster Hinweis"}</button></div>` : ""}`;
    } else {
      const ids = st.seats, team = ids.length === 2, sum = st.score[ids[0]] || 0, max = st.total * 3;
      if (team) {
        const q = sum / max, rating = q >= .8 ? "🧠 Gedankenleser!" : q >= .6 ? "🤝 Ihr tickt sehr ähnlich" : q >= .4 ? "🙂 Ganz ordentlich" : "🌀 Ihr tickt ziemlich verschieden";
        body = `<div class="tk-team"><div class="trophy">${rating.split(" ")[0]}</div><b>${rating.slice(rating.indexOf(" ") + 1)}</b>
          <p>Zusammen <b>${sum}</b> von ${max} möglichen Punkten</p>
          <div class="banner-actions"><button id="tk-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>`;
      } else {
        const items = ids.map((id) => ({ id, name: nameOf(id), pts: st.score[id] || 0, txt: `${st.score[id] || 0} Punkte` })), best = Math.max(...items.map((x) => x.pts));
        body = G.podiumHtml({ items, winners: items.filter((x) => x.pts === best).map((x) => x.id), restartId: "tk-restart" });
      }
      body += st.history.length ? `<details class="tk-hist"><summary>Alle Hinweise ansehen</summary><ul>${st.history.map((h) => `<li><b>${esc(nameOf(h.giver))}</b>: ${h.hint ? `„${esc(h.hint)}“` : "🗣️ laut"} · ${esc(h.scale[0])} ↔ ${esc(h.scale[1])} · gesucht <b>${h.target}</b></li>`).join("")}</ul></details>` : "";
    }

    // Spielpult (ab 1200 px): wer den Hinweis gibt, wer schon getippt hat, Kamera fest eingebaut, „Weiter“ unten
    const pult = st.order.map((id) => { const giver = st.giver === id, tipped = st.guessed.includes(id), r = st.result ? st.result.pts[id] : null;
      return { id, name: nameOf(id), pts: st.score[id] || 0, turn: giver, done: st.step === "guess" && tipped,
        txt: st.step === "reveal" ? (giver ? `Hinweisgeber · +${r || 0}` : st.guesses[id] != null ? `Tipp ${st.guesses[id]} · +${r || 0}` : "kein Tipp") : giver ? "gibt den Hinweis" : tipped ? "✓ getippt" : "überlegt …" }; });
    const board = st.order.map((id) => `<li style="--pc:${colorOf(id)}" class="${st.giver === id ? "on" : ""}"><i class="pdot"></i><span>${esc(nameOf(id))}${id === me ? " (du)" : ""}${st.giver === id ? " · gibt den Hinweis" : ""}</span><b>${st.score[id] || 0}</b></li>`).join("");
    const head = `<div class="qz-head"><span class="qz-ico">${st.step === "final" ? "🏆" : st.step === "reveal" ? "🎯" : iGive ? "🤫" : "🤔"}</span><div><small>Wie tickst du? · ${st.step === "final" ? "Ende" : `Hinweis ${st.turnNo} von ${st.total}`}</small>
        <b>${st.step === "final" ? "Endstand" : iGive ? "Du gibst den Hinweis" : esc(nameOf(st.giver)) + " gibt den Hinweis"}</b></div></div>`;
    app.innerHTML = `
      <main class="screen game tk">
        <header class="top topbar">
          ${headBrandHtml("tick")}
          <div class="meta">${st.step === "final" ? "Ende" : `${st.turnNo}/${st.total}`}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="tk-main">
          ${st.step !== "final" ? G.pultWrap(`<div class="panel quiz-card qz-card tk-card">${head}${scale}${body}</div>`, pult) : `<div class="panel quiz-card qz-card tk-card">${head}${body}</div>`}
          <aside class="tk-side"><div class="wer-flbl">${st.seats.length === 2 ? "Punkte (ihr spielt als Team)" : "Punkte"}</div><ul class="tk-board">${board}</ul></aside>
          ${!seated ? `<p class="muted small du-watch">Du schaust zu.</p>` : ""}
        </section>
      </main>`;

    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#tk-restart", () => send({ type: "tkRestart" }));
    on("#tk-next", () => send({ type: "tkNext", move: st.move }));
    on("#tk-reroll", () => send({ type: "tkReroll", move: st.move }));
    on("#tk-lock", () => { if (!tkSel) return; const g = tkSel; send({ type: "tkGuess", v: g, move: st.move }); });
    app.querySelectorAll("[data-tkv]").forEach((b) => b.onclick = () => { tkSel = Number(b.dataset.tkv); tkRendered = null; renderTick(); });
    const hf = app.querySelector(".tk-hform");
    if (hf) {
      const inp = hf.querySelector("#tk-h"); inp.value = tkDraft.text; inp.oninput = () => { tkDraft.text = inp.value; };
      if (!loud) setTimeout(() => inp.focus(), 30);
      hf.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; tkDraft.text = ""; inp.value = ""; send({ type: "tkHint", text: t, move: st.move }); };
    }
  }

  return {
    renderTick,
  };
});
