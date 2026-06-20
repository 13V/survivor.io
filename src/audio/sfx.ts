// Procedural audio system for the survivor prototype. Everything is synthesized
// live with the Web Audio API — no asset files, zero dependencies.
//
// Usage:
//   audio.unlock()           -> call on the first user gesture (pointerdown)
//   audio.shoot()/hit()/...  -> fire-and-forget SFX (no-op before unlock)
//   audio.startMusic()       -> begin the looping arpeggio bed
//   audio.setBossMode(true)  -> layer in a tenser drone/bass
//   audio.setSfxVolume(v)    -> 0..1; also setMusicVolume / setMuted
//
// Design notes:
//  - Master -> { sfxBus, musicBus } so SFX and music volume are independent.
//  - A muted flag drops the master gain to 0 without losing the stored levels.
//  - Music is scheduled a little ahead of the clock with a lookahead timer so
//    note timing stays tight even if requestAnimationFrame hitches.
//  - Every public method bails out cleanly if the context isn't ready, so the
//    caller never has to guard call sites.

type Maybe<T> = T | null;

// --- tuning ----------------------------------------------------------------
const DEFAULT_SFX_VOLUME = 0.6;
const DEFAULT_MUSIC_VOLUME = 0.35;

// Sequencer: 16th notes at this tempo drive the arpeggio.
const MUSIC_BPM = 120;
const STEP_SECONDS = 60 / MUSIC_BPM / 4; // one 16th note
const LOOKAHEAD_MS = 25; // how often the scheduler wakes
const SCHEDULE_AHEAD = 0.12; // how far ahead (s) we queue notes

// A minor pentatonic-ish riff (semitone offsets from the root), looped.
const ROOT_HZ = 220; // A3
const ARP_STEPS: number[] = [0, 7, 12, 7, 3, 10, 12, 15];
// Boss layer plays a lower, sparser, more dissonant pattern.
const BOSS_BASS_STEPS: number[] = [-12, -12, -10, -12, -5, -12, -10, -7];

