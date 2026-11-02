import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const viewport of [
  { width: 1280, height: 1000 },
  { width: 320, height: 245 },
]) {
  test(`accessible controls and contrast at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/#room=D06");
    if (viewport.height <= 500) {
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.getByRole("button", { name: "Start proof" }).click();
    }
    for (let i = 0; i < 4; i++)
      await page.locator('[data-move="advance"]').click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          reason: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test("initial room and menus have accessible text and controls", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  const scan = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          reason: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  };
  await scan();
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  await scan();
  await page.getByText("Proof glossary", { exact: true }).click();
  await scan();
});
