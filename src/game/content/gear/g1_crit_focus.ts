// Necklace (epic) — sharpens the wearer's killer instinct.
import { registerGear } from '../../registry';

registerGear({
  id: 'crit_focus',
  name: 'Crit Focus',
  slot: 'necklace',
  rarity: 'epic',
  icon: '🎯',
  desc: 'A honing lens that finds the weak point in every foe.',
  mods: { critRate: 0.1, critDmg: 0.25 },
});
