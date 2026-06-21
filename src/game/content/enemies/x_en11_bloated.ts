// Bloated Walker: bursts in a toxic gut-spray on death.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en11_bloated',
  name: 'Bloated Walker',
  speed: 40,
  hp: 80,
  dmg: 8,
  radius: 20,
  xp: 8,
  texKind: 2,
  tint: 0x7a8a4a,
  ai: 'seek',
  explodeOnDeath: true,
  spawn: { minTime: 70, weight: 0.5 },
});
