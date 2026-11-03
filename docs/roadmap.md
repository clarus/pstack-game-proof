# Proof Quest implementation roadmap

Status: Chapters 1–2 implemented for local/browser review, updated 3 November 2026. See [Chapter 2 evidence](chapter-two-readiness.md) and [Chapter 1 evidence](chapter-one-readiness.md) for test scope and remaining release gates. The user selected A for Q1–Q9, with an explicit requirement that the proof state remain visible. GitHub Pages is the first hosting candidate for Q10, subject to an actual X embed test. Chapter navigation and persistence are browser-only.

The [game design](game-design.md) owns gameplay and learning goals. This roadmap owns task order, level inventory, production work, testing, and release gates. Fixed decisions: four chapters in sequence, X-first delivery, choice-based interaction, and Rocq only during development and CI. Keep these documents aligned when a decision changes scope.

## Current state and scope

- [x] Four-chapter design and six-room starting sequence documented.
- [x] Three pstack verification skills vendored with license, pinned revision, and hashes.
- [x] Local curriculum and X-delivery skills added.
- [x] Twenty-six representative Rocq theorems compiled with 9.0.1; invalid-proof and runner mutation checks passed during the design work.
- [x] Seven-room browser game, authored graphs, exhaustive Rocq edge comparison, code-drawn dungeon art, synthesized music/effects, progress codes, static build profiles, and local verification skill.
- [x] CI and manually dispatched Pages workflows authored; first hosted audio failures reproduced and fixed with virtual output. A user-provided desktop X screenshot shows the embedded game; the full client matrix remains pending.
- [x] Six workshop stations, typed quantifiers and witnesses, independent Rocq scope checks, workshop art and ending, finite guarantee comparison, compatible saves, and chapter-specific static share pages.
- [ ] Human learning/listening/device checks, actual hosting response checks, and X-client tests.

The core campaign contains **25 levels: 7 dungeon rooms, 6 workshop stations, 6 railway stations, and 6 observatory stages**. The first public slice is the first six dungeon rooms under the recommended release plan. Core content covers conjunction, disjunction, implication, universal and existential quantification, equality, natural numbers, lists, induction, and a robot invariant. Extra rooms for negation, equivalence, deeper list proofs, and additional invariants are separately tracked below.

A representative proof is not a finished level. Each level also needs choices, intermediate states, hints, feedback, art, sound cues, compact layout, replay, and verification. Existing proof fixtures seed that work; they do not count as completed browser levels.

## Compact X presentation follow-up

The user’s 2 November desktop X screenshot shows room 2 and one lit lantern, but exposes tiny text and absent scenery. This is limited evidence of an embedded session, not a full device/client pass.

- [x] Keep a distinct miniature room, Pip, and visible completion/undo changes in wider compact cards. At widths up to 400px, alternate a room-arrival scene and full-width proof play, with View room / Continue proof and a new arrival at each Next room.
- [x] Increase move labels to 13–14px, facts to 18px, and goals to 20px while keeping both proof panes visible.
- [x] Move secondary tools into More and provide direct expansion with progress transfer.
- [x] Remove the idle prompt in narrow cards and keep the Storeroom/D02 soundtrack continuous across room changes.
- [x] Exercise every room at 320×245 and the screenshot’s approximate 518×292 size; add menu/resize/expansion regressions.
- [ ] Confirm the revised layout on the published X post and on physical phones; retain the existing accessibility and release gates.

## Delivery order and dependencies

| Phase | Work | Depends on | Exit evidence |
| --- | --- | --- | --- |
| P0 | Establish the selected tool/build foundation | Recorded preferences | Reproducible development commands |
| P1 | One-room local playable slice | P0 | D01 plays locally and in compact browser frames; Rocq, art/audio/bundle sample checked |
| P2 | Reusable authoring, verification, and presentation systems | P1 | Branching and scoped witness examples checked; CI catches representative faults |
| P3 | Seven-room local dungeon; six-room public preview later | P2 | Local checks first; beginner and X evidence before public release |
| P4 | Workshop | Local dungeon | W01–W06 implemented; local checks and evidence in Chapter 2 readiness; human/X gates remain |
| P5 | Induction railway | P4 | N01–N06 complete; induction contexts match Rocq |
| P6 | Invariant observatory | P5 | O01–O06 complete; reachability proof and simulator conformance checked |
| P7 | Full-campaign beta and release | P3–P6 | All 25 levels pass release gates; rollback rehearsal succeeds |
| P8 | Maintenance and selected extensions | P7 | Regressions fixed; extensions meet the same checks |

