#!/usr/bin/env node
/**
 * Corre `npm audit` y falla ante cualquier vulnerabilidad alta/crítica que
 * NO esté en la lista de excepciones documentada (.github/audit-exceptions.json).
 *
 * Evita dos extremos: bajar audit-level a "critical" (esconde altas futuras
 * sin relación con las ya conocidas) y bloquear todo PR por una vulnerabilidad
 * sin fix disponible que ya se evaluó y se decidió posponer.
 *
 * Uso: node scripts/check-audit-exceptions.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const exceptionsPath = path.join(__dirname, "..", ".github", "audit-exceptions.json");
const exceptions = JSON.parse(fs.readFileSync(exceptionsPath, "utf-8"));
const allowedIds = new Set(exceptions.map((e) => e.advisoryId));

let auditJson;
try {
  const output = execSync("npm audit --json", { encoding: "utf-8", maxBuffer: 20 * 1024 * 1024 });
  auditJson = JSON.parse(output);
} catch (err) {
  // npm audit sale con exit code != 0 cuando encuentra vulnerabilidades; el JSON igual va a stdout.
  auditJson = JSON.parse(err.stdout);
}

const unexpected = [];
const covered = new Set();

for (const [pkgName, vuln] of Object.entries(auditJson.vulnerabilities || {})) {
  if (vuln.severity !== "high" && vuln.severity !== "critical") continue;

  for (const via of vuln.via) {
    if (typeof via !== "object") continue; // referencia a otro paquete, no un advisory en sí

    const advisoryUrl = via.url || "";
    const advisoryId = advisoryUrl.split("/").pop();

    if (allowedIds.has(advisoryId)) {
      covered.add(advisoryId);
    } else {
      unexpected.push({ package: pkgName, severity: vuln.severity, title: via.title, url: advisoryUrl });
    }
  }
}

if (unexpected.length > 0) {
  console.error(`\n❌ ${unexpected.length} vulnerabilidad(es) alta/crítica NO documentada(s) en .github/audit-exceptions.json:\n`);
  unexpected.forEach((v) => console.error(`  [${v.severity}] ${v.package} — ${v.title}\n    ${v.url}`));
  console.error("\nSi es una vulnerabilidad nueva: corre `npm audit fix` (o `--force` si aceptas el breaking change).");
  console.error("Si decides posponerla a propósito: agrégala a .github/audit-exceptions.json con justificación y fecha de revisión.\n");
  process.exit(1);
}

const staleExceptions = exceptions.filter((e) => !covered.has(e.advisoryId));
if (staleExceptions.length > 0) {
  console.log("\nℹ️  Excepciones en .github/audit-exceptions.json que ya no aplican (se pueden retirar):");
  staleExceptions.forEach((e) => console.log(`  - ${e.advisoryId} (${e.package})`));
}

console.log(`\n✅ Sin vulnerabilidades altas/críticas fuera de las ${exceptions.length} excepción(es) documentada(s).`);
