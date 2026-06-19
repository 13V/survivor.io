import { registerGear } from '../../registry';

registerGear({
  id: 'haste_gauntlets',
  name: 'Haste Gauntlets',
  slot: 'gloves',
  rarity: 'epic',
  icon: '🥊',
  desc: 'Charged plating accelerates every swing.',
  mods: { cdMul: -0.11, dmgMul: 0.12 },
});
