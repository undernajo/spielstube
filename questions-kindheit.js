// Fragen-Set „Kindheit der 2000er“ – Nostalgie für alle, die um 2000 geboren sind (mit Südtirol-Bezug).
window.SCHLAU10_CARDS.push(...[

  // ===================== Fernsehen =====================
  { q: "Lief die Sendung auf KiKA?", type: "tf", items: [
    ["Bernd das Brot", true], ["Schloss Einstein", true], ["Wissen macht Ah!", true], ["Löwenzahn", true], ["Tigerenten Club", true],
    ["Siebenstein", true], ["SpongeBob Schwammkopf", false], ["Pokémon", false], ["Hannah Montana", false], ["Yu-Gi-Oh!", false] ] },

  { q: "Welche Kinderserie ist das?", emoji: true, type: "choice", items: [
    ["🧽🍍", "SpongeBob Schwammkopf", ["SpongeBob", "Spongebob"]], ["🔨👷🚜", "Bob der Baumeister"], ["🍞😒", "Bernd das Brot"],
    ["🎤💁‍♀️🎸", "Hannah Montana"], ["🌊🔥🌍💨", "Avatar – Der Herr der Elemente", ["Avatar", "Der Herr der Elemente"]], ["⚡🐭🔴", "Pokémon"],
    ["🃏🐉👁️", "Yu-Gi-Oh!", ["Yugioh", "Yu-Gi-Oh"]], ["🧙‍♀️🧹", "Bibi Blocksberg"], ["🐘🎺", "Benjamin Blümchen"],
    ["🚂🔵😊", "Thomas, die kleine Lokomotive", ["Thomas die Lokomotive", "Thomas und seine Freunde", "Thomas"]] ] },

  { q: "Aus welcher Sendung stammt der Spruch?", type: "choice", items: [
    ["„Es gibt 104 Tage Sommerferien …“", "Phineas und Ferb"], ["„Abschalten!“", "Löwenzahn"], ["„Törööö!“", "Benjamin Blümchen"],
    ["„Hex-hex!“", "Bibi Blocksberg"], ["„Mist!“", "Bernd das Brot"], ["„Es ist Zeit für ein Duell!“", "Yu-Gi-Oh!", ["Yugioh", "Yu-Gi-Oh"]],
    ["„Wer wohnt in 'ner Ananas ganz tief im Meer?“", "SpongeBob Schwammkopf", ["SpongeBob", "Spongebob"]],
    ["„Können wir das schaffen? – Yo, wir schaffen das!“", "Bob der Baumeister"], ["„Winke, winke!“", "Teletubbies"],
    ["„Gotta catch 'em all!“", "Pokémon"] ] },

  { q: "Wie heißt …?", hint: "Kinderserien", type: "choice", items: [
    ["… SpongeBobs bester Freund?", "Patrick", ["Patrick Star"]], ["… der Bagger von Bob dem Baumeister?", "Baggi"], ["… der Stiefbruder von Phineas?", "Ferb"],
    ["… das Schnabeltier von Phineas und Ferb?", "Perry"], ["… Aangs fliegender Bison?", "Appa"], ["… Hannah Montana mit bürgerlichem Namen?", "Miley Stewart", ["Miley"]],
    ["… Schnappi? Ein kleines …", "Krokodil"], ["… das Schaf bei Bernd das Brot?", "Chili"], ["… Peter Lustigs blaues Zuhause?", "Bauwagen"],
    ["… der Busch bei Bernd das Brot?", "Briegel"] ] },

  { q: "Wer ist das?", hint: "Serienfiguren", type: "choice", items: [
    ["SpongeBobs grantiger Tintenfisch-Nachbar", "Thaddäus", ["Thaddäus Tentakel", "Squidward"]], ["SpongeBobs geiziger Chef", "Mr. Krabs", ["Krabs", "Eugene Krabs"]],
    ["Eichhörnchen im Taucheranzug", "Sandy", ["Sandy Cheeks"]], ["SpongeBobs Schnecke", "Gary"], ["Böser Wissenschaftler bei Phineas und Ferb", "Dr. Doofenshmirtz", ["Doofenshmirtz"]],
    ["Schwester, die Phineas und Ferb verpetzen will", "Candace"], ["Feuerbändiger-Prinz mit Narbe", "Zuko"], ["Aangs fliegender Lemur", "Momo"],
    ["Ashs Rivale bei Pokémon", "Gary Eich", ["Gary"]], ["Yugis Rivale mit dem Weißen Drachen", "Seto Kaiba", ["Kaiba"]] ] },

  { q: "Kinder-TV: Wie heißt …?", type: "choice", items: [
    ["… das sprechende Fahrrad im ORF?", "Tom Turbo"], ["… Thomas Brezinas Detektiv-Bande?", "Die Knickerbocker-Bande", ["Knickerbocker-Bande", "Knickerbocker"]],
    ["… das frühere ORF-Kinderprogramm mit Maskottchen?", "Confetti TiVi", ["Confetti"]], ["… die heutige ORF-Kindermarke?", "okidoki"],
    ["… das KiKA-Maskottchen mit langen Ohren?", "Kikaninchen"], ["… das Moderatoren-Duo von „Wissen macht Ah!“?", "Shary und Ralph", ["Shary & Ralph", "Ralph und Shary"]],
    ["… Peter Lustigs Nachfolger in „Löwenzahn“?", "Fritz Fuchs"], ["… der kleine grüne Drache aus Grönland?", "Tabaluga"],
    ["… das, was bei „Siebenstein“ sprechen kann?", "Koffer", ["der Koffer"]], ["… der Erfinder und Sprecher der „Sendung mit der Maus“ mit Bart?", "Armin Maiwald", ["Maiwald"]] ] },

  { q: "Wo lief die Sendung?", type: "choice", items: [
    ["SpongeBob Schwammkopf (anfangs)", "Super RTL"], ["Pokémon (anfangs)", "RTL II", ["RTL 2", "RTL2"]], ["Hannah Montana", "Disney Channel", ["Super RTL"]],
    ["Galileo", "ProSieben", ["Pro7", "Pro Sieben"]], ["Wer wird Millionär?", "RTL"], ["Popstars mit Monrose (2006)", "ProSieben", ["Pro7", "Pro Sieben"]],
    ["okidoki", "ORF eins", ["ORF", "ORF 1"]], ["Die Simpsons", "ProSieben", ["Pro7", "Pro Sieben"]], ["Tigerenten Club", "ARD", ["Das Erste"]], ["Schloss Einstein", "KiKA"] ] },

  { q: "Lief die Serie auf dem Disney Channel?", type: "tf", items: [
    ["Hannah Montana", true], ["Hotel Zack & Cody", true], ["Phineas und Ferb", true], ["Die Zauberer vom Waverly Place", true], ["Kim Possible", true],
    ["Camp Rock", true], ["iCarly", false], ["Drake & Josh", false], ["Avatar – Der Herr der Elemente", false], ["SpongeBob Schwammkopf", false] ] },

  { q: "Welcher Star ist gemeint?", hint: "Fernsehen der 2000er", type: "choice", names: true, items: [
    ["Löwenzahn bis 2005, blaue Latzhose", "Peter Lustig"], ["Zauberer und Autor im ORF-Kinderprogramm", "Thomas Brezina"], ["Moderierte „TV total“", "Stefan Raab"],
    ["Strenger Jury-Chef bei DSDS", "Dieter Bohlen"], ["Moderierte „Wetten, dass..?“ bis 2011", "Thomas Gottschalk"], ["Moderiert „Germany's Next Topmodel“", "Heidi Klum"],
    ["Moderiert „Wer wird Millionär?“", "Günther Jauch"], ["Moderator von „Galileo“", "Aiman Abdallah"], ["Gewann „Unser Star für Oslo“", "Lena Meyer-Landrut", ["Lena"]],
    ["Moderierte „Verstehen Sie Spaß?“ ab 2010", "Guido Cantz"] ] },

  // ===================== Spielzeug & Games =====================
  { q: "Welches Spielzeug ist gemeint?", type: "choice", items: [
    ["Kreisel, die in einer Arena kämpfen", "Beyblade", ["Beyblades"]], ["Kugeln, die zu Monstern aufspringen", "Bakugan"], ["Kleine Sammelfiguren zum Schnipsen", "Gogo's Crazy Bones", ["Crazy Bones", "Gogos"]],
    ["Maus mit großen Füßen auf Briefpapier", "Diddl", ["Diddl-Maus"]], ["Gummiarmbänder in Tierform", "Silly Bandz"], ["Selbstgeknüpfte Armbänder aus Mini-Gummis", "Loom Bands", ["Loom"]],
    ["Elektronisches Haustier im Ei", "Tamagotchi"], ["Plüschtier mit großen Augen, das spricht", "Furby"], ["Fußball-Sticker zum Einkleben", "Panini", ["Panini-Sticker"]],
    ["Winzige Puppenwelt im Klappgehäuse", "Polly Pocket"] ] },

  { q: "Gab es das Spielzeug schon vor 2000?", type: "tf", items: [
    ["Tamagotchi", true], ["Furby", true], ["Game Boy", true], ["Polly Pocket", true], ["Diddl", true], ["Lego", true],
    ["Bakugan", false], ["Loom Bands", false], ["Nintendo DS", false], ["Silly Bandz", false] ] },

  { q: "Ordne die Nintendo-Konsolen nach Erscheinen.", hint: "1 = am frühesten", type: "rank", items: [
    ["Game Boy", 1], ["Nintendo 64", 2], ["Game Boy Color", 3], ["Game Boy Advance", 4], ["GameCube", 5],
    ["Nintendo DS", 6], ["Wii", 7], ["Nintendo 3DS", 8], ["Wii U", 9], ["Nintendo Switch", 10] ] },

  { q: "Wie heißt das Spiel?", type: "choice", items: [
    ["Hunde-Simulation auf dem DS", "Nintendogs"], ["Pinguin-Welt im Browser", "Club Penguin"], ["Hühner abschießen am PC", "Moorhuhn"],
    ["Lebenssimulation mit „Simlisch“", "Die Sims", ["Sims"]], ["Rechnen und Lesen mit Dr. Kawashima", "Gehirnjogging", ["Dr. Kawashimas Gehirnjogging", "Brain Age"]],
    ["Bowling und Tennis mit der Fernbedienung", "Wii Sports"], ["Pokémon-Edition mit Dialga", "Pokémon Diamant", ["Diamant"]], ["Klötzchenwelt zum Bauen und Überleben", "Minecraft"],
    ["Pixel-Hotel zum Chatten", "Habbo", ["Habbo Hotel"]], ["Karaoke auf der PlayStation 2", "SingStar"] ] },

  { q: "Ist das ein Pokémon der ersten Generation?", type: "tf", items: [
    ["Pikachu", true], ["Glumanda", true], ["Schiggy", true], ["Mewtu", true], ["Relaxo", true], ["Evoli", true],
    ["Lucario", false], ["Plinfa", false], ["Feurigel", false], ["Togepi", false] ] },

  // ===================== Musik, Bücher, Kino =====================
  { q: "Wer singt das?", hint: "Hits der 2000er", type: "choice", names: true, items: [
    ["Schnappi, das kleine Krokodil", "Schnappi", ["Joy Gruttmann"]], ["Axel F (Ring-ding-ding)", "Crazy Frog"], ["Ab in den Süden", "Buddy", ["Buddy vs. DJ The Wave"]],
    ["Dragostea Din Tei („Numa Numa“)", "O-Zone"], ["Hips Don't Lie", "Shakira"], ["Umbrella", "Rihanna"], ["Geile Zeit", "Juli"],
    ["Durch die Nacht", "Silbermond"], ["Hot n Cold", "Katy Perry"], ["Ein Stern (… der deinen Namen trägt)", "DJ Ötzi & Nik P.", ["DJ Ötzi", "Nik P.", "DJ Ötzi und Nik P."]] ] },

  { q: "Erschien der Song zwischen 2000 und 2009?", type: "tf", items: [
    ["Hips Don't Lie", true], ["Umbrella", true], ["Poker Face", true], ["Hey Ya!", true], ["Mr. Brightside", true], ["Toxic", true],
    ["Mambo No. 5", false], ["Gangnam Style", false], ["Wannabe", false], ["Despacito", false] ] },

  { q: "Welches Buch oder Hörspiel ist gemeint?", type: "choice", items: [
    ["Junge führt ein Tagebuch voller Kritzeleien", "Gregs Tagebuch"], ["Katzen-Clans kämpfen im Wald", "Warrior Cats"], ["Anne und Philipp reisen mit einem Baumhaus durch die Zeit", "Das magische Baumhaus"],
    ["Jedes Kind bekommt ein sprechendes Tier", "Die Schule der magischen Tiere"], ["Halbgott und Sohn des Poseidon", "Percy Jackson"],
    ["Bauernjunge findet ein Drachenei", "Eragon"], ["Beim Vorlesen springen Figuren aus dem Buch", "Tintenherz"], ["Mädchen mit roter Schleife", "Conni"],
    ["Kleines Mädchen und ein Stern mit Pflaster", "Lauras Stern"], ["Grüne Müllfresser aus Schmuddelfing", "Die Olchis", ["Olchis"]] ] },

  { q: "Welcher Film ist gemeint?", hint: "Kino der 2000er", type: "choice", items: [
    ["Fußballbande mit Leon und Marlon", "Die Wilden Kerle", ["Wilde Kerle"]], ["Mädchenbande mit echten Hühnern", "Die Wilden Hühner", ["Wilde Hühner"]],
    ["Zwillinge im Internat Lindenhof", "Hanni & Nanni", ["Hanni und Nanni"]], ["Mammut, Faultier und Säbelzahntiger", "Ice Age"],
    ["Basketball und Singen an der East High", "High School Musical"], ["Rennautos mit Gesichtern", "Cars"], ["Zootiere stranden auf einer Insel", "Madagascar"],
    ["Wikingerjunge freundet sich mit einem Drachen an", "Drachenzähmen leicht gemacht"], ["Pinguin, der nicht singen, aber steppen kann", "Happy Feet"],
    ["Vier Kinder steigen durch einen Kleiderschrank", "Die Chroniken von Narnia", ["Narnia"]] ] },

  // ===================== Handy, Internet, Alltag =====================
  { q: "Gab es das schon vor 2010?", type: "tf", items: [
    ["SchülerVZ", true], ["ICQ", true], ["MSN Messenger", true], ["MySpace", true], ["Knuddels", true], ["wer-kennt-wen", true],
    ["TikTok", false], ["BeReal", false], ["Threads", false], ["Discord", false] ] },

  { q: "War das ein Handy von Nokia?", type: "tf", items: [
    ["3310", true], ["3210", true], ["6600", true], ["N95", true], ["5800 XpressMusic", true], ["6300", true],
    ["RAZR", false], ["Galaxy S", false], ["iPhone 3G", false], ["BlackBerry Curve", false] ] },

  { q: "Handy & Internet: Was ist gemeint?", type: "choice", items: [
    ["Schlangenspiel auf dem Nokia", "Snake"], ["Klingelton-Anbieter mit Spar-Abo", "Jamba"], ["Nachricht mit maximal 160 Zeichen", "SMS"],
    ["Bilder per Handy verschicken (vor WhatsApp)", "MMS"], ["Dateien zwischen Handys funken", "Bluetooth", ["Infrarot"]], ["Handy zum Zuklappen", "Klapphandy"],
    ["Pfeifendes Gerät beim Einwählen ins Internet", "Modem"], ["Hier konnte man andere „gruscheln“", "SchülerVZ", ["StudiVZ", "VZ"]],
    ["Messenger mit dem „Uh-oh“-Ton", "ICQ"], ["Datenträger mit 1,44 MB", "Diskette"] ] },

  { q: "Ordne nach dem Erscheinen.", hint: "1 = am frühesten", type: "rank", items: [
    ["iPod", 1], ["Nintendo DS", 2], ["YouTube", 3], ["Wii", 4], ["iPhone", 5],
    ["WhatsApp", 6], ["iPad", 7], ["Instagram", 8], ["Snapchat", 9], ["Fortnite", 10] ] },

  { q: "In welchem Jahr war das?", type: "num", items: [
    ["Der erste Harry-Potter-Film kommt ins Kino", 2001], ["„Schnappi“ ist Nummer 1 in Deutschland", 2005], ["„Axel F“ vom Crazy Frog stürmt die Charts", 2005],
    ["Fußball-WM in Deutschland", 2006], ["„High School Musical“ erscheint", 2006], ["Erste Folge „Phineas und Ferb“", 2007], ["WhatsApp wird gegründet", 2009],
    ["Lena gewinnt den Eurovision Song Contest", 2010], ["Minecraft erscheint als Vollversion", 2011], ["Pokémon Go erscheint", 2016] ] },

  { q: "Was ist gemeint?", hint: "Schule & Alltag", type: "choice", items: [
    ["Füller für Schulanfänger mit Gummigriff", "Pelikano"], ["Schulranzen-Marke mit Reflektoren", "Scout", ["McNeill"]], ["Buch mit Steckbriefen aller Freunde", "Freundebuch", ["Freundschaftsbuch", "Poesiealbum"]],
    ["Saft im Beutel mit Strohhalm", "Capri-Sonne", ["Capri Sun"]], ["Quark für Kinder im kleinen Becher", "Fruchtzwerge"], ["Extrem saure Kaugummikugeln", "Center Shock"],
    ["Biskuit mit Milchcreme aus dem Kühlregal", "Milchschnitte", ["Kinder Fetta al Latte"]], ["Jugendzeitschrift mit „Dr. Sommer“", "Bravo"],
    ["CD-Reihe mit den aktuellen Charts", "Bravo Hits"], ["Tragbarer CD-Spieler", "Discman"] ] },

  { q: "Welche Süßigkeit ist gemeint?", type: "choice", items: [
    ["Oblaten-Ufos mit Brausepulver", "Brause-Ufos", ["Ufos", "Brauseufos"]], ["Knistert und knallt im Mund", "Knisterbrause", ["Pop Rocks", "Knisterzucker"]],
    ["Lutscher in der Muschelschale", "Schleckmuschel"], ["Bunte Blätter zum Essen", "Esspapier"], ["Brausepulver im Tütchen mit Schiff", "Ahoj-Brause", ["Ahoj"]],
    ["Lutscher zum Herausschieben", "Push Pop"], ["Lolli mit Logo von Salvador Dalí", "Chupa Chups"], ["Schokoladenei mit Spielzeug", "Überraschungsei", ["Ü-Ei", "Kinder Überraschung", "Kinder Sorpresa"]],
    ["Gefrorener Saft im Plastikschlauch", "Wassereis"], ["Haselnusscreme zum Aufs-Brot-Streichen", "Nutella"] ] },

  { q: "Was hat man auf dem Pausenhof gespielt?", type: "choice", items: [
    ["Springen über ein gespanntes Gummiband", "Gummitwist"], ["Mit verbundenen Augen einen Topf suchen", "Topfschlagen"], ["Ein Wort von Ohr zu Ohr flüstern", "Stille Post"],
    ["Ein Stuhl weniger als Mitspieler", "Reise nach Jerusalem"], ["Schere, Stein, Papier", "Schnick, Schnack, Schnuck", ["Schere Stein Papier", "Schnick Schnack Schnuck"]],
    ["Mit verbundenen Augen andere fangen", "Blinde Kuh"], ["„Eins, zwei, drei – …“ und alle erstarren", "Ochs am Berg", ["Ochs vorm Berg"]],
    ["Hüpfen in Kästchen mit Kreide", "Himmel und Hölle"], ["„Dreht euch nicht um, der … geht um“", "Plumpsack"], ["Wer bei der Flasche landet, muss eine Aufgabe erfüllen", "Flaschendrehen"] ] },

  { q: "2000er in Zahlen", type: "num", items: [
    ["Pokémon der ersten Generation", 151], ["Teile von „High School Musical“", 3], ["Fahrer in einem Rennen bei Mario Kart Wii", 12],
    ["Spieler gleichzeitig beim Bowling in Wii Sports", 4], ["Mitglieder von Monrose", 3], ["Staffeln von „Hannah Montana“", 4],
    ["Bücher (Staffeln) von „Avatar – Der Herr der Elemente“", 3], ["Tasten am Ziffernblock eines alten Handys (mit * und #)", 12],
    ["Euro-Münzen-Sorten", 8], ["Euro-Banknoten-Sorten", 7] ] },

  // ===================== Südtirol & Italien =====================
  { q: "Kommt die Marke aus Italien?", type: "tf", items: [
    ["Estathé", true], ["Fonzies", true], ["Kinder (Ferrero)", true], ["Mulino Bianco", true], ["Loacker", true], ["Nutella", true],
    ["Milka", false], ["Haribo", false], ["Capri-Sonne", false], ["Manner", false] ] },

  { q: "Südtirol & Italien in den 2000ern: Was ist gemeint?", type: "choice", items: [
    ["Eistee im Plastikbecher mit Strohhalm", "Estathé"], ["Waffeln vom Ritten", "Loacker"], ["Kakaokekse mit Zuckersternen", "Pan di Stelle"],
    ["Motiv der italienischen 1-Euro-Münze", "Vitruvianischer Mensch", ["Der vitruvianische Mensch", "Leonardo da Vinci"]], ["Motiv der italienischen 2-Euro-Münze", "Dante", ["Dante Alighieri"]],
    ["Währung vor dem Euro", "Lira", ["Lire", "Italienische Lira"]], ["Italiens Kapitän beim WM-Titel 2006", "Fabio Cannavaro", ["Cannavaro"]],
    ["Italiens Torwart beim WM-Titel 2006", "Gianluigi Buffon", ["Buffon"]], ["Spieler, den Zidane im WM-Finale per Kopfstoß traf", "Marco Materazzi", ["Materazzi"]],
    ["Rodel-Olympiasieger aus Südtirol 2002 und 2006", "Armin Zöggeler", ["Zöggeler"]] ] },

  { q: "Sommermärchen 2006: Wie heißt …?", type: "choice", items: [
    ["… das Löwen-Maskottchen?", "Goleo", ["Goleo VI"]], ["… sein sprechender Ball?", "Pille"], ["… der deutsche Bundestrainer?", "Jürgen Klinsmann", ["Klinsmann"]],
    ["… der Torschützenkönig?", "Miroslav Klose", ["Klose"]], ["… der Torwart mit dem Elfmeter-Zettel?", "Jens Lehmann", ["Lehmann"]],
    ["… der Weltmeister?", "Italien"], ["… der Ort des Finales?", "Berlin"], ["… der Spieler mit dem Kopfstoß im Finale?", "Zinédine Zidane", ["Zidane"]],
    ["… Deutschlands Platzierung?", "Dritter", ["3", "Platz 3", "dritter Platz"]], ["… der Sänger von „Zeit, dass sich was dreht“?", "Herbert Grönemeyer", ["Grönemeyer"]] ] },

].map((c) => ({ ...c, set: "kindheit" })));
