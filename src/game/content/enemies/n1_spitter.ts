// Spitter: weak green caster that lobs frequent bolts. Early ranged pressure.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'spitter',
  name: 'Spitter',
  speed: 52,
  hp: 22,
  dmg: 7,
  radius: 14,
  xp: 3,
  texKind: 0,
  tint: 0x4caf50,
  ai: 'shooter',
  shootCd: 1.7,
  shootSpeed: 210,
  spawn: { minTime: 30, weight: 0.5 },
});
