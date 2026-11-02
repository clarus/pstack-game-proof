import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { proofScript, type Level } from "../src/model.ts";
const levels: Level[] = JSON.parse(
  readFileSync("src/content/dungeon.json", "utf8"),
);
mkdirSync("artifacts/solutions", { recursive: true });
for (const l of levels)
  writeFileSync(
    `artifacts/solutions/${l.id}.v`,
    proofScript(l, l.solution) + "\n",
  );
