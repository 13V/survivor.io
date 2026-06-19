// Mauler: a tanky bruiser charger. Slow cadence, heavy hit, rare spawn.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'mauler',
  name: 'Mauler',
  speed: 52,
  hp: 230,
  dmg: 32,
  radius: 26,
  xp: 12,
  texKind: 2,
  tint: 0x6d4c41, // dark iron-brown
  ai: 'charger',
  chargeCd: 3.5,
  spawn: { minTime: 70, weight: 0.18 },
});
