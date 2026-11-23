// „Querbeet“ – quer durch die Spiele (Ablauf beim Gastgeber, testbar in Node). Zustand in s.qb.
// Jede Etappe ist eine Kurzfassung eines Spiels. Gezählt wird nur die Platzierung pro Etappe – als Felder auf dem
// Spielbrett: der Letzte rückt 0 Felder vor, jeder Platz davor eins mehr (der Sieger so viele, wie hinter ihm liegen).
// Wettlauf ohne Etappenlimit: wer zuerst das Zielfeld erreicht, ist Stubenmeister.
// Ziel = Länge × Felder für einen Etappensieg → eine Meisterschaft dauert mit jeder Spielerzahl etwa gleich lang
// (Simulation: kurz ≈ 3–4, mittel ≈ 5, lang ≈ 8 Etappen).
(function (root) {
  // Länge = wie viele Etappensiege bis ins Ziel reichen würden
  const LENGTHS = { 3: { name: "Kurz – Ziel nach 3 Siegen (ca. 20 Min.)", short: "Kurz" }, 4: { name: "Mittel – 4 Siege (ca. 30 Min.)", short: "Mittel" }, 6: { name: "Lang – 6 Siege (ca. 55 Min.)", short: "Lang" } };
  // Felder für einen Platz: der Letzte 0, jeder Platz davor eins mehr; allein gibt es pro Etappe 1 Feld
  const fieldsFor = (place, n) => n <= 1 ? 1 : n - place;
  const unitFor = (n) => Math.max(1, n - 1); // Felder für einen Etappensieg
  const targetFor = (length, n) => length * unitFor(n);
  // Spiele mit Kurzfassung; kind sorgt für Abwechslung (nicht zweimal dieselbe Art hintereinander)
  const STAGES = {
    zehn: { kind: "wissen", name: "Zehnkampf", short: "3 Karten", rule: "Eine Karte mit 10 Antworten – reihum aufdecken oder passen. Wer danebenliegt, verliert die Punkte dieser Runde." },
    wand: { kind: "wissen", min2: true, name: "Fragewand", short: "5 Kategorien", rule: "Reihum ein Feld wählen und die Frage beantworten – je mehr Punkte, desto schwerer. Falsch kostet nichts." },
    hl: { kind: "wissen", name: "Höher oder tiefer", short: "2 Kategorien, je 6 Vergleiche", rule: "Ist der Wert des nächsten Begriffs höher oder tiefer? Alle tippen gleichzeitig." },
    geo: { kind: "karte", name: "Wo liegt das?", short: "5 Orte", rule: "Tippt auf der Karte, wo der Ort liegt – je näher, desto mehr Punkte." },
    land: { kind: "karte", name: "Länder finden", short: "8 Gebiete", rule: "Tippt das genannte Land (oder Bundesland, Region, Kanton) auf der Karte an." },
    oben: { kind: "karte", name: "Von oben", short: "3 Satellitenbilder", rule: "Erkennt den Ort von oben und tippt ihn auf der Karte an – wer früh tippt, bekommt mehr." },
    slf: { kind: "wort", name: "Stadt, Land, Fluss", short: "2 Buchstaben", rule: "Ein Buchstabe, sechs Kategorien. Wer fertig ist, ruft Stopp – dann bleiben noch 10 Sekunden." },
    duell: { kind: "wort", two: true, name: "Listen-Duell", short: "bis 3 Punkte", rule: "Abwechselnd Antworten aus der Liste nennen – wer patzt, verliert die Runde." },
    frage: { kind: "wort", two: true, name: "Antwort sucht Frage", short: "bis 3 Punkte", rule: "Zur vorgegebenen Antwort eine Frage erfinden – der andere muss sie beantworten." },
    schaetzen: { kind: "wissen", name: "Schätzen", short: "5 Schätzfragen", rule: "Eine Zahl schätzen – wer am nächsten dran ist, gewinnt die Runde." },
    hinweis: { kind: "wissen", name: "Hinweis für Hinweis", short: "4 Begriffe", rule: "Alle 10 Sekunden kommt ein leichterer Hinweis. Wer früh richtig rät, bekommt mehr – aber nur ein Versuch!" },
    siebzehn: { kind: "karten", name: "Siebzehn und Vier", short: "bis 3 Siege", rule: "Weitere Karte ziehen oder aufhören – wer am nächsten an 21 liegt, gewinnt die Runde. Wer zuerst 3 Runden gewinnt, gewinnt die Etappe – spätestens nach 8 Runden ist Schluss." },
    bus: { kind: "karten", name: "Busfahrt", short: "3 Runden à 5 Stationen", rule: "Station für Station tippen (Figur/Zahl, höher/tiefer, zwischen/außerhalb, Farbe genau, Wert genau) – nach jeder richtigen Station weiterfahren oder aussteigen. Falsch = Topf weg." },
    stich: { kind: "karten", name: "Stichhaltig", short: "4 Runden (1 bis 4 Karten)", rule: "Stiche ansagen und genau so viele holen – Farbe bedienen, Trumpf sticht." },
    alm: { kind: "wuerfel", name: "Almsommer", short: "8 Wochen, ohne Gewitter", rule: "Gemeinsame Würfel, jeder kreuzt auf seinem Tal an – fertige Flächen bringen Punkte." },
    jagd: { kind: "taktik", min2: true, name: "Auf der Jagd", short: "12 Runden", rule: "Wild verstecken, dann im Revier des Nachbarn schießen – Treffer und erlegtes Wild bringen Punkte." },
    umriss: { kind: "karte", name: "Umriss-Rätsel", short: "6 Umrisse", rule: "Nur der Umriss ist zu sehen – welches Land (oder Bundesland, Region, Kanton) ist das?" },
  };
  // „So geht's“ auf der Etappenkarte: drei kurze Schritte (*fett*) und wie man die Etappe gewinnt
  const HOWTO = {
    zehn: { steps: ["Eine Karte mit *10 Antworten* – reihum ist einer dran.", "Wer dran ist, *nennt eine Antwort* oder *passt* (sichert seine Punkte).", "Richtig = +1. *Falsch = alle Punkte dieser Runde weg.*"], win: "Wer am Ende die meisten Punkte hat." },
    wand: { steps: ["Wer dran ist, *wählt ein Feld* – je höher die Zahl, desto schwerer.", "*Nur du antwortest* – eintippen oder auswählen, ohne Zeitdruck.", "*Richtig = Punkte* des Feldes. Falsch kostet nichts."], win: "Wer nach allen Zügen die meisten Punkte hat." },
    hl: { steps: ["Ein Begriff mit Wert, daneben der nächste *ohne* Wert.", "*Höher oder tiefer?* Alle tippen gleichzeitig.", "Richtig = 1 Punkt – der neue Begriff wird die nächste Vergleichszahl."], win: "Die meisten richtigen Tipps." },
    schaetzen: { steps: ["Eine Frage mit einer *Zahl* als Antwort.", "Alle *schätzen gleichzeitig*.", "*Am nächsten dran* = die meisten Punkte, ganz genau = Bonus."], win: "Die meisten Punkte nach allen Fragen." },
    hinweis: { steps: ["Gesucht ist ein Begriff – alle 10 Sekunden kommt ein *leichterer Hinweis*.", "Jeder hat *nur einen Versuch*.", "*Früh richtig* = viele Punkte, spät richtig = wenige."], win: "Die meisten Punkte nach allen Begriffen." },
    geo: { steps: ["Oben steht ein *Ort*.", "*Alle tippen gleichzeitig* auf die Karte, wo er liegt.", "*Je näher* am echten Ort, desto mehr Punkte."], win: "Die meisten Punkte nach allen Orten." },
    land: { steps: ["Oben steht ein *Gebiet* (Land, Bundesland, Region oder Kanton).", "*Tippt es auf der Karte an* – alle gleichzeitig.", "*Richtig* getippt = Punkt."], win: "Die meisten richtigen Gebiete." },
    umriss: { steps: ["Zu sehen ist nur ein *Umriss*.", "*Welches Gebiet ist das?* Eintippen – nur ein Versuch.", "Richtig = Punkte, *wer zuerst richtig liegt*, bekommt mehr."], win: "Die meisten Punkte nach allen Umrissen." },
    oben: { steps: ["Ein Ort *von oben* – das Bild zoomt langsam heraus.", "*Tippe auf der Karte*, wo das ist.", "*Je näher und je früher*, desto mehr Punkte."], win: "Die meisten Punkte nach allen Bildern." },
    slf: { steps: ["Ein *Buchstabe*, sechs Kategorien.", "Zu jeder Kategorie *ein Wort* mit diesem Anfangsbuchstaben.", "Wer fertig ist, ruft *Stopp* – dann bleiben noch 10 Sekunden."], win: "Die meisten Punkte (eigene Antworten zählen mehr)." },
    duell: { steps: ["Ein Thema mit fester Liste, z. B. „die 10 größten Städte …“.", "*Abwechselnd* je eine Antwort nennen.", "*Falsch, doppelt oder zu spät* = Runde verloren."], win: "Wer die meisten Runden gewinnt." },
    frage: { steps: ["Einer bekommt eine *Antwort* und eine Kategorie.", "Er *erfindet eine Frage* dazu – der andere muss sie beantworten.", "*Richtig beantwortet* = Punkt für den Antwortenden, sonst für den Fragesteller."], win: "Wer die meisten Runden gewinnt." },
    siebzehn: { steps: ["Jeder bekommt *zwei Karten* (Unter 2, Ober 3, König 4, Ass 11).", "*Weitere Karte* ziehen oder *genug* – alle gleichzeitig.", "*Am nächsten an 21* gewinnt die Runde. Über 21 = raus, Gleichstand vorne zählt für keinen."], win: "Wer zuerst *3 Runden* gewinnt – nach spätestens *8 Runden* zählen die meisten Rundensiege." },
    bus: { steps: ["Vor jeder Station *tippen alle*: Figur oder Zahl? Höher oder tiefer? …", "Richtig = Punkte in deinen *Topf* – die Stationen werden immer wertvoller.", "Ab Station 2 kannst du *aussteigen* und den Topf sichern. Falsch = Topf weg."], win: "Die meisten Punkte nach der Fahrt." },
    stich: { steps: ["Alle sagen *geheim* an, wie viele Stiche sie holen.", "*Farbe bedienen* – die höchste Karte holt den Stich, *Trumpf sticht*.", "*Genau getroffen* = Punkte, daneben = Abzug."], win: "Die meisten Punkte nach allen Runden." },
    alm: { steps: ["*3 Würfel für alle* – jeder wählt einen (Gelände + Zahl).", "*Maximal so viele Felder* dieses Geländes ankreuzen – aneinander grenzend, Start am Hof.", "*Fläche voll* = Punkte im Eck erhalten."], win: "Die meisten Punkte nach 8 Wochen." },
    jagd: { steps: ["*Versteck dein Wild* im eigenen Revier.", "Jede Runde *schießen alle gleichzeitig* ins Revier des Nachbarn – 🐾 = Fuchs direkt daneben.", "*Treffer* und *erlegtes Wild* bringen Punkte."], win: "Die meisten Punkte nach 12 Runden." },
  };
  const ORDER = ["zehn", "wand", "hl", "schaetzen", "hinweis", "geo", "land", "umriss", "oben", "siebzehn", "stich", "bus", "alm", "jagd", "slf", "duell", "frage"];
  // Fertige Mischungen je nach Stimmung (null = alle Spiele); setzen nur die Haken bei „Mit dabei“
  const MIXES = {
    alle: { icon: "🎲", name: "Bunt gemischt", games: null },
    wissen: { icon: "🧠", name: "Wissensabend", games: ["zehn", "wand", "hl", "schaetzen", "hinweis", "duell"] },
    welt: { icon: "🗺️", name: "Rund um die Welt", games: ["geo", "land", "umriss", "oben"] },
    gaudi: { icon: "🎉", name: "Gaudi", games: ["bus", "siebzehn", "stich", "slf", "frage", "alm", "jagd"] },
    karten: { icon: "🃏", name: "Kartenabend", games: ["siebzehn", "stich", "bus"] },
    kurz: { icon: "⚡", name: "Kurz & schnell", games: ["hl", "schaetzen", "bus", "siebzehn", "oben", "geo"] },
    // allein spielbar und ohne Fragenvorrat (nur Karten, Würfel, Buchstaben)
    solo: { icon: "🙋", name: "Allein & ohne Verbrauch", games: ["siebzehn", "bus", "alm", "slf"] },
  };
  const mixOff = (key) => { const m = MIXES[key]; return m && m.games ? ORDER.filter((k) => !m.games.includes(k)) : []; };
  const mixOf = (off) => Object.keys(MIXES).find((k) => { const o = mixOff(k); return o.length === off.length && o.every((x) => off.includes(x)); }) || null;
  // Themenabende: alle Etappen mit passenden Inhalten
  const THEMES = { mix: { name: "Gemischt" }, suedtirol: { name: "Südtirol" }, welt: { name: "Welt" } };
  // Schwierigkeit für die Spiele mit Stufen (Wo liegt das?, Länder finden, Umriss-Rätsel); „Gemischt“ = bisheriges Verhalten
  // (Höher oder tiefer: deutliche bzw. knappe Vergleiche; Stadt, Land, Fluss bei „Leicht“ nur leichte Buchstaben)
  const LEVELS = { leicht: { name: "Leicht", desc: "bekannte Orte, deutliche Vergleiche, leichte Buchstaben" }, gemischt: { name: "Gemischt", desc: "wie es kommt" }, profi: { name: "Profi", desc: "schwere Orte, knappe Vergleiche" } };
  // Auszeichnungen bei der Siegerehrung (je Art von Spiel)
  const KIND_TITLES = { karte: "🧭 Kartenleser", wissen: "📚 Wandelndes Lexikon", wort: "✍️ Wortakrobat", karten: "🎴 Kartenhai" };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // Welche Spiele kommen in Frage? Zweier-Spiele nur bei genau zwei Spielern.
  function eligible(off, players) {
    return ORDER.filter((k) => !(off || []).includes(k) && (!STAGES[k].two || players === 2) && (!STAGES[k].min2 || players >= 2));
  }

  // Reihenfolge: jedes Spiel etwa gleich oft (aus einem „Beutel“ ziehen), nie dasselbe Spiel und möglichst
  // nicht dieselbe Art zweimal hintereinander. prev: bisheriger Plan (wird fortgesetzt), bag: Rest des Beutels.
  function buildPlan(games, n, theme, level, prevPlan, bagIn) {
    const out = (prevPlan || []).map((x) => x.game), start = out.length;
    let bag = (bagIn || []).filter((g) => games.includes(g));
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
    const plan = out.slice(start).map((game) => ({ game, opts: stageOpts(game, theme, level) }));
    plan.bag = bag;
    return plan;
  }
  // Etappen nachziehen: es sind immer mindestens drei Etappen über die aktuelle hinaus geplant (das Ende ist offen)
  function extendPlan(q, players) {
    const need = q.idx + 4 - q.plan.length;
    if (need <= 0) return;
    const games = eligible(q.opts.off, players || q.players || 2), add = buildPlan(games.length ? games : [q.plan[q.plan.length - 1].game], need, q.opts.theme, q.opts.level, q.plan, q.bag);
    q.bag = add.bag; q.plan.push(...add);
  }

  // Kurzfassung je Spiel – großzügige Zeiten, damit es nicht hektisch wird; theme: mix | suedtirol | welt
  const HL_ST = ["suedtirolBerge", "gemeinden"];
  function stageOpts(game, theme, level) {
    const st = theme === "suedtirol", w = theme === "welt";
    // „Gemischt“: Weltkarte bei Ländern/Umrissen leicht (sonst zu viele unbekannte Kleinstaaten); „Leicht“/„Profi“ gelten überall
    const lv = (region) => level === "leicht" || level === "profi" ? level : region === "welt" ? "leicht" : "gemischt";
    const pro = level === "profi";
    switch (game) {
      case "zehn": return st ? { sets: ["suedtirol"], cards: 3 } : { cards: 3 };
      case "wand": return { n: 5, theme: st ? "suedtirol" : w ? "welt" : null }; // 5 Kategorien ausgelost (20 Felder)
      case "hl": return { ...(st ? { cats: 2, only: HL_ST } : w ? { cats: 2, not: HL_ST } : { cats: 2 }), level: LEVELS[level] ? level : "gemischt" };
      case "geo": return { mode: "karte", region: pick(st ? ["suedtirol"] : w ? ["europa", "welt"] : ["suedtirol", "italien", "dach", "europa", "welt"]), level: LEVELS[level] ? level : "gemischt", rounds: 5, timer: "t60" };
      case "oben": return { mode: "oben", rounds: 3 };
      case "land": { // 8 Gebiete: Österreich (9, auf „Leicht“ 5) und Deutschland auf „Leicht“/„Profi“ (9/7) haben zu wenige
        const region = pick(st ? ["it", "it", "europa"] : w ? ["welt", "afrika", "asien", "amerika", "europa"] : ["europa", "europa", "welt", "afrika", "asien", "amerika", ...(level === "gemischt" ? ["de"] : []), "it"]);
        return { region, level: lv(region), rounds: 8, timer: "t45", free: true }; } // 45 s: kleine Länder muss man erst suchen
      // Umrisse von Bundesländern/Regionen sind kaum zu erkennen – nur bei „Profi“ (Österreich hat dort zu wenige Gebiete)
      case "umriss": { const region = pick(st ? (pro ? ["europa", "it"] : ["europa"]) : w ? ["welt", "europa"] : ["europa", "welt", ...(pro ? ["de", "it"] : [])]);
        return { mode: "umriss", region, level: lv(region), rounds: 6 }; }
      case "schaetzen": return { mode: "schaetzen", rounds: 5, theme: st ? "suedtirol" : w ? "allgemein" : "mix" };
      case "hinweis": return { mode: "hinweis", rounds: 4, theme: st ? "suedtirol" : w ? "allgemein" : "mix" };
      case "siebzehn": return { mode: "siebzehn", wins: 3, maxRounds: 8 };
      case "stich": return { mode: "stich", rounds: 4 };
      case "bus": return { mode: "bus", rounds: 3 };
      // Südtirol-Paket nur beim Thema Südtirol, sonst jedes Mal neu: 2 Klassiker + 4 zufällige Kategorien
      case "slf": return { ...(st ? { preset: "suedtirol", rounds: 2, timer: "stopp" } : { preset: "zufall", classics: 2, rounds: 2, timer: "stopp" }), letters: level === "leicht" ? "leicht" : "alle" };
      case "alm": return { weeks: 8, storms: 0, map: "zufall" }; // Kurzsommer: 8 Wochen ohne Gewitter, Tal ausgelost
      case "jagd": return { rounds: 12, map: "zufall" }; // 12 Runden, Jagdgebiet ausgelost
      case "duell": return { target: 3, timer: "0" }; // ohne Zeitlimit
      case "frage": return { target: 3, write: "0", answer: "0", choices: level === "leicht" ? "3" : "1" }; // leicht: 3 Antworten zur Auswahl, sonst eine vorgegeben
    }
    return {};
  }

  function create(opts, players) {
    const length = LENGTHS[opts && opts.length] ? Number(opts.length) : 4;
    const theme = THEMES[opts && opts.theme] ? opts.theme : "mix";
    const level = LEVELS[opts && opts.level] ? opts.level : "gemischt";
    const games = eligible(opts && opts.off, players);
    if (!games.length) return null;
    const joker = !(opts && opts.joker === false), n = Math.max(1, players || 1);
    const plan = buildPlan(games, 4, theme, level);
    return { opts: { length, off: (opts && opts.off) || [], theme, level, joker }, plan, bag: plan.bag, players: n, target: targetFor(length, n),
      idx: -1, pts: {}, stages: [], step: "intro", ready: {}, done: false, winners: null,
      joker: {} }; // joker: Spieler-ID -> Etappe, in der sein Joker zählt (einmal pro Meisterschaft)
  }

  // Platzierungen einer Etappe in Felder umrechnen (Gleichstand = gleicher Platz, die höheren Felder)
  function placePoints(scores, ids, jokers) {
    const sorted = ids.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0)), n = ids.length;
    const out = {};
    sorted.forEach((id) => {
      const place = sorted.findIndex((x) => (scores[x] || 0) === (scores[id] || 0)); // erster mit gleicher Punktzahl
      const p = fieldsFor(place + 1, n), joker = !!(jokers && jokers.includes(id));
      out[id] = { place: place + 1, base: p, pts: p * (joker ? 2 : 1), score: scores[id] || 0, joker };
    });
    return out;
  }

  // Etappe abschließen: Felder gutschreiben, Ergebnis merken. Wer das Ziel erreicht, ist Stubenmeister –
  // schaffen es mehrere in derselben Etappe, gewinnt, wer weiter darüber hinaus käme (sonst gemeinsam).
  function finishStage(q, scores, ids) {
    const jokers = Object.keys(q.joker || {}).filter((id) => q.joker[id] === q.idx);
    // spielen mehr mit als beim Start (z. B. jemand kam später dazu), wächst das Ziel mit – kürzer wird es nie
    q.target = Math.max(q.target, targetFor(q.opts.length, ids.length)); q.players = Math.max(q.players || 1, ids.length);
    const res = placePoints(scores, ids, jokers);
    Object.entries(res).forEach(([id, r]) => { q.pts[id] = (q.pts[id] || 0) + r.pts; });
    q.stages.push({ game: q.plan[q.idx].game, res });
    const top = Object.keys(q.pts).filter((id) => q.pts[id] >= q.target);
    if (top.length) { const best = Math.max(...top.map((id) => q.pts[id])); q.winners = top.filter((id) => q.pts[id] === best); q.step = "final"; }
    else { q.step = "break"; extendPlan(q); }
    q.ready = {}; q.done = false;
    return res;
  }

  // Joker setzen / zurücknehmen – vor einer Etappe (nicht vor dem Finale), einmal pro Meisterschaft
  // Gastgeber überspringt die angekündigte Etappe: an ihre Stelle kommt ein anderes Spiel (die Meisterschaft bleibt gleich lang).
  // Bevorzugt ein Spiel, das noch nicht im Plan ist und nicht zur selben Art wie die Nachbar-Etappen gehört.
  function skipStage(q, players) {
    const i = q.idx + 1, cur = q.plan[i];
    if (!cur || !(q.step === "intro" || q.step === "break")) return false;
    // schon abgelehnte Spiele für diese Etappe kommen nicht wieder – erst wenn alle durch sind, geht es von vorn los
    const tried = q.skipped && q.skipped.at === i ? q.skipped.tried.concat(cur.game) : [cur.game];
    const all = eligible(q.opts.off, players).filter((g) => g !== cur.game);
    if (!all.length) return false;
    let games = all.filter((g) => !tried.includes(g)), fresh = tried;
    if (!games.length) { games = all; fresh = [cur.game]; }
    const prev = q.plan[i - 1], next = q.plan[i + 1], kinds = [prev, next].filter(Boolean).map((x) => STAGES[x.game].kind);
    const left = q.plan.slice(i).map((x) => x.game), done = q.plan.slice(0, i).map((x) => x.game);
    const score = (g) => (left.includes(g) ? 4 : 0) + (done.includes(g) ? 2 : 0) + (kinds.includes(STAGES[g].kind) ? 1 : 0) + (prev && prev.game === g ? 8 : 0);
    const best = Math.min(...games.map(score)), game = pick(games.filter((g) => score(g) === best));
    q.plan[i] = { game, opts: stageOpts(game, q.opts.theme, q.opts.level) };
    // „statt …“ nennt das ursprünglich geplante Spiel
    q.skipped = { at: i, from: q.skipped && q.skipped.at === i ? q.skipped.from : cur.game, tried: fresh };
    q.ready = {};
    if (q.joker) Object.keys(q.joker).forEach((id) => { if (q.joker[id] === i) delete q.joker[id]; }); // Joker für diese Etappe neu überlegen
    return true;
  }

  function setJoker(q, pid, on) {
    const next = q.idx + 1;
    if (q.opts.joker === false || !(q.step === "intro" || q.step === "break") || next >= q.plan.length) return false;
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
    if (q.winners) return q.winners.slice();
    const max = Math.max(0, ...Object.values(q.pts));
    return Object.keys(q.pts).filter((id) => q.pts[id] === max);
  }

  root.S10Querbeet = { skipStage, extendPlan, fieldsFor, unitFor, targetFor, LENGTHS, STAGES, HOWTO, ORDER, THEMES, LEVELS, MIXES, mixOff, mixOf, eligible, buildPlan, stageOpts, create, placePoints, finishStage, setJoker, titles, winners };
})(typeof window !== "undefined" ? window : globalThis);
