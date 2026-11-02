import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  replay,
  move,
  proofScript,
  parseFormula,
  format,
  type Level,
} from "../src/model.ts";
import {
  fresh,
  validate,
  encode,
  decode,
  load,
  save,
} from "../src/progress.ts";
const levels: Level[] = JSON.parse(
  readFileSync(new URL("../src/content/dungeon.json", import.meta.url), "utf8"),
);
for (const level of levels) {
  test(`${level.id}: complete, undo, replay, and script`, () => {
    const result = replay(level, level.solution);
    assert.equal(result.complete, true);
    assert.equal(result.goals.length, 0);
    assert.equal(replay(level, level.solution.slice(0, -1)).complete, false);
    assert.match(proofScript(level, level.solution), /Qed\.$/);
  });
  test(`${level.id}: rejected actions preserve history`, () => {
    let history: string[] = [];
    for (let i = 0; i < level.solution.length; i++) {
      const node = replay(level, history);
      for (const a of node.actions.filter((a) => a.next === null)) {
        const r = move(level, history, a.id);
        assert.deepEqual(r.history, history);
        assert.equal(r.accepted, false);
      }
      history.push("advance");
    }
  });
}
test("OR cases retain both goals and isolate facts", () => {
  const level = levels[5];
  const node = replay(level, level.solution.slice(0, 4));
  assert.equal(node.goals.length, 2);
  assert(node.goals[0].context.some((h) => h.name === "HA"));
  assert(!node.goals[1].context.some((h) => h.name === "HA"));
  assert(node.goals[1].context.some((h) => h.name === "HB"));
});
test("wrong OR choice is legal and undo restores the choice", () => {
  const l = levels[4],
    history = ["advance"];
  const n = replay(l, history);
  const wrong = n.actions.find((a) => a.tactic === "left.")!;
  assert(wrong.next);
  const r = move(l, history, wrong.id);
  assert.equal(replay(l, r.history).complete, false);
  assert.equal(replay(l, r.history).actions.length, 0);
  assert.deepEqual(replay(l, r.history.slice(0, -1)), n);
});
test("formula parser precedence and rejection", () => {
  const f = parseFormula("A /\\ B -> A \\/ B");
  assert.equal(f.kind, "implies");
  assert.equal(format(f), "((A ∧ B) → (A ∨ B))");
  assert.throws(() => parseFormula("A; admit"));
});
test("progress roundtrip validates all moves", () => {
  const p = fresh(levels);
  p.histories.D01 = ["advance"];
  assert.deepEqual(decode(encode(p), levels), p);
  assert.throws(() =>
    validate({ ...p, histories: { D01: ["bogus"] } }, levels),
  );
  assert.throws(() => decode("PQ1." + "A".repeat(25000), levels));
  assert.throws(() => validate({ ...p, volume: NaN }, levels));
  assert.throws(() => validate({ ...p, version: "old" }, levels));
});
test("storage failures leave a playable fresh session", () => {
  const storage = {
    getItem() {
      throw new Error("denied");
    },
    setItem() {
      throw new Error("quota");
    },
  };
  const loaded = load(storage, levels);
  assert(loaded.warning);
  assert.equal(loaded.progress.current, "D01");
  assert.equal(save(storage, loaded.progress), false);
});
test("stale or forged choices are rejected", () => {
  assert.throws(() => move(levels[0], ["advance", "advance"], "advance"));
  assert.throws(() => replay(levels[0], Array(129).fill("advance")));
});
