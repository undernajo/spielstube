// Gezeichnete Spielsymbole (SVG) für Kacheln und Kopfzeilen
(() => {
  // Symbol für Watten: drei aufgefächerte Wattkarten (Herz, Laub, Eichel aus dem eigenen Blatt)
  // Watten: drei aufgefächerte Karten, vorne der Weli mit lila Band
  function wattenIcon() {
    const C = window.S10WattenCards;
    const sym = (suit, x, y, w) => C ? `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="-16 -16 32 32">${C.sym(suit, 1).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>` : "";
    const card = (rot, inner) => `<g transform="rotate(${rot} 32 58)"><rect x="20" y="10" width="24" height="36" rx="3.5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>${inner}</g>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      ${card(-22, sym("laub", 20.5, 12, 14))}${card(-6, sym("herz", 20.5, 12, 14))}
      ${card(14, `${sym("schelle", 23, 12, 8)}${sym("schelle", 33, 12, 8)}${sym("schelle", 23, 36, 8)}${sym("schelle", 33, 36, 8)}
        <path d="M18.5 24 H45.5 L43.5 31 H20.5Z" fill="#7b2fb5"/><text x="32" y="29.8" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="5.6" fill="#fff" letter-spacing=".6">WELI</text>`)}</svg>`;
  }
  // Schnapsen: Ass und König mit goldener „66“-Plakette
  function schnapsenIcon() {
    const C = window.S10WattenCards;
    const sym = (suit, x, y, w) => C ? `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="-16 -16 32 32">${C.sym(suit, 1).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>` : "";
    const card = (rot, inner) => `<g transform="rotate(${rot} 32 58)"><rect x="20" y="10" width="24" height="36" rx="3.5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>${inner}</g>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      ${card(-14, `${sym("herz", 24, 13, 16)}${sym("herz", 24, 28, 16)}`)}
      ${card(10, `${sym("eichel", 20.5, 12, 12)}<path d="M26 26 L28 20 L31 24 L32 18 L33 24 L36 20 L38 26Z" fill="#ffc83d" stroke="#a37400" stroke-width=".8"/>
        <circle cx="32" cy="31" r="4.2" fill="#f3d2b0" stroke="#3a2a10" stroke-width=".8"/><path d="M27 44 C27 38 29 36 32 36 C35 36 37 38 37 44Z" fill="#c9883a" stroke="#3a2a10" stroke-width=".8"/>`)}
      <circle cx="47" cy="47" r="12" fill="#ffc83d" stroke="#a37400" stroke-width="1.6"/>
      <text x="47" y="52.2" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#2a1d00">66</text></svg>`;
  }
  // Symbol für „Zehnkampf“: der Ring mit zehn Antwortkärtchen um eine goldene „10“ (wie das Spielfeld);
  // drei schon aufgedeckt, verteilt im Ring: zwei richtig (grün), eine falsch (rot)
  function zehnIcon() {
    const tiles = Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * Math.PI / 180, x = 32 + 23 * Math.cos(a), y = 32 + 23 * Math.sin(a);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.6" fill="${({ 1: "#2fbf71", 4: "#ef4b5a", 7: "#2fbf71" })[i] || "#fbf6ea"}" stroke="#2a2170" stroke-width="1"/>`;
    }).join("");
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${tiles}
      <circle cx="32" cy="32" r="14.5" fill="#170f4d" stroke="#ffc83d" stroke-width="2"/>
      <text x="32" y="38.3" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#ffc83d">10</text></svg>`;
  }
  // Weitere gezeichnete Spielsymbole im gleichen Stil
  const svgIcon = (inner) => `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  // Wo liegt das?: gefaltete Landkarte mit roter Stecknadel
  const geoIcon = () => svgIcon(`
    <path d="M10 18 L24 13 L40 18 L54 13 V47 L40 52 L24 47 L10 52Z" fill="#e8f1dc" stroke="#5b6e4a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M24 13 V47 M40 18 V52" stroke="#5b6e4a" stroke-width="1" opacity=".6"/>
    <path d="M10 36 C18 32 22 40 30 36 S44 30 54 34" stroke="#4aa8ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M14 24 L20 22 M44 24 L50 22" stroke="#7ba05b" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 8 C30 8 26 12.5 26 18 C26 25 36 33 36 33 C36 33 46 25 46 18 C46 12.5 42 8 36 8Z" fill="#ef4b5a" stroke="#a32f3b" stroke-width="1.2"/>
    <circle cx="36" cy="18" r="3.6" fill="#fff"/>`);
  // Von oben: Satellitenbild im Sucher
  const obenIcon = () => svgIcon(`
    <rect x="12" y="12" width="40" height="40" rx="6" fill="#3d7a4a"/>
    <path d="M12 38 C22 34 26 44 36 40 S48 30 52 32 V46 a6 6 0 0 1 -6 6 H18 a6 6 0 0 1 -6 -6Z" fill="#3b7fbf"/>
    <path d="M18 18 h9 v7 h-9Z M31 20 h6 v5 h-6Z M20 28 h5 v4 h-5Z" fill="#d9c8a2"/>
    <path d="M12 30 L52 22" stroke="#e8e0c8" stroke-width="2" opacity=".8"/>
    <path d="M8 18 V8 H18 M46 8 H56 V18 M56 46 V56 H46 M18 56 H8 V46" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="3" fill="none" stroke="#ffc83d" stroke-width="1.6"/>`);
  // Länder finden: Länderumrisse, eines gelb markiert, mit Finger zum Antippen
  const landIcon = () => svgIcon(`
    <rect x="6" y="8" width="52" height="48" rx="7" fill="#2b6ca3"/>
    <path d="M10 24 L20 18 L28 22 L26 32 L16 34 L10 30Z" fill="#cfe3b8" stroke="#56704a" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M28 22 L38 16 L48 20 L46 30 L36 33 L26 32Z" fill="#ffd24d" stroke="#a37400" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M16 34 L26 32 L36 33 L34 44 L24 48 L14 44Z" fill="#cfe3b8" stroke="#56704a" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M36 33 L46 30 L54 36 L50 46 L40 48 L34 44Z" fill="#b9d59c" stroke="#56704a" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M39 26 V40 l-3 -3 a2.4 2.4 0 0 0 -3.6 3.2 l6.2 8.3 a6 6 0 0 0 4.8 2.5 h4.6 a6 6 0 0 0 6 -6 V36 a2.2 2.2 0 0 0 -4.4 0 v-1.6 a2.2 2.2 0 0 0 -4.4 0 v-1 a2.2 2.2 0 0 0 -4.4 0 V26 a2.2 2.2 0 0 0 -4.4 0Z"
      fill="#fbf6ea" stroke="#3a2a10" stroke-width="1.3" stroke-linejoin="round"/>`);
  // Schätzen: Glas voller bunter Kugeln
  const schaetzenIcon = () => svgIcon(`
    <path d="M20 14 h24 v5 c4 2 6 6 6 11 v18 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 v-18 c0 -5 2 -9 6 -11Z" fill="#dff1fb" fill-opacity=".35" stroke="#e8f4ff" stroke-width="1.8"/>
    <rect x="18" y="9" width="28" height="6" rx="2" fill="#c9883a" stroke="#7a4f1c" stroke-width="1.2"/>
    ${[[22, 46, "#ef4b5a"], [30, 47, "#ffc83d"], [38, 46, "#4aa8ff"], [26, 39, "#3ccf8e"], [34, 39, "#c084fc"], [42, 40, "#ff8a5c"], [30, 32, "#4aa8ff"], [38, 32, "#ffc83d"], [22, 32, "#ef4b5a"]]
      .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${c}"/>`).join("")}
    <circle cx="49" cy="15" r="9" fill="#ffd24d" stroke="#a37400" stroke-width="1.3"/><text x="49" y="19.6" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="13" fill="#2a1d00">?</text>`);
  // Hinweis für Hinweis: Lupe über nummerierten Hinweiskärtchen
  const hinweisIcon = () => svgIcon(`
    ${[0, 1, 2].map((i) => `<rect x="${10 + i * 6}" y="${12 + i * 7}" width="28" height="18" rx="3" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.2"/>
      <text x="${16 + i * 6}" y="${25 + i * 7}" font-family="Fredoka, sans-serif" font-weight="700" font-size="10" fill="#7a4f1c">${i + 1}</text>
      <path d="M${22 + i * 6} ${21 + i * 7} h${11}" stroke="#cbbf9f" stroke-width="2" stroke-linecap="round"/>`).join("")}
    <circle cx="42" cy="40" r="9" fill="#9fd8ff" fill-opacity=".35" stroke="#fbf6ea" stroke-width="3"/>
    <path d="M48.5 46.5 L56 54" stroke="#c9883a" stroke-width="5" stroke-linecap="round"/>`);
  // Umriss-Rätsel: gestrichelter Länderumriss mit Fragezeichen
  const umrissIcon = () => svgIcon(`
    <path d="M18 14 L30 10 L36 16 L46 14 L50 24 L44 30 L48 40 L40 50 L30 46 L22 52 L16 42 L20 34 L12 26Z" fill="#ffd24d" fill-opacity=".14" stroke="#ffd24d" stroke-width="2.2" stroke-dasharray="4 3" stroke-linejoin="round"/>
    <text x="31" y="38" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#fbf6ea">?</text>`);
  // Kartenrunde / Siebzehn und Vier: zwei Karten (Ass und Zehner) mit „21“
  const siebzehnIcon = () => svgIcon(`
    <g transform="rotate(-12 26 40)"><rect x="12" y="14" width="24" height="34" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
      <text x="24" y="37" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#c0392b">A</text></g>
    <g transform="rotate(10 38 40)"><rect x="26" y="14" width="24" height="34" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
      <text x="38" y="37" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="13" fill="#2f7d32">10</text></g>
    <circle cx="47" cy="49" r="11" fill="#2fbf71" stroke="#1d7a48" stroke-width="1.4"/>
    <text x="47" y="53.6" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="12.5" fill="#fff">21</text>`);
  // Stichhaltig: drei aufgefächerte Karten und eine Sprechblase mit der Ansage
  const stichIcon = () => svgIcon(`
    <g transform="rotate(-14 22 44)"><rect x="9" y="18" width="22" height="32" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/></g>
    <g transform="rotate(0 30 44)"><rect x="19" y="16" width="22" height="32" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
      <path d="M30 24 l4 6 -4 6 -4 -6Z" fill="#e0453a"/></g>
    <path d="M38 8 h18 a5 5 0 0 1 5 5 v10 a5 5 0 0 1 -5 5 h-7 l-5 5 v-5 h-6 a5 5 0 0 1 -5 -5 v-10 a5 5 0 0 1 5 -5Z" fill="#6f8cff" stroke="#3b52b5" stroke-width="1.4"/>
    <text x="47" y="23.5" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="13" fill="#fff">2</text>`);
  // Busfahrt: kleiner Bus mit Karten als Fenstern
  const busIcon = () => svgIcon(`
    <rect x="8" y="16" width="48" height="30" rx="7" fill="#ffc83d" stroke="#a37400" stroke-width="1.6"/>
    ${[13, 24, 35].map((x) => `<rect x="${x}" y="21" width="8" height="11" rx="1.5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1"/>`).join("")}
    <rect x="46" y="21" width="6" height="16" rx="1.5" fill="#9fd8ff" stroke="#1f5f99" stroke-width="1"/>
    <path d="M8 38 H56" stroke="#a37400" stroke-width="1.4"/>
    <circle cx="19" cy="47" r="5" fill="#2a2456" stroke="#fbf6ea" stroke-width="1.6"/><circle cx="45" cy="47" r="5" fill="#2a2456" stroke="#fbf6ea" stroke-width="1.6"/>
    <path d="M16 26.5 h2 M27 26.5 h2 M38 26.5 h2" stroke="#ef4b5a" stroke-width="2" stroke-linecap="round"/>`);
  // Querbeet: geschwungener Weg mit bunten Etappen-Punkten und Zielfahne
  const qbIcon = () => svgIcon(`
    <path d="M10 50 C22 50 18 36 30 36 S40 22 50 22" stroke="#fbf6ea" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-dasharray="1 6.5"/>
    <circle cx="10" cy="50" r="5.2" fill="#ffc83d" stroke="#a37400" stroke-width="1.2"/>
    <circle cx="30" cy="36" r="5.2" fill="#4aa8ff" stroke="#1f5f99" stroke-width="1.2"/>
    <circle cx="44" cy="25" r="4.4" fill="#3ccf8e" stroke="#1d7a48" stroke-width="1.2"/>
    <path d="M50 26 V6" stroke="#fbf6ea" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 7 H60 L57 11 L60 15 H50Z" fill="#ef4b5a" stroke="#a32f3b" stroke-width="1"/>`);
  // Stadt, Land, Fluss: Notizblock mit Buchstaben-Würfel
  const slfIcon = () => svgIcon(`
    <rect x="12" y="10" width="34" height="44" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
    <path d="M17 10 V7 M24 10 V7 M31 10 V7 M38 10 V7" stroke="#8a7a5a" stroke-width="2" stroke-linecap="round"/>
    <path d="M17 22 H40 M17 30 H40 M17 38 H40 M17 46 H32" stroke="#b9ad92" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M17 22 H29 M17 30 H33" stroke="#3ccf8e" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="34" y="34" width="22" height="22" rx="5" fill="#ffc83d" stroke="#c48f0a" stroke-width="1.4"/>
    <text x="45" y="51" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="16" fill="#2a1d00">A</text>`);
  // Gleiche Wellenlänge: zwei Sprechblasen mit derselben Welle
  const wlIcon = () => svgIcon(`
    <path d="M8 14 h22 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-14 l-6 6 v-6 h-2 a5 5 0 0 1 -5 -5 v-12 a5 5 0 0 1 5 -5Z" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.3"/>
    <path d="M34 26 h22 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-2 v6 l-6 -6 h-14 a5 5 0 0 1 -5 -5 v-12 a5 5 0 0 1 5 -5Z" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.3"/>
    <path d="M9 25 q3.5 -6 7 0 t7 0 t7 0" stroke="#ff6fae" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M35 37 q3.5 -6 7 0 t7 0 t7 0" stroke="#ff6fae" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
  // Listen-Duell: Liste mit nummerierten Zeilen, zwei Spielerfarben haken ab
  function duellIcon() {
    const rows = [0, 1, 2, 3, 4].map((r) => {
      const y = 16 + r * 8.2, done = r < 3, col = r % 2 ? "#4fc3f7" : "#ffc83d";
      return `<circle cx="20" cy="${y}" r="2.6" fill="${done ? col : "#d6cfb8"}"/><path d="M26 ${y} H${done ? 44 - r * 3 : 38}" stroke="${done ? "#5a4a2a" : "#cbbf9f"}" stroke-width="2.2" stroke-linecap="round"/>`;
    }).join("");
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="8" width="40" height="48" rx="5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>${rows}
      <circle cx="47" cy="47" r="11" fill="#ef4b5a" stroke="#a32f3b" stroke-width="1.4"/><text x="47" y="51.6" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#fff">?</text></svg>`;
  }
  // Antwort sucht Frage: Karte mit „= 3“ und ein Fragezeichen in der Sprechblase
  function frageIcon() {
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="16" width="26" height="36" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4" transform="rotate(-8 22 34)"/>
      <text x="22" y="41" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#2a1d00" transform="rotate(-8 22 34)">3</text>
      <path d="M32 10 h20 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-8 l-6 6 v-6 h-6 a6 6 0 0 1 -6 -6 v-14 a6 6 0 0 1 6 -6Z" fill="#c084fc" stroke="#7e3fb8" stroke-width="1.4"/>
      <text x="42" y="30" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#fff">?</text></svg>`;
  }
  // Symbol für „Höher oder tiefer“: zwei Karten, grüner Pfeil nach oben, roter nach unten
  function hlIcon() {
    const card = (x, rot, up) => `<g transform="rotate(${rot} ${x + 11} 50)"><rect x="${x}" y="14" width="22" height="34" rx="4" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.4"/>
      <path d="${up ? `M${x + 11} 21 L${x + 19} 33 H${x + 14.5} V41 H${x + 7.5} V33 H${x + 3}Z` : `M${x + 11} 41 L${x + 19} 29 H${x + 14.5} V21 H${x + 7.5} V29 H${x + 3}Z`}"
        fill="${up ? "#2fbf71" : "#ef4b5a"}" stroke="${up ? "#1d7a48" : "#a32f3b"}" stroke-width="1" stroke-linejoin="round"/></g>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${card(9, -10, true)}${card(33, 10, false)}</svg>`;
  }

  // Almsommer: kleines Tal aus Geländefeldern (Gipfel, Wiese, Wald, Bach) mit zwei Kreuzen, davor ein Würfel mit „3“
  function almIcon() {
    const C = { f: "#9a98a6", g: "#8fcf6a", w: "#2f7a4a", b: "#4aa8e8" }, map = ["fgb", "ggb", "wgb"];
    const tiles = map.map((row, r) => row.split("").map((t, c) => `<rect x="${8 + c * 14}" y="${8 + r * 14}" width="14" height="14" fill="${C[t]}" stroke="#1d3a1d" stroke-opacity=".35" stroke-width="1"/>`).join("")).join("");
    const cross = (x, y) => `<path d="M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}" stroke="#2a1d00" stroke-width="2.4" stroke-linecap="round"/>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g>${tiles}</g>
      <path d="M10 20 L15 11 L20 20Z" fill="#f3f0ff" stroke="#5a5866" stroke-width="1"/>${cross(29, 29)}${cross(15, 29)}
      <rect x="34" y="34" width="24" height="24" rx="5" fill="#fbf6ea" stroke="#8a7a5a" stroke-width="1.6" transform="rotate(8 46 46)"/>
      <text x="46" y="52.5" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="17" fill="#2a1d00" transform="rotate(8 46 46)">3</text></svg>`;
  }

  // Seilschaft: zwei Gipfel, verbunden durch ein Seil, oben das Gipfelkreuz
  function seilIcon() {
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 58 L22 22 L32 34 L44 12 L62 58Z" fill="#8f8799"/><path d="M22 22 L27 28 L24 30 L19 28Z M44 12 L50 22 L46 24 L43 20 L39 22Z" fill="#fff"/>
      <path d="M2 58 Q20 46 34 52 Q48 58 62 50 V60 H2Z" fill="#6fae5c"/>
      <path d="M44 4 V13 M41 7 H47" stroke="#7a4e2a" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 44 Q26 52 30 40 Q34 28 46 34" fill="none" stroke="#ff8a3d" stroke-width="3" stroke-linecap="round"/>
      <circle cx="14" cy="44" r="4" fill="#d6453d"/><circle cx="14" cy="39.5" r="2.6" fill="#f2c9a0"/><rect x="11.5" y="36" width="5" height="2" rx="1" fill="#2f6b35"/>
      <ellipse cx="47" cy="35" rx="4.2" ry="3" fill="#8b6a4f"/><circle cx="50" cy="31.5" r="2.2" fill="#8b6a4f"/><path d="M49.5 29.5 Q50 26.5 48 26 M51 29.5 Q52 27 50.5 26" stroke="#2a1e16" stroke-width="1.1" fill="none" stroke-linecap="round"/></svg>`;
  }

  // Auf der Jagd: Hochsitz am Waldrand, davor eine Fuchsspur
  function jagdIcon() {
    const rung = (y, w) => `<path d="M${32 - w} ${y} H${32 + w}" stroke="#7a4e2a" stroke-width="2.2" stroke-linecap="round"/>`;
    const paw = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.3" fill="#3a2a1a"/>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 40 L14 26 L20 40Z M44 40 L51 24 L58 40Z" fill="#2f7a4a"/><path d="M4 56 Q32 42 60 56 V60 H4Z" fill="#7cc95a"/>
      <path d="M23 56 L27 27 M41 56 L37 27" stroke="#8a5a30" stroke-width="3.2" stroke-linecap="round"/>${rung(48, 8)}${rung(41, 7)}${rung(34, 6)}
      <rect x="22" y="16" width="20" height="12" rx="1.5" fill="#a8703f" stroke="#5e3b1f" stroke-width="1.4"/><rect x="26" y="19.5" width="12" height="3.2" rx="1" fill="#2a1a0e"/>
      <path d="M17 17.5 L32 7 L47 17.5Z" fill="#6a4a37" stroke="#3e2a1d" stroke-width="1.2" stroke-linejoin="round"/>
      ${paw(49, 54)}${paw(53, 50)}${paw(9, 53)}${paw(13, 57)}</svg>`;
  }

  // Fragewand: Tafel aus 3 × 3 Feldern mit Punktwerten, ein Feld schon umgedreht
  function wandIcon() {
    const cells = [];
    [10, 20, 50].forEach((v, r) => [0, 1, 2].forEach((c) => {
      const x = 9 + c * 16, y = 12 + r * 15, done = r === 1 && c === 1;
      cells.push(`<rect x="${x}" y="${y}" width="14" height="12.5" rx="2.5" fill="${done ? "#2fbf71" : "#3d33a0"}" stroke="#1b1660" stroke-width="1"/>`
        + (done ? `<path d="M${x + 4} ${y + 6.5} l2.6 2.6 4.4 -5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<text x="${x + 7}" y="${y + 9}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="7" fill="#ffc83d">${v}</text>`));
    }));
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="6" width="54" height="52" rx="6" fill="#221b63" stroke="#ffc83d" stroke-width="1.6"/>${cells.join("")}</svg>`;
  }
  // Wer bin ich?: Kopf mit Zettel auf der Stirn, darauf ein Fragezeichen
  function werIcon() {
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 60 C12 47 21 42 32 42 C43 42 52 47 52 60Z" fill="#6f8cff" stroke="#3b4fa8" stroke-width="1.4"/>
      <circle cx="32" cy="27" r="15" fill="#f2c9a0" stroke="#a5754f" stroke-width="1.4"/>
      <path d="M17.5 24 C18 13 25 10 32 10 C40 10 46 14 46.5 24 C43 18 38 16 32 16 C26 16 21 18 17.5 24Z" fill="#6a4a37"/>
      <circle cx="26.5" cy="31" r="1.7" fill="#2a1d10"/><circle cx="37.5" cy="31" r="1.7" fill="#2a1d10"/>
      <path d="M27.5 36.5 Q32 39.5 36.5 36.5" fill="none" stroke="#a5754f" stroke-width="1.6" stroke-linecap="round"/>
      <g transform="rotate(-7 32 16)"><rect x="22" y="6" width="20" height="17" rx="1.5" fill="#ffe066" stroke="#c9a400" stroke-width="1.2"/>
      <text x="32" y="20.5" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="#d6336c">?</text></g></svg>`;
  }
  // Wie tickst du?: Halbkreis-Skala von Blau nach Rot mit Zeiger
  function tickIcon() {
    const seg = [0, 1, 2, 3, 4].map((i) => { const a0 = Math.PI * (1 - i / 5), a1 = Math.PI * (1 - (i + 1) / 5), r = 24, cx = 32, cy = 44;
      const p = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy - rr * Math.sin(a)).toFixed(1)}`;
      return `<path d="M${p(a0, r)} A${r} ${r} 0 0 1 ${p(a1, r)} L${p(a1, 12)} A12 12 0 0 0 ${p(a0, 12)}Z" fill="${["#4aa8ff", "#4fd1c5", "#8fcf6a", "#ffc83d", "#ef4b5a"][i]}" stroke="#1b1640" stroke-width="1.2"/>`; }).join("");
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${seg}
      <path d="M32 44 L47 25" stroke="#fbf6ea" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="44" r="4" fill="#fbf6ea" stroke="#1b1640" stroke-width="1.2"/>
      <text x="16" y="58" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="#4aa8ff">1</text>
      <text x="48" y="58" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="9" fill="#ef4b5a">10</text></svg>`;
  }
  // Kaum zu glauben: drei Kärtchen A/B/C, das mittlere grün mit Häkchen, darüber ein Ausrufezeichen
  function kuriosIcon() {
    const card = (x, rot, fill, inner) => `<g transform="rotate(${rot} ${x + 9} 40)"><rect x="${x}" y="22" width="18" height="26" rx="3.5" fill="${fill}" stroke="#8a7a5a" stroke-width="1.3"/>${inner}</g>`;
    const t = (x, c, txt) => `<text x="${x + 9}" y="40" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="12" fill="${c}">${txt}</text>`;
    return `<svg class="wicon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      ${card(5, -12, "#fbf6ea", t(5, "#ef4b5a", "✗"))}${card(41, 12, "#fbf6ea", t(41, "#ef4b5a", "✗"))}${card(23, 0, "#2fbf71", t(23, "#fff", "✓"))}
      <circle cx="32" cy="11" r="8" fill="#f472b6" stroke="#a8326f" stroke-width="1.3"/><text x="32" y="15.5" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="12" fill="#fff">!</text></svg>`;
  }
  window.S10Icons = {
    busIcon, duellIcon, frageIcon, geoIcon, hinweisIcon, hlIcon, landIcon, obenIcon, qbIcon,
    schaetzenIcon, schnapsenIcon, siebzehnIcon, slfIcon, stichIcon, umrissIcon, wattenIcon, wlIcon,
    zehnIcon, almIcon, jagdIcon, wandIcon, seilIcon, werIcon, tickIcon, kuriosIcon
  };
})();