function semis(root: number, n: number): number {
  return root * Math.pow(2, n / 12);
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Cheap deterministic-ish pitch jitter so repeated SFX don't sound identical.
function vary(cents: number): number {
  return Math.pow(2, ((Math.random() * 2 - 1) * cents) / 1200);
}

class AudioEngine {
  private ctx: Maybe<AudioContext> = null;
  private master: Maybe<GainNode> = null;
  private sfxBus: Maybe<GainNode> = null;
  private musicBus: Maybe<GainNode> = null;

  // Shared white-noise buffer, lazily built (used by several SFX).
  private noiseBuf: Maybe<AudioBuffer> = null;

  // Stored volumes survive mute toggles and context (re)creation.
  private sfxVolume = DEFAULT_SFX_VOLUME;
  private musicVolume = DEFAULT_MUSIC_VOLUME;
  private muted = false;

  // Music scheduler state.
  private musicOn = false;
  private bossMode = false;
  private bossGain: Maybe<GainNode> = null; // ramps in/out for the boss layer
  private nextNoteTime = 0;
  private step = 0;
  private schedulerId: number | null = null;

  // ---- lifecycle ----------------------------------------------------------

  /**
   * Create or resume the AudioContext. Must be triggered by a user gesture,
   * because browsers start the context "suspended" until then. Safe to call
   * repeatedly (e.g. on every pointerdown).
   */
  unlock(): void {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return; // no Web Audio support; stay a silent no-op
        this.ctx = new Ctor();
        this.buildGraph();
      }
      if (this.ctx.state === 'suspended') {
        // resume() returns a promise; ignore it, failures are non-fatal.
        void this.ctx.resume().catch(() => {});
      }
    } catch {
      // If anything throws, leave ctx null so the rest stays inert.
      this.ctx = null;
    }
  }

  get ready(): boolean {
    return this.ctx !== null;
  }

  private buildGraph(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.master = ctx.createGain();
    this.sfxBus = ctx.createGain();
    this.musicBus = ctx.createGain();
    this.master.connect(ctx.destination);
    this.sfxBus.connect(this.master);
    this.musicBus.connect(this.master);
    this.applyVolumes();
  }

  private getNoise(): Maybe<AudioBuffer> {
    if (!this.ctx) return null;
    if (this.noiseBuf) return this.noiseBuf;
    const len = Math.floor(this.ctx.sampleRate * 0.5);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    return buf;
  }

  // ---- volume -------------------------------------------------------------

  setSfxVolume(v: number): void {
    this.sfxVolume = clamp01(v);
    this.applyVolumes();
  }

  setMusicVolume(v: number): void {
    this.musicVolume = clamp01(v);
    this.applyVolumes();
  }

  setMuted(m: boolean): void {
    this.muted = !!m;
    this.applyVolumes();
  }

  isMuted(): boolean {
    return this.muted;
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.master || !this.sfxBus || !this.musicBus) return;
    const t = this.ctx.currentTime;
    // Small ramps avoid clicks when levels change.
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, 0.01);
    this.sfxBus.gain.setTargetAtTime(this.sfxVolume, t, 0.01);
    this.musicBus.gain.setTargetAtTime(this.musicVolume, t, 0.01);
  }

  // ---- low-level synth helpers -------------------------------------------

  /** A single enveloped oscillator routed to a destination (defaults to SFX). */
  private blip(
    opts: {
      type: OscillatorType;
      freq: number;
      dur: number;
      gain?: number;
      attack?: number;
      freqEnd?: number; // optional pitch sweep target
      dest?: AudioNode;
      detune?: number;
    },
  ): void {
    const ctx = this.ctx;
    const bus = opts.dest ?? this.sfxBus;
    if (!ctx || !bus) return;
    const now = ctx.currentTime;
    const dur = opts.dur;
    const peak = opts.gain ?? 0.3;
    const attack = Math.min(opts.attack ?? 0.005, dur * 0.5);

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.freq, now);
    if (opts.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, opts.freqEnd),
        now + dur,
      );
    }
    if (opts.detune) osc.detune.setValueAtTime(opts.detune, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(g).connect(bus);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  /** A short burst of filtered noise — good for impacts, hits, clicks. */
  private noiseHit(
    opts: {
      dur: number;
      gain?: number;
      type?: BiquadFilterType;
      freq?: number;
      q?: number;
      freqEnd?: number;
      dest?: AudioNode;
    },
  ): void {
    const ctx = this.ctx;
    const bus = opts.dest ?? this.sfxBus;
    const buf = this.getNoise();
    if (!ctx || !bus || !buf) return;
    const now = ctx.currentTime;
    const dur = opts.dur;
    const peak = opts.gain ?? 0.3;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filt = ctx.createBiquadFilter();
    filt.type = opts.type ?? 'bandpass';
    filt.frequency.setValueAtTime(opts.freq ?? 1200, now);
    if (opts.freqEnd !== undefined) {
      filt.frequency.exponentialRampToValueAtTime(
        Math.max(1, opts.freqEnd),
        now + dur,
      );
    }
    filt.Q.value = opts.q ?? 1;

    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(filt).connect(g).connect(bus);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  // ---- SFX ----------------------------------------------------------------

  shoot(): void {
    if (!this.ready) return;
    const f = 720 * vary(40);
    // Snappy downward zap + a touch of noise for "air".
    this.blip({
      type: 'square',
      freq: f,
      freqEnd: f * 0.45,
      dur: 0.08,
      gain: 0.16,
      attack: 0.002,
    });
    this.noiseHit({ dur: 0.05, gain: 0.06, type: 'highpass', freq: 1800 });
  }

  hit(): void {
    if (!this.ready) return;
    // Tight clicky impact — bandpassed noise with a quick pitch drop.
    this.noiseHit({
      dur: 0.07,
      gain: 0.18,
      type: 'bandpass',
      freq: 2400 * vary(120),
      q: 0.8,
      freqEnd: 700,
    });
    this.blip({
      type: 'triangle',
      freq: 320 * vary(60),
      freqEnd: 160,
      dur: 0.06,
      gain: 0.1,
    });
  }

  pickup(): void {
    if (!this.ready) return;
    // Bright two-note "ting" upward — coin/gem feel.
    const base = 880 * vary(30);
    this.blip({ type: 'triangle', freq: base, dur: 0.06, gain: 0.13 });
    this.blip({
      type: 'triangle',
      freq: base * 1.5,
      dur: 0.09,
      gain: 0.11,
      attack: 0.001,
    });
  }

  levelUp(): void {
    if (!this.ready) return;
    // Rising major arpeggio fanfare.
    const root = 523.25; // C5
    const steps = [0, 4, 7, 12];
    steps.forEach((s, i) => {
      this.scheduleBlip(i * 0.07, {
        type: 'sawtooth',
        freq: semis(root, s),
        dur: 0.16,
        gain: 0.12,
        attack: 0.004,
      });
    });
  }

  bossSpawn(): void {
    if (!this.ready) return;
    // Ominous low brass-ish swell + noise rumble.
    this.blip({
      type: 'sawtooth',
      freq: 110,
      freqEnd: 82,
      dur: 0.9,
      gain: 0.2,
      attack: 0.08,
    });
    this.blip({
      type: 'square',
      freq: 55,
      freqEnd: 41,
      dur: 1.0,
      gain: 0.12,
      attack: 0.08,
      detune: -6,
    });
    this.noiseHit({
      dur: 0.7,
      gain: 0.1,
      type: 'lowpass',
      freq: 320,
      freqEnd: 90,
    });
  }

  // Rising two-tone "incoming horde" siren that precedes a street surge.
  surgeWarn(): void {
    if (!this.ready) return;
    this.blip({ type: 'square', freq: 300, freqEnd: 600, dur: 0.5, gain: 0.1, attack: 0.02 });
    this.blip({ type: 'sawtooth', freq: 150, freqEnd: 300, dur: 0.55, gain: 0.07, attack: 0.02, detune: 5 });
    this.noiseHit({ dur: 0.45, gain: 0.06, type: 'bandpass', freq: 820, freqEnd: 520, q: 6 });
  }

  playerHurt(): void {
    if (!this.ready) return;
    // Harsh descending buzz — clearly "bad".
    this.blip({
      type: 'sawtooth',
      freq: 300 * vary(40),
      freqEnd: 70,
      dur: 0.22,
      gain: 0.18,
      attack: 0.002,
    });
    this.noiseHit({
      dur: 0.16,
      gain: 0.1,
      type: 'lowpass',
      freq: 900,
      freqEnd: 200,
    });
  }

  uiClick(): void {
    if (!this.ready) return;
    this.blip({
      type: 'square',
      freq: 660 * vary(20),
      dur: 0.04,
      gain: 0.1,
      attack: 0.001,
    });
  }

  /** Fire a blip after `delay` seconds (used for multi-note flourishes). */
  private scheduleBlip(
    delay: number,
    opts: Parameters<AudioEngine['blip']>[0],
  ): void {
    if (delay <= 0) {
      this.blip(opts);
      return;
    }
    window.setTimeout(() => {
      if (this.ready) this.blip(opts);
    }, delay * 1000);
  }

  // ---- music --------------------------------------------------------------

  startMusic(): void {
    if (!this.ctx || this.musicOn) return;
    this.musicOn = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.06;
    if (this.schedulerId === null) {
      this.schedulerId = window.setInterval(
        () => this.scheduler(),
        LOOKAHEAD_MS,
      );
    }
  }

  stopMusic(): void {
    this.musicOn = false;
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    // Let the boss layer fade if it was active.
    if (this.bossGain && this.ctx) {
      this.bossGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Toggle the tenser "boss" layer. Cross-fades a low bass/drone in or out.
   * No-op (but remembers intent) if music isn't currently running.
   */
  setBossMode(on: boolean): void {
    this.bossMode = !!on;
    if (this.bossGain && this.ctx) {
      this.bossGain.gain.setTargetAtTime(
        this.bossMode ? 1 : 0,
        this.ctx.currentTime,
        0.4,
      );
    }
  }

  private ensureBossGain(): Maybe<GainNode> {
    if (!this.ctx || !this.musicBus) return null;
    if (!this.bossGain) {
      this.bossGain = this.ctx.createGain();
      this.bossGain.gain.value = this.bossMode ? 1 : 0;
      this.bossGain.connect(this.musicBus);
    }
    return this.bossGain;
  }

  /** Lookahead scheduler: queue any notes due before SCHEDULE_AHEAD. */
  private scheduler(): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicOn) return;
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += STEP_SECONDS;
      this.step = (this.step + 1) % ARP_STEPS.length;
    }
  }

  /** Emit the note(s) for one sequencer step at absolute time `when`. */
  private scheduleStep(step: number, when: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;

    // --- base arpeggio voice (plucky saw through a lowpass) ---
    const note = semis(ROOT_HZ, ARP_STEPS[step]);
    this.pluck(note, when, 0.09, 'sawtooth', this.musicBus, 2600);

    // A soft octave-up sparkle on the off-beats keeps it lively.
    if (step % 2 === 1) {
      this.pluck(note * 2, when, 0.06, 'triangle', this.musicBus, 4000, 0.05);
    }

    // Light four-on-the-floor kick on each downbeat.
    if (step % 4 === 0) this.kick(when);

    // --- boss layer: low bass + held drone, gated by bossGain ---
    if (this.bossMode) {
      const bossBus = this.ensureBossGain();
      if (bossBus) {
        const bass = semis(ROOT_HZ, BOSS_BASS_STEPS[step]);
        this.pluck(bass, when, 0.16, 'square', bossBus, 700, 0.16);
        // Dissonant minor-second drone stab every half bar.
        if (step % 8 === 0) {
          this.pluck(semis(ROOT_HZ, -1), when, 0.5, 'sawtooth', bossBus, 500, 0.07);
        }
      }
    }
  }

  /** Short plucked note for the music bed. */
  private pluck(
    freq: number,
    when: number,
    dur: number,
    type: OscillatorType,
    dest: AudioNode,
    cutoff: number,
    gain = 0.08,
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(cutoff, when);
    filt.frequency.exponentialRampToValueAtTime(
      Math.max(200, cutoff * 0.4),
      when + dur,
    );
    filt.Q.value = 1;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(filt).connect(g).connect(dest);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  /** Synth kick drum: pitch-dropping sine + click. */
  private kick(when: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, when);
    osc.frequency.exponentialRampToValueAtTime(45, when + 0.12);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.16, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    osc.connect(g).connect(this.musicBus);
    osc.start(when);
    osc.stop(when + 0.2);
  }
}

/** Singleton audio engine. Import `{ audio }` and call its methods. */
export const audio = new AudioEngine();
export type { AudioEngine };
