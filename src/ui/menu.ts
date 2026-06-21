// Title / main-menu lobby (pure DOM + CSS, kept off the Pixi canvas).
//
// Art-directed "Outbreak" lobby: the actual HD survivor stands on a spotlight as the
// centerpiece (its Idle sheet animated in CSS), a stencilled wordmark, a gritty biohazard
// palette with scanline texture + vignette, and chunky tactile controls. The stage /
// survivor / pet pickers are reparented into `mount` by main.ts and re-skinned as slot
// panels; a sticky PLAY bar is pinned to the bottom.

const STYLE_ID = 'title-screen-style';

// Resolve bundled asset URLs against the document base so it works under any deploy path.
const asset = (p: string): string =>
  typeof document !== 'undefined' ? new URL(p, document.baseURI).href : p;

const CSS = `
@font-face { font-family: 'Stencil'; src: url('${asset('assets/fonts/black.woff2')}') format('woff2'); font-display: swap; }
@font-face { font-family: 'Cond'; src: url('${asset('assets/fonts/oswald.woff2')}') format('woff2'); font-weight: 500 700; font-display: swap; }

/* ── Title Screen Shell ──────────────────────────────────────────────────── */
.title-screen {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  color: #e8eaf0;
  font-family: 'Cond', 'Oswald', system-ui, sans-serif;
  /* deep game-space bg: subtle gold radial warmth + xp-blue hint from below */
  background:
    radial-gradient(80% 50% at 50% 28%, rgba(201, 162, 78, 0.07), transparent 58%),
    radial-gradient(100% 60% at 50% 110%, rgba(138, 166, 255, 0.06), transparent 52%),
    linear-gradient(180deg, #080b11 0%, var(--bg, #0b0e15) 55%, #070910 100%);
}
.title-screen[hidden] { display: none; }
/* vignette layer — darkens edges so the hero stage reads as a spotlight */
.title-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(120% 100% at 50% 38%, transparent 50%, rgba(0,0,0,0.68) 100%);
  z-index: 0;
}

/* ── Scrollable lobby body ───────────────────────────────────────────────── */
.lobby-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s4, 16px);
  padding: clamp(var(--s4, 16px), 3.5vh, 40px) var(--s4, 16px) var(--s5, 24px);
  position: relative;
  z-index: 1;
}

/* ── Hero block: logo + stage + tagline ──────────────────────────────────── */
.lobby-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s1, 4px);
  text-align: center;
}

/* Wordmark — gold hero accent for the main title */
.hero-logo { margin: 0; line-height: 0.9; }
.hero-logo .lg-main {
  display: block;
  font-family: 'Stencil', 'Cond', sans-serif;
  font-size: clamp(40px, 10vw, 86px);
  letter-spacing: 3px;
  color: var(--accent, #c9a24e);
  text-shadow:
    0 0 2px var(--accent, #c9a24e),
    3px 3px 0 rgba(0,0,0,0.55),
    0 6px 24px rgba(201, 162, 78, 0.22),
    var(--ink, 0 2px 6px rgba(0,0,0,0.9));
}
/* "BREAK" portion uses a slightly deeper amber for contrast punch */
.hero-logo .lg-main b {
  color: #c08a32;
  -webkit-text-stroke: 0;
}
.hero-logo .lg-sub {
  display: block;
  font-family: 'Cond', sans-serif;
  font-weight: 700;
  font-size: clamp(13px, 3vw, 22px);
  letter-spacing: clamp(6px, 2.6vw, 18px);
  margin-top: var(--s2, 8px);
  padding-left: clamp(6px, 2.6vw, 18px);
  color: rgba(232, 234, 240, 0.72);
  text-transform: uppercase;
  text-shadow: var(--ink, 0 2px 6px rgba(0,0,0,0.8));
}

/* Spotlight stage that hosts the animated character */
.hero-stage {
  position: relative;
  width: clamp(220px, 60vw, 280px);
  height: clamp(210px, 56vw, 270px);
  display: grid;
  place-items: center;
  margin: -4px 0 -6px;
}
/* Gold-tinted floor pool + conic spotlight beam */
.hero-stage::before {
  content: '';
  position: absolute;
  inset: -8% -10% 0;
  background:
    radial-gradient(56% 38% at 50% 90%, rgba(201, 162, 78, 0.28), rgba(201, 162, 78,0.05) 56%, transparent 70%),
    conic-gradient(from 270deg at 50% 4%, transparent 72deg, rgba(255,230,150,0.10) 90deg, transparent 108deg);
}
/* Soft contact shadow under the character's feet */
.hero-stage::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 13%;
  width: 42%;
  height: 14px;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, rgba(0,0,0,0.65), transparent);
}
.hero-char {
  position: relative;
  width: 260px;
  height: 260px;
  background-image: url('${asset('assets/sprites/survivor/Idle.png')}');
  background-repeat: no-repeat;
  background-size: 3640px 2080px;      /* 1792x1024 scaled so one 128px cell = 260px */
  background-position: 0 -520px;       /* row 2 = facing the camera (south) */
  image-rendering: auto;
  filter:
    drop-shadow(0 7px 12px rgba(0,0,0,0.60))
    drop-shadow(0 0 18px rgba(201, 162, 78, 0.18));
  animation: hero-idle 1.8s steps(14) infinite;
}
@keyframes hero-idle { to { background-position-x: -3640px; } } /* 14 frames x 260px */

/* Subtle tagline beneath the hero */
.title-tagline {
  margin: var(--s2, 8px) 0 0;
  font-size: clamp(11px, 2.2vw, var(--fz-sm, 12px));
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(232, 234, 240, 0.45);
}

/* Stats pill — gold accent, tabular numerics */
.title-stats {
  margin: var(--s2, 8px) 0 0;
  font-family: 'Cond', sans-serif;
  font-size: var(--fz-sm, 12px);
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--accent-ink, #2a1d02);
  background: linear-gradient(180deg, #ffe27a 0%, var(--accent, #c9a24e) 55%, #e8b830 100%);
  padding: var(--s1, 4px) var(--s4, 16px);
  border-radius: var(--r-sm, 8px);
  box-shadow: var(--e1, 0 2px 8px rgba(0,0,0,0.4)), var(--bevel, inset 0 1px 0 rgba(255,255,255,0.35));
}
.title-stats[hidden] { display: none; }

/* ── Reparented pickers — frosted-glass slot panels ──────────────────────── */
.lobby-scroll .stageselect,
.lobby-scroll .charselect,
.lobby-scroll .petselect {
  position: static;
  transform: none;
  width: min(680px, 96vw);
  gap: var(--s3, 12px);
  padding: var(--s4, 16px) var(--s3, 12px) var(--s3, 12px);
  border-radius: var(--r-md, 12px);
  background: var(--surface-2, rgba(28,35,51,.88));
  backdrop-filter: blur(var(--glass-blur, 9px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 9px));
  border: 1px solid var(--stroke, rgba(255,255,255,.12));
  border-top: 1px solid var(--stroke-strong, rgba(255,255,255,.24));
  box-shadow:
    var(--e2, 0 8px 24px rgba(0,0,0,0.5)),
    var(--bevel, inset 0 1px 0 rgba(255,255,255,0.08));
  animation: lobby-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: box-shadow 0.2s ease;
}

/* Panel section labels — muted, spaced caps */
.lobby-scroll .ss-title,
.lobby-scroll .cs-title,
.lobby-scroll .pet-title {
  font-family: 'Cond', sans-serif;
  font-weight: 700;
  font-size: var(--fz-xs, 10px);
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 1;
  color: rgba(232, 234, 240, 0.50);
  text-shadow: none;
}

/* Slot chips — dark surface-1, hairline border, bevel highlight */
.lobby-scroll .ss-chip,
.lobby-scroll .cs-chip,
.lobby-scroll .pet-chip,
.lobby-scroll .gear-chip {
  background: var(--surface-1, rgba(17,22,33,.74));
  border: 1px solid var(--hairline, rgba(255,255,255,.07));
  border-radius: var(--r-sm, 8px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 2px 6px rgba(0,0,0,0.45);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.lobby-scroll .cs-name,
.lobby-scroll .ss-name,
.lobby-scroll .pet-name {
  font-family: 'Cond', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Selected chip — gold ring + glow */
.lobby-scroll .ss-chip.sel,
.lobby-scroll .cs-chip.sel,
.lobby-scroll .pet-chip.sel {
  border-color: var(--accent, #c9a24e);
  box-shadow:
    0 0 0 1px var(--accent, #c9a24e),
    0 0 18px rgba(201, 162, 78, 0.30),
    inset 0 1px 0 rgba(255,255,255,0.10);
}

@keyframes lobby-rise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Sticky action bar ───────────────────────────────────────────────────── */
.lobby-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s3, 12px);
  padding: var(--s3, 12px) var(--s4, 16px) max(var(--s3, 12px), env(safe-area-inset-bottom));
  /* glass shelf that fades into the bg */
  background:
    linear-gradient(0deg, var(--bg, #0b0e15) 42%, rgba(11,14,21,0));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  position: relative;
  z-index: 1;
}

/* Decorative accent divider above the PLAY button — thin gold hairline */
.hazard-bar {
  width: min(360px, 84vw);
  height: 1px;
  border-radius: var(--r-pill, 999px);
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent, #c9a24e) 30%,
    rgba(201, 162, 78, 0.6) 50%,
    var(--accent, #c9a24e) 70%,
    transparent 100%);
  opacity: 0.55;
  box-shadow: 0 0 10px rgba(201, 162, 78, 0.35);
}

/* ── PLAY button — big, gold, tactile ────────────────────────────────────── */
.title-play {
  pointer-events: auto;
  min-width: min(360px, 84vw);
  font-family: 'Stencil', 'Cond', sans-serif;
  background: linear-gradient(180deg,
    #dcc06a 0%,
    var(--accent, #c9a24e) 45%,
    #a8842a 100%);
  color: var(--accent-ink, #2a1d02);
  border: none;
  font-size: clamp(22px, 5vw, 32px);
  letter-spacing: 6px;
  padding: 14px 40px;
  border-radius: var(--r-md, 12px);
  cursor: pointer;
  /* layered shadow: hard press shelf + soft ambient glow + inset bevel */
  box-shadow:
    0 7px 0 #a07a08,
    var(--e3, 0 14px 32px rgba(0,0,0,0.6)),
    0 12px 28px rgba(201, 162, 78, 0.30),
    var(--bevel, inset 0 2px 0 rgba(255,255,255,0.50));
  transition:
    transform 0.07s ease,
    box-shadow 0.07s ease,
    filter 0.12s ease;
}
.title-play:hover {
  filter: brightness(1.08);
  box-shadow:
    0 9px 0 #a07a08,
    var(--e3, 0 14px 32px rgba(0,0,0,0.6)),
    0 16px 32px rgba(201, 162, 78, 0.40),
    var(--bevel, inset 0 2px 0 rgba(255,255,255,0.55));
  transform: translateY(-1px);
}
.title-play:active {
  transform: translateY(6px);
  filter: brightness(0.97);
  box-shadow:
    0 1px 0 #a07a08,
    0 4px 12px rgba(201, 162, 78, 0.20),
    var(--bevel, inset 0 2px 0 rgba(255,255,255,0.40));
}

/* Controls hint + footer — quiet, muted */
.title-controls {
  margin: 0;
  font-size: clamp(10px, 2vw, var(--fz-xs, 10px));
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(232, 234, 240, 0.40);
}
.title-footer {
  margin: 0;
  font-size: var(--fz-xs, 10px);
  color: rgba(232, 234, 240, 0.22);
  text-align: center;
}

/* ── Accessibility ───────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .hero-char { animation: none; }
  .lobby-scroll .stageselect,
  .lobby-scroll .charselect,
  .lobby-scroll .petselect { animation-duration: 0.01ms; }
}
`;

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export class TitleScreen {
  private el: HTMLElement;
  private playBtn: HTMLButtonElement;
  private stats: HTMLElement;
  private scroll: HTMLElement;
  private playCb: (() => void) | null = null;

  constructor(root: HTMLElement) {
    ensureStyle();

    const el = document.createElement('div');
    el.className = 'title-screen';
    el.setAttribute('data-ui', '');
    el.innerHTML = `
      <div class="lobby-scroll">
        <div class="lobby-hero">
          <h1 class="hero-logo">
            <span class="lg-main">OUT<b>BREAK</b></span>
            <span class="lg-sub">SURVIVORS</span>
          </h1>
          <div class="hero-stage"><div class="hero-char"></div></div>
          <p class="title-tagline">Hold the line · the horde never stops</p>
          <p class="title-stats" hidden></p>
        </div>
      </div>
      <div class="lobby-actions">
        <div class="hazard-bar"></div>
        <button class="title-play" type="button" data-ui>PLAY</button>
        <p class="title-controls">WASD / arrows or drag to move — attacks are automatic</p>
        <p class="title-footer">An original prototype · not affiliated with any existing game</p>
      </div>`;
    root.appendChild(el);

    this.el = el;
    this.scroll = el.querySelector('.lobby-scroll') as HTMLElement;
    this.playBtn = el.querySelector('.title-play') as HTMLButtonElement;
    this.stats = el.querySelector('.title-stats') as HTMLElement;

    this.playBtn.addEventListener('click', () => {
      if (this.playCb) this.playCb();
    });
  }

  /** Where the stage / survivor / pet pickers mount so they flow inside the lobby. */
  get mount(): HTMLElement {
    return this.scroll;
  }

  onPlay(cb: () => void): void {
    this.playCb = cb;
  }

  setStats(text: string): void {
    const t = (text ?? '').trim();
    this.stats.textContent = t;
    this.stats.hidden = t.length === 0;
  }

  show(): void {
    this.el.hidden = false;
  }

  hide(): void {
    this.el.hidden = true;
  }
}
