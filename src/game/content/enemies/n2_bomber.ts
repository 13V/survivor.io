// Bomber: slow walker that bursts 6 damaging hazards on death.
// Medium hp so it survives long enough to lumber close.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bomber',
  name: 'Bomber',
  speed: 42,
  hp: 55,
  dmg: 14,
  radius: 18,
  xp: 5,
  texKind: 0,
  tint: 0xd11f1f, // ignition red
  explodeOnDeath: true,
  spawn: { minTime: 50, weight: 0.35 },
});
