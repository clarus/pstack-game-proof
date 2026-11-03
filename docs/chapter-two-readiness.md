# Chapter 2 local readiness

Updated 3 November 2026. The evidence below was collected for the Chapter 2 implementation on base `5806e25` before committing. The local implementation checks are complete; this chapter has not yet been deployed or tested in X. The existing desktop X screenshot is evidence for the earlier dungeon edition only.

## Implemented experience

Six workshop stations teach specialization, existential introduction/elimination, arbitrary universal inputs, preserving witness identity through an implication, and quantifier order. W04 proves `(forall x : T, P x /\ Q x) -> forall x : T, P x`. W06 proves that one shared witness supplies a witness for each input, then offers a two-input boolean equality comparison: try either candidate and see which input it fails. Rocq fixtures prove both individual existence and shared-witness impossibility.

Each station has its own machine, story, hint, choices and completion/undo appearance in panoramic and compact code-drawn art. Six actual completed proofs trigger the Induction Railway ending. Solving the last station alone does not claim whole-chapter completion. D07 offers Enter Workshop; all stations also remain directly accessible from Chapters.

The soundtrack remains D02, Dust and little treasures, with the existing synthesized effects. It does not switch between rooms or chapters, and starts only after a sound-button gesture. No audio or art downloads, accounts, services, or runtime Rocq are added.

Both proof panes remain visible during proof play. At 320/375×245, each room starts with its scene and Start proof; View room/Continue proof preserves the current history. Wider compact cards retain a miniature beside the proof. Long formulas and contexts scroll inside their visible, keyboard-focusable panes. Declaration types are available below local facts and in Story. The full context is not guaranteed to fit simultaneously in a 245px-high card.

## Links and persistence

- `chapter-1.html`: static dungeon card metadata and player `embed.html?chapter=1`.
- `chapter-2.html`: static workshop card metadata, distinct poster and player `embed.html?chapter=2` (full `chapter` build only).
- `embed.html?chapter=2&level=3`: direct W03 entry, independent of unlocks or local storage.
- `#room=D02` and `#room=W03`: legacy/new room hashes, taking precedence over chapter queries.
- Unqualified root: continue a valid saved room, otherwise D01. Unknown chapters/levels fall back to D01 with a warning.
- Existing `dungeon-1` saves/PQ1 codes still replay because the original dungeon graph and action histories are unchanged. The full edition accepts both D and W histories; limited editions keep separate storage namespaces.

Use actual static chapter pages when posting chapter-specific cards; query parameters do not rewrite static crawler metadata. Browser progress is not promised to synchronize between X and standalone browsing. Copy/restore and expansion carry a validated fragment token.

## Verification evidence

`npm run check` passes content freshness, type checking, 32 runtime tests, 26 Rocq fixtures, exported proof compilation, all authored transitions, 14 fault/normalization checks, and three production builds. Rocq/coqidetop is pinned to 9.0.1, with stdlib 9.0.0. Every one of the 13 canonical scripts ends with checked `Qed`.

| Graph | Levels | States | Offered moves |
| --- | ---: | ---: | ---: |
| Dungeon | 7 | 46 | 102 |
| Workshop | 6 | 40 | 59 |
| Total | 13 | 86 | 161 |

The checker independently parses Rocq's states, compares ordered contexts and goals, and requires rejected choices to fail. Bound names compare by binding structure because Rocq renames binders around introduced witnesses; free object names, types and predicate identity remain exact. Mutations catch wrong witnesses, wrong object types, missing discovered objects, out-of-scope acceptance, wrong-person evidence and free-variable capture. The scratch CLI check changing D01/n1's goal A to B fails with State mismatch. Original dungeon JSON matches the pre-change file byte-for-byte.

Maintenance outcome: **updated**. The baseline check passed before edits. Review of `f6b9ac5..5806e25` found only the earlier `e219363` presentation/coverage change in covered code. The new syntax and chapter graph required an adapter extension; no earlier proof defect was found. A test mutation that merely renamed bound variables correctly passed, so it was corrected to actually capture a free witness. The browser accessibility pass found a skipped heading level; the proof-pane headings now follow the main heading correctly.

Reviewed mappings/hashes are in `verification/dungeon-coverage.json`; run-specific evidence is in `artifacts/rocq-coverage.json`. The local skills were updated and validated; all upstream pstack hashes remain unchanged.

Browser validation is recorded in `artifacts/browser-full-chapter-two.json` (full run) and `artifacts/browser-results.json` (targeted rerun). The full run covers Chromium, Firefox and WebKit, including all six workshop routes at 320×245, 518×292 and desktop, witness rejection/dead-end undo, discovered object display, accessibility, continuous audio selection, old-save compatibility, expansion into a fresh browser context, per-chapter completion, static subdirectory delivery and unavailable-chapter fallback. The initial full run passed 110 of 111 cases; the multi-context WebKit save/audio test exhausted its 30-second total while opening the second context. Its completed assertions passed in the trace. The workflow now has a scoped 60-second total allowance, with normal individual assertion deadlines unchanged; the affected case then passed twice in each of Chromium, Firefox and WebKit (6/6, with WebKit at 21.4s and 23.2s). All 111 unique browser scenarios therefore have passing evidence across the full run and corrected targeted rerun. No application assertions were removed or relaxed.

`REVIEW_URL=http://127.0.0.1:5181 node scripts/capture-workshop.mjs` produced the reviewed scene sheets and screenshots in `artifacts/workshop/`: desktop, mobile, compact 320/375/518/560 widths, and the interactive comparison. Review media and reports stay untracked.

Reproduction commands: `npm run check`; `PROOF_QUEST_WEBKIT_EXECUTABLE=/tmp/proof-quest-webkit/run-webkit bash scripts/test-browser-ci.sh`; then `PROOF_QUEST_WEBKIT_EXECUTABLE=/tmp/proof-quest-webkit/run-webkit bash scripts/test-browser-ci.sh tests/browser/workshop.spec.ts --grep "chapter links preserve" --repeat-each=2`. The temporary WebKit wrapper supplies this workstation’s missing media libraries; CI installs its normal Playwright browser dependencies. Final local skill commands (`npm run test:rocq`, `npm run test:mutations`, `npm test`) also pass after the scratch fault demonstration.

## Delivery budget and limits

The full edition contains both small chapter graphs synchronously. Its conservative compressed total is about **31.5 KiB**, including all assets, both posters and the extra share pages; the ceiling is 150 KiB. Preview and embed-test retain six and one dungeon rooms respectively, with no workshop graph. Exact byte totals and file hashes are in `artifacts/build-*.json`. Deferred chapter loading remains future work because the current bundle is well below budget.

This verifies finite authored moves, not arbitrary tactics, dependent definitions, induction, TypeScript correctness in general, human learning, or X client support. The boolean comparison has a runtime truth-table test plus separate Rocq fixtures. A renamed gate proof compiles locally; a human transfer exercise remains pending. No TLA+ claim is made for the synchronous graph player.

Remaining release gates: beginner playtest, physical-phone touch/readability and listening, screen-reader review, user-authorized Pages publication with profile `chapter`, hosted headers/crawler checks, and workshop testing in desktop/iOS/Android X. Publishing and posting remain separate from this local implementation goal.
