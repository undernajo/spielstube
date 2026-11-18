// Fragen-Set „Weihnachten & Winter“.
window.SCHLAU10_CARDS.push(...[

  { q: "Ergänze das Weihnachtslied!", type: "choice", items: [
    ["O Tannenbaum, o Tannenbaum, wie ___ sind deine Blätter", "treu"], ["Stille Nacht, heilige Nacht, alles schläft, einsam ___", "wacht"],
    ["Leise rieselt der ___", "Schnee"], ["Morgen, Kinder, wird's was ___", "geben"], ["Alle Jahre wieder kommt das ___", "Christuskind"],
    ["Ihr Kinderlein, ___", "kommet"], ["Süßer die Glocken nie ___", "klingen"], ["O du ___", "fröhliche"],
    ["Es ist ein Ros ___", "entsprungen"], ["Last Christmas, I gave you my ___", "heart"] ] },

  { q: "Wer singt den Weihnachtshit?", type: "choice", names: true, items: [
    ["Last Christmas", "Wham!", ["Wham", "George Michael"]], ["All I Want for Christmas Is You", "Mariah Carey"], ["Driving Home for Christmas", "Chris Rea"],
    ["Do They Know It's Christmas?", "Band Aid"], ["Feliz Navidad", "José Feliciano"], ["White Christmas (Original)", "Bing Crosby"],
    ["Rockin' Around the Christmas Tree", "Brenda Lee"], ["Santa Tell Me", "Ariana Grande"], ["Happy Xmas (War Is Over)", "John Lennon"],
    ["Merry Christmas Everyone", "Shakin' Stevens"] ] },

  { q: "In welchem Jahrzehnt erschien das Weihnachtslied?", type: "decade", items: [
    ["Leise rieselt der Schnee", 1890], ["White Christmas", 1940], ["Jingle Bell Rock", 1950], ["Feliz Navidad", 1970],
    ["Happy Xmas (War Is Over)", 1970], ["Last Christmas", 1980], ["Driving Home for Christmas", 1980], ["All I Want for Christmas Is You", 1990],
    ["Mistletoe (Justin Bieber)", 2010], ["Santa Tell Me", 2010] ] },

  { q: "Aus welchem Land stammt das Weihnachtslied?", type: "choice", items: [
    ["Stille Nacht", "Österreich"], ["Jingle Bells", "USA", ["Amerika", "Vereinigte Staaten"]], ["O Tannenbaum", "Deutschland"],
    ["Last Christmas", "Großbritannien", ["England", "UK"]], ["Petit Papa Noël", "Frankreich"], ["Joy to the World", "England", ["Großbritannien", "UK"]],
    ["Tu scendi dalle stelle", "Italien"], ["Carol of the Bells (Melodie)", "Ukraine"], ["Feliz Navidad", "Puerto Rico", ["USA"]],
    ["Es ist ein Ros entsprungen", "Deutschland"] ] },

  { q: "Ist das ein Rentier des Weihnachtsmanns?", type: "tf", items: [
    ["Rudolph", true], ["Dasher", true], ["Comet", true], ["Cupid", true], ["Vixen", true], ["Blitzen", true],
    ["Sven", false], ["Bambi", false], ["Olaf", false], ["Sleipnir", false] ] },

  { q: "Welcher Weihnachtsfilm ist gemeint?", type: "choice", items: [
    ["Junge wird zu Hause vergessen und wehrt zwei Einbrecher ab", "Kevin – Allein zu Haus", ["Kevin allein zu Haus", "Home Alone", "Kevin"]],
    ["Grüner Griesgram stiehlt Weihnachten", "Der Grinch", ["Grinch"]], ["Märchen mit drei magischen Nüssen", "Drei Haselnüsse für Aschenbrödel", ["Aschenbrödel"]],
    ["Ein Junge fährt im Zug zum Nordpol", "Der Polarexpress", ["Polarexpress", "Polar Express"]], ["Mehrere Liebesgeschichten in London, Hugh Grant tanzt", "Tatsächlich… Liebe", ["Tatsächlich Liebe", "Love Actually"]],
    ["Familie Griswold und Tausende Lichter am Haus", "Schöne Bescherung", ["Christmas Vacation"]], ["Ceddie wird Erbe eines englischen Grafen", "Der kleine Lord", ["Kleiner Lord"]],
    ["Ein Engel zeigt George, wie die Welt ohne ihn wäre", "Ist das Leben nicht schön?", ["Ist das Leben nicht schön", "It's a Wonderful Life"]],
    ["Geizhals Scrooge und drei Geister", "Eine Weihnachtsgeschichte", ["A Christmas Carol", "Weihnachtsgeschichte"]],
    ["Ein Mensch wächst bei Elfen am Nordpol auf", "Buddy – Der Weihnachtself", ["Buddy", "Elf"]] ] },

  { q: "Wie heißt …?", hint: "Weihnachtsfiguren", type: "choice", items: [
    ["… das Rentier mit der roten Nase?", "Rudolph", ["Rudolf"]], ["… der Hund des Grinch?", "Max"], ["… Scrooge mit Vornamen?", "Ebenezer"],
    ["… Kevin aus „Allein zu Haus“ mit Nachnamen?", "McCallister"], ["… die beiden Einbrecher bei Kevin?", "Harry und Marv", ["Harry", "Marv"]],
    ["… das Pferd von Aschenbrödel?", "Nikolaus"], ["… der Vater von Tiny Tim?", "Bob Cratchit", ["Cratchit"]],
    ["… der Geisterhund von Jack Skellington?", "Zero"], ["… der Schneemann im Lied, der lebendig wird?", "Frosty"],
    ["… der Mensch, der als Elf aufwuchs?", "Buddy"] ] },

  { q: "Welche Weihnachtsleckerei ist gemeint?", type: "choice", items: [
    ["Schweres Hefegebäck mit Puderzucker, aus Dresden", "Stollen", ["Christstollen", "Dresdner Stollen"]], ["Hörnchen aus Mandelteig mit Vanillezucker", "Vanillekipferl"],
    ["Würzgebäck aus Nürnberg", "Lebkuchen", ["Elisenlebkuchen"]], ["Sterne mit Eiweißglasur und Zimt", "Zimtsterne", ["Zimtstern"]],
    ["Harte Lebkuchen aus Aachen", "Printen", ["Aachener Printen"]], ["Zwei Plätzchen mit Marmelade dazwischen", "Spitzbuben", ["Linzer Augen", "Hildabrötchen"]],
    ["Italienischer Hefekuchen mit Rosinen", "Panettone"], ["Gewürzkekse mit Reliefbild", "Spekulatius"],
    ["Würfel aus Lebkuchen, Gelee und Marzipan mit Schokolade", "Dominosteine", ["Dominostein"]], ["Heißer, gewürzter Wein vom Markt", "Glühwein"] ] },

  { q: "In welcher Stadt ist der Weihnachtsmarkt?", type: "choice", items: [
    ["Christkindlesmarkt mit eigenem Christkind", "Nürnberg"], ["Striezelmarkt, einer der ältesten", "Dresden"], ["Christkindlmarkt am Marienplatz", "München"],
    ["Weihnachtsmarkt vor Schloss Schönbrunn", "Wien"], ["Markt der „Capitale de Noël“ am Münster", "Straßburg", ["Strasbourg"]],
    ["Weihnachtsmarkt auf dem Römerberg", "Frankfurt am Main", ["Frankfurt"]], ["Christkindlmarkt auf dem Waltherplatz", "Bozen"],
    ["Weihnachtsmarkt in den Tivoli-Gärten", "Kopenhagen"], ["„Winter Wonderland“ im Hyde Park", "London"], ["Weihnachtsmarkt am Dom mit Riesenbaum", "Köln"] ] },

  { q: "Wer bringt dort die Geschenke?", type: "choice", items: [
    ["Süddeutschland und Österreich", "Christkind"], ["Norddeutschland", "Weihnachtsmann"], ["USA", "Santa Claus", ["Santa"]], ["Frankreich", "Père Noël"],
    ["Italien (am 6. Januar)", "Befana", ["La Befana"]], ["Russland", "Väterchen Frost", ["Ded Moros", "Djed Moros"]], ["Niederlande (am 5. Dezember)", "Sinterklaas"],
    ["Spanien (am 6. Januar)", "Heilige Drei Könige", ["Reyes Magos", "Die Heiligen Drei Könige", "Drei Könige"]], ["Großbritannien", "Father Christmas"],
    ["Schweden", "Jultomte", ["Tomte", "Jultomten"]] ] },

  { q: "Aus welchem Land kommt der Brauch?", type: "choice", items: [
    ["Der Adventskranz", "Deutschland"], ["Knallbonbons („Christmas Crackers“) beim Essen", "Großbritannien", ["England", "UK"]],
    ["Ein riesiger Strohbock als Weihnachtsdeko", "Schweden"], ["Jedes Jahr ein Christbaum-Geschenk für den Trafalgar Square", "Norwegen"],
    ["Brathähnchen von KFC zu Weihnachten", "Japan"], ["Ein Holzklotz, der Geschenke „ausscheidet“ (Caga Tió)", "Spanien", ["Katalonien"]],
    ["13 Desserts am Heiligabend", "Frankreich", ["Provence"]], ["Weihnachtssauna am Heiligabend", "Finnland"],
    ["Eine Gurke im Christbaum (angeblich deutscher Brauch)", "USA", ["Amerika"]], ["Krampusläufe im Advent", "Österreich", ["Bayern", "Südtirol", "Alpenraum"]] ] },

  { q: "Stimmt das?", hint: "Weihnachtswissen", type: "tf", items: [
    ["Rudolph wurde für eine Kaufhaus-Werbung erfunden.", true], ["Der heilige Nikolaus war Bischof von Myra.", true],
    ["„Stille Nacht“ wurde in Österreich uraufgeführt.", true], ["In Australien ist Weihnachten im Sommer.", true],
    ["Der Weihnachtsstern (Pflanze) stammt aus Mexiko.", true], ["Das X in „Xmas“ geht auf den griechischen Buchstaben Chi zurück.", true],
    ["Coca-Cola hat den Weihnachtsmann erfunden.", false], ["Jesus wurde nachweislich am 24. Dezember geboren.", false],
    ["Der berühmte Christbaum am Rockefeller Center steht in Chicago.", false], ["Die Bibel nennt die Namen der Heiligen Drei Könige.", false] ] },

  { q: "Weihnachten in Zahlen", type: "num", items: [
    ["Türchen im klassischen Adventskalender", 24], ["Kerzen am Adventskranz", 4], ["Rentiere des Weihnachtsmanns ohne Rudolph", 8],
    ["Heilige Drei Könige – so viele sind es", 3], ["Weihnachtstage im Lied „The Twelve Days of Christmas“", 12], ["Datum des Nikolaustags im Dezember", 6],
    ["Zacken eines Herrnhuter Sterns", 25], ["Zacken einer Schneeflocke", 6], ["Gesetzliche Weihnachtsfeiertage in Deutschland", 2],
    ["Jahr der ersten Erwähnung des Dresdner Striezelmarkts", 1434] ] },

  { q: "Ordne die Fest- und Gedenktage im Jahreslauf.", hint: "1 = am frühesten (ab Dezember)", type: "rank", items: [
    ["Barbaratag", 1], ["Nikolaus", 2], ["Luciatag", 3], ["Winteranfang", 4], ["Heiligabend", 5],
    ["Stephanstag", 6], ["Silvester", 7], ["Neujahr", 8], ["Heilige Drei Könige", 9], ["Mariä Lichtmess", 10] ] },

  { q: "Gibt es diesen Weihnachtsort wirklich?", type: "tf", items: [
    ["Christkindl (Österreich)", true], ["Engelskirchen", true], ["Himmelstadt", true], ["Nikolausdorf", true], ["Rovaniemi", true],
    ["Bethlehem", true], ["Lebkuchenhausen", false], ["Glühweinstadt", false], ["Zimtstern am See", false], ["Tannenbaumdorf", false] ] },

  // ===================== Winter & Wintersport =====================
  { q: "Welcher Wintersport ist gemeint?", type: "choice", items: [
    ["Schlitten, Kopf voraus", "Skeleton"], ["Schlitten, Füße voraus, auf dem Rücken liegend", "Rennrodeln", ["Rodeln"]], ["Weite Sprünge von der Schanze", "Skispringen"],
    ["Kurze Schwünge um enge Tore", "Slalom"], ["Sprünge und Pirouetten auf Kufen", "Eiskunstlauf"], ["Skispringen plus Langlauf", "Nordische Kombination"],
    ["Tricks mit dem Brett in der Halfpipe", "Snowboard", ["Snowboarden", "Halfpipe"]], ["Schnellste alpine Disziplin", "Abfahrt", ["Abfahrtslauf"]],
    ["Rennen auf der 400-Meter-Eisbahn", "Eisschnelllauf"], ["Zweier- oder Viererschlitten im Eiskanal", "Bob", ["Bobfahren"]] ] },

  { q: "Welche Wintersport-Legende ist gemeint?", type: "choice", names: true, items: [
    ["Rekord-Weltcupsiegerin im Ski alpin", "Mikaela Shiffrin"], ["Der „Herminator“", "Hermann Maier"], ["Norwegischer Langläufer mit acht Olympiasiegen", "Bjørn Dæhlie", ["Daehlie", "Dählie"]],
    ["Achtmal in Folge Gesamtweltcupsieger", "Marcel Hirscher"], ["Biathlet mit 13 Olympiamedaillen", "Ole Einar Bjørndalen", ["Bjørndalen", "Björndalen"]],
    ["US-Abfahrtsstar mit spätem Comeback", "Lindsey Vonn"], ["Italiener mit Spitznamen „La Bomba“", "Alberto Tomba"], ["Abfahrts-Olympiasieger 1976 in Innsbruck", "Franz Klammer"],
    ["Deutsche Gesamtweltcupsiegerin 2011", "Maria Höfl-Riesch", ["Höfl-Riesch", "Maria Riesch"]], ["Rodel-Olympiasieger 2010 und 2014", "Felix Loch"] ] },

  { q: "Winter in Zahlen", type: "num", items: [
    ["Olympische Winterspiele in Deutschland bisher", 1], ["Stunden Tageslicht am Nordpol mitten im Winter", 0], ["Disziplinen der Nordischen Kombination", 2],
    ["Schießeinlagen im Biathlon-Sprint", 2], ["Schüsse pro Schießeinlage im Biathlon", 5], ["Länge einer Biathlon-Strafrunde (m)", 150],
    ["Steine pro Team und Durchgang im Curling", 8], ["Spieler eines Curling-Teams", 4], ["Schanzen der Vierschanzentournee", 4],
    ["Klassische Disziplinen im Ski alpin", 5] ] },

  { q: "War die Stadt schon Gastgeber Olympischer Winterspiele?", type: "tf", items: [
    ["Innsbruck", true], ["Garmisch-Partenkirchen", true], ["St. Moritz", true], ["Lillehammer", true], ["Sapporo", true],
    ["Calgary", true], ["Kitzbühel", false], ["Zermatt", false], ["Davos", false], ["Oberstdorf", false] ] },

  { q: "Was ist gemeint?", hint: "Winter & Natur", type: "choice", items: [
    ["Gefrorenes Wasser, das vom Dach hängt", "Eiszapfen"], ["Weiße Blume, die im Winter blüht", "Christrose", ["Schneerose"]],
    ["Strauch mit stacheligen Blättern und roten Beeren", "Stechpalme", ["Ilex"]], ["Zweig, unter dem man sich küsst", "Mistelzweig", ["Mistel"]],
    ["Sechseckiger Eiskristall", "Schneeflocke"], ["Weißer Eisbelag auf Ästen und Gräsern", "Raureif", ["Rauhreif"]],
    ["Langer Schlaf von Igel und Murmeltier", "Winterschlaf"], ["Schneemassen, die den Hang hinabstürzen", "Lawine"],
    ["Vogel mit roter Brust am Futterhaus", "Gimpel", ["Dompfaff", "Rotkehlchen"]], ["Plötzliches Glatteis durch gefrierenden Regen", "Blitzeis", ["Glatteis"]] ] },

].map((c) => ({ ...c, set: "winter" })));
