// Title / main-menu overlay (pure DOM + CSS, kept off the Pixi canvas).
// Matches the HUD aesthetic from ui/styles.css: dark panel, green/gold accents,
// rounded corners. All interactive elements carry the `data-ui` attribute so the
// game's input system ignores pointer events on them.

const STYLE_ID = 'title-screen-style';

const CSS = `
.title-screen {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(70, 209, 122, 0.10), transparent 60%),
    radial-gradient(120% 90% at 50% 100%, rgba(255, 210, 74, 0.08), transparent 60%),
    rgba(5, 7, 12, 0.92);
  backdrop-filter: blur(4px);
  color: #fff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.title-screen[hidden] {
  display: none;
}

.title-screen .title-logo {
  margin: 0;
  font-size: clamp(40px, 11vw, 96px);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(180deg, #46d17a 0%, #ffd24a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.8));
}

.title-screen .title-logo .title-logo-sub {
  display: block;
  font-size: 0.42em;
  letter-spacing: 10px;
  margin-top: 6px;
  -webkit-text-fill-color: #ffd24a;
  color: #ffd24a;
}

.title-screen .title-tagline {
  margin: -6px 0 0;
  font-size: clamp(13px, 2.4vw, 18px);
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 2px 6px #000;
}

.title-screen .title-stats {
  margin: 0;
  min-height: 1em;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #ffd24a;
  text-shadow: 0 1px 3px #000;
}

.title-screen .title-stats[hidden] {
  display: none;
}

.title-screen .title-play {
  pointer-events: auto;
  margin-top: 4px;
  background: linear-gradient(180deg, #5ee08c, #34b866);
  color: #06210f;
  border: none;
  font-family: inherit;
  font-weight: 900;
  font-size: clamp(20px, 4vw, 30px);
  letter-spacing: 4px;
  padding: 16px 64px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(70, 209, 122, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.08s ease;
}

.title-screen .title-play:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
  box-shadow: 0 12px 30px rgba(70, 209, 122, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.title-screen .title-play:active {
  transform: scale(0.97);
}

.title-screen .title-controls {
  margin: 2px 0 0;
  font-size: clamp(12px, 2.2vw, 14px);
  font-weight: 600;
  opacity: 0.78;
  background: rgba(14, 18, 26, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 8px 18px;
}

.title-screen .title-footer {
  position: absolute;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  margin: 0;
  font-size: 11px;
  opacity: 0.5;
  padding: 0 16px;
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
  private playCb: (() => void) | null = null;

  constructor(root: HTMLElement) {
    ensureStyle();

    const el = document.createElement('div');
    el.className = 'title-screen';
    el.setAttribute('data-ui', '');
    el.innerHTML = `
      <h1 class="title-logo" data-ui>
        Outbreak
        <span class="title-logo-sub">Survivors</span>
      </h1>
      <p class="title-tagline" data-ui>Hold the line. The horde never stops.</p>
      <p class="title-stats" data-ui hidden></p>
      <button class="title-play" type="button" data-ui>PLAY</button>
      <p class="title-controls" data-ui>WASD / arrows or drag to move — attacks are automatic</p>
      <p class="title-footer" data-ui>An original prototype · not affiliated with any existing game</p>`;
    root.appendChild(el);

    this.el = el;
    this.playBtn = el.querySelector('.title-play') as HTMLButtonElement;
    this.stats = el.querySelector('.title-stats') as HTMLElement;

    this.playBtn.addEventListener('click', () => {
      if (this.playCb) this.playCb();
    });
  }

  /** Register the callback fired when PLAY is pressed. */
  onPlay(cb: () => void): void {
    this.playCb = cb;
  }

  /** Render a "Best time" style string. Hidden when the string is empty. */
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
