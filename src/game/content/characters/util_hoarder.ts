// Hoarder: a greedy collector who snowballs through levels faster than anyone.
// Orbits Blades for hands-off clearing while raking in XP and loot from afar.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'hoarder',
  name: 'Hoarder',
  desc: 'Insatiable collector. Surging XP gain and pickup reach snowball your build early.',
  icon: '💰',
  tint: 0xd4b83c,
  startingWeapon: 'blades',
  mods: { xpMul: 0.3, pickupMul: 0.6, dmgMul: -0.05 },
});
