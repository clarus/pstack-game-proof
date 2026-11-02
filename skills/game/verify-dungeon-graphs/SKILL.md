---
name: verify-dungeon-graphs
description: Verify this game's authored dungeon proof states and offered moves against Rocq after changing content, graph generation, replay, or proof export.
---

# Verify dungeon graphs

Run from the repository root with Node 24.13.1, Python 3, Rocq/coqidetop 9.0.1, and installed npm dependencies:

```sh
npm run test:rocq
npm run test:mutations
npm test
```

Every offered accepted move must produce exactly the displayed hypotheses and ordered goals in Rocq; every rejected move must fail. Every completed room must have no remaining obligations and accept `Qed`. Otherwise the game teaches a false proof step or declares an unfinished proof complete.

Rocq checks this property directly; no TLA+ abstraction is needed for these finite, synchronous proof graphs. `scripts/verify_graphs.py` checks all nodes and edges of the actual shipped `src/content/dungeon.json`. It rejects merged paths and cycles: each non-root node has exactly one accepted history. Rejected moves leave history unchanged in `src/model.ts:move`; undo is a prefix replay. The checker uses a fresh Rocq process for each edge, compares complete foreground states, rejects hidden obligations, and checks terminal evars and `Qed`. `scripts/export-proofs.ts` uses the game's actual `proofScript` function; all seven exported solutions are compiled.

## Coverage and synchronization

Read `verification/dungeon-coverage.json` for the last reviewed file hashes and base revision. Initial implementation was verified as **uncommitted work based on `12d38c346227e3615c08085ebcbdb3f5e57e444b`**; that commit does not contain the implementation. Current run evidence is `artifacts/rocq-coverage.json`. Do not move the synchronized revision forward merely because a command passed: first confirm the file/function mapping below still describes the implementation, then record the new revision and hashes.

| Covered file/function | Correspondence |
| --- | --- |
| `scripts/generate-content.ts:applyTactic`, recipes | Offline authoring emits proposed states; Rocq is the independent authority |
| `src/content/dungeon.json` | The exact 7-room published graph; 46 nodes and 102 offered edges at initial verification |
| `src/model.ts:replay`, `move`, `proofScript` | Browser follows authored edges; runtime tests cover replay/rejection/undo, exports compile in Rocq |
| `scripts/verify_graphs.py:Rocq`, `formula`, `state`, `compare`, `paths`, `verify` | Pinned XML adapter, strict formula parser, ordered context/goal comparison, graph constraints |
| `scripts/export-proofs.ts` | Runtime-generated scripts compiled through `Qed` |
| `tests/test_verification.py` | Corrupted goals, false completion, lost AND/OR obligations, leaked branch facts, wrong edges, unsupported syntax |

The logical scope is propositional A/B/C with AND, OR, implication, named assumptions, and the tactics offered by Chapter 1. There are no arbitrary user tactics, quantifiers, dependent definitions, induction, or general state merging. This is exhaustive checking of finite authored moves, **not a proof of arbitrary TypeScript, DOM events, progress storage, audio, or X compatibility**. Runtime/browser tests cover those separately.

## Diagnose and update

A failure includes room, node, tactic, Rocq state, and game state. Read the corresponding recipe and replay the tactic in Rocq. A changed hypothesis order is a real display mismatch. Rocq's `split`/`left` can introduce premises automatically: do not assume they are invalid just because the current outer operator is implication. Unknown printed syntax must fail closed; never delete unsupported text to make comparison pass.

For intended content changes, change the recipe, run `npm run content`, inspect the generated graph, then rerun all checks. Extend the independent adapter and fault cases before adding new syntax. A valid but unhelpful disjunction choice is an accepted edge to an unfinished state, not a rejected tactic.

After changes to this checker, demonstrate a failure on a scratch copy of the actual shipped graph: change D01/n1's conclusion from A to B and run `python3 scripts/verify_graphs.py`; it must fail with a state mismatch. Restore the exact file and rerun the passing checks. The mutation suite also clones the shipped graphs and rejects representative faults; it never modifies the working content. A missed mutation is a checker defect, not evidence to weaken the property.

Record failures and scope in `docs/chapter-one-readiness.md`. Use [maintain-formal-verification-skill](../../pstack/maintain-formal-verification-skill/SKILL.md) when implementation changes have left these mappings or evidence stale. Keep upstream pstack unchanged.
