// Orte für „Wo liegt das?“ – [Name, Art, Breitengrad, Längengrad]
window.SCHLAU10_GEO = {
  suedtirol: {
    name: "Südtirol", scale: 10, // km: bei dieser Entfernung gibt es noch ~37 % der Punkte
    bounds: [[46.2, 10.35], [47.12, 12.5]],
    places: [
      ["Bozen", "Stadt", 46.4983, 11.3548], ["Meran", "Stadt", 46.6713, 11.1594], ["Brixen", "Stadt", 46.7150, 11.6560],
      ["Bruneck", "Stadt", 46.7966, 11.9367], ["Sterzing", "Stadt", 46.8960, 11.4330], ["Glurns", "Stadt", 46.6714, 10.5550],
      ["Klausen", "Stadt", 46.6390, 11.5660], ["Leifers", "Stadt", 46.4280, 11.3390], ["Schlanders", "Dorf", 46.6280, 10.7740],
      ["Mals", "Dorf", 46.6870, 10.5470], ["Kaltern", "Dorf", 46.4140, 11.2430], ["Lana", "Dorf", 46.6110, 11.1580],
      ["Neumarkt", "Dorf", 46.3180, 11.2730], ["Salurn", "Dorf", 46.2430, 11.1950], ["Toblach", "Dorf", 46.7300, 12.2200],
      ["Innichen", "Dorf", 46.7330, 12.2810], ["Sexten", "Dorf", 46.7020, 12.3530], ["St. Ulrich in Gröden", "Dorf", 46.5770, 11.6720],
      ["Corvara", "Dorf", 46.5500, 11.8740], ["Sand in Taufers", "Dorf", 46.9200, 11.9550], ["Kastelruth", "Dorf", 46.5670, 11.5600],
      ["Sarnthein", "Dorf", 46.6420, 11.3540], ["St. Leonhard in Passeier", "Dorf", 46.8120, 11.2470], ["Graun im Vinschgau", "Dorf", 46.8050, 10.5440],
      ["Ortler", "Berg", 46.5089, 10.5446], ["Langkofel", "Berg", 46.5281, 11.7330], ["Drei Zinnen", "Berg", 46.6187, 12.3022],
      ["Kronplatz", "Berg", 46.7392, 11.9575], ["Schlern", "Berg", 46.5067, 11.5830], ["Seiser Alm", "Hochalm", 46.5410, 11.6230],
      ["Pragser Wildsee", "See", 46.6943, 12.0857], ["Karersee", "See", 46.4096, 11.5754], ["Kalterer See", "See", 46.3880, 11.2560],
      ["Reschensee", "See", 46.8100, 10.5300], ["Brennerpass", "Pass", 47.0040, 11.5060], ["Stilfser Joch", "Pass", 46.5287, 10.4530],
      ["Timmelsjoch", "Pass", 46.9067, 11.0967], ["Schloss Tirol", "Burg", 46.6935, 11.1500], ["Kloster Neustift", "Kloster", 46.7360, 11.6490],
      ["Ötzi-Fundstelle", "Fundort", 46.7789, 10.8401] ] },

  dach: {
    name: "Deutschland, Österreich & Schweiz", scale: 80,
    bounds: [[45.7, 5.8], [55.2, 17.3]],
    places: [
      ["Berlin", "Stadt", 52.5200, 13.4050], ["Hamburg", "Stadt", 53.5511, 9.9937], ["München", "Stadt", 48.1372, 11.5755],
      ["Köln", "Stadt", 50.9375, 6.9603], ["Frankfurt am Main", "Stadt", 50.1109, 8.6821], ["Stuttgart", "Stadt", 48.7758, 9.1829],
      ["Dresden", "Stadt", 51.0504, 13.7373], ["Leipzig", "Stadt", 51.3397, 12.3731], ["Hannover", "Stadt", 52.3759, 9.7320],
      ["Nürnberg", "Stadt", 49.4521, 11.0767], ["Bremen", "Stadt", 53.0793, 8.8017], ["Kiel", "Stadt", 54.3233, 10.1228],
      ["Rostock", "Stadt", 54.0924, 12.0991], ["Freiburg im Breisgau", "Stadt", 47.9990, 7.8421], ["Erfurt", "Stadt", 50.9848, 11.0299],
      ["Wien", "Stadt", 48.2082, 16.3738], ["Graz", "Stadt", 47.0707, 15.4395], ["Salzburg", "Stadt", 47.8095, 13.0550],
      ["Innsbruck", "Stadt", 47.2692, 11.4041], ["Linz", "Stadt", 48.3069, 14.2858], ["Klagenfurt", "Stadt", 46.6247, 14.3053],
      ["Bregenz", "Stadt", 47.5031, 9.7471], ["Zürich", "Stadt", 47.3769, 8.5417], ["Bern", "Stadt", 46.9480, 7.4474],
      ["Genf", "Stadt", 46.2044, 6.1432], ["Basel", "Stadt", 47.5596, 7.5886], ["Luzern", "Stadt", 47.0502, 8.3093],
      ["Lugano", "Stadt", 46.0037, 8.9511], ["Zugspitze", "Berg", 47.4211, 10.9853], ["Großglockner", "Berg", 47.0745, 12.6941],
      ["Matterhorn", "Berg", 45.9763, 7.6586], ["Brocken", "Berg", 51.7991, 10.6156], ["Schloss Neuschwanstein", "Schloss", 47.5576, 10.7498],
      ["Hallstatt", "Dorf", 47.5622, 13.6493], ["Rheinfall", "Wasserfall", 47.6779, 8.6156], ["Loreley", "Felsen", 50.1395, 7.7290],
      ["Kap Arkona (Rügen)", "Kap", 54.6797, 13.4326], ["Westerland (Sylt)", "Insel", 54.9070, 8.3100], ["Lindau", "Stadt am Bodensee", 47.5460, 9.6840],
      ["Jungfraujoch", "Pass", 46.5475, 7.9853] ] },

  europa: {
    name: "Europa", scale: 300,
    bounds: [[34, -25], [72, 45]],
    places: [
      ["Paris", "Stadt", 48.8566, 2.3522], ["London", "Stadt", 51.5074, -0.1278], ["Rom", "Stadt", 41.9028, 12.4964],
      ["Madrid", "Stadt", 40.4168, -3.7038], ["Lissabon", "Stadt", 38.7223, -9.1393], ["Dublin", "Stadt", 53.3498, -6.2603],
      ["Amsterdam", "Stadt", 52.3676, 4.9041], ["Brüssel", "Stadt", 50.8503, 4.3517], ["Kopenhagen", "Stadt", 55.6761, 12.5683],
      ["Oslo", "Stadt", 59.9139, 10.7522], ["Stockholm", "Stadt", 59.3293, 18.0686], ["Helsinki", "Stadt", 60.1699, 24.9384],
      ["Reykjavík", "Stadt", 64.1466, -21.9426], ["Warschau", "Stadt", 52.2297, 21.0122], ["Prag", "Stadt", 50.0755, 14.4378],
      ["Budapest", "Stadt", 47.4979, 19.0402], ["Athen", "Stadt", 37.9838, 23.7275], ["Bukarest", "Stadt", 44.4268, 26.1025],
      ["Sofia", "Stadt", 42.6977, 23.3219], ["Belgrad", "Stadt", 44.7866, 20.4489], ["Zagreb", "Stadt", 45.8150, 15.9819],
      ["Kiew", "Stadt", 50.4501, 30.5234], ["Riga", "Stadt", 56.9496, 24.1052], ["Vilnius", "Stadt", 54.6872, 25.2797],
      ["Barcelona", "Stadt", 41.3851, 2.1734], ["Venedig", "Stadt", 45.4408, 12.3155], ["Neapel", "Stadt", 40.8518, 14.2681],
      ["Istanbul", "Stadt", 41.0082, 28.9784], ["Edinburgh", "Stadt", 55.9533, -3.1883], ["Monaco", "Stadtstaat", 43.7384, 7.4246],
      ["Valletta (Malta)", "Stadt", 35.8989, 14.5146], ["Dubrovnik", "Stadt", 42.6507, 18.0944], ["Mont-Saint-Michel", "Klosterinsel", 48.6361, -1.5115],
      ["Ätna", "Vulkan", 37.7510, 14.9934], ["Santorini", "Insel", 36.3932, 25.4615], ["Nordkap", "Kap", 71.1685, 25.7838],
      ["Gibraltar", "Felsen", 36.1408, -5.3536], ["Mont Blanc", "Berg", 45.8326, 6.8652], ["Sevilla", "Stadt", 37.3891, -5.9845],
      ["Krakau", "Stadt", 50.0647, 19.9450] ] },

  welt: {
    name: "Welt", scale: 1500,
    bounds: [[-58, -170], [75, 180]],
    places: [
      ["New York", "Stadt", 40.7128, -74.0060], ["Washington, D.C.", "Stadt", 38.9072, -77.0369], ["Los Angeles", "Stadt", 34.0522, -118.2437],
      ["Mexiko-Stadt", "Stadt", 19.4326, -99.1332], ["Toronto", "Stadt", 43.6532, -79.3832], ["Vancouver", "Stadt", 49.2827, -123.1207],
      ["Havanna", "Stadt", 23.1136, -82.3666], ["Rio de Janeiro", "Stadt", -22.9068, -43.1729], ["Buenos Aires", "Stadt", -34.6037, -58.3816],
      ["Lima", "Stadt", -12.0464, -77.0428], ["Santiago de Chile", "Stadt", -33.4489, -70.6693], ["Kairo", "Stadt", 30.0444, 31.2357],
      ["Kapstadt", "Stadt", -33.9249, 18.4241], ["Nairobi", "Stadt", -1.2921, 36.8219], ["Marrakesch", "Stadt", 31.6295, -7.9811],
      ["Moskau", "Stadt", 55.7558, 37.6173], ["Dubai", "Stadt", 25.2048, 55.2708], ["Neu-Delhi", "Stadt", 28.6139, 77.2090],
      ["Peking", "Stadt", 39.9042, 116.4074], ["Tokio", "Stadt", 35.6762, 139.6503], ["Seoul", "Stadt", 37.5665, 126.9780],
      ["Bangkok", "Stadt", 13.7563, 100.5018], ["Singapur", "Stadt", 1.3521, 103.8198], ["Hongkong", "Stadt", 22.3193, 114.1694],
      ["Sydney", "Stadt", -33.8688, 151.2093], ["Auckland", "Stadt", -36.8485, 174.7633], ["Honolulu", "Stadt", 21.3069, -157.8583],
      ["Anchorage", "Stadt", 61.2181, -149.9003], ["Machu Picchu", "Ruinenstadt", -13.1631, -72.5450], ["Mount Everest", "Berg", 27.9881, 86.9250],
      ["Taj Mahal", "Bauwerk", 27.1751, 78.0421], ["Uluru", "Felsen", -25.3444, 131.0369], ["Kilimandscharo", "Berg", -3.0674, 37.3556],
      ["Niagarafälle", "Wasserfall", 43.0828, -79.0742], ["Grand Canyon", "Schlucht", 36.1069, -112.1129], ["Osterinsel", "Insel", -27.1127, -109.3497],
      ["Galápagos-Inseln", "Inseln", -0.7432, -90.3133], ["Reykjavík", "Stadt", 64.1466, -21.9426], ["Istanbul", "Stadt", 41.0082, 28.9784],
      ["Kathmandu", "Stadt", 27.7172, 85.3240] ] },
};
