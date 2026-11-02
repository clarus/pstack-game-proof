# Chapter 1 local readiness

Implementation date: 2 November 2026. Scope: all seven Proof Dungeon rooms, ready for local review and preparation of an authorized hosted/X test. **No deployment, live X test, or public release has occurred.** Chapters 2–4 remain planned.

## Implemented experience

D01 introduces an assumption and reuses it; D02 unpacks AND; D03 builds AND; D04 rearranges conjunctions; D05 chooses an OR conclusion; D06 handles both OR cases and applies implications; D07 combines these rules. Each includes story, lesson, two-stage hints, move labels/tactics, feedback, live ordered goals and hypotheses, undo/restart, and a proof-script view. Legal unhelpful choices remain unfinished and offer undo.

Pip, the dungeon, the door-opening state and posters are code-drawn. Music and effects are synthesized from source. The game is usable silently. Progress is replay-validated, local to each edition, and transferable by bounded code or the full-game resume link. Branch tabs inspect other obligations; moves always act on the first goal. All rooms can be opened directly without unlocks. The chapter ending points to the menu and marks future chapters coming soon.

## Local evidence

| Check | Result / scope |
| --- | --- |
| `npm run check` | Pass: generated-content freshness, TypeScript, 20 runtime tests, Rocq, seven mutation checks, all three builds |
| Rocq 9.0.1 | 21 existing curriculum examples compile; the invalid fixture is rejected |
| Authored graph conformance | All 46 nodes and 102 offered moves checked: 39 accepted edges, 63 rejected edges; seven exported runtime proof scripts compile through `Qed` |
| Fault sensitivity | Wrong goal, false completion, dropped AND/OR branches, leaked OR fact, wrong successor, unsupported syntax rejected |
| pstack skill exercise | Actual shipped D01/n1 goal changed from A to B; CLI failed with state mismatch. File restored and full verification passed |
| Browser suite | 63 checks passed: 60 in the final full run plus 3 fresh-context progress-link checks, across Chromium/Firefox/WebKit; zero skipped/flaky cases. No physical-device or X-client result is inferred |
| Accessibility | Automated axe WCAG A/AA-tagged checks for initial room, branching states, menu/glossary, desktop and compact layouts; keyboard/reduced-motion paths tested. This is not a full accessibility audit |
| Sound | User activation/mute, unavailable-device timeout, offline signal headroom and note lifecycle, scheduler stop/resume tested |
| Visual review | Desktop, mobile, and 320×245 screenshots inspected; proof context stays visible with internal scrolling |
| Dependency audit | npm reported zero vulnerabilities for the pinned installed dependency set during implementation |
| Skills/provenance | Local skill frontmatter validated; upstream pstack SHA-256 manifest unchanged |

The finite graph checker uses the real shipped data and independent Rocq parsing; it rejects hidden goals and unverified path merging. It does not prove arbitrary TypeScript behavior. Quantifiers, dependent terms, induction, arbitrary tactic entry, asynchronous chapter loading and simulator invariants are outside this check. See [the verification skill](../skills/game/verify-dungeon-graphs/SKILL.md) and [reviewed coverage hashes](../verification/dungeon-coverage.json).

Browser evidence was collected on this Linux workstation with Playwright 1.56.1: Chromium 141.0.7390.37 (revision 1194), Firefox 142.0.1 (1495), and WebKit 26.0 (2215). The full run took 194 seconds; the three additional progress-transfer cases took 8 seconds. Reports are `artifacts/browser-results.json` and `artifacts/browser-progress-transfer.json`. Local WebKit needed three missing media libraries supplied from temporary extracted packages and a launcher override; standard setup is `npx playwright install --with-deps`, not committing workstation paths. Desktop Firefox initially hit an audio activation stall; the final normal-device test passed and the forced-stall fallback is also tested. These Linux engines do not stand in for Safari/iOS, Android hardware, or X webviews.

