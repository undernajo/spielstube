# Spielstube

Kleine Online-Spielesammlung für zwei oder mehr Spieler: Zehnkampf (Quiz mit zehn Antworten pro Karte), Stadt, Land, Fluss und Gleiche Wellenlänge.
Es braucht keinen eigenen Server. Die Spielzüge laufen über einen öffentlichen MQTT-Vermittlungsserver (HiveMQ, bei Ausfall EMQX). Das funktioniert hinter jedem Router.

## Spielen

1. Die Seite muss für beide erreichbar sein, am einfachsten so:
   - **GitHub Pages:** Die Seite läuft über GitHub Pages, ein Push auf `main` veröffentlicht sie.
   - Lokal testen: `python3 -m http.server 8000` und http://localhost:8000 in zwei Fenstern öffnen.
2. Einer klickt **Neue Spielstube eröffnen** und schickt den Link (`…?room=ABCDE`) oder den 5-stelligen Code.
3. Der andere öffnet den Link (oder gibt den Code ein). Dann startet der Gastgeber das Spiel.

Der Gastgeber muss die Seite offen lassen, denn das Spiel läuft in seinem Browser.
Lädt er die Seite neu, kann er mit **Laufendes Spiel fortsetzen** weitermachen. Der Mitspieler verbindet sich dann automatisch neu.

Die Spielzüge sind mit einem Schlüssel aus dem Stuben-Code verschlüsselt (AES-GCM). Auch der Kanalname auf dem Server verrät den Code nicht. Nur wer den Code kennt, kann mitlesen oder mitspielen. Dafür muss die Seite über `https://` (z. B. GitHub Pages) oder `http://localhost` geöffnet werden.

## Ordner

- `index.html`, `style.css`: Einstieg und Gestaltung
- `js/`: Spiellogik, ein Skript pro Spiel; `game.js` hält alles zusammen (Verbindung, Lobby, Zehnkampf); `symbole.js`: gezeichnete Spielsymbole
- `js/ansicht/`: Darstellung der einzelnen Spiele; jede Datei bekommt von `game.js` den gemeinsamen Kontext `G` (Helfer wie `esc`, `send`, `render` und aktuelle Werte wie `G.view`, `G.myId`)
- `data/`: Inhalte der Spiele (`*-data.js`, Orte, Länderkarte); `data/fragen/`: Zehnkampf-Karten
- `img/`: Symbole
- `entwuerfe/`: lokale Gestaltungsentwürfe, nicht im Repo (steht in `.gitignore`)

Vor jedem Push (also jeder Veröffentlichung) einmal `./bump.sh` ausführen. Das erhöht die Versionsnummer `?v=` aller eigenen Dateien in `index.html` um eins, damit Browser nichts Altes aus dem Zwischenspeicher nehmen; dieselbe Nummer steht unten auf der Startseite. So zählt sie die Veröffentlichungen (`./bump.sh 20` setzt eine bestimmte Nummer).

## Testen

`npm test` prüft zuerst ohne Browser den Code der Ansichten (`tests/check.js`, z. B. dass keine Ansicht den gemeinsamen Kontext `G` überdeckt). Danach spielt `tests/smoke.js` jedes Spiel einmal mit Gastgeber und Gast in Chrome an und meldet JavaScript-Fehler; bei Antwort sucht Frage wird eine ganze Runde bis zur Auflösung durchgespielt. Die Seite selbst braucht dafür nichts, nur der Test braucht Node und ein installiertes Chrome:

```
cd tests
npm install        # einmalig
npm test           # alle Spiele (dauert gut 2 Minuten)
npm test -- watten schnapsen   # nur bestimmte Spiele
```

Der Test startet einen eigenen kleinen Webserver; die Spielzüge laufen wie beim echten Spielen über den öffentlichen MQTT-Server, es braucht also Internet. Ein anderes Chrome lässt sich mit `CHROME_PATH=…` angeben.

## Spiele

Der Gastgeber wählt in der Lobby das Spiel:

