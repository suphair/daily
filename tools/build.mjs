import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "data");
const days = {};
for (const file of readdirSync(dir).filter(f => f.endsWith(".json")).sort()) {
  for (const { date, ...entry } of JSON.parse(readFileSync(join(dir, file), "utf8"))) {
    (days[date] ??= []).push(entry);
  }
}
const sorted = Object.fromEntries(Object.keys(days).sort().map(k => [k, days[k]]));
writeFileSync(join(root, "data.js"), "window.DAYS = " + JSON.stringify(sorted, null, 1) + ";\n");
console.log("days:", Object.keys(sorted).length, "entries:", Object.values(sorted).flat().length);
