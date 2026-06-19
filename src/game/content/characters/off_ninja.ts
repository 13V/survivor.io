// Ninja: a crit assassin built around landing punishing critical strikes.
// Throws Javelins and is always granted Shuriken to multiply hit chances.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ninja',
  name: 'Ninja',
  desc: 'Crit assassin. Strikes from the shadows for devastating criticals.',
  icon: '🥷',
  tint: 0x4b4f6b,
  startingWeapon: 'javelin',
  exclusiveSkill: 'shuriken',
  mods: { critRate: 0.1, critDmg: 0.4 },
});