- **Querbeet:** quer durch die Spiele, Etappe für Etappe (5, 8 oder 12 Etappen). Jede Etappe ist eine Kurzfassung: 1 Karte Zehnkampf, 1 Kategorie Höher oder tiefer, 3 Orte „Wo liegt das?“, 5 Gebiete „Länder finden“, 2 Bilder „Von oben“, 1 Buchstabe Stadt, Land, Fluss, 3 Runden Siebzehn und Vier, 3 Runden Stichhaltig (1, 2, 3 Karten) – zu zweit auch Listen-Duell und Antwort sucht Frage (bis 2 Punkte). Pro Etappe zählt die Platzierung (5/3/2 Partypunkte, sonst 1, Gleichstand = gleiche Punkte), das Finale zählt doppelt. Jeder hat einen Joker (eine Etappe zählt doppelt, nicht im Finale). Themen: Gemischt, Südtirol oder Welt. Schwierigkeit Leicht, Gemischt oder Profi – gilt für die Landkarten-Spiele, Höher oder tiefer und (bei „Leicht“: nur leichte Buchstaben) Stadt, Land, Fluss. Bei der Siegerehrung gibt es Auszeichnungen (Kartenleser, Wandelndes Lexikon, Wortakrobat, Achterbahn, Aufholjagd, Glückshand). Zwischen den Etappen: Ergebnis, Zwischenstand und kurze Erklärung des nächsten Spiels; weiter, wenn alle „Bereit“ getippt haben. Der Gastgeber kann einzelne Spiele abwählen.
- **Zehnkampf:** das Quiz mit zehn Antworten pro Karte (siehe unten).
- **Zahlen schätzen** (Höher oder tiefer, Schätzen) und **Hinweis für Hinweis** (eigene Kachel): *Schätzen*: Zahlenfrage (109 Fragen, davon 33 zu Südtirol), am nächsten dran = 3/2/1 Punkte, Volltreffer +1. *Hinweis für Hinweis*: 100 Begriffe (davon 28 zu Südtirol) mit je fünf Hinweisen von schwer bis leicht, alle 8 Sekunden ein neuer, nur ein Versuch – früh richtig = mehr Punkte (5 … 1).
- **Umriss-Rätsel** (in der Landkarte-Kachel): Land, Bundesland, Region oder Kanton am Umriss erkennen; richtig 2 Punkte, der Schnellste +1.
- **Listen-Duell (zu zweit):** Thema mit fester Antwortliste (110 Themen), abwechselnd eine Antwort nennen – wer patzt, wiederholt oder die Zeit überzieht, verliert die Runde.
- **Antwort sucht Frage (zu zweit):** Einer bekommt Kategorie und Antwort – wahlweise drei zur Auswahl – und erfindet eine passende Frage, der andere beantwortet sie. Passen und Beschwerde über unpassende Fragen möglich.
- **Landkarte:** fasst in der Lobby „Wo liegt das?“, „Länder finden“ und „Von oben“ zusammen; die Spielart wählt der Gastgeber.
- **Länder finden:** Ein Land wird genannt, alle tippen es auf einer Umrisskarte ohne Namen an. Karten: Europa, Afrika, Asien, Amerika, Welt sowie deutsche und österreichische Bundesländer, italienische Regionen und Schweizer Kantone. Richtig = 100 Punkte, die Schnellsten bekommen +30/+20/+10. Kleinstaaten als Kreise. Grenzen: Natural Earth (gemeinfrei); die Kartendatei wird erst geladen, wenn das Spiel gewählt ist.
- **Stadt, Land, Fluss:** Der Buchstabe wird vor jeder Runde „gedreht“. Kategorien: Jede Runde neu (6 aus 60), Klassisch, Gemischt, Spaß, Südtirol oder eigene – auf Wunsch jede Runde eine 🎁 Überraschungskategorie dazu. Buchstaben: alle (ohne C, J, Q, X, Y) oder nur leichte (A B D F G H K L M P R S T W). 3/5/8 Runden, „Stopp!“ (erst wenn alle Felder ausgefüllt sind) mit 10 Sekunden Nachfrist oder feste Zeit; wissen alle nicht weiter, endet die Runde auf gemeinsamen Wunsch. Punkte: 10 für eine eigene Antwort, 5 bei gleicher Antwort, 20 wenn nur einer etwas hat. Auswertung Kategorie für Kategorie: Stimmt die Mehrheit gegen eine Antwort (👎), zählt sie nicht; mit 👍 lässt die Mehrheit eine Antwort mit falschem Buchstaben doch gelten.
- **Gleiche Wellenlänge:** kooperativ. Alle schreiben geheim ein Wort zum Impuls. Bei gleichem Wort gibt es Teampunkte (10/8/6/4/2/1), sonst werden die Wörter zum neuen Impuls („Was verbindet … und …?“). Impuls-Pakete: Alltag, Essen & Trinken, Südtirol, Film & Musik, Albern oder alle gemischt.
- **Wo liegt das?:** Ein Ort wird genannt, alle tippen gleichzeitig auf die Karte (Satellitenbild ohne Beschriftung). Je näher, desto mehr Punkte (bis 1000). Regionen: Südtirol (104 Orte), Italien (93), Deutschland/Österreich/Schweiz (123), Europa (132), Welt (129). Schwierigkeit: Leicht (nur bekannte Orte), Gemischt oder Profi (nur schwere). Orte wiederholen sich erst, wenn alle der Auswahl dran waren (gemerkt auf dem Gerät des Gastgebers). 5/10/15 Runden, 30 oder 60 Sekunden oder ohne Zeitlimit. Kartenbilder von Esri, Kartenbibliothek Leaflet.
- **Von oben:** Wie „Wo liegt das?“, aber statt des Namens sieht man den Ort ganz nah im Satellitenbild (nur die Art wird verraten, z. B. „See“). Alle 5 Sekunden zoomt das Bild heraus. Punkte mal Faktor: früh getippt ×1, dann ×0,85, ×0,7 … bis ×0,4. Eigene feste Liste mit den wichtigsten Städten (Südtirol, Italien, D/A/CH, ein paar europäische Hauptstädte) und einigen Orten, die man von oben gut erkennt, z. B. Reschensee mit Kirchturm oder Sirmione.
- **Höher oder tiefer:** Ein Begriff mit Wert (z. B. „Schlern – 2.563 m“), daneben der nächste ohne Wert. Alle tippen gleichzeitig „höher“ oder „tiefer“ (bei Jahreszahlen „später“/„früher“), richtig = 1 Punkt. 16 Kategorien (Berge, Gipfel in Südtirol, Flüsse, Südtiroler Gemeinden, Länder, Seen, Bauwerke, Geschichte, Filme, Essen, Tiere, Olympische Winterspiele, Lieder …), je 6 Vergleiche; Länge 3, 5 oder 8 Kategorien. Schwierigkeit: Leicht (nur deutliche Unterschiede, mindestens 1,5-fach bzw. 15 Jahre), Gemischt oder Profi (möglichst knappe Vergleiche). Gut zu zweit, ohne Zeitdruck.
- **Kartenspiele für alle** (Kacheln „Schnelle Kartenrunde“ mit Siebzehn und Vier und Busfahrt sowie „Stichhaltig“; Watten und Schnapsen stehen unter „Klassiker zu zweit“): *Siebzehn und Vier*: Jeder gegen jeden – Karte ziehen oder aufhören, wer am nächsten an 21 liegt, gewinnt (3/2/1 Punkte, genau 21 +1, zwei Asse = „Feuer“ schlagen alles, über 21 = 0). Die eigenen Karten sieht nur man selbst. *Stichhaltig*: Stichspiel mit Ansage – Runde 1 eine Karte, Runde 2 zwei usw. (4, 6 oder 8 Runden); aufgedeckte Karte bestimmt Trumpf, alle sagen gleichzeitig geheim an, wie viele Stiche sie machen, dann wird reihum gespielt (Farbe bedienen, Trumpf sticht). Genau getroffen = 10 + 2 pro Stich, daneben = −2 pro Stich Abweichung. *Busfahrt*: Pro Runde 5 Stationen (Figur oder Zahl – das Ass zählt als Figur –, höher/tiefer, zwischen/außerhalb, Farbe genau, Wert genau – 1/1/2/10/30 Punkte; gleich hoch zählt bei 2 und 3 für den Spieler). Richtig = Punkte in den Rundentopf, falsch = Topf weg; ab Station 2 kann man aussteigen und den Topf sichern. 1, 3 oder 5 Runden. Alle drei auch als Querbeet-Etappe.
- **Almsommer:** Roll & Write mit Südtirol-Bezug für 1–8 Spieler, alle gleichzeitig. Jeder hat dasselbe Tal (11 × 8 Felder: Wiese, Wald, Fels, Bach, Hütten, zwei Gipfel). Jede Woche fallen 3 Würfel für alle; jeder Würfel zeigt Gelände und Zahl – nimm einen und kreuze bis zu so viele Felder dieses Geländes an (zusammenhängend, angrenzend an Angekreuztes, Start am Hof). Fertige Flächen bringen die Punkte, die auf ihnen stehen (Hütte +2, Gipfel +5); wer eine Hütten- oder Gipfelfläche als Erster fertig hat, bekommt +2. ⚡ = Gewitter, beim 5. ist der Sommer vorbei (sonst nach 14 Wochen); „Kurzer Sommer“: 8 Wochen ohne Gewitter. Länge, Gewitter und Erstbonus wurden per Simulation abgestimmt. Auch als Querbeet-Etappe (6 Wochen).
- **Watten:** das Südtiroler Kartenspiel zu zweit, mit eigenem Kartenblatt (33 Karten inkl. Weli – in der Lobby wählbar als kleinste Schelle oder kleinster Trumpf). Nicht-Geber sagt den Schlag (auch der Weli ist möglich), Geber den Trumpf – jeweils durch Tippen auf eine eigene Karte; Guter (Trumpf einen Rang über dem Schlag, beim Ass oder Weli die Sieben) vor Rechtem; Trumpf zugeben; Bieten (+1, abgelehnt = bisheriger Wert); gestrichen 2 Punkte vor dem Ziel, „4 gehen“ bei mindestens 4 Punkten Rückstand (der Gestrichene muss vor seiner ersten Karte halten oder gehen – gehen = Gegner +2). Spiel bis 11, 15 oder 18. Die Hände werden nur an den jeweiligen Spieler geschickt.
- **Schnapsen (66):** zu zweit mit 20 Karten aus dem eigenen Blatt. Talon mit Trumpf, 20/40 ansagen, Trumpf-Unter tauschen, Zudrehen (danach Farb- und Stichzwang), Aus bei 66 Augen; 3/2/1 Punkte, 7 Punkte = Bummerl. Spielweise „Gemütlich“ (Augen werden angezeigt) oder „Klassisch“ (selbst mitzählen und „Aus!“ sagen).

