// Reine Spiellogik – läuft beim Gastgeber (und in Node für Tests).
(function (root) {
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const range = (n) => Array.from({ length: n }, (_, i) => i);

  function newGame(cardCount) {
    return {
      phase: "lobby", target: 30, players: [], round: 0,
      deck: shuffle(range(cardCount)), deckPos: 0,
      cardIdx: null, perm: null, revealed: null,
      turn: 0, startPlayer: -1, log: [], lastEvent: null, evId: 0,
      roundResult: null, winners: null,
    };
  }

  function addPlayer(s, id, name) {
    let p = s.players.find((x) => x.id === id);
    if (p) { p.connected = true; if (name) p.name = name; return p; }
    p = { id, name: name || "Spieler", score: 0, roundPts: 0, status: s.phase === "playing" ? "out" : "active", waiting: s.phase === "playing", connected: true };
    s.players.push(p);
    event(s, "info", `${p.name} ist beigetreten${p.waiting ? " und spielt ab der nächsten Runde mit" : ""}.`);
    return p;
  }

  function setConnected(s, id, on) {
    const i = s.players.findIndex((x) => x.id === id);
    if (i < 0) return;
    if (!on && s.phase === "lobby") { event(s, "info", `${s.players[i].name} hat den Raum verlassen.`); s.players.splice(i, 1); return; }
    s.players[i].connected = on;
  }

  function event(s, kind, text) {
    s.evId++;
    s.lastEvent = { id: s.evId, kind, text };
    s.log.unshift(text);
    s.log.length = Math.min(s.log.length, 40);
  }

  // Fragen-Sets: beliebig kombinierbar (Karten ohne Markierung gehören zu „standard“)
  const SET_KEYS = ["standard", "suedtirol", "wirtschaft", "emoji", "winter", "film"];
  const SETS = { standard: "Standard", suedtirol: "Südtirol", wirtschaft: "Wirtschaft", emoji: "Emoji & Flaggen", winter: "Weihnachten & Winter", film: "Film & Serien" };
  // akzeptiert eine Liste, einen einzelnen Schlüssel oder das alte „mixed“
  function normSets(v) {
    if (v === "mixed") return SET_KEYS.slice();
    const arr = (Array.isArray(v) ? v : [v]).filter((k) => SETS[k]);
    return arr.length ? SET_KEYS.filter((k) => arr.includes(k)) : ["standard"];
  }
  const cardSetKey = (c) => c.set || "standard";
  const cardKey = (c) => c.q + "|" + c.items[0][0];
  function setIds(cards, sets) {
    const ss = normSets(sets);
    const ids = range(cards.length).filter((i) => ss.includes(cardSetKey(cards[i])));
    return ids.length ? ids : range(cards.length);
  }
  function unseenCount(cards, sets, seen) {
    const sn = new Set(seen || []);
    return setIds(cards, sets).filter((i) => !sn.has(cardKey(cards[i]))).length;
  }
  // Ungespielte Karten zuerst; sind alle durch, beginnt das Set von vorn
  function pool(s, cards) {
    const all = setIds(cards, s.cardSet);
    s.seen = s.seen || [];
    const seen = new Set(s.seen);
    let fresh = all.filter((i) => !seen.has(cardKey(cards[i])));
    if (!fresh.length) {
      const keys = new Set(all.map((i) => cardKey(cards[i])));
      s.seen = s.seen.filter((k) => !keys.has(k));
      fresh = all;
      event(s, "info", "Alle Karten dieses Sets wurden gespielt – es geht von vorn los.");
    }
    return shuffle(fresh.slice());
  }

  function startGame(s, cards, target, set) {
    const t = Math.round(Number(target));
    s.target = t >= 5 && t <= 100 ? t : 30;
    if (set !== undefined) s.cardSet = normSets(set);
    s.deck = pool(s, cards); s.deckPos = 0;
    s.players.forEach((p) => { p.score = 0; });
    s.round = 0; s.winners = null; s.startPlayer = -1;
    startRound(s, cards);
  }

  function startRound(s, cards) {
    if (s.deckPos >= s.deck.length) { s.deck = pool(s, cards); s.deckPos = 0; }
    s.cardIdx = s.deck[s.deckPos++];
    s.seen = s.seen || [];
    const key = cardKey(cards[s.cardIdx]);
    if (!s.seen.includes(key)) s.seen.push(key);
    s.undo = null; s.undoReq = null;
    s.perm = shuffle(range(cards[s.cardIdx].items.length));
    s.revealed = s.perm.map(() => null);
    s.round++;
    s.roundResult = null; s.pending = null;
    s.players.forEach((p) => { p.roundPts = 0; p.status = "active"; p.waiting = false; });
    s.startPlayer = (s.startPlayer + 1) % s.players.length;
    s.turn = s.startPlayer;
    s.phase = "playing";
    event(s, "info", `Runde ${s.round}: ${s.players[s.turn].name} beginnt.`);
  }

  function unitStr(card) {
    const u = card.unit || "";
    return u && /^[A-Za-zÄÖÜäöü]/.test(u) ? " " + u : u;
  }

  function fmt(card, a) {
    if (card.type === "tf") return a ? "✓ trifft zu" : "✗ trifft nicht zu";
    if (card.type === "decade") return typeof a === "number" ? `${a}er` : String(a);
    if (card.type === "rank") return "Platz " + a;
    if (card.type === "estimate") return Number(a).toLocaleString("de-DE", { maximumFractionDigits: 3 }) + unitStr(card);
    if (card.type === "num") return String(a).replace(".", ",") + unitStr(card);
    return String(a);
  }

  // ---------- Zahlen verstehen: "1.500", "1,5 Mio", "drei" … ----------
  const NUM_WORDS = { null: 0, eins: 1, ein: 1, eine: 1, zwei: 2, drei: 3, vier: 4, fuenf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10,
    elf: 11, zwoelf: 12, dreizehn: 13, vierzehn: 14, fuenfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19, zwanzig: 20,
    dreissig: 30, vierzig: 40, fuenfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90, hundert: 100, einhundert: 100, tausend: 1000, eintausend: 1000 };
  const MULT = [[/^(mio|millionen|million)\.?$/, 1e6], [/^(mrd|milliarden|milliarde)\.?$/, 1e9], [/^(tsd|tausend|k)\.?$/, 1e3]];
  // Liefert alle sinnvollen Lesarten (z. B. "42.195" = 42,195 oder 42195)
  function parseNumCandidates(value) {
    let t = String(value == null ? "" : value).trim().toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[−–]/g, "-");
    if (!t) return [];
    if (NUM_WORDS[t] != null) return [NUM_WORDS[t]];
    const m = /^(-?[\d.,' ]*\d[\d.,' ]*)\s*([a-z.]*)$/.exec(t);
    if (!m) return [];
    let mult = 1;
    if (m[2]) { const hit = MULT.find(([re]) => re.test(m[2])); if (!hit) return []; mult = hit[1]; }
    const raw = m[1].replace(/[' ]/g, "");
    const out = [];
    const add = (str) => { const x = Number(str); if (str !== "" && Number.isFinite(x)) { const v = Number((x * mult).toPrecision(12)); if (!out.includes(v)) out.push(v); } };
    if (raw.includes(",")) add(raw.replace(/\./g, "").replace(",", "."));
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) { add(raw.replace(/\./g, "")); if ((raw.match(/\./g) || []).length === 1) add(raw); }
    else add(raw);
    return out;
  }

  // ---------- Jahrzehnte: "80er", "1980er", "1985", "Achtziger" ----------
  const DEC_WORDS = { zwanziger: 20, dreissiger: 30, vierziger: 40, fuenfziger: 50, sechziger: 60, siebziger: 70, achtziger: 80, neunziger: 90, nuller: 0 };
  function parseDecade(value) {
    const t = String(value == null ? "" : value).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
    let m = /(\d{4})/.exec(t);
    if (m) return { full: Math.floor(Number(m[1]) / 10) * 10 };
    m = /(^|\D)(\d{2})(\D|$)/.exec(t);
    if (m) return { two: Math.floor(Number(m[2]) / 10) * 10 };
    for (const w in DEC_WORDS) if (t.includes(w)) return { two: DEC_WORDS[w] };
    return null;
  }
  function decadeMatches(a, d) { return d.full != null ? d.full === a : d.two === a % 100; }

  function normalize(card, value) {
    if (card.type === "tf") return value === true ? true : null; // man wählt nur, was man für zutreffend hält
    if (card.type === "num" || card.type === "rank" || card.type === "estimate") {
      const c = parseNumCandidates(value);
      return c.length ? c : null;
    }
    const t = String(value == null ? "" : value).trim().slice(0, 60);
    if (!t) return null;
    if (card.type === "decade" && !parseDecade(t)) return null;
    return t;
  }

  // ---------- Freitext-Prüfung ----------
  function norm(x) {
    return String(x).toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  }
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    // Damerau-Levenshtein: vertauschte Nachbarbuchstaben zählen als ein Fehler
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    return d[a.length][b.length];
  }
  function variants(answer, extra, names) {
    const list = [answer, ...((root.SCHLAU10_ALIASES || {})[answer] || []), ...(extra || [])];
    const m = /^(\d+)\. Jh\.$/.exec(answer); // Jahrhunderte: "18", "18. Jahrhundert", "1700er" …
    if (m) { const n = Number(m[1]); list.push(`${n}`, `${n} jh`, `${n} jahrhundert`, `${n - 1}00er`, `${n - 1}00er jahre`); }
    if (names) { // Personen: Nachname reicht
      list.slice().forEach((x) => { const w = String(x).trim().split(/\s+/); if (w.length > 1 && w[w.length - 1].length >= 3) list.push(w[w.length - 1]); });
    }
    return list.map(norm);
  }
  function textMatches(answer, given, extra, names) {
    const g = norm(given);
    if (!g) return false;
    return variants(answer, extra, names).some((v) => {
      if (v === g) return true;
      if (/\d/.test(v) || /\d/.test(g)) return false;       // Zahlen müssen exakt stimmen
      const tol = v.length >= 9 ? 2 : v.length >= 5 ? 1 : 0; // kleine Tippfehler verzeihen
      return tol > 0 && lev(v, g) <= tol;
    });
  }

  function answer(s, cards, pos, value) {
    const card = cards[s.cardIdx];
    if (!Number.isInteger(pos) || pos < 0 || pos >= s.perm.length || s.revealed[pos]) return false;
    const v = normalize(card, value);
    if (v === null) return false;
    const item = card.items[s.perm[pos]];
    const p = s.players[s.turn];
    if (card.type === "choice" && !textMatches(item[1], v, item[2], card.names)) {
      // Nicht automatisch erkannt -> die Mitspieler entscheiden
      s.pending = { pos, by: p.id, given: v };
      event(s, "info", `${p.name} sagt bei „${item[0]}“: „${v}“ – Lösung: ${item[1]}. Zählt das?`);
      return true;
    }
    let ok = true, given = v;
    if (card.type === "tf") ok = item[1] === true;
    else if (Array.isArray(v)) { // num / rank / estimate
      const tol = card.type === "estimate" ? (card.tol != null ? card.tol : 0.1) * Math.abs(item[1]) : 0;
      const hit = v.find((x) => Math.abs(x - item[1]) <= tol + 1e-9);
      ok = hit !== undefined; given = ok ? hit : v[0];
    } else if (card.type === "decade") ok = decadeMatches(item[1], parseDecade(v));
    resolve(s, cards, pos, given, ok, null);
    return true;
  }

  function judges(s) {
    const pend = s.pending;
    const others = s.players.filter((p) => p.id !== pend.by && p.connected);
    return others.length ? others.map((p) => p.id) : [pend.by]; // niemand sonst da -> selbst entscheiden
  }

  function resolve(s, cards, pos, v, ok, note) {
    note = note || "";
    const card = cards[s.cardIdx];
    const item = card.items[s.perm[pos]];
    const p = s.players[s.turn];
    s.revealed[pos] = { by: p.id, ok, given: v };
    if (ok) {
      p.roundPts++;
      event(s, "ok", card.type === "tf"
        ? `${p.name}: „${item[0]}“ trifft zu ✓ (+1, jetzt ${p.roundPts})`
        : `${p.name}: „${item[0]}“ → ${fmt(card, v)} ✓${card.type === "estimate" || card.type === "decade" ? ` (genau: ${fmt(card, item[1])})` : ""}${note} (+1, jetzt ${p.roundPts})`);
    } else {
      const lost = p.roundPts;
      p.roundPts = 0; p.status = "out";
      event(s, "bad", (card.type === "tf"
        ? `${p.name}: „${item[0]}“ trifft NICHT zu ✗`
        : `${p.name}: „${item[0]}“ → ${fmt(card, v)} ✗ richtig wäre ${fmt(card, item[1])}${note}`) + (lost ? ` – ${lost} Punkt${lost > 1 ? "e" : ""} verloren` : ""));
    }
    advance(s, cards);
  }

  function pass(s, cards, skipped) {
    const p = s.players[s.turn];
    p.status = "passed";
    event(s, "pass", skipped ? `${p.name} wurde übersprungen (sichert ${p.roundPts}).` : `${p.name} passt und sichert ${p.roundPts} Punkt${p.roundPts === 1 ? "" : "e"}.`);
    advance(s, cards);
  }

  function advance(s, cards) {
    if (s.revealed.every(Boolean)) return endRound(s);
    // Ja/Nein-Karte: sind alle zutreffenden Antworten gefunden, ist die Runde vorbei
    const card = cards && cards[s.cardIdx];
    if (card && card.type === "tf" && s.perm.every((oi, pos) => !card.items[oi][1] || s.revealed[pos])) {
      event(s, "info", "Alle zutreffenden Antworten sind gefunden!");
      return endRound(s);
    }
    const n = s.players.length;
    for (let k = 1; k <= n; k++) {
      const i = (s.turn + k) % n;
      if (s.players[i].status === "active") { s.turn = i; return; }
    }
    endRound(s);
  }

  function endRound(s) {
    s.roundResult = s.players.map((p) => {
      const gained = p.status === "out" ? 0 : p.roundPts;
      p.score += gained;
      return { id: p.id, gained };
    });
    const max = Math.max(...s.players.map((p) => p.score));
    if (max >= s.target) {
      s.winners = s.players.filter((p) => p.score === max).map((p) => p.id);
      s.phase = "gameOver";
      event(s, "info", `Spielende! ${s.players.filter((p) => s.winners.includes(p.id)).map((p) => p.name).join(" & ")} gewinnt mit ${max} Punkten.`);
    } else {
      s.phase = "roundEnd";
      event(s, "info", `Runde ${s.round} beendet.`);
    }
  }

  // ---------- Einspruch: letzten Zug zurücknehmen oder Wertung umdrehen ----------
  function snapshot(s) {
    return JSON.parse(JSON.stringify({
      players: s.players.map((p) => ({ id: p.id, score: p.score, roundPts: p.roundPts, status: p.status, waiting: !!p.waiting })),
      revealed: s.revealed, turn: s.turn, phase: s.phase, roundResult: s.roundResult, winners: s.winners,
    }));
  }
  function undoApprovers(s) {
    const req = s.undoReq;
    return req ? s.players.filter((p) => p.id !== req.by && p.connected && !p.waiting).map((p) => p.id) : [];
  }
  function applyUndo(s, cards) {
    const { snap, move } = s.undo, kind = s.undoReq ? s.undoReq.kind : "undo";
    snap.players.forEach((q) => { const p = s.players.find((x) => x.id === q.id); if (p) Object.assign(p, q); });
    s.revealed = snap.revealed; s.turn = snap.turn; s.phase = snap.phase;
    s.roundResult = snap.roundResult; s.winners = snap.winners; s.pending = null;
    s.undo = null; s.undoReq = null;
    if (kind === "flip") {
      event(s, "info", "Einspruch angenommen – die Wertung wird umgedreht.");
      resolve(s, cards, move.pos, move.given, !move.ok, " (nach Einspruch)");
    } else {
      event(s, "info", `Einspruch angenommen – der Zug „${move.text}“ ist zurückgenommen. ${s.players[s.turn].name} ist wieder dran.`);
    }
  }

  function applyAction(s, cards, pid, a, isHost) {
    if (!a || typeof a !== "object") return false;
    const cur = s.players[s.turn];
    const myTurn = s.phase === "playing" && cur && cur.id === pid && !s.pending && !s.undoReq;
    switch (a.type) {
      case "start":
        if (!isHost || s.phase !== "lobby" || s.players.length < 1) return false;
        startGame(s, cards, a.target, a.set); return true;
      case "answer": {
        if (!myTurn) return false;
        const sn = snapshot(s);
        if (!answer(s, cards, a.pos, a.value)) return false;
        const r = s.revealed[a.pos];
        s.undo = { snap: sn, by: pid, move: r ? { type: "answer", pos: a.pos, given: r.given, ok: r.ok, text: s.lastEvent.text } : null };
        return true;
      }
      case "pass": {
        if (!myTurn) return false;
        const sn = snapshot(s);
        pass(s, cards, false);
        s.undo = { snap: sn, by: pid, move: { type: "pass", text: s.lastEvent.text } };
        return true;
      }
      case "undoReq": {
        if (!["playing", "roundEnd", "gameOver"].includes(s.phase) || s.pending || s.undoReq || !s.undo || !s.undo.move) return false;
        if (!s.players.some((p) => p.id === pid)) return false;
        const kind = a.kind === "flip" && s.undo.move.type === "answer" ? "flip" : "undo";
        s.undoReq = { by: pid, kind };
        const who = s.players.find((p) => p.id === pid).name;
        if (!undoApprovers(s).length) { applyUndo(s, cards); return true; }
        event(s, "info", `${who} erhebt Einspruch: ${kind === "flip" ? "Wertung umdrehen" : "Zug zurücknehmen"} – „${s.undo.move.text}“`);
        return true;
      }
      case "undoVote": {
        if (!s.undoReq || !undoApprovers(s).includes(pid)) return false;
        if (a.accept === true) applyUndo(s, cards);
        else { const j = s.players.find((p) => p.id === pid); s.undoReq = null; event(s, "info", `${j ? j.name : "?"} lehnt den Einspruch ab.`); }
        return true;
      }
      case "judge": {
        if (s.phase !== "playing" || !s.pending || !judges(s).includes(pid)) return false;
        const { pos, given } = s.pending; s.pending = null;
        const j = s.players.find((p) => p.id === pid);
        const ok = a.accept === true;
        resolve(s, cards, pos, given, ok, ` (${j ? j.name : "?"} sagt: ${ok ? "zählt" : "zählt nicht"})`);
        if (s.undo) s.undo.move = { type: "answer", pos, given, ok, text: s.lastEvent.text };
        return true;
      }
      case "skip":
        if (!isHost || s.phase !== "playing" || s.pending) return false;
        pass(s, cards, true); return true;
      case "next":
        if (s.phase !== "roundEnd" || s.undoReq) return false;
        startRound(s, cards); return true;
      case "restart":
        if (s.phase !== "gameOver" || s.undoReq) return false;
        startGame(s, cards, s.target); return true;
      case "lobby":
        if (!isHost) return false;
        s.phase = "lobby"; s.cardIdx = null; s.winners = null; s.pending = null; s.undo = null; s.undoReq = null;
        s.players = s.players.filter((p) => p.connected);
        s.players.forEach((p) => { p.score = 0; p.roundPts = 0; p.status = "active"; });
        return true;
    }
    return false;
  }

  function publicState(s, cards, code) {
    const out = {
      code, hostId: s.hostId || (s.players[0] && s.players[0].id), phase: s.phase, target: s.target, round: s.round, turn: s.turn,
      players: s.players.map((p) => ({ ...p })), lastEvent: s.lastEvent, log: s.log.slice(0, 15),
      roundResult: s.roundResult, winners: s.winners, card: null, cardSet: normSets(s.cardSet || "standard"),
      pending: s.phase === "playing" && s.pending ? { ...s.pending, judges: judges(s) } : null,
      undo: s.phase !== "lobby" && s.undo && s.undo.move && !s.pending ? { by: s.undo.by, text: s.undo.move.text, canFlip: s.undo.move.type === "answer" } : null,
      undoReq: s.undoReq ? { ...s.undoReq, approvers: undoApprovers(s) } : null,
    };
    if (s.cardIdx != null && s.phase !== "lobby") {
      const c = cards[s.cardIdx];
      const showAll = s.phase !== "playing";
      out.card = {
        q: c.q, type: c.type, set: cardSetKey(c), emoji: !!c.emoji, unit: c.unit || "", hint: c.hint || "", tol: c.type === "estimate" ? (c.tol != null ? c.tol : 0.1) : null,
        items: s.perm.map((oi, pos) => {
          const it = c.items[oi], r = s.revealed[pos];
          const pend = out.pending && out.pending.pos === pos ? { by: out.pending.by, ok: null, pending: true, given: out.pending.given, a: it[1] } : null;
          return { t: it[0], r: r ? { by: r.by, ok: r.ok, given: r.given, a: it[1] } : pend || (showAll ? { by: null, ok: null, a: it[1] } : null) };
        }),
      };
    }
    return out;
  }

  root.S10Logic = { newGame, addPlayer, setConnected, applyAction, publicState, fmt, textMatches, parseNumCandidates, parseDecade, cardKey, unseenCount, normSets, SET_KEYS };
})(typeof window !== "undefined" ? window : globalThis);
