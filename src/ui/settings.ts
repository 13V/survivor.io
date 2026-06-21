// Settings + Pause overlay (pure DOM/CSS, kept out of the Pixi canvas).
// Exposes a shared reactive `settings` store that other systems read each frame,
// plus a `SettingsPanel` with a gear button that opens the overlay.
//
// Interactive elements are marked [data-ui] so the input system ignores them
// (see core/input.ts -> isUiTarget). Styles are injected here to avoid editing
// the shared styles.css while other agents work on it in parallel.

const STORAGE_KEY = 'survivor.io:settings';

export interface SettingsData {
  /** 0..1 multiplier for sound-effect volume. */
  sfxVolume: number;
  /** 0..1 multiplier for music volume. */
  musicVolume: number;
  /** Master mute; when true all audio should be silenced regardless of volumes. */
  muted: boolean;
  /** When true, skip non-essential motion (screen-shake, big flashes, etc). */
  reduceMotion: boolean;
  /** When true, floating damage numbers are drawn. */
  showDamageNumbers: boolean;
}

export type SettingsListener = (s: Readonly<SettingsData>) => void;

const DEFAULTS: SettingsData = {
  sfxVolume: 0.8,
  musicVolume: 0.6,
  muted: false,
  reduceMotion: false,
  showDamageNumbers: true,
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function load(): SettingsData {
  const out: SettingsData = { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Partial<SettingsData>;
      if (typeof obj.sfxVolume === 'number') out.sfxVolume = clamp01(obj.sfxVolume);
      if (typeof obj.musicVolume === 'number') out.musicVolume = clamp01(obj.musicVolume);
      if (typeof obj.muted === 'boolean') out.muted = obj.muted;
      if (typeof obj.reduceMotion === 'boolean') out.reduceMotion = obj.reduceMotion;
      if (typeof obj.showDamageNumbers === 'boolean') out.showDamageNumbers = obj.showDamageNumbers;
    }
  } catch {
    /* localStorage unavailable / corrupt — fall back to defaults */
  }
  return out;
}

/**
 * Reactive, importable settings store. Fields are read directly each frame
 * (e.g. `settings.reduceMotion`). Mutate only through `set(...)` so changes are
 * persisted and subscribers are notified.
 */
class SettingsStore implements Readonly<SettingsData> {
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  reduceMotion: boolean;
  showDamageNumbers: boolean;

  private listeners = new Set<SettingsListener>();

  constructor() {
    const d = load();
    this.sfxVolume = d.sfxVolume;
    this.musicVolume = d.musicVolume;
    this.muted = d.muted;
    this.reduceMotion = d.reduceMotion;
    this.showDamageNumbers = d.showDamageNumbers;
  }

  /** Effective SFX gain (0 when muted). Convenience for audio modules. */
  get effectiveSfx(): number {
    return this.muted ? 0 : this.sfxVolume;
  }

  /** Effective music gain (0 when muted). Convenience for audio modules. */
  get effectiveMusic(): number {
    return this.muted ? 0 : this.musicVolume;
  }

  /** Apply a partial update, persist, and notify subscribers. */
  set(partial: Partial<SettingsData>): void {
    let changed = false;
    if (partial.sfxVolume !== undefined) {
      const v = clamp01(partial.sfxVolume);
      if (v !== this.sfxVolume) {
        this.sfxVolume = v;
        changed = true;
      }
    }
    if (partial.musicVolume !== undefined) {
      const v = clamp01(partial.musicVolume);
      if (v !== this.musicVolume) {
        this.musicVolume = v;
        changed = true;
      }
    }
    if (partial.muted !== undefined && partial.muted !== this.muted) {
      this.muted = partial.muted;
      changed = true;
    }
    if (partial.reduceMotion !== undefined && partial.reduceMotion !== this.reduceMotion) {
      this.reduceMotion = partial.reduceMotion;
      changed = true;
    }
    if (
      partial.showDamageNumbers !== undefined &&
      partial.showDamageNumbers !== this.showDamageNumbers
    ) {
      this.showDamageNumbers = partial.showDamageNumbers;
      changed = true;
    }
    if (changed) {
      this.save();
      this.emit();
    }
  }

  /** Plain snapshot of current values. */
  snapshot(): SettingsData {
    return {
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      muted: this.muted,
      reduceMotion: this.reduceMotion,
      showDamageNumbers: this.showDamageNumbers,
    };
  }

  /**
   * Subscribe to changes. The callback fires immediately once with the current
   * values (so audio can initialize gain), then on every subsequent change.
   * Returns an unsubscribe function.
   */
  onChange(cb: SettingsListener): () => void {
    this.listeners.add(cb);
    cb(this);
    return () => this.listeners.delete(cb);
  }

  private emit(): void {
    for (const cb of this.listeners) {
      try {
        cb(this);
      } catch {
        /* a misbehaving listener must not break the others */
      }
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot()));
    } catch {
      /* ignore quota / private-mode write failures */
    }
  }
}

export const settings = new SettingsStore();

