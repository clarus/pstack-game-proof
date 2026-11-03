# Art, story and audio

## Chapter 1: the seven lanterns

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

Proof notation stays semantic HTML using system/Georgia fonts. At compact heights, cards wider than 400px keep a portrait miniature beside the proof: `src/miniature.ts` draws seven original 160×160 compositions with Pip, each room’s landmark, and the current lantern state. Completion opens the entrance, unpacks the chest, extends the bridge, aligns the machinery, opens the right courtyard exit, brightens both mirrors, or opens the final gate. Undo restores the unsolved composition. These are deliberately recomposed for small cards rather than cropped panoramic scenes. At widths up to 400px, room arrivals show the panoramic scene followed by Start proof; proof play uses the full width, and View room / Continue proof allow switching without losing progress. Next room always introduces the next scene. The room name remains a scene/story button, with an explicitly labelled lantern count and room-colored borders. Both context and conclusion remain visible; long contexts scroll within their pane. Taller desktop/mobile layouts retain the panoramic scene and guide dialogue. Crossing the compact breakpoint repaints the canvas without resetting the proof or dismissing a menu. Compact action labels are 13–14px, facts 18px and goals 20px. Narrow proof headings become “Facts” and “Goal”; export/save/restart move into More, while Undo, Hint, sound, Chapters and expansion remain directly accessible. A brief proof-pane arrival respects reduced motion; neither animation nor audio decides a proof move.

Scenes, note data, patches and interface art are original project sources. No external font, raster, sprite, music or sound service is used. Existing poster generation and the SVG favicon remain part of the build. Upstream pstack has its own retained MIT license and provenance manifest.

## Music and transitions

`src/score.ts` retains seven authored 32-step melodies for review. The selected game soundtrack is always D02, “Dust and little treasures,” originally composed for the Storeroom. Its 220 ms steps make a 7.04-second loop. This user-directed change supersedes the earlier per-room music plan: room changes should not surprise the player with a different song. No audio files ship.

The live sequencer and offline review renders both use `scoreEvents`. `src/audio.ts` schedules those events 160 ms ahead on an 80 ms timer. The game uses one fixed score and no longer selects or crossfades music when a room changes. Next, chapter-menu jumps, hash links, ordinary proof moves, hints, undo and restored progress preserve the music bus and musical position. Interaction cues still play over the shared soundtrack. Mute/backgrounding stops scheduled voices, and foregrounding resumes the same score's musical step. Navigating while muted never starts audio.

Music remains optional, with 35% default volume and an explicit user gesture on every page load. A stalled activation times out after 2.5 seconds and leaves the game playable. Live voices are capped at 12 with per-voice gain capped at 0.06; the normal score leaves room for interaction cues. Error noise is quiet and short. This is a compact Web Audio sequencer, not an emulated Game Boy chip.

## Verification and listening

Tests check seven distinct note sequences, repeatable schedules over three loops, note ranges, overlap/headroom, full offline rendering of every score, continuous real playback through room changes, mute, and unavailable audio. Browser tests check distinct rendered scenes, the same D02 score in every room, the completed bridge, lantern reversal on undo, restored completion and the seven-proof ending. These checks do not establish perceptual musical quality or performance on physical phones.

With the dev server running, `npm run review` produces `artifacts/rooms-arrival.png` and `rooms-restored.png` contact sheets, desktop/mobile/compact screenshots, a short walkthrough, seven WAV previews in `artifacts/music/`, and `artifacts/audio-review.json` with signal statistics. `dungeon-audio.wav` is the selected D02 soundtrack preview for convenience. All review media is untracked and excluded from releases.

Human headphone/phone-speaker listening, physical-device responsiveness, screen-reader review, beginner playtests, and live X testing remain release gates. Chapter 3–4 art kits remain future work. The selected constant soundtrack supersedes plans for later per-room arrangements.


## Chapter 2: the workshop certificates

The six stations share a warm timber workshop, with distinct machines and completion changes in `src/workshop-art.ts`. Pip repairs the route through a rule press (stamped certificate), packing bench (sealed package), cabinet (opened doors), universal engine (lit machinery), certificate gate (opened passage), and dispatch desk (finished certificates). The last scene introduces a ticket for the planned Induction Railway. The full ending requires all six proofs; visiting stations or solving W06 alone cannot claim it.

Each landmark has panoramic 640×240 and compact 160×160 compositions. Completion changes both the machine and Pip's position/carried paper. Six indicators reflect actual solved histories; Undo restores the unfinished machine. The original dungeon graphics and graph are retained. `scripts/poster.py` draws a separate workshop share poster with the same palette and original pixel geometry.

Both chapters use the fixed D02 Storeroom score and existing move/completion cues, with sound off on a fresh load. No new track is selected at a chapter boundary. This is the user's explicit continuity preference.

Run `REVIEW_URL=http://127.0.0.1:5173 node scripts/capture-workshop.mjs` with a dev server. It writes `artifacts/workshop/` scene sheets, desktop, mobile and compact screenshots (320, 375, 518 and 560 widths), plus the interactive guarantee comparison. These artifacts are untracked and excluded from builds. Human listening and phone/X review remain separate from automation.
