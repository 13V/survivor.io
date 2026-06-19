// Cheap, pooled particle / VFX system for combat juice (Pixi v8).
//
// Design goals (see brief):
//  - Zero per-frame allocation in steady state: every particle Sprite and its
//    state record lives in a fixed pool and is recycled, never created/destroyed
//    mid-game.
//  - A hard cap on live particles (MAX_PARTICLES). When the pool is exhausted new
//    emissions are simply dropped — combat stays smooth under heavy load.
//  - Additive blend + a soft round texture for a glowy, "energy" look.
//
// All particles share one tiny texture baked once via renderer.generateTexture.
// The owner just calls burst / spark / ring to emit and update(dt) once per step.
import { Container, Graphics, Sprite } from 'pixi.js';
import type { Renderer, Texture } from 'pixi.js';

// Hard ceiling on simultaneously-alive particles. The pool is allocated to this
// size up front; emissions beyond it are dropped rather than growing the pool.
const MAX_PARTICLES = 400;

// Linear velocity damping per second (fraction of speed retained after 1s).
// Applied via an exponential so it is framerate independent.
const DRAG = 3.2;

// One pooled particle: a Sprite plus its lightweight simulation state. Dead
// particles keep their Sprite (hidden) and are reused on the next emission.
interface Particle {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number; // remaining seconds; <= 0 means dead
  maxLife: number; // seconds this particle was spawned with (for fade curve)
  baseScale: number; // scale at full life; shrinks toward 0 as it fades
  alive: boolean;
}

export class Particles {
  private container: Container;
  private texture: Texture;
  private pool: Particle[] = [];
  private active: Particle[] = []; // subset of pool currently alive

  constructor(renderer: Renderer, parent: Container) {
    this.texture = Particles.makeTexture(renderer);

    this.container = new Container();
    // Particles never need hit-testing or sorting; skip the overhead.
    this.container.eventMode = 'none';
    parent.addChild(this.container);

    // Pre-allocate the full pool of hidden sprites once.
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const sprite = new Sprite(this.texture);
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add'; // glowy additive look
      sprite.visible = false;
      this.container.addChild(sprite);
      this.pool.push({
        sprite,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        baseScale: 1,
        alive: false,
      });
    }
  }

  // Bake a small soft round particle: a bright white core fading to transparent
  // edges via a few stacked translucent circles. White so `tint` can recolor it
  // to any hue, and soft so additive stacking reads as a glow rather than a disc.
  private static makeTexture(renderer: Renderer): Texture {
    const r = 16;
    const g = new Graphics();
    // Soft halo -> core. Stacked alphas approximate a radial gradient cheaply.
    g.circle(0, 0, r).fill({ color: 0xffffff, alpha: 0.12 });
    g.circle(0, 0, r * 0.72).fill({ color: 0xffffff, alpha: 0.18 });
    g.circle(0, 0, r * 0.48).fill({ color: 0xffffff, alpha: 0.35 });
    g.circle(0, 0, r * 0.26).fill({ color: 0xffffff, alpha: 0.9 });
    g.circle(0, 0, r * 0.12).fill({ color: 0xffffff, alpha: 1 });
    const tex = renderer.generateTexture({ target: g, resolution: 2 });
    g.destroy();
    return tex;
  }

  // Pull a hidden particle from the pool and arm it. Returns null when the live
  // cap is reached so callers naturally drop excess work under load.
  private spawn(
    x: number,
    y: number,
    color: number,
    vx: number,
    vy: number,
    life: number,
    scale: number,
  ): Particle | null {
    if (this.active.length >= MAX_PARTICLES) return null;
    // The pool always has a free slot here because active.length < MAX_PARTICLES
    // and active is a strict subset of the (MAX_PARTICLES-sized) pool.
    let p: Particle | undefined;
    for (let i = this.pool.length - 1; i >= 0; i--) {
      if (!this.pool[i].alive) {
        p = this.pool[i];
        break;
      }
    }
    if (!p) return null;

    p.alive = true;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.maxLife = life;
    p.baseScale = scale;

    const s = p.sprite;
    s.position.set(x, y);
    s.tint = color;
    s.alpha = 1;
    s.scale.set(scale);
    s.visible = true;

    this.active.push(p);
    return p;
  }

  // Outward spray for enemy deaths: `count` particles flung in random directions
  // at random speeds, fading + shrinking over ~0.4s.
  burst(x: number, y: number, color: number, count = 12): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      const life = 0.32 + Math.random() * 0.16; // ~0.4s
      const scale = 0.3 + Math.random() * 0.35;
      if (
        !this.spawn(
          x,
          y,
          color,
          Math.cos(a) * speed,
          Math.sin(a) * speed,
          life,
          scale,
        )
      )
        break; // pool exhausted; stop early
    }
  }

  // Tiny 2-3 particle hit spark: a short, fast, tight scatter.
  spark(x: number, y: number, color: number): void {
    const count = 2 + ((Math.random() * 2) | 0); // 2 or 3
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 110;
      const life = 0.14 + Math.random() * 0.1;
      const scale = 0.22 + Math.random() * 0.18;
      if (
        !this.spawn(
          x,
          y,
          color,
          Math.cos(a) * speed,
          Math.sin(a) * speed,
          life,
          scale,
        )
      )
        break;
    }
  }

  // Expanding ring for evolutions / boss spawns: particles seeded on a circle of
  // `radius`, all moving outward, fading as they expand.
  ring(x: number, y: number, color: number, radius: number): void {
    const count = Math.max(8, Math.min(48, Math.round(radius / 6)));
    const speed = 70 + radius * 0.6;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      if (
        !this.spawn(
          x + ca * radius,
          y + sa * radius,
          color,
          ca * speed,
          sa * speed,
          0.45 + Math.random() * 0.15,
          0.4 + Math.random() * 0.2,
        )
      )
        break;
    }
  }

  // Integrate motion, apply drag, fade + shrink, and recycle dead particles.
  // Swap-removes from `active` so the live set stays compact and allocation-free.
  update(dt: number): void {
    if (dt <= 0) return;
    // Exponential drag factor: framerate-independent velocity decay.
    const damp = Math.exp(-DRAG * dt);
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life -= dt;
      if (p.life <= 0) {
        // Recycle: hide and swap-remove from the active list.
        p.alive = false;
        p.sprite.visible = false;
        const last = this.active.pop()!;
        if (last !== p) this.active[i] = last;
        continue;
      }

      const s = p.sprite;
      s.x += p.vx * dt;
      s.y += p.vy * dt;
      p.vx *= damp;
      p.vy *= damp;

      // Fade alpha and shrink scale toward 0 over the particle's lifetime.
      const k = p.life / p.maxLife; // 1 -> 0
      s.alpha = k;
      s.scale.set(p.baseScale * (0.25 + 0.75 * k));
    }
  }

  // Release GPU resources. Safe to call on teardown.
  destroy(): void {
    this.container.destroy({ children: true });
    this.texture.destroy(true);
    this.pool.length = 0;
    this.active.length = 0;
  }
}
