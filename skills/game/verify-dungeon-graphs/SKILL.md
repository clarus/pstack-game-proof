---
name: verify-dungeon-graphs
description: Verify this game's authored dungeon and workshop proof states and offered moves against Rocq after changing content, graph generation, replay, or proof export.
---

# Verify dungeon and workshop graphs

Run from the repository root with Node 24.13.1, Python 3, Rocq/coqidetop 9.0.1, and installed npm dependencies:

```sh
npm run test:rocq
npm run test:mutations
npm test
```

Every offered accepted move must produce exactly the displayed hypotheses and ordered goals in Rocq; every rejected move must fail. Every completed room must have no remaining obligations and accept `Qed`. Otherwise the game teaches a false proof step or declares an unfinished proof complete.

Rocq checks this property directly; no TLA+ abstraction is needed for these finite, synchronous proof graphs. `scripts/verify_graphs.py` checks all nodes and edges of the actual shipped `src/content/dungeon.json` and `src/content/workshop.json`. It rejects merged paths and cycles: each non-root node has exactly one accepted history. Rejected moves leave history unchanged in `src/model.ts:move`; undo is a prefix replay. The checker uses a fresh Rocq process for each edge, compares complete foreground states, rejects hidden obligations, and checks terminal evars and `Qed`. `scripts/export-proofs.ts` uses the game's actual `proofScript` function; all thirteen exported solutions are compiled.

## Coverage and synchronization

Read `verification/dungeon-coverage.json` for reviewed hashes and the base revision. Chapter 2 is checked as working changes on `5806e25`; its file hashes identify the exact implementation. The original dungeon graph and action histories are unchanged. Current run evidence is `artifacts/rocq-coverage.json`. Before updating the synchronization record, review the file/function mapping below and record the checked revision plus any uncommitted changes. A passing command alone is not a mapping review.

| Covered file/function | Correspondence |
| --- | --- |
| `scripts/generate-content.ts:applyTactic`, `scripts/workshop-content.ts:apply`, recipes | Offline authoring emits proposed states; Rocq is the independent authority |
| `src/environments.ts` | Arrival text included by the generator; hashed for build freshness, with no role in proof semantics |
| `src/content/dungeon.json`, `src/content/workshop.json` | Exact authored graphs: 7 dungeon rooms / 46 nodes / 102 edges, plus 6 workshop stations / 40 nodes / 59 edges |
| `src/model.ts:replay`, `move`, `proofScript` | Browser follows authored edges; runtime tests cover replay/rejection/undo, exports compile in Rocq |
| `scripts/verify_graphs.py:Rocq`, `formula`, `state`, `bound_identity`, `compare`, `paths`, `verify` | Pinned XML adapter, strict formula parser, ordered context/goal comparison, graph constraints |
| `scripts/export-proofs.ts` | Runtime-generated scripts compiled through `Qed` |
| `tests/test_verification.py` | Corrupted goals, false completion, lost AND/OR obligations, leaked branch facts, wrong edges, wrong witness/type, missing scoped objects, free-variable capture, unsupported syntax |

The logical scope includes propositions with AND/OR/implication and first-order predicates on named objects, typed universal/existential binders, and the tactics offered by Chapters 1–2. The independent Python parser retains the complete ordered local context; theorem parameters must match names, order, and types. Bound-variable spelling is compared by binding depth because Rocq may rename a binder to avoid an introduced object. Free object names, domains, predicate identity, quantifier order, and context names remain exact. `tests/test_verification.py` checks that this normalization cannot capture a free witness.

There are no arbitrary user tactics, function-valued witness terms, dependent definitions, induction, or state merging. This is exhaustive checking of 86 authored states and 161 offered moves, **not a proof of arbitrary TypeScript, DOM events, storage, audio, or X compatibility**. Runtime/browser tests cover those separately. The boolean equality counterexample in `src/guarantees.ts` has a truth-table runtime test and separate Rocq existence/nonexistence fixtures; it is not a graph transition.

## Diagnose and update

A failure includes room, node, tactic, Rocq state, and game state. Read the corresponding recipe and replay the tactic in Rocq. A changed hypothesis order is a real display mismatch. Rocq's `split`/`left` can introduce premises automatically: do not assume they are invalid just because the current outer operator is implication. Unknown printed syntax must fail closed; never delete unsupported text to make comparison pass.

For intended content changes, change the recipe, run `npm run content`, inspect the generated graph, then rerun all checks. Extend the independent adapter and fault cases before adding new syntax. A valid but unhelpful disjunction or witness choice is an accepted edge to an unfinished state, not a rejected tactic.

After changes to this checker, demonstrate a failure on a scratch copy of the actual shipped graph: change D01/n1's conclusion from A to B and run `python3 scripts/verify_graphs.py`; it must fail with a state mismatch. Restore the exact file and rerun the passing checks. The mutation suite also clones the shipped graphs and rejects representative faults; it never modifies the working content. A missed mutation is a checker defect, not evidence to weaken the property.

Record failures and scope in `docs/chapter-two-readiness.md` (Chapter 1 history remains in `docs/chapter-one-readiness.md`). Use [maintain-formal-verification-skill](../../pstack/maintain-formal-verification-skill/SKILL.md) when implementation changes have left these mappings or evidence stale. Keep upstream pstack unchanged.
