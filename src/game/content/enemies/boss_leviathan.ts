// Leviathan — the biggest, tankiest boss. Massive AoE, rare slow slams.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'leviathan',
  name: 'Leviathan',
  speed: 30,
  hp: 6400,
  dmg: 34,
  radius: 80,
  xp: 90,
  texKind: 3,
  tint: 0x10705a, // abyssal teal
  boss: true,
  bossAttack: { interval: 3.5, radius: 218 },
});
