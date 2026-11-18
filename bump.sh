#!/bin/sh
# Erhöht die Asset-Version (?v=…) aller eigenen Skripte und von style.css in index.html,
# damit Browser nach einer Änderung keine alten Dateien aus dem Zwischenspeicher nehmen.
#   ./bump.sh       → nächste Nummer
#   ./bump.sh 20    → bestimmte Nummer setzen
# Die Symbole (img/…?v=…) haben eine eigene Nummer und bleiben unverändert.
set -e
cd "$(dirname "$0")"

alt=$(grep -o 'js/game\.js?v=[0-9]*' index.html | head -n 1 | sed 's/.*v=//')
if [ -z "$alt" ]; then echo "Keine Versionsnummer an js/game.js in index.html gefunden." >&2; exit 1; fi

neu=${1:-$((alt + 1))}
case "$neu" in ''|*[!0-9]*) echo "Version muss eine Zahl sein: $neu" >&2; exit 1 ;; esac

# nur Einträge mit der aktuellen Nummer, die nicht unter img/ liegen
perl -pi -e "s{((?:src|href)=\"(?!img/)[^\"]+\\?v=)$alt\"}{\${1}$neu\"}g" index.html

anzahl=$(grep -c "?v=$neu\"" index.html)
echo "Asset-Version $alt → $neu ($anzahl Dateien in index.html)"
