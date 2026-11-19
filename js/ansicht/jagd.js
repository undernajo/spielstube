// Ansicht: Auf der Jagd. G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, confetti, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, toast, topActionsHtml
  } = G;
  const J = window.S10Jagd;
  const { N, T, ANIMALS } = J;
  const AN = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));
  const HINT = { fuchs: "1 Feld · überall · hinterlässt Spuren", hirsch: "2 Felder · Wald", gams: "3 Felder · Fels", murmel: "4 Felder · Wiese" };

  // ---------- Zeichnungen ----------
  const ICON = {
    fuchs: `<svg viewBox="0 0 40 40"><path d="M7 6 L15 15 L25 15 L33 6 L31 22 L20 34 L9 22Z" fill="#e8742a" stroke="#8a3d10" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M11 22 L20 34 L29 22 L20 26Z" fill="#fff4e6"/><path d="M10 10 L14 15 L11 16Z M30 10 L26 15 L29 16Z" fill="#3a1c0a"/>
      <circle cx="15.5" cy="20" r="1.5" fill="#1a0d05"/><circle cx="24.5" cy="20" r="1.5" fill="#1a0d05"/><circle cx="20" cy="31.5" r="1.6" fill="#1a0d05"/></svg>`,
    hirsch: `<svg viewBox="0 0 40 40"><path d="M14 13 C10 9 8 5 9 2 M10 7 L6 6 M11 10 L7 11 M26 13 C30 9 32 5 31 2 M30 7 L34 6 M29 10 L33 11" stroke="#6b4423" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M13 14 L27 14 L26 26 L22 36 L18 36 L14 26Z" fill="#a8693a" stroke="#5e3a1d" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M13 14 L8 12 L12 18Z M27 14 L32 12 L28 18Z" fill="#a8693a" stroke="#5e3a1d" stroke-width="1"/>
      <circle cx="17" cy="20" r="1.4" fill="#1a0d05"/><circle cx="23" cy="20" r="1.4" fill="#1a0d05"/><ellipse cx="20" cy="34" rx="2.4" ry="1.6" fill="#2a160a"/></svg>`,
    gams: `<svg viewBox="0 0 40 40"><path d="M15 12 C14 6 15 3 18 3 C17 6 17 9 18 12 M25 12 C26 6 25 3 22 3 C23 6 23 9 22 12" stroke="#1d140c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M13 12 L27 12 L26 25 L22 36 L18 36 L14 25Z" fill="#5a3b24" stroke="#2a1a0e" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M16 12 L18 33 L20 30 L22 33 L24 12 L20 14Z" fill="#f2e9dc"/><path d="M15 15 L18 26 M25 15 L22 26" stroke="#2a1a0e" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="20" cy="34.5" rx="2.2" ry="1.4" fill="#1d140c"/></svg>`,
    murmel: `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="26" rx="11" ry="11" fill="#b98a55" stroke="#6b4a26" stroke-width="1.2"/>
      <circle cx="20" cy="15" r="8.5" fill="#c99b64" stroke="#6b4a26" stroke-width="1.2"/><circle cx="13.5" cy="9.5" r="2.4" fill="#8a6338"/><circle cx="26.5" cy="9.5" r="2.4" fill="#8a6338"/>
      <ellipse cx="20" cy="18.5" rx="4.5" ry="3.5" fill="#efdcbf"/><circle cx="16.8" cy="13.5" r="1.3" fill="#1a0d05"/><circle cx="23.2" cy="13.5" r="1.3" fill="#1a0d05"/>
      <ellipse cx="20" cy="17" rx="1.6" ry="1.1" fill="#2a160a"/><rect x="18.8" y="19.5" width="2.4" height="2.4" rx=".4" fill="#fff"/><ellipse cx="20" cy="29" rx="6" ry="6" fill="#d8b98c"/></svg>`,
  };
  const TRACK = `<svg viewBox="0 0 40 40"><g fill="#2b1c10" opacity=".85"><path d="M12 9 C9 13 10 19 13 19 C15 19 15 13 12 9Z"/><path d="M19 8 C16 12 17 18 20 18 C22 18 22 12 19 8Z"/>
    <path d="M21 23 C18 27 19 33 22 33 C24 33 24 27 21 23Z"/><path d="M28 22 C25 26 26 32 29 32 C31 32 31 26 28 22Z"/></g></svg>`;
  const BRUCH = `<svg class="jbruch" viewBox="0 0 40 40"><path d="M8 32 L30 10" stroke="#2f6b2f" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M14 26 l-6 -2 M18 22 l-6 -3 M22 18 l-5 -4 M17 27 l1 6 M21 23 l2 6 M25 19 l3 5" stroke="#4c9a3c" stroke-width="2" stroke-linecap="round"/></svg>`;
  const variant = (i) => (i * 7 + Math.floor(i / N) * 3) % 3;

  // ---------- lokaler Zustand ----------
  let draft = null;        // Verstecken: { key, hide: {tier: [felder]}, sel }
  let aim = { key: null, t: null, i: null, scope: false }; // Zielen in der laufenden Runde
  let sentKey = null;      // Runde, für die schon geschossen wurde
  let newsSeen = null, confettiKey = null;

  const nameOf = (v, id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
  const colorOf = (v, id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
  const occupiedOf = (hide, except) => new Set(Object.entries(hide).filter(([k]) => k !== except).flatMap(([, c]) => c));
  const complete = (hide, a) => hide[a.id] && hide[a.id].length === a.len && J.connected(hide[a.id]);
  function canAdd(hide, a, i) {
    const cur = hide[a.id] || [], occ = occupiedOf(hide, a.id);
    if (cur.length >= a.len || cur.includes(i)) return false;
    if (a.terr && T[i] !== a.terr) return false;
    if (occ.has(i) || J.nb4(i).some((j) => occ.has(j))) return false;
    return !cur.length || J.nb4(i).some((j) => cur.includes(j));
  }

  // Ein Revier zeichnen. o: { shots, kills, hide (eigenes/aufgedeckt), scout, last, pick, aim, cand, click }
  function boardHtml(v, o) {
    const killAt = {}; (o.kills || []).forEach((k) => k.cells.forEach((i) => { killAt[i] = k.a; }));
    const lastAt = {}; (o.last || []).forEach((x) => { (lastAt[x.i] = lastAt[x.i] || []).push(x.by); });
    let cells = "";
    for (let i = 0; i < N * N; i++) {
      const cls = ["jcell", T[i], "v" + variant(i)], sh = o.shots && o.shots[i];
      let inner = "";
      const own = o.hide && J.ownerOf(o.hide, i), seen = o.scout && o.scout.seen && o.scout.seen[i], sres = o.scout && o.scout.res && o.scout.res[i];
      if (killAt[i]) { cls.push("down"); inner += `<span class="jico">${ICON[killAt[i]]}${BRUCH}</span>`; }
      else if (own) { inner += `<span class="jico ${o.reveal ? "rev" : ""}">${ICON[own]}</span>`; if (sh && sh.r === "hit") inner += `<span class="jmark hitx">✕</span>`; }
      else if (sh && sh.r === "hit") { cls.push("hit"); inner += `<span class="jmark star">✸</span>`; }
      else if (seen) { cls.push("seen"); inner += `<span class="jico ghost">${ICON[seen]}</span><span class="jscope">🔭</span>`; }
      if (sh && sh.r === "track" || (!sh && sres === "track")) inner += `<span class="jico track">${TRACK}</span>`;
      if (sh && sh.r === "miss" || (!sh && sres === "miss")) inner += `<span class="jmark jmiss"></span>`;
      if (sh) cls.push("shot"); else if (sres) cls.push("shot", "scouted");
      if (lastAt[i]) { cls.push("last"); inner += `<span class="jlast" style="--pc:${colorOf(v, lastAt[i][0])}"></span>`; }
      if (o.pick === i) { cls.push("picked"); inner += `<span class="jmark aimx">⌖</span>`; }
      if (o.aim && o.aim.i === i) cls.push("aim");
      if (o.cand && o.cand(i)) cls.push("cand");
      if (o.click && o.click(i)) cls.push("can");
      cells += `<div class="${cls.join(" ")}" data-ji="${i}">${inner}</div>`;
    }
    return `<div class="jboard ${o.small ? "small" : ""}">${cells}</div>`;
  }

  function renderJagd() {
    const v = G.view, st = v.jagd;
    if (!st) return;
    const me = G.myId, seated = st.seats.includes(me), priv = G.wattenPriv && G.wattenPriv.jagd ? G.wattenPriv : null;
    const myHide = priv && priv.hide;
    const others = st.seats.filter((id) => id !== me);
    const roundKey = v.code + ":" + st.step + ":" + st.round;
    // Meldungen der letzten Runde (erlegtes Wild) kurz einblenden
    const lastNews = st.news[st.news.length - 1], nk = lastNews ? lastNews.round + ":" + lastNews.t + ":" + lastNews.a : "";
    if (newsSeen !== null && nk && nk !== newsSeen) st.news.filter((n) => n.round === lastNews.round).forEach((n) => {
      const who = n.by.map((id) => (id === me ? "Du" : nameOf(v, id))).join(" & ");
      toast(`🎯 ${who} ${n.by.length > 1 ? "haben" : n.by[0] === me ? "hast" : "hat"} ${n.t === me ? "deine" : nameOf(v, n.t) + "s"} ${AN[n.a].name} erlegt (+${n.pts})`, n.by.includes(me) ? "ok" : "info");
    });
    newsSeen = nk;
    const chips = st.seats.slice().sort((a, b) => (st.pts[b] || 0) - (st.pts[a] || 0)).map((id) => `<span class="geo-score ${st.picked.includes(id) || st.ready.includes(id) ? "done" : ""}" style="--pc:${colorOf(v, id)}">
        <span class="pdot ${(v.players.find((p) => p.id === id) || {}).connected ? "" : "off"}"></span><span class="geo-score-name">${esc(nameOf(v, id))}${id === me ? " <em>(du)</em>" : ""}</span>
        <b>${st.pts[id] || 0}</b>${st.step === "play" ? `<span class="geo-mark">${st.picked.includes(id) ? "✓" : "…"}</span>` : st.step === "hide" ? `<span class="geo-mark">${st.ready.includes(id) ? "✓" : "…"}</span>` : ""}</span>`).join("");
    let main = "", bar = "";

    if (st.step === "hide") {
      if (seated && !st.ready.includes(me)) {
        if (!draft || draft.key !== v.code + ":" + st.seats.join(",")) draft = { key: v.code + ":" + st.seats.join(","), hide: {}, sel: "murmel" };
        const a = AN[draft.sel], cur = draft.hide[a.id] || [];
        const all = ANIMALS.every((x) => complete(draft.hide, x));
        // PC: links das Revier in voller Höhe, rechts Tiere, Hinweis, Knöpfe; Handy: Tiere – Revier – Knöpfe untereinander
        main = `<section class="panel jsetup"><div class="jshead">
            <h3>Versteck dein Wild</h3>
            <div class="janimals">${ANIMALS.map((x) => `<button type="button" class="janimal ${x.id === draft.sel ? "on" : ""} ${complete(draft.hide, x) ? "ok" : ""}" data-jsel="${x.id}">${ICON[x.id]}<span>${x.name}<small>${HINT[x.id]}${complete(draft.hide, x) ? " · ✓" : (draft.hide[x.id] || []).length ? ` · ${draft.hide[x.id].length}/${x.len}` : ""}</small></span></button>`).join("")}</div>
            <p class="muted small jhint"><b>${a.name}: ${cur.length}/${a.len}</b> – grün umrandete Felder antippen. Form frei, aber zusammenhängend; nochmal tippen nimmt ein Feld weg.</p>
            <div class="geo-scores jsready">${chips}</div></div>
            <div class="jsboard">${boardHtml(v, { hide: draft.hide, cand: (i) => canAdd(draft.hide, a, i), click: () => true })}</div>
            <div class="jrow jsbtns"><button type="button" class="btn ghost" id="jg-rnd">🎲 Zufällig</button><button type="button" class="btn ghost" id="jg-clr" ${cur.length ? "" : "disabled"} title="${esc(a.name)} neu verstecken">↺ Neu</button>
              <button type="button" class="btn primary" id="jg-hide" ${all ? "" : "disabled"}>✓ Versteckt</button></div>
          </section>`;
      } else {
        const wait = st.seats.filter((id) => !st.ready.includes(id)).map((id) => esc(nameOf(v, id)));
        main = `<section class="panel jwait"><h3>${seated ? "Dein Wild ist versteckt" : "Die Jäger verstecken ihr Wild …"}</h3>
            <p class="muted">${wait.length ? `Warte auf ${wait.join(", ")} …` : "Gleich geht's los …"}</p>
            ${myHide ? boardHtml(v, { hide: myHide, small: true }) : ""}</section>`;
      }
    } else if (st.step === "play") {
      if (aim.key !== roundKey) aim = { key: roundKey, t: aim.t, i: null, scope: false };
      const targets = others.filter((t) => st.left[t].length);
      if (!targets.includes(aim.t) && !(aim.t === me && seated)) aim.t = targets[0] || null;
      const mineView = seated && aim.t === me; // Handy: eigenes Revier als eigener Reiter
      const iShot = seated && (st.picked.includes(me) || sentKey === roundKey);
      const t = aim.t, myScout = priv && priv.scout;
      const scoutHere = myScout && myScout.t === t ? myScout : null;
      const canScout = seated && !iShot && !myScout && t && !mineView;
      const pickHere = priv && priv.pick && priv.pick.t === t ? priv.pick.i : null;
      const tabs = (seated ? targets : st.seats).map((id) => `<button type="button" class="jtab ${id === t ? "on" : ""}" data-jt="${id}" style="--pc:${colorOf(v, id)}">
          <span class="jtab-name"><i></i>${esc(nameOf(v, id))}</span><span class="jtab-left">${ANIMALS.map((a) => `<span class="${st.left[id].includes(a.id) ? "" : "gone"}">${ICON[a.id]}</span>`).join("")}</span></button>`).join("")
        + (seated ? `<button type="button" class="jtab mine ${mineView ? "on" : ""}" data-jt="${esc(me)}" style="--pc:${colorOf(v, me)}"><span class="jtab-name">🏠 Dein Revier</span>
          <span class="jtab-left">${ANIMALS.map((a) => `<span class="${st.left[me].includes(a.id) ? "" : "gone"}">${ICON[a.id]}</span>`).join("")}</span></button>` : "");
      const lastHere = st.last.filter((x) => x.t === t);
      const task = !seated ? "Du schaust zu." : mineView ? "Dein Revier – hier schießen die anderen. Wähle ein fremdes Revier zum Schießen." : iShot ? `✓ Geschossen – warte auf ${st.seats.filter((id) => !st.picked.includes(id)).map((id) => esc(nameOf(v, id))).join(", ") || "die anderen"} …`
        : aim.scope ? "🔭 Wähle die Mitte des Bereichs (3×3), den du vom Hochsitz beobachtest." : aim.i != null ? `Ziel: ${esc(nameOf(v, t))}s Revier, Feld ${String.fromCharCode(65 + (aim.i % N))}${Math.floor(aim.i / N) + 1} – schießen?` : `Tippe auf ein Feld in ${esc(nameOf(v, t))}s Revier.`;
      // Knöpfe: am Handy als feste Leiste unten, am PC in der rechten Spalte (das Revier bekommt dann die volle Höhe)
      const acts = seated && !iShot ? `<button type="button" class="btn ghost ${aim.scope ? "on" : ""}" data-jact="scope" ${canScout ? "" : "disabled"} title="Einmal pro Partie, kostet keinen Schuss: 3×3 beobachten – nur du siehst das Ergebnis">🔭 Hochsitz${myScout ? " ✓" : ""}</button>
          <button type="button" class="btn primary" data-jact="shoot" ${aim.i != null && !aim.scope ? "" : "disabled"}>🎯 Schießen</button>` : "";
      // PC: Reviere zum Auswählen und die Knöpfe oben in der rechten Spalte
      const pickPanel = `<section class="panel jpick"><span class="game-label">${seated ? "In welches Revier schießt du?" : "Reviere"}</span><div class="jtabs jtabs-side">${tabs}</div>${acts ? `<div class="jacts">${acts}</div>` : ""}</section>`;
      main = `<div class="jlayout">
          <section class="panel jtarget">
            <div class="jtabs jtabs-top">${tabs}</div>
            ${mineView ? boardHtml(v, { shots: st.shots[me], kills: st.kills.filter((k) => k.t === me), hide: myHide, last: st.last.filter((x) => x.t === me) })
              : t ? boardHtml(v, { shots: st.shots[t], kills: st.kills.filter((k) => k.t === t), scout: scoutHere, last: lastHere, pick: pickHere, aim: iShot ? null : aim,
              click: (i) => seated && !iShot && (aim.scope || !st.shots[t][i]) }) : `<p class="muted">Kein Revier mit Wild mehr.</p>`}
          </section>
          <aside class="jside">
            ${pickPanel}
            <section class="panel jinfo">
              <div class="jhead"><span class="game-label">Runde ${st.round} von ${st.rounds}</span>${seated ? `<span class="muted small">🔭 Hochsitz ${myScout ? "benutzt" : "frei"}</span>` : ""}</div>
              <div class="geo-scores">${chips}</div>
              <p class="jtask">${task}</p>
              ${st.last.length ? `<p class="muted small jlastline">Letzte Runde: ${st.last.map((x) => `<b style="color:${colorOf(v, x.by)}">${esc(nameOf(v, x.by))}</b> → ${esc(nameOf(v, x.t))}: ${x.r === "hit" ? "Treffer" : x.r === "track" ? "🐾 Fuchsspur" : "nichts"}`).join(" · ")}</p>` : ""}
            </section>
            ${seated ? `<section class="panel jmine"><h3>Dein Revier</h3>${boardHtml(v, { shots: st.shots[me], kills: st.kills.filter((k) => k.t === me), hide: myHide, last: st.last.filter((x) => x.t === me), small: true })}</section>` : ""}
          </aside>
        </div>`;
      if (acts) bar = `<div class="jbar">${acts}</div>`;
    } else {
      // Endstand: Jagdstrecke je Jäger, alle Reviere aufgedeckt
      if (confettiKey !== roundKey) { confettiKey = roundKey; if (st.winners && st.winners.includes(me)) confetti(); }
      const rank = st.seats.slice().sort((a, b) => (st.pts[b] || 0) - (st.pts[a] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy">🎯</div><b>${st.endReason === "leer" ? "Alle Reviere bis auf eines leergejagt!" : "Die Jagd ist vorbei!"}</b>
          <div>${st.winners.map((id) => esc(nameOf(v, id))).join(" & ")} ${st.winners.length > 1 ? "haben" : "hat"} die größte Strecke: ${st.pts[st.winners[0]]} ${st.pts[st.winners[0]] === 1 ? "Punkt" : "Punkte"}.</div>
          <div class="banner-actions"><button id="jg-restart" class="btn primary">Nochmal jagen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="jfinal">${rank.map((id) => { const place = rank.filter((x) => (st.pts[x] || 0) > (st.pts[id] || 0)).length, kills = st.kills.filter((k) => k.by.includes(id));
          return `<section class="panel jfp" style="--pc:${colorOf(v, id)}"><div class="jfh"><span>${medal[place] || place + 1 + "."}</span><b>${esc(nameOf(v, id))}${id === me ? " <em>(du)</em>" : ""}</b><span class="jpts">${st.pts[id] || 0}</span></div>
            <div class="jstrecke">${kills.length ? kills.map((k) => `<span title="${AN[k.a].name} aus ${esc(nameOf(v, k.t))}s Revier">${ICON[k.a]}</span>`).join("") : `<span class="muted small">nichts erlegt</span>`}</div>
            ${boardHtml(v, { shots: st.shots[id], kills: st.kills.filter((k) => k.t === id), hide: st.reveal && st.reveal[id], reveal: true, small: true })}</section>`; }).join("")}</div>`;
    }

    app.innerHTML = `
      <main class="screen game jagd">
        <header class="top topbar">${headBrandHtml("jagd")}<div class="meta">${esc(st.lengthName)}${st.step === "play" ? ` · Runde ${st.round}/${st.rounds}` : ""}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>${topActionsHtml()}</header>
        ${statusBarHtml()}
        <section class="slf-main">${st.step === "hide" ? `<div class="geo-bar jhidebar"><span class="game-label">Wild verstecken</span><div class="geo-scores">${chips}</div></div>` : ""}${main}</section>
        ${bar}
      </main>`;

    fitJagd();
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#jg-restart", () => send({ type: "jgRestart" }));
    // Verstecken
    app.querySelectorAll("[data-jsel]").forEach((b) => b.onclick = () => { draft.sel = b.dataset.jsel; renderJagd(); });
    on("#jg-rnd", () => { draft.hide = J.randomHide(); renderJagd(); });
    on("#jg-clr", () => { delete draft.hide[draft.sel]; renderJagd(); });
    on("#jg-hide", () => send({ type: "jgHide", hide: draft.hide }));
    if (st.step === "hide" && draft && seated && !st.ready.includes(me)) app.querySelectorAll(".jsetup .jcell").forEach((c) => c.onclick = () => {
      const i = Number(c.dataset.ji), a = AN[draft.sel], other = J.ownerOf(draft.hide, i);
      if (other && other !== a.id) { draft.sel = other; return renderJagd(); }               // Feld eines anderen Tiers: dieses wählen
      if (other === a.id) { draft.hide[a.id] = draft.hide[a.id].filter((x) => x !== i); return renderJagd(); } // nochmal tippen = weg
      if (!canAdd(draft.hide, a, i)) return;
      draft.hide[a.id] = (draft.hide[a.id] || []).concat(i);
      if (complete(draft.hide, a)) { const next = ANIMALS.find((x) => !complete(draft.hide, x)); if (next) draft.sel = next.id; }
      renderJagd();
    });
    // Zielen & Schießen
    app.querySelectorAll("[data-jt]").forEach((b) => b.onclick = () => { aim.t = b.dataset.jt; aim.i = null; renderJagd(); });
    app.querySelectorAll('[data-jact="scope"]').forEach((b) => b.onclick = () => { aim.scope = !aim.scope; renderJagd(); });
    app.querySelectorAll('[data-jact="shoot"]').forEach((b) => b.onclick = () => { if (aim.i == null) return; sentKey = roundKey; send({ type: "jgShoot", round: st.round, t: aim.t, i: aim.i }); if (sfx.tap) sfx.tap(); renderJagd(); });
    app.querySelectorAll(".jtarget .jcell.can").forEach((c) => c.onclick = () => {
      const i = Number(c.dataset.ji);
      if (aim.scope) { aim.scope = false; send({ type: "jgScout", t: aim.t, i }); return renderJagd(); }
      aim.i = aim.i === i ? null : i; renderJagd();
    });
  }

  // Ohne Scrollen: Reviere so groß, wie die Fensterhöhe erlaubt (unter dem Revier bleibt Platz für die feste Knopfleiste)
  function fitJagd() {
    const bar = app.querySelector(".jbar"), barH = bar ? bar.offsetHeight : 0, phone = innerWidth <= 860;
    const fit = (board, below, min = 200) => {
      if (!board) return;
      board.style.maxWidth = "";
      const top = board.getBoundingClientRect().top + scrollY, room = innerHeight - top - barH - below;
      board.style.maxWidth = Math.max(min, Math.floor(room)) + "px";
    };
    // Spalte für Spalte nachmessen: ragt ihr Kasten über den Fensterrand, das Revier darin um genau so viel verkleinern
    const trim = (board, min = 200) => {
      if (!board || !board.style.maxWidth) return;
      const box = board.closest(".panel") || board, over = box.getBoundingClientRect().bottom + 12 - (innerHeight - barH);
      if (over > 0) board.style.maxWidth = Math.max(min, parseInt(board.style.maxWidth, 10) - Math.ceil(over)) + "px";
    };
    // Handy: unter dem großen Revier stehen noch die Infos
    const info = app.querySelector(".jinfo");
    const target = app.querySelector(".jtarget .jboard"), mine = app.querySelector(".jmine .jboard");
    fit(target, phone && info ? info.offsetHeight + 40 : 30);
    if (!phone) fit(mine, 30, 120); // eigenes Revier rechts darf bei kleinen Fenstern auch klein werden
    const setup = app.querySelector(".jsetup .jboard"), wait = app.querySelector(".jwait .jboard");
    fit(setup, phone ? (app.querySelector(".jsetup .jrow") || { offsetHeight: 0 }).offsetHeight + 40 : 30);
    fit(wait, 30);
    if (phone && target && info) { const over = info.getBoundingClientRect().bottom + 12 - (innerHeight - barH); if (over > 0) target.style.maxWidth = Math.max(200, parseInt(target.style.maxWidth, 10) - Math.ceil(over)) + "px"; }
    else trim(target);
    trim(mine, 120);
    // Verstecken/Warten: nur eine Spalte – dort zählt der Überstand der ganzen Seite
    const pageOver = document.documentElement.scrollHeight - innerHeight;
    [setup, wait].forEach((b) => { if (b && b.style.maxWidth && pageOver > 0) b.style.maxWidth = Math.max(200, parseInt(b.style.maxWidth, 10) - pageOver - 2) + "px"; });
  }
  addEventListener("resize", () => { if (G.view && G.view.phase === "jagd") fitJagd(); });

  return { renderJagd };
});
