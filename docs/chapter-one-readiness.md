# Chapter 1 local readiness

Implementation and seven-lantern update: 2 November 2026. Scope: all seven Proof Dungeon rooms, ready for local review and preparation of an authorized hosted/X test. **The user supplied a desktop X screenshot on 2 November showing the embedded Storeroom and one lit lantern. This confirms a displayed embedded session, but not a complete client/device acceptance pass. The revised compact layout still needs a hosted X recheck.** Chapters 2–4 remain planned.

## Implemented experience

D01 introduces an assumption and reuses it; D02 unpacks AND; D03 builds AND; D04 rearranges conjunctions; D05 chooses an OR conclusion; D06 handles both OR cases and applies implications; D07 combines these rules. Each includes story, lesson, two-stage hints, move labels/tactics, feedback, live ordered goals and hypotheses, undo/restart, and a proof-script view. Legal unhelpful choices remain unfinished and offer undo.

Seven distinct environments, Pip, room-specific completed states and posters are code-drawn. Seven original room scores share a recurring motif, with gentle music transitions; effects remain synthesized. Each completed proof lights its room’s lantern, and the full Workshop ending requires all seven. Wider compact cards retain a portrait miniature of the room and Pip beside the proof. At widths up to 400px and heights up to 500px, each room begins with an arrival scene, then Start proof opens the full-width proof workspace. View room / Continue proof preserves state, and Next room introduces the next scene. Both layouts have larger proof/action text, a More menu for secondary tools, and a direct expand link carrying progress. See [the seven-lantern story and art/audio specification](art-and-audio.md). The game is usable silently. Progress is replay-validated, local to each edition, and transferable by bounded code or the full-game resume link. Branch tabs inspect other obligations; moves always act on the first goal. All rooms can be opened directly without unlocks. The chapter ending points to the menu and marks future chapters coming soon.

## Local evidence

| Check | Result / scope |
| --- | --- |
| `npm run check` | Pass: generated-content freshness, TypeScript, 21 runtime/score tests, Rocq, seven mutation checks, all three builds |
| Rocq 9.0.1 | 21 existing curriculum examples compile; the invalid fixture is rejected |
| Authored graph conformance | All 46 nodes and 102 offered moves checked: 39 accepted edges, 63 rejected edges; seven exported runtime proof scripts compile through `Qed` |
| Fault sensitivity | Wrong goal, false completion, dropped AND/OR branches, leaked OR fact, wrong successor, unsupported syntax rejected |
| pstack skill exercise | Actual shipped D01/n1 goal changed from A to B; CLI failed with state mismatch. File restored and full verification passed |
| Browser suite | 90 checks passed after the compact-card redesign across Chromium/Firefox/WebKit; zero skipped/flaky cases. No physical-device or X-client result is inferred |
| Accessibility | Automated axe WCAG A/AA-tagged checks for initial room, branching states, menu/glossary, desktop and compact layouts; keyboard/reduced-motion paths tested. This is not a full accessibility audit |
| Sound | User activation/mute, unavailable-device timeout, offline signal headroom and note lifecycle, scheduler stop/resume, seven distinct complete offline score renders, and rapid room-change retirement tested |
| Visual review | Seven-scene arrival/restored contact sheets plus desktop, mobile, and 320×245 screenshots inspected; proof context stays visible with internal scrolling |
| Dependency audit | npm reported zero vulnerabilities for the pinned installed dependency set during implementation |
| Skills/provenance | Local skill frontmatter validated; upstream pstack SHA-256 manifest unchanged |

The seven-lantern update preserves every original theorem, node, edge, action ID and solution history (compared with commit `f6b9ac5`); only narrative content changed in the generated graphs. Existing saves remain compatible. `src/environments.ts` is now included in verification freshness hashes because it supplies authored arrival text.

The finite graph checker uses the real shipped data and independent Rocq parsing; it rejects hidden goals and unverified path merging. It does not prove arbitrary TypeScript behavior. Quantifiers, dependent terms, induction, arbitrary tactic entry, asynchronous chapter loading and simulator invariants are outside this check. See [the verification skill](../skills/game/verify-dungeon-graphs/SKILL.md) and [reviewed coverage hashes](../verification/dungeon-coverage.json).

Browser evidence was collected on this Linux workstation with Playwright 1.56.1: Chromium 141.0.7390.37 (revision 1194), Firefox 142.0.1 (1495), and WebKit 26.0 (2215). The updated full run took 262 seconds. Its report is `artifacts/browser-results.json`; the log is `artifacts/browser-journey.log`. Tests now launch a fresh isolated Vite server on port 5180, preventing a stale development preview from affecting stylesheet checks. Local WebKit needed three missing media libraries supplied from temporary extracted packages and a launcher override; standard setup is `npx playwright install --with-deps`, not committing workstation paths. Desktop Firefox initially hit an audio activation stall; the final normal-device test passed and the forced-stall fallback is also tested. These Linux engines do not stand in for Safari/iOS, Android hardware, or X webviews.

Bugs found and fixed included Rocq tactics that automatically introduce assumptions, context-order mismatch after destruct, stale DOM clicks advancing a replacement state, a missing absolute Vite content-watch path, unavailable audio leaving activation pending, and low-contrast proof labels. The fault and browser cases retain regression coverage for these boundaries.

