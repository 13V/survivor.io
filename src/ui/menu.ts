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

.title-screen {
  --toxic: #8bf04a;
  --amber: #ffb31f;
  --bone: #ece9dd;
  --danger: #ff3b3b;
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  color: var(--bone);
  font-family: 'Cond', 'Oswald', system-ui, sans-serif;
  background:
    radial-gradient(80% 50% at 50% 30%, rgba(110, 200, 70, 0.10), transparent 60%),
    radial-gradient(120% 80% at 50% 120%, rgba(255, 150, 20, 0.07), transparent 55%),
    linear-gradient(180deg, #0a0d0a 0%, #07080b 60%, #050507 100%);
}
.title-screen[hidden] { display: none; }
/* scanline + vignette grit so it doesn't read as a flat dashboard */
.title-screen::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.16) 2px 3px),
    radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(0,0,0,0.6) 100%);
  mix-blend-mode: multiply;
  opacity: 0.5;
}

.lobby-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: clamp(14px, 3.5vh, 36px) 14px 18px;
  position: relative;
  z-index: 1;
}

.lobby-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.hero-logo { margin: 0; line-height: 0.9; }
.hero-logo .lg-main {
  display: block;
  font-family: 'Stencil', 'Cond', sans-serif;
  font-size: clamp(40px, 10vw, 84px);
  letter-spacing: 2px;
  color: var(--bone);
  text-shadow: 0 0 1px var(--bone), 3px 3px 0 #1c1c1c, 0 6px 18px rgba(0,0,0,0.8),
    0 0 30px rgba(140, 240, 74, 0.12);
}
.hero-logo .lg-main b { color: var(--danger); -webkit-text-stroke: 0; }
.hero-logo .lg-sub {
  display: block;
  font-family: 'Cond', sans-serif;
  font-weight: 700;
  font-size: clamp(13px, 3vw, 22px);
  letter-spacing: clamp(6px, 2.6vw, 16px);
  margin-top: 4px;
  padding-left: clamp(6px, 2.6vw, 16px);
  color: var(--toxic);
  text-shadow: 0 0 12px rgba(140, 240, 74, 0.5), 0 2px 4px #000;
}

/* spotlight stage with the live survivor */
.hero-stage {
  position: relative;
  width: clamp(220px, 60vw, 280px);
  height: clamp(210px, 56vw, 270px);
  display: grid;
  place-items: center;
  margin: -8px 0 -10px;
}
.hero-stage::before { /* spotlight cone + floor pool */
  content: '';
  position: absolute;
  inset: -8% -10% 0;
  background:
    radial-gradient(56% 40% at 50% 90%, rgba(140, 240, 74, 0.40), rgba(140,240,74,0.07) 58%, transparent 72%),
    conic-gradient(from 270deg at 50% 4%, transparent 74deg, rgba(190,235,155,0.14) 90deg, transparent 106deg);
}
.hero-stage::after { /* contact shadow under the feet */
  content: '';
  position: absolute;
  left: 50%;
  bottom: 13%;
  width: 40%;
  height: 14px;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, rgba(0,0,0,0.7), transparent);
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
  filter: drop-shadow(0 7px 10px rgba(0,0,0,0.55)) drop-shadow(0 0 16px rgba(140,240,74,0.22));
  animation: hero-idle 1.8s steps(14) infinite;
}
@keyframes hero-idle { to { background-position-x: -3640px; } } /* 14 frames x 260px */

.title-tagline {
  margin: 0;
  font-size: clamp(12px, 2.2vw, 16px);
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(236, 233, 221, 0.66);
}
.title-stats {
  margin: 8px 0 0;
  font-family: 'Cond', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #0a0d0a;
  background: linear-gradient(180deg, #ffd05a, var(--amber));
  padding: 4px 16px;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(255, 179, 31, 0.35);
}
.title-stats[hidden] { display: none; }

/* --- reparented pickers become rugged slot panels --- */
.lobby-scroll .stageselect,
.lobby-scroll .charselect,
.lobby-scroll .petselect {
  position: static;
  transform: none;
  width: min(680px, 96vw);
  gap: 12px;
  padding: 16px 14px 14px;
  border-radius: 4px;
  background:
    linear-gradient(180deg, rgba(20, 26, 20, 0.72), rgba(10, 13, 16, 0.72));
  border: 1px solid rgba(140, 240, 74, 0.14);
  border-top: 2px solid rgba(140, 240, 74, 0.5);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  animation: lobby-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.lobby-scroll .ss-title,
.lobby-scroll .cs-title,
.lobby-scroll .pet-title {
  font-family: 'Cond', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 4px;
  opacity: 1;
  color: var(--toxic);
  text-shadow: 0 0 10px rgba(140, 240, 74, 0.3);
}
/* slot chips: darker, beveled, hard selected state */
.lobby-scroll .ss-chip,
.lobby-scroll .cs-chip,
.lobby-scroll .pet-chip,
.lobby-scroll .gear-chip {
  background: linear-gradient(180deg, #161b16, #0c0f0c);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 5px rgba(0, 0, 0, 0.5);
}
.lobby-scroll .cs-name, .lobby-scroll .ss-name, .lobby-scroll .pet-name {
  font-family: 'Cond', sans-serif; font-weight: 700; letter-spacing: 0.5px;
}
.lobby-scroll .ss-chip.sel,
.lobby-scroll .cs-chip.sel,
.lobby-scroll .pet-chip.sel {
  border-color: var(--toxic);
  box-shadow: 0 0 0 1px var(--toxic), 0 0 16px rgba(140, 240, 74, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
@keyframes lobby-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

/* --- sticky action bar --- */
.lobby-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, #050507 38%, rgba(5, 5, 7, 0));
  position: relative;
  z-index: 1;
}
.hazard-bar {
  width: min(360px, 84vw);
  height: 7px;
  border-radius: 2px;
  background: repeating-linear-gradient(-45deg, var(--amber) 0 11px, #14110a 11px 22px);
  opacity: 0.85;
  box-shadow: 0 0 10px rgba(255, 179, 31, 0.25);
}
.title-play {
  pointer-events: auto;
  min-width: min(360px, 84vw);
  font-family: 'Stencil', 'Cond', sans-serif;
  background: linear-gradient(180deg, #9bf85e 0%, var(--toxic) 50%, #4fae26 100%);
  color: #0a1f05;
  border: none;
  font-size: clamp(22px, 5vw, 32px);
  letter-spacing: 5px;
  padding: 13px 40px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 8px 0 #2c6815, 0 14px 26px rgba(80, 200, 50, 0.35),
    inset 0 2px 0 rgba(255, 255, 255, 0.55);
  transition: transform 0.06s ease, box-shadow 0.06s ease, filter 0.1s ease;
}
.title-play:hover { filter: brightness(1.05); }
.title-play:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #2c6815, 0 6px 14px rgba(80, 200, 50, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5);
}
.title-controls {
  margin: 0;
  font-size: clamp(10px, 2vw, 12px);
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.55;
}
.title-footer { margin: 0; font-size: 10px; opacity: 0.32; text-align: center; }

@media (prefers-reduced-motion: reduce) {
  .hero-char { animation: none; }
  .lobby-scroll .stageselect, .lobby-scroll .charselect, .lobby-scroll .petselect { animation-duration: 0.01ms; }
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
