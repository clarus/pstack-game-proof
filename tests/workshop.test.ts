import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseFormula as p,
  format,
  substitute,
  replay,
  move,
  proofScript,
  type Level,
} from "../src/model.ts";
import { fresh, validate, encode, decode } from "../src/progress.ts";
import { entryRoom, chapterLevels } from "../src/chapters.ts";
import { inputs, sharedWitness } from "../src/guarantees.ts";
const dungeon: Level[] = JSON.parse(
  readFileSync("src/content/dungeon.json", "utf8"),
);
const workshop: Level[] = JSON.parse(
  readFileSync("src/content/workshop.json", "utf8"),
);
const campaign = [...dungeon, ...workshop];
for (const level of workshop) {
  test(`${level.id}: quantified formula roundtrip and complete runtime route`, () => {
    assert.deepEqual(p(format(p(level.theorem), true)), p(level.theorem));
    assert.equal(replay(level, level.solution).complete, true);
    assert.equal(replay(level, level.solution.slice(0, -1)).complete, false);
    const script = proofScript(level, level.solution);
    assert.match(script, /\(T : Type\)/);
    assert.match(script, /Qed\.$/);
    for (let i = 0; i < level.solution.length; i++) {
      const history = level.solution.slice(0, i);
      for (const choice of replay(level, history).actions) {
        const result = move(level, history, choice.id);
        if (choice.next === null) assert.deepEqual(result.history, history);
        else
          assert.deepEqual(
            replay(level, result.history.slice(0, -1)),
            replay(level, history),
          );
      }
    }
  });
}
test("substitution preserves shadowing and avoids binding a formerly free object", () => {
  assert.deepEqual(
    substitute(p("forall x : T, P x"), "x", "a"),
    p("forall x : T, P x"),
  );
  const changed = substitute(p("exists y : T, R x y"), "x", "y");
  assert.deepEqual(changed, p("exists y_fresh : T, R y y_fresh"));
  assert.deepEqual(
    substitute(p("R x a /\\ P x"), "x", "b"),
    p("R b a /\\ P b"),
  );
  assert.throws(() => p("forall x, P x"));
  assert.throws(() => p("P (f x)"));
});
test("wrong witness is a valid unfinished goal and undo restores its existential", () => {
  const level = workshop[1],
    history = ["advance"];
  const choice = replay(level, history).actions.find(
    (a) => a.tactic === "exists b.",
  )!;
  const next = move(level, history, choice.id);
  assert(next.accepted);
  assert.deepEqual(replay(level, next.history).goals[0].conclusion, p("P b"));
  assert.equal(replay(level, next.history).complete, false);
  assert.deepEqual(
    replay(level, next.history.slice(0, -1)),
    replay(level, history),
  );
});
test("legacy dungeon codes survive the expanded catalog; workshop histories roundtrip", () => {
  const old = fresh(dungeon);
  old.current = "D03";
  old.histories.D01 = dungeon[0].solution;
  assert.deepEqual(decode(encode(old), campaign), old);
  const next = validate(old, campaign);
  next.current = "W05";
  next.histories.W05 = workshop[4].solution;
  assert.deepEqual(decode(encode(next), campaign), next);
  assert.throws(() => validate(next, dungeon));
  assert.equal(chapterLevels("W01", campaign).length, 6);
});
test("static chapter pages, query levels and legacy hashes choose the intended room", () => {
  const route = (suffix: string, catalog = campaign) =>
    entryRoom(new URL(suffix, "https://example.test/repo/"), catalog);
  assert.deepEqual(route("index.html"), {});
  assert.deepEqual(route("chapter-2.html"), { room: "W01" });
  assert.deepEqual(route("embed.html?chapter=2&level=3"), { room: "W03" });
  assert.deepEqual(route("chapter-2.html#room=D05"), { room: "D05" });
  for (const url of [
    "?chapter=3",
    "?chapter=2&level=0",
    "?chapter=2&level=7",
    "?chapter=2&level=x",
    "#room=W99",
  ])
    assert(route(url).warning);
  assert(route("chapter-2.html", dungeon).warning);
});
test("finite counterexample: each input has a witness but neither is shared", () => {
  for (const input of inputs)
    assert(sharedWitness(input).find((row) => row.input === input)!.works);
  for (const candidate of inputs)
    assert.equal(
      sharedWitness(candidate).every((row) => row.works),
      false,
    );
});
