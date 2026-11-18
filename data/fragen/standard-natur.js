// Standard-Set, Teil „Tiere & Natur“ – Tiere, Pflanzen, Wetter und Himmel (ergänzt die übrigen Tierkarten ohne Doppelungen).
window.SCHLAU10_CARDS.push(...[

  // ===================== Tiere =====================
  { q: "Legt das Tier Eier?", hint: "Vorsicht – manche bekommen lebende Junge", type: "tf", items: [
    ["Schnabeltier", true], ["Ameisenigel", true], ["Meeresschildkröte", true], ["Lachs", true], ["Zitronenfalter", true],
    ["Alpensalamander", false], ["Blindschleiche", false], ["Kreuzotter", false], ["Känguru", false], ["Fledermaus", false] ] },

  { q: "Ist das ein Beuteltier?", type: "tf", items: [
    ["Känguru", true], ["Koala", true], ["Wombat", true], ["Opossum", true], ["Wallaby", true],
    ["Kurzkopfgleitbeutler", true], ["Schnabeltier", false], ["Ameisenigel", false], ["Faultier", false], ["Erdmännchen", false] ] },

  { q: "Ist das ein Nagetier?", type: "tf", items: [
    ["Eichhörnchen", true], ["Biber", true], ["Murmeltier", true], ["Meerschweinchen", true], ["Stachelschwein", true],
    ["Hamster", true], ["Kaninchen", false], ["Maulwurf", false], ["Spitzmaus", false], ["Igel", false] ] },

  { q: "Gehört das Tier biologisch zur Ordnung der Raubtiere?", hint: "nicht: „frisst Fleisch“, sondern die Tierordnung", type: "tf", items: [
    ["Großer Panda", true], ["Seehund", true], ["Walross", true], ["Waschbär", true], ["Dachs", true],
    ["Hyäne", true], ["Steinadler", false], ["Krokodil", false], ["Beutelteufel", false], ["Hecht", false] ] },

  { q: "Zu welcher Tiergruppe gehört das Tier?", type: "choice", options: ["Säugetier", "Vogel", "Reptil", "Amphibie", "Fisch", "Insekt"], items: [
    ["Grottenolm", "Amphibie"], ["Feuersalamander", "Amphibie"], ["Bartagame", "Reptil"], ["Gürteltier", "Säugetier"], ["Schuppentier", "Säugetier"],
    ["Kasuar", "Vogel"], ["Mondfisch", "Fisch"], ["Seeteufel", "Fisch"], ["Gottesanbeterin", "Insekt"], ["Wandelndes Blatt", "Insekt"] ] },

  { q: "Wozu gehört das Krabbeltier?", type: "choice", options: ["Insekt", "Spinnentier", "Krebstier", "Weichtier"], items: [
    ["Zecke", "Spinnentier"], ["Milbe", "Spinnentier"], ["Weberknecht", "Spinnentier"], ["Kellerassel", "Krebstier"], ["Garnele", "Krebstier"],
    ["Weinbergschnecke", "Weichtier"], ["Tintenfisch", "Weichtier"], ["Miesmuschel", "Weichtier"], ["Ohrwurm", "Insekt"], ["Silberfischchen", "Insekt"] ] },

  { q: "Wo lebt das Tier in freier Wildbahn?", type: "choice", options: ["Afrika", "Asien", "Australien", "Südamerika", "Nordamerika", "Europa"], items: [
    ["Gorilla", "Afrika"], ["Erdmännchen", "Afrika"], ["Orang-Utan", "Asien"], ["Tiger", "Asien"], ["Koala", "Australien"],
    ["Wombat", "Australien"], ["Nandu", "Südamerika"], ["Kodiakbär", "Nordamerika"], ["Amerikanischer Bison", "Nordamerika"], ["Wisent", "Europa"] ] },

  { q: "Ordne die Tiere nach Gewicht.", hint: "1 = am schwersten (ausgewachsen)", type: "rank", items: [
    ["Blauwal", 1], ["Afrikanischer Elefant", 2], ["Giraffe", 3], ["Eisbär", 4], ["Löwe", 5],
    ["Mensch", 6], ["Biber", 7], ["Hauskatze", 8], ["Eichhörnchen", 9], ["Kolibri", 10] ] },

  { q: "Wie heißt das Tier in der Fabel?", hint: "z. B. in „Reineke Fuchs“", type: "choice", items: [
    ["Fuchs", "Reineke"], ["Wolf", "Isegrim"], ["Löwe", "Nobel", ["König Nobel"]], ["Bär", "Braun", ["Petz", "Meister Petz", "Braun der Bär"]],
    ["Hase", "Lampe", ["Meister Lampe"]], ["Dachs", "Grimbart"], ["Storch", "Adebar"], ["Kater", "Hinze"], ["Hahn", "Henning"], ["Biber", "Bockert", ["Meister Bockert"]] ] },

  { q: "Wie heißt die Behausung des Tieres?", type: "choice", items: [
    ["Biber", "Burg", ["Biberburg"]], ["Fuchs", "Bau", ["Fuchsbau"]], ["Adler", "Horst", ["Adlerhorst"]], ["Eichhörnchen", "Kobel"], ["Feldhase", "Sasse"],
    ["Honigbiene", "Stock", ["Bienenstock", "Bienenkorb", "Beute"]], ["Waldameise", "Haufen", ["Ameisenhaufen", "Ameisenhügel", "Hügel"]],
    ["Specht", "Höhle", ["Spechthöhle", "Baumhöhle"]], ["Hund", "Hütte", ["Hundehütte"]], ["Wespe", "Nest", ["Wespennest"]] ] },

  { q: "Welcher Vogel ist gemeint?", type: "choice", items: [
    ["Legt seine Eier in fremde Nester", "Kuckuck"], ["Klopft mit dem Schnabel Löcher in Baumstämme", "Specht"],
    ["Klappert auf dem Dach und bringt der Sage nach die Babys", "Storch", ["Weißstorch"]], ["Rosa Federn, steht oft auf einem Bein", "Flamingo"],
    ["Schwarz-weiß, soll angeblich glänzende Dinge stehlen", "Elster"], ["Frisst vor allem Knochen, wurde in den Alpen wieder angesiedelt", "Bartgeier"],
    ["Weißer Wasservogel mit langem Hals, Titel eines Balletts von Tschaikowsky", "Schwan"], ["Kleiner Gartenvogel mit orangeroter Brust", "Rotkehlchen"],
    ["Großer Kehlsack am Schnabel zum Fischfang", "Pelikan"], ["Das Männchen schlägt ein Rad", "Pfau"] ] },

  { q: "Welches heimische Tier ist gemeint?", type: "choice", items: [
    ["Gräbt einen Bau, frisst gern Regenwürmer, schwarz-weiß gestreifter Kopf", "Dachs"], ["Raubkatze der Wälder mit Pinselohren", "Luchs"],
    ["Gräbt Gänge unter der Wiese und wirft Hügel auf", "Maulwurf"], ["Größte Eule Europas, ruft nachts „Uhu“", "Uhu"],
    ["Größte heimische Hirschart, röhrt im Herbst", "Rothirsch", ["Hirsch", "Edelhirsch"]], ["Kleiner Räuber mit weißem Kehlfleck, beißt gern Autokabel an", "Marder", ["Steinmarder"]],
    ["Leuchtend blau-orange, taucht nach kleinen Fischen", "Eisvogel"], ["Größter heimischer Käfer, die Männchen tragen ein „Geweih“", "Hirschkäfer"],
    ["Hinterlässt eine Schleimspur und frisst Salat – ganz ohne Haus", "Nacktschnecke", ["Wegschnecke", "Schnecke"]], ["Giftschlange mit Zickzackband auf dem Rücken", "Kreuzotter"] ] },

  { q: "Ist das Tier vor allem nachtaktiv?", type: "tf", items: [
    ["Uhu", true], ["Igel", true], ["Dachs", true], ["Glühwürmchen", true], ["Waschbär", true],
    ["Eichhörnchen", false], ["Murmeltier", false], ["Steinadler", false], ["Honigbiene", false], ["Eisvogel", false] ] },

  { q: "Lebt das Tier im Meer?", type: "tf", items: [
    ["Seeigel", true], ["Hummer", true], ["Orca", true], ["Muräne", true], ["Clownfisch", true],
    ["Hecht", false], ["Bachforelle", false], ["Karpfen", false], ["Flusspferd", false], ["Wels", false] ] },

  { q: "Lebt das Tier wild in den Alpen?", type: "tf", items: [
    ["Steinbock", true], ["Gämse", true], ["Murmeltier", true], ["Bartgeier", true], ["Alpensalamander", true],
    ["Schneehase", true], ["Steinadler", true], ["Elch", false], ["Rentier", false], ["Lama", false] ] },

  { q: "Wird das Tier im Winter weiß?", hint: "Fell oder Gefieder", type: "tf", items: [
    ["Schneehase", true], ["Hermelin", true], ["Polarfuchs", true], ["Alpenschneehuhn", true], ["Halsbandlemming", true],
    ["Rotfuchs", false], ["Reh", false], ["Eichhörnchen", false], ["Gämse", false], ["Wildschwein", false] ] },

  { q: "Ist das Tier ausgestorben?", type: "tf", items: [
    ["Dodo", true], ["Mammut", true], ["Säbelzahnkatze", true], ["Beutelwolf (Tasmanischer Tiger)", true], ["Wollnashorn", true],
    ["Riesenalk", true], ["Quastenflosser", false], ["Pfeilschwanzkrebs", false], ["Axolotl", false], ["Przewalski-Pferd", false] ] },

  { q: "Was liefert uns das Tier?", type: "choice", items: [
    ["Honigbiene", "Honig", ["Wachs", "Bienenwachs"]], ["Seidenraupe", "Seide"], ["Merinoschaf", "Wolle", ["Merinowolle"]], ["Auster", "Perle", ["Perlen"]],
    ["Pottwal (früher, für Parfüm)", "Ambra", ["Amber"]], ["Koschenilleschildlaus", "Karmin", ["roter Farbstoff", "Karminrot", "Farbstoff"]],
    ["Kaschmirziege", "Kaschmir", ["Kaschmirwolle", "Wolle"]], ["Angorakaninchen", "Angorawolle", ["Angora", "Wolle"]],
    ["Eiderente", "Daunen", ["Eiderdaunen", "Federn"]], ["Moschushirsch (früher, für Parfüm)", "Moschus"] ] },

  // ===================== Pflanzen =====================
  { q: "Ist die Pflanze (oder sind Teile davon) giftig?", type: "tf", items: [
    ["Fingerhut", true], ["Maiglöckchen", true], ["Tollkirsche", true], ["Eibe", true], ["Herbstzeitlose", true],
    ["Eisenhut", true], ["Brennnessel", false], ["Löwenzahn", false], ["Gänseblümchen", false], ["Sonnenblume", false] ] },

  { q: "Ist das ein Pilz?", type: "tf", items: [
    ["Fliegenpilz", true], ["Pfifferling", true], ["Steinpilz", true], ["Trüffel", true], ["Hefe", true],
    ["Champignon", true], ["Moos", false], ["Farn", false], ["Seetang", false], ["Schachtelhalm", false] ] },

  { q: "Ist das ein Getreide?", hint: "ein Süßgras", type: "tf", items: [
    ["Weizen", true], ["Roggen", true], ["Gerste", true], ["Hafer", true], ["Mais", true],
    ["Reis", true], ["Hirse", true], ["Buchweizen", false], ["Quinoa", false], ["Raps", false] ] },

  { q: "Welcher Baum ist gemeint?", type: "choice", items: [
    ["Einziger heimischer Nadelbaum, der im Herbst seine Nadeln abwirft", "Lärche"], ["Glänzend braune Früchte, die Kinder im Herbst sammeln – essen kann man sie nicht", "Rosskastanie", ["Kastanie"]],
    ["Nadelbaum der Hochalpen, sein duftendes Holz ist beliebt für Stuben", "Zirbe", ["Zirbelkiefer", "Arve", "Zirbel"]], ["Herzförmige Blätter, steht oft in der Dorfmitte, Blütentee", "Linde"],
    ["Hängende Zweige am Wasser, im Frühling pelzige Kätzchen", "Weide", ["Trauerweide"]], ["Aus seinem Saft wird Sirup für Pfannkuchen gekocht", "Ahorn", ["Zuckerahorn"]],
    ["Liefert Öl, wächst rund ums Mittelmeer", "Olivenbaum", ["Ölbaum", "Olive"]], ["Trägt Kokosnüsse", "Kokospalme", ["Palme"]],
    ["Die größten Bäume der Welt, in Kalifornien", "Mammutbaum", ["Sequoia", "Küstenmammutbaum", "Riesenmammutbaum"]], ["Seine Blüte ist ein Symbol Japans", "Kirschbaum", ["Kirsche", "Japanische Kirsche", "Zierkirsche"]] ] },

  { q: "Welche Blume ist gemeint?", type: "choice", items: [
    ["„Königin der Blumen“, mit Dornen", "Rose"], ["Weiße, filzige Alpenblume, Symbol der Alpen", "Edelweiß"], ["Tiefblaue Alpenblume, auch ein Schnaps heißt so", "Enzian"],
    ["Lila Felder in der Provence, duftet stark", "Lavendel"], ["Rote Blüte am Feldrand, ihre Samen kommen aufs Brötchen", "Mohn", ["Klatschmohn"]],
    ["Blaue Blume im Getreidefeld", "Kornblume"], ["Wächst im Wasser, heilige Blume in Indien", "Lotus", ["Lotusblume"]],
    ["Kleine blaue Blume, ihr Name ist eine Bitte", "Vergissmeinnicht"], ["Rote Blüten auf der Alm, botanisch ein Rhododendron", "Alpenrose"],
    ["Schwimmt mit großen Blättern auf dem Teich, Monet hat sie oft gemalt", "Seerose"] ] },

  { q: "Ist das botanisch eine Nuss?", type: "tf", items: [
    ["Haselnuss", true], ["Esskastanie", true], ["Eichel", true], ["Buchecker", true], ["Erdnuss", false],
    ["Mandel", false], ["Kokosnuss", false], ["Cashew", false], ["Paranuss", false], ["Pistazie", false] ] },

  { q: "Ist das botanisch eine Frucht?", hint: "entsteht aus der Blüte", type: "tf", items: [
    ["Kürbis", true], ["Aubergine", true], ["Zucchini", true], ["Avocado", true], ["Olive", true],
    ["Rhabarber", false], ["Spinat", false], ["Spargel", false], ["Zwiebel", false], ["Brokkoli", false] ] },

  { q: "Aus welcher Pflanze stammt das?", type: "choice", items: [
    ["Jeansstoff", "Baumwolle"], ["Der typische Geschmack von Gin", "Wacholder", ["Wacholderbeeren", "Wacholderbeere"]], ["Leinen", "Flachs", ["Lein"]],
    ["Naturkautschuk", "Kautschukbaum", ["Gummibaum", "Kautschuk"]], ["Korken", "Korkeiche"], ["Der bittere Geschmack im Bier", "Hopfen"],
    ["Süßstoff ohne Kalorien aus Südamerika", "Stevia", ["Süßkraut", "Honigkraut"]], ["Popcorn", "Mais"], ["Vanilleschoten (die Pflanze ist eine …)", "Orchidee", ["Vanille-Orchidee", "Vanilleorchidee"]],
    ["Zucker in Europa (meistens)", "Zuckerrübe", ["Rübe"]] ] },

  // ===================== Natur, Wetter & Himmel =====================
  { q: "Stimmt das? (Natur-Irrtümer)", type: "tf", items: [
    ["Tomaten sind botanisch Beeren.", true], ["Bananen sind botanisch Beeren.", true], ["Erdbeeren sind botanisch keine Beeren.", true],
    ["Haie gab es schon, bevor es Bäume gab.", true], ["Kraken haben blaues Blut.", true], ["Goldfische können sich nur 3 Sekunden lang etwas merken.", false],
    ["Strauße stecken bei Gefahr den Kopf in den Sand.", false], ["Fledermäuse sind blind.", false],
    ["Teilt man einen Regenwurm, werden daraus zwei Würmer.", false], ["Der Blitz schlägt nie zweimal an derselben Stelle ein.", false] ] },

  { q: "Was ist gemeint? (Wetter)", type: "choice", items: [
    ["Bogen in sieben Farben nach dem Regen", "Regenbogen"], ["Leuchtende Schleier am Nachthimmel im hohen Norden", "Polarlicht", ["Nordlicht", "Aurora", "Polarlichter"]],
    ["Warmer, trockener Fallwind in den Alpen", "Föhn"], ["Tropischer Wirbelsturm über dem Atlantik", "Hurrikan", ["Hurricane"]],
    ["Tropischer Wirbelsturm über dem westlichen Pazifik", "Taifun"], ["Eiskörner, die aus Gewitterwolken fallen", "Hagel"],
    ["Wassertropfen am Morgen auf dem Gras", "Tau", ["Morgentau"]], ["Warme Meeresströmung vor Südamerika, beeinflusst das Weltwetter", "El Niño", ["El Nino"]],
    ["Kalter, stürmischer Fallwind an der Adria", "Bora"], ["Jahreszeitlicher Wind, bringt Indien die Regenzeit", "Monsun"] ] },

  { q: "Was ist gemeint? (Am Himmel)", type: "choice", items: [
    ["Leuchtspur am Nachthimmel – man darf sich etwas wünschen", "Sternschnuppe", ["Meteor"]], ["Der Mond leuchtet als ganze runde Scheibe", "Vollmond"],
    ["Sieben helle Sterne, die wie ein Wagen aussehen", "Großer Wagen"], ["Gesteinsbrocken aus dem All, der auf der Erde einschlägt", "Meteorit"],
    ["Der Mond schiebt sich vor die Sonne", "Sonnenfinsternis"], ["Die Erde wirft ihren Schatten auf den Mond", "Mondfinsternis"],
    ["Himmelskörper mit leuchtendem Schweif", "Komet"], ["Der Mond ist gar nicht zu sehen", "Neumond"],
    ["Planet mit den auffälligsten Ringen", "Saturn"], ["Der Stern, der uns am nächsten ist", "Sonne"] ] },

  { q: "Auf welchem Kontinent liegt die Wüste?", type: "choice", options: ["Afrika", "Asien", "Australien", "Nordamerika", "Südamerika"], items: [
    ["Sahara", "Afrika"], ["Kalahari", "Afrika"], ["Namib", "Afrika"], ["Gobi", "Asien"], ["Taklamakan", "Asien"],
    ["Rub al-Chali", "Asien"], ["Große Victoria-Wüste", "Australien"], ["Mojave", "Nordamerika"], ["Sonora", "Nordamerika"], ["Atacama", "Südamerika"] ] },

  { q: "In welcher Jahreszeit ist das?", type: "choice", options: ["Frühling", "Sommer", "Herbst", "Winter"], items: [
    ["Die Zugvögel kehren zurück", "Frühling"], ["Krokusse und Märzenbecher blühen", "Frühling"], ["Die Apfelbäume blühen", "Frühling"],
    ["Der längste Tag des Jahres", "Sommer"], ["Das Getreide wird geerntet", "Sommer"], ["Siebenschläfertag (27. Juni)", "Sommer"],
    ["Die Hirsche röhren in der Brunft", "Herbst"], ["Weinlese und Törggelen", "Herbst"], ["Die Blätter färben sich bunt", "Herbst"],
    ["Der kürzeste Tag des Jahres", "Winter"] ] },

  { q: "Was ist gemeint? (Begriffe aus der Natur)", type: "choice", items: [
    ["Die Raupe wird zum Schmetterling", "Metamorphose", ["Verwandlung"]], ["Hülle, in der sich die Raupe verpuppt", "Kokon", ["Puppe"]],
    ["Pflanzen machen aus Licht, Wasser und CO₂ Zucker", "Photosynthese", ["Fotosynthese"]], ["Grüner Farbstoff der Blätter", "Chlorophyll", ["Blattgrün"]],
    ["Feiner Blütenstaub", "Pollen"], ["Bienen tragen Pollen von Blüte zu Blüte", "Bestäubung"],
    ["Die abgestreifte Haut einer Schlange", "Natternhemd", ["Schlangenhaut", "Häutung"]], ["Im Herbst fliegen viele Vögel in den Süden", "Vogelzug"],
    ["Eier von Fröschen und Fischen im Wasser", "Laich", ["Froschlaich"]], ["Paarungszeit der Hirsche mit lautem Röhren", "Brunft", ["Brunftzeit", "Brunst"]] ] },

  { q: "Ist das ein Edelstein?", hint: "im mineralogischen Sinn", type: "tf", items: [
    ["Diamant", true], ["Rubin", true], ["Saphir", true], ["Smaragd", true], ["Topas", true],
    ["Aquamarin", true], ["Granit", false], ["Marmor", false], ["Bernstein", false], ["Perle", false] ] },

]); // gehört zum Standard-Set
