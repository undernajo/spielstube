// „Querbeet“ – quer durch die Spiele (Ablauf beim Gastgeber, testbar in Node). Zustand in s.qb.
// Jede Etappe ist eine Kurzfassung eines Spiels. Gezählt wird nur die Platzierung pro Etappe (Partypunkte),
// damit Spiele mit 1000 Punkten und Spiele mit 1 Punkt gleich viel zählen. Die letzte Etappe zählt doppelt.
(function (root) {
  const LENGTHS = { 5: { name: "Kurz – 5 Etappen (ca. 20 Min.)" }, 8: { name: "Mittel – 8 Etappen (ca. 35 Min.)" }, 12: { name: "Lang – 12 Etappen (ca. 50 Min.)" } };
  const POINTS = [5, 3, 2]; // Platz 1, 2, 3 – alle weiteren bekommen 1 Partypunkt
  // Spiele mit Kurzfassung; kind sorgt für Abwechslung (nicht zweimal dieselbe Art hintereinander)
  const STAGES = {
    zehn: { kind: "wissen", name: "Schlaue Zehn", short: "1 Karte", rule: "Eine Karte mit 10 Antworten – reihum aufdecken oder passen. Wer danebenliegt, verliert die Punkte dieser Runde." },
    hl: { kind: "wissen", name: "Höher oder tiefer", short: "1 Kategorie, 6 Vergleiche", rule: "Ist der Wert des nächsten Begriffs höher oder tiefer? Alle tippen gleichzeitig." },
    geo: { kind: "karte", name: "Wo liegt das?", short: "3 Orte", rule: "Tippt auf der Karte, wo der Ort liegt – je näher, desto mehr Punkte." },
    land: { kind: "karte", name: "Länder finden", short: "5 Gebiete", rule: "Tippt das genannte Land (oder Bundesland, Region, Kanton) auf der Karte an." },
    oben: { kind: "karte", name: "Von oben", short: "2 Satellitenbilder", rule: "Erkennt den Ort von oben und tippt ihn auf der Karte an – wer früh tippt, bekommt mehr." },
    slf: { kind: "wort", name: "Stadt, Land, Fluss", short: "1 Buchstabe", rule: "Ein Buchstabe, sechs Kategorien. Wer fertig ist, ruft Stopp – dann bleiben noch 10 Sekunden." },
    duell: { kind: "wort", two: true, name: "Listen-Duell", short: "bis 2 Punkte", rule: "Abwechselnd Antworten aus der Liste nennen – wer patzt, verliert die Runde." },
    frage: { kind: "wort", two: true, name: "Antwort sucht Frage", short: "bis 2 Punkte", rule: "Zur vorgegebenen Antwort eine Frage erfinden – der andere muss sie beantworten." },
  };
  const ORDER = ["zehn", "hl", "geo", "land", "oben", "slf", "duell", "frage"];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // Welche Spiele kommen in Frage? Zweier-Spiele nur bei genau zwei Spielern.
  function eligible(off, players) {
    return ORDER.filter((k) => !(off || []).includes(k) && (!STAGES[k].two || players === 2));
  }

  // Reihenfolge: jedes Spiel etwa gleich oft (aus einem „Beutel“ ziehen), nie dasselbe Spiel und möglichst
  // nicht dieselbe Art zweimal hintereinander
  function buildPlan(games, n) {
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
    return out.map((game) => ({ game, opts: stageOpts(game) }));
  }

  // Kurzfassung je Spiel – großzügige Zeiten, damit es nicht hektisch wird
  function stageOpts(game) {
    switch (game) {
      case "zehn": return {};
      case "hl": return { cats: 1 };
      case "geo": return { mode: "karte", region: pick(["suedtirol", "italien", "dach", "europa", "welt"]), level: "gemischt", rounds: 3, timer: "t60" };
      case "oben": return { mode: "oben", rounds: 2 };
      case "land": { const region = pick(["europa", "europa", "welt", "afrika", "asien", "amerika", "de", "at", "it", "ch"]);
        return { region, level: region === "welt" ? "leicht" : "gemischt", rounds: 5, timer: "t30" }; }
      case "slf": return { preset: pick(["klassisch", "gemischt", "spass", "suedtirol"]), rounds: 1, timer: "stopp" };
      case "duell": return { target: 2, timer: "45" };
      case "frage": return { target: 2, write: "0", answer: "0" };
    }
    return {};
  }

  function create(opts, players) {
    const length = LENGTHS[opts && opts.length] ? Number(opts.length) : 8;
    const games = eligible(opts && opts.off, players);
    if (!games.length) return null;
    return { opts: { length, off: (opts && opts.off) || [] }, plan: buildPlan(games, length), idx: -1, pts: {}, stages: [], step: "intro", ready: {}, done: false };
  }

  // Platzierungen einer Etappe in Partypunkte umrechnen (Gleichstand = gleiche, höhere Punkte)
  function placePoints(scores, ids, double) {
    const sorted = ids.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const out = {};
    sorted.forEach((id, i) => {
      const place = sorted.findIndex((x) => (scores[x] || 0) === (scores[id] || 0)); // erster mit gleicher Punktzahl
      const p = place < POINTS.length ? POINTS[place] : 1;
      out[id] = { place: place + 1, pts: p * (double ? 2 : 1), score: scores[id] || 0 };
    });
    return out;
  }

  // Etappe abschließen: Partypunkte gutschreiben, Ergebnis merken
  function finishStage(q, scores, ids) {
    const last = q.idx === q.plan.length - 1;
    const res = placePoints(scores, ids, last);
    Object.entries(res).forEach(([id, r]) => { q.pts[id] = (q.pts[id] || 0) + r.pts; });
    q.stages.push({ game: q.plan[q.idx].game, res });
    q.step = last ? "final" : "break"; q.ready = {}; q.done = false;
    return res;
  }

  function winners(q) {
    const max = Math.max(0, ...Object.values(q.pts));
    return Object.keys(q.pts).filter((id) => q.pts[id] === max);
  }

  root.S10Querbeet = { LENGTHS, POINTS, STAGES, ORDER, eligible, buildPlan, stageOpts, create, placePoints, finishStage, winners };
})(typeof window !== "undefined" ? window : globalThis);
