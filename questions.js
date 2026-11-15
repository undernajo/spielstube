// Fragenkarten. Jede Karte hat genau 10 Antworten.
// type: "tf"     -> Ja/Nein (Antwort true/false)
//       "num"    -> Zahl (exakt)
//       "choice" -> Auswahl aus options
window.SCHLAU10_CARDS = [
  { q: "Gründungsmitglied der EWG (Römische Verträge 1957)?", type: "tf", items: [
    ["Belgien", true], ["Frankreich", true], ["Italien", true], ["Luxemburg", true], ["Niederlande", true],
    ["Deutschland", true], ["Spanien", false], ["Dänemark", false], ["Österreich", false], ["Großbritannien", false] ] },

  { q: "Wie viele Beine hat …?", type: "num", items: [
    ["Spinne", 8], ["Ameise", 6], ["Kuh", 4], ["Huhn", 2], ["Hummer (inkl. Scheren)", 10],
    ["Skorpion", 8], ["Biene", 6], ["Pinguin", 2], ["Katze", 4], ["Zecke (erwachsen)", 8] ] },

  { q: "Auf welchem Kontinent liegt diese Hauptstadt?", type: "choice",
    options: ["Europa", "Asien", "Afrika", "Nordamerika", "Südamerika", "Ozeanien"], items: [
    ["Nairobi", "Afrika"], ["Lima", "Südamerika"], ["Hanoi", "Asien"], ["Canberra", "Ozeanien"], ["Ottawa", "Nordamerika"],
    ["Oslo", "Europa"], ["Bogotá", "Südamerika"], ["Dakar", "Afrika"], ["Ulaanbaatar", "Asien"], ["Wellington", "Ozeanien"] ] },

  { q: "Wie viele Spieler einer Mannschaft stehen gleichzeitig auf dem Feld?", type: "num", items: [
    ["Fußball", 11], ["Basketball", 5], ["Handball", 7], ["Volleyball", 6], ["Eishockey", 6],
    ["Wasserball", 7], ["Rugby Union", 15], ["Beachvolleyball", 2], ["Baseball (Verteidigung)", 9], ["American Football", 11] ] },

  { q: "In welchem Jahr geschah das?", type: "num", items: [
    ["Kolumbus erreicht Amerika", 1492], ["Luthers Thesenanschlag", 1517], ["Sturm auf die Bastille", 1789],
    ["Untergang der Titanic", 1912], ["Ende des 2. Weltkriegs in Europa", 1945], ["Gründung der Bundesrepublik", 1949],
    ["Erste Mondlandung", 1969], ["Fall der Berliner Mauer", 1989], ["Deutsche Wiedervereinigung", 1990], ["Einführung des Euro-Bargelds", 2002] ] },

  { q: "Kommt in der Nationalflagge die Farbe Grün vor?", type: "tf", items: [
    ["Italien", true], ["Irland", true], ["Brasilien", true], ["Nigeria", true], ["Mexiko", true],
    ["Indien", true], ["Japan", false], ["Frankreich", false], ["Schweden", false], ["Kanada", false] ] },

  { q: "Ist das ein Säugetier?", type: "tf", items: [
    ["Wal", true], ["Fledermaus", true], ["Pinguin", false], ["Delfin", true], ["Hai", false],
    ["Schnabeltier", true], ["Krokodil", false], ["Seekuh", true], ["Strauß", false], ["Igel", true] ] },

  { q: "Wie viele gibt es?", type: "num", items: [
    ["Tasten auf einem Klavier", 88], ["Felder auf dem Schachbrett", 64], ["Bundesländer in Deutschland", 16],
    ["Kantone der Schweiz", 26], ["Karten im Skatblatt", 32], ["Saiten einer Standard-Gitarre", 6],
    ["Zähne eines Erwachsenen (inkl. Weisheitszähne)", 32], ["Planeten im Sonnensystem", 8],
    ["Olympische Ringe", 5], ["Sterne auf der US-Flagge", 50] ] },

  { q: "Der wievielte Bundeskanzler war das?", hint: "1 = erster Bundeskanzler", type: "rank", items: [
    ["Konrad Adenauer", 1], ["Ludwig Erhard", 2], ["Kurt Georg Kiesinger", 3], ["Willy Brandt", 4], ["Helmut Schmidt", 5],
    ["Helmut Kohl", 6], ["Gerhard Schröder", 7], ["Angela Merkel", 8], ["Olaf Scholz", 9], ["Friedrich Merz", 10] ] },

  { q: "Welche Ordnungszahl hat das Element im Periodensystem?", type: "num", items: [
    ["Wasserstoff", 1], ["Helium", 2], ["Kohlenstoff", 6], ["Stickstoff", 7], ["Sauerstoff", 8],
    ["Natrium", 11], ["Eisen", 26], ["Kupfer", 29], ["Silber", 47], ["Gold", 79] ] },

  { q: "Aus welchem Land stammt die Automarke?", type: "choice",
    options: ["Deutschland", "Italien", "Frankreich", "Großbritannien", "Schweden", "USA", "Japan", "Südkorea"], items: [
    ["Ferrari", "Italien"], ["Toyota", "Japan"], ["Peugeot", "Frankreich"], ["Volvo", "Schweden"], ["Kia", "Südkorea"],
    ["Tesla", "USA"], ["Opel", "Deutschland"], ["Renault", "Frankreich"], ["Mazda", "Japan"], ["Aston Martin", "Großbritannien"] ] },

  { q: "Ist das eine Primzahl?", type: "tf", items: [
    ["2", true], ["9", false], ["17", true], ["21", false], ["29", true],
    ["51", false], ["53", true], ["57", false], ["91", false], ["97", true] ] },

  { q: "Wie viele sind es?", hint: "Geometrie", type: "num", items: [
    ["Würfel – Flächen", 6], ["Würfel – Kanten", 12], ["Würfel – Ecken", 8], ["Tetraeder – Flächen", 4],
    ["Oktaeder – Flächen", 8], ["Dodekaeder – Flächen", 12], ["Ikosaeder – Flächen", 20], ["Fünfeck – Ecken", 5],
    ["Quadratische Pyramide – Ecken", 5], ["Klassischer Fußball – Fünfecke", 12] ] },

  { q: "In welchem Land steht das Bauwerk?", type: "choice",
    options: ["Frankreich", "Italien", "Spanien", "Großbritannien", "Griechenland", "Ägypten", "Jordanien", "Indien", "USA", "Mexiko", "Peru", "Brasilien"], items: [
    ["Eiffelturm", "Frankreich"], ["Kolosseum", "Italien"], ["Sagrada Família", "Spanien"], ["Big Ben", "Großbritannien"],
    ["Freiheitsstatue", "USA"], ["Taj Mahal", "Indien"], ["Machu Picchu", "Peru"], ["Akropolis", "Griechenland"],
    ["Petra", "Jordanien"], ["Cristo Redentor", "Brasilien"] ] },

  { q: "War dieses Land Fußball-Weltmeister der Männer (bis einschließlich 2022)?", type: "tf", items: [
    ["Deutschland", true], ["Brasilien", true], ["Argentinien", true], ["Spanien", true], ["England", true],
    ["Uruguay", true], ["Niederlande", false], ["Portugal", false], ["Belgien", false], ["Kroatien", false] ] },

  { q: "Spieleabend: Wie viele sind es?", type: "num", items: [
    ["Schach – Figuren pro Spieler", 16], ["Dame (8×8) – Steine pro Spieler", 12], ["Mühle – Steine pro Spieler", 9],
    ["Mensch ärgere Dich nicht – Figuren pro Spieler", 4], ["Backgammon – Steine pro Spieler", 15],
    ["Domino (Doppel-Sechs) – Steine", 28], ["Skat – Karten pro Spieler", 10], ["Skat – Karten im Skat", 2],
    ["Würfel – Summe aller Augen", 21], ["Go – Linien pro Brettseite", 19] ] },

  { q: "In welchem Jahrhundert wurde der Komponist geboren?", type: "choice",
    options: ["16. Jh.", "17. Jh.", "18. Jh.", "19. Jh.", "20. Jh."], items: [
    ["Johann Sebastian Bach", "17. Jh."], ["Antonio Vivaldi", "17. Jh."], ["Georg Friedrich Händel", "17. Jh."],
    ["Joseph Haydn", "18. Jh."], ["Wolfgang Amadeus Mozart", "18. Jh."], ["Ludwig van Beethoven", "18. Jh."],
    ["Franz Schubert", "18. Jh."], ["Frédéric Chopin", "19. Jh."], ["Richard Wagner", "19. Jh."], ["Johannes Brahms", "19. Jh."] ] },

  { q: "Liegt die Stadt am Rhein?", type: "tf", items: [
    ["Köln", true], ["Basel", true], ["Düsseldorf", true], ["Mainz", true], ["Bonn", true],
    ["Koblenz", true], ["Frankfurt am Main", false], ["Stuttgart", false], ["Hamburg", false], ["Dresden", false] ] },

  { q: "Welche Farbe hat die Figur?", type: "choice",
    options: ["Rot", "Orange", "Gelb", "Grün", "Blau"], items: [
    ["Schlümpfe", "Blau"], ["Grinch", "Grün"], ["Pikachu", "Gelb"], ["Hulk", "Grün"], ["Kermit", "Grün"],
    ["Garfield", "Orange"], ["Ernie (Sesamstraße)", "Orange"], ["Krümelmonster", "Blau"], ["Elmo", "Rot"], ["SpongeBob", "Gelb"] ] },

  { q: "An wie viele Länder grenzt …?", type: "num", items: [
    ["Deutschland", 9], ["Österreich", 8], ["Schweiz", 5], ["Polen", 7], ["Italien", 6],
    ["Dänemark", 1], ["Portugal", 1], ["Luxemburg", 3], ["Belgien", 4], ["Tschechien", 4] ] },

  { q: "Ist das ein Edelgas?", type: "tf", items: [
    ["Helium", true], ["Neon", true], ["Argon", true], ["Krypton", true], ["Xenon", true],
    ["Radon", true], ["Stickstoff", false], ["Chlor", false], ["Wasserstoff", false], ["Fluor", false] ] },

  { q: "In welchem Jahr erschien / startete …?", type: "num", items: [
    ["Star Wars (Episode IV)", 1977], ["Tetris (Original)", 1984], ["Super Mario Bros. (NES)", 1985],
    ["Die Simpsons (erste Folge)", 1989], ["Harry Potter und der Stein der Weisen (Buch)", 1997],
    ["Google (Gründung)", 1998], ["Wikipedia", 2001], ["Facebook", 2004], ["YouTube", 2005], ["Erstes iPhone (Vorstellung)", 2007] ] },

  { q: "In welchem Bundesland liegt die Stadt?", type: "choice",
    options: ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern",
      "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"], items: [
    ["Erfurt", "Thüringen"], ["Kiel", "Schleswig-Holstein"], ["Rostock", "Mecklenburg-Vorpommern"], ["Regensburg", "Bayern"],
    ["Freiburg im Breisgau", "Baden-Württemberg"], ["Kassel", "Hessen"], ["Trier", "Rheinland-Pfalz"], ["Leipzig", "Sachsen"],
    ["Magdeburg", "Sachsen-Anhalt"], ["Osnabrück", "Niedersachsen"] ] },

  { q: "Ist das ein Sternzeichen (Tierkreis)?", type: "tf", items: [
    ["Widder", true], ["Stier", true], ["Krebs", true], ["Skorpion", true], ["Steinbock", true],
    ["Wassermann", true], ["Drache", false], ["Adler", false], ["Bär", false], ["Delfin", false] ] },

  { q: "Wie viele Punkte gibt es dafür?", type: "num", items: [
    ["Basketball – Wurf hinter der Dreierlinie", 3], ["Basketball – Freiwurf", 1], ["American Football – Touchdown", 6],
    ["American Football – Field Goal", 3], ["Rugby Union – Versuch (Try)", 5], ["Fußball-Bundesliga – Sieg", 3],
    ["Fußball-Bundesliga – Unentschieden", 1], ["Darts – Bullseye", 50], ["Darts – Triple 20", 60], ["Scrabble (deutsch) – Q", 10] ] },

  { q: "Welche Sprache ist (Haupt-)Amtssprache?", type: "choice",
    options: ["Deutsch", "Englisch", "Französisch", "Spanisch", "Portugiesisch", "Arabisch"], items: [
    ["Brasilien", "Portugiesisch"], ["Argentinien", "Spanisch"], ["Senegal", "Französisch"], ["Mosambik", "Portugiesisch"],
    ["Ägypten", "Arabisch"], ["Australien", "Englisch"], ["Chile", "Spanisch"], ["Elfenbeinküste", "Französisch"],
    ["Österreich", "Deutsch"], ["Angola", "Portugiesisch"] ] },

  { q: "Hat der Monat 31 Tage?", type: "tf", items: [
    ["Januar", true], ["Februar", false], ["März", true], ["April", false], ["Mai", true],
    ["Juni", false], ["Juli", true], ["August", true], ["September", false], ["November", false] ] },

  { q: "Wie viele Jahre dauert die reguläre Amtszeit?", type: "num", items: [
    ["US-Präsident", 4], ["Deutscher Bundespräsident", 5], ["Bundestag (Wahlperiode)", 4], ["Französischer Präsident", 5],
    ["Österreichischer Bundespräsident", 6], ["Schweizer Bundespräsident", 1], ["Mexikanischer Präsident", 6],
    ["US-Senator", 6], ["UN-Generalsekretär", 5], ["Russischer Präsident", 6] ] },

  { q: "Aus welchem Land stammt die Band?", type: "choice",
    options: ["Deutschland", "Großbritannien", "Irland", "Frankreich", "Schweden", "Norwegen", "USA", "Australien"], items: [
    ["ABBA", "Schweden"], ["U2", "Irland"], ["Rammstein", "Deutschland"], ["AC/DC", "Australien"], ["Queen", "Großbritannien"],
    ["Metallica", "USA"], ["Daft Punk", "Frankreich"], ["a-ha", "Norwegen"], ["Kraftwerk", "Deutschland"], ["Nirvana", "USA"] ] },

  { q: "Wie viel Grad sind es?", type: "num", unit: "°", items: [
    ["Siedepunkt von Wasser (°C, Normaldruck)", 100], ["Gefrierpunkt von Wasser (°C)", 0], ["Gefrierpunkt von Wasser (°F)", 32],
    ["Rechter Winkel", 90], ["Winkelsumme im Dreieck", 180], ["Vollkreis", 360],
    ["Normale Körpertemperatur (°C, gerundet)", 37], ["Absoluter Nullpunkt (°C, gerundet)", -273],
    ["Innenwinkel im gleichseitigen Dreieck", 60], ["Innenwinkel im regelmäßigen Sechseck", 120] ] },

  { q: "Gehört die Insel zu den Kanaren?", type: "tf", items: [
    ["Teneriffa", true], ["Gran Canaria", true], ["Lanzarote", true], ["Fuerteventura", true], ["La Palma", true],
    ["La Gomera", true], ["Mallorca", false], ["Ibiza", false], ["Madeira", false], ["Korsika", false] ] },

  { q: "Wer hat das geschrieben?", type: "choice",
    options: ["Goethe", "Schiller", "Lessing", "Kafka", "Thomas Mann", "Brecht"], items: [
    ["Faust", "Goethe"], ["Die Räuber", "Schiller"], ["Nathan der Weise", "Lessing"], ["Die Verwandlung", "Kafka"],
    ["Buddenbrooks", "Thomas Mann"], ["Die Dreigroschenoper", "Brecht"], ["Wilhelm Tell", "Schiller"],
    ["Der Zauberberg", "Thomas Mann"], ["Der Process", "Kafka"], ["Die Leiden des jungen Werthers", "Goethe"] ] },

  { q: "Rang unter den höchsten Bergen der Welt?", hint: "1 = höchster Berg", type: "rank", items: [
    ["Mount Everest", 1], ["K2", 2], ["Kangchendzönga", 3], ["Lhotse", 4], ["Makalu", 5],
    ["Cho Oyu", 6], ["Dhaulagiri", 7], ["Manaslu", 8], ["Nanga Parbat", 9], ["Annapurna", 10] ] },

  { q: "Ist das ein direktes Nachbarland von Deutschland?", type: "tf", items: [
    ["Dänemark", true], ["Polen", true], ["Tschechien", true], ["Schweiz", true], ["Luxemburg", true],
    ["Belgien", true], ["Liechtenstein", false], ["Slowakei", false], ["Italien", false], ["Ungarn", false] ] },

  { q: "Welcher Planet ist gemeint?", type: "choice",
    options: ["Merkur", "Venus", "Erde", "Mars", "Jupiter", "Saturn", "Uranus", "Neptun"], items: [
    ["Größter Planet", "Jupiter"], ["Der „Rote Planet“", "Mars"], ["Sonnennächster Planet", "Merkur"],
    ["Heißeste Oberfläche", "Venus"], ["Am weitesten von der Sonne entfernt", "Neptun"], ["Rotiert fast „liegend“", "Uranus"],
    ["Hat den Mond Titan", "Saturn"], ["Hat die Monde Phobos und Deimos", "Mars"],
    ["Flüssiges Wasser an der Oberfläche", "Erde"], ["Hat den Mond Ganymed", "Jupiter"] ] },

  { q: "Ist das die richtige Hauptstadt?", type: "tf", items: [
    ["Australien – Sydney", false], ["Kanada – Ottawa", true], ["Türkei – Istanbul", false], ["Schweiz – Bern", true],
    ["Brasilien – Brasília", true], ["Marokko – Casablanca", false], ["Neuseeland – Auckland", false],
    ["Nigeria – Abuja", true], ["Vietnam – Hanoi", true], ["USA – New York", false] ] },

  { q: "Zum wievielten Hochzeitstag gehört diese Hochzeit?", type: "num", items: [
    ["Papierne Hochzeit", 1], ["Hölzerne Hochzeit", 5], ["Rosenhochzeit", 10], ["Kristallhochzeit", 15],
    ["Porzellanhochzeit", 20], ["Silberne Hochzeit", 25], ["Perlenhochzeit", 30], ["Rubinhochzeit", 40],
    ["Goldene Hochzeit", 50], ["Diamantene Hochzeit", 60] ] },

  { q: "Aus welchem Land stammt das Gericht?", type: "choice",
    options: ["Spanien", "Italien", "Frankreich", "Griechenland", "Ungarn", "Türkei", "Mexiko", "Indien", "Thailand", "Vietnam", "Japan", "Südkorea"], items: [
    ["Paella", "Spanien"], ["Sushi", "Japan"], ["Gulasch", "Ungarn"], ["Moussaka", "Griechenland"], ["Risotto", "Italien"],
    ["Tacos", "Mexiko"], ["Kimchi", "Südkorea"], ["Pad Thai", "Thailand"], ["Ratatouille", "Frankreich"], ["Phở", "Vietnam"] ] },
];

