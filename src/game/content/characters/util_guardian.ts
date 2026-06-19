// Guardian: an immovable bulwark that soaks hits the rest of the squad can't.
// Spins a protective Halo and is always granted Nova to clear what closes in.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'guardian',
  name: 'Guardian',
  desc: 'Immovable bulwark. Towering HP and armor turn incoming blows into nothing.',
  icon: '🛡️',
  tint: 0x6f8fc0,
  startingWeapon: 'halo',
  exclusiveSkill: 'nova',
  mods: { maxHpMul: 0.4, dmgTakenMul: -0.2, moveMul: -0.05 },
});
