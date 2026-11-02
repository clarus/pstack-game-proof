import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Level } from "../../src/model.ts";
test("standalone link restores the current proof in a fresh browser context", async ({
  page,
  browser,
}) => {
  await page.goto("/#room=D02");
  await page.locator('[data-move="advance"]').click();
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  const href = await page
    .getByRole("link", { name: "Open full game" })
    .getAttribute("href");
  const freshContext = await browser.newContext();
  try {
    const standalone = await freshContext.newPage();
    await standalone.goto(href!);
    await expect(standalone.locator("h1")).toHaveText("Open the toolbox");
    await expect(standalone.locator(".context")).toContainText("(A ∧ B)");
    await expect(standalone.locator(".feedback")).toHaveText(
      "Your progress is restored.",
    );
  } finally {
    await freshContext.close();
  }
});
test("stale clicks do not advance a replacement proof state", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-move="advance"]').evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(page.locator(".context")).toContainText("HA");
  await expect(page.locator('[data-move="advance"]')).toBeVisible();
  await page.reload();
  await expect(page.locator(".context")).toContainText("HA");
});
const levels: Level[] = JSON.parse(
  readFileSync(
    new URL("../../src/content/dungeon.json", import.meta.url),
    "utf8",
  ),
);
test("all seven rooms complete through actual controls", async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const level of levels) {
    await page.goto(`/#room=${level.id}`);
    for (const _ of level.solution)
      await page.locator('[data-move="advance"]').click();
    await expect(page.getByText("Door opened.", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Proof script", exact: true })
      .click();
    await expect(page.locator("pre")).toContainText("Qed.");
    await page.getByRole("button", { name: "Close dialog" }).click();
    await page.getByRole("button", { name: "↶ Undo", exact: true }).click();
    await expect(page.locator('[data-move="advance"]')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
for (const size of [
  { width: 320, height: 245 },
  { width: 375, height: 245 },
  { width: 560, height: 315 },
  { width: 390, height: 844 },
])
  test(`proof state remains visible at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto("/#room=D06");
    for (let i = 0; i < 4; i++)
      await page.locator('[data-move="advance"]').click();
    await expect(page.locator(".hypotheses")).toBeVisible();
    await expect(page.locator(".goal-pane")).toBeVisible();
    await expect(page.locator(".context")).toContainText("HA");
    const boxes = await page
      .locator(".proof-workspace,.choices,.toolbar")
      .evaluateAll((elements) =>
        elements.map((e) => {
          const r = e.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, right: r.right };
        }),
      );
    for (const b of boxes) {
      expect(b.top).toBeGreaterThanOrEqual(0);
      if (size.height < 500)
        expect(b.bottom).toBeLessThanOrEqual(size.height + 1);
      expect(b.right).toBeLessThanOrEqual(size.width + 1);
    }
    await page.getByRole("button", { name: "Inspect goal 2" }).click();
    await expect(page.locator(".context")).toContainText("HB");
    await expect(page.locator(".context")).not.toContainText("HA:");
    await page.getByRole("button", { name: "Return to active goal" }).click();
  });
test("invalid choice, dead end, undo, refresh, and restore", async ({
  page,
}) => {
  await page.goto("/#room=D05");
  await page.locator('[data-move="advance"]').click();
  await page.locator("button.choice").filter({ hasText: "left." }).click();
  await expect(page.locator(".dead-end")).toBeVisible();
  await page.getByRole("button", { name: "Undo this choice" }).click();
  await page.reload();
  await expect(
    page.locator("button.choice").filter({ hasText: "right." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save / restore" }).click();
  const code = await page.locator("#progress-code").inputValue();
  await page.locator("#progress-code").fill("broken");
  await page.getByRole("button", { name: "Restore code" }).click();
  await expect(page.locator("#import-result")).toContainText("PQ1");
  await page.locator("#progress-code").fill(code);
  await page.getByRole("button", { name: "Restore code" }).click();
  await expect(
    page.locator("button.choice").filter({ hasText: "right." }),
  ).toBeVisible();
});
test("play with storage denied and reduced motion", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("denied");
      },
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-move="advance"]').click();
  await page.locator('[data-move="advance"]').click();
  await expect(page.getByText("Door opened.", { exact: true })).toBeVisible();
  await expect(page.locator(".save-status")).toContainText("Session only");
});
test("audio requires activation and mute survives room navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Toggle sound" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Toggle sound" }).click();
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  await page.getByRole("button", { name: "02 · Open the toolbox" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "false");
});
test("cross-origin sandbox frame remains playable", async ({ page }) => {
  await page.goto("/iframe-test.html");
  const frame = page.frameLocator('iframe[title="Compact game"]');
  await frame.locator('[data-move="advance"]').click();
  await frame.locator('[data-move="advance"]').click();
  await expect(frame.getByText("Door opened.", { exact: true })).toBeVisible();
});
test("keyboard choices and restart confirmation", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-move="advance"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".context")).toContainText("HA");
  await page.getByRole("button", { name: "↻ Restart" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".context")).toContainText("HA");
  await page.getByRole("button", { name: "↻ Restart" }).click();
  await page.getByRole("button", { name: "Restart room", exact: true }).click();
  await expect(page.locator(".context")).toContainText("No assumptions");
});
