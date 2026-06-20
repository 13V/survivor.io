// Weapon behavior handlers. A weapon's `type` selects one of these; the handler
// reads WeaponStats (+ optional extra numeric params) and acts through the
// WeaponContext. Add a behavior here once; author unlimited weapons as data.
import type { BehaviorHandler, WeaponContext, WeaponRuntime, WeaponStats } from './types';

const DEG = Math.PI / 180;

function fireCone(
  ctx: WeaponContext,
  s: WeaponStats,
  dirx: number,
  diry: number,
  count: number,
  spreadRad: number,
  color: number,
): void {
  const baseA = Math.atan2(diry, dirx);
  for (let i = 0; i < count; i++) {
    const a = baseA + (i - (count - 1) / 2) * spreadRad;
    ctx.spawnProjectile(
      ctx.px,
      ctx.py,
      Math.cos(a) * s.speed,
      Math.sin(a) * s.speed,
      s.dmg * ctx.mods.dmgMul,
      s.pierce,
      ctx.critRoll(),
      s.radius,
      color,
    );
  }
}

export const behaviors: Record<string, BehaviorHandler> = {
  // Aimed projectiles toward the nearest enemy (falls back to facing). Tune the
  // tightness with `spreadDeg` and salvo size with `count`. Covers shotgun-style
  // weapons too (large spreadDeg + count).
  projectile: {
    fire(ctx, inst, s) {
      const dir = ctx.aimNearest(s.range) ?? { x: ctx.fx, y: ctx.fy };
      fireCone(ctx, s, dir.x, dir.y, s.count, (s.spreadDeg ?? 9) * DEG, inst.def.color);
    },
  },

  // Radial burst in all directions (optionally rotating via `spin`).
  burst: {
    fire(ctx, inst, s) {
      const n = Math.max(1, s.count);
      const off = ctx.time * (s.spin ?? 0);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + off;
        ctx.spawnProjectile(
          ctx.px,
          ctx.py,
          Math.cos(a) * s.speed,
          Math.sin(a) * s.speed,
          s.dmg * ctx.mods.dmgMul,
          s.pierce,
          ctx.critRoll(),
          s.radius,
          inst.def.color,
        );
      }
    },
  },

  // Blades orbiting the player; spin in update, deal a damage pulse on cooldown
  // to enemies within the ring band. Set the weapon's `orbit: true` to render.
  orbit: {
    update(ctx, inst, s, dt) {
      inst.angle += (s.spin ?? 2.4) * dt;
    },
    fire(ctx, inst, s) {
      const orbitR = s.range;
      const band = s.radius + 24;
      ctx.forEachInRadius(ctx.px, ctx.py, orbitR + band, (eid, _dx, _dy, d) => {
        if (d > orbitR - band && d < orbitR + band) {
          ctx.damage(eid, s.dmg * ctx.mods.dmgMul, ctx.critRoll());
        }
      });
    },
  },

  // Chaining bolts to the nearest `count` enemies in range.
  zap: {
    fire(ctx, inst, s) {
      const hits: { eid: number; x: number; y: number; d: number }[] = [];
      ctx.forEachInRadius(ctx.px, ctx.py, s.range, (eid, dx, dy, d) => {
        hits.push({ eid, x: ctx.px + dx, y: ctx.py + dy, d });
      });
      hits.sort((a, b) => a.d - b.d);
      const n = Math.min(s.count, hits.length);
      for (let i = 0; i < n; i++) {
        ctx.damage(hits[i].eid, s.dmg * ctx.mods.dmgMul, ctx.critRoll());
        ctx.spawnZap(ctx.px, ctx.py, hits[i].x, hits[i].y, inst.def.color);
      }
    },
  },

  // Pulsing aura that damages and knocks back everything in range.
  nova: {
    fire(ctx, inst, s) {
      ctx.forEachInRadius(ctx.px, ctx.py, s.range, (eid, dx, dy) => {
        ctx.damage(eid, s.dmg * ctx.mods.dmgMul, ctx.critRoll());
        const m = Math.hypot(dx, dy) || 1;
        ctx.knockback(eid, dx / m, dy / m, s.knock);
      });
      ctx.spawnRing(ctx.px, ctx.py, s.range, inst.def.color);
    },
  },

  // Seeker missiles: a small spread of homing projectiles toward the nearest enemy.
  homing: {
    fire(ctx, inst, s) {
      const dir = ctx.aimNearest(s.range) ?? { x: ctx.fx, y: ctx.fy };
      const baseA = Math.atan2(dir.y, dir.x);
      const n = Math.max(1, s.count);
      const spread = (s.spreadDeg ?? 22) * DEG;
      for (let i = 0; i < n; i++) {
        const a = baseA + (i - (n - 1) / 2) * spread;
        ctx.spawnHoming(
          ctx.px,
          ctx.py,
          Math.cos(a) * s.speed,
          Math.sin(a) * s.speed,
          s.dmg * ctx.mods.dmgMul,
          s.pierce,
          ctx.critRoll(),
          s.radius,
          inst.def.color,
        );
      }
    },
  },

  // Singularity: lob a vortex into the horde ahead that sucks enemies inward and
  // crushes them. Placed at `placeDist` toward the nearest enemy so it doesn't pull
  // the swarm onto the player.
  blackhole: {
    fire(ctx, inst, s) {
      const dir = ctx.aimNearest(s.range + (s.placeDist ?? 160)) ?? { x: ctx.fx, y: ctx.fy };
      const cx = ctx.px + dir.x * (s.placeDist ?? 160);
      const cy = ctx.py + dir.y * (s.placeDist ?? 160);
      ctx.forEachInRadius(cx, cy, s.range, (eid, dx, dy, d) => {
        ctx.damage(eid, s.dmg * ctx.mods.dmgMul, ctx.critRoll());
        const m = d || 1;
        ctx.knockback(eid, -dx / m, -dy / m, s.knock); // pull toward the vortex centre
      });
      ctx.spawnRing(cx, cy, s.range, inst.def.color);
    },
  },

  // N beams radiating from the player (optionally rotating); line-shaped damage.
  beam: {
    fire(ctx, inst, s) {
      const beams = Math.max(1, s.count);
      const len = s.range;
      const w = s.beamWidth ?? 18;
      const off = ctx.time * (s.spin ?? 0.6);
      for (let b = 0; b < beams; b++) {
        const a = (b / beams) * Math.PI * 2 + off;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        ctx.forEachInRadius(ctx.px, ctx.py, len, (eid, ex, ey) => {
          const along = ex * dx + ey * dy;
          if (along < 0 || along > len) return;
          const perp = Math.abs(ex * -dy + ey * dx);
          if (perp < w) ctx.damage(eid, s.dmg * ctx.mods.dmgMul, ctx.critRoll());
        });
        ctx.spawnZap(ctx.px, ctx.py, ctx.px + dx * len, ctx.py + dy * len, inst.def.color);
      }
    },
  },
};
