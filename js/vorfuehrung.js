// Kleine Vorführungen auf der Etappenkarte der Stubenmeisterschaft – nur für die Spiele, die man schwer aus einem Satz versteht.
// Rein gezeichnet (kein echtes Spiel), läuft in Schleife; links leuchtet dazu der passende Schritt auf.
// Zeitbasiert: Startzeit je Etappe, beim Neuzeichnen läuft die Vorführung an derselben Stelle weiter.
// „Bewegung reduzieren“: Standbild an einer aussagekräftigen Stelle, alle Schritte gleich hell.
(function () {
  const C = { anna: "#ffc83d", berta: "#4fc3f7" };
  const px = (x, y, s) => `translate(${x}px, ${y}px)` + (s != null ? ` scale(${s})` : "");
  const card = (id, cls = "") => `<span class="dm-card ${cls}">${id ? window.S10WattenCards.svg(id) : window.S10WattenCards.back()}</span>`;
  const flipCard = (id) => `<span class="dm-card flip"><span class="dm-f dm-back">${window.S10WattenCards.back()}</span><span class="dm-f dm-front">${window.S10WattenCards.svg(id)}</span></span>`;

  // Zeitleiste: frames = [[sekunde, {eigenschaften}, easing?]] – Werte gelten weiter, bis sie sich ändern; bei 0 alles angeben
  function tl(A, el, T, frames) {
    if (!el) return;
    let cur = {}; const out = [];
    frames.slice().sort((a, b) => a[0] - b[0]).forEach(([t, p, ease]) => { cur = { ...cur, ...p }; out.push({ ...cur, offset: Math.min(1, t / T), easing: ease || "ease-in-out" }); });
    const keys = new Set(out.flatMap((f) => Object.keys(f))); keys.delete("offset"); keys.delete("easing");
    keys.forEach((k) => { const first = out.find((f) => k in f)[k]; out.forEach((f) => { if (!(k in f)) f[k] = first; }); });
    if (out[0].offset > 0) out.unshift({ ...out[0], offset: 0 });
    if (out[out.length - 1].offset < 1) out.push({ ...out[out.length - 1], offset: 1 });
    A.push(el.animate(out, { duration: T * 1000, iterations: Infinity }));
  }
  const show = (A, el, T, a, b) => tl(A, el, T, [[0, { opacity: 0, transform: "translateY(6px)" }], [a, {}], [a + .3, { opacity: 1, transform: "none" }],
    ...(b ? [[b, {}], [b + .25, { opacity: 0, transform: "translateY(-4px)" }]] : [])]);
  const pop = (A, el, T, t, ease = "cubic-bezier(.3,1.6,.5,1)") => tl(A, el, T, [[0, { opacity: 0, transform: "scale(.3)" }], [t, {}, ease], [t + .3, { opacity: 1, transform: "none" }]]);
  // Finger: Spitze bei (12, 2) im Element; path = [[t, x, y, tippen?]]
  function finger(A, st, T, path) {
    const cur = st.querySelector(".dm-cur"), tap = st.querySelector(".dm-tap");
    const f = [[0, { transform: px(320, 270), opacity: 0 }]], taps = [[0, { left: "0px", top: "0px", transform: "scale(.3)", opacity: 0 }]];
    path.forEach(([t, x, y, tp]) => {
      f.push([t, { transform: px(x - 12, y - 2), opacity: 1 }, "cubic-bezier(.4,0,.2,1)"]);
      if (tp) { f.push([t + .1, { transform: px(x - 12, y - 2, .82) }], [t + .25, { transform: px(x - 12, y - 2) }]);
        taps.push([t + .08, { left: x + "px", top: y + "px", transform: "scale(.3)", opacity: 0 }], [t + .1, { opacity: 1 }], [t + .55, { transform: "scale(1.5)", opacity: 0 }]); }
    });
    f.push([path[path.length - 1][0] + .5, { opacity: 0 }]);
    tl(A, cur, T, f); tl(A, tap, T, taps);
  }
  // Wert wechseln: übereinanderliegende spans, times[i] = Wechsel von i zu i+1
  function swap(A, spans, T, times) {
    spans.forEach((s, i) => {
      const f = [[0, { opacity: i === 0 ? 1 : 0, transform: "none" }]];
      if (i > 0) f.push([times[i - 1], { opacity: 0, transform: "translateY(6px)" }], [times[i - 1] + .25, { opacity: 1, transform: "none" }]);
      if (i < spans.length - 1) f.push([times[i] - .01, { opacity: 1, transform: "none" }], [times[i] + .2, { opacity: 0, transform: "translateY(-6px)" }]);
      tl(A, s, T, f);
    });
  }
  const vals = (...v) => `<span class="dm-val">${v.map((x) => `<span>${x}</span>`).join("")}</span>`;
  const bump = (A, el, T, t) => tl(A, el, T, [[0, { transform: "none" }], [t, {}], [t + .15, { transform: "scale(1.15)" }], [t + .4, { transform: "none" }]]);
  const fly = (A, el, T, t, from, to) => tl(A, el, T, [[0, { opacity: 0, transform: px(...from) }], [t, {}], [t + .15, { opacity: 1 }], [t + .8, { transform: px(...to) }, "ease-in"], [t + .9, { opacity: 0 }]]);
  // Bühne am Anfang ein- und am Ende ausblenden, damit die Schleife weich neu beginnt
  const fade = (A, st, T) => [...st.children].forEach((c) => c.matches(".dm-cur, .dm-tap") || tl(A, c, T, [[0, { filter: "opacity(0)" }], [.3, { filter: "opacity(1)" }], [T - .35, { filter: "opacity(1)" }], [T, { filter: "opacity(0)" }]]));
  const UI = `<div class="dm-tap"></div><div class="dm-cur" aria-hidden="true">👆</div>`;

  const SCENES = {
    // ---------------- Busfahrt ----------------
    bus: { T: 10, still: 7.9, steps: [[0, 2.9], [2.9, 5.6], [5.6, 10]], build(st, A, T) {
      const SX = (i) => 8 + i * 57;
      st.innerHTML = [1, 1, 2, 10, 30].map((p, i) => `<div class="dm-stn" style="left:${SX(i)}px"><small>Station ${i + 1}</small>+${p}</div>`).join("")
        + [85, 130, 175].map((x) => `<div class="dm-slot" style="left:${x}px"></div>`).join("")
        + `<div class="dm-bc" style="left:85px">${flipCard("herz-8")}<i class="dm-ck">✓</i></div><div class="dm-bc" style="left:130px">${flipCard("laub-K")}<i class="dm-ck">✓</i></div>
        <div class="dm-pot"><small>Topf</small>${vals(0, 1, 2)}</div>
        <div class="dm-q"><b>Erste Karte: Figur oder Zahl?</b><div class="dm-bb"><span>👑 Figur</span><span>🔢 Zahl</span></div></div>
        <div class="dm-q"><b>Höher oder tiefer als die erste?</b><div class="dm-bb"><span>⬆️ Höher</span><span>⬇️ Tiefer</span></div></div>
        <div class="dm-q"><b>Zwischen, außerhalb – oder aussteigen?</b><div class="dm-bb three"><span>↔️ Zwischen</span><span>↕️ Außerhalb</span><span class="y">🛑 Aussteigen</span></div></div>
        <div class="dm-q"><b class="ok">✅ 2 Punkte gesichert!</b></div>
        <div class="dm-chips" style="top:206px"><div class="dm-chip" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, 2)}</div><div class="dm-chip" style="--pc:${C.berta}"><i></i>Berta ${vals(1)}</div></div>
        <div class="dm-float" id="dmF">+2</div>${UI}`;
      fade(A, st, T);
      const stn = [...st.querySelectorAll(".dm-stn")], q = [...st.querySelectorAll(".dm-q")], bc = [...st.querySelectorAll(".dm-bc")];
      const on = { borderColor: "#ffc83d", background: "rgba(255,200,61,.14)" }, done = { borderColor: "#2fbf71", background: "rgba(47,191,113,.14)" }, off = { borderColor: "#3a3378", background: "#1f1a4a" };
      tl(A, stn[0], T, [[0, on], [2.6, {}], [2.8, done]]); tl(A, stn[1], T, [[0, off], [2.9, {}], [3.1, on], [5.2, {}], [5.4, done]]); tl(A, stn[2], T, [[0, off], [5.5, {}], [5.7, on]]);
      show(A, q[0], T, .3, 2.9); show(A, q[1], T, 3.1, 5.5); show(A, q[2], T, 5.7, 7.0); show(A, q[3], T, 7.2);
      finger(A, st, T, [[.6, 220, 215], [1.3, 215, 157, true], [3.9, 85, 157, true], [6.7, 247, 157, true]]);
      [[1.7, 2.0, 2.5], [4.3, 4.6, 5.1]].forEach(([d, f, c], i) => {
        tl(A, bc[i], T, [[0, { opacity: 0, transform: "translateY(-18px)" }], [d, {}], [d + .3, { opacity: 1, transform: "none" }]]);
        tl(A, bc[i].querySelector(".dm-back"), T, [[0, { transform: "none" }], [f, {}], [f + .4, { transform: "rotateY(180deg)" }]]);
        tl(A, bc[i].querySelector(".dm-front"), T, [[0, { transform: "rotateY(-180deg)" }], [f, {}], [f + .4, { transform: "none" }]]);
        pop(A, bc[i].querySelector(".dm-ck"), T, c);
      });
      swap(A, [...st.querySelectorAll(".dm-pot .dm-val span")], T, [2.6, 5.2]);
      tl(A, st.querySelector(".dm-pot"), T, [[0, { transform: "none", opacity: 1 }], [2.6, {}], [2.75, { transform: "scale(1.15)" }], [3, { transform: "none" }], [5.2, {}], [5.35, { transform: "scale(1.15)" }], [5.6, { transform: "none" }], [7.0, {}], [7.3, { opacity: .35 }]]);
      fly(A, st.querySelector("#dmF"), T, 7.0, [242, 70], [58, 196]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val span")], T, [7.8]); bump(A, st.querySelector("#dmA"), T, 7.8);
    } },

    // ---------------- Stichhaltig ----------------
    stich: { T: 11, still: 9.2, steps: [[0, 2.8], [2.8, 8.5], [8.5, 11]], build(st, A, T) {
      const trump = window.S10WattenCards.sym("schelle", 1);
      st.innerHTML = `<div class="dm-sh"><span>Runde 2 · 2 Karten</span><span class="dm-trump">Trumpf <i>${trump}</i> Schelle</span></div>
        <div class="dm-pl" id="pA" style="left:8px;--pc:${C.anna}"><b><i></i>Anna</b><span class="dm-bid">${vals("?", "1")}</span><small>Stiche ${vals(0, 1)}</small></div>
        <div class="dm-pl" id="pB" style="left:154px;--pc:${C.berta}"><b><i></i>Berta</b><span class="dm-bid">${vals("…", "✓", "0")}</span><small>Stiche ${vals(0, 1)}</small></div>
        <div class="dm-bidui"><b>Wie viele Stiche machst du?</b><div class="dm-nums"><span>0</span><span>1</span><span>2</span></div></div>
        <div class="dm-tc" id="c1" style="left:108px;top:172px">${card("herz-A")}</div><div class="dm-tc" id="c2" style="left:152px;top:172px">${card("eichel-9")}</div>
        <div class="dm-tc" id="b1" style="left:155px;top:94px">${card("herz-9")}</div><div class="dm-tc" id="b2" style="left:155px;top:94px">${card("schelle-7")}</div>
        <div class="dm-note side" id="n1">Ass sticht die 9</div><div class="dm-note side" id="n2">kein Eichel – Trumpf sticht!</div>
        <div class="dm-float ok" id="fA">genau! +12</div><div class="dm-float bad" id="fB">daneben −2</div>${UI}`;
      fade(A, st, T);
      const $ = (s) => st.querySelector(s);
      show(A, $(".dm-bidui"), T, .2, 2.3);
      finger(A, st, T, [[.6, 220, 215], [1.2, 150, 141, true], [3.0, 128, 200, true], [6.0, 172, 200, true]]);
      swap(A, [...st.querySelectorAll("#pA .dm-bid .dm-val > span")], T, [1.4]); swap(A, [...st.querySelectorAll("#pB .dm-bid .dm-val > span")], T, [1.8, 2.5]);
      bump(A, $("#pA .dm-bid"), T, 2.5); bump(A, $("#pB .dm-bid"), T, 2.5);
      // 1. Stich: Anna spielt Herz-Ass, Berta bedient mit Herz-9 → Anna
      tl(A, $("#c1"), T, [[0, { transform: "none", opacity: 1 }], [3.1, {}], [3.5, { transform: px(-3, -78) }], [5.0, {}], [5.5, { transform: px(-50, -120, .3), opacity: 0 }]]);
      tl(A, $("#b1"), T, [[0, { transform: px(40, -60), opacity: 0 }], [4.0, {}], [4.4, { transform: "none", opacity: 1 }], [5.0, {}], [5.5, { transform: px(-100, -42, .3), opacity: 0 }]]);
      show(A, $("#n1"), T, 4.5, 5.4);
      swap(A, [...st.querySelectorAll("#pA small .dm-val > span")], T, [5.5]); bump(A, $("#pA"), T, 5.5);
      // 2. Stich: Anna spielt Eichel-9, Berta hat kein Eichel und sticht mit Trumpf → Berta
      tl(A, $("#c2"), T, [[0, { transform: "none", opacity: 1 }], [6.1, {}], [6.5, { transform: px(-47, -78) }], [7.6, {}], [8.1, { transform: px(40, -120, .3), opacity: 0 }]]);
      tl(A, $("#b2"), T, [[0, { transform: px(40, -60), opacity: 0 }], [6.8, {}], [7.2, { transform: "none", opacity: 1 }], [7.6, {}], [8.1, { transform: px(50, -42, .3), opacity: 0 }]]);
      show(A, $("#n2"), T, 7.2, 8.0);
      swap(A, [...st.querySelectorAll("#pB small .dm-val > span")], T, [8.1]); bump(A, $("#pB"), T, 8.1);
      tl(A, $("#fA"), T, [[0, { opacity: 0, transform: px(30, 90) }], [8.6, {}, "cubic-bezier(.3,1.6,.5,1)"], [8.9, { opacity: 1, transform: px(30, 84) }]]);
      tl(A, $("#fB"), T, [[0, { opacity: 0, transform: px(170, 90) }], [8.8, {}, "cubic-bezier(.3,1.6,.5,1)"], [9.1, { opacity: 1, transform: px(170, 84) }]]);
    } },

    // ---------------- Almsommer ----------------
    alm: { T: 10, still: 5.4, steps: [[0, 1.6], [1.6, 4.3], [4.3, 10]], build(st, A, T) {
      // Gelände (H = Hof) und Flächen; Fläche D (3 Wiesen neben dem Hof) wird in der Vorführung fertig
      const G = ["fffwwwb", "fggwwwb", "gggHggb", "ggggwgb"].map((r) => r.split(""));
      const reg = ["AAABBBC", "ADDBBBC", "EEDHFFC", "EEEEGFC"].map((r) => r.split("")), badge = { A: 4, B: 6, C: 4, D: 3, E: 6, F: 3, G: 1 }, first = {};
      // Tal liegt bei (42, 59) mit 3 px Rand; Felder relativ dazu, Kreuze auf der Bühne
      const S = 30, X0 = 45, Y0 = 62, sym = (window.S10AlmArt || {}).SYMBOL_SVG || {};
      let cells = "";
      for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
        const t = G[r][c] === "H" ? "h" : G[r][c], k = reg[r][c], e = (rr, cc) => rr < 0 || rr > 3 || cc < 0 || cc > 6 ? false : reg[rr][cc] !== k;
        const edges = [e(r - 1, c) && "bt", e(r + 1, c) && "bb", e(r, c - 1) && "bl", e(r, c + 1) && "br"].filter(Boolean).join(" ");
        const b = !first[k] && k !== "H" ? (first[k] = 1, `<span class="dm-ab" ${k === "D" ? 'id="abD"' : ""}>${badge[k]}</span>`) : "";
        cells += `<div class="acell ${t} v${(r * 7 + c) % 3} ${edges}" style="left:${3 + c * S}px;top:${3 + r * S}px" data-rc="${r}${c}">${t === "h" ? `<span class="as">${sym.hof || "🏡"}</span>` : ""}${b}</div>`;
      }
      const die = (t, n, name, x) => `<div class="dm-die alm-die ${t}" style="left:${x}px">${`<span class="num">${n}</span>`}<small>${name}</small></div>`;
      st.innerHTML = die("g", 3, "Wiese", 70) + die("w", 2, "Wald", 128) + die("f", 4, "Fels", 186)
        + `<div class="dm-almb">${cells}</div>` + ["22", "12", "11"].map((rc, i) => `<span class="dm-x" id="x${i}" style="left:${X0 + rc[1] * S}px;top:${Y0 + rc[0] * S}px">✕</span>`).join("")
        + `<div class="dm-btn" id="go">✓ Ankreuzen</div>
        <div class="dm-chips" style="left:166px;top:198px"><div class="dm-chip" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, 3)}</div></div>
        <div class="dm-float" id="dmF">+3</div>${UI}`;
      fade(A, st, T);
      const $ = (s) => st.querySelector(s), dice = [...st.querySelectorAll(".dm-die")];
      finger(A, st, T, [[.4, 220, 215], [1.0, 92, 30, true], [1.9, X0 + 2 * S + 15, Y0 + 2 * S + 15, true], [2.5, X0 + 2 * S + 15, Y0 + S + 15, true], [3.1, X0 + S + 15, Y0 + S + 15, true], [3.8, 81, 211, true]]);
      tl(A, dice[0], T, [[0, { transform: "none", borderColor: "rgba(255,255,255,.55)" }], [1.1, {}], [1.25, { transform: "translateY(-3px)", borderColor: "#ffc83d" }]]);
      [dice[1], dice[2]].forEach((d) => tl(A, d, T, [[0, { opacity: 1 }], [1.1, {}], [1.3, { opacity: .45 }]]));
      // erlaubte Felder kurz hervorheben (Wiese neben dem Hof)
      const hint = (el, a, b) => tl(A, el, T, [[0, { boxShadow: "inset 0 0 0 0 rgba(255,200,61,0)" }], [a, {}], [a + .2, { boxShadow: "inset 0 0 0 3px rgba(255,200,61,.9)" }], [b, {}], [b + .15, { boxShadow: "inset 0 0 0 0 rgba(255,200,61,0)" }]]);
      hint($('[data-rc="22"]'), 1.3, 1.95); hint($('[data-rc="12"]'), 2.0, 2.55); hint($('[data-rc="11"]'), 2.6, 3.15);
      [1.95, 2.55, 3.15].forEach((t, i) => tl(A, $("#x" + i), T, [[0, { opacity: 0, transform: "scale(1.8) rotate(-20deg)" }], [t, {}, "cubic-bezier(.2,.8,.3,1.2)"], [t + .2, { opacity: 1, transform: "none" }]]));
      tl(A, $("#go"), T, [[0, { opacity: .5 }], [3.2, {}], [3.4, { opacity: 1 }], [4.1, {}], [4.3, { opacity: .5 }]]);
      // Fläche voll: goldener Schimmer über den drei Feldern, Punktezahl springt
      ["11", "12", "22"].forEach((rc) => tl(A, $(`[data-rc="${rc}"]`), T, [[0, { filter: "brightness(1)" }], [4.3, {}], [4.5, { filter: "brightness(1.35)" }], [5.0, { filter: "brightness(1)" }]]));
      tl(A, $("#abD"), T, [[0, { transform: "none", background: "rgba(20,16,50,.82)", color: "#fff" }], [4.3, {}], [4.5, { transform: "scale(1.5)", background: "#ffc83d", color: "#2a1d00" }], [4.9, { transform: "scale(1.15)" }]]);
      fly(A, $("#dmF"), T, 4.8, [X0 + S - 4, Y0 + S - 8], [190, 190]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val span")], T, [5.6]); bump(A, $("#dmA"), T, 5.6);
    } },

    // ---------------- Auf der Jagd ----------------
    jagd: { T: 10, still: 6.4, steps: [[0, 2.6], [2.6, 5.7], [5.7, 10]], build(st, A, T) {
      const TER = ["wwggf", "wgggf", "wwgff", "gggwf", "ggwww"].map((r) => r.split(""));
      const art = window.S10JagdArt || {}, ico = (k) => (art.ICON || {})[k] || "", J = window.S10Jagd || { HIT: 1, ANIMALS: [] };
      const killFox = ((J.ANIMALS || []).find((a) => a.id === "fuchs") || { kill: 4 }).kill, gain = (J.HIT || 1) + killFox;
      const grid = (x0, y0, s, id) => { let h = `<div class="dm-rev" id="${id}" style="left:${x0}px;top:${y0}px;width:${5 * s}px;height:${5 * s}px">`;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) h += `<div class="jcell ${TER[r][c]} v${(r * 5 + c) % 3}" style="left:${c * s}px;top:${r * s}px;width:${s}px;height:${s}px" data-rc="${r}${c}"></div>`;
        return h + "</div>"; };
      const MS = 18, MX = 10, MY = 46, BS = 32, BX = 128, BY = 30;
      const mine = [["fuchs", 3, 1], ["hirsch", 0, 0], ["hirsch", 1, 0], ["gams", 0, 4], ["gams", 1, 4], ["gams", 2, 4]];
      st.innerHTML = `<div class="dm-lab" style="left:${MX}px">Dein Revier</div><div class="dm-lab" style="left:${BX}px">Bertas Revier</div>`
        + grid(MX, MY, MS, "rm") + grid(BX, BY, BS, "rb")
        + mine.map(([k, r, c], i) => `<span class="dm-an" id="m${i}" style="left:${MX + c * MS}px;top:${MY + r * MS}px;width:${MS}px;height:${MS}px">${ico(k)}</span>`).join("")
        + `<span class="dm-shot miss" id="o1" style="left:${MX + 2 * MS + MS / 2}px;top:${MY + 2 * MS + MS / 2}px;--pc:${C.berta}"></span>`
        + `<span class="dm-shot miss" id="o2" style="left:${MX + 4 * MS + MS / 2}px;top:${MY + 3 * MS + MS / 2}px;--pc:${C.berta}"></span>`
        + `<span class="dm-shot miss" id="s1" style="left:${BX + BS * 1.5}px;top:${BY + BS * 1.5}px"></span>`
        + `<span class="dm-an big" id="tr" style="left:${BX + 3 * BS}px;top:${BY + 2 * BS}px;width:${BS}px;height:${BS}px">${art.TRACK || "🐾"}</span>`
        + `<span class="dm-an big" id="fx" style="left:${BX + 3 * BS}px;top:${BY + 3 * BS}px;width:${BS}px;height:${BS}px">${ico("fuchs")}</span>`
        + `<span class="dm-flash" id="fl" style="left:${BX + 3.5 * BS}px;top:${BY + 3.5 * BS}px"></span>`
        + `<div class="dm-note" id="nT" style="left:${BX}px;width:${5 * BS}px;top:${BY + 5 * BS + 4}px">🐾 Fuchs ist direkt daneben!</div>`
        + `<div class="dm-note" id="nK" style="left:${BX}px;width:${5 * BS}px;top:${BY + 5 * BS + 4}px">🦊 Fuchs erlegt!</div>`
        + `<div class="dm-chips" style="left:8px;top:150px;flex-direction:column;align-items:flex-start"><div class="dm-chip" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, gain)}</div>
          <div class="dm-chip" style="--pc:${C.berta}"><i></i>Berta ${vals(0)}</div></div>
        <div class="dm-float" id="dmF">+${gain}</div>${UI}`;
      fade(A, st, T);
      const $ = (s) => st.querySelector(s);
      // 1. eigenes Wild verstecken
      [[0, .4], [1, .9], [2, .9], [3, 1.4], [4, 1.4], [5, 1.4]].forEach(([i, t]) => pop(A, $("#m" + i), T, t));
      // 2. schießen – Berta schießt gleichzeitig bei Anna
      const aim = (t, x, y) => [t, x, y, true];
      finger(A, st, T, [[2.4, 260, 215], aim(3.0, BX + BS * 1.5, BY + BS * 1.5), aim(4.2, BX + BS * 3.5, BY + BS * 2.5), aim(5.4, BX + BS * 3.5, BY + BS * 3.5)]);
      pop(A, $("#s1"), T, 3.15); pop(A, $("#o1"), T, 3.3); pop(A, $("#o2"), T, 4.5);
      tl(A, $("#tr"), T, [[0, { opacity: 0, transform: "translateY(4px)" }], [4.35, {}], [4.65, { opacity: 1, transform: "none" }]]);
      show(A, $("#nT"), T, 4.4, 5.3);
      tl(A, $("#fl"), T, [[0, { opacity: 0, transform: "scale(.2)" }], [5.5, {}], [5.6, { opacity: 1 }], [6.0, { opacity: 0, transform: "scale(2.2)" }]]);
      pop(A, $("#fx"), T, 5.65);
      tl(A, $('#rb [data-rc="33"]'), T, [[0, { boxShadow: "inset 0 0 0 0 rgba(47,191,113,0)" }], [5.6, {}], [5.8, { boxShadow: "inset 0 0 0 3px rgba(47,191,113,1)" }]]);
      show(A, $("#nK"), T, 5.7);
      fly(A, $("#dmF"), T, 6.3, [BX + BS * 3.2, BY + BS * 3], [60, 140]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val span")], T, [7.1]); bump(A, $("#dmA"), T, 7.1);
    } },
  };

  const reduce = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const has = (key) => !!SCENES[key];
  const html = () => `<div class="dm-stage" aria-hidden="true"></div><button type="button" class="linkbtn dm-replay">↻ nochmal ansehen</button>`;
  // box: Element mit .dm-stage; steps: die Schritt-Zeilen (li) links; t0: Startzeit (ms) – läuft an derselben Stelle weiter
  function mount(box, key, t0, stepsEls) {
    const sc = SCENES[key], st = box && box.querySelector(".dm-stage");
    if (!sc || !st || !st.animate) return;
    const A = [];
    try { sc.build(st, A, sc.T); } catch (e) { console.warn("Vorführung " + key + ": " + (e && e.message)); st.innerHTML = ""; return; }
    const still = reduce();
    (stepsEls || []).forEach((li, i) => {
      const w = sc.steps[i]; if (!w || still) return;
      const on = { opacity: 1, background: "color-mix(in srgb, var(--gc) 14%, transparent)", borderColor: "color-mix(in srgb, var(--gc) 45%, transparent)" },
        off = { opacity: .5, background: "transparent", borderColor: "transparent" }, [a, b] = w;
      tl(A, li, sc.T, [[0, a === 0 ? on : off], [Math.max(0, a - .01), a === 0 ? on : off], [a + .2, on], [b - .01, on], [b + .2, b >= sc.T ? on : off]]);
    });
    const at = still ? sc.still * 1000 : Math.max(0, Date.now() - t0);
    A.forEach((a) => { if (still) a.pause(); a.currentTime = at; });
  }
  window.S10Demo = { has, html, mount };
})();
