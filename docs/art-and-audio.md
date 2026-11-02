# Chapter 1 art and audio

The dungeon is a warm, quiet place: moss-green stone, cream proof paper, gold door hardware, and Pip's terracotta robe. Geometry in `src/art.ts` draws a 640×240 scene; CSS scales it with nearest-neighbor pixels. Typography remains semantic HTML text using system/Georgia fonts. No external font, image, sprite, or sound service is needed.

The scene changes to an open, lit doorway on completion. Numbered room markers and the sidebar show progress. Facts, active goals, branch counts, and completion use text and symbols as well as color. The compact card removes decorative art before reducing proof space. Both context and conclusion stay visible; long contexts scroll within their pane. The browser animates only a brief proof-pane arrival, disabled by reduced-motion preference; animation never controls a proof move.

Original project assets are `src/art.ts` (scene/Pip), `src/style.css` (interface/palette), the inline SVG favicon, and `scripts/poster.py` (pixel-font PNG poster). They were created for this implementation. There are no imported raster or music assets to attribute. Upstream pstack retains its separate MIT license and provenance manifest. The same dungeon scene is shared across rooms; later chapter kits remain future work.

## Audio specification

`src/audio.ts` stores the original 32-step melody, tonal patches, noise generator, scheduler, and move cues. One step is 250 ms (120 BPM with eighth-note steps), an eight-second looping phrase in A minor. A triangle voice carries the melody, quiet square notes accent phrases, and sine bass supports four harmonies. Rejected actions add a short, low-amplitude deterministic noise cue. Completion rises; undo falls. Hints and valid moves use brief tonal cues.

Music is optional and contains no unique lesson information. Default master volume is 35%. The scheduler looks 160 ms ahead on an 80 ms timer, caps voices at 12, and disconnects finished nodes. Muting/backgrounding stops scheduled voices. Foregrounding preserves the melody step. This is a small sequencer, not an emulated Game Boy chip or a promise of seamless multi-biome arrangements.

Audio requires a user gesture on each page load, including saved sessions. A failed or stalled resume returns a visible explanation after 2.5 seconds; proof controls remain usable. Volume and sound preference save locally, but a preference never bypasses browser activation rules.

Automated tests render the real oscillator/envelope into an OfflineAudioContext and check silence before/after the note, nonzero output, headroom at the voice cap, scheduler position, voice cleanup, mute, and unavailable audio. These are signal/lifecycle checks, not a musical-quality assessment or proof of identical waveforms across engines.

With the dev server running, `npm run review` writes a nine-second melody preview, signal statistics, screenshots, and a short game recording under `artifacts/`. The WAV is for review and never ships. Before release, listen on headphones and phone speakers, check repeated cues for clicks/fatigue, and measure CPU/latency on an identified mid-range phone. Human listening and physical-device performance remain pending.
