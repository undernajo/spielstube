# Schlaue Zehn

Ein Online-Quiz mit zehn Antworten pro Karte für zwei oder mehr Spieler.
Es braucht keinen eigenen Server. Die Spielzüge laufen über einen öffentlichen MQTT-Vermittlungsserver (HiveMQ, bei Ausfall EMQX). Das funktioniert hinter jedem Router.

## Spielen

1. Die Seite muss für beide erreichbar sein, am einfachsten so:
   - **Netlify Drop:** Ordner auf https://app.netlify.com/drop ziehen und den Link teilen, oder
   - **GitHub Pages:** Repo pushen und Pages aktivieren.
   - Lokal testen: `python3 -m http.server 8000` und http://localhost:8000 in zwei Fenstern öffnen.
2. Einer klickt **Neues Spiel erstellen** und schickt den Link (`…?room=ABCDE`) oder den 5-stelligen Code.
3. Der andere öffnet den Link (oder gibt den Code ein). Dann startet der Gastgeber das Spiel.

Der Gastgeber muss die Seite offen lassen, denn das Spiel läuft in seinem Browser.
Lädt er die Seite neu, kann er mit **Laufendes Spiel fortsetzen** weitermachen. Der Mitspieler verbindet sich dann automatisch neu.

Die Spielzüge sind mit einem Schlüssel aus dem Raum-Code verschlüsselt (AES-GCM). Auch der Kanalname auf dem Server verrät den Code nicht. Nur wer den Code kennt, kann mitlesen oder mitspielen. Dafür muss die Seite über `https://` (z. B. GitHub Pages) oder `http://localhost` geöffnet werden.

## Spiele

Der Gastgeber wählt in der Lobby das Spiel:

- **Schlaue Zehn:** das Quiz mit zehn Antworten pro Karte (siehe unten).
- **Stadt, Land, Fluss:** Buchstabe, Kategorien (Klassisch, Gemischt, Spaß, Südtirol oder eigene), 3/5/8 Runden, „Stopp!“ mit 10 Sekunden Nachfrist oder feste Zeit. Punkte: 10 für eine eigene Antwort, 5 bei gleicher Antwort, 20 wenn nur einer etwas hat. Bei der Auswertung kann jeder Antworten anzweifeln oder anerkennen.

## Extras

- **Töne & Effekte:** Ein dezenter Hinweiston (und auf Android eine Vibration), wenn man dran ist oder entscheiden soll, Konfetti am Spielende. Ist der Tab im Hintergrund, zeigt der Titel „● Du bist dran!“. Der 🔊-Knopf oben schaltet den Ton stumm.
- **Fragen-Sets kombinieren:** In der Lobby wählt der Gastgeber per Häkchen beliebige Sets (Standard 300, Südtirol 50, Wirtschaft 50, Emoji & Flaggen 30, Weihnachten & Winter 20, Film & Serien 20, Kindheit der 2000er 30 Karten – insgesamt 500) oder mit „Alle auswählen“ alles. Die Auswahl wird gemerkt.
- **Keine Wiederholungen:** Das Spiel merkt sich auf dem Gerät des Gastgebers, welche Karten schon gespielt wurden. Ungespielte Karten kommen zuerst. Sind alle Karten eines Sets durch, beginnt es von vorn. In der Lobby steht bei jedem Set, wie viele Karten noch neu sind. Mit „Gespielte Karten vergessen“ setzt man den Speicher zurück.
- **Einspruch:** Nach jedem Zug kann jeder Spieler „Zug zurücknehmen“ (z. B. bei einem Fehlklick) oder „Wertung umdrehen“ (richtig ↔ falsch) beantragen. Ein Mitspieler muss zustimmen.
- **Karte melden:** Über „⚑ Karte melden“ unter der Karte. Die Meldungen landen beim Melder und beim Gastgeber. Auf der Startseite und in der Lobby kann man die Liste unter „Gemeldete Karten“ kopieren.

## Regeln (kurz)

Eine Karte hat 10 Antworten. Wer am Zug ist, beantwortet eine davon oder passt.
Eine richtige Antwort bringt +1 Punkt für die Runde. Bei einer falschen Antwort sind alle Punkte dieser Runde weg und man ist raus.
Wer passt, sichert seine Rundenpunkte. Gewonnen hat, wer zuerst die Zielpunktzahl erreicht.

## Eigene Fragen

Die Karten stehen in `questions.js` bis `questions6.js` (Standard) und in `questions-<set>.js` für die übrigen Sets. Mit `emoji: true` an einer Karte werden die Begriffe groß und mit Emoji-Schrift dargestellt (wichtig für Flaggen unter Windows). Jede Karte hat genau 10 Antworten. Es gibt sechs Typen:

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
Allgemeine Varianten wie „USA“ und „Amerika“ stehen unten in `questions.js` unter `SCHLAU10_ALIASES`.
