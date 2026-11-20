// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    LAND, LF, PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, needLandData, send, sfx,
    statusBarHtml, topActionsHtml
  } = G;

  // ---------- Länder finden ----------
  let landMap = null, landRendered = null, landMine = null, landSent = null, landDeadline = 0, landLayers = {};
  const LAND_COL = { line: "#6d66a3", fill: "#3b3572", hover: "#4d4690", ctx: "#262243", ctxLine: "#3d3862", right: "#2fbf71" };
  const landRing = (flat) => { const r = []; for (let i = 0; i < flat.length; i += 2) r.push([flat[i], flat[i + 1]]); return r; };
  // Punkt für die Beschriftung (Mittel des größten Umrisses, vorberechnet) und größter Umriss (zum Hinzoomen)
  const landLabelPt = (c) => c.p;
  const landMainRing = (c) => { let big = c.g[0][0]; c.g.forEach((p) => { if (p[0].length > big.length) big = p[0]; }); return landRing(big); };
  function landChips(v, st) {
    return v.players.map((p, i) => {
      const done = st.step === "guess" ? st.submitted.includes(p.id) : st.step === "reveal" ? !!st.ready[p.id] : false;
      const mark = st.step === "guess" ? (done ? "✓" : "…") : done ? "✓" : "";
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${st.step === "guess" ? (done ? "festgelegt" : "sucht noch") : done ? "bereit" : ""}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span>
        <b>${st.total[p.id] || 0}</b>${mark ? `<span class="geo-mark">${mark}</span>` : ""}</span>`;
    }).join("");
  }
  function landResults(v, st) {
    return v.players.map((p, i) => ({ p, i })).filter(({ p }) => st.result[p.id])
      .sort((a, b) => st.result[b.p.id].points - st.result[a.p.id].points).map(({ p, i }) => {
        const r = st.result[p.id];
        const what = r.c == null ? "nichts getippt" : r.ok ? "richtig ✓" + (r.fast ? " · am schnellsten ⚡" : "") : "✗ " + esc(LAND.nameOf(st.region, r.c) || "?");
        return `<div class="geo-res ${st.ready[p.id] ? "done" : ""} ${r.ok ? "" : "miss"}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><span class="pdot ${p.connected ? "" : "off"}"></span>
          <span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}${st.ready[p.id] ? ` <span class="geo-mark">✓</span>` : ""}</span>
          <span class="muted small">${what}</span><b>+${r.points}</b><span class="geo-total" title="Gesamt">${st.total[p.id] || 0}</span></div>`;
      }).join("");
  }
  function landSubmit() {
    const st = G.view && G.view.land;
    if (!st || !landMine || st.step !== "guess" || landSent === st.round) return;
    landSent = st.round;
    send({ type: "landPick", round: st.round, c: landMine });
    const b = app.querySelector("#land-lock");
    if (b) { b.disabled = true; b.textContent = "Festgelegt ✓ – warte auf die anderen …"; }
    landStyleAll();
  }
  setInterval(() => {
    const st = G.view && G.view.land, el = document.getElementById("land-timer");
    if (!st || st.step !== "guess" || !el || st.endsIn == null) return;
    const ms = Math.max(0, landDeadline - Date.now());
    el.textContent = Math.ceil(ms / 1000) + " s"; el.classList.toggle("urgent", ms <= 5000);
    sfx.countdown("land:" + G.view.code + ":" + st.round, ms, landSent !== st.round);
    if (ms <= 300) landSubmit(); // angetipptes Land bei Zeitablauf automatisch abgeben
  }, 250);
  // Farben je nach Zustand: angetippt (eigene Farbe), Auflösung (grün / Spielerfarbe), sonst neutral
  function landStyleAll(hover) {
    const v = G.view, st = v && v.land;
    if (!st) return;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const wrong = {};
    if (st.result) Object.entries(st.result).forEach(([id, r]) => { if (r.c && !r.ok && !wrong[r.c]) wrong[r.c] = colorOf(id); });
    Object.entries(landLayers).forEach(([c, ls]) => {
      let fill = LAND_COL.fill, line = LAND_COL.line, w = 1;
      if (st.step === "guess") {
        if (c === landMine) { fill = colorOf(G.myId); line = "#fff"; w = 2; }
        else if (c === hover && landSent !== st.round) fill = LAND_COL.hover;
      } else if (st.step === "reveal") {
        if (c === st.target) { fill = LAND_COL.right; line = "#eafff2"; w = 2; }
        else if (wrong[c]) { fill = wrong[c]; line = "#fff"; w = 1.5; }
      }
      ls.forEach((l) => l.setStyle({ fillColor: fill, color: l._dot ? (fill === LAND_COL.fill ? "#c9c3f5" : "#fff") : line, weight: l._dot ? 1.5 : w }));
    });
  }
  function renderLand() {
    const v = G.view, st = v.land;
    if (!st) return;
    if (!needLandData() || !st.targetName) {
      landRendered = null;
      app.innerHTML = `<main class="screen game slf geo land"><header class="top topbar">${headBrandHtml("land")}${topActionsHtml()}</header>
        <section class="slf-main"><div class="panel"><p class="muted">Länderkarte wird geladen …</p></div></section></main>`;
      return;
    }
    landDeadline = st.endsIn != null ? Date.now() + st.endsIn : 0;
    const key = v.code + ":" + st.round + ":" + st.step;
    const sub = !/^(europa|afrika|asien|amerika|welt)$/.test(st.region); // Bundesländer, Regionen, Kantone
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    if (landRendered === key && app.querySelector(".geo-wrap, .slf-final")) {
      { const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = landChips(v, st); const rs = app.querySelector(".geo-results"); if (rs) rs.innerHTML = landResults(v, st); }
      if (st.step === "reveal") { const rb = app.querySelector("#land-ready"); if (rb) rb.textContent = st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : sub ? "Weiter" : "Nächstes Land"; }
      return;
    }
    if (st.step === "guess" && (!landRendered || !landRendered.startsWith(v.code + ":" + st.round + ":"))) { landMine = null; landSent = null; }
    if (st.step === "guess" && st.submitted.includes(G.myId)) landSent = st.round;
    landRendered = key;
    let main = "";
    if (st.step === "guess") {
      const locked = landSent === st.round;
      main = `
        <div class="geo-bar">
          <div class="geo-target"><span class="game-label">Runde ${st.round}/${st.rounds} · ${esc(st.regionName)}</span>
            <div class="geo-name">${esc(st.targetName)} <span class="land-hint">${sub ? "Tippe es auf der Karte an" : "Tippe das Land auf der Karte an"}</span></div></div>
          <div class="geo-scores">${landChips(v, st)}</div>
          ${st.endsIn != null ? `<div id="land-timer" class="slf-timer">${Math.ceil(st.endsIn / 1000)} s</div>` : ""}
          <button id="land-lock" class="btn primary" ${locked || !landMine ? "disabled" : ""}>${locked ? "Festgelegt ✓ – warte auf die anderen …" : landMine ? "Festlegen" : sub ? "Tippe auf die Karte" : "Tippe ein Land an"}</button>
        </div>
        <div class="geo-wrap"><div id="land-map" class="geo-map land-map"></div></div>`;
    } else if (st.step === "reveal") {
      main = `
        <div class="geo-bar">
          <div class="geo-target"><span class="game-label">Auflösung · Runde ${st.round}/${st.rounds}</span><div class="geo-name">${esc(st.targetName)}</div></div>
          <div class="geo-results">${landResults(v, st)}</div>
          <div class="geo-actions"><button id="land-ready" class="btn primary">${st.ready[G.myId] ? "Warte auf die anderen … (zurücknehmen)" : st.round >= st.rounds ? "Zum Endstand" : sub ? "Weiter" : "Nächstes Land"}</button>
            ${G.isHost ? `<button id="land-next" class="btn ghost sm">Als Gastgeber sofort weiter</button>` : ""}</div>
        </div>
        <div class="geo-wrap"><div id="land-map" class="geo-map land-map"></div></div>`;
    } else {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      const right = (id) => (st.history || []).filter((h) => (h.points[id] || 0) > 0).length;
      main = `
        <div class="banner win"><div class="trophy">🏆</div><b>${ranking.filter((p) => st.winners.includes(p.id)).map((p) => esc(p.name)).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"}!</b>
          <div class="banner-actions"><button id="land-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="panel slf-final">${ranking.map((p, i) => `
          <div class="slf-rank" style="--pc:${colorOf(p.id)}"><span class="slf-medal">${medal[i] || i + 1 + "."}</span><span class="pdot"></span>
            <span class="slf-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""} <span class="muted small">· ${right(p.id)} von ${st.rounds} richtig</span></span><b>${st.total[p.id] || 0} Punkte</b></div>`).join("")}
          <p class="muted small">${esc(st.regionName)} · ${esc(st.levelName)} · ${st.rounds} Runden</p></div>`;
    }
    if (landMap) { landMap.remove(); landMap = null; }
    landLayers = {};
    app.innerHTML = `
      <main class="screen game slf geo land">
        <header class="top topbar">
          ${headBrandHtml("land")}
          <div class="meta">${esc(st.regionName)}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="slf-main">${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#land-lock", landSubmit);
    on("#land-ready", () => send({ type: "landReady" }));
    on("#land-next", () => send({ type: "landNext" }));
    on("#land-restart", () => send({ type: "landRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    const mapEl = app.querySelector("#land-map");
    if (!mapEl || !LF || !window.SCHLAU10_LAND.regions[st.region]) return;
    G.fitGeoMaps();
    const D = window.SCHLAU10_LAND, reg = D.regions[st.region], wide = reg.dot > 12000; // Weltkarte: kleinere Kreise, genaueres Treffen
    const b = LF.latLngBounds(reg.bounds);
    const map = landMap = LF.map(mapEl, { zoomControl: true, attributionControl: true, renderer: LF.canvas({ tolerance: wide ? 1 : 3 }), zoomSnap: 0.25,
      maxBounds: b.pad(0.3), maxBoundsViscosity: 0.8 });
    map.attributionControl.setPrefix(false).addAttribution("Grenzen: Natural Earth");
    // Hochformat (Handy): Kern Europas größer zeigen, der Rest ist per Wischen erreichbar
    const fitHome = () => {
      const r = mapEl.getBoundingClientRect(), portrait = r.height > r.width * 1.1;
      fitHeight();
      map.fitBounds(reg.home && portrait ? reg.home : b);
    };
    function fitHeight() {
      const r = mapEl.getBoundingClientRect(), portrait = r.height > r.width * 1.1;
      if (!portrait && !mapEl.style.height) {
        // Querformat: Fenster nicht höher als die Region (sonst zeigt z. B. die Weltkarte viel Arktis und Antarktis)
        const z = 3, p1 = map.project(b.getNorthWest(), z), p2 = map.project(b.getSouthEast(), z);
        const need = Math.round(r.width * (p2.y - p1.y) / (p2.x - p1.x)) + 8;
        if (need < r.height - 20) { mapEl.style.height = Math.max(300, need) + "px"; map.invalidateSize(); }
      }
    }
    fitHome();
    map.setMinZoom(Math.max(1, map.getZoom() - 1)); map.setMaxZoom(9);
    const inReg = new Set(reg.codes), ctxStyle = { color: LAND_COL.ctxLine, weight: 0.8, fillColor: LAND_COL.ctx, fillOpacity: 1, interactive: false };
    // Länder außerhalb der Region nur dunkel zur Orientierung
    D.countries.forEach((c) => { if (!inReg.has(c.c)) LF.polygon(c.g.map((p) => p.map(landRing)), ctxStyle).addTo(map); });
    // Spielbare Gebiete: Länder oder Bundesländer/Regionen/Kantone; große zuerst, damit kleine (Enklaven) obenauf liegen
    const items = (reg.sub ? D.subs || [] : D.countries).filter((c) => inReg.has(c.c)).sort((a, b) => b.a - a.a);
    D.context.forEach((x) => LF.polygon(x.g.map((p) => p.map(landRing)), { color: LAND_COL.ctxLine, weight: 0.8, fillColor: LAND_COL.ctx, fillOpacity: 1, interactive: false }).addTo(map));
    const canPick = st.step === "guess" && landSent !== st.round;
    const pick = (c) => {
      if (landSent === st.round || G.view.land.step !== "guess") return;
      landMine = c; landStyleAll();
      const btn = app.querySelector("#land-lock"); if (btn) { btn.disabled = false; btn.textContent = "Festlegen"; }
    };
    const dotR = wide ? 4 : 6;
    items.forEach((c) => {
      const poly = LF.polygon(c.g.map((p) => p.map(landRing)), { color: LAND_COL.line, weight: 1, fillColor: LAND_COL.fill, fillOpacity: 1, interactive: canPick, bubblingMouseEvents: false });
      const ls = [poly];
      if (c.a < reg.dot) { const d = LF.circleMarker(c.p, { radius: dotR, color: "#c9c3f5", weight: 1.5, fillColor: LAND_COL.fill, fillOpacity: 1, interactive: canPick, bubblingMouseEvents: false }); d._dot = true; ls.push(d); }
      ls.forEach((l) => {
        l.addTo(map);
        if (canPick) { l.on("click", () => pick(c.c)); l.on("mouseover", () => landStyleAll(c.c)); l.on("mouseout", () => landStyleAll()); }
      });
      landLayers[c.c] = ls;
    });
    // Kreise über den Flächen zeichnen
    Object.values(landLayers).forEach((ls) => ls.forEach((l) => { if (l._dot) l.bringToFront(); }));
    landStyleAll();
    const pts = [];
    if (st.step === "reveal") {
      const tc = LAND.country(st.target);
      const tip = (pt, html, goal) => LF.tooltip({ permanent: true, direction: goal ? "center" : "bottom", offset: goal ? [0, 0] : [0, 12],
        className: "geo-tip land-tip" + (goal ? " goal" : ""), interactive: false }).setLatLng(pt).setContent(html).addTo(map);
      if (tc) { tip(landLabelPt(tc), esc(tc.n), true); pts.push(...landMainRing(tc)); }
      const wrong = {};
      v.players.forEach((p) => { const r = st.result[p.id]; if (r && r.c && !r.ok) (wrong[r.c] = wrong[r.c] || []).push(p.name); });
      Object.entries(wrong).forEach(([c, names]) => {
        const wc = LAND.country(c); if (!wc) return;
        const lp = landLabelPt(wc); pts.push(lp);
        tip(lp, `${esc(wc.n)}<br><small>${names.map(esc).join(", ")}</small>`);
      });
    }
    const fitNow = () => {
      if (st.step !== "reveal" || reg.sub) return fitHome();
      fitHeight();
      if (pts.length) map.fitBounds(LF.latLngBounds(pts).pad(0.2), { maxZoom: 6 });
    };
    fitNow();
    setTimeout(() => { if (landMap !== map) return; map.invalidateSize(); fitNow(); }, 60);
  }


  return {
    renderLand,
  };
});
