# Repository guidance

Read `docs/game-design.md` before changing gameplay, curriculum, proof representation, or delivery. The game is X-first and choice-based. Rocq is a local/CI development dependency and must not enter the browser bundle or become a runtime service requirement.

Skills are stored in `skills/` because this managed workspace protects `.agents/`. Load the relevant file explicitly; this routing is not automatic native skill discovery:

- Curriculum and Rocq fixtures: `skills/game/verify-rocq-curriculum/SKILL.md`.
- X embed implementation or release checks: `skills/game/check-x-delivery/SKILL.md`.
- Creating a formal check for implemented code: `skills/pstack/create-formal-verification-skill/SKILL.md`.
- Bringing an existing formal check back in sync: `skills/pstack/maintain-formal-verification-skill/SKILL.md`.
- Inspecting a TLA+ model and its counterexamples: `skills/pstack/statechart/SKILL.md`.

Keep upstream files unchanged; provenance and hashes are in `skills/pstack/UPSTREAM.json`. Put project instructions in `skills/game/`. See `docs/skills.md` for native discovery on a writable checkout.

Run `python3 scripts/check_rocq.py` after changing the Rocq fixtures or runner. Distinguish checked examples, checked game transitions, bounded models, and general proofs. Never label the future engine verified merely because examples compile. Keep proposed paths and commands visibly identified until implemented.
