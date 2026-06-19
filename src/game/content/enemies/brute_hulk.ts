// Hulk: big, slow, high hp & dmg armored elite. Appears ~50s, rare.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'hulk',
  name: 'Hulk',
  speed: 38,
  hp: 180,
  dmg: 26,
  radius: 27,
  xp: 12,
  texKind: 2,
  tint: 0x4caf50, // toxic green
  spawn: { minTime: 50, weight: 0.22 },
});
