import { describe, it, expect } from 'vitest';
import { behaviors } from '../src/game/behaviors';
import type { WeaponContext, WeaponRuntime, WeaponStats } from '../src/game/types';
import { baseMods } from '../src/game/data';

// A recording WeaponContext: enemies are provided as world points; forEachInRadius
// reports each within r of the query centre (with dx/dy = enemy - centre, matching
// the engine's contract).
function makeCtx(opts: {
  px?: number;
  py?: number;
  aim?: { x: number; y: number } | null;
  enemies?: { x: number; y: number }[];
}) {
  const px = opts.px ?? 0;
  const py = opts.py ?? 0;
  const calls = {
    homing: [] as number[][],
    projectile: [] as number[][],
    knockback: [] as { eid: number; nx: number; ny: number; force: number }[],
    damage: [] as number[],
    rings: [] as number[][],
  };
  const ctx: WeaponContext = {
    px,
    py,
    fx: 1,
    fy: 0,
    mods: baseMods(),
    time: 0,
    critRoll: () => false,
    aimNearest: () => opts.aim ?? null,
    forEachInRadius: (x, y, r, cb) => {
      (opts.enemies ?? []).forEach((e, i) => {
        const dx = e.x - x;
        const dy = e.y - y;
        const d = Math.hypot(dx, dy);
        if (d <= r) cb(i, dx, dy, d);
      });
    },
    damage: (eid) => calls.damage.push(eid),
    knockback: (eid, nx, ny, force) => calls.knockback.push({ eid, nx, ny, force }),
    spawnProjectile: (x, y, vx, vy) => calls.projectile.push([vx, vy]),
    spawnHoming: (x, y, vx, vy) => calls.homing.push([vx, vy]),
    spawnZap: () => {},
    spawnRing: (x, y, r) => calls.rings.push([x, y, r]),
  };
  return { ctx, calls };
}

const inst = (color = 0xffffff): WeaponRuntime => ({
  def: { id: 't', name: 't', type: 't', icon: '', color, maxLevel: 5, desc: '', stats: () => s },
  level: 1,
  timer: 0,
  angle: 0,
});

const s: WeaponStats = {
  cooldown: 1,
  dmg: 10,
  count: 3,
  speed: 100,
  radius: 8,
  pierce: 0,
  range: 500,
  knock: 200,
};

describe('homing behavior', () => {
  it('launches one homing missile per `count` (not plain projectiles)', () => {
    const { ctx, calls } = makeCtx({ aim: { x: 1, y: 0 } });
    behaviors.homing.fire!(ctx, inst(), { ...s, count: 3, spreadDeg: 20 });
    expect(calls.homing.length).toBe(3);
    expect(calls.projectile.length).toBe(0);
  });
});

describe('blackhole behavior', () => {
  it('pulls enemies toward the vortex centre (inward knockback) and damages them', () => {
    // Vortex forms at px + placeDist along the aim dir (+x). Enemy sits to the
    // right of that centre, so the pull must point left (negative x).
    const placeDist = 170;
    const center = placeDist; // px=0 + dir.x*placeDist
    const { ctx, calls } = makeCtx({
      aim: { x: 1, y: 0 },
      enemies: [{ x: center + 20, y: 0 }],
    });
    behaviors.blackhole.fire!(ctx, inst(), { ...s, range: 120, knock: 200, placeDist });
    expect(calls.damage.length).toBe(1);
    expect(calls.knockback.length).toBe(1);
    expect(calls.knockback[0].nx).toBeLessThan(0); // pulled back toward the centre
    expect(calls.rings.length).toBe(1);
  });
});

describe('flamethrower (projectile cone)', () => {
  it('sprays `count` projectiles in a fan', () => {
    const { ctx, calls } = makeCtx({ aim: { x: 1, y: 0 } });
    behaviors.projectile.fire!(ctx, inst(), { ...s, count: 6, spreadDeg: 34 });
    expect(calls.projectile.length).toBe(6);
    // a spread means not every missile shares the same velocity vector
    const distinct = new Set(calls.projectile.map((v) => `${v[0].toFixed(2)},${v[1].toFixed(2)}`));
    expect(distinct.size).toBeGreaterThan(1);
  });
});
