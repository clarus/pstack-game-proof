import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.env.REVIEW_URL || "http://127.0.0.1:5173";
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    recordVideo: { dir: "artifacts/video", size: { width: 960, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto(base);
  await page.screenshot({
    path: "artifacts/dungeon-desktop.png",
    fullPage: true,
  });
  await page.goto(`${base}/#room=D06`);
  for (let i = 0; i < 4; i++)
    await page.locator('[data-move="advance"]').click();
  await page.setViewportSize({ width: 320, height: 245 });
  await page.screenshot({ path: "artifacts/dungeon-compact.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/dungeon-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 960, height: 720 });
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(500);
    await page.locator('[data-move="advance"]').click();
  }
  const rendered = await page.evaluate(async () => {
    const { scores } = await import("/src/score.ts");
    const { scheduleScore } = await import("/src/audio.ts");
    const results = [];
    for (const score of scores) {
      const duration = score.melody.length * score.stepSeconds + 1;
      const ctx = new OfflineAudioContext(
        1,
        Math.ceil(44100 * duration),
        44100,
      );
      const master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      scheduleScore(ctx, master, score);
      results.push({
        id: score.id,
        title: score.title,
        duration,
        samples: Array.from((await ctx.startRendering()).getChannelData(0)),
      });
    }
    return results;
  });
  mkdirSync("artifacts/music", { recursive: true });
  const stats = [];
  for (const { id, title, duration, samples } of rendered) {
    const wav = Buffer.alloc(44 + samples.length * 2);
    wav.write("RIFF");
    wav.writeUInt32LE(wav.length - 8, 4);
    wav.write("WAVEfmt ", 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(44100, 24);
    wav.writeUInt32LE(88200, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write("data", 36);
    wav.writeUInt32LE(samples.length * 2, 40);
    let peak = 0,
      energy = 0;
    samples.forEach((sample, i) => {
      peak = Math.max(peak, Math.abs(sample));
      energy += sample * sample;
      wav.writeInt16LE(
        Math.round(Math.max(-1, Math.min(1, sample)) * 32767),
        44 + i * 2,
      );
    });
    writeFileSync(`artifacts/music/${id}.wav`, wav);
    if (id === "D01") writeFileSync("artifacts/dungeon-audio.wav", wav);
    stats.push({
      id,
      title,
      durationSeconds: duration,
      sampleRate: 44100,
      peak,
      rms: Math.sqrt(energy / samples.length),
    });
  }
  writeFileSync(
    "artifacts/audio-review.json",
    JSON.stringify(
      {
        scope:
          "Seven offline renders of the actual score events and patches; human listening still required.",
        scores: stats,
      },
      null,
      2,
    ) + "\n",
  );
  for (const complete of [false, true]) {
    await page.evaluate(async (complete) => {
      const { drawScene } = await import("/src/art.ts");
      const { environments } = await import("/src/environments.ts");
      document.querySelector("#review-grid")?.remove();
      const grid = document.createElement("div");
      grid.id = "review-grid";
      grid.style.cssText =
        "position:absolute;top:0;left:0;z-index:100;background:#14251f;padding:12px;width:984px;display:grid;grid-template-columns:repeat(3,320px);gap:10px 0;color:#f0e5ca";
      environments.forEach((room, i) => {
        const box = document.createElement("div"),
          label = document.createElement("div"),
          canvas = document.createElement("canvas");
        label.textContent = `${i + 1}. ${room.name} · ${complete ? "restored" : "arrival"}`;
        label.style.cssText = "font:12px system-ui;padding:6px";
        canvas.style.cssText =
          "width:320px;height:120px;image-rendering:pixelated";
        box.append(label, canvas);
        grid.append(box);
        drawScene(canvas, i + 1, complete, Array(7).fill(complete));
      });
      document.body.append(grid);
    }, complete);
    await page
      .locator("#review-grid")
      .screenshot({
        path: `artifacts/rooms-${complete ? "restored" : "arrival"}.png`,
      });
  }
  const video = page.video();
  await context.close();
  await video.saveAs("artifacts/dungeon-walkthrough.webm");
  console.log(
    "Review screenshots, gameplay video, and audio preview written to artifacts/.",
  );
} finally {
  await browser.close();
}
