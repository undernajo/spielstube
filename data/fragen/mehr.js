// Erweiterung der kleinen Fragen-Sets (Film & Serien, Weihnachten & Winter, Emoji & Flaggen, Kindheit der 2000er, Südtirol).
// Ohne Überschneidung mit den vorhandenen Karten; nur Antworten, die eindeutig und gut belegt sind.

// ===================== Film & Serien =====================
window.SCHLAU10_CARDS.push(...[

  { q: "Wer führte Regie?", hint: "Teil 2", type: "choice", names: true, items: [
    ["Barbie (2023)", "Greta Gerwig"], ["Gladiator", "Ridley Scott"], ["Das Leben ist schön", "Roberto Benigni"], ["Oppenheimer", "Christopher Nolan"],
    ["Forrest Gump", "Robert Zemeckis"], ["Parasite", "Bong Joon-ho", ["Bong Joon Ho", "Bong"]], ["La La Land", "Damien Chazelle"],
    ["Braveheart", "Mel Gibson"], ["Der mit dem Wolf tanzt", "Kevin Costner"], ["Good Bye, Lenin!", "Wolfgang Becker"] ] },

  { q: "Welcher Disney- oder Pixar-Film ist gemeint?", type: "choice", items: [
    ["Ein kleiner Roboter räumt die verlassene Erde auf", "WALL·E", ["WALL-E", "Wall E", "Walle"]], ["Ein Junge gerät am Día de los Muertos ins Totenreich", "Coco"],
    ["Monster erschrecken Kinder, um Energie zu gewinnen", "Die Monster AG", ["Monster AG"]], ["Ein Mädchen segelt mit dem Halbgott Maui aufs Meer hinaus", "Vaiana", ["Moana"]],
    ["Die Familie Madrigal lebt in einem magischen Haus", "Encanto"], ["Eine junge Frau verkleidet sich als Mann und zieht in den Krieg", "Mulan"],
    ["Eine Prinzessin mit extrem langen Haaren und der Dieb Flynn Rider", "Rapunzel – Neu verföhnt", ["Rapunzel"]],
    ["Eine Häsin und ein Fuchs lösen einen Fall in einer Tiermetropole", "Zoomania", ["Zootopia"]],
    ["Eine junge Frau im Schloss eines verwunschenen Prinzen mit sprechenden Möbeln", "Die Schöne und das Biest", ["Schöne und das Biest"]],
    ["Ein Straßenjunge findet eine Wunderlampe mit einem Dschinni", "Aladdin"] ] },

  { q: "Ist das ein Film von Christopher Nolan?", type: "tf", items: [
    ["Inception", true], ["Interstellar", true], ["The Dark Knight", true], ["Memento", true], ["Dunkirk", true], ["Tenet", true], ["Oppenheimer", true],
    ["Avatar – Aufbruch nach Pandora", false], ["Matrix", false], ["Gravity", false] ] },

  { q: "Ist das eine Zeichentrickserie?", type: "tf", items: [
    ["Die Simpsons", true], ["Family Guy", true], ["South Park", true], ["Futurama", true], ["BoJack Horseman", true], ["Rick and Morty", true],
    ["Friends", false], ["Seinfeld", false], ["Breaking Bad", false], ["Lost", false] ] },

  { q: "Welche Fernsehsendung ist gemeint?", type: "choice", items: [
    ["Sonntagskrimi im Ersten seit 1970, mit Ermittlern in vielen Städten", "Tatort"], ["Ein Schäferhund ermittelt mit der Wiener Kriminalpolizei", "Kommissar Rex"],
    ["ZDF-Serie auf einem Kreuzfahrtschiff, seit 1981", "Das Traumschiff", ["Traumschiff"]], ["Arztserie der 80er mit Professor Brinkmann", "Die Schwarzwaldklinik", ["Schwarzwaldklinik"]],
    ["Der Arzt Martin Gruber praktiziert in Tirol", "Der Bergdoktor", ["Bergdoktor"]], ["Nonnen streiten mit Bürgermeister Wöller", "Um Himmels Willen"],
    ["Promis werden mit versteckter Kamera hereingelegt", "Verstehen Sie Spaß?", ["Verstehen Sie Spass"]], ["Landwirte suchen im Fernsehen die große Liebe", "Bauer sucht Frau"],
    ["Zuschauer helfen der Polizei bei der Fahndung – erfunden von Eduard Zimmermann", "Aktenzeichen XY … ungelöst", ["Aktenzeichen XY", "Aktenzeichen XY ungelöst"]],
    ["Kommissar Benno Berghammer ermittelt in Oberbayern", "Der Bulle von Tölz", ["Bulle von Tölz"]] ] },

  { q: "In welchem Jahrzehnt kam der Film ins Kino?", hint: "Teil 2", type: "decade", items: [
    ["Der Zauberer von Oz", 1930], ["Sissi", 1950], ["Frühstück bei Tiffany", 1960], ["Der weiße Hai", 1970], ["Top Gun", 1980],
    ["Pulp Fiction", 1990], ["Gladiator", 2000], ["Mamma Mia!", 2000], ["Inception", 2010], ["Joker (mit Joaquin Phoenix)", 2010] ] },

  { q: "Ordne die Pixar-Filme nach Kinostart.", hint: "1 = am frühesten", type: "rank", items: [
    ["Toy Story", 1], ["Das große Krabbeln", 2], ["Toy Story 2", 3], ["Die Monster AG", 4], ["Findet Nemo", 5], ["Die Unglaublichen", 6],
    ["Cars", 7], ["Ratatouille", 8], ["WALL·E", 9], ["Oben", 10] ] },

  { q: "Ordne die Marvel-Filme nach Kinostart.", hint: "1 = am frühesten", type: "rank", items: [
    ["Iron Man", 1], ["Der unglaubliche Hulk", 2], ["Iron Man 2", 3], ["Thor", 4], ["Captain America: The First Avenger", 5], ["Marvel's The Avengers", 6],
    ["Guardians of the Galaxy", 7], ["Black Panther", 8], ["Avengers: Infinity War", 9], ["Avengers: Endgame", 10] ] },

  { q: "Film & Serien in Zahlen", hint: "Teil 2", type: "num", items: [
    ["Oscars für „Die Rückkehr des Königs“", 11], ["Staffeln von „How I Met Your Mother“", 9], ["Staffeln von „The Big Bang Theory“", 12],
    ["Hunde im Titel des Disney-Films „… Dalmatiner“", 101], ["Kinder der Familie von Trapp in „Meine Lieder – meine Träume“", 7], ["Gauner in „Ocean's Eleven“", 11],
    ["Staffeln von „Squid Game“", 3], ["Revolverhelden in „Die glorreichen Sieben“", 7], ["Staffeln von „Die Sopranos“", 6], ["Folgen von „Game of Thrones“", 73] ] },

  { q: "Aus welchem Film stammt der Song?", type: "choice", items: [
    ["„My Heart Will Go On“", "Titanic"], ["„Let It Go“", "Die Eiskönigin", ["Eiskönigin", "Frozen"]], ["„Circle of Life“", "Der König der Löwen", ["König der Löwen"]],
    ["„(I've Had) The Time of My Life“", "Dirty Dancing"], ["„Eye of the Tiger“", "Rocky III", ["Rocky 3", "Rocky"]], ["„Shallow“", "A Star Is Born"],
    ["„Stayin' Alive“", "Saturday Night Fever", ["Nur Samstag Nacht"]], ["„I Will Always Love You“", "Bodyguard", ["The Bodyguard"]],
    ["„Take My Breath Away“", "Top Gun"], ["„Happy“ (Pharrell Williams)", "Ich – Einfach unverbesserlich 2", ["Ich einfach unverbesserlich", "Despicable Me 2"]] ] },

  { q: "Spielt die Serie in New York?", type: "tf", items: [
    ["Friends", true], ["Sex and the City", true], ["Seinfeld", true], ["How I Met Your Mother", true], ["Gossip Girl", true],
    ["The Big Bang Theory", false], ["Breaking Bad", false], ["Grey's Anatomy", false], ["Two and a Half Men", false], ["Desperate Housewives", false] ] },

  { q: "Wer spielte die Rolle?", hint: "Teil 2", type: "choice", names: true, items: [
    ["Mr. Bean", "Rowan Atkinson"], ["Edward mit den Scherenhänden", "Johnny Depp"], ["Mary Poppins (1964)", "Julie Andrews"], ["Pippi Langstrumpf (1969)", "Inger Nilsson"],
    ["Holly Golightly in „Frühstück bei Tiffany“", "Audrey Hepburn"], ["Sissi", "Romy Schneider"], ["Mrs. Doubtfire", "Robin Williams"],
    ["Hans Landa in „Inglourious Basterds“", "Christoph Waltz"], ["Barbie (2023)", "Margot Robbie"], ["Amélie in „Die fabelhafte Welt der Amélie“", "Audrey Tautou"] ] },

  { q: "Wie heißt …?", hint: "Film-Allerlei", type: "choice", items: [
    ["… der Hund von Wallace?", "Gromit"], ["… die Frau von Shrek?", "Fiona", ["Prinzessin Fiona"]], ["… der Hund von Doc Brown in „Zurück in die Zukunft“?", "Einstein"],
    ["… die Eule von Harry Potter?", "Hedwig"], ["… die Stadt von Batman?", "Gotham City", ["Gotham"]], ["… der Hai in „Findet Nemo“, der keine Fische mehr fressen will?", "Bruce"],
    ["… das Krokodil, das bei Peter Pan einen Wecker verschluckt hat?", "Tick-Tack", ["Tick Tack", "Ticktack"]],
    ["… der Volleyball, mit dem Tom Hanks in „Cast Away“ spricht?", "Wilson"], ["… Rapunzels Chamäleon?", "Pascal"], ["… Woodys Pferd in „Toy Story“?", "Bullseye"] ] },

  { q: "Ist das ein Film von Studio Ghibli?", type: "tf", items: [
    ["Mein Nachbar Totoro", true], ["Prinzessin Mononoke", true], ["Das wandelnde Schloss", true], ["Kikis kleiner Lieferservice", true], ["Ponyo", true],
    ["Chihiros Reise ins Zauberland", true], ["Akira", false], ["Your Name", false], ["Pokémon – Der Film", false], ["Ghost in the Shell", false] ] },

  { q: "Aus welcher Serie stammt der Spruch?", type: "choice", items: [
    ["„Winter is coming.“", "Game of Thrones"], ["„How you doin'?“", "Friends"], ["„Legen… wait for it… där!“", "How I Met Your Mother", ["HIMYM"]],
    ["„Bazinga!“", "The Big Bang Theory", ["Big Bang Theory"]], ["„I am the one who knocks.“", "Breaking Bad"], ["„D'oh!“", "Die Simpsons", ["Simpsons"]],
    ["„Everybody lies.“", "Dr. House", ["House"]], ["„That's what she said.“", "The Office"], ["„This is the way.“", "The Mandalorian", ["Mandalorian"]],
    ["„Energie!“ (Captain Picard)", "Star Trek: Das nächste Jahrhundert", ["Star Trek", "Raumschiff Enterprise"]] ] },

  { q: "Welcher Film ist gemeint?", hint: "Teil 2", type: "choice", items: [
    ["Ein Riesengorilla klettert auf das Empire State Building", "King Kong"], ["Ein Hochstapler gibt sich als Pilot, Arzt und Anwalt aus", "Catch Me If You Can"],
    ["Ein Kindermädchen schwebt mit dem Regenschirm herbei", "Mary Poppins"], ["Zwei Musiker verkleiden sich als Frauen und fliehen vor der Mafia", "Manche mögen's heiß", ["Manche mögens heiß"]],
    ["Ein Mann wird als Greis geboren und altert rückwärts", "Der seltsame Fall des Benjamin Button", ["Benjamin Button"]],
    ["Ein Junge wünscht sich, groß zu sein, und wacht als Erwachsener auf", "Big"], ["Ein Taxifahrer in New York: „You talkin' to me?“", "Taxi Driver"],
    ["Ein kleines Schwein will Hütehund werden", "Ein Schweinchen namens Babe", ["Babe"]],
    ["Ein Paar lässt sich die Erinnerungen aneinander löschen", "Vergiss mein nicht!", ["Eternal Sunshine of the Spotless Mind", "Vergiss mein nicht"]],
    ["Ein Anwalt kann einen ganzen Tag lang nicht lügen", "Der Dummschwätzer", ["Liar Liar"]] ] },

  { q: "Stammt der Schauspieler / die Schauspielerin aus Österreich?", type: "tf", items: [
    ["Christoph Waltz", true], ["Arnold Schwarzenegger", true], ["Romy Schneider", true], ["Hedy Lamarr", true], ["Klaus Maria Brandauer", true], ["Josef Hader", true],
    ["Til Schweiger", false], ["Diane Kruger", false], ["Daniel Brühl", false], ["Bruno Ganz", false] ] },

  { q: "Wie heißt der Disney-Bösewicht?", type: "choice", items: [
    ["Dornröschen", "Malefiz", ["Maleficent"]], ["Schneewittchen", "Die böse Königin", ["Böse Königin", "Königin"]], ["Das Dschungelbuch", "Shir Khan", ["Shere Khan"]],
    ["Rapunzel – Neu verföhnt", "Mutter Gothel", ["Gothel"]], ["Die Eiskönigin", "Hans", ["Prinz Hans"]], ["Der Glöckner von Notre Dame", "Frollo", ["Richter Frollo"]],
    ["Hercules", "Hades"], ["Pocahontas", "Ratcliffe", ["Gouverneur Ratcliffe"]], ["Mulan", "Shan-Yu", ["Shan Yu"]], ["Die Schöne und das Biest", "Gaston"] ] },

  { q: "In welchem Jahrzehnt startete die Serie?", hint: "Teil 2", type: "decade", items: [
    ["Bonanza", 1950], ["Die Simpsons", 1980], ["Magnum", 1980], ["Emergency Room", 1990], ["Sex and the City", 1990],
    ["Desperate Housewives", 2000], ["The Big Bang Theory", 2000], ["Peaky Blinders", 2010], ["The Crown", 2010], ["Bridgerton", 2020] ] },

  { q: "Ist das eine Netflix-Eigenproduktion?", type: "tf", items: [
    ["Stranger Things", true], ["Squid Game", true], ["Dark", true], ["The Crown", true], ["Bridgerton", true], ["Narcos", true],
    ["Game of Thrones", false], ["Breaking Bad", false], ["The Mandalorian", false], ["The Boys", false] ] },

].map((c) => ({ ...c, set: "film" })));

