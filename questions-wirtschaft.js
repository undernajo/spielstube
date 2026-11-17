// Fragen-Set „Wirtschaft“ – VWL, BWL, Consulting, Wirtschaftsinformatik, Börse.
// Wird in der Lobby unter „Fragen“ ausgewählt; jede Karte bekommt automatisch set: "wirtschaft".
window.SCHLAU10_CARDS.push(...[

  // ===================== VWL: Köpfe & Ideen =====================
  { q: "Wer prägte den Begriff oder die Idee?", type: "choice", names: true, items: [
    ["Die „unsichtbare Hand“", "Adam Smith"], ["Schöpferische Zerstörung", "Joseph Schumpeter"], ["Komparativer Kostenvorteil", "David Ricardo"],
    ["Bevölkerung wächst schneller als die Nahrung", "Thomas Malthus"], ["„Das Kapital“", "Karl Marx"], ["Antizyklische Fiskalpolitik", "John Maynard Keynes"],
    ["Monetarismus", "Milton Friedman"], ["Der Begriff „Soziale Marktwirtschaft“", "Alfred Müller-Armack", ["Müller-Armack"]],
    ["„Der Weg zur Knechtschaft“", "Friedrich August von Hayek", ["Hayek", "F. A. Hayek"]], ["Gleichgewicht in der Spieltheorie", "John Nash"] ] },

  { q: "Ordne die Ökonomen nach Geburtsjahr.", hint: "1 = am frühesten geboren", type: "rank", items: [
    ["Adam Smith", 1], ["Thomas Malthus", 2], ["David Ricardo", 3], ["Karl Marx", 4], ["Alfred Marshall", 5],
    ["Vilfredo Pareto", 6], ["John Maynard Keynes", 7], ["Friedrich August von Hayek", 8], ["Milton Friedman", 9], ["Paul Krugman", 10] ] },

  { q: "Wer sagte das?", type: "choice", names: true, items: [
    ["„Langfristig sind wir alle tot.“", "John Maynard Keynes"], ["„Inflation ist immer und überall ein monetäres Phänomen.“", "Milton Friedman"],
    ["„Wohlstand für alle“ (Buchtitel)", "Ludwig Erhard"], ["„Whatever it takes“ (2012)", "Mario Draghi"], ["„Irrationaler Überschwang“ (1996)", "Alan Greenspan"],
    ["„Gier ist gut.“ (Film „Wall Street“)", "Gordon Gekko"], ["„Proletarier aller Länder, vereinigt euch!“", "Karl Marx", ["Friedrich Engels", "Engels", "Marx und Engels"]],
    ["„Der Preis ist, was du zahlst. Der Wert ist, was du bekommst.“", "Warren Buffett"], ["„Software is eating the world.“", "Marc Andreessen"],
    ["„Stay hungry, stay foolish.“", "Steve Jobs"] ] },

  { q: "Hat die Person den Wirtschaftsnobelpreis bekommen?", type: "tf", items: [
    ["Milton Friedman", true], ["Paul Krugman", true], ["Friedrich August von Hayek", true], ["Daniel Kahneman", true], ["Joseph Stiglitz", true],
    ["Reinhard Selten", true], ["John Maynard Keynes", false], ["Adam Smith", false], ["Karl Marx", false], ["Thomas Piketty", false] ] },

  { q: "Welche Denkschule ist gemeint?", type: "choice", items: [
    ["Der Staat stützt in Krisen die Nachfrage", "Keynesianismus"], ["Die Geldmenge steuert die Inflation", "Monetarismus"],
    ["Freie Märkte, Smith und Ricardo", "Klassik", ["Klassische Nationalökonomie", "Klassische Ökonomie"]], ["Menger, Mises, Hayek", "Österreichische Schule", ["Wiener Schule"]],
    ["Starker Ordnungsrahmen, Walter Eucken", "Ordoliberalismus", ["Freiburger Schule"]], ["Grenznutzen und Gleichgewichtsmodelle", "Neoklassik"],
    ["Menschen entscheiden nicht immer rational", "Verhaltensökonomik", ["Behavioral Economics", "Verhaltensökonomie"]],
    ["Exportüberschüsse und Goldschatz (17. Jh.)", "Merkantilismus"], ["Der Boden als einzige Quelle des Reichtums", "Physiokratie", ["Physiokraten"]],
    ["Steuern senken, Angebotsseite stärken", "Angebotspolitik", ["Angebotsökonomik", "Supply-Side Economics"]] ] },

  // ===================== VWL: Begriffe & Gesetze =====================
  { q: "Wie heißt der Fachbegriff?", hint: "VWL", type: "choice", items: [
    ["Anhaltender Anstieg des Preisniveaus", "Inflation"], ["Anhaltend sinkendes Preisniveau", "Deflation"], ["Stagnation plus Inflation", "Stagflation"],
    ["Wert aller in einem Jahr erzeugten Güter", "Bruttoinlandsprodukt", ["BIP"]], ["Zwei Quartale in Folge schrumpfende Wirtschaft", "Rezession", ["technische Rezession"]],
    ["Markt mit nur einem Nachfrager", "Monopson", ["Nachfragemonopol"]], ["Wert der besten entgangenen Alternative", "Opportunitätskosten"],
    ["Güter, die man bei steigendem Einkommen weniger kauft", "inferiore Güter", ["inferiores Gut"]], ["Höherer Preis macht das Gut begehrter", "Veblen-Gut", ["Veblen-Effekt", "Snob-Effekt"]],
    ["Der Nutzen jeder weiteren Einheit nimmt ab", "abnehmender Grenznutzen", ["Gossensches Gesetz", "Erstes Gossensches Gesetz"]] ] },

  { q: "Welches Gesetz ist gemeint?", type: "choice", items: [
    ["Schlechtes Geld verdrängt gutes", "Greshamsches Gesetz", ["Gresham"]], ["Jedes Angebot schafft sich seine Nachfrage", "Saysches Theorem", ["Say", "Says Gesetz"]],
    ["Mit wachsendem Wohlstand steigt die Staatsquote", "Wagnersches Gesetz", ["Wagner"]], ["Mit steigendem Einkommen sinkt der Anteil für Nahrung", "Engelsches Gesetz", ["Engel"]],
    ["1 % mehr Arbeitslosigkeit, rund 2 % weniger BIP", "Okunsches Gesetz", ["Okun"]], ["Steigt der Preis, sinkt die nachgefragte Menge", "Gesetz der Nachfrage"],
    ["Mehr von einem Faktor bringt immer weniger Zusatzertrag", "Ertragsgesetz", ["Gesetz des abnehmenden Ertragszuwachses", "abnehmender Grenzertrag"]],
    ["Wechselkurse gleichen Kaufkraftunterschiede aus", "Kaufkraftparität", ["Kaufkraftparitätentheorie"]],
    ["Arbeit dehnt sich so weit aus, wie Zeit da ist", "Parkinsonsches Gesetz", ["Parkinson"]], ["Jeder steigt bis zur Stufe seiner Unfähigkeit auf", "Peter-Prinzip"] ] },

  { q: "Welche Kurve, welcher Index?", type: "choice", items: [
    ["Maß für Einkommensungleichheit zwischen 0 und 1", "Gini-Koeffizient", ["Gini"]], ["Stimmungsbarometer der deutschen Wirtschaft", "ifo-Geschäftsklimaindex", ["ifo-Index", "ifo"]],
    ["Preisindex für den Warenkorb der Haushalte", "Verbraucherpreisindex", ["VPI"]], ["Inflation vs. Arbeitslosigkeit", "Phillips-Kurve"],
    ["Steuersatz vs. Steuereinnahmen", "Laffer-Kurve"], ["Ungleichheit vs. Entwicklung, umgedrehtes U", "Kuznets-Kurve"],
    ["Faustregel für den Leitzins", "Taylor-Regel"], ["Kaufkraftvergleich mit einem Burger", "Big-Mac-Index"],
    ["Verteilung des Einkommens als gebogene Kurve", "Lorenz-Kurve"], ["Kurve aller effizienten Produktionskombinationen", "Transformationskurve", ["Produktionsmöglichkeitenkurve"]] ] },

  { q: "Gehört das zum „magischen Viereck“ (Stabilitätsgesetz 1967)?", type: "tf", items: [
    ["Stabiles Preisniveau", true], ["Hoher Beschäftigungsstand", true], ["Außenwirtschaftliches Gleichgewicht", true], ["Stetiges, angemessenes Wachstum", true],
    ["Gerechte Einkommensverteilung", false], ["Umweltschutz", false], ["Ausgeglichener Staatshaushalt", false], ["Niedrige Steuern", false],
    ["Exportüberschuss", false], ["Nullzins", false] ] },

  { q: "Gehört der Begriff zur Spieltheorie?", type: "tf", items: [
    ["Nash-Gleichgewicht", true], ["Gefangenendilemma", true], ["Nullsummenspiel", true], ["Dominante Strategie", true], ["Feiglingsspiel", true],
    ["Tit for Tat", true], ["Phillips-Kurve", false], ["Grenzkosten", false], ["Preiselastizität", false], ["Inflation", false] ] },

  { q: "VWL in Zahlen", type: "num", items: [
    ["Inflationsziel der EZB (%)", 2], ["Maastricht-Grenze für das Haushaltsdefizit (% des BIP)", 3], ["Maastricht-Grenze für die Staatsschulden (% des BIP)", 60],
    ["Jahr des Stabilitätsgesetzes", 1967], ["Ziele im magischen Viereck", 4], ["Mitglieder im EZB-Direktorium", 6], ["Gründungsjahr der EZB", 1998],
    ["Erlaubtes strukturelles Defizit des Bundes laut Schuldenbremse (% des BIP)", 0.35], ["Mitglieder des Sachverständigenrats („Wirtschaftsweise“)", 5],
    ["Jahr der Einführung des Mindestlohns in Deutschland", 2015] ] },

  // ===================== Geld, Krisen & Institutionen =====================
  { q: "Ist das ein Instrument der Geldpolitik?", type: "tf", items: [
    ["Leitzins", true], ["Mindestreserve", true], ["Offenmarktgeschäfte", true], ["Anleihekäufe der Zentralbank", true], ["Einlagefazilität", true],
    ["Spitzenrefinanzierungsfazilität", true], ["Mehrwertsteuer", false], ["Kindergeld", false], ["Schuldenbremse", false], ["Mindestlohn", false] ] },

  { q: "Wer leitete die Notenbank?", type: "choice", names: true, items: [
    ["EZB 1998–2003", "Wim Duisenberg"], ["EZB 2003–2011", "Jean-Claude Trichet"], ["EZB 2011–2019", "Mario Draghi"], ["Fed 1979–1987", "Paul Volcker"],
    ["Fed 1987–2006", "Alan Greenspan"], ["Fed 2006–2014", "Ben Bernanke"], ["Fed 2014–2018", "Janet Yellen"], ["Bundesbank 1980–1991", "Karl Otto Pöhl"],
    ["Bundesbank 1993–1999", "Hans Tietmeyer"], ["Bundesbank 2011–2021", "Jens Weidmann"] ] },

  { q: "Wie heißt die Krise oder das Ereignis?", type: "choice", items: [
    ["Spekulation mit Blumenzwiebeln in Holland", "Tulpenmanie", ["Tulpenkrise", "Tulpenblase"]], ["Englische Spekulationsblase von 1720", "Südseeblase", ["South Sea Bubble"]],
    ["Börsencrash im Oktober 1929", "Schwarzer Freitag", ["Schwarzer Donnerstag", "Black Tuesday", "Weltwirtschaftskrise"]],
    ["Völlige Geldentwertung 1923 in Deutschland", "Hyperinflation"], ["Ölpreisschock 1973", "Ölkrise"], ["Ende der Goldbindung des Dollars 1971", "Nixon-Schock"],
    ["Japans Stagnation nach 1990", "Verlorenes Jahrzehnt", ["Lost Decade"]], ["Absturz der Internetaktien um 2000", "Dotcom-Blase", ["Dotcom-Krise", "New Economy"]],
    ["Auslöser 2007: faule US-Hypotheken", "Subprime-Krise", ["Finanzkrise", "Immobilienkrise", "Subprime"]], ["Schuldenkrise ab 2010 in der Währungsunion", "Eurokrise", ["Staatsschuldenkrise"]] ] },

  { q: "Wirtschaftsgeschichte: In welchem Jahrzehnt war das?", type: "decade", items: [
    ["Gründung der Niederländischen Ostindien-Kompanie", 1600], ["Tulpenmanie", 1630], ["Gründerkrach", 1870], ["Konferenz von Bretton Woods", 1940],
    ["Nixon beendet die Goldbindung des Dollars", 1970], ["„Schwarzer Montag“ an der Wall Street", 1980], ["Gründung der Welthandelsorganisation WTO", 1990],
    ["Asienkrise", 1990], ["Platzen der Dotcom-Blase", 2000], ["Beginn der Eurokrise", 2010] ] },

  { q: "Wofür steht die Abkürzung?", hint: "Institutionen", type: "choice", items: [
    ["EZB", "Europäische Zentralbank"], ["IWF", "Internationaler Währungsfonds"], ["WTO", "Welthandelsorganisation", ["World Trade Organization"]],
    ["OECD", "Organisation für wirtschaftliche Zusammenarbeit und Entwicklung", ["Organisation for Economic Co-operation and Development"]],
    ["OPEC", "Organisation erdölexportierender Länder", ["Organization of the Petroleum Exporting Countries"]], ["BaFin", "Bundesanstalt für Finanzdienstleistungsaufsicht"],
    ["Fed", "Federal Reserve", ["Federal Reserve System"]], ["ESM", "Europäischer Stabilitätsmechanismus"], ["DIW", "Deutsches Institut für Wirtschaftsforschung"],
    ["BIZ", "Bank für Internationalen Zahlungsausgleich"] ] },

  { q: "In welcher Stadt sitzt das?", type: "choice", items: [
    ["Internationaler Währungsfonds", "Washington", ["Washington, D.C."]], ["Welthandelsorganisation", "Genf"], ["OECD", "Paris"], ["OPEC", "Wien"],
    ["Bank für Internationalen Zahlungsausgleich", "Basel"], ["Europäische Zentralbank", "Frankfurt am Main", ["Frankfurt"]], ["Europäische Investitionsbank", "Luxemburg"],
    ["Jahrestreffen des Weltwirtschaftsforums", "Davos"], ["Bank of England", "London"], ["Bundeskartellamt", "Bonn"] ] },

  { q: "Liegt der Hauptsitz in Frankfurt am Main?", type: "tf", items: [
    ["Europäische Zentralbank", true], ["Deutsche Bundesbank", true], ["Deutsche Bank", true], ["Commerzbank", true], ["DZ Bank", true],
    ["KfW", true], ["Allianz", false], ["Deutsche Telekom", false], ["Bundeskartellamt", false], ["ifo Institut", false] ] },

  { q: "Ist das Land Mitglied der G20?", type: "tf", items: [
    ["Indien", true], ["Brasilien", true], ["Südafrika", true], ["Saudi-Arabien", true], ["Türkei", true],
    ["Argentinien", true], ["Schweiz", false], ["Spanien", false], ["Niederlande", false], ["Norwegen", false] ] },

  { q: "Ordne die Volkswirtschaften nach BIP.", hint: "nominal, Stand 2024 – 1 = größte", type: "rank", items: [
    ["USA", 1], ["China", 2], ["Deutschland", 3], ["Japan", 4], ["Großbritannien", 5],
    ["Frankreich", 6], ["Italien", 7], ["Spanien", 8], ["Schweiz", 9], ["Österreich", 10] ] },

  { q: "Sozial- und Wirtschaftspolitik: In welchem Jahrzehnt?", type: "decade", items: [
    ["Bismarcks Krankenversicherung", 1880], ["Gesetzliche Rentenversicherung", 1880], ["Arbeitslosenversicherung", 1920], ["Kindergeldgesetz", 1950],
    ["Gründung des Bundeskartellamts", 1950], ["Gründung der Treuhandanstalt", 1990], ["Einführung des Solidaritätszuschlags", 1990],
    ["Einführung der Pflegeversicherung", 1990], ["Hartz IV tritt in Kraft", 2000], ["Schuldenbremse kommt ins Grundgesetz", 2000] ] },

  { q: "Wer ist gemeint?", hint: "Deutsche Wirtschaftsgeschichte", type: "choice", names: true, items: [
    ["Gründer der ländlichen Genossenschaftsbanken", "Friedrich Wilhelm Raiffeisen"], ["Gründervater der Volksbanken", "Hermann Schulze-Delitzsch", ["Schulze-Delitzsch"]],
    ["„Kanonenkönig“ aus Essen", "Alfred Krupp"], ["Gründer der AEG", "Emil Rathenau"], ["Gründer der Firma für Zündkerzen und Elektrotechnik aus Stuttgart", "Robert Bosch"],
    ["Erfinder des Dynamos und Konzerngründer", "Werner von Siemens", ["Siemens"]], ["Nationalökonom, Vordenker des Zollvereins", "Friedrich List"],
    ["Optik-Unternehmer aus Jena", "Carl Zeiss"], ["Erfinder des Backpulvers „Backin“", "August Oetker"], ["Treuhand-Chef, 1991 ermordet", "Detlev Karsten Rohwedder"] ] },

  // ===================== BWL & Unternehmen =====================
  { q: "Wofür steht die Abkürzung?", hint: "BWL", type: "choice", items: [
    ["EBIT", "Earnings Before Interest and Taxes"], ["ROI", "Return on Investment"], ["KPI", "Key Performance Indicator"],
    ["GmbH", "Gesellschaft mit beschränkter Haftung"], ["IPO", "Initial Public Offering", ["Börsengang"]], ["B2B", "Business to Business", ["Business-to-Business"]],
    ["USP", "Unique Selling Proposition", ["Unique Selling Point", "Alleinstellungsmerkmal"]], ["CEO", "Chief Executive Officer"],
    ["GuV", "Gewinn- und Verlustrechnung"], ["HGB", "Handelsgesetzbuch"] ] },

  { q: "Welche Rechtsform ist gemeint?", type: "choice", items: [
    ["Haftung nur mit dem Stammkapital von mind. 25.000 €", "GmbH"], ["„Mini-GmbH“ ab 1 € Stammkapital", "UG", ["UG (haftungsbeschränkt)", "Unternehmergesellschaft"]],
    ["Ihre Anteile können an der Börse gehandelt werden", "AG", ["Aktiengesellschaft"]], ["Zwei Personen tun sich ohne Formalitäten zusammen", "GbR", ["Gesellschaft bürgerlichen Rechts"]],
    ["Handelsgesellschaft, alle haften voll", "OHG", ["Offene Handelsgesellschaft"]], ["Ein Vollhafter, mehrere Teilhafter", "KG", ["Kommanditgesellschaft"]],
    ["KG, deren Vollhafter eine GmbH ist", "GmbH & Co. KG", ["GmbH und Co KG"]], ["Einzelunternehmer im Handelsregister", "e. K.", ["eK", "eingetragener Kaufmann"]],
    ["Mitglieder fördern sich gegenseitig, z. B. Volksbanken", "eG", ["Genossenschaft", "eingetragene Genossenschaft"]], ["Europäische Aktiengesellschaft", "SE", ["Societas Europaea"]] ] },

  { q: "BWL in Zahlen", type: "num", items: [
    ["Mindeststammkapital einer GmbH (€)", 25000], ["Mindestgrundkapital einer AG (€)", 50000], ["Mindeststammkapital einer UG (€)", 1],
    ["Regelsatz der Umsatzsteuer in Deutschland (%)", 19], ["Ermäßigter Umsatzsteuersatz (%)", 7], ["Körperschaftsteuersatz in Deutschland (%)", 15],
    ["Pareto-Prinzip: Ergebnis-Anteil in % mit 20 % Aufwand", 80], ["„P“s im klassischen Marketing-Mix", 4], ["Wettbewerbskräfte nach Porter", 5], ["Felder der BCG-Matrix", 4] ] },

  { q: "Hat das Unternehmen seinen Hauptsitz in Deutschland?", type: "tf", items: [
    ["SAP", true], ["Siemens", true], ["Allianz", true], ["BASF", true], ["Bosch", true], ["Lidl", true],
    ["Nestlé", false], ["Unilever", false], ["Philips", false], ["Airbus", false] ] },

  { q: "Zu welchem Konzern gehört die Marke?", type: "choice", items: [
    ["YouTube", "Google", ["Alphabet"]], ["KitKat (außerhalb der USA)", "Nestlé"], ["Dove", "Unilever"], ["Gillette", "Procter & Gamble", ["P&G", "Procter and Gamble"]],
    ["Louis Vuitton", "LVMH"], ["Mini", "BMW"], ["Jeep", "Stellantis"], ["LinkedIn", "Microsoft"], ["Persil (in Deutschland)", "Henkel"], ["Nivea", "Beiersdorf"] ] },

  { q: "In welchem Jahrzehnt wurde das Unternehmen gegründet?", type: "decade", items: [
    ["Siemens", 1840], ["BASF", 1860], ["Deutsche Bank", 1870], ["Bosch", 1880], ["McKinsey", 1920],
    ["SAP", 1970], ["Apple", 1970], ["Nvidia", 1990], ["Tesla", 2000], ["OpenAI", 2010] ] },

  { q: "Welches Management-Konzept ist gemeint?", type: "choice", items: [
    ["20 % Aufwand bringen 80 % Ergebnis", "Pareto-Prinzip", ["80/20-Regel", "Paretoprinzip"]], ["Ständige Verbesserung in kleinen Schritten", "Kaizen", ["KVP"]],
    ["Lieferung genau zum Bedarfszeitpunkt", "Just-in-time", ["JIT", "Just in time"]], ["Plan, Do, Check, Act", "PDCA-Zyklus", ["PDCA", "Deming-Kreis", "Demingkreis"]],
    ["Aufgaben nach wichtig und dringend sortieren", "Eisenhower-Matrix", ["Eisenhower-Prinzip"]], ["Spezifisch, messbar, attraktiv, realistisch, terminiert", "SMART", ["SMART-Formel", "SMART-Ziele"]],
    ["Schlanke Produktion nach Toyota-Vorbild", "Lean Management", ["Lean Production", "Lean"]], ["Bedürfnispyramide", "Maslow", ["Maslowsche Bedürfnispyramide", "Maslow-Pyramide"]],
    ["Fünfmal nachfragen, um die Ursache zu finden", "5-Why-Methode", ["5 Why", "Five Whys", "5-Why"]], ["Ziele mit messbaren Schlüsselergebnissen", "OKR", ["Objectives and Key Results"]] ] },

  // ===================== Rechnungswesen & Finanzen =====================
  { q: "Steht das auf der Aktivseite der Bilanz?", type: "tf", items: [
    ["Maschinen", true], ["Gebäude", true], ["Forderungen", true], ["Kassenbestand", true], ["Vorräte", true],
    ["Patente", true], ["Eigenkapital", false], ["Bankdarlehen", false], ["Rückstellungen", false], ["Verbindlichkeiten aus Lieferungen", false] ] },

  { q: "Wie heißt die Kennzahl?", type: "choice", items: [
    ["Gewinn im Verhältnis zum Eigenkapital", "Eigenkapitalrendite", ["ROE", "Return on Equity"]], ["Gewinn im Verhältnis zum Umsatz", "Umsatzrendite", ["Return on Sales", "ROS"]],
    ["Eigenkapital im Verhältnis zur Bilanzsumme", "Eigenkapitalquote", ["EK-Quote"]], ["Gewinn vor Zinsen, Steuern und Abschreibungen", "EBITDA"],
    ["Aktienkurs geteilt durch Gewinn je Aktie", "KGV", ["Kurs-Gewinn-Verhältnis", "P/E"]], ["Umlaufvermögen geteilt durch kurzfristige Schulden", "Current Ratio", ["Liquidität 3. Grades", "Liquiditätsgrad"]],
    ["Kosten, die unabhängig von der Menge anfallen", "Fixkosten"], ["Absatzmenge, ab der man Gewinn macht", "Break-even-Point", ["Break-even", "Gewinnschwelle"]],
    ["Preis minus variable Stückkosten", "Deckungsbeitrag", ["DB"]], ["Zinssatz, bei dem der Kapitalwert null ist", "Interner Zinsfuß", ["IRR", "interne Verzinsung"]] ] },

  { q: "Börsenbegriffe: Wie heißt …?", type: "choice", items: [
    ["… ein steigender Markt?", "Bullenmarkt", ["Bulle", "Hausse"]], ["… ein fallender Markt?", "Bärenmarkt", ["Bär", "Baisse"]], ["… der Verkauf geliehener Aktien?", "Leerverkauf", ["Short", "Shorten"]],
    ["… die Gewinnausschüttung an Aktionäre?", "Dividende"], ["… die erstmalige Börsennotierung?", "Börsengang", ["IPO"]], ["… Kurs mal Anzahl der Aktien?", "Marktkapitalisierung", ["Börsenwert"]],
    ["… ein börsengehandelter Indexfonds?", "ETF", ["Exchange Traded Fund"]], ["… die Schwankungsbreite eines Kurses?", "Volatilität"],
    ["… die Absicherung gegen Kursrisiken?", "Hedging", ["Absicherung"]], ["… eine Schuldverschreibung des Staates?", "Staatsanleihe", ["Bundesanleihe", "Anleihe"]] ] },

  { q: "Wie heißt der Aktienindex?", type: "choice", items: [
    ["Deutschland, 40 Werte", "DAX"], ["USA, 30 Industrie-Werte", "Dow Jones", ["Dow"]], ["Japan", "Nikkei", ["Nikkei 225"]], ["Großbritannien", "FTSE 100", ["FTSE"]],
    ["Frankreich", "CAC 40", ["CAC"]], ["Schweiz", "SMI"], ["Hongkong", "Hang Seng"], ["Eurozone, 50 Werte", "Euro Stoxx 50", ["Euro Stoxx", "EuroStoxx"]],
    ["Österreich", "ATX"], ["USA, 500 Werte", "S&P 500", ["S&P", "SP500"]] ] },

  { q: "Börse in Zahlen", type: "num", items: [
    ["Werte im DAX", 40], ["Werte im Dow Jones", 30], ["Werte im CAC", 40], ["Werte im Nikkei", 225], ["Werte im S&P", 500],
    ["Werte im Euro Stoxx", 50], ["Werte im MDAX", 50], ["Werte im SDAX", 70], ["Werte im SMI", 20], ["Startwert des DAX (1987)", 1000] ] },

  { q: "Ist das eine Kryptowährung?", type: "tf", items: [
    ["Bitcoin", true], ["Ether", true], ["Dogecoin", true], ["Litecoin", true], ["Solana", true], ["XRP", true],
    ["Klarna", false], ["PayPal", false], ["Revolut", false], ["Visa", false] ] },

  { q: "Wirtschaft in Deutschland – schätze!", hint: "Stand 2024 – Einheit steht dabei", type: "estimate", tol: 0.15, items: [
    ["Bruttoinlandsprodukt (Billionen €)", 4.3], ["Erwerbstätige (Mio.)", 46], ["Warenexporte (Billionen €)", 1.56], ["Anteil am BIP der EU (%)", 24],
    ["Ausgaben im Bundeshaushalt (Mrd. €)", 477], ["Gesetzlicher Mindestlohn (€ pro Stunde)", 12.41], ["Staatsschuldenquote (% des BIP)", 63],
    ["Inflationsrate 2023 (%)", 5.9], ["Inflationsrate 2024 (%)", 2.2], ["BIP der USA zum Vergleich (Billionen $)", 29] ] },

  { q: "Historische Wirtschaftszahlen – schätze!", hint: "Einheit steht dabei", type: "estimate", tol: 0.1, items: [
    ["D-Mark pro Euro (fester Umrechnungskurs)", 1.96], ["Mehrwertsteuer bei Einführung 1968 (%)", 10], ["Rekord-Ölpreis 2008 ($ pro Barrel)", 147],
    ["Höchste Arbeitslosenzahl in Deutschland, 2005 (Mio.)", 5.2], ["Euro-Kurs zum Start 1999 ($)", 1.18], ["Euro-Tiefstand im Jahr 2000 ($)", 0.82],
    ["US-Leitzins auf dem Höhepunkt 1981 (%)", 20], ["Tiefster EZB-Einlagesatz (%)", -0.5], ["Arbeitslosenquote der USA 1933 (%)", 25],
    ["Länder, die 1999 den Euro einführten", 11] ] },

  // ===================== Consulting =====================
  { q: "Gehört die Firma zu den „Big Four“ der Wirtschaftsprüfung?", type: "tf", items: [
    ["Deloitte", true], ["PwC", true], ["EY", true], ["KPMG", true], ["McKinsey", false],
    ["BCG", false], ["Bain", false], ["Accenture", false], ["Roland Berger", false], ["Arthur Andersen", false] ] },

  { q: "Welche Beratung ist gemeint?", type: "choice", items: [
    ["1967 in München gegründet", "Roland Berger"], ["1926 von einem Professor für Rechnungswesen in Chicago gegründet", "McKinsey", ["McKinsey & Company"]],
    ["Erfand die Wachstums-Marktanteils-Matrix", "BCG", ["Boston Consulting Group"]], ["1973 von Ex-BCG-Leuten in Boston gegründet", "Bain", ["Bain & Company"]],
    ["Ging aus der Beratungssparte von Arthur Andersen hervor", "Accenture", ["Andersen Consulting"]], ["Gilt als älteste Unternehmensberatung der Welt (1886)", "Arthur D. Little", ["ADL"]],
    ["Bonner Beratung, spezialisiert auf Preisgestaltung", "Simon-Kucher", ["Simon-Kucher & Partners"]], ["Kürzel für McKinsey, BCG und Bain", "MBB"],
    ["Steht für Klynveld, Peat, Marwick, Goerdeler", "KPMG"], ["Entstand 1998 aus Price Waterhouse und Coopers & Lybrand", "PwC", ["PricewaterhouseCoopers"]] ] },

  { q: "Welches Framework ist gemeint?", type: "choice", items: [
    ["BCG-Matrix: hoher Marktanteil, hohes Wachstum", "Star", ["Stars"]], ["BCG-Matrix: hoher Marktanteil, geringes Wachstum", "Cash Cow", ["Cash Cows", "Milchkuh"]],
    ["BCG-Matrix: geringer Marktanteil, hohes Wachstum", "Question Mark", ["Fragezeichen", "Question Marks"]], ["BCG-Matrix: geringer Marktanteil, geringes Wachstum", "Poor Dog", ["Dog", "Dogs", "armer Hund"]],
    ["Stärken, Schwächen, Chancen, Risiken", "SWOT", ["SWOT-Analyse"]], ["Politisch, ökonomisch, sozial, technologisch, ökologisch, rechtlich", "PESTEL", ["PESTLE", "PEST"]],
    ["Überschneidungsfrei und vollständig gliedern", "MECE"], ["Rivalität, neue Anbieter, Ersatzprodukte, Lieferanten- und Kundenmacht", "Five Forces", ["Porter's Five Forces", "Fünf Kräfte"]],
    ["Product, Price, Place, Promotion", "Marketing-Mix", ["4P", "4 Ps"]], ["Wer ist responsible, accountable, consulted, informed?", "RACI", ["RACI-Matrix"]] ] },

  { q: "Wie heißt der Begriff aus der Beraterwelt?", type: "choice", items: [
    ["Schnell erzielbare Erfolge", "Quick Wins", ["Quick Win"]], ["Präsentation in der Länge einer Aufzugsfahrt", "Elevator Pitch"],
    ["Kernaussage zuerst, Begründung darunter (Minto)", "Pyramidenprinzip", ["Pyramid Principle", "Minto-Pyramide"]], ["Schleichende Ausweitung des Projektumfangs", "Scope Creep"],
    ["Vereinbartes Arbeitsergebnis für den Kunden", "Deliverable", ["Deliverables"]], ["Auftakttreffen zum Projektstart", "Kick-off", ["Kickoff"]],
    ["Satz oben auf der Folie mit der Kernbotschaft", "Action Title", ["Headline", "Action Titel"]], ["Gremium, das das Projekt lenkt", "Steering Committee", ["SteerCo", "Lenkungsausschuss"]],
    ["Grobe Rechnung ohne exakte Daten", "Back-of-the-envelope", ["Überschlagsrechnung", "Fermi-Schätzung", "Back of the envelope"]],
    ["Hypothese, die man zuerst prüft", "Initial Hypothesis", ["Ausgangshypothese", "Hypothese", "Day-One-Hypothese"]] ] },

  { q: "Wie heißt das Diagramm?", type: "choice", items: [
    ["Zeigt den Weg vom Start- zum Endwert über Zu- und Abgänge", "Wasserfalldiagramm", ["Wasserfall", "Waterfall"]],
    ["Balken absteigend sortiert, dazu eine kumulierte Linie", "Pareto-Diagramm"], ["Ursachen als Gräten eines Fisches", "Ishikawa-Diagramm", ["Fischgrätendiagramm", "Ishikawa"]],
    ["Zeitplan mit Balken für Aufgaben", "Gantt-Diagramm", ["Gantt"]], ["Ganzes in Tortenstücken", "Kreisdiagramm", ["Tortendiagramm", "Pie Chart"]],
    ["Balkenbreite und -höhe zeigen zwei Anteile zugleich", "Marimekko", ["Mekko", "Mosaikdiagramm"]], ["Wertepaare als Punkte auf zwei Achsen", "Streudiagramm", ["Scatterplot", "Punktdiagramm"]],
    ["Flüsse als unterschiedlich dicke Bänder", "Sankey-Diagramm", ["Sankey"]], ["Werte als Farbintensität in einer Tabelle", "Heatmap"],
    ["Mehrere Achsen sternförmig um einen Mittelpunkt", "Netzdiagramm", ["Radardiagramm", "Spinnennetzdiagramm", "Radar Chart"]] ] },

  // ===================== Wirtschaftsinformatik =====================
  { q: "Wofür steht die Abkürzung?", hint: "Wirtschaftsinformatik", type: "choice", items: [
    ["ERP", "Enterprise Resource Planning"], ["CRM", "Customer Relationship Management"], ["SaaS", "Software as a Service"],
    ["API", "Application Programming Interface"], ["SQL", "Structured Query Language"], ["BPMN", "Business Process Model and Notation"],
    ["ETL", "Extract, Transform, Load"], ["UML", "Unified Modeling Language"], ["SLA", "Service Level Agreement"], ["DSGVO", "Datenschutz-Grundverordnung"] ] },

  { q: "Ist das ein ERP-System?", type: "tf", items: [
    ["SAP S/4HANA", true], ["Microsoft Dynamics 365", true], ["Oracle NetSuite", true], ["Odoo", true], ["Infor M3", true],
    ["Sage X3", true], ["Salesforce", false], ["Jira", false], ["Slack", false], ["Tableau", false] ] },

  { q: "Ordne die IT-Meilensteine zeitlich.", hint: "1 = am frühesten", type: "rank", items: [
    ["ENIAC", 1], ["COBOL", 2], ["ARPANET", 3], ["Relationales Datenmodell von Codd", 4], ["VisiCalc (erste Tabellenkalkulation)", 5],
    ["Microsoft Excel", 6], ["SAP R/3", 7], ["Java", 8], ["Agiles Manifest", 9], ["Amazon Web Services", 10] ] },

  { q: "Scrum: Wie heißt …?", type: "choice", items: [
    ["… eine Iteration von meist 2–4 Wochen?", "Sprint"], ["… das tägliche 15-Minuten-Treffen?", "Daily Scrum", ["Daily", "Stand-up", "Daily Stand-up"]],
    ["… die Rolle, die das Backlog verantwortet?", "Product Owner", ["PO"]], ["… die Rolle, die das Team coacht?", "Scrum Master"],
    ["… die priorisierte Liste aller Anforderungen?", "Product Backlog", ["Backlog"]], ["… der Rückblick auf die Zusammenarbeit?", "Retrospektive", ["Retro", "Sprint Retrospective"]],
    ["… die Vorstellung der Ergebnisse am Sprintende?", "Sprint Review", ["Review"]], ["… eine Anforderung im Format „Als … möchte ich …“?", "User Story", ["Story"]],
    ["… das Schätzen mit Zahlenkarten?", "Planning Poker"], ["… die gemeinsamen Fertig-Kriterien?", "Definition of Done", ["DoD"]] ] },

  { q: "Ist das ein Datenbanksystem?", type: "tf", items: [
    ["MySQL", true], ["PostgreSQL", true], ["Oracle Database", true], ["MongoDB", true], ["SQLite", true],
    ["SAP HANA", true], ["Excel", false], ["Python", false], ["Kubernetes", false], ["Git", false] ] },

  { q: "Welches IT-Konzept ist gemeint?", type: "choice", items: [
    ["Tabellen zerlegen, um Redundanz zu vermeiden", "Normalisierung"], ["Rechenleistung und Speicher übers Internet mieten", "Cloud Computing", ["Cloud"]],
    ["Software-Roboter übernehmen Klickarbeit", "RPA", ["Robotic Process Automation"]], ["Digitales Abbild einer echten Maschine", "Digitaler Zwilling", ["Digital Twin"]],
    ["Fälschungssichere, verteilte Datenkette", "Blockchain"], ["Entwicklung und Betrieb verschmelzen", "DevOps"], ["Kleine, unabhängig deploybare Dienste", "Microservices"],
    ["Zentrale, aufbereitete Datenbasis für Analysen", "Data Warehouse"], ["Sammelbecken für Rohdaten aller Art", "Data Lake"],
    ["Anmeldung mit Passwort plus zweitem Merkmal", "Zwei-Faktor-Authentifizierung", ["2FA", "MFA", "Mehr-Faktor-Authentifizierung"]] ] },

  { q: "IT in Zahlen", type: "num", items: [
    ["Normalform, die man meist mindestens anstrebt", 3], ["Eigenschaften nach ACID", 4], ["Schichten im OSI-Modell", 7],
    ["HTTP-Status „Nicht gefunden“", 404], ["HTTP-Status „Interner Serverfehler“", 500], ["HTTP-Status „OK“", 200],
    ["Standard-Port für HTTPS", 443], ["Standard-Port für HTTP", 80], ["Werte im Agilen Manifest", 4], ["Prinzipien im Agilen Manifest", 12] ] },

].map((c) => ({ ...c, set: "wirtschaft" })));
