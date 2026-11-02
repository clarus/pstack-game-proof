# Rocq adventure game design

Status: design baseline, 2 November 2026. Working title: Proof Quest.

Build a small adventure that teaches how Rocq transforms a proof state. Players progress through four chapters in order, starting with six dungeon rooms. They select moves and witnesses from authored choices; they never need to type proof syntax. Each move reveals its Rocq tactic and the resulting hypotheses and goals.

X is the primary delivery surface. A complete short puzzle must work inside a compact card. Fullscreen and the standalone page provide more room, but are not required to finish the campaign. Rocq runs locally and in CI to validate content and transitions; it is neither embedded in the game nor called through a runtime proof service.

## Learning goals and game loop

The player should distinguish constructing a conclusion from using a hypothesis; understand cases, scope, and witnesses; use induction on natural numbers and lists; and establish an invariant initially and after every permitted transition.

The repeated loop is: inspect the active goal and available facts, select a target, choose an action, watch the proof state change, and finish every outstanding branch. Completing a room opens the next and offers a replay of the generated Rocq script. Progress is untimed. Hints and undo carry no progression penalty.

Each action has a plain-language label and a smaller tactic label, for example “Prove both parts — split”. Initially show two or three choices. Use a separate short chooser for a witness, hypothesis, branch, or rewrite direction. Tapping must suffice; dragging is optional decoration.

Distinguish three outcomes:

- Invalid tactic: rejected with a specific explanation and no logical state change.
- Valid but unhelpful tactic: advances to a real proof state; explain the remaining obligation and allow undo.
- Useful tactic: advances without implying it is the only possible proof.

A legal choice such as choosing the left side of a disjunction can leave an unprovable goal. Do not label that choice a Rocq error. The game can omit tactics outside its taught subset without claiming Rocq rejects them.

## Shared proof interface

Keep the active goal, available facts, and controls readable at compact sizes. A branch counter stays visible; selecting it opens a branch list. Completing one branch never discards the others. Expanded mode shows the proof tree and script alongside the world.

Use stable internal identifiers and friendly display names. Each branch owns its context. Facts introduced in one case cannot leak into another. Ordinary hypotheses are reusable: game items are not consumed as evidence. Highlight newly introduced facts and changed subexpressions.

| Logical form | In the goal | In a hypothesis |
| --- | --- | --- |
| `A /\ B` | `split`: establish both | `destruct`: obtain both facts |
| `A \/ B` | `left` or `right`: select one | `destruct`: solve both cases |
| `A -> B` | `intro`: assume A locally and prove B | Apply backwards or use with evidence of A |
| `forall x, P x` | Introduce an arbitrary x | Specialize to a chosen term |
| `exists x, P x` | Choose t and prove P t | Unpack a witness and its evidence |
| Equality | Simplify or use `reflexivity` | Rewrite a selected occurrence and direction |

Every displayed transformation has an explicit supported Rocq counterpart. Restrict rewriting to authored occurrences; avoid an ambiguous “rewrite anywhere” button.

## Chapter 1 — The Proof Dungeon

Restore the dungeon's exits using facts found in each room. Doors are goals; reusable tools are hypotheses. A conjunction door has two locks. A disjunction goal allows a choice of exit. A disjunction hypothesis creates two possible versions of the room, both of which must be solved.

The first six rooms form the initial playable release. Target 30–90 seconds per room after onboarding, with no time limit.

| Room | Proposition | New lesson |
| --- | --- | --- |
| 1. Borrowed key | `A -> A` | Introduce an assumption; use it with `exact` |
| 2. Open the toolbox | `(A /\ B) -> A` | Unpack a conjunction hypothesis |
| 3. Two locks | `A -> B -> A /\ B` | Split the goal and finish both branches |
| 4. Rearrange the tools | `(A /\ B) -> B /\ A` | Combine unpacking, splitting, and exact evidence |
| 5. Choose an exit | `B -> A \/ B` | Select `right`; `left` is legal but unhelpful |
| 6. Both possible worlds | `(A \/ B) -> (A -> C) -> (B -> C) -> C` | Case analysis and implication application |

Room 6 introduces applying a rule through a guided action, then asks the player to repeat the reasoning in the other case. Do not introduce the entire vocabulary at once.

