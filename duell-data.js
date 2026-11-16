// „Listen-Duell“ – Themen mit einer festen Liste von Antworten (meist zehn, manchmal mehr oder weniger).
// Reihenfolge egal, es zählt nur, ob die Antwort dazugehört.
// Jede Antwort: [Name, [andere Schreibweisen …]]. names: true = bei Personen reicht der Nachname.
// Nur möglichst stabile Listen; wo sich etwas ändern kann, steht der Stand dabei.
window.SCHLAU10_DUELL = [
  // ---------- Städte ----------
  { cat: "Städte", q: "Die 10 größten Städte Deutschlands", note: "nach Einwohnern, Stand 2023", items: [
    ["Berlin"], ["Hamburg"], ["München", ["Muenchen", "Munich"]], ["Köln", ["Koeln", "Cologne"]], ["Frankfurt am Main", ["Frankfurt"]],
    ["Düsseldorf", ["Duesseldorf"]], ["Stuttgart"], ["Leipzig"], ["Dortmund"], ["Essen"]] },
  { cat: "Städte", q: "Die 10 größten Städte Österreichs", note: "nach Einwohnern, Stand 2024", items: [
    ["Wien", ["Vienna"]], ["Graz"], ["Linz"], ["Salzburg"], ["Innsbruck"], ["Klagenfurt", ["Klagenfurt am Wörthersee"]],
    ["Villach"], ["Wels"], ["Sankt Pölten", ["St. Pölten", "St Pölten", "St. Poelten"]], ["Dornbirn"]] },
  { cat: "Städte", q: "Die 10 größten Städte der Schweiz", note: "nach Einwohnern, Stand 2023", items: [
    ["Zürich", ["Zuerich", "Zurich"]], ["Genf", ["Genève", "Geneva"]], ["Basel"], ["Lausanne"], ["Bern"], ["Winterthur"],
    ["Luzern", ["Lucerne"]], ["St. Gallen", ["Sankt Gallen", "St Gallen"]], ["Lugano"], ["Biel", ["Biel/Bienne", "Bienne"]]] },
  { cat: "Städte", q: "Die 10 größten Städte Italiens", note: "nach Einwohnern der Gemeinde, Stand 2023", items: [
    ["Rom", ["Roma"]], ["Mailand", ["Milano", "Milan"]], ["Neapel", ["Napoli"]], ["Turin", ["Torino"]], ["Palermo"], ["Genua", ["Genova"]],
    ["Bologna"], ["Florenz", ["Firenze"]], ["Bari"], ["Catania"]] },
  { cat: "Städte", q: "Die 10 größten Städte Frankreichs", note: "nach Einwohnern der Gemeinde, Stand 2021", items: [
    ["Paris"], ["Marseille"], ["Lyon"], ["Toulouse"], ["Nizza", ["Nice"]], ["Nantes"], ["Montpellier"], ["Straßburg", ["Strassburg", "Strasbourg"]],
    ["Bordeaux"], ["Lille"]] },
  { cat: "Städte", q: "Die 10 größten Städte Nordrhein-Westfalens", note: "nach Einwohnern, Stand 2023", items: [
    ["Köln", ["Koeln"]], ["Düsseldorf", ["Duesseldorf"]], ["Dortmund"], ["Essen"], ["Duisburg"], ["Bochum"], ["Wuppertal"], ["Bielefeld"],
    ["Bonn"], ["Münster", ["Muenster"]]] },

  // ---------- Länder ----------
  { cat: "Länder", q: "Die 10 flächengrößten Länder der Welt", items: [
    ["Russland"], ["Kanada"], ["China"], ["USA", ["Vereinigte Staaten", "Amerika"]], ["Brasilien"], ["Australien"], ["Indien"], ["Argentinien"],
    ["Kasachstan"], ["Algerien"]] },
  { cat: "Länder", q: "Die 10 kleinsten Länder der Welt", note: "nach Fläche, nur unabhängige Staaten", items: [
    ["Vatikanstadt", ["Vatikan"]], ["Monaco"], ["Nauru"], ["Tuvalu"], ["San Marino"], ["Liechtenstein"], ["Marshallinseln"],
    ["St. Kitts und Nevis", ["Saint Kitts und Nevis", "St Kitts", "St. Kitts"]], ["Malediven"], ["Malta"]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder Europas", note: "ohne Türkei und Kasachstan", items: [
    ["Russland"], ["Ukraine"], ["Frankreich"], ["Spanien"], ["Schweden"], ["Norwegen"], ["Deutschland"], ["Finnland"], ["Polen"], ["Italien"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten Länder Europas", note: "ohne Türkei, Stand 2024", items: [
    ["Russland"], ["Deutschland"], ["Großbritannien", ["Vereinigtes Königreich", "UK", "England"]], ["Frankreich"], ["Italien"], ["Spanien"],
    ["Polen"], ["Ukraine"], ["Rumänien", ["Rumaenien"]], ["Niederlande", ["Holland"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder der EU", items: [
    ["Frankreich"], ["Spanien"], ["Schweden"], ["Deutschland"], ["Finnland"], ["Polen"], ["Italien"], ["Rumänien", ["Rumaenien"]],
    ["Griechenland"], ["Bulgarien"]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder Afrikas", items: [
    ["Algerien"], ["Demokratische Republik Kongo", ["Kongo", "DR Kongo"]], ["Sudan"], ["Libyen"], ["Tschad"], ["Niger"], ["Angola"], ["Mali"],
    ["Südafrika", ["Suedafrika"]], ["Äthiopien", ["Aethiopien", "Ethiopien"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder Südamerikas", items: [
    ["Brasilien"], ["Argentinien"], ["Peru"], ["Kolumbien"], ["Bolivien"], ["Venezuela"], ["Chile"], ["Paraguay"], ["Ecuador"], ["Guyana"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten Länder Südamerikas", note: "Stand 2024", items: [
    ["Brasilien"], ["Kolumbien"], ["Argentinien"], ["Peru"], ["Venezuela"], ["Chile"], ["Ecuador"], ["Bolivien"], ["Paraguay"], ["Uruguay"]] },
  { cat: "Länder", q: "Die 10 Provinzen Kanadas", items: [
    ["Ontario"], ["Québec", ["Quebec"]], ["British Columbia", ["Britisch-Kolumbien"]], ["Alberta"], ["Manitoba"], ["Saskatchewan"],
    ["Nova Scotia", ["Neuschottland"]], ["New Brunswick", ["Neubraunschweig"]], ["Neufundland und Labrador", ["Neufundland", "Newfoundland"]],
    ["Prince Edward Island", ["Prinz-Edward-Insel"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten US-Bundesstaaten", items: [
    ["Alaska"], ["Texas"], ["Kalifornien", ["California"]], ["Montana"], ["New Mexico", ["Neumexiko"]], ["Arizona"], ["Nevada"], ["Colorado"],
    ["Oregon"], ["Wyoming"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten US-Bundesstaaten", note: "Stand 2024", items: [
    ["Kalifornien", ["California"]], ["Texas"], ["Florida"], ["New York"], ["Pennsylvania", ["Pennsylvanien"]], ["Illinois"], ["Ohio"],
    ["Georgia"], ["North Carolina", ["Nord-Carolina", "Nordcarolina"]], ["Michigan"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten deutschen Bundesländer", note: "Stand 2023", items: [
    ["Nordrhein-Westfalen", ["NRW"]], ["Bayern"], ["Baden-Württemberg", ["BW"]], ["Niedersachsen"], ["Hessen"], ["Sachsen"], ["Rheinland-Pfalz"],
    ["Berlin"], ["Schleswig-Holstein"], ["Brandenburg"]] },
  { cat: "Länder", q: "Die 10 flächengrößten deutschen Bundesländer", items: [
    ["Bayern"], ["Niedersachsen"], ["Baden-Württemberg", ["BW"]], ["Nordrhein-Westfalen", ["NRW"]], ["Brandenburg"],
    ["Mecklenburg-Vorpommern", ["MV", "Meck-Pomm"]], ["Hessen"], ["Sachsen-Anhalt"], ["Rheinland-Pfalz"], ["Sachsen"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten Regionen Italiens", note: "Stand 2024", items: [
    ["Lombardei", ["Lombardia"]], ["Latium", ["Lazio"]], ["Kampanien", ["Campania"]], ["Sizilien", ["Sicilia"]], ["Venetien", ["Veneto"]],
    ["Emilia-Romagna"], ["Piemont", ["Piemonte"]], ["Apulien", ["Puglia"]], ["Toskana", ["Toscana"]], ["Kalabrien", ["Calabria"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten Regionen Italiens", items: [
    ["Sizilien", ["Sicilia"]], ["Piemont", ["Piemonte"]], ["Sardinien", ["Sardegna"]], ["Lombardei", ["Lombardia"]], ["Toskana", ["Toscana"]],
    ["Emilia-Romagna"], ["Apulien", ["Puglia"]], ["Venetien", ["Veneto"]], ["Latium", ["Lazio"]], ["Kalabrien", ["Calabria"]]] },

  // ---------- Natur ----------
  { cat: "Natur", q: "Die 10 höchsten Berge der Welt", items: [
    ["Mount Everest", ["Everest", "Mt. Everest", "Sagarmatha", "Chomolungma"]], ["K2"], ["Kangchendzönga", ["Kangchenjunga", "Kanchenjunga", "Kangchendzoenga"]],
    ["Lhotse"], ["Makalu"], ["Cho Oyu"], ["Dhaulagiri"], ["Manaslu"], ["Nanga Parbat"], ["Annapurna"]] },
  { cat: "Natur", q: "Die 10 längsten Flüsse der Welt", note: "nach gängigen Längenangaben (inkl. Quellflüsse)", items: [
    ["Nil"], ["Amazonas"], ["Jangtsekiang", ["Jangtse", "Yangtze"]], ["Mississippi", ["Mississippi-Missouri", "Missouri"]], ["Jenissei"],
    ["Gelber Fluss", ["Huang He", "Huanghe"]], ["Ob", ["Ob-Irtysch", "Irtysch"]], ["Paraná", ["Parana", "Río de la Plata"]], ["Kongo"], ["Amur"]] },
  { cat: "Natur", q: "Die 10 größten Inseln der Welt", note: "ohne Australien (Kontinent)", items: [
    ["Grönland", ["Groenland"]], ["Neuguinea", ["Papua"]], ["Borneo"], ["Madagaskar"], ["Baffininsel", ["Baffin Island", "Baffin"]], ["Sumatra"],
    ["Honshu", ["Honshū"]], ["Victoria-Insel", ["Victoria Island", "Victoriainsel"]], ["Großbritannien", ["Grossbritannien", "Great Britain"]],
    ["Ellesmere-Insel", ["Ellesmere", "Ellesmere Island"]]] },
  { cat: "Natur", q: "Die 10 größten Seen der Welt", note: "nach Fläche, Kaspisches Meer zählt als See", items: [
    ["Kaspisches Meer"], ["Oberer See", ["Lake Superior"]], ["Victoriasee", ["Viktoriasee"]], ["Huronsee"], ["Michigansee"], ["Tanganjikasee"],
    ["Baikalsee", ["Baikal"]], ["Großer Bärensee", ["Grosser Baerensee"]], ["Malawisee", ["Njassasee"]], ["Großer Sklavensee", ["Grosser Sklavensee"]]] },
  { cat: "Natur", q: "Die 10 längsten Flüsse Deutschlands", note: "Gesamtlänge, auch außerhalb Deutschlands", items: [
    ["Donau"], ["Rhein"], ["Elbe"], ["Oder"], ["Mosel"], ["Main"], ["Inn"], ["Weser"], ["Saale"], ["Spree"]] },
  { cat: "Natur", q: "Die 10 größten Seen Deutschlands", note: "nach Fläche, Bodensee ganz gezählt", items: [
    ["Bodensee"], ["Müritz", ["Mueritz"]], ["Chiemsee"], ["Schweriner See"], ["Starnberger See"], ["Ammersee"], ["Plauer See"],
    ["Kummerower See"], ["Steinhuder Meer"], ["Großer Plöner See", ["Grosser Ploener See", "Plöner See"]]] },

  // ---------- Geschichte & Gesellschaft ----------
  { cat: "Geschichte", q: "Die 10 deutschen Bundeskanzler", note: "bis Friedrich Merz, Stand 2025", names: true, items: [
    ["Konrad Adenauer"], ["Ludwig Erhard"], ["Kurt Georg Kiesinger"], ["Willy Brandt"], ["Helmut Schmidt"], ["Helmut Kohl"],
    ["Gerhard Schröder", ["Schroeder"]], ["Angela Merkel"], ["Olaf Scholz"], ["Friedrich Merz"]] },
  { cat: "Gesellschaft", q: "Die 10 häufigsten Nachnamen in Deutschland", items: [
    ["Müller", ["Mueller"]], ["Schmidt"], ["Schneider"], ["Fischer"], ["Weber"], ["Meyer"], ["Wagner"], ["Becker"], ["Schulz"], ["Hoffmann"]] },

  // ---------- Wissen & Zahlen ----------
  { cat: "Wissen", q: "Die ersten 10 Elemente des Periodensystems", note: "Name oder Symbol", items: [
    ["Wasserstoff", ["H"]], ["Helium", ["He"]], ["Lithium", ["Li"]], ["Beryllium", ["Be"]], ["Bor", ["B"]], ["Kohlenstoff", ["C"]],
    ["Stickstoff", ["N"]], ["Sauerstoff", ["O"]], ["Fluor", ["F"]], ["Neon", ["Ne"]]] },
  { cat: "Wissen", q: "Die ersten 10 Buchstaben des griechischen Alphabets", items: [
    ["Alpha"], ["Beta"], ["Gamma"], ["Delta"], ["Epsilon"], ["Zeta"], ["Eta"], ["Theta"], ["Iota", ["Jota"]], ["Kappa"]] },
  { cat: "Zahlen", q: "Die 10 Primzahlen unter 30", items: [["2"], ["3"], ["5"], ["7"], ["11"], ["13"], ["17"], ["19"], ["23"], ["29"]] },
  { cat: "Zahlen", q: "Die 10 Quadratzahlen von 1 bis 100", items: [["1"], ["4"], ["9"], ["16"], ["25"], ["36"], ["49"], ["64"], ["81"], ["100"]] },
  // ---------- längere (und kürzere) Listen ----------
  { cat: "Länder", q: "Die 27 Länder der EU", note: "Stand 2026", items: [
    ["Belgien"], ["Bulgarien"], ["Dänemark", ["Daenemark"]], ["Deutschland"], ["Estland"], ["Finnland"], ["Frankreich"], ["Griechenland"],
    ["Irland"], ["Italien"], ["Kroatien"], ["Lettland"], ["Litauen"], ["Luxemburg"], ["Malta"], ["Niederlande", ["Holland"]],
    ["Österreich", ["Oesterreich"]], ["Polen"], ["Portugal"], ["Rumänien", ["Rumaenien"]], ["Schweden"], ["Slowakei"], ["Slowenien"],
    ["Spanien"], ["Tschechien"], ["Ungarn"], ["Zypern"]] },
  { cat: "Länder", q: "Die 21 Länder mit dem Euro", note: "EU-Länder mit Euro als Währung, Stand 2026 (Bulgarien seit 1.1.2026)", items: [
    ["Belgien"], ["Bulgarien"], ["Deutschland"], ["Estland"], ["Finnland"], ["Frankreich"], ["Griechenland"], ["Irland"], ["Italien"],
    ["Kroatien"], ["Lettland"], ["Litauen"], ["Luxemburg"], ["Malta"], ["Niederlande", ["Holland"]], ["Österreich", ["Oesterreich"]],
    ["Portugal"], ["Slowakei"], ["Slowenien"], ["Spanien"], ["Zypern"]] },
  { cat: "Städte", q: "Die 27 Hauptstädte der EU-Länder", note: "Stand 2026", items: [
    ["Brüssel", ["Bruessel", "Bruxelles"]], ["Sofia"], ["Kopenhagen"], ["Berlin"], ["Tallinn"], ["Helsinki"], ["Paris"], ["Athen"], ["Dublin"],
    ["Rom", ["Roma"]], ["Zagreb"], ["Riga"], ["Vilnius", ["Wilna"]], ["Luxemburg"], ["Valletta"], ["Amsterdam"], ["Wien"], ["Warschau"],
    ["Lissabon"], ["Bukarest"], ["Stockholm"], ["Bratislava", ["Pressburg"]], ["Ljubljana", ["Laibach"]], ["Madrid"], ["Prag"],
    ["Budapest"], ["Nikosia"]] },
  { cat: "Länder", q: "Die 16 deutschen Bundesländer", items: [
    ["Baden-Württemberg", ["BW"]], ["Bayern"], ["Berlin"], ["Brandenburg"], ["Bremen"], ["Hamburg"], ["Hessen"],
    ["Mecklenburg-Vorpommern", ["MV", "Meck-Pomm"]], ["Niedersachsen"], ["Nordrhein-Westfalen", ["NRW"]], ["Rheinland-Pfalz"], ["Saarland"],
    ["Sachsen"], ["Sachsen-Anhalt"], ["Schleswig-Holstein"], ["Thüringen", ["Thueringen"]]] },
  { cat: "Städte", q: "Die 16 Landeshauptstädte Deutschlands", note: "Stadtstaaten zählen mit", items: [
    ["Stuttgart"], ["München", ["Muenchen"]], ["Berlin"], ["Potsdam"], ["Bremen"], ["Hamburg"], ["Wiesbaden"], ["Schwerin"],
    ["Hannover"], ["Düsseldorf", ["Duesseldorf"]], ["Mainz"], ["Saarbrücken", ["Saarbruecken"]], ["Dresden"], ["Magdeburg"], ["Kiel"], ["Erfurt"]] },
  { cat: "Länder", q: "Die 9 Bundesländer Österreichs", items: [
    ["Wien"], ["Niederösterreich", ["Niederoesterreich"]], ["Oberösterreich", ["Oberoesterreich"]], ["Steiermark"], ["Tirol"], ["Kärnten", ["Kaernten"]],
    ["Salzburg"], ["Vorarlberg"], ["Burgenland"]] },
  { cat: "Länder", q: "Die 26 Kantone der Schweiz", items: [
    ["Aargau"], ["Appenzell Ausserrhoden", ["Appenzell Außerrhoden"]], ["Appenzell Innerrhoden"], ["Basel-Landschaft", ["Baselland"]], ["Basel-Stadt"],
    ["Bern"], ["Freiburg", ["Fribourg"]], ["Genf", ["Genève"]], ["Glarus"], ["Graubünden", ["Graubuenden"]], ["Jura"], ["Luzern"],
    ["Neuenburg", ["Neuchâtel"]], ["Nidwalden"], ["Obwalden"], ["St. Gallen", ["Sankt Gallen", "St Gallen"]], ["Schaffhausen"], ["Schwyz"],
    ["Solothurn"], ["Thurgau"], ["Tessin", ["Ticino"]], ["Uri"], ["Waadt", ["Vaud"]], ["Wallis", ["Valais"]], ["Zug"], ["Zürich", ["Zuerich"]]] },
  { cat: "Länder", q: "Die 20 Regionen Italiens", items: [
    ["Abruzzen", ["Abruzzo"]], ["Aostatal", ["Valle d'Aosta"]], ["Apulien", ["Puglia"]], ["Basilikata", ["Basilicata"]], ["Emilia-Romagna"],
    ["Friaul-Julisch Venetien", ["Friaul", "Friuli"]], ["Kalabrien", ["Calabria"]], ["Kampanien", ["Campania"]], ["Latium", ["Lazio"]],
    ["Ligurien", ["Liguria"]], ["Lombardei", ["Lombardia"]], ["Marken", ["Marche"]], ["Molise"], ["Piemont", ["Piemonte"]],
    ["Sardinien", ["Sardegna"]], ["Sizilien", ["Sicilia"]], ["Toskana", ["Toscana"]], ["Trentino-Südtirol", ["Trentino-Alto Adige", "Trentino"]],
    ["Umbrien", ["Umbria"]], ["Venetien", ["Veneto"]]] },
  { cat: "Südtirol", q: "Die 8 Bezirke Südtirols", note: "die 7 Bezirksgemeinschaften und die Stadt Bozen", items: [
    ["Vinschgau"], ["Burggrafenamt"], ["Überetsch-Unterland", ["Ueberetsch-Unterland", "Überetsch", "Unterland"]], ["Salten-Schlern", ["Salten", "Schlern"]],
    ["Eisacktal"], ["Wipptal"], ["Pustertal"], ["Bozen"]] },
  { cat: "Länder", q: "Die 9 Nachbarländer Deutschlands", items: [
    ["Dänemark", ["Daenemark"]], ["Polen"], ["Tschechien"], ["Österreich", ["Oesterreich"]], ["Schweiz"], ["Frankreich"], ["Luxemburg"],
    ["Belgien"], ["Niederlande", ["Holland"]]] },
  { cat: "Länder", q: "Die 8 Nachbarländer Österreichs", items: [
    ["Deutschland"], ["Tschechien"], ["Slowakei"], ["Ungarn"], ["Slowenien"], ["Italien"], ["Schweiz"], ["Liechtenstein"]] },
  { cat: "Länder", q: "Die 7 Länder der G7", items: [
    ["USA", ["Vereinigte Staaten", "Amerika"]], ["Kanada"], ["Japan"], ["Deutschland"], ["Frankreich"], ["Italien"],
    ["Großbritannien", ["Grossbritannien", "Vereinigtes Königreich", "UK", "England"]]] },
  { cat: "Sport", q: "Die 8 Fußball-Weltmeister (Länder)", note: "Männer, Stand 2026", items: [
    ["Brasilien"], ["Deutschland"], ["Italien"], ["Argentinien"], ["Frankreich"], ["Uruguay"], ["England"], ["Spanien"]] },
  { cat: "Wissen", q: "Die 8 Planeten unseres Sonnensystems", items: [
    ["Merkur"], ["Venus"], ["Erde"], ["Mars"], ["Jupiter"], ["Saturn"], ["Uranus"], ["Neptun"]] },
  { cat: "Wissen", q: "Die 7 Kontinente", items: [
    ["Afrika"], ["Antarktika", ["Antarktis"]], ["Asien"], ["Australien", ["Ozeanien", "Australien und Ozeanien"]], ["Europa"],
    ["Nordamerika"], ["Südamerika", ["Suedamerika"]]] },
  { cat: "Wissen", q: "Die 7 Edelgase", items: [
    ["Helium"], ["Neon"], ["Argon"], ["Krypton"], ["Xenon"], ["Radon"], ["Oganesson"]] },
  { cat: "Wissen", q: "Die 12 Sternzeichen", items: [
    ["Widder"], ["Stier"], ["Zwillinge"], ["Krebs"], ["Löwe", ["Loewe"]], ["Jungfrau"], ["Waage"], ["Skorpion"], ["Schütze", ["Schuetze"]],
    ["Steinbock"], ["Wassermann"], ["Fische"]] },
  { cat: "Wissen", q: "Die 12 Tiere des chinesischen Tierkreises", items: [
    ["Ratte", ["Maus"]], ["Büffel", ["Bueffel", "Ochse", "Rind"]], ["Tiger"], ["Hase", ["Kaninchen"]], ["Drache"], ["Schlange"], ["Pferd"],
    ["Ziege", ["Schaf"]], ["Affe"], ["Hahn"], ["Hund"], ["Schwein"]] },
  { cat: "Wissen", q: "Die 5 Farben der Olympischen Ringe", items: [["Blau"], ["Gelb"], ["Schwarz"], ["Grün", ["Gruen"]], ["Rot"]] },
  { cat: "Sprache", q: "Die 12 Monate auf Italienisch", items: [
    ["gennaio"], ["febbraio"], ["marzo"], ["aprile"], ["maggio"], ["giugno"], ["luglio"], ["agosto"], ["settembre"], ["ottobre"], ["novembre"], ["dicembre"]] },
  { cat: "Sprache", q: "Die 7 Wochentage auf Italienisch", items: [
    ["lunedì", ["lunedi"]], ["martedì", ["martedi"]], ["mercoledì", ["mercoledi"]], ["giovedì", ["giovedi"]], ["venerdì", ["venerdi"]], ["sabato"], ["domenica"]] },
  { cat: "Sprache", q: "Die Zahlen von 1 bis 10 auf Italienisch", items: [
    ["uno"], ["due"], ["tre"], ["quattro"], ["cinque"], ["sei"], ["sette"], ["otto"], ["nove"], ["dieci"]] },
];