The user changed the sequence to local/browser-first implementation of all seven dungeon rooms. The proof-state representation and Rocq adapter are implemented. Real X embedding is deferred until the local chapter is reviewable and the user can participate; it remains a release gate before publishing the preview. This explicitly supersedes the earlier X-before-content dependency. After P1, chapter art and music can be produced alongside content work using the established palette, formats, and budgets. This is workstream sequencing, not an instruction to spawn agents.

Do not assign calendar promises until P1 establishes authoring effort and device behavior. After P1, measure the time to author, check, illustrate, and playtest a representative branching room; use that to estimate chapter batches, with explicit allowance for induction and invariant work.

## P0 — Decisions and foundation

- [x] F01 Record Q1–Q9 selections, visible proof-state requirement, and GitHub Pages as the Q10 candidate with an X feasibility gate.
- [x] F02 Choose the smallest browser toolchain that supports typed content, static assets, accessible controls, and reproducible builds. Prototype plain TypeScript and semantic HTML first; adopt additional UI machinery only for demonstrated needs.
- [x] F03 Pin the runtime/build tools, package lockfile, Rocq compiler, imported library versions, and local verification adapter. Document a clean-checkout setup.
- [x] F04 Establish separate source, content, authoring, verification, and generated-public-output locations. Configure deployment to publish only built public assets.
- [x] F05 Add development, production build, fixture check, and size-report commands. Add graph checks when implemented; avoid documenting commands that do not exist.
- [ ] F06 Create a small terminology glossary: hypothesis, goal, branch, witness, arbitrary variable, induction hypothesis, invariant. Separate text keys from logic identifiers for later translation.
- [x] F07 Define a task record convention: stable ID, status, dependencies, implementation link, and verification evidence. Tick this roadmap only when its exit evidence exists.

Exit: another checkout can run the actual available commands, and selected product preferences are recorded. Preference answers authorize design choices, not purchases or posting to accounts.

## P1 — One complete room locally; X test deferred

- [x] V01 Build D01 with a visible goal, available facts, two or three choices, feedback, undo, reset, completion, and a proof-script view.
- [x] V02 Represent D01 as a finite authored graph with stable identifiers, typed actions, and explicit proof states. Keep animation state separate.
- [x] V03 Implement the smallest local Rocq adapter needed to replay D01's moves and compare before/after contexts and goals. Independently check the comparison with a deliberately wrong successor state.
- [ ] V04 Build compact and expanded layouts with the active goal and hypothesis pane always visible. Test 320×245, 375×245, and 560×315, then actual X dimensions. Include keyboard input and a touch-only playthrough; reduce decoration before hiding proof state.
- [x] V05 Produce one representative room background, player/guide silhouette, door, fact token, and completion effect. Verify readable proof text over the art.
- [x] V06 Build one generated sound cue and a short optional music loop to measure audio startup, CPU, and payload before selecting the final sound implementation.
- [ ] V07 Test GitHub Pages with real static HTTPS share/embed entry pages, initial-HTML Player Card metadata, and a poster. Check actual response headers and repository-base-path handling; do not assume configurable headers or server rewrites. Generate distinct HTML share pages when metadata must differ by chapter.
- [ ] V08 With an authorized test post, exercise D01 on x.com desktop, iOS, and Android. Record URL, versions, viewport, controls, overlays, storage, audio, and fullscreen behavior.
- [ ] V09 Measure the first room's full gzipped download and interaction responsiveness on an identified mid-range phone. Record device and network assumptions. Start with the design's provisional 150 KiB ceiling.
- [ ] V10 Observe a small beginner playtest: can a person identify the goal, use the assumption, and explain why the move works? Record confusion and revise the room.

Local exit: a complete proof puzzle works in the browser and compact test frames, with Rocq-checked transitions. The hosted/X portion of V07–V09 is deferred by user direction. Before public preview release, test the real X surface and document any limitation. A standalone fallback does not substitute for X-first acceptance.

Local V04 evidence covers 320×245, 375×245, 560×315 and a 390×844 phone viewport, keyboard controls, branch inspection and denied storage. Physical touch-device and X checks remain pending. V09 has a passing build budget, but no physical-phone performance claim.

## P2 — Authoring and shared systems

