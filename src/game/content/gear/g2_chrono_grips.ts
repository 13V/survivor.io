import { registerGear } from '../../registry';

registerGear({
  id: 'chrono_grips',
  name: 'Chrono Grips',
  slot: 'gloves',
  rarity: 'legendary',
  icon: '⏱',
  desc: 'Time bends around the wearer — attacks come relentlessly.',
  mods: { cdMul: -0.15, dmgMul: 0.18 },
});
