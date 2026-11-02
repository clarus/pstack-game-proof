import { scoreFor, scoreEvents, type Score } from "./score.ts";
export function frequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}
export function tone(
  ctx: BaseAudioContext,
  destination: AudioNode,
  note: number,
  time: number,
  duration: number,
  kind: OscillatorType = "triangle",
  gain = 0.08,
) {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = kind;
  oscillator.frequency.value = frequency(note);
  envelope.gain.setValueAtTime(0, time);
  envelope.gain.linearRampToValueAtTime(gain, time + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.02);
  oscillator.onended = () => {
    oscillator.disconnect();
    envelope.disconnect();
  };
  return oscillator;
}
export function scheduleScore(
  ctx: BaseAudioContext,
  destination: AudioNode,
  score: Score,
  start = 0.04,
) {
  for (let step = 0; step < score.melody.length; step++)
    for (const event of scoreEvents(score, step))
      tone(
        ctx,
        destination,
        event.note,
        start + step * score.stepSeconds,
        event.duration,
        event.kind,
        event.gain,
      );
}
export class Music {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  bed: GainNode | null = null;
  readonly score = scoreFor("D02");
  destinations = new Map<AudioScheduledSourceNode, AudioNode>();
  enabled = false;
  volume = 0.35;
  timer: number | undefined;
  step = 0;
  next = 0;
  voices = new Set<AudioScheduledSourceNode>();
  async enable(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.pause();
      return;
    }
    try {
      this.ctx ??= new AudioContext();
      this.master ??= this.ctx.createGain();
      this.master.disconnect();
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.volume;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          this.ctx.resume(),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(
              () => reject(new Error("Audio activation timed out")),
              2500,
            );
          }),
        ]);
      } finally {
        clearTimeout(timeout);
      }
      this.start();
    } catch {
      this.enabled = false;
      this.dispose();
      throw new Error(
        "Audio could not start. The game is fully playable without it.",
      );
    }
  }
  setVolume(value: number) {
    this.volume = value;
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }
  play(
    note: number,
    time: number,
    duration: number,
    kind: OscillatorType = "triangle",
    gain = 0.06,
    destination: AudioNode | null = this.master,
  ) {
    if (!this.ctx || !destination || this.voices.size >= 12) return;
    const voice = tone(
      this.ctx,
      destination,
      note,
      time,
      duration,
      kind,
      Math.min(gain, 0.06),
    );
    this.destinations.set(voice, destination);
    this.voices.add(voice);
    const cleanup = voice.onended;
    voice.onended = (event) => {
      if (typeof cleanup === "function") cleanup.call(voice, event);
      this.voices.delete(voice);
      this.destinations.delete(voice);
      if (
        destination !== this.master &&
        destination !== this.bed &&
        ![...this.destinations.values()].includes(destination)
      )
        destination.disconnect();
    };
  }
  start() {
    if (!this.enabled || !this.ctx || document.hidden) return;
    this.pause();
    if (this.master) {
      this.bed?.disconnect();
      this.bed = this.ctx.createGain();
      this.bed.connect(this.master);
      this.bed.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bed.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.15);
    }
    this.next = this.ctx.currentTime + 0.04;
    this.timer = window.setInterval(() => this.schedule(), 80);
    this.schedule();
  }
  schedule() {
    if (!this.ctx) return;
    while (this.next < this.ctx.currentTime + 0.16) {
      for (const event of scoreEvents(this.score, this.step))
        this.play(
          event.note,
          this.next,
          event.duration,
          event.kind,
          event.gain,
          this.bed,
        );
      this.next += this.score.stepSeconds;
      this.step++;
    }
  }
  cue(kind: "move" | "invalid" | "complete" | "undo" | "hint") {
    if (!this.enabled || !this.ctx || document.hidden) return;
    if (kind === "invalid") this.noise();
    const notes =
      kind === "complete"
        ? [72, 76, 79, 84]
        : kind === "invalid"
          ? [48]
          : kind === "undo"
            ? [67, 64]
            : kind === "hint"
              ? [76, 79]
              : [72, 76];
    notes.forEach((n, i) =>
      this.play(n, this.ctx!.currentTime + i * 0.09, 0.18, "triangle", 0.1),
    );
  }
  noise() {
    if (!this.ctx || !this.master || this.voices.size >= 12) return;
    const buffer = this.ctx.createBuffer(
      1,
      Math.ceil(this.ctx.sampleRate * 0.07),
      this.ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = ((seed / 4294967296) * 2 - 1) * (1 - i / data.length) * 0.025;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.master);
    this.voices.add(source);
    source.onended = () => {
      source.disconnect();
      this.voices.delete(source);
    };
    source.start();
  }
  pause() {
    window.clearInterval(this.timer);
    this.timer = undefined;
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {}
    }
    this.voices.clear();
  }
  visibility() {
    if (document.hidden) this.pause();
    else if (this.enabled) {
      void this.ctx
        ?.resume()
        .then(() => this.start())
        .catch(() => {
          this.enabled = false;
          this.pause();
        });
    }
  }
  dispose() {
    this.pause();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.bed?.disconnect();
    this.bed = null;
  }
}