## Extras

- **Kamera & Mikrofon:** Über 📷 und 🎤 kann jeder Kamera und Mikrofon getrennt einschalten (Bild-im-Bild, Ton der anderen mit 🔊/🔇 stummschaltbar; am besten mit Kopfhörern). Bild und Ton gehen per WebRTC verschlüsselt direkt von Gerät zu Gerät, der Verbindungsaufbau läuft über den verschlüsselten Kanal der Stube (STUN: Cloudflare/Google, kein eigener Server). In manchen Mobilfunk- oder Firmennetzen kommt keine direkte Verbindung zustande – dann erscheint ein Hinweis. Ein- und Ausschalten unterbricht die Verbindung nicht (nur die jeweilige Spur wird getauscht). Die Bildqualität richtet sich nach der Ansicht beim Empfänger: kleines Kamerafenster ca. 320×180, vergrößert 640×360, großes Anruf-Fenster in der Lobby 1280×720; ist das Fenster zugeklappt, pausiert das Bild. Das spart vor allem am Handy Upload.

- **Töne & Effekte:** Ein dezenter Hinweiston (und auf Android eine Vibration), wenn man dran ist oder entscheiden soll, Konfetti am Spielende. Ist der Tab im Hintergrund, zeigt der Titel „● Du bist dran!“. Der 🔊-Knopf oben schaltet den Ton stumm.
- **Fragen-Sets kombinieren:** In der Lobby wählt der Gastgeber per Häkchen beliebige Sets (Standard 359 – inklusive der Teile „Tiere & Natur“, „Geschichte“ und „Sprichwörter & Redensarten“ –, Südtirol 58, Wirtschaft 49, Emoji & Flaggen 45, Weihnachten & Winter 35, Film & Serien 39, Kindheit der 2000er 45 Karten – insgesamt 630) oder mit „Alle auswählen“ alles. Die Auswahl wird gemerkt. Gemischt wird pro Paket, nicht pro Karte: Standard kommt doppelt so oft wie jedes andere Paket, alle anderen gleich oft – unabhängig davon, wie viele Karten sie haben. Ist ein kleines Paket durchgespielt, pausiert es, bis alle gewählten Pakete durch sind.
- **Keine Wiederholungen:** Das Spiel merkt sich auf dem Gerät des Gastgebers, welche Karten schon gespielt wurden. Ungespielte Karten kommen zuerst. Sind alle Karten eines Sets durch, beginnt es von vorn. In der Lobby steht bei jedem Set, wie viele Karten noch neu sind. Mit „Gespielte Karten vergessen“ setzt man den Speicher zurück.
- **Einspruch:** Nach jedem Zug kann jeder Spieler „Zug zurücknehmen“ (z. B. bei einem Fehlklick) oder „Wertung umdrehen“ (richtig ↔ falsch) beantragen. Ein Mitspieler muss zustimmen.
- **Karte melden:** Über „⚑ Karte melden“ unter der Karte. Die Meldungen landen beim Melder und beim Gastgeber. Auf der Startseite und in der Lobby kann man die Liste unter „Gemeldete Karten“ kopieren.

