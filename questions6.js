// Erweiterung 4 (Teil 2): Literatur, Medizin, Wirtschaft & Alltag, Flaggen & Länder, Tiere, Sport, Technik, Essen, Musik, Spiele.
window.SCHLAU10_CARDS.push(

  // ===================== Literatur & Märchen =====================
  { q: "Ist das ein Märchen der Brüder Grimm?", type: "tf", items: [
    ["Rotkäppchen", true], ["Hänsel und Gretel", true], ["Schneewittchen", true], ["Rumpelstilzchen", true], ["Frau Holle", true],
    ["Der Froschkönig", true], ["Die Bremer Stadtmusikanten", true], ["Die kleine Meerjungfrau", false], ["Des Kaisers neue Kleider", false], ["Pinocchio", false] ] },

  { q: "Aus welchem Märchen stammt das?", type: "choice", items: [
    ["„Spieglein, Spieglein an der Wand …“", "Schneewittchen"], ["„… lass dein Haar herunter!“", "Rapunzel"], ["„Knusper, knusper, knäuschen …“", "Hänsel und Gretel"],
    ["„Ach, wie gut, dass niemand weiß …“", "Rumpelstilzchen"], ["„Großmutter, was hast du für große Ohren?“", "Rotkäppchen"],
    ["„Die Guten ins Töpfchen, die Schlechten ins Kröpfchen“", "Aschenputtel"], ["„Etwas Besseres als den Tod findest du überall.“", "Die Bremer Stadtmusikanten", ["Bremer Stadtmusikanten"]],
    ["Hundert Jahre Schlaf nach einem Spindelstich", "Dornröschen"], ["Goldmarie und Pechmarie", "Frau Holle"], ["Eine Prinzessin, eine goldene Kugel und ein Frosch", "Der Froschkönig", ["Froschkönig"]] ] },

  { q: "Wer schrieb den Klassiker?", type: "choice", names: true, items: [
    ["Romeo und Julia", "William Shakespeare"], ["Don Quijote", "Miguel de Cervantes", ["Cervantes"]], ["Krieg und Frieden", "Leo Tolstoi", ["Tolstoj", "Tolstoy"]],
    ["Schuld und Sühne", "Fjodor Dostojewski", ["Dostojewskij", "Dostoevsky"]], ["Die Göttliche Komödie", "Dante Alighieri", ["Dante"]], ["Moby Dick", "Herman Melville"],
    ["Stolz und Vorurteil", "Jane Austen"], ["Oliver Twist", "Charles Dickens"], ["Die Odyssee", "Homer"], ["Der alte Mann und das Meer", "Ernest Hemingway"] ] },

  { q: "In welchem Buch ist das die Hauptfigur?", type: "choice", items: [
    ["Holden Caulfield", "Der Fänger im Roggen", ["Fänger im Roggen", "The Catcher in the Rye"]], ["Jay Gatsby", "Der große Gatsby", ["The Great Gatsby", "Großer Gatsby"]],
    ["Atticus Finch", "Wer die Nachtigall stört", ["To Kill a Mockingbird"]], ["Winston Smith", "1984", ["Neunzehnhundertvierundachtzig"]],
    ["Mowgli", "Das Dschungelbuch", ["Dschungelbuch"]], ["Lisbeth Salander", "Verblendung", ["Millennium", "Millennium-Trilogie"]],
    ["Katniss Everdeen", "Die Tribute von Panem", ["Tribute von Panem", "Panem", "Hunger Games"]], ["Bella Swan", "Twilight", ["Bis(s) zum Morgengrauen", "Biss zum Morgengrauen"]],
    ["Edmond Dantès", "Der Graf von Monte Christo", ["Graf von Monte Christo", "Monte Christo"]], ["Bilbo Beutlin", "Der Hobbit", ["Hobbit"]] ] },

  { q: "Hat die Person den Literaturnobelpreis bekommen?", type: "tf", items: [
    ["Thomas Mann", true], ["Hermann Hesse", true], ["Günter Grass", true], ["Heinrich Böll", true], ["Ernest Hemingway", true],
    ["Bob Dylan", true], ["Johann Wolfgang von Goethe", false], ["J. K. Rowling", false], ["Franz Kafka", false], ["Leo Tolstoi", false] ] },

  { q: "In welchem Jahrzehnt erschien das Buch?", type: "decade", items: [
    ["Faust. Der Tragödie erster Teil", 1800], ["Buddenbrooks", 1900], ["Der Hobbit", 1930], ["Der kleine Prinz", 1940], ["Der Herr der Ringe (Band 1)", 1950],
    ["Momo", 1970], ["Das Parfum", 1980], ["Der Vorleser", 1990], ["Twilight (Band 1)", 2000], ["Tschick", 2010] ] },

  { q: "Was für ein Tier ist …?", hint: "aus Büchern & Filmen", type: "choice", items: [
    ["… das Gewissen von Pinocchio?", "Grille"], ["… Moby Dick?", "Wal", ["Pottwal"]], ["… Shir Khan?", "Tiger"], ["… Balu?", "Bär"], ["… Baghira?", "Panther", ["Schwarzer Panther"]],
    ["… Aslan aus Narnia?", "Löwe"], ["… Krätze, Rons Haustier?", "Ratte"], ["… Nagini?", "Schlange"], ["… Fuchur aus der „Unendlichen Geschichte“?", "Glücksdrache", ["Drache"]],
    ["… Rikki-Tikki-Tavi?", "Mungo", ["Mungos"]] ] },

  { q: "Bücher in Zahlen", type: "num", items: [
    ["Bände von „Der Herr der Ringe“ (meist)", 3], ["Bände der „Chroniken von Narnia“", 7], ["Märchen in Grimms Kinder- und Hausmärchen", 200],
    ["Teile von Goethes „Faust“", 2], ["Gesänge in Dantes „Göttlicher Komödie“", 100], ["Erzählungen im „Decamerone“", 100],
    ["Nächte bei Scheherazade", 1001], ["Räuber bei Ali Baba", 40], ["Bände der „Twilight“-Saga (Hauptreihe)", 4], ["Bände der „Tribute von Panem“-Trilogie", 3] ] },

  { q: "Aus welchem Land stammt der Autor / die Autorin?", type: "choice", items: [
    ["Astrid Lindgren", "Schweden"], ["Hans Christian Andersen", "Dänemark"], ["Leo Tolstoi", "Russland"], ["Victor Hugo", "Frankreich"],
    ["Gabriel García Márquez", "Kolumbien"], ["Haruki Murakami", "Japan"], ["Paulo Coelho", "Brasilien"], ["James Joyce", "Irland"],
    ["Mark Twain", "USA", ["Amerika", "Vereinigte Staaten"]], ["Henrik Ibsen", "Norwegen"] ] },

  // ===================== Medizin & Körper =====================
  { q: "Welcher Knochen ist gemeint?", type: "choice", items: [
    ["Längster Knochen des Körpers", "Oberschenkelknochen", ["Femur", "Oberschenkel"]], ["Knochen vor dem Kniegelenk", "Kniescheibe", ["Patella"]],
    ["Zwischen Brustbein und Schulter", "Schlüsselbein", ["Clavicula"]], ["Flacher Knochen am oberen Rücken", "Schulterblatt", ["Scapula"]],
    ["Kleinster Knochen, im Ohr", "Steigbügel", ["Stapes"]], ["Schützt das Gehirn", "Schädel", ["Schädelknochen"]], ["Einziger beweglicher Schädelknochen", "Unterkiefer"],
    ["Achse des Skeletts", "Wirbelsäule"], ["Knochenring, auf dem der Rumpf ruht", "Becken"], ["Hier enden vorne die Rippen", "Brustbein", ["Sternum"]] ] },

  { q: "Wird die Krankheit durch Viren ausgelöst?", type: "tf", items: [
    ["Grippe", true], ["Masern", true], ["Windpocken", true], ["COVID-19", true], ["Mumps", true], ["Tollwut", true],
    ["Tuberkulose", false], ["Borreliose", false], ["Malaria", false], ["Scharlach", false] ] },

  { q: "Welcher Nährstoff ist gemeint?", type: "choice", items: [
    ["Bildet die Haut mithilfe von Sonnenlicht", "Vitamin D", ["D"]], ["Steckt in Zitrusfrüchten, schützt vor Skorbut", "Vitamin C", ["C"]],
    ["Wichtig fürs Sehen, Vorstufe in Karotten", "Vitamin A", ["A"]], ["Wichtig für die Blutgerinnung", "Vitamin K", ["K"]],
    ["Fast nur in tierischen Lebensmitteln – wichtig für Veganer", "Vitamin B12", ["B12"]], ["Für Knochen und Zähne, viel in Milch", "Calcium", ["Kalzium"]],
    ["Für die roten Blutkörperchen", "Eisen"], ["Wird dem Speisesalz für die Schilddrüse zugesetzt", "Jod", ["Iod"]],
    ["Hauptenergielieferant in Brot und Nudeln", "Kohlenhydrate", ["Kohlenhydrat", "Stärke"]], ["Baustoff der Muskeln", "Eiweiß", ["Protein", "Proteine"]] ] },

  { q: "Körper in Zahlen", hint: "Teil 2", type: "num", items: [
    ["Rippenpaare", 12], ["Finger und Zehen zusammen", 20], ["Knochen in einer Hand", 27], ["Lendenwirbel", 5], ["Brustwirbel", 12],
    ["Gehörknöchelchen pro Ohr", 3], ["Herzklappen", 4], ["Schneidezähne beim Erwachsenen", 8], ["Eckzähne beim Erwachsenen", 4], ["Nieren", 2] ] },

  { q: "Wie heißt das medizinische Fachgebiet?", type: "choice", items: [
    ["Augen", "Augenheilkunde", ["Ophthalmologie", "Augenarzt"]], ["Haut", "Dermatologie", ["Hautarzt"]], ["Herz", "Kardiologie", ["Kardiologe"]],
    ["Kinder", "Kinderheilkunde", ["Pädiatrie", "Kinderarzt"]], ["Knochen und Gelenke", "Orthopädie", ["Orthopäde"]], ["Nerven", "Neurologie", ["Neurologe"]],
    ["Frauen", "Gynäkologie", ["Frauenheilkunde", "Frauenarzt"]], ["Krebs", "Onkologie", ["Onkologe"]], ["Seele und Psyche", "Psychiatrie", ["Psychiater"]],
    ["Harnwege", "Urologie", ["Urologe"]] ] },

  { q: "Wer war's?", hint: "Medizin", type: "choice", names: true, items: [
    ["Entdeckte die Blutgruppen", "Karl Landsteiner"], ["Begründer der Psychoanalyse", "Sigmund Freud"], ["Erste Herztransplantation", "Christiaan Barnard"],
    ["„Die Dame mit der Lampe“", "Florence Nightingale"], ["Gründer des Roten Kreuzes", "Henry Dunant"], ["Händewaschen gegen Kindbettfieber", "Ignaz Semmelweis"],
    ["Antiker Arzt, nach dem ein Eid benannt ist", "Hippokrates"], ["Erfand das Stethoskop", "René Laennec"], ["Entdeckte 1921 zusammen mit Charles Best das Insulin", "Frederick Banting"],
    ["Urwaldarzt in Lambaréné", "Albert Schweitzer"] ] },

  { q: "Stimmt das?", hint: "Körper-Wissen", type: "tf", items: [
    ["Das Herz liegt leicht links in der Brust.", true], ["Babys haben mehr Knochen als Erwachsene.", true], ["Die Leber kann nachwachsen.", true],
    ["Fingernägel wachsen schneller als Fußnägel.", true], ["Die Zunge besteht vor allem aus Muskeln.", true], ["Der Mensch hat zwei Lungenflügel.", true],
    ["Wir nutzen nur 10 % unseres Gehirns.", false], ["Blut in den Venen ist blau.", false], ["Rasierte Haare wachsen dicker nach.", false],
    ["Der Magen liegt unterhalb des Bauchnabels.", false] ] },

  { q: "Körper – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", items: [
    ["Hautfläche eines Erwachsenen (m²)", 1.8], ["Herzschläge pro Tag", 100000], ["Liter Blut, die das Herz pro Tag pumpt", 7000],
    ["Haarwachstum pro Monat (cm)", 1], ["Nervenzellen im Gehirn (Mrd.)", 86], ["Gewicht der Leber (kg)", 1.5], ["Länge des Dünndarms (m)", 6],
    ["Atemzüge pro Tag", 20000], ["Lidschläge pro Minute", 15], ["Fingernagelwachstum pro Monat (mm)", 3] ] },

  // ===================== Wirtschaft & Alltag =====================
  { q: "Wer hat die Firma gegründet?", type: "choice", names: true, items: [
    ["Microsoft", "Bill Gates", ["Paul Allen"]], ["Apple", "Steve Jobs", ["Steve Wozniak", "Wozniak"]], ["Amazon", "Jeff Bezos"],
    ["Facebook", "Mark Zuckerberg"], ["IKEA", "Ingvar Kamprad"], ["Adidas", "Adi Dassler", ["Adolf Dassler", "Dassler"]], ["Puma", "Rudolf Dassler", ["Dassler"]],
    ["Google", "Larry Page", ["Sergey Brin", "Brin"]], ["Haribo", "Hans Riegel"], ["LEGO", "Ole Kirk Christiansen"] ] },

  { q: "Wofür steht der Markenname?", type: "choice", items: [
    ["HARIBO", "Hans Riegel Bonn"], ["Adidas", "Adi Dassler", ["Adolf Dassler"]], ["IKEA", "Ingvar Kamprad Elmtaryd Agunnaryd"],
    ["ALDI", "Albrecht Diskont"], ["EDEKA", "Einkaufsgenossenschaft der Kolonialwarenhändler"], ["Tchibo", "Tchilinghiryan und Bohne", ["Tchilinghiryan Bohne"]],
    ["LEGO", "leg godt", ["spiel gut", "leg godt – spiel gut"]], ["Audi", "Horch", ["Horch!", "hör zu", "horch auf Latein"]],
    ["Hanuta", "Haselnusstafel"], ["BMW", "Bayerische Motoren Werke"] ] },

  { q: "Gehört die Marke zum Volkswagen-Konzern?", type: "tf", items: [
    ["Audi", true], ["Porsche", true], ["Škoda", true], ["Seat", true], ["Lamborghini", true], ["Bentley", true],
    ["BMW", false], ["Mercedes-Benz", false], ["Opel", false], ["Ferrari", false] ] },

  { q: "Wie heißt die Währung?", hint: "Teil 2", type: "choice", items: [
    ["Dänemark", "Krone", ["Dänische Krone"]], ["Ungarn", "Forint"], ["Rumänien", "Leu"], ["Israel", "Schekel", ["Shekel", "Neuer Schekel"]],
    ["Südkorea", "Won"], ["Thailand", "Baht"], ["Vietnam", "Dong"], ["Vereinigte Arabische Emirate", "Dirham"], ["Ukraine", "Hrywnja", ["Hryvnia", "Griwna"]],
    ["Kroatien", "Euro"] ] },

  { q: "Bezahlt man dort mit dem Euro?", type: "tf", items: [
    ["Österreich", true], ["Kroatien", true], ["Slowakei", true], ["Estland", true], ["Griechenland", true],
    ["Irland", true], ["Dänemark", false], ["Schweden", false], ["Polen", false], ["Schweiz", false] ] },

  { q: "Geld & Handel: In welchem Jahrzehnt war das?", type: "decade", items: [
    ["Hyperinflation in Deutschland", 1920], ["„Schwarzer Freitag“ an der Börse", 1920], ["Einführung der D-Mark", 1940], ["Erste Kreditkarte (Diners Club)", 1950],
    ["Erster Geldautomat in Deutschland", 1960], ["Erster Strichcode-Scan an einer Kasse", 1970], ["Gründung von eBay", 1990],
    ["Der Euro wird Buchgeld", 1990], ["Start von Bitcoin", 2000], ["Apple ist als erste Firma 1 Billion Dollar wert", 2010] ] },

  { q: "Welcher Beruf ist gemeint?", type: "choice", items: [
    ["Kehrt Schornsteine", "Schornsteinfeger", ["Kaminkehrer", "Rauchfangkehrer"]], ["Baut Möbel aus Holz", "Tischler", ["Schreiner"]], ["Fertigt Brillen", "Optiker"],
    ["Beschlägt Pferde", "Hufschmied", ["Schmied"]], ["Deckt Dächer", "Dachdecker"], ["Verkauft Fleisch und Wurst", "Metzger", ["Fleischer", "Schlachter"]],
    ["Plant Häuser", "Architekt", ["Architektin"]], ["Leitet ein Orchester", "Dirigent", ["Dirigentin"]], ["Stellt Fässer her", "Böttcher", ["Küfer", "Fassbinder"]],
    ["Bindet Bücher", "Buchbinder"] ] },

  { q: "Deutschland – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", items: [
    ["Haushalte (Mio.)", 41], ["Anteil der Einpersonenhaushalte (%)", 41], ["Durchschnittsalter der Bevölkerung (Jahre)", 44.6],
    ["Lebenserwartung von Frauen (Jahre)", 83], ["Lebenserwartung von Männern (Jahre)", 78.5], ["Geburten pro Jahr", 680000],
    ["Hunde (Mio.)", 10.5], ["Katzen (Mio.)", 15.7], ["Gesetzlicher Mindesturlaub bei 5-Tage-Woche (Tage)", 20], ["Höhe eines Stockwerks (m)", 3] ] },

  { q: "Wie heißt das Zeichen?", type: "choice", items: [
    ["@", "At-Zeichen", ["Klammeraffe", "At"]], ["&", "Und-Zeichen", ["Et-Zeichen", "Ampersand", "Und"]], ["#", "Raute", ["Hashtag", "Doppelkreuz"]],
    ["§", "Paragraf", ["Paragraph", "Paragrafenzeichen"]], ["~", "Tilde"], ["*", "Sternchen", ["Asterisk", "Stern"]], ["‰", "Promille"],
    ["©", "Copyright", ["Copyright-Zeichen"]], ["¶", "Absatzzeichen", ["Pilcrow", "Absatzmarke"]], ["∞", "Unendlich", ["Unendlichzeichen", "Lemniskate"]] ] },

  // ===================== Flaggen & Länder =====================
  { q: "Welches Land hat diese Flagge?", hint: "Teil 2", type: "choice", items: [
    ["Blau-Weiß-Rot, senkrecht", "Frankreich"], ["Grün-Weiß-Rot, senkrecht", "Italien"], ["Schwarz-Gelb-Rot, senkrecht", "Belgien"],
    ["Grün-Weiß-Orange, senkrecht", "Irland"], ["Rot-Weiß-Blau, waagerecht", "Niederlande", ["Holland", "Luxemburg"]], ["Weiß-Rot, waagerecht", "Polen"],
    ["Blau-Gelb, waagerecht", "Ukraine"], ["Weißes Kreuz auf Rot, rechteckig", "Dänemark"], ["Blaues Kreuz mit weißem Rand auf Rot", "Norwegen"],
    ["Blaues Kreuz auf Weiß", "Finnland"] ] },

  { q: "Ist Rot in der Flagge?", type: "tf", items: [
    ["Japan", true], ["Kanada", true], ["Schweiz", true], ["Türkei", true], ["China", true], ["Deutschland", true],
    ["Schweden", false], ["Ukraine", false], ["Griechenland", false], ["Argentinien", false] ] },

  { q: "Wie heißen die Einwohner?", type: "choice", items: [
    ["Monaco", "Monegassen", ["Monegasse"]], ["Zypern", "Zyprer", ["Zyprioten"]], ["Madagaskar", "Madagassen"], ["Ghana", "Ghanaer"],
    ["Sri Lanka", "Sri-Lanker", ["Srilanker", "Sri Lanker"]], ["Andorra", "Andorraner"], ["Philippinen", "Philippiner", ["Filipinos"]],
    ["Malta", "Malteser"], ["Jemen", "Jemeniten"], ["Island", "Isländer"] ] },

  { q: "Ist das Land ein Binnenstaat (ohne Meerzugang)?", type: "tf", items: [
    ["Schweiz", true], ["Österreich", true], ["Ungarn", true], ["Tschechien", true], ["Mongolei", true], ["Bolivien", true],
    ["Bulgarien", false], ["Kroatien", false], ["Slowenien", false], ["Peru", false] ] },

  { q: "Welches ist das flächenmäßig größte Land …?", type: "choice", items: [
    ["… in Afrika?", "Algerien"], ["… in Südamerika?", "Brasilien"], ["… das komplett in Europa liegt?", "Ukraine"], ["… der Welt?", "Russland"],
    ["… in Nordamerika?", "Kanada"], ["… in Ozeanien?", "Australien"], ["… auf der Arabischen Halbinsel?", "Saudi-Arabien"],
    ["… in Skandinavien?", "Schweden"], ["… der EU?", "Frankreich"], ["… im Baltikum?", "Litauen"] ] },

  { q: "Ordne die Hauptstädte von Nord nach Süd.", hint: "1 = nördlichste", type: "rank", items: [
    ["Reykjavík", 1], ["Helsinki", 2], ["Oslo", 3], ["Stockholm", 4], ["Kopenhagen", 5],
    ["Berlin", 6], ["Wien", 7], ["Rom", 8], ["Kairo", 9], ["Nairobi", 10] ] },

  { q: "Welches Land ist gemeint?", hint: "Lage & Nachbarn", type: "choice", items: [
    ["Zwergstaat in den Pyrenäen", "Andorra"], ["Zwischen Österreich und der Schweiz", "Liechtenstein"], ["Von Italien umschlossen, älteste Republik", "San Marino"],
    ["Stadtstaat an der Côte d'Azur", "Monaco"], ["Inselstaat südlich von Sizilien", "Malta"], ["Einziges Nachbarland von Portugal", "Spanien"],
    ["Grenzt an Kanada und Mexiko", "USA", ["Vereinigte Staaten", "Amerika"]], ["Einziges Nachbarland Dänemarks an Land", "Deutschland"],
    ["Einziges Nachbarland von Haiti", "Dominikanische Republik"], ["Komplett von Südafrika umschlossen", "Lesotho"] ] },

  { q: "Länder in Zahlen", type: "num", items: [
    ["Mitgliedstaaten der EU", 27], ["Länder in Südamerika", 12], ["Bundesländer in Österreich", 9], ["Provinzen in Kanada", 10],
    ["Zeitzonen in Russland", 11], ["Anrainerstaaten der Ostsee", 9], ["Nachbarländer Frankreichs in Europa", 8], ["Nachbarländer Chinas", 14],
    ["Mitglieder der G7", 7], ["Ständige Mitglieder im UN-Sicherheitsrat", 5] ] },

  // ===================== Tiere =====================
  { q: "Welches Tier macht dieses Geräusch?", type: "choice", items: [
    ["Wiehern", "Pferd"], ["Muhen", "Kuh", ["Rind"]], ["Blöken", "Schaf"], ["Grunzen", "Schwein"], ["Meckern", "Ziege"],
    ["Gackern", "Huhn", ["Henne"]], ["Röhren", "Hirsch"], ["Zirpen", "Grille", ["Zikade", "Heuschrecke"]], ["Trompeten", "Elefant"], ["Quaken", "Frosch", ["Ente"]] ] },

  { q: "Wie heißt die Tiergruppe?", type: "choice", items: [
    ["Wölfe", "Rudel"], ["Fische", "Schwarm"], ["Rinder", "Herde"], ["Bienen", "Volk", ["Bienenvolk", "Schwarm"]], ["Ameisen", "Staat", ["Kolonie", "Volk"]],
    ["Wildschweine", "Rotte"], ["Jagdhunde", "Meute"], ["Rehe", "Sprung"], ["Delfine", "Schule"], ["Hühner", "Schar"] ] },

  { q: "Hält das Tier echten Winterschlaf?", type: "tf", items: [
    ["Igel", true], ["Murmeltier", true], ["Siebenschläfer", true], ["Fledermaus", true], ["Haselmaus", true], ["Feldhamster", true],
    ["Fuchs", false], ["Reh", false], ["Wildschwein", false], ["Feldhase", false] ] },

  { q: "Welche Hunderasse ist gemeint?", type: "choice", items: [
    ["Schottischer Hütehund, bekannt als Lassie", "Collie"], ["Kurze Beine, für die Dachsjagd", "Dackel", ["Dachshund", "Teckel"]],
    ["Weiß mit schwarzen Punkten", "Dalmatiner"], ["Lawinenhund mit Fässchen am Hals", "Bernhardiner"], ["Winziger Hund aus Mexiko", "Chihuahua"],
    ["Plattes Gesicht und Ringelschwanz", "Mops"], ["Schnellste Hunderasse", "Greyhound", ["Windhund"]], ["Klassischer Polizeihund", "Deutscher Schäferhund", ["Schäferhund"]],
    ["Schlittenhund mit oft blauen Augen", "Husky", ["Siberian Husky"]], ["Lockiges Fell, kunstvoll frisiert", "Pudel"] ] },

  { q: "Tiere in Zahlen", hint: "Teil 2", type: "num", items: [
    ["Zehen an einer Vorderpfote der Katze", 5], ["Zähne eines erwachsenen Hundes", 42], ["Zähne einer erwachsenen Katze", 30], ["Zitzen am Euter einer Kuh", 4],
    ["Hörner eines Breitmaulnashorns", 2], ["Augen der meisten Spinnen", 8], ["Arme eines Tintenfischs (Sepia, mit Fangarmen)", 10],
    ["Beine einer Garnele", 10], ["Zehen pro Fuß beim Pferd", 1], ["Flügelpaare eines Schmetterlings", 2] ] },

  { q: "Aus welchem Land stammt das Tier ursprünglich?", type: "choice", items: [
    ["Känguru", "Australien"], ["Lama", "Peru", ["Bolivien", "Südamerika", "Anden"]], ["Großer Panda", "China"], ["Lemur", "Madagaskar"],
    ["Komodowaran", "Indonesien"], ["Kakapo", "Neuseeland"], ["Okapi", "Kongo", ["Demokratische Republik Kongo"]],
    ["Galápagos-Riesenschildkröte", "Ecuador"], ["Yak", "China", ["Tibet", "Mongolei"]], ["Beutelteufel", "Australien", ["Tasmanien"]] ] },

  { q: "Ist das ein Fleischfresser?", type: "tf", items: [
    ["Löwe", true], ["Wolf", true], ["Eisbär", true], ["Orca", true], ["Adler", true], ["Hai", true],
    ["Elefant", false], ["Giraffe", false], ["Kuh", false], ["Großer Panda", false] ] },

  { q: "Was frisst das Tier hauptsächlich?", type: "choice", items: [
    ["Koala", "Eukalyptus", ["Eukalyptusblätter"]], ["Ameisenbär", "Ameisen", ["Termiten"]], ["Seidenraupe", "Maulbeerblätter", ["Maulbeere", "Maulbeeren"]],
    ["Blauwal", "Krill"], ["Kolibri", "Nektar"], ["Vampirfledermaus", "Blut"], ["Giraffe", "Akazienblätter", ["Blätter", "Akazien"]],
    ["Mistkäfer", "Dung", ["Mist", "Kot"]], ["Großer Panda", "Bambus"], ["Flamingo", "Krebstiere", ["Krebse", "Algen", "Garnelen", "Kleinkrebse"]] ] },

  // ===================== Sport =====================
  { q: "Wer wurde Fußball-Weltmeister der Männer?", type: "choice", items: [
    ["1930", "Uruguay"], ["1954", "Deutschland", ["BRD", "Westdeutschland"]], ["1966", "England"], ["1986", "Argentinien"],
    ["1990", "Deutschland", ["BRD", "Westdeutschland"]], ["1998", "Frankreich"], ["2002", "Brasilien"], ["2006", "Italien"], ["2010", "Spanien"], ["2022", "Argentinien"] ] },

  { q: "Welche Sportlegende ist gemeint?", type: "choice", names: true, items: [
    ["Gewann 1985 mit 17 Jahren Wimbledon", "Boris Becker"], ["Holte 1988 den „Golden Slam“", "Steffi Graf"], ["Der „Kaiser“ des deutschen Fußballs", "Franz Beckenbauer"],
    ["Der „Bomber der Nation“", "Gerd Müller"], ["Brasilianer mit drei WM-Titeln", "Pelé", ["Pele"]], ["Die „Hand Gottes“ 1986", "Diego Maradona"],
    ["Biathlon-Star aus Wallgau", "Magdalena Neuner"], ["Basketball-Legende der Chicago Bulls", "Michael Jordan"],
    ["Box-Weltmeister-Brüder aus der Ukraine", "Klitschko", ["Vitali Klitschko", "Wladimir Klitschko"]], ["Eisschnellläuferin mit fünf Olympiasiegen", "Claudia Pechstein"] ] },

  { q: "Gibt es das bei Olympischen Winterspielen?", type: "tf", items: [
    ["Biathlon", true], ["Curling", true], ["Skeleton", true], ["Nordische Kombination", true], ["Bob", true], ["Rodeln", true],
    ["Hundeschlittenrennen", false], ["Eisstockschießen", false], ["Snowkiting", false], ["Skijöring", false] ] },

  { q: "Ordne nach Spielern pro Team auf dem Feld.", hint: "1 = die meisten", type: "rank", items: [
    ["Rugby Union", 1], ["Rugby League", 2], ["Fußball", 3], ["Baseball", 4], ["Rudern im Achter", 5],
    ["Handball", 6], ["Eishockey", 7], ["Basketball", 8], ["Polo", 9], ["Beachvolleyball", 10] ] },

  // ===================== Technik =====================
  { q: "Was steckt hinter der Dateiendung?", type: "choice", items: [
    [".jpg", "Bild", ["Foto", "Grafik"]], [".mp3", "Musik", ["Audio", "Ton", "Audiodatei"]], [".mp4", "Video", ["Film"]], [".pdf", "Dokument", ["PDF-Dokument"]],
    [".docx", "Word-Dokument", ["Textdokument", "Word"]], [".xlsx", "Excel-Tabelle", ["Tabelle", "Excel"]], [".zip", "Archiv", ["komprimierte Datei", "gepackte Datei"]],
    [".exe", "Programm", ["ausführbare Datei", "Anwendung"]], [".html", "Webseite", ["Internetseite"]], [".pptx", "Präsentation", ["PowerPoint"]] ] },

  { q: "Welche Website oder App ist gemeint?", type: "choice", items: [
    ["Kurznachrichtendienst, heute „X“", "Twitter"], ["Freies Online-Lexikon", "Wikipedia"], ["Fotos, die nach dem Ansehen verschwinden", "Snapchat"],
    ["Berufliches Netzwerk", "LinkedIn"], ["Musik-Streaming aus Schweden", "Spotify"], ["Private Unterkünfte mieten", "Airbnb"],
    ["Messenger mit grünem Logo", "WhatsApp"], ["Streaming-Plattform für Gamer", "Twitch"], ["Online-Marktplatz mit Auktionen", "eBay"],
    ["Pinnwand für Ideen und Bilder", "Pinterest"] ] },

  { q: "Wurde die Firma in den USA gegründet?", type: "tf", items: [
    ["Apple", true], ["Google", true], ["Amazon", true], ["Microsoft", true], ["Netflix", true], ["Intel", true],
    ["Spotify", false], ["SAP", false], ["Samsung", false], ["Nokia", false] ] },

  { q: "Technik in Zahlen", type: "num", items: [
    ["Zahlenblöcke einer IPv4-Adresse", 4], ["Zeichen eines Tweets ursprünglich", 140], ["Pixel in der Breite bei Full HD", 1920],
    ["Pixel in der Höhe bei Full HD", 1080], ["Stellen einer üblichen Bankkarten-PIN", 4], ["Bit einer IPv6-Adresse", 128],
    ["Zeichen einer SMS", 160], ["Grundfarben bei RGB", 3], ["Kontakte eines USB-A-2.0-Steckers", 4], ["Ziffern im Binärsystem", 2] ] },

  // ===================== Essen =====================
  { q: "Ist das ein Käse aus Italien?", type: "tf", items: [
    ["Mozzarella", true], ["Parmesan", true], ["Gorgonzola", true], ["Pecorino", true], ["Ricotta", true], ["Mascarpone", true],
    ["Feta", false], ["Gruyère", false], ["Manchego", false], ["Edamer", false] ] },

  { q: "Welches Gewürz ist gemeint?", type: "choice", items: [
    ["Teuerstes Gewürz, aus Krokusblüten", "Safran"], ["Gelbes Gewürz im Curry", "Kurkuma", ["Gelbwurz"]], ["Rinde, typisch für Zimtsterne", "Zimt"],
    ["Getrocknete Blütenknospen im Glühwein", "Nelken", ["Gewürznelken", "Nelke"]], ["Schote für den Pudding", "Vanille"],
    ["Scharfe grüne Paste zum Sushi", "Wasabi"], ["Sternförmig, schmeckt nach Lakritz", "Sternanis"], ["Gemahlene rote Schoten aus Ungarn", "Paprika"],
    ["Kraut auf der Pizza, auch „wilder Majoran“", "Oregano"], ["Grünes Kraut, das manche nach Seife schmeckend finden", "Koriander"] ] },

  { q: "Welche Frucht ist gemeint?", type: "choice", items: [
    ["Stachelige Frucht, die sehr streng riecht", "Durian", ["Stinkfrucht"]], ["Pinke Schale, weißes Fruchtfleisch mit schwarzen Kernen", "Drachenfrucht", ["Pitaya", "Pitahaya"]],
    ["Braun und pelzig außen, grün innen", "Kiwi"], ["Im Querschnitt sternförmig", "Sternfrucht", ["Karambole"]], ["Winzige Zitrusfrucht, mit Schale essbar", "Kumquat"],
    ["Runzlige Schale, Kerne in Fruchtgelee", "Maracuja", ["Passionsfrucht"]], ["Größte Baumfrucht der Welt", "Jackfrucht", ["Jackfruit"]],
    ["Voller roter, saftiger Kerne", "Granatapfel"], ["Rote, haarige Schale, Fruchtfleisch wie Litschi", "Rambutan"], ["Steinobst mit samtiger Haut", "Pfirsich"] ] },

  // ===================== Musik =====================
  { q: "Welcher Komponist hat das geschrieben?", type: "choice", names: true, items: [
    ["Die Zauberflöte", "Wolfgang Amadeus Mozart"], ["Für Elise", "Ludwig van Beethoven"], ["Die vier Jahreszeiten", "Antonio Vivaldi"],
    ["Der Ring des Nibelungen", "Richard Wagner"], ["Schwanensee", "Pjotr Tschaikowski", ["Tschaikowsky", "Tchaikovsky"]], ["Boléro", "Maurice Ravel"],
    ["An der schönen blauen Donau", "Johann Strauss", ["Strauß", "Johann Strauß"]], ["Carmen", "Georges Bizet"], ["Aida", "Giuseppe Verdi"],
    ["Rhapsody in Blue", "George Gershwin"] ] },

  { q: "Ist das ein Blasinstrument?", type: "tf", items: [
    ["Trompete", true], ["Saxofon", true], ["Klarinette", true], ["Tuba", true], ["Blockflöte", true], ["Dudelsack", true],
    ["Cello", false], ["Harfe", false], ["Xylofon", false], ["Banjo", false] ] },

  // ===================== Spiele =====================
  { q: "Welches Spiel ist gemeint?", type: "choice", items: [
    ["Bayerisches Kartenspiel zu viert, das Ass heißt „Sau“", "Schafkopf"], ["Kartenspiel mit Reizen, „Grand“ und „Null“", "Skat"],
    ["Begriffe zeichnen, die anderen raten", "Montagsmaler", ["Pictionary"]], ["Begriffe erklären, ohne verbotene Wörter", "Tabu"],
    ["Wer war der Mörder, mit welcher Waffe, in welchem Raum?", "Cluedo"], ["Raster, Treffer, versenkt!", "Schiffe versenken"],
    ["Kartenspiel, bei dem man bei der vorletzten Karte etwas ruft", "UNO"], ["Würfelspiel mit Full House und Straße", "Kniffel", ["Yahtzee"]],
    ["Japanisches Zahlenrätsel im 9×9-Gitter", "Sudoku"], ["Stäbchen vorsichtig aus dem Haufen ziehen", "Mikado"] ] },
);
