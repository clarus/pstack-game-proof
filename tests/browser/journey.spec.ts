import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Level } from "../../src/model.ts";
const levels: Level[] = JSON.parse(
  readFileSync(
    new URL("../../src/content/dungeon.json", import.meta.url),
    "utf8",
  ),
);

test("each room has a distinct scene, identity and matching score selection", async ({
  page,
}) => {
  test.setTimeout(60000);
  const scenes = new Set<string>(),
    names = new Set<string>();
  for (const level of levels) {
    await page.goto(`/#room=${level.id}`);
    await expect(page.locator(".shell")).toHaveAttribute(
      "data-score-id",
      level.id,
    );
    names.add(await page.locator(".scene-label").innerText());
    scenes.add(
      await page
        .locator("canvas")
        .evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
    );
    await expect(page.locator(".guide")).toContainText(level.story);
  }
  expect(scenes.size).toBe(7);
  expect(names.size).toBe(7);
});

test("a completed bridge changes the scene and undo extinguishes its lantern", async ({
  page,
}) => {
  await page.goto("/#room=D03");
  const before = await page
    .locator("canvas")
    .evaluate((c) => (c as HTMLCanvasElement).toDataURL());
  for (const _ of levels[2].solution)
    await page.locator('[data-move="advance"]').click();
  expect(
    await page
      .locator("canvas")
      .evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
  ).not.toBe(before);
  await expect(page.locator(".journey-progress")).toContainText(
    "1 / 7 lanterns lit",
  );
  await expect(page.locator(".guide")).toContainText("bridge extends");
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(page.locator(".journey-progress")).toContainText(
    "0 / 7 lanterns lit",
  );
  expect(
    await page
      .locator("canvas")
      .evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
  ).toBe(before);
});

test("compact card keeps room identity, story access and proof state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 245 });
  await page.goto("/#room=D06");
  await expect(page.locator(".compact-room")).toContainText("Hall of Mirrors");
  await expect(page.locator(".lantern-count")).toHaveAttribute(
    "aria-label",
    "0 of 7 lanterns lit",
  );
  await expect(page.locator(".goal-pane")).toBeVisible();
  await expect(page.locator(".hypotheses")).toBeVisible();
  await page.getByRole("button", { name: "Read room story" }).click();
  await expect(page.locator("dialog")).toContainText("two possible worlds");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator('[data-move="advance"]')).toBeVisible();
});

test("workshop ending requires seven actual solved proofs", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/#room=D07");
  for (const _ of levels[6].solution)
    await page.locator('[data-move="advance"]').click();
  await expect(page.locator(".guide")).not.toContainText(
    "All seven lanterns shine",
  );
  await expect(page.locator(".journey-progress")).toContainText(
    "1 / 7 lanterns lit",
  );
  await page.evaluate((levels) => {
    const histories = Object.fromEntries(levels.map((l) => [l.id, l.solution]));
    localStorage.setItem(
      "proof-quest:dungeon:v1:chapter",
      JSON.stringify({
        version: "dungeon-1",
        current: "D07",
        histories,
        sound: false,
        volume: 0.35,
      }),
    );
  }, levels);
  await page.reload();
  await expect(page.locator(".guide")).toContainText(
    "All seven lanterns shine",
  );
  await expect(page.locator(".guide")).toContainText(
    "who those facts are about",
  );
  await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
  await expect(page.locator(".journey-progress")).toContainText(
    "6 / 7 lanterns lit",
  );
  await expect(page.locator(".guide")).not.toContainText(
    "All seven lanterns shine",
  );
});