// ===================== Weihnachten & Winter =====================
window.SCHLAU10_CARDS.push(...[

  { q: "Wo findet das Wintersport-Ereignis statt?", type: "choice", items: [
    ["Hahnenkammrennen auf der Streif", "Kitzbühel"], ["Lauberhorn-Abfahrt", "Wengen"], ["Neujahrsspringen der Vierschanzentournee", "Garmisch-Partenkirchen", ["Garmisch"]],
    ["Weltcup-Abfahrt auf der Saslong", "Gröden", ["Val Gardena", "St. Christina", "Wolkenstein"]], ["Riesenslalom auf der Gran Risa", "Alta Badia", ["La Villa", "Stern"]],
    ["Nachtslalom „Nightrace“ auf der Planai", "Schladming"], ["Auftakt der Vierschanzentournee", "Oberstdorf"], ["Skisprung-Klassiker am Holmenkollen", "Oslo"],
    ["Biathlon-Weltcup in Südtirol", "Antholz", ["Antholzer Tal", "Rasen-Antholz"]], ["Dreikönigsspringen zum Abschluss der Tournee", "Bischofshofen"] ] },

  { q: "Stimmt das?", hint: "Winterwissen", type: "tf", items: [
    ["Auf der Nordhalbkugel beginnt der Winter um den 21. Dezember.", true], ["Wasser gefriert bei 0 °C.", true],
    ["Schnee besteht aus durchsichtigem Eis – weiß wirkt er nur durch das gestreute Licht.", true], ["Polarlichter im Norden heißen auch Aurora borealis.", true],
    ["Am Nordpol geht im Winter wochenlang die Sonne nicht auf.", true], ["Die tiefste je gemessene Lufttemperatur wurde in der Antarktis gemessen.", true],
    ["Eisbären leben am Südpol.", false], ["Salzwasser gefriert schneller als Süßwasser.", false],
    ["Murmeltiere halten nur Winterruhe und wachen zum Fressen auf.", false], ["Igel fressen während des Winterschlafs regelmäßig.", false] ] },

  { q: "Wie heißt der Brauch?", hint: "Winter & Jahreswechsel", type: "choice", items: [
    ["Wilde Gestalten mit Holzmasken ziehen zur Rauhnachtszeit durchs Dorf", "Perchtenlauf", ["Perchten", "Perchtenläufe"]],
    ["Kinder ziehen als Könige verkleidet von Haus zu Haus und schreiben C+M+B an die Tür", "Sternsingen", ["Sternsinger"]],
    ["Am 4. Dezember geschnittene Zweige sollen bis Weihnachten blühen", "Barbarazweige", ["Barbarazweig"]],
    ["Die Nächte zwischen Weihnachten und Dreikönig", "Rauhnächte", ["Raunächte", "Rauhnacht"]], ["Mädchen mit Kerzenkranz auf dem Kopf am 13. Dezember in Schweden", "Luciafest", ["Lucia", "Luciatag"]],
    ["Figuren von Maria, Josef, Ochs und Esel im Stall", "Krippe", ["Weihnachtskrippe"]], ["Man beschenkt heimlich eine zugeloste Person", "Wichteln"],
    ["Silvester-Sketch, in dem ein Butler für vier abwesende Gäste trinkt", "Dinner for One"], ["Fest am 2. Februar, 40 Tage nach Weihnachten", "Mariä Lichtmess", ["Lichtmess"]],
    ["Französischer Weihnachtskuchen in Form eines Baumstamms", "Bûche de Noël", ["Buche de Noel", "Bûche"]] ] },

  { q: "Winter in Zahlen", hint: "Teil 2", type: "num", items: [
    ["Spieler einer Eishockeymannschaft gleichzeitig auf dem Eis (mit Torwart)", 6], ["Drittel in einem Eishockeyspiel", 3], ["Minuten pro Eishockey-Drittel", 20],
    ["Personen in einem Viererbob", 4], ["Durchgänge im Slalom", 2], ["Springer pro Mannschaft im Team-Skispringen", 4],
    ["Olympische Winterspiele in Italien (bis einschließlich 2026)", 3], ["Jahre zwischen zwei Olympischen Winterspielen", 4], ["Schießeinlagen im Biathlon-Massenstart", 4], ["Datum des Dreikönigstags im Januar", 6] ] },

  { q: "Welche Wintersport-Größe ist gemeint?", hint: "Teil 2", type: "choice", names: true, items: [
    ["Biathletin aus Wallgau, 2010 zweimal Olympiasiegerin", "Magdalena Neuner"], ["Biathletin, 2018 zweimal Olympiasiegerin in Pyeongchang", "Laura Dahlmeier"],
    ["Eiskunstläuferin aus der DDR, Olympiasiegerin 1984 und 1988", "Katarina Witt"], ["Skispringer aus dem Erzgebirge, Olympiasieger 1984 und 1994", "Jens Weißflog", ["Weissflog"]],
    ["Schwede mit 86 Weltcupsiegen im Slalom und Riesenslalom", "Ingemar Stenmark"], ["Finnischer Skisprung-Star der 80er", "Matti Nykänen", ["Nykanen"]],
    ["Norwegische Langläuferin mit 15 Olympiamedaillen", "Marit Bjørgen", ["Bjorgen", "Björgen"]], ["Snowboarder mit roten Haaren, „Flying Tomato“", "Shaun White"],
    ["Bayerischer Rennrodler, „Hackl Schorsch“", "Georg Hackl"], ["Italienerin aus Bergamo, Abfahrts-Olympiasiegerin 2018", "Sofia Goggia"] ] },

  { q: "Liegt das Skigebiet in Österreich?", type: "tf", items: [
    ["Obergurgl", true], ["Mayrhofen", true], ["Schladming", true], ["Saalbach", true], ["St. Anton am Arlberg", true], ["Lech", true],
    ["Zermatt", false], ["Davos", false], ["Cortina d'Ampezzo", false], ["Garmisch-Partenkirchen", false] ] },

  { q: "Was ist gemeint?", hint: "Winterliche Genüsse", type: "choice", items: [
    ["Heißer, gewürzter Rotwein", "Glühwein"], ["Glühwein, über dem ein mit Rum getränkter Zuckerhut brennt", "Feuerzangenbowle"],
    ["Geschmolzener Käse wird auf Kartoffeln geschabt", "Raclette"], ["Schweizer Kartoffelgericht, flach und knusprig gebraten", "Rösti"],
    ["Traditioneller Braten am Martinstag", "Martinsgans", ["Gans", "Gänsebraten"]], ["Karamellisierte Nüsse vom Weihnachtsmarkt", "Gebrannte Mandeln", ["Gebrannte Nüsse"]],
    ["Heiße Esskastanien vom Stand", "Maroni", ["Maronen", "Kastanien", "Keschtn"]], ["Schwedischer Glühwein mit Mandeln und Rosinen", "Glögg"],
    ["Zerrissener, süßer Pfannkuchen aus Österreich", "Kaiserschmarrn", ["Kaiserschmarren"]], ["Heißes Getränk aus Rum, Zucker und heißem Wasser", "Grog"] ] },

  { q: "Ordne die Olympischen Winterspiele zeitlich.", hint: "1 = am frühesten", type: "rank", items: [
    ["Chamonix", 1], ["Garmisch-Partenkirchen", 2], ["Squaw Valley", 3], ["Grenoble", 4], ["Sarajevo", 5], ["Calgary", 6], ["Albertville", 7],
    ["Nagano", 8], ["Turin", 9], ["Sotschi", 10] ] },

  { q: "Spielt der Film zu Weihnachten?", type: "tf", items: [
    ["Stirb langsam", true], ["Kevin – Allein zu Haus", true], ["Tatsächlich… Liebe", true], ["Der Polarexpress", true], ["Gremlins", true], ["Ist das Leben nicht schön?", true],
    ["Titanic", false], ["Der weiße Hai", false], ["Dirty Dancing", false], ["Grease", false] ] },

  { q: "Welches Tier ist gemeint?", hint: "Winter in den Bergen und im Norden", type: "choice", items: [
    ["Wechselt im Winter sein Fell von braun zu weiß, lange Ohren", "Schneehase"], ["Hühnervogel der Alpen, im Winter schneeweiß", "Schneehuhn", ["Alpenschneehuhn"]],
    ["Wildziege mit großen, gebogenen Hörnern", "Steinbock"], ["Hirschart mit Geweih bei Männchen und Weibchen, lebt in Lappland", "Rentier", ["Ren"]],
    ["Weißer Fuchs der Arktis", "Polarfuchs", ["Eisfuchs"]], ["Hält Winterschlaf im Bau und warnt mit einem Pfiff", "Murmeltier"],
    ["Schläft den Winter kopfüber in Höhlen", "Fledermaus"], ["Großes Robbentier mit langen Stoßzähnen", "Walross"],
    ["Legt im Herbst Nussvorräte an", "Eichhörnchen"], ["Kletterkünstlerin mit hakenförmigen Hörnern, im Winter mit dunklem Fell", "Gämse", ["Gams", "Gemse"]] ] },

  { q: "In welchem Land liegt der Wintersportort?", type: "choice", items: [
    ["Zermatt", "Schweiz"], ["St. Moritz", "Schweiz"], ["Cortina d'Ampezzo", "Italien"], ["Chamonix", "Frankreich"], ["Val d'Isère", "Frankreich"],
    ["Lillehammer", "Norwegen"], ["Whistler", "Kanada"], ["Aspen", "USA", ["Vereinigte Staaten"]], ["Zakopane", "Polen"], ["Åre", "Schweden"] ] },

  { q: "In welchem Jahrzehnt war das?", hint: "Wintersport", type: "decade", items: [
    ["Erste Olympische Winterspiele in Chamonix", 1920], ["Olympische Winterspiele in Garmisch-Partenkirchen", 1930], ["Erste Vierschanzentournee", 1950],
    ["Olympische Winterspiele in Squaw Valley", 1960], ["Olympische Winterspiele in Sapporo", 1970], ["„Wunder auf dem Eis“: USA schlagen die Sowjetunion im Eishockey", 1980],
    ["Hermann Maiers Sturzflug und Doppel-Gold in Nagano", 1990], ["Olympische Winterspiele in Turin", 2000], ["Olympische Winterspiele in Sotschi", 2010],
    ["Olympische Winterspiele in Mailand und Cortina", 2020] ] },

  { q: "Welche Weihnachtsleckerei ist gemeint?", hint: "Teil 2", type: "choice", items: [
    ["Sternförmiger Hefekuchen aus Verona, ohne Rosinen", "Pandoro"], ["Südtiroler Früchtebrot mit Feigen, Nüssen und Rosinen", "Zelten"],
    ["Süßigkeit aus Honig, Eiweiß und Mandeln", "Torrone", ["Nougat", "Türkischer Honig"]], ["Neapolitanische Teigkügelchen, frittiert und mit Honig überzogen", "Struffoli"],
    ["Flacher Gewürzkuchen aus Siena mit Nüssen und kandierten Früchten", "Panforte"], ["Österreichisches Früchtebrot mit getrockneten Birnen", "Kletzenbrot"],
    ["Mürbteigkuchen mit Teiggitter und Ribiselmarmelade", "Linzer Torte"], ["Im Ofen gebackene Frucht, gefüllt mit Nüssen und Zimt", "Bratapfel", ["Bratäpfel"]],
    ["Gebäck mit Mandelblättchen und Schokoladenboden", "Florentiner"], ["Frankfurter Marzipankugeln mit drei Mandelhälften", "Bethmännchen"] ] },

  { q: "Ist das ein Brauch zu Silvester oder Neujahr?", type: "tf", items: [
    ["Blei- oder Wachsgießen", true], ["„Dinner for One“ im Fernsehen", true], ["Glücksschweinchen verschenken", true], ["Feuerwerk um Mitternacht", true],
    ["In Italien Linsen mit Cotechino essen", true], ["In Italien rote Unterwäsche tragen", true],
    ["Ostereier suchen", false], ["Den Maibaum aufstellen", false], ["Laternen basteln für den Martinsumzug", false], ["Kürbisse schnitzen", false] ] },

  { q: "Wie heißt das?", hint: "Rund um Schnee und Skifahren", type: "choice", items: [
    ["Gespurte Bahn für Langläufer", "Loipe"], ["Wird gegen Glätte auf Straßen gestreut", "Streusalz", ["Salz"]], ["Kettenfahrzeug, das die Pisten präpariert", "Pistenbully", ["Pistenraupe", "Pistengerät"]],
    ["Überhängender Schneerand an einem Grat", "Wechte", ["Schneewechte", "Wächte"]], ["Regen gefriert auf kaltem Boden zu einer Eisschicht", "Glatteis"],
    ["Feiern nach dem Skitag", "Après-Ski", ["Apres-Ski", "Apres Ski", "Après Ski"]], ["Lift, der Skifahrer über den Schnee zieht", "Schlepplift"],
    ["Skifahren im Tiefschnee abseits der Pisten", "Freeriden", ["Freeride", "Variantenfahren", "Tiefschneefahren"]],
    ["Schnee aus Schneekanonen", "Kunstschnee", ["Technischer Schnee"]], ["Breite Gestelle unter den Schuhen, um im Tiefschnee nicht einzusinken", "Schneeschuhe", ["Schneeschuh"]] ] },

].map((c) => ({ ...c, set: "winter" })));

