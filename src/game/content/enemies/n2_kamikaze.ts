// Kamikaze: very fast, fragile rusher that detonates a hazard burst on death.
// Low hp + high speed means it reaches you and pops near your feet.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'kamikaze',
  name: 'Kamikaze',
  speed: 155,
  hp: 12,
  dmg: 12,
  radius: 12,
  xp: 3,
  texKind: 1,
  tint: 0xff7043, // hot ember
  explodeOnDeath: true,
  spawn: { minTime: 40, weight: 0.5 },
});
