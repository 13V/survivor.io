// Reaper — leaner, faster boss. Frequent, smaller AoE. Dark tint.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'reaper',
  name: 'Reaper',
  speed: 78,
  hp: 2900,
  dmg: 26,
  radius: 52,
  xp: 64,
  texKind: 3,
  tint: 0x1c1730, // near-black violet
  boss: true,
  bossAttack: { interval: 2.0, radius: 115 },
});
