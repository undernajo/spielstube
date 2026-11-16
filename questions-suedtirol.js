// Fragen-Set „Südtirol“ – wird in der Lobby unter „Fragen“ ausgewählt.
// Format wie in questions2.js; jede Karte bekommt automatisch set: "suedtirol".
window.SCHLAU10_CARDS.push(...[

  // ===================== Orte & Täler =====================
  { q: "Wie heißt der Ort auf Italienisch?", type: "choice", items: [
    ["Bozen", "Bolzano"], ["Meran", "Merano"], ["Brixen", "Bressanone"], ["Bruneck", "Brunico"], ["Sterzing", "Vipiteno"],
    ["Schlanders", "Silandro"], ["Klausen", "Chiusa"], ["Kaltern", "Caldaro", ["Caldaro sulla Strada del Vino"]],
    ["Toblach", "Dobbiaco"], ["Innichen", "San Candido"] ] },

  { q: "Wie heißt der Ort auf Deutsch?", type: "choice", items: [
    ["Glorenza", "Glurns"], ["Malles Venosta", "Mals"], ["Laives", "Leifers"], ["Appiano", "Eppan", ["Eppan an der Weinstraße"]],
    ["Egna", "Neumarkt"], ["Monguelfo", "Welsberg"], ["Campo Tures", "Sand in Taufers"],
    ["Ortisei", "St. Ulrich", ["Sankt Ulrich", "St. Ulrich in Gröden", "St Ulrich"]],
    ["Selva di Val Gardena", "Wolkenstein", ["Wolkenstein in Gröden"]], ["Colle Isarco", "Gossensaß"] ] },

  { q: "In welchem Tal liegt der Ort?", type: "choice", items: [
    ["Sterzing", "Wipptal"], ["Bruneck", "Pustertal"], ["Mals", "Vinschgau"],
    ["St. Ulrich", "Gröden", ["Grödental", "Grödner Tal", "Val Gardena"]], ["Corvara", "Gadertal", ["Alta Badia", "Val Badia"]],
    ["St. Leonhard", "Passeiertal", ["Passeier"]], ["Sarnthein", "Sarntal"], ["Klausen", "Eisacktal"],
    ["Karthaus", "Schnalstal", ["Schnals"]], ["St. Walburg", "Ultental", ["Ulten"]] ] },

  { q: "Welcher Fluss fließt durch den Ort?", type: "choice", items: [
    ["Meran", "Passer", ["Etsch"]], ["Brixen", "Eisack", ["Rienz"]], ["Bruneck", "Rienz"], ["Sterzing", "Eisack"],
    ["Glurns", "Etsch"], ["Sand in Taufers", "Ahr"], ["Sarnthein", "Talfer"], ["Bozen", "Talfer", ["Eisack", "Etsch"]],
    ["Klausen", "Eisack"], ["Schlanders", "Etsch"] ] },

  { q: "Liegt der Ort im Vinschgau?", type: "tf", items: [
    ["Mals", true], ["Glurns", true], ["Schlanders", true], ["Laas", true], ["Prad am Stilfser Joch", true],
    ["Latsch", true], ["Sterzing", false], ["Bruneck", false], ["Kaltern", false], ["Brixen", false] ] },

  { q: "Liegt der Ort im Pustertal?", type: "tf", items: [
    ["Bruneck", true], ["Innichen", true], ["Toblach", true], ["Olang", true], ["Welsberg", true],
    ["Sexten", true], ["Klausen", false], ["Lana", false], ["Mals", false], ["Neumarkt", false] ] },

  { q: "Ist die Gemeinde mehrheitlich ladinischsprachig?", type: "tf", items: [
    ["St. Ulrich in Gröden", true], ["St. Christina in Gröden", true], ["Wolkenstein in Gröden", true], ["Corvara", true],
    ["Abtei", true], ["Wengen", true], ["St. Martin in Thurn", true], ["Toblach", false], ["Kastelruth", false], ["Klausen", false] ] },

  // ===================== Natur & Berge =====================
  { q: "Liegt der See in Südtirol?", type: "tf", items: [
    ["Pragser Wildsee", true], ["Karersee", true], ["Kalterer See", true], ["Reschensee", true], ["Antholzer See", true],
    ["Montiggler See", true], ["Gardasee", false], ["Achensee", false], ["Wolfgangsee", false], ["Plansee", false] ] },

  { q: "Gehört der Gipfel zu den Dolomiten?", type: "tf", items: [
    ["Langkofel", true], ["Schlern", true], ["Rosengarten", true], ["Sella", true], ["Peitlerkofel", true],
    ["Drei Zinnen", true], ["Ortler", false], ["Similaun", false], ["Hochfeiler", false], ["Weißkugel", false] ] },

  { q: "Wie hoch ist der Berg?", type: "estimate", tol: 0.05, unit: "m", items: [
    ["Ortler", 3905], ["Königsspitze", 3851], ["Weißkugel", 3739], ["Similaun", 3606], ["Hochfeiler", 3510],
    ["Hochgall", 3436], ["Langkofel", 3181], ["Kesselkogel (Rosengarten)", 3004], ["Peitlerkofel", 2875], ["Schlern", 2563] ] },

  { q: "Wie hoch liegt der Pass?", type: "estimate", tol: 0.1, unit: "m", items: [
    ["Brennerpass", 1370], ["Reschenpass", 1504], ["Stilfser Joch", 2757], ["Timmelsjoch", 2474], ["Jaufenpass", 2094],
    ["Grödner Joch", 2121], ["Sellajoch", 2240], ["Penser Joch", 2211], ["Staller Sattel", 2052], ["Würzjoch", 2000] ] },

  // ===================== Geschichte & Personen =====================
  { q: "In welchem Jahr war das?", type: "num", items: [
    ["Andreas Hofer wird in Mantua hingerichtet", 1810], ["Vertrag von Saint-Germain: Südtirol kommt zu Italien", 1919],
    ["Option: Südtiroler müssen sich zwischen Deutschland und Italien entscheiden", 1939], ["Gruber-De-Gasperi-Abkommen", 1946],
    ["Der Reschensee wird aufgestaut, das Dorf Graun versinkt", 1950], ["Feuernacht", 1961], ["Zweites Autonomiestatut tritt in Kraft", 1972],
    ["Messner und Habeler auf dem Everest ohne Flaschensauerstoff", 1978], ["Ötzi wird gefunden", 1991],
    ["Streitbeilegungserklärung vor der UNO", 1992] ] },

  { q: "Ordne die Ereignisse zeitlich.", hint: "1 = am frühesten", type: "rank", items: [
    ["Ötzi lebt in den Alpen", 1], ["Margarete Maultasch übergibt Tirol an die Habsburger", 2],
    ["Oswald von Wolkenstein wird geboren", 3], ["Tiroler Aufstand unter Andreas Hofer", 4], ["Die Brennerbahn wird fertig", 5],
    ["Südtirol kommt zu Italien", 6], ["Die Option", 7], ["Gruber-De-Gasperi-Abkommen", 8], ["Zweites Autonomiestatut", 9],
    ["Ötzi wird gefunden", 10] ] },

  { q: "In welchem Jahrzehnt war das?", type: "decade", items: [
    ["Die Brennerbahn wird eröffnet", 1860], ["Die Option", 1930], ["Der Reschensee wird aufgestaut", 1950],
    ["Gründung der Freien Universität Bozen", 1990], ["Armin Zöggeler holt sein erstes Olympia-Gold", 2000],
    ["Die Dolomiten werden UNESCO-Welterbe", 2000], ["Die Vinschgaubahn fährt wieder", 2000],
    ["Dorothea Wierer gewinnt zum ersten Mal den Biathlon-Gesamtweltcup", 2010], ["Biathlon-WM in Antholz", 2020],
    ["Jannik Sinner gewinnt die Australian Open", 2020] ] },

  { q: "Wer ist gemeint?", type: "choice", names: true, items: [
    ["Bestieg als Erster alle 14 Achttausender", "Reinhold Messner"], ["Anführer des Tiroler Aufstands 1809", "Andreas Hofer"],
    ["Landeshauptmann 1960–1989, „Vater der Autonomie“", "Silvius Magnago"], ["Landeshauptmann 1989–2014", "Luis Durnwalder"],
    ["Landeshauptmann seit 2014", "Arno Kompatscher"], ["Tennisstar aus Sexten", "Jannik Sinner"],
    ["Rodel-Olympiasieger 2002 und 2006, „Kannibale“", "Armin Zöggeler"], ["Biathletin aus dem Antholzer Tal", "Dorothea Wierer"],
    ["Liedermacher und Ritter mit nur einem Auge (um 1400)", "Oswald von Wolkenstein", ["Wolkenstein", "Oswald"]],
    ["5.300 Jahre alte Gletschermumie", "Ötzi", ["Mann aus dem Eis", "Der Mann aus dem Eis", "Mann vom Similaun", "Similaun-Mann"]] ] },

  // ===================== Allerlei =====================
  { q: "Wie heißt …?", hint: "Südtirol-Allerlei", type: "choice", items: [
    ["… die Landeshauptstadt?", "Bozen", ["Bolzano"]], ["… der größte natürliche See Südtirols?", "Kalterer See", ["Kalterersee"]],
    ["… der Stausee mit dem Kirchturm im Wasser?", "Reschensee", ["Reschen"]], ["… der höchste Berg Südtirols?", "Ortler"],
    ["… der längste Fluss Südtirols?", "Etsch", ["Adige"]], ["… das Gebirge der „Bleichen Berge“?", "Dolomiten"],
    ["… die größte Hochalm Europas?", "Seiser Alm"], ["… der Pass mit der Autobahn nach Österreich?", "Brenner", ["Brennerpass"]],
    ["… die Kurstadt mit den Gärten von Trauttmansdorff?", "Meran", ["Merano"]],
    ["… die kleine Stadt im Vinschgau mit vollständiger Stadtmauer?", "Glurns", ["Glorenza"]] ] },

  { q: "Welches Wort fehlt?", type: "choice", items: [
    ["Herz-___-Feuer", "Jesu"], ["___ Alm", "Seiser"], ["Drei ___", "Zinnen"], ["___ Wildsee", "Pragser"],
    ["Gärten von Schloss ___", "Trauttmansdorff", ["Trautmannsdorf", "Trauttmannsdorff"]], ["Messner Mountain ___", "Museum"],
    ["Kalterer ___", "See"], ["___weg (Wanderweg entlang alter Bewässerungskanäle)", "Waal"],
    ["Schloss ___ (Messners Burg im Vinschgau)", "Juval"], ["Stilfser ___", "Joch"] ] },

  { q: "Ist die Aussage wahr?", type: "tf", items: [
    ["Südtirol hat drei Amtssprachen.", true], ["Der Ortler ist höher als die Zugspitze.", true],
    ["Die Seiser Alm ist die größte Hochalm Europas.", true], ["Meran liegt an der Passer.", true],
    ["Die Etsch mündet in die Adria.", true], ["Südtirol grenzt an die Schweiz.", true],
    ["Ötzi ist in Innsbruck ausgestellt.", false], ["Bozen hat mehr Einwohner als Innsbruck.", false],
    ["Südtirol grenzt an Slowenien.", false], ["Im Vinschgau wird mehrheitlich Ladinisch gesprochen.", false] ] },

  // ===================== Essen, Trinken, Dialekt =====================
  { q: "Welche Südtiroler Spezialität ist gemeint?", type: "choice", items: [
    ["Halbmondförmige Teigtaschen aus Roggenmehl mit Spinatfüllung", "Schlutzkrapfen", ["Schlutzer"]],
    ["Knuspriges, flaches Brot mit Kümmel und Fenchel", "Schüttelbrot"], ["Paarweise geräucherte Rohwurst", "Kaminwurz", ["Kaminwurzen"]],
    ["Geräucherter Schinken mit geschützter Herkunftsangabe", "Speck", ["Südtiroler Speck"]],
    ["Brotknödel mit Speckwürfeln", "Speckknödel", ["Knödel"]], ["Herbstlicher Brauch mit Kastanien und neuem Wein", "Törggelen"],
    ["Geröstete Kastanien im Dialekt", "Keschtn", ["Köschtn", "Kestn", "Kastanien"]],
    ["Früchtebrot zur Weihnachtszeit", "Zelten", ["Früchtezelten"]], ["Spiralförmig frittierter Teig mit Preiselbeeren", "Strauben"],
    ["Frittierte Teigfladen mit Kraut- oder Spinatfüllung", "Tirtlen", ["Türtlen", "Tirtln"]] ] },

  { q: "Was bedeutet das Dialektwort?", type: "choice", items: [
    ["Marende", "Jause", ["Brotzeit", "Zwischenmahlzeit", "Vesper", "Nachmittagsjause", "Imbiss"]],
    ["Gitsch", "Mädchen", ["Mädel", "Madl"]], ["Bua", "Junge", ["Bub", "Knabe", "Bursche"]],
    ["Patschen", "Hausschuhe", ["Pantoffeln", "Hausschuh", "Schlappen"]], ["Tschurtsch", "Tannenzapfen", ["Zapfen", "Fichtenzapfen", "Kiefernzapfen"]],
    ["Pfoat", "Hemd", ["Unterhemd"]], ["lei", "nur", ["bloß", "lediglich"]], ["Knott", "Stein", ["Fels", "Felsen"]],
    ["Gelse", "Mücke", ["Stechmücke", "Schnake", "Moskito"]], ["Fock", "Schwein", ["Sau", "Ferkel"]] ] },

  // ===================== Zahlen =====================
  { q: "Südtirol: Wie viele sind es?", type: "num", items: [
    ["Gemeinden", 116], ["Bezirksgemeinschaften (ohne die Stadt Bozen)", 7], ["Amtssprachen", 3], ["Sitze im Landtag", 35],
    ["Landeshauptleute seit 1948", 5], ["Kehren am Stilfser Joch (Trafoier Seite)", 48], ["Ladinische Täler in Südtirol", 2],
    ["Angrenzende Staaten", 2], ["Angrenzende italienische Provinzen", 3], ["Achttausender, die Reinhold Messner bestiegen hat", 14] ] },

  { q: "Südtirol in Zahlen – schätze!", hint: "Einheit steht dabei", type: "estimate", tol: 0.1, items: [
    ["Einwohner Südtirols", 535000], ["Fläche (km²)", 7400], ["Anteil deutschsprachig (%)", 69],
    ["Anteil italienischsprachig (%)", 26], ["Anteil ladinischsprachig (%)", 4.5, 0.35], ["Ötzis Alter (Jahre)", 5300],
    ["Tätowierungen auf Ötzis Körper", 61, 0.3], ["Höhe der Ötzi-Fundstelle (m)", 3210], ["Länge der Etsch (km)", 410],
    ["Höhe von Bozen über dem Meer (m)", 262] ] },

  { q: "Wie viele Einwohner hat der Ort (ungefähr)?", type: "estimate", tol: 0.15, items: [
    // 3. Feld = eigene Toleranz: bekannte Städte enger, kleine Gemeinden großzügiger
    ["Bozen", 108000, 0.15], ["Meran", 41500, 0.15], ["Brixen", 23000, 0.2], ["Leifers", 18000, 0.3], ["Bruneck", 17000, 0.25],
    ["Eppan", 15000, 0.3], ["Lana", 12800, 0.3], ["Kaltern", 8200, 0.3], ["Sterzing", 7000, 0.3], ["Glurns", 900, 0.4] ] },


  // ===================== Erweiterung =====================
  { q: "Steht die Burg / das Schloss in Südtirol?", type: "tf", items: [
    ["Schloss Tirol", true], ["Schloss Runkelstein", true], ["Churburg", true], ["Burg Taufers", true], ["Trostburg", true],
    ["Schloss Prösels", true], ["Burg Hochosterwitz", false], ["Schloss Neuschwanstein", false], ["Burg Kreuzenstein", false], ["Schloss Ambras", false] ] },

  { q: "In welcher Gemeinde steht die Burg / das Schloss?", type: "choice", items: [
    ["Schloss Tirol", "Dorf Tirol", ["Tirol"]], ["Schloss Runkelstein", "Bozen"], ["Churburg", "Schluderns"],
    ["Burg Taufers", "Sand in Taufers"], ["Trostburg", "Waidbruck"], ["Schloss Juval", "Kastelbell-Tschars", ["Kastelbell", "Tschars"]],
    ["Schloss Trauttmansdorff", "Meran"], ["Schloss Sigmundskron", "Bozen"], ["Fürstenburg", "Mals", ["Burgeis"]], ["Schloss Bruneck", "Bruneck"] ] },

  { q: "Gibt es das Skigebiet in Südtirol?", type: "tf", items: [
    ["Kronplatz", true], ["Gröden", true], ["Alta Badia", true], ["Schnalstaler Gletscher", true], ["Speikboden", true],
    ["Ratschings-Jaufen", true], ["Ischgl", false], ["Sölden", false], ["Kitzbühel", false], ["Cortina d'Ampezzo", false] ] },

  { q: "Ist das ein Brauch in Südtirol?", type: "tf", items: [
    ["Törggelen", true], ["Herz-Jesu-Feuer", true], ["Klöckeln im Sarntal", true], ["Krampuslauf", true], ["Almabtrieb", true],
    ["Scheibenschlagen im Vinschgau", true], ["Rosenmontagszug wie in Köln", false], ["Sinterklaas", false], ["Thanksgiving", false], ["Hogmanay", false] ] },

  { q: "Grenzt die Gemeinde an Österreich?", type: "tf", items: [
    ["Brenner", true], ["Graun im Vinschgau", true], ["Prettau", true], ["Innichen", true], ["Moos in Passeier", true],
    ["Schnals", true], ["Bozen", false], ["Meran", false], ["Kaltern", false], ["Klausen", false] ] },

  { q: "Hat der Ort Stadtrecht?", type: "tf", items: [
    ["Klausen", true], ["Glurns", true], ["Sterzing", true], ["Leifers", true], ["Bruneck", true],
    ["Brixen", true], ["Lana", false], ["Eppan", false], ["Kaltern", false], ["Schlanders", false] ] },

  { q: "Ist das ein typischer Südtiroler Wein?", type: "tf", items: [
    ["Lagrein", true], ["Vernatsch", true], ["Gewürztraminer", true], ["St. Magdalener", true], ["Kalterersee", true],
    ["Blauburgunder", true], ["Chianti", false], ["Rioja", false], ["Barolo", false], ["Prosecco", false] ] },

  { q: "Wein, Apfel & Co.: Was ist gemeint?", type: "choice", items: [
    ["Kräftiger Rotwein, typisch für Bozen-Gries", "Lagrein"], ["Weißwein, benannt nach einem Dorf im Unterland", "Gewürztraminer", ["Traminer"]],
    ["Rotwein von den Hügeln östlich von Bozen", "St. Magdalener", ["Sankt Magdalener", "Magdalener"]],
    ["Traditionelle hellrote Rebsorte, ital. „Schiava“", "Vernatsch"], ["Wein vom größten natürlichen See Südtirols", "Kalterersee", ["Kalterer See"]],
    ["Die meistangebaute Apfelsorte Südtirols", "Golden Delicious", ["Golden"]], ["Grüner, saurer Apfel aus Australien", "Granny Smith"],
    ["Rosa Clubsorte aus Australien", "Pink Lady", ["Cripps Pink"]], ["Rot-gelbe Apfelsorte aus Neuseeland", "Gala", ["Royal Gala"]],
    ["Schnaps aus Trester", "Grappa", ["Treber", "Trester", "Tresterbrand"]] ] },

  { q: "Welcher Pass verbindet …?", type: "choice", items: [
    ["Vinschgau – Nauders (Tirol)", "Reschenpass", ["Reschen"]], ["Passeiertal – Ötztal", "Timmelsjoch"], ["Sterzing – Passeiertal", "Jaufenpass", ["Jaufen"]],
    ["Sarntal – Sterzing", "Penser Joch"], ["Gröden – Gadertal", "Grödner Joch"], ["Gröden – Fassatal", "Sellajoch"],
    ["Antholzer Tal – Defereggental", "Staller Sattel"], ["Vinschgau – Bormio", "Stilfser Joch"], ["Wipptal – Innsbruck", "Brenner", ["Brennerpass"]],
    ["Gadertal – Arabba", "Campolongo", ["Campolongopass", "Passo Campolongo"]] ] },

  { q: "Ordne die Pässe nach Höhe.", hint: "1 = höchster Pass", type: "rank", items: [
    ["Stilfser Joch", 1], ["Timmelsjoch", 2], ["Sellajoch", 3], ["Penser Joch", 4], ["Grödner Joch", 5],
    ["Jaufenpass", 6], ["Staller Sattel", 7], ["Würzjoch", 8], ["Reschenpass", 9], ["Brennerpass", 10] ] },

  { q: "Wie hoch liegt der Ort / der See?", type: "estimate", tol: 0.15, unit: "m", items: [
    ["Meran", 325], ["Brixen", 560], ["Bruneck", 835], ["Sterzing", 948], ["Toblach", 1256], ["Sulden", 1900],
    ["Kalterer See", 215], ["Reschensee", 1498], ["Pragser Wildsee", 1496], ["Karersee", 1519] ] },

  { q: "Wie lang ist das?", hint: "Südtirol & Umgebung", type: "estimate", tol: 0.15, unit: "km", items: [
    ["Brenner-Basistunnel (Haupttunnel)", 55], ["Eisack", 96], ["Vinschgaubahn Meran–Mals", 60], ["Brennerautobahn A22 bis Modena", 314],
    ["Straße Bozen–Innsbruck", 118], ["Straße Bozen–Verona", 154], ["Straße Bozen–München", 280], ["Pisten der Sellaronda", 26],
    ["Meraner Höhenweg", 100], ["Reschensee (Länge)", 6] ] },

  { q: "Wer ist gemeint?", hint: "berühmte Südtiroler", type: "choice", names: true, items: [
    ["Erfand in Partschins eine Schreibmaschine", "Peter Mitterhofer"], ["Bergfilmer und Schauspieler aus Gröden", "Luis Trenker"],
    ["Gotischer Maler und Schnitzer aus Bruneck", "Michael Pacher"], ["Täufer aus dem Pustertal, Namensgeber einer Glaubensgemeinschaft", "Jakob Hutter"],
    ["Oscar-prämierter Musikproduzent aus St. Ulrich", "Giorgio Moroder"], ["Eiskunstlauf-Weltmeisterin 2012 aus Gröden", "Carolina Kostner"],
    ["Super-G-Weltmeisterin 1996 und 1997 aus Gröden", "Isolde Kostner"], ["Skirennläufer aus Kastelruth, Abfahrts-Weltcupsieger 2016 und 2017", "Peter Fill"],
    ["Kapuzinerpater und Mitstreiter Andreas Hofers", "Joachim Haspinger", ["Pater Haspinger"]],
    ["Minnesänger mit Denkmal am Hauptplatz von Bozen", "Walther von der Vogelweide", ["Walther", "Vogelweide"]] ] },

  { q: "Was heißt das auf Hochdeutsch?", hint: "Tiroler Wörter", type: "choice", items: [
    ["Plent", "Polenta", ["Maisbrei"]], ["Kirchtag", "Kirchweih", ["Kirchweihfest", "Kirmes"]], ["Saltner", "Weinbergwächter", ["Flurwächter", "Weinhüter", "Feldhüter"]],
    ["Schupfe", "Scheune", ["Stadel", "Heustadel", "Schuppen"]], ["Labe", "Hausflur", ["Flur", "Gang", "Hausgang", "Diele"]],
    ["Paradeiser", "Tomaten", ["Tomate"]], ["Ribisel", "Johannisbeeren", ["Johannisbeere"]], ["Topfen", "Quark"],
    ["Waal", "Bewässerungskanal", ["Kanal", "Wassergraben", "Bewässerungsgraben", "Graben"]], ["Fisolen", "grüne Bohnen", ["Bohnen", "Brechbohnen"]] ] },

  { q: "Wie heißt der Ort auf Ladinisch?", type: "choice", items: [
    ["St. Ulrich", "Urtijëi"], ["Wolkenstein", "Sëlva"], ["St. Christina", "S. Crestina", ["Santa Crestina", "Santa Cristina"]],
    ["Abtei", "Badia"], ["Enneberg", "Mareo", ["Marèo"]], ["St. Martin in Thurn", "San Martin de Tor"], ["Wengen", "La Val"],
    ["St. Kassian", "San Ciascian"], ["Stern", "La Ila"], ["Kolfuschg", "Calfosch"] ] },

  { q: "Südtirol: Wie viele sind es?", hint: "Teil 2", type: "num", items: [
    ["Teilgebiete des UNESCO-Welterbes Dolomiten", 9], ["Pässe der Sellaronda", 4], ["Jahre einer Landtags-Legislatur", 5],
    ["Standorte der Freien Universität Bozen", 3], ["Spronser Seen", 10], ["Ladinische Gemeinden in Südtirol", 8],
    ["Naturparks in Südtirol", 7], ["Ladinische Täler insgesamt (in Italien)", 5], ["Provinzen der Region Trentino-Südtirol", 2],
    ["Städte mit Stadtrecht", 8] ] },

  { q: "Südtirol schätzen", hint: "ungefähr – Einheit steht dabei", type: "estimate", tol: 0.2, items: [
    ["Apfelanbaufläche (Hektar)", 18000], ["Anteil an der EU-Apfelernte (%)", 10], ["Rebfläche (Hektar)", 5500],
    ["Gästeübernachtungen pro Jahr (Mio.)", 36], ["Ötzis Körpergröße (cm)", 160], ["Ötzis Gewicht (kg)", 50],
    ["Ötzis Alter beim Tod (Jahre)", 45], ["Fläche der Seiser Alm (km²)", 56], ["Waldanteil an der Landesfläche (%)", 50],
    ["Größte Tiefe des Pragser Wildsees (m)", 36] ] },

  // ===================== Erweiterung 2 =====================
  { q: "Welcher Berg ist gemeint?", type: "choice", items: [
    ["Wahrzeichen über Seis und Kastelruth", "Schlern"], ["Skiberg über Bruneck", "Kronplatz"], ["Hausberg von Brixen", "Plose"],
    ["Aussichtsberg auf dem Ritten", "Rittner Horn"], ["Höchster Gipfel der Geislergruppe", "Sass Rigais"],
    ["Höchster Gipfel der gleichnamigen Gruppe in Gröden", "Langkofel"], ["Berg nahe der Ötzi-Fundstelle", "Similaun"],
    ["Höchster Berg der Zillertaler Alpen", "Hochfeiler"], ["Höchster Berg der Rieserfernergruppe", "Hochgall"],
    ["Berühmte Felstürme in den Sextner Dolomiten", "Drei Zinnen"] ] },

  { q: "Liegt der Ort im Eisacktal?", type: "tf", items: [
    ["Brixen", true], ["Klausen", true], ["Waidbruck", true], ["Villnöß", true], ["Feldthurns", true],
    ["Vahrn", true], ["Meran", false], ["Mals", false], ["Bruneck", false], ["Kaltern", false] ] },

  { q: "Liegt die Gemeinde im Burggrafenamt?", type: "tf", items: [
    ["Meran", true], ["Lana", true], ["Dorf Tirol", true], ["Schenna", true], ["Algund", true],
    ["St. Leonhard in Passeier", true], ["Brixen", false], ["Toblach", false], ["Eppan", false], ["Mals", false] ] },

  { q: "In welchem Jahr war das?", hint: "Südtirol – Teil 2", type: "num", items: [
    ["Schlacht am Bergisel unter Andreas Hofer", 1809], ["Die Mendelbahn nimmt den Betrieb auf", 1903], ["Die Rittner Bahn wird eröffnet", 1907],
    ["Reinhold Messner wird geboren", 1944], ["Gründung der Südtiroler Volkspartei", 1945], ["Erstes Autonomiestatut", 1948],
    ["Das „Paket“ wird angenommen", 1969], ["Messner hat alle 14 Achttausender bestiegen", 1986],
    ["Ötzi zieht ins Archäologiemuseum Bozen", 1998], ["Silvius Magnago stirbt", 2010] ] },

  { q: "Was ist gemeint?", hint: "Südtiroler Leben", type: "choice", items: [
    ["Blaue Schürze der Bauern und Kellner", "Blauer Schurz", ["Schurz", "Schürze", "Fürtig"]], ["Traditionelles Rankgerüst für Weinreben", "Pergel", ["Pergola"]],
    ["Hof, der seit mindestens 200 Jahren derselben Familie gehört", "Erbhof"], ["Traditionsverbände in Tracht, mit Gewehr bei Prozessionen", "Schützen", ["Schützenkompanie", "Schützenkompanien"]],
    ["Marke für Urlaub auf dem Bauernhof", "Roter Hahn"], ["Größte deutschsprachige Tageszeitung Südtirols", "Dolomiten"],
    ["Blasmusikverein, den fast jedes Dorf hat", "Musikkapelle", ["Blaskapelle"]], ["Gemütliches Beisammensein und Plaudern", "Huangart", ["Hoangart", "Hoangascht"]],
    ["Betrieb, in dem Milch zu Käse wird", "Sennerei", ["Käserei"]], ["Gedenkbild am Wegrand", "Marterl", ["Bildstock"]] ] },

  { q: "Ist die Aussage über Ötzi wahr?", type: "tf", items: [
    ["Er wurde 1991 gefunden.", true], ["Er lebte vor rund 5.300 Jahren.", true], ["In seiner Schulter steckte eine Pfeilspitze.", true],
    ["Er trug ein Kupferbeil bei sich.", true], ["Er ist in Bozen ausgestellt.", true], ["Er hatte Tätowierungen.", true],
    ["Gefunden hat ihn ein Bergführer aus Sulden.", false], ["Er war über 70 Jahre alt.", false],
    ["Er starb ganz ohne fremde Gewalt.", false], ["Er lebte rein vegetarisch.", false] ] },

  { q: "Ordne die Gemeinden nach Einwohnern.", hint: "1 = meiste Einwohner", type: "rank", items: [
    ["Bozen", 1], ["Meran", 2], ["Brixen", 3], ["Leifers", 4], ["Bruneck", 5],
    ["Eppan", 6], ["Lana", 7], ["Sterzing", 8], ["Klausen", 9], ["Glurns", 10] ] },

  { q: "Welcher See ist gemeint?", type: "choice", items: [
    ["Smaragdgrüner See unter dem Latemar", "Karersee"], ["Berühmter Bergsee im Pragser Tal", "Pragser Wildsee", ["Pragser See"]],
    ["See am Ende des Antholzer Tals", "Antholzer See"], ["See bei Toblach am Eingang zum Höhlensteintal", "Toblacher See"],
    ["Kleiner See vor dem Monte Cristallo", "Dürrensee"], ["See im Obervinschgau zwischen Reschen und Burgeis", "Haidersee"],
    ["Zwei Badeseen im Wald bei Eppan", "Montiggler Seen", ["Montiggler See"]], ["Badesee bei Brixen", "Vahrner See"],
    ["Gilt als wärmster Badesee der Alpen", "Kalterer See"], ["Seenplatte in der Texelgruppe", "Spronser Seen"] ] },

  { q: "Mündet der Fluss direkt in die Etsch?", type: "tf", items: [
    ["Eisack", true], ["Passer", true], ["Falschauer", true], ["Plima", true], ["Schnalser Bach", true],
    ["Puni", true], ["Talfer", false], ["Rienz", false], ["Ahr", false], ["Drau", false] ] },

  { q: "Welcher Ort ist gemeint?", type: "choice", items: [
    ["Kleinste Stadt Südtirols", "Glurns"], ["Bischofsstadt mit Dom und Hofburg", "Brixen"], ["Kurstadt an der Passer", "Meran"],
    ["Stadt mit dem Zwölferturm", "Sterzing"], ["Künstlerstädtchen unter dem Kloster Säben", "Klausen"],
    ["Weindorf, das einer Rebsorte den Namen gab", "Tramin"], ["Heimatdorf von Jannik Sinner", "Sexten"],
    ["Dorf mit dem Kirchturm im Stausee", "Graun", ["Graun im Vinschgau", "Alt-Graun"]], ["Hauptort des Grödentals", "St. Ulrich", ["Sankt Ulrich", "Ortisei", "Urtijëi"]],
    ["Größte Stadt im Pustertal", "Bruneck"] ] },
].map((c) => ({ ...c, set: "suedtirol" })));