// ---- styles ----------------------------------------------------------------
// Injected once. Uses the shared design-token system (var(--token)) from styles.css.
const STYLE_ID = 'settings-overlay-style';
const CSS = `
.set-gear {
  position: fixed;
  top: max(10px, env(safe-area-inset-top));
  right: var(--s3);
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: var(--r-md);
  background: var(--surface-1);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--stroke);
  box-shadow: var(--e1), var(--bevel);
  color: var(--ink);
  font-size: var(--fz-lg);
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}
.set-gear:hover {
  border-color: var(--accent);
  box-shadow: var(--e2), var(--bevel);
}
.set-gear:active {
  transform: scale(0.94);
}

.set-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: var(--s4);
}
.set-overlay[hidden] {
  display: none;
}

.set-panel {
  width: min(380px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--surface-2);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--stroke);
  border-radius: var(--r-lg);
  padding: var(--s5);
  box-shadow: var(--e3), var(--bevel);
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

.set-title {
  margin: 0;
  font-size: var(--fz-xl);
  letter-spacing: 2px;
  color: var(--accent);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  text-align: center;
}

.set-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
}
.set-row.col {
  flex-direction: column;
  align-items: stretch;
  gap: var(--s2);
}

.set-label {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink);
  opacity: 0.92;
}

.set-slider-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.set-val {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.set-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: var(--r-pill);
  background: var(--rail);
  outline: none;
  cursor: pointer;
  border: 1px solid var(--hairline);
}
.set-range:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.set-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--accent-ink);
  box-shadow: var(--e1);
  cursor: pointer;
}
.set-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--accent-ink);
  box-shadow: var(--e1);
  cursor: pointer;
}

.set-toggle {
  position: relative;
  width: 48px;
  height: 26px;
  flex: 0 0 auto;
  border-radius: var(--r-pill);
  background: var(--rail);
  border: 1px solid var(--stroke);
  cursor: pointer;
  padding: 0;
  transition: background 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
}
.set-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--stroke-strong);
  box-shadow: var(--e1);
  transition: transform 0.16s ease, background 0.16s ease;
}
.set-toggle[aria-pressed='true'] {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(255, 210, 74, 0.25);
}
.set-toggle[aria-pressed='true']::after {
  transform: translateX(22px);
  background: var(--accent-ink);
}

.set-actions {
  display: flex;
  gap: var(--s2);
  margin-top: var(--s1);
}
.set-btn {
  flex: 1;
  pointer-events: auto;
  border: 1px solid transparent;
  font-weight: 800;
  font-size: var(--fz-md);
  padding: 11px var(--s3);
  border-radius: var(--r-md);
  cursor: pointer;
  color: var(--accent-ink);
  background: var(--accent);
  box-shadow: var(--e1), var(--bevel);
  transition: transform 0.08s ease, filter 0.12s ease, box-shadow 0.12s ease;
}
.set-btn:hover {
  filter: brightness(1.07);
  box-shadow: var(--e2), var(--bevel);
}
.set-btn:active {
  transform: scale(0.97);
  filter: brightness(0.96);
}
.set-btn.ghost {
  background: var(--surface-1);
  color: var(--ink);
  border-color: var(--stroke);
  box-shadow: var(--e1);
}
.set-btn.ghost:hover {
  border-color: var(--stroke-strong);
}
.set-btn.pause {
  background: var(--accent);
  color: var(--accent-ink);
}
`;

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export interface SettingsHooks {
  onPause(): void;
  onResume(): void;
}

export class SettingsPanel {
  private root: HTMLElement;
  private hooks: SettingsHooks;

  private gear: HTMLButtonElement;
  private overlay: HTMLElement;
  private panel: HTMLElement;
  private pauseBtn: HTMLButtonElement;

  private sfx: HTMLInputElement;
  private music: HTMLInputElement;
  private sfxVal: HTMLElement;
  private musicVal: HTMLElement;

  private muteBtn: HTMLButtonElement;
  private motionBtn: HTMLButtonElement;
  private dmgBtn: HTMLButtonElement;

  private open = false;
  private paused = false;

