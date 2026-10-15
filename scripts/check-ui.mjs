// Fails the lint step when a banned styling pattern sneaks back into src/.
// See the rules at the top of src/components/ui/primitives.tsx.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ALLOW = new Set([
  "components/ui/button.tsx",
  "components/ui/primitives.tsx",
  "components/layout/AppLayout.tsx",
  "components/sections/HeroSection.tsx",
  "index.css",
]);
const BANNED = [
  /text-\[10px\]/,
  /text-muted-foreground\/(50|40|30)/,
  /(?<![:\]])\bopacity-50\b/,
  /\btext-primary(?!-)/,
  /\bbg-primary\//,
  /\bborder-primary\b|\bborder-primary\//,
  /\brounded-xl\b|\brounded-2xl\b/,
  /\bshadow-(sm|md|lg|xl)\b/,
  /\bcontainer mx-auto\b/,
  /className="[^"]*\bprose\b/,
  /\bbg-(info|success|warning|accent)\b/,
  /\bfill-amber/,
  /@\/components\/ui\/badge"/,
  /@\/components\/ui\/card"/,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(p);
  }
  return out;
}

let hits = 0;
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (ALLOW.has(rel)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const re of BANNED) {
      if (re.test(line)) {
        hits++;
        console.log(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}  <- ${re}`);
        break;
      }
    }
  });
}
if (hits) {
  console.error(`\ncheck-ui: ${hits} banned pattern(s). See src/components/ui/primitives.tsx for the rules.`);
  process.exit(1);
}
console.log("check-ui: clean");
