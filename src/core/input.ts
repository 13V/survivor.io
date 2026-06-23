// Unified input: keyboard (WASD/arrows) + a floating touch/mouse joystick.
// Produces a movement direction each step. HUD elements marked [data-ui] are ignored.

const JOY_MAX = 70; // px radius of the joystick travel

export interface JoyState {
  active: boolean;
  baseX: number;
  baseY: number;
  knobX: number;
  knobY: number;
}

export class Input {
  private keys = new Set<string>();
  private pointerId = -1;
  private down = new Set<number>(); // every non-UI pointer currently held (mouse or touch)
  private dashQueued = false;
  joy: JoyState = { active: false, baseX: 0, baseY: 0, knobX: 0, knobY: 0 };
  /** Normalized direction; magnitude 0..1. */
  dir = { x: 0, y: 0 };
  /** Last non-zero facing, for weapons that fire "forward". */
  facing = { x: 1, y: 0 };
  enabled = true;

  /** True while a non-UI pointer is held down — hold-to-fire (mouse or touch). */
  get firing(): boolean {
    return this.enabled && this.down.size > 0;
  }

  constructor() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys.add(k);
      // Space / Shift trigger a dash (edge-triggered: ignore auto-repeat).
      if (!e.repeat && (k === ' ' || k === 'shift') && this.enabled) this.dashQueued = true;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('pointerdown', this.onDown, { passive: false });
    window.addEventListener('pointermove', this.onMove, { passive: false });
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.down.clear();
      this.pointerId = -1;
      this.joy.active = false;
    });
  }

  private isUiTarget(e: PointerEvent): boolean {
    const t = e.target as HTMLElement | null;
    return !!(t && t.closest && t.closest('[data-ui]'));
  }

  private onDown = (e: PointerEvent) => {
    if (!this.enabled || this.isUiTarget(e)) return;
    this.down.add(e.pointerId); // any non-UI press = "fire held"
    // A mouse fires but does NOT steer (desktop moves with WASD). Touch/pen drives the
    // movement joystick *and* fires, so mobile keeps one-thumb control.
    if (e.pointerType === 'mouse' || this.pointerId !== -1) return;
    this.pointerId = e.pointerId;
    this.joy.active = true;
    this.joy.baseX = this.joy.knobX = e.clientX;
    this.joy.baseY = this.joy.knobY = e.clientY;
  };

  private onMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.joy.knobX = e.clientX;
    this.joy.knobY = e.clientY;
  };

  private onUp = (e: PointerEvent) => {
    this.down.delete(e.pointerId); // release stops firing (mouse or touch)
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = -1;
    this.joy.active = false;
  };

  /** Queue a dash (on-screen button or keypress); consumed by the game next step. */
  queueDash(): void {
    if (this.enabled) this.dashQueued = true;
  }

  /** Returns true once per queued dash, then clears the request. */
  consumeDash(): boolean {
    const d = this.dashQueued;
    this.dashQueued = false;
    return d;
  }

  /** Recompute `dir` from current inputs. */
  update(): void {
    let kx = 0;
    let ky = 0;
    if (this.enabled) {
      if (this.keys.has('a') || this.keys.has('arrowleft')) kx -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) kx += 1;
      if (this.keys.has('w') || this.keys.has('arrowup')) ky -= 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) ky += 1;
    }

    if (kx !== 0 || ky !== 0) {
      const m = Math.hypot(kx, ky);
      this.dir.x = kx / m;
      this.dir.y = ky / m;
    } else if (this.enabled && this.joy.active) {
      let dx = this.joy.knobX - this.joy.baseX;
      let dy = this.joy.knobY - this.joy.baseY;
      const d = Math.hypot(dx, dy);
      if (d > JOY_MAX) {
        // clamp knob to travel radius for rendering
        this.joy.knobX = this.joy.baseX + (dx / d) * JOY_MAX;
        this.joy.knobY = this.joy.baseY + (dy / d) * JOY_MAX;
      }
      const mag = Math.min(d, JOY_MAX) / JOY_MAX;
      if (d > 1) {
        this.dir.x = (dx / d) * mag;
        this.dir.y = (dy / d) * mag;
      } else {
        this.dir.x = this.dir.y = 0;
      }
    } else {
      this.dir.x = this.dir.y = 0;
    }

    if (this.dir.x !== 0 || this.dir.y !== 0) {
      const m = Math.hypot(this.dir.x, this.dir.y);
      this.facing.x = this.dir.x / m;
      this.facing.y = this.dir.y / m;
    }
  }
}
