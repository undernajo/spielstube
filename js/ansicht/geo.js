// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    LF, PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml,
    topActionsHtml
  } = G;

  // ---------- Wo liegt das?: Darstellung ----------
  let geoMap = null, geoRendered = null, geoMine = null, geoMarker = null, geoDeadline = 0, geoSent = null;
  let obenMap = null, obenZoom = null, geoStart = 0; // „Von oben“: Bildkarte, aktuelle Zoomstufe, Startzeit der Runde
  // Satellitenbilder ohne Beschriftungen (Esri World Imagery, ohne API-Schlüssel nutzbar)
  const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  // Kompakter Punktestand im Kopf-Element (spart Platz für die Karte)
  function geoChips(v, st) {
    return v.players.map((p, i) => {
      const done = st.step === "guess" ? st.submitted.includes(p.id) : st.step === "reveal" ? !!st.ready[p.id] : false;
      const mark = st.step === "guess" ? (done ? "✓" : "…") : done ? "✓" : "";
      return `<span class="geo-score ${done ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}" title="${st.step === "guess" ? (done ? "festgelegt" : "sucht noch") : done ? "bereit" : ""}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span>
        <b>${(st.total[p.id] || 0).toLocaleString("de-DE")}</b>${mark ? `<span class="geo-mark">${mark}</span>` : ""}</span>`;
    }).join("");
  }
  // Auflösung: Entfernung, Rundenpunkte, Gesamtstand und wer schon weiter will
  function geoResults(v, st) {
    const fmt = (km) => km == null ? "keine Nadel" : (km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km).toLocaleString("de-DE")) + " km";
    return v.players.map((p, i) => ({ p, i })).filter(({ p }) => st.result[p.id])
      .sort((a, b) => st.result[b.p.id].points - st.result[a.p.id].points).map(({ p, i }) => {
        const r = st.result[p.id];
        return `<div class="geo-res ${st.ready[p.id] ? "done" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}"><span class="pdot ${p.connected ? "" : "off"}"></span>
          <span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}${st.ready[p.id] ? ` <span class="geo-mark">✓</span>` : ""}</span>
          <span class="muted small">${fmt(r.km)}${r.factor != null && r.factor !== 1 && r.km != null ? ` · ×${String(r.factor).replace(".", ",")}` : ""}</span><b>+${r.points}</b><span class="geo-total" title="Gesamt">${(st.total[p.id] || 0).toLocaleString("de-DE")}</span></div>`;
      }).join("");
  }
  function geoSubmit() {
    const st = G.view && G.view.geo;
    if (!st || !geoMine || st.step !== "guess" || geoSent === st.round) return;
    geoSent = st.round;
    send({ type: "geoGuess", round: st.round, lat: geoMine.lat, lng: geoMine.lng });
    const b = app.querySelector("#geo-lock");
    if (b) { b.disabled = true; b.textContent = "Festgelegt ✓ – warte auf die anderen …"; }
  }
  setInterval(() => {
    const st = G.view && G.view.geo, el = document.getElementById("geo-timer");
    if (!st || st.step !== "guess" || !el || st.endsIn == null) return;
    const ms = Math.max(0, geoDeadline - Date.now());
    G.ringSet(el, ms, st.timerMs || 30000);
    sfx.countdown("geo:" + G.view.code + ":" + st.round, ms, geoSent !== st.round);
    if (ms <= 300) geoSubmit(); // gesetzte Nadel bei Zeitablauf automatisch abgeben
    if (st.mode === "oben" && st.pic && obenMap) obenUpdate(st.pic);
  }, 250);
  function obenUpdate(pic) {
    const step = Math.max(0, Math.min(pic.steps - 1, Math.floor((Date.now() - geoStart) / pic.stepMs)));
    const z = pic.zoom - step;
    if (obenZoom !== z) { obenZoom = z; obenMap.setView([pic.lat, pic.lng], z, { animate: true, duration: 0.8 }); }
    const f = app.querySelector("#oben-factor");
    if (f) f.textContent = "Punkte ×" + String(pic.factors[step]).replace(".", ",");
  }
  function geoMakeMap(el, bounds) {
    if (geoMap) { geoMap.remove(); geoMap = null; }
    const b = LF.latLngBounds(bounds);
    geoMap = LF.map(el, { zoomControl: true, attributionControl: true, worldCopyJump: false, maxBounds: b.pad(0.6), maxBoundsViscosity: 0.8 });
    LF.tileLayer(TILE_URL, { maxZoom: 17, attribution: "Bilder © Esri, Maxar, Earthstar Geographics und GIS-Community" }).addTo(geoMap);
    geoMap.fitBounds(b);
    geoMap.setMinZoom(Math.max(1, geoMap.getZoom() - 1));
    return geoMap;
  }

  const pin = (color, big) => LF.divIcon({ className: "geo-pin-wrap", html: `<span class="geo-pin ${big ? "big" : ""}" style="--pc:${color}"></span>`, iconSize: [big ? 30 : 22, big ? 30 : 22], iconAnchor: [big ? 15 : 11, big ? 15 : 11] });

  // Kopfzeile (gemeinsamer Baustein): Symbol, Spiel · Runde · Region, Ort groß, Spieler mit Lämpchen, Zeitring, Knopf
  const geoKm = (km) => km == null ? "keine Nadel" : (km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km).toLocaleString("de-DE")) + " km";
  const geoPult = (v, st) => v.players.map((p) => ({ id: p.id, name: p.name, pts: st.total[p.id] || 0,
    prev: st.step === "reveal" && st.result ? (st.total[p.id] || 0) - ((st.result[p.id] || {}).points || 0) : undefined, ptsTxt: (st.total[p.id] || 0).toLocaleString("de-DE"),
    done: st.step === "reveal" ? !!st.ready[p.id] : st.submitted.includes(p.id),
    txt: st.step === "reveal" ? (() => { const r = st.result && st.result[p.id]; const t = r ? `${geoKm(r.km)} · +${r.points}` : "schaut sich die Lösung an"; return st.ready[p.id] ? "bereit · " + t : t; })()
      : st.submitted.includes(p.id) ? "hat getippt" : p.connected ? "sucht noch …" : "getrennt" }));
  const geoPills = (v, st) => v.players.map((p) => ({ id: p.id, name: p.name, pts: (st.total[p.id] || 0).toLocaleString("de-DE"), done: st.submitted.includes(p.id) }));
  function geoHead(v, st, btn = "") {
    const oben = st.mode === "oben";
    return G.gameHeadHtml({ ico: oben ? "🛰️" : "📍", small: `${oben ? "Von oben" : "Wo liegt das?"} · Runde ${st.round} / ${st.rounds} · ${esc(st.regionName)}`,
      big: oben ? "Was ist das?" : esc(st.place.name), sub: oben ? `Gesucht: ${esc(st.place.kind)} · <span id="oben-factor">Punkte ×1</span>` : esc(st.place.kind),
      players: geoPills(v, st), final: st.final,
      ring: st.endsIn != null ? G.ringHtml("geo-timer", st.endsIn, st.timerMs || 30000) : "", btn });
  }
  function renderGeo() {
    const v = G.view, st = v.geo;
    if (!st) return;
    geoDeadline = st.endsIn != null ? Date.now() + st.endsIn : 0;
    const key = v.code + ":" + st.round + ":" + st.step;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    const nameOf = (id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
    if (geoRendered === key && app.querySelector(".geo-wrap, .slf-final")) {
      { const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = geoChips(v, st); const gp = app.querySelector(".gh-pl"); if (gp && st.step === "guess") gp.innerHTML = G.ghPillsHtml(geoPills(v, st)); G.pultUpdate(geoPult(v, st)); const rs = app.querySelector(".geo-results"); if (rs) rs.innerHTML = geoResults(v, st); }
      if (st.step === "reveal") G.nextBtnSwap("#geo-ready", { attr: 'id="geo-ready"', label: st.round >= st.rounds ? "Zum Endstand" : "Nächster Ort", ready: !!st.ready[G.myId], waiting: G.waitingNames(v, st.ready) }, () => send({ type: "geoReady" }));
      return;
    }
    if (st.step === "guess" && (!geoRendered || !geoRendered.startsWith(v.code + ":" + st.round + ":"))) { geoMine = null; geoSent = null; }
    // Auflösung direkt nach dem Tippen (nicht nach Neuladen): Nadeln fallen nacheinander, Linien ziehen sich zum Ziel
    const revealFresh = st.step === "reveal" && geoRendered === v.code + ":" + st.round + ":guess"
      && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    geoRendered = key;
    let main = "";
    const oben = st.mode === "oben";
    if (oben && st.step === "guess") geoStart = Date.now() - (st.elapsed || 0);
    if (st.step === "guess") {
      const locked = st.submitted.includes(G.myId);
      main = geoHead(v, st, `<button id="geo-lock" class="btn primary" ${locked || !geoMine ? "disabled" : ""}>${locked ? "Festgelegt ✓ – warte auf die anderen …" : geoMine ? "Nadel festlegen" : "Tippe auf die Karte"}</button>`) + `
        ${oben ? `<div class="oben-grid"><div class="geo-wrap oben-pic"><div id="oben-pic" class="geo-map"></div><span class="oben-tag"><b>1</b> Gesucht: ${esc(st.place.kind)}</span></div>
          <span class="oben-arrow" aria-hidden="true"></span>
          <div class="geo-wrap oben-pic oben-target"><div id="geo-map" class="geo-map"></div><span class="oben-tag"><b>2</b> Hier auf der Karte antippen</span></div></div>` : `<div class="geo-wrap"><div id="geo-map" class="geo-map"></div></div>`}`;
      if (!oben) main = G.pultWrap(main, geoPult(v, st));
    } else if (st.step === "reveal") {
      main = G.gameHeadHtml({ ico: oben ? "🛰️" : "📍", small: `Auflösung · Runde ${st.round} / ${st.rounds} · ${esc(st.regionName)}`, big: esc(st.place.name), sub: oben ? "" : esc(st.place.kind), final: st.final }).replace('class="gh"', 'class="gh gh-rev"') + `
        <div class="geo-bar">
          <div class="geo-target"><span class="game-label">Auflösung · Runde ${st.round}/${st.rounds}</span><div class="geo-name">${esc(st.place.name)}</div></div>
          <div class="geo-results">${geoResults(v, st)}</div>
          <div class="geo-actions">${G.nextBtnsHtml({ attr: 'id="geo-ready"', hostAttr: 'id="geo-next"', label: st.round >= st.rounds ? "Zum Endstand" : "Nächster Ort", ready: !!st.ready[G.myId], waiting: G.waitingNames(v, st.ready) })}</div>
        </div>
        <div class="geo-wrap"><div id="geo-map" class="geo-map"></div></div>`;
      if (!oben) main = G.pultWrap(main, geoPult(v, st));
    } else {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      main = G.podiumHtml({ items: ranking.map((p) => ({ id: p.id, name: p.name, pts: st.total[p.id] || 0, txt: `${(st.total[p.id] || 0).toLocaleString("de-DE")} Punkte` })), winners: st.winners, restartId: "geo-restart", info: `${esc(st.regionName)} · ${st.rounds} Runden · max. ${((st.rounds + (st.rounds > 1 ? 1 : 0)) * 1000).toLocaleString("de-DE")} Punkte (letzte Runde doppelt)` });
    }
    if (geoMap) { geoMap.remove(); geoMap = null; }
    if (obenMap) { obenMap.remove(); obenMap = null; obenZoom = null; }
    app.innerHTML = `
      <main class="screen game slf geo ${oben ? "oben" : ""}">
        <header class="top topbar">
          ${headBrandHtml(oben ? "oben" : "geo")}
          <div class="meta"><span class="stube-code">Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="slf-main">${main}</section>
      </main>`;
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#geo-lock", geoSubmit);
    on("#geo-ready", () => send({ type: "geoReady" }));
    on("#geo-next", () => send({ type: "geoNext" }));
    on("#geo-restart", () => send({ type: "geoRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    const mapEl = app.querySelector("#geo-map");
    if (!mapEl || !LF) return;
    G.fitGeoMaps();
    const map = geoMakeMap(mapEl, st.bounds);
    const picEl = app.querySelector("#oben-pic");
    if (picEl && st.pic) {
      obenMap = LF.map(picEl, { zoomControl: false, attributionControl: true, dragging: false, touchZoom: false, scrollWheelZoom: false,
        doubleClickZoom: false, boxZoom: false, keyboard: false, zoomSnap: 1 });
      obenMap.attributionControl.setPrefix(false);
      LF.tileLayer(TILE_URL, { maxZoom: 18, maxNativeZoom: 17, attribution: "© Esri, Maxar, Earthstar Geographics" }).addTo(obenMap);
      obenZoom = null; obenUpdate(st.pic);
      setTimeout(() => obenMap && obenMap.invalidateSize(), 50);
    }
    if (st.step === "guess") {
      const locked = st.submitted.includes(G.myId);
      if (geoMine) geoMarker = LF.marker([geoMine.lat, geoMine.lng], { icon: pin(colorOf(G.myId)) }).addTo(map);
      if (!locked) map.on("click", (e) => {
        if (geoSent === st.round) return;
        geoMine = { lat: e.latlng.lat, lng: LF.Util.wrapNum(e.latlng.lng, [-180, 180], true) };
        if (geoMarker && map.hasLayer(geoMarker)) geoMarker.setLatLng(e.latlng); else geoMarker = LF.marker(e.latlng, { icon: pin(colorOf(G.myId)) }).addTo(map);
        const b = app.querySelector("#geo-lock"); if (b) { b.disabled = false; b.textContent = "Nadel festlegen"; }
      });
    } else if (st.step === "reveal") {
      const target = [st.answer.lat, st.answer.lng], pts = [target];
      if (revealFresh) sfx.goal();
      LF.marker(target, { icon: LF.divIcon({ className: "geo-pin-wrap", html: `<span class="geo-goal ${revealFresh ? "fx-pop" : ""}">★</span>`, iconSize: [34, 34], iconAnchor: [17, 17] }), zIndexOffset: 1000 })
        .addTo(map).bindTooltip(esc(st.place.name), { permanent: true, direction: "top", offset: [0, -14], className: "geo-tip goal" });
      const kmTxt = (x) => (x < 10 ? x.toFixed(1).replace(".", ",") : Math.round(x).toLocaleString("de-DE")) + " km";
      let n = 0;
      v.players.forEach((p) => {
        const r = st.result[p.id];
        if (!r || r.lat == null) return;
        const g = [r.lat, r.lng]; pts.push(g);
        if (!revealFresh) {
          LF.polyline([target, g], { color: colorOf(p.id), weight: 3, dashArray: "6 6", opacity: .9 }).addTo(map);
          LF.marker(g, { icon: pin(colorOf(p.id)) }).addTo(map)
            .bindTooltip(`${esc(p.name)}: ${kmTxt(r.km)}`, { permanent: true, direction: "bottom", offset: [0, 10], className: "geo-tip" });
          return;
        }
        // nacheinander: Nadel fällt, Linie wächst zum Ziel, Entfernung zählt hoch
        const at = 500 + 700 * n++;
        setTimeout(() => {
          if (geoMap !== map) return; // inzwischen neu gezeichnet
          sfx.plop();
          LF.marker(g, { icon: LF.divIcon({ className: "geo-pin-wrap", html: `<span class="geo-pin fx-drop" style="--pc:${colorOf(p.id)}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(map);
          const line = LF.polyline([g, g], { color: colorOf(p.id), weight: 3, dashArray: "6 6", opacity: .9 }).addTo(map);
          const tip = LF.tooltip({ permanent: true, direction: "bottom", offset: [0, 10], className: "geo-tip" }).setLatLng(g).setContent(`${esc(p.name)}: 0 km`).addTo(map);
          const t0 = performance.now() + 300;
          const step = (now) => {
            if (geoMap !== map) return;
            const q = Math.max(0, Math.min(1, (now - t0) / 650)), e = 1 - Math.pow(1 - q, 3);
            line.setLatLngs([g, [g[0] + (target[0] - g[0]) * e, g[1] + (target[1] - g[1]) * e]]);
            tip.setContent(`${esc(p.name)}: ${kmTxt(r.km * e)}`);
            if (q < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, at);
      });
      if (pts.length > 1) map.fitBounds(LF.latLngBounds(pts).pad(0.25), { maxZoom: 12 }); else map.setView(target, Math.max(map.getZoom(), 8));
    }
    setTimeout(() => map.invalidateSize(), 50);
  }


  return {
    renderGeo,
  };
});