// ===================== Emoji & Flaggen =====================
window.SCHLAU10_CARDS.push(...[

  { q: "Welches Land hat diese Flagge?", hint: "Europa – Teil 2", emoji: true, type: "choice", items: [
    ["🇧🇬", "Bulgarien"], ["🇸🇮", "Slowenien"], ["🇱🇻", "Lettland"], ["🇲🇹", "Malta"], ["🇺🇦", "Ukraine"],
    ["🇩🇰", "Dänemark"], ["🇧🇪", "Belgien"], ["🇬🇪", "Georgien"], ["🇦🇲", "Armenien"], ["🇽🇰", "Kosovo"] ] },

  { q: "Welches Land hat diese Flagge?", hint: "Amerika – Teil 2", emoji: true, type: "choice", items: [
    ["🇧🇷", "Brasilien"], ["🇧🇴", "Bolivien"], ["🇪🇨", "Ecuador"], ["🇵🇾", "Paraguay"], ["🇵🇦", "Panama"],
    ["🇩🇴", "Dominikanische Republik", ["Dominikanische Rep."]], ["🇬🇹", "Guatemala"], ["🇭🇳", "Honduras"], ["🇧🇸", "Bahamas"], ["🇹🇹", "Trinidad und Tobago", ["Trinidad"]] ] },

  { q: "Welches Land hat diese Flagge?", hint: "Asien – Teil 2", emoji: true, type: "choice", items: [
    ["🇯🇵", "Japan"], ["🇨🇳", "China"], ["🇵🇰", "Pakistan"], ["🇧🇩", "Bangladesch"], ["🇲🇾", "Malaysia"],
    ["🇮🇷", "Iran"], ["🇮🇶", "Irak"], ["🇦🇪", "Vereinigte Arabische Emirate", ["VAE", "Emirate"]], ["🇶🇦", "Katar"], ["🇮🇱", "Israel"] ] },

  { q: "Welches Land hat diese Flagge?", hint: "Afrika – Teil 2", emoji: true, type: "choice", items: [
    ["🇸🇳", "Senegal"], ["🇨🇲", "Kamerun"], ["🇨🇮", "Elfenbeinküste", ["Côte d'Ivoire", "Cote d'Ivoire"]], ["🇹🇿", "Tansania"], ["🇺🇬", "Uganda"],
    ["🇷🇼", "Ruanda"], ["🇳🇦", "Namibia"], ["🇿🇼", "Simbabwe"], ["🇩🇿", "Algerien"], ["🇲🇬", "Madagaskar"] ] },

  { q: "Welcher Film ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🐠🔍", "Findet Nemo"], ["🔨⚡👑", "Thor"], ["🦍🏙️✈️", "King Kong"], ["🏃🍫📦", "Forrest Gump"], ["🧞🪔🐒", "Aladdin"],
    ["🦇🃏🌃", "Batman", ["The Dark Knight"]], ["🐼🥋", "Kung Fu Panda"], ["🚗⚡⏰", "Zurück in die Zukunft"], ["🧸🍯🐝", "Winnie Puuh", ["Winnie Pooh", "Winnie the Pooh"]],
    ["🤠🐍🏺", "Indiana Jones"] ] },

  { q: "Welches Kinderlied ist das?", emoji: true, type: "choice", items: [
    ["🦆🦆🦆💦", "Alle meine Entchen"], ["🦊🪿🏃", "Fuchs, du hast die Gans gestohlen", ["Fuchs du hast die Gans gestohlen"]], ["🐦🐦🐦👋", "Alle Vögel sind schon da"],
    ["⭐⭐⭐❓", "Weißt du, wie viel Sternlein stehen", ["Weißt du wie viel Sternlein stehen"]], ["👦🎒🌍", "Hänschen klein"],
    ["🍄🧍🌲", "Ein Männlein steht im Walde"], ["🎂👩‍🍳📣", "Backe, backe Kuchen", ["Backe backe Kuchen"]], ["👨‍🦲🔔😴", "Bruder Jakob"],
    ["🐝🐝🐝", "Summ, summ, summ", ["Summ summ summ"]], ["🏇👶🕳️", "Hoppe, hoppe, Reiter", ["Hoppe hoppe Reiter"]] ] },

  { q: "Welches Sprichwort ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🍎🌳⬇️", "Der Apfel fällt nicht weit vom Stamm"], ["🌅🐦🪱", "Der frühe Vogel fängt den Wurm"], ["⛏️🕳️🫵⬇️", "Wer anderen eine Grube gräbt, fällt selbst hinein"],
    ["👨‍🍳👨‍🍳👨‍🍳🥣🤢", "Viele Köche verderben den Brei"], ["🌅🪙👄", "Morgenstund hat Gold im Mund"], ["🔁🏆", "Übung macht den Meister"],
    ["🤥🦵", "Lügen haben kurze Beine"], ["🔚👍", "Ende gut, alles gut"], ["🐕🗣️🚫🦷", "Hunde, die bellen, beißen nicht"], ["🚦🏋️", "Aller Anfang ist schwer"] ] },

  { q: "Welcher Beruf ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🔥🚒", "Feuerwehrmann", ["Feuerwehrfrau", "Feuerwehr"]], ["🎨🖌️🖼️", "Maler", ["Malerin", "Künstler"]], ["🍳🍽️👨‍🍳", "Koch", ["Köchin"]],
    ["🔧🚗", "Mechaniker", ["Automechaniker", "Kfz-Mechaniker", "Mechatroniker"]], ["⚖️🔨🧑‍⚖️", "Richter", ["Richterin"]], ["🪚🪵🪑", "Tischler", ["Schreiner"]],
    ["🐝🍯", "Imker", ["Imkerin"]], ["🍇🍷", "Winzer", ["Winzerin", "Weinbauer"]], ["💐🌷", "Florist", ["Floristin", "Blumenhändler"]], ["⛪🙏", "Pfarrer", ["Priester", "Pastor"]] ] },

  { q: "Welches Land ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🌮🌵🎺", "Mexiko"], ["🛺🍛🐘", "Indien"], ["🍁🏒🫎", "Kanada"], ["🐫🏜️🔺", "Ägypten"], ["🥝🐑🏉", "Neuseeland"],
    ["🍫🧇🍟", "Belgien"], ["🏔️🌊🛶", "Norwegen"], ["💃🥩⚽", "Argentinien"], ["🎻🍰⛷️", "Österreich"], ["🏛️🫒⛵", "Griechenland"] ] },

  { q: "Welches Wort ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🦁🦷", "Löwenzahn"], ["👂🐛", "Ohrwurm"], ["🔥🍐", "Glühbirne"], ["✋👞", "Handschuh"], ["🏠🐈", "Hauskatze"],
    ["🔑🕳️", "Schlüsselloch"], ["🌧️🧥", "Regenmantel"], ["☀️👓", "Sonnenbrille"], ["🍓🎂", "Erdbeertorte", ["Erdbeerkuchen"]], ["👆🎩", "Fingerhut"] ] },

  { q: "Welches Tier ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🌊🦁", "Seelöwe"], ["🥱🐾", "Faultier"], ["🤢🐾", "Stinktier"], ["👃📯", "Nashorn"], ["🏞️🐴", "Nilpferd", ["Flusspferd"]],
    ["👄🤾", "Maulwurf"], ["🔥🐛", "Glühwürmchen"], ["🌊🦔", "Seeigel"], ["1️⃣0️⃣0️⃣0️⃣🦶", "Tausendfüßer", ["Tausendfüßler"]], ["🧼🐻", "Waschbär"] ] },

  { q: "Welche Sportart ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🏃🏃🏃🏃🔁", "Staffellauf", ["Staffel"]], ["⛵🌬️", "Segeln"], ["🐎🧱", "Springreiten"], ["🏊🤽", "Wasserball"], ["🪂🏔️", "Paragliding", ["Gleitschirmfliegen"]],
    ["🤼🍚🇯🇵", "Sumo", ["Sumoringen"]], ["🎯🍺", "Darts", ["Dart"]], ["🚴⛰️", "Mountainbiken", ["Mountainbike"]], ["⛸️💃", "Eiskunstlauf", ["Eiskunstlaufen"]],
    ["🏍️🏁", "Motorradrennen", ["MotoGP", "Motorradsport"]] ] },

  { q: "Welches Märchen ist das?", hint: "Teil 2", emoji: true, type: "choice", items: [
    ["🌾🪙🔥🕺", "Rumpelstilzchen"], ["🐺🐐7️⃣", "Der Wolf und die sieben Geißlein", ["Wolf und die sieben Geißlein", "Die sieben Geißlein"]],
    ["👸🛏️🫛", "Die Prinzessin auf der Erbse", ["Prinzessin auf der Erbse"]], ["🦆😢🦢", "Das hässliche Entlein", ["Hässliche Entlein"]],
    ["⚪🌹🐻", "Schneeweißchen und Rosenrot", ["Schneeweisschen und Rosenrot"]], ["🎣🐟👵🏰", "Vom Fischer und seiner Frau", ["Der Fischer und seine Frau"]],
    ["🍽️🐐🪵", "Tischlein deck dich", ["Tischlein, deck dich"]], ["🥣🌊🏘️", "Der süße Brei", ["Süße Brei"]],
    ["🧑🪙🐄🪨", "Hans im Glück"], ["👑🩲👀", "Des Kaisers neue Kleider"] ] },

  { q: "Ist das eine echte Automarke?", type: "tf", items: [
    ["Škoda", true], ["Seat", true], ["Lancia", true], ["Dacia", true], ["Cupra", true], ["Lada", true],
    ["Bratzo", false], ["Vellini", false], ["Autobello", false], ["Trivento", false] ] },

  { q: "Ist das ein Gericht aus Italien?", type: "tf", items: [
    ["Ossobuco", true], ["Saltimbocca", true], ["Vitello tonnato", true], ["Arancini", true], ["Risotto alla milanese", true],
    ["Moussaka", false], ["Gulasch", false], ["Bigos", false], ["Ratatouille", false], ["Shepherd's Pie", false] ] },

].map((c) => ({ ...c, set: "emoji" })));

