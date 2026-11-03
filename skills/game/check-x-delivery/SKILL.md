---
name: check-x-delivery
description: Review or test this game's X Player Card delivery, compact interactions, download size, and runtime dependency boundary when implementing the embed or preparing a release.
---

# Check X delivery

Read the X delivery and presentation section of `docs/game-design.md` and `docs/chapter-two-readiness.md` (and the Chapter 1 historical record). Resolve paths from the repository root. The current user direction is local/browser checks first, then a separately authorized hosted/X test.

Run `npm run check` followed by `npm run test:browser`. Browser prerequisites and preview commands are in `README.md`. Three builds are produced: `dist/chapter` (13 rooms across Chapters 1–2), `dist/preview` (six), and `dist/embed-test` (one neutral card test). Set `SITE_URL` to the intended HTTPS root before building. `artifacts/build-*.json` records exact public files, hashes, and the conservative gzip total. `tests/browser/builds.spec.ts` exercises actual static files under a subdirectory, metadata, and content isolation. CI checks on push/PR; Pages publication requires a manual workflow dispatch ; this skill does not authorize dispatching it.

Verify crawler-visible HTTPS Player Card metadata, absolute player/poster URLs, the dedicated embed route, and compatible framing headers. Inspect actual production responses and redirect behavior, not just source templates.

Exercise a complete room, including branches, feedback, undo, and reset at 320×245, 375×245, and 560×315 and at observed client dimensions. Keep the active goal and hypothesis pane visible; do not hide the proof context behind a tab to make the layout fit. All essential actions must work by tapping. Check keyboard focus, text readability, reduced motion, and unavailable persistent storage. Fullscreen and opening another tab must remain optional for completing the room.

GitHub Pages is the first hosting candidate. Inspect actual response headers rather than assuming they can be configured. Check repository-base-path assets, static `chapter-1.html` / `chapter-2.html` share pages, their chapter-specific Player Card metadata and `embed.html?chapter=2&level=3` links, and refresh on chapter hash links. Test Continue/Next/Chapters, denied or partitioned localStorage, and bounded progress-code import/export. Released chapter access must not depend on stored unlocks. Do not promise automatic progress sharing between X and standalone browsing.

Inspect the built artifact and network requests. Rocq, proof fixtures, skills, and model-checking tools must not ship to the browser or become runtime services. Measure the first room's total gzipped HTML, CSS, JS, data, and required art against the provisional 150 KiB budget. Report the measured scope; a JavaScript-only total is not the full budget.

Local iframe testing does not establish X compatibility. With an authorized test post available, check x.com desktop, iOS, and Android and record URL, date, client versions, dimensions, and observed results. Do not post to an account without explicit authorization. If a deployed URL or client is unavailable, finish local checks and report the missing evidence; do not mark the client supported. A standalone fallback does not count as an embedded pass.

Keep release findings concrete: what worked, what failed, and the shortest reproduction. Do not claim a release is ready on the basis of unperformed client tests.
