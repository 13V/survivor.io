// Weapon (legendary) — the last weapon you'll ever need.
import { registerGear } from '../../registry';

registerGear({
  id: 'worldender',
  name: 'Worldender',
  slot: 'weapon',
  rarity: 'legendary',
  icon: '☄',
  desc: 'A cataclysmic armament said to have unmade entire worlds.',
  mods: { dmgMul: 0.3, critDmg: 0.5 },
});
