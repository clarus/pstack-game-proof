# Chapter 1: the seven lanterns

The dungeon once lit the way to the Proof Workshop. Its lanterns have gone dark, and Pip asks the player to restore them. Each completed proof lights that room's lantern. Arrival and resolution lines support the logic without long cutscenes. The final shared ending appears only when all seven actual proofs are complete:

> All seven lanterns shine. Dawn reaches the Proof Workshop. “You’ve learned which doors your facts can open. Upstairs, we’ll learn who those facts are about.” — Pip

Direct access to every room remains available. Visiting a room does not light it; undoing its final move extinguishes its lantern. Solving D07 alone lights the gate's lantern and opens its doorway, but does not claim the whole journey is finished. The gate shows the actual seven-room completion pattern; dawn brightens when all seven are solved. Smaller preview editions do not show the full campaign ending.

| Room | Environment and completed state | Score |
| --- | --- | --- |
| D01 · Borrowed key | Night entrance, trees, seal pedestal and barred arch; the arch fills with light | **A borrowed light** — sparse triangle melody, the rising A–C–E motif |
| D02 · Open the toolbox | Shelves, stored boxes, hanging tools, large chest; the lid opens to reveal both reusable facts | **Dust and little treasures** — short plucked envelopes and playful answering notes |
| D03 · Two locks | Dark water, opposing mechanisms and a broken crossing; the bridge extends when the proof closes | **An answer across the water** — two spacious phrases on a soft sine voice |
| D04 · Rearrange the tools | Pipes, three interlocking gears and a control bank; gears align and indicators light | **The keeper’s clockwork** — quiet square pulses and a rearranged motif |
| D05 · Choose an exit | Open sky, moss, vines and two archways; the supported right exit lights up | **Moss remembers the sky** — airy sine melody with rests and longer notes |
| D06 · Both possible worlds | Violet hall, two reflected keepers and faceted mirrors; both passages brighten | **Two reflections, one way home** — contrasting phrases returning to the same A |
| D07 · The keeper’s gate | Monumental gate, stairs, seven individual lanterns and the Workshop beyond | **Seven lanterns at dawn** — opening motif expanded with bass and a harmony voice |

## Visual implementation

`src/art.ts` draws original 640×240 integer-coordinate scenes. Each room has a different composition and landmark, not just a palette swap. Pip's silhouette and the lantern shape connect the environments. `src/environments.ts` owns setting names, arrival/resolution text and accent colors; the authoring generator includes arrival text in published level data.

Proof notation stays semantic HTML using system/Georgia fonts. The compact card hides decorative art but keeps its room name as a story button, an explicitly labelled lantern count, and a room-colored border. Both context and conclusion remain visible; long contexts scroll within their pane. Desktop/mobile layouts retain the full scene and guide dialogue. A brief proof-pane arrival respects reduced motion; neither animation nor audio decides a proof move.

Scenes, note data, patches and interface art are original project sources. No external font, raster, sprite, music or sound service is used. Existing poster generation and the SVG favicon remain part of the build. Upstream pstack has its own retained MIT license and provenance manifest.

## Music and transitions

`src/score.ts` contains seven distinct 32-step melodies, bass lines and voice choices. Steps range from 190 to 320 ms; loops range from 6.08 to 10.24 seconds. The recurring rising minor-triad motif connects the journey without repeating the same song. The gate adds a quiet harmony voice. No audio files ship.

The live sequencer and offline review renders both use `scoreEvents`. `src/audio.ts` schedules those events 160 ms ahead on an 80 ms timer. A room change fades the old music bus over 120 ms, retires its voices at 140 ms, and starts the new phrase at 160 ms with a gentle fade-in. Interaction cues have a separate destination, so a completed-room cue is not cut by the music transition. There are no delayed room-selection callbacks: rapid navigation keeps the newest room selected.

Next, chapter-menu jumps, hash links and imported/restored progress all select the matching score. Ordinary proof moves, hints and undo within a room do not restart its melody. Mute/backgrounding stops scheduled voices. Foregrounding resumes the current room's musical step; changing rooms while muted selects the new score without starting audio.

Music remains optional, with 35% default volume and an explicit user gesture on every page load. A stalled activation times out after 2.5 seconds and leaves the game playable. Live voices are capped at 12 with per-voice gain capped at 0.06; the normal score leaves room for interaction cues. Error noise is quiet and short. This is a compact Web Audio sequencer, not an emulated Game Boy chip.

## Verification and listening

Tests check seven distinct note sequences, repeatable schedules over three loops, note ranges, overlap/headroom, full offline rendering of every score, actual voice cleanup after rapid room changes, mute, and unavailable audio. Browser tests check distinct rendered scenes, matched room/score selection, the completed bridge, lantern reversal on undo, restored completion and the seven-proof ending. These checks do not establish perceptual musical quality or performance on physical phones.

With the dev server running, `npm run review` produces `artifacts/rooms-arrival.png` and `rooms-restored.png` contact sheets, desktop/mobile/compact screenshots, a short walkthrough, seven WAV previews in `artifacts/music/`, and `artifacts/audio-review.json` with signal statistics. `dungeon-audio.wav` is the entrance preview for convenience. All review media is untracked and excluded from releases.

Human headphone/phone-speaker listening, physical-device responsiveness, screen-reader review, beginner playtests, and live X testing remain release gates. Later chapter art kits and arrangements remain future work.
