import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const forbidden = ["619" + "97", "studio" + "-dev"];
const ignored = new Set(["node_modules", ".venv", ".git", ".next", "work", "coverage", "artifacts"]);
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (!/\.(png|jpg|jpeg|gif|ico|woff2?|lock)$/.test(name)) {
      const body = readFileSync(file, "utf8");
      for (const token of forbidden) if (body.includes(token)) throw new Error(`${token} found in ${file}`);
    }
  }
}
walk(process.cwd());
console.log("Network discipline passed: Studionet 61999 only.");
