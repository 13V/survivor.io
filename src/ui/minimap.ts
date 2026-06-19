// Lightweight DOM + <canvas> minimap with an off-screen boss/elite indicator.
// Deliberately NOT drawn through the Pixi renderer — it owns a tiny 2D canvas and
// is redrawn each frame from a small SAMPLED snapshot the game passes in (so we
// never iterate thousands of live entities here).
//
// Kinds match the game's enemy textures / Enemy.kind:
//   0 = basic  (green)   1 = fast (orange)   2 = tank (purple)
// Player is cyan, boss is red. See src/game/textures.ts for the source colors.

/** A single sampled enemy/elite to plot, in WORLD coordinates. */
export interface MinimapBlip {
  x: number;
  y: number;
  kind: 0 | 1 | 2;
}

/** Snapshot the game feeds to {@link Minimap.update} once per rendered frame. */
export interface MinimapState {
  /** Player world X (map is centered on this). */
  px: number;
  /** Player world Y. */
  py: number;
  /** Half-extent in WORLD units shown from center to edge of the map. */
  range: number;
  /** Sampled enemies to draw (cap this on the caller's side, ~60). */
  blips: MinimapBlip[];
  /** Boss world position, or null when no boss is alive. */
  boss: { x: number; y: number } | null;
}

// --- palette (kept in sync with src/game/textures.ts) ----------------------
const COLOR_PLAYER = '#2ee6c8'; // cyan
const COLOR_BOSS = '#e7402b'; // red (brightened vs sprite for visibility)
const COLOR_BLIP: Record<0 | 1 | 2, string> = {
  0: '#6cbf4b', // basic  - green
  1: '#ff9a3c', // fast   - orange
  2: '#9b59b6', // tank   - purple
};

const SIZE = 120; // CSS px (square)
const PAD = 6; // inner padding so blips/arrow don't clip the rounded border

export class Minimap {
  private wrap: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  /** Drawable radius in CSS px (center to plotting edge). */
  private readonly r = SIZE / 2 - PAD;

  constructor(root: HTMLElement) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.wrap = document.createElement('div');
    this.wrap.className = 'minimap';
    // Display-only overlay: never intercept taps/clicks meant for the game.
    Object.assign(this.wrap.style, {
      position: 'absolute',
      top: '54px', // sits just below where a settings gear would live
      right: '12px',
      width: `${SIZE}px`,
      height: `${SIZE}px`,
      borderRadius: '14px',
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'rgba(10, 14, 22, 0.55)',
      border: '1px solid rgba(120, 150, 190, 0.35)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
      zIndex: '5',
    } as Partial<CSSStyleDeclaration>);

    this.canvas = document.createElement('canvas');
    this.canvas.width = Math.round(SIZE * this.dpr);
    this.canvas.height = Math.round(SIZE * this.dpr);
    Object.assign(this.canvas.style, {
      width: `${SIZE}px`,
      height: `${SIZE}px`,
      display: 'block',
    } as Partial<CSSStyleDeclaration>);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Minimap: 2D canvas context unavailable');
    this.ctx = ctx;
    // Draw in CSS-pixel space; this scale accounts for the device pixel ratio.
    this.ctx.scale(this.dpr, this.dpr);

    this.wrap.appendChild(this.canvas);
    root.appendChild(this.wrap);
  }

  /** Toggle the whole overlay (e.g. hide during the level-up / death screens). */
  setVisible(b: boolean): void {
    this.wrap.style.display = b ? 'block' : 'none';
  }

  /** Clear and redraw the map from a fresh snapshot. Cheap: O(blips). */
  update(state: MinimapState): void {
    const ctx = this.ctx;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const r = this.r;
    // World units per CSS pixel. Guard against a zero/negative range.
    const range = state.range > 0 ? state.range : 1;
    const scale = r / range;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Backdrop disc + faint range ring.
    ctx.beginPath();
    ctx.arc(cx, cy, r + PAD - 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 18, 28, 0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(120, 150, 190, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Enemy blips, clipped to the circular range.
    for (const b of state.blips) {
      const dx = (b.x - state.px) * scale;
      const dy = (b.y - state.py) * scale;
      if (dx * dx + dy * dy > r * r) continue; // outside the shown range
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_BLIP[b.kind];
      ctx.fill();
    }

    // Boss: in-range = larger red dot; out-of-range = red arrow at the rim.
    if (state.boss) {
      const dx = (state.boss.x - state.px) * scale;
      const dy = (state.boss.y - state.py) * scale;
      const dist = Math.hypot(dx, dy);
      if (dist <= r) {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_BOSS;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();
      } else {
        this.drawBossArrow(cx, cy, Math.atan2(dy, dx));
      }
    }

    // Player dot last so it stays on top at center.
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_PLAYER;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();
  }

  /** Red triangle pinned to the rim, pointing toward an off-map boss. */
  private drawBossArrow(cx: number, cy: number, ang: number): void {
    const ctx = this.ctx;
    const rim = this.r - 3; // tip sits just inside the ring
    const tx = cx + Math.cos(ang) * rim;
    const ty = cy + Math.sin(ang) * rim;
    const size = 7;
    // Perpendicular direction for the arrow's base corners.
    const px = -Math.sin(ang);
    const py = Math.cos(ang);

    ctx.beginPath();
    ctx.moveTo(tx, ty); // tip
    ctx.lineTo(
      tx - Math.cos(ang) * size + px * size * 0.6,
      ty - Math.sin(ang) * size + py * size * 0.6,
    );
    ctx.lineTo(
      tx - Math.cos(ang) * size - px * size * 0.6,
      ty - Math.sin(ang) * size - py * size * 0.6,
    );
    ctx.closePath();
    ctx.fillStyle = COLOR_BOSS;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.stroke();
  }
}
