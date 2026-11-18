// Standard-Set, Teil „Geschichte“ – von den Pharaonen bis zum Mauerfall (ergänzt die übrigen Geschichtskarten ohne Doppelungen;
// Tiroler Geschichte steckt im Südtirol-Set).
window.SCHLAU10_CARDS.push(...[

  // ===================== Zeiten & Jahre =====================
  { q: "In welche Epoche gehört das?", hint: "Neuzeit = etwa ab 1500", type: "choice", options: ["Antike", "Mittelalter", "Neuzeit"], items: [
    ["Bau der Pyramiden von Gizeh", "Antike"], ["Alexander der Große erobert Persien", "Antike"], ["Die ersten Olympischen Spiele in Griechenland", "Antike"],
    ["Karl der Große wird zum Kaiser gekrönt", "Mittelalter"], ["Die Kreuzzüge", "Mittelalter"], ["Der Schwarze Tod – die große Pest in Europa", "Mittelalter"],
    ["Die Magna Carta wird besiegelt", "Mittelalter"], ["Die Reformation", "Neuzeit"], ["Die Französische Revolution", "Neuzeit"], ["Die Industrialisierung", "Neuzeit"] ] },

  { q: "Geschah das vor Christi Geburt?", type: "tf", items: [
    ["Bau der Cheops-Pyramide", true], ["Gründung Roms (der Sage nach)", true], ["Hannibal zieht mit Elefanten über die Alpen", true],
    ["Julius Caesar wird ermordet", true], ["Kleopatra stirbt", true], ["Varusschlacht im Teutoburger Wald", false],
    ["Der Vesuv verschüttet Pompeji", false], ["Bau des Hadrianswalls in Britannien", false], ["Konstantin wird römischer Kaiser", false],
    ["Untergang des Weströmischen Reiches", false] ] },

  { q: "Ordne zeitlich. (Von Babylon bis Byzanz)", hint: "1 = am frühesten", type: "rank", items: [
    ["Hammurabi lässt seine Gesetze aufschreiben", 1], ["Sokrates wird zum Tode verurteilt", 2], ["Hannibal zieht über die Alpen", 3],
    ["Varusschlacht", 4], ["Der Vesuv verschüttet Pompeji", 5], ["Untergang des Weströmischen Reiches", 6], ["Wikinger überfallen das Kloster Lindisfarne", 7],
    ["Otto der Große wird zum Kaiser gekrönt", 8], ["Beginn des Ersten Kreuzzugs", 9], ["Die Osmanen erobern Konstantinopel", 10] ] },

  { q: "In welchem Jahr geschah das? (Teil 2)", type: "num", items: [
    ["Kaiserkrönung Karls des Großen", 800], ["Magna Carta", 1215], ["Rütlischwur – Gründung der Eidgenossenschaft (Überlieferung)", 1291],
    ["Die Osmanen erobern Konstantinopel", 1453], ["Westfälischer Frieden", 1648], ["Unabhängigkeitserklärung der USA", 1776],
    ["Gründung des Deutschen Kaiserreichs", 1871], ["Ende des Ersten Weltkriegs", 1918], ["Hitler wird Reichskanzler", 1933],
    ["Nelson Mandela wird Präsident Südafrikas", 1994] ] },

  { q: "In welchem Jahrhundert war das?", type: "choice", options: ["15. Jh.", "16. Jh.", "17. Jh.", "18. Jh.", "19. Jh."], items: [
    ["Gutenberg druckt seine Bibel", "15. Jh."], ["Jeanne d'Arc stirbt auf dem Scheiterhaufen", "15. Jh."], ["Leonardo da Vinci malt die Mona Lisa", "16. Jh."],
    ["Der Deutsche Bauernkrieg", "16. Jh."], ["William Shakespeare wird geboren", "16. Jh."], ["Galileo Galilei steht vor Gericht", "17. Jh."],
    ["Der Dreißigjährige Krieg", "17. Jh."], ["Maria Theresia wird Herrscherin", "18. Jh."], ["Ende des Heiligen Römischen Reiches", "19. Jh."],
    ["Die Märzrevolution in Deutschland", "19. Jh."] ] },

  { q: "In welchem Jahrzehnt war das? (19. Jahrhundert)", type: "decade", items: [
    ["Wiener Kongress", 1810], ["Napoleon stirbt auf St. Helena", 1820], ["Erste deutsche Eisenbahn Nürnberg–Fürth", 1830],
    ["Revolution in Deutschland", 1840], ["Goldrausch in Kalifornien beginnt", 1840], ["Darwin veröffentlicht „Über die Entstehung der Arten“", 1850],
    ["Beginn des Amerikanischen Bürgerkriegs", 1860], ["Eröffnung des Suezkanals", 1860], ["Wilhelm II. wird deutscher Kaiser", 1880],
    ["Der Eiffelturm wird eröffnet", 1880] ] },

  { q: "In welchem Jahrzehnt war das? (20. Jahrhundert)", type: "decade", items: [
    ["Das Frauenwahlrecht wird in Deutschland eingeführt", 1910], ["Beginn der Weltwirtschaftskrise", 1920], ["Olympische Spiele in Berlin", 1930],
    ["Indien wird unabhängig", 1940], ["Kubakrise", 1960], ["Prager Frühling", 1960], ["Frauenwahlrecht in der Schweiz (auf Bundesebene)", 1970],
    ["Rücktritt von US-Präsident Nixon (Watergate)", 1970], ["Nelson Mandela kommt frei", 1990], ["Auflösung der Sowjetunion", 1990] ] },

  { q: "Geschichte in Zahlen (Teil 2)", type: "num", items: [
    ["Jahre regierte Queen Elizabeth II.", 70], ["Jahre dauerte der Zweite Weltkrieg (gerundet)", 6], ["Jahre dauerte der Siebenjährige Krieg", 7],
    ["Jahre war Angela Merkel Bundeskanzlerin", 16], ["Kinder von Maria Theresia", 16], ["Gründungsstaaten der EWG (1957)", 6],
    ["Sterne auf der Europaflagge", 12], ["Jahre dauerte der Peloponnesische Krieg", 27], ["Jahre regierte Ludwig XIV. (formal)", 72],
    ["Jahre dauerte der Trojanische Krieg (der Sage nach)", 10] ] },

  // ===================== Menschen & Herrscher =====================
  { q: "Wer war das? (Herrscher & Persönlichkeiten)", type: "choice", names: true, items: [
    ["Römischer Feldherr: „Die Würfel sind gefallen“ – überschritt den Rubikon", "Julius Caesar", ["Caesar", "Cäsar"]], ["Mongolischer Herrscher über ein riesiges Reich", "Dschingis Khan"],
    ["Französische Nationalheldin, auf dem Scheiterhaufen verbrannt", "Jeanne d'Arc", ["Johanna von Orléans", "Jeanne d Arc"]],
    ["Griechischer Philosoph, musste den Schierlingsbecher trinken", "Sokrates"], ["Britische Königin, die von 1837 bis 1901 regierte – fast 64 Jahre", "Queen Victoria", ["Victoria", "Viktoria"]],
    ["Venezianischer Händler, reiste bis nach China", "Marco Polo"], ["Kaiserin von Österreich, genannt „Sisi“", "Elisabeth", ["Sisi", "Sissi", "Kaiserin Elisabeth"]],
    ["Russische Zarin, genannt „die Große“", "Katharina die Große", ["Katharina II.", "Katharina"]], ["Englischer König mit sechs Ehefrauen", "Heinrich VIII.", ["Heinrich der Achte", "Henry VIII", "Heinrich VIII"]],
    ["Preußischer König, genannt „der Alte Fritz“", "Friedrich der Große", ["Friedrich II.", "Alter Fritz", "Friedrich II"]] ] },

  { q: "Ordne die Herrscher zeitlich.", hint: "1 = am frühesten an der Macht", type: "rank", items: [
    ["Ramses II.", 1], ["Alexander der Große", 2], ["Augustus", 3], ["Karl der Große", 4], ["Friedrich Barbarossa", 5],
    ["Maximilian I.", 6], ["Ludwig XIV.", 7], ["Maria Theresia", 8], ["Napoleon", 9], ["Queen Victoria", 10] ] },

  { q: "War das ein Pharao?", type: "tf", items: [
    ["Ramses II.", true], ["Cheops", true], ["Echnaton", true], ["Hatschepsut", true], ["Tutanchamun", true],
    ["Kleopatra VII.", true], ["Hammurabi", false], ["Nebukadnezar", false], ["Xerxes", false], ["Herodes", false] ] },

  { q: "War der Herrscher ein Habsburger?", type: "tf", items: [
    ["Maria Theresia", true], ["Franz Joseph I.", true], ["Karl V.", true], ["Maximilian I.", true], ["Rudolf I.", true],
    ["Joseph II.", true], ["Friedrich der Große", false], ["Ludwig XIV.", false], ["Napoleon", false], ["Friedrich Barbarossa", false] ] },

  { q: "Wer war's? (Entdecker & Pioniere)", type: "choice", names: true, items: [
    ["Erreichte 1911 als Erster den Südpol", "Roald Amundsen", ["Amundsen"]], ["Erreichte den Südpol kurz nach Amundsen und starb auf dem Rückweg", "Robert Falcon Scott", ["Scott", "Robert Scott"]],
    ["Stand 1953 mit Tenzing Norgay als Erster auf dem Mount Everest", "Edmund Hillary", ["Hillary"]], ["Wikinger, der um das Jahr 1000 Nordamerika erreichte", "Leif Eriksson", ["Leif Erikson", "Leif"]],
    ["Erkundete 1770 die Ostküste Australiens", "James Cook", ["Cook", "Kapitän Cook"]], ["Umsegelte als Erster das Kap der Guten Hoffnung", "Bartolomeu Dias", ["Dias"]],
    ["Spanischer Eroberer des Aztekenreichs", "Hernán Cortés", ["Cortés", "Cortez", "Hernando Cortez"]], ["Spanischer Eroberer des Inkareichs", "Francisco Pizarro", ["Pizarro"]],
    ["Flog 1927 als Erster allein nonstop über den Atlantik", "Charles Lindbergh", ["Lindbergh"]], ["Flog als erste Frau allein über den Atlantik", "Amelia Earhart", ["Earhart"]] ] },

  // ===================== Orte, Reiche & Kulturen =====================
  { q: "Zu welcher Kultur gehört das?", type: "choice", options: ["Ägypten", "Griechenland", "Rom", "Mesopotamien"], items: [
    ["Hieroglyphen", "Ägypten"], ["Mumien", "Ägypten"], ["Sphinx von Gizeh", "Ägypten"], ["Sparta", "Griechenland"], ["Sokrates", "Griechenland"],
    ["Das Trojanische Pferd (Sage)", "Griechenland"], ["Gladiatorenkämpfe", "Rom"], ["Legionen", "Rom"], ["Keilschrift", "Mesopotamien"],
    ["Gesetze des Hammurabi", "Mesopotamien"] ] },

  { q: "Wofür war das Volk bekannt? (Antike)", type: "choice", options: ["Ägypter", "Griechen", "Römer", "Chinesen"], items: [
    ["Aquädukte über weite Strecken", "Römer"], ["Fußbodenheizung (Hypokaustum)", "Römer"], ["Straßennetz mit Meilensteinen", "Römer"],
    ["Demokratie", "Griechen"], ["Theater mit Tragödie und Komödie", "Griechen"], ["Porzellan", "Chinesen"], ["Seide", "Chinesen"],
    ["Schießpulver", "Chinesen"], ["Papyrus als Schreibmaterial", "Ägypter"], ["Kalender mit 365 Tagen", "Ägypter"] ] },

  { q: "Gehörte das Gebiet einmal zum Römischen Reich?", type: "tf", items: [
    ["England", true], ["Ägypten", true], ["Spanien", true], ["Türkei", true], ["Tunesien", true],
    ["Südtirol", true], ["Irland", false], ["Dänemark", false], ["Polen", false], ["Finnland", false] ] },

  { q: "Welche europäische Macht hatte diese Kolonie?", type: "choice", options: ["Großbritannien", "Frankreich", "Spanien", "Portugal", "Niederlande"], items: [
    ["Indien", "Großbritannien"], ["Australien", "Großbritannien"], ["Brasilien", "Portugal"], ["Angola", "Portugal"], ["Mexiko", "Spanien"],
    ["Peru", "Spanien"], ["Indonesien", "Niederlande"], ["Suriname", "Niederlande"], ["Algerien", "Frankreich"], ["Vietnam", "Frankreich"] ] },

  { q: "Welche Stadt ist gemeint? (Geschichte)", type: "choice", items: [
    ["Hauptstadt des Byzantinischen Reiches", "Konstantinopel", ["Istanbul", "Byzanz"]], ["Mächtige Seerepublik in einer Lagune", "Venedig"],
    ["Gilt als Wiege der Demokratie", "Athen"], ["Erste Atombombe im Krieg, 6. August 1945", "Hiroshima"],
    ["Hier und in Osnabrück wurde 1648 Frieden geschlossen", "Münster"], ["Heilige Stadt für Juden, Christen und Muslime", "Jerusalem"],
    ["Jahrhundertelang Hauptstadt der Habsburger", "Wien"], ["Großes Konzil der Gegenreformation 1545–1563", "Trient", ["Trento"]],
    ["Stadt der Medici, Wiege der Renaissance", "Florenz"], ["Von 1961 bis 1989 durch eine Mauer geteilt", "Berlin"] ] },

  { q: "Welches Bauwerk ist gemeint?", type: "choice", items: [
    ["Einziges erhaltenes Weltwunder der Antike", "Cheops-Pyramide", ["Pyramide von Gizeh", "Pyramiden von Gizeh", "Cheopspyramide"]],
    ["Riesiger Schutzwall gegen Völker aus dem Norden", "Chinesische Mauer", ["Große Mauer"]], ["Steinkreis in England aus der Steinzeit", "Stonehenge"],
    ["Prunkschloss des Sonnenkönigs bei Paris", "Versailles", ["Schloss Versailles"]], ["Sommerresidenz der Habsburger in Wien", "Schönbrunn", ["Schloss Schönbrunn"]],
    ["Steinbrücke in Prag, benannt nach einem Kaiser", "Karlsbrücke"], ["Antiker Leuchtturm, eines der sieben Weltwunder", "Leuchtturm von Alexandria", ["Pharos", "Pharos von Alexandria"]],
    ["Tempel der Athene auf der Akropolis", "Parthenon"], ["Hier übersetzte Luther das Neue Testament", "Wartburg"],
    ["Festung an der Themse, hier liegen die Kronjuwelen", "Tower of London", ["Tower"]] ] },

  // ===================== Ereignisse & Begriffe =====================
  { q: "Welches Ereignis ist gemeint?", type: "choice", items: [
    ["Seeschlacht 1805, Admiral Nelson besiegt Napoleons Flotte", "Trafalgar", ["Schlacht von Trafalgar"]], ["Spaniens große Flotte scheitert 1588 an England", "Armada", ["Spanische Armada"]],
    ["Kolonisten werfen 1773 Tee in den Hafen von Boston", "Boston Tea Party"], ["Jahrzehntelanger Konflikt zwischen USA und Sowjetunion ohne direkten Krieg", "Kalter Krieg"],
    ["Flugzeuge versorgen 1948/49 West-Berlin", "Berliner Luftbrücke", ["Luftbrücke"]], ["Grenze quer durch Europa im Kalten Krieg", "Eiserner Vorhang"],
    ["Friedlicher Umsturz in der Tschechoslowakei 1989", "Samtene Revolution"], ["Mord am österreichischen Thronfolger 1914", "Attentat von Sarajevo", ["Sarajevo", "Attentat"]],
    ["Englischer Thronkrieg zwischen York und Lancaster", "Rosenkriege", ["Rosenkrieg"]], ["Wanderung germanischer Völker ab dem 4. Jahrhundert", "Völkerwanderung"] ] },

  { q: "Was ist gemeint? (Mittelalter)", type: "choice", items: [
    ["Wettkampf der Ritter zu Pferd", "Turnier", ["Tjost", "Ritterturnier"]], ["Höchster Turm der Burg, letzte Zuflucht", "Bergfried"],
    ["Brücke über den Burggraben, die man hochziehen kann", "Zugbrücke"], ["Ihn kaufte man, um Strafen für Sünden zu verkürzen", "Ablass", ["Ablassbrief"]],
    ["Land, das ein Herr seinem Vasallen überließ", "Lehen"], ["Zusammenschluss der Handwerker eines Berufs in der Stadt", "Zunft"],
    ["Bauer, der seinem Grundherrn gehörte", "Leibeigener", ["Leibeigene", "Höriger"]], ["Liebeslieder der Ritter für eine verehrte Dame", "Minnesang"],
    ["Junge in Ausbildung zum Ritter", "Knappe", ["Page"]], ["Bund von Handelsstädten wie Lübeck und Hamburg", "Hanse"] ] },

  { q: "Gab es das in Europa schon im Mittelalter?", type: "tf", items: [
    ["Brillen", true], ["Schießpulver", true], ["Universitäten", true], ["Mechanische Räderuhren", true], ["Windmühlen", true],
    ["Kartoffeln", false], ["Tomaten", false], ["Kaffee", false], ["Fernrohre", false], ["Schokolade", false] ] },

  { q: "Stimmt das? (Geschichts-Irrtümer)", type: "tf", items: [
    ["Kleopatra lebte näher an der Mondlandung als am Bau der Cheops-Pyramide.", true], ["Die Universität Oxford ist älter als das Aztekenreich.", true],
    ["Kolumbus wollte eigentlich nach Indien.", true], ["Die Römer kannten schon Beton.", true], ["Die Wikinger trugen Helme mit Hörnern.", false],
    ["Napoleon war für seine Zeit besonders klein.", false], ["Im Mittelalter hielten Gelehrte die Erde für eine Scheibe.", false],
    ["Die Chinesische Mauer ist vom Mond aus mit bloßem Auge zu sehen.", false], ["Die Pyramiden wurden von Sklaven gebaut.", false],
    ["Kolumbus war der erste Europäer in Amerika.", false] ] },

]); // gehört zum Standard-Set
