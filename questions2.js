// Erweiterung des Fragenvorrats.
// Typen: tf (zutreffende finden), num (exakte Zahl), rank (Platz 1–10), decade (Jahrzehnt, Antwort = Startjahr),
//        estimate (Schätzen, ±tol, Standard 10 %), choice (Freitext; optional 3. Eintrag = weitere Schreibweisen,
//        names: true = Nachname reicht).
window.SCHLAU10_CARDS.push(

  // ===================== Jahrzehnt =====================
  { q: "In welchem Jahrzehnt erschien der Song?", type: "decade", items: [
    ["„Bohemian Rhapsody“ – Queen", 1970], ["„(I Can't Get No) Satisfaction“ – The Rolling Stones", 1960],
    ["„Thriller“ (Album) – Michael Jackson", 1980], ["„Smells Like Teen Spirit“ – Nirvana", 1990],
    ["„Wonderwall“ – Oasis", 1990], ["„Crazy in Love“ – Beyoncé", 2000], ["„Rolling in the Deep“ – Adele", 2010],
    ["„Dancing Queen“ – ABBA", 1970], ["„99 Luftballons“ – Nena", 1980], ["„Blinding Lights“ – The Weeknd", 2010] ] },

  { q: "In welchem Jahrzehnt kam der Film ins Kino?", type: "decade", items: [
    ["Vom Winde verweht", 1930], ["Casablanca", 1940], ["Psycho (Hitchcock)", 1960], ["Der Pate", 1970],
    ["E.T. – Der Außerirdische", 1980], ["Zurück in die Zukunft", 1980], ["Titanic", 1990],
    ["Der Herr der Ringe: Die Gefährten", 2000], ["Avatar – Aufbruch nach Pandora", 2000], ["Barbie", 2020] ] },

  { q: "In welchem Jahrzehnt geschah das?", type: "decade", items: [
    ["Bell meldet das Telefon zum Patent an", 1870], ["Benz baut den Patent-Motorwagen", 1880],
    ["Röntgen entdeckt die Röntgenstrahlen", 1890], ["Erste Olympische Spiele der Neuzeit", 1890],
    ["Erster Motorflug der Brüder Wright", 1900], ["Fleming entdeckt das Penicillin", 1920],
    ["Start von Sputnik 1", 1950], ["Juri Gagarin fliegt ins All", 1960],
    ["Erste Herztransplantation", 1960], ["Die erste SMS wird verschickt", 1990] ] },

  { q: "In welchem Jahrzehnt startete die Serie?", type: "decade", items: [
    ["Star Trek (Originalserie)", 1960], ["Tatort", 1970], ["Die Sendung mit der Maus", 1970],
    ["Lindenstraße", 1980], ["Gute Zeiten, schlechte Zeiten", 1990], ["Friends", 1990],
    ["Breaking Bad", 2000], ["Game of Thrones", 2010], ["Stranger Things", 2010], ["Squid Game", 2020] ] },

  { q: "In welchem Jahrzehnt kam das Gerät auf den Markt?", type: "decade", items: [
    ["Atari 2600", 1970], ["Sony Walkman", 1970], ["Commodore 64", 1980], ["Game Boy", 1980],
    ["PlayStation (die erste)", 1990], ["Nintendo 64", 1990], ["iPod", 2000], ["Nintendo Wii", 2000],
    ["Nintendo Switch", 2010], ["PlayStation 5", 2020] ] },

  { q: "In welchem Jahrzehnt wurde die Person geboren?", type: "decade", items: [
    ["Albert Einstein", 1870], ["Charlie Chaplin", 1880], ["Queen Elizabeth II.", 1920], ["Angela Merkel", 1950],
    ["Michael Jackson", 1950], ["Barack Obama", 1960], ["Elon Musk", 1970], ["Lionel Messi", 1980],
    ["Taylor Swift", 1980], ["Kylian Mbappé", 1990] ] },

  // ===================== Rang =====================
  { q: "Der wievielte Bundespräsident war das?", hint: "1 = erster Bundespräsident", type: "rank", items: [
    ["Theodor Heuss", 1], ["Heinrich Lübke", 2], ["Gustav Heinemann", 3], ["Walter Scheel", 4], ["Karl Carstens", 5],
    ["Richard von Weizsäcker", 6], ["Roman Herzog", 7], ["Johannes Rau", 8], ["Horst Köhler", 9], ["Christian Wulff", 10] ] },

  { q: "Ordne die US-Präsidenten nach Amtsantritt.", hint: "1 = am frühesten im Amt", type: "rank", items: [
    ["George Washington", 1], ["Abraham Lincoln", 2], ["Theodore Roosevelt", 3], ["Franklin D. Roosevelt", 4],
    ["John F. Kennedy", 5], ["Richard Nixon", 6], ["Ronald Reagan", 7], ["Bill Clinton", 8], ["Barack Obama", 9], ["Joe Biden", 10] ] },

  { q: "Rang der größten Bundesländer nach Fläche?", hint: "1 = größtes Bundesland", type: "rank", items: [
    ["Bayern", 1], ["Niedersachsen", 2], ["Baden-Württemberg", 3], ["Nordrhein-Westfalen", 4], ["Brandenburg", 5],
    ["Mecklenburg-Vorpommern", 6], ["Hessen", 7], ["Sachsen-Anhalt", 8], ["Rheinland-Pfalz", 9], ["Sachsen", 10] ] },

  { q: "Ordne die Ereignisse zeitlich.", hint: "1 = am frühesten", type: "rank", items: [
    ["Bau der Cheops-Pyramide", 1], ["Gründung Roms (der Sage nach)", 2], ["Ermordung Julius Caesars", 3],
    ["Kaiserkrönung Karls des Großen", 4], ["Magna Carta", 5], ["Kolumbus erreicht Amerika", 6],
    ["Beginn des Dreißigjährigen Kriegs", 7], ["Französische Revolution", 8], ["Gründung des Deutschen Kaiserreichs", 9],
    ["Beginn des Ersten Weltkriegs", 10] ] },

  { q: "Bei der wievielten Fußball-WM war das Land zum ersten Mal Gastgeber?", hint: "1 = erste WM (1930)", type: "rank", items: [
    ["Uruguay", 1], ["Italien", 2], ["Frankreich", 3], ["Brasilien", 4], ["Schweiz", 5],
    ["Schweden", 6], ["Chile", 7], ["England", 8], ["Mexiko", 9], ["Deutschland (BRD)", 10] ] },

  // ===================== Schätzen (±10 %) =====================
  { q: "Wie hoch ist das?", type: "estimate", unit: "m", items: [
    ["Zugspitze", 2962], ["Mount Everest", 8849], ["Mont Blanc", 4806], ["Matterhorn", 4478], ["Kilimandscharo", 5895],
    ["Eiffelturm", 330], ["Kölner Dom", 157], ["Burj Khalifa", 828], ["Berliner Fernsehturm", 368],
    ["Freiheitsstatue (mit Sockel)", 93] ] },

  { q: "Wie viele Einwohner hat die Stadt (ungefähr)?", type: "estimate", items: [
    ["Berlin", 3750000], ["Hamburg", 1900000], ["München", 1550000], ["Köln", 1050000], ["Wien", 2000000],
    ["Zürich", 430000], ["Paris (Stadtgebiet)", 2100000], ["London (Greater London)", 8900000],
    ["New York City", 8400000], ["Tokio (Präfektur)", 14000000] ] },

  { q: "Wie lang ist das?", type: "estimate", unit: "km", items: [
    ["Rhein", 1230], ["Donau", 2850], ["Elbe", 1094], ["Nil", 6650], ["Marathonstrecke", 42.195],
    ["Eurotunnel unter dem Ärmelkanal", 50], ["Gotthard-Basistunnel", 57], ["Panamakanal", 82],
    ["Erdumfang am Äquator", 40075], ["Luftlinie Berlin–München", 504] ] },

  { q: "Zahlen aus dem All – schätze!", hint: "Einheit steht dabei", type: "estimate", items: [
    ["Entfernung Erde–Mond (km)", 384400], ["Entfernung Erde–Sonne (Mio. km)", 149.6], ["Durchmesser der Erde (km)", 12742],
    ["Durchmesser des Mondes (km)", 3474], ["Lichtgeschwindigkeit (km pro Sekunde)", 299792],
    ["Alter des Universums (Mrd. Jahre)", 13.8], ["Alter der Erde (Mrd. Jahre)", 4.54],
    ["Ein Marsjahr (Erdtage)", 687], ["Ein Mondumlauf um die Erde (Tage)", 27.3], ["Oberflächentemperatur der Sonne (°C)", 5500] ] },

  { q: "Der menschliche Körper – schätze!", hint: "bei Erwachsenen, ungefähr", type: "estimate", items: [
    ["Knochen im Körper", 206], ["Liter Blut", 5], ["Haare auf dem Kopf", 100000], ["Zähne im Milchgebiss", 20],
    ["Muskeln", 650], ["Wasseranteil am Körper (%)", 60], ["Gewicht des Gehirns (g)", 1400],
    ["Ruhepuls (Schläge pro Minute)", 70], ["Atemzüge pro Minute in Ruhe", 15], ["Länge aller Blutgefäße (km)", 100000] ] },

  { q: "Wie viele sind es (ungefähr)?", type: "estimate", items: [
    ["Mitgliedstaaten der UN", 193], ["Länder in Afrika", 54], ["Sprachen weltweit", 7000],
    ["Einwohner Deutschlands (Mio.)", 84], ["Menschen auf der Erde (Mrd.)", 8.2], ["Gemeinden in Deutschland", 10800],
    ["Autobahnkilometer in Deutschland", 13200], ["Sitze im Bundestag (seit 2025)", 630],
    ["Fußballvereine im DFB", 24000], ["Seen in Finnland", 188000] ] },

  // ===================== Wer war's? (Nachname reicht) =====================
  { q: "Wer hat das erfunden oder entdeckt?", type: "choice", names: true, items: [
    ["Telefon (Patent 1876)", "Alexander Graham Bell"], ["Relativitätstheorie", "Albert Einstein"],
    ["Buchdruck mit beweglichen Lettern", "Johannes Gutenberg"], ["Röntgenstrahlen", "Wilhelm Conrad Röntgen"],
    ["Penicillin", "Alexander Fleming"], ["Patent-Motorwagen (erstes Auto)", "Carl Benz"], ["Dynamit", "Alfred Nobel"],
    ["Gravitationsgesetz", "Isaac Newton"], ["Evolutionstheorie", "Charles Darwin"], ["Computer Z3", "Konrad Zuse"] ] },

  { q: "Wer hat das gemalt?", type: "choice", names: true, items: [
    ["Mona Lisa", "Leonardo da Vinci", ["Leonardo", "da Vinci"]], ["Sternennacht", "Vincent van Gogh", ["van Gogh", "Gogh"]],
    ["Der Schrei", "Edvard Munch"], ["Guernica", "Pablo Picasso"], ["Die Geburt der Venus", "Sandro Botticelli"],
    ["Das Mädchen mit dem Perlenohrring", "Jan Vermeer", ["Vermeer", "Johannes Vermeer"]],
    ["Die Erschaffung Adams (Sixtinische Kapelle)", "Michelangelo"], ["Die Nachtwache", "Rembrandt"],
    ["Der Wanderer über dem Nebelmeer", "Caspar David Friedrich", ["Friedrich", "C. D. Friedrich"]],
    ["Die Beständigkeit der Erinnerung (zerfließende Uhren)", "Salvador Dalí"] ] },

  { q: "Wer singt das?", type: "choice", names: true, items: [
    ["Purple Rain", "Prince"], ["Like a Virgin", "Madonna"], ["Hello (2015)", "Adele"], ["Imagine", "John Lennon"],
    ["Rocket Man", "Elton John", ["Elton"]], ["Shake It Off", "Taylor Swift"], ["Bad Guy", "Billie Eilish"],
    ["Männer", "Herbert Grönemeyer"], ["Atemlos durch die Nacht", "Helene Fischer"], ["Ein Kompliment", "Sportfreunde Stiller", ["Sportfreunde"]] ] },

  { q: "Wer spielte die Hauptrolle?", type: "choice", names: true, items: [
    ["Jack Sparrow in „Fluch der Karibik“", "Johnny Depp"], ["Forrest Gump", "Tom Hanks"],
    ["Jack in „Titanic“", "Leonardo DiCaprio"], ["Der Terminator", "Arnold Schwarzenegger"], ["Rocky", "Sylvester Stallone"],
    ["Vivian in „Pretty Woman“", "Julia Roberts"], ["Ethan Hunt in „Mission: Impossible“", "Tom Cruise"],
    ["Tony Stark in „Iron Man“", "Robert Downey Jr.", ["Downey", "Robert Downey"]], ["Indiana Jones", "Harrison Ford"],
    ["John McClane in „Stirb langsam“", "Bruce Willis"] ] },

  { q: "Wer war's?", type: "choice", names: true, items: [
    ["Erster Mensch auf dem Mond", "Neil Armstrong"], ["Erster Mensch im All", "Juri Gagarin", ["Yuri Gagarin"]],
    ["Erster Bundeskanzler", "Konrad Adenauer"], ["Erste Bundeskanzlerin", "Angela Merkel"],
    ["„Ich bin ein Berliner“ (1963)", "John F. Kennedy", ["JFK"]], ["„I have a dream“ (1963)", "Martin Luther King", ["MLK", "King"]],
    ["95 Thesen (1517)", "Martin Luther"], ["Segelte 1492 nach Amerika", "Christoph Kolumbus", ["Columbus", "Christopher Columbus"]],
    ["Erster Deutscher Kaiser (1871)", "Wilhelm I.", ["Wilhelm der Erste", "Wilhelm 1", "Kaiser Wilhelm", "Wilhelm"]],
    ["„Kanzler der Einheit“", "Helmut Kohl"] ] },

  { q: "Wer hat das Buch geschrieben?", type: "choice", names: true, items: [
    ["Harry Potter", "J. K. Rowling", ["Rowling", "Joanne K. Rowling"]], ["Der Herr der Ringe", "J. R. R. Tolkien", ["Tolkien"]],
    ["Die unendliche Geschichte", "Michael Ende"], ["1984", "George Orwell"], ["Der kleine Prinz", "Antoine de Saint-Exupéry", ["Saint-Exupéry", "Exupéry"]],
    ["Emil und die Detektive", "Erich Kästner"], ["Pippi Langstrumpf", "Astrid Lindgren"], ["Das Parfum", "Patrick Süskind"],
    ["Krabat", "Otfried Preußler"], ["Sherlock Holmes", "Arthur Conan Doyle", ["Conan Doyle", "Doyle"]] ] },

  { q: "Wer ist der Bösewicht?", type: "choice", names: true, items: [
    ["Harry Potter", "Voldemort", ["Lord Voldemort", "Tom Riddle"]], ["Star Wars (Episode IV)", "Darth Vader", ["Vader"]],
    ["Batman", "Joker", ["Der Joker"]], ["Superman", "Lex Luthor"], ["Sherlock Holmes", "Professor Moriarty", ["Moriarty"]],
    ["Peter Pan", "Captain Hook", ["Käpt'n Hook", "Kapitän Hook", "Hook"]], ["Der König der Löwen", "Scar"],
    ["Arielle, die Meerjungfrau", "Ursula"], ["101 Dalmatiner", "Cruella de Vil", ["Cruella"]], ["Super Mario", "Bowser", ["König Koopa"]] ] },

  // ===================== Lückenwort =====================
  { q: "Welche Farbe fehlt?", hint: "Bands, Songs & Filme", type: "choice", items: [
    ["___ Floyd", "Pink"], ["Deep ___", "Purple"], ["___ Day (Band)", "Green"], ["___ Hot Chili Peppers", "Red"],
    ["___ Submarine (Beatles)", "Yellow"], ["Men in ___", "Black"], ["Fifty Shades of ___", "Grey", ["Gray"]],
    ["Die ___ Meile", "Grüne", ["grün"]], ["Der ___ Panther", "rosarote", ["rosarot"]], ["Die ___ Zora", "Rote", ["rot"]] ] },

  { q: "Welches Tier fehlt im Titel?", type: "choice", items: [
    ["Das Schweigen der ___", "Lämmer", ["Lamm"]], ["Der König der ___", "Löwen", ["Löwe"]], ["The ___ of Wall Street", "Wolf"],
    ["Ein ___ namens Wanda", "Fisch"], ["Der weiße ___", "Hai"], ["Kung Fu ___", "Panda"], ["Der ___ von Baskerville", "Hund"],
    ["Black ___", "Swan", ["Schwan"]], ["Die ___ (Hitchcock)", "Vögel", ["Vogel"]], ["Der ___flüsterer", "Pferde", ["Pferd"]] ] },

  { q: "Welches Wort mit S fehlt im Titel?", type: "choice", items: [
    ["Krieg der ___", "Sterne"], ["Der ___ des Manitu", "Schuh"], ["Die ___ und das Biest", "Schöne"],
    ["___ and the City", "Sex"], ["Harry Potter und der ___ der Weisen", "Stein"],
    ["Harry Potter und die Kammer des ___", "Schreckens"], ["___ und die sieben Zwerge", "Schneewittchen"],
    ["___ – Der tollkühne Held", "Shrek"], ["Der ___ im Silbersee", "Schatz"], ["___ Holmes", "Sherlock"] ] },

  { q: "Ergänze das Sprichwort!", type: "choice", items: [
    ["Morgenstund hat ___ im Mund", "Gold"], ["Wer anderen eine ___ gräbt, fällt selbst hinein", "Grube"],
    ["Der ___ fällt nicht weit vom Stamm", "Apfel"], ["Lügen haben kurze ___", "Beine"], ["Viele ___ verderben den Brei", "Köche"],
    ["Ohne Fleiß kein ___", "Preis"], ["Übung macht den ___", "Meister"], ["Hunde, die bellen, ___ nicht", "beißen"],
    ["Kleider machen ___", "Leute"], ["Wer rastet, der ___", "rostet"] ] },

  { q: "Welche Zahl fehlt im Titel?", type: "num", items: [
    ["Die ___ Musketiere", 3], ["In ___ Tagen um die Welt", 80], ["___ Dalmatiner", 101], ["Ocean's ___", 11],
    ["___ Freunde (Enid Blyton)", 5], ["Apollo ___", 13], ["___ Jahre Einsamkeit", 100], ["Catch-___", 22],
    ["___ Seconds to Mars", 30], ["Die glorreichen ___", 7] ] },

  { q: "Welcher Ort fehlt im Titel?", type: "choice", items: [
    ["Schlaflos in ___", "Seattle"], ["Jenseits von ___", "Afrika", ["Africa"]], ["___ Calling (The Clash)", "London"],
    ["Sweet Home ___", "Alabama"], ["Hotel ___", "California", ["Kalifornien"]], ["Englishman in ___", "New York"],
    ["Born in the ___", "U.S.A.", ["USA"]], ["Ich hab noch einen Koffer in ___", "Berlin"], ["Ein Amerikaner in ___", "Paris"],
    ["Viva Las ___", "Vegas"] ] },

  // ===================== Zutreffende finden =====================
  { q: "Ist das ein Insekt?", type: "tf", items: [
    ["Ameise", true], ["Biene", true], ["Marienkäfer", true], ["Libelle", true], ["Schmetterling", true],
    ["Spinne", false], ["Skorpion", false], ["Zecke", false], ["Tausendfüßer", false], ["Assel", false] ] },

  { q: "Ist das eine Landeshauptstadt?", type: "tf", items: [
    ["Mainz", true], ["Wiesbaden", true], ["Hannover", true], ["Erfurt", true], ["Schwerin", true],
    ["Saarbrücken", true], ["Frankfurt am Main", false], ["Köln", false], ["Bonn", false], ["Leipzig", false] ] },

  { q: "Ist das ein echtes chemisches Element?", type: "tf", items: [
    ["Neptunium", true], ["Einsteinium", true], ["Mendelevium", true], ["Germanium", true], ["Plutonium", true],
    ["Kryptonit", false], ["Vibranium", false], ["Adamantium", false], ["Mithril", false], ["Unobtainium", false] ] },

  { q: "Ist das eine Amtssprache der Schweiz?", type: "tf", items: [
    ["Deutsch", true], ["Französisch", true], ["Italienisch", true], ["Rätoromanisch", true], ["Englisch", false],
    ["Latein", false], ["Spanisch", false], ["Niederländisch", false], ["Portugiesisch", false], ["Albanisch", false] ] },

  { q: "Liegt das Land überwiegend auf der Südhalbkugel?", type: "tf", items: [
    ["Australien", true], ["Argentinien", true], ["Südafrika", true], ["Neuseeland", true], ["Madagaskar", true],
    ["Chile", true], ["Mexiko", false], ["Ägypten", false], ["Indien", false], ["Japan", false] ] },

  { q: "War das ein Beatle?", type: "tf", items: [
    ["John Lennon", true], ["Paul McCartney", true], ["George Harrison", true], ["Ringo Starr", true], ["Mick Jagger", false],
    ["Freddie Mercury", false], ["Elton John", false], ["Bob Dylan", false], ["Keith Richards", false], ["David Bowie", false] ] },

  { q: "Ist das ein Nadelbaum?", type: "tf", items: [
    ["Fichte", true], ["Tanne", true], ["Kiefer", true], ["Lärche", true], ["Eibe", true],
    ["Buche", false], ["Eiche", false], ["Birke", false], ["Ahorn", false], ["Linde", false] ] },

  { q: "Gehört die Figur zur Familie Simpson?", type: "tf", items: [
    ["Homer", true], ["Marge", true], ["Bart", true], ["Lisa", true], ["Maggie", true],
    ["Ned", false], ["Moe", false], ["Milhouse", false], ["Apu", false], ["Krusty", false] ] },

  { q: "War das Land schon Gastgeber Olympischer Sommerspiele?", type: "tf", items: [
    ["Deutschland", true], ["Japan", true], ["Australien", true], ["Brasilien", true], ["China", true],
    ["Griechenland", true], ["Indien", false], ["Argentinien", false], ["Ägypten", false], ["Südafrika", false] ] },

  { q: "Ist das ein Pokémon?", type: "tf", items: [
    ["Pikachu", true], ["Glurak", true], ["Bisasam", true], ["Evoli", true], ["Mewtu", true],
    ["Agumon", false], ["Yoshi", false], ["Sonic", false], ["Kirby", false], ["Toad", false] ] },

  { q: "Ist das eine Programmiersprache?", type: "tf", items: [
    ["Python", true], ["Java", true], ["Rust", true], ["Kotlin", true], ["Swift", true],
    ["Ruby", true], ["HTML", false], ["Excel", false], ["Linux", false], ["Firefox", false] ] },

  { q: "Gehört das zum UNESCO-Welterbe?", type: "tf", items: [
    ["Kölner Dom", true], ["Wattenmeer", true], ["Aachener Dom", true], ["Zeche Zollverein", true], ["Schloss Sanssouci", true],
    ["Brandenburger Tor", false], ["Allianz Arena", false], ["Elbphilharmonie", false], ["Reichstagsgebäude", false], ["Zugspitze", false] ] },

  { q: "Ist das ein Käse aus Frankreich?", type: "tf", items: [
    ["Camembert", true], ["Brie", true], ["Roquefort", true], ["Comté", true], ["Reblochon", true],
    ["Gouda", false], ["Parmesan", false], ["Feta", false], ["Cheddar", false], ["Emmentaler", false] ] },

  { q: "Ist das ein offizielles Sternbild?", type: "tf", items: [
    ["Großer Bär", true], ["Orion", true], ["Kassiopeia", true], ["Schwan", true], ["Pegasus", true],
    ["Kleiner Hund", true], ["Großer Wagen", false], ["Milchstraße", false], ["Polarstern", false], ["Andromedanebel", false] ] },

  { q: "Wurde Formel-1-Weltmeister?", type: "tf", items: [
    ["Michael Schumacher", true], ["Sebastian Vettel", true], ["Nico Rosberg", true], ["Lewis Hamilton", true],
    ["Max Verstappen", true], ["Ayrton Senna", true], ["Ralf Schumacher", false], ["Nick Heidfeld", false],
    ["David Coulthard", false], ["Rubens Barrichello", false] ] },

  { q: "War das Land Teil der Sowjetunion?", type: "tf", items: [
    ["Ukraine", true], ["Belarus", true], ["Kasachstan", true], ["Litauen", true], ["Georgien", true],
    ["Armenien", true], ["Polen", false], ["Rumänien", false], ["Mongolei", false], ["Finnland", false] ] },

  { q: "Ist das Land eine Monarchie?", type: "tf", items: [
    ["Spanien", true], ["Schweden", true], ["Niederlande", true], ["Japan", true], ["Thailand", true],
    ["Belgien", true], ["Frankreich", false], ["Italien", false], ["Österreich", false], ["Irland", false] ] },

  { q: "Ist das ein Vulkan?", type: "tf", items: [
    ["Ätna", true], ["Vesuv", true], ["Stromboli", true], ["Fuji", true], ["Kilimandscharo", true],
    ["Mauna Loa", true], ["Matterhorn", false], ["Zugspitze", false], ["Mount Everest", false], ["Brocken", false] ] },

  { q: "Ist das eine Figur aus „Star Wars“?", type: "tf", items: [
    ["Yoda", true], ["Chewbacca", true], ["Prinzessin Leia", true], ["Obi-Wan Kenobi", true], ["Darth Maul", true],
    ["Spock", false], ["Gandalf", false], ["Frodo", false], ["Neo", false], ["Captain Kirk", false] ] },

  // ===================== Zahl (exakt) =====================
  { q: "Sport in Zahlen", type: "num", items: [
    ["Bowling – Pins", 10], ["Golf – Löcher auf einem Platz", 18], ["Snooker – rote Kugeln", 15],
    ["Pool-Billard – Kugeln inkl. weißer", 16], ["Darts – Zahlenfelder", 20], ["Profi-Boxen – Runden im WM-Kampf", 12],
    ["Eishockey – Drittel", 3], ["Tennis – Gewinnsätze im Grand-Slam-Herreneinzel", 3],
    ["Fußballtor – Breite in Metern", 7.32], ["Marathon – Länge in km", 42.195] ] },

  { q: "Welche Zahl steckt dahinter?", type: "num", items: [
    ["Ein Dutzend", 12], ["Ein halbes Dutzend", 6], ["Ein Schock", 60], ["Ein Gros", 144], ["Eine Dekade", 10],
    ["Ein Quartett", 4], ["Ein Quintett", 5], ["Ein Sextett", 6], ["Ein Oktett", 8], ["Ein Jahrtausend (Jahre)", 1000] ] },

  { q: "Rund um die Zeit", type: "num", items: [
    ["Tage im Schaltjahr", 366], ["Tage im Februar eines Schaltjahrs", 29], ["Wochen im Jahr (volle)", 52],
    ["Stunden einer Woche", 168], ["Minuten eines Tages", 1440], ["Sekunden einer Stunde", 3600],
    ["Adventssonntage", 4], ["Tage von Heiligabend bis Silvester (beide mitgezählt)", 8], ["Tage im Juli", 31],
    ["Monate mit 30 Tagen", 4] ] },

  { q: "Wie viele Teile hat die Filmreihe?", hint: "Hauptreihe, ohne Spin-offs", type: "num", items: [
    ["Harry Potter (Bücher)", 7], ["Harry Potter (Filme)", 8], ["Der Herr der Ringe (Filme)", 3], ["Der Hobbit (Filme)", 3],
    ["Star Wars – Skywalker-Saga (Episoden)", 9], ["James Bond mit Daniel Craig", 5], ["Zurück in die Zukunft", 3],
    ["Matrix", 4], ["Rocky (ohne Creed)", 6], ["Indiana Jones", 5] ] },

  { q: "Wie viele Mitglieder hat/hatte die Gruppe?", hint: "bekannteste Besetzung", type: "num", items: [
    ["The Beatles", 4], ["ABBA", 4], ["Spice Girls", 5], ["Die Ärzte", 3], ["Backstreet Boys", 5],
    ["Tokio Hotel", 4], ["Die Fantastischen Vier", 4], ["TKKG", 4], ["Fünf Freunde (nur Menschen)", 4], ["Die drei ???", 3] ] },

  { q: "Wie viele sind es?", hint: "Flaggen & Logos", type: "num", items: [
    ["Sterne auf der EU-Flagge", 12], ["Streifen auf der US-Flagge", 13], ["Sterne auf der Flagge Chinas", 5],
    ["Sterne auf der Flagge Australiens", 6], ["Spitzen des Ahornblatts auf Kanadas Flagge", 11],
    ["Kreuze im Union Jack", 3], ["Zacken des Mercedes-Sterns", 3], ["Ringe im Audi-Logo", 4],
    ["Sterne im Subaru-Logo", 6], ["Zacken eines Davidsterns", 6] ] },

  // ===================== Freitext =====================
  { q: "Wie heißt die Hauptstadt?", type: "choice", items: [
    ["Spanien", "Madrid"], ["Portugal", "Lissabon", ["Lisboa"]], ["Polen", "Warschau"], ["Tschechien", "Prag"],
    ["Ungarn", "Budapest"], ["Ägypten", "Kairo", ["Cairo"]], ["Argentinien", "Buenos Aires"], ["Südkorea", "Seoul"],
    ["Thailand", "Bangkok"], ["Island", "Reykjavík"] ] },

  { q: "Zu welchem Land gehört diese Hauptstadt?", type: "choice", items: [
    ["Ankara", "Türkei", ["Türkiye"]], ["Rabat", "Marokko"], ["Riga", "Lettland"], ["Vilnius", "Litauen"],
    ["Tallinn", "Estland"], ["Bratislava", "Slowakei"], ["Ljubljana", "Slowenien"], ["Zagreb", "Kroatien"],
    ["Kiew", "Ukraine"], ["Pretoria", "Südafrika"] ] },

  { q: "Wie heißt das Jungtier?", type: "choice", items: [
    ["Pferd", "Fohlen"], ["Kuh", "Kalb"], ["Schaf", "Lamm"], ["Hund", "Welpe"], ["Schwein", "Ferkel"],
    ["Reh", "Kitz", ["Rehkitz"]], ["Huhn", "Küken"], ["Gans", "Gössel"], ["Ziege", "Zicklein", ["Kitz", "Geißlein"]],
    ["Katze", "Kätzchen", ["Kitten", "Katzenjunges"]] ] },

  { q: "Wie heißt das weibliche Tier?", type: "choice", items: [
    ["Pferd", "Stute"], ["Rind", "Kuh"], ["Schwein", "Sau"], ["Hirsch", "Hirschkuh"], ["Huhn", "Henne"],
    ["Hund", "Hündin"], ["Löwe", "Löwin"], ["Fuchs", "Fähe"], ["Wildschwein", "Bache"], ["Reh", "Ricke", ["Geiß", "Rehgeiß"]] ] },

  { q: "Wie heißt das männliche Tier?", type: "choice", items: [
    ["Pferd", "Hengst"], ["Rind", "Stier", ["Bulle"]], ["Schwein", "Eber"], ["Schaf", "Widder", ["Bock", "Schafbock"]],
    ["Huhn", "Hahn"], ["Ente", "Erpel"], ["Gans", "Ganter", ["Gänserich"]], ["Ziege", "Bock", ["Ziegenbock"]],
    ["Wildschwein", "Keiler"], ["Reh", "Bock", ["Rehbock"]] ] },

  { q: "Aus welchem Land stammt die Marke?", type: "choice", items: [
    ["IKEA", "Schweden"], ["Nokia", "Finnland"], ["LEGO", "Dänemark"], ["Samsung", "Südkorea"], ["Nestlé", "Schweiz"],
    ["Zara", "Spanien"], ["Gucci", "Italien"], ["Heineken", "Niederlande", ["Holland"]], ["Huawei", "China"], ["Lacoste", "Frankreich"] ] },

  { q: "In welcher deutschen Stadt steht das?", type: "choice", items: [
    ["Brandenburger Tor", "Berlin"], ["Zwinger", "Dresden"], ["Elbphilharmonie", "Hamburg"], ["Porta Nigra", "Trier"],
    ["Hofbräuhaus", "München"], ["Holstentor", "Lübeck"], ["Römer (Rathaus)", "Frankfurt am Main", ["Frankfurt"]],
    ["Schloss Sanssouci", "Potsdam"], ["Völkerschlachtdenkmal", "Leipzig"], ["Wartburg", "Eisenach"] ] },

  { q: "In welcher Stadt steht das?", type: "choice", items: [
    ["Kolosseum", "Rom"], ["Sagrada Família", "Barcelona"], ["Big Ben", "London"], ["Opernhaus mit Segeldach", "Sydney"],
    ["Golden Gate Bridge", "San Francisco"], ["Cristo Redentor", "Rio de Janeiro", ["Rio"]], ["Atomium", "Brüssel"],
    ["Hagia Sophia", "Istanbul"], ["Petronas Towers", "Kuala Lumpur"], ["Schiefer Turm", "Pisa"] ] },

  { q: "Welche Sportart ist gemeint?", type: "choice", items: [
    ["Wimbledon", "Tennis"], ["Tour de France", "Radsport", ["Radfahren", "Radrennen", "Fahrrad", "Rad"]],
    ["Super Bowl", "American Football", ["Football"]], ["Stanley Cup", "Eishockey"], ["Ryder Cup", "Golf"],
    ["Vierschanzentournee", "Skispringen"], ["Hahnenkamm-Rennen", "Ski alpin", ["Skifahren", "Abfahrt", "Ski", "Skirennen"]],
    ["NBA Finals", "Basketball"], ["America's Cup", "Segeln"], ["Paris–Roubaix", "Radsport", ["Radfahren", "Radrennen", "Fahrrad", "Rad"]] ] },

  { q: "Welche Sportart betreibt/betrieb die Person?", type: "choice", items: [
    ["Roger Federer", "Tennis"], ["Michael Phelps", "Schwimmen"], ["Usain Bolt", "Leichtathletik", ["Sprint", "Laufen", "100 m"]],
    ["Dirk Nowitzki", "Basketball"], ["Tiger Woods", "Golf"], ["Magnus Carlsen", "Schach"],
    ["Michael Schumacher", "Formel 1", ["Motorsport", "Autorennen", "Formel eins", "F1"]], ["Muhammad Ali", "Boxen"],
    ["Katarina Witt", "Eiskunstlauf"], ["Sven Hannawald", "Skispringen"] ] },

  { q: "Welches Instrument spielt/spielte die Person?", type: "choice", items: [
    ["Jimi Hendrix", "Gitarre", ["E-Gitarre"]], ["Lang Lang", "Klavier", ["Piano", "Flügel"]], ["Ringo Starr", "Schlagzeug", ["Drums"]],
    ["Anne-Sophie Mutter", "Geige", ["Violine"]], ["Louis Armstrong", "Trompete"], ["Yo-Yo Ma", "Cello", ["Violoncello"]],
    ["Kenny G", "Saxofon", ["Saxophon", "Sax"]], ["Flea (Red Hot Chili Peppers)", "Bass", ["E-Bass", "Bassgitarre"]],
    ["David Garrett", "Geige", ["Violine"]], ["Elton John", "Klavier", ["Piano", "Flügel"]] ] },

  { q: "Wie heißt die Währung?", type: "choice", items: [
    ["Japan", "Yen"], ["Großbritannien", "Pfund", ["Pfund Sterling", "Pound"]], ["Schweiz", "Franken", ["Schweizer Franken"]],
    ["Polen", "Złoty", ["Zloty"]], ["Russland", "Rubel"], ["Indien", "Rupie", ["Indische Rupie"]], ["China", "Renminbi (Yuan)", ["Renminbi", "Yuan", "RMB", "CNY", "Renminbi Yuan", "Yuan Renminbi", "Chinesischer Yuan"]],
    ["Türkei", "Lira", ["Türkische Lira"]], ["Brasilien", "Real"], ["Südafrika", "Rand"] ] },

  { q: "Welche Farbe hat das?", type: "choice", items: [
    ["Heimtrikot der Niederlande", "Orange"], ["Ein Smaragd", "Grün"], ["Ein Saphir (klassisch)", "Blau"], ["Ein Rubin", "Rot"],
    ["Briefkasten der Deutschen Post", "Gelb"], ["Ein Flamingo", "Rosa", ["Pink"]], ["Ein Amethyst", "Lila", ["Violett"]],
    ["Die Milka-Kuh", "Lila", ["Violett"]], ["Ein Grizzlybär", "Braun"], ["Ein Elefant", "Grau"] ] },

  { q: "Welches Organ ist gemeint?", type: "choice", items: [
    ["Pumpt das Blut durch den Körper", "Herz"], ["Bildet den Urin", "Niere", ["Nieren"]], ["Produziert die Galle", "Leber"],
    ["Produziert Insulin", "Bauchspeicheldrüse", ["Pankreas"]], ["Größtes Organ des Menschen", "Haut"],
    ["Hier findet der Gasaustausch statt", "Lunge"], ["Speichert die Galle", "Gallenblase"], ["Hier sitzen die Stimmbänder", "Kehlkopf"],
    ["Bildet die roten Blutkörperchen", "Knochenmark"], ["Hat rund 86 Milliarden Nervenzellen", "Gehirn", ["Hirn"]] ] },

  { q: "Wie heißt das Tier?", type: "choice", items: [
    ["Der Hund von Obelix", "Idefix"], ["Der Hund von Tim (Tim und Struppi)", "Struppi"], ["Der Hund von Charlie Brown", "Snoopy"],
    ["Der Hund von Micky Maus", "Pluto"], ["Die Eule von Harry Potter", "Hedwig"], ["Der Affe von Pippi Langstrumpf", "Herr Nilsson", ["Nilsson"]],
    ["Der Hund, mit dem Garfield wohnt", "Odie"], ["Die Dogge der Detektiv-Clique um Shaggy", "Scooby-Doo", ["Scooby"]],
    ["Das Haustier der Familie Feuerstein", "Dino"], ["Der Hund von Wallace", "Gromit"] ] },

  { q: "Welcher Fluss fließt durch die Stadt?", type: "choice", items: [
    ["Dresden", "Elbe"], ["Wien", "Donau"], ["Paris", "Seine"], ["London", "Themse", ["Thames"]], ["Rom", "Tiber"],
    ["Prag", "Moldau", ["Vltava"]], ["Frankfurt", "Main"], ["München", "Isar"], ["Berlin", "Spree"], ["Stuttgart", "Neckar"] ] },

  { q: "In welchem Gebirge liegt der Berg?", type: "choice", items: [
    ["Brocken", "Harz"], ["Feldberg (höchster Berg in Baden-Württemberg)", "Schwarzwald"], ["Mount Everest", "Himalaya"],
    ["Aconcagua", "Anden"], ["Fichtelberg", "Erzgebirge"], ["Großer Arber", "Bayerischer Wald"], ["Wasserkuppe", "Rhön"],
    ["Elbrus", "Kaukasus"], ["Zugspitze", "Alpen", ["Wettersteingebirge", "Wetterstein"]], ["Kahler Asten", "Rothaargebirge", ["Sauerland"]] ] },

  { q: "Was heißt „Danke“ auf …?", type: "choice", items: [
    ["Englisch", "Thank you", ["Thanks"]], ["Französisch", "Merci"], ["Spanisch", "Gracias"], ["Italienisch", "Grazie"],
    ["Niederländisch", "Dank je", ["Dank u", "Bedankt", "Dank je wel"]], ["Portugiesisch", "Obrigado", ["Obrigada"]],
    ["Schwedisch", "Tack"], ["Polnisch", "Dziękuję"], ["Japanisch", "Arigatō", ["Arigato gozaimasu"]],
    ["Türkisch", "Teşekkürler", ["Teşekkür ederim", "Sağol"]] ] },

  { q: "Welches Land hat diese Flagge?", type: "choice", items: [
    ["Rot-Weiß-Rot, waagerecht gestreift", "Österreich"], ["Weißes Kreuz auf Rot, quadratisch", "Schweiz"],
    ["Rotes Ahornblatt", "Kanada"], ["Roter Kreis auf Weiß", "Japan"], ["Gelbes Kreuz auf Blau", "Schweden"],
    ["Blauer Davidstern auf Weiß", "Israel"], ["Grüne Zeder zwischen roten Streifen", "Libanon"],
    ["Weißer Halbmond und Stern auf Rot", "Türkei"], ["Roter Kreis auf Grün", "Bangladesch"],
    ["Gelbe Raute mit blauer Himmelskugel auf Grün", "Brasilien"] ] },

  { q: "Wie heißt der Held mit Superhelden-Namen?", type: "choice", items: [
    ["Peter Parker", "Spider-Man", ["Spinnenmann"]], ["Bruce Wayne", "Batman"], ["Clark Kent", "Superman"], ["Tony Stark", "Iron Man"],
    ["Bruce Banner", "Hulk"], ["Steve Rogers", "Captain America"], ["Diana Prince", "Wonder Woman"], ["Wade Wilson", "Deadpool"],
    ["Natasha Romanoff", "Black Widow"], ["Logan", "Wolverine"] ] },

  { q: "Was ist die Hauptzutat?", type: "choice", items: [
    ["Guacamole", "Avocado"], ["Hummus", "Kichererbsen"], ["Sauerkraut", "Weißkohl", ["Kohl", "Weißkraut"]],
    ["Pesto Genovese", "Basilikum"], ["Tzatziki", "Joghurt", ["Jogurt"]], ["Tofu", "Sojabohnen", ["Soja"]], ["Marzipan", "Mandeln"],
    ["Baba Ghanoush", "Aubergine", ["Auberginen"]], ["Ketchup", "Tomaten"], ["Rösti", "Kartoffeln"] ] },

  { q: "Wie heißt die Figur?", type: "choice", items: [
    ["Der grüne Griesgram aus der Mülltonne (Sesamstraße)", "Oscar"], ["Biene Majas bester Freund", "Willi"],
    ["Der Schreinermeister von Pumuckl", "Meister Eder", ["Eder"]], ["Der traurige Esel bei Winnie Puuh", "I-Aah", ["Iah"]],
    ["Der Schneemann in „Die Eiskönigin“", "Olaf"], ["Der vergessliche Fisch in „Findet Nemo“", "Dorie", ["Dori"]],
    ["Der Cowboy in „Toy Story“", "Woody"], ["Das Erdmännchen in „Der König der Löwen“", "Timon"],
    ["Das Warzenschwein in „Der König der Löwen“", "Pumbaa"], ["Der Barkeeper bei den Simpsons", "Moe"] ] },

  { q: "Welches Element hat dieses Symbol?", type: "choice", items: [
    ["Fe", "Eisen"], ["Au", "Gold"], ["Ag", "Silber"], ["Na", "Natrium"], ["K", "Kalium"],
    ["Pb", "Blei"], ["Hg", "Quecksilber"], ["Cu", "Kupfer"], ["Sn", "Zinn"], ["O", "Sauerstoff"] ] },

  { q: "Welches Land hat dieses Auto-Kennzeichen?", hint: "internationales Kfz-Kennzeichen", type: "choice", items: [
    ["A", "Österreich"], ["CH", "Schweiz"], ["F", "Frankreich"], ["E", "Spanien"], ["I", "Italien"],
    ["NL", "Niederlande", ["Holland"]], ["B", "Belgien"], ["PL", "Polen"], ["DK", "Dänemark"], ["H", "Ungarn"] ] },

  { q: "Welche Stadt hat dieses Kennzeichen?", hint: "deutsche Kfz-Kennzeichen", type: "choice", items: [
    ["M", "München"], ["HH", "Hamburg"], ["B", "Berlin"], ["K", "Köln"], ["F", "Frankfurt am Main", ["Frankfurt"]],
    ["S", "Stuttgart"], ["D", "Düsseldorf"], ["L", "Leipzig"], ["HB", "Bremen"], ["DD", "Dresden"] ] },
);
