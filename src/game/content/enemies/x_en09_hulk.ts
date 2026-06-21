// Bloated mass of necrotic muscle — slow but hits like a wrecking ball.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en09_hulk',
  name: 'Hulking Infected',
  speed: 40,
  hp: 320,
  dmg: 15,
  radius: 23,
  xp: 18,
  texKind: 2,
  tint: 0x6a5550,
  ai: 'seek',
  spawn: { minTime: 120, weight: 0.4 },
});