Completed E01/E02/E06/E07 cover the authored propositional and first-order schemas for Chapters 1–2. E04 offers inspection of any branch while moves operate on the first goal; it does not implement arbitrary Rocq focus. E05 now checks typed quantifiers, parameters, ordered local contexts and free/bound witness identity; dependent definitions remain unsupported for later work. E09 has automatic Continue on load, Next, Chapters, hints, glossary, proof scripts, system reduced-motion preference, and sound controls; both available chapters are directly navigable; later campaign map work remains. E11 is deferred: both chapters together are about 32 KiB gzipped including every static share page and poster, far below the 150 KiB ceiling. Revisit asynchronous packs when their benefit justifies extra loading states. E13 was evaluated: synchronous replay, history-derived completion, and stale-click guards currently warrant real-code tests and direct Rocq comparison; no TLA+ claim is made.

- [x] E01 Specify the level schema: declarations, theorem, nodes, ordered goals, branch contexts, typed actions, edges, exact tactic mapping, hints, display text, and asset references.
- [x] E02 Build structural validation for missing references, duplicate IDs, invalid scopes, unreachable authored nodes, unresolved obligations, and terminal-state inconsistencies.
- [x] E03 Implement deterministic transition/replay code using the same published level data as the UI. Distinguish invalid actions, valid dead ends, and successful moves.
- [x] E04 Implement branch focus, branch completion, undo, restart, and exact action-history export. Test repeated clicks and delayed animation callbacks against stale state.
- [ ] E05 Extend the Rocq adapter to compare full contexts, definitions, goal ordering, binder identity, dependencies, and existential-variable state. Test normalization independently on small fixtures.
- [x] E06 Check every reachable published edge. Preserve separate graph nodes when equivalence across histories has not been established. Record the scope of any bounded sequence tests.
- [x] E07 Export completed routes as readable Rocq scripts, with correct goal focus and branches, and compile representative routes through `Qed`.
- [x] E08 Add namespaced `localStorage` autosaves, schema/content versions, completed levels, current level/action history, settings, and replay validation. Handle quota/permission failures, corrupt saves, migration/reset, and an in-memory fallback. Add Copy progress / Restore progress and optional fragment-based resume links with bounded validation and a non-clipboard fallback. Do not assume iframe and standalone storage are shared or promise automatic cross-device sync.
- [ ] E09 Add Continue, Next, Chapters, a campaign map, hint ladder, glossary, sound settings, reduced-motion settings, and proof-script panel. Keep every released chapter directly accessible; recommend sequential learning without requiring saved unlocks. Mark unreleased chapters coming soon. Use hash navigation so refresh works on static hosting.
- [ ] E10 Build an authoring preview that can jump to a node, inspect its context/choices, and show verification failures. Start with repository files and a simple preview, not a full graphical level editor.
- [ ] E11 Establish chapter pack loading, progress/error states, and retry behavior. A failed download must preserve the active proof and leave recovery possible.
- [x] E12 Generate project-specific verification skills only once actual code and checks exist. Candidate targets: branch completion, witness scope, and undo/replay. Use the pinned pstack creation and maintenance workflows.
- [x] E13 Evaluate whether a small TLA+ model adds coverage for loading, reset, animation, and save interleavings. If used, map actions to code, record bounds, and reproduce counterexamples in real-code tests. Do not use a model pass as evidence for Rocq semantics.

Exit: the framework handles conjunction/disjunction branching and an existential witness example before the whole workshop is authored. A false-completion mutation and a scope-leak mutation are caught.

## Level production checklist

Apply this checklist to every core or extension level. A row in the chapter inventory is complete only when each applicable item is finished; note why an item is inapplicable for a non-proof activity.

- [ ] Define the learning objective, exact declarations/proposition or simulation contract, prerequisite concepts, and success condition.
- [ ] Write the canonical proof and authored alternate routes; compile complete proofs with pinned Rocq.
- [ ] Author reachable nodes and choices, including intentional distractors; mark invalid versus valid-but-unhelpful actions accurately.
- [ ] Compare every published proof edge with Rocq, including branch-local context and witness scope. Check simulation activities against their stated transition contract.
- [ ] Write concise instructions, one concept hint, one move hint, specific error feedback, and the closing explanation.
- [ ] Add chapter art, meaningful transition animation, sound cue references, and reduced-motion behavior.
- [ ] Check compact layout, touch and keyboard controls, focus after transitions, mathematical text, and screen-reader output.
- [ ] Test undo/replay, restart, interrupted loading, save/resume, direct chapter access, and completion/Next behavior as relevant.
- [ ] Playtest a fresh or renamed variant to assess understanding rather than memorized button positions.
- [ ] Record content version, verification evidence, and approval for inclusion in the release artifact.

