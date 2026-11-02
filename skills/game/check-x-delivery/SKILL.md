---
name: check-x-delivery
description: Review or test this game's X Player Card delivery, compact interactions, download size, and runtime dependency boundary when implementing the embed or preparing a release.
---

# Check X delivery

Read the X delivery and presentation section of `docs/game-design.md`. Resolve paths from the repository root. Inspect the implemented app and deployment before choosing commands; no app or deployment checker exists at the design baseline.

Verify crawler-visible HTTPS Player Card metadata, absolute player/poster URLs, the dedicated embed route, and compatible framing headers. Inspect actual production responses and redirect behavior, not just source templates.

Exercise a complete room, including branches, feedback, undo, and reset at 320×245, 375×245, and 560×315 and at observed client dimensions. All essential actions must work by tapping. Check keyboard focus, text readability, reduced motion, and unavailable persistent storage. Fullscreen and opening another tab must remain optional for completing the room.

Inspect the built artifact and network requests. Rocq, proof fixtures, skills, and model-checking tools must not ship to the browser or become runtime services. Measure the first room's total gzipped HTML, CSS, JS, data, and required art against the provisional 150 KiB budget. Report the measured scope; a JavaScript-only total is not the full budget.

Local iframe testing does not establish X compatibility. With an authorized test post available, check x.com desktop, iOS, and Android and record URL, date, client versions, dimensions, and observed results. Do not post to an account without explicit authorization. If a deployed URL or client is unavailable, finish local checks and report the missing evidence; do not mark the client supported. A standalone fallback does not count as an embedded pass.

Keep release findings concrete: what worked, what failed, and the shortest reproduction. Do not claim a release is ready on the basis of unperformed client tests.