// ===================== Kindheit der 2000er =====================
window.SCHLAU10_CARDS.push(...[

  { q: "Welche Zeichentrickserie ist gemeint?", type: "choice", items: [
    ["Drei Schwestern mit Superkräften aus Chemikalie X", "Die Powerpuff Girls", ["Powerpuff Girls"]], ["Ein Junge hat die Feenpaten Cosmo und Wanda", "Cosmo & Wanda", ["Cosmo und Wanda"]],
    ["Kinder-Geheimorganisation im Baumhaus", "Codename: Kids Next Door", ["Kids Next Door"]], ["Kleiner Forscher mit geheimem Labor und Schwester Dee Dee", "Dexters Labor", ["Dexter"]],
    ["Ein Hund, der vor allem Angst hat", "Courage, der feige Hund", ["Courage"]], ["Drei Agentinnen: Sam, Clover und Alex", "Totally Spies"],
    ["Teenagerin rettet die Welt, mit Ron Stoppable an ihrer Seite", "Kim Possible"], ["Drei Jungs, die alle fast gleich heißen", "Ed, Edd n Eddy", ["Ed Edd und Eddy"]],
    ["Junges Genie mit Roboterhund Goddard", "Jimmy Neutron"], ["Baby Tommy Pickles und seine Freunde", "Rugrats", ["Die Rugrats"]] ] },

  { q: "War das ein Spiel für den Game Boy (Color/Advance)?", type: "tf", items: [
    ["Pokémon Rot", true], ["Tetris", true], ["Super Mario Land", true], ["Zelda: Link's Awakening", true], ["Mario Kart: Super Circuit", true], ["Kirby's Dream Land", true],
    ["Wii Sports", false], ["Nintendogs", false], ["Super Mario 64", false], ["Halo", false] ] },

  { q: "Wer singt das?", hint: "Hits der 2000er – Teil 2", type: "choice", items: [
    ["Oops!… I Did It Again", "Britney Spears"], ["In da Club", "50 Cent"], ["Bad Day", "Daniel Powter"], ["Seven Nation Army", "The White Stripes", ["White Stripes"]],
    ["Complicated", "Avril Lavigne"], ["Viva la Vida", "Coldplay"], ["Durch den Monsun", "Tokio Hotel"], ["Vom selben Stern", "Ich + Ich", ["Ich und Ich", "Ich & Ich"]],
    ["Bleeding Love", "Leona Lewis"], ["Wenn das Liebe ist", "Glashaus"] ] },

  { q: "Ordne die Pokémon-Editionen nach Erscheinen.", hint: "1 = am frühesten", type: "rank", items: [
    ["Rot & Blau", 1], ["Gelb", 2], ["Gold & Silber", 3], ["Kristall", 4], ["Rubin & Saphir", 5], ["Feuerrot & Blattgrün", 6],
    ["Diamant & Perl", 7], ["Platin", 8], ["HeartGold & SoulSilver", 9], ["Schwarz & Weiß", 10] ] },

  { q: "Welche Fernsehshow ist gemeint?", hint: "2000er", type: "choice", items: [
    ["Castingshow, aus der die No Angels hervorgingen", "Popstars"], ["Bewohner im Container, die Zuschauer wählen sie hinaus", "Big Brother"],
    ["Promis rasen in Woks den Eiskanal hinunter", "Wok-WM", ["TV total Wok-WM", "Wok WM"]], ["Ein Kandidat tritt in vielen Spielen gegen Stefan Raab an", "Schlag den Raab"],
    ["Dieter Bohlen sucht in der Jury einen Gesangsstar", "Deutschland sucht den Superstar", ["DSDS"]], ["Katharina Saalfrank hilft Familien bei der Erziehung", "Die Super Nanny", ["Super Nanny", "Supernanny"]],
    ["Zwei Mütter tauschen für zehn Tage die Familie", "Frauentausch"], ["Kandidaten bekochen sich gegenseitig und vergeben Punkte", "Das perfekte Dinner", ["Perfekte Dinner"]],
    ["Sketch-Comedy mit Anke Engelke", "Ladykracher"], ["Comedy-Show mit Bully, Rick Kavanian und Christian Tramitz", "Bullyparade"] ] },

  { q: "In welchem Jahr war das?", hint: "2000er – Teil 2", type: "num", items: [
    ["Der erste iPod kommt auf den Markt", 2001], ["Euro-Münzen und -Scheine werden eingeführt", 2002], ["Die Concorde fliegt zum letzten Mal", 2003],
    ["Facebook wird gegründet", 2004], ["Joseph Ratzinger wird Papst Benedikt XVI.", 2005], ["Pluto verliert seinen Status als Planet", 2006],
    ["Das erste iPhone wird vorgestellt", 2007], ["Barack Obama wird zum US-Präsidenten gewählt", 2008], ["Michael Jackson stirbt", 2009], ["Wikipedia geht online", 2001] ] },

  { q: "Wie heißt das Spiel?", hint: "Teil 2", type: "choice", items: [
    ["Online-Rollenspiel in der Welt Azeroth", "World of Warcraft", ["WoW"]], ["Terroristen gegen Anti-Terror-Einheit am PC", "Counter-Strike", ["Counterstrike", "CS"]],
    ["Leben in einem Dorf mit Tieren als Nachbarn", "Animal Crossing"], ["Mario sammelt Sterne zwischen Planeten (Wii)", "Super Mario Galaxy", ["Mario Galaxy"]],
    ["Rennspiel mit Bananenschalen und blauen Panzern", "Mario Kart"], ["Blauer Igel von Sega", "Sonic", ["Sonic the Hedgehog"]],
    ["Rockstar spielen mit Gitarren-Controller und bunten Knöpfen", "Guitar Hero"], ["Bauernhof-Spiel auf Facebook", "FarmVille", ["Farmville"]],
    ["Fußballspiel von EA Sports, jedes Jahr neu", "FIFA", ["EA FC", "EA Sports FC"]], ["Ein Professor und sein Lehrling lösen Rätsel (DS)", "Professor Layton", ["Layton"]] ] },

  { q: "Welches Spielzeug ist gemeint?", hint: "Teil 2", type: "choice", items: [
    ["Puppen mit großen Köpfen, Konkurrenz für Barbie", "Bratz"], ["Mini-Skateboards für die Finger", "Tech Deck", ["Fingerboard", "Fingerskateboard"]],
    ["Turnschuhe mit Rolle in der Ferse", "Heelys"], ["Zusammenklappbarer Tretroller aus Alu", "Cityroller", ["Roller", "Scooter", "Tretroller"]],
    ["Bunte Ponys mit langer Mähne", "My Little Pony"], ["Leuchtstäbe, die man zum Leuchten knickt", "Knicklichter", ["Knicklicht"]],
    ["Wasserpistole mit Pumpe", "Super Soaker"], ["Doppelkegel, der auf einer Schnur zwischen zwei Stäben tanzt", "Diabolo"],
    ["Sammelfiguren: kleine Haustiere mit großen Köpfen", "Littlest Pet Shop"], ["Realistische Tierfiguren aus Kunststoff von einer schwäbischen Firma", "Schleich", ["Schleich-Tiere"]] ] },

  { q: "Gab es die Spielkonsole schon vor 2005?", type: "tf", items: [
    ["PlayStation 2", true], ["Game Boy Advance", true], ["GameCube", true], ["Xbox", true], ["Nintendo 64", true], ["Dreamcast", true],
    ["Wii", false], ["Xbox 360", false], ["PlayStation 3", false], ["Nintendo Switch", false] ] },

  { q: "Welches Buch oder Hörspiel ist gemeint?", hint: "Teil 2", type: "choice", items: [
    ["Tim, Karl, Klößchen und Gaby lösen Fälle", "TKKG"], ["Vier Kinder und Hund Timmy erleben Abenteuer", "Fünf Freunde"],
    ["Eine Hexe und ihre Freundin reiten auf dem Martinshof", "Bibi und Tina", ["Bibi & Tina"]], ["Ein kleiner Drache von der Dracheninsel", "Der kleine Drache Kokosnuss", ["Drache Kokosnuss"]],
    ["Vampirjunge Rüdiger freundet sich mit Anton an", "Der kleine Vampir"], ["Ein Mädchen findet ein Hexenbuch und kann zaubern", "Hexe Lilli"],
    ["Ein freches Wesen mit Wunschpunkten im Gesicht", "Das Sams", ["Sams"]], ["Gruselbücher von R. L. Stine", "Gänsehaut", ["Goosebumps"]],
    ["Die Brüder Jonathan und Karl in Nangijala", "Die Brüder Löwenherz", ["Brüder Löwenherz"]], ["Tiger und Bär suchen das Land ihrer Träume", "Oh, wie schön ist Panama", ["Oh wie schön ist Panama"]] ] },

  { q: "2000er in Zahlen", hint: "Teil 2", type: "num", items: [
    ["Mitglieder der No Angels bei der Gründung", 5], ["Mitglieder von Tokio Hotel", 4], ["Teletubbies", 4], ["Kinder bei den „Fünf Freunden“ (ohne Hund)", 4],
    ["Neue Pokémon in der zweiten Generation", 100], ["Staffeln von „Phineas und Ferb“", 4], ["Knöpfe beim Game Boy (ohne Steuerkreuz)", 4],
    ["Bildschirme beim Nintendo DS", 2], ["Schuljahre in Hogwarts", 7], ["Bücher der „Tribute von Panem“-Trilogie", 3] ] },

  { q: "Kam der Film vor 2005 ins Kino?", type: "tf", items: [
    ["Shrek", true], ["Ice Age", true], ["Fluch der Karibik", true], ["Harry Potter und der Stein der Weisen", true], ["Der Schuh des Manitu", true], ["Lilo & Stitch", true],
    ["Kung Fu Panda", false], ["Madagascar", false], ["Twilight – Biss zum Morgengrauen", false], ["Ich – Einfach unverbesserlich", false] ] },

  { q: "Technik der 2000er: Was ist gemeint?", type: "choice", items: [
    ["Programm von Apple, um Musik auf den iPod zu laden", "iTunes"], ["MP3-Player von Apple mit Klickrad", "iPod"], ["Kleiner Datenspeicher am Schlüsselbund", "USB-Stick", ["USB Stick"]],
    ["Tragbare Spielkonsole von Sony", "PSP", ["PlayStation Portable"]], ["Schnelles Internet über die Telefonleitung", "DSL"],
    ["Musik-Tauschbörse, die 2001 gerichtlich gestoppt wurde", "Napster"], ["Dateiformat für komprimierte Musik", "MP3"],
    ["Animation, die startet, wenn der Computer länger nicht benutzt wird", "Bildschirmschoner"], ["Sprechende Büroklammer in Word", "Karl Klammer", ["Clippy"]],
    ["Kleine Speicherkarte für Digitalkameras", "SD-Karte", ["SD Karte", "Speicherkarte"]] ] },

  { q: "Fußball der 2000er: Wer ist gemeint?", type: "choice", names: true, items: [
    ["Deutscher Torwart, „Titan“, bester Spieler der WM 2002", "Oliver Kahn"], ["Brasilianischer Stürmer, Weltmeister und WM-Torschützenkönig 2002", "Ronaldo", ["Ronaldo Nazário"]],
    ["Kapitän der deutschen Mannschaft bei der WM 2006", "Michael Ballack"], ["„Il Pupone“, Kapitän der AS Rom", "Francesco Totti"],
    ["Englischer Star mit präzisen Freistößen, 2003 zu Real Madrid", "David Beckham"], ["Brasilianer mit breitem Lächeln, Weltfußballer 2004 und 2005", "Ronaldinho"],
    ["Italienischer Spielmacher, verwandelte im WM-Finale 2006 den ersten Elfmeter", "Andrea Pirlo"], ["Portugiese, 2003 von Sporting zu Manchester United", "Cristiano Ronaldo", ["CR7"]],
    ["„Poldi“, Nationalspieler aus Köln", "Lukas Podolski"], ["Schwedischer Stürmer, ab 2004 bei Juventus Turin", "Zlatan Ibrahimović", ["Ibrahimovic", "Zlatan"]] ] },

  { q: "Stimmt das?", hint: "Die 2000er", type: "tf", items: [
    ["Der Euro wurde 2002 als Bargeld eingeführt.", true], ["Das erste iPhone kam 2007.", true], ["Pluto verlor 2006 seinen Planetenstatus.", true],
    ["Tokio Hotel stammen aus der Gegend um Magdeburg.", true], ["Facebook ist älter als YouTube.", true], ["Der siebte Harry-Potter-Band erschien 2007.", true],
    ["Wikipedia ist älter als Google.", false], ["Die Fußball-WM 2006 gewann Frankreich.", false], ["Nokia ist ein japanisches Unternehmen.", false],
    ["Die erste Staffel von DSDS gewann Daniel Küblböck.", false] ] },

].map((c) => ({ ...c, set: "kindheit" })));