## P3 and P4 — Chapter 1 inventory

All propositions below quantify the displayed propositional variables. The first six levels are the recommended preview; D07 completes the chapter.

| ID | Level and proof | Production focus | Status |
| --- | --- | --- | --- |
| D01 | Borrowed key: `A -> A` | Introduce a temporary assumption; `exact`; first-room onboarding | Implemented; local checks, human/X gate pending |
| D02 | Open the toolbox: `(A /\ B) -> A` | Unpack facts; keep unused evidence available | Implemented; local checks, human/X gate pending |
| D03 | Two locks: `A -> B -> A /\ B` | Two subgoals; visible branch count; completion waits for both | Implemented; local checks, human/X gate pending |
| D04 | Rearrange the tools: `(A /\ B) -> B /\ A` | Combine destruct and split; demonstrate reusable facts | Implemented; local checks, human/X gate pending |
| D05 | Choose an exit: `B -> A \/ B` | Right is useful; left is legal but leads to an unhelpful goal | Implemented; local checks, human/X gate pending |
| D06 | Both possible worlds: `(A \/ B) -> (A -> C) -> (B -> C) -> C` | Guided implication application, then two independent cases | Implemented; local checks, human/X gate pending |
| D07 | Finale: `A /\ (B \/ C) -> (A /\ B) \/ (A /\ C)` | Nested branching and transfer question on the two OR rules | Implemented; local checks, human/X gate pending |

- [ ] D08 Test D01–D06 as a continuous first-time session before releasing the preview.
- [x] D09 Add D07 and the dungeon completion scene; the chapter menu now opens the implemented workshop and marks Chapters 3–4 coming soon.

Chapter gate: users can explain why an OR hypothesis creates two obligations while an OR goal offers one choice. Verification must catch a missing disjunction branch and premature completion.

## Chapter 1 follow-up — Seven lanterns

Approved after the initial chapter implementation: replace the repeated hall and shared loop with seven distinct environments and seven related compositions. Pip guides the player along a dark route to the Proof Workshop; each solved room lights its own lantern. Direct room access remains available, and the story must not claim unsolved rooms are complete.

| Task | Deliverable | Acceptance |
| --- | --- | --- |
| J01 | Arrival and resolution text for all seven rooms; workshop ending | Short story supports each logical lesson; full ending requires all seven proofs |
| J02 | Entrance, storeroom, cistern bridge, machinery, courtyard, mirror hall, lantern gate | Different composition/landmarks and completed states, original code-drawn art |
| J03 | Seven distinct synthesized loops with a recurring motif | Sparse entrance, plucked store, answering bridge, clockwork, airy courtyard, mirrored phrases, full gate arrangement |
| J04 | Gentle music changes on Next/menu/deep-link/restore | Latest room wins during rapid navigation; mute/background pause remain effective |
| J05 | Compact room identity and lantern progress; story access | Goal, hypotheses and choices remain visible at 320×245, 375×245 and 560×315 |
| J06 | Regression checks and review artifacts | Distinct scenes/scores, completion/undo/save behavior, rendered-audio headroom, three-browser suite, Rocq and build budgets |
| J07 | Updated design, art/audio notes and readiness evidence | Local evidence distinguished from human listening and live X acceptance |

Status: J01–J07 complete locally. Evidence: 81 browser checks, 21 runtime/score tests, 102 Rocq-checked moves, seven fault cases, rendered music previews and scene contact sheets; see [readiness](chapter-one-readiness.md) and [art/audio](art-and-audio.md). No publication is part of this goal. Original proof transitions and save histories remain compatible; reduced motion and silent play remain supported.

## P4 — Chapter 2 inventory

Use explicit `T : Type`, predicates into `Prop`, and inhabitants where needed. Do not assume all types are inhabited.

| ID | Level and proof/activity | Production focus | Status |
| --- | --- | --- | --- |
| W01 | A rule for everyone: `(forall x : T, P x) -> P a` | Select an in-scope specialization term | Implemented locally |
| W02 | Pack a certificate: `P a -> exists x : T, P x` | Witness plus matching evidence | Implemented locally |
| W03 | Open a sealed package: `(exists x : T, P x /\ Q x) -> exists x : T, P x` | Unpack and preserve witness identity | Implemented locally |
| W04 | Build a general rule: `(forall x : T, P x /\ Q x) -> forall x : T, P x` | Arbitrary variables and scoped assumptions | Implemented locally |
| W05 | Open the gate: existence of a key holder plus a universal opening rule implies existence of an opener | Combine witness selection, specialization, and implication | Implemented locally |
| W06 | Compare guarantees: `(exists y : U, forall x : T, R x y) -> forall x : T, exists y : U, R x y` | One shared witness implies per-input existence; show a finite counterexample to the converse | Implemented locally |

