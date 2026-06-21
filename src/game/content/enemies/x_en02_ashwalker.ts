// Ash Walkers shamble out of scorched ruins — slow, relentless, and utterly indifferent to pain.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en02_ashwalker',
  name: 'Ash Walker',
  texKind: 0,
  tint: 0x5a5a52,
  ai: 'seek',
  speed: 64,
  hp: 30,
  dmg: 8,
  radius: 14,
  xp: 3,
  spawn: { minTime: 20, weight: 0.9 },
});
