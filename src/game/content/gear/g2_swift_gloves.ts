import { registerGear } from '../../registry';

registerGear({
  id: 'swift_gloves',
  name: 'Swift Gloves',
  slot: 'gloves',
  rarity: 'rare',
  icon: '🧤',
  desc: 'Light fingerwork trims the gap between attacks.',
  mods: { cdMul: -0.07, dmgMul: 0.06 },
});