For W06, use two objects and equality as the finite illustration: each input can choose itself, but one object cannot equal both distinct inputs. Provide the distinctness evidence explicitly. Do not present an unproved converse as a theorem.

- [x] W07a Add the workshop-to-railway ending, gated on six actual solved proofs, and a renamed gate Rocq fixture.
- [ ] W07b Conduct a human renamed-gate transfer challenge; a compiling fixture is not evidence of player learning.
- [x] W08 Test wrong-person evidence, out-of-scope witnesses, and choosing a concrete input when the goal requires an arbitrary one.

Chapter gate: players distinguish supplying a witness from unpacking one, and a universal input from a convenient example.

Local implementation evidence: six scenes in panoramic and compact forms, completion/undo changes, W06 boolean comparison, scoped-object regression cases, all 59 offered workshop edges checked against Rocq, and existing dungeon histories preserved. D02 music continues across both chapters. `chapter-2.html` provides workshop metadata; `embed.html?chapter=2&level=N` selects a station without a server. See [readiness](chapter-two-readiness.md) for exact commands, measurements and remaining release checks.

## P5 — Chapter 3 inventory

| ID | Level and proof/activity | Production focus | Status |
| --- | --- | --- | --- |
| N01 | Zero and one more: evaluate small nat expressions | Constructors, `simpl`, and `reflexivity`; animate definition unfolding | Planned |
| N02 | Any tower: `forall n : nat, n + 0 = n` | Guided base and successor cases | Planned |
| N03 | Reuse the certificate: solve the successor case with its induction hypothesis | Focused exercise on `rewrite IH`, then transfer to a renamed example | Planned |
| N04 | Empty or another carriage: inspect `[]` and `x :: xs` | Compare `destruct` with `induction`; no induction hypothesis for destruct | Planned |
| N05 | Attach an empty train: `forall xs : list T, xs ++ [] = xs` | Structural list induction | Planned |
| N06 | Count a coupled train: `length (xs ++ ys) = length xs + length ys` | Induction, simplification, and a targeted rewrite | Planned |

- [ ] N07 Add dedicated views for base/step obligations and the induction hypothesis's exact scope.
- [ ] N08 Verify that all scripted simplifications match the selected library definitions; do not silently replace definitional reduction with a stronger lemma.
- [ ] N09 Add the railway completion scene and explain how induction leads to reasoning about executions.

Chapter gate: the player can use a hypothesis about a smaller structure and explain why checking several train lengths is not a universal proof.

## P6 — Chapter 4 inventory

| ID | Level/activity | Production focus | Status |
| --- | --- | --- | --- |
| O01 | Observe robot traces | Deterministic Move/Wait simulation and fuel controls | Planned |
| O02 | Select a claim | Choose conservation `distance + fuel = initialFuel`; compare a weaker bound and false candidates | Planned |
| O03 | Initialize | Prove the invariant from initial values | Planned |
| O04 | Preserve | Prove Move and Wait preserve it; expose the positive-fuel precondition | Planned |
| O05 | All executions | Define reachability and prove conservation by induction; derive the distance bound | Planned |
| O06 | Diagnose a fault | Replay a move that advances twice for one fuel; identify the first invariant violation | Planned |

- [ ] O07 Implement a formal transition relation and reachability theorem. Extend the current one-step fixture; do not treat it as already proving reachability.
- [ ] O08 Test the real simulator against the formal relation, including zero fuel, repeated waits, reset, and bounded generated traces. Record bounds and the simulator's integer limits.
- [ ] O09 If adding a model-checking view, label its explored bound and distinguish it from the general Rocq theorem. Precompute the demonstration; no model checker ships in the browser.
- [ ] O10 Create the campaign completion scene, theorem collection, script exports, replay links, and a short guide to continuing with Rocq outside the game.

Chapter gate: initialization and preservation connect to all reachable executions, and the broken move is demonstrated with a reproducible counterexample.

Chapter 1 production evidence is in [readiness](chapter-one-readiness.md). D08 remains a human beginner session; automated tests complete all seven rooms and cover restore/undo. Level release approval and transfer-learning evidence remain pending.

