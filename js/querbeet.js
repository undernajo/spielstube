// „Querbeet“ – quer durch die Spiele (Ablauf beim Gastgeber, testbar in Node). Zustand in s.qb.
// Jede Etappe ist eine Kurzfassung eines Spiels. Gezählt wird nur die Platzierung pro Etappe (Partypunkte),
// damit Spiele mit 1000 Punkten und Spiele mit 1 Punkt gleich viel zählen. Die letzte Etappe zählt doppelt.
(function (root) {
  const LENGTHS = { 5: { name: "Kurz – 5 Etappen (ca. 20 Min.)" }, 8: { name: "Mittel – 8 Etappen (ca. 35 Min.)" }, 12: { name: "Lang – 12 Etappen (ca. 50 Min.)" } };
  const POINTS = [5, 3, 2]; // Platz 1, 2, 3 – alle weiteren bekommen 1 Partypunkt
  // Spiele mit Kurzfassung; kind sorgt für Abwechslung (nicht zweimal dieselbe Art hintereinander)
  const STAGES = {
    zehn: { kind: "wissen", name: "Zehnkampf", short: "1 Karte", rule: "Eine Karte mit 10 Antworten – reihum aufdecken oder passen. Wer danebenliegt, verliert die Punkte dieser Runde." },
    hl: { kind: "wissen", name: "Höher oder tiefer", short: "1 Kategorie, 6 Vergleiche", rule: "Ist der Wert des nächsten Begriffs höher oder tiefer? Alle tippen gleichzeitig." },
    geo: { kind: "karte", name: "Wo liegt das?", short: "3 Orte", rule: "Tippt auf der Karte, wo der Ort liegt – je näher, desto mehr Punkte." },
    land: { kind: "karte", name: "Länder finden", short: "5 Gebiete", rule: "Tippt das genannte Land (oder Bundesland, Region, Kanton) auf der Karte an." },
    oben: { kind: "karte", name: "Von oben", short: "2 Satellitenbilder", rule: "Erkennt den Ort von oben und tippt ihn auf der Karte an – wer früh tippt, bekommt mehr." },
    slf: { kind: "wort", name: "Stadt, Land, Fluss", short: "1 Buchstabe", rule: "Ein Buchstabe, sechs Kategorien. Wer fertig ist, ruft Stopp – dann bleiben noch 10 Sekunden." },
    duell: { kind: "wort", two: true, name: "Listen-Duell", short: "bis 2 Punkte", rule: "Abwechselnd Antworten aus der Liste nennen – wer patzt, verliert die Runde." },
    frage: { kind: "wort", two: true, name: "Antwort sucht Frage", short: "bis 2 Punkte", rule: "Zur vorgegebenen Antwort eine Frage erfinden – der andere muss sie beantworten." },
    schaetzen: { kind: "wissen", name: "Schätzen", short: "3 Schätzfragen", rule: "Eine Zahl schätzen – wer am nächsten dran ist, gewinnt die Runde." },
    hinweis: { kind: "wissen", name: "Hinweis für Hinweis", short: "2 Begriffe", rule: "Alle 8 Sekunden kommt ein leichterer Hinweis. Wer früh richtig rät, bekommt mehr – aber nur ein Versuch!" },
    siebzehn: { kind: "karten", name: "Siebzehn und Vier", short: "3 Runden", rule: "Weitere Karte ziehen oder aufhören – wer am nächsten an 21 liegt, gewinnt. Über 21 ist man raus." },
    bus: { kind: "karten", name: "Busfahrt", short: "1 Runde, 5 Stationen", rule: "Station für Station tippen (Figur/Zahl, höher/tiefer, zwischen/außerhalb, Farbe genau, Wert genau) – nach jeder richtigen Station weiterfahren oder aussteigen. Falsch = Topf weg." },
    stich: { kind: "karten", name: "Stichhaltig", short: "3 Runden (1, 2, 3 Karten)", rule: "Stiche ansagen und genau so viele holen – Farbe bedienen, Trumpf sticht." },
    umriss: { kind: "karte", name: "Umriss-Rätsel", short: "4 Umrisse", rule: "Nur der Umriss ist zu sehen – welches Land (oder Bundesland, Region, Kanton) ist das?" },
  };
  const ORDER = ["zehn", "hl", "schaetzen", "hinweis", "geo", "land", "umriss", "oben", "siebzehn", "stich", "bus", "slf", "duell", "frage"];
  // Fertige Mischungen je nach Stimmung (null = alle Spiele); setzen nur die Haken bei „Mit dabei“
  const MIXES = {
    alle: { icon: "🎲", name: "Bunt gemischt", games: null },
    wissen: { icon: "🧠", name: "Wissensabend", games: ["zehn", "hl", "schaetzen", "hinweis", "duell"] },
    welt: { icon: "🗺️", name: "Rund um die Welt", games: ["geo", "land", "umriss", "oben"] },
    gaudi: { icon: "🎉", name: "Gaudi", games: ["bus", "siebzehn", "stich", "slf", "frage"] },
    karten: { icon: "🃏", name: "Kartenabend", games: ["siebzehn", "stich", "bus"] },
    kurz: { icon: "⚡", name: "Kurz & schnell", games: ["hl", "schaetzen", "bus", "siebzehn", "oben", "geo"] },
  };
  const mixOff = (key) => { const m = MIXES[key]; return m && m.games ? ORDER.filter((k) => !m.games.includes(k)) : []; };
  const mixOf = (off) => Object.keys(MIXES).find((k) => { const o = mixOff(k); return o.length === off.length && o.every((x) => off.includes(x)); }) || null;
  // Themenabende: alle Etappen mit passenden Inhalten
  const THEMES = { mix: { name: "Gemischt" }, suedtirol: { name: "Südtirol" }, welt: { name: "Welt" } };
  // Auszeichnungen bei der Siegerehrung (je Art von Spiel)
  const KIND_TITLES = { karte: "🧭 Kartenleser", wissen: "📚 Wandelndes Lexikon", wort: "✍️ Wortakrobat", karten: "🎴 Kartenhai" };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // Welche Spiele kommen in Frage? Zweier-Spiele nur bei genau zwei Spielern.
  function eligible(off, players) {
    return ORDER.filter((k) => !(off || []).includes(k) && (!STAGES[k].two || players === 2));
  }

  // Reihenfolge: jedes Spiel etwa gleich oft (aus einem „Beutel“ ziehen), nie dasselbe Spiel und möglichst
  // nicht dieselbe Art zweimal hintereinander
  function buildPlan(games, n, theme) {
    const out = [];
    let bag = [];
    for (let i = 0; i < n; i++) {
      if (!bag.length) bag = shuffle(games.slice());
      const prev = out[out.length - 1];
      let k = bag.findIndex((g) => !prev || (g !== prev && STAGES[g].kind !== STAGES[prev].kind));
      if (k < 0) k = bag.findIndex((g) => g !== prev);
      if (k < 0) { // nur noch das gleiche Spiel im Beutel: neu mischen
        const alt = games.filter((g) => g !== prev);
        out.push(alt.length ? pick(alt) : games[0]);
        continue;
      }
      out.push(bag.splice(k, 1)[0]);
    }
    return out.map((game) => ({ game, opts: stageOpts(game, theme) }));
  }

  // Kurzfassung je Spiel – großzügige Zeiten, damit es nicht hektisch wird; theme: mix | suedtirol | welt
  const HL_ST = ["suedtirolBerge", "gemeinden"];
  function stageOpts(game, theme) {
    const st = theme === "suedtirol", w = theme === "welt";
    switch (game) {
      case "zehn": return st ? { sets: ["suedtirol"] } : {};
      case "hl": return st ? { cats: 1, only: HL_ST } : w ? { cats: 1, not: HL_ST } : { cats: 1 };
      case "geo": return { mode: "karte", region: pick(st ? ["suedtirol"] : w ? ["europa", "welt"] : ["suedtirol", "italien", "dach", "europa", "welt"]), level: "gemischt", rounds: 3, timer: "t60" };
      case "oben": return { mode: "oben", rounds: 2 };
      case "land": { const region = pick(st ? ["it", "at", "it", "europa"] : w ? ["welt", "afrika", "asien", "amerika", "europa"] : ["europa", "europa", "welt", "afrika", "asien", "amerika", "de", "at", "it"]);
        return { region, level: region === "welt" ? "leicht" : "gemischt", rounds: 5, timer: "t30" }; }
      case "umriss": { const region = pick(st ? ["it", "at"] : w ? ["welt", "europa"] : ["europa", "welt", "de", "at", "it"]);
        return { mode: "umriss", region, level: region === "welt" ? "leicht" : "gemischt", rounds: 4 }; }
      case "schaetzen": return { mode: "schaetzen", rounds: 3, theme: st ? "suedtirol" : w ? "allgemein" : "mix" };
      case "hinweis": return { mode: "hinweis", rounds: 2, theme: st ? "suedtirol" : w ? "allgemein" : "mix" };
      case "siebzehn": return { mode: "siebzehn", rounds: 3 };
      case "stich": return { mode: "stich", rounds: 3 };
      case "bus": return { mode: "bus", rounds: 1 };
      // Südtirol-Paket nur beim Thema Südtirol, sonst jedes Mal neu: 2 Klassiker + 4 zufällige Kategorien
      case "slf": return st ? { preset: "suedtirol", rounds: 1, timer: "stopp" } : { preset: "zufall", classics: 2, rounds: 1, timer: "stopp" };
      case "duell": return { target: 2, timer: "45" };
      case "frage": return { target: 2, write: "0", answer: "0" };
    }
    return {};
  }

  function create(opts, players) {
    const length = LENGTHS[opts && opts.length] ? Number(opts.length) : 8;
    const theme = THEMES[opts && opts.theme] ? opts.theme : "mix";
    const games = eligible(opts && opts.off, players);
    if (!games.length) return null;
    const joker = !(opts && opts.joker === false);
    return { opts: { length, off: (opts && opts.off) || [], theme, joker }, plan: buildPlan(games, length, theme), idx: -1, pts: {}, stages: [], step: "intro", ready: {}, done: false,
      joker: {} }; // joker: Spieler-ID -> Etappe, in der sein Joker zählt (einmal pro Partie, nicht im Finale)
  }

  // Platzierungen einer Etappe in Partypunkte umrechnen (Gleichstand = gleiche, höhere Punkte)
  function placePoints(scores, ids, double, jokers) {
    const sorted = ids.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const out = {};
    sorted.forEach((id, i) => {
      const place = sorted.findIndex((x) => (scores[x] || 0) === (scores[id] || 0)); // erster mit gleicher Punktzahl
      const p = place < POINTS.length ? POINTS[place] : 1, joker = !!(jokers && jokers.includes(id));
      out[id] = { place: place + 1, base: p, pts: p * (double ? 2 : 1) * (joker ? 2 : 1), score: scores[id] || 0, joker };
    });
    return out;
  }

  // Etappe abschließen: Partypunkte gutschreiben, Ergebnis merken
  function finishStage(q, scores, ids) {
    const last = q.idx === q.plan.length - 1;
    const jokers = Object.keys(q.joker || {}).filter((id) => q.joker[id] === q.idx);
    const res = placePoints(scores, ids, last, jokers);
    Object.entries(res).forEach(([id, r]) => { q.pts[id] = (q.pts[id] || 0) + r.pts; });
    q.stages.push({ game: q.plan[q.idx].game, res });
    q.step = last ? "final" : "break"; q.ready = {}; q.done = false;
    return res;
  }

  // Joker setzen / zurücknehmen – vor einer Etappe (nicht vor dem Finale), einmal pro Partie
  function setJoker(q, pid, on) {
    const next = q.idx + 1;
    if (q.opts.joker === false || !(q.step === "intro" || q.step === "break") || next >= q.plan.length - 1) return false;
    q.joker = q.joker || {};
    if (on) { if (q.joker[pid] != null && q.joker[pid] !== next) return false; q.joker[pid] = next; }
    else { if (q.joker[pid] !== next) return false; delete q.joker[pid]; }
    return true;
  }

  // Auszeichnungen aus den Etappen-Ergebnissen: beste je Spielart, Achterbahn, Aufholjagd, Joker-Glück
  function titles(q, ids) {
    const out = [], st = q.stages;
    const best = (score) => { const vals = ids.map((id) => [id, score(id)]); const max = Math.max(...vals.map((v) => v[1]));
      return max > 0 ? vals.filter((v) => v[1] === max).map((v) => v[0]) : []; };
    Object.entries(KIND_TITLES).forEach(([kind, name]) => {
      const ks = st.filter((x) => STAGES[x.game].kind === kind);
      if (ks.length < 2) return;
      const w = best((id) => ks.reduce((n, x) => n + (x.res[id] ? x.res[id].base : 0), 0));
      if (w.length && w.length < ids.length) out.push({ name, ids: w, why: `die meisten Platzpunkte in ${ks.length} ${({ karte: "Landkarten-Spielen", wissen: "Wissensspielen", wort: "Wortspielen", karten: "Kartenspielen" })[kind]}` });
    });
    if (ids.length >= 3 && st.length >= 4) {
      const swing = (id) => { const pl = st.filter((x) => x.res[id]).map((x) => x.res[id].place); return pl.length ? Math.max(...pl) - Math.min(...pl) : 0; };
      const w = best(swing);
      if (w.length && swing(w[0]) >= 2 && w.length < ids.length) out.push({ name: "🎢 Achterbahn", ids: w, why: "mal ganz vorn, mal ganz hinten" });
    }
    if (st.length >= 4) {
      const half = Math.floor(st.length / 2);
      const avg = (arr, id) => { const pl = arr.filter((x) => x.res[id]).map((x) => x.res[id].place); return pl.length ? pl.reduce((a, b) => a + b, 0) / pl.length : 0; };
      const gain = (id) => avg(st.slice(0, half), id) - avg(st.slice(half), id);
      const w = best(gain);
      if (w.length && gain(w[0]) >= 1 && w.length < ids.length) out.push({ name: "🚀 Aufholjagd", ids: w, why: "in der zweiten Hälfte deutlich besser" });
    }
    const jg = (id) => { const x = st.find((y) => y.res[id] && y.res[id].joker); return x ? x.res[id].pts / 2 : 0; };
    const wj = best(jg);
    if (wj.length && jg(wj[0]) >= 3) out.push({ name: "🃏 Glückshand", ids: wj, why: "den Joker genau richtig gesetzt" });
    return out;
  }

  function winners(q) {
    const max = Math.max(0, ...Object.values(q.pts));
    return Object.keys(q.pts).filter((id) => q.pts[id] === max);
  }

  root.S10Querbeet = { LENGTHS, POINTS, STAGES, ORDER, THEMES, MIXES, mixOff, mixOf, eligible, buildPlan, stageOpts, create, placePoints, finishStage, setJoker, titles, winners };
})(typeof window !== "undefined" ? window : globalThis);
