// Starter gear — one common piece per slot. `mods` are additive deltas on baseMods.
import { registerGear } from '../../registry';

registerGear({
  id: 'rusty_blade',
  name: 'Rusty Blade',
  slot: 'weapon',
  rarity: 'common',
  icon: '🗡',
  mods: { dmgMul: 0.08 },
});
registerGear({
  id: 'leather_vest',
  name: 'Leather Vest',
  slot: 'armor',
  rarity: 'common',
  icon: '🧥',
  mods: { maxHpMul: 0.1 },
});
registerGear({
  id: 'bead_necklace',
  name: 'Bead Necklace',
  slot: 'necklace',
  rarity: 'common',
  icon: '📿',
  mods: { critRate: 0.03 },
});
registerGear({
  id: 'worn_belt',
  name: 'Worn Belt',
  slot: 'belt',
  rarity: 'common',
  icon: '🎗',
  mods: { dmgTakenMul: -0.05 },
});
registerGear({
  id: 'work_gloves',
  name: 'Work Gloves',
  slot: 'gloves',
  rarity: 'common',
  icon: '🧤',
  mods: { cdMul: -0.05 },
});
registerGear({
  id: 'old_boots',
  name: 'Old Boots',
  slot: 'boots',
  rarity: 'common',
  icon: '🥾',
  mods: { moveMul: 0.08 },
});
