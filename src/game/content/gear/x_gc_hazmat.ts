import { registerGear } from '../../registry';

registerGear({
  id: 'gc_hazmat_suit',
  name: 'Hazmat Suit',
  slot: 'armor',
  rarity: 'epic',
  icon: '🧥',
  desc: 'Thick chemical-resistant shell. Sweat through it or die without it.',
  mods: { maxHpMul: 0.18, dmgTakenMul: -0.16 },
});

registerGear({
  id: 'gc_hazmat_gloves',
  name: 'Hazmat Gloves',
  slot: 'gloves',
  rarity: 'epic',
  icon: '🧤',
  desc: 'Rubberized gauntlets. Clumsy, but your hands won\'t dissolve.',
  mods: { cdMul: -0.17, critRate: 0.05 },
});

registerGear({
  id: 'gc_hazmat_boots',
  name: 'Hazmat Boots',
  slot: 'boots',
  rarity: 'epic',
  icon: '👢',
  desc: 'Lead-lined soles. Heavier than sin, but radiation won\'t creep up your ankles.',
  mods: { moveMul: 0.15, dmgTakenMul: -0.08 },
});
