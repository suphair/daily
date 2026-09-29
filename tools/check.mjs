import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../data.js", import.meta.url), "utf8");
const window = {};
new Function("window", src)(window);
const DAYS = window.DAYS;

const AUTHORS = new Set(["tolstoy", "paustovsky", "mayakovsky", "prishvin"]);
const KINDS = new Set(["event", "diary", "letter"]);
const LIFE = { tolstoy: [1828, 1910], paustovsky: [1892, 1968], mayakovsky: [1893, 1930], prishvin: [1873, 1954] };
const errors = [];
const pad = n => String(n).padStart(2, "0");

const allKeys = [];
for (let d = new Date(2024, 0, 1, 12); d.getFullYear() === 2024; d.setDate(d.getDate() + 1)) {
  allKeys.push(pad(d.getMonth() + 1) + "-" + pad(d.getDate()));
}
const valid = new Set(allKeys);

for (const key of Object.keys(DAYS)) {
  if (!valid.has(key)) {
    errors.push(`invalid date key ${key}`);
  }
}
const missing = allKeys.filter(k => !DAYS[k]?.length);
if (missing.length) {
  errors.push(`missing ${missing.length} days: ${missing.join(" ")}`);
}

const seen = new Set();
for (const [key, entries] of Object.entries(DAYS)) {
  for (const e of entries) {
    const id = `${key} ${e.author} ${e.year}`;
    if (!AUTHORS.has(e.author)) {
      errors.push(`${id}: bad author`);
    }
    if (!KINDS.has(e.kind)) {
      errors.push(`${id}: bad kind ${e.kind}`);
    }
    if (!Number.isInteger(e.year) || (LIFE[e.author] && (e.year < LIFE[e.author][0] || e.year > LIFE[e.author][1]))) {
      errors.push(`${id}: year outside life`);
    }
    if (typeof e.oldStyle !== "boolean") {
      errors.push(`${id}: oldStyle not boolean`);
    }
    if (key === "02-29" && e.year % 4 !== 0) {
      errors.push(`${id}: 29 Feb in non-leap year`);
    }
    for (const f of ["text", "quote", "quoteSource", "sourceUrl"]) {
      if (typeof e[f] !== "string" || !e[f].trim()) {
        errors.push(`${id}: empty ${f}`);
      }
    }
    const dup = `${key}|${e.author}|${e.year}|${e.quote}`;
    if (seen.has(dup)) {
      errors.push(`${id}: duplicate`);
    }
    seen.add(dup);
  }
}

const total = Object.values(DAYS).flat();
const by = a => total.filter(e => e.author === a).length;
console.log(`days ${allKeys.length - missing.length}/366, entries ${total.length}:`,
  [...AUTHORS].map(a => `${a} ${by(a)}`).join(", "));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("OK");
