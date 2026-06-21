// Feral, foam-mouthed sprinter — faster than it looks, hits like it hates you.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en05_rabid',
  name: 'Rabid Runner',
  texKind: 1,
  tint: 0x9a4a3a,
  ai: 'seek',
  speed: 128,
  hp: 22,
  dmg: 9,
  radius: 12,
  xp: 4,
  spawn: { minTime: 55, weight: 0.6 },
});
