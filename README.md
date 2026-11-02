# Proof Quest

A choice-based Rocq adventure built for compact X cards and ordinary browsers. **Chapter 1 is implemented locally:** seven dungeon rooms, live proof states, hints, undo, proof scripts, seven distinct pixel-art settings, a seven-lantern story, room-specific synthesized music, and browser-only progress. Chapters 2–4 remain planned.

Nothing has been deployed or posted to X. Local iframe success does not establish X compatibility; see the [readiness record](docs/chapter-one-readiness.md).

## Play locally

Use Node **24.13.1** (`.nvmrc`) and npm:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. The developer server uses only your machine. `/iframe-test.html` shows cross-origin sandboxed 320×245 and 560×315 cards. Sound starts only after pressing the sound button. Chapters lets you jump directly to any available room, view the glossary, adjust volume, or open the full game carrying your progress.

Autosaves use edition-specific localStorage keys. Save / restore provides a portable progress code. Saves are validated by replay and may be unavailable or isolated inside an embed. No account, backend, analytics, runtime Rocq, or audio downloads are required.

## Verify and build

Development verification needs Python 3, **Rocq/coqidetop 9.0.1**, and **Rocq stdlib 9.0.0**. The opam package called `rocq-prover` is version 9.0.0; the compiler/core used here is 9.0.1. For a separate development switch:

```sh
opam switch create proof-quest ocaml-base-compiler.5.4.1
eval "$(opam env --switch=proof-quest)"
opam install rocq-prover.9.0.0 rocq-core.9.0.1 rocq-stdlib.9.0.0 coqide-server.9.0.1
npx playwright install --with-deps chromium firefox webkit
npm run check
npm run test:browser
```

Browser installation may need operating-system package permissions. The repository pins npm dependencies and browser revisions in `package-lock.json`. CI provisions the same compiler/library versions. Its first hosted run passed 79 browser checks but failed two Firefox audio activation checks; hosted confirmation of the virtual audio fix is pending.

On headless Linux, install `pulseaudio` and `pulseaudio-utils`, then use `bash scripts/test-browser-ci.sh` instead of `npm run test:browser`. This starts an isolated PulseAudio server with a virtual output, runs the unchanged browser suite, and removes the server afterward. It does not change the desktop audio server. Playwright arguments can be appended, for example `bash scripts/test-browser-ci.sh --project=firefox`. CI uses this wrapper because Firefox needs an audio output for the live music tests, even though offline synthesis tests work without one.

| Command | What it checks or produces |
| --- | --- |
| `npm run content` | Regenerate authored graphs from recipes; inspect and verify changes |
| `npm run content:check` | Fail if recipes and checked-in graphs differ |
| `npm test` | Actual runtime replay, rejection, progress, parser, and script behavior |
| `npm run test:rocq` | 21 fixtures, all 102 offered edges/46 states, seven exported solutions |
| `npm run test:mutations` | Seven intentionally broken variants must be rejected |
| `npm run check` | Content, type checking, runtime, Rocq, mutations, and all static builds |
| `npm run test:browser` | Three browser engines, accessibility, audio, compact/iframe flows, static editions |
| `npm run review` | Scene contact sheets, screenshots, walkthrough video, and seven WAV previews; requires the dev server |
| `npm run format` | Format owned TypeScript, CSS, HTML, and test sources |

Builds require fresh Rocq evidence for the actual content and covered source files. `npm run build:all` produces:

| Directory | Contents |
| --- | --- |
| `dist/chapter/` | All seven Chapter 1 rooms |
| `dist/preview/` | First six rooms, the selected initial public preview |
| `dist/embed-test/` | One room, neutral “Proof Card” branding and test poster |

Every edition has `index.html`, `embed.html`, an initial-HTML Player Card, and a generated PNG poster. Relative asset URLs work under a repository path. Set `SITE_URL` to the final HTTPS root before building; the default is `https://clarus.github.io/pstack-game-proof/`. For example:

```sh
SITE_URL=https://clarus.github.io/pstack-game-proof/ npm run build:all
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist/chapter
```

Open **http://127.0.0.1:4173/** for the built game. `artifacts/build-*.json` lists file hashes and a gzip upper bound including HTML, CSS, JS/content/art/audio code, and poster. The build fails above 150 KiB. Development tools and fixtures are excluded.

## Source and delivery

- [Design](docs/game-design.md), [roadmap](docs/roadmap.md), and [Chapter 1 readiness](docs/chapter-one-readiness.md).
- [Art and audio direction](docs/art-and-audio.md), including provenance and listening checks.
- [Local skills](docs/skills.md) and [dungeon verification skill](skills/game/verify-dungeon-graphs/SKILL.md).
- `src/model.ts` follows finite authored edges; `scripts/generate-content.ts` authors them offline. The independent Python adapter checks their meaning in Rocq.
- `.github/workflows/ci.yml` checks pushes and pull requests. `.github/workflows/pages.yml` publishes only through an explicit manual dispatch, defaulting to the one-room test edition. It has not been dispatched. Hosted headers, crawler access, actual X clients, and beginner/device/listening checks remain release gates.

Generated builds, browser recordings, WAV previews, dependencies, and Rocq binaries stay untracked. Commit sources, recipes, graphs, tests, skills, lockfile, and reviewed coverage records together.