The CI audio repair was checked locally by reproducing both Firefox failures with an unreachable audio server, then running with an isolated PulseAudio virtual output. All 81 browser checks passed in 229 seconds with zero skipped/flaky cases; that was the CI-audio repair run; the latest report now covers the compact redesign. A final focused run of both Firefox regressions and the unavailable-audio fallback passed with wrapper exit status 0 and the temporary server directory removed. Workflow YAML and shell syntax also passed local validation. Hosted confirmation remains pending.

## Compact redesign validation

The 2 November X screenshot exposed tiny labels and missing scenery. The redesign was inspected at its approximate 518×292 size and at 320×245. Wider cards now show seven distinct portrait miniatures; small cards alternate panoramic arrivals and full-width proof play. The room/proof switch and Next-room arrivals preserve proof history. All 90 checks passed across Chromium, Firefox and WebKit, with zero skipped/flaky cases, including every room at both sizes, readable font/visible-pane bounds, completion/undo, scene/proof switching, menus, expansion with progress transfer, resize, and accessibility of the arrival and proof views. `npm run check` also passed. The source content hash is unchanged.

Visual review artifacts from this change are `artifacts/compact-518.png`, `compact-320-arrival.png`, `compact-320.png`, and `compact-rooms.png` (all seven miniatures before/after completion). They are local review evidence; the revised layout still needs to be deployed and checked in the actual X post.

## Built editions

| Profile | Rooms | Gzip upper bound |
| --- | --- | --- |
| `chapter` | D01–D07 | 22,978 bytes (22.4 KiB) |
| `preview` | D01–D06 | 22,242 bytes (21.7 KiB) |
| `embed-test` | D01 only | 20,555 bytes (20.1 KiB) |

Each total includes one HTML entry, all CSS and JavaScript (including content, graphics and audio code), the poster, and `.nojekyll`. The duplicate embed/share HTML is excluded from the first-page total. This conservative gzip sum includes the poster even though the running game does not fetch it; it excludes HTTP/TLS overhead. It is a build measurement, not a phone-network benchmark. All profiles pass the 150 KiB ceiling. Profile-specific browser checks load the actual static files under a subdirectory, verify initial-HTML Player Card metadata, complete D01, check room counts, and reject later-room content in smaller editions.

`artifacts/build-*.json` records exact public file hashes. The content identity for this run is `3a5cd845e779e6f193794fa3dd8f1b1433c4237215ce31ca210a487885b51e85`. Build refusal is tied to the graph and covered source hashes in fresh Rocq evidence. No proof tools, skills, source fixtures, or runtime services are shipped.

Review artifacts (untracked, reproducible with `npm run review` and the dev server):

- `artifacts/dungeon-desktop.png`, `dungeon-mobile.png`, `dungeon-compact.png`.
- `artifacts/dungeon-walkthrough.webm`.
- `artifacts/rooms-arrival.png` and `rooms-restored.png`: all seven environments.
- `artifacts/music/D01.wav` through `D07.wav`: complete score previews with one-second tails. At default volume, peaks range from 0.0279 to 0.0438; detailed RMS/duration data is in `artifacts/audio-review.json`. `dungeon-audio.wav` is the entrance preview. These are not shipped assets or human listening results.
- `artifacts/rocq-coverage.json`, `audio-review.json`, and browser logs.

## Remaining test and release gates

1. **Local human review:** a beginner should complete D01–D06, explain the two different OR rules, and try a renamed example. Check compact text/taps, screen-reader announcements, zoom, music on headphones/phone speakers, and real background/foreground audio behavior. Record an identified mid-range phone and measured input latency, rendering/audio CPU, and memory before making performance claims.
2. **Hosted CI:** the first hosted run passed 79 browser checks and failed two Firefox live-audio activation checks. Both failures were reproduced locally with an unreachable audio server. CI now installs PulseAudio and runs the unchanged browser suite through `scripts/test-browser-ci.sh`, which provides an isolated virtual output and cleans it up afterward. Push the fix only when requested, then confirm a new hosted run passes before publication.
3. **Hosted test:** enable GitHub Pages Actions and explicitly dispatch `Publish selected edition to Pages` with `embed-test`. This publishes the one-room test edition. Initial-HTML Player Card URLs derive from the Pages URL; confirm HTTPS redirects, poster, repository asset paths, crawler access and actual framing/CSP/X-Frame-Options headers. The local server cannot establish those facts.
4. **Actual X test, with the user:** make an authorized test post from the selected account. Record post/page URL, date, X/client versions, viewport, inline play versus link fallback, D01 completion, audio, overlays, and storage on x.com desktop, iOS and Android. The post/site may be public even if the account has few followers. No posting action is automated here.
5. **Preview release:** after human and X gates pass, explicitly publish `preview`. Record source revision, tested artifact hashes, supported-client limits and remaining issues. Later publish `chapter` for D07. A workflow dispatch replaces the existing Pages edition; it does not create separate secret URLs.
6. **Rollback:** dispatch the previous reviewed revision/profile through the same manual workflow. Recheck metadata and D01 after deployment. This rollback procedure is prepared but has not been rehearsed against a live site. Version-incompatible or unavailable-room saves reset with a warning; saves have separate edition keys. Keep the progress code before changing editions.

The Pages workflow follows [GitHub's custom-workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and OCaml setup follows the [maintained setup-ocaml action](https://github.com/ocaml/setup-ocaml). Those documented workflows do not establish this repository's hosted success.
