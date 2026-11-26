// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Unterm Hammer ----------
  let auRendered = null;
  const eur = (n) => `${Number(n).toLocaleString("de-DE")} €`;
  const sgn = (n) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${eur(Math.abs(n))}`; // Gewinn/Verlust mit Vorzeichen

  function renderAuktion() {
    const v = G.view, st = v.auktion;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me);
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const key = [v.code, st.move, st.step, JSON.stringify(v.players.map((p) => [p.id, p.connected, p.paused]))].join("|");
    if (auRendered === key && app.querySelector(".au-main")) return;
    auRendered = key;
    // eigenes Gebot im Eingabefeld nicht verlieren, wenn ein anderer gerade bietet
    const oldInp = app.querySelector("#au-amt"), keep = oldInp ? { val: oldInp.value, focus: document.activeElement === oldInp } : null;

    const it = st.items[st.idx], high = st.high, lead = high && high.by === me;
    const myBudget = st.budget[me] || 0, hide = st.reveal === "ende";
    const canGo = seated || G.isHost;
    // Urteil zu einem versteigerten Produkt (echter Preis bekannt)
    const whom = (x) => x.buyer === me ? "dich" : esc(nameOf(x.buyer));
    const verdict = (x) => !x.buyer ? `Keiner hat geboten – es geht zurück ins Lager.`
      : x.paid < x.p ? `Schnäppchen! <b class="pos">${sgn(x.p - x.paid)}</b> für ${whom(x)}.`
      : x.paid === x.p ? `Genau den Preis getroffen – <b>±0 €</b> für ${whom(x)}.` : `Zu teuer! <b class="neg">${sgn(x.p - x.paid)}</b> für ${whom(x)}.`;
    const resBox = (x) => `<div class="au-res ${!x.buyer || x.paid === x.p ? "" : x.paid < x.p ? "good" : "bad"}"><small>Echter Preis</small><b>${eur(x.p)}</b><span class="muted small">${esc(x.d || "")}</span><p>${verdict(x)}</p></div>`;
    let panel = "";
    if (st.step === "bid" || st.step === "sold") {
      const sold = st.step === "sold";
      // Kopf: Produkt und Höchstgebot
      const bidBox = high
        ? `<div class="au-high" style="--pc:${colorOf(high.by)}"><small>${sold ? "Zuschlag" : "Höchstgebot"}</small><b>${eur(high.amt)}</b><span><i class="pdot"></i>${esc(nameOf(high.by))}${high.by === me ? " (du)" : ""}</span></div>`
        : `<div class="au-high none"><small>${sold ? "Unverkauft" : "Höchstgebot"}</small><b>${sold ? "–" : "noch keins"}</b><span>${sold ? "Keiner wollte bieten" : "Wer bietet zuerst?"}</span></div>`;
      let act = "";
      if (st.step === "bid") {
        if (!seated) act = `<p class="muted small">Du schaust zu.</p>`;
        else if (lead) act = `<div class="au-lead">🔨 <b>Du führst mit ${eur(high.amt)}.</b> Steigen alle anderen aus, gehört es dir.</div>`;
        else if (st.out[me]) act = `<div class="au-lead out">${st.passed[me] ? "Du bist bei diesem Produkt ausgestiegen." : myBudget < (high ? high.amt + 1 : st.min) ? `Dein Geld reicht nicht für ein höheres Gebot (noch ${eur(myBudget)}).` : "Du bist bei diesem Produkt raus."}</div>`;
        else {
          const base = high ? high.amt : 0;
          const quick = [...new Set(st.steps.map((d) => base + d))].filter((x) => x <= myBudget);
          act = `<div class="au-bids">${quick.map((x) => `<button type="button" class="btn au-q" data-aubid="${x}">${eur(x)}</button>`).join("")}</div>
            <form class="au-form"><input id="au-amt" type="number" inputmode="numeric" min="${base + 1}" max="${myBudget}" step="1" placeholder="Betrag in €" title="Eigenes Gebot: ${eur(base + 1)} bis ${eur(myBudget)}" autocomplete="off"><button type="submit" class="btn primary">Bieten</button><button type="button" id="au-pass" class="btn ghost au-pass">Aussteigen</button></form>`;
        }
      }
      // Auflösung: echter Preis und ob es sich gelohnt hat
      let res = "";
      if (sold) {
        const last = st.idx + 1 >= st.total;
        res = (hide ? `<div class="au-res au-hidden"><span class="ico">🔨</span><p>${!high ? "Keiner hat geboten – es geht zurück ins Lager."
            : `${high.by === me ? "Du kaufst" : esc(nameOf(high.by)) + " kauft"} für <b>${eur(high.amt)}</b>.`}</p><span class="muted small">Was es wirklich kostet, zeigt der Kassensturz am Ende.</span></div>` : resBox(it))
          + (canGo ? `<div class="wer-row pult-move"><button type="button" id="au-next" class="btn primary next-btn">${last ? (hide ? "Zum Kassensturz" : "Zum Ergebnis") : "Nächstes Produkt"}</button></div>` : "");
      }
      // Wer bietet noch mit?
      const chips = st.seats.map((id) => {
        const lead1 = high && high.by === id, out = st.out[id] || (sold && !lead1);
        const kick = G.isHost && st.step === "bid" && id !== me && !lead1 && !out ? `<button type="button" class="au-kick" data-aukick="${esc(id)}" title="Für ${esc(nameOf(id))} aussteigen">⏭</button>` : "";
        return `<span class="au-chip ${lead1 ? "lead" : out ? "out" : ""}" style="--pc:${colorOf(id)}"><i class="pdot"></i>${esc(nameOf(id))}${id === me ? " (du)" : ""}<em>${lead1 ? (sold ? "Zuschlag" : "führt") : out ? "raus" : "bietet mit"}</em>${kick}</span>`;
      }).join("");
      panel = `<div class="au-top"><div class="au-prod"><small>Produkt ${st.idx + 1} von ${st.total}</small><span class="ico">${it.e}</span><b>${esc(it.n)}</b></div>${bidBox}</div>
        <div class="au-chips">${chips}</div>${act}${res}`;
    }
    if (st.step === "kasse") { // Produkt für Produkt aufdecken, die Punkte zählen mit
      const x = st.kcur != null ? st.items[st.kcur] : null, done = st.kidx >= st.ktotal;
      panel = `<div class="au-kasse-head"><span class="ico">🧾</span><div><small>Kassensturz</small><b>${st.kidx ? `${st.kidx} von ${st.ktotal} aufgedeckt` : "Was war es wirklich wert?"}</b></div></div>
        ${x ? `<div class="au-top"><div class="au-prod"><span class="ico">${x.e}</span><b>${esc(x.n)}</b></div>
            ${x.buyer ? `<div class="au-high" style="--pc:${colorOf(x.buyer)}"><small>Bezahlt</small><b>${eur(x.paid)}</b><span><i class="pdot"></i>${esc(nameOf(x.buyer))}${x.buyer === me ? " (du)" : ""}</span></div>`
              : `<div class="au-high none"><small>Unverkauft</small><b>–</b><span>Keiner wollte bieten</span></div>`}</div>${resBox(x)}`
          : `<p class="au-kasse-intro">Alle Produkte sind versteigert. Jetzt kommen die echten Preise – eins nach dem anderen. Unter Wert gekauft gibt <b>Plus</b>, zu teuer gekauft <b>Minus</b>; übriges Geld zählt mit.</p>`}
        ${canGo ? `<div class="wer-row pult-move au-kasse-acts">${done ? `<button type="button" id="au-reveal" class="btn primary next-btn">Zum Ergebnis</button>`
          : `<button type="button" id="au-reveal" class="btn primary next-btn">${st.kidx ? "Nächstes aufdecken" : "Erstes aufdecken"}</button><button type="button" id="au-revall" class="btn ghost">Alle aufdecken</button>`}</div>` : ""}`;
    }
    if (st.step === "final") {
      const items = st.seats.map((id) => ({ id, name: nameOf(id), pts: st.gain[id], txt: `Endstand ${eur(st.budget0 + st.gain[id])}`, sub: `${sgn(st.gain[id])} ${st.gain[id] < 0 ? "Verlust" : "Gewinn"}` }));
      panel = G.podiumHtml({ items, winners: st.winners || [], restartId: "au-restart", info: `Unterm Hammer · ${st.total} Produkte · Startgeld ${eur(st.budget0)}` });
    }

    // Sortiment: was kommt, was ist weg (mit echtem Preis und Käufer)
    const later = st.items.filter((x) => x.hidden).length, running = st.step === "bid" || st.step === "sold";
    const list = st.items.map((x, i) => x.hidden ? "" : (() => {
      const cur = st.step === "kasse" ? i === st.kcur : i === st.idx && st.step !== "final";
      const known = x.p != null;
      const info = !x.sold ? "jetzt unter dem Hammer"
        : x.buyer ? `${esc(nameOf(x.buyer))}: ${eur(x.paid)}${known ? ` · wert ${eur(x.p)} · ${sgn(x.p - x.paid)}` : ""}` : `unverkauft${known ? ` · wert ${eur(x.p)}` : ""}`;
      const cls = !x.sold ? "" : !x.buyer ? "none" : !known || x.paid === x.p ? "got" : x.paid < x.p ? "ok" : "bad";
      return `<li class="${cur ? "on" : ""} ${cls}" ${x.buyer ? `style="--pc:${colorOf(x.buyer)}"` : ""}><span class="ico">${x.e}</span><span class="nm">${esc(x.n)}</span><small>${info}</small></li>`;
    })()).join("") + (running && later ? `<li class="au-later"><span class="ico">🎁</span><span class="nm">Noch ${later === 1 ? "ein Produkt" : later + " Produkte"} – was kommt, ist geheim</span></li>` : "");
    // Stand (Startgeld ± bisher aufgedeckte Gewinne/Verluste) nur, wenn schon etwas aufgedeckt ist – vorher Geld und Zahl der Käufe
    const sc = (id) => st.gain ? st.gain[id] : 0, scTxt = (id) => st.gain ? sgn(st.gain[id]) : `🛒 ${st.got[id]}`;
    const pult = st.seats.map((id) => ({ id, name: nameOf(id), pts: sc(id), ptsTxt: scTxt(id), turn: !!(high && high.by === id && st.step === "bid"),
      txt: `Geld: ${eur(st.budget[id])}` }));
    const stack = `<div class="ku-stack"><div class="panel quiz-card au-card">${panel}</div>
      <div class="panel au-list"><div class="wer-flbl">Sortiment · Startgeld je ${eur(st.budget0)}</div><ul>${list}</ul></div></div>`;
    const board = st.seats.map((id) => `<li style="--pc:${colorOf(id)}" class="${high && high.by === id ? "on" : ""}"><i class="pdot"></i><span>${esc(nameOf(id))}${id === me ? " (du)" : ""}<small class="au-money">Geld ${eur(st.budget[id])}</small></span><b>${scTxt(id)}</b></li>`).join("");
    app.innerHTML = `
      <main class="screen game ku au">
        <header class="top topbar">
          ${headBrandHtml("auktion")}
          <div class="meta">${st.step === "final" ? "Ende" : st.step === "kasse" ? "Kassensturz" : `Produkt ${st.idx + 1}/${st.total}`}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="ku-main au-main">
          ${st.step !== "final" ? G.pultWrap(stack, pult) : stack}
          <aside class="tk-side"><div class="wer-flbl">${st.gain ? "Gewinn / Verlust" : "Gekauft"}</div><ul class="tk-board">${board}</ul></aside>
        </section>
      </main>`;

    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#au-restart", () => send({ type: "auRestart" }));
    on("#au-next", () => send({ type: "auNext", k: st.idx }));
    on("#au-pass", () => send({ type: "auPass", k: st.idx }));
    on("#au-reveal", () => send({ type: "auReveal", kidx: st.kidx }));
    on("#au-revall", () => send({ type: "auReveal", kidx: st.kidx, all: true }));
    const bid = (amt) => { app.querySelectorAll("[data-aubid], .au-form button").forEach((x) => x.disabled = true); send({ type: "auBid", k: st.idx, amt }); };
    app.querySelectorAll("[data-aubid]").forEach((b) => b.onclick = () => bid(Number(b.dataset.aubid)));
    app.querySelectorAll("[data-aukick]").forEach((b) => b.onclick = () => send({ type: "auPass", k: st.idx, who: b.dataset.aukick }));
    const form = app.querySelector(".au-form"), inp = app.querySelector("#au-amt");
    if (inp && keep) { inp.value = keep.val; if (keep.focus) inp.focus(); }
    if (form) form.onsubmit = (e) => {
      e.preventDefault();
      const amt = Math.round(Number(String(inp.value).replace(",", ".")));
      const base = high ? high.amt : 0;
      if (!(amt > base) || amt > myBudget) { inp.classList.add("shake"); setTimeout(() => inp.classList.remove("shake"), 400);
        G.toast(amt > myBudget ? `So viel Geld hast du nicht (noch ${eur(myBudget)}).` : `Das Gebot muss über ${eur(base)} liegen.`, "info"); return; }
      inp.value = ""; bid(amt);
    };
  }

  return {
    renderAuktion,
  };
});
