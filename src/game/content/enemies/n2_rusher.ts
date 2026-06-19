// Rusher: a fast charger that closes distance and dashes hard at the player.
// Medium hp, high dmg — punishes standing still.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'rusher',
  name: 'Rusher',
  speed: 130,
  hp: 30,
  dmg: 20,
  radius: 14,
  xp: 3,
  texKind: 1,
  tint: 0xff5722, // searing orange
  ai: 'charger',
  chargeCd: 2.5,
  spawn: { minTime: 35, weight: 0.55 },
});
