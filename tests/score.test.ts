import { test } from "node:test";
import assert from "node:assert/strict";
import { scores, scoreEvents, scoreFor } from "../src/score.ts";

test("seven distinct room scores have bounded, repeatable note schedules", () => {
  assert.equal(new Set(scores.map((s) => JSON.stringify(s.melody))).size, 7);
  assert.throws(() => scoreFor("D08"));
  for (const score of scores) {
    assert.equal(score.melody.length, 32);
    let maxSimultaneous = 0;
    const events: { start: number; end: number; gain: number }[] = [];
    for (let step = 0; step < 96; step++) {
      assert.deepEqual(scoreEvents(score, step), scoreEvents(score, step % 32));
      for (const e of scoreEvents(score, step)) {
        assert(
          e.note >= 36 &&
            e.note <= 88 &&
            e.gain > 0 &&
            e.gain <= 0.06 &&
            e.duration > 0.012,
        );
        events.push({
          start: step * score.stepSeconds,
          end: step * score.stepSeconds + e.duration + 0.02,
          gain: e.gain,
        });
      }
    }
    for (const event of events) {
      const sounding = events.filter(
        (e) => e.start <= event.start && e.end > event.start,
      );
      maxSimultaneous = Math.max(maxSimultaneous, sounding.length);
      assert(
        sounding.reduce((sum, e) => sum + e.gain, 0) < 0.5,
        "Music retains headroom at full master volume",
      );
    }
    assert(maxSimultaneous <= 8, "Leave voices for interaction cues");
  }
});
