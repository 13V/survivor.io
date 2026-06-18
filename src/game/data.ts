// Data-driven content: weapons, passives, enemies. Everything the combat loop
// reads is defined here so new content is "just data" (see docs/02 & 03).

export const MAX_WEAPONS = 6;
export const MAX_PASSIVES = 6;

export type WeaponType = 'projectile' | 'orbit' | 'zap' | 'nova';

export interface WeaponStats {
  cooldown: number; // seconds between fires/pulses
  dmg: number;
  count: number; // projectiles / blades / chains
  speed: number; // projectile speed
  radius: number; // projectile or blade radius
  pierce: number;
  range: number; // acquisition range / orbit radius / aura radius
  knock: number;
}

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponType;
  icon: string;
  color: number;
  maxLevel: number;
  desc: string;
  stats: (lvl: number) => WeaponStats;
}

const clampMin = (v: number, m: number) => (v < m ? m : v);

export const WEAPONS: Record<string, WeaponDef> = {
  shuriken: {
    id: 'shuriken',
    name: 'Shuriken',
    type: 'projectile',
    icon: '✦',
    color: 0xfff3b0,
    maxLevel: 5,
    desc: 'Throws blades at the nearest enemy.',
    stats: (l) => ({
      cooldown: clampMin(0.95 - (l - 1) * 0.08, 0.5),
      dmg: 7 + (l - 1) * 4,
      count: 1 + Math.floor((l - 1) / 2),
      speed: 560,
      radius: 7,
      pierce: l >= 4 ? 1 : 0,
      range: 620,
      knock: 70,
    }),
  },
  blades: {
    id: 'blades',
    name: 'Orbit Blades',
    type: 'orbit',
    icon: '🛡',
    color: 0x49c5ff,
    maxLevel: 5,
    desc: 'Blades orbit you, shredding what they touch.',
    stats: (l) => ({
      cooldown: 0.45,
      dmg: 5 + (l - 1) * 3,
      count: 2 + (l - 1),
      speed: 0,
      radius: 18,
      pierce: 0,
      range: 92 + (l - 1) * 9, // orbit radius
      knock: 40,
    }),
  },
  zap: {
    id: 'zap',
    name: 'Tesla',
    type: 'zap',
    icon: '⚡',
    color: 0x9be7ff,
    maxLevel: 5,
    desc: 'Zaps the nearest foes with chaining bolts.',
    stats: (l) => ({
      cooldown: clampMin(1.5 - (l - 1) * 0.12, 0.7),
      dmg: 13 + (l - 1) * 6,
      count: 1 + Math.floor((l - 1) / 1.5),
      speed: 0,
      radius: 0,
      pierce: 0,
      range: 430,
      knock: 0,
    }),
  },
  nova: {
    id: 'nova',
    name: 'Forcefield',
    type: 'nova',
    icon: '🌀',
    color: 0x86f7ff,
    maxLevel: 5,
    desc: 'A pulsing aura damages and knocks back.',
    stats: (l) => ({
      cooldown: clampMin(1.7 - (l - 1) * 0.08, 1.0),
      dmg: 5 + (l - 1) * 3,
      count: 0,
      speed: 0,
      radius: 0,
      pierce: 0,
      range: 115 + (l - 1) * 16, // aura radius
      knock: 200,
    }),
  },
};

export interface Mods {
  dmgMul: number;
  cdMul: number;
  moveMul: number;
  maxHpMul: number;
  pickupMul: number;
  xpMul: number;
  critRate: number;
  critDmg: number;
}

export function baseMods(): Mods {
  return {
    dmgMul: 1,
    cdMul: 1,
    moveMul: 1,
    maxHpMul: 1,
    pickupMul: 1,
    xpMul: 1,
    critRate: 0.05,
    critDmg: 2.0,
  };
}

export interface PassiveDef {
  id: string;
  name: string;
  icon: string;
  maxLevel: number;
  desc: string;
  apply: (lvl: number, m: Mods) => void;
}

export const PASSIVES: Record<string, PassiveDef> = {
  power: {
    id: 'power',
    name: 'Power',
    icon: '🗡',
    maxLevel: 5,
    desc: '+12% damage / level',
    apply: (l, m) => (m.dmgMul += 0.12 * l),
  },
  haste: {
    id: 'haste',
    name: 'Haste',
    icon: '⏱',
    maxLevel: 5,
    desc: '−8% cooldown / level',
    apply: (l, m) => (m.cdMul *= Math.pow(0.92, l)),
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    icon: '👟',
    maxLevel: 5,
    desc: '+10% move speed / level',
    apply: (l, m) => (m.moveMul += 0.1 * l),
  },
  vitality: {
    id: 'vitality',
    name: 'Vitality',
    icon: '❤',
    maxLevel: 5,
    desc: '+18% max HP / level',
    apply: (l, m) => (m.maxHpMul += 0.18 * l),
  },
  magnet: {
    id: 'magnet',
    name: 'Magnet',
    icon: '🧲',
    maxLevel: 5,
    desc: '+35% pickup range / level',
    apply: (l, m) => (m.pickupMul += 0.35 * l),
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    icon: '✷',
    maxLevel: 5,
    desc: '+15% XP / level',
    apply: (l, m) => (m.xpMul += 0.15 * l),
  },
};

export interface EnemyType {
  speed: number;
  hp: number;
  dmg: number;
  radius: number;
  xp: number;
}

// kind 0 basic, 1 fast, 2 tank
export const ENEMIES: EnemyType[] = [
  { speed: 55, hp: 14, dmg: 8, radius: 16, xp: 1 },
  { speed: 116, hp: 9, dmg: 6, radius: 13, xp: 1 },
  { speed: 40, hp: 66, dmg: 15, radius: 24, xp: 4 },
];

export const BOSS: EnemyType = { speed: 48, hp: 3600, dmg: 28, radius: 58, xp: 60 };