## Graphics and animation workstream

Selected direction, Q3A/Q4A: warm pixel-art environments drawn in code with a shared palette, plus semantic HTML proof controls. Keep symbols as crisp text rather than baking them into sprites. The active proof-state pane remains visible over or beside the decorative scene.

- [x] G01 Produce a small style sheet: palette, silhouettes, scale, contrast, typography, icon meanings, and motion rules. Compare candidate styles in the actual card dimensions.
- [x] G02 Make a production inventory: player/guide, fact and goal markers, conjunction/disjunction symbols, branch badges, buttons, progress markers, and settings icons.
- [x] G03 Dungeon kit: doors, locks, toolbox, reusable evidence tokens, split-room indicator, and chapter completion scene.
- [ ] G04 Workshop kit: workbench, certificate packages, witness characters, rule machine, and gate.
- [ ] G05 Railway kit: zero/successor blocks, carriage and coupling pieces, empty train, induction certificate, and base/step station markers.
- [ ] G06 Observatory kit: robot, track, fuel gauge, trace timeline, invariant indicator, and broken-move visualization.
- [ ] G07 Implement brief animations for introduce, unpack, split, choose, apply, rewrite, close branch, and finish level. Every animation must have a clear static/reduced-motion equivalent and be interruptible without changing proof state.
- [x] G08 Build the selected asset pipeline: source vectors or sprite definitions, reproducible raster/atlas generation where useful, compression, and per-chapter loading. Keep generation inputs and licenses/provenance alongside assets.
- [ ] G09 If generated raster art is selected, produce references and approved variants, normalize palette and dimensions, remove unwanted lettering/artifacts, and inspect at real display size. Ship optimized assets, not generation tools.
- [ ] G10 Produce card posters, chapter thumbnails, favicon, share artwork, and release screenshots. Include readable alt text where supported.
- [ ] G11 Check visual consistency, color-independent state cues, small-screen readability, atlas edges/scaling, and payload. Report asset contribution to the download budget.

Exit: every core interaction is understandable without animation, and every chapter has a coherent asset kit. Source-generated graphics are a production option; this plan does not require all art to be code.

The seven-lantern follow-up replaces the shared hall with seven distinct scenes, room-specific completion states and actual lantern progress; G03/G07 retain richer per-action/chapter kits as future work. G10 has a poster, favicon, screenshots and video; full-campaign artwork is incomplete. G11 has automated contrast checks and visual inspection; physical-device readability remains a human gate. See [art/audio direction](art-and-audio.md).

## Sound and music workstream

Selected direction, Q5A: deterministic browser synthesis with short effects and four variations on one musical theme. No audio files are required. Songs, patches, and event cues are versioned data/code; sound is optional and never carries unique instructional information.

- [x] S01 Create an audio style sheet: instrument palette, tempo range, loudness targets, cue meanings, and silence policy. Avoid punishing error sounds.
- [x] S02 Prototype a small Web Audio synthesizer and sequencer. Compare pulse/wave/noise voices with a simpler tonal implementation; retain the smallest option that meets the chosen style.
- [x] S03 Keep the authored motif/score sources; use the user-selected D02 arrangement continuously across Chapters 1–2. Per-chapter arrangements are superseded by the continuity preference.
- [ ] S04 Generate cues for selection, valid move, unavailable move, new branch, closed goal, hint, undo, and chapter completion. Limit repeated cues during rapid input.
- [ ] S05 Synchronize optional transitions to musical boundaries and preserve musical position where useful. Music state must not affect deterministic proof replay.
- [x] S06 Implement explicit user activation, mute and volume controls, suspended-context recovery, background pause, resume, and disposal of scheduled voices. Keep the game fully playable when audio cannot start.
- [ ] S07 Cap simultaneous voices; test clipping, excessive volume, clicks, scheduler drift, and CPU on an identified mid-range phone. Listen on phone speakers and headphones.
- [x] S08 Add deterministic checks for note timing, cue mapping, voice lifecycle, mute, and disposal. Use perceptual listening for musical quality; avoid brittle cross-browser bit-identical waveform assertions.
- [x] S09 Verify no audio starts before activation, mute remains effective through chapter changes, and rapid restart/visibility changes do not leave stuck voices.
- [x] S10 Include patches and note data in the measured budget; lazy-load later arrangements. If rendered or generated audio files are chosen instead, compare measured transfer size and document their source/license.