  constructor(root: HTMLElement, hooks: SettingsHooks) {
    this.root = root;
    this.hooks = hooks;
    ensureStyles();

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <button class="set-gear" data-ui type="button" aria-label="Settings" title="Settings">⚙</button>
      <div class="set-overlay" data-ui hidden role="dialog" aria-modal="true" aria-label="Settings">
        <div class="set-panel">
          <h2 class="set-title">SETTINGS</h2>

          <div class="set-row col">
            <div class="set-slider-head">
              <span class="set-label">SFX Volume</span>
              <span class="set-val js-sfx-val">80%</span>
            </div>
            <input class="set-range js-sfx" data-ui type="range" min="0" max="100" step="1"
              aria-label="SFX volume" />
          </div>

          <div class="set-row col">
            <div class="set-slider-head">
              <span class="set-label">Music Volume</span>
              <span class="set-val js-music-val">60%</span>
            </div>
            <input class="set-range js-music" data-ui type="range" min="0" max="100" step="1"
              aria-label="Music volume" />
          </div>

          <div class="set-row">
            <span class="set-label">Mute All</span>
            <button class="set-toggle js-mute" data-ui type="button"
              role="switch" aria-pressed="false" aria-label="Mute all audio"></button>
          </div>

          <div class="set-row">
            <span class="set-label">Reduce Motion</span>
            <button class="set-toggle js-motion" data-ui type="button"
              role="switch" aria-pressed="false" aria-label="Reduce motion"></button>
          </div>

          <div class="set-row">
            <span class="set-label">Show Damage Numbers</span>
            <button class="set-toggle js-dmg" data-ui type="button"
              role="switch" aria-pressed="true" aria-label="Show damage numbers"></button>
          </div>

          <div class="set-actions">
            <button class="set-btn pause js-pause" data-ui type="button">Pause</button>
            <button class="set-btn ghost js-close" data-ui type="button">Close</button>
          </div>
        </div>
      </div>`;
    root.appendChild(wrap);

    const q = <T extends HTMLElement = HTMLElement>(s: string): T => wrap.querySelector(s) as T;
    this.gear = q<HTMLButtonElement>('.set-gear');
    this.overlay = q('.set-overlay');
    this.panel = q('.set-panel');
    this.pauseBtn = q<HTMLButtonElement>('.js-pause');
    this.sfx = q<HTMLInputElement>('.js-sfx');
    this.music = q<HTMLInputElement>('.js-music');
    this.sfxVal = q('.js-sfx-val');
    this.musicVal = q('.js-music-val');
    this.muteBtn = q<HTMLButtonElement>('.js-mute');
    this.motionBtn = q<HTMLButtonElement>('.js-motion');
    this.dmgBtn = q<HTMLButtonElement>('.js-dmg');

    this.bind();
    // Reflect current store state (and stay in sync if changed elsewhere).
    settings.onChange(() => this.syncFromStore());
  }

  private bind(): void {
    this.gear.addEventListener('click', () => this.toggle());

    // Click on the dimmed backdrop (outside the panel) closes the overlay.
    this.overlay.addEventListener('click', (e) => {
      if (!this.panel.contains(e.target as Node)) this.close();
    });

    this.sfx.addEventListener('input', () => {
      settings.set({ sfxVolume: Number(this.sfx.value) / 100 });
    });
    this.music.addEventListener('input', () => {
      settings.set({ musicVolume: Number(this.music.value) / 100 });
    });

    this.muteBtn.addEventListener('click', () => settings.set({ muted: !settings.muted }));
    this.motionBtn.addEventListener('click', () =>
      settings.set({ reduceMotion: !settings.reduceMotion }),
    );
    this.dmgBtn.addEventListener('click', () =>
      settings.set({ showDamageNumbers: !settings.showDamageNumbers }),
    );

    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.overlay.querySelector('.js-close')?.addEventListener('click', () => this.close());

    // Esc closes; toggling the overlay with the gear is the only other entry.
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.open) {
        e.preventDefault();
        this.close();
      }
    });
  }

  /** Push current store values into the controls. */
  private syncFromStore(): void {
    const sfxPct = Math.round(settings.sfxVolume * 100);
    const musicPct = Math.round(settings.musicVolume * 100);
    // Avoid stomping the slider mid-drag if the value already matches.
    if (Number(this.sfx.value) !== sfxPct) this.sfx.value = String(sfxPct);
    if (Number(this.music.value) !== musicPct) this.music.value = String(musicPct);
    this.sfxVal.textContent = `${sfxPct}%`;
    this.musicVal.textContent = `${musicPct}%`;

    this.sfx.disabled = settings.muted;
    this.music.disabled = settings.muted;

    this.muteBtn.setAttribute('aria-pressed', String(settings.muted));
    this.motionBtn.setAttribute('aria-pressed', String(settings.reduceMotion));
    this.dmgBtn.setAttribute('aria-pressed', String(settings.showDamageNumbers));
  }

  private setPauseLabel(): void {
    this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
    this.pauseBtn.classList.toggle('ghost', this.paused);
    this.pauseBtn.classList.toggle('pause', !this.paused);
  }

  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) this.hooks.onPause();
    else this.hooks.onResume();
    this.setPauseLabel();
  }

  toggle(): void {
    if (this.open) this.close();
    else this.show();
  }

  /** Open the overlay (and pause the game while it is open). */
  show(): void {
    if (this.open) return;
    this.open = true;
    this.syncFromStore();
    this.overlay.hidden = false;
    if (!this.paused) {
      this.paused = true;
      this.hooks.onPause();
    }
    this.setPauseLabel();
  }

  /** Close the overlay (and resume the game if it was paused by the overlay). */
  close(): void {
    if (!this.open) return;
    this.open = false;
    this.overlay.hidden = true;
    if (this.paused) {
      this.paused = false;
      this.hooks.onResume();
    }
    this.setPauseLabel();
  }

  /** Whether the overlay is currently open. */
  isOpen(): boolean {
    return this.open;
  }
}
