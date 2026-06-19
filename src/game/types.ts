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

export interface EnemyAttack {
  interval: number; // seconds between boss telegraphed attacks
  radius: number; // telegraph/AoE radius
}

// Enemies are pure data (stats + which base sprite to reuse + a tint), so the
// roster can grow without touching textures.ts or the engine.
export interface EnemyDef {
  id: string;
  name: string;
  speed: number;
  hp: number;
  dmg: number;
  radius: number;
  xp: number;
  texKind: number; // base sprite to reuse: 0 zombie, 1 runner, 2 brute, 3 boss
  tint?: number; // recolor the base sprite (0xRRGGBB)
  boss?: boolean;
  spawn?: { minTime?: number; weight?: number }; // director gating (non-boss)
  bossAttack?: EnemyAttack;
}

// Playable survivors: a sprite tint + a starting weapon + additive stat deltas
// (and optionally an always-granted exclusive skill). Functional, not cosmetic.
export interface CharacterDef {
  id: string;
  name: string;
  desc: string;
  icon: string; // emoji shown in the picker
  tint?: number; // recolor the player sprite
  startingWeapon: string; // weapon id to begin the run with (must exist)
  exclusiveSkill?: string; // weapon id always granted at run start (occupies a slot)
  mods?: Partial<Record<keyof Mods, number>>; // additive deltas onto baseMods
}

// A stage/mode is a config of the one run engine (docs/05).
export interface StageDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  bossTime: number; // seconds until the boss; <= 0 means endless (no boss)
  spawnBase: number; // enemies/sec at t=0
  spawnRamp: number; // additional enemies/sec per second elapsed
  enemyHpMul: number;
  enemyDmgMul: number;
  tint?: number; // background tint
}
