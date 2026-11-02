export type NoteEvent = {
  note: number;
  duration: number;
  kind: OscillatorType;
  gain: number;
};
export type Score = {
  id: string;
  title: string;
  melody: readonly number[];
  bass: readonly number[];
  stepSeconds: number;
  gate: number;
  instrument: OscillatorType;
  bassEvery: number;
  harmony?: readonly number[];
};
// The rising A–C–E cell is Pip's motif. Every room develops a different phrase.
export const scores: readonly Score[] = [
  {
    id: "D01",
    title: "A borrowed light",
    melody: [
      69, 0, 72, 0, 76, 0, 0, 0, 74, 0, 72, 0, 69, 0, 0, 0, 67, 0, 69, 0, 72, 0,
      71, 0, 64, 0, 67, 0, 69, 0, 0, 0,
    ],
    bass: [45, 43, 41, 40],
    stepSeconds: 0.25,
    gate: 0.34,
    instrument: "triangle",
    bassEvery: 8,
  },
  {
    id: "D02",
    title: "Dust and little treasures",
    melody: [
      69, 72, 76, 0, 72, 76, 79, 76, 74, 0, 71, 74, 76, 72, 69, 0, 65, 69, 72,
      0, 69, 72, 76, 72, 71, 67, 64, 67, 69, 0, 72, 0,
    ],
    bass: [45, 40, 41, 43],
    stepSeconds: 0.22,
    gate: 0.13,
    instrument: "triangle",
    bassEvery: 4,
  },
  {
    id: "D03",
    title: "An answer across the water",
    melody: [
      69, 0, 72, 76, 0, 74, 72, 0, 67, 0, 71, 74, 0, 72, 71, 0, 69, 0, 72, 76,
      0, 79, 76, 0, 67, 0, 71, 74, 0, 72, 69, 0,
    ],
    bass: [45, 43, 41, 40],
    stepSeconds: 0.3,
    gate: 0.5,
    instrument: "sine",
    bassEvery: 8,
  },
  {
    id: "D04",
    title: "The keeper’s clockwork",
    melody: [
      69, 76, 72, 76, 69, 76, 72, 76, 67, 74, 71, 74, 67, 74, 71, 74, 65, 72,
      69, 72, 65, 72, 69, 72, 64, 71, 67, 71, 69, 76, 72, 0,
    ],
    bass: [45, 43, 41, 40],
    stepSeconds: 0.19,
    gate: 0.1,
    instrument: "square",
    bassEvery: 4,
  },
  {
    id: "D05",
    title: "Moss remembers the sky",
    melody: [
      76, 0, 79, 0, 81, 0, 0, 79, 76, 0, 74, 0, 72, 0, 0, 0, 74, 0, 77, 0, 79,
      0, 0, 77, 74, 0, 72, 0, 69, 0, 0, 0,
    ],
    bass: [48, 43, 41, 45],
    stepSeconds: 0.32,
    gate: 0.6,
    instrument: "sine",
    bassEvery: 8,
  },
  {
    id: "D06",
    title: "Two reflections, one way home",
    melody: [
      69, 72, 76, 0, 79, 76, 72, 0, 71, 74, 77, 0, 76, 72, 69, 0, 81, 77, 74, 0,
      72, 74, 77, 0, 79, 76, 72, 0, 76, 72, 69, 0,
    ],
    bass: [45, 40, 50, 45],
    stepSeconds: 0.27,
    gate: 0.32,
    instrument: "triangle",
    bassEvery: 8,
  },
  {
    id: "D07",
    title: "Seven lanterns at dawn",
    melody: [
      69, 0, 72, 76, 79, 76, 72, 0, 74, 0, 77, 81, 79, 77, 74, 0, 76, 79, 84, 0,
      83, 79, 76, 0, 74, 72, 71, 67, 69, 72, 76, 81,
    ],
    bass: [45, 41, 48, 40],
    stepSeconds: 0.25,
    gate: 0.4,
    instrument: "triangle",
    bassEvery: 4,
    harmony: [57, 53, 60, 64],
  },
];
export function scoreFor(id: string): Score {
  const score = scores.find((s) => s.id === id);
  if (!score) throw new Error("Unknown room score");
  return score;
}
// Used by both the live scheduler and offline listening/verification renders.
export function scoreEvents(score: Score, step: number): NoteEvent[] {
  const n = step % score.melody.length,
    phrase = Math.floor(n / 8);
  const events: NoteEvent[] = [];
  if (score.melody[n])
    events.push({
      note: score.melody[n],
      duration: score.gate,
      kind: score.instrument,
      gain: score.instrument === "square" ? 0.022 : 0.055,
    });
  if (n % score.bassEvery === 0)
    events.push({
      note: score.bass[phrase],
      duration: Math.min(0.8, score.stepSeconds * score.bassEvery * 0.85),
      kind: "sine",
      gain: 0.06,
    });
  if (score.harmony && n % 4 === 0)
    events.push({
      note: score.harmony[phrase],
      duration: 0.6,
      kind: "triangle",
      gain: 0.025,
    });
  return events;
}