Exit: sound works after user activation on supported clients, has no required role in solving puzzles, and does not cause performance or lifecycle regressions.

S03/S04/S05 produced seven authored scores. The later user direction selects the Storeroom/D02 track for every room and edition, preserving playback across navigation instead of changing music. Tonal/noise cues remain. Per-chapter music changes are superseded by that preference; the implemented workshop keeps the same D02 bus and score. S07 remains physical-device CPU and human listening; offline signal checks do not replace those.

## Testing and continuous verification workstream

Tests run as each feature arrives; P7 consolidates evidence rather than introducing testing for the first time.

| Layer | Tasks and evidence | When |
| --- | --- | --- |
| Rocq content | Compile declarations/proofs, compare intermediate states, reject invalid moves, validate terminal obligations | Every changed level or tactic mapping |
| Graph and runtime | Validate edges/scope; test actual transition, focus, undo, save, and replay code | Every graph/runtime change |
| Fault sensitivity | Drop an OR branch, leak a witness, alter a goal, mark false completion, corrupt a saved action | When adding/changing the corresponding checker |
| Simulator | Check Move/Wait relation, zero fuel, trace replay, and broken move | Observatory changes |
| Browser integration | Visible proof state, touch/keyboard flows, pending loads, hash-link refresh, denied/partitioned storage, progress-code import/export, direct chapter access, rapid actions, background/foreground | Shared UI changes and release candidates |
| Accessibility | Focus, labels, announcements, contrast, zoom, reduced motion, and no-audio completion | Each UI milestone |
| Graphics/audio | Responsive screenshots, asset budgets, listening, clipping, voice lifecycle, visibility and mute | Asset/system changes |
| X delivery | Real posted URL, crawler metadata, frame headers, overlays, storage, client matrix | P1, preview, and final candidate |
| Learning | Beginner observation, next-state prediction, renamed transfer puzzle | Each chapter before release |
| Build/release | Reproducible artifact, payload ceiling, no development-only files, links, cache/version behavior, rollback | Every release |

- [x] T01 Wire deterministic content, graph, runtime, and build checks into CI with pinned dependencies.
- [x] T02 Produce a machine-readable coverage report: level/version, reachable nodes and edges, checked edges, failures, compiler/adapter version, and artifact identity. Incomplete coverage fails the release check.
- [x] T03 Tie the checked content to the published artifact using content hashes. Rebuild after any content change; never publish unverified edits after checks pass.
- [x] T04 Preserve useful regression cases from real bugs. Add lint rules only when they express a recurring error reliably.
- [x] T05 Introduce pstack coverage/synchronization records for implemented formal checks; rerun maintenance when code changes without corresponding verification updates.
- [ ] T06 Define a browser/device matrix and a mid-range reference phone. Separate automated browser results from manual X-app evidence.
- [ ] T07 Define measurable responsiveness and steady-state resource targets after P1 measurements; check idle work, animation stalls, and audio CPU. Avoid claiming a performance result without device/test conditions.
- [x] T08 Maintain a release evidence checklist containing failures, skipped checks, assumptions, and remaining limitations. Missing checks are never recorded as passes.

T01 means workflows are authored and their underlying commands run locally; hosted GitHub execution is pending. T06 uses automated Chromium/Firefox/WebKit on Linux plus compact/mobile viewports; an actual reference phone has not been selected. T07 has no physical-phone performance result.

## P7 — Hosting, beta, and release

