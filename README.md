# pstack game proof

An X-first, choice-based adventure teaching Rocq through four chapters.

- [Game design](docs/game-design.md): curriculum, interaction, delivery, architecture, verification, and milestones.
- [Implementation roadmap](docs/roadmap.md): task backlog, all 25 core levels, graphics, sound, testing, release, and ten product decisions.
- [Managing skills](docs/skills.md): local skills, pstack provenance, invocation, version control, and updates.
- [Agent guidance](AGENTS.md): repository constraints and skill routing.

Rocq runs during development and verification, never in the browser. Currently this repository contains the design, local skills, and executable curriculum examples. The game and transition checker are not implemented yet.

With Python 3 and Rocq 9.0.1 on PATH:

```sh
python3 scripts/check_rocq.py
```

This checks example proofs and verifies that a deliberately invalid proof is rejected. It does not yet check a game engine.
