// Base playable survivors. `mods` are additive deltas onto baseMods
// (e.g. dmgMul +0.1 = +10%; cdMul/dmgTakenMul negative = reduction).
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'survivor',
  name: 'Survivor',
  desc: 'Balanced all-rounder.',
  icon: '🧑',
  startingWeapon: 'shuriken',
  mods: { dmgMul: 0.05, moveMul: 0.05 },
});

registerCharacter({
  id: 'brawler',
  name: 'Brawler',
  desc: 'Tanky. Starts with Orbit Blades.',
  icon: '💪',
  tint: 0xff9a6b,
  startingWeapon: 'blades',
  mods: { maxHpMul: 0.25, dmgTakenMul: -0.1, moveMul: -0.05 },
});

registerCharacter({
  id: 'gunner',
  name: 'Gunner',
  desc: 'Crit specialist. Starts with Tesla.',
  icon: '🔫',
  tint: 0x9be7ff,
  startingWeapon: 'zap',
  mods: { critRate: 0.08, dmgMul: 0.05 },
});

registerCharacter({
  id: 'scout',
  name: 'Scout',
  desc: 'Fast, wide pickup, faster cooldowns.',
  icon: '🏃',
  tint: 0xa0ffd0,
  startingWeapon: 'shuriken',
  mods: { moveMul: 0.2, pickupMul: 0.5, cdMul: -0.08 },
});
