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
  const samples = await page.evaluate(async () => {
    const { melody, tone } = await import("/src/audio.ts");
    const ctx = new OfflineAudioContext(1, 44100 * 9, 44100);
    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    melody.forEach((note, step) => {
      const time = 0.04 + step * 0.25;
      if (note)
        tone(
          ctx,
          master,
          note,
          time,
          0.35,
          step % 8 === 0 ? "square" : "triangle",
          step % 8 === 0 ? 0.025 : 0.07,
        );
      if (step % 4 === 0)
        tone(
          ctx,
          master,
          [45, 43, 41, 40][Math.floor(step / 8) % 4],
          time,
          0.8,
          "sine",
          0.09,
        );
    });
    const result = await ctx.startRendering();
    return Array.from(result.getChannelData(0));
  });
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
  writeFileSync("artifacts/dungeon-audio.wav", wav);
  writeFileSync(
    "artifacts/audio-review.json",
    JSON.stringify(
      {
        sampleRate: 44100,
        durationSeconds: 9,
        peak,
        rms: Math.sqrt(energy / samples.length),
        scope:
          "Offline preview of the shipped melody and tone patches; human listening still required.",
      },
      null,
      2,
    ) + "\n",
  );
  const video = page.video();
  await context.close();
  await video.saveAs("artifacts/dungeon-walkthrough.webm");
  console.log(
    "Review screenshots, gameplay video, and audio preview written to artifacts/.",
  );
} finally {
  await browser.close();
}
