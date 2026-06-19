// Colossus — glass-cannon boss. Very high dmg, medium hp, medium-fast AoE.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'colossus',
  name: 'Colossus',
  speed: 58,
  hp: 3200,
  dmg: 40,
  radius: 60,
  xp: 74,
  texKind: 3,
  tint: 0xc23a2a, // molten crimson
  boss: true,
  bossAttack: { interval: 2.4, radius: 145 },
});
