---
name: verify-rocq-curriculum
description: Check this game's tutorial propositions and tactic examples with local Rocq, and review proof-transition changes against the documented conformance requirements.
---

# Verify Rocq curriculum

Read `docs/game-design.md`, especially the affected chapter and Local Rocq verification. Resolve repository paths from the repository root, not this skill directory.

The executable baseline covers `verification/rocq/Curriculum.v` through `scripts/check_rocq.py`. Run from the root:

```sh
python3 scripts/check_rocq.py
```

It requires Python 3 and Rocq 9.0.1 on PATH, compiles in a temporary directory, and checks that an invalid conjunction proof is rejected. It does not install tools. Treat a missing tool or version mismatch as an environment failure, never a successful verification.

For curriculum edits, verify the actual propositions and tactic sequences, including parameters and scope. Keep ordinary hypotheses reusable. An OR goal chooses one branch; an OR hypothesis requires both cases. Existential introduction requires a witness and evidence; elimination introduces a scoped witness. An arbitrary universal input is not a chosen concrete example. Induction provides a hypothesis only for the smaller structure in the proper branch.

Use `Qed` for completed sample proofs. Do not add `Admitted`, `admit`, or unapproved axioms to make checks pass. Fixtures that use `Fail` must explain an expected rejected tactic through their names; failing one tactic does not establish unprovability. Distinguish valid but unhelpful actions from invalid ones.

When the game graph and Rocq state adapter exist, inspect their real commands before extending this skill. Check every published edge's acceptance and resulting contexts/goals, not merely canonical winning scripts. Test the actual browser reducer against the graph. Exercise mutations that drop branches, leak witnesses, or claim premature completion. Do not invent a transition-check command while that harness is absent.

Report the compiler version, command, covered fixtures, result, and gaps. The current baseline verifies sample proofs only; it cannot establish equivalence of a future JavaScript engine and Rocq. Maintain coverage records tied to actual implementation revisions when that engine exists.
