// „Unterm Hammer“ – Sortiment: e = Emoji, n = Name, p = echter Preis in ganzen Euro (gerundet), d = was der Preis ist / Stand.
// Nur Produkte mit festem, nachprüfbarem Preis (Herstellerpreis, Gebühr, Abo, Ticket) – keine Markenartikel, deren Preis je Händler stark schwankt.
// Vor dem Veröffentlichen neuer Einträge den Preis prüfen; ändert sich ein Preis, hier anpassen (n ist der Schlüssel für „schon gespielt“).
(function (root) {
  root.SCHLAU10_AUKTION = [
    { e: "🎮", n: "Nintendo Switch 2 (Konsole, ohne Spiel)", p: 470, d: "Herstellerpreis 469,99 € (2025)" },
    { e: "🎮", n: "PlayStation 5 Pro", p: 800, d: "Herstellerpreis 799,99 € (2024)" },
    { e: "🏎️", n: "Mario Kart World (Switch 2, auf Karte)", p: 90, d: "Herstellerpreis 89,99 € (2025)" },
    { e: "🕹️", n: "Nintendo Switch 2 Pro Controller", p: 90, d: "Herstellerpreis 89,99 € (2025)" },
    { e: "🕹️", n: "PS5-Controller DualSense", p: 75, d: "Herstellerpreis 74,99 €" },
    { e: "🎧", n: "Apple AirPods Pro 3", p: 249, d: "Apple-Preis Deutschland (2025)" },
    { e: "🎧", n: "Apple AirPods 4 (ohne Geräuschunterdrückung)", p: 149, d: "Apple-Preis Deutschland (2024)" },
    { e: "🎧", n: "Sony WH-1000XM6 (Kopfhörer)", p: 449, d: "Herstellerpreis 449 € (2025)" },
    { e: "📱", n: "Apple iPad (A16, 128 GB, WLAN)", p: 379, d: "Apple-Preis Deutschland (2025)" },
    { e: "✏️", n: "Apple Pencil Pro", p: 149, d: "Apple-Preis Deutschland (2024)" },
    { e: "📺", n: "Apple TV 4K (WLAN, 64 GB)", p: 169, d: "Apple-Preis Deutschland" },
    { e: "🖱️", n: "Apple Magic Mouse (USB-C)", p: 89, d: "Apple-Preis Deutschland (2024)" },
    { e: "📍", n: "Apple AirTag (einzeln)", p: 35, d: "Apple-Preis Deutschland" },
    { e: "⌚", n: "Apple Watch Series 11 (42 mm, Alu)", p: 449, d: "Apple-Preis Deutschland (2025)" },
    { e: "📖", n: "Kindle Paperwhite (16 GB, mit Werbung)", p: 170, d: "Amazon-Preis 169,99 € (2024)" },
    { e: "🚢", n: "LEGO Titanic (10294)", p: 680, d: "LEGO-Preis 679,99 €" },
    { e: "🗼", n: "LEGO Eiffelturm (10307)", p: 630, d: "LEGO-Preis 629,99 €" },
    { e: "☕", n: "Bialetti Moka Express, 6 Tassen", p: 35, d: "Herstellerpreis (UVP) laut Händler, um 35 €" },
    { e: "📦", n: "Amazon Prime, ein Jahr (Deutschland)", p: 90, d: "89,90 € pro Jahr" },
    { e: "🚆", n: "Deutschlandticket, ein Monat", p: 63, d: "63 € ab Januar 2026" },
    { e: "🚄", n: "BahnCard 50 (2. Klasse, ein Jahr)", p: 244, d: "Preis der Deutschen Bahn (2025)" },
    { e: "🛣️", n: "Jahresvignette Österreich 2026", p: 107, d: "106,80 €" },
    { e: "🛂", n: "Reisepass Italien (Gebühren)", p: 116, d: "Heft ca. 73,50 € + Stempelmarke 42,50 €" },
    { e: "🛂", n: "Reisepass Deutschland (ab 24 Jahren)", p: 70, d: "Gebühr seit 2025" },
    { e: "🪪", n: "Personalausweis Deutschland (ab 24 Jahren)", p: 46, d: "Gebühr seit 2025" },
    { e: "🪪", n: "Elektronische Identitätskarte Italien", p: 22, d: "ca. 22,21 € (Gebühr + Bearbeitung, je Gemeinde leicht anders)" },
    { e: "📻", n: "Rundfunkbeitrag Deutschland, ein Jahr", p: 220, d: "18,36 € im Monat" },
    { e: "📡", n: "RAI-Gebühr (canone), ein Jahr", p: 90, d: "90 € (2025)" },
    { e: "🍺", n: "Eine Maß Bier auf dem Oktoberfest", p: 15, d: "Durchschnitt 2025, je nach Zelt ca. 14,50–15,80 €" },
    { e: "⛷️", n: "Tagesskipass Cortina d'Ampezzo (Hochsaison)", p: 80, d: "Erwachsene, Saison 2025/26" },
  ];
})(typeof window !== "undefined" ? window : globalThis);
