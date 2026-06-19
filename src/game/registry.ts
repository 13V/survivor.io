// Content registry. Content files under ./content/** self-register on import;
// the Vite glob below imports them all eagerly, so adding a weapon/passive/
// evolution is just dropping a new file in — no central list to edit.
import type {
  WeaponDef,
  PassiveDef,
  EvolutionRecipe,
  EnemyDef,
  CharacterDef,
  StageDef,
} from './types';

export const WEAPONS: Record<string, WeaponDef> = {};
export const PASSIVES: Record<string, PassiveDef> = {};
export const EVOLUTIONS: EvolutionRecipe[] = [];
export const ENEMY_DEFS: EnemyDef[] = [];
export const CHARACTERS: Record<string, CharacterDef> = {};
export const STAGES: StageDef[] = [];

export function registerWeapon(d: WeaponDef): void {
  WEAPONS[d.id] = d;
}
export function registerPassive(d: PassiveDef): void {
  PASSIVES[d.id] = d;
}
export function registerEvolution(r: EvolutionRecipe): void {
  EVOLUTIONS.push(r);
}
export function registerEnemy(d: EnemyDef): void {
  ENEMY_DEFS.push(d);
}
export function registerCharacter(d: CharacterDef): void {
  CHARACTERS[d.id] = d;
}
export function registerStage(d: StageDef): void {
  STAGES.push(d);
}
