// Shambler Husk — rotting, slow-witted dead that shamble forward until they rip you apart.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en01_shambler',
  name: 'Shambler Husk',
  texKind: 0,
  tint: 0x6b7355,
  ai: 'seek',
  speed: 58,
  hp: 24,
  dmg: 7,
  radius: 14,
  xp: 3,
  spawn: { minTime: 0, weight: 1.0 },
});
