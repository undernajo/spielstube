// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Unterm Hammer ----------
  let auRendered = null;
  // Kassensturz als kleine Show – Ablauf je Produkt (ms nach dem Aufdecken):
  // Produkt und Kaufpreis erscheinen, „?“ mit Trommelwirbel, dann zählt der echte Preis hoch, die Differenz springt auf
  // und der Kontostand des Käufers zählt mit. Die Zeitpunkte gelten auch nach Neuzeichnen weiter (negative Animations-Verzögerung).
  const T = { paid: 500, price: 2000, diff: 3000, acct: 3600, done: 4700 };
  const kStart = new Map(); // Produkt → Zeitpunkt, an dem es hier zum ersten Mal aufgedeckt wurde
  let kTimers = [], kRaf = 0, kKey = null;
  const reduced = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
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
      // Kontostände groß – dazu, wer noch mitbietet, führt oder raus ist (ersetzt die kleinen Namens-Chips)
      const chips = st.seats.map((id) => {
        const lead1 = high && high.by === id, out = st.out[id] || (sold && !lead1);
        const kick = G.isHost && st.step === "bid" && id !== me && !lead1 && !out ? `<button type="button" class="au-kick" data-aukick="${esc(id)}" title="Für ${esc(nameOf(id))} aussteigen">⏭</button>` : "";
        const n = st.got[id], g = st.gain ? st.gain[id] : null;
        return `<div class="au-acct bidding ${lead1 ? "lead" : out ? "out" : ""}" style="--pc:${colorOf(id)}">
          <span class="nm"><i class="pdot"></i><span class="n">${esc(nameOf(id))}${id === me ? " (du)" : ""}</span><em class="au-st">${lead1 ? (sold ? "Zuschlag" : "führt") : out ? "raus" : "bietet mit"}</em>${kick}</span>
          <b>${eur(st.budget[id])}</b><small>${n ? `🛒 ${n} gekauft` : "noch nichts gekauft"}${g != null && n ? ` · ${sgn(g)}` : ""}</small>
          ${sold && lead1 ? `<em class="au-acct-delta spend">−${eur(high.amt)}</em>` : ""}</div>`;
      }).join("");
      panel = `<div class="au-accts au-accts-top">${chips}</div>
        <div class="au-top"><div class="au-prod"><small>Produkt ${st.idx + 1} von ${st.total}</small><span class="ico">${it.e}</span><b>${esc(it.n)}</b></div>${bidBox}</div>
        ${act}${res}`;
    }
    // Kassensturz: wie weit die Show des aktuellen Produkts ist
    let kEl = T.done, kFresh = false;
    if (st.step === "kasse" && st.kcur != null) {
      const k = v.code + ":" + st.kidx + ":" + st.kcur;
      if (!kStart.has(k)) { kStart.set(k, Date.now()); kFresh = true; }
      kEl = reduced() ? T.done : Date.now() - kStart.get(k);
    }
    const kShow = kEl < T.done; // Show läuft noch: Liste und Knöpfe erst danach
    if (st.step === "kasse") {
      const x = st.kcur != null ? st.items[st.kcur] : null, last = st.kidx >= st.ktotal;
      const diff = x && x.buyer ? x.p - x.paid : 0, tone = !x || !x.buyer || diff === 0 ? "even" : diff > 0 ? "good" : "bad";
      // Kontostände: Startgeld ± aufgedeckte Differenzen; der Käufer des aktuellen Produkts startet beim alten Stand und zählt hoch
      const accts = st.seats.map((id) => {
        const now = st.budget0 + st.gain[id], mine = x && x.buyer === id, from = mine ? now - diff : now;
        return { id, now, from, mine };
      });
      const shownVal = (a) => kShow && a.mine ? a.from : a.now, top = Math.max(...accts.map(shownVal));
      const acctHtml = accts.map((a) => `<div class="au-acct ${a.mine ? "mine " + tone : ""} ${shownVal(a) === top && st.kidx ? "top" : ""}" style="--pc:${colorOf(a.id)}">
          <span class="nm"><i class="pdot"></i>${esc(nameOf(a.id))}${a.id === me ? " (du)" : ""}</span>
          <b ${a.mine && a.from !== a.now ? `data-cnt="1" data-from="${a.from}" data-to="${a.now}" data-at="${T.acct}" data-dur="900"` : ""}>${eur(shownVal(a))}</b>
          <small>${sgn(shownVal(a) - st.budget0)} seit Start</small>
          ${a.mine && diff ? `<em class="au-acct-delta">${sgn(diff)}</em>` : ""}</div>`).join("");
      const stage = !x ? `<p class="au-kasse-intro">Alle Produkte sind versteigert. Jetzt kommen die echten Preise – eins nach dem anderen.<br>Unter Wert gekauft gibt <b>Plus</b>, zu teuer gekauft <b>Minus</b>. Alle starten mit <b>${eur(st.budget0)}</b>.</p>`
        : `<div class="au-k-prod"><span class="ico">${x.e}</span><b>${esc(x.n)}</b></div>
          <div class="au-k-row">
            ${x.buyer ? `<div class="au-k-box paid" style="--pc:${colorOf(x.buyer)}"><small>Ersteigert von</small><span class="who"><i class="pdot"></i>${esc(nameOf(x.buyer))}${x.buyer === me ? " (du)" : ""}</span><b>${eur(x.paid)}</b></div>`
              : `<div class="au-k-box paid none"><small>Unverkauft</small><span class="who">Keiner wollte bieten</span><b>–</b></div>`}
            <div class="au-k-box price ${tone}"><small>Echter Preis</small><b class="q">?</b><b class="v" data-cnt="1" data-from="0" data-to="${x.p}" data-at="${T.price}" data-dur="700">${eur(x.p)}</b><span class="d">${esc(x.d || "")}</span></div>
          </div>
          <div class="au-k-diff ${tone}">${!x.buyer ? "Zurück ins Lager – zählt für keinen." : diff > 0 ? `Schnäppchen! <b>${sgn(diff)}</b> für ${x.buyer === me ? "dich" : esc(nameOf(x.buyer))}` : diff < 0 ? `Zu teuer! <b>${sgn(diff)}</b> für ${x.buyer === me ? "dich" : esc(nameOf(x.buyer))}` : `Genau getroffen – <b>±0 €</b>`}</div>`;
      panel = `<div class="au-k ${x ? "" : "intro"}" style="--el:${-kEl}ms">
        <div class="au-kasse-head"><span class="ico">🧾</span><div><small>Kassensturz</small><b>${st.kidx ? `Produkt ${st.kidx} von ${st.ktotal}` : "Was war es wirklich wert?"}</b></div></div>
        <div class="au-k-stage">${stage}</div>
        <div class="au-accts">${acctHtml}</div>
        ${canGo ? `<div class="au-kasse-acts ${x ? "later" : ""}">${last ? `<button type="button" id="au-reveal" class="btn primary">Zum Ergebnis</button>`
          : `<button type="button" id="au-reveal" class="btn primary">${st.kidx ? "Nächstes Produkt" : "Erstes aufdecken"}</button><button type="button" id="au-revall" class="btn ghost">Alle aufdecken</button>`}</div>` : ""}</div>`;
    }
    if (st.step === "final") {
      const items = st.seats.map((id) => ({ id, name: nameOf(id), pts: st.gain[id], txt: `Endstand ${eur(st.budget0 + st.gain[id])}`, sub: `${sgn(st.gain[id])} ${st.gain[id] < 0 ? "Verlust" : "Gewinn"}` }));
      panel = G.podiumHtml({ items, winners: st.winners || [], restartId: "au-restart", info: `Unterm Hammer · ${st.total} Produkte · Startgeld ${eur(st.budget0)}` });
    }

    // Sortiment: was kommt, was ist weg (mit echtem Preis und Käufer)
    const later = st.items.filter((x) => x.hidden).length, running = st.step === "bid" || st.step === "sold";
    const list = st.items.map((x, i) => x.hidden ? "" : (() => {
      const cur = st.step === "kasse" ? i === st.kcur : i === st.idx && st.step !== "final";
      const known = x.p != null && !(st.step === "kasse" && i === st.kcur && kShow);
      const info = !x.sold ? "jetzt unter dem Hammer" : st.step === "kasse" && i === st.kcur && kShow ? "wird aufgedeckt …"
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
        <section class="ku-main au-main ${st.step === "kasse" ? "kasse" : ""}">
          ${st.step === "bid" || st.step === "sold" ? G.pultWrap(stack, pult) : stack}
          <aside class="tk-side"><div class="wer-flbl">${st.gain ? "Gewinn / Verlust" : "Gekauft"}</div><ul class="tk-board">${board}</ul></aside>
        </section>
      </main>`;

    // Kassensturz: Zahlen hochzählen, Töne zur richtigen Zeit, nach der Show einmal neu zeichnen (Liste, Knöpfe)
    if (kKey !== v.code + ":" + st.kidx) { kTimers.forEach(clearTimeout); kTimers = []; kKey = v.code + ":" + st.kidx; }
    cancelAnimationFrame(kRaf);
    if (st.step === "kasse" && kShow) {
      const t0 = performance.now() - kEl, els = [...app.querySelectorAll("[data-cnt]")];
      const step = () => {
        const t = performance.now() - t0;
        els.forEach((el) => { const at = +el.dataset.at, dur = +el.dataset.dur, a = +el.dataset.from, b = +el.dataset.to;
          const f = Math.min(1, Math.max(0, (t - at) / dur)), e = 1 - Math.pow(1 - f, 3); el.textContent = eur(Math.round(a + (b - a) * e)); });
        if (t < T.done) kRaf = requestAnimationFrame(step);
      };
      step();
      kTimers.push(setTimeout(() => { auRendered = null; renderAuktion(); }, T.done - kEl + 40));
      if (kFresh) {
        const x = st.items[st.kcur], mine = x.buyer === me, good = x.buyer && x.p > x.paid;
        for (let t = 700; t < T.price - 100; t += 160) kTimers.push(setTimeout(sfx.tick, t)); // Trommelwirbel
        kTimers.push(setTimeout(() => (x.buyer ? (mine ? (good ? sfx.right : sfx.wrong) : sfx.tick) : sfx.tick)(), T.diff));
      }
    }

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
