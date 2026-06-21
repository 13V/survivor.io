// Permanent meta-progression power-ups, bought with coins between runs and
// applied to the player's base stats at the start of every run. This is the
// genre's core retention loop: every run banks coins, every coin makes the
// next run a little stronger. Pure data + helpers; the shop UI and Game read
// from here, and levels persist in the save profile.
import type { Mods } from '../game/types';
import { meta } from './save';

export interface MetaUpgradeDef {
  id: string;
  name: string;
  icon: string;
  desc: string; // per-level effect, human readable
  max: number;
  baseCost: number; // coin cost of the first level
  apply: (level: number, m: Mods) => void;
}

// Cost grows ~1.6x per level so deep investment stays meaningful without ever
// becoming unreachable. Rounded to a tidy multiple of 5.
export function upgradeCost(def: MetaUpgradeDef, nextLevel: number): number {
  const raw = def.baseCost * Math.pow(1.6, Math.max(0, nextLevel - 1));
  return Math.max(def.baseCost, Math.round(raw / 5) * 5);
}

export const META_UPGRADES: MetaUpgradeDef[] = [
  {
    id: 'might',
    name: 'Might',
    icon: '⚔',
    desc: '+6% damage',
    max: 5,
    baseCost: 60,
    apply: (l, m) => (m.dmgMul += 0.06 * l),
  },
  {
    id: 'fortitude',
    name: 'Fortitude',
    icon: '❤',
    desc: '+8% max HP',
    max: 5,
    baseCost: 60,
    apply: (l, m) => (m.maxHpMul += 0.08 * l),
  },
  {
    id: 'alacrity',
    name: 'Alacrity',
    icon: '⏱',
    desc: '−3% cooldown',
    max: 5,
    baseCost: 80,
    apply: (l, m) => (m.cdMul *= Math.pow(0.97, l)),
  },
  {
    id: 'celerity',
    name: 'Celerity',
    icon: '👟',
    desc: '+5% move speed',
    max: 3,
    baseCost: 70,
    apply: (l, m) => (m.moveMul += 0.05 * l),
  },
  {
    id: 'savagery',
    name: 'Savagery',
    icon: '💥',
    desc: '+12% crit damage',
    max: 5,
    baseCost: 70,
    apply: (l, m) => (m.critDmg += 0.12 * l),
  },
  {
    id: 'precision',
    name: 'Precision',
    icon: '🎯',
    desc: '+2% crit chance',
    max: 5,
    baseCost: 70,
    apply: (l, m) => (m.critRate += 0.02 * l),
  },
  {
    id: 'armor',
    name: 'Armor',
    icon: '🛡',
    desc: '−4% damage taken',
    max: 5,
    baseCost: 90,
    apply: (l, m) => (m.dmgTakenMul *= Math.pow(0.96, l)),
  },
  {
    id: 'greed',
    name: 'Greed',
    icon: '✷',
    desc: '+8% XP gain',
    max: 5,
    baseCost: 50,
    apply: (l, m) => (m.xpMul += 0.08 * l),
  },
  {
    id: 'magnetism',
    name: 'Magnetism',
    icon: '🧲',
    desc: '+6% pickup range',
    max: 3,
    baseCost: 50,
    apply: (l, m) => (m.pickupMul += 0.06 * l),
  },
];

const BY_ID: Record<string, MetaUpgradeDef> = {};
for (const u of META_UPGRADES) BY_ID[u.id] = u;

/** Fold every purchased upgrade into a Mods object (called by Game.recompute). */
export function applyMetaUpgrades(m: Mods): void {
  for (const u of META_UPGRADES) {
    const lvl = meta.getUpgradeLevel(u.id);
    if (lvl > 0) u.apply(lvl, m);
  }
}

/** Cost of the next level of an upgrade, or null if already maxed. */
export function nextCost(id: string): number | null {
  const def = BY_ID[id];
  if (!def) return null;
  const lvl = meta.getUpgradeLevel(id);
  if (lvl >= def.max) return null;
  return upgradeCost(def, lvl + 1);
}

/**
 * Attempt to buy one level of an upgrade. Returns true on success (coins spent
 * and level incremented), false if maxed or unaffordable.
 */
export function buyUpgrade(id: string): boolean {
  const def = BY_ID[id];
  if (!def) return false;
  const lvl = meta.getUpgradeLevel(id);
  if (lvl >= def.max) return false;
  const cost = upgradeCost(def, lvl + 1);
  if (!meta.spendCoins(cost)) return false;
  meta.setUpgradeLevel(id, lvl + 1);
  return true;
}
