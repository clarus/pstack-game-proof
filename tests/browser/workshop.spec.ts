import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import type { Level } from "../../src/model.ts";
const levels: Level[] = JSON.parse(
  readFileSync("src/content/workshop.json", "utf8"),
);
async function solve(page: Page, level: Level) {
  for (const _ of level.solution)
    await page.locator('[data-move="advance"]').click();
}
for (const [width, height] of [
  [320, 245],
  [518, 292],
  [1280, 1000],
]) {
  test(`six workshop stations stay playable at ${width}x${height}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height });
    await page.goto("/?chapter=2");
    const scenes = new Set<string>();
    for (const level of levels) {
      await expect(page.locator(".shell")).toHaveAttribute(
        "data-room-id",
        level.id,
      );
      await expect(page.locator(".shell")).toHaveAttribute(
        "data-score-id",
        "D02",
      );
      const before = await page
        .locator("canvas")
        .evaluate((c) => (c as HTMLCanvasElement).toDataURL());
      scenes.add(before);
      if (width === 320)
        await page.getByRole("button", { name: "Start proof" }).click();
      for (const _ of level.solution) {
        if (height < 500) {
          const boxes = await page
            .locator(".context,.formula,.choices,.toolbar")
            .evaluateAll((elements) =>
              elements.map((e) => {
                const r = e.getBoundingClientRect();
                return {
                  top: r.top,
                  bottom: r.bottom,
                  right: r.right,
                  height: r.height,
                };
              }),
            );
          for (const box of boxes) {
            expect(box.top).toBeGreaterThanOrEqual(0);
            expect(box.bottom).toBeLessThanOrEqual(height + 1);
            expect(box.right).toBeLessThanOrEqual(width);
            expect(box.height).toBeGreaterThanOrEqual(24);
          }
        }
        await page.locator('[data-move="advance"]').click();
      }
      await expect(
        page.getByText("Station restored.", { exact: true }),
      ).toBeVisible();
      await expect(page.locator(".scene")).toHaveAttribute(
        "aria-label",
        /station restored$/,
      );
      expect(
        await page
          .locator("canvas")
          .evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
      ).not.toBe(before);
      await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
      await expect(page.locator(".scene")).toHaveAttribute(
        "aria-label",
        /awaiting proof$/,
      );
      await page.locator('[data-move="advance"]').click();
      if (level.id !== "W06")
        await page.getByRole("button", { name: "Next room" }).click();
    }
    expect(scenes.size).toBe(6);
    await expect(page.locator(".lantern-count")).toHaveAttribute(
      "aria-label",
      "6 of 6 stations restored",
    );
    await page
      .getByRole("button", { name: "Compare guarantees", exact: true })
      .click();
    await page.getByRole("button", { name: "Use false for both" }).click();
    await expect(page.locator("#witness-result")).toContainText(
      "Input true, witness false: does not match",
    );
    await page.getByRole("button", { name: "Use true for both" }).click();
    await expect(page.locator("#witness-result")).toContainText(
      "Input false, witness true: does not match",
    );
  });
}
test("wrong witnesses, discovered objects, keyboard and accessible proof states", async ({
  page,
}) => {
  await page.goto("/?chapter=2&level=2");
  await page.locator('[data-move="advance"]').click();
  const wrong = page.getByRole("button", { name: /Choose witness b/ });
  await wrong.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".formula")).toHaveText("P(b)");
  await expect(page.locator(".context")).toContainText("P(a)");
  await page.getByRole("button", { name: "Undo this choice" }).click();
  await expect(page.locator(".formula")).toContainText("∃");
  await page.goto("/?chapter=2&level=3");
  await page.locator('[data-move="advance"]').click();
  await page.getByRole("button", { name: /Use x before opening/ }).click();
  await expect(page.locator(".feedback")).toContainText("not available");
  await page.locator('[data-move="advance"]').click();
  await expect(
    page
      .locator(".fact")
      .filter({ has: page.locator("code", { hasText: /^x$/ }) }),
  ).toContainText("T");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("chapter links preserve old saves, hand off to workshop, and retain audio selection", async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "proof-quest:dungeon:v1:chapter",
      JSON.stringify({
        version: "dungeon-1",
        current: "D01",
        histories: { D01: ["advance", "advance"] },
        sound: false,
        volume: 0.35,
      }),
    ),
  );
  await page.reload();
  await expect(page.getByText("Door opened.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Toggle sound" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  await page.locator('[data-select-room="W01"]').click();
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".shell")).toHaveAttribute("data-score-id", "D02");
  await page.locator('[data-move="advance"]').click();
  const url = await page
    .getByRole("link", { name: "Expand game in a new tab" })
    .getAttribute("href");
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto(url!);
  await expect(fresh.locator(".context")).toContainText("Hall");
  await expect(
    fresh.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "false");
  await context.close();
  await page.goto("/#room=D01");
  await expect(page.getByText("Door opened.", { exact: true })).toBeVisible();
});
test("chapter completion counts solved workshop stations independently", async ({
  page,
}) => {
  await page.goto("/?chapter=2&level=6");
  await solve(page, levels[5]);
  await expect(page.locator(".lantern-count")).toHaveAttribute(
    "aria-label",
    "1 of 6 stations restored",
  );
  await expect(page.locator(".guide")).not.toContainText("All six stations");
  const dungeon: Level[] = JSON.parse(
    readFileSync("src/content/dungeon.json", "utf8"),
  );
  await page.goto("/#room=D07");
  await solve(page, dungeon[6]);
  await page.getByRole("button", { name: "Enter Workshop" }).click();
  await expect(page.locator(".shell")).toHaveAttribute("data-room-id", "W01");
});
test("chapter-specific static share pages have distinct metadata and working base-path assets", async ({
  page,
  request,
}) => {
  const root = "http://127.0.0.1:4174/chapter/";
  const html = await (await request.get(root + "chapter-2.html")).text();
  expect(html).toContain("The Proof Workshop");
  expect(html).toContain("embed.html?chapter=2");
  expect(html).toContain("workshop-poster.png");
  expect(
    await (await request.get(root + "workshop-poster.png")).body(),
  ).not.toEqual(await (await request.get(root + "poster.png")).body());
  const failures: string[] = [];
  page.on("requestfailed", (r) => failures.push(r.url()));
  await page.goto(root + "chapter-2.html");
  await expect(page.locator(".shell")).toHaveAttribute("data-room-id", "W01");
  await solve(page, levels[0]);
  await page.goto(root + "embed.html?chapter=2&level=5");
  await expect(page.locator(".shell")).toHaveAttribute("data-room-id", "W05");
  await page.goto(root + "chapter-1.html");
  await expect(page.locator(".shell")).toHaveAttribute("data-room-id", "D01");
  await page.goto(root + "embed.html?chapter=3");
  await expect(page.locator(".feedback")).toContainText("not available");
  expect(failures).toEqual([]);
});
