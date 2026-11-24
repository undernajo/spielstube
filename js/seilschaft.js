// Seilschaft – Koop-Jump'n'Run: der Kraxler (schwer, stark) und die Gams (leicht, Doppelsprung) bringen sich gegenseitig
// vom Tal bis zum Gipfelkreuz. Allein steuert man beide Figuren (Q wechselt).
// Der Gastgeber führt den Spielstand (Rollen, Level, Fortschritt, Sammelsachen, Neustart, Sieg); die Figuren selbst laufen
// auf den Geräten der Spieler und schicken ihre Positionen über den Live-Kanal der Stube (siehe js/ansicht/seilschaft.js).
(function (root) {
  const DIE_MS = 1600; // so lange steht die Meldung „… ist ins Wasser gefallen“, dann beginnt das Level von vorn

  // ---------- Level ----------
  // Zeichen: # Fels · r Dach · A/B/C/E/F Gatter (über Platten) · D Hüttentür (Schlüssel) · i dünnes Eis (Brücke über Platte) · w Wasser
  const base = (f, W) => { f(0, W - 1, 13, 14, "#"); f(0, 0, 0, 12, "#"); f(W - 1, W - 1, 0, 12, "#"); };
  const LEVELS = [
    { n: 1, name: "Auf die Alm", sub: "Spalte, Doppelsprung, Huckepack, Bockspringen", W: 76, par: 60,
      build(f, grid, W) { base(f, W);
        f(12, 12, 0, 8, "#"); f(12, 12, 9, 11, "A");      // Wand mit Gatter, unten eine Spalte nur für die Gams
        f(24, 30, 10, 10, "#"); f(24, 24, 11, 12, "B");  // Felsdach: oben die Platte, darunter der Durchgang mit Gatter
        f(46, 49, 8, 8, "#");                            // Felsband (5 hoch) mit der Platte für Gatter C – nur huckepack
        f(52, 52, 0, 8, "#"); f(52, 52, 9, 11, "C");      // zweite Wand: Gams oben auf der Platte, Kraxler durchs Gatter, dann die Gams durch die Spalte
        f(61, 61, 0, 8, "#"); f(61, 61, 9, 12, "E");      // Bockspringen: zwei Gatter, die Platte dazwischen öffnet beide
        f(67, 67, 0, 8, "#"); f(67, 67, 9, 12, "F");
      },
      plates: [{ x: 14, y: 13, opens: ["A"] }, { x: 27, y: 10, opens: ["B"] }, { x: 48, y: 8, opens: ["C"] },
        { x: 58, y: 13, opens: ["E"] }, { x: 64, y: 13, opens: ["E", "F"] }, { x: 70, y: 13, opens: ["F"] }],
      items: [{ id: "e1", x: 6, y: 10 }, { id: "e2", x: 18, y: 10 }, { id: "e3", x: 35, y: 6 }, { id: "e4", x: 47, y: 6 }, { id: "e5", x: 55, y: 10 }, { id: "e6", x: 64, y: 8 }],
      signs: [{ x: 9.6, y: 13, t: "Nur die Gams passt durch" }, { x: 21.5, y: 13, t: "Gams: 2× springen" }, { x: 33.4, y: 13, t: "Huckepack!" }, { x: 43.4, y: 13, t: "Gams aufs Band!" }, { x: 56, y: 13, t: "Bockspringen" }],
      boulders: [], start: { kraxler: 2, gams: 3.6 }, goalX: 72.2, goal: { x: 73.6, y: 13, t: "Zur Alm ➜" } },
    { n: 2, name: "Steinschlag", sub: "Zwei-Platten-Gatter, Huckepack, Tunnel mit Gegen-Gatter", W: 76, par: 60,
      build(f, grid, W) { base(f, W);
        f(10, 10, 0, 8, "#"); f(10, 10, 9, 12, "A");      // Gatter A: braucht BEIDE gelben Platten (oder die hinter dem Gatter)
        f(18, 26, 8, 10, "#");                            // Felswand, 5 hoch – nur huckepack zu erklimmen
        f(18, 18, 11, 12, "B"); f(26, 26, 11, 12, "C");   // Tunnel darunter: B öffnet mit der blauen Platte, C schließt mit ihr
        f(38, 50, 10, 12, "#");                           // Hochfläche, 3 hoch
        f(45, 45, 0, 4, "#"); f(45, 45, 5, 9, "E");       // Gatter E oben
        f(57, 57, 0, 8, "#"); f(57, 57, 9, 12, "F");      // Gatter F: der Fels muss hindurch (Platte davor UND dahinter)
        f(61, 74, 10, 12, "#");                           // zweite Hochfläche, 3 hoch – nur mit dem Fels als Stufe
      },
      plates: [{ x: 6, y: 13, opens: ["A"], grp: 1 }, { x: 8, y: 13, opens: ["A"], grp: 1 }, { x: 12, y: 13, opens: ["A"], grp: 2 },
        { x: 22, y: 8, opens: ["B", "C"] }, { x: 41, y: 10, heavy: true, opens: ["E"] }, { x: 48, y: 10, opens: ["E"] },
        { x: 52, y: 13, opens: ["F"] }, { x: 59, y: 13, opens: ["F"] }],
      inv: ["C"],
      items: [{ id: "e1", x: 5, y: 6 }, { id: "e2", x: 25, y: 6 }, { id: "e3", x: 42, y: 4 }, { id: "e4", x: 55, y: 9 }, { id: "e5", x: 67, y: 6 }],
      signs: [{ x: 9.2, y: 13, t: "Zwei Platten!" }, { x: 16.4, y: 13, t: "Zu hoch?" }, { x: 20, y: 8, t: "Rein – dann loslassen" }, { x: 34.5, y: 13, t: "Fels als Stufe" }, { x: 53.8, y: 13, t: "Fels durchs Gatter" }],
      boulders: [{ x: 3.6, y: 12 }, { x: 31, y: 12 }, { x: 55, y: 12 }], start: { kraxler: 1.3, gams: 2.4 }, goalX: 70.2, goal: { x: 73.4, y: 10, t: "Zur Hütte ➜" } },
    { n: 3, name: "Zur Almhütte", sub: "Brücke übers Eis, Schlüssel huckepack, Hüttentür", W: 84, par: 60,
      build(f, grid, W) { base(f, W);
        f(6, 8, 10, 10, "#");
        f(12, 12, 0, 8, "#"); f(12, 12, 9, 11, "A");
        f(21, 23, 10, 10, "#");
        grid[13][25] = ".";                              // Mulde für die schwere Platte
        f(28, 28, 0, 8, "#"); f(28, 28, 9, 12, "B");
        f(31, 42, 13, 13, "i"); f(31, 42, 14, 14, "w"); // dünnes Eis über dem Almsee
        grid[13][52] = ".";                              // zweite Mulde – der Fels muss hinein, sonst bleibt Gatter C zu
        f(56, 56, 0, 8, "#"); f(56, 56, 9, 12, "C");
        f(60, 67, 13, 13, "i"); f(60, 67, 14, 14, "w"); // zweiter See: die Brücken-Platte liegt hinter Gatter E …
        f(69, 69, 0, 8, "#"); f(69, 69, 9, 12, "E");      // … und öffnet E gleich mit; die Platte davor öffnet nur E
        f(74, 76, 8, 8, "#");                            // Felsband mit Schlüssel – 5 hoch, nur huckepack
        f(76, 82, 7, 7, "r"); f(78, 78, 8, 12, "D");    // Almhütte: Dach und Tür
      },
      plates: [{ x: 14, y: 13, opens: ["A"] }, { x: 25, y: 14, heavy: true, opens: ["B"] }, { x: 44, y: 13, opens: ["bridge"] }, { x: 52, y: 14, heavy: true, opens: ["C"] },
        { x: 58, y: 13, opens: ["E"] }, { x: 71, y: 13, opens: ["bridge", "E"] }],
      items: [{ id: "e1", x: 7, y: 9 }, { id: "e2", x: 22, y: 9 }, { id: "e3", x: 36, y: 9 }, { id: "e4", x: 53, y: 9 }, { id: "e5", x: 64, y: 9 }, { id: "key", x: 75, y: 7, key: true }],
      signs: [{ x: 9.6, y: 13, t: "Nur die Gams passt durch" }, { x: 23.6, y: 13, t: "Schwer!" }, { x: 29.6, y: 13, t: "Dünnes Eis" }, { x: 45, y: 13, t: "Brücke" }, { x: 49.2, y: 13, t: "Fels in die Mulde" }, { x: 57, y: 13, t: "Wer zuerst?" }],
      boulders: [{ x: 19, y: 12 }, { x: 48.5, y: 12 }], start: { kraxler: 2, gams: 3.6 }, goalX: 79.2, hut: { x0: 76.6, x1: 82.4, name: "Almhütte" } },
    // ---------- Welt 2: Bergwald & Bach ----------
    // Neu: Fichten (der Kraxler drückt sie um – sie fallen in Schieberichtung und werden zur Brücke), Bach mit Strömung
    // (reißt die Gams mit; huckepack trägt der Kraxler sie hinüber), Steg (k), Seilwinde (Plattform fährt, solange eine Kurbel-Platte gedrückt ist), Zeit-Gatter
    { n: 4, name: "Im Fichtenwald", sub: "Fichten umdrücken – Stämme als Brücken über die Schluchten", W: 80, par: 60,
      build(f, grid, W) { base(f, W);
        f(12, 16, 13, 13, "."); f(12, 16, 14, 14, "w");   // Schlucht 1 mit Wildwasser
        f(22, 22, 0, 8, "#"); f(22, 22, 9, 11, "A");      // Wand mit Gatter, unten Spalte (nur Gams)
        f(28, 33, 13, 13, "."); f(28, 33, 14, 14, "w");   // Schlucht 2
        grid[13][41] = ".";                               // Mulde für den Fels
        f(45, 45, 0, 8, "#"); f(45, 45, 9, 12, "B");
        f(49, 49, 0, 8, "#"); f(49, 49, 9, 11, "C");      // Wand vor der dritten Fichte: erst muss die Gams durch die Spalte auf die Platte
        f(52, 56, 13, 13, "."); f(52, 56, 14, 14, "w");   // Schlucht 3
        f(62, 67, 13, 13, "."); f(62, 67, 14, 14, "w");   // Schlucht 4: erst die Fichte umdrücken, dann den Fels über den Stamm schieben …
        grid[13][70] = ".";                               // … bis in die Mulde – die schwere Platte öffnet Gatter E
        f(73, 73, 0, 8, "#"); f(73, 73, 9, 12, "E");
      },
      trees: [{ x: 11, h: 6 }, { x: 27, h: 7 }, { x: 51, h: 6 }, { x: 61, h: 7 }],
      plates: [{ x: 24, y: 13, opens: ["A"] }, { x: 41, y: 14, heavy: true, opens: ["B"] }, { x: 50, y: 13, opens: ["C"] }, { x: 70, y: 14, heavy: true, opens: ["E"] }],
      items: [{ id: "e1", x: 14, y: 9 }, { id: "e2", x: 30, y: 8 }, { id: "e3", x: 5, y: 7 }, { id: "e4", x: 54, y: 9 }, { id: "e5", x: 65, y: 8 }],
      signs: [{ x: 8.6, y: 13, t: "Kraxler: Baum umdrücken!" }, { x: 19.6, y: 13, t: "Nur die Gams passt durch" }, { x: 38, y: 13, t: "Fels in die Mulde" }, { x: 47.2, y: 13, t: "Erst die Gams" }, { x: 57.6, y: 13, t: "Baum oder Fels zuerst?" }],
      boulders: [{ x: 36.5, y: 12 }, { x: 58.5, y: 12 }], start: { kraxler: 2, gams: 3.6 }, goalX: 75.2, goal: { x: 77, y: 13, t: "Zum Bach ➜" } },
    { n: 5, name: "Wilder Bach", sub: "Strömung, huckepack durchs Wasser, Trittsteine und Steg", W: 90, par: 60,
      build(f, grid, W) { base(f, W);
        f(10, 26, 12, 12, "s");                           // Bach: Strömung nach links (spült die Gams ans Ufer zurück)
        f(33, 49, 13, 13, "."); f(33, 49, 14, 14, "w");   // tiefer Fluss …
        f(38, 38, 13, 14, "#"); f(44, 44, 13, 14, "#");   // … mit zwei Trittsteinen
        f(33, 37, 13, 13, "k"); f(39, 43, 13, 13, "k"); f(45, 49, 13, 13, "k"); // Steg, wenn die Platte gedrückt ist
        f(54, 61, 12, 12, "s");                           // zweiter Bacharm – huckepack hinüber …
        f(63, 66, 10, 10, "#"); f(63, 63, 11, 12, "C");   // … zum Felsdach: Gams springt vom Kopf hinauf auf die Platte, der Kraxler geht unten durchs Gatter
        f(70, 74, 13, 13, "k"); f(70, 74, 14, 14, "w");   // Fluss ohne Trittstein: die Gams springt hinüber und holt den Steg …
        f(78, 84, 12, 12, "s");                           // … dann trägt der Kraxler sie durch den letzten Bacharm
      },
      plates: [{ x: 51, y: 13, opens: ["bridge"] }, { x: 65, y: 10, opens: ["C"] }, { x: 76, y: 13, opens: ["bridge"] }],
      items: [{ id: "e1", x: 18, y: 8 }, { id: "e2", x: 38, y: 10 }, { id: "e3", x: 44, y: 8 }, { id: "e4", x: 58, y: 8 }, { id: "e5", x: 72, y: 9 }],
      signs: [{ x: 5.4, y: 13, t: "Gams: huckepack rüber!" }, { x: 30, y: 13, t: "Trittsteine" }, { x: 52.6, y: 13, t: "Huckepack aufs Dach" }, { x: 68.4, y: 13, t: "Gams: weit springen!" }],
      boulders: [], start: { kraxler: 2, gams: 3.6 }, goalX: 86.2, goal: { x: 88, y: 13, t: "Zur Seilwinde ➜" } },
    { n: 6, name: "Die Seilwinde", sub: "Kurbeln und hochfahren, Zeit-Gatter, Schlüssel huckepack", W: 70, par: 60,
      build(f, grid, W) { base(f, W);
        f(18, 68, 8, 12, "#");                            // Hochfläche (5 hoch) – hinauf nur mit der Seilwinde
        f(36, 36, 0, 3, "#"); f(36, 36, 4, 7, "C");       // Zeit-Gatter oben
        f(49, 49, 0, 3, "#"); f(49, 49, 4, 7, "E");       // zweites Zeit-Gatter: schwere Platte – die Gams geht vor, der Kraxler muss rennen
        f(58, 60, 3, 3, "#");                             // Felsband mit Schlüssel – 5 hoch, nur huckepack
        f(61, 67, 2, 2, "r"); f(63, 63, 3, 7, "D");       // Holzerhütte: Dach und Tür
      },
      lifts: [{ x: 15, w: 3, bottom: 12.65, top: 8 }],
      plates: [{ x: 11, y: 13, opens: ["lift"] }, { x: 22, y: 8, opens: ["lift"] }, { x: 27, y: 8, opens: ["C"] }, { x: 42, y: 8, heavy: true, opens: ["E"] }],
      hold: { C: 1.1, E: 1.1 },
      items: [{ id: "e1", x: 16, y: 4 }, { id: "e2", x: 31, y: 5 }, { id: "e3", x: 5, y: 7 }, { id: "e4", x: 44, y: 4 }, { id: "key", x: 59, y: 2, key: true }],
      signs: [{ x: 9.4, y: 13, t: "Kurbel" }, { x: 24.4, y: 8, t: "Kurbel" }, { x: 30.6, y: 8, t: "Schnell durch!" }, { x: 45.6, y: 8, t: "Kraxler: renn!" }],
      boulders: [], start: { kraxler: 2, gams: 3.6 }, goalX: 64.2, hut: { x0: 61.6, x1: 67.4, name: "Holzerhütte", y0: 3, logs: true } },
  ];
  // Baut das Gelände eines Levels als Raster (Zeilen × Spalten)
  function grid(L) {
    const H = 15, g = [...Array(H)].map(() => Array(L.W).fill("."));
    const f = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
    L.build(f, g, L.W);
    return g;
  }

  // ---------- die ganze Tour (spielbar sind die Level mit Bauplan in LEVELS, der Rest ist geplant) ----------
  const WORLDS = [
    { n: 1, name: "Almwiese", hut: "Almhütte" },
    { n: 2, name: "Bergwald & Bach", hut: "Holzerhütte" },
    { n: 3, name: "Klettersteig", hut: "Biwak" },
    { n: 4, name: "Gletscher", hut: "Schutzhütte" },
    { n: 5, name: "Gipfelgrat", hut: "Gipfelkreuz" },
  ];
  const PLAN = [
    { n: 1, w: 1, name: "Auf die Alm", idea: "Spalte, Doppelsprung, Huckepack – der Einstieg." },
    { n: 2, w: 1, name: "Steinschlag", idea: "Zwei-Platten-Gatter, Pflicht-Huckepack und ein Tunnel mit Gegen-Gatter." },
    { n: 3, w: 1, name: "Zur Almhütte", idea: "Brücke übers Eis, Schlüssel huckepack, Hüttentür." },
    { n: 4, w: 2, name: "Im Fichtenwald", idea: "Der Kraxler drückt Fichten um – sie fallen in Schieberichtung und werden zu Brücken über die Schluchten." },
    { n: 5, w: 2, name: "Wilder Bach", idea: "Die Strömung reißt die leichte Gams mit – der Kraxler trägt sie huckepack hinüber. Danach hüpft die Gams über Trittsteine voraus und holt den Steg." },
    { n: 6, w: 2, name: "Die Seilwinde", idea: "Einer kurbelt, der andere fährt mit der Plattform hinauf – oben wartet ein Zeit-Gatter, das nur kurz offen bleibt." },
    { n: 7, w: 3, name: "Erste Sicherung", idea: "Das Seil kommt dazu: wer fällt, wird vom anderen gehalten." },
    { n: 8, w: 3, name: "Die Leiterwand", idea: "Leitern, Eisenstifte und Überhänge – einer sichert, einer klettert." },
    { n: 9, w: 3, name: "Hängebrücke", idea: "Die Brücke trägt nur einen – und schwankt, wenn der Kraxler drauf ist." },
    { n: 10, w: 4, name: "Auf dem Ferner", idea: "Spiegelglattes Eis: die Gams hat Halt, der Kraxler rutscht." },
    { n: 11, w: 4, name: "Gletscherspalten", idea: "Über Spalten nur am Seil – Schwung holen und hinüberpendeln." },
    { n: 12, w: 4, name: "Lawinenhang", idea: "Rollende Steine im Takt: warten, laufen, Deckung suchen." },
    { n: 13, w: 5, name: "Im Nebel", idea: "Man sieht nur ein Stück weit – der Partner muss ansagen, wo es langgeht." },
    { n: 14, w: 5, name: "Sturm am Grat", idea: "Böen schieben die Gams zurück; der Kraxler gibt Windschatten." },
    { n: 15, w: 5, name: "Das Gipfelkreuz", idea: "Alles zusammen – das große Schlusslevel bis zum Kreuz." },
  ];
  const playable = (n) => !!LEVELS[n - 1];
  const edelMax = (L) => L.items.filter((i) => !i.key).length;

  // Fortschritt säubern (kommt aus dem Speicher des Gastgebers): { [level]: { stars, edel, best } }
  function cleanProg(p) {
    const out = {};
    for (const [k, v] of Object.entries(p && typeof p === "object" ? p : {})) {
      const n = Number(k);
      if (!playable(n) || !v || typeof v !== "object") continue;
      out[n] = { stars: Math.max(0, Math.min(3, Number(v.stars) || 0)), edel: Math.max(0, Math.min(9, Number(v.edel) || 0)), best: Number.isFinite(+v.best) ? +v.best : null };
    }
    return out;
  }

  // ---------- Spiel ----------
  function start(s, opts) {
    opts = opts || {};
    const ids = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (!ids.length) return false;
    const duo = ids.length >= 2;
    let k = ids[0], g = duo ? ids[1] : ids[0];
    if (duo && opts.swap) [k, g] = [g, k];
    s.game = "seil"; s.phase = "seil";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.seil = { gid: Math.random().toString(36).slice(2, 9), mode: duo ? "duo" : "solo", roles: { kraxler: k, gams: g },
      prog: cleanProg(opts.prog), step: "map", lv: null, seq: 0, got: {}, dead: null, won: null, t0: 0 };
    s.players.forEach((p) => { p.waiting = p.id !== k && p.id !== g; p.status = "active"; });
    return true;
  }
  const seated = (st, pid) => pid === st.roles.kraxler || pid === st.roles.gams;
  const unlocked = (st, n) => n === 1 || !!st.prog[n - 1];
  function begin(st, n, now) { st.lv = n; st.step = "play"; st.seq++; st.got = {}; st.dead = null; st.won = null; st.t0 = now; }

  function apply(s, pid, a, isHost, now) {
    const st = s.seil;
    if (!st || !a || typeof a !== "object") return false;
    now = now || Date.now();
    const may = isHost || seated(st, pid);
    switch (a.type) {
      case "sgLevel": { // Level wählen (Tourenkarte, „Nochmal“, „Weiter“)
        const n = Number(a.lv);
        if (!may || !playable(n) || !unlocked(st, n)) return false;
        begin(st, n, now); return true;
      }
      case "sgMap": // zur Tourenkarte: mitten im Level nur der Gastgeber, nach dem Sieg auch die Seilschaft
        if (st.step === "map" || !(isHost || (st.step === "won" && seated(st, pid)))) return false;
        st.step = "map"; st.dead = null; return true;
      case "sgSwap": // Rollen tauschen (nur zu zweit, auf der Tourenkarte)
        if (!isHost || st.mode !== "duo" || st.step === "play") return false;
        st.roles = { kraxler: st.roles.gams, gams: st.roles.kraxler }; return true;
      case "sgGet": {
        if (st.step !== "play" || a.seq !== st.seq || !seated(st, pid) || st.dead) return false;
        const L = LEVELS[st.lv - 1], it = L.items.find((i) => i.id === a.id);
        if (!it || st.got[it.id]) return false;
        st.got[it.id] = true; return true;
      }
      case "sgDie": // ins Wasser gefallen, abgestürzt oder „R“ – das ganze Level beginnt für beide von vorn
        if (st.step !== "play" || a.seq !== st.seq || !seated(st, pid) || st.dead) return false;
        st.dead = { who: a.who === "gams" ? "gams" : a.who === "kraxler" ? "kraxler" : null, why: ["wasser", "sturz"].includes(a.why) ? a.why : "neu", at: now };
        return true;
      case "sgWin": {
        if (st.step !== "play" || a.seq !== st.seq || !seated(st, pid) || st.dead) return false;
        const L = LEVELS[st.lv - 1];
        const secs = Math.max(1, Math.round((now - st.t0) / 1000)), edel = L.items.filter((i) => !i.key && st.got[i.id]).length;
        const stars = 1 + (edel === edelMax(L) ? 1 : 0) + (secs <= L.par ? 1 : 0);
        const old = st.prog[L.n] || { stars: 0, edel: 0, best: null };
        st.prog[L.n] = { stars: Math.max(old.stars, stars), edel: Math.max(old.edel, edel), best: old.best == null ? secs : Math.min(old.best, secs) };
        st.won = { stars, edel, secs, best: st.prog[L.n].best };
        st.step = "won"; return true;
      }
      default: return false;
    }
  }
  function tick(s, now) {
    const st = s.seil;
    if (!st || !st.dead || st.step !== "play") return false;
    if (now - st.dead.at < DIE_MS) return false;
    begin(st, st.lv, now); return true;
  }
  function publicState(s) {
    const st = s.seil;
    if (!st) return null;
    return { gid: st.gid, mode: st.mode, roles: { ...st.roles }, prog: st.prog, step: st.step, lv: st.lv, seq: st.seq, got: { ...st.got },
      dead: st.dead ? { who: st.dead.who, why: st.dead.why } : null, won: st.won };
  }

  root.S10Seil = { LEVELS, PLAN, WORLDS, DIE_MS, grid, playable, edelMax, cleanProg, start, apply, tick, publicState };
})(typeof window !== "undefined" ? window : globalThis);