## Regeln (kurz)

Eine Karte hat 10 Antworten. Wer am Zug ist, beantwortet eine davon oder passt.
Eine richtige Antwort bringt +1 Punkt für die Runde. Bei einer falschen Antwort sind alle Punkte dieser Runde weg und man ist raus.
Wer passt, sichert seine Rundenpunkte. Gewonnen hat, wer zuerst die Zielpunktzahl erreicht.

## Eigene Fragen

Die Karten stehen in `data/fragen/`: `standard-*.js` für das Standard-Set, `<set>.js` (z. B. `suedtirol.js`) für die übrigen Sets. Mit `emoji: true` an einer Karte werden die Begriffe groß und mit Emoji-Schrift dargestellt (wichtig für Flaggen unter Windows). Jede Karte hat genau 10 Antworten. Es gibt sechs Typen:

| Typ | Spielweise | Antwort im Code |
|---|---|---|
| `tf` | Nur zutreffende Antworten antippen. Trifft eine nicht zu, ist man raus. | `true` / `false` |
| `num` | Zahl eingeben, sie muss exakt stimmen („drei“ und „42,195“ gehen auch). | Zahl |
| `rank` | Platz 1–10 per Knopf wählen. | 1–10 |
| `decade` | Jahrzehnt eingeben: „80er“, „1980er“, „1985“ oder „Achtziger“. | Startjahr, z. B. `1980` |
| `estimate` | Schätzen. Zählt, wenn höchstens `tol` daneben (Standard 10 %). „1,5 Mio“ wird verstanden. | Zahl |
| `choice` | Freitext. Das Spiel erkennt Tippfehler und Varianten. Bei Unklarheit entscheidet der Mitspieler. | Text |

Bei `choice` kann man als dritten Eintrag weitere Schreibweisen angeben, z. B. `["Mona Lisa", "Leonardo da Vinci", ["Leonardo", "da Vinci"]]`.
Mit `names: true` an der Karte reicht bei Personen der Nachname.
Allgemeine Varianten wie „USA“ und „Amerika“ stehen unten in `data/fragen/standard-1.js` unter `SCHLAU10_ALIASES`.