// ===================== Südtirol =====================
window.SCHLAU10_CARDS.push(...[

  { q: "In welcher Gemeinde steht das Kloster / die Kirche?", type: "choice", items: [
    ["Augustiner-Chorherrenstift Neustift", "Vahrn"], ["Kloster Säben", "Klausen"], ["Benediktinerabtei Marienberg", "Mals", ["Burgeis"]],
    ["Benediktinerkloster Muri-Gries", "Bozen"], ["Dom Mariä Himmelfahrt mit Kreuzgang und Hofburg", "Brixen"], ["St. Prokulus mit sehr alten Fresken", "Naturns"],
    ["St. Johann in Ranui vor den Geislerspitzen", "Villnöß", ["Funes"]], ["Wallfahrtskirche Maria Weißenstein", "Deutschnofen"],
    ["Ruine des Klosters Sonnenburg", "St. Lorenzen", ["Sankt Lorenzen"]], ["Wallfahrtsort Maria Trens", "Freienfeld"] ] },

  { q: "Gibt es diese Bahn in Südtirol?", type: "tf", items: [
    ["Rittner Seilbahn", true], ["Mendelbahn", true], ["Seilbahn Meran 2000", true], ["Kohlerer Seilbahn", true], ["Vinschgaubahn", true], ["Pustertalbahn", true],
    ["Zugspitzbahn", false], ["Nordkettenbahn", false], ["Gornergratbahn", false], ["Hungerburgbahn", false] ] },

  { q: "In welchem Ort ist das Museum?", type: "choice", items: [
    ["Südtiroler Archäologiemuseum (Ötzi)", "Bozen"], ["Touriseum bei Schloss Trauttmansdorff", "Meran"], ["Volkskundemuseum mit alten Bauernhöfen", "Dietenheim", ["Bruneck"]],
    ["Schreibmaschinenmuseum Peter Mitterhofer", "Partschins"], ["Museum Ladin im Ciastel de Tor", "St. Martin in Thurn", ["San Martin de Tor"]],
    ["Südtiroler Weinmuseum", "Kaltern"], ["Südtiroler Obstbaumuseum", "Lana"], ["Landesmuseum für Kultur- und Landesgeschichte Schloss Tirol", "Dorf Tirol", ["Tirol"]],
    ["Diözesanmuseum in der Hofburg", "Brixen"], ["Mineralienmuseum mit den „Teiser Kugeln“", "Villnöß", ["Teis"]] ] },

  { q: "Welcher Fluss ist gemeint?", hint: "Südtirol", type: "choice", items: [
    ["Fluss durch das Pustertal", "Rienz"], ["Fluss durch das Ahrntal und Tauferer Tal", "Ahr"], ["Fluss durch das Passeiertal", "Passer"],
    ["Fluss durch das Ultental", "Falschauer"], ["Fluss durch das Sarntal", "Talfer"], ["Fluss durch das Gadertal", "Gader"], ["Fluss durch das Martelltal", "Plima"],
    ["Fluss, der bei Toblach entspringt und nach Osten fließt", "Drau"], ["Fluss durch das Wipptal bei Sterzing", "Eisack"], ["Fluss durch den Vinschgau", "Etsch"] ] },

  { q: "Welches Tal ist gemeint?", type: "choice", items: [
    ["Seitental des Vinschgaus mit der Ötzi-Fundstelle in der Nähe", "Schnalstal", ["Schnals"]], ["Tal von Meran über St. Leonhard zum Timmelsjoch", "Passeiertal", ["Passeier"]],
    ["Seitental mit dem Pragser Wildsee", "Pragser Tal", ["Prags"]], ["Seitental des Pustertals mit dem Biathlonzentrum", "Antholzer Tal", ["Antholz"]],
    ["Ladinisches Tal mit Corvara und Alta Badia", "Gadertal"], ["Tal unter den Geislerspitzen, in dem Reinhold Messner aufwuchs", "Villnößtal", ["Villnöß"]],
    ["Hochtal unter dem Ortler", "Suldental", ["Sulden"]], ["Tal mit den uralten Lärchen von St. Gertraud", "Ultental", ["Ulten"]],
    ["Seitental des Vinschgaus mit dem Zufrittsee", "Martelltal", ["Martell"]], ["Tal mit Sand in Taufers und Prettau", "Ahrntal", ["Tauferer Ahrntal"]] ] },

  { q: "Welche Südtiroler Spezialität ist gemeint?", hint: "Teil 2", type: "choice", items: [
    ["Spiralförmiges Schmalzgebäck, oft mit Preiselbeeren", "Strauben"], ["Frittierte Teigfladen mit Kraut- oder Topfenfüllung", "Tirtlen", ["Tirteln", "Tirtln"]],
    ["Suppe aus Rollgerste mit Selchfleisch", "Gerstsuppe", ["Gerstensuppe"]], ["Magerer, würziger Sauermilchkäse", "Graukäse"],
    ["Paarweise gebackenes Roggenbrot mit Brotklee", "Vinschger Paarl", ["Paarl", "Vinschgerle"]], ["Hauchdünner Teig mit Äpfeln, Rosinen und Zimt", "Apfelstrudel", ["Strudel"]],
    ["Knödel mit Käse und Schnittlauch", "Kasknödel", ["Käseknödel"]], ["Pfannengericht aus Kartoffeln, Zwiebeln und Fleischresten", "Gröstl", ["Tiroler Gröstl"]],
    ["Dünne, frittierte Fladen aus Kartoffelteig, oft mit Sauerkraut", "Erdäpfelblattlan", ["Blattlan", "Erdäpfelblattln"]],
    ["Grüne Knödel, mit brauner Butter und Parmesan serviert", "Spinatknödel"] ] },

  { q: "Ist die Aussage wahr?", hint: "Südtirol – Teil 2", type: "tf", items: [
    ["Die Etsch entspringt am Reschenpass.", true], ["Bozen liegt tiefer als 300 Meter über dem Meer.", true], ["Die Vinschgaubahn fährt von Meran nach Mals.", true],
    ["Südtirol ist die nördlichste Provinz Italiens.", true], ["An der Freien Universität Bozen wird auf Deutsch, Italienisch und Englisch gelehrt.", true],
    ["Gröden ist ein Seitental des Pustertals.", false], ["Meran hat mehr Einwohner als Bozen.", false], ["Der Kalterer See ist ein Stausee.", false],
    ["Die Dolomiten bestehen hauptsächlich aus Granit.", false], ["Ötzi wurde auf österreichischem Staatsgebiet gefunden.", false] ] },

  { q: "Was heißt das auf Hochdeutsch?", hint: "Tiroler Dialekt – Teil 2", type: "choice", items: [
    ["Pfiati", "Auf Wiedersehen", ["Tschüss", "Servus", "Behüt dich Gott", "Behüt dich"]], ["grantig", "schlecht gelaunt", ["missmutig", "mürrisch", "grimmig"]],
    ["Gaggele", "Ei", ["Eier"]], ["Schwammerln", "Pilze", ["Pilz"]], ["Kuchl", "Küche"], ["Leitn", "Hang", ["Abhang", "Berghang", "Halde"]],
    ["heint", "heute"], ["Zuckerle", "Bonbon", ["Süßigkeit", "Zuckerl"]], ["Hoangart", "geselliges Beisammensein", ["Plauderrunde", "Besuch", "Beisammensitzen", "Plaudern"]],
    ["nocket", "nackt"] ] },

].map((c) => ({ ...c, set: "suedtirol" })));
