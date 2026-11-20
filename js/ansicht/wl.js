// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, WL, app, askConfirm, confetti, esc, headBrandHtml, invite, leave, render, send,
    sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Gleiche Wellenlänge: Darstellung ----------
  let wlRendered = null, wlMine = "";
  // Gemeinsames Aufdecken: erst 3 – 2 – 1, dann drehen sich alle Wörter gleichzeitig um
  const WL_COUNT_MS = 2400;
  let wlRevealAt = {}, wlCountKey = null, wlJustFlipped = null;
  function wlCountdown(rk, left, hit) {
    if (wlCountKey === rk) return;
    wlCountKey = rk;
    let last = null;
    const step = () => {
      const el = document.getElementById("wl-count");
      if (wlCountKey !== rk || !el) return;
      const ms = wlRevealAt[rk] - Date.now(); if (ms <= 0) return;
      const n = Math.ceil(ms / (WL_COUNT_MS / 3));
      if (n !== last) { last = n; el.textContent = n; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); sfx.tick(); }
      setTimeout(step, 80);
    };
    step();
    setTimeout(() => {
      if (wlCountKey !== rk) return;
      wlJustFlipped = rk; wlRendered = null; render();
      // Ton und Konfetti erst, wenn die Wörter umgedreht sind
      setTimeout(() => { if (hit) { sfx.win(); confetti(); } else sfx.lose(); }, 550);
    }, left);
  }
  function wlChips(v, st) {
    return v.players.map((p, i) => {
      const sub = st.submitted.includes(p.id);
      const badge = st.step === "writing" ? (sub ? "abgegeben ✓" : "denkt …") : "";
      return `<span class="geo-score ${sub && st.step === "writing" ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${esc(badge)}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span>
        ${badge ? `<span class="geo-mark">${sub ? "✓" : "…"}</span>` : ""}</span>`;
    }).join("");
  }
  function wlStatusHtml(st) {
    if (!st.submitted.includes(G.myId)) return "";
    return `Dein Wort: <b>„${esc(wlMine)}“</b> – warte auf die anderen … <span class="muted">(zum Ändern einfach neu abgeben)</span>`;
  }
  function renderWl() {
    const v = G.view, st = v.wl;
    if (!st) return;
    const rk = v.code + ":" + st.impulse + ":" + st.attempt;
    if (st.step === "reveal" && !wlRevealAt[rk]) wlRevealAt[rk] = Date.now() + WL_COUNT_MS;
    const countLeft = st.step === "reveal" ? wlRevealAt[rk] - Date.now() : 0, counting = countLeft > 0;
    const flip = st.step === "reveal" && !counting && wlJustFlipped === rk;
    const key = rk + ":" + st.step + (counting ? ":count" : "");
    if (st.step === "writing" && wlRendered === key && app.querySelector("#wl-word")) {
      app.querySelector(".players").innerHTML = wlChips(v, st);
      app.querySelector("#wl-status").innerHTML = wlStatusHtml(st);
      return;
    }
    if (st.step === "writing" && (!wlRendered || !wlRendered.startsWith(v.code + ":" + st.impulse + ":" + st.attempt + ":"))) wlMine = "";
    wlRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    // Gedankenkette: jeder Versuch als Reihe farbiger Wort-Kärtchen, verbunden mit „+“, Pfeil zum nächsten Versuch
    const chainHtml = st.chain.length ? `<div class="wl-chain">${st.chain.map((c, i) => `
        <div class="wl-chainrow"><span class="wl-step">${i + 1}.</span>${Object.entries(c.words).map(([pid, w]) => `<span class="wl-chip" style="--pc:${colorOf(pid)}">${esc(w)}</span>`).join(`<span class="wl-plus">+</span>`)}</div>`).join(`<div class="wl-arrow">↓</div>`)}
        <div class="wl-arrow">↓</div></div>` : "";
    const teamBar = `<div class="wl-team"><span>Teampunkte <b>${st.total}</b></span><span>Impuls <b>${st.impulse}/${st.rounds}</b></span>${st.step !== "final" ? `<span>Versuch <b>${st.attempt}/${st.maxTries}</b> · Treffer bringt <b>+${st.nextPoints}</b></span>` : ""}</div>`;
    let main = "";
    if (st.step === "writing") {
      main = `
        ${teamBar}
        <div class="wl-card">
          ${chainHtml}
          <div class="wl-prompt">${esc(st.prompt)}</div>
        </div>
        <form class="wl-form" autocomplete="off">
          <input id="wl-word" maxlength="40" spellcheck="false" autocapitalize="sentences" placeholder="Dein Wort …" value="${esc(wlMine)}">
          <button class="btn primary" type="submit">Abgeben</button>
        </form>
        <p id="wl-warn" class="err small"></p>
        <p id="wl-status" class="wl-status">${wlStatusHtml(st)}</p>
        ${st.attempt > 1 ? `<div class="slf-actions"><button id="wl-giveup" class="btn ghost sm">Impuls aufgeben (0 Punkte)</button></div>` : ""}`;
    } else if (st.step === "reveal" && counting) {
      // alle haben geschrieben – verdeckte Karten und Countdown
      main = `
        ${teamBar}
        <div class="wl-card"><div class="wl-prompt small">${esc(st.prompt)}</div></div>
        <div class="wl-countwrap"><div id="wl-count" class="wl-count">3</div><div class="muted small">Alle haben geschrieben – gleich wird aufgedeckt …</div></div>
        <div class="wl-words">${Object.keys(st.words).map((pid) => `
          <div class="wl-word back" style="--pc:${colorOf(pid)}"><span class="wl-who"><i class="pdot"></i>${esc(nameOf(pid))}</span><b>?</b></div>`).join("")}</div>`;
    } else if (st.step === "reveal") {
      const r = st.result;
      main = `
        ${teamBar}
        <div class="wl-card"><div class="wl-prompt small">${esc(st.prompt)}</div></div>
        <div class="wl-words ${r.hit ? "has-hit" : ""}">${Object.entries(st.words).map(([pid, w]) => `
          <div class="wl-word ${r.ids.includes(pid) ? "hit" : ""} ${flip ? "flip" : ""}" style="--pc:${colorOf(pid)}"><span class="wl-who"><i class="pdot"></i>${esc(nameOf(pid))}</span><b>${esc(w)}</b></div>`).join("")}</div>
        <div class="${flip ? "wl-late" : ""}">${r.hit
          ? `<div class="banner win"><div class="trophy">🎉</div><b>Gleiche Wellenlänge!</b> „${esc(r.word)}“ – +${st.nextPoints} Punkte
              <div class="banner-actions"><button id="wl-next" class="btn primary next-btn">${st.impulse >= st.rounds ? "Zum Ergebnis" : "Nächster Impuls"}</button></div></div>`
          : `<div class="banner row"><div class="banner-text"><b>Knapp daneben!</b> ${st.attempt >= st.maxTries ? "Das war der letzte Versuch." : "Im nächsten Versuch werden eure Wörter zum Impuls."}</div>
              <div class="banner-actions"><button id="wl-next" class="btn primary next-btn">${st.attempt >= st.maxTries ? "Weiter" : "Nächster Versuch"}</button>
              ${st.attempt < st.maxTries ? `<button id="wl-giveup" class="btn ghost sm">Aufgeben</button>` : ""}</div></div>`}</div>`;
    } else if (st.step === "final") {
      const max = st.rounds * 10;
      main = `
        <div class="banner win"><div class="trophy">${st.total >= max * 0.6 ? "🏆" : "🤝"}</div><b>Ihr habt ${st.total} von ${max} Punkten!</b>
          ${st.newRecord ? " <span class=\"host-tag\">Neuer Rekord!</span>" : st.best != null ? ` Rekord: ${st.best}` : ""}
          <div class="banner-actions"><button id="wl-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${st.history.map((h) => `
          <div class="slf-rank"><span class="slf-medal">${h.success ? "✅" : "❌"}</span>
            <span class="slf-name">${esc(h.base)}${h.word ? ` → <b>„${esc(h.word)}“</b>` : ""}</span>
            <span class="muted small">${h.attempts} Versuch${h.attempts > 1 ? "e" : ""}</span><b>+${h.points}</b></div>`).join("")}</div>`;
    }
    app.innerHTML = `
      <main class="screen game slf wl">
        <header class="top topbar">
          ${headBrandHtml("wl")}
          <div class="meta"><span class="stube-code">Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="players">${wlChips(v, st)}</section>
        <section class="slf-main">${main}</section>
      </main>`;
    // Treffer: die gleichen Wörter fliegen aufeinander zu
    if (counting) wlCountdown(rk, countLeft, !!(st.result && st.result.hit));
    if (flip) wlJustFlipped = null;
    if (st.step === "reveal" && !counting && st.result && st.result.hit) {
      const hits = [...app.querySelectorAll(".wl-word.hit")];
      if (hits.length >= 2 && hits[0].animate) {
        const rs = hits.map((h) => h.getBoundingClientRect()), cx = rs.reduce((a, r) => a + r.left + r.width / 2, 0) / rs.length;
        hits.forEach((h, i) => {
          const dx = cx - (rs[i].left + rs[i].width / 2);
          h.animate([{ transform: "translateX(0) scale(1)" }, { transform: `translateX(${dx * .55}px) scale(1.12)`, offset: .45 }, { transform: "translateX(0) scale(1)" }],
            { duration: 1100, delay: flip ? 650 : 0, easing: "cubic-bezier(.3,.7,.3,1)" });
        });
      }
    }
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#wl-next", () => send({ type: "wlNext" }));
    on("#wl-giveup", async () => { if (await askConfirm("Impuls aufgeben?", "Dafür gibt es 0 Punkte.", "Aufgeben")) send({ type: "wlGiveUp" }); });
    on("#wl-restart", () => send({ type: "wlRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    const form = app.querySelector(".wl-form");
    if (form) {
      const inp = form.querySelector("#wl-word"), warn = app.querySelector("#wl-warn");
      if (matchMedia("(pointer: fine)").matches && !st.submitted.includes(G.myId)) inp.focus();
      inp.oninput = () => { warn.textContent = ""; };
      form.onsubmit = (e) => {
        e.preventDefault();
        const w = inp.value.trim();
        if (!w) return;
        if (st.used.some((u) => WL.same(u, w))) { warn.textContent = `„${w}“ wurde schon genannt – such ein anderes Wort.`; return; }
        wlMine = w; send({ type: "wlWord", word: w });
        app.querySelector("#wl-status").innerHTML = wlStatusHtml({ ...st, submitted: st.submitted.includes(G.myId) ? st.submitted : st.submitted.concat(G.myId) });
      };
    }
  }


  return {
    renderWl,
  };
});
