import { CONTENT_VERSION, replay, type Level } from "./model.ts";
export type Progress = {
  version: string;
  current: string;
  histories: Record<string, string[]>;
  sound: boolean;
  volume: number;
};
export const SAVE_KEY = "proof-quest:dungeon:v1";
export function fresh(levels: Level[]): Progress {
  return {
    version: CONTENT_VERSION,
    current: levels[0].id,
    histories: {},
    sound: false,
    volume: 0.35,
  };
}
export function validate(input: unknown, levels: Level[]): Progress {
  if (!input || typeof input !== "object")
    throw new Error("This is not a progress code.");
  const p = input as Progress;
  if (p.version !== CONTENT_VERSION)
    throw new Error(
      "This save belongs to a different edition. Your current progress is unchanged.",
    );
  if (
    typeof p.current !== "string" ||
    !levels.some((l) => l.id === p.current) ||
    !p.histories ||
    typeof p.histories !== "object" ||
    Array.isArray(p.histories)
  )
    throw new Error("Unknown room or progress format.");
  if (
    typeof p.sound !== "boolean" ||
    typeof p.volume !== "number" ||
    !Number.isFinite(p.volume) ||
    p.volume < 0 ||
    p.volume > 1
  )
    throw new Error("Invalid audio settings.");
  const histories: Record<string, string[]> = {};
  for (const [id, history] of Object.entries(p.histories)) {
    const level = levels.find((l) => l.id === id);
    if (
      !level ||
      !Array.isArray(history) ||
      history.length > 128 ||
      history.some((x) => typeof x !== "string")
    )
      throw new Error(
        "This save includes an unavailable room or invalid moves.",
      );
    replay(level, history);
    histories[id] = [...history];
  }
  return {
    version: CONTENT_VERSION,
    current: p.current,
    histories,
    sound: p.sound,
    volume: p.volume,
  };
}
export function encode(p: Progress) {
  return "PQ1." + btoa(JSON.stringify(p));
}
export function decode(text: string, levels: Level[]) {
  if (text.length > 24000 || !/^PQ1\.[A-Za-z0-9+/=]+$/.test(text))
    throw new Error("Paste a complete PQ1 progress code (up to 24 KB).");
  return validate(JSON.parse(atob(text.slice(4))), levels);
}
export function load(
  storage: Pick<Storage, "getItem">,
  levels: Level[],
): { progress: Progress; warning: string } {
  try {
    const saved = storage.getItem(SAVE_KEY);
    if (!saved) return { progress: fresh(levels), warning: "" };
    if (saved.length > 24000) throw new Error("Save too large");
    return { progress: validate(JSON.parse(saved), levels), warning: "" };
  } catch {
    return {
      progress: fresh(levels),
      warning:
        "Saved progress is unavailable or incompatible. You can play normally and use Copy progress.",
    };
  }
}
export function save(
  storage: Pick<Storage, "setItem">,
  progress: Progress,
): boolean {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