Room 4's sequence: `intro H`; `destruct H as [HA HB]`; `split`; solve B with `exact HB`; solve A with `exact HA`. The map retains the second obligation until it closes.

After the six-room release, add the chapter finale:

```text
A /\ (B \/ C) -> (A /\ B) \/ (A /\ C)
```

Optional later rooms introduce `False`, negation as `A -> False`, and equivalence as two implications. Do not silently add classical axioms.

Chapter completion: solve the finale with less scaffolding, then select an explanation of why an OR hypothesis requires both cases while an OR goal requires only one.

## Chapter 2 — The Proof Workshop

Repair the town's devices by assembling certificates. An implication transforms evidence. A universal statement is a rule for any valid input. An existential package contains a witness and evidence about that witness.

| Station | Task | Lesson |
| --- | --- | --- |
| 1. A rule for everyone | `(forall x : T, P x) -> P a` | Specialize a universal hypothesis |
| 2. Pack a certificate | `P a -> exists x : T, P x` | Choose a witness and provide evidence |
| 3. Open a sealed package | `(exists x : T, P x /\ Q x) -> exists x : T, P x` | Unpack an existential and preserve witness identity |
| 4. Build a general rule | `(forall x : T, P x -> Q x) -> forall x : T, P x -> Q x` | Introduce an arbitrary object and its assumption |
| 5. Open the gate | `(exists x : T, Key x) -> (forall x : T, Key x -> Opens x) -> exists x : T, Opens x` | Combine unpacking, specialization, implication, and repackaging |
| 6. Compare guarantees | Choose which statement follows from supplied evidence | One shared witness versus a witness depending on an input |

Use `T : Type` and predicates into `Prop`. Introduce inhabitants explicitly where needed; do not assume every type is inhabited. The witness chooser offers finitely many well-typed, in-scope terms. Distractors teach why evidence about Alice does not establish a fact about Bob.

Opening an existential gives the player its witness; they cannot replace it with a favorite character. Introducing a universal goal gives an arbitrary object, not a conveniently selected example. Visually mark this distinction.

Chapter completion: construct the gate certificate and inspect its script. Repeat the logic with different names to test learning beyond the story.

## Chapter 3 — The Induction Railway

Certify transport machinery for trains of any length. Introduce natural numbers as zero and successor blocks, then lists as an empty train or a carriage followed by a train.

| Station | Proposition or activity | Lesson |
| --- | --- | --- |
| 1. Zero and one more | Evaluate small natural expressions | Constructors, definitions, `simpl`, `reflexivity` |
| 2. Any tower | `forall n : nat, n + 0 = n` | Base case and successor case using `induction` |
| 3. Reuse the certificate | Work through the successor obligation | Rewrite with the induction hypothesis |
| 4. Empty or another carriage | Inspect `[]` and `x :: xs` | List constructors; destruct versus induction |
| 5. Attach an empty train | `forall xs : list T, xs ++ [] = xs` | Structural induction over lists |
| 6. Count a coupled train | `length (xs ++ ys) = length xs + length ys` | List induction, simplification, rewriting |

Optional extension: associativity of append, then reversing twice after proving the supporting reverse/append lemma. Reverse involution is not the first induction exercise.

The base and step cases are visible stations. The induction hypothesis is a “certificate for the smaller structure”, usable only in the branch where Rocq supplies it. Trying `destruct` instead of `induction` is valid but reveals the missing recursive hypothesis, followed by an undo prompt.

Distinguish simplifying a definition from rewriting with a theorem. Testing lengths 0, 1, and 2 motivates a claim but never completes a universal proof. Select induction variables and any generalization explicitly; an animation must not silently strengthen the induction hypothesis.

Chapter completion: solve length-of-append with structural hints, then replay the visual actions alongside the exact tactics.

## Chapter 4 — The Invariant Observatory

Bring a maintenance robot back online and certify its rules. First observe executions, then explain what holds for all reachable states.

State: natural numbers `distance`, `fuel`, and a fixed `initialFuel`. Initially, `distance = 0` and `fuel = initialFuel`. A legal Move requires positive fuel and atomically increases distance by one and decreases fuel by one. Wait changes neither.

Candidate invariant:

```text
distance + fuel = initialFuel
```

