// Pyro: an area-burn specialist who blankets the field in flame. Lobs
// Fireballs harder and a touch faster than anyone else.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'pyro',
  name: 'Pyro',
  desc: 'Area burn. Sets the battlefield ablaze with relentless fireballs.',
  icon: '🔥',
  tint: 0xff6b3d,
  startingWeapon: 'fireball',
  mods: { dmgMul: 0.12, cdMul: -0.06 },
});
