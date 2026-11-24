// „Listen-Duell“ – Themen mit einer festen Liste von Antworten (meist zehn, manchmal mehr oder weniger).
// Reihenfolge beim Nennen egal, es zählt nur, ob die Antwort dazugehört. ranked: true = die Liste steht in fester Reihenfolge
// (Rangfolge, Zeitfolge, Nummer) – gefundene Antworten erscheinen dann auf ihrem Platz. Nur setzen, wenn die Reihenfolge gesichert ist.
// Jede Antwort: [Name, [andere Schreibweisen …]]. names: true = bei Personen reicht der Nachname.
// Nur möglichst stabile Listen; wo sich etwas ändern kann, steht der Stand dabei.
window.SCHLAU10_DUELL = [
  // ---------- Städte ----------
  { cat: "Städte", q: "Die 10 größten Städte Deutschlands", ranked: true, note: "nach Einwohnern, Stand 2023", items: [
    ["Berlin"], ["Hamburg"], ["München", ["Muenchen", "Munich"]], ["Köln", ["Koeln", "Cologne"]], ["Frankfurt am Main", ["Frankfurt"]],
    ["Düsseldorf", ["Duesseldorf"]], ["Stuttgart"], ["Leipzig"], ["Dortmund"], ["Essen"]] },
  { cat: "Städte", q: "Die 10 größten Städte Österreichs", ranked: true, note: "nach Einwohnern, Stand 2024", items: [
    ["Wien", ["Vienna"]], ["Graz"], ["Linz"], ["Salzburg"], ["Innsbruck"], ["Klagenfurt", ["Klagenfurt am Wörthersee"]],
    ["Villach"], ["Wels"], ["Sankt Pölten", ["St. Pölten", "St Pölten", "St. Poelten"]], ["Dornbirn"]] },
  { cat: "Städte", q: "Die 10 größten Städte der Schweiz", ranked: true, note: "nach Einwohnern, Stand 2023", items: [
    ["Zürich", ["Zuerich", "Zurich"]], ["Genf", ["Genève", "Geneva"]], ["Basel"], ["Lausanne"], ["Bern"], ["Winterthur"],
    ["Luzern", ["Lucerne"]], ["St. Gallen", ["Sankt Gallen", "St Gallen"]], ["Lugano"], ["Biel", ["Biel/Bienne", "Bienne"]]] },
  { cat: "Städte", q: "Die 10 größten Städte Italiens", ranked: true, note: "nach Einwohnern der Gemeinde, Stand 2023", items: [
    ["Rom", ["Roma"]], ["Mailand", ["Milano", "Milan"]], ["Neapel", ["Napoli"]], ["Turin", ["Torino"]], ["Palermo"], ["Genua", ["Genova"]],
    ["Bologna"], ["Florenz", ["Firenze"]], ["Bari"], ["Catania"]] },
  { cat: "Städte", q: "Die 10 größten Städte Frankreichs", ranked: true, note: "nach Einwohnern der Gemeinde, Stand 2021", items: [
    ["Paris"], ["Marseille"], ["Lyon"], ["Toulouse"], ["Nizza", ["Nice"]], ["Nantes"], ["Montpellier"], ["Straßburg", ["Strassburg", "Strasbourg"]],
    ["Bordeaux"], ["Lille"]] },

  // ---------- Länder ----------
  { cat: "Länder", q: "Die 10 flächengrößten Länder der Welt", ranked: true, items: [
    ["Russland"], ["Kanada"], ["USA", ["Vereinigte Staaten", "Amerika"]], ["China"], ["Brasilien"], ["Australien"], ["Indien"], ["Argentinien"],
    ["Kasachstan"], ["Algerien"]] },
  { cat: "Länder", q: "Die 10 kleinsten Länder der Welt", ranked: true, note: "nach Fläche, nur unabhängige Staaten", items: [
    ["Vatikanstadt", ["Vatikan"]], ["Monaco"], ["Nauru"], ["Tuvalu"], ["San Marino"], ["Liechtenstein"], ["Marshallinseln"],
    ["St. Kitts und Nevis", ["Saint Kitts und Nevis", "St Kitts", "St. Kitts"]], ["Malediven"], ["Malta"]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder Europas", ranked: true, note: "ohne Türkei und Kasachstan", items: [
    ["Russland"], ["Ukraine"], ["Frankreich"], ["Spanien"], ["Schweden"], ["Norwegen"], ["Deutschland"], ["Finnland"], ["Polen"], ["Italien"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten Länder Europas", ranked: true, note: "ohne Türkei, Stand 2024", items: [
    ["Russland"], ["Deutschland"], ["Großbritannien", ["Vereinigtes Königreich", "UK", "England"]], ["Frankreich"], ["Italien"], ["Spanien"],
    ["Polen"], ["Ukraine"], ["Rumänien", ["Rumaenien"]], ["Niederlande", ["Holland"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder der EU", ranked: true, items: [
    ["Frankreich"], ["Spanien"], ["Schweden"], ["Deutschland"], ["Finnland"], ["Polen"], ["Italien"], ["Rumänien", ["Rumaenien"]],
    ["Griechenland"], ["Bulgarien"]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder Afrikas", ranked: true, items: [
    ["Algerien"], ["Demokratische Republik Kongo", ["Kongo", "DR Kongo"]], ["Sudan"], ["Libyen"], ["Tschad"], ["Niger"], ["Angola"], ["Mali"],
    ["Südafrika", ["Suedafrika"]], ["Äthiopien", ["Aethiopien", "Ethiopien"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten Länder Südamerikas", ranked: true, items: [
    ["Brasilien"], ["Argentinien"], ["Peru"], ["Kolumbien"], ["Bolivien"], ["Venezuela"], ["Chile"], ["Paraguay"], ["Ecuador"], ["Guyana"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten Länder Südamerikas", ranked: true, note: "Stand 2024", items: [
    ["Brasilien"], ["Kolumbien"], ["Argentinien"], ["Peru"], ["Venezuela"], ["Chile"], ["Ecuador"], ["Bolivien"], ["Paraguay"], ["Uruguay"]] },
  { cat: "Länder", q: "Die 10 Provinzen Kanadas", items: [
    ["Ontario"], ["Québec", ["Quebec"]], ["British Columbia", ["Britisch-Kolumbien"]], ["Alberta"], ["Manitoba"], ["Saskatchewan"],
    ["Nova Scotia", ["Neuschottland"]], ["New Brunswick", ["Neubraunschweig"]], ["Neufundland und Labrador", ["Neufundland", "Newfoundland"]],
    ["Prince Edward Island", ["Prinz-Edward-Insel"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten US-Bundesstaaten", ranked: true, items: [
    ["Alaska"], ["Texas"], ["Kalifornien", ["California"]], ["Montana"], ["New Mexico", ["Neumexiko"]], ["Arizona"], ["Nevada"], ["Colorado"],
    ["Oregon"], ["Wyoming"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten US-Bundesstaaten", ranked: true, note: "Stand 2024", items: [
    ["Kalifornien", ["California"]], ["Texas"], ["Florida"], ["New York"], ["Pennsylvania", ["Pennsylvanien"]], ["Illinois"], ["Ohio"],
    ["Georgia"], ["North Carolina", ["Nord-Carolina", "Nordcarolina"]], ["Michigan"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten deutschen Bundesländer", ranked: true, note: "Stand 2023", items: [
    ["Nordrhein-Westfalen", ["NRW"]], ["Bayern"], ["Baden-Württemberg", ["BW"]], ["Niedersachsen"], ["Hessen"], ["Rheinland-Pfalz"], ["Sachsen"],
    ["Berlin"], ["Schleswig-Holstein"], ["Brandenburg"]] },
  { cat: "Länder", q: "Die 10 flächengrößten deutschen Bundesländer", ranked: true, items: [
    ["Bayern"], ["Niedersachsen"], ["Baden-Württemberg", ["BW"]], ["Nordrhein-Westfalen", ["NRW"]], ["Brandenburg"],
    ["Mecklenburg-Vorpommern", ["MV", "Meck-Pomm"]], ["Hessen"], ["Sachsen-Anhalt"], ["Rheinland-Pfalz"], ["Sachsen"]] },
  { cat: "Länder", q: "Die 10 bevölkerungsreichsten Regionen Italiens", ranked: true, note: "Stand 2024", items: [
    ["Lombardei", ["Lombardia"]], ["Latium", ["Lazio"]], ["Kampanien", ["Campania"]], ["Venetien", ["Veneto"]], ["Sizilien", ["Sicilia"]],
    ["Emilia-Romagna"], ["Piemont", ["Piemonte"]], ["Apulien", ["Puglia"]], ["Toskana", ["Toscana"]], ["Kalabrien", ["Calabria"]]] },
  { cat: "Länder", q: "Die 10 flächengrößten Regionen Italiens", ranked: true, items: [
    ["Sizilien", ["Sicilia"]], ["Piemont", ["Piemonte"]], ["Sardinien", ["Sardegna"]], ["Lombardei", ["Lombardia"]], ["Toskana", ["Toscana"]],
    ["Emilia-Romagna"], ["Apulien", ["Puglia"]], ["Venetien", ["Veneto"]], ["Latium", ["Lazio"]], ["Kalabrien", ["Calabria"]]] },

  // ---------- Natur ----------
  { cat: "Natur", q: "Die 10 höchsten Berge der Welt", ranked: true, items: [
    ["Mount Everest", ["Everest", "Mt. Everest", "Sagarmatha", "Chomolungma"]], ["K2"], ["Kangchendzönga", ["Kangchenjunga", "Kanchenjunga", "Kangchendzoenga"]],
    ["Lhotse"], ["Makalu"], ["Cho Oyu"], ["Dhaulagiri"], ["Manaslu"], ["Nanga Parbat"], ["Annapurna"]] },
  { cat: "Natur", q: "Die 10 längsten Flüsse der Welt", ranked: true, note: "nach gängigen Längenangaben (inkl. Quellflüsse)", items: [
    ["Nil"], ["Amazonas"], ["Jangtsekiang", ["Jangtse", "Yangtze"]], ["Mississippi", ["Mississippi-Missouri", "Missouri"]], ["Jenissei"],
    ["Gelber Fluss", ["Huang He", "Huanghe"]], ["Ob", ["Ob-Irtysch", "Irtysch"]], ["Paraná", ["Parana", "Río de la Plata"]], ["Kongo"], ["Amur"]] },
  { cat: "Natur", q: "Die 10 größten Inseln der Welt", ranked: true, note: "ohne Australien (Kontinent)", items: [
    ["Grönland", ["Groenland"]], ["Neuguinea", ["Papua"]], ["Borneo"], ["Madagaskar"], ["Baffininsel", ["Baffin Island", "Baffin"]], ["Sumatra"],
    ["Honshu", ["Honshū"]], ["Victoria-Insel", ["Victoria Island", "Victoriainsel"]], ["Großbritannien", ["Grossbritannien", "Great Britain"]],
    ["Ellesmere-Insel", ["Ellesmere", "Ellesmere Island"]]] },
  { cat: "Natur", q: "Die 10 größten Seen der Welt", ranked: true, note: "nach Fläche, Kaspisches Meer zählt als See", items: [
    ["Kaspisches Meer"], ["Oberer See", ["Lake Superior"]], ["Victoriasee", ["Viktoriasee"]], ["Huronsee"], ["Michigansee"], ["Tanganjikasee"],
    ["Baikalsee", ["Baikal"]], ["Großer Bärensee", ["Grosser Baerensee"]], ["Malawisee", ["Njassasee"]], ["Großer Sklavensee", ["Grosser Sklavensee"]]] },

  // ---------- Geschichte & Gesellschaft ----------
  { cat: "Geschichte", q: "Die 10 deutschen Bundeskanzler", ranked: true, note: "bis Friedrich Merz, Stand 2025", names: true, items: [
    ["Konrad Adenauer"], ["Ludwig Erhard"], ["Kurt Georg Kiesinger"], ["Willy Brandt"], ["Helmut Schmidt"], ["Helmut Kohl"],
    ["Gerhard Schröder", ["Schroeder"]], ["Angela Merkel"], ["Olaf Scholz"], ["Friedrich Merz"]] },

  // ---------- Wissen & Zahlen ----------
  { cat: "Wissen", q: "Die ersten 10 Elemente des Periodensystems", ranked: true, note: "Name oder Symbol", items: [
    ["Wasserstoff", ["H"]], ["Helium", ["He"]], ["Lithium", ["Li"]], ["Beryllium", ["Be"]], ["Bor", ["B"]], ["Kohlenstoff", ["C"]],
    ["Stickstoff", ["N"]], ["Sauerstoff", ["O"]], ["Fluor", ["F"]], ["Neon", ["Ne"]]] },
  { cat: "Wissen", q: "Die ersten 10 Buchstaben des griechischen Alphabets", ranked: true, items: [
    ["Alpha"], ["Beta"], ["Gamma"], ["Delta"], ["Epsilon"], ["Zeta"], ["Eta"], ["Theta"], ["Iota", ["Jota"]], ["Kappa"]] },
  { cat: "Zahlen", q: "Die 10 Primzahlen unter 30", ranked: true, items: [["2"], ["3"], ["5"], ["7"], ["11"], ["13"], ["17"], ["19"], ["23"], ["29"]] },
  { cat: "Zahlen", q: "Die 10 Quadratzahlen von 1 bis 100", ranked: true, items: [["1"], ["4"], ["9"], ["16"], ["25"], ["36"], ["49"], ["64"], ["81"], ["100"]] },
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
  { cat: "Sport", q: "Die 8 Fußball-Weltmeister (Länder)", ranked: true, note: "Männer, Stand 2026", items: [
    ["Brasilien"], ["Deutschland"], ["Italien"], ["Argentinien"], ["Frankreich"], ["Uruguay"], ["England"], ["Spanien"]] },
  { cat: "Wissen", q: "Die 7 Edelgase", items: [
    ["Helium"], ["Neon"], ["Argon"], ["Krypton"], ["Xenon"], ["Radon"], ["Oganesson"]] },
  { cat: "Wissen", q: "Die 12 Tiere des chinesischen Tierkreises", ranked: true, items: [
    ["Ratte", ["Maus"]], ["Büffel", ["Bueffel", "Ochse", "Rind"]], ["Tiger"], ["Hase", ["Kaninchen"]], ["Drache"], ["Schlange"], ["Pferd"],
    ["Ziege", ["Schaf"]], ["Affe"], ["Hahn"], ["Hund"], ["Schwein"]] },

  // ---------- Erweiterung: feste Mengen ----------
  { cat: "Sprache", q: "Die 26 Wörter des NATO-Buchstabieralphabets", ranked: true, items: [
    ["Alfa", ["Alpha"]], ["Bravo"], ["Charlie"], ["Delta"], ["Echo"], ["Foxtrot"], ["Golf"], ["Hotel"], ["India"], ["Juliett", ["Juliet"]],
    ["Kilo"], ["Lima"], ["Mike"], ["November"], ["Oscar"], ["Papa"], ["Quebec"], ["Romeo"], ["Sierra"], ["Tango"], ["Uniform"], ["Victor"],
    ["Whiskey", ["Whisky"]], ["X-Ray", ["Xray"]], ["Yankee"], ["Zulu"]] },
  { cat: "Wissen", q: "Die 6 Halogene", items: [
    ["Fluor"], ["Chlor"], ["Brom"], ["Iod", ["Jod"]], ["Astat"], ["Tenness"]] },
  { cat: "Geschichte", q: "Die 7 Weltwunder der Antike", items: [
    ["Pyramiden von Gizeh", ["Pyramiden", "Cheops-Pyramide", "Cheopspyramide"]], ["Hängende Gärten der Semiramis", ["Hängende Gärten", "Hängende Gärten von Babylon"]],
    ["Tempel der Artemis in Ephesos", ["Artemistempel", "Tempel der Artemis", "Artemis-Tempel"]], ["Zeusstatue des Phidias", ["Zeusstatue", "Statue des Zeus"]],
    ["Mausoleum von Halikarnassos", ["Mausoleum"]], ["Koloss von Rhodos", ["Koloss"]], ["Leuchtturm von Pharos", ["Leuchtturm von Alexandria", "Pharos"]]] },
  { cat: "Geschichte", q: "Die 9 Musen der griechischen Sage", items: [
    ["Kalliope"], ["Klio"], ["Erato"], ["Euterpe"], ["Melpomene"], ["Polyhymnia"], ["Terpsichore"], ["Thalia"], ["Urania"]] },
  { cat: "Geschichte", q: "Die 7 Todsünden", items: [
    ["Hochmut", ["Stolz", "Übermut"]], ["Geiz", ["Habgier", "Gier"]], ["Wollust", ["Lust"]], ["Zorn", ["Wut"]], ["Völlerei", ["Voellerei", "Maßlosigkeit"]],
    ["Neid", ["Eifersucht"]], ["Trägheit", ["Faulheit"]]] },

  { cat: "Länder", q: "Die 6 Nachbarländer Italiens", items: [
    ["Frankreich"], ["Schweiz"], ["Österreich", ["Oesterreich"]], ["Slowenien"], ["San Marino"], ["Vatikanstadt", ["Vatikan"]]] },
  { cat: "Länder", q: "Die 5 Nachbarländer der Schweiz", items: [
    ["Deutschland"], ["Österreich", ["Oesterreich"]], ["Liechtenstein"], ["Italien"], ["Frankreich"]] },
  { cat: "Länder", q: "Die 8 Nachbarländer Frankreichs in Europa", items: [
    ["Belgien"], ["Luxemburg"], ["Deutschland"], ["Schweiz"], ["Italien"], ["Monaco"], ["Spanien"], ["Andorra"]] },
  { cat: "Länder", q: "Die 7 Nachbarländer Polens", items: [
    ["Deutschland"], ["Tschechien"], ["Slowakei"], ["Ukraine"], ["Belarus", ["Weißrussland", "Weissrussland"]], ["Litauen"], ["Russland"]] },
  { cat: "Länder", q: "Die 5 nordischen Länder", items: [["Dänemark", ["Daenemark"]], ["Finnland"], ["Island"], ["Norwegen"], ["Schweden"]] },
  { cat: "Städte", q: "Die 5 Hauptstädte der nordischen Länder", items: [
    ["Kopenhagen"], ["Helsinki"], ["Reykjavík", ["Reykjavik"]], ["Oslo"], ["Stockholm"]] },
  { cat: "Länder", q: "Die 7 Länder Mittelamerikas", note: "zwischen Mexiko und Kolumbien", items: [
    ["Belize"], ["Guatemala"], ["Honduras"], ["El Salvador"], ["Nicaragua"], ["Costa Rica"], ["Panama"]] },
  { cat: "Länder", q: "Die 7 Länder, deren Name auf „-stan“ endet", items: [
    ["Afghanistan"], ["Kasachstan"], ["Kirgisistan", ["Kirgistan"]], ["Pakistan"], ["Tadschikistan"], ["Turkmenistan"], ["Usbekistan"]] },
  { cat: "Länder", q: "Die 6 Länder mit Deutsch als landesweiter Amtssprache", items: [
    ["Deutschland"], ["Österreich", ["Oesterreich"]], ["Schweiz"], ["Liechtenstein"], ["Luxemburg"], ["Belgien"]] },
  { cat: "Länder", q: "Die 7 Emirate der Vereinigten Arabischen Emirate", items: [
    ["Abu Dhabi", ["Abu Dabi"]], ["Dubai"], ["Schardscha", ["Sharjah"]], ["Adschman", ["Ajman"]], ["Umm al-Qaiwain", ["Umm al Quwain"]],
    ["Ras al-Chaima", ["Ras al-Khaimah", "Ras al Khaimah"]], ["Fudschaira", ["Fujairah"]]] },
  { cat: "Länder", q: "Die 10 Länder an der Donau", items: [
    ["Deutschland"], ["Österreich", ["Oesterreich"]], ["Slowakei"], ["Ungarn"], ["Kroatien"], ["Serbien"], ["Rumänien", ["Rumaenien"]],
    ["Bulgarien"], ["Moldau", ["Moldawien", "Republik Moldau"]], ["Ukraine"]] },
  { cat: "Länder", q: "Die 6 Länder am Rhein", items: [
    ["Schweiz"], ["Liechtenstein"], ["Österreich", ["Oesterreich"]], ["Deutschland"], ["Frankreich"], ["Niederlande", ["Holland"]]] },
  { cat: "Länder", q: "Die 8 Alpenländer", note: "laut Alpenkonvention", items: [
    ["Frankreich"], ["Monaco"], ["Italien"], ["Schweiz"], ["Liechtenstein"], ["Deutschland"], ["Österreich", ["Oesterreich"]], ["Slowenien"]] },
  { cat: "Städte", q: "Die 9 Hauptstädte der Nachbarländer Deutschlands", items: [
    ["Kopenhagen"], ["Warschau"], ["Prag"], ["Wien"], ["Bern"], ["Paris"], ["Luxemburg"], ["Brüssel", ["Bruessel"]], ["Amsterdam"]] },
  { cat: "Städte", q: "Die 9 Landeshauptstädte Österreichs", items: [
    ["Wien"], ["Sankt Pölten", ["St. Pölten", "St Pölten", "St. Poelten"]], ["Linz"], ["Graz"], ["Klagenfurt"], ["Salzburg"], ["Innsbruck"],
    ["Bregenz"], ["Eisenstadt"]] },
  { cat: "Tirol", q: "Die 9 Bezirke Tirols", note: "Bundesland Tirol, Innsbruck-Stadt zählt mit", items: [
    ["Innsbruck", ["Innsbruck-Stadt"]], ["Innsbruck-Land"], ["Imst"], ["Kitzbühel", ["Kitzbuehel"]], ["Kufstein"], ["Landeck"], ["Lienz"], ["Reutte"], ["Schwaz"]] },
  { cat: "Südtirol", q: "Die 6 Nachbarn Südtirols", note: "Bundesländer, Kanton und Provinzen, an die Südtirol grenzt", items: [
    ["Tirol", ["Nordtirol", "Osttirol"]], ["Salzburg"], ["Graubünden", ["Graubuenden"]], ["Sondrio", ["Provinz Sondrio"]], ["Trentino", ["Trient", "Provinz Trient"]],
    ["Belluno", ["Provinz Belluno"]]] },

  { cat: "Sport", q: "Die 9 Olympia-Winterorte in den Alpenländern", note: "Gastgeber in Frankreich, Schweiz, Deutschland, Österreich und Italien, bis 2026", items: [
    ["Chamonix"], ["St. Moritz", ["Sankt Moritz", "St Moritz"]], ["Garmisch-Partenkirchen", ["Garmisch"]], ["Cortina d'Ampezzo", ["Cortina"]], ["Innsbruck"],
    ["Grenoble"], ["Albertville"], ["Turin", ["Torino"]], ["Mailand", ["Milano"]]] },
  { cat: "Sport", q: "Die 18 Vereine der Fußball-Bundesliga", note: "Saison 2026/27", items: [
    ["FC Bayern München", ["Bayern", "Bayern München"]], ["Bayer 04 Leverkusen", ["Leverkusen", "Bayer Leverkusen", "Bayer"]], ["Eintracht Frankfurt", ["Frankfurt", "Eintracht"]],
    ["Borussia Dortmund", ["Dortmund", "BVB"]], ["SC Freiburg", ["Freiburg"]], ["1. FSV Mainz 05", ["Mainz", "Mainz 05"]], ["RB Leipzig", ["Leipzig"]],
    ["Werder Bremen", ["Bremen", "Werder"]], ["VfB Stuttgart", ["Stuttgart"]], ["Borussia Mönchengladbach", ["Gladbach", "Mönchengladbach"]],
    ["FC Augsburg", ["Augsburg"]], ["1. FC Union Berlin", ["Union Berlin", "Union"]],
    ["TSG Hoffenheim", ["Hoffenheim"]], ["1. FC Köln", ["Köln", "Koeln"]], ["Hamburger SV", ["HSV", "Hamburg"]],
    ["FC Schalke 04", ["Schalke", "Schalke 04"]], ["SV Elversberg", ["Elversberg"]], ["SC Paderborn 07", ["Paderborn", "SC Paderborn"]]] },

  { cat: "Unterhaltung", q: "Die 7 Harry-Potter-Bände", ranked: true, note: "Titel ohne „Harry Potter und …“ reicht", items: [
    ["der Stein der Weisen", ["Stein der Weisen"]], ["die Kammer des Schreckens", ["Kammer des Schreckens"]], ["der Gefangene von Askaban", ["Gefangene von Askaban", "Askaban"]],
    ["der Feuerkelch", ["Feuerkelch"]], ["der Orden des Phönix", ["Orden des Phönix", "Orden des Phoenix"]], ["der Halbblutprinz", ["Halbblutprinz"]],
    ["die Heiligtümer des Todes", ["Heiligtümer des Todes"]]] },
  { cat: "Unterhaltung", q: "Die 5 Spice Girls", note: "Vor-/Nachname oder Spitzname", items: [
    ["Victoria Beckham", ["Victoria Adams", "Posh Spice", "Posh"]], ["Melanie Brown", ["Mel B", "Scary Spice", "Scary"]], ["Emma Bunton", ["Baby Spice", "Baby"]],
    ["Melanie Chisholm", ["Mel C", "Sporty Spice", "Sporty"]], ["Geri Halliwell", ["Ginger Spice", "Ginger"]]], names: true },

  // ---------- Erweiterung 2 ----------
  { cat: "Länder", q: "Die 7 Nachbarländer der Ukraine", items: [
    ["Polen"], ["Slowakei"], ["Ungarn"], ["Rumänien", ["Rumaenien"]], ["Moldau", ["Moldawien", "Republik Moldau"]], ["Belarus", ["Weißrussland", "Weissrussland"]], ["Russland"]] },
  { cat: "Länder", q: "Die 7 Nachbarländer Ungarns", items: [
    ["Österreich", ["Oesterreich"]], ["Slowakei"], ["Ukraine"], ["Rumänien", ["Rumaenien"]], ["Serbien"], ["Kroatien"], ["Slowenien"]] },
  { cat: "Länder", q: "Die 10 Nachbarn Brasiliens", note: "9 Länder und Französisch-Guayana", items: [
    ["Argentinien"], ["Bolivien"], ["Kolumbien"], ["Französisch-Guayana", ["Franzoesisch-Guayana", "Guayana", "Frankreich"]], ["Guyana"], ["Paraguay"],
    ["Peru"], ["Suriname", ["Surinam"]], ["Uruguay"], ["Venezuela"]] },
  { cat: "Länder", q: "Die 12 unabhängigen Länder Südamerikas", items: [
    ["Argentinien"], ["Bolivien"], ["Brasilien"], ["Chile"], ["Ecuador"], ["Guyana"], ["Kolumbien"], ["Paraguay"], ["Peru"], ["Suriname", ["Surinam"]],
    ["Uruguay"], ["Venezuela"]] },
  { cat: "Länder", q: "Die 5 ständigen Mitglieder im UN-Sicherheitsrat", items: [
    ["USA", ["Vereinigte Staaten", "Amerika"]], ["Russland"], ["China"], ["Frankreich"], ["Großbritannien", ["Grossbritannien", "Vereinigtes Königreich", "UK", "England"]]] },
  { cat: "Natur", q: "Die 5 Großen Seen Nordamerikas", items: [
    ["Oberer See", ["Lake Superior"]], ["Michigansee", ["Lake Michigan"]], ["Huronsee", ["Lake Huron"]], ["Eriesee", ["Lake Erie"]], ["Ontariosee", ["Lake Ontario"]]] },
  { cat: "Städte", q: "Die 23 Bezirke Wiens", ranked: true, items: [
    ["Innere Stadt"], ["Leopoldstadt"], ["Landstraße", ["Landstrasse"]], ["Wieden"], ["Margareten"], ["Mariahilf"], ["Neubau"], ["Josefstadt"],
    ["Alsergrund"], ["Favoriten"], ["Simmering"], ["Meidling"], ["Hietzing"], ["Penzing"], ["Rudolfsheim-Fünfhaus", ["Rudolfsheim", "Fünfhaus"]],
    ["Ottakring"], ["Hernals"], ["Währing", ["Waehring"]], ["Döbling", ["Doebling"]], ["Brigittenau"], ["Floridsdorf"], ["Donaustadt"], ["Liesing"]] },
  { cat: "Geschichte", q: "Die 12 deutschen Bundespräsidenten", ranked: true, note: "Stand 2026", names: true, items: [
    ["Theodor Heuss"], ["Heinrich Lübke", ["Luebke"]], ["Gustav Heinemann"], ["Walter Scheel"], ["Karl Carstens"], ["Richard von Weizsäcker", ["Weizsäcker", "Weizsaecker"]],
    ["Roman Herzog"], ["Johannes Rau"], ["Horst Köhler", ["Koehler"]], ["Christian Wulff"], ["Joachim Gauck"], ["Frank-Walter Steinmeier", ["Steinmeier"]]] },
  { cat: "Geschichte", q: "Die 9 österreichischen Bundespräsidenten seit 1945", ranked: true, note: "Stand 2026", names: true, items: [
    ["Karl Renner"], ["Theodor Körner", ["Koerner"]], ["Adolf Schärf", ["Schaerf"]], ["Franz Jonas"], ["Rudolf Kirchschläger", ["Kirchschlaeger"]],
    ["Kurt Waldheim"], ["Thomas Klestil"], ["Heinz Fischer"], ["Alexander Van der Bellen", ["Van der Bellen", "VdB"]]] },
  { cat: "Geschichte", q: "Die 6 Ehefrauen Heinrichs VIII.", ranked: true, note: "Nachname reicht", items: [
    ["Katharina von Aragon", ["Aragon", "Aragón"]], ["Anne Boleyn", ["Boleyn", "Anna Boleyn"]], ["Jane Seymour", ["Seymour"]], ["Anna von Kleve", ["Kleve", "Anne of Cleves"]],
    ["Catherine Howard", ["Howard"]], ["Catherine Parr", ["Parr"]]] },
  { cat: "Geschichte", q: "Die 7 Hügel Roms", items: [
    ["Aventin", ["Aventinus"]], ["Caelius", ["Celio"]], ["Esquilin", ["Esquilinus"]], ["Kapitol", ["Capitol", "Kapitolinischer Hügel"]], ["Palatin", ["Palatinus"]],
    ["Quirinal", ["Quirinalis"]], ["Viminal", ["Viminalis"]]] },
  { cat: "Wissen", q: "Die 7 Sakramente der katholischen Kirche", items: [
    ["Taufe"], ["Firmung"], ["Eucharistie", ["Kommunion", "Abendmahl"]], ["Buße", ["Busse", "Beichte", "Bußsakrament"]], ["Krankensalbung", ["letzte Ölung"]],
    ["Weihe", ["Priesterweihe", "Weihesakrament"]], ["Ehe", ["Hochzeit", "Trauung"]]] },
  { cat: "Unterhaltung", q: "Die 6 Hauptfiguren aus „Friends“", items: [
    ["Rachel"], ["Monica"], ["Phoebe"], ["Joey"], ["Chandler"], ["Ross"]] },

  // ---------- Erweiterung 3 ----------
  { cat: "Geschichte", q: "Die 45 US-Präsidenten", ranked: true, note: "jede Person einmal, Stand 2026 · Nachname reicht (bei Adams, Bush usw. je einmal)", items: [
    ["George Washington", ["Washington"]], ["John Adams", ["Adams"]], ["Thomas Jefferson", ["Jefferson"]], ["James Madison", ["Madison"]],
    ["James Monroe", ["Monroe"]], ["John Quincy Adams", ["Adams", "JQA"]], ["Andrew Jackson", ["Jackson"]], ["Martin Van Buren", ["Buren", "Van Buren"]],
    ["William Henry Harrison", ["Harrison"]], ["John Tyler", ["Tyler"]], ["James K. Polk", ["Polk", "James Polk"]], ["Zachary Taylor", ["Taylor"]],
    ["Millard Fillmore", ["Fillmore"]], ["Franklin Pierce", ["Pierce"]], ["James Buchanan", ["Buchanan"]], ["Abraham Lincoln", ["Lincoln"]],
    ["Andrew Johnson", ["Johnson"]], ["Ulysses S. Grant", ["Grant", "Ulysses Grant"]], ["Rutherford B. Hayes", ["Hayes", "Rutherford Hayes"]], ["James A. Garfield", ["Garfield", "James Garfield"]],
    ["Chester A. Arthur", ["Arthur", "Chester Arthur"]], ["Grover Cleveland", ["Cleveland"]], ["Benjamin Harrison", ["Harrison"]], ["William McKinley", ["McKinley"]],
    ["Theodore Roosevelt", ["Roosevelt", "Teddy Roosevelt"]], ["William Howard Taft", ["Taft", "William Taft"]], ["Woodrow Wilson", ["Wilson"]], ["Warren G. Harding", ["Harding", "Warren Harding"]],
    ["Calvin Coolidge", ["Coolidge"]], ["Herbert Hoover", ["Hoover"]], ["Franklin D. Roosevelt", ["Roosevelt", "FDR", "Franklin Roosevelt"]], ["Harry S. Truman", ["Truman", "Harry Truman"]],
    ["Dwight D. Eisenhower", ["Eisenhower", "Dwight Eisenhower", "Ike"]], ["John F. Kennedy", ["Kennedy", "JFK", "John Kennedy"]], ["Lyndon B. Johnson", ["Johnson", "LBJ", "Lyndon Johnson"]], ["Richard Nixon", ["Nixon"]],
    ["Gerald Ford", ["Ford"]], ["Jimmy Carter", ["Carter"]], ["Ronald Reagan", ["Reagan"]], ["George H. W. Bush", ["Bush", "Bush senior", "Bush sen.", "George Bush senior"]],
    ["Bill Clinton", ["Clinton"]], ["George W. Bush", ["Bush", "Bush junior", "Bush jr.", "George Bush junior"]], ["Barack Obama", ["Obama"]], ["Donald Trump", ["Trump"]],
    ["Joe Biden", ["Biden"]]] },
  { cat: "Geschichte", q: "Die 14 US-Präsidenten seit 1945", ranked: true, note: "jede Person einmal, Stand 2026", items: [
    ["Harry S. Truman", ["Truman", "Harry Truman"]], ["Dwight D. Eisenhower", ["Eisenhower", "Dwight Eisenhower", "Ike"]], ["John F. Kennedy", ["Kennedy", "JFK", "John Kennedy"]], ["Lyndon B. Johnson", ["Johnson", "LBJ", "Lyndon Johnson"]],
    ["Richard Nixon", ["Nixon"]], ["Gerald Ford", ["Ford"]], ["Jimmy Carter", ["Carter"]], ["Ronald Reagan", ["Reagan"]],
    ["George H. W. Bush", ["Bush", "Bush senior", "Bush sen.", "George Bush senior"]], ["Bill Clinton", ["Clinton"]], ["George W. Bush", ["Bush", "Bush junior", "Bush jr.", "George Bush junior"]], ["Barack Obama", ["Obama"]],
    ["Donald Trump", ["Trump"]], ["Joe Biden", ["Biden"]]] },
  { cat: "Geschichte", q: "Die 31 italienischen Ministerpräsidenten der Republik", ranked: true, note: "jede Person einmal, seit 1946, Stand 2026 · Nachname reicht", names: true, items: [
    ["Alcide De Gasperi", ["De Gasperi"]], ["Giuseppe Pella"], ["Amintore Fanfani"], ["Mario Scelba"],
    ["Antonio Segni"], ["Adone Zoli"], ["Fernando Tambroni"], ["Giovanni Leone"],
    ["Aldo Moro"], ["Mariano Rumor"], ["Emilio Colombo"], ["Giulio Andreotti"],
    ["Francesco Cossiga"], ["Arnaldo Forlani"], ["Giovanni Spadolini"], ["Bettino Craxi"],
    ["Giovanni Goria"], ["Ciriaco De Mita", ["De Mita"]], ["Giuliano Amato"], ["Carlo Azeglio Ciampi", ["Ciampi", "Carlo Ciampi"]],
    ["Silvio Berlusconi"], ["Lamberto Dini"], ["Romano Prodi"], ["Massimo D'Alema", ["D'Alema", "Dalema"]],
    ["Mario Monti"], ["Enrico Letta"], ["Matteo Renzi"], ["Paolo Gentiloni"],
    ["Giuseppe Conte"], ["Mario Draghi"], ["Giorgia Meloni"]] },
  { cat: "Unterhaltung", q: "Die 5 Freunde aus „How I Met Your Mother“", note: "Vorname reicht", items: [
    ["Ted Mosby", ["Ted", "Mosby"]], ["Marshall Eriksen", ["Marshall", "Eriksen"]], ["Lily Aldrin", ["Lily", "Aldrin"]], ["Robin Scherbatsky", ["Robin", "Scherbatsky"]],
    ["Barney Stinson", ["Barney", "Stinson"]]] },
  { cat: "Südtirol", q: "Die 5 Stadtviertel von Bozen", note: "ein Teil des Namens reicht", items: [
    ["Zentrum-Bozner Boden-Rentsch", ["Zentrum", "Bozner Boden", "Rentsch", "Altstadt"]], ["Oberau-Haslach", ["Oberau", "Haslach"]],
    ["Europa-Neustift", ["Europa", "Neustift"]], ["Don Bosco"], ["Gries-Quirein", ["Gries", "Quirein"]]] },
  { cat: "Südtirol", q: "Die 14 Südtiroler Olympiasieger", note: "Goldmedaillen bis einschließlich 2026, Einzel und Team · Nachname reicht", names: true, items: [
    ["Gustav Thöni", ["Thoeni"]], ["Paul Hildgartner"], ["Walter Plaikner"], ["Erika Lechner"], ["Armin Zöggeler", ["Zoeggeler"]], ["Gerda Weissensteiner", ["Weißensteiner"]],
    ["Kurt Brugger"], ["Wilfried Huber"], ["Günther Huber", ["Guenther Huber"]], ["Klaus Dibiasi"],
    ["Andrea Vötter", ["Voetter"]], ["Marion Oberhofer"], ["Emanuel Rieder"], ["Simon Kainzwaldner"]] },
  { cat: "Südtirol", q: "Die 5 Landeshauptleute Südtirols", ranked: true, note: "seit 1948, Stand 2026 · Nachname reicht", names: true, items: [
    ["Karl Erckert"], ["Alois Pupp"], ["Silvius Magnago"], ["Luis Durnwalder", ["Alois Durnwalder"]], ["Arno Kompatscher"]] },
  { cat: "Geschichte", q: "Die 18 österreichischen Bundeskanzler seit 1945", ranked: true, note: "jede Person einmal, Stand 2026 · Nachname reicht", names: true, items: [
    ["Karl Renner"], ["Leopold Figl"], ["Julius Raab"], ["Alfons Gorbach"], ["Josef Klaus"], ["Bruno Kreisky"], ["Fred Sinowatz"], ["Franz Vranitzky"],
    ["Viktor Klima"], ["Wolfgang Schüssel", ["Schuessel"]], ["Alfred Gusenbauer"], ["Werner Faymann"], ["Christian Kern"], ["Sebastian Kurz"],
    ["Brigitte Bierlein"], ["Alexander Schallenberg"], ["Karl Nehammer"], ["Christian Stocker"]] },
  { cat: "Geschichte", q: "Die 12 italienischen Staatspräsidenten", ranked: true, note: "seit 1946, Stand 2026 · Nachname reicht", names: true, items: [
    ["Enrico De Nicola", ["De Nicola"]], ["Luigi Einaudi"], ["Giovanni Gronchi"], ["Antonio Segni"], ["Giuseppe Saragat"], ["Giovanni Leone"],
    ["Sandro Pertini"], ["Francesco Cossiga"], ["Oscar Luigi Scalfaro", ["Oscar Scalfaro"]], ["Carlo Azeglio Ciampi", ["Carlo Ciampi"]],
    ["Giorgio Napolitano"], ["Sergio Mattarella"]] },
  { cat: "Länder", q: "Die 7 Provinzen Venetiens", items: [
    ["Belluno"], ["Padua", ["Padova"]], ["Rovigo"], ["Treviso"], ["Venedig", ["Venezia"]], ["Verona"], ["Vicenza"]] },
  { cat: "Wissen", q: "Die 8 Planeten unseres Sonnensystems", ranked: true, items: [
    ["Merkur"], ["Venus"], ["Erde"], ["Mars"], ["Jupiter"], ["Saturn"], ["Uranus"], ["Neptun"]] },
  { cat: "Wissen", q: "Die 12 Sternzeichen", ranked: true, items: [
    ["Widder"], ["Stier"], ["Zwillinge"], ["Krebs"], ["Löwe", ["Loewe"]], ["Jungfrau"], ["Waage"], ["Skorpion"], ["Schütze", ["Schuetze"]],
    ["Steinbock"], ["Wassermann"], ["Fische"]] },
  { cat: "Wissen", q: "Die 5 Ozeane", items: [
    ["Pazifik", ["Pazifischer Ozean", "Stiller Ozean"]], ["Atlantik", ["Atlantischer Ozean"]], ["Indischer Ozean", ["Indik"]],
    ["Arktischer Ozean", ["Nordpolarmeer", "Arktis"]], ["Südlicher Ozean", ["Südpolarmeer", "Antarktischer Ozean"]]] },
  { cat: "Südtirol", q: "Die 10 häufigsten Nachnamen Südtirols", ranked: true, note: "nach Zahl der Träger, ASTAT-Erhebung 2010", items: [
    ["Mair"], ["Hofer"], ["Pichler"], ["Kofler"], ["Gruber"], ["Pircher"], ["Gasser"], ["Egger"], ["Thaler"], ["Gamper"]] },
  // ---------- lange Listen: kaum jemand kennt alle ----------
  { cat: "Südtirol", q: "Die 13 Gemeinden des Eisacktals", note: "Bezirksgemeinschaft Eisacktal", items: [
    ["Brixen", ["Bressanone"]], ["Klausen", ["Chiusa"]], ["Barbian", ["Barbiano"]], ["Feldthurns", ["Velturno"]], ["Villanders", ["Villandro"]], ["Lajen", ["Laion"]],
    ["Waidbruck", ["Ponte Gardena"]], ["Villnöß", ["Villnöss", "Funes"]], ["Natz-Schabs", ["Natz", "Schabs", "Naz-Sciaves"]], ["Mühlbach", ["Muehlbach", "Rio di Pusteria"]],
    ["Rodeneck", ["Rodengo"]], ["Lüsen", ["Luesen", "Luson"]], ["Vahrn", ["Varna"]]] },
  { cat: "Südtirol", q: "Die 6 Gemeinden des Wipptals", note: "Bezirksgemeinschaft Wipptal", items: [
    ["Sterzing", ["Vipiteno"]], ["Brenner", ["Brennero"]], ["Pfitsch", ["Val di Vizze"]], ["Ratschings", ["Racines"]], ["Freienfeld", ["Campo di Trens"]],
    ["Franzensfeste", ["Fortezza"]]] },
  { cat: "Südtirol", q: "Die 26 Gemeinden des Burggrafenamts", note: "Bezirksgemeinschaft Burggrafenamt, mit Passeier, Ulten und Deutschnonsberg", items: [
    ["Meran", ["Merano"]], ["Algund", ["Lagundo"]], ["Partschins", ["Parcines"]], ["Plaus"], ["Naturns", ["Naturno"]], ["Tirol", ["Dorf Tirol", "Tirolo"]],
    ["Riffian", ["Rifiano"]], ["Kuens", ["Caines"]], ["Schenna", ["Scena"]], ["St. Martin in Passeier", ["Sankt Martin in Passeier", "St. Martin"]],
    ["St. Leonhard in Passeier", ["Sankt Leonhard in Passeier", "St. Leonhard"]], ["Moos in Passeier", ["Moos"]], ["Hafling", ["Avelengo"]], ["Vöran", ["Voeran", "Verano"]],
    ["Marling", ["Marlengo"]], ["Tscherms", ["Cermes"]], ["Lana"], ["Burgstall", ["Postal"]], ["Gargazon", ["Gargazzone"]], ["Tisens", ["Tesimo"]], ["Nals", ["Nalles"]],
    ["Ulten", ["Ultimo"]], ["St. Pankraz", ["Sankt Pankraz", "San Pancrazio"]], ["Laurein", ["Lauregno"]], ["Proveis", ["Proves"]],
    ["Unsere Liebe Frau im Walde-St. Felix", ["Unsere Liebe Frau im Walde", "St. Felix", "Senale-San Felice"]]] },
  { cat: "Südtirol", q: "Die 13 Gemeinden von Salten-Schlern", note: "Bezirksgemeinschaft Salten-Schlern, mit Gröden", items: [
    ["Kastelruth", ["Castelrotto"]], ["Völs am Schlern", ["Völs", "Voels", "Fiè allo Sciliar"]], ["Tiers", ["Tires"]], ["Karneid", ["Cornedo"]], ["Deutschnofen", ["Nova Ponente"]],
    ["Welschnofen", ["Nova Levante"]], ["Jenesien", ["San Genesio"]], ["Mölten", ["Moelten", "Meltina"]], ["Ritten", ["Renon"]], ["Sarntal", ["Sarentino"]],
    ["St. Ulrich in Gröden", ["St. Ulrich", "Urtijëi", "Ortisei"]], ["St. Christina in Gröden", ["St. Christina", "Santa Cristina"]], ["Wolkenstein in Gröden", ["Wolkenstein", "Sëlva", "Selva"]]] },
  { cat: "Südtirol", q: "Die 18 Gemeinden von Überetsch-Unterland", note: "Bezirksgemeinschaft Überetsch-Unterland", items: [
    ["Eppan", ["Appiano"]], ["Kaltern", ["Caldaro"]], ["Tramin", ["Termeno"]], ["Kurtatsch", ["Cortaccia"]], ["Margreid", ["Magrè"]], ["Kurtinig", ["Cortina sulla Strada del Vino"]],
    ["Salurn", ["Salorno"]], ["Neumarkt", ["Egna"]], ["Montan", ["Montagna"]], ["Auer", ["Ora"]], ["Branzoll", ["Bronzolo"]], ["Pfatten", ["Vadena"]],
    ["Leifers", ["Laives"]], ["Truden", ["Trodena"]], ["Altrei", ["Anterivo"]], ["Aldein", ["Aldino"]], ["Andrian", ["Andriano"]], ["Terlan", ["Terlano"]]] },
  { cat: "Länder", q: "Die 14 Metropolitanstädte Italiens", note: "Città metropolitane", items: [
    ["Rom", ["Roma"]], ["Mailand", ["Milano"]], ["Neapel", ["Napoli"]], ["Turin", ["Torino"]], ["Bari"], ["Bologna"], ["Florenz", ["Firenze"]], ["Genua", ["Genova"]],
    ["Venedig", ["Venezia"]], ["Reggio Calabria", ["Reggio"]], ["Messina"], ["Palermo"], ["Catania"], ["Cagliari"]] },
  { cat: "Länder", q: "Die 5 Regionen Italiens mit Sonderstatut", items: [
    ["Sizilien", ["Sicilia"]], ["Sardinien", ["Sardegna"]], ["Aostatal", ["Valle d'Aosta", "Aosta"]], ["Trentino-Südtirol", ["Trentino-Alto Adige", "Trentino", "Südtirol"]],
    ["Friaul-Julisch Venetien", ["Friaul", "Friuli-Venezia Giulia", "Friuli"]]] },
  { cat: "Geschichte", q: "Die 7 neuen Weltwunder", note: "weltweite Wahl 2007", items: [
    ["Chinesische Mauer", ["Große Mauer"]], ["Petra"], ["Christusstatue in Rio de Janeiro", ["Cristo Redentor", "Christusstatue", "Christus der Erlöser"]], ["Machu Picchu"],
    ["Chichén Itzá", ["Chichen Itza"]], ["Kolosseum", ["Colosseum"]], ["Taj Mahal"]] },
  { cat: "Unterhaltung", q: "Die 12 Mitglieder von ABBA, Queen und den Beatles", note: "Stammbesetzungen · Nachname reicht", names: true, items: [
    ["John Lennon"], ["Paul McCartney"], ["George Harrison"], ["Ringo Starr"], ["Freddie Mercury"], ["Brian May"], ["Roger Taylor"], ["John Deacon"],
    ["Agnetha Fältskog", ["Agnetha", "Faeltskog"]], ["Björn Ulvaeus", ["Björn", "Bjoern"]], ["Benny Andersson", ["Benny"]], ["Anni-Frid Lyngstad", ["Frida", "Anni-Frid"]]] },
  { cat: "Geschichte", q: "Die olympischen Götter", note: "12 Hauptgötter der Griechen – je nach Überlieferung Hestia oder Dionysos, hier zählen beide", items: [
    ["Zeus"], ["Hera"], ["Poseidon"], ["Demeter"], ["Athene", ["Athena"]], ["Apollon", ["Apollo"]], ["Artemis"], ["Ares"], ["Aphrodite"],
    ["Hephaistos", ["Hephaestus", "Hephaistus"]], ["Hermes"], ["Hestia"], ["Dionysos", ["Dionysus"]]] },
  { cat: "Wissen", q: "Die 14 Elemente mit nur einem Buchstaben als Symbol", note: "Name des Elements nennen, nicht das Symbol", items: [
    ["Wasserstoff (H)", ["Wasserstoff"]], ["Bor (B)", ["Bor"]], ["Kohlenstoff (C)", ["Kohlenstoff"]], ["Stickstoff (N)", ["Stickstoff"]], ["Sauerstoff (O)", ["Sauerstoff"]],
    ["Fluor (F)", ["Fluor"]], ["Phosphor (P)", ["Phosphor"]], ["Schwefel (S)", ["Schwefel"]], ["Kalium (K)", ["Kalium"]], ["Vanadium (V)", ["Vanadium"]],
    ["Yttrium (Y)", ["Yttrium"]], ["Iod (I)", ["Iod", "Jod"]], ["Wolfram (W)", ["Wolfram"]], ["Uran (U)", ["Uran"]]] },
  { cat: "Länder", q: "Die 9 Länder Europas mit einem Kreuz in der Flagge", note: "Kreuz als Teil des Flaggenmusters, nicht nur in einem Wappen", items: [
    ["Schweiz"], ["Dänemark", ["Daenemark"]], ["Norwegen"], ["Schweden"], ["Finnland"], ["Island"], ["Griechenland"],
    ["Vereinigtes Königreich", ["Großbritannien", "Grossbritannien", "UK", "England"]], ["Georgien"]] },
  { cat: "Südtirol", q: "Die 13 Gemeinden des Vinschgaus", note: "Bezirksgemeinschaft Vinschgau", items: [
    ["Graun im Vinschgau", ["Graun", "Curon"]], ["Mals", ["Malles"]], ["Glurns", ["Glorenza"]], ["Taufers im Münstertal", ["Taufers", "Tubre"]],
    ["Prad am Stilfserjoch", ["Prad", "Prato allo Stelvio"]], ["Stilfs", ["Stelvio"]], ["Schluderns", ["Sluderno"]], ["Laas", ["Lasa"]],
    ["Schlanders", ["Silandro"]], ["Martell", ["Martello"]], ["Latsch", ["Laces"]], ["Kastelbell-Tschars", ["Kastelbell", "Castelbello"]], ["Schnals", ["Senales"]]] },
  { cat: "Südtirol", q: "Die 26 Gemeinden des Pustertals", note: "Bezirksgemeinschaft Pustertal, mit Gadertal", items: [
    ["Bruneck", ["Brunico"]], ["Ahrntal", ["Valle Aurina"]], ["Prettau", ["Predoi"]], ["Sand in Taufers", ["Campo Tures", "Sand"]], ["Mühlwald", ["Muehlwald", "Selva dei Molini"]],
    ["Gais"], ["Percha", ["Perca"]], ["Rasen-Antholz", ["Rasen", "Antholz", "Rasun-Anterselva"]], ["Olang", ["Valdaora"]], ["Welsberg-Taisten", ["Welsberg", "Monguelfo"]],
    ["Gsies", ["Gsieser Tal", "Valle di Casies"]], ["Prags", ["Braies"]], ["Niederdorf", ["Villabassa"]], ["Toblach", ["Dobbiaco"]], ["Innichen", ["San Candido"]],
    ["Sexten", ["Sesto"]], ["St. Lorenzen", ["Sankt Lorenzen", "San Lorenzo"]], ["Kiens", ["Chienes"]], ["Pfalzen", ["Falzes"]], ["Terenten", ["Terento"]],
    ["Vintl", ["Vandoies"]], ["Enneberg", ["Mareo", "Marebbe"]], ["St. Martin in Thurn", ["Sankt Martin in Thurn", "San Martin de Tor"]], ["Abtei", ["Badia"]],
    ["Corvara"], ["Wengen", ["La Val"]]] },
  { cat: "Südtirol", q: "Die 8 ladinischen Gemeinden Südtirols", note: "in Gröden und im Gadertal", items: [
    ["St. Ulrich in Gröden", ["St. Ulrich", "Sankt Ulrich", "Urtijëi", "Ortisei"]], ["St. Christina in Gröden", ["St. Christina", "Santa Cristina"]],
    ["Wolkenstein in Gröden", ["Wolkenstein", "Sëlva", "Selva"]], ["Abtei", ["Badia"]], ["Corvara"], ["Enneberg", ["Mareo", "Marebbe"]],
    ["St. Martin in Thurn", ["San Martin de Tor"]], ["Wengen", ["La Val"]]] },
  { cat: "Tirol", q: "Die 10 Landeshauptleute Tirols seit 1945", ranked: true, note: "Stand 2026 · Nachname reicht", names: true, items: [
    ["Karl Gruber"], ["Alfons Weißgatterer", ["Weissgatterer"]], ["Alois Grauß", ["Grauss"]], ["Hans Tschiggfrey"], ["Eduard Wallnöfer", ["Wallnoefer"]],
    ["Alois Partl"], ["Wendelin Weingartner"], ["Herwig van Staa", ["van Staa"]], ["Günther Platter", ["Guenther Platter"]], ["Anton Mattle"]] },
  { cat: "Länder", q: "Die 12 Provinzen der Lombardei", items: [
    ["Mailand", ["Milano"]], ["Bergamo"], ["Brescia"], ["Como"], ["Cremona"], ["Lecco"], ["Lodi"], ["Mantua", ["Mantova"]],
    ["Monza und Brianza", ["Monza", "Monza e Brianza"]], ["Pavia"], ["Sondrio"], ["Varese"]] },
  { cat: "Länder", q: "Die 54 Länder Afrikas", items: [
    ["Ägypten", ["Aegypten"]], ["Algerien"], ["Angola"], ["Äquatorialguinea", ["Aequatorialguinea"]], ["Äthiopien", ["Aethiopien"]], ["Benin"], ["Botsuana", ["Botswana"]],
    ["Burkina Faso"], ["Burundi"], ["Dschibuti", ["Djibouti"]], ["Elfenbeinküste", ["Côte d'Ivoire", "Elfenbeinkueste"]], ["Eritrea"], ["Eswatini", ["Swasiland"]],
    ["Gabun"], ["Gambia"], ["Ghana"], ["Guinea"], ["Guinea-Bissau"], ["Kamerun"], ["Kap Verde", ["Cabo Verde"]], ["Kenia"], ["Komoren"],
    ["Republik Kongo", ["Kongo-Brazzaville"]], ["Demokratische Republik Kongo", ["DR Kongo", "Kongo-Kinshasa", "Kongo"]], ["Lesotho"], ["Liberia"], ["Libyen"],
    ["Madagaskar"], ["Malawi"], ["Mali"], ["Marokko"], ["Mauretanien"], ["Mauritius"], ["Mosambik"], ["Namibia"], ["Niger"], ["Nigeria"], ["Ruanda"],
    ["Sambia"], ["São Tomé und Príncipe", ["Sao Tome und Principe", "São Tomé"]], ["Senegal"], ["Seychellen"], ["Sierra Leone"], ["Simbabwe"], ["Somalia"],
    ["Südafrika", ["Suedafrika"]], ["Sudan"], ["Südsudan", ["Suedsudan"]], ["Tansania"], ["Togo"], ["Tschad"], ["Tunesien"], ["Uganda"],
    ["Zentralafrikanische Republik"]] },
  { cat: "Länder", q: "Die 14 Nachbarländer Russlands", note: "mit gemeinsamer Landgrenze, auch über Kaliningrad", items: [
    ["Norwegen"], ["Finnland"], ["Estland"], ["Lettland"], ["Litauen"], ["Polen"], ["Belarus", ["Weißrussland", "Weissrussland"]], ["Ukraine"], ["Georgien"],
    ["Aserbaidschan"], ["Kasachstan"], ["China"], ["Mongolei"], ["Nordkorea"]] },
  { cat: "Natur", q: "Die 14 Achttausender", items: [
    ["Mount Everest", ["Everest", "Chomolungma"]], ["K2"], ["Kangchendzönga", ["Kangchenjunga", "Kantsch"]], ["Lhotse"], ["Makalu"], ["Cho Oyu"], ["Dhaulagiri"],
    ["Manaslu"], ["Nanga Parbat"], ["Annapurna"], ["Gasherbrum I", ["Hidden Peak"]], ["Broad Peak"], ["Gasherbrum II"], ["Shishapangma", ["Xixabangma"]]] },
  { cat: "Sport", q: "Die 19 Gastgeberländer der Fußball-WM", note: "Männer, bis einschließlich 2026", items: [
    ["Uruguay"], ["Italien"], ["Frankreich"], ["Brasilien"], ["Schweiz"], ["Schweden"], ["Chile"], ["England"], ["Mexiko"], ["Deutschland"], ["Argentinien"],
    ["Spanien"], ["USA", ["Vereinigte Staaten"]], ["Japan"], ["Südkorea", ["Korea", "Suedkorea"]], ["Südafrika", ["Suedafrika"]], ["Russland"], ["Katar"], ["Kanada"]] },
  { cat: "Sport", q: "Die 23 Städte der Olympischen Sommerspiele", note: "bis einschließlich 2024", items: [
    ["Athen"], ["Paris"], ["St. Louis", ["Saint Louis"]], ["London"], ["Stockholm"], ["Antwerpen"], ["Amsterdam"], ["Los Angeles"], ["Berlin"], ["Helsinki"],
    ["Melbourne"], ["Rom"], ["Tokio", ["Tokyo"]], ["Mexiko-Stadt", ["Mexico City", "Mexiko"]], ["München"], ["Montreal"], ["Moskau"], ["Seoul"], ["Barcelona"],
    ["Atlanta"], ["Sydney"], ["Peking", ["Beijing"]], ["Rio de Janeiro", ["Rio"]]] },
  { cat: "Geschichte", q: "Die 12 Apostel", items: [
    ["Petrus", ["Simon Petrus"]], ["Andreas"], ["Jakobus der Ältere", ["Jakobus"]], ["Johannes"], ["Philippus"], ["Bartholomäus", ["Bartholomaeus"]], ["Thomas"],
    ["Matthäus", ["Matthaeus"]], ["Jakobus der Jüngere", ["Jakobus"]], ["Judas Thaddäus", ["Thaddäus", "Judas Thaddaeus"]], ["Simon Zelotes", ["Simon"]], ["Judas Iskariot", ["Judas"]]] },
];
