// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, askConfirm, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Wer bin ich? ----------
  let werRendered = null, werFocus = null, werGuess = false, werDraft = { q: "", g: "", key: "" };
  // Frage-Ideen für den Anfang (Antippen setzt sie ins Eingabefeld)
  const IDEAS = ["Bin ich ein Mann?", "Lebe ich noch?", "Bin ich eine erfundene Figur?", "Komme ich aus Europa?", "Mache ich Musik?", "Bin ich Sportler?", "Bin ich älter als 50?", "Komme ich aus Südtirol?"];
  const yr = (y) => y < 0 ? `${-y} v. Chr.` : String(y);
  // Lebensdaten in Worten – wichtig für Fragen wie „Lebe ich noch?“ oder „Bin ich älter als 50?“
  function lifeTxt(p) {
    if (p.fik) return { chip: "", line: esc(p.aus) };
    const now = new Date().getFullYear(), um = p.ca ? "um " : "";
    if (p.tot == null) { const age = now - p.geb; return { chip: `🟢 lebt · ca. ${age} Jahre`, line: `geboren ${yr(p.geb)} – heute etwa ${age - 1}–${age} Jahre alt` }; }
    const age = p.tot - p.geb;
    return { chip: `✝ gestorben ${um}${yr(p.tot)}`, line: `geboren ${um}${yr(p.geb)}, gestorben ${um}${yr(p.tot)} mit ${p.ca ? "etwa " : "ca. "}${age} Jahren${now - p.tot <= 3 ? " (erst vor Kurzem)" : ""}` };
  }
  function stbHtml(p, owner, color) {
    const life = lifeTxt(p);
    return `<div class="wer-stb" style="--pc:${color}">
      <div class="wer-stb-h"><small>${owner}</small><b>${esc(p.n)}</b></div>
      <div class="wer-chips"><span>${esc(p.b)}</span><span>${p.g === "w" ? "♀ Frau" : "♂ Mann"}</span>${life.chip ? `<span>${life.chip}</span>` : ""}</div>
      <dl class="wer-dl"><dt>Herkunft</dt><dd>${esc(p.land)}</dd><dt>${p.fik ? "Was" : "Beruf"}</dt><dd>${esc(p.beruf)}</dd><dt>${p.fik ? "Aus" : "Lebenszeit"}</dt><dd>${life.line}</dd></dl>
      <div class="wer-flbl">Bekannt für</div><ul class="wer-facts">${p.f.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
  }
  const resTxt = { ja: "✓ Ja", nein: "✗ Nein", unklar: "🤷 Unklar", egal: "🤷 Weiß nicht" };

  function renderWer() {
    const v = G.view, st = v.wer;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me), myTurn = st.turn === me;
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const priv = G.wattenPriv && G.wattenPriv.wer ? G.wattenPriv.persons || {} : {};
    const person = (id) => st.revealed[id] || (id !== me || !seated ? priv[id] : null) || null;
    // Steckbrief daneben: angeklickter Spieler, sonst wer dran ist (nie die eigene Person, solange sie geheim ist)
    const canSee = (id) => id && !!person(id) && (id !== me || !!st.revealed[id]);
    if (!canSee(werFocus) || (werFocus === me && st.step !== "final")) werFocus = null;
    const focus = werFocus || (st.turn && st.turn !== me && canSee(st.turn) ? st.turn : st.seats.find((id) => id !== me && canSee(id) && !st.solved[id]) || st.seats.find((id) => id !== me && canSee(id)));
    if (werDraft.key !== v.code + ":" + st.turn) { werDraft = { q: "", g: "", key: v.code + ":" + st.turn }; werGuess = false; }
    const key = [v.code, st.move, st.step, JSON.stringify(st.q && st.q.answers), focus, werGuess, Object.keys(priv).length, st.need.join(), st.note, JSON.stringify(st.rr)].join("|");
    if (werRendered === key && app.querySelector(".wer-main")) return;
    werRendered = key;

    // Stirnzettel: alle am Tisch – bei den anderen steht die Person drauf, bei dir „?“
    const place = (id) => st.solved[id] && !st.solved[id].gaveUp ? st.solved[id].at : 0;
    const cards = st.order.map((id) => {
      const p = person(id), s = st.solved[id], mine = id === me && seated;
      const who = mine && !st.revealed[id] ? `<span class="wer-who q">❓ ???</span>` : p ? `<span class="wer-who">${esc(p.n)}</span>` : `<span class="wer-who q">…</span>`;
      const tag = st.step !== "final" && st.turn === id ? (mine ? "du bist dran" : "ist dran") : s ? (s.gaveUp ? "aufgegeben" : `✓ erraten · ${place(id)}.`) : `${st.qn[id]} ${st.qn[id] === 1 ? "Frage" : "Fragen"}`;
      return `<button type="button" class="wer-p ${st.turn === id ? "turn" : ""} ${mine ? "me" : ""} ${s ? "done" : ""} ${focus === id ? "sel" : ""}" data-werp="${esc(id)}" style="--pc:${colorOf(id)}" ${canSee(id) ? "" : "disabled"}>
        <span class="wer-av">${esc((nameOf(id)[0] || "?").toUpperCase())}</span><span class="wer-pt"><b class="wer-nm">${esc(nameOf(id))}${mine ? " <em>(du)</em>" : ""}</b>${who}</span>
        <span class="wer-tag">${tag}</span>${st.hints && !s ? `<span class="wer-hint" title="Bereich">${esc(st.hints[id])}</span>` : ""}</button>`;
    }).join("");

    // Was zuletzt passiert ist
    let last = "";
    const L = st.last;
    if (L && st.step !== "final") {
      const by = L.by === me ? "Du" : esc(nameOf(L.by)), next = st.turn ? (st.turn === me ? "jetzt bist du dran" : `jetzt ist ${esc(nameOf(st.turn))} dran`) : "";
      if (L.kind === "q") last = `<div class="wer-last r-${L.r}"><span class="wer-lq">${by} ${L.by === me ? "fragtest" : "fragte"}${L.loud ? " laut" : ""}${L.text ? `: „${esc(L.text)}“` : ""}</span>
        <b>${resTxt[L.r]}</b><small>${L.tally.ja} Ja · ${L.tally.nein} Nein${L.tally.egal ? ` · ${L.tally.egal} weiß nicht` : ""} – ${L.r === "nein" ? next : L.by === me ? "du darfst weiterfragen" : "darf weiterfragen"}</small></div>`;
      else if (L.kind === "guess" && L.ok) last = `<div class="wer-last r-ja win"><span class="wer-lq">🎉 ${by} ${L.by === me ? "hast" : "hat"} es erraten!</span><b>${esc((st.revealed[L.by] || {}).n || L.text)}</b><small>${next}</small></div>`;
      else if (L.kind === "guess") last = `<div class="wer-last r-nein"><span class="wer-lq">${by} ${L.by === me ? "hast" : "hat"} ${L.text ? `auf „${esc(L.text)}“ getippt` : "laut geraten"}</span><b>✗ Falsch</b><small>${next}</small></div>`;
      else if (L.kind === "giveup") last = `<div class="wer-last"><span class="wer-lq">${by} ${L.by === me ? "gibst" : "gibt"} auf – es war</span><b>${esc((st.revealed[L.by] || {}).n || "?")}</b><small>${next}</small></div>`;
      else if (L.kind === "reroll") last = `<div class="wer-last"><span class="wer-lq">🎲 ${by} ${L.by === me ? "hast" : "hat"} für ${L.for === me ? "dich" : esc(nameOf(L.for))} eine neue Person gelost</span>${L.for === me ? "<small>Du hast eine andere Person bekommen – du weißt aber nicht, welche.</small>" : ""}</div>`;
      else if (L.kind === "skip") last = `<div class="wer-last"><span class="wer-lq">${by} ist nicht mehr da</span><small>${next}</small></div>`;
    }
    const bubble = st.q ? `<div class="fq-bubble2 wer-bubble" style="--pc:${colorOf(st.turn)}"><div class="who"><i>${esc(nameOf(st.turn).charAt(0).toUpperCase())}</i>${myTurn ? "Deine Frage" : esc(nameOf(st.turn)) + " fragt"}</div>
        <div class="q">${st.q.text ? esc(st.q.text) : `🗣️ ${myTurn ? "Du fragst" : "fragt"} laut${st.note ? ` <small class="wer-note">„${esc(st.note)}“</small>` : ""}`}</div></div>` : "";
    const tally = () => st.q ? `<ul class="wer-tally">${st.need.concat(Object.keys(st.q.answers).filter((id) => !st.need.includes(id))).map((id) => { const a = st.q.answers[id];
      return `<li style="--pc:${colorOf(id)}" class="${a ? "a-" + a : ""}"><i class="pdot"></i>${esc(nameOf(id))}${id === me ? " (du)" : ""}<b>${a ? resTxt[a] : "…"}</b></li>`; }).join("")}</ul>` : "";
    const waiting = (id, text, icon) => `<div class="fq-wait2" style="--pc:${colorOf(id)}"><span class="ico">${icon}</span><div><b>${esc(nameOf(id))}</b> ${text}<span class="fq-dotsanim"><i></i><i></i><i></i></span></div></div>`;
    const notes = (id, title) => { const lg = st.log[id] || []; return lg.length ? `<div class="wer-notes"><div class="wer-flbl">${title}</div><ol>${lg.map((x) => `<li class="r-${x.r}"><span>${x.t ? esc(x.t) : "🗣️ laut gefragt"}</span><b>${resTxt[x.r]}</b></li>`).join("")}</ol></div>` : ""; };

    const loud = st.opts.ask === "laut";
    const answerHtml = (p, mine) => `${p ? `<div class="wer-chips wer-mini"><span>${esc(p.b)}</span><span>${p.g === "w" ? "♀ Frau" : "♂ Mann"}</span>${lifeTxt(p).chip ? `<span>${lifeTxt(p).chip}</span>` : ""}<span>📍 ${esc(p.land)}</span></div>` : ""}
          <div class="wer-ans">${["ja", "nein", "egal"].map((k) => `<button type="button" class="wer-a a-${k} ${mine === k ? "on" : ""}" data-wera="${k}">${{ ja: "✓ Ja", nein: "✗ Nein", egal: "🤷 Weiß nicht" }[k]}</button>`).join("")}</div>`;
    // laut: Stichwort für den eigenen Notizzettel (freiwillig)
    const noteForm = `<form class="du-form wer-nform" autocomplete="off"><input id="wer-n" maxlength="120" placeholder="Stichwort für deinen Notizzettel (freiwillig), z. B. „Mann?“" enterkeyhint="done"><button class="btn ghost">Merken</button></form>
          ${st.note ? `<p class="muted small">📝 Gemerkt: „${esc(st.note)}“</p>` : ""}`;
    let body = "";
    if (st.step === "ask" && myTurn) {
      const hint = st.hints ? `<p class="wer-myhint">Tipp: Du bist aus dem Bereich <b>${esc(st.hints[me])}</b>.</p>` : "";
      body = werGuess
        ? `<div class="wer-me">🎯 Wer bist du?</div>
          <form class="du-form wer-gform" autocomplete="off"><input id="wer-g" maxlength="80" placeholder="Name der Person …" enterkeyhint="send"><button class="btn primary">Raten</button></form>
          <div class="wer-row"><button type="button" id="wer-back" class="btn ghost sm">← Doch lieber fragen</button></div>
          <p class="muted small">Liegst du falsch, ist der Nächste dran.</p>`
        : loud ? `<div class="wer-me">🗣️ Du bist dran – stell deine Frage laut!</div>${hint}
          <p class="wer-loud">Frag einfach im Anruf oder am Tisch, z. B. „Bin ich ein Mann?“. Die anderen antworten per Knopf, das Ergebnis siehst du hier.</p>
          ${noteForm}
          <div class="wer-row"><button type="button" id="wer-loudguess" class="btn primary">🎯 Ich rate jetzt laut</button><button type="button" id="wer-guess" class="btn ghost sm">⌨️ Namen eintippen</button><button type="button" id="wer-giveup" class="btn ghost sm">Aufgeben</button></div>
          <p class="muted small">Bei <b>Ja</b> darfst du weiterfragen, bei <b>Nein</b> ist der Nächste dran.</p>`
        : `<div class="wer-me">❓ Du bist dran – wer bist du?</div>${hint}
          <form class="du-form wer-qform" autocomplete="off"><input id="wer-q" maxlength="200" placeholder="Ja/Nein-Frage über dich …" enterkeyhint="send"><button class="btn primary">Fragen</button></form>
          ${(st.log[me] || []).length < 3 ? `<div class="wer-ideas">${IDEAS.map((x) => `<button type="button" class="wer-idea" data-weridea="${esc(x)}">${esc(x)}</button>`).join("")}</div>` : ""}
          <div class="wer-row"><button type="button" id="wer-guess" class="btn primary">🎯 Ich weiß es!</button><button type="button" id="wer-giveup" class="btn ghost sm">Aufgeben</button></div>
          <p class="muted small">Bei <b>Ja</b> darfst du weiterfragen, bei <b>Nein</b> ist der Nächste dran.</p>`;
      body += notes(me, "Dein Notizzettel");
    } else if (st.step === "ask" && loud && seated) {
      const p = person(st.turn);
      body = `<div class="wer-ask">🗣️ <b>${esc(nameOf(st.turn))}</b> fragt gleich laut. Stimmt die Frage für <b>${p ? esc(p.n) : "…"}</b>?</div>
          ${answerHtml(p, null)}<p class="muted small">Tippe, sobald du die Frage gehört hast.</p>`
        + (!st.solved[me] ? notes(me, "Dein Notizzettel") : "");
    } else if (st.step === "ask") {
      body = waiting(st.turn, loud ? "stellt gleich laut eine Frage" : "überlegt sich eine Frage", "🤔") + (seated && !st.solved[me] ? notes(me, "Dein Notizzettel") : "");
    } else if (st.step === "answer") {
      const p = person(st.turn), mine = st.q.answers[me], canAnswer = seated && !myTurn;
      body = bubble + (canAnswer
        ? `<div class="wer-ask">Stimmt das für <b>${p ? esc(p.n) : "…"}</b>?</div>
          ${answerHtml(p, mine)}
          ${mine ? `<p class="muted small">Du kannst deine Antwort noch ändern, bis alle geantwortet haben.</p>` : ""}`
        : myTurn ? `<p class="muted small">Die anderen antworten …</p>${loud && !st.q.text ? noteForm : ""}` : "") + tally()
        + ((myTurn || G.isHost) && Object.keys(st.q.answers).length && st.need.some((id) => !st.q.answers[id]) ? `<div class="wer-row"><button type="button" id="wer-resolve" class="btn ghost sm">Nicht warten – jetzt auswerten</button></div>` : "");
    } else if (st.step === "judge") {
      const p = person(st.turn);
      body = st.guess.loud ? (myTurn ? `<div class="wer-me">🗣️ Sag laut, wer du bist!</div><p class="muted small">⚖️ Die anderen tippen an, ob du richtig liegst …</p>`
        : `<div class="wer-ask">🗣️ <b>${esc(nameOf(st.turn))}</b> rät jetzt laut.</div>
          <div class="fq-cmp"><div class="sec"><span>🎯 Gesucht</span><b>${p ? esc(p.n) : "…"}</b></div></div>
          ${seated ? `<p class="muted small">Hat ${esc(nameOf(st.turn))} die Person richtig genannt?</p>
          <div class="wer-ans"><button type="button" class="wer-a a-ja" data-werjudge="1">✓ Richtig</button><button type="button" class="wer-a a-nein" data-werjudge="0">✗ Falsch</button></div>` : ""}`)
        : myTurn ? `<div class="wer-me">🎯 Du tippst auf „${esc(st.guess.text)}“</div><p class="muted small">⚖️ Das Spiel hat den Namen nicht sicher erkannt – die anderen prüfen, ob es stimmt …</p>`
        : `<div class="wer-ask"><b>${esc(nameOf(st.turn))}</b> tippt auf <b>„${esc(st.guess.text)}“</b></div>
          <div class="fq-cmp"><div class="sec"><span>🎯 Gesucht</span><b>${p ? esc(p.n) : "…"}</b></div><div class="none"><span>💬 Getippt</span><b>${esc(st.guess.text)}</b></div></div>
          ${seated ? `<p class="muted small">Das Spiel hat den Namen nicht sicher erkannt. Ist es dieselbe Person?</p>
          <div class="wer-ans"><button type="button" class="wer-a a-ja" data-werjudge="1">✓ Richtig</button><button type="button" class="wer-a a-nein" data-werjudge="0">✗ Falsch</button></div>` : ""}`;
    } else {
      const r = st.ranking || [], winners = r.filter((x) => x.at === 1).map((x) => x.id);
      const items = r.map((x, i) => ({ id: x.id, name: nameOf(x.id), pts: r.length - i, txt: x.at ? `nach ${x.q} ${x.q === 1 ? "Frage" : "Fragen"}` : x.gaveUp ? "aufgegeben" : "nicht erraten", sub: st.revealed[x.id] ? esc(st.revealed[x.id].n) : "" }));
      body = (winners.length ? G.podiumHtml({ items, winners, restartId: "wer-restart" })
        : `<div class="banner"><b>Niemand hat seine Person erraten.</b><div class="banner-actions"><button id="wer-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>`)
        + `<div class="wer-reveal">${st.order.map((id) => { const p = st.revealed[id]; return p ? `<div style="--pc:${colorOf(id)}"><small>${esc(nameOf(id))} war</small><b>${esc(p.n)}</b></div>` : ""; }).join("")}</div>`;
    }

    const fp = focus ? person(focus) : null;
    const reroll = (id) => seated && id !== me && st.rerollable.includes(id)
      ? `<button type="button" class="btn ghost sm wer-reroll" data-werreroll="${esc(id)}">🎲 Kennt ${esc(nameOf(id))} vermutlich nicht? Neue Person losen</button>` : "";
    const side = st.step === "final" ? (fp ? stbHtml(fp, `${esc(nameOf(focus))} war`, colorOf(focus)) : "")
      : fp ? stbHtml(fp, `Steckbrief · Person von ${esc(nameOf(focus))}${focus === st.turn ? " (ist dran)" : ""}`, colorOf(focus)) + reroll(focus) + (focus !== me ? notes(focus, `Fragen von ${esc(nameOf(focus))}`) : "")
      : `<div class="wer-stb empty"><p class="muted small">Tippe oben auf einen Mitspieler, um den Steckbrief seiner Person zu sehen.</p></div>`;
    const head = `<div class="qz-head"><span class="qz-ico">${st.step === "final" ? "🏆" : st.step === "answer" ? "💬" : st.step === "judge" ? "⚖️" : "❓"}</span><div><small>Wer bin ich? · ${esc(st.themeName)}</small>
        <b>${st.step === "final" ? "Endstand" : st.turn === me ? "Du bist dran" : esc(nameOf(st.turn)) + " ist dran"}</b></div></div>`;
    app.innerHTML = `
      <main class="screen game wer">
        <header class="top topbar">
          ${headBrandHtml("wer")}
          <div class="meta">${st.seats.length} am Tisch<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${G.isHost && st.step !== "final" ? `<button type="button" id="wer-end" class="btn ghost sm wer-endbtn" title="Spiel beenden und alle Personen aufdecken">Aufdecken</button>` : ""}
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="wer-main">
          <div class="wer-table">${cards}</div>
          <div class="wer-grid">
            <div class="panel quiz-card qz-card wer-card">${head}${last}${body}</div>
            <aside class="wer-side">${side}</aside>
          </div>
          ${!seated ? `<p class="muted small du-watch">Du schaust zu.</p>` : ""}
        </section>
      </main>`;

    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#wer-restart", () => send({ type: "wbRestart" }));
    on("#wer-end", async () => { if (await askConfirm("Spiel beenden?", "Alle Personen werden aufgedeckt.", "Aufdecken")) send({ type: "wbEnd" }); });
    on("#wer-resolve", () => send({ type: "wbResolve", move: st.move }));
    app.querySelectorAll("[data-werreroll]").forEach((b) => b.onclick = async () => { const id = b.dataset.werreroll;
      if (await askConfirm("Neue Person losen?", `${nameOf(id)} bekommt eine andere Person. Das geht nur, solange ${nameOf(id)} noch keine Frage gestellt hat.`, "Neu losen")) send({ type: "wbReroll", target: id }); });
    on("#wer-loudguess", () => send({ type: "wbGuess", loud: true, move: st.move }));
    on("#wer-guess", () => { werGuess = true; werRendered = null; renderWer(); });
    on("#wer-back", () => { werGuess = false; werRendered = null; renderWer(); });
    on("#wer-giveup", async () => { if (await askConfirm("Aufgeben?", "Deine Person wird aufgedeckt und du rätst nicht mehr mit (antworten kannst du weiter).", "Aufgeben")) send({ type: "wbGiveUp", move: st.move }); });
    app.querySelectorAll("[data-werp]").forEach((b) => b.onclick = () => { werFocus = b.dataset.werp; werRendered = null; renderWer(); });
    app.querySelectorAll("[data-wera]").forEach((b) => b.onclick = () => { send({ type: "wbAnswer", v: b.dataset.wera, move: st.move });
      app.querySelectorAll("[data-wera]").forEach((x) => x.classList.toggle("on", x === b)); });
    app.querySelectorAll("[data-werjudge]").forEach((b) => b.onclick = () => { app.querySelectorAll("[data-werjudge]").forEach((x) => x.disabled = true); send({ type: "wbJudge", ok: b.dataset.werjudge === "1", move: st.move }); });
    const form = (sel, inpSel, field, type) => {
      const f = app.querySelector(sel); if (!f) return;
      const inp = f.querySelector(inpSel); inp.value = werDraft[field]; inp.oninput = () => { werDraft[field] = inp.value; };
      setTimeout(() => inp.focus(), 30);
      f.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return;
        inp.disabled = true; werDraft[field] = ""; send({ type, text: t, move: st.move });
        setTimeout(() => { if (inp.isConnected) { inp.disabled = false; inp.value = t; } }, 4000); }; // kam nicht an: wieder freigeben
    };
    form(".wer-qform", "#wer-q", "q", "wbAsk");
    form(".wer-gform", "#wer-g", "g", "wbGuess");
    const nf = app.querySelector(".wer-nform");
    if (nf) { const inp = nf.querySelector("#wer-n"); inp.value = werDraft.n || ""; inp.oninput = () => { werDraft.n = inp.value; };
      nf.onsubmit = (e) => { e.preventDefault(); send({ type: "wbNote", text: inp.value.trim() }); werDraft.n = ""; inp.value = ""; }; }
    app.querySelectorAll("[data-weridea]").forEach((b) => b.onclick = () => { const i = app.querySelector("#wer-q"); if (i) { i.value = b.dataset.weridea; werDraft.q = i.value; i.focus(); } });
  }

  return {
    renderWer,
  };
});
