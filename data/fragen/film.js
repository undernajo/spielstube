// Fragen-Set „Film & Serien“ (ergänzt die Film-Karten im Standard-Set, ohne Überschneidungen).
window.SCHLAU10_CARDS.push(...[

  { q: "Wer spielte die Rolle?", type: "choice", names: true, items: [
    ["Hermine Granger", "Emma Watson"], ["Gandalf", "Ian McKellen"], ["Neo in „Matrix“", "Keanu Reeves"], ["Hannibal Lecter", "Anthony Hopkins"],
    ["Joker in „The Dark Knight“", "Heath Ledger"], ["Jack Torrance in „Shining“", "Jack Nicholson"], ["Ellen Ripley in „Alien“", "Sigourney Weaver"],
    ["Marty McFly", "Michael J. Fox", ["Michael Fox"]], ["Katniss Everdeen", "Jennifer Lawrence"], ["Walter White", "Bryan Cranston"] ] },

  { q: "Welcher deutsche Film ist gemeint?", type: "choice", items: [
    ["Die Mutter darf nichts vom Mauerfall erfahren", "Good Bye, Lenin!", ["Good Bye Lenin", "Goodbye Lenin"]], ["U-Boot im Zweiten Weltkrieg", "Das Boot"],
    ["Ein Stasi-Hauptmann hört ein Künstlerpaar ab", "Das Leben der Anderen"], ["Ex-Häftling wird Aushilfslehrer Zeki Müller", "Fack ju Göhte", ["Fack ju Goehte"]],
    ["Die letzten Tage im Führerbunker", "Der Untergang"], ["Antikriegsfilm, Oscar 2023", "Im Westen nichts Neues"],
    ["Klatschreporter muss Sozialstunden im Kinderhort leisten", "Keinohrhasen"], ["Schulprojekt zur Autokratie gerät außer Kontrolle", "Die Welle"],
    ["Vater mit falschen Zähnen besucht seine Tochter", "Toni Erdmann"], ["WM-Finale 1954 als Familiendrama", "Das Wunder von Bern"] ] },

  { q: "Hat der Film den Oscar als „Bester Film“ gewonnen?", type: "tf", items: [
    ["Titanic", true], ["Forrest Gump", true], ["Gladiator", true], ["Der Herr der Ringe: Die Rückkehr des Königs", true], ["Parasite", true],
    ["Oppenheimer", true], ["Avatar", false], ["Pulp Fiction", false], ["Krieg der Sterne", false], ["The Dark Knight", false] ] },

  { q: "Zu welcher Filmreihe gehört der Titel?", type: "choice", items: [
    ["Die zwei Türme", "Der Herr der Ringe", ["Herr der Ringe"]], ["Der Feuerkelch", "Harry Potter"], ["Skyfall", "James Bond", ["Bond", "007"]],
    ["Endgame", "Avengers", ["Marvel", "The Avengers"]], ["Fremde Gezeiten", "Fluch der Karibik", ["Pirates of the Caribbean"]], ["Reloaded", "Matrix"],
    ["Tokyo Drift", "The Fast and the Furious", ["Fast & Furious", "Fast and Furious"]], ["Phantom Protokoll", "Mission: Impossible", ["Mission Impossible"]],
    ["Breaking Dawn", "Twilight", ["Bis(s)", "Biss"]], ["Das Königreich des Kristallschädels", "Indiana Jones"] ] },

  { q: "Wie heißt die Filmfigur?", type: "choice", items: [
    ["Hobbit, der den Ring nach Mordor trägt", "Frodo", ["Frodo Beutlin"]], ["Kleiner grüner Jedi-Meister", "Yoda"], ["Clownfisch-Vater in „Findet Nemo“", "Marlin"],
    ["Löwenjunges in „Der König der Löwen“", "Simba"], ["Pirat mit Kompass, der nicht nach Norden zeigt", "Jack Sparrow", ["Captain Jack Sparrow"]],
    ["Königin mit Eiskräften", "Elsa"], ["Spielzeug-Astronaut in „Toy Story“", "Buzz Lightyear", ["Buzz"]], ["Kleiner Droide, der piept", "R2-D2", ["R2D2"]],
    ["Superschurke mit den Minions", "Gru"], ["Erfinder der Zeitmaschine in „Zurück in die Zukunft“", "Doc Brown", ["Emmett Brown", "Doc"]] ] },

  { q: "In welchem Jahrzehnt startete die Serie?", type: "decade", items: [
    ["Derrick", 1970], ["Dallas", 1970], ["Knight Rider", 1980], ["Baywatch", 1980], ["Akte X", 1990],
    ["Die Sopranos", 1990], ["Lost", 2000], ["Mad Men", 2000], ["Sherlock", 2010], ["Wednesday", 2020] ] },

  { q: "In welcher Stadt spielt die Serie oder der Film?", type: "choice", items: [
    ["Breaking Bad", "Albuquerque"], ["Die Simpsons", "Springfield"], ["Babylon Berlin", "Berlin"], ["Notting Hill", "London"], ["The Wire", "Baltimore"],
    ["Grey's Anatomy", "Seattle"], ["Dexter", "Miami"], ["Die fabelhafte Welt der Amélie", "Paris"], ["Kir Royal", "München"], ["Friends", "New York"] ] },

  { q: "Film & Serien in Zahlen", type: "num", items: [
    ["Staffeln von „Breaking Bad“", 5], ["Staffeln von „Game of Thrones“", 8], ["Staffeln von „Friends“", 10], ["Staffeln von „The Office“ (US)", 9],
    ["Staffeln von „Sherlock“", 4], ["Staffeln von „Dark“", 3], ["Staffeln von „Stranger Things“", 5], ["Oscars für „Titanic“", 11],
    ["Startnummer der Hauptfigur in „Squid Game“", 456], ["Hausnummer von Sherlock Holmes in der Baker Street", 221] ] },

  { q: "Hat Steven Spielberg bei diesem Film Regie geführt?", type: "tf", items: [
    ["Der weiße Hai", true], ["E.T. – Der Außerirdische", true], ["Jurassic Park", true], ["Schindlers Liste", true],
    ["Jäger des verlorenen Schatzes", true], ["Der Soldat James Ryan", true], ["Krieg der Sterne", false], ["Titanic", false],
    ["Avatar", false], ["Zurück in die Zukunft", false] ] },

  { q: "Wo lief die Sendung zuerst?", type: "choice", items: [
    ["Stranger Things", "Netflix"], ["The Mandalorian", "Disney+", ["Disney Plus", "Disney"]], ["The Boys", "Prime Video", ["Amazon Prime", "Amazon", "Prime"]],
    ["Ted Lasso", "Apple TV+", ["Apple TV", "Apple"]], ["Game of Thrones", "HBO"], ["Babylon Berlin", "Sky", ["Sky und ARD"]], ["Tatort", "ARD", ["Das Erste"]],
    ["Wetten, dass..?", "ZDF"], ["Germany's Next Topmodel", "ProSieben", ["Pro7", "Pro Sieben"]], ["Ich bin ein Star – Holt mich hier raus!", "RTL"] ] },

  { q: "Hat der Schauspieler / die Schauspielerin einen Oscar gewonnen?", type: "tf", items: [
    ["Leonardo DiCaprio", true], ["Tom Hanks", true], ["Anthony Hopkins", true], ["Christoph Waltz", true], ["Meryl Streep", true],
    ["Cillian Murphy", true], ["Johnny Depp", false], ["Tom Cruise", false], ["Harrison Ford", false], ["Keanu Reeves", false] ] },

  { q: "Wie heißt die Hauptfigur der Serie?", type: "choice", names: true, items: [
    ["Breaking Bad", "Walter White", ["Heisenberg"]], ["Dr. House", "Gregory House"], ["Mad Men", "Don Draper"], ["Die Sopranos", "Tony Soprano"],
    ["How I Met Your Mother", "Ted Mosby"], ["The Office (US)", "Michael Scott"], ["Haus des Geldes (das Mastermind)", "Der Professor", ["Professor", "El Profesor"]],
    ["Better Call Saul", "Saul Goodman", ["Jimmy McGill"]], ["Peaky Blinders", "Thomas Shelby", ["Tommy Shelby"]], ["Two and a Half Men", "Charlie Harper"] ] },

  { q: "Fantasy-Welten: Wie heißt …?", type: "choice", items: [
    ["… das Hogwarts-Haus von Harry?", "Gryffindor"], ["… das Haus von Draco Malfoy?", "Slytherin"], ["… das Haus von Luna Lovegood?", "Ravenclaw"],
    ["… das Haus von Cedric Diggory?", "Hufflepuff"], ["… der Stammsitz der Starks?", "Winterfell"], ["… die Hauptstadt von Panem?", "Kapitol", ["Capitol"]],
    ["… Luke Skywalkers Heimatplanet?", "Tatooine"], ["… die Elbenstadt in Mittelerde, in der der Rat tagt?", "Bruchtal", ["Rivendell"]],
    ["… die Heimat der Hobbits?", "Auenland", ["Shire", "das Auenland"]], ["… der dunkle Orden der Jedi-Gegner?", "Sith"] ] },

  { q: "Ordne die Star-Wars-Filme nach Kinostart.", hint: "1 = am frühesten", type: "rank", items: [
    ["Krieg der Sterne", 1], ["Das Imperium schlägt zurück", 2], ["Die Rückkehr der Jedi-Ritter", 3], ["Die dunkle Bedrohung", 4],
    ["Angriff der Klonkrieger", 5], ["Die Rache der Sith", 6], ["Das Erwachen der Macht", 7], ["Rogue One", 8], ["Die letzten Jedi", 9], ["Solo", 10] ] },

  { q: "Ordne die Filme aus der Welt von Harry Potter nach Kinostart.", hint: "1 = am frühesten", type: "rank", items: [
    ["Der Stein der Weisen", 1], ["Die Kammer des Schreckens", 2], ["Der Gefangene von Askaban", 3], ["Der Feuerkelch", 4], ["Der Orden des Phönix", 5],
    ["Der Halbblutprinz", 6], ["Die Heiligtümer des Todes – Teil 1", 7], ["Die Heiligtümer des Todes – Teil 2", 8], ["Phantastische Tierwesen", 9],
    ["Grindelwalds Verbrechen", 10] ] },

  { q: "Welcher Film ist gemeint?", type: "choice", items: [
    ["Ein Mann erlebt denselben Tag immer wieder", "Und täglich grüßt das Murmeltier", ["Murmeltier", "Groundhog Day"]],
    ["Zwei Häftlinge, Flucht durch einen Abwasserkanal", "Die Verurteilten", ["Shawshank Redemption", "Verurteilten"]],
    ["Rote oder blaue Pille?", "Matrix", ["The Matrix"]], ["Ein Mann ohne Kurzzeitgedächtnis notiert alles auf Tattoos", "Memento"],
    ["Erste Regel: Man spricht nicht darüber", "Fight Club"], ["Ein Mann lebt unwissentlich in einer TV-Show", "Die Truman Show", ["Truman Show"]],
    ["Astronaut baut auf dem Mars Kartoffeln an", "Der Marsianer", ["Marsianer", "The Martian"]], ["Zwei Musiker verkleiden sich als Frauen", "Manche mögen's heiß", ["Some Like It Hot"]],
    ["„Ich habe eine Wassermelone getragen“", "Dirty Dancing"], ["Reise durch ein Wurmloch, Vater und Tochter", "Interstellar"] ] },

  { q: "Basiert der Film auf einem Buch?", type: "tf", items: [
    ["Der Pate", true], ["Forrest Gump", true], ["Jurassic Park", true], ["Der Herr der Ringe", true], ["Der weiße Hai", true],
    ["Fight Club", true], ["Krieg der Sterne", false], ["Titanic", false], ["Avatar", false], ["Zurück in die Zukunft", false] ] },

  { q: "Aus welchem Land kommt der Film oder die Serie?", type: "choice", items: [
    ["Parasite", "Südkorea", ["Korea"]], ["Haus des Geldes", "Spanien"], ["Dark", "Deutschland"], ["Die fabelhafte Welt der Amélie", "Frankreich"],
    ["Chihiros Reise ins Zauberland", "Japan"], ["Borgen", "Dänemark"], ["City of God", "Brasilien"], ["Das Leben ist schön", "Italien"],
    ["Ein Mann namens Ove", "Schweden"], ["Fauda", "Israel"] ] },

  { q: "Wer ist gemeint?", hint: "Deutsche Film-Größen", type: "choice", names: true, items: [
    ["Spielte Zeki Müller in „Fack ju Göhte“", "Elyas M'Barek"], ["Ostfriese mit den Ottifanten", "Otto Waalkes", ["Otto"]], ["„Bully“ aus „Der Schuh des Manitu“", "Michael Herbig", ["Bully Herbig", "Bully"]],
    ["„Pappa ante Portas“ und „Ödipussi“", "Loriot", ["Vicco von Bülow"]], ["Hollywood-Regisseur aus Stuttgart: „Independence Day“", "Roland Emmerich"],
    ["Spielte Helena in „Troja“", "Diane Kruger"], ["Komponist von „Der König der Löwen“ und „Inception“", "Hans Zimmer"],
    ["Regisseur von „Das Boot“ und „Troja“", "Wolfgang Petersen"], ["Rannte als Lola", "Franka Potente"], ["Hauptrolle in „Good Bye, Lenin!“", "Daniel Brühl"] ] },

].map((c) => ({ ...c, set: "film" })));
