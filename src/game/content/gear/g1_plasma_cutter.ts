// Weapon (epic) — superheated plasma that slices through armor and crits hard.
import { registerGear } from '../../registry';

registerGear({
  id: 'plasma_cutter',
  name: 'Plasma Cutter',
  slot: 'weapon',
  rarity: 'epic',
  icon: '🔦',
  desc: 'A focused plasma lance that carves through anything in its path.',
  mods: { dmgMul: 0.2, critDmg: 0.3 },
});
