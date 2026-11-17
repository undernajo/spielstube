// Standard-Set, Teil „Sprichwörter & Redensarten“ (ergänzt die vorhandenen Sprichwort-Karten ohne Doppelungen).
window.SCHLAU10_CARDS.push(...[

  { q: "Ergänze das Sprichwort! (Teil 2)", type: "choice", items: [
    ["Wer zuletzt lacht, ___ am besten", "lacht"], ["Was Hänschen nicht lernt, lernt ___ nimmermehr", "Hans"], ["Wer nicht wagt, der nicht ___", "gewinnt"],
    ["In der Kürze liegt die ___", "Würze"], ["Stille Wasser sind ___", "tief"], ["Der Klügere gibt ___", "nach"],
    ["Wer im Glashaus sitzt, sollte nicht mit ___ werfen", "Steinen", ["Steine"]], ["Besser spät als ___", "nie"],
    ["Kommt Zeit, kommt ___", "Rat"], ["Gut Ding will ___ haben", "Weile"] ] },

  { q: "Ergänze die Redewendung! (Teil 2)", type: "choice", items: [
    ["Jemandem reinen ___ einschenken", "Wein"], ["Den Nagel auf den ___ treffen", "Kopf"], ["Mit der ___ ins Haus fallen", "Tür", ["Türe"]],
    ["___ nach Athen tragen", "Eulen"], ["Perlen vor die ___ werfen", "Säue", ["Schweine"]], ["Die Flinte ins ___ werfen", "Korn"],
    ["Jemandem nicht das ___ reichen können", "Wasser"], ["Auf dem ___ stehen", "Schlauch"], ["Unter einer ___ stecken", "Decke"],
    ["Das fünfte ___ am Wagen sein", "Rad"] ] },

  { q: "Stimmt die Bedeutung?", type: "tf", items: [
    ["Ins Fettnäpfchen treten = sich ungeschickt blamieren", true], ["Blaumachen = nicht zur Arbeit oder Schule gehen", true],
    ["Jemandem auf den Leim gehen = auf jemanden hereinfallen", true], ["Hals- und Beinbruch! = Viel Glück!", true],
    ["Etwas ausbaden müssen = die Folgen tragen müssen", true], ["Den Löffel abgeben = beim Essen aufhören", false],
    ["Kohldampf haben = schlecht riechen", false], ["Mir geht ein Licht auf = mir wird schwindelig", false],
    ["Die Katze aus dem Sack lassen = ein Haustier freilassen", false], ["Jemandem einen Korb geben = ihm etwas schenken", false] ] },

  { q: "Gibt es diese Redewendung wirklich?", type: "tf", items: [
    ["Da steppt der Bär.", true], ["Das ist mir Wurst.", true], ["Ich glaub, mein Schwein pfeift.", true], ["Jemandem auf den Keks gehen.", true],
    ["Alles in Butter.", true], ["Jemandem die Gurke schälen.", false], ["Das ist mir Marmelade.", false], ["Ich glaub, meine Kuh singt.", false],
    ["Den Käse im Regen stehen lassen.", false], ["Mit dem Löffel ins Fenster greifen.", false] ] },

  { q: "Welches Tier steckt in der Redewendung?", type: "choice", items: [
    ["Einen ___ im Hals haben", "Frosch"], ["Wie ein ___ im Porzellanladen", "Elefant", ["Elefanten"]], ["Mit den ___ heulen", "Wölfen", ["Wolf", "Wölfe"]],
    ["___ gehabt! (Glück gehabt)", "Schwein"], ["Den ___ zum Gärtner machen", "Bock"], ["Zwei ___ mit einer Klappe schlagen", "Fliegen", ["Fliege"]],
    ["Wie ein begossener ___", "Pudel"], ["Da lachen ja die ___", "Hühner", ["Huhn"]], ["Ein toller ___ sein", "Hecht"],
    ["Wissen, wie der ___ läuft", "Hase"] ] },

  { q: "Welcher Körperteil steckt in der Redewendung?", type: "choice", items: [
    ["Sein ___ auf der Zunge tragen", "Herz"], ["Etwas übers ___ brechen", "Knie"], ["Haare auf den ___ haben", "Zähnen", ["Zähne", "Zahn"]],
    ["Sich etwas hinter die ___ schreiben", "Ohren", ["Ohr"]], ["Mit einem blauen ___ davonkommen", "Auge"], ["Jemandem unter die ___ greifen", "Arme", ["Arm"]],
    ["Auf großem ___ leben", "Fuß", ["Fuss"]], ["Die ___ voll haben", "Nase"], ["Jemandem den ___ stärken", "Rücken"],
    ["Zwei linke ___ haben", "Hände", ["Hand"]] ] },

]); // gehört zum Standard-Set
