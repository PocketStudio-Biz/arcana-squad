/** Tiny WebAudio synth. Unlocks on first gesture. */

export class AudioSys {
  private ctx: AudioContext | null = null;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  shoot() {
    this.blip(880, 0.05, "square", 0.05);
  }
  hit() {
    this.blip(220, 0.08, "sawtooth", 0.07);
  }
  kill() {
    this.chord([392, 494, 587], 0.16);
  }
  hurt() {
    this.blip(110, 0.18, "sawtooth", 0.1);
  }
  pickup() {
    this.blip(988, 0.1, "sine", 0.06);
  }
  power() {
    this.chord([261, 329, 392, 523], 0.28);
  }
  clear() {
    this.chord([329, 415, 523, 659], 0.4);
  }
  ui() {
    this.blip(660, 0.06, "triangle", 0.04);
  }

  private blip(freq: number, dur: number, type: OscillatorType, gain: number) {
    if (this.muted) return;
    const ctx = this.ctx;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq * (0.96 + Math.random() * 0.08);
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  }

  private chord(freqs: number[], dur: number) {
    for (const f of freqs) this.blip(f, dur, "triangle", 0.035);
  }
}
