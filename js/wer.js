// „Wer bin ich?“ – Spiellogik (läuft beim Gastgeber, testbar in Node). Zustand in s.wer.
// Jeder bekommt geheim eine Person. Alle anderen sehen sie samt Steckbrief (privat verschickt, wie Handkarten),
// nur man selbst nicht. Reihum stellt man Ja/Nein-Fragen über sich, die anderen antworten Ja / Nein / Weiß nicht.
//  - Mehrheit Ja (oder unklar): man darf weiterfragen. Mehrheit Nein: der Nächste ist dran.
//  - Wer dran ist, kann statt einer Frage raten. Erkennt das Spiel den Namen nicht, entscheiden die anderen.
//  - Falsch geraten: der Nächste ist dran. Aufgeben ist möglich (die Person wird aufgedeckt).
//  - Ende: wenn alle ihre Person haben (oder wahlweise schon, wenn der Erste sie hat). Wer zuerst errät, gewinnt.
(function (root) {
  const THEMES = {
    mix: { name: "Bunt gemischt", desc: "echte Menschen und Figuren", ok: () => true },
    echt: { name: "Nur echte Menschen", desc: "Promis aus Musik, Sport, Film, Geschichte …", ok: (p) => !p.fik },
    suedtirol: { name: "Südtirol & Alpen", desc: "Leute aus Südtirol, Tirol, Österreich, der Schweiz", ok: (p) => !!p.st },
    figuren: { name: "Erfundene Figuren", desc: "aus Märchen, Büchern, Filmen, Comics", ok: (p) => !!p.fik },
  };
  const HINTS = { aus: { name: "Nichts verraten" }, bereich: { name: "Bereich verraten (z. B. „Sport“)" } };
  const ENDS = { alle: { name: "Bis alle ihre Person erraten haben" }, erster: { name: "Bis der Erste seine Person errät" } };
  const ANSWERS = ["ja", "nein", "egal"];
  const data = () => root.SCHLAU10_WER || [];
  const L = () => root.S10Logic;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pool = (theme) => data().map((p, i) => i).filter((i) => (THEMES[theme] || THEMES.mix).ok(data()[i]));

  function start(s, opts) {
    opts = opts || {};
    const seats = s.players.filter((p) => p.connected && !p.paused).map((p) => p.id);
    if (seats.length < 2) return false;
    const theme = THEMES[opts.theme] ? opts.theme : "mix", hint = HINTS[opts.hint] ? opts.hint : "aus", end = ENDS[opts.end] ? opts.end : "alle";
    const avoid = new Set(opts.avoid || []), all = pool(theme);
    if (all.length < seats.length) return false;
    const fresh = shuffle(all.filter((i) => !avoid.has(data()[i].n))), old = shuffle(all.filter((i) => avoid.has(data()[i].n)));
    const picks = [...fresh, ...old].slice(0, seats.length), who = {};
    seats.forEach((id, k) => { who[id] = picks[k]; });
    s.game = "wer"; s.phase = "wer";
    s.cardIdx = null; s.pending = null; s.undo = null; s.undoReq = null; s.winners = null;
    s.wer = { opts: { theme, hint, end }, seats, order: shuffle(seats.slice()), who, turn: null, step: "ask", move: 0,
      q: null, guess: null, last: null, solved: {}, solvedN: 0, qn: Object.fromEntries(seats.map((id) => [id, 0])), log: Object.fromEntries(seats.map((id) => [id, []])) };
    s.wer.turn = s.wer.order[0];
    s.players.forEach((p) => { p.waiting = false; p.status = "active"; });
    return true;
  }

  const open = (st) => st.order.filter((id) => !st.solved[id]);
  const connectedIds = (s) => new Set(s.players.filter((p) => p.connected).map((p) => p.id));
  // wer antworten soll: alle anderen am Tisch, die verbunden sind (auch wer schon fertig ist)
  const answerers = (s) => { const st = s.wer, c = connectedIds(s); return st.seats.filter((id) => id !== st.turn && c.has(id)); };

  function nextTurn(s) {
    const st = s.wer;
    st.q = null; st.guess = null; st.move++;
    const rest = open(st);
    if (!rest.length || (st.opts.end === "erster" && st.solvedN > 0)) { st.step = "final"; st.turn = null; return; }
    const i = st.order.indexOf(st.turn);
    for (let k = 1; k <= st.order.length; k++) { const id = st.order[(i + k) % st.order.length]; if (!st.solved[id]) { st.turn = id; break; } }
    st.step = "ask";
  }
  function solve(s, id, gaveUp) {
    const st = s.wer;
    if (!gaveUp) st.solvedN++;
    st.solved[id] = { at: gaveUp ? 0 : st.solvedN, q: st.qn[id], gaveUp: !!gaveUp };
  }
  // Fragen auswerten: Mehrheit der Ja- und Nein-Stimmen („Weiß nicht“ zählt nicht)
  function resolve(s) {
    const st = s.wer, a = st.q.answers, tally = { ja: 0, nein: 0, egal: 0 };
    Object.values(a).forEach((v) => { tally[v]++; });
    const res = tally.ja > tally.nein ? "ja" : tally.nein > tally.ja ? "nein" : "unklar";
    st.qn[st.turn]++;
    st.log[st.turn].push({ t: st.q.text, r: res, tally });
    st.last = { kind: "q", by: st.turn, text: st.q.text, r: res, tally };
    if (res === "nein") nextTurn(s);
    else { st.q = null; st.step = "ask"; st.move++; }
  }

  function tick(s) {
    if (s.phase !== "wer" || !s.wer) return false;
    const st = s.wer;
    // wer dran ist, hat die Stube verlassen: weiter zum Nächsten
    const c = connectedIds(s);
    if ((st.step === "ask" || st.step === "answer" || st.step === "judge") && !c.has(st.turn) && open(st).some((id) => id !== st.turn && c.has(id))) {
      st.last = { kind: "skip", by: st.turn }; nextTurn(s); return true;
    }
    if (st.step === "answer") { const need = answerers(s); if (need.length && need.every((id) => st.q.answers[id])) { resolve(s); return true; } }
    return false;
  }

  function apply(s, pid, a, isHost) {
    if (!a || typeof a !== "object" || !s.wer) return false;
    const st = s.wer, mine = pid === st.turn;
    if (a.type !== "wbEnd" && a.move !== st.move) return false; // veralteter Klick
    switch (a.type) {
      case "wbAsk": {
        if (st.step !== "ask" || !mine) return false;
        const t = String(a.text || "").trim().slice(0, 200);
        if (!t) return false;
        st.q = { text: t, answers: {} }; st.step = "answer"; st.move++;
        return true;
      }
      case "wbAnswer": {
        if (st.step !== "answer" || mine || !st.seats.includes(pid) || !ANSWERS.includes(a.v)) return false;
        st.q.answers[pid] = a.v;
        const need = answerers(s);
        if (need.every((id) => st.q.answers[id])) resolve(s);
        return true;
      }
      case "wbResolve": // nicht alle haben geantwortet: wer fragt (oder der Gastgeber) wertet mit den Antworten bisher aus
        if (st.step !== "answer" || (!mine && !isHost) || !Object.keys(st.q.answers).length) return false;
        resolve(s); return true;
      case "wbGuess": {
        if (st.step !== "ask" || !mine) return false;
        const t = String(a.text || "").trim().slice(0, 80);
        if (!t) return false;
        const p = data()[st.who[pid]];
        st.qn[pid]++;
        if (L().textMatches(p.n, t, p.alt, false)) { st.last = { kind: "guess", by: pid, text: t, ok: true }; solve(s, pid); nextTurn(s); }
        else { st.guess = { text: t }; st.step = "judge"; st.move++; }
        return true;
      }
      case "wbJudge": { // nicht erkannt: einer der anderen entscheidet
        if (st.step !== "judge" || mine || !st.seats.includes(pid)) return false;
        const ok = !!a.ok;
        st.last = { kind: "guess", by: st.turn, text: st.guess.text, ok, judge: pid };
        st.log[st.turn].push({ t: "Bin ich " + st.guess.text + "?", r: ok ? "ja" : "nein", guess: true });
        if (ok) solve(s, st.turn);
        nextTurn(s);
        return true;
      }
      case "wbGiveUp":
        if (st.step !== "ask" || !mine) return false;
        st.last = { kind: "giveup", by: pid };
        solve(s, pid, true); nextTurn(s);
        return true;
      case "wbEnd": // Gastgeber beendet das Spiel vorzeitig – alle Personen werden aufgedeckt
        if (!isHost || st.step === "final") return false;
        st.step = "final"; st.turn = null; st.q = null; st.guess = null; st.move++;
        return true;
    }
    return false;
  }

  const card = (i) => { const p = data()[i]; return p ? { n: p.n, b: p.b, g: p.g, geb: p.geb, tot: p.tot, ca: !!p.ca, fik: !!p.fik, aus: p.aus || "", land: p.land, beruf: p.beruf, f: p.f.slice() } : null; };
  // Personen der anderen (nie die eigene, solange sie nicht erraten ist) – nur an den jeweiligen Spieler
  function privateState(s, id) {
    const st = s.wer;
    if (!st) return null;
    const persons = {};
    st.seats.forEach((x) => { if (x !== id || st.solved[x] || st.step === "final") persons[x] = card(st.who[x]); });
    return { wer: true, move: st.move, persons };
  }

  // Platzierung: wer früher errät, ist vorn; Aufgeben und nicht Erratene danach (weniger Fragen = besser)
  function ranking(st) {
    return st.seats.map((id) => { const v = st.solved[id]; return { id, at: v && !v.gaveUp ? v.at : 0, gaveUp: !!(v && v.gaveUp), q: st.qn[id] }; })
      .sort((x, y) => ((x.at || 99) - (y.at || 99)) || (x.at ? 0 : x.q - y.q));
  }
  function publicState(s) {
    const st = s.wer;
    if (!st) return null;
    const fin = st.step === "final", revealed = {};
    st.seats.forEach((id) => { if (st.solved[id] || fin) revealed[id] = card(st.who[id]); });
    return {
      step: st.step, move: st.move, seats: st.seats.slice(), order: st.order.slice(), turn: st.turn, opts: { ...st.opts },
      themeName: THEMES[st.opts.theme].name,
      q: st.q ? { text: st.q.text, answers: { ...st.q.answers } } : null, need: st.step === "answer" ? answerers(s) : [],
      guess: st.guess ? { ...st.guess } : null, last: st.last ? { ...st.last } : null,
      solved: JSON.parse(JSON.stringify(st.solved)), qn: { ...st.qn }, log: JSON.parse(JSON.stringify(st.log)), revealed,
      hints: st.opts.hint === "bereich" ? Object.fromEntries(st.seats.map((id) => [id, data()[st.who[id]].b])) : null,
      ranking: fin ? ranking(st) : null,
    };
  }
  const names = (st) => st.seats.map((id) => data()[st.who[id]].n);

  root.S10Wer = { start, apply, tick, publicState, privateState, names, pool, THEMES, HINTS, ENDS };
})(typeof window !== "undefined" ? window : globalThis);
