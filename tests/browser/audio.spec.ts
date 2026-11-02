import { test, expect } from "@playwright/test";

test("unavailable audio times out without blocking proof moves", async ({
  page,
}) => {
  await page.addInitScript(() => {
    AudioContext.prototype.resume = () => new Promise(() => {});
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle sound" }).click();
  await expect(page.locator(".feedback")).toContainText(
    "Audio could not start",
  );
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toBeEnabled();
  await page.locator('[data-move="advance"]').click();
  await page.locator('[data-move="advance"]').click();
  await expect(page.getByText("Door opened.", { exact: true })).toBeVisible();
});

test("real synthesizer renders sound with headroom and disposes voices", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const path = "/src/audio.ts";
    const { Music } = await import(path);
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const music = new Music();
    music.ctx = ctx;
    music.master = ctx.createGain();
    music.master.gain.value = 0.35;
    music.master.connect(ctx.destination);
    music.enabled = true;
    for (let i = 0; i < 20; i++) music.play(69, 0.02, 0.3);
    const capped = music.voices.size;
    const buffer = await ctx.startRendering();
    const samples = buffer.getChannelData(0);
    let peak = 0,
      energy = 0;
    for (const n of samples) {
      peak = Math.max(peak, Math.abs(n));
      energy += n * n;
    }
    const before = Math.max(...samples.slice(0, 400).map(Math.abs));
    const tail = Math.max(...samples.slice(-1000).map(Math.abs));
    music.pause();
    return {
      capped,
      peak,
      rms: Math.sqrt(energy / samples.length),
      before,
      tail,
      voices: music.voices.size,
    };
  });
  expect(result.capped).toBe(12);
  expect(result.peak).toBeGreaterThan(0.02);
  expect(result.peak).toBeLessThan(0.5);
  expect(result.rms).toBeGreaterThan(0.005);
  expect(result.before).toBe(0);
  expect(result.tail).toBe(0);
  expect(result.voices).toBe(0);
});

test("synth scheduler preserves its place and stops on pause", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const path = "/src/audio.ts";
    const { Music } = await import(path);
    const music = new Music();
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    music.ctx = ctx;
    music.enabled = true;
    const events: unknown[] = [];
    music.play = (...args: unknown[]) => events.push(args);
    music.start();
    const first = { step: music.step, next: music.next, count: events.length };
    music.pause();
    const stopped = music.timer === undefined;
    music.start();
    const resumed = music.step;
    music.pause();
    return { first, stopped, resumed };
  });
  expect(result.first).toEqual({ step: 1, next: 0.29, count: 2 });
  expect(result.stopped).toBe(true);
  expect(result.resumed).toBe(2);
});

test("every room score renders a distinct non-clipping complete loop", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  const rendered = await page.evaluate(async () => {
    const scorePath = "/src/score.ts",
      audioPath = "/src/audio.ts";
    const { scores } = await import(scorePath);
    const { scheduleScore } = await import(audioPath);
    const results = [];
    for (const score of scores) {
      const ctx = new OfflineAudioContext(
        1,
        Math.ceil((score.melody.length * score.stepSeconds + 1) * 22050),
        22050,
      );
      scheduleScore(ctx, ctx.destination, score);
      const samples = (await ctx.startRendering()).getChannelData(0);
      let peak = 0,
        energy = 0,
        hash = 2166136261;
      for (const sample of samples) {
        peak = Math.max(peak, Math.abs(sample));
        energy += sample * sample;
        hash = Math.imul(hash ^ Math.round(sample * 32767), 16777619);
      }
      results.push({
        id: score.id,
        peak,
        rms: Math.sqrt(energy / samples.length),
        hash,
      });
    }
    return results;
  });
  expect(new Set(rendered.map((r) => r.hash)).size).toBe(7);
  for (const r of rendered) {
    expect(r.peak).toBeGreaterThan(0.025);
    expect(r.peak).toBeLessThan(0.5);
    expect(r.rms).toBeGreaterThan(0.003);
  }
});

test("rapid room changes retire old music and mute prevents restart", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle sound" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle sound" }),
  ).toHaveAttribute("aria-pressed", "true");
  const result = await page.evaluate(async () => {
    const path = "/src/audio.ts";
    const { Music } = await import(path);
    const music = new Music();
    await music.enable(true);
    const oldBus = music.bed;
    music.setRoom("D02");
    music.setRoom("D03");
    music.setRoom("D07");
    await new Promise((r) => setTimeout(r, 500));
    const result = {
      id: music.score.id,
      oldNotes: [...music.destinations.values()].filter((d) => d === oldBus)
        .length,
      voices: music.voices.size,
    };
    await music.enable(false);
    music.setRoom("D05");
    await new Promise((r) => setTimeout(r, 200));
    const muted = {
      id: music.score.id,
      enabled: music.enabled,
      timer: music.timer,
      voices: music.voices.size,
    };
    music.dispose();
    return { result, muted };
  });
  expect(result.result.id).toBe("D07");
  expect(result.result.oldNotes).toBe(0);
  expect(result.result.voices).toBeLessThanOrEqual(12);
  expect(result.muted).toEqual({
    id: "D05",
    enabled: false,
    timer: undefined,
    voices: 0,
  });
});