| Stage | Task | Proof idea |
| --- | --- | --- |
| 1. Observe | Run short traces | Examples suggest a property but do not establish it |
| 2. Select a claim | Choose among invariants | Conservation, a weaker bound, and false claims |
| 3. Initialize | Establish conservation initially | Substitute initial values |
| 4. Preserve | Prove it for Move and Wait | Cases on transitions and simple arithmetic |
| 5. All executions | Combine initialization and preservation | Induction over a defined reachability relation |
| 6. Diagnose a fault | MoveBroken advances twice for one fuel | A concrete counterexample explains the failure |

Derive `distance <= initialFuel` from conservation. Model Move with successor-shaped input fuel so subtraction at zero is not hidden. An optional refuelling level asks whether the original property still describes the intended system.

Expose initialization, preservation, and reachability as distinct obligations. Arithmetic automation may close a small obligation after the player identifies it; label it as arithmetic rather than the whole invariant argument.

A bounded model-checking demonstration can show explored states, labelled with its bounds. The general Rocq theorem concerns the formal transition relation for arbitrary reachable executions. Connecting that theorem to an implemented simulator requires conformance checks. The initial executable example in `verification/rocq/Curriculum.v` proves one-step preservation, not yet the full reachability theorem.

## X delivery and presentation

Serve a public HTTPS share page with Player Card metadata in its initial HTML and a dedicated embed route. Permit the intended X embedding ancestors on that route; check for contradictory framing headers. Keep framing permissions scoped to the embed surface.

Treat actual card behavior as a release test. Published implementations demonstrate desktop interaction but do not establish support on every X client. Test x.com desktop, iOS, and Android using a real posted URL. Record client versions and dates. A standalone fallback does not count as passing the X-first requirement on an unsupported client.

Use roughly 245 CSS pixels of compact height as an initial design target. Exercise 320×245, 375×245, and 560×315, then the dimensions observed in real clients. Keep the active goal and two or three actions visible; hypotheses and branch details open in accessible panels. Break long proofs into successive views rather than shrinking mathematical text until unreadable.

Use semantic HTML controls and lightweight 2D visuals. Labels and shapes carry information independently of color. Support keyboard focus, announcements of proof changes, reduced motion, and tap targets around 44 CSS pixels. Audio is optional, muted initially, and never needed for instructions. Pause decoration when hidden.

No login is needed to begin or finish a room. Saving is best-effort browser storage with an in-memory fallback when third-party storage is unavailable. Persist a content version, level identifier, and action history; replay and validate on load. Incompatible or invalid saves offer a restart. If continuity into a standalone page is offered, use a versioned compact progress token; do not assume shared storage.

Provisional first-load ceiling: 150 KiB gzipped for the first room's HTML, CSS, JavaScript, data, and required art combined. This is a proposed budget, not a measured result. Fetch later chapters on demand. Rocq, proof fixtures, skills, TLA+ tooling, and development dependencies never enter public assets. Avoid custom fonts and third-party runtime requests initially.

Sharing is optional and user initiated. Start with a level poster and canonical URL; dynamic result images can follow. Shared completion is a player claim, not a server-validated high score. Competitive leaderboards and accounts are outside the initial scope.

## Runtime representation

Use a finite authored proof-state graph per level initially. Nodes contain structured goals, branch-local contexts, and available actions. Edges contain an action, its exact Rocq tactic representation, the resulting node, and feedback. Support multiple authored valid routes; unhelpful routes can require undo.

An authoring tool may generate graphs offline. The browser loads data and applies deterministic transitions. There is no general Rocq parser, elaborator, tactic interpreter, or LLM at runtime. Animations consume transition results and cannot decide success.

Proposed shapes, not existing interfaces:

```text
Level: id, contentVersion, theorem, declarations, startNode, nodes, edges
ProofNode: id, orderedGoals, activeGoalId, completion
Goal: id, context, conclusion
Binding: id, name, type, optionalDefinition, scope
Action: id, kind, targetIds, chosenTerm, rewriteOccurrence
Edge: fromNode, actionId, outcome, toNode, tactic, feedback
Session: levelVersion, actionHistory, focusedBranch, presentationState
```

Represent terms structurally; identity must not depend on display strings. Keep bindings, scope, goal ordering, and dependencies explicit. Branch focus and animation are presentation operations. Logical moves and undo affect replay history. Budget graph size and avoid materializing every redundant permutation.

