// Schnelle Code-Prüfung ohne Browser (läuft vor dem Durchlauf in `npm test`):
// Die Ansichten in js/ansicht/ bekommen den gemeinsamen Kontext als Parameter G. Vergibt eine Ansicht den Namen G
// irgendwo lokal neu (z. B. `const G = …`), zeigen Bezüge wie G.myId ins Leere – der Bildschirm stürzt dann erst
// in diesem einen Spielzustand ab (so geschehen bei der Auflösung von „Antwort sucht Frage“).
const fs = require("fs");
const path = require("path");
const espree = require("espree");
const escope = require("eslint-scope");

const DIR = path.resolve(__dirname, "../js/ansicht");
let problems = 0;
for (const name of fs.readdirSync(DIR).filter((f) => f.endsWith(".js"))) {
  const file = path.join(DIR, name);
  let ast;
  try { ast = espree.parse(fs.readFileSync(file, "utf8"), { ecmaVersion: "latest", loc: true, range: true }); }
  catch (e) { console.log(`✗ ${name}: Syntaxfehler – ${e.message}`); problems++; continue; }
  const scopes = escope.analyze(ast, { ecmaVersion: 2022 }).scopes;
  const ctx = scopes.flatMap((s) => s.variables).find((v) => v.name === "G" && v.defs[0] && v.defs[0].type === "Parameter");
  if (!ctx) { console.log(`✗ ${name}: Kontext-Parameter G fehlt`); problems++; continue; }
  for (const v of scopes.flatMap((s) => s.variables)) {
    if (v.name === "G" && v !== ctx) { console.log(`✗ ${name}:${v.defs[0].name.loc.start.line}: G wird lokal neu vergeben – bitte anders benennen`); problems++; }
  }
}
if (problems) { console.log(`\n${problems} Problem(e) in js/ansicht/.`); process.exit(1); }
console.log("✓ Ansichten: Kontext G nirgends überdeckt");
