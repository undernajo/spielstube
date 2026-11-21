// Ansicht (aus game.js ausgelagert). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, topActionsHtml
  } = G;

  // ---------- Höher oder tiefer ----------
  let hlRendered = null;
  function hlChips(v, st) {
    return v.players.map((p, i) => {
      const done = st.step === "guess" && st.submitted && st.submitted.includes(p.id);
      const ok = st.step === "reveal" && st.result ? st.result.ok[p.id] : undefined;
      const mark = st.step === "guess" ? (done ? "✓" : "…") : ok === true ? "✓" : ok === false ? "✗" : "";
      return `<span class="geo-score ${done || ok ? "done" : ""} ${ok === false ? "miss" : ""}" style="--pc:${PLAYER_COLORS[i % PLAYER_COLORS.length]}">
        <span class="pdot ${p.connected ? "" : "off"}"></span><span class="geo-score-name">${esc(p.name)}${p.id === G.myId ? " <em>(du)</em>" : ""}</span>
        <b>${st.total[p.id] || 0}</b>${mark ? `<span class="geo-mark">${mark}</span>` : ""}</span>`;
    }).join("");
  }
  function renderHl() {
    const v = G.view, st = v.hl;
    if (!st) return;
    const key = v.code + ":" + st.catNo + ":" + st.pos + ":" + st.step;
    if (hlRendered === key && app.querySelector(".hl-main")) {
      const sc = app.querySelector(".geo-scores"); if (sc) sc.innerHTML = hlChips(v, st);
      return;
    }
    hlRendered = key;
    const colorOf = (id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];
    let main = "";
    if (st.step !== "final") {
      const up = st.cat.year ? "später" : "höher", down = st.cat.year ? "früher" : "tiefer";
      const mine = st.step === "guess" ? hlMine(st) : st.picks && st.picks[G.myId];
      const right = st.result && st.result.right;
      const whoPicked = (dir) => st.step === "reveal" ? Object.entries(st.picks).filter(([, d]) => d === dir).map(([pid]) => `<i class="pdot" style="--pc:${colorOf(pid)}"></i>`).join("") : "";
      const btn = (dir, label, icon) => `<button class="hl-btn hl-${dir} ${mine === dir ? "on" : ""} ${right && (right === dir || right === "both") ? "right" : ""}" data-dir="${dir}" ${st.step !== "guess" ? "disabled" : ""}>
          <span class="hl-ico">${icon}</span><span>${label}</span><span class="hl-who">${whoPicked(dir)}</span></button>`;
      // Kartenduell: Symbol passend zur Kategorie, Fortschritt als Balken
      const c = st.cat, nm = (c.name + " " + c.q).toLowerCase();
      const emo = c.year ? "📅" : /berg|gipfel|alpen/.test(nm) ? "🏔️" : /fluss|flüsse|see|meer/.test(nm) ? "🌊" : /stadt|städte|einwohner|land|länder/.test(nm) ? "🏙️"
        : /tier|vogel|vögel/.test(nm) ? "🐾" : /film|serie|kino/.test(nm) ? "🎬" : /musik|song|album/.test(nm) ? "🎵" : /sport|fußball|olymp/.test(nm) ? "🏆" : /turm|gebäude|brücke/.test(nm) ? "🏗️" : "🃏";
      const pips = Array.from({ length: st.steps }, (_, k) => `<i class="${k + 1 < st.pos || (k + 1 === st.pos && st.step === "reveal") ? "done" : k + 1 === st.pos ? "now" : ""}"></i>`).join("");
      const okMe = st.step === "reveal" && st.result ? st.result.ok[G.myId] : undefined;
      main = `
        <div class="geo-scores hl-pills">${hlChips(v, st)}</div>
        <div class="hl-title"><div class="hl-catname">${esc(st.cat.name)}</div>
          <div class="muted small">${esc(st.cat.q)}${st.cat.approx ? " · Werte ca." : ""}${st.cat.note ? " · " + esc(st.cat.note) : ""}</div></div>
        <div class="hl-main">
          <div class="hl-pips">${pips}</div>
          <div class="hl-cards">
            <div class="hl-card known"><span class="hl-emo">${emo}</span><div class="hl-name">${esc(st.prev.name)}</div><div class="hl-val">${esc(st.prev.value)}</div></div>
            <div class="hl-btns">${btn("up", up, "▲")}<span class="hl-vs ${st.step === "reveal" ? "res" : ""}">${st.step === "reveal" ? (right === "up" ? "▲" : right === "down" ? "▼" : "=") : "vs"}</span>${btn("down", down, "▼")}</div>
            <div class="hl-card ${st.step === "reveal" ? "shown" + (okMe === true ? " good" : okMe === false ? " badres" : "") : "unknown"}"><span class="hl-emo">${emo}</span><div class="hl-name">${esc(st.cur.name)}</div>
              <div class="hl-val" ${st.step === "reveal" ? `data-count="${esc(st.cur.value)}"` : ""}>${st.step === "reveal" ? esc(st.cur.value) : "?"}</div></div>
          </div>
          <p class="muted small hl-status">${st.step === "guess"
            ? (mine ? `Du hast „${mine === "up" ? up : down}“ gewählt – warte auf die anderen … (du kannst noch umentscheiden)` : "")
            : okMe === true ? "✓ Richtig! Gleich geht es weiter …" : okMe === false ? "✗ Leider falsch. Gleich geht es weiter …" : "Gleich geht es weiter …"}</p>
          ${st.chain.length ? `<div class="hl-chain"><span class="hl-link">${esc(st.start.name)} <b>${esc(st.start.value)}</b></span>${st.chain.map((c) =>
            `<span class="hl-arrow">${c.right === "up" ? "▲" : c.right === "down" ? "▼" : "="}</span><span class="hl-link">${esc(c.name)} <b>${esc(c.value)}</b></span>`).join("")}</div>` : ""}
        </div>`;
    } else {
      const ranking = v.players.slice().sort((a, b) => (st.total[b.id] || 0) - (st.total[a.id] || 0));
      const medal = ["🥇", "🥈", "🥉"];
      main = G.podiumHtml({ items: ranking.map((p) => ({ id: p.id, name: p.name, pts: st.total[p.id] || 0, txt: `${st.total[p.id] || 0} von ${st.max}` })), winners: st.winners, restartId: "hl-restart", info: `Kategorien: ${st.cats.map(esc).join(" · ")}` });
    }
    app.innerHTML = `
      <main class="screen game slf geo hl">
        <header class="top topbar">
          ${headBrandHtml("hl")}
          <div class="meta">${st.step !== "final" ? `Kategorie ${st.catNo}/${st.catCount} · Vergleich ${st.pos}/${st.steps}` : ""}<span class="stube-code">${st.step !== "final" ? " · " : ""}Stube <b>${esc(v.code)}</b></span></div>
          ${topActionsHtml()}
        </header>
        ${statusBarHtml()}
        <section class="slf-main">${main}</section>
      </main>`;
    // Auflösung: Wert zählt hoch
    const cnt = app.querySelector(".hl-val[data-count]");
    if (cnt) {
      const full = cnt.dataset.count, m = /^([\d.,]+)(.*)$/.exec(full);
      if (m) {
        const raw = m[1], dec = raw.includes(",") ? raw.split(",")[1].length : 0, target = Number(raw.replace(/\./g, "").replace(",", "."));
        const year = st.cat.year, t0 = performance.now(), dur = 900;
        const fmtN = (x) => year ? String(Math.round(x)) : x.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const stepF = (now) => {
          const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          const from = year ? Math.max(0, target - 120) : 0;
          cnt.textContent = (k < 1 ? fmtN(from + (target - from) * e) : raw) + m[2];
          if (k < 1 && cnt.isConnected) requestAnimationFrame(stepF);
        };
        requestAnimationFrame(stepF);
      }
    }
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#hl-restart", () => send({ type: "hlRestart" }));
    on("#toLobby", () => send({ type: "lobby" }));
    app.querySelectorAll(".hl-btn").forEach((b) => b.onclick = () => {
      if (st.step !== "guess") return;
      hlPick = { key: st.ci + ":" + st.pos, dir: b.dataset.dir };
      send({ type: "hlPick", ci: st.ci, pos: st.pos, dir: b.dataset.dir });
      hlRendered = null; renderHl();
    });
  }
  let hlPick = null; // eigene Wahl (sofort anzeigen, bevor der Gastgeber bestätigt)
  const hlMine = (st) => hlPick && hlPick.key === st.ci + ":" + st.pos ? hlPick.dir : null;


  return {
    renderHl,
  };
});
