// Watten-Karten (eigenes Südtiroler Blatt) als SVG – gezeichnet im Code, keine Bilddateien.
(function (root) {
  const SUITS = {
    herz:    { name: "Herz",    color: "#d63a3a" },
    schelle: { name: "Schelle", color: "#e0a417" },
    laub:    { name: "Laub",    color: "#3f9a4c" },
    eichel:  { name: "Eichel",  color: "#8a5a2b" },
  };
  // Farbsymbole (eigene Zeichnungen), Mittelpunkt 0,0, ca. 28 breit
  function sym(suit, x, y, s = 1, rot = 0, noStem = false) {
    const t = `transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"`;
    if (suit === "herz") return `<g ${t}><path d="M0 11 C-14 1 -15 -8 -8 -11 C-4 -12.5 -1 -10 0 -7 C1 -10 4 -12.5 8 -11 C15 -8 14 1 0 11Z" fill="#d63a3a" stroke="#8f1f1f" stroke-width="1.2"/><path d="M-8 -6 C-6 -9 -3 -8 -3 -6" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
    if (suit === "schelle") return `<g ${t}><g transform="rotate(180)"><circle cx="0" cy="1" r="10.5" fill="#f2b51d" stroke="#8a5c00" stroke-width="1.2"/><path d="M-10.3 -1.5 H10.3" stroke="#8a5c00" stroke-width="2.4"/><path d="M-10 3 H10" stroke="#8a5c00" stroke-width="1"/><circle cx="0" cy="7" r="2" fill="#5a3c00"/><path d="M0 7 V11" stroke="#5a3c00" stroke-width="1.4"/><path d="M-2.5 -10 Q0 -14 2.5 -10" stroke="#8a5c00" stroke-width="1.6" fill="none"/><circle cx="-4.5" cy="-4.5" r="2" fill="#fff" fill-opacity=".5"/></g></g>`;
    if (suit === "laub") return `<g ${t}><path d="M0 -13 C5 -8 14 -3 13.5 3.5 C13 9 6.5 10.5 0 6.5 C-6.5 10.5 -13 9 -13.5 3.5 C-14 -3 -5 -8 0 -13Z" fill="#45a852" stroke="#1f5e2a" stroke-width="1.2"/><path d="M0 -10 V${noStem ? 6 : 14}" stroke="#1f5e2a" stroke-width="1.6" stroke-linecap="round"/><path d="M0 -4 L5 -7 M0 1 L8 -1 M0 -4 L-5 -7 M0 1 L-8 -1" stroke="#1f5e2a" stroke-width="1"/><path d="M-6 -2 C-5 -5 -3 -7 -1 -8" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`;
    if (suit === "eichel") return `<g ${t}><ellipse cx="0" cy="4" rx="7.5" ry="9" fill="#e0b062" stroke="#7a4f1d" stroke-width="1.2"/><path d="M-10 -1 C-10 -9 10 -9 10 -1 C6 1 -6 1 -10 -1Z" fill="#8a5a2b" stroke="#5a3712" stroke-width="1.2"/><path d="M-6 -5 L-3 -2 M-2 -6 L1 -2 M2 -6 L5 -2 M-6 -2 L-3 -6 M-2 -2 L1 -6 M2 -2 L5 -6" stroke="#5a3712" stroke-width=".8"/>${noStem ? "" : `<path d="M0 -8 V-13" stroke="#5a3712" stroke-width="2" stroke-linecap="round"/>`}<ellipse cx="-3" cy="5" rx="1.6" ry="3" fill="#fff" fill-opacity=".45"/></g>`;
  }
  const W = 120, H = 190;
  const frame = (inner) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="11" fill="#fbf6ea" stroke="#d8ccb0" stroke-width="1.5"/>
    <rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="7" fill="none" stroke="#e7dcc3" stroke-width="1"/>${inner}</svg>`;
  // Eckzeichen: Wert (und auf Wunsch kleines Farbsymbol darunter); mirror = auch unten rechts auf dem Kopf
  const SHOW_CORNER = false; // Südtiroler Karten: keine kleine Beschriftung in den Ecken
  const corner = (label, suit, color, mirror = false, small = true) => {
    if (!SHOW_CORNER) return ""; // Südtiroler Karten: kein gespiegeltes Zeichen unten rechts
    const one = `<text x="12" y="25" font-family="Fredoka, sans-serif" font-weight="700" font-size="${label.length > 2 ? 12 : 17}" fill="${color}">${label}</text>${small ? sym(suit, 18, 37, .5) : ""}`;
    return one + (mirror ? `<g transform="rotate(180 ${W / 2} ${H / 2})">${one}</g>` : "");
  };
  const L = 35, R = 85; // ohne Eckbeschriftung: ganze Kartenfläche nutzen
  const PIPS = {
    6: [[L, 36], [R, 36], [L, 76], [R, 76], [L, 154], [R, 154]],
    // Siebener: wie der Achter, aber oben nur ein Symbol in der Mitte
    7: [[60, 34], [L, 76], [R, 76], [L, 116], [R, 116], [L, 156], [R, 156]],
    8: [[L, 34], [R, 34], [L, 74], [R, 74], [L, 115], [R, 115], [L, 156], [R, 156]],
    // Neuner: drei Spalten mit je drei Symbolen, die mittlere Spalte etwas höher
    9: [[24, 54], [24, 103], [24, 152], [60, 38], [60, 87], [60, 136], [96, 54], [96, 103], [96, 152]],
    // Zehner: außen wie beim Neuner je drei, in der Mitte vier
    10: [[24, 76], [24, 117], [24, 158], [60, 60], [60, 93], [60, 126], [60, 159], [96, 76], [96, 117], [96, 158]],
  };
  const PIP = 1.15; // alle Symbole auf Zahlenkarten gleich groß (dürfen sich berühren)
  const PIP_SCALE = { 6: PIP, 7: PIP, 8: PIP, 9: PIP, 10: PIP };
  // Symbole, die in einer Spalte übereinander stehen, berühren sich: Abstand = Symbolhöhe
  const PIP_H = { herz: 24, schelle: 25, laub: 27, eichel: 22 }; // Höhe bei Größe 1 (Laub/Eichel quer gedreht)
  function stackLayout(suit, n) {
    const d = PIP_H[suit] * PIP, LE = suit === "laub" || suit === "eichel";
    const col = (x, rows, cy, from = 0) => rows.map((r) => [x, cy + (r - from) * d]);
    const rng = (a, b, step = 1) => { const o = []; for (let r = a; r <= b + 1e-9; r += step) o.push(r); return o; };
    const at = (k, cy) => (r) => cy + (r - (k - 1) / 2) * d; // k Reihen um cy zentriert
    if (n === 7 || n === 8 || (LE && n === 9)) {
      const k = n === 8 ? 4 : n === 7 ? 4 : 5, y = at(k, 96);
      const out = [];
      if (n !== 8) out.push([60, y(0)]);
      rng(n === 8 ? 0 : 1, k - 1).forEach((r) => out.push([L, y(r)], [R, y(r)]));
      return out;
    }
    if (LE && n === 10) { const y = at(5, 96); return rng(0, 4).flatMap((r) => [[L, y(r)], [R, y(r)]]); }
    if (n === 9) { // drei Spalten zu drei, Mitte etwas höher
      const y = at(3, 96);
      return [...[0, 1, 2].map((r) => [24, y(r) + d * .35]), ...[0, 1, 2].map((r) => [60, y(r) - d * .35]), ...[0, 1, 2].map((r) => [96, y(r) + d * .35])];
    }
    if (n === 10) { // außen drei, Mitte vier, unter dem X
      const ym = at(4, 112), yo = at(3, 112);
      return [...[0, 1, 2].map((r) => [24, yo(r)]), ...[0, 1, 2, 3].map((r) => [60, ym(r)]), ...[0, 1, 2].map((r) => [96, yo(r)])];
    }
    return PIPS[n];
  }
  function numberCard(suit, n) {
    const c = SUITS[suit].color;
    // Zehner: kein Eckzeichen, dafür ein großes schwarzes X oben in der Mitte
    const mark = n === 10 ? `<text x="60" y="40" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="32" fill="#1d1a14">X</text>` : corner(String(n), suit, c, false, false);
    // Laub und Eichel: Neuner wie der Siebener (oben eins in der Mitte), aber zwei Spalten mit je vier
    const nineLE = n === 9 && (suit === "laub" || suit === "eichel");
    // Laub und Eichel: Zehner wie der Achter, aber zwei Spalten mit je fünf
    const tenLE = n === 10 && (suit === "laub" || suit === "eichel");
    const pips = stackLayout(suit, n);
    // Laub und Eichel: Stiel immer zur Kartenmitte (Laub-Stiel unten, Eichel-Stiel oben am Symbol)
    const inward = (x) => {
      if (suit === "eichel" && x === 60 && (n === 7 || n === 9)) return 180; // obere Eichel mit Stiel nach unten
      if (suit !== "laub" && suit !== "eichel" || x === 60) return 0;
      const left = x < 60;
      return suit === "laub" ? (left ? -90 : 90) : (left ? 90 : -90);
    };
    // Laub und Eichel: alle Stiele laufen in der Mitte zu einem Ast zusammen, der nach unten weggeht
    let branch = "";
    if (suit === "laub" || suit === "eichel") {
      const col = suit === "laub" ? "#1f5e2a" : "#5a3712", top = Math.min(...pips.map(([, y]) => y)) + (n === 10 ? 6 : 0);
      branch = `<path d="M60 ${top} V182" stroke="${col}" stroke-width="2.8" stroke-linecap="round"/>` +
        pips.filter(([x]) => x !== 60).map(([x, y]) => `<path d="M${x} ${y} Q${(x + 60) / 2} ${y + 2} 60 ${y + 6}" stroke="${col}" stroke-width="1.6" fill="none"/>`).join("");
    }
    // Schelle: die Schellen hängen an Lederriemen mit Schnalle; Herz: die Herzen hängen an einem roten Band mit Masche
    if (suit === "schelle" || suit === "herz") {
      const d = PIP_H[suit] * PIP, cols = {};
      pips.forEach(([x, y]) => (cols[x] = cols[x] || []).push(y));
      branch = Object.entries(cols).map(([xs, ys]) => {
        const x = Number(xs), top = Math.min(...ys) - d / 2 - 7, bot = Math.max(...ys) + d / 2 + (suit === "schelle" ? 3 : -4);
        if (suit === "schelle") return `<rect x="${x - 3.2}" y="${top}" width="6.4" height="${bot - top}" rx="2" fill="#8a5a2b" stroke="#4a2e12" stroke-width=".8"/>
          <path d="M${x} ${top + 2} V${bot - 2}" stroke="#c9955a" stroke-width=".7" stroke-dasharray="2 2"/>
          <rect x="${x - 4.8}" y="${top - 3}" width="9.6" height="6" rx="1.4" fill="none" stroke="#d9a520" stroke-width="1.6"/><path d="M${x} ${top - 3} V${top + 3}" stroke="#d9a520" stroke-width="1.2"/>`;
        return `<path d="M${x} ${top} V${bot}" stroke="#b5303a" stroke-width="1.3"/>
          <path d="M${x} ${top} q-6 -5 -7 -1 q0 4 7 1 q6 -5 7 -1 q0 4 -7 1 M${x} ${top} l-3 6 M${x} ${top} l3 6" stroke="#b5303a" stroke-width="1.3" fill="#e05a64" stroke-linejoin="round" stroke-linecap="round"/>`;
      }).join("");
    }
    return frame(mark + branch + pips.map(([x, y]) => sym(suit, x, y, PIP, inward(x), !!branch && (suit === "laub" || suit === "eichel"))).join(""));
  }
  // Bildkarten: König sitzt auf dem Thron, Ober und Unter stehen.
  // Großes Farbsymbol: König und Ober links oben, Unter links unten.
  function face(suit, kind) {
    const c = SUITS[suit].color, ink = "#3a2a10", skin = "#f3d2b0", pants = "#5a4632";
    const panel = `<rect x="20" y="42" width="80" height="106" rx="8" fill="${c}" fill-opacity=".08" stroke="${c}" stroke-opacity=".3"/>`;
    const face = (cx, cy) => `
      <circle cx="${cx}" cy="${cy}" r="9.5" fill="${skin}" stroke="${ink}" stroke-width="1.1"/>
      <circle cx="${cx - 3.3}" cy="${cy - 1}" r="1.2" fill="${ink}"/><circle cx="${cx + 3.3}" cy="${cy - 1}" r="1.2" fill="${ink}"/>
      <path d="M${cx - 3.5} ${cy + 4} Q${cx} ${cy + 6.5} ${cx + 3.5} ${cy + 4}" stroke="${ink}" stroke-width="1" fill="none"/>`;
    let fig = "";
    if (kind === "K") {
      // Sitzender König auf dem Thron – direkt in Kartenmaßen gezeichnet (nicht verzerrt), links oben bleibt Platz für das Farbsymbol
      const x = 74;
      fig = `
        <path d="M46 150 V54 Q46 34 66 32 H82 Q102 34 102 54 V150Z" fill="#6b4423" stroke="#3f2610" stroke-width="1.4"/>
        <path d="M52 146 V58 Q52 40 68 39 H80 Q96 40 96 58 V146Z" fill="#3a3478"/><path d="M58 142 V60 Q58 46 70 45 H78 Q90 46 90 60 V142" fill="none" stroke="#ffc83d" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="2 3"/>
        <circle cx="74" cy="31" r="4" fill="#ffc83d" stroke="#a37400" stroke-width="1"/>
        <rect x="42" y="124" width="64" height="12" rx="4" fill="#6e4520" stroke="#5a3712" stroke-width="1.2"/>
        <path d="M28 163.5 L38 149 H100 L106 163.5Z" fill="${c}" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>
        <path d="M33 160 L40 152.5 H98 L102 160Z" fill="none" stroke="#ffc83d" stroke-width="1" stroke-opacity=".8"/>
        <g fill="#ffc83d">${[32, 42, 52, 62, 72, 82, 92, 102].map((fx) => `<rect x="${fx - 1}" y="163" width="2" height="2.4" rx=".6"/>`).join("")}</g>
        <rect x="29" y="106" width="6" height="44" rx="2" fill="#6b4423" stroke="#3f2610" stroke-width="1.1"/>
        <path d="M27 104 H52 V111 H27 Q25 107.5 27 104Z" fill="#6b4423" stroke="#3f2610" stroke-width="1.1"/>
        <path d="M27 105.2 H51" stroke="#a87440" stroke-width="1"/>
        <circle cx="31" cy="101" r="5" fill="#ffc83d" stroke="#a37400" stroke-width="1"/>
        <path d="M27.4 98.5 Q31 95.5 34.6 98.5 Q35.8 102 34 104.5 M27.4 98.5 Q26.2 102 28 104.5" fill="none" stroke="#a37400" stroke-width=".8"/>
        <circle cx="29.6" cy="100.5" r=".7" fill="#5a3712"/><circle cx="32.4" cy="100.5" r=".7" fill="#5a3712"/><path d="M30 103 Q31 103.8 32 103" stroke="#5a3712" stroke-width=".6" fill="none"/>
        <rect x="99" y="106" width="5" height="44" rx="2" fill="#6b4423" stroke="#3f2610" stroke-width="1.1"/>
        <path d="M96 104 H105 Q106.5 107.5 105 111 H96Z" fill="#6b4423" stroke="#3f2610" stroke-width="1.1"/>
        <path d="M${x - 19} 128 C${x - 21} 100 ${x - 14} 88 ${x} 86 C${x + 14} 88 ${x + 21} 100 ${x + 19} 128Z" fill="${c}" stroke="${ink}" stroke-width="1.3"/>
        <path d="M${x} 88 V128" stroke="#fff" stroke-opacity=".35" stroke-width="2.4"/>
        <path d="M${x - 19} 124 Q${x} 132 ${x + 19} 124 L${x + 19} 129 Q${x} 137 ${x - 19} 129Z" fill="#f4efe4" stroke="#9a8f78" stroke-width=".8"/>
        <g fill="#2a1d10">${[-13, -5, 3, 11].map((d) => `<circle cx="${x + d}" cy="${130 + (Math.abs(d) < 6 ? 2 : 0)}" r="1"/>`).join("")}</g>
        <path d="M${x - 12} 89 Q${x} 98 ${x + 12} 89" fill="none" stroke="#f4efe4" stroke-width="4" stroke-linecap="round"/>
        <rect x="${x - 12}" y="134" width="9" height="26" rx="3" fill="${pants}"/><rect x="${x + 3}" y="134" width="9" height="26" rx="3" fill="${pants}"/>
        <rect x="${x - 15}" y="159" width="13" height="6" rx="3" fill="#2a1d10"/><rect x="${x + 2}" y="159" width="13" height="6" rx="3" fill="#2a1d10"/>
        <path d="M${x + 15} 100 Q${x + 22} 106 ${x + 24} 112" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <circle cx="${x + 24}" cy="113" r="3.4" fill="${skin}" stroke="${ink}" stroke-width=".9"/>
        <path d="M${x + 25} 70 V126" stroke="#a37400" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="${x + 25}" cy="68" r="4.2" fill="#ffc83d" stroke="#a37400" stroke-width="1.1"/>
        <path d="M${x - 15} 96 Q${x - 28} 100 ${x - 35} 96" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M${x - 15} 96 Q${x - 28} 100 ${x - 35} 96" stroke="${ink}" stroke-opacity=".3" stroke-width=".8" fill="none"/>
        <circle cx="${x - 37}" cy="88" r="6" fill="#ffc83d" stroke="#a37400" stroke-width="1.1"/>
        <path d="M${x - 43} 88 H${x - 31} M${x - 37} 88 V94" stroke="#a37400" stroke-width=".8"/>
        <path d="M${x - 37} 82 V78 M${x - 39} 79.8 H${x - 35}" stroke="#a37400" stroke-width="1.3" stroke-linecap="round"/>
        <circle cx="${x - 36.5}" cy="95.5" r="3.4" fill="${skin}" stroke="${ink}" stroke-width=".9"/>
        <circle cx="${x}" cy="70" r="13" fill="${skin}" stroke="${ink}" stroke-width="1.3"/>
        <circle cx="${x - 4.5}" cy="68" r="1.5" fill="${ink}"/><circle cx="${x + 4.5}" cy="68" r="1.5" fill="${ink}"/>
        <path d="M${x - 3} 72.5 Q${x} 74 ${x + 3} 72.5" stroke="#c98d6e" stroke-width="1.2" fill="none"/>
        <path d="M${x - 10} 73 Q${x - 9} 90 ${x} 92 Q${x + 9} 90 ${x + 10} 73 Q${x + 6} 79 ${x} 79 Q${x - 6} 79 ${x - 10} 73Z" fill="#ece5d6" stroke="#9a8f78" stroke-width=".9"/>
        <path d="M${x - 4} 76.5 Q${x} 75 ${x + 4} 76.5" stroke="#9a8f78" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M${x - 13} 60 L${x - 11} 46 L${x - 5} 53 L${x} 43 L${x + 5} 53 L${x + 11} 46 L${x + 13} 60Z" fill="#ffc83d" stroke="#a37400" stroke-width="1.2" stroke-linejoin="round"/>
        <rect x="${x - 13}" y="57" width="26" height="4.5" rx="1.5" fill="#e0a417" stroke="#a37400" stroke-width=".9"/>
        <circle cx="${x}" cy="59.3" r="1.6" fill="${c}"/><circle cx="${x - 7}" cy="59.3" r="1.2" fill="#fff"/><circle cx="${x + 7}" cy="59.3" r="1.2" fill="#fff"/>`;
    } else {
      // stehende Figur: Ober mit Federhut, Unter mit Kappe
      const x = 68;
      const hat = kind === "O"
        // Ober: Tiroler Filzhut – hohe, eingedellte Krone, breite Krempe, Hutband in der Kartenfarbe, Gamsbart und Feder
        ? `<path d="M${x + 5} 55.5 Q${x + 13} 50 ${x + 19} 46 Q${x + 15} 52 ${x + 7.5} 56.5Z" fill="#fff" stroke="#b9ad92" stroke-width=".8"/>
           <path d="M${x + 7} 55.6 Q${x + 13} 51.2 ${x + 17.5} 47.4" stroke="#b9ad92" stroke-width=".5" fill="none"/>
           <path d="M${x - 7.5} 58.5 L${x - 6.5} 49.5 Q${x - 6} 46.6 ${x - 2.5} 47 Q${x} 49.4 ${x + 2.5} 47 Q${x + 6} 46.6 ${x + 6.5} 49.5 L${x + 7.5} 58.5Z" fill="#33402b" stroke="${ink}" stroke-width="1"/>
           <path d="M${x - 2.6} 47.4 Q${x} 50 ${x + 2.6} 47.4" stroke="#1d2618" stroke-width=".9" fill="none"/>
           <path d="M${x - 5.5} 50.5 L${x - 5} 55" stroke="#4d5c40" stroke-width="1.2" stroke-linecap="round"/>
           <rect x="${x - 7.3}" y="54.6" width="14.6" height="2.8" fill="${c}" stroke="${ink}" stroke-width=".5"/>
           <ellipse cx="${x}" cy="59" rx="15.5" ry="2.8" fill="#3b4a31" stroke="${ink}" stroke-width="1"/>
           <path d="M${x - 9} 56 Q${x - 13} 50 ${x - 11.5} 46 Q${x - 9.5} 49 ${x - 8.5} 47 Q${x - 7.5} 49.5 ${x - 6} 46.5 Q${x - 5} 50 ${x - 6.5} 56Z" fill="#cfc2a6" stroke="#6e6048" stroke-width=".7"/>
           <path d="M${x - 11.3} 46.4 Q${x - 9.5} 49 ${x - 8.5} 47.3 Q${x - 7.5} 49.6 ${x - 6.1} 46.8" stroke="#3a2f22" stroke-width="1.1" fill="none" stroke-linecap="round"/>
           <rect x="${x - 9.2}" y="54.4" width="3.6" height="2.2" rx=".6" fill="#b08a3e" stroke="${ink}" stroke-width=".4"/>`
        : `<path d="M${x - 9} 59 Q${x} 50 ${x + 9} 59 L${x + 13} 61 L${x - 9} 61Z" fill="${c}" stroke="${ink}" stroke-width="1"/>`;
      const legs = (top, stock) => `
        <rect x="${x - 10}" y="${top}" width="8.5" height="${stock - top}" rx="2" fill="${pants}"/><rect x="${x + 1.5}" y="${top}" width="8.5" height="${stock - top}" rx="2" fill="${pants}"/>
        <rect x="${x - 9.5}" y="${stock}" width="7.5" height="${134 - stock}" rx="1.5" fill="#f4efe4" stroke="#b9ad92" stroke-width=".6"/><rect x="${x + 2}" y="${stock}" width="7.5" height="${134 - stock}" rx="1.5" fill="#f4efe4" stroke="#b9ad92" stroke-width=".6"/>
        <path d="M${x - 12} 138 Q${x - 12} 133 ${x - 6} 133 H${x - 1.5} V138Z" fill="#2a1d10"/><path d="M${x + 12} 138 Q${x + 12} 133 ${x + 6} 133 H${x + 1.5} V138Z" fill="#2a1d10"/>`;
      if (kind === "O") {
        // Ober: gestandener Tiroler – Joppe in der Kartenfarbe mit Hornknöpfen, Weste, Schnurrbart, Hand in der Hüfte, Wanderstock
        fig = `
          <path d="M${x - 21} 70 V137" stroke="#6e4520" stroke-width="2.4" stroke-linecap="round"/><path d="M${x - 21} 70 q0 -4 4 -4" stroke="#6e4520" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          ${legs(110, 124)}
          <path d="M${x - 14} 112 C${x - 15} 88 ${x - 10} 73 ${x} 72 C${x + 10} 73 ${x + 15} 88 ${x + 14} 112Z" fill="#f4efe4" stroke="${ink}" stroke-width="1.1"/>
          <path d="M${x - 5} 74 L${x - 4} 110 M${x + 5} 74 L${x + 4} 110" stroke="#c9b48a" stroke-width="5"/>
          <path d="M${x - 14} 112 C${x - 15} 88 ${x - 10} 73 ${x - 3} 72 L${x - 7} 112Z" fill="${c}" stroke="${ink}" stroke-width="1.1"/>
          <path d="M${x + 14} 112 C${x + 15} 88 ${x + 10} 73 ${x + 3} 72 L${x + 7} 112Z" fill="${c}" stroke="${ink}" stroke-width="1.1"/>
          <path d="M${x - 3} 72 L${x - 8} 84 L${x - 6} 72Z M${x + 3} 72 L${x + 8} 84 L${x + 6} 72Z" fill="#2f3a26"/>
          <g fill="#7a5a32" stroke="${ink}" stroke-width=".5">${[88, 96, 104].map((y) => `<circle cx="${x - 9}" cy="${y}" r="1.4"/><circle cx="${x + 9}" cy="${y}" r="1.4"/>`).join("")}</g>
          <path d="M${x + 13} 77 Q${x + 23} 86 ${x + 19} 95 Q${x + 16} 99 ${x + 12} 99" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M${x + 13} 77 Q${x + 23} 86 ${x + 19} 95 Q${x + 16} 99 ${x + 12} 99" stroke="${ink}" stroke-opacity=".35" stroke-width=".8" fill="none"/>
          <circle cx="${x + 11.5}" cy="99" r="3" fill="${skin}" stroke="${ink}" stroke-width=".8"/>
          <path d="M${x - 13} 77 Q${x - 19} 86 ${x - 20} 95" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <circle cx="${x - 20.5}" cy="97" r="3.2" fill="${skin}" stroke="${ink}" stroke-width=".8"/>
          <circle cx="${x}" cy="61" r="10.5" fill="${skin}" stroke="${ink}" stroke-width="1.1"/>
          <circle cx="${x - 3.6}" cy="59.5" r="1.3" fill="${ink}"/><circle cx="${x + 3.6}" cy="59.5" r="1.3" fill="${ink}"/>
          <path d="M${x - 2.5} 59 Q${x - 3.6} 56 ${x - 5.5} 57.2 M${x + 2.5} 59 Q${x + 3.6} 56 ${x + 5.5} 57.2" stroke="${ink}" stroke-width=".7" fill="none" opacity=".6"/>
          <path d="M${x} 64.2 Q${x - 4} 62.5 ${x - 7.5} 66.5 Q${x - 4} 65.5 ${x} 66.2 Q${x + 4} 65.5 ${x + 7.5} 66.5 Q${x + 4} 62.5 ${x} 64.2Z" fill="#5a3712"/>
          <path d="M${x - 2.5} 68.4 Q${x} 69.6 ${x + 2.5} 68.4" stroke="${ink}" stroke-width=".9" fill="none"/>
          <g transform="translate(0 -6.5) translate(${x} 59) scale(1.1) translate(${-x} -59)">${hat}</g>`;
      } else {
        // Unter: junger Bursch – Hemd in der Kartenfarbe, kurze Lederhose mit Hosenträgern, Kniestrümpfe, Bierkrug
        fig = `
          ${legs(104, 121)}
          <rect x="${x - 10}" y="118" width="8.5" height="4" fill="${skin}"/><rect x="${x + 1.5}" y="118" width="8.5" height="4" fill="${skin}"/>
          <path d="M${x - 14} 106 C${x - 15} 86 ${x - 10} 73 ${x} 72 C${x + 10} 73 ${x + 15} 86 ${x + 14} 106Z" fill="${c}" stroke="${ink}" stroke-width="1.1"/>
          <path d="M${x - 4} 73 L${x} 79 L${x + 4} 73" fill="#fff" stroke="${ink}" stroke-width=".7"/>
          <path d="M${x - 14} 104 H${x + 14} L${x + 13} 118 H${x + 1} L${x} 112 L${x - 1} 118 H${x - 13}Z" fill="#4b3420" stroke="#2a1a0a" stroke-width="1"/>
          <path d="M${x - 9} 104 L${x - 7} 74 M${x + 9} 104 L${x + 7} 74" stroke="#2e1f12" stroke-width="2.6"/>
          <rect x="${x - 8}" y="88" width="16" height="4" rx="1" fill="#2e1f12"/>
          <circle cx="${x}" cy="90" r="1.3" fill="#f4efe4"/>
          <path d="M${x - 13} 77 Q${x - 18} 88 ${x - 18} 100" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <circle cx="${x - 18}" cy="102" r="3" fill="${skin}" stroke="${ink}" stroke-width=".8"/>
          <path d="M${x + 13} 77 Q${x + 23} 74 ${x + 22} 60" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M${x + 13} 77 Q${x + 23} 74 ${x + 22} 60" stroke="${ink}" stroke-opacity=".3" stroke-width=".8" fill="none"/>
          <g transform="rotate(-14 ${x + 21} 57)">
            <rect x="${x + 15}" y="40" width="12" height="16" rx="2" fill="#e8c35a" stroke="#8a6a12" stroke-width="1"/>
            <path d="M${x + 18} 43 V53 M${x + 22} 43 V53" stroke="#fff" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M${x + 27} 44 q5.5 0 5.5 4.5 q0 4.5 -5.5 4.5" stroke="#8a6a12" stroke-width="1.6" fill="none"/>
            <path d="M${x + 14.4} 41.5 q0.5 -4.5 4 -3.5 q2 -3.5 5.5 -1.2 q3.5 -1 4.2 3.2 q1.2 1.5 -0.5 2.5 Z" fill="#fff" stroke="#c9c2b0" stroke-width=".6"/>
            <circle cx="${x + 13.5}" cy="37" r="1.1" fill="#fff" stroke="#c9c2b0" stroke-width=".4"/><circle cx="${x + 11.8}" cy="34.2" r=".8" fill="#fff" stroke="#c9c2b0" stroke-width=".4"/>
          </g>
          <circle cx="${x + 21.5}" cy="57.5" r="3.2" fill="${skin}" stroke="${ink}" stroke-width=".8"/>
          <circle cx="${x}" cy="61" r="10.5" fill="${skin}" stroke="${ink}" stroke-width="1.1"/>
          <path d="M${x - 9} 56 q-1 5 1 7 M${x + 9} 56 q1 5 -1 7" stroke="#7a4a1e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <circle cx="${x - 3.6}" cy="60" r="1.3" fill="${ink}"/><circle cx="${x + 3.6}" cy="60" r="1.3" fill="${ink}"/>
          <path d="M${x - 4.5} 64.5 Q${x + 0.5} 69.5 ${x + 5} 63.8" stroke="${ink}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
          <circle cx="${x - 6}" cy="64" r="1.6" fill="#f0a08a" opacity=".6"/><circle cx="${x + 6}" cy="64" r="1.6" fill="#f0a08a" opacity=".6"/>
          <path d="M${x - 6} 53.5 q2 3 5 1 q2 3 5 0" stroke="#7a4a1e" stroke-width="2" fill="none" stroke-linecap="round"/>
          <g transform="translate(0 -7) translate(${x} 59) scale(1.15) translate(${-x} -59)">${hat}</g>`;
      }
    }
    // Figur auf die ganze Karte vergrößern (Ecken und großes Farbsymbol bleiben frei)
    // ohne gespiegeltes Eckzeichen: Figur nutzt die ganze Karte
    // Figuren reichen vom oberen bis zum unteren Kartenrand
    const tf = kind === "K" ? "translate(-19 -22) scale(1.23)" : kind === "U" ? "translate(-54 -46.7) scale(1.65)" : "translate(-46 -46.7) scale(1.65)";
    const er = suit === "eichel" ? 180 : 0; // Eichel bei Figuren mit Stiel nach unten
    const big = kind === "U" ? sym(suit, 22, 166, 1.15, er) : sym(suit, 22, 26, 1.15, er);
    return frame(corner(kind, suit, c, false, false) + `<g transform="${tf}">${fig}</g>` + big);
  }
  // Ass: zwei große Farbsymbole, Schriftband und kleines Bergpanorama mit dem Spielstube-Haus
  const HOUSE = `<path d="M20.5 5.5 V0.5 h5.5 V9.8Z" fill="#c48f0a" stroke="#8a5f00" stroke-width=".9" stroke-linejoin="round"/><rect x="19.8" y="-0.3" width="6.9" height="1.8" rx=".6" fill="#a87400" stroke="#8a5f00" stroke-width=".6"/><circle cx="24.5" cy="-2.3" r="1.5" fill="#e6e2f5" opacity=".85"/><circle cx="26.6" cy="-3.6" r="1.1" fill="#e6e2f5" opacity=".6"/><path d="M16 2.6 30 13.4v13.4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V13.4Z" fill="#c48f0a"/><path d="M16 1.6 30 12.4v13.4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V12.4Z" fill="#ffc83d" stroke="#8a5f00" stroke-width="1" stroke-linejoin="round"/><path d="M16 1.6 30 12.4v1.6L16 3.2 2 14v-1.6Z" fill="#fff" opacity=".35"/><g fill="#2a1d00"><circle cx="9.5" cy="16" r="2"/><circle cx="22.5" cy="16" r="2"/><circle cx="16" cy="20.3" r="2"/><circle cx="9.5" cy="24.6" r="2"/><circle cx="22.5" cy="24.6" r="2"/></g>`;
  function sau(suit) {
    const c = SUITS[suit].color, er = suit === "eichel" ? 180 : 0;
    const ribbon = `
      <path d="M27 127 L15 128 L20 133.5 L15 140 L29 139Z" fill="${c}" stroke="#3a2a10" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M93 127 L105 128 L100 133.5 L105 140 L91 139Z" fill="${c}" stroke="#3a2a10" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M27 127 L29 139 L32 136Z M93 127 L91 139 L88 136Z" fill="#000" opacity=".3"/>
      <path d="M26 124 Q60 119 94 124 L94 137 Q60 132 26 137Z" fill="${c}" stroke="#3a2a10" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M28 126.5 Q60 121.8 92 126.5" stroke="#fff" stroke-opacity=".35" stroke-width=".9" fill="none"/>
      <text x="60" y="134" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10.5" fill="#ffc83d" stroke="#3a2a10" stroke-width="2.2" paint-order="stroke" letter-spacing="2.5">ASS</text>`;
    const peak = (x, y, w) => `<path d="M${x - w} ${y + w * 1.2} L${x} ${y} L${x + w} ${y + w * 1.2} L${x + w * .45} ${y + w * .85} L${x} ${y + w * 1.25} L${x - w * .45} ${y + w * .85}Z" fill="#fff"/>`;
    const alps = `
      <path d="M13 176 L13 162 L24 154 L31 159 L45 144 L56 157 L66 147 L80 160 L90 152 L107 166 L107 176Z" fill="#c3cddd"/>
      ${peak(45, 144, 4.5)}${peak(66, 147, 3.8)}${peak(24, 154, 2.8)}${peak(90, 152, 3.2)}
      <path d="M13 168 L28 162 L40 166 L56 158 L72 165 L88 160 L107 170 V176 H13Z" fill="#9fb0c8"/>
      <path d="M13 177 Q40 166 60 168 Q82 166 107 175 V178 H13Z" fill="#8fbf74"/>
      <g transform="translate(53 156.5) scale(.44)">${HOUSE}</g>`;
    return frame(corner("A", suit, c) + sym(suit, 60, 38, 1.9, er) + sym(suit, 60, 91, 1.9, er) + ribbon + alps);
  }
  // Weli: je drei Schellen oben und unten, lila Schriftband in der Mitte, lila Doppelrahmen (auch in der Hand gut erkennbar)
  function weli() {
    const v = "#7b2fb5";
    const pips = [[36, 34], [84, 34], [60, 62], [60, 128], [36, 156], [84, 156]].map(([x, y]) => sym("schelle", x, y, PIP)).join("");
    const ribbon = `<g transform="translate(0 -36)">
      <path d="M27 127 L15 128 L20 133.5 L15 140 L29 139Z" fill="${v}" stroke="#2a1040" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M93 127 L105 128 L100 133.5 L105 140 L91 139Z" fill="${v}" stroke="#2a1040" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M27 127 L29 139 L32 136Z M93 127 L91 139 L88 136Z" fill="#000" opacity=".35"/>
      <path d="M26 124 Q60 119 94 124 L94 137 Q60 132 26 137Z" fill="${v}" stroke="#2a1040" stroke-opacity=".5" stroke-width=".8"/>
      <path d="M28 126.5 Q60 121.8 92 126.5" stroke="#fff" stroke-opacity=".35" stroke-width=".9" fill="none"/>
      <text x="60" y="134" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10.5" fill="#ffc83d" stroke="#2a1040" stroke-width="2.2" paint-order="stroke" letter-spacing="2.5">WELI</text></g>`;
    const border = `<rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="9.5" fill="none" stroke="${v}" stroke-width="2.2"/>
      <rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="7" fill="none" stroke="${v}" stroke-opacity=".55" stroke-width="1"/>`;
    return frame(border + pips + ribbon);
  }
  function back() {
    let dots = "";
    for (let y = 22; y < H - 10; y += 16) for (let x = 18 + ((y / 16) % 2) * 8; x < W - 10; x += 16) dots += `<circle cx="${x}" cy="${y}" r="2" fill="#ffc83d" fill-opacity=".22"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="11" fill="#2b2366" stroke="#4a3fa0" stroke-width="1.5"/>
      <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="7" fill="#231c58" stroke="#ffc83d" stroke-opacity=".5"/>${dots}
      <circle cx="60" cy="93" r="31" fill="#231c58"/>
      <g transform="translate(40 77) scale(1.25)"><path d="M20.5 5.5 V0.5 h5.5 V9.8Z" fill="#c48f0a" stroke="#8a5f00" stroke-width=".9" stroke-linejoin="round"/><rect x="19.8" y="-0.3" width="6.9" height="1.8" rx=".6" fill="#a87400" stroke="#8a5f00" stroke-width=".6"/><circle cx="24.5" cy="-2.3" r="1.5" fill="#e6e2f5" opacity=".85"/><circle cx="26.6" cy="-3.6" r="1.1" fill="#e6e2f5" opacity=".6"/><path d="M16 2.6 30 13.4v13.4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V13.4Z" fill="#c48f0a"/><path d="M16 1.6 30 12.4v13.4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V12.4Z" fill="#ffc83d" stroke="#8a5f00" stroke-width="1" stroke-linejoin="round"/><path d="M16 1.6 30 12.4v1.6L16 3.2 2 14v-1.6Z" fill="#fff" opacity=".35"/><g fill="#2a1d00"><circle cx="9.5" cy="16" r="2"/><circle cx="22.5" cy="16" r="2"/><circle cx="16" cy="20.3" r="2"/><circle cx="9.5" cy="24.6" r="2"/><circle cx="22.5" cy="24.6" r="2"/></g>
      </g></svg>`; // Rückseite mit dem Spielstube-Logo (Haus mit Würfelaugen)
  }
  // Karten-ID: "herz-7" … "herz-A", Weli = "schelle-6"
  function svg(id) {
    const [suit, r] = String(id).split("-");
    if (suit === "schelle" && r === "6") return weli();
    if (r === "A") return sau(suit);
    if (r === "U" || r === "O" || r === "K") return face(suit, r);
    return numberCard(suit, Number(r));
  }
  root.S10WattenCards = { svg, back, sym: (suit, s) => `<svg viewBox="-16 -16 32 32" xmlns="http://www.w3.org/2000/svg">${sym(suit, 0, 0, s || 1, suit === "eichel" ? 180 : 0)}</svg>` };
})(typeof window !== "undefined" ? window : globalThis);
