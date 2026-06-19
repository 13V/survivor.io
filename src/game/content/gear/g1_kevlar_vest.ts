// Armor (rare) — woven plating that softens incoming blows.
import { registerGear } from '../../registry';

registerGear({
  id: 'kevlar_vest',
  name: 'Kevlar Vest',
  slot: 'armor',
  rarity: 'rare',
  icon: '🦺',
  desc: 'Layered ballistic weave that takes the edge off every hit.',
  mods: { maxHpMul: 0.18, dmgTakenMul: -0.06 },
});
