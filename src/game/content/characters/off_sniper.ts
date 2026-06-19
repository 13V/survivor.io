// Sniper: a heavy hitter who trades mobility for colossal critical damage.
// Sets up with the Railgun to delete priority targets in one shot.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'sniper',
  name: 'Sniper',
  desc: 'Heavy hitter. Plants their feet and lands earth-shattering crits.',
  icon: '🎯',
  tint: 0x3a6ea5,
  startingWeapon: 'railgun',
  mods: { critDmg: 0.5, critRate: 0.04, moveMul: -0.08 },
});
