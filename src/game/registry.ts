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
  GearDef,
  PetDef,
} from './types';

export const WEAPONS: Record<string, WeaponDef> = {};
export const PASSIVES: Record<string, PassiveDef> = {};
export const EVOLUTIONS: EvolutionRecipe[] = [];
export const ENEMY_DEFS: EnemyDef[] = [];
export const CHARACTERS: Record<string, CharacterDef> = {};
export const STAGES: StageDef[] = [];
export const GEAR: Record<string, GearDef> = {};
export const PETS: Record<string, PetDef> = {};

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
export function registerGear(d: GearDef): void {
  GEAR[d.id] = d;
}
export function registerPet(d: PetDef): void {
  PETS[d.id] = d;
}
