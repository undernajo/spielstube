// Ansicht: Almsommer (Roll & Write). G = gemeinsamer Kontext aus game.js, veränderliche Werte als G.<name>.
(window.S10Views = window.S10Views || []).push((G) => {
  const {
    PLAYER_COLORS, app, confetti, esc, headBrandHtml, invite, leave, send, sfx, statusBarHtml, toast, topActionsHtml
  } = G;
  const ALM = window.S10Alm;
  let M = ALM.map("hochtal"); // das gerade gespielte Tal (wird in renderAlm gesetzt)
  const NAMES = ALM.NAMES;

  // eigene Auswahl in der laufenden Woche (nur lokal, bis „Ankreuzen“)
  let almSel = { key: null, di: null, terrain: null, cells: [] };
  let almSent = null;     // Woche, für die schon abgeschickt wurde
  let almNewsSeen = null; // zuletzt gemeldete Erstbonus-Nachricht
  let almLook = null;     // welches Tal groß gezeigt wird (eigenes oder angetipptes)
  let almConfetti = null;

  // ---------- Klänge (live erzeugt über js/klang.js; 🔇 schaltet sie mit ab) ----------
  // Würfeln (ausrollen), Bleistift-Kreuz beim Anklicken eines Feldes, Fläche fertig
  const K = window.S10Klang, { noise, tone } = K;
  const snd = (fn) => K.play(sfx, fn);
  // warmer Holz-Aufschlag eines Würfels
  function tock(c, t, peak, f) {
    tone(c, t, 0.07, { type: "triangle", f0: f, f1: f * 0.86, a: 0.0015, peak, rev: 0.3 });
    tone(c, t, 0.045, { f0: f * 2.3, a: 0.001, peak: peak * 0.18 });
    noise(c, t, 0.022, { type: "bandpass", freq: f * 1.9, q: 1.3, a: 0.001, peak: peak * 0.35 });
  }
  // Sprünge der drei Würfel (gemeinsam für Klang und Animation): Start 0 / 0,05 / 0,11 s, Abstand 0,13–0,16 s, jeder ×0,68,
  // jeder Aufprall leiser (peak) und der Bogen davor niedriger (h, in px)
  function dicePlan() {
    return [[0, 520], [0.05, 610], [0.11, 470]].map(([start, f]) => {
      const hits = []; let x = start, gap = 0.13 + Math.random() * 0.03, peak = 0.34, h = 26;
      for (let k = 0; k < 6; k++) { hits.push({ t: x, peak, h, f: f * (0.96 + Math.random() * 0.08) }); x += gap; gap *= 0.68; peak *= 0.62; h *= 0.6; }
      return hits;
    });
  }
  const SND = {
    // drei Würfel springen auf den Holztisch – jeder Sprung kürzer und leiser, dann liegen sie
    rollen: (d = 0, plan = dicePlan()) => snd((c, t0) => { const t = t0 + d;
      plan.forEach((hits) => hits.forEach((x) => tock(c, t + x.t, x.peak, x.f)));
      noise(c, t + 0.05, 0.55, { type: "bandpass", freq: 700, q: 0.8, a: 0.05, peak: 0.05 }); }),
    // Bleistift-Kreuz beim Anklicken eines Feldes: zwei schnelle Striche
    kreuze: (n = 1) => snd((c, t0) => { for (let k = 0; k < n; k++) [0, 0.13].forEach((d) => noise(c, t0 + k * 0.28 + d, 0.085, { type: "bandpass", freq: 3800, q: 1.4, a: 0.008, peak: 0.22, sweepTo: 5200 })); }),
    // Fläche fertig: kleiner, heller Zweiklang
    flaeche: (d = 0) => snd((c, t0) => { tone(c, t0 + d, 0.35, { type: "triangle", f0: 784, a: 0.005, peak: 0.12, rev: 0.4 }); tone(c, t0 + d + 0.11, 0.5, { type: "triangle", f0: 1175, a: 0.005, peak: 0.11, rev: 0.4 }); }),
  };
  // ---------- Würfel-Animation (Variante B): fallen, hüpfen im Takt des Klangs, Seiten wechseln beim Rollen, dann liegen ----------
  // Hängt an einer festen Startzeit: wird während des Wurfs neu gezeichnet, läuft sie an derselben Stelle weiter.
  const ROLL_FALL = 0.26; // Fallzeit bis zum ersten Aufprall (s)
  const ROLL_FACES = ["g", "g", "w", "f", "b", "sun"];
  let almRoll = null; // { start (ms), plan, flick: [[{t, f}]], land: [s], total: [s], acc: [] }
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function almThrow(wait) {
    const plan = dicePlan();
    SND.rollen(wait + ROLL_FALL, plan);
    const land = plan.map((h) => ROLL_FALL + h[3].t), total = plan.map((h) => ROLL_FALL + h[h.length - 1].t + 0.27);
    // zufällige Zwischenseiten: erst schnell, dann langsamer (Abstand ×1,16), nie zweimal dieselbe
    const flick = land.map((l) => { const out = []; let t = 0, gap = 0.05, last = "";
      while (t < l - 0.04) { let f; do { f = Math.random() < 0.08 ? { storm: true } : { t: ROLL_FACES[Math.floor(Math.random() * 6)], n: 1 + Math.floor(Math.random() * 5) }; } while ((f.t || "s") + f.n === last);
        last = (f.t || "s") + f.n; out.push({ t, f }); t += gap; gap *= 1.16; }
      return out; });
    almRoll = { start: Date.now() + wait * 1000, plan, flick, land, total, acc: [] };
    almRollApply();
  }
  const faceHtml = (f) => f.storm ? `<small>Gewitter</small>` : `<span class="num">${f.n}</span><small>${f.t === "sun" ? "Sonne" : NAMES[f.t]}</small>`;
  function almRollApply() {
    if (!almRoll) return;
    const r = almRoll, dice = [...app.querySelectorAll(".alm-dice .alm-dicerow > .alm-die")];
    if (Date.now() - r.start > Math.max(...r.total) * 1000 + 100) { almRoll = null; return; }
    dice.forEach((d, i) => {
      if (d._roll === r || !r.plan[i]) return;
      d._roll = r;
      const hits = r.plan[i], total = r.total[i], at = (t) => Math.min(1, t / total), spin = i % 2 ? 26 : -26;
      let kf;
      if (reduceMotion()) kf = [{ opacity: 0 }, { offset: at(ROLL_FALL + hits[0].t), opacity: 1 }, { opacity: 1 }];
      else {
        kf = [{ offset: 0, transform: `translateY(-70px) rotate(${-spin}deg) scale(.92)`, opacity: 0 }];
        if (hits[0].t > 0) kf.push({ offset: at(hits[0].t), transform: `translateY(-70px) rotate(${-spin}deg) scale(.92)`, opacity: 0 });
        kf.push({ offset: at(hits[0].t + 0.06), opacity: 1 });
        hits.forEach((x, k) => {
          const fr = k / (hits.length - 1), rot = -spin * (1 - fr) * (1 - fr) * 0.5;
          kf.push({ offset: at(ROLL_FALL + x.t), transform: `translateY(0) rotate(${rot}deg) scale(${1 + 0.07 * (1 - fr)}, ${1 - 0.1 * (1 - fr)})`, easing: "cubic-bezier(.2,.6,.4,1)" });
          const nx = hits[k + 1];
          if (nx) kf.push({ offset: at(ROLL_FALL + (x.t + nx.t) / 2), transform: `translateY(${-x.h}px) rotate(${rot * 0.7}deg) scale(1)`, easing: "cubic-bezier(.5,0,.8,.6)" });
        });
        kf.push({ offset: 1, transform: "none" });
        kf.forEach((k) => { if (k.opacity === undefined) k.opacity = 1; });
      }
      const a = d.animate(kf, { duration: total * 1000, fill: "backwards" });
      a.currentTime = Date.now() - r.start; // negativ = noch nicht gestartet (Zweiklang klingt noch)
    });
    if (!r.loop) { r.loop = true; requestAnimationFrame(rollTick); }
  }
  // Seitenwechsel und Akzente – auf die jeweils aktuellen Würfel-Elemente (nach Neuzeichnen neu gefunden)
  function rollTick() {
    const r = almRoll; if (!r) return;
    const t = (Date.now() - r.start) / 1000;
    [...app.querySelectorAll(".alm-dice .alm-dicerow > .alm-die")].forEach((d, i) => {
      if (!r.plan[i]) return;
      const rolling = t < r.land[i] && !reduceMotion();
      d.classList.toggle("rolling", t < r.total[i]);
      let ov = d.querySelector(".die-face");
      if (rolling) {
        const fl = r.flick[i].filter((x) => x.t <= Math.max(0, t)).pop() || r.flick[i][0];
        if (!fl) return;
        if (!ov) { ov = document.createElement("span"); d.appendChild(ov); }
        const cls = "alm-die die-face " + (fl.f.storm ? "storm" : fl.f.t);
        if (ov.className !== cls) { ov.className = cls; ov.innerHTML = faceHtml(fl.f); }
      } else if (ov) ov.remove();
      // Akzent einmal, wenn der Würfel liegt: Gewitter ruckt und blitzt, Sonne leuchtet auf
      if (t >= r.total[i] - 0.2 && !r.acc[i]) {
        r.acc[i] = true;
        if (reduceMotion()) return;
        if (d.classList.contains("storm")) { d.classList.add("die-flash"); d.animate([{ transform: "none" }, { transform: "translateX(-4px) rotate(-2deg)" }, { transform: "translateX(4px) rotate(2deg)" }, { transform: "translateX(-2px)" }, { transform: "none" }], { duration: 320 }); }
        else if (d.classList.contains("sun")) d.classList.add("die-glow");
        setTimeout(() => d.classList.remove("die-flash", "die-glow"), 1000);
      }
    });
    if (t < Math.max(...r.total) + 0.1) requestAnimationFrame(rollTick);
    else { app.querySelectorAll(".alm-dice .alm-dicerow > .alm-die").forEach((d) => d.classList.remove("rolling")); almRoll = null; }
  }
  let almHeard = null; // was schon erklungen ist (beim ersten Anzeigen nichts nachspielen)
  let almSelAt = new Map(); // Feld → Zeitpunkt des Ankreuzens (das Kreuz zeichnet sich in zwei Strichen)
  let almShine = null, almDoneKeys = null; // frisch fertige eigene Flächen: { keys, t } – goldener Lichtstreif
  let almChimeEnd = 0; // bis wann der Zweiklang „Fläche fertig“ klingt – die Würfel fallen erst danach

  // ---------- Feldgrafiken: illustrierte Wanderkarte (SVG, 40 × 40) ----------
  // Je Gelände drei Varianten (nach Feldnummer gewählt), damit das Tal nicht wie Tapete aussieht.
  // Details bleiben kontrastarm, damit Kreuze und Punktabzeichen darüber gut lesbar sind.
  const svg40 = (inner, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${inner}</svg>`;
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const tuft = (x, y, c = "#5d9c3f") => `<path d="M${x} ${y} l-1.6 -4.2 M${x} ${y} l0 -5 M${x} ${y} l1.6 -4.2" stroke="${c}" stroke-width="1.2" stroke-linecap="round" fill="none"/>`;
  const flower = (x, y, petal) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<circle cx="0" cy="-1.5" r="1.1" fill="${petal}" transform="rotate(${r})"/>`).join("")}<circle r=".9" fill="#ffd34d"/></g>`;
  const spruce = (x, y, h) => { // Fichte mit Licht- (links) und Schattenseite (rechts)
    const w = h * 0.62, t = (k) => y - h + k * h * 0.3;
    const tier = (k, ww) => `<path d="M${x} ${t(k)} L${x - ww / 2} ${t(k) + h * 0.42} H${x + ww / 2}Z" fill="#1f5c36"/><path d="M${x} ${t(k)} L${x - ww / 2} ${t(k) + h * 0.42} H${x}Z" fill="#3d8f55"/>`;
    return `<rect x="${x - 0.9}" y="${y - h * 0.12}" width="1.8" height="${h * 0.14}" fill="#5b3a22"/>${tier(0, w * 0.62)}${tier(1, w * 0.82)}${tier(2, w)}`;
  };
  const rock = (pts, light, dark) => { // Brocken: helle und dunkle Facette
    const [a, b, c, d] = pts;
    return `<path d="M${a} L${b} L${c}Z" fill="${light}"/><path d="M${a} L${c} L${d}Z" fill="${dark}"/>`;
  };
  const TILE_SVG = {
    g: [
      svg40(`<rect width="40" height="40" fill="url(#gw)"/><circle cx="7" cy="9" r=".8" fill="#c4ec9c"/><circle cx="31" cy="27" r=".8" fill="#c4ec9c"/>${tuft(11, 32)}${tuft(29, 15)}${flower(27, 31, "#fff")}`, grad("gw", "#a2dc78", "#7ec25a")),
      svg40(`<rect width="40" height="40" fill="url(#gw)"/><circle cx="20" cy="6" r=".8" fill="#c4ec9c"/>${tuft(8, 17)}${tuft(31, 34)}${tuft(22, 26, "#6aab4a")}${flower(12, 30, "#f2a7d8")}`, grad("gw", "#9fda74", "#7bbf57")),
      svg40(`<rect width="40" height="40" fill="url(#gw)"/><circle cx="33" cy="8" r=".8" fill="#c4ec9c"/><circle cx="6" cy="28" r=".8" fill="#c4ec9c"/>${tuft(18, 35)}${tuft(33, 22)}${flower(10, 12, "#fff")}${flower(24, 16, "#b9a7ff")}`, grad("gw", "#a4dd7b", "#80c45c")),
    ],
    w: [
      svg40(`<rect width="40" height="40" fill="url(#ww)"/>${spruce(12, 30, 20)}${spruce(28, 37, 17)}`, grad("ww", "#4b9a5f", "#2d6d43")),
      svg40(`<rect width="40" height="40" fill="url(#ww)"/>${spruce(9, 22, 14)}${spruce(22, 33, 18)}${spruce(33, 21, 13)}`, grad("ww", "#489559", "#2b6940")),
      svg40(`<rect width="40" height="40" fill="url(#ww)"/>${spruce(25, 32, 24)}${spruce(9, 37, 14)}`, grad("ww", "#4d9c61", "#2e6f45")),
    ],
    f: [
      svg40(`<rect width="40" height="40" fill="url(#fw)"/>${rock(["8 30", "15 16", "24 30", "16 33"], "#c8c6d1", "#7d7b88")}${rock(["24 22", "30 12", "36 24", "29 26"], "#bdbbc7", "#73717e")}<circle cx="6" cy="10" r="1" fill="#7f7d8a"/><circle cx="33" cy="34" r="1.2" fill="#7f7d8a"/>`, grad("fw", "#aeacb9", "#8d8b99")),
      svg40(`<rect width="40" height="40" fill="url(#fw)"/>${rock(["10 24", "20 9", "31 26", "19 29"], "#c9c7d2", "#7a7885")}<circle cx="9" cy="34" r="1.1" fill="#7f7d8a"/><circle cx="14" cy="36" r=".8" fill="#7f7d8a"/><circle cx="31" cy="35" r="1" fill="#7f7d8a"/>`, grad("fw", "#acaab7", "#8b8997")),
      svg40(`<rect width="40" height="40" fill="url(#fw)"/>${rock(["4 20", "10 10", "17 21", "10 23"], "#c4c2cd", "#777582")}${rock(["17 34", "25 20", "35 35", "25 37"], "#c9c7d2", "#7c7a87")}<circle cx="31" cy="9" r="1" fill="#7f7d8a"/>`, grad("fw", "#afadba", "#8e8c9a")),
    ],
    b: [0, 1, 2].map((k) => svg40(`<rect width="40" height="40" fill="url(#bw)"/>${[6 + k * 2, 17 + k * 2, 28 + k * 2].map((y, j) =>
      `<path d="M-4 ${y} q5 -3.2 10 0 t10 0 t10 0 t10 0 t10 0" stroke="${j === 1 ? "#d7f0ff" : "#a8dcff"}" stroke-width="${j === 1 ? 1.6 : 1.2}" fill="none" stroke-linecap="round" opacity=".85"/>`).join("")}
      <circle cx="${12 + k * 9}" cy="${11 + k * 3}" r=".9" fill="#fff" opacity=".8"/><circle cx="${30 - k * 6}" cy="${33 - k * 2}" r=".7" fill="#fff" opacity=".7"/>`, grad("bw", "#5dbcf2", "#3a93d6"))),
  };
  // Sonderfelder als eigene Zeichnung im Feld (Hof, Almhütte, Gipfel mit Kreuz)
  const SYMBOL_SVG = {
    hof: `<svg viewBox="0 0 40 40" class="asvg"><ellipse cx="20" cy="35" rx="15" ry="2.5" fill="#000" opacity=".15"/>
      <rect x="9" y="22" width="22" height="12" fill="#f6efe2" stroke="#7a6a52" stroke-width=".8"/>
      <rect x="8" y="14.5" width="24" height="8.5" fill="#9a6235" stroke="#5e3b1f" stroke-width=".8"/><path d="M8 19 H32" stroke="#6d4325" stroke-width="1"/>
      <path d="M4 15.5 L20 6.5 L36 15.5Z" fill="#6a4a37" stroke="#3e2a1d" stroke-width=".9" stroke-linejoin="round"/>
      <rect x="12" y="25" width="4" height="4" fill="#3a4a66"/><rect x="24" y="25" width="4" height="4" fill="#3a4a66"/>
      <rect x="18" y="27" width="4" height="7" rx="1" fill="#6d4325"/><circle cx="13" cy="30" r=".9" fill="#e2453b"/><circle cx="15" cy="30" r=".9" fill="#e2453b"/><circle cx="25" cy="30" r=".9" fill="#e2453b"/><circle cx="27" cy="30" r=".9" fill="#e2453b"/></svg>`,
    hut: `<svg viewBox="0 0 40 40" class="asvg"><ellipse cx="20" cy="34" rx="12" ry="2.2" fill="#000" opacity=".15"/>
      <rect x="10" y="20" width="20" height="13" fill="#a8703f" stroke="#5e3b1f" stroke-width=".8"/>
      ${[23.5, 27, 30.5].map((y) => `<path d="M10 ${y} H30" stroke="#7d4e28" stroke-width=".8"/>`).join("")}
      <path d="M7 21 L20 11 L33 21Z" fill="#7b6a5d" stroke="#3e2f25" stroke-width=".9" stroke-linejoin="round"/>
      <circle cx="15" cy="17.5" r="1.2" fill="#b3aca4"/><circle cx="24" cy="16.5" r="1.1" fill="#b3aca4"/>
      <rect x="17.5" y="25" width="5" height="8" fill="#4a2f1a"/><rect x="24.5" y="23.5" width="3" height="3" fill="#ffd34d" opacity=".9"/></svg>`,
    peak: `<svg viewBox="0 0 40 40" class="asvg"><path d="M3 35 L17 12 L22 19 L26 14 L38 35Z" fill="#7f7d8b"/><path d="M17 12 L22 19 L19 35 H3Z" fill="#a9a7b5"/>
      <path d="M17 12 L13.2 18.3 L16 17.2 L18 19 L20.3 16.4Z" fill="#fff"/><path d="M26 14 L23.6 18 L25.5 17.3 L27.8 17.8Z" fill="#fff"/>
      <path d="M17 3.5 V12 M14.4 6.2 H19.6" stroke="#5b3a22" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  };
  window.S10AlmArt = { SYMBOL_SVG }; // auch für die Vorführung in der Stubenmeisterschaft
  // Würfelbilder: Sonne (goldener Himmel) und Gewitter (Wolke mit Blitz); Gelände-Würfel zeigen die Feldgrafik
  const DIE_SVG = {
    sun: svg40(`<rect width="40" height="40" fill="url(#sw)"/><g transform="translate(20 17)">${Array.from({ length: 12 }, (_, k) =>
      `<path d="M0 -8.5 L1.6 -14 L-1.6 -14Z" fill="#ffb21f" transform="rotate(${k * 30})"/>`).join("")}<circle r="7.5" fill="#ffcf3a" stroke="#f0a210" stroke-width="1"/></g>`,
      `<radialGradient id="sw" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fff4c4"/><stop offset="1" stop-color="#ffd95c"/></radialGradient>`),
    storm: svg40(`<rect width="40" height="40" fill="url(#tw)"/><path d="M8 13 a6 6 0 0 1 6 -6 a8 8 0 0 1 15 2 a5 5 0 0 1 3 9 H11 a5 5 0 0 1 -3 -5Z" fill="#59587a"/>
      <path d="M21 15.5 L16 24 H20.5 L18 30.5 L26.5 19.5 H21.8 L24.5 15.5Z" fill="#ffcc33" stroke="#c98f00" stroke-width=".6" stroke-linejoin="round"/>`,
      grad("tw", "#3a3766", "#1f1c40")),
  };
  const dataUri = (x) => `url("data:image/svg+xml,${encodeURIComponent(x.replace(/\s+/g, " "))}")`;
  // Hintergrundbilder einmal als CSS anlegen: .acell.g.v0 … .acell.b.v2, Würfel .alm-die.g … und kleine Gelände-Knöpfe
  (() => {
    const el = document.createElement("style"); el.id = "alm-tiles";
    // .jcell: dieselben Geländegrafiken für das Revier bei „Auf der Jagd“
    el.textContent = Object.entries(TILE_SVG).map(([t, vs]) => vs.map((x, k) => `.acell.${t}.v${k},.jcell.${t}.v${k}{background-image:${dataUri(x)};background-size:cover}`).join("")
        + `.alm-die.${t},.alm-swatch.${t}{background-image:${dataUri(vs[1])}}`).join("")
      + Object.entries(DIE_SVG).map(([t, x]) => `.alm-die.${t}{background-image:${dataUri(x)}}`).join("");
    document.head.appendChild(el);
  })();
  const variant = (i) => (i * 7 + Math.floor(i / 11) * 3) % 3;
  // Punktabzeichen einer Fläche: erstes Feld ohne Zeichnung (Hof, Hütte, Gipfel bleiben frei sichtbar) – je Tal einmal berechnet
  const badgeCache = {};
  const badgeCell = (k) => {
    const c = badgeCache[M.id] || (badgeCache[M.id] = Object.fromEntries(Object.entries(M.REGIONS).map(([r, cs]) =>
      [r, cs.find((i) => !M.HUTS.includes(i) && !M.PEAKS.includes(i) && i !== M.START) ?? cs[0]])));
    return c[k];
  };
  const rotated = () => innerWidth < 560 && innerHeight > innerWidth;

  // Tal als Raster; opts: { interactive, marked, sel, hintFrom, small }
  function boardHtml(v, st, marked, o) {
    const done = new Set(M.doneRegions(marked).flatMap((k) => M.REGIONS[k]));
    const soon = o.soon || [];
    const rot = !o.small && rotated();
    const order = [];
    if (!rot) for (let i = 0; i < M.TERRAIN.length; i++) order.push(i);
    else for (let c = 0; c < M.COLS; c++) for (let r = M.ROWS - 1; r >= 0; r--) order.push(r * M.COLS + c);
    const ROT = { bt: "br", bb: "bl", bl: "bt", br: "bb" };
    const cells = order.map((i) => {
      const ter = M.TERRAIN[i], c = i % M.COLS, r = Math.floor(i / M.COLS), k = M.REGION[i];
      const sym = i === M.START ? "🏡" : M.HUTS.includes(i) ? "🏠" : M.PEAKS.includes(i) ? "⛰️" : "";
      const symSvg = i === M.START ? SYMBOL_SVG.hof : M.HUTS.includes(i) ? SYMBOL_SVG.hut : M.PEAKS.includes(i) ? SYMBOL_SVG.peak : "";
      const fresh = o.fresh && o.fresh.includes(i);
      if (o.small) return `<i class="ac ${ter} ${marked.has(i) && i !== M.START ? "x" : ""} ${fresh ? "new" : ""} ${done.has(i) ? "done" : ""}"></i>`;
      // Flächengrenze: Nachbar gehört zu einer anderen Fläche (egal welches Gelände) – dort sitzt eine feine Fuge
      const edge = (j) => M.REGION[j] !== k;
      const edges = [r > 0 && edge(i - M.COLS) ? "bt" : "", r < M.ROWS - 1 && edge(i + M.COLS) ? "bb" : "",
        c > 0 && edge(i - 1) ? "bl" : "", c < M.COLS - 1 && edge(i + 1) ? "br" : ""].filter(Boolean).map((e) => (rot ? ROT[e] : e)).join(" ");
      const isMarked = marked.has(i), chosen = o.sel && o.sel.includes(i);
      const can = o.interactive && !isMarked && ter === o.terrain;
      const hint = can && !o.sel.length && M.neighbors(i).some((j) => marked.has(j));
      const first = badgeCell(k) === i;
      // Animationen: Kreuz zeichnet sich (zwei Bleistiftstriche), fertige Fläche bekommt einen goldenen Lichtstreif
      let fx = "";
      if (chosen) { const e = Date.now() - (almSelAt.get(i) || 0);
        fx += `<svg class="akreuz" viewBox="0 0 40 40" aria-hidden="true"><path d="M9 9 L31 31" style="animation-delay:${-e}ms"/><path d="M31 9 L9 31" style="animation-delay:${130 - e}ms"/></svg>`; }
      const sh = o.shine && o.shine.keys.has(k) ? Date.now() - o.shine.t : Infinity;
      if (sh < 1300) fx += `<span class="ashine" style="animation-delay:${M.REGIONS[k].indexOf(i) * 90 - sh}ms"></span>`;
      let badge = "";
      if (first) {
        const cl = st.claimed[k], race = M.SPECIAL.includes(k);
        const mine = cl && cl.ids.includes(G.myId);
        const flag = cl ? `<b class="ab-flag" title="Erstbonus: ${esc(cl.ids.map((id) => nameOf(v, id)).join(" & "))}">${mine ? "🏆" : "🚩"}</b>` : "";
        badge = `<span class="ab ${done.has(i) ? "full" : soon.includes(k) ? "soon" : ""} ${sh < 900 ? "apop" : ""}" style="${sh < 900 ? `animation-delay:${250 - sh}ms` : ""}" title="${race && !cl ? `Wer sie als Erster fertig hat: +${ALM.BONUS.first}` : ""}">${done.has(i) ? "✓" : ""}${M.regionValue(k)}${race && !cl ? `<small>+${ALM.BONUS.first}</small>` : ""}${flag}</span>`;
      }
      const name = `${String.fromCharCode(65 + c)}${r + 1} · ${NAMES[ter]}${sym === "🏠" ? " · Hütte" : sym === "⛰️" ? " · Gipfel" : ""}`;
      return `<div class="acell ${ter} v${variant(i)} ${edges} ${isMarked && i !== M.START ? "x" : ""} ${fresh ? "new" : ""} ${done.has(i) ? "done" : ""} ${can ? "can" : ""} ${hint ? "hint" : ""} ${chosen ? "sel drawn" : ""}" data-ai="${i}" title="${name}">${badge}${fx}${symSvg ? `<span class="as">${symSvg}</span>` : ""}</div>`;
    }).join("");
    const cols = o.small ? M.COLS : rot ? M.ROWS : M.COLS;
    return `<div class="${o.small ? "alm-mini" : "alm-board"}" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${cells}</div>`
      + (o.small ? "" : `${rot ? "" : `<div class="alm-coords">${Array.from({ length: M.COLS }, (_, c) => `<span>${String.fromCharCode(65 + c)}</span>`).join("")}</div>`}
        ${rot ? `<p class="muted small alm-rot">Das Tal ist gedreht: die Gipfel sind rechts.</p>` : ""}`);
  }
  const nameOf = (v, id) => (v.players.find((p) => p.id === id) || { name: "?" }).name;
  const colorOf = (v, id) => PLAYER_COLORS[Math.max(0, v.players.findIndex((p) => p.id === id)) % PLAYER_COLORS.length];

  function renderAlm() {
    const v = G.view, st = v.alm;
    if (!st) return;
    M = ALM.map(st.map);
    const seated = st.seats.includes(G.myId);
    const key = v.code + ":" + st.week + ":" + st.step;
    if (almSel.key !== key) almSel = { key, di: null, terrain: null, cells: [] };
    if (st.step === "play" && almSent && almSent !== key) almSent = null;
    const iDone = seated && (st.done.includes(G.myId) || almSent === key);
    // Kreuze der laufenden Woche: die der anderen erst sehen, wenn der eigene Zug gemacht ist (Zuschauer sehen alles)
    const reveal = !seated || st.done.includes(G.myId) || st.step === "final";
    const pend = (id) => (reveal || id === G.myId ? (st.pending && st.pending[id]) || [] : []);
    const boardOf = (id) => new Set((st.boards[id] || []).concat(pend(id)));
    const pts = (id) => (reveal ? st.totalsLive || st.totals : st.totals)[id] || 0;
    // neue Erstbonus-Meldungen kurz einblenden (nicht beim ersten Anzeigen)
    const last = st.news[st.news.length - 1], lastKey = last ? last.week + ":" + last.k : "";
    if (almNewsSeen !== null && lastKey && lastKey !== almNewsSeen) {
      st.news.filter((n) => n.week === last.week).forEach((n) => {
        const kind = M.REGIONS[n.k].some((i) => M.PEAKS.includes(i)) ? "⛰️ Gipfelfläche" : "🏠 Hüttenfläche";
        const who = n.ids.map((id) => (id === G.myId ? "Du" : nameOf(v, id))).join(" & ");
        toast(`${kind}: ${who} ${n.ids.length > 1 || n.ids[0] === G.myId ? "wart" : "war"} zuerst fertig – +${ALM.BONUS.first}!`.replace("Du wart", "Du warst"));
      });
    }
    almNewsSeen = lastKey;
    // ---- Klänge auslösen (nur Neues seit dem letzten Zeichnen) ----
    {
      const hk = v.code + ":" + st.seats.join(","), doneKeys = seated ? M.doneRegions(boardOf(G.myId)) : [], myDone = doneKeys.length;
      // frisch fertige eigene Flächen merken (Lichtstreif zum Zweiklang); beim ersten Anzeigen nichts nachholen
      if (almDoneKeys && almHeard && almHeard.key === hk) { const nk = doneKeys.filter((k) => !almDoneKeys.has(k)); if (nk.length) almShine = { keys: new Set(nk), t: Date.now() + 100 }; }
      almDoneKeys = new Set(doneKeys);
      if (!almHeard || almHeard.key !== hk) {
        // Spielbeginn (Woche 1, noch nichts angekreuzt): die ersten Würfel hörbar fallen lassen
        if (st.step === "play" && st.week === 1 && !st.done.length) almThrow(0);
        almHeard = { key: hk, week: st.week, step: st.step, done: myDone };
      } else {
        // Fläche fertig zuerst; kommt gleichzeitig (oder kurz danach) die neue Woche, rollen die Würfel erst nach dem Zweiklang
        if (seated && myDone > almHeard.done) { SND.flaeche(0.1); almChimeEnd = Date.now() + 800; }
        const wait = Math.max(0, almChimeEnd - Date.now()) / 1000;
        if (st.week !== almHeard.week && st.step !== "final" || (st.step === "play" && almHeard.step === "final")) almThrow(wait);
        if (st.step === "final" && almHeard.step !== "final") {
          const last = st.week !== almHeard.week; // Sommer durchs letzte Gewitter vorbei: erst die letzten Würfel
          if (last) almThrow(wait);
          // Sieg- bzw. Niederlage-Ton der Spielstube (nur für Mitspieler) – nach Zweiklang und Würfeln
          if (seated) setTimeout(() => ((st.winners || []).includes(G.myId) ? sfx.win() : sfx.lose()), wait * 1000 + (last ? 1300 : 300));
        }
        almHeard.week = st.week; almHeard.step = st.step; almHeard.done = myDone;
      }
    }

    // Spielerleiste: Punkte und wer diese Woche schon fertig ist
    const chips = st.seats.map((id) => `<span class="geo-score ${st.done.includes(id) ? "done" : ""}" style="--pc:${colorOf(v, id)}">
        <span class="pdot ${(v.players.find((p) => p.id === id) || {}).connected ? "" : "off"}"></span><span class="geo-score-name">${esc(nameOf(v, id))}${id === G.myId ? " <em>(du)</em>" : ""}</span>
        <b>${pts(id)}</b>${st.step === "play" ? `<span class="geo-mark">${st.done.includes(id) ? "✓" : "…"}</span>` : ""}</span>`).join("");
    const stormTrack = st.stormLimit ? `<span class="alm-storms" title="Beim ${st.stormLimit}. Gewitter ist der Sommer vorbei">⚡ ${Array.from({ length: st.stormLimit }, (_, k) => `<i class="${k < st.storms ? "on" : ""}"></i>`).join("")}</span>` : "";

    let main;
    if (st.step === "final") {
      if (almConfetti !== key) { almConfetti = key; if (st.winners && st.winners.includes(G.myId)) confetti(); }
      const rank = st.seats.slice().sort((a, b) => (st.totals[b] || 0) - (st.totals[a] || 0)), medal = ["🥇", "🥈", "🥉"];
      main = `<div class="banner win"><div class="trophy">🏔️</div><b>${st.endReason === "storm" ? "Ein Unwetter beendet den Sommer!" : "Der Sommer ist vorbei!"}</b>
          <div>${st.winners.map((id) => esc(nameOf(v, id))).join(" & ")} ${st.winners.length > 1 ? "gewinnen" : "gewinnt"} mit ${st.totals[st.winners[0]]} Punkten.</div>
          <div class="banner-actions"><button id="alm-restart" class="btn primary">Nochmal spielen</button>${G.isHost ? `<button id="toLobby" class="btn ghost">Zur Lobby</button>` : ""}</div></div>
        <div class="alm-final">${rank.map((id, i) => `<div class="alm-fp" style="--pc:${colorOf(v, id)}">
            <div class="alm-fh"><span>${(() => { const place = rank.filter((x) => (st.totals[x] || 0) > (st.totals[id] || 0)).length; return medal[place] || place + 1 + "."; })()}</span><b>${esc(nameOf(v, id))}${id === G.myId ? " (du)" : ""}</b><b class="alm-ft">${st.totals[id]}</b></div>
            ${boardHtml(v, st, new Set(st.boards[id]), { small: true })}
            <div class="muted small">${M.doneRegions(new Set(st.boards[id])).length} Flächen${st.extra[id] ? ` · Erstboni +${st.extra[id]}` : ""}</div></div>`).join("")}</div>`;
    } else {
      // welches Tal groß? eigenes (wenn mitspielend), sonst angetipptes oder das erste
      const lookId = seated && (!almLook || almLook === G.myId) ? G.myId : st.seats.includes(almLook) ? almLook : st.seats[0];
      const mine = lookId === G.myId && seated;
      const marked = boardOf(lookId);
      const d = mine && !iDone && almSel.di != null ? st.dice[almSel.di] : null;
      const terrain = d && !d.storm ? (d.t === "sun" ? almSel.terrain : d.t) : null, max = d && !d.storm ? d.n : 0;
      const err = terrain && almSel.cells.length ? M.checkCells(marked, terrain, almSel.cells, max) : null;
      const soon = !err && almSel.cells.length ? Object.keys(M.REGIONS).filter((k) => M.REGIONS[k].some((i) => almSel.cells.includes(i))
        && M.REGIONS[k].every((i) => marked.has(i) || almSel.cells.includes(i))) : [];
      // nach dem Abschicken erscheinen die eigenen Kreuze als normale Kreuze (nicht mehr als Auswahl)
      const board = boardHtml(v, st, marked, { interactive: mine && !iDone && !!terrain, terrain, sel: iDone ? [] : almSel.cells, soon: iDone ? [] : soon, fresh: lookId !== G.myId ? pend(lookId) : [], shine: lookId === G.myId && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) ? almShine : null });

      // Würfel und Aufgabe
      const dieHtml = (x, i) => x.storm ? `<div class="alm-die storm" title="Gewitter – nicht nutzbar"><small>Gewitter</small></div>`
        : `<div class="alm-die ${x.t} ${mine && !iDone ? "pick" : ""} ${almSel.di === i && mine ? "on" : ""}" ${mine && !iDone ? `data-adi="${i}"` : ""} title="${x.t === "sun" ? "Sonne – beliebiges Gelände" : NAMES[x.t]}: bis zu ${x.n} ${x.n === 1 ? "Feld" : "Felder"}"><span class="num">${x.n}</span><small>${x.t === "sun" ? "Sonne" : NAMES[x.t]}</small></div>`;
      const stormNow = st.dice.some((x) => x.storm);
      let task = "", msg = "", actions = "";
      if (!seated) task = `<p class="muted">Du schaust zu – tippe unten auf ein Tal, um es groß zu sehen.</p>`;
      else if (iDone) {
        const wait = st.seats.filter((id) => !st.done.includes(id) && (v.players.find((p) => p.id === id) || {}).connected);
        task = `<div class="alm-task">✓ Erledigt – ${wait.length ? `warte auf ${wait.map((id) => esc(nameOf(v, id))).join(", ")} …` : "gleich geht's weiter …"}</div>`;
      } else {
        const sunPick = d && d.t === "sun" ? `<div class="alm-sunpick">${["g", "w", "f", "b"].map((t) => `<button type="button" class="alm-sunopt ${almSel.terrain === t ? "on" : ""}" data-asun="${t}"><i class="alm-swatch ${t}"></i><span>${NAMES[t]}</span></button>`).join("")}</div>` : "";
        task = terrain ? `<div class="alm-task">Kreuze bis zu ${max} ${max === 1 ? "Feld" : "Felder"} ${NAMES[terrain]} an <span class="muted">(${almSel.cells.length}/${max})</span></div>${sunPick}`
          : d && d.t === "sun" ? `<div class="alm-task">☀️ Welches Gelände soll die Sonne sein?</div>${sunPick}`
          : st.dice.every((x) => x.storm) ? `<div class="alm-task">Alle Würfel zeigen Gewitter – diese Woche bleibt nur ein Ruhetag.</div>` : `<div class="alm-task">Nimm einen Würfel</div>`;
        const pts = soon.reduce((a, k) => a + M.regionValue(k), 0), race = soon.filter((k) => M.SPECIAL.includes(k) && !st.claimed[k]).length;
        msg = !terrain || !almSel.cells.length ? "" : err ? `<div class="msg err">${esc(err)}</div>`
          : soon.length ? `<div class="msg alm-preview">Damit ${soon.length === 1 ? "wird eine Fläche" : `werden ${soon.length} Flächen`} fertig: +${pts} Punkte${race ? ` (+${race * ALM.BONUS.first}, wenn du diese Woche der/die Erste bist)` : ""}!</div>`
          : `<div class="msg ok">Passt – ankreuzen${almSel.cells.length < max ? " (oder noch mehr Felder wählen)" : ""}!</div>`;
        // Hauptknopf über die ganze Breite, darunter zwei gleich große Nebenknöpfe
        actions = `<div class="alm-actions"><button class="btn primary alm-go" id="alm-go" ${terrain && almSel.cells.length && !err ? "" : "disabled"}>✓ Ankreuzen</button>
          <button class="btn ghost" id="alm-clear" ${almSel.cells.length ? "" : "disabled"} title="Auswahl löschen">↺ Löschen</button><button class="btn ghost" id="alm-rest" title="diese Woche nichts ankreuzen">🥨 Ruhetag</button></div>`;
      }
      // Woche, Gewitter und die eigenen Punkte stehen im Würfelkasten statt in einer eigenen Leiste (mehr Höhe fürs Tal);
      // die Punkte der anderen zeigen die kleinen Täler
      const head = `<div class="alm-dhead"><span class="game-label">Woche ${st.week}/${st.weeks}</span>${stormTrack}${seated ? `<span class="alm-mypts">Deine Punkte <b>${pts(G.myId)}</b></span>` : ""}</div>`;
      const dice = `<section class="panel alm-dice">${head}<div class="alm-dicerow">${st.dice.map(dieHtml).join("")}</div>
          ${stormNow && st.stormLimit ? `<div class="alm-stormnote">⚡ Gewitter! (${st.storms} von ${st.stormLimit})</div>` : ""}${task}<div class="alm-bar">${msg}${actions}</div></section>`;

      // die anderen Täler klein (antippen = groß ansehen)
      const others = st.seats.filter((id) => id !== lookId).map((id) => `<button type="button" class="alm-thumb" data-alook="${esc(id)}" style="--pc:${colorOf(v, id)}">
          <span class="alm-tn"><span class="pdot ${(v.players.find((p) => p.id === id) || {}).connected ? "" : "off"}"></span>${id === G.myId ? "Dein Tal" : esc(nameOf(v, id))}${st.done.includes(id) ? '<i class="alm-ok" title="diese Woche fertig">✓</i>' : '<i class="alm-wait" title="überlegt noch">…</i>'}<b>${pts(id)}</b></span>${boardHtml(v, st, boardOf(id), { small: true, fresh: id !== G.myId ? pend(id) : [] })}</button>`).join("");
      main = `<div class="alm-layout">
          <section class="panel alm-boardbox">${!mine ? `<div class="alm-looking">Tal von <b style="color:${colorOf(v, lookId)}">${esc(nameOf(v, lookId))}</b>${seated ? ` · <button class="btn ghost sm" data-alook="${esc(G.myId)}">zurück zu meinem Tal</button>` : ""}</div>` : ""}${board}</section>
          ${dice}
          ${others ? `<section class="alm-others">${others}</section>` : ""}
        </div>`;
    }

    app.innerHTML = `
      <main class="screen game alm">
        <header class="top topbar">${headBrandHtml("alm")}<div class="meta">${esc(st.mapName)} · ${esc(st.lengthName)}<span class="stube-code"> · Stube <b>${esc(v.code)}</b></span></div>${topActionsHtml()}</header>
        ${statusBarHtml()}
        <section class="slf-main">
          ${st.step !== "final" ? "" : `<div class="geo-bar"><span class="game-label">${st.step === "final" ? "Endstand" : `Woche ${st.week} von ${st.weeks}`}</span>${stormTrack}<div class="geo-scores">${chips}</div></div>`}
          ${main}
        </section>
      </main>`;

    fitAlm();
    almRollApply();
    const on = (id, fn) => { const el = app.querySelector(id); if (el) el.onclick = fn; };
    on("#leave", leave); on("#invite", invite);
    on("#mute", () => { sfx.toggle(); const b = app.querySelector("#mute"); if (b) b.textContent = sfx.muted ? "🔇" : "🔊"; });
    on("#toLobby", () => send({ type: "lobby" }));
    on("#alm-restart", () => send({ type: "almRestart" }));
    on("#alm-clear", () => { almSel.cells = []; renderAlm(); });
    on("#alm-rest", () => { almSent = key; send({ type: "almRest", week: st.week }); renderAlm(); });
    on("#alm-go", () => {
      const x = st.dice[almSel.di];
      almSent = key;
      send({ type: "almMove", week: st.week, di: almSel.di, terrain: x.t === "sun" ? almSel.terrain : x.t, cells: almSel.cells.slice() });
      renderAlm();
    });
    app.querySelectorAll("[data-adi]").forEach((b) => b.onclick = () => { almSel = { key, di: Number(b.dataset.adi), terrain: null, cells: [] }; renderAlm(); });
    app.querySelectorAll("[data-asun]").forEach((b) => b.onclick = () => { almSel.terrain = b.dataset.asun; almSel.cells = []; renderAlm(); });
    app.querySelectorAll("[data-alook]").forEach((b) => b.onclick = () => { almLook = b.dataset.alook; renderAlm(); });
    app.querySelectorAll(".acell.can").forEach((c) => c.onclick = () => {
      const i = Number(c.dataset.ai), k = almSel.cells.indexOf(i), x = st.dice[almSel.di];
      if (k >= 0) almSel.cells.splice(k, 1); else if (x && almSel.cells.length < x.n) { almSel.cells.push(i); almSelAt.set(i, Date.now()); SND.kreuze(1); } // Bleistiftstrich beim Ankreuzen eines Feldes
      renderAlm();
    });
  }
  // PC: Tal so groß, dass die ganze Spielseite ohne Scrollen ins Fenster passt (Breite folgt aus der verfügbaren Höhe);
  // die kleinen Täler der anderen scrollen bei vielen Spielern in ihrer Spalte. Handy: unverändert (Seite scrollt).
  function fitAlm() {
    const bd = app.querySelector(".alm-board"), co = app.querySelector(".alm-coords"), others = app.querySelector(".alm-others");
    const desk = innerWidth > 860;
    const layout = app.querySelector(".alm-layout");
    [bd, co].forEach((el) => { if (el) el.style.maxWidth = ""; });
    if (others) { others.style.maxHeight = ""; others.style.overflowY = ""; }
    if (layout) { layout.style.gridTemplateColumns = ""; layout.style.justifyContent = ""; }
    if (!desk || !bd) return;
    const top = bd.getBoundingClientRect().top + scrollY;
    const reserve = 60; // Koordinatenzeile, Innenabstand und Rand des Kastens, Abstand unter dem Spielfeld
    const h = Math.max(240, innerHeight - top - reserve);
    const w = Math.floor((h * M.COLS) / M.ROWS);
    [bd, co].forEach((el) => { if (el) el.style.maxWidth = w + "px"; });
    // Kasten ums Tal so breit wie das Tal (kein leerer Rand), beide Spalten mittig
    const box = app.querySelector(".alm-boardbox");
    if (layout && box) {
      const cs = getComputedStyle(box), pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      layout.style.gridTemplateColumns = `minmax(0, ${w + pad}px) 320px`;
      layout.style.justifyContent = "center";
    }
    if (others) {
      others.style.maxHeight = Math.max(90, innerHeight - (others.getBoundingClientRect().top + scrollY) - 28) + "px";
      others.style.overflowY = "auto";
    }
  }
  addEventListener("resize", () => { if (G.view && G.view.phase === "alm") renderAlm(); });

  return {
    renderAlm,
  };
});
