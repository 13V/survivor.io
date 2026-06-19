// Berserker: a glass cannon that hits like a truck but bleeds for it. Swings
// the Cleaver and is always granted Pulse to clear the swarms that close in.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'berserker',
  name: 'Berserker',
  desc: 'Glass cannon. Devastating damage at the cost of taking far more in return.',
  icon: '🪓',
  tint: 0xc0392b,
  startingWeapon: 'cleaver',
  exclusiveSkill: 'pulse',
  mods: { dmgMul: 0.2, dmgTakenMul: 0.18 },
});