- [ ] R01 Start with GitHub Pages: configure a checked public build artifact through GitHub Actions, HTTPS, base paths, static share/embed entry pages, and reproducible deployment/rollback. No domain purchase or application backend is needed for the first test. Inspect actual framing behavior and resolve any host restriction before accepting X compatibility. Account configuration and publication require authorization for those actions.
- [ ] R02 Establish canonical share URLs, chapter/level deep links, metadata/posters, and cache rules for HTML versus versioned assets. Check X's observed card caching behavior on real URLs.
- [ ] R03 Publish an authorized six-room preview under Q9's selected cadence. Include a way to report a broken level with its version and action history, without requiring an account.
- [ ] R04 Run chapter playtests and classify findings as logic, pedagogy, interaction, art/audio, or delivery bugs. Fix blockers before expanding the release audience.
- [ ] R05 Test the full 25-level sequence from clean, resumed, imported-progress, and unavailable-storage sessions. Verify direct access to released chapters, Next/Continue, and all chapter endings. Test the repository Pages base path and standalone-versus-X storage isolation.
- [ ] R06 Finish selected translations, if any; check mathematical notation, text expansion, hints, posters, and script labels. Localization must not change logic identifiers.
- [ ] R07 Review content/asset attribution, imported licenses, public repository exposure, and the release's stated verification scope. Check the built output contains no local secrets or development assets.
- [ ] R08 Prepare release copy, poster, brief gameplay capture, supported-client statement, instructions for continuing in Rocq, and known limitations. Draft X posts for review; do not auto-post.
- [ ] R09 Run all automated gates against the release candidate, then the manual device/audio/accessibility and X matrix. Verify artifact hashes match the tested build.
- [ ] R10 Rehearse a rollback and an old-save/new-content scenario. Ensure a bad chapter can be withdrawn without making the first room unusable.
- [ ] R11 Deploy the authorized candidate, smoke-test production metadata and D01 plus one branching room, and tag the release with its source revision and evidence.
- [ ] R12 Observe launch reports and lightweight operational errors. Begin with explicit bug reports and hosting metrics; add consent-appropriate usage analytics only if a concrete learning question needs them.

Release gate: every included level meets its checklist, all published proof edges are checked, required client results are recorded, the first-load ceiling passes, and no unresolved critical logic, progress-loss, accessibility, or delivery defect remains. Report partial platform support explicitly rather than silently redefining X-first success.

## P8 — Maintenance and optional extensions

- [ ] M01 Triage reported failures by level/content version and reproduce their action history.
- [ ] M02 Fix the defect, add a focused regression check, rerun affected verification, and ship a versioned patch.
- [ ] M03 Recheck real X behavior after observed platform changes; retain a working standalone fallback.
- [ ] M04 Upgrade Rocq, the state adapter, and vendored pstack in deliberate reviewed changes with compatibility evidence.
- [ ] M05 Revisit hints and pacing using playtest evidence. Review the first-load budget before adding optional media or analytics.

The following extend the campaign and are not included in the 25-level core estimate:

| ID | Extension | Prerequisite and verification |
| --- | --- | --- |
| X01 | Contradiction and negation: `A -> (A -> False) -> False` | Dungeon; constructive tactics only |
| X02 | Equivalence: `(A /\ B) <-> (B /\ A)` | Dungeon; both implication directions |
| X03 | Append associativity | Railway; generalization/induction checked |
| X04 | Reverse twice | X03 and an explicit reverse/append lemma |
| X05 | Refuelling robot | Observatory; revise conservation to account for supplied fuel |
| X06 | Queue or inventory invariant | Observatory; explicit data representation and operation contracts |

Optional later product work: extra practice variants, daily puzzles, dynamic share images, additional languages, and cloud progress. Each needs its own scope and budget review. Free-text proof entry, browser Rocq, runtime proof servers, accounts, and competitive leaderboards are outside the current core design.

## Recorded product decisions

The user selected these directions on 2 November 2026. Q10 is a hosting feasibility question, so GitHub Pages is the first candidate rather than an already validated platform.

| ID | Selection | Implementation consequence |
| --- | --- | --- |
| Q1 | A: Curious programmers new to proofs | Explain logical reasoning without requiring prior Rocq knowledge |
| Q2 | A: English first, translation-ready | Separate text keys from proof identifiers; one launch language |
| Q3 | A: Warm pixel-art adventure | Distinct but coherent environments for four chapters |
| Q4 | A: Code-drawn sprites/vectors with a shared palette | Reproducible assets; no generated raster production required |
| Q5 | A: Live synthesized effects and light chapter music | Versioned notes/patches; optional audio with no required downloads |
| Q6 | A: One guide and short dialogue | Story supports puzzles without long interruptions |
| Q7 | A, plus always-visible proof state | Plain-language actions with tactic names; active goal and hypothesis pane never hidden behind a tab |
| Q8 | A: Roughly 1–3 minutes per level | Longer proofs split into stages; first introductory rooms can be shorter |
| Q9 | A: Six-room preview, then chapter updates | Public preview after D01–D06 pass their gates |
| Q10 | GitHub Pages first candidate | Static deployment, no backend; verify actual X embedding before accepting the host |

Additional direction: provide quick chapter navigation and browser-only progress. Plan Continue/Next/Chapters, localStorage autosaves, and manual progress transfer. Released chapters remain accessible even after storage loss. The 150 KiB ceiling, client matrix, and estimates remain subject to measurements; these selections do not waive verification or X delivery checks.
