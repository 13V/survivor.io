// Zealot: a mid-game charger with balanced stats that periodically dashes in.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'zealot',
  name: 'Zealot',
  speed: 70,
  hp: 70,
  dmg: 18,
  radius: 17,
  xp: 5,
  texKind: 0,
  tint: 0xc2185b, // crimson rose
  ai: 'charger',
  chargeCd: 3,
  spawn: { minTime: 55, weight: 0.4 },
});
