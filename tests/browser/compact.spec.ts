import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Level } from "../../src/model.ts";

const levels: Level[] = JSON.parse(
  readFileSync(
    new URL("../../src/content/dungeon.json", import.meta.url),
    "utf8",
  ),
);

async function checkCard(page: Page, width: number, height: number) {
  const parts = await page
    .locator(
      `${width > 400 ? ".scene," : ""}.proof-workspace,.context,.formula,.choices,.toolbar`,
    )
    .evaluateAll((elements) =>
      elements.map((e) => {
        const r = e.getBoundingClientRect();
        return {
          name: e.className,
          top: r.top,
          bottom: r.bottom,
          right: r.right,
          height: r.height,
          width: r.width,
        };
      }),
    );
  for (const part of parts) {
    expect(part.top, part.name).toBeGreaterThanOrEqual(0);
    expect(part.bottom, part.name).toBeLessThanOrEqual(height + 1);
    expect(part.right, part.name).toBeLessThanOrEqual(width);
    expect(part.width, part.name).toBeGreaterThan(0);
    expect(part.height, part.name).toBeGreaterThanOrEqual(
      part.name === "scene" ? 70 : 24,
    );
  }
  const fontSizes = await page
    .locator(".choice > span:first-child,.formula,.fact")
    .evaluateAll((elements) =>
      elements.map((e) => ({
        name: e.className,
        size: parseFloat(getComputedStyle(e).fontSize),
      })),
    );
  for (const font of fontSizes)
    expect(font.size).toBeGreaterThanOrEqual(
      font.name === "formula" ? 20 : font.name === "fact" ? 18 : 13,
    );
}

for (const { width, height } of [
  { width: 320, height: 245 },
  { width: 518, height: 292 },
]) {
  test(`compact adventure stays visible through all rooms at ${width}x${height}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const scenes = new Set<string>();
    await page.goto("/#room=D01");
    for (const level of levels) {
      await expect(page.locator(".shell")).toHaveAttribute(
        "data-room-id",
        level.id,
      );
      await expect(page.locator(".scene")).toBeVisible();
      const before = await page
        .locator("canvas")
        .evaluate((c) => (c as HTMLCanvasElement).toDataURL());
      scenes.add(before);
      if (width <= 400)
        await page.getByRole("button", { name: "Start proof" }).click();
      await checkCard(page, width, height);
      for (const _ of level.solution) {
        await page.locator('[data-move="advance"]').click();
        await checkCard(page, width, height);
      }
      await expect(
        page.getByText("Door opened.", { exact: true }),
      ).toBeVisible();
      await expect(page.locator(".scene")).toHaveAttribute(
        "aria-label",
        /lantern lit$/,
      );
      if (width <= 400)
        await page.getByRole("button", { name: "View room" }).click();
      expect(
        await page
          .locator("canvas")
          .evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
      ).not.toBe(before);
      if (width <= 400)
        await page.getByRole("button", { name: "Continue proof" }).click();
      await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
      await expect(page.locator(".scene")).toHaveAttribute(
        "aria-label",
        /lantern unlit$/,
      );
      await page.locator('[data-move="advance"]').click();
      if (level.id !== "D07")
        await page.getByRole("button", { name: "Next room" }).click();
    }
    expect(scenes.size).toBe(7);
  });
}

test("compact tools, expansion and resize preserve the proof", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 245 });
  await page.goto("/#room=D02");
  await page.getByRole("button", { name: "Start proof" }).click();
  await page.locator('[data-move="advance"]').click();
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("button", { name: "Proof script", exact: true }).click();
  await expect(page.locator("pre")).toContainText("intro H.");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("button", { name: "Save / restore" }).click();
  await expect(page.locator("#progress-code")).not.toHaveValue("");
  await page.getByRole("button", { name: "Close dialog" }).click();
  const opened = context.waitForEvent("page");
  await page.getByRole("link", { name: "Expand game in a new tab" }).click();
  const full = await opened;
  await full.waitForLoadState();
  await expect(full.locator(".context")).toContainText("(A ∧ B)");
  await full.close();
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.locator("canvas")).toHaveAttribute("width", "640");
  await page.setViewportSize({ width: 320, height: 245 });
  await expect(page.locator("canvas")).toHaveAttribute("width", "160");
  await expect(page.locator(".context")).toContainText("(A ∧ B)");
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("button", { name: "↻ Restart" }).click();
  await page.getByRole("button", { name: "Restart room", exact: true }).click();
  await expect(page.locator(".context")).toContainText("No assumptions");
});
