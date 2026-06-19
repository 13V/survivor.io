// Ranger: a kiting marksman who whittles foes down from range while staying
// just out of reach. Leans on Kunai with extra damage and footspeed.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ranger',
  name: 'Ranger',
  desc: 'Kiting marksman. Hits hard from afar and never stops moving.',
  icon: '🏹',
  tint: 0x7bd88f,
  startingWeapon: 'kunai',
  mods: { dmgMul: 0.12, moveMul: 0.15 },
});
