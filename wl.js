// Gleiche Wellenlänge – kooperatives Wortspiel (läuft beim Gastgeber, testbar in Node).
// Zustand liegt in s.wl; Spieler (s.players) teilen sich alle Spiele.
(function (root) {
  const PACKS = {
    alltag: { name: "Alltag", prompts: ["Etwas Gelbes", "Etwas in der Küche", "Etwas Rundes", "Ein Möbelstück", "Etwas, das man morgens macht",
      "Etwas im Badezimmer", "Ein Werkzeug", "Etwas, das kalt ist", "Etwas mit Rädern", "Ein Kleidungsstück", "Etwas aus Holz", "Etwas, das Lärm macht",
      "Etwas im Garten", "Ein Beruf", "Etwas, das man oft verliert", "Etwas Weiches", "Ein Haustier", "Etwas mit Knöpfen", "Etwas aus dem Supermarkt",
      "Etwas in der Schultasche"] },
    essen: { name: "Essen & Trinken", prompts: ["Ein Obst", "Ein Gemüse", "Etwas zum Frühstück", "Ein Gewürz", "Ein Getränk", "Etwas Süßes", "Ein Pizzabelag",
      "Ein Käse", "Etwas vom Grill", "Eine Eissorte", "Etwas Saures", "Ein italienisches Gericht", "Etwas aus der Bäckerei", "Eine Nudelsorte",
      "Etwas im Kühlschrank", "Ein Kuchen", "Etwas zum Knabbern", "Ein Cocktail", "Etwas Scharfes", "Eine Beilage"] },
    suedtirol: { name: "Südtirol", prompts: ["Ein Südtiroler Ort", "Ein Berg", "Etwas Südtirolerisches zum Essen", "Etwas auf der Alm", "Ein Tal", "Ein See",
      "Ein Dialektwort", "Etwas, das man im Winter macht", "Ein Tier in den Bergen", "Etwas beim Törggelen", "Eine Sehenswürdigkeit in Südtirol",
      "Ein berühmter Südtiroler", "Etwas in der Stube", "Ein Fluss", "Etwas für die Wanderung", "Ein Skigebiet", "Ein Brauch", "Ein Getränk aus Südtirol",
      "Eine Burg oder ein Schloss", "Etwas Italienisches"] },
    film: { name: "Film & Musik", prompts: ["Ein Disney-Film", "Ein Superheld", "Eine Band", "Ein Musikinstrument", "Eine Serie", "Ein Bösewicht",
      "Ein Weihnachtsfilm", "Ein Zeichentrickheld", "Ein Schauspieler", "Eine Sängerin oder ein Sänger", "Etwas aus Harry Potter", "Ein Filmgenre", "Ein Tanz",
      "Ein Kinderlied", "Eine Comicfigur", "Etwas aus Star Wars", "Ein Videospiel", "Ein Märchen", "Ein Musikgenre", "Ein Streamingdienst"] },
    albern: { name: "Albern", prompts: ["Etwas, das nicht in die Waschmaschine gehört", "Ein schlechter Name für ein Haustier", "Etwas, das nachts Geräusche macht",
      "Etwas für die einsame Insel", "Ein Wort, das lustig klingt", "Etwas, das stinkt", "Eine Superkraft", "Ein Grund, zu spät zu kommen",
      "Etwas, das man nie umarmen sollte", "Etwas Klebriges", "Etwas, das Opa sagen würde", "Ein Geräusch", "Etwas, das wackelt", "Etwas, das man heimlich isst",
      "Ein Monster", "Etwas, das kitzelt", "Ein Name für ein Schiff", "Etwas Peinliches", "Etwas, das quietscht", "Etwas, das man im Traum macht"] },
  };
  const ROUND_CHOICES = [3, 5, 8];
  const MAX_TRIES = 8;
  const POINTS = [10, 8, 6, 4, 2, 1, 1, 1];

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clean = (t) => String(t == null ? "" : t).replace(/\s+/g, " ").trim().slice(0, 40);
  const stripArticle = (t) => clean(t).replace(/^(der|die|das|den|dem|ein|eine|einen|the|a)\s+/i, "");
  function same(a, b) {
    a = stripArticle(a); b = stripArticle(b);
    if (!a || !b) return false;
    const M = root.S10Logic && root.S10Logic.textMatches;
    return M ? (M(a, b) || M(b, a)) : a.toLowerCase() === b.toLowerCase();
  }

  function start(s, opts, now) {
    opts = opts || {};
    const rounds = ROUND_CHOICES.includes(Number(opts.rounds)) ? Number(opts.rounds) : 5;
    const pack = PACKS[opts.pack] ? opts.pack : "mix";
    const pool = pack === "mix" ? Object.values(PACKS).flatMap((p) => p.prompts) : PACKS[pack].prompts;
    s.game = "wl"; s.phase = "wl";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.wl = { opts: { pack, rounds }, rounds, impulses: shuffle(pool.slice()).slice(0, rounds), idx: -1, history: [], total: 0 };
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    nextImpulse(s);
  }

  function nextImpulse(s) {
    const st = s.wl;
    st.idx++;
    if (st.idx >= st.rounds) { st.step = "final"; return; }
    st.base = st.impulses[st.idx];
    st.prompt = st.base; st.attempt = 1; st.used = []; st.chain = [];
    beginAttempt(st);
  }
  function beginAttempt(st) { st.step = "writing"; st.words = {}; st.result = null; }

  const activeIds = (s) => s.players.filter((p) => p.connected).map((p) => p.id);
  const isUsed = (st, w) => st.used.some((u) => same(u, w));

  function reveal(s) {
    const st = s.wl, ids = Object.keys(st.words);
    // Gruppen gleicher Wörter bilden
    const groups = [];
    ids.forEach((pid) => {
      const g = groups.find((gr) => same(gr.word, st.words[pid]));
      if (g) g.ids.push(pid); else groups.push({ word: st.words[pid], ids: [pid] });
    });
    const hit = groups.find((g) => g.ids.length >= 2) || null;
    st.result = { hit: !!hit, word: hit ? hit.word : null, ids: hit ? hit.ids : [], groups };
    st.chain.push({ prompt: st.prompt, words: { ...st.words }, hit: !!hit });
    ids.forEach((pid) => st.used.push(st.words[pid]));
    st.step = "reveal";
  }

  function finishImpulse(s, success) {
    const st = s.wl;
    const pts = success ? POINTS[st.attempt - 1] || 1 : 0;
    st.total += pts;
    st.history.push({ base: st.base, attempts: st.attempt, success, points: pts, word: success ? st.result.word : null });
    nextImpulse(s);
  }

  // Gastgeber prüft regelmäßig (z. B. wenn jemand die Verbindung verliert)
  function tick(s) {
    if (s.phase !== "wl" || !s.wl || s.wl.step !== "writing") return false;
    const ids = activeIds(s);
    if (ids.length >= 2 && ids.every((id) => s.wl.words[id])) { reveal(s); return true; }
    return false;
  }

  function apply(s, pid, a, isHost) {
    if (!a || typeof a !== "object" || !s.wl) return false;
    const st = s.wl;
    switch (a.type) {
      case "wlWord": {
        if (st.step !== "writing") return false;
        const w = clean(a.word);
        if (!w) { delete st.words[pid]; return true; }
        if (isUsed(st, w)) return false; // schon genanntes Wort
        st.words[pid] = w;
        tick(s);
        return true;
      }
      case "wlNext": // nach dem Aufdecken weiter
        if (st.step !== "reveal") return false;
        if (st.result.hit) finishImpulse(s, true);
        else if (st.attempt >= MAX_TRIES) finishImpulse(s, false);
        else {
          const ws = Object.values(st.chain[st.chain.length - 1].words);
          st.prompt = ws.length > 1 ? `Was verbindet ${ws.map((w) => "„" + w + "“").join(ws.length === 2 ? " und " : ", ")}?` : `Was passt zu „${ws[0] || st.base}“?`;
          st.attempt++;
          beginAttempt(st);
        }
        return true;
      case "wlGiveUp":
        if (st.step !== "reveal" && st.step !== "writing") return false;
        finishImpulse(s, false); return true;
      case "wlRestart":
        if (st.step !== "final") return false;
        start(s, st.opts); return true;
    }
    return false;
  }

  function publicState(s) {
    const st = s.wl;
    if (!st) return null;
    const out = {
      step: st.step, rounds: st.rounds, impulse: Math.min(st.idx + 1, st.rounds), base: st.base, prompt: st.prompt, attempt: st.attempt,
      maxTries: MAX_TRIES, submitted: Object.keys(st.words || {}), used: (st.used || []).slice(), chain: st.chain || [], total: st.total,
      history: st.history, nextPoints: POINTS[(st.attempt || 1) - 1] || 1, best: st.best || null, newRecord: !!st.newRecord,
      packName: st.opts.pack === "mix" ? "Alle gemischt" : PACKS[st.opts.pack].name,
    };
    if (st.step === "reveal") { out.words = { ...st.words }; out.result = st.result; }
    return out;
  }

  root.S10Wl = { start, apply, tick, publicState, PACKS, ROUND_CHOICES, MAX_TRIES, POINTS, same, stripArticle };
})(typeof window !== "undefined" ? window : globalThis);
