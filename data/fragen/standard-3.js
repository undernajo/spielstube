// Erweiterung 2: Videospiele, Technik, Comics, Sport, Natur, Musik, Geografie.
window.SCHLAU10_CARDS.push(

  // ===================== Videospiele =====================
  { q: "Ist das eine Nintendo-Figur?", type: "tf", items: [
    ["Mario", true], ["Luigi", true], ["Link", true], ["Donkey Kong", true], ["Kirby", true],
    ["Samus Aran", true], ["Sonic", false], ["Crash Bandicoot", false], ["Lara Croft", false], ["Master Chief", false] ] },

  { q: "Aus welcher Spielereihe stammt die Figur?", type: "choice", items: [
    ["Lara Croft", "Tomb Raider"], ["Master Chief", "Halo"], ["Kratos", "God of War"], ["Geralt von Riva", "The Witcher", ["Witcher"]],
    ["Steve (mit Spitzhacke)", "Minecraft"], ["Ezio Auditore", "Assassin's Creed"], ["Link", "The Legend of Zelda", ["Zelda", "Legend of Zelda"]],
    ["Solid Snake", "Metal Gear", ["Metal Gear Solid"]], ["Arthur Morgan", "Red Dead Redemption", ["Red Dead", "Red Dead Redemption 2"]],
    ["Jonesy", "Fortnite"] ] },

  { q: "In welchem Jahrzehnt erschien das Spiel?", type: "decade", items: [
    ["Pong", 1970], ["Space Invaders", 1970], ["Pac-Man", 1980], ["The Legend of Zelda", 1980], ["Pokémon Rot und Grün", 1990],
    ["Super Mario 64", 1990], ["Die Sims", 2000], ["World of Warcraft", 2000], ["Grand Theft Auto V", 2010], ["Elden Ring", 2020] ] },

  // ===================== Technik =====================
  { q: "Welche Firma steckt dahinter?", type: "choice", items: [
    ["iPhone", "Apple"], ["Windows", "Microsoft"], ["Android", "Google", ["Alphabet"]], ["PlayStation", "Sony"], ["Galaxy-Smartphones", "Samsung"],
    ["Kindle", "Amazon"], ["Instagram", "Meta", ["Facebook"]], ["ChatGPT", "OpenAI"], ["Switch", "Nintendo"], ["Claude", "Anthropic"] ] },

  { q: "Wofür steht die Abkürzung?", type: "choice", items: [
    ["WWW", "World Wide Web"], ["USB", "Universal Serial Bus"], ["PDF", "Portable Document Format"], ["GPS", "Global Positioning System"],
    ["WLAN", "Wireless Local Area Network", ["Wireless LAN"]], ["SMS", "Short Message Service"], ["DVD", "Digital Versatile Disc", ["Digital Video Disc"]],
    ["LED", "Light Emitting Diode", ["Leuchtdiode", "Light-Emitting Diode"]], ["HTML", "Hypertext Markup Language"], ["KI", "Künstliche Intelligenz"] ] },

  { q: "Technik: In welchem Jahrzehnt war das?", type: "decade", items: [
    ["Die erste E-Mail wird verschickt", 1970], ["Erstes Handy-Telefonat (Motorola)", 1970], ["Die erste Audio-CD kommt auf den Markt", 1980],
    ["Apple stellt den ersten Macintosh vor", 1980], ["Das World Wide Web wird öffentlich", 1990], ["Das MP3-Format wird veröffentlicht", 1990],
    ["Netflix startet sein Streaming", 2000], ["Instagram startet", 2010], ["TikTok startet international", 2010], ["ChatGPT erscheint", 2020] ] },

  // ===================== Comics & Helden =====================
  { q: "Ist das ein Marvel-Held?", type: "tf", items: [
    ["Spider-Man", true], ["Iron Man", true], ["Thor", true], ["Hulk", true], ["Black Panther", true],
    ["Doctor Strange", true], ["Batman", false], ["Superman", false], ["Wonder Woman", false], ["Aquaman", false] ] },

  { q: "Comics: Wie heißt …?", type: "choice", items: [
    ["… der beste Freund von Asterix?", "Obelix"], ["… der fluchende Kapitän bei Tim und Struppi?", "Kapitän Haddock", ["Haddock"]],
    ["… das Pferd von Lucky Luke?", "Jolly Jumper"], ["… einer der Neffen von Donald Duck?", "Tick", ["Trick", "Track", "Tick, Trick und Track"]],
    ["… die Stadt von Dagobert Duck?", "Entenhausen"], ["… das Herrchen von Garfield?", "Jon", ["Jon Arbuckle"]],
    ["… der Stofftiger von Calvin?", "Hobbes"], ["… die Freundin von Popeye?", "Olivia", ["Olive", "Olive Oyl"]],
    ["… der Butler von Batman?", "Alfred", ["Alfred Pennyworth"]], ["… der Heimatplanet von Superman?", "Krypton"] ] },

  // ===================== Sport =====================
  { q: "Aus welcher Sportart stammt der Begriff?", type: "choice", items: [
    ["Birdie", "Golf"], ["Touchdown", "American Football", ["Football"]], ["Slam Dunk", "Basketball"], ["Strike", "Bowling", ["Baseball", "Kegeln"]],
    ["Bully", "Eishockey", ["Hockey", "Feldhockey"]], ["Telemark-Landung", "Skispringen"], ["Checkout", "Darts"], ["Rochade", "Schach"],
    ["Rittberger", "Eiskunstlauf"], ["Try", "Rugby"] ] },

  { q: "War das Land schon Fußball-Europameister der Männer (bis 2024)?", type: "tf", items: [
    ["Deutschland", true], ["Spanien", true], ["Griechenland", true], ["Dänemark", true], ["Portugal", true],
    ["Niederlande", true], ["England", false], ["Belgien", false], ["Kroatien", false], ["Schweiz", false] ] },

  { q: "Wie viele Titel sind es?", hint: "Stand: Ende 2025", type: "num", items: [
    ["EM-Titel der deutschen Männer", 3], ["EM-Titel der spanischen Männer", 4], ["F1-WM-Titel von Michael Schumacher", 7],
    ["F1-WM-Titel von Sebastian Vettel", 4], ["Wimbledon-Siege von Roger Federer", 8], ["Grand-Slam-Titel von Steffi Graf (Einzel)", 22],
    ["Wimbledon-Siege von Boris Becker", 3], ["Olympische Goldmedaillen von Usain Bolt", 8], ["Olympische Goldmedaillen von Michael Phelps", 23],
    ["NBA-Titel von Dirk Nowitzki", 1] ] },

  // ===================== Natur =====================
  { q: "Kann das Tier fliegen?", type: "tf", items: [
    ["Fledermaus", true], ["Kolibri", true], ["Libelle", true], ["Flughund", true], ["Albatros", true],
    ["Marienkäfer", true], ["Strauß", false], ["Pinguin", false], ["Kiwi", false], ["Emu", false] ] },

  { q: "Tierisch geschätzt!", hint: "ungefähr – Einheit steht dabei", type: "estimate", tol: 0.2, items: [
    ["Höchstgeschwindigkeit Gepard (km/h)", 110], ["Laufgeschwindigkeit Strauß (km/h)", 70], ["Tragzeit Elefant (Monate)", 22],
    ["Tragzeit Pferd (Monate)", 11], ["Schwangerschaft Mensch (Wochen)", 40], ["Höhe einer Giraffe (m)", 5.5],
    ["Schlaf eines Koalas pro Tag (Stunden)", 20], ["Eier einer Legehenne pro Jahr", 300], ["Lebensdauer einer Sommer-Arbeitsbiene (Tage)", 40],
    ["Maximale Länge eines Blauwals (m)", 30] ] },

  { q: "Welches Tier ist das Wappen- oder Nationaltier?", type: "choice", items: [
    ["Deutschland", "Adler", ["Bundesadler"]], ["Frankreich", "Hahn", ["Gallischer Hahn"]], ["Schottland", "Einhorn"], ["Wales", "Drache"],
    ["Berlin", "Bär"], ["Neuseeland", "Kiwi"], ["Indien", "Tiger", ["Bengal-Tiger", "Königstiger"]], ["Kanada", "Biber"],
    ["England", "Löwe", ["Löwen"]], ["USA", "Weißkopfseeadler", ["Adler", "Seeadler"]] ] },

  // ===================== Geografie =====================
  { q: "Wie heißt die Hauptstadt?", hint: "für Profis", type: "choice", items: [
    ["Kasachstan", "Astana"], ["Myanmar", "Naypyidaw", ["Naypyitaw", "Nay Pyi Taw"]], ["Bolivien", "Sucre", ["La Paz"]],
    ["Elfenbeinküste", "Yamoussoukro"], ["Tansania", "Dodoma"], ["Malta", "Valletta"], ["Liechtenstein", "Vaduz"],
    ["Belize", "Belmopan"], ["Pakistan", "Islamabad"], ["Philippinen", "Manila"] ] },

  { q: "Ordne die Himmelskörper nach Durchmesser.", hint: "1 = größter", type: "rank", items: [
    ["Sonne", 1], ["Jupiter", 2], ["Saturn", 3], ["Uranus", 4], ["Neptun", 5],
    ["Erde", 6], ["Venus", 7], ["Mars", 8], ["Jupitermond Ganymed", 9], ["Merkur", 10] ] },

  { q: "Ordne die Länder nach Einwohnern.", hint: "1 = meiste Einwohner (unter diesen zehn)", type: "rank", items: [
    ["Indien", 1], ["China", 2], ["USA", 3], ["Indonesien", 4], ["Brasilien", 5],
    ["Russland", 6], ["Japan", 7], ["Deutschland", 8], ["Frankreich", 9], ["Österreich", 10] ] },

  { q: "Ordne die Länder nach Fläche.", hint: "1 = größtes (unter diesen zehn)", type: "rank", items: [
    ["Russland", 1], ["Kanada", 2], ["Brasilien", 3], ["Australien", 4], ["Indien", 5],
    ["Argentinien", 6], ["Mexiko", 7], ["Frankreich", 8], ["Deutschland", 9], ["Italien", 10] ] },

  { q: "Welches Land ist gemeint?", type: "choice", items: [
    ["Land der tausend Seen", "Finnland"], ["Land der aufgehenden Sonne", "Japan"], ["Die grüne Insel", "Irland"],
    ["Land des Lächelns", "Thailand"], ["Der Stiefel Europas", "Italien"], ["Land der Fjorde", "Norwegen"],
    ["Land der Pharaonen", "Ägypten"], ["Reich der Mitte", "China"], ["Land der Tulpen und Windmühlen", "Niederlande", ["Holland"]],
    ["Land der langen weißen Wolke", "Neuseeland"] ] },

  // ===================== Musik =====================
  { q: "Musik in Zahlen", type: "num", items: [
    ["Saiten einer Violine", 4], ["Kanzellen einer diatonischen Mundharmonika (Standard)", 10], ["Linien eines Notensystems", 5],
    ["Halbtöne in einer Oktave", 12], ["Sinfonien von Beethoven", 9], ["Musiker in einem Streichquartett", 4],
    ["Saiten einer Ukulele", 4], ["Saiten einer Konzertharfe", 47], ["Schläge pro Takt beim Walzer", 3], ["Ventile einer Trompete", 3] ] },
);
