// Kleine Vorführungen auf der Etappenkarte der Stubenmeisterschaft – für die Spiele, die man schwer aus einem Satz versteht.
// Rein gezeichnet (kein echtes Spiel), läuft in Schleife neben den drei Schritten.
// Zeitbasiert: Startzeit je Etappe, beim Neuzeichnen läuft die Vorführung an derselben Stelle weiter.
// „Bewegung reduzieren“: Standbild an einer aussagekräftigen Stelle.
(function () {
  const C = { anna: "#ffc83d", berta: "#4fc3f7", chris: "#f472b6" };
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
    // ---------------- Busfahrt (wie das Spielfeld: Spieltisch, Stationen mit Kartenfeldern, Topf, Antwortkarten, STOP) ----------------
    bus: { T: 10, still: 7.9, build(st, A, T) {
      st.classList.add("dm-felt");
      const X = (i) => 10 + i * 44, mini = (id) => `<span class="dm-mc">${window.S10WattenCards.svg(id)}</span>`, dot = `<i class="dm-dot"></i>`;
      const ac = (ill, b, x) => `<div class="dm-ac" style="left:${x}px"><span class="ill">${ill}</span><b>${b}</b></div>`;
      st.innerHTML = [1, 1, 2, 10, 30].map((p, i) => `<div class="dm-bst" style="left:${X(i)}px">+${p}</div>`).join("")
        + [0, 1, 2, 3, 4].map((i) => `<div class="dm-bsl" style="left:${X(i)}px"></div>`).join("")
        + `<div class="dm-bc" style="left:${X(0) + 2}px">${flipCard("herz-8")}</div><div class="dm-bc" style="left:${X(1) + 2}px">${flipCard("laub-K")}</div>
        <i class="dm-bbus" aria-hidden="true">🚌</i>
        <div class="dm-bpot"><small>${vals("Topf", "Topf", "Topf", "Sicher")}</small><b>${vals(0, 1, 2, "+2")}</b></div>
        <div class="dm-bq"><b>Figur oder Zahl?</b><span>Tippe auf eine Karte.</span>${ac(mini("herz-K"), "Figur", 70)}${ac(mini("laub-9"), "Zahl", 160)}</div>
        <div class="dm-bq"><b>Höher oder tiefer als die erste?</b><span>Oder steig aus und nimm den Topf mit.</span>${ac(`<i class="dm-ar">▲</i>${mini("herz-8")}`, "Höher", 70)}${ac(`${mini("herz-8")}<i class="dm-ar dn">▼</i>`, "Tiefer", 160)}</div>
        <div class="dm-bq"><b>Zwischen oder außerhalb?</b><span>Oder lieber aussteigen …</span>${ac(mini("herz-8") + dot + mini("laub-K"), "Zwischen", 26)}${ac(dot + mini("herz-8") + mini("laub-K") + dot, "Außerhalb", 104)}
          <div class="dm-stop" style="left:196px"><span>STOP</span></div><small class="dm-stopl" style="left:186px">Aussteigen</small></div>
        <div class="dm-bq"><b class="ok">🚏 Ausgestiegen!</b><span>2 Punkte sicher – der Bus fährt ohne dich weiter.</span></div>
        ${UI}`;
      fade(A, st, T);
      const $ = (x) => st.querySelector(x), stn = [...st.querySelectorAll(".dm-bst")], q = [...st.querySelectorAll(".dm-bq")], bc = [...st.querySelectorAll(".dm-bc")], acs = [...st.querySelectorAll(".dm-ac")];
      const on = { borderColor: "#ffc83d", background: "rgba(255,200,61,.22)" }, ok = { borderColor: "#2fbf71", background: "rgba(47,191,113,.3)" }, off = { borderColor: "rgba(255,255,255,.18)", background: "rgba(10,30,20,.55)" };
      tl(A, stn[0], T, [[0, on], [2.6, {}], [2.8, ok]]); tl(A, stn[1], T, [[0, off], [3.3, {}], [3.5, on], [5.2, {}], [5.4, ok]]);
      tl(A, stn[2], T, [[0, off], [5.9, {}], [6.1, on], [7.1, {}], [7.3, { borderColor: "#ffc83d", background: "rgba(255,200,61,.45)" }]]);
      tl(A, $(".dm-bbus"), T, [[0, { transform: px(X(0) + 7, 0) }], [2.9, {}, "cubic-bezier(.55,0,.3,1)"], [3.5, { transform: px(X(1) + 7, 0) }], [5.5, {}, "cubic-bezier(.55,0,.3,1)"], [6.1, { transform: px(X(2) + 7, 0) }], [7.1, { opacity: 1 }], [7.5, { opacity: .3 }]]);
      show(A, q[0], T, .3, 2.9); show(A, q[1], T, 3.1, 5.5); show(A, q[2], T, 5.7, 7.0); show(A, q[3], T, 7.2);
      finger(A, st, T, [[.6, 230, 225], [1.3, 195, 186, true], [3.9, 105, 186, true], [6.7, 218, 186, true]]);
      const pick = (el, t) => tl(A, el, T, [[0, { transform: "none", boxShadow: "0 3px 0 #c9bd9e" }], [t, {}], [t + .15, { transform: "translateY(-5px) rotate(-2deg)", boxShadow: "0 0 0 2px #ffc83d, 0 3px 0 #c48f0a" }]]);
      pick(acs[1], 1.4); pick(acs[2], 4.0);
      tl(A, $(".dm-stop"), T, [[0, { transform: "none", boxShadow: "0 4px 0 #6d0f1b" }], [6.8, {}], [6.9, { transform: "translateY(3px)", boxShadow: "0 1px 0 #6d0f1b, 0 0 14px rgba(255,90,90,.8)" }]]);
      [[1.7, 2.0], [4.3, 4.6]].forEach(([d, f], i) => {
        tl(A, bc[i], T, [[0, { opacity: 0, transform: "translateY(-18px)" }], [d, {}], [d + .3, { opacity: 1, transform: "none" }]]);
        tl(A, bc[i].querySelector(".dm-back"), T, [[0, { transform: "none" }], [f, {}], [f + .4, { transform: "rotateY(180deg)" }]]);
        tl(A, bc[i].querySelector(".dm-front"), T, [[0, { transform: "rotateY(-180deg)" }], [f, {}], [f + .4, { transform: "none" }]]);
      });
      swap(A, [...st.querySelectorAll(".dm-bpot b .dm-val > span")], T, [2.6, 5.2, 7.3]);
      swap(A, [...st.querySelectorAll(".dm-bpot small .dm-val > span")], T, [2.6, 5.2, 7.3]);
      tl(A, $(".dm-bpot"), T, [[0, { transform: "none", borderColor: "rgba(255,200,61,.55)", color: "#ffc83d" }], [2.6, {}], [2.75, { transform: "scale(1.12)" }], [3, { transform: "none" }],
        [5.2, {}], [5.35, { transform: "scale(1.12)" }], [5.6, { transform: "none" }], [7.3, {}], [7.45, { transform: "scale(1.15)", borderColor: "#2fbf71", color: "#7ee2b1" }], [7.7, { transform: "none" }]]);
    } },

    // ---------------- Stichhaltig ----------------
    stich: { T: 11, still: 9.2, build(st, A, T) {
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

    // ---------------- Fragewand ----------------
    wand: { T: 7.6, still: 6.6, build(st, A, T) {
      const cats = [["🏔️", "Berge"], ["🍝", "Essen"], ["⚽", "Sport"]], pts = [10, 20, 30, 50], W = 89.33, X = (c) => 10 + c * (W + 6), Y = (r) => 39 + r * 39;
      let h = cats.map(([e, n], c) => `<div class="dm-fwh" style="left:${X(c)}px;width:${W}px"><span>${e}</span>${n}</div>`).join("");
      pts.forEach((p, r) => cats.forEach((_, c) => {
        const pre = c === 2 && r === 0 ? "Berta" : c === 0 && r === 1 ? "Chris" : null, pc = pre === "Berta" ? C.berta : pre === "Chris" ? C.chris : C.anna;
        h += `<div class="dm-fwt ${pre ? "done" : ""}" ${c === 1 && r === 3 ? 'id="fwT"' : ""} style="left:${X(c)}px;top:${Y(r)}px;width:${W}px;--pc:${pc}">
          <div class="dm-ff fr">${p}</div><div class="dm-ff bk"><i></i>${pre || "Anna"}</div></div>`;
      }));
      st.innerHTML = h + `<div class="dm-fwc"><div class="top">🍝 ESSEN · 50 PUNKTE</div><div class="q">Welche Nudelsorte heißt übersetzt „kleine Zungen“?</div>
        <div class="in"><span class="typed">Linguine</span><span class="caret"></span></div><div class="ok">✓ Richtig! +50</div></div>
        <div class="dm-chips" style="top:204px"><div class="dm-chip turn" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, 50)}</div>
          <div class="dm-chip" style="--pc:${C.berta}"><i></i>Berta ${vals(10)}</div><div class="dm-chip" style="--pc:${C.chris}"><i></i>Chris ${vals(20)}</div></div>
        <div class="dm-float" id="dmF">+50</div>${UI}`;
      fade(A, st, T);
      const $ = (x) => st.querySelector(x), tile = $("#fwT"), cd = $(".dm-fwc");
      finger(A, st, T, [[.5, 230, 215], [1.35, 150, 173, true]]);
      tl(A, tile.querySelector(".fr"), T, [[0, { transform: "none", boxShadow: "0 3px 0 #1b1660, 0 0 0 1px rgba(255,200,61,.35)" }], [1.45, {}], [1.55, { boxShadow: "0 3px 0 #1b1660, 0 0 0 3px #ffc83d" }], [5.3, { transform: "none" }], [5.8, { transform: "rotateY(-180deg)" }]]);
      tl(A, tile.querySelector(".bk"), T, [[0, { transform: "rotateY(180deg)" }], [5.3, {}], [5.8, { transform: "none" }]]);
      tl(A, cd, T, [[0, { opacity: 0, transform: px(0, 69, .3) }], [1.7, {}, "cubic-bezier(.2,.8,.3,1.1)"], [2.2, { opacity: 1, transform: "none" }], [4.9, {}], [5.3, { opacity: 0, transform: px(0, 69, .3) }]]);
      tl(A, cd.querySelector(".typed"), T, [[0, { maxWidth: "0px" }], [2.6, {}, "steps(8)"], [3.6, { maxWidth: "80px" }]]);
      tl(A, cd.querySelector(".in"), T, [[0, { borderColor: "#3a3378", background: "#15123a" }], [3.85, {}], [4.0, { borderColor: "#2fbf71", background: "rgba(47,191,113,.15)" }]]);
      tl(A, cd.querySelector(".ok"), T, [[0, { opacity: 0, transform: "translateY(4px)" }], [3.9, {}], [4.15, { opacity: 1, transform: "none" }]]);
      fly(A, $("#dmF"), T, 5.5, [135, 160], [48, 192]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val > span")], T, [6.3]); bump(A, $("#dmA"), T, 6.3);
    } },

    // ---------------- Wo liegt das? ----------------
    geo: { T: 7.6, still: 5.6, build(st, A, T) {
      const P = [128, 130], B = [152, 96], Q = [208, 152];
      st.innerHTML = `<div class="dm-geoq">📍 Wo liegt <b>Meran</b>?</div>
        <div class="dm-map"><svg viewBox="0 0 280 160">
          <path d="M-10 40 C 30 20, 60 30, 90 12 S 150 -6, 190 18 S 250 10, 290 30 L 290 170 L -10 170 Z" fill="#3e7a4f"/>
          <path d="M-10 70 C 40 60, 70 80, 110 66 S 180 50, 220 72 S 270 66, 290 80 L 290 170 L -10 170 Z" fill="#4c8c5a"/>
          <path d="M40 30 l14 -18 l12 16 M150 22 l16 -20 l14 18 M210 34 l12 -16 l12 14" fill="#e8e4f4" opacity=".75"/>
          <path d="M60 160 C 90 120, 120 110, 140 70 S 170 40, 200 20" stroke="#7cc4ff" stroke-width="3" fill="none" opacity=".8"/>
          <path d="M140 70 C 110 60, 80 66, 30 50" stroke="#7cc4ff" stroke-width="2" fill="none" opacity=".7"/></svg></div>
        <svg class="dm-lines" viewBox="0 0 300 240"><line id="lA" x1="${P[0]}" y1="${P[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${C.anna}" stroke-width="2.5" stroke-linecap="round"/>
          <line id="lB" x1="${Q[0]}" y1="${Q[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${C.berta}" stroke-width="2.5" stroke-linecap="round"/></svg>
        <div class="dm-pin" id="pA" style="left:${P[0]}px;top:${P[1]}px;--pc:${C.anna}"></div><div class="dm-pin" id="pB" style="left:${Q[0]}px;top:${Q[1]}px;--pc:${C.berta}"></div>
        <div class="dm-goal" style="left:${B[0]}px;top:${B[1]}px">⭐</div>
        <div class="dm-km" id="kA" style="left:${(P[0] + B[0]) / 2 - 44}px;top:${(P[1] + B[1]) / 2 - 6}px">5 km</div>
        <div class="dm-km" id="kB" style="left:${(Q[0] + B[0]) / 2 + 8}px;top:${(Q[1] + B[1]) / 2 - 6}px">22 km</div>
        <div class="dm-chips" style="top:208px"><div class="dm-chip" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, 940)}</div><div class="dm-chip" id="dmB" style="--pc:${C.berta}"><i></i>Berta ${vals(0, 610)}</div></div>
        <div class="dm-float" id="fA">+940</div><div class="dm-float" id="fB" style="color:${C.berta}">+610</div>${UI}`;
      fade(A, st, T);
      const $ = (x) => st.querySelector(x);
      tl(A, $(".dm-geoq"), T, [[0, { transform: "scale(1)" }], [.35, {}], [.55, { transform: "scale(1.12)" }], [.8, { transform: "scale(1)" }]]);
      finger(A, st, T, [[.9, 190, 200], [1.5, P[0], P[1], true]]);
      const drop = (el, t) => tl(A, el, T, [[0, { opacity: 0, transform: "translateY(-22px)" }], [t, {}, "cubic-bezier(.3,1.5,.5,1)"], [t + .35, { opacity: 1, transform: "none" }]]);
      drop($("#pA"), 1.6); drop($("#pB"), 2.0);
      tl(A, $(".dm-goal"), T, [[0, { opacity: 0, transform: "scale(.2) rotate(-90deg)" }], [2.7, {}, "cubic-bezier(.3,1.6,.5,1)"], [3.05, { opacity: 1, transform: "none" }]]);
      const line = (el, t) => { const L = Math.hypot(el.x2.baseVal.value - el.x1.baseVal.value, el.y2.baseVal.value - el.y1.baseVal.value);
        el.style.strokeDasharray = L; tl(A, el, T, [[0, { strokeDashoffset: L }], [t, {}], [t + .6, { strokeDashoffset: 0 }]]); };
      line($("#lA"), 3.1); line($("#lB"), 3.2);
      pop(A, $("#kA"), T, 3.7); pop(A, $("#kB"), T, 3.8);
      fly(A, $("#fA"), T, 4.3, [P[0] - 20, P[1] - 24], [40, 196]); fly(A, $("#fB"), T, 4.5, [Q[0] - 10, Q[1] - 26], [120, 196]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val > span")], T, [5.1]); bump(A, $("#dmA"), T, 5.1);
      swap(A, [...st.querySelectorAll("#dmB .dm-val > span")], T, [5.3]); bump(A, $("#dmB"), T, 5.3);
    } },

    // ---------------- Hinweis für Hinweis ----------------
    hinweis: { T: 8.5, still: 5.4, build(st, A, T) {
      st.innerHTML = `<div class="dm-hq">Gesucht: <b>eine Stadt</b></div><div class="dm-hpts">${vals("5 Punkte", "4 Punkte")}</div>
        <div class="dm-htimer"><i></i></div>
        <div class="dm-hint" id="h1"><span>1</span>liegt an der Donau</div>
        <div class="dm-hint" id="h2"><span>2</span>hat ein Riesenrad im Prater</div>
        <div class="dm-hin"><span class="typed">Wien</span><span class="caret"></span><b class="dm-hgo">Raten</b></div>
        <div class="dm-hok">✓ Richtig! +4</div>
        <div class="dm-note" id="hn" style="top:176px">Nur ein Versuch – früh raten bringt mehr!</div>
        <div class="dm-chips" style="top:206px"><div class="dm-chip" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, 4)}</div><div class="dm-chip" style="--pc:${C.berta}"><i></i>Berta <span class="dm-st">rät noch …</span></div></div>
        <div class="dm-float" id="dmF">+4</div>${UI}`;
      fade(A, st, T);
      const $ = (x) => st.querySelector(x);
      show(A, $("#h1"), T, .4); show(A, $("#h2"), T, 2.4);
      // Zeitleiste je Hinweis: läuft ab, beim 2. Hinweis bleibt sie stehen, sobald geraten ist
      tl(A, $(".dm-htimer i"), T, [[0, { width: "100%" }], [.4, {}, "linear"], [2.3, { width: "0%" }], [2.35, { width: "100%" }], [2.4, {}, "linear"], [3.9, { width: "25%" }]]);
      swap(A, [...st.querySelectorAll(".dm-hpts .dm-val > span")], T, [2.35]); bump(A, $(".dm-hpts"), T, 2.35);
      tl(A, $(".dm-hin .typed"), T, [[0, { maxWidth: "0px" }], [2.8, {}, "steps(4)"], [3.4, { maxWidth: "40px" }]]);
      finger(A, st, T, [[2.3, 230, 225], [3.7, 262, 141, true]]);
      tl(A, $(".dm-hin"), T, [[0, { borderColor: "rgba(255,255,255,.25)", background: "rgba(0,0,0,.3)" }], [3.85, {}], [4.0, { borderColor: "#2fbf71", background: "rgba(47,191,113,.22)" }]]);
      pop(A, $(".dm-hok"), T, 4.0); show(A, $("#hn"), T, 5.0);
      fly(A, $("#dmF"), T, 4.5, [150, 160], [52, 202]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val > span")], T, [5.3]); bump(A, $("#dmA"), T, 5.3);
    } },

    // ---------------- Von oben ----------------
    oben: { T: 9, still: 6.4, build(st, A, T) {
      st.classList.add("dm-felt");
      const sat = `<svg viewBox="0 0 150 150" aria-hidden="true"><rect width="150" height="150" fill="#5d6b4f"/>
        ${Array.from({ length: 36 }, (_, k) => { const x = (k % 6) * 25 + 3, y = Math.floor(k / 6) * 25 + 3; return `<rect x="${x}" y="${y}" width="19" height="19" rx="2" fill="${["#b9b3a6", "#a69f90", "#c9c2b2", "#8f9a7a"][k % 4]}"/>`; }).join("")}
        <path d="M-5 105 C 40 90, 60 120, 95 95 S 140 70, 160 80" stroke="#4f86b8" stroke-width="12" fill="none"/>
        <circle cx="75" cy="60" r="14" fill="#7fa56a"/><circle cx="75" cy="60" r="5" fill="#d8d2c4"/></svg>`;
      const map = `<svg viewBox="0 0 120 150" aria-hidden="true"><rect width="120" height="150" fill="#2a5b8c"/>
        <path d="M10 10 C 40 0, 90 5, 112 25 S 118 90, 100 120 S 40 148, 18 130 S -2 40, 10 10Z" fill="#4c8c5a"/>
        <path d="M30 40 C 50 60, 70 50, 95 70" stroke="#7cc4ff" stroke-width="2" fill="none" opacity=".8"/></svg>`;
      st.innerHTML = `<div class="dm-oq">📡 Wo ist das?</div>
        <div class="dm-sat"><div class="dm-satin">${sat}</div><span class="dm-fac">${vals("×1", "×0,85", "×0,7")}</span></div>
        <div class="dm-omap">${map}</div>
        <svg class="dm-lines" viewBox="0 0 300 240"><line id="lA" x1="226" y1="112" x2="236" y2="96" stroke="${C.anna}" stroke-width="2.5" stroke-linecap="round"/></svg>
        <div class="dm-pin" id="pA" style="left:226px;top:112px;--pc:${C.anna}"></div><div class="dm-goal" style="left:236px;top:96px">⭐</div>
        <div class="dm-km" id="kA" style="left:244px;top:110px">3 km</div>
        <div class="dm-note" style="top:186px;color:#fff" id="on">je näher und je früher, desto mehr Punkte</div>
        <div class="dm-chips" style="top:206px"><div class="dm-chip" id="dmA" style="--pc:${C.anna}"><i></i>Anna ${vals(0, 680)}</div></div>
        <div class="dm-float" id="dmF">+680</div>${UI}`;
      fade(A, st, T);
      const $ = (x) => st.querySelector(x);
      // Satellitenbild zoomt in Stufen heraus, der Faktor sinkt mit
      tl(A, $(".dm-satin"), T, [[0, { transform: "scale(3.2)" }], [1.6, {}], [2.0, { transform: "scale(2.1)" }], [3.0, {}], [3.4, { transform: "scale(1.4)" }], [4.8, {}], [5.2, { transform: "scale(1)" }]]);
      swap(A, [...st.querySelectorAll(".dm-fac .dm-val > span")], T, [1.8, 3.2]);
      finger(A, st, T, [[3.0, 240, 220], [3.9, 226, 112, true]]);
      tl(A, $("#pA"), T, [[0, { opacity: 0, transform: "translateY(-22px)" }], [4.0, {}, "cubic-bezier(.3,1.5,.5,1)"], [4.35, { opacity: 1, transform: "none" }]]);
      tl(A, $(".dm-goal"), T, [[0, { opacity: 0, transform: "scale(.2) rotate(-90deg)" }], [4.8, {}, "cubic-bezier(.3,1.6,.5,1)"], [5.15, { opacity: 1, transform: "none" }]]);
      const L = $("#lA"), len = Math.hypot(10, 16); L.style.strokeDasharray = len; tl(A, L, T, [[0, { strokeDashoffset: len }], [5.2, {}], [5.6, { strokeDashoffset: 0 }]]);
      pop(A, $("#kA"), T, 5.6); show(A, $("#on"), T, 6.0);
      fly(A, $("#dmF"), T, 6.1, [210, 120], [48, 202]);
      swap(A, [...st.querySelectorAll("#dmA .dm-val > span")], T, [6.9]); bump(A, $("#dmA"), T, 6.9);
    } },

    // ---------------- Siebzehn und Vier ----------------
    siebzehn: { T: 9.5, still: 6.6, build(st, A, T) {
      st.classList.add("dm-felt");
      const R = 26, CI = 2 * Math.PI * R;
      const opp = (name, c, x, ids) => `<div class="dm-sseat" style="left:${x}px"><span class="dm-snm" style="--pc:${c}"><i></i>${name}</span><span class="dm-sfan">${ids.map((id) => flipCard(id)).join("")}</span></div>`;
      st.innerHTML = opp("Berta", C.berta, 34, ["eichel-10", "schelle-8"]) + opp("Chris", C.chris, 176, ["herz-A", "laub-K", "eichel-8"])
        + `<div class="dm-sres" id="rB" style="left:34px">18</div><div class="dm-sres bad" id="rC" style="left:176px">23 – raus</div>
        <div class="dm-shand"><span class="c1">${card("laub-9")}</span><span class="c2">${card("herz-O")}</span><span class="c3">${card("schelle-8")}</span></div>
        <div class="dm-sring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${R}" class="r0"/><circle cx="32" cy="32" r="${R}" class="r1" id="ring"/></svg><b>${vals(12, 20)}</b><small>von 21</small></div>
        <div class="dm-sacts"><span class="hit">🂠 Karte!</span><span class="stand">✋ Genug</span></div>
        <div class="dm-smsg" id="m1">Du bleibst bei 20</div>
        <div class="dm-smsg win" id="m2">Am nächsten an 21 – Runde gewonnen! +3</div>${UI}`;
      fade(A, st, T);
      const $ = (x) => st.querySelector(x);
      finger(A, st, T, [[.6, 230, 225], [1.3, 104, 196, true], [3.2, 194, 196, true]]);
      tl(A, $(".dm-shand .c3"), T, [[0, { opacity: 0, transform: px(60, -70, .7) }], [1.5, {}, "cubic-bezier(.2,.8,.25,1)"], [1.95, { opacity: 1, transform: "rotate(7deg)" }]]);
      tl(A, $("#ring"), T, [[0, { strokeDasharray: `${CI * 12 / 21} 200`, stroke: "#e8e4f4" }], [2.0, {}], [2.4, { strokeDasharray: `${CI * 20 / 21} 200`, stroke: "#7ee2b1" }]]);
      swap(A, [...st.querySelectorAll(".dm-sring b .dm-val > span")], T, [2.1]); bump(A, $(".dm-sring"), T, 2.1);
      tl(A, $(".dm-sacts .hit"), T, [[0, { transform: "none" }], [1.35, {}], [1.45, { transform: "translateY(2px)" }], [1.6, { transform: "none" }]]);
      tl(A, $(".dm-sacts"), T, [[0, { opacity: 1 }], [3.4, {}], [3.6, { opacity: 0 }]]);
      show(A, $("#m1"), T, 3.6, 5.6);
      // Auflösung: die anderen decken auf
      st.querySelectorAll(".dm-sseat").forEach((seat, k) => seat.querySelectorAll(".dm-card.flip").forEach((c, i) => {
        const f = 4.3 + k * .5 + i * .12;
        tl(A, c.querySelector(".dm-back"), T, [[0, { transform: "none" }], [f, {}], [f + .4, { transform: "rotateY(180deg)" }]]);
        tl(A, c.querySelector(".dm-front"), T, [[0, { transform: "rotateY(-180deg)" }], [f, {}], [f + .4, { transform: "none" }]]);
      }));
      pop(A, $("#rB"), T, 4.9); pop(A, $("#rC"), T, 5.4);
      show(A, $("#m2"), T, 5.9);
    } },

    // ---------------- Almsommer ----------------
    alm: { T: 10, still: 5.4, build(st, A, T) {
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
    jagd: { T: 10, still: 6.4, build(st, A, T) {
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
  // box: Element mit .dm-stage; t0: Startzeit (ms) – läuft an derselben Stelle weiter
  function mount(box, key, t0) {
    const sc = SCENES[key], st = box && box.querySelector(".dm-stage");
    if (!sc || !st || !st.animate) return;
    const A = [];
    try { sc.build(st, A, sc.T); } catch (e) { console.warn("Vorführung " + key + ": " + (e && e.message)); st.innerHTML = ""; return; }
    const still = reduce();
    const at = still ? sc.still * 1000 : Math.max(0, Date.now() - t0);
    A.forEach((a) => { if (still) a.pause(); a.currentTime = at; });
  }
  window.S10Demo = { has, html, mount };
})();
