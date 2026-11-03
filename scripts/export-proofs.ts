import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { proofScript, type Level } from "../src/model.ts";
const levels: Level[] = ["dungeon", "workshop"].flatMap((name) =>
  JSON.parse(readFileSync(`src/content/${name}.json`, "utf8")),
);
mkdirSync("artifacts/solutions", { recursive: true });
for (const l of levels)
  writeFileSync(
    `artifacts/solutions/${l.id}.v`,
    proofScript(l, l.solution) + "\n",
  );