Bugs found and fixed included Rocq tactics that automatically introduce assumptions, context-order mismatch after destruct, stale DOM clicks advancing a replacement state, a missing absolute Vite content-watch path, unavailable audio leaving activation pending, and low-contrast proof labels. The fault and browser cases retain regression coverage for these boundaries.

## Built editions

| Profile | Rooms | Gzip upper bound |
| --- | --- | --- |
| `chapter` | D01–D07 | 16,909 bytes (16.5 KiB) |
| `preview` | D01–D06 | 16,363 bytes (16.0 KiB) |
| `embed-test` | D01 only | 14,634 bytes (14.3 KiB) |

Each total includes one HTML entry, all CSS and JavaScript (including content, graphics and audio code), the poster, and `.nojekyll`. The duplicate embed/share HTML is excluded from the first-page total. This conservative gzip sum includes the poster even though the running game does not fetch it; it excludes HTTP/TLS overhead. It is a build measurement, not a phone-network benchmark. All profiles pass the 150 KiB ceiling. Profile-specific browser checks load the actual static files under a subdirectory, verify initial-HTML Player Card metadata, complete D01, check room counts, and reject later-room content in smaller editions.

`artifacts/build-*.json` records exact public file hashes. The content identity for this run is `29acf02a67fd021ad5a0a9cf74fcec77dbf17dbdd95000f591fdb90cc50f3960`. Build refusal is tied to the graph and covered source hashes in fresh Rocq evidence. No proof tools, skills, source fixtures, or runtime services are shipped.

Review artifacts (untracked, reproducible with `npm run review` and the dev server):

- `artifacts/dungeon-desktop.png`, `dungeon-mobile.png`, `dungeon-compact.png`.
- `artifacts/dungeon-walkthrough.webm`.
- `artifacts/dungeon-audio.wav`: nine-second offline review preview, peak 0.0552, RMS 0.00638 at default volume. Not a shipped asset or a human listening result.
- `artifacts/rocq-coverage.json`, `audio-review.json`, and browser logs.

## Remaining test and release gates

1. **Local human review:** a beginner should complete D01–D06, explain the two different OR rules, and try a renamed example. Check compact text/taps, screen-reader announcements, zoom, music on headphones/phone speakers, and real background/foreground audio behavior. Record an identified mid-range phone and measured input latency, rendering/audio CPU, and memory before making performance claims.
2. **Hosted CI:** push only when requested; inspect the first GitHub Actions run. The local commands pass, but the authored GitHub workflow has not run on a hosted runner.
3. **Hosted test:** enable GitHub Pages Actions and explicitly dispatch `Publish selected edition to Pages` with `embed-test`. This publishes the one-room test edition. Initial-HTML Player Card URLs derive from the Pages URL; confirm HTTPS redirects, poster, repository asset paths, crawler access and actual framing/CSP/X-Frame-Options headers. The local server cannot establish those facts.
4. **Actual X test, with the user:** make an authorized test post from the selected account. Record post/page URL, date, X/client versions, viewport, inline play versus link fallback, D01 completion, audio, overlays, and storage on x.com desktop, iOS and Android. The post/site may be public even if the account has few followers. No posting action is automated here.
5. **Preview release:** after human and X gates pass, explicitly publish `preview`. Record source revision, tested artifact hashes, supported-client limits and remaining issues. Later publish `chapter` for D07. A workflow dispatch replaces the existing Pages edition; it does not create separate secret URLs.
6. **Rollback:** dispatch the previous reviewed revision/profile through the same manual workflow. Recheck metadata and D01 after deployment. This rollback procedure is prepared but has not been rehearsed against a live site. Version-incompatible or unavailable-room saves reset with a warning; saves have separate edition keys. Keep the progress code before changing editions.

The Pages workflow follows [GitHub's custom-workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and OCaml setup follows the [maintained setup-ocaml action](https://github.com/ocaml/setup-ocaml). Those documented workflows do not establish this repository's hosted success.