// Weitere gültige Schreibweisen für Freitext-Antworten.
// Groß-/Kleinschreibung, Akzente, Bindestriche und kleine Tippfehler werden ohnehin toleriert.
// Jahrhunderte („18. Jh.“) verstehen automatisch auch „18“, „18. Jahrhundert“ und „1700er“.
// Was hier fehlt, entscheidet im Spiel der Mitspieler.
window.SCHLAU10_ALIASES = {
  "USA": ["Vereinigte Staaten", "Vereinigte Staaten von Amerika", "Amerika", "US", "U.S.A.", "United States"],
  "Großbritannien": ["England", "UK", "GB", "Vereinigtes Königreich", "Britannien", "United Kingdom"],
  "Südkorea": ["Korea", "Republik Korea"],
  "Ozeanien": ["Australien", "Australien und Ozeanien", "Australien/Ozeanien"],
  "Nordamerika": ["Nord-Amerika"],
  "Südamerika": ["Süd-Amerika", "Lateinamerika"],
  "Elfenbeinküste": ["Côte d'Ivoire"],
  // Bundesländer
  "Nordrhein-Westfalen": ["NRW"],
  "Baden-Württemberg": ["BW", "BaWü", "Ba-Wü"],
  "Mecklenburg-Vorpommern": ["MV", "Meck-Pomm", "Mecklenburg", "MeckPomm"],
  "Schleswig-Holstein": ["SH"],
  "Rheinland-Pfalz": ["RLP", "RP"],
  "Sachsen-Anhalt": ["LSA"],
  // Autoren
  "Goethe": ["Johann Wolfgang von Goethe", "J. W. von Goethe", "Johann Wolfgang Goethe"],
  "Schiller": ["Friedrich Schiller", "Friedrich von Schiller"],
  "Lessing": ["Gotthold Ephraim Lessing", "G. E. Lessing"],
  "Kafka": ["Franz Kafka"],
  "Thomas Mann": ["Mann", "T. Mann"],
  "Brecht": ["Bertolt Brecht", "Bert Brecht"],
};
