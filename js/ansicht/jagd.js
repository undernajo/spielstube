// Ansicht: Auf der Jagd. G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, confetti, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, toast, topActionsHtml
  } = G;
  const J = window.S10Jagd;
  const { N, ANIMALS } = J;
  let T = J.terrain("hochalm"); // Gelände des gespielten Jagdgebiets (wird beim Zeichnen gesetzt)
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
  // Zielfernrohr-Absehen als kleines Symbol (wie beim Zielen auf dem Spielfeld)
  const RET = `<svg class="jret" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="20" cy="20" r="14" stroke-width="2.6"/>
    <path d="M2 20H11.5M28.5 20H38M20 28.5V38" stroke-width="5"/><path d="M11.5 20H17.5M22.5 20H28.5M20 22.5V28.5M20 2V17.5" stroke-width="1.8"/></g><circle cx="20" cy="20" r="2.2" fill="#ffc83d"/></svg>`;
  const variant = (i) => (i * 7 + Math.floor(i / N) * 3) % 3;

  // ---------- Klänge (live erzeugt, im Audio-Kontext der Spielstube; 🔇 schaltet sie mit ab) ----------
  // Schuss mit kurzem Nachhall, ferner Schuss (in deinem Revier), Treffer, Fuchsspur, nichts, Jagdhorn, Hochsitz, neue Runde
  // Bausteine (Ausgang, Nachhall, Rauschen, Töne) aus js/klang.js – gemeinsam mit Almsommer
  const K = window.S10Klang, { nbuf, noise, tone } = K;
  const snd = (fn) => K.play(sfx, fn);
  function horn(ctx, t, freq, dur, peak = 0.22) {
    tone(ctx, t, dur, { type: "sawtooth", f0: freq, a: 0.045, peak, vib: freq * 0.006, rev: 0.35, filter: { type: "lowpass", freq: 500, to: 2600, at: 0.08, q: 0.8 } });
    tone(ctx, t, dur, { type: "triangle", f0: freq / 2, a: 0.05, peak: peak * 0.5 });
  }
  const SND = {
    schuss: (d = 0) => snd((c, t0) => { const t = t0 + d;
      noise(c, t, 0.12, { type: "highpass", freq: 900, peak: 0.9, rev: 0.5 });
      noise(c, t, 0.35, { type: "lowpass", freq: 1800, sweepTo: 200, peak: 0.8, rev: 0.35 });
      tone(c, t, 0.28, { f0: 110, f1: 38, peak: 0.9, rev: 0.25 }); }),
    fern: (d = 0) => snd((c, t0) => { const t = t0 + d;
      noise(c, t, 0.4, { type: "lowpass", freq: 700, sweepTo: 150, a: 0.01, peak: 0.35, rev: 0.5 });
      tone(c, t, 0.35, { f0: 80, f1: 35, a: 0.01, peak: 0.35, rev: 0.3 }); }),
    treffer: (d = 0) => snd((c, t0) => { const t = t0 + d;
      tone(c, t, 0.16, { type: "triangle", f0: 520, f1: 260, peak: 0.45 }); tone(c, t + 0.01, 0.22, { f0: 180, f1: 110, peak: 0.4 });
      noise(c, t, 0.04, { type: "bandpass", freq: 2500, q: 2, peak: 0.3 }); }),
    // Fuchsspur: vier leise, gedämpfte Pfotentritte im Trab
    spur: (d = 0) => snd((c, t0) => { const t = t0 + d;
      [0, 0.13, 0.36, 0.49].forEach((x, k) => { noise(c, t + x, 0.07, { type: "lowpass", freq: 650 + k * 40, a: 0.006, peak: 0.32 }); noise(c, t + x, 0.04, { type: "bandpass", freq: 2400, q: 1, a: 0.004, peak: 0.05 }); }); }),
    // daneben: Vögel flattern auf (nur Flügelschläge, kein Ton) – wird nur ab und zu gespielt
    voegel: (d = 0) => snd((c, t0) => { const t = t0 + d;
      for (let k = 0; k < 9; k++) noise(c, t + 0.15 + k * 0.07, 0.05, { type: "bandpass", freq: 900 + k * 40, q: 1.5, peak: 0.16 * (1 - k / 11) }); }),
    hornKurz: (d = 0) => snd((c, t0) => { const t = t0 + d; horn(c, t, 440, 0.14); horn(c, t + 0.18, 440, 0.14); horn(c, t + 0.36, 587.33, 0.55); }),
    // Hochsitz: das Fernglas – weiches, aufsteigendes Rauschen und ein feiner Klick
    hochsitz: (d = 0) => snd((c, t0) => { const t = t0 + d, dur = 0.5;
      const s = c.createBufferSource(); s.buffer = nbuf(c, dur + 0.1);
      const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2600, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(K.out().master); s.start(t); s.stop(t + dur + 0.1);
      noise(c, t + 0.52, 0.012, { type: "highpass", freq: 3800, a: 0.001, peak: 0.18 }); }),
    // neue Runde: leiser Doppelton – du bist wieder dran
    runde: (d = 0) => snd((c, t0) => { const t = t0 + d; tone(c, t, 0.18, { f0: 660, peak: 0.12 }); tone(c, t + 0.13, 0.3, { f0: 990, peak: 0.1 }); }),
  };
  // ---------- Animationen: wann ein Schuss/Fund zum ersten Mal zu sehen war ----------
  // Zeitbasiert, damit Neuzeichnen (z. B. wenn ein Mitspieler schießt) eine laufende Animation an derselben Stelle fortsetzt.
  // Beim ersten Anzeigen (Seite neu geladen, später dazugekommen) ist alles „alt“ und wird nicht animiert.
  const born = new Map(), scopeHeard = new Set();
  let bornReady = false, seeding = false;
  const reduce = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  function age(key) {
    if (!born.has(key)) born.set(key, seeding || reduce() ? 0 : Date.now());
    const t = born.get(key);
    return t ? Date.now() - t : Infinity;
  }
  const dl = (ms) => `animation-delay:${Math.round(ms)}ms`;
  // was schon erklungen ist (beim ersten Anzeigen nichts nachträglich abspielen)
  let heard = null, shotAt = 0;

  // ---------- lokaler Zustand ----------
  let draft = null;        // Verstecken: { key, hide: {tier: [felder]}, sel }
  let aim = { key: null, t: null, i: null, scope: false, sc: null }; // Zielen in der laufenden Runde
  let sentKey = null;      // Runde, für die schon geschossen wurde
  let newsSeen = null, confettiKey = null;

  // PC mit Maus: ein Klick schießt (Feld leuchtet beim Überfahren); Touch: erster Tipp visiert an, zweiter schießt
  const fine = () => !!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches);
  const nameOf = (v, id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
  const gen = (name) => (/[sßxz]$/i.test(name) ? name + "’" : name + "s"); // Genitiv für „…s Revier“
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
    const killAt = {}, killK = {}; (o.kills || []).forEach((k) => k.cells.forEach((i, n) => { killAt[i] = k.a; killK[i] = n; }));
    const rev = o.rev || "", fxOn = !!o.rev; // Animationen nur in den großen, aktuellen Revieren
    const lastAt = {}; (o.last || []).forEach((x) => { (lastAt[x.i] = lastAt[x.i] || []).push(x.by); });
    let cells = "";
    for (let i = 0; i < N * N; i++) {
      const cls = ["jcell", T[i], "v" + variant(i)], sh = o.shots && o.shots[i];
      let inner = "";
      const own = o.hide && J.ownerOf(o.hide, i), seen = o.scout && o.scout.seen && o.scout.seen[i], sres = o.scout && o.scout.res && o.scout.res[i];
      if (killAt[i]) {
        // erlegt: Feld für Feld von links aufgedeckt (nach dem Treffer), kurz grün umrandet
        const e = fxOn ? age(rev + ":k" + i) : Infinity, d = 250 + killK[i] * 110 - e;
        cls.push("down"); if (e < 1500) cls.push("fx-glow");
        inner += `<span class="jico ${e < 900 ? "fx-wipe" : ""}" style="${e < 900 ? dl(d) : ""}">${ICON[killAt[i]]}${BRUCH}</span>`;
      }
      else if (own) { inner += `<span class="jico ${o.reveal ? "rev" : ""}">${ICON[own]}</span>`; if (sh && sh.r === "hit") inner += `<span class="jmark hitx">✕</span>`; }
      else if (sh && sh.r === "hit") {
        // Treffer: Lichtblitz, dann springt der Stern auf
        const e = fxOn ? age(rev + ":s" + i) : Infinity;
        cls.push("hit"); if (e < 600) inner += `<span class="jfx"><span class="fx-flash" style="${dl(-e)}"></span></span>`;
        inner += `<span class="jmark star ${e < 600 ? "fx-pop" : ""}" style="${e < 600 ? dl(120 - e) : ""}">✸</span>`;
      }
      else if (seen) { const e = fxOn ? age(rev + ":o" + i) : Infinity; cls.push("seen"); inner += `<span class="jico ghost ${e < 900 ? "fx-in" : ""}" style="${e < 900 ? dl(250 - e) : ""}">${ICON[seen]}</span><span class="jscope">🔭</span>`; }
      const shotE = fxOn && sh ? age(rev + ":s" + i) : fxOn && sres ? age(rev + ":o" + i) : Infinity;
      if (sh && sh.r === "track" || (!sh && sres === "track")) inner += `<span class="jico track ${shotE < 1100 ? "fx-paws" : ""}" style="--t0:${Math.round(300 - shotE)}ms">${TRACK}</span>`;
      if (sh && sh.r === "miss" || (!sh && sres === "miss") || (sh && sh.r === "track")) {
        // daneben: kleiner Staubring mit Krümeln (nicht beim Hochsitz – dort wird nur geschaut)
        if (sh && shotE < 700) inner += `<span class="jfx"><span class="fx-dust" style="${dl(-shotE)}"></span>${[[-1, -1], [1, -0.6], [-0.8, 0.9], [0.9, 1]].map(([x, y]) => `<span class="fx-crumb" style="--dx:${x * 16}px;--dy:${y * 16}px;${dl(-shotE)}"></span>`).join("")}</span>`;
        if (!(sh && sh.r === "track")) inner += `<span class="jmark jmiss ${shotE < 900 ? "fx-in" : ""}" style="${shotE < 900 ? dl((sh ? 100 : 250) - shotE) : ""}"></span>`;
      }
      if (sh) cls.push("shot"); else if (sres) cls.push("shot", "scouted");
      if (lastAt[i]) { cls.push("last"); inner += `<span class="jlast" style="--pc:${colorOf(v, lastAt[i][0])}"></span>`; }
      if (o.pick === i) { cls.push("picked"); inner += `<span class="jmark aimx">⌖</span>`; }
      if (o.aim && o.aim.i === i) cls.push("aim");
      if (o.scopeArea && o.scopeArea.includes(i)) { // ein gemeinsamer Rahmen um den ganzen Bereich: Kanten nur außen
        cls.push("scopearea");
        const r = Math.floor(i / N), c = i % N, inA = (rr, cc) => rr >= 0 && rr < N && cc >= 0 && cc < N && o.scopeArea.includes(rr * N + cc);
        if (!inA(r - 1, c)) cls.push("sa-t"); if (!inA(r + 1, c)) cls.push("sa-b"); if (!inA(r, c - 1)) cls.push("sa-l"); if (!inA(r, c + 1)) cls.push("sa-r");
      }
      if (o.cand && o.cand(i)) cls.push("cand");
      if (o.click && o.click(i)) cls.push("can");
      cells += `<div class="${cls.join(" ")}" data-ji="${i}">${inner}</div>`;
    }
    // Hochsitz: Fernglas-Blick öffnet sich über dem beobachteten 3×3-Bereich
    let scopeFx = "";
    if (fxOn && o.scout && o.scout.cells) {
      const sk = rev + ":scope:" + o.scout.cells.join(","), e = age(sk);
      // Fernglas-Geräusch zusammen mit dem Fernglas-Blick (einmal, wenn das Ergebnis neu da ist)
      if (e < 400 && !scopeHeard.has(sk)) { scopeHeard.add(sk); SND.hochsitz(); }
      if (e < 800) {
        const area = o.scout.center != null ? J.area3(o.scout.center) : o.scout.cells;
        const rs = area.map((i) => Math.floor(i / N)), cs = area.map((i) => i % N), r0 = Math.min(...rs), c0 = Math.min(...cs);
        const h = Math.max(...rs) - r0 + 1, w = Math.max(...cs) - c0 + 1;
        scopeFx = `<div class="fx-scope" style="left:${(c0 / N) * 100}%;top:${(r0 / N) * 100}%;width:${(w / N) * 100}%;height:${(h / N) * 100}%;${dl(-e)}"></div>`;
      }
    }
    return `<div class="jboard ${o.small ? "small" : ""}">${cells}${scopeFx}</div>`;
  }

  function renderJagd() {
    const v = G.view, st = v.jagd;
    if (!st) return;
    T = J.terrain(st.map);
    if (st.step === "hide") born.clear();
    seeding = !bornReady; bornReady = true;
    const me = G.myId, seated = st.seats.includes(me), priv = G.wattenPriv && G.wattenPriv.jagd ? G.wattenPriv : null;
    const myHide = priv && priv.hide;
    const others = st.seats.filter((id) => id !== me);
    // ---- Klänge auslösen (nur Neues seit dem letzten Zeichnen) ----
    {
      const cur = st.cur || [], key = v.code + ":" + st.seats.join(",");
      // Schüsse der laufenden Runde stehen in „cur“; der Schuss, der eine Runde abschließt, steht sofort in „last“
      const lastRound = st.step === "final" ? st.round : st.round - 1;
      const keyOf = (r, x) => r + ":" + x.by + ":" + x.i;
      if (!heard || heard.key !== key) heard = { key, shots: new Set([...cur.map((x) => keyOf(st.round, x)), ...st.last.map((x) => keyOf(lastRound, x))]), round: st.round, step: st.step };
      else {
        const roundDone = st.round !== heard.round || (st.step === "final" && heard.step !== "final");
        const entries = (roundDone ? st.last.map((x) => [heard.round, x]) : []).concat(cur.map((x) => [st.round, x]));
        let fernNow = false, mineNow = false;
        for (const [r, x] of entries) {
          const k = keyOf(r, x);
          if (heard.shots.has(k)) continue;
          heard.shots.add(k);
          if (x.by === me) { // eigenes Ergebnis kurz nach dem eigenen Knall
            mineNow = true;
            const d = Math.max(0, 0.35 - (Date.now() - shotAt) / 1000);
            const killNow = st.kills.find((kk) => kk.round === r && kk.by.includes(me) && kk.cells.includes(x.i));
            if (x.r === "hit") SND.treffer(d); else if (x.r === "track") SND.spur(d); else if (Math.random() < 0.35) SND.voegel(d); // daneben: meist nur der Knall
            if (killNow) SND.hornKurz(d + 0.45);
          } else if (x.t === me) { SND.fern(); fernNow = true; } // jemand schießt in deinem Revier
        }
        // alle haben geschossen: der Doppelton nur für den, der warten musste – wer als Letzter schießt, hört ihn nicht
        // (sonst klingt er direkt nach dem eigenen Schuss wie eine Bestätigung); nach einem fernen Schuss erst, wenn der verklungen ist
        if (st.step === "play" && heard.step === "play" && st.round > heard.round && seated && !mineNow && Date.now() - shotAt > 2500) SND.runde(fernNow ? 0.9 : 0.2);
        // Ende der Jagd: langes Horn, nach dem letzten Treffer/kurzen Horn
        // Ende der Jagd: Sieg- bzw. Niederlage-Ton der Spielstube (statt des langen Horns, das sich damit beißen würde) –
        // nach dem letzten Treffer/kurzen Horn; Zuschauer hören nichts
        if (st.step === "final" && heard.step !== "final" && seated) setTimeout(() => ((st.winners || []).includes(me) ? sfx.win() : sfx.lose()), mineNow || fernNow ? 1500 : 300);
        heard.round = st.round; heard.step = st.step;
      }
    }
    const roundKey = v.code + ":" + st.step + ":" + st.round;
    // Meldungen der letzten Runde (erlegtes Wild) kurz einblenden
    const lastNews = st.news[st.news.length - 1], nk = lastNews ? lastNews.round + ":" + lastNews.t + ":" + lastNews.a : "";
    if (newsSeen !== null && nk && nk !== newsSeen) st.news.filter((n) => n.round === lastNews.round).forEach((n) => {
      const who = n.by.map((id) => (id === me ? "Du" : nameOf(v, id))).join(" & ");
      toast(`🎯 ${who} ${n.by.length > 1 ? "haben" : n.by[0] === me ? "hast" : "hat"} ${n.t === me ? "deine" : esc(gen(nameOf(v, n.t)))} ${AN[n.a].name} erlegt (+${n.pts})`, n.by.includes(me) ? "ok" : "info");
    });
    newsSeen = nk;
    const chips = st.seats.slice().sort((a, b) => (st.pts[b] || 0) - (st.pts[a] || 0)).map((id) => `<span class="geo-score ${st.picked.includes(id) || st.ready.includes(id) ? "done" : ""}" style="--pc:${colorOf(v, id)}">
        <span class="pdot ${(v.players.find((p) => p.id === id) || {}).connected ? "" : "off"}"></span><span class="geo-score-name">${esc(nameOf(v, id))}${id === me ? " <em>(du)</em>" : ""}</span>
        <b>${st.pts[id] || 0}</b>${st.step === "play" ? `<span class="geo-mark">${st.picked.includes(id) ? "✓" : "…"}</span>` : st.step === "hide" ? `<span class="geo-mark">${st.ready.includes(id) ? "✓" : "…"}</span>` : ""}</span>`).join("");
    let main = "", bar = "";

    if (st.step === "hide") {
      if (seated && !st.ready.includes(me)) {
        if (!draft || draft.key !== v.code + ":" + st.seats.join(",") + ":" + st.map) draft = { key: v.code + ":" + st.seats.join(",") + ":" + st.map, hide: {}, sel: "murmel" };
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
      if (aim.key !== roundKey) aim = { key: roundKey, t: aim.t, i: null, scope: false, sc: null };
      // Nachbar-Jagd: jeder schießt nur im Revier des Nächsten im Kreis; Zuschauer können alle Reviere ansehen
      const myT = seated ? st.target[me] : null, hunter = seated ? st.seats.find((id) => st.target[id] === me) : null;
      if (seated) { if (aim.t !== myT && aim.t !== me) aim.t = myT; }
      else if (!st.seats.includes(aim.t)) aim.t = st.seats[0];
      const mineView = seated && aim.t === me; // Handy: eigenes Revier als eigener Reiter
      const iShot = seated && (st.picked.includes(me) || sentKey === roundKey);
      const t = aim.t, myScout = priv && priv.scout;
      const scoutHere = myScout && myScout.t === t ? myScout : null;
      const canScout = seated && !iShot && !myScout && t && !mineView;
      const pickHere = priv && priv.pick && priv.pick.t === t ? priv.pick.i : null;
      const tabs = (seated ? [myT] : st.seats).map((id) => `<button type="button" class="jtab ${id === t ? "on" : ""}" data-jt="${id}" style="--pc:${colorOf(v, id)}">
          <span class="jtab-name"><i></i>${seated ? `${RET} ${esc(gen(nameOf(v, id)))} Revier` : esc(nameOf(v, id))}</span><span class="jtab-left">${ANIMALS.map((a) => `<span class="${st.left[id].includes(a.id) ? "" : "gone"}">${ICON[a.id]}</span>`).join("")}</span></button>`).join("")
        + (seated ? `<button type="button" class="jtab mine ${mineView ? "on" : ""}" data-jt="${esc(me)}" style="--pc:${colorOf(v, me)}"><span class="jtab-name">🏠 Dein Revier</span>
          <span class="jtab-left">${ANIMALS.map((a) => `<span class="${st.left[me].includes(a.id) ? "" : "gone"}">${ICON[a.id]}</span>`).join("")}</span></button>` : "");
      // neueste Schüsse je Revier: aus dieser Runde, sonst aus der letzten
      const cur = st.cur || [], recent = (rv) => { const c = cur.filter((x) => x.t === rv); return c.length ? c : st.last.filter((x) => x.t === rv); };
      const lastHere = recent(t);
      const mine = cur.find((x) => x.by === me), resTxt = (x) => (x.r === "hit" ? "Treffer" : x.r === "track" ? "🐾 Fuchsspur" : "nichts");
      const myKill = mine && st.kills.find((k) => k.round === st.round && k.by.includes(me) && k.cells.includes(mine.i));
      const task = !seated ? "Du schaust zu." : mineView ? `Dein Revier – hier jagt ${esc(nameOf(v, hunter))}. Geschossen wird in ${esc(gen(nameOf(v, myT)))} Revier.` : iShot ? `${mine ? (myKill ? `${RET} Treffer – ${AN[myKill.a].name} erlegt!` : mine.r === "hit" ? `${RET} Treffer!` : mine.r === "track" ? "🐾 Fuchsspur – der Fuchs ist direkt daneben." : "Nichts getroffen.") : "✓ Geschossen."} Warte auf ${st.seats.filter((id) => !st.picked.includes(id)).map((id) => esc(nameOf(v, id))).join(", ") || "die anderen"} …`
        : aim.scope ? (fine() ? "🔭 Klick auf die Mitte des Bereichs (3×3), den du vom Hochsitz beobachten willst."
          : aim.sc != null ? "🔭 Dieser Bereich wird beobachtet – <b>nochmal auf die Mitte tippen</b> (oder „Beobachten“) bestätigt." : "🔭 Tippe die Mitte des Bereichs (3×3) an, den du vom Hochsitz beobachten willst.")
        : fine() ? `Klick auf ein Feld in ${esc(gen(nameOf(v, t)))} Revier – damit schießt du.`
        : aim.i != null ? `Feld ${String.fromCharCode(65 + (aim.i % N))}${Math.floor(aim.i / N) + 1} anvisiert – <b>nochmal tippen</b> (oder „Schießen“) schießt.` : `Tippe auf ein Feld in ${esc(gen(nameOf(v, t)))} Revier – zweimal tippen schießt.`;
      // Knöpfe: am Handy als feste Leiste unten, am PC in der rechten Spalte (das Revier bekommt dann die volle Höhe)
      const acts = !seated || iShot ? "" : aim.scope
        ? `<button type="button" class="btn ghost" data-jact="scope">✕ Abbrechen</button>
          <button type="button" class="btn primary" data-jact="observe" ${aim.sc != null ? "" : "disabled"}>🔭 Beobachten</button>`
        : `<button type="button" class="btn ghost" data-jact="scope" ${canScout ? "" : "disabled"} title="Einmal pro Partie, kostet keinen Schuss: 3×3 beobachten – nur du siehst das Ergebnis">🔭 Hochsitz<small class="jhs">${myScout ? "benutzt" : "1× pro Jagd"}</small></button>
          ${fine() ? "" : `<button type="button" class="btn primary" data-jact="shoot" ${aim.i != null ? "" : "disabled"}>${RET} Schießen</button>`}`;
      // PC: oben rechts, wer wo jagt, und die Knöpfe (Zuschauer: Reviere zum Durchblättern)
      // Wild eines Reviers als Symbole – erlegtes ausgegraut
      const wildRow = (id) => `<div class="jwild">${ANIMALS.map((a) => `<span class="${st.left[id].includes(a.id) ? "" : "gone"}" title="${a.name}${st.left[id].includes(a.id) ? "" : " – erlegt"}">${ICON[a.id]}</span>`).join("")}</div>`;
      const pickPanel = seated
        ? `<section class="panel jpick" style="--pc:${colorOf(v, myT)}"><span class="game-label">Du jagst in</span><h3 class="jrevname">${esc(gen(nameOf(v, myT)))} Revier</h3>
            ${wildRow(myT)}<p class="jtask">${task}</p>${acts ? `<div class="jacts">${acts}</div>` : ""}</section>`
        : `<section class="panel jpick"><span class="game-label">Reviere</span><div class="jtabs jtabs-side">${tabs}</div></section>`;
      main = `<div class="jlayout">
          <section class="panel jtarget ${aim.scope ? "scoping" : ""}">
            <div class="jtabs jtabs-top">${tabs}</div>
            ${mineView ? boardHtml(v, { rev: me, shots: st.shots[me], kills: st.kills.filter((k) => k.t === me), hide: myHide, last: recent(me) })
              : t ? boardHtml(v, { rev: t, shots: st.shots[t], kills: st.kills.filter((k) => k.t === t), scout: scoutHere, last: lastHere, pick: iShot ? null : pickHere, aim: iShot || aim.scope ? null : aim, scopeArea: aim.scope && aim.sc != null ? J.area3(aim.sc) : null,
              click: (i) => seated && !iShot && (aim.scope || !st.shots[t][i]) }) : `<p class="muted">Kein Revier mit Wild mehr.</p>`}
          </section>
          <aside class="jside">
            ${pickPanel}
            <section class="panel jinfo">
              <div class="jhead"><span class="game-label">Jagdstrecke</span><span class="muted small">Runde ${st.round}${st.rounds ? ` von ${st.rounds}` : ""}</span></div>
              <div class="jstand">${(() => { const rk = st.seats.slice().sort((a, b) => (st.pts[b] || 0) - (st.pts[a] || 0)), medal = ["🥇", "🥈", "🥉"];
                return rk.map((id) => { const place = rk.filter((x) => (st.pts[x] || 0) > (st.pts[id] || 0)).length, kills = st.kills.filter((k) => k.by.includes(id));
                  const on = (v.players.find((p) => p.id === id) || {}).connected, shot = st.picked.includes(id);
                  return `<div class="jsrow ${id === me ? "me" : ""}" style="--pc:${colorOf(v, id)}"><span class="jsplace">${medal[place] || place + 1 + "."}</span><span class="pdot ${on ? "" : "off"}"></span>
                    <span class="jsname">${esc(nameOf(v, id))}${id === me ? " <em>(du)</em>" : ""}</span><span class="jskills">${kills.map((k) => `<span title="${AN[k.a].name} aus ${esc(gen(nameOf(v, k.t)))} Revier">${ICON[k.a]}</span>`).join("")}</span>
                    <b class="jspts">${st.pts[id] || 0}</b><span class="jsst ${shot ? "ok" : ""}" title="${shot ? "hat geschossen" : "zielt noch"}">${shot ? "✓" : "…"}</span></div>`; }).join(""); })()}</div>
              <p class="jtask">${task}</p>
              ${cur.length || st.last.length ? `<p class="muted small jlastline">${cur.length ? "Diese Runde" : "Letzte Runde"}: ${(cur.length ? cur : st.last).map((x) => `<b style="color:${colorOf(v, x.by)}">${esc(nameOf(v, x.by))}</b> → ${esc(nameOf(v, x.t))}: ${resTxt(x)}`).join(" · ")}</p>` : ""}
            </section>
            ${seated ? `<section class="panel jmine"><div class="jhead"><h3>Dein Revier${hunter ? ` <span class="muted small">· hier jagt <b style="color:${colorOf(v, hunter)}">${esc(nameOf(v, hunter))}</b></span>` : ""}</h3>${wildRow(me)}</div>${boardHtml(v, { rev: me, shots: st.shots[me], kills: st.kills.filter((k) => k.t === me), hide: myHide, last: recent(me), small: true })}</section>` : ""}
          </aside>
        </div>`;
      if (acts) bar = `<div class="jbar">${acts}</div>`;
    } else {
      // Endstand: Jagdstrecke je Jäger, alle Reviere aufgedeckt
      if (confettiKey !== roundKey) { confettiKey = roundKey; if (st.winners && st.winners.includes(me)) confetti(); }
      const rank = st.seats.slice().sort((a, b) => (st.pts[b] || 0) - (st.pts[a] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy jtrophy">${RET}</div><b>${st.endReason === "leer" ? `${(st.cleared || []).map((id) => (id === me ? "Du" : esc(nameOf(v, id)))).join(" & ")} ${(st.cleared || []).length > 1 ? "haben" : (st.cleared || [])[0] === me ? "hast" : "hat"} ein Revier leergejagt – die Jagd ist aus!` : "Die Jagd ist vorbei!"}</b>
          <div>${st.winners.map((id) => esc(nameOf(v, id))).join(" & ")} ${st.winners.length > 1 ? "haben" : "hat"} die größte Strecke: ${st.pts[st.winners[0]]} ${st.pts[st.winners[0]] === 1 ? "Punkt" : "Punkte"}.</div>
          <div class="banner-actions"><button id="jg-restart" class="btn primary">Nochmal jagen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="jfinal">${rank.map((id) => { const place = rank.filter((x) => (st.pts[x] || 0) > (st.pts[id] || 0)).length, kills = st.kills.filter((k) => k.by.includes(id));
          return `<section class="panel jfp" style="--pc:${colorOf(v, id)}"><div class="jfh"><span>${medal[place] || place + 1 + "."}</span><b>${esc(nameOf(v, id))}${id === me ? " <em>(du)</em>" : ""}</b><span class="jpts">${st.pts[id] || 0}</span></div>
            <div class="jstrecke">${kills.length ? kills.map((k) => `<span title="${AN[k.a].name} aus ${esc(gen(nameOf(v, k.t)))} Revier">${ICON[k.a]}</span>`).join("") : `<span class="muted small">nichts erlegt</span>`}</div>
            ${boardHtml(v, { shots: st.shots[id], kills: st.kills.filter((k) => k.t === id), hide: st.reveal && st.reveal[id], reveal: true, small: true })}</section>`; }).join("")}</div>`;
    }

    app.innerHTML = `
      <main class="screen game jagd">
        <header class="top topbar">${headBrandHtml("jagd")}<div class="meta">${esc(st.mapName)} · ${esc(st.lengthName)}${st.step === "play" ? ` · Runde ${st.round}${st.rounds ? `/${st.rounds}` : ""}` : ""}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>${topActionsHtml()}</header>
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
    on("#jg-rnd", () => { draft.hide = J.randomHide(st.map); renderJagd(); });
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
    // Hochsitz-Klang beim Hinaufsteigen (Knopf), nicht erst beim Beobachten; Abbrechen bleibt still
    app.querySelectorAll('[data-jact="scope"]').forEach((b) => b.onclick = () => { aim.scope = !aim.scope; aim.sc = null; renderJagd(); });
    const observe = () => { if (aim.sc == null) return; send({ type: "jgScout", t: aim.t, i: aim.sc }); aim.scope = false; aim.sc = null; renderJagd(); };
    const fire = () => { if (aim.i == null) return; sentKey = roundKey; shotAt = Date.now(); SND.schuss(); send({ type: "jgShoot", round: st.round, t: aim.t, i: aim.i }); renderJagd(); };
    app.querySelectorAll('[data-jact="observe"]').forEach((b) => b.onclick = observe);
    app.querySelectorAll('[data-jact="shoot"]').forEach((b) => b.onclick = fire);
    // erster Klick visiert an, ein zweiter Klick aufs selbe Feld schießt (bzw. beobachtet beim Hochsitz) – kein Weg zum Knopf nötig
    app.querySelectorAll(".jtarget .jcell.can").forEach((c) => c.onclick = () => {
      const i = Number(c.dataset.ji);
      if (aim.scope) { if (aim.sc === i || fine()) { aim.sc = i; return observe(); } aim.sc = i; return renderJagd(); }
      if (aim.i === i || fine()) { aim.i = i; return fire(); }
      aim.i = i; renderJagd();
    });
    // PC: im Hochsitz-Modus zeigt schon das Überfahren mit der Maus den 3×3-Bereich (ohne neu zu zeichnen)
    const tb = app.querySelector(".jtarget .jboard");
    if (tb && aim.scope) {
      const SIDES = ["sh-t", "sh-b", "sh-l", "sh-r"];
      const mark = (c) => { tb.querySelectorAll(".scopehover").forEach((x) => x.classList.remove("scopehover", ...SIDES));
        if (c == null) return;
        const area = J.area3(c);
        area.forEach((i) => { const el = tb.querySelector(`[data-ji="${i}"]`); if (!el) return;
          el.classList.add("scopehover");
          if (!area.includes(i - N)) el.classList.add("sh-t"); if (!area.includes(i + N)) el.classList.add("sh-b");
          if (i % N === 0 || !area.includes(i - 1)) el.classList.add("sh-l"); if (i % N === N - 1 || !area.includes(i + 1)) el.classList.add("sh-r"); }); };
      tb.onmouseover = (e) => { const c = e.target.closest(".jcell"); if (c) mark(Number(c.dataset.ji)); };
      tb.onmouseleave = () => mark(null);
    }
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
    const target = app.querySelector(".jtarget .jboard"), mine = app.querySelector(".jmine .jboard");
    // Handy: das Revier zum Schießen nutzt immer die ganze Breite (auch wenn unten die Knopfleiste steht)
    if (!phone) fit(target, 30); else if (target) target.style.maxWidth = "";
    if (!phone) fit(mine, 30, 120); // eigenes Revier rechts darf bei kleinen Fenstern auch klein werden
    const setup = app.querySelector(".jsetup .jboard"), wait = app.querySelector(".jwait .jboard");
    fit(setup, phone ? (app.querySelector(".jsetup .jrow") || { offsetHeight: 0 }).offsetHeight + 40 : 30);
    fit(wait, 30);
    if (!phone) trim(target);
    trim(mine, 120);
    // Verstecken/Warten: nur eine Spalte – dort zählt der Überstand der ganzen Seite
    const pageOver = document.documentElement.scrollHeight - innerHeight;
    [setup, wait].forEach((b) => { if (b && b.style.maxWidth && pageOver > 0) b.style.maxWidth = Math.max(200, parseInt(b.style.maxWidth, 10) - pageOver - 2) + "px"; });
  }
  addEventListener("resize", () => { if (G.view && G.view.phase === "jagd") fitJagd(); });

  return { renderJagd };
});
