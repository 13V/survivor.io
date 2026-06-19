// Shared content/engine types. Kept Pixi-free so content + tests stay headless.

export interface WeaponStats {
  cooldown: number; // seconds between fires (or orbit damage pulses)
  dmg: number;
  count: number; // projectiles / blades / chains / beams
  speed: number;
  radius: number; // projectile or blade radius
  pierce: number;
  range: number; // acquisition range / orbit radius / aura radius
  knock: number;
  // Behaviors may read extra numeric params (spreadDeg, spin, beamWidth, ...).
  [k: string]: number;
}

export interface WeaponDef {
  id: string;
  name: string;
  type: string; // behavior id (see behaviors.ts)
  icon: string;
  color: number;
  maxLevel: number;
  desc: string;
  orbit?: boolean; // render orbiting blades for this weapon
  hidden?: boolean; // not offered in the level-up draft (evolved forms)
  stats: (lvl: number) => WeaponStats;
}

export interface Mods {
  dmgMul: number;
  cdMul: number;
  moveMul: number;
  maxHpMul: number;
  pickupMul: number;
  xpMul: number;
  critRate: number;
  critDmg: number;
  dmgTakenMul: number;
}

export interface PassiveDef {
  id: string;
  name: string;
  icon: string;
  maxLevel: number;
  desc: string;
  apply: (lvl: number, m: Mods) => void;
}

export interface EvolutionRecipe {
  result: string; // evolved weapon id
  base: string; // base weapon id (must be at maxLevel)
  catalyst: { kind: 'passive' | 'weapon'; id: string }; // must be owned
}

export interface WeaponRuntime {
  def: WeaponDef;
  level: number;
  timer: number;
  angle: number;
}

// The capabilities the engine exposes to weapon behaviors. Lets every weapon be
// pure data: a behavior id + stats, no Game.ts edits needed for new content.
export interface WeaponContext {
  readonly px: number;
  readonly py: number;
  readonly fx: number; // facing x
  readonly fy: number; // facing y
  readonly mods: Mods;
  readonly time: number;
  critRoll(): boolean;
  /** Normalized direction to the nearest enemy in range, or null. */
  aimNearest(range: number): { x: number; y: number } | null;
  /** Visit live enemies whose center is within (x,y,r). dx/dy are enemy-minus-center. */
  forEachInRadius(
    x: number,
    y: number,
    r: number,
    cb: (eid: number, dx: number, dy: number, dist: number) => void,
  ): void;
  damage(eid: number, dmg: number, crit: boolean): void;
  knockback(eid: number, nx: number, ny: number, force: number): void;
  spawnProjectile(
    x: number,
    y: number,
    vx: number,
    vy: number,
    dmg: number,
    pierce: number,
    crit: boolean,
    radius: number,
    color?: number,
  ): void;
  spawnZap(x1: number, y1: number, x2: number, y2: number, color: number): void;
  spawnRing(x: number, y: number, r: number, color: number): void;
}

export interface BehaviorHandler {
  fire?: (ctx: WeaponContext, inst: WeaponRuntime, s: WeaponStats) => void;
  update?: (ctx: WeaponContext, inst: WeaponRuntime, s: WeaponStats, dt: number) => void;
}
