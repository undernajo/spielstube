// Erweiterung 3: 60 Karten – Geschichte, Film, Musik, Natur, Wissenschaft, Sprache, Essen, Geografie, Sport, Spiele & Marken.
window.SCHLAU10_CARDS.push(

  // ===================== Geschichte =====================
  { q: "In welchem Jahrzehnt war das?", hint: "Zeitgeschichte", type: "decade", items: [
    ["Beginn des Ersten Weltkriegs", 1910], ["Gründung der Weimarer Republik", 1910], ["Gründung der Vereinten Nationen", 1940],
    ["Römische Verträge (Gründung der EWG)", 1950], ["Bau der Berliner Mauer", 1960], ["Ölkrise mit autofreien Sonntagen", 1970],
    ["Reaktorunglück von Tschernobyl", 1980], ["Anschläge vom 11. September", 2000], ["Pleite der Bank Lehman Brothers", 2000],
    ["Brexit-Referendum", 2010] ] },

  { q: "Ordne die Erfindungen zeitlich.", hint: "1 = am frühesten", type: "rank", items: [
    ["Rad", 1], ["Papier (China)", 2], ["Kompass (China)", 3], ["Buchdruck mit beweglichen Lettern", 4], ["Fernrohr", 5],
    ["Dampfmaschine von James Watt", 6], ["Telefon", 7], ["Glühbirne von Edison", 8], ["Motorflugzeug", 9], ["World Wide Web", 10] ] },

  { q: "War das ein römischer Kaiser?", type: "tf", items: [
    ["Augustus", true], ["Nero", true], ["Caligula", true], ["Trajan", true], ["Hadrian", true],
    ["Marc Aurel", true], ["Julius Caesar", false], ["Hannibal", false], ["Spartacus", false], ["Cicero", false] ] },

  { q: "Wer war's?", hint: "Weltgeschichte", type: "choice", names: true, items: [
    ["Erste Frau mit Nobelpreis", "Marie Curie"], ["Ägyptische Königin, Geliebte Caesars", "Kleopatra", ["Cleopatra"]],
    ["Französischer Kaiser, verlor bei Waterloo", "Napoleon", ["Napoleon Bonaparte", "Bonaparte"]], ["Erster Präsident der USA", "George Washington"],
    ["Fand 1498 den Seeweg nach Indien", "Vasco da Gama", ["da Gama"]], ["Leitete die erste Weltumsegelung (Start 1519)", "Ferdinand Magellan", ["Magalhães", "Magalhaes"]],
    ["Der „Eiserne Kanzler“", "Otto von Bismarck", ["Bismarck"]], ["Führte Indien gewaltfrei in die Unabhängigkeit", "Mahatma Gandhi"],
    ["Erster schwarzer Präsident Südafrikas", "Nelson Mandela"], ["Letzter Staatschef der Sowjetunion", "Michail Gorbatschow", ["Gorbatschow", "Gorbachev", "Gorbi"]] ] },

  { q: "Geschichte in Zahlen", type: "num", items: [
    ["Jahre dauerte der Dreißigjährige Krieg", 30], ["Jahre dauerte der Hundertjährige Krieg wirklich", 116], ["Thesen von Martin Luther", 95],
    ["Ehefrauen von Heinrich VIII.", 6], ["Sieben Weltwunder der Antike – so viele sind es", 7], ["Jahre existierte die DDR", 41],
    ["Jahre stand die Berliner Mauer", 28], ["Könige Roms (der Sage nach)", 7], ["Bemannte Mondlandungen", 6], ["Menschen, die den Mond betreten haben", 12] ] },

  { q: "Gehörte das zu den sieben Weltwundern der Antike?", type: "tf", items: [
    ["Pyramiden von Gizeh", true], ["Hängende Gärten von Babylon", true], ["Koloss von Rhodos", true], ["Leuchtturm von Alexandria", true],
    ["Zeusstatue von Olympia", true], ["Mausoleum von Halikarnassos", true], ["Artemistempel von Ephesos", true],
    ["Kolosseum", false], ["Chinesische Mauer", false], ["Stonehenge", false] ] },

  { q: "In welchem heutigen Land liegt der Ort?", hint: "Schauplätze der Geschichte", type: "choice", items: [
    ["Waterloo", "Belgien"], ["Ort der Varusschlacht", "Deutschland"], ["Strände der D-Day-Landung", "Frankreich"],
    ["Stalingrad (heute Wolgograd)", "Russland"], ["Pearl Harbor", "USA", ["Vereinigte Staaten", "Amerika"]], ["Troja", "Türkei"],
    ["Pompeji", "Italien"], ["Marathon", "Griechenland"], ["Tschernobyl", "Ukraine"], ["Auschwitz", "Polen"] ] },

  // ===================== Film & Serien =====================
  { q: "Wer führte Regie?", type: "choice", names: true, items: [
    ["Titanic", "James Cameron"], ["Jurassic Park", "Steven Spielberg"], ["Pulp Fiction", "Quentin Tarantino"],
    ["Der Pate", "Francis Ford Coppola", ["Coppola"]], ["Psycho", "Alfred Hitchcock"], ["Inception", "Christopher Nolan"],
    ["Der Herr der Ringe", "Peter Jackson"], ["Krieg der Sterne (1977)", "George Lucas"], ["2001: Odyssee im Weltraum", "Stanley Kubrick"],
    ["Lola rennt", "Tom Tykwer"] ] },

  { q: "Aus welchem Film stammt das Zitat?", type: "choice", items: [
    ["„Ich bin dein Vater.“", "Star Wars", ["Das Imperium schlägt zurück", "Krieg der Sterne"]], ["„Ich komme wieder.“", "Terminator", ["The Terminator"]],
    ["„Schau mir in die Augen, Kleines.“", "Casablanca"], ["„Houston, wir haben ein Problem.“", "Apollo 13"],
    ["„Hakuna Matata“", "Der König der Löwen", ["König der Löwen"]], ["„Das Leben ist wie eine Schachtel Pralinen.“", "Forrest Gump"],
    ["„Mein Schatzzz …“", "Der Herr der Ringe", ["Herr der Ringe", "Der Hobbit"]], ["„E.T. nach Hause telefonieren.“", "E.T.", ["E.T. – Der Außerirdische", "ET"]],
    ["„Ich sehe tote Menschen.“", "The Sixth Sense", ["Sixth Sense"]], ["„Bond. James Bond.“", "James Bond", ["007"]] ] },

  { q: "Ist das ein Pixar-Film?", type: "tf", items: [
    ["Toy Story", true], ["Findet Nemo", true], ["Die Unglaublichen", true], ["Oben", true], ["Alles steht Kopf", true],
    ["Ratatouille", true], ["Shrek", false], ["Die Eiskönigin", false], ["Ice Age", false], ["Madagascar", false] ] },

  { q: "In welchem Jahrzehnt kam der Disney-Film ins Kino?", type: "decade", items: [
    ["Schneewittchen und die sieben Zwerge", 1930], ["Bambi", 1940], ["Cinderella", 1950], ["Das Dschungelbuch", 1960],
    ["Arielle, die Meerjungfrau", 1980], ["Der König der Löwen", 1990], ["Mulan", 1990], ["Die Eiskönigin", 2010], ["Vaiana", 2010], ["Encanto", 2020] ] },

  { q: "Wie heißt die Serie?", type: "choice", items: [
    ["Chemielehrer wird Drogenkoch", "Breaking Bad"], ["Sechs Freunde in New York, Stammcafé Central Perk", "Friends"],
    ["Kampf um den Eisernen Thron", "Game of Thrones"], ["Kinder, Monster und die „Upside Down“-Welt", "Stranger Things"],
    ["Physiker-WG in Pasadena", "The Big Bang Theory", ["Big Bang Theory"]], ["Überfall auf die spanische Banknotendruckerei", "Haus des Geldes", ["La Casa de Papel", "Money Heist"]],
    ["Schach-Wunderkind aus dem Waisenhaus", "Das Damengambit", ["Damengambit", "The Queen's Gambit", "Queen's Gambit"]],
    ["Tödliche Kinderspiele um Geld in Südkorea", "Squid Game"], ["Zeitreisen im deutschen Städtchen Winden", "Dark"],
    ["Schwamm in einer Ananas unter dem Meer", "SpongeBob Schwammkopf", ["SpongeBob", "Spongebob"]] ] },

  { q: "Hat der Schauspieler James Bond gespielt?", type: "tf", items: [
    ["Sean Connery", true], ["Roger Moore", true], ["Pierce Brosnan", true], ["Daniel Craig", true], ["Timothy Dalton", true],
    ["George Lazenby", true], ["Hugh Grant", false], ["Tom Cruise", false], ["Christoph Waltz", false], ["Gert Fröbe", false] ] },

  { q: "Film-Zahlen", type: "num", items: [
    ["Zwerge bei Schneewittchen", 7], ["Ringe der Macht insgesamt (Herr der Ringe)", 20], ["Gefährten in „Die Gefährten“", 9],
    ["Infinity-Steine (Marvel)", 6], ["Häuser in Hogwarts", 4], ["Kinder der Familie Weasley", 7], ["Ghostbusters im Originalfilm", 4],
    ["Teenage Mutant Ninja Turtles", 4], ["Zwerge in „Der Hobbit“", 13], ["Zauberer (Istari), die nach Mittelerde kamen", 5] ] },

  { q: "Wie heißt das Fahrzeug?", type: "choice", items: [
    ["Raumschiff von Han Solo", "Millennium Falcon", ["Millennium Falke", "Rasender Falke", "Falcon"]], ["Raumschiff von Captain Kirk", "Enterprise", ["USS Enterprise"]],
    ["Zeitmaschine in „Zurück in die Zukunft“", "DeLorean"], ["Auto von Batman", "Batmobil", ["Batmobile"]], ["Sprechendes Auto aus „Knight Rider“", "K.I.T.T.", ["KITT", "Kitt"]],
    ["Fliegendes Auto der Weasleys (Modell)", "Ford Anglia", ["Anglia"]], ["Herbie (Automodell)", "VW Käfer", ["Käfer", "Volkswagen Käfer"]],
    ["Auto von Mr. Bean (Modell)", "Mini", ["Austin Mini", "Mini Cooper"]], ["Auto der Ghostbusters", "Ecto-1", ["Ecto 1"]],
    ["Zeitmaschine von Doctor Who", "TARDIS", ["Tardis"]] ] },

  // ===================== Musik =====================
  { q: "Wer ist/war Sänger der Band?", type: "choice", names: true, items: [
    ["Queen", "Freddie Mercury"], ["U2", "Bono"], ["The Rolling Stones", "Mick Jagger"], ["Nirvana", "Kurt Cobain"],
    ["Coldplay", "Chris Martin"], ["Die Toten Hosen", "Campino"], ["Rammstein", "Till Lindemann"],
    ["Linkin Park (bis 2017)", "Chester Bennington"], ["The Police", "Sting"], ["Tokio Hotel", "Bill Kaulitz"] ] },

  { q: "In welchem Jahrzehnt erschien der Hit?", hint: "deutschsprachig & aus Deutschland", type: "decade", items: [
    ["„Marmor, Stein und Eisen bricht“ – Drafi Deutscher", 1960], ["„Griechischer Wein“ – Udo Jürgens", 1970], ["„Da Da Da“ – Trio", 1980],
    ["„Major Tom (völlig losgelöst)“ – Peter Schilling", 1980], ["„Wind of Change“ – Scorpions", 1990], ["„Lemon Tree“ – Fool's Garden", 1990],
    ["„Mensch“ – Herbert Grönemeyer", 2000], ["„Durch den Monsun“ – Tokio Hotel", 2000], ["„Satellite“ – Lena", 2010],
    ["„Ein Hoch auf uns“ – Andreas Bourani", 2010] ] },

  { q: "Hat die Person / Band den Eurovision Song Contest gewonnen?", type: "tf", items: [
    ["ABBA", true], ["Céline Dion", true], ["Lena", true], ["Nicole", true], ["Måneskin", true], ["Conchita Wurst", true],
    ["Loreen", true], ["Helene Fischer", false], ["Modern Talking", false], ["Dschinghis Khan", false] ] },

  { q: "Welches Instrument ist gemeint?", hint: "im Orchester", type: "choice", items: [
    ["Größtes Streichinstrument", "Kontrabass", ["Bass"]], ["Blechblasinstrument mit Zug", "Posaune"], ["Holzblasinstrument, quer gehalten", "Querflöte", ["Flöte"]],
    ["Tasteninstrument mit Pfeifen", "Orgel"], ["Großes Zupfinstrument mit Pedalen", "Harfe"], ["Gibt dem Orchester den Stimmton", "Oboe"],
    ["Große Kesseltrommel", "Pauke", ["Kesselpauke", "Timpani"]], ["Kreisförmig gewundenes Blechblasinstrument", "Horn", ["Waldhorn"]],
    ["Tiefes Holzblasinstrument mit Doppelrohrblatt", "Fagott", ["Kontrafagott"]], ["Holzblasinstrument mit einfachem Rohrblatt", "Klarinette"] ] },

  // ===================== Natur =====================
  { q: "Ist das ein Fisch?", type: "tf", items: [
    ["Hai", true], ["Seepferdchen", true], ["Aal", true], ["Rochen", true], ["Lachs", true],
    ["Wal", false], ["Delfin", false], ["Krake", false], ["Seestern", false], ["Qualle", false] ] },

  { q: "Welches Tier ist gemeint?", type: "choice", items: [
    ["Größtes Landtier", "Elefant", ["Afrikanischer Elefant"]], ["Schnellstes Landtier", "Gepard"], ["Größter Vogel", "Strauß", ["Vogel Strauß"]],
    ["Kleinster Vogel", "Kolibri", ["Bienenelfe"]], ["Größte Raubkatze", "Tiger", ["Sibirischer Tiger", "Amurtiger"]], ["Tier mit dem längsten Hals", "Giraffe"],
    ["Einzige Säugetiere, die aktiv fliegen", "Fledermaus", ["Fledermäuse", "Fledertiere", "Flughund"]], ["Springt durch Australien, trägt Junge im Beutel", "Känguru"],
    ["Frisst fast nur Bambus", "Panda", ["Großer Panda", "Pandabär"]], ["Größtes Tier der Erde", "Blauwal"] ] },

  { q: "Welche Pflanze ist gemeint?", type: "choice", items: [
    ["Baum mit Eicheln", "Eiche"], ["Baum mit Bucheckern", "Buche"], ["Baum mit weißer Rinde", "Birke"],
    ["Beliebtester Weihnachtsbaum", "Nordmanntanne", ["Tanne", "Fichte"]], ["Gelbe Osterglocke", "Narzisse", ["Osterglocke"]],
    ["Große gelbe Blume, die sich zur Sonne dreht", "Sonnenblume"], ["Pusteblume", "Löwenzahn"], ["Vierblättrig bringt er Glück", "Klee", ["Kleeblatt"]],
    ["Nationalblume der Niederlande", "Tulpe"], ["Sein Blatt ist auf Kanadas Flagge", "Ahorn"] ] },

  { q: "Ist das ein Reptil?", type: "tf", items: [
    ["Schildkröte", true], ["Krokodil", true], ["Eidechse", true], ["Schlange", true], ["Chamäleon", true],
    ["Leguan", true], ["Frosch", false], ["Feuersalamander", false], ["Axolotl", false], ["Molch", false] ] },

  { q: "Natur in Zahlen", type: "num", items: [
    ["Arme eines Kraken", 8], ["Herzen eines Kraken", 3], ["Magenkammern einer Kuh", 4], ["Höcker eines Dromedars", 1],
    ["Höcker eines Trampeltiers", 2], ["Zehen pro Fuß beim Strauß", 2], ["Arme eines typischen Seesterns", 5],
    ["Blätter eines Glücksklees", 4], ["Flügel einer Biene", 4], ["Augen einer Honigbiene (insgesamt)", 5] ] },

  { q: "Wie heißt die Wissenschaft?", type: "choice", items: [
    ["Lehre von den Tieren", "Zoologie"], ["Lehre von den Pflanzen", "Botanik"], ["Lehre von den Sternen", "Astronomie"],
    ["Lehre von den Pilzen", "Mykologie"], ["Lehre von den Vögeln", "Ornithologie"], ["Lehre von den Insekten", "Entomologie"],
    ["Lehre vom Wetter", "Meteorologie"], ["Lehre von den Erdbeben", "Seismologie"], ["Lehre von Gesteinen und Erdaufbau", "Geologie"],
    ["Lehre von den Fossilien", "Paläontologie"] ] },

  { q: "Unsere Erde – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", items: [
    ["Anteil der Erdoberfläche mit Wasser (%)", 71], ["Anteil Salzwasser am Wasser der Erde (%)", 97], ["Tiefe des Marianengrabens (m)", 11000],
    ["Temperatur im Erdkern (°C)", 5500], ["Anteil Stickstoff in der Luft (%)", 78], ["Anteil Sauerstoff in der Luft (%)", 21],
    ["Fläche des Amazonas-Regenwalds (Mio. km²)", 5.5], ["Fläche der Sahara (Mio. km²)", 9.2], ["Mittlere Temperatur der Erde (°C)", 15],
    ["Kälteste gemessene Temperatur (°C)", -89] ] },

  // ===================== Wissenschaft =====================
  { q: "Welcher Stoff hat diese Formel?", type: "choice", items: [
    ["H₂O", "Wasser"], ["CO₂", "Kohlendioxid", ["Kohlenstoffdioxid"]], ["NaCl", "Kochsalz", ["Natriumchlorid", "Salz"]], ["O₃", "Ozon"],
    ["CH₄", "Methan"], ["H₂SO₄", "Schwefelsäure"], ["NH₃", "Ammoniak"], ["C₆H₁₂O₆", "Traubenzucker", ["Glucose", "Glukose", "Zucker"]],
    ["HCl", "Salzsäure", ["Chlorwasserstoff"]], ["CO", "Kohlenmonoxid", ["Kohlenstoffmonoxid"]] ] },

  { q: "Welcher Forscher ist gemeint?", type: "choice", names: true, items: [
    ["Ordnete das Periodensystem", "Dmitri Mendelejew", ["Mendelejew", "Mendeleev", "Mendelejev"]], ["Die Sonne steht im Mittelpunkt", "Nikolaus Kopernikus", ["Kopernikus", "Copernicus"]],
    ["„Und sie bewegt sich doch!“", "Galileo Galilei", ["Galilei", "Galileo"]], ["Vererbungsregeln mit Erbsen", "Gregor Mendel"],
    ["Erste Impfung gegen Pocken", "Edward Jenner"], ["Haltbarmachen durch Erhitzen", "Louis Pasteur"], ["Wechselstrom und Spulen", "Nikola Tesla"],
    ["„Eine kurze Geschichte der Zeit“", "Stephen Hawking"], ["Die Unschärferelation", "Werner Heisenberg"], ["Entdeckte den Tuberkulose-Erreger", "Robert Koch"] ] },

  { q: "Wissenschaft in Zahlen", type: "num", items: [
    ["Chromosomen im menschlichen Körper (pro Zelle)", 46], ["Elemente im Periodensystem", 118], ["Klassische Aggregatzustände", 3],
    ["Farben im Regenbogen (traditionell)", 7], ["Herzkammern (ohne Vorhöfe)", 2], ["Blutgruppen im AB0-System", 4], ["Klassische Sinne", 5],
    ["Basen der DNA", 4], ["Halswirbel beim Menschen", 7], ["Lungenflügel", 2] ] },

  { q: "Ist das eine SI-Basiseinheit?", type: "tf", items: [
    ["Meter", true], ["Kilogramm", true], ["Sekunde", true], ["Ampere", true], ["Kelvin", true], ["Mol", true], ["Candela", true],
    ["Liter", false], ["Grad Celsius", false], ["Newton", false] ] },

  { q: "In welcher Einheit misst man …?", type: "choice", items: [
    ["… die Stromstärke?", "Ampere"], ["… die Spannung?", "Volt"], ["… die Leistung?", "Watt"], ["… den elektrischen Widerstand?", "Ohm"],
    ["… die Kraft?", "Newton"], ["… die Frequenz?", "Hertz"], ["… die Energie?", "Joule"], ["… den Druck?", "Pascal", ["Bar"]],
    ["… die Lautstärke?", "Dezibel", ["dB"]], ["… die Lichtstärke?", "Candela"] ] },

  // ===================== Sprache =====================
  { q: "Ergänze die Redewendung!", type: "choice", items: [
    ["Jemandem einen ___ aufbinden", "Bären"], ["Die ___ im Sack kaufen", "Katze"], ["Das ist nicht mein ___", "Bier"],
    ["___ auf den Augen haben", "Tomaten"], ["Den ___ an die Wand malen", "Teufel"], ["Ins ___ beißen", "Gras"],
    ["Da liegt der ___ begraben", "Hund"], ["Jemandem die ___ lesen", "Leviten"], ["Sich die ___ in den Bauch stehen", "Beine"],
    ["Etwas auf die lange ___ schieben", "Bank"] ] },

  { q: "Wie heißt das auf Englisch?", type: "choice", items: [
    ["Eichhörnchen", "squirrel"], ["Schildkröte", "turtle", ["tortoise"]], ["Regenschirm", "umbrella"], ["Glühbirne", "light bulb", ["bulb", "lightbulb"]],
    ["Kühlschrank", "fridge", ["refrigerator"]], ["Schmetterling", "butterfly"], ["Erdbeere", "strawberry"], ["Fledermaus", "bat"],
    ["Schlüssel", "key"], ["Bleistift", "pencil"] ] },

  { q: "Wie heißt das auf Italienisch?", type: "choice", items: [
    ["Hund", "cane"], ["Haus", "casa"], ["Brot", "pane"], ["Wasser", "acqua"], ["Katze", "gatto"],
    ["Guten Morgen", "buongiorno", ["buon giorno"]], ["Käse", "formaggio"], ["Apfel", "mela"], ["Berg", "montagna", ["monte"]], ["Buch", "libro"] ] },

  { q: "Ist das ein Palindrom (vorwärts wie rückwärts gleich)?", type: "tf", items: [
    ["Otto", true], ["Anna", true], ["Rentner", true], ["Lagerregal", true], ["Reliefpfeiler", true],
    ["Kajak", true], ["Ananas", false], ["Banane", false], ["Regal", false], ["Radler", false] ] },

  { q: "Wie viele Zeichen sind es?", type: "num", items: [
    ["Buchstaben im deutschen Alphabet (ohne Ä, Ö, Ü, ß)", 26], ["Buchstaben im griechischen Alphabet", 24], ["Buchstaben im russischen Alphabet", 33],
    ["Buchstaben im hawaiischen Alphabet", 13], ["Grundzeichen der japanischen Hiragana", 46], ["Punkte einer Braille-Zelle", 6],
    ["Morsezeichen (Punkte + Striche) für SOS", 9], ["Vokale im Alphabet (ohne Umlaute)", 5], ["Buchstaben in „Schifffahrt“", 11],
    ["Buchstaben in „Donaudampfschifffahrt“", 21] ] },

  // ===================== Essen & Trinken =====================
  { q: "Aus welchem Land stammt das Getränk?", type: "choice", items: [
    ["Ouzo", "Griechenland"], ["Sake", "Japan"], ["Tequila", "Mexiko"], ["Scotch Whisky", "Schottland", ["Großbritannien", "UK"]],
    ["Sangria", "Spanien"], ["Rakı", "Türkei"], ["Guinness", "Irland"], ["Cachaça", "Brasilien"], ["Champagner", "Frankreich"],
    ["Wodka", "Russland", ["Polen"]] ] },

  { q: "Ist das eine Nudelsorte?", type: "tf", items: [
    ["Spaghetti", true], ["Farfalle", true], ["Penne", true], ["Fusilli", true], ["Tagliatelle", true],
    ["Rigatoni", true], ["Risotto", false], ["Bruschetta", false], ["Tiramisu", false], ["Panna cotta", false] ] },

  { q: "Wie heißt das Gericht?", type: "choice", items: [
    ["Schwäbische gefüllte Teigtaschen", "Maultaschen"], ["Paniertes Kalbsschnitzel aus Wien", "Wiener Schnitzel"],
    ["Rheinischer Braten, tagelang in Essig eingelegt", "Sauerbraten"], ["Berliner Imbiss mit Currysoße", "Currywurst"],
    ["Hamburger Seemannsgericht mit Spiegelei", "Labskaus"], ["Schweizer Topf mit geschmolzenem Käse", "Käsefondue", ["Fondue"]],
    ["Bayerischer Camembert-Aufstrich", "Obatzda", ["Obazda", "Obatzter"]], ["Zerrissener Pfannkuchen aus Österreich", "Kaiserschmarrn"],
    ["Kalte spanische Tomatensuppe", "Gazpacho"], ["Kartoffelklöße aus Thüringen", "Thüringer Klöße", ["Klöße", "Knödel", "Thüringer Knödel"]] ] },

  { q: "Essen & Trinken – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", items: [
    ["Kalorien in 100 g Zucker", 400], ["Kalorien in einer mittelgroßen Banane", 100], ["Koffein in einem Espresso (mg)", 65],
    ["Kalorien in 100 g Butter", 740], ["Kalorien in 1 Liter Cola", 420], ["Zuckerwürfel in einer 0,33-l-Dose Cola", 12],
    ["Liter Bier pro Kopf und Jahr in Deutschland", 88], ["Liter Kaffee pro Kopf und Jahr in Deutschland", 165],
    ["Eier pro Kopf und Jahr in Deutschland", 235], ["Liter Wasser für 1 kg Rindfleisch", 15000] ] },

  { q: "Was ist die Hauptzutat?", hint: "Teil 2", type: "choice", items: [
    ["Polenta", "Mais", ["Maisgrieß"]], ["Couscous", "Hartweizengrieß", ["Grieß", "Weizen", "Weizengrieß"]], ["Bier", "Gerste", ["Malz", "Gerstenmalz"]],
    ["Wein", "Trauben", ["Weintrauben"]], ["Schokolade", "Kakao", ["Kakaobohnen"]], ["Tequila", "Agave", ["Agaven"]], ["Rum", "Zuckerrohr", ["Melasse"]],
    ["Mayonnaise", "Eigelb", ["Ei", "Eier", "Öl"]], ["Senf", "Senfkörner", ["Senfsaat", "Senfsamen"]], ["Tahini", "Sesam"] ] },

  // ===================== Geografie =====================
  { q: "Welches Meer / welcher Ozean ist gemeint?", type: "choice", items: [
    ["Zwischen Europa und Afrika", "Mittelmeer"], ["Größter Ozean", "Pazifik", ["Pazifischer Ozean", "Stiller Ozean"]],
    ["Zwischen Europa und Amerika", "Atlantik", ["Atlantischer Ozean"]], ["Hier liegt Sylt", "Nordsee"], ["Hier liegt Rügen", "Ostsee"],
    ["Extrem salzig, tiefster Punkt an Land", "Totes Meer"], ["Zwischen Arabien und Afrika", "Rotes Meer"], ["Zwischen Afrika, Indien und Australien", "Indischer Ozean", ["Indik"]],
    ["Rund um den Nordpol", "Arktischer Ozean", ["Nordpolarmeer", "Arktis", "Eismeer"]], ["Zwischen der Türkei und der Ukraine", "Schwarzes Meer"] ] },

  { q: "Ist das eine Insel (und keine Halbinsel)?", type: "tf", items: [
    ["Grönland", true], ["Madagaskar", true], ["Sizilien", true], ["Sri Lanka", true], ["Island", true],
    ["Borneo", true], ["Bretagne", false], ["Jütland", false], ["Krim", false], ["Kamtschatka", false] ] },

  { q: "In welchem Land liegt das?", hint: "Naturwunder & Sehenswürdigkeiten", type: "choice", items: [
    ["Kilimandscharo", "Tansania"], ["Victoriafälle", "Sambia", ["Simbabwe"]], ["Niagarafälle", "Kanada", ["USA"]], ["Uluru (Ayers Rock)", "Australien"],
    ["Grand Canyon", "USA", ["Vereinigte Staaten", "Amerika"]], ["Angkor Wat", "Kambodscha"], ["Chichén Itzá", "Mexiko"], ["Ha-Long-Bucht", "Vietnam"],
    ["Fuji", "Japan"], ["Iguazú-Wasserfälle", "Argentinien", ["Brasilien"]] ] },

  { q: "Wie weit ist es (Luftlinie)?", type: "estimate", unit: "km", items: [
    ["Berlin – Paris", 880], ["Berlin – Rom", 1180], ["München – Wien", 355], ["Hamburg – München", 612], ["London – Paris", 340],
    ["Madrid – Lissabon", 500], ["Wien – Zürich", 600], ["Berlin – Moskau", 1610], ["Frankfurt – New York", 6200], ["Berlin – Peking", 7360] ] },

  { q: "Liegt die Stadt direkt am Meer?", type: "tf", items: [
    ["Kiel", true], ["Barcelona", true], ["Marseille", true], ["Neapel", true], ["Kapstadt", true],
    ["Sydney", true], ["Madrid", false], ["Paris", false], ["Wien", false], ["Moskau", false] ] },

  { q: "Ordne die Flüsse nach Länge.", hint: "1 = längster (unter diesen zehn)", type: "rank", items: [
    ["Wolga", 1], ["Donau", 2], ["Dnepr", 3], ["Don", 4], ["Rhein", 5], ["Elbe", 6], ["Weichsel", 7], ["Loire", 8], ["Seine", 9], ["Themse", 10] ] },

  // ===================== Sport =====================
  { q: "In welcher Stadt ist der Verein zu Hause?", type: "choice", items: [
    ["Schalke 04", "Gelsenkirchen"], ["Werder", "Bremen"], ["Bayer 04", "Leverkusen"], ["FC St. Pauli", "Hamburg"], ["Juventus", "Turin", ["Torino"]],
    ["Ajax", "Amsterdam"], ["Benfica", "Lissabon"], ["Celtic", "Glasgow"], ["Galatasaray", "Istanbul"], ["Rapid", "Wien"] ] },

  { q: "Sport – schätze!", hint: "ungefähr – Einheit steht dabei", type: "estimate", items: [
    ["Länge der Tour de France (km)", 3400], ["Höhe eines Basketballkorbs (m)", 3.05], ["Gewicht eines Fußballs (g)", 430],
    ["Länge eines Fußballfelds bei WM-Spielen (m)", 105], ["Durchmesser eines Golflochs (cm)", 10.8], ["Höhe des Tennisnetzes in der Mitte (cm)", 91.4],
    ["Gewicht der Kugel beim Kugelstoßen der Männer (kg)", 7.26], ["Länge eines olympischen Schwimmbeckens (m)", 50],
    ["Weltrekord im Speerwurf der Männer (m)", 98.5], ["Weltrekord über 100 m der Männer (Sekunden)", 9.58] ] },

  { q: "War das olympisch in Paris 2024?", type: "tf", items: [
    ["Breaking", true], ["Skateboarding", true], ["Surfen", true], ["Sportklettern", true], ["Tischtennis", true],
    ["Golf", true], ["Cricket", false], ["Darts", false], ["Squash", false], ["Schach", false] ] },

  { q: "Ordne nach dem ersten Mal als Gastgeber der Sommerspiele.", hint: "1 = am frühesten", type: "rank", items: [
    ["Athen", 1], ["Paris", 2], ["London", 3], ["Berlin", 4], ["Rom", 5], ["Tokio", 6], ["München", 7], ["Moskau", 8], ["Seoul", 9], ["Sydney", 10] ] },

  // ===================== Spiele, Marken, Kindheit =====================
  { q: "Welche Marke wirbt damit?", type: "choice", items: [
    ["„Nichts ist unmöglich.“", "Toyota"], ["„Just do it.“", "Nike"], ["„Ich bin doch nicht blöd.“", "MediaMarkt", ["Media Markt"]],
    ["„Vorsprung durch Technik“", "Audi"], ["„Freude am Fahren“", "BMW"], ["„Wir lieben Lebensmittel.“", "Edeka"], ["„Think different.“", "Apple"],
    ["„I'm lovin' it.“", "McDonald's", ["McDonalds", "Mc Donalds"]], ["„Geiz ist geil.“", "Saturn"], ["„Quadratisch. Praktisch. Gut.“", "Ritter Sport"] ] },

  { q: "Welche Marke hat dieses Logo?", type: "choice", items: [
    ["Angebissener Apfel", "Apple"], ["Drei Streifen", "Adidas"], ["Geschwungener Haken", "Nike"], ["Springende Raubkatze", "Puma"],
    ["Gelbe Muschel", "Shell"], ["Goldenes „M“ aus zwei Bögen", "McDonald's", ["McDonalds", "Mc Donalds"]],
    ["Meerjungfrau mit zwei Schwanzflossen", "Starbucks"], ["Aufbäumendes schwarzes Pferd auf Gelb", "Ferrari"],
    ["Blauer Vogel (bis 2023)", "Twitter", ["X"]], ["Weißes Dreieck auf rotem Feld", "YouTube"] ] },

  { q: "Ist das ein Brettspiel?", type: "tf", items: [
    ["Monopoly", true], ["Catan", true], ["Carcassonne", true], ["Scrabble", true], ["Risiko", true],
    ["Cluedo", true], ["UNO", false], ["Skat", false], ["Mikado", false], ["Jenga", false] ] },

  { q: "Kinderbücher & Hörspiele: Wie heißt …?", type: "choice", items: [
    ["… das Pferd von Pippi Langstrumpf?", "Kleiner Onkel"], ["… der Großvater von Heidi?", "Alm-Öhi", ["Almöhi", "Öhi", "Großvater"]],
    ["… der Besen von Bibi Blocksberg?", "Kartoffelbrei"], ["… Benjamin Blümchens bester Freund?", "Otto"], ["… der kleine Drache?", "Kokosnuss"],
    ["… die Lokomotive von Jim Knopf?", "Emma"], ["… der Wochentag, an dem das Sams kam?", "Samstag"], ["… der Hof von Michel aus Lönneberga?", "Katthult"],
    ["… der Freund vom Kasperl beim Räuber Hotzenplotz?", "Seppel"], ["… das Tier, das den Grüffelo erschreckt?", "Maus", ["Die Maus", "kleine Maus"]] ] },

  { q: "Spiele in Zahlen", type: "num", items: [
    ["Felder auf dem Monopoly-Brett", 40], ["Buchstabensteine im deutschen Scrabble", 102], ["Karten beim Rommé (mit Jokern)", 110],
    ["Landschaftsfelder bei Catan (Grundspiel)", 19], ["Holzklötze bei Jenga", 54], ["Würfel bei Kniffel", 5], ["Karten im Pokerblatt", 52],
    ["Felder der Laufbahn bei Mensch ärgere Dich nicht", 40], ["Figuren pro Spieler bei Stratego", 40], ["Stäbe beim Mikado", 41] ] },

  // ===================== Alltag & Deutschland =====================
  { q: "In welchem Jahrzehnt war das?", hint: "Alltag & Spielzeug", type: "decade", items: [
    ["Die Jeans wird patentiert", 1870], ["Coca-Cola wird erfunden", 1880], ["Steiff bringt den Teddybären", 1900], ["Haribo wird gegründet", 1920],
    ["Der Bikini wird vorgestellt", 1940], ["Die erste Barbie", 1950], ["Nutella kommt auf den Markt", 1960], ["Die ersten Playmobil-Figuren", 1970],
    ["Das Tamagotchi erscheint", 1990], ["Der Fidget-Spinner-Hype", 2010] ] },

  { q: "Wächst das unter der Erde?", type: "tf", items: [
    ["Kartoffel", true], ["Karotte", true], ["Rote Bete", true], ["Radieschen", true], ["Erdnuss", true],
    ["Ingwer", true], ["Tomate", false], ["Gurke", false], ["Paprika", false], ["Ananas", false] ] },

  { q: "Welcher Ermittler ist gemeint?", type: "choice", names: true, items: [
    ["Agatha Christies belgischer Detektiv", "Hercule Poirot", ["Poirot"]], ["Agatha Christies ältere Hobby-Detektivin", "Miss Marple", ["Marple"]],
    ["Georges Simenons Pariser Kommissar", "Maigret", ["Kommissar Maigret"]], ["G. K. Chestertons Priester-Detektiv", "Pater Brown", ["Father Brown"]],
    ["Henning Mankells Kommissar aus Ystad", "Kurt Wallander", ["Wallander"]], ["TV-Ermittler im zerknitterten Trenchcoat", "Columbo", ["Inspektor Columbo"]],
    ["Ermittler mit Zwangsstörung aus San Francisco", "Adrian Monk", ["Monk"]], ["Astrid Lindgrens Meisterdetektiv", "Kalle Blomquist", ["Blomquist", "Kalle"]],
    ["Inspector aus Midsomer", "Tom Barnaby", ["Barnaby", "Inspector Barnaby"]], ["Dürrenmatts kranker Kommissar in Bern", "Hans Bärlach", ["Bärlach", "Kommissär Bärlach"]] ] },

  { q: "Deutschland in Zahlen", type: "num", items: [
    ["Stadtstaaten", 3], ["Senate des Bundesverfassungsgerichts", 2], ["Richter am Bundesverfassungsgericht", 16],
    ["Nummer des letzten Grundgesetz-Artikels", 146], ["Die Grundrechte stehen in Artikel 1 bis …", 19], ["Bundesweite gesetzliche Feiertage", 9],
    ["Stellen einer Postleitzahl", 5], ["Mindestalter für das Amt des Bundespräsidenten", 40], ["Wahlalter bei der Bundestagswahl", 18],
    ["Prozent-Hürde für den Einzug in den Bundestag", 5] ] },
);
