# Managing repository skills

Keep the skills that define this game's engineering workflow in version control with its code. A checkout should carry the instructions, verification fixtures, scripts, and tool versions needed to reproduce a result. Personal preferences and credentials belong outside the repository.

## What is here

| Location | Purpose | Status |
| --- | --- | --- |
| `skills/pstack/create-formal-verification-skill/` | Select a real property, verify it, and generate a project-specific verification skill | Pinned upstream source |
| `skills/pstack/maintain-formal-verification-skill/` | Reconcile existing verification with code changes | Pinned upstream source |
| `skills/pstack/statechart/` | Inspect TLA+ results and produce statecharts and counterexample paths | Pinned upstream source and runtime resources |
| `skills/game/verify-rocq-curriculum/` | Check this game's sample Rocq proofs and route Chapter 1 transition checks | Local fixture workflow |
| `skills/game/verify-dungeon-graphs/` | Exhaustively compare authored dungeon moves and proof states with Rocq | Generated from the pstack workflow, with tested mutations |
| `skills/game/check-x-delivery/` | Check local compact/static builds, then authorized X delivery | Local commands implemented; live X evidence pending |

The three pstack skills come from `cursor/plugins`, revision `c742dd61706fbacc1b95f1a20b7b988cf096ce6c`. `skills/pstack/UPSTREAM.json` records every included file's SHA-256; `skills/pstack/LICENSE` retains the upstream MIT license. The statechart test corpus is omitted; its scripts and rendering reference are included unchanged. Its upstream package test command therefore is not a runnable test suite in this subset. Run upstream tests in a full checkout when upgrading or modifying that tool.

This is a focused verification subset, not the entire pstack plugin or `poteto-mode`. It does not install Cursor-specific agents or model routing. Statechart's runtime dependencies are development tools: a supported TypeScript runtime, mise, Java/TLC, and optional Pele rendering. Its first real model run can download dependencies. These have not been provisioned or exercised here; they are unnecessary for the current Rocq fixture check.

## How skills relate

A skill is a directory with a `SKILL.md` containing a name, a description used for selection, and instructions. Scripts or references can support it. The agent reads instructions and executes tools; the skill itself is not a program running in the game.

There are two different relationships in pstack:

- Orchestration: a skill directs an agent to another existing skill when that workflow is needed.
- Generation: the creation skill produces a new project-specific skill, together with checks tied to real code. Future agents rerun those checks; maintenance reconciles them when code changes.

Chapter 1 now follows this sequence: implemented graph/replay code → pstack creation workflow → `verify-dungeon-graphs` and the Rocq adapter → rerun after relevant changes → maintenance when verification drifts. The generated skill links actual files, commands, counterexamples, and source hashes. No TLA+ model was needed for this finite, synchronous proof graph; later event-driven systems may warrant one.

The game's correctness comes from executable checks and their stated coverage, not the number of skills or references between them. Keep the local curriculum and delivery skills short and focused; use pstack where its verification workflow adds value.

## Local discovery and invocation

Codex's documented repository discovery directory is `.agents/skills/`; it also supports symlinked skill folders. Names and descriptions are loaded first, and full instructions when selected. Registered skills can be explicitly selected through the skill picker or `$skill-name`. See [official skill documentation](https://learn.chatgpt.com/docs/build-skills).

This managed workspace makes `.agents/` read-only, so the tracked sources live in `skills/` and `AGENTS.md` routes agents to them. They are local and usable by explicit path, but are not claimed to appear in the native skill picker. For example:

```text
Read skills/game/verify-rocq-curriculum/SKILL.md and use it to check the curriculum changes.
```

```text
Read skills/pstack/create-formal-verification-skill/SKILL.md and apply it to the implemented proof-branch completion code.
```

On an ordinary writable checkout, native discovery can use relative directory symlinks. These commands are optional setup, not already performed:

```sh
mkdir -p .agents/skills
ln -s ../../skills/game/verify-rocq-curriculum .agents/skills/verify-rocq-curriculum
ln -s ../../skills/game/verify-dungeon-graphs .agents/skills/verify-dungeon-graphs
ln -s ../../skills/game/check-x-delivery .agents/skills/check-x-delivery
ln -s ../../skills/pstack/create-formal-verification-skill .agents/skills/create-formal-verification-skill
ln -s ../../skills/pstack/maintain-formal-verification-skill .agents/skills/maintain-formal-verification-skill
ln -s ../../skills/pstack/statechart .agents/skills/statechart
```

Inspect existing destinations before running these commands. Keep one canonical copy per skill. A team using symlink discovery can commit the relative links; environments without symlink support can use the explicit paths. Do not change protected workspace permissions to force installation. If discovery does not refresh, restart the client. Duplicate names are not merged automatically.

Upstream files retain their original invocation metadata. Host-specific frontmatter is not a portable enforcement mechanism; this repository's explicit routing and the user's requested scope determine use. Copying a skill does not invoke it or authorize deployment.

## What to commit

- Commit local `SKILL.md` files, needed scripts and references, small proof fixtures, tool-version pins, and maintained coverage records.
- Commit the chosen upstream subset, its license, provenance manifest, and any deliberate discovery links.
- Change code and its corresponding checks/instructions together when their contract changes. A separate upstream update makes review easier.
- Exclude generated proof binaries, temporary model outputs, dependency caches, secrets, personal machine paths, and screenshots without an ongoing purpose.

`AGENTS.md` contains short repository-wide constraints and routing. Skills contain task-specific procedures. The design document owns product decisions. CI should invoke deterministic scripts directly; it should not depend on an agent remembering to read a skill.

Keep reusable personal skills in the user-level location supported by your client. Promote a repository skill to a shared package only after several projects genuinely need it. Avoid duplicate local and global copies with the same name.

## Updating and validating

For local skills, edit the narrow workflow affected by a real change, run its commands, and confirm that the description selects the right tasks. Validate frontmatter and links; then test behavior. Formatting validation alone says nothing about verification quality.

For pstack, choose a new exact upstream revision and review the diff, including downloaded scripts and dependency behavior. Refresh the same selected directories and license, remove upstream-deleted files, regenerate hashes, and exercise the relevant workflows before accepting the upgrade. Keep local overrides outside the vendored directories. There is no automatic “pull latest” during builds.

For generated formal checks, record property, scope, code locations, assumptions, bounds, tool versions, reproduction command, and the revision actually checked. Update the synchronized revision only after checking correspondence. During initial uncommitted work, record that fact and content hashes rather than claiming the current HEAD includes new files. A passing old model can be stale; a changed model can reveal a real bug.

Current validation: the curriculum runner checks 21 sample proofs and an invalid variant; the dungeon adapter checks 46 nodes and 102 offered moves against Rocq, including complete proof exports. Seven mutation tests demonstrate rejected defects. Runtime and browser tests are separate evidence. See `verification/dungeon-coverage.json` and `docs/chapter-one-readiness.md`. Local iframe checks do not supply X-client evidence. The vendored statechart tool remains source-pinned and has not run a model check.
