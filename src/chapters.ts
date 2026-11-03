import type { Level } from "./model.ts";
import { journeyEnding, workshopEnding } from "./environments.ts";

export const chapters = [
  {
    id: 1,
    prefix: "D",
    name: "The Proof Dungeon",
    shortName: "Dungeon",
    total: 7,
    unit: "lanterns lit",
    task: "Relight the path to the Workshop.",
    ending: journeyEnding,
  },
  {
    id: 2,
    prefix: "W",
    name: "The Proof Workshop",
    shortName: "Workshop",
    total: 6,
    unit: "stations restored",
    task: "Repair the machines. Certify the way forward.",
    ending: workshopEnding,
  },
] as const;

export function chapterFor(id: string) {
  const chapter = chapters.find((c) => id.startsWith(c.prefix));
  if (!chapter) throw new Error("Unknown chapter");
  return chapter;
}
export function chapterLevels(id: string, levels: Level[]) {
  return levels.filter((l) => l.id.startsWith(chapterFor(id).prefix));
}
export function entryRoom(
  url: URL,
  levels: Level[],
): { room?: string; warning?: string } {
  const hash = /^#room=([DW]\d{2})$/.exec(url.hash);
  if (hash)
    return levels.some((l) => l.id === hash[1])
      ? { room: hash[1] }
      : {
          room: levels[0].id,
          warning: "That room is not available in this edition.",
        };
  const chapterId =
    url.searchParams.get("chapter") ??
    /chapter-(\d+)\.html$/.exec(url.pathname)?.[1];
  if (chapterId === undefined || chapterId === null) return {};
  const chapter = chapters.find((c) => String(c.id) === chapterId);
  const number = url.searchParams.get("level") ?? "1";
  const room =
    chapter && /^[1-9]\d?$/.test(number)
      ? chapter.prefix + number.padStart(2, "0")
      : "";
  return levels.some((l) => l.id === room)
    ? { room }
    : {
        room: levels[0].id,
        warning: "That chapter or level is not available in this edition.",
      };
}
