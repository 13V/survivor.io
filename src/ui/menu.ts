// Title / main-menu lobby (pure DOM + CSS, kept off the Pixi canvas).
//
// A single scrollable column owns the whole pre-game UI: a hero header, the
// stage / survivor / pet pickers (reparented into `mount` by main.ts and flowed as
// stacked "section" panels), and a sticky PLAY bar pinned to the bottom. The pickers
// keep their own markup; this file just neutralises their old fixed positioning and
// gives them a consistent panel look while they live inside the lobby.

const STYLE_ID = 'title-screen-style';

const CSS = `
.title-screen {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background:
    radial-gradient(130% 80% at 50% -12%, rgba(70, 209, 122, 0.16), transparent 55%),
    radial-gradient(130% 80% at 50% 112%, rgba(90, 176, 255, 0.12), transparent 55%),
    linear-gradient(180deg, #0b0e15 0%, #070a10 100%);
}
.title-screen[hidden] { display: none; }

/* scrollable content area: hero + the reparented picker sections */
.lobby-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: clamp(18px, 5vh, 52px) 14px 20px;
}

.lobby-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.title-logo {
  margin: 0;
  font-size: clamp(36px, 9vw, 78px);
  line-height: 0.92;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(180deg, #6ff0a0 0%, #46d17a 42%, #ffd24a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 18px rgba(70, 209, 122, 0.25)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8));
}
.title-logo .title-logo-sub {
  display: block;
  font-size: 0.38em;
  letter-spacing: 12px;
  margin-top: 8px;
  -webkit-text-fill-color: #ffd24a;
  color: #ffd24a;
}

.title-tagline {
  margin: 4px 0 0;
  font-size: clamp(13px, 2.2vw, 17px);
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.78);
  text-shadow: 0 2px 6px #000;
}

.title-stats {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #0b0e15;
  background: linear-gradient(180deg, #ffe27a, #ffd24a);
  padding: 5px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(255, 210, 74, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
.title-stats[hidden] { display: none; }

/* --- reparented pickers become stacked section panels --- */
.lobby-scroll .stageselect,
.lobby-scroll .charselect,
.lobby-scroll .petselect {
  position: static;
  transform: none;
  width: min(660px, 96vw);
  gap: 12px;
  padding: 16px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(26, 33, 47, 0.62), rgba(13, 17, 25, 0.62));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 10px 26px rgba(0, 0, 0, 0.35);
  animation: lobby-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.lobby-scroll .ss-title,
.lobby-scroll .cs-title,
.lobby-scroll .pet-title {
  opacity: 1;
  font-size: 12px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.62);
}
@keyframes lobby-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- sticky action bar --- */
.lobby-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 16px max(14px, env(safe-area-inset-bottom));
  background: linear-gradient(0deg, #070a10 34%, rgba(7, 10, 16, 0));
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.title-play {
  pointer-events: auto;
  min-width: min(320px, 80vw);
  background: linear-gradient(180deg, #6ff0a0, #46d17a 55%, #2fa75c);
  color: #06210f;
  border: none;
  font-family: inherit;
  font-weight: 900;
  font-size: clamp(20px, 4vw, 28px);
  letter-spacing: 4px;
  padding: 15px 56px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(70, 209, 122, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18);
  transition: transform 0.08s ease, box-shadow 0.12s ease, filter 0.12s ease;
  animation: play-pulse 2.4s ease-in-out infinite;
}
.title-play:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow: 0 14px 34px rgba(70, 209, 122, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18);
}
.title-play:active { transform: scale(0.97); animation: none; }
@keyframes play-pulse {
  0%, 100% { box-shadow: 0 10px 26px rgba(70, 209, 122, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 0 rgba(0, 0, 0, 0.18); }
  50% { box-shadow: 0 12px 32px rgba(70, 209, 122, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 0 rgba(0, 0, 0, 0.18); }
}

.title-controls {
  margin: 0;
  font-size: clamp(11px, 2.2vw, 13px);
  font-weight: 600;
  opacity: 0.7;
}
.title-footer {
  margin: 0;
  font-size: 10px;
  opacity: 0.4;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .title-play { animation: none; }
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
          <h1 class="title-logo">Outbreak<span class="title-logo-sub">Survivors</span></h1>
          <p class="title-tagline">Hold the line. The horde never stops.</p>
          <p class="title-stats" hidden></p>
        </div>
      </div>
      <div class="lobby-actions">
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
