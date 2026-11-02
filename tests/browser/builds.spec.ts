import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";

for (const [profile, count] of [
  ["chapter", 7],
  ["preview", 6],
  ["embed-test", 1],
] as const) {
  test(`${profile} static edition has metadata, isolated content, and base-path assets`, async ({
    page,
    request,
  }) => {
    const report = JSON.parse(
      readFileSync(`artifacts/build-${profile}.json`, "utf8"),
    );
    expect(report.levels).toBe(count);
    expect(report.gzipBytesUpperBound).toBeLessThan(150 * 1024);
    const html = await request.get(
      `http://127.0.0.1:4174/${profile}/index.html`,
    );
    const source = await html.text();
    expect(source).toContain('name="twitter:card" content="player"');
    expect(source).toContain(`content="${report.siteUrl}embed.html"`);
    const failures: string[] = [];
    page.on("requestfailed", (r) => failures.push(r.url()));
    const origins = new Set<string>();
    page.on("request", (r) => origins.add(new URL(r.url()).origin));
    await page.goto(`http://127.0.0.1:4174/${profile}/embed.html#room=D01`);
    await page.locator('[data-move="advance"]').click();
    await page.locator('[data-move="advance"]').click();
    await expect(page.getByText("Door opened.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Chapters", exact: true }).click();
    await expect(page.locator("[data-select-room]")).toHaveCount(count);
    expect(failures).toEqual([]);
    expect([...origins]).toEqual(["http://127.0.0.1:4174"]);
    const script = readdirSync(`dist/${profile}/assets`).find((p) =>
      p.endsWith(".js"),
    )!;
    const bundle = readFileSync(`dist/${profile}/assets/${script}`, "utf8");
    if (count < 7) expect(bundle).not.toContain("The keeper’s gate");
    if (count === 1) expect(bundle).not.toContain("Open the toolbox");
  });
}
