import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
const base = process.env.REVIEW_URL || "http://127.0.0.1:5173";
const levels = JSON.parse(readFileSync("src/content/workshop.json", "utf8"));
mkdirSync("artifacts/workshop", { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
  });
  await page.goto(`${base}/?chapter=2`);
  await page.screenshot({
    path: "artifacts/workshop/desktop.png",
    fullPage: true,
  });
  for (const [width, height] of [
    [320, 245],
    [375, 245],
    [518, 292],
    [560, 315],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${base}/?chapter=2&level=3`);
    if (height < 500 && width <= 400) {
      await page.screenshot({
        path: `artifacts/workshop/${width}-arrival.png`,
      });
      await page.getByRole("button", { name: "Start proof" }).click();
    }
    for (let i = 0; i < 3; i++)
      await page.locator('[data-move="advance"]').click();
    await page.screenshot({
      path: `artifacts/workshop/${width}-proof.png`,
      fullPage: true,
    });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${base}/?chapter=2&level=2`);
    if (height < 500 && width <= 400)
      await page.getByRole("button", { name: "Start proof" }).click();
    await page.locator('[data-move="advance"]').click();
    await page.screenshot({
      path: `artifacts/workshop/${width}-choices.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(`${base}/?chapter=2&level=6`);
  for (const _ of levels[5].solution)
    await page.locator('[data-move="advance"]').click();
  await page
    .getByRole("button", { name: "Compare guarantees", exact: true })
    .click();
  await page.getByRole("button", { name: "Use false for both" }).click();
  await page.screenshot({ path: "artifacts/workshop/guarantees.png" });
  for (const compact of [false, true]) {
    await page.evaluate(async (compact) => {
      const { drawWorkshop } = await import("/src/workshop-art.ts");
      const { workshopEnvironments } = await import("/src/environments.ts");
      document.querySelector("dialog")?.close();
      document.querySelector("#review-grid")?.remove();
      const grid = document.createElement("div");
      grid.id = "review-grid";
      grid.style.cssText =
        "position:absolute;top:0;left:0;z-index:100;background:#14251f;padding:12px;display:grid;grid-template-columns:repeat(3,320px);gap:10px;color:#f0e5ca";
      for (const complete of [false, true])
        workshopEnvironments.forEach((room, i) => {
          const box = document.createElement("div"),
            label = document.createElement("div"),
            canvas = document.createElement("canvas");
          label.textContent = `${i + 1}. ${room.name} · ${complete ? "restored" : "arrival"}`;
          label.style.cssText = "font:12px system-ui;padding:6px";
          canvas.style.cssText = `width:${compact ? 160 : 320}px;height:${compact ? 160 : 120}px;image-rendering:pixelated`;
          box.append(label, canvas);
          grid.append(box);
          drawWorkshop(
            canvas,
            i + 1,
            complete,
            Array(6).fill(complete),
            compact,
          );
        });
      document.body.append(grid);
    }, compact);
    await page.locator("#review-grid").screenshot({
      path: `artifacts/workshop/scenes-${compact ? "compact" : "wide"}.png`,
    });
  }
} finally {
  await browser.close();
}
console.log("Workshop review screenshots written to artifacts/workshop/.");