Success requires all goals closed and no unresolved obligations. Closing a branch can leave the level incomplete. Export the selected route as a Rocq script with proper focus and branch structure. Missing choices mean “not offered in this lesson”, not “impossible in Rocq”.

## Local Rocq verification

Pin Rocq and the imported libraries. The initial runner requires Rocq 9.0.1, available during design. Verification works offline after installation. Browser artifacts have no dependency on this environment.

The release checker must cover more than the canonical solution:

1. Validate each level's declarations, start state, references, scopes, and terminal nodes.
2. Reconstruct a path to every reachable node using the action/tactic mapping shipped with that level. Execute the path and candidate edge in local Rocq.
3. Compare resulting ordered goals and full contexts with the authored successor, including definitions, witness scope, and unresolved existential variables. Normalize binder names consistently. Choose a structured Rocq interface during implementation and test its normalization independently; human-readable output is not a stable protocol.
4. Check offered rejected actions against expected Rocq failure. Compare successful but unhelpful actions with their real successor. A failed tactic does not prove a proposition unprovable.
5. Compile complete proof routes through `Qed`. Check terminal nodes for outstanding obligations. No `Admitted`, `admit`, or undeclared axioms. Compiling a final script does not replace intermediate-state comparison.
6. Exercise the actual browser transition/replay code against the validated graph: selection, focus, undo, reset, and loading saves. Graph correctness does not prove that the UI dispatches the right action.
7. Corrupt a transition, remove an OR branch, leak a witness, or falsely mark completion in scratch copies. The relevant checks must fail. Retain regression cases for observed defects.

Check every published reachable edge of the finite graphs. When merging nodes reached by different histories, establish equivalence of their full states and dependencies; otherwise keep separate nodes. Bounded generated tests of any future general rule engine must state their bounds.

Current baseline: `python3 scripts/check_rocq.py` checks representative proofs and rejects an intentionally wrong proof. This establishes example validity, not transition equivalence. The graph exporter, state adapter, runtime reducer, and CI wiring remain implementation work.

## Verification skills and engineering checks

Use the local curriculum skill for content checks. Use pstack's creation workflow once implemented code supplies a concrete target and runnable check. Candidate targets are branch completion, witness scope, deterministic undo/replay, and stale-save handling. Use Rocq for proof content, real-code tests for runtime conformance, and TLA+ when event ordering warrants a model.

Record each formal check's property, covered files/functions, bounds, assumptions, command, tool version, last synchronized revision, and known failing mutation. Maintenance distinguishes bugs from stale models. A few model checks do not establish a “formally verified game”.

Use build checks for download size and repository exclusions. Add lint rules for demonstrated recurring errors when a rule can express the restriction reliably. A turn-based first version needs neither a custom real-time engine nor a blanket allocation ban.

## Delivery sequence and acceptance

| Milestone | Deliverable | Acceptance |
| --- | --- | --- |
| 0 | Design, local skills, sample proofs | Fixture check passes; limits explicit |
| 1 | First room embedded in X | Actual client results recorded; download measured |
| 2 | Six-room dungeon and graph checker | Every edge checked; branches retained; replay and accessibility checks pass |
| 3 | Dungeon finale and workshop | Scope/witness mutation cases caught; compact progression works |
| 4 | Railway | Base/step contexts and induction hypotheses agree with Rocq |
| 5 | Observatory | Initialization, preservation, reachability checked; simulator conformance tested; broken move caught |

Playtest with beginners before polishing the campaign. Ask them to predict the next proof state and solve a renamed variant. Observe first-room completion, hint use, and whether they can explain the two OR rules. Moderated sessions suffice initially; analytics need not enter the first-download budget.

Title, visual theme, hosting provider, and exact asset budget can evolve in the first-room prototype. X-first interaction, all four chapters, choice-based moves, and development-only Rocq are fixed decisions.

## References

- [Rocq inductive reasoning](https://rocq-prover.org/doc/master/refman/proofs/writing-proofs/reasoning-inductives.html): tactic semantics; executable fixtures are pinned to 9.0.1.
- [Primary X Player Card implementation report](https://tarasshynkarenko.com/skills/x-player-card): embedding and client-specific testing.
- [pstack upstream](https://github.com/cursor/plugins/tree/main/pstack): verification workflows; vendored revision recorded separately.
