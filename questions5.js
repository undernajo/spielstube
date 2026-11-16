// Erweiterung 4 (Teil 1): Mythologie, Kunst & Architektur, Weltraum, Mathe, Autos & Verkehr.
window.SCHLAU10_CARDS.push(

  // ===================== Mythologie & Religion =====================
  { q: "Welcher griechische Gott ist gemeint?", type: "choice", items: [
    ["Göttervater, schleudert Blitze", "Zeus"], ["Gott des Meeres", "Poseidon"], ["Herrscher der Unterwelt", "Hades"],
    ["Göttin der Liebe", "Aphrodite"], ["Göttin der Weisheit, Schutzgöttin Athens", "Athene", ["Athena"]], ["Gott des Krieges", "Ares"],
    ["Götterbote mit Flügelschuhen", "Hermes"], ["Gott des Weines", "Dionysos"], ["Gott der Schmiedekunst", "Hephaistos", ["Hephaestus", "Hephästus"]],
    ["Göttin der Jagd, Zwillingsschwester Apollons", "Artemis"] ] },

  { q: "Wie heißt der griechische Gott bei den Römern?", type: "choice", items: [
    ["Zeus", "Jupiter", ["Iupiter"]], ["Poseidon", "Neptun", ["Neptunus"]], ["Hades", "Pluto"], ["Aphrodite", "Venus"], ["Athene", "Minerva"],
    ["Ares", "Mars"], ["Hermes", "Merkur", ["Mercurius"]], ["Dionysos", "Bacchus"], ["Hephaistos", "Vulcanus", ["Vulkan"]], ["Artemis", "Diana"] ] },

  { q: "Nordische Mythologie: Wie heißt …?", type: "choice", items: [
    ["… der einäugige Göttervater?", "Odin", ["Wotan", "Wodan"]], ["… der Donnergott?", "Thor", ["Donar"]], ["… sein Hammer?", "Mjölnir", ["Mjöllnir"]],
    ["… der listige Gestaltwandler?", "Loki"], ["… die Halle der gefallenen Krieger?", "Walhalla", ["Valhalla"]], ["… der Weltenbaum?", "Yggdrasil"],
    ["… der Weltuntergang?", "Ragnarök", ["Ragnarök", "Götterdämmerung"]], ["… die Kriegerjungfrauen?", "Walküren", ["Walküre", "Valkyren"]],
    ["… die Regenbogenbrücke?", "Bifröst"], ["… Odins achtbeiniges Pferd?", "Sleipnir"] ] },

  { q: "Ist das ein Gott des alten Ägypten?", type: "tf", items: [
    ["Ra", true], ["Osiris", true], ["Isis", true], ["Anubis", true], ["Horus", true], ["Seth", true], ["Thot", true],
    ["Baal", false], ["Quetzalcoatl", false], ["Ganesha", false] ] },

  { q: "Griechische Sagen: Wer ist gemeint?", type: "choice", items: [
    ["Stahl das Feuer für die Menschen", "Prometheus"], ["Trägt das Himmelsgewölbe", "Atlas"], ["Held mit zwölf Arbeiten", "Herakles", ["Herkules", "Hercules"]],
    ["Nur an der Ferse verwundbar", "Achilles", ["Achill", "Achilleus"]], ["Zehn Jahre Irrfahrt nach Troja", "Odysseus"], ["Verliebte sich in sein Spiegelbild", "Narziss", ["Narkissos"]],
    ["Flog zu nah an die Sonne", "Ikarus"], ["Öffnete die Büchse mit allen Übeln", "Pandora"], ["Schlangenhaar, versteinernder Blick", "Medusa"],
    ["Besiegte den Minotaurus", "Theseus"] ] },

  { q: "Kommt die Figur in der Bibel vor?", type: "tf", items: [
    ["Mose", true], ["Noah", true], ["David", true], ["Goliat", true], ["Jona", true], ["Maria Magdalena", true],
    ["Herkules", false], ["Merlin", false], ["Gilgamesch", false], ["Siegfried", false] ] },

  { q: "Religion in Zahlen", type: "num", items: [
    ["Gebote auf Moses' Steintafeln", 10], ["Apostel Jesu", 12], ["Säulen des Islam", 5], ["Bücher Mose", 5], ["Evangelien im Neuen Testament", 4],
    ["Plagen Ägyptens", 10], ["Kerzenplätze am Chanukka-Leuchter", 9], ["Todsünden", 7], ["Stämme Israels", 12], ["Tage der christlichen Fastenzeit", 40] ] },

  { q: "Welches Fest ist gemeint?", type: "choice", items: [
    ["Geburt Jesu", "Weihnachten"], ["Auferstehung Jesu", "Ostern"], ["Ausgießung des Heiligen Geistes", "Pfingsten"],
    ["40 Tage nach Ostern", "Christi Himmelfahrt", ["Himmelfahrt", "Vatertag"]], ["Beginn der Fastenzeit", "Aschermittwoch"],
    ["Jüdisches Lichterfest", "Chanukka", ["Hanukkah", "Chanukah"]], ["Fastenmonat im Islam", "Ramadan"], ["Fest des Fastenbrechens", "Zuckerfest", ["Eid al-Fitr", "Ramadanfest"]],
    ["Hinduistisches Lichterfest", "Diwali", ["Divali", "Deepavali"]], ["Jüdisches Neujahrsfest", "Rosch ha-Schana", ["Rosch Haschana", "Rosh Hashanah"]] ] },

  { q: "Zu welcher Religion gehört die heilige Schrift?", type: "choice", items: [
    ["Koran", "Islam"], ["Tora", "Judentum"], ["Talmud", "Judentum"], ["Bibel", "Christentum"], ["Veden", "Hinduismus"],
    ["Guru Granth Sahib", "Sikhismus", ["Sikh", "Sikhs"]], ["Pali-Kanon (Tipitaka)", "Buddhismus"], ["Avesta", "Zoroastrismus", ["Zarathustrismus", "Parsismus"]],
    ["Tao Te King", "Daoismus", ["Taoismus"]], ["Buch Mormon", "Mormonen", ["Mormonentum", "Kirche Jesu Christi der Heiligen der Letzten Tage"]] ] },

  { q: "Welches Fabelwesen ist gemeint?", type: "choice", items: [
    ["Halb Mensch, halb Pferd", "Zentaur", ["Kentaur", "Centaur"]], ["Halb Frau, halb Fisch", "Meerjungfrau", ["Nixe", "Sirene"]], ["Pferd mit einem Horn", "Einhorn"],
    ["Vogel, der aus der Asche aufersteht", "Phönix", ["Phoenix"]], ["Riese mit nur einem Auge", "Zyklop", ["Kyklop"]], ["Halb Mensch, halb Stier", "Minotaurus"],
    ["Löwenkörper mit Menschenkopf", "Sphinx"], ["Dreiköpfiger Höllenhund", "Zerberus", ["Kerberos", "Cerberus"]], ["Vielköpfige Schlange", "Hydra"],
    ["Geflügeltes Pferd", "Pegasus"] ] },

  // ===================== Kunst & Architektur =====================
  { q: "Wer hat es geschaffen?", hint: "Skulpturen & Bauwerke", type: "choice", names: true, items: [
    ["David-Statue in Florenz", "Michelangelo"], ["Der Denker", "Auguste Rodin"], ["Sagrada Família", "Antoni Gaudí"], ["Eiffelturm", "Gustave Eiffel"],
    ["Glaspyramide vor dem Louvre", "I. M. Pei", ["Pei"]], ["Guggenheim-Museum in Bilbao", "Frank Gehry"], ["Hundertwasserhaus in Wien", "Friedensreich Hundertwasser"],
    ["Elbphilharmonie", "Herzog & de Meuron", ["Herzog", "de Meuron", "Herzog und de Meuron"]], ["Bauhaus-Gebäude in Dessau", "Walter Gropius"],
    ["Haus Fallingwater", "Frank Lloyd Wright", ["Lloyd Wright"]] ] },

  { q: "In welchem Museum ist das Kunstwerk?", type: "choice", items: [
    ["Mona Lisa", "Louvre"], ["Die Nachtwache", "Rijksmuseum"], ["Die Geburt der Venus", "Uffizien", ["Uffizi"]], ["Guernica", "Reina Sofía", ["Museo Reina Sofía"]],
    ["Sternennacht", "MoMA", ["Museum of Modern Art"]], ["Das Mädchen mit dem Perlenohrring", "Mauritshuis"], ["Der Kuss (Klimt)", "Belvedere", ["Oberes Belvedere"]],
    ["Die Erschaffung Adams", "Sixtinische Kapelle", ["Vatikanische Museen", "Vatikan"]], ["Las Meninas", "Prado", ["Museo del Prado"]],
    ["Büste der Nofretete", "Neues Museum", ["Neues Museum Berlin", "Museumsinsel"]] ] },

  { q: "Welche Kunstrichtung ist gemeint?", type: "choice", items: [
    ["Zerfließende Uhren, Traumbilder", "Surrealismus"], ["In Würfel und Flächen zerlegte Formen", "Kubismus"], ["Lichtstimmungen, Monet", "Impressionismus"],
    ["Suppendosen von Andy Warhol", "Pop-Art", ["Pop Art"]], ["Prunkvoll, verschnörkelt, 17. Jahrhundert", "Barock"], ["Spitzbögen und hohe Kathedralen", "Gotik"],
    ["Rundbögen und dicke Mauern", "Romanik"], ["Wiedergeburt der Antike, Leonardo da Vinci", "Renaissance"], ["Florale Ornamente um 1900", "Jugendstil", ["Art nouveau"]],
    ["Kunst-Unsinn ab 1916 in Zürich", "Dadaismus", ["Dada"]] ] },

  { q: "Hat Leonardo da Vinci das gemalt?", type: "tf", items: [
    ["Mona Lisa", true], ["Das Abendmahl", true], ["Die Dame mit dem Hermelin", true], ["Die Verkündigung", true], ["Die Felsgrottenmadonna", true],
    ["Anna selbdritt", true], ["Die Geburt der Venus", false], ["Die Nachtwache", false], ["Sternennacht", false], ["Die Erschaffung Adams", false] ] },

  { q: "In welchem Jahrhundert wurde das Bauwerk errichtet bzw. begonnen?", type: "choice", items: [
    ["Kolosseum", "1. Jh."], ["Hagia Sophia (heutiger Bau)", "6. Jh."], ["Notre-Dame de Paris", "12. Jh."], ["Kölner Dom", "13. Jh."],
    ["Petersdom (Neubau)", "16. Jh."], ["Taj Mahal", "17. Jh."], ["Brandenburger Tor", "18. Jh."], ["Schloss Neuschwanstein", "19. Jh."],
    ["Empire State Building", "20. Jh."], ["Burj Khalifa", "21. Jh."] ] },

  { q: "Kunst & Bauwerke in Zahlen", type: "num", items: [
    ["Säulen des Brandenburger Tors", 12], ["Pferde der Quadriga", 4], ["Haupttürme des Kölner Doms", 2], ["Stockwerke des Empire State Building", 102],
    ["Ecken des Pentagons", 5], ["Arme der Venus von Milo", 0], ["Säulen an der Front des Parthenon", 8], ["Strahlen der Krone der Freiheitsstatue", 7],
    ["Köpfe am Mount Rushmore", 4], ["Seitenflächen einer Pyramide mit quadratischer Grundfläche", 4] ] },

  { q: "Ordne die Bauwerke nach Höhe.", hint: "1 = höchstes", type: "rank", items: [
    ["Burj Khalifa", 1], ["Shanghai Tower", 2], ["CN Tower", 3], ["Empire State Building", 4], ["Berliner Fernsehturm", 5],
    ["Eiffelturm", 6], ["Kölner Dom", 7], ["Big Ben (Elizabeth Tower)", 8], ["Freiheitsstatue (mit Sockel)", 9], ["Schiefer Turm von Pisa", 10] ] },

  { q: "Welche Stadt ist gemeint?", hint: "deutsche Wahrzeichen", type: "choice", items: [
    ["Münster mit dem höchsten Kirchturm der Welt", "Ulm"], ["Steinerne Brücke über die Donau", "Regensburg"], ["Kaiserburg und Christkindlesmarkt", "Nürnberg"],
    ["Herkules-Statue im Bergpark Wilhelmshöhe", "Kassel"], ["Hauptkirche „Michel“", "Hamburg"], ["Roland-Statue vor dem Rathaus", "Bremen"],
    ["Schlossruine über dem Neckar", "Heidelberg"], ["Dom mit dem Thron Karls des Großen", "Aachen"], ["Rheinturm und Königsallee", "Düsseldorf"],
    ["Erster Fernsehturm aus Stahlbeton", "Stuttgart"] ] },

  { q: "Hat Vincent van Gogh das gemalt?", type: "tf", items: [
    ["Sternennacht", true], ["Sonnenblumen", true], ["Caféterrasse am Abend", true], ["Die Kartoffelesser", true], ["Das Schlafzimmer in Arles", true],
    ["Weizenfeld mit Raben", true], ["Seerosen", false], ["Der Kuss", false], ["Der Schrei", false], ["Die Nachtwache", false] ] },

  { q: "Steht das Bauwerk in Paris?", type: "tf", items: [
    ["Eiffelturm", true], ["Louvre", true], ["Arc de Triomphe", true], ["Sacré-Cœur", true], ["Notre-Dame", true],
    ["Centre Pompidou", true], ["Sagrada Família", false], ["Atomium", false], ["Kolosseum", false], ["Big Ben", false] ] },

  // ===================== Weltraum =====================
  { q: "Zu welchem Himmelskörper gehört der Mond?", type: "choice", items: [
    ["Io", "Jupiter"], ["Europa", "Jupiter"], ["Kallisto", "Jupiter"], ["Enceladus", "Saturn"], ["Rhea", "Saturn"], ["Mimas", "Saturn"],
    ["Triton", "Neptun"], ["Miranda", "Uranus"], ["Oberon", "Uranus"], ["Charon", "Pluto"] ] },

  { q: "Wer war's?", hint: "Raumfahrt", type: "choice", names: true, items: [
    ["Erster Deutscher im All (1978)", "Sigmund Jähn"], ["Erster Westdeutscher im All", "Ulf Merbold"], ["Erste Frau im All", "Valentina Tereschkowa", ["Tereshkova"]],
    ["Zweiter Mensch auf dem Mond", "Buzz Aldrin"], ["Blieb bei Apollo 11 in der Mondumlaufbahn", "Michael Collins"],
    ["Erster deutscher Kommandant der ISS", "Alexander Gerst"], ["Erster Mensch im freien Weltraum", "Alexei Leonow", ["Leonov"]],
    ["Namensgeber des berühmten Weltraumteleskops", "Edwin Hubble"], ["Erster Amerikaner in der Erdumlaufbahn", "John Glenn"],
    ["Raketenpionier aus Siebenbürgen", "Hermann Oberth"] ] },

  { q: "Ist das heute offiziell ein Planet unseres Sonnensystems?", type: "tf", items: [
    ["Merkur", true], ["Venus", true], ["Mars", true], ["Jupiter", true], ["Saturn", true], ["Uranus", true], ["Neptun", true],
    ["Pluto", false], ["Ceres", false], ["Sonne", false] ] },

  { q: "Weltraum in Zahlen", type: "num", items: [
    ["Monde des Mars", 2], ["Nummer der Apollo-Mission der ersten Mondlandung", 11], ["Astronauten an Bord von Apollo 11", 3],
    ["Stufen der Saturn-V-Rakete", 3], ["Minuten, die Sonnenlicht zur Erde braucht (gerundet)", 8], ["Sterne des Großen Wagens", 7],
    ["Hauptphasen des Mondes", 4], ["Grad, um die sich die Erde pro Stunde dreht", 15], ["Offiziell anerkannte Zwergplaneten", 5], ["Stunden eines Erdtages", 24] ] },

  { q: "Raumfahrt: In welchem Jahrzehnt war das?", type: "decade", items: [
    ["Hündin Laika fliegt ins All", 1950], ["Start der Voyager-Sonden", 1970], ["Erster Flug eines Space Shuttles", 1980], ["Challenger-Unglück", 1980],
    ["Start des Hubble-Teleskops", 1990], ["Erstes Modul der ISS im All", 1990], ["Pluto wird zum Zwergplaneten erklärt", 2000],
    ["Mars-Rover Curiosity landet", 2010], ["Erstes Foto eines Schwarzen Lochs", 2010], ["Start des James-Webb-Teleskops", 2020] ] },

  { q: "Weltraum – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", tol: 0.2, items: [
    ["Durchmesser der Sonne (km)", 1392000], ["Durchmesser des Jupiters (km)", 139820], ["Kleinster Abstand Erde–Mars (Mio. km)", 55],
    ["Flughöhe der ISS (km)", 400], ["Geschwindigkeit der ISS (km/h)", 28000], ["Dauer einer ISS-Erdumrundung (Minuten)", 92],
    ["Temperatur auf der Venus (°C)", 465], ["Ein Venusjahr (Erdtage)", 225], ["Ein Saturnjahr (Erdjahre)", 29.5],
    ["Entfernung zu Proxima Centauri (Lichtjahre)", 4.2] ] },

  { q: "Was am Himmel ist gemeint?", type: "choice", items: [
    ["Hellster Stern am Nachthimmel", "Sirius"], ["Zeigt die Nordrichtung", "Polarstern"], ["Himmelsjäger mit Gürtel", "Orion"],
    ["Sternbild in W-Form", "Kassiopeia", ["Cassiopeia"]], ["Nächste große Spiralgalaxie", "Andromeda", ["Andromedagalaxie", "Andromedanebel"]],
    ["Unsere Galaxie", "Milchstraße"], ["Das „Siebengestirn“", "Plejaden"], ["Nächster Stern nach der Sonne", "Proxima Centauri", ["Alpha Centauri"]],
    ["„Abendstern“", "Venus"], ["Roter Riese an Orions Schulter", "Beteigeuze", ["Betelgeuse"]] ] },

  { q: "Ist das eine echte Raumfahrtmission?", type: "tf", items: [
    ["Voyager", true], ["Rosetta", true], ["Cassini", true], ["Curiosity", true], ["Apollo", true], ["Artemis", true],
    ["Galactica", false], ["Nostromo", false], ["Serenity", false], ["Event Horizon", false] ] },

  // ===================== Mathe & Logik =====================
  { q: "Welche Zahl ist das?", hint: "römische Zahlen", type: "num", items: [
    ["XIV", 14], ["XL", 40], ["XC", 90], ["LXX", 70], ["IX", 9], ["CD", 400], ["DCCC", 800], ["MCM", 1900], ["MDCCLXXVI", 1776], ["MMXXVI", 2026] ] },

  { q: "Rechne im Kopf!", type: "num", items: [
    ["13 × 13", 169], ["2 hoch 10", 1024], ["Wurzel aus 144", 12], ["25 % von 360", 90], ["7! (7 Fakultät)", 5040],
    ["111 × 111", 12321], ["1 + 2 + 3 + … + 10", 55], ["1000 : 8", 125], ["9 × 9 × 9", 729], ["Quersumme von 2026", 10] ] },

  { q: "Wie heißt die Form?", type: "choice", items: [
    ["Drei Ecken", "Dreieck"], ["Fünf Ecken", "Fünfeck", ["Pentagon"]], ["Sechs Ecken", "Sechseck", ["Hexagon"]], ["Acht Ecken", "Achteck", ["Oktogon"]],
    ["Vier gleich lange Seiten, rechte Winkel", "Quadrat"], ["Vier gleich lange Seiten, schiefe Winkel", "Raute", ["Rhombus"]],
    ["Viereck mit genau einem Paar paralleler Seiten", "Trapez"], ["Viereck mit zwei Paaren paralleler Seiten", "Parallelogramm"],
    ["Körper aus sechs gleichen Quadraten", "Würfel"], ["Körper, rund wie ein Ball", "Kugel"] ] },

  { q: "Welche Zahl kommt als Nächstes?", type: "num", items: [
    ["2, 4, 8, 16, …", 32], ["1, 1, 2, 3, 5, 8, …", 13], ["1, 4, 9, 16, …", 25], ["3, 6, 9, 12, …", 15], ["1, 3, 6, 10, …", 15],
    ["2, 3, 5, 7, 11, …", 13], ["100, 50, 25, …", 12.5], ["1, 8, 27, 64, …", 125], ["10, 20, 40, 70, …", 110], ["1, 2, 6, 24, …", 120] ] },

  { q: "Ist die Zahl durch 3 teilbar?", type: "tf", items: [
    ["123", true], ["456", true], ["789", true], ["1002", true], ["2025", true], ["111", true],
    ["100", false], ["1001", false], ["2026", false], ["515", false] ] },

  { q: "Mathe-Begriffe: Wie heißt …?", type: "choice", items: [
    ["… das Ergebnis einer Addition?", "Summe"], ["… das Ergebnis einer Subtraktion?", "Differenz"], ["… das Ergebnis einer Multiplikation?", "Produkt"],
    ["… das Ergebnis einer Division?", "Quotient"], ["… die Kreiszahl 3,14…?", "Pi"], ["… die längste Seite im rechtwinkligen Dreieck?", "Hypotenuse"],
    ["… ein Winkel zwischen 90° und 180°?", "stumpfer Winkel", ["stumpf"]], ["… die Strecke vom Kreismittelpunkt zum Rand?", "Radius", ["Halbmesser"]],
    ["… eine Zahl, die nur durch 1 und sich selbst teilbar ist?", "Primzahl"], ["… der Satz a² + b² = c²?", "Satz des Pythagoras", ["Pythagoras"]] ] },

  { q: "Umrechnen: Wie viele sind es?", type: "num", items: [
    ["Zentimeter in einem Meter", 100], ["Meter in einer Seemeile", 1852], ["Gramm in einem Pfund", 500], ["Milliliter in einem Liter", 1000],
    ["Quadratmeter in einem Hektar", 10000], ["Quadratmeter in einem Ar", 100], ["Zentimeter in einem Zoll", 2.54], ["Zentimeter in einem Fuß", 30.48],
    ["Sekunden an einem Tag", 86400], ["Bit in einem Byte", 8] ] },

  { q: "Ist das eine Quadratzahl?", type: "tf", items: [
    ["16", true], ["49", true], ["81", true], ["121", true], ["144", true], ["225", true],
    ["50", false], ["99", false], ["125", false], ["200", false] ] },

  { q: "Ordne die Zahlwörter der Größe nach.", hint: "1 = größte (deutsche Zahlwörter)", type: "rank", items: [
    ["Googol", 1], ["Billiarde", 2], ["Billion", 3], ["Milliarde", 4], ["Million", 5],
    ["Tausend", 6], ["Gros", 7], ["Hundert", 8], ["Dutzend", 9], ["Paar", 10] ] },

  // ===================== Autos & Verkehr =====================
  { q: "Welches Land hat dieses Auto-Kennzeichen?", hint: "Teil 2", type: "choice", items: [
    ["S", "Schweden"], ["N", "Norwegen"], ["FIN", "Finnland"], ["P", "Portugal"], ["GR", "Griechenland"],
    ["TR", "Türkei"], ["HR", "Kroatien"], ["CZ", "Tschechien"], ["SLO", "Slowenien"], ["L", "Luxemburg"] ] },

  { q: "Aus welchem Land stammt die Automarke?", hint: "Teil 2", type: "choice", items: [
    ["Škoda", "Tschechien"], ["Seat", "Spanien"], ["Dacia", "Rumänien"], ["Jaguar", "Großbritannien", ["England", "UK"]], ["Alfa Romeo", "Italien"],
    ["Citroën", "Frankreich"], ["Hyundai", "Südkorea", ["Korea"]], ["Subaru", "Japan"], ["Lada", "Russland"], ["Chevrolet", "USA", ["Amerika"]] ] },

  { q: "Welche Stadt hat dieses Kennzeichen?", hint: "Teil 2", type: "choice", items: [
    ["N", "Nürnberg"], ["H", "Hannover"], ["E", "Essen"], ["DO", "Dortmund"], ["KA", "Karlsruhe"],
    ["HD", "Heidelberg"], ["MZ", "Mainz"], ["KI", "Kiel"], ["R", "Regensburg"], ["A", "Augsburg"] ] },

  { q: "Stimmt das im deutschen Straßenverkehr?", type: "tf", items: [
    ["Innerorts gilt meist Tempo 50.", true], ["Auf Autobahnen gibt es kein generelles Tempolimit.", true],
    ["An ungeregelten Kreuzungen gilt rechts vor links.", true], ["Ab 0,5 Promille droht ein Bußgeld.", true],
    ["In der Probezeit gilt 0,0 Promille.", true], ["Das Stoppschild ist achteckig.", true], ["In Deutschland fährt man links.", false],
    ["Auf Autobahnen ist Tempo 130 Pflicht.", false], ["Kinder dürfen ab 10 Jahren ohne Kindersitz fahren.", false],
    ["Eine Rettungsgasse bildet man nur auf Autobahnen.", false] ] },

  { q: "Wie heißt das Verkehrszeichen?", type: "choice", items: [
    ["Rotes Achteck mit weißer Schrift", "Stoppschild", ["Stop", "Stopp", "Halt"]], ["Gelbe Raute mit weißem Rand", "Vorfahrtsstraße", ["Vorfahrtstraße"]],
    ["Auf der Spitze stehendes Dreieck mit rotem Rand", "Vorfahrt gewähren", ["Vorfahrt achten"]], ["Roter Kreis mit weißem Querbalken", "Verbot der Einfahrt", ["Einfahrt verboten"]],
    ["Blaues Schild mit weißem P", "Parkplatz", ["Parken"]], ["Weißer Kreis mit rotem Rand, sonst leer", "Verbot für Fahrzeuge aller Art", ["Durchfahrt verboten", "Fahrverbot"]],
    ["Blauer Kreis, roter Rand, rotes Kreuz", "Absolutes Halteverbot", ["Halteverbot", "Halten verboten"]],
    ["Blauer Kreis, roter Rand, ein roter Schrägstrich", "Eingeschränktes Halteverbot", ["Parkverbot"]],
    ["Dreieck mit Ausrufezeichen", "Gefahrstelle", ["Achtung", "Gefahr", "Allgemeine Gefahrstelle"]], ["Rot-weißes X vor Bahngleisen", "Andreaskreuz"] ] },

  { q: "Auto-Geschichte: In welchem Jahrzehnt war das?", type: "decade", items: [
    ["Ford Model T geht in Serie", 1900], ["Erste Autobahn Köln–Bonn", 1930], ["Der erste Trabant", 1950], ["Der erste Mini", 1950],
    ["Der erste VW Golf", 1970], ["Gurtpflicht auf den Vordersitzen", 1970], ["ABS geht in Serie", 1970], ["Airbag geht in Serie", 1980],
    ["Toyota Prius (erstes Großserien-Hybridauto)", 1990], ["Tesla Model S kommt auf den Markt", 2010] ] },

  { q: "Rund ums Auto: Wie viele sind es?", type: "num", items: [
    ["Zylinder eines V8-Motors", 8], ["Sitze im Smart fortwo", 2], ["Mindestprofiltiefe von Reifen (mm)", 1.6],
    ["Mindestalter für den Autoführerschein (regulär)", 18], ["Mindestalter beim begleiteten Fahren", 17], ["Punkte in Flensburg bis zum Führerscheinentzug", 8],
    ["Jahre Probezeit", 2], ["Jahre zwischen zwei TÜV-Prüfungen (Pkw)", 2], ["Jahre bis zur ersten TÜV-Prüfung beim Neuwagen", 3],
    ["Stunden beim Rennen von Le Mans", 24] ] },

  { q: "Wie heißt das Verkehrsmittel?", type: "choice", items: [
    ["Schnellzug der Deutschen Bahn", "ICE"], ["Japanischer Hochgeschwindigkeitszug", "Shinkansen"], ["Französischer Hochgeschwindigkeitszug", "TGV"],
    ["Spitzname der Londoner U-Bahn", "Tube"], ["Pariser U-Bahn", "Métro", ["Metro"]], ["Ruderboot in Venedig", "Gondel"],
    ["Dreirädriges Taxi in Thailand", "Tuk-Tuk", ["Tuktuk"]], ["Seilgezogene Straßenbahn in San Francisco", "Cable Car"],
    ["Zug durch den Ärmelkanal", "Eurostar"], ["Legendärer Luxuszug Paris–Istanbul", "Orient-Express", ["Orient Express"]] ] },

  { q: "Verkehr – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", tol: 0.15, items: [
    ["Pkw in Deutschland (Mio.)", 49], ["Länge des deutschen Schienennetzes (km)", 33000], ["Geschwindigkeitsrekord des TGV (km/h)", 575],
    ["Spannweite eines Airbus A380 (m)", 80], ["Maximale Passagierzahl eines A380", 850], ["Reiseflughöhe eines Linienflugzeugs (km)", 11],
    ["Länge eines 40-Fuß-Containers (m)", 12.2], ["Höchstgeschwindigkeit eines Formel-1-Autos (km/h)", 370],
    ["Gewicht eines VW Golf (kg)", 1300], ["Spurweite der Normalspur (mm)", 1435] ] },
);
