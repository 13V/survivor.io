// Juggernaut: very tanky, medium speed armored elite. Appears ~70s, rare.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'juggernaut',
  name: 'Juggernaut',
  speed: 52,
  hp: 220,
  dmg: 24,
  radius: 28,
  xp: 16,
  texKind: 2,
  tint: 0xb0413e, // burnished iron-red
  spawn: { minTime: 70, weight: 0.18 },
});
