// Back-compat surface. Weapons / passives / evolutions / enemies live in
// ./content/** and self-register through ./registry (imported below to trigger
// the glob). Pixi-free so tests stay headless.
import './registry';
import './loadContent';
import type { Mods } from './types';

export * from './types';
export { WEAPONS, PASSIVES, EVOLUTIONS, ENEMY_DEFS, CHARACTERS, STAGES, GEAR } from './registry';

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
