// Back-compat surface. Weapons / passives / evolutions now live in ./content/**
// and self-register through ./registry (imported below to trigger the glob).
// Enemy data + small helpers remain here for now.
import './registry';
import './loadContent';
import type { Mods } from './types';

export * from './types';
export { WEAPONS, PASSIVES, EVOLUTIONS } from './registry';

export const MAX_WEAPONS = 6;
export const MAX_PASSIVES = 6;

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
    dmgTakenMul: 1,
  };
}

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
