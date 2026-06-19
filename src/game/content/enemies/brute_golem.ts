// Golem: rocky grey, slowest, highest hp near cap. Appears ~80s, rare.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'golem',
  name: 'Stone Golem',
  speed: 30,
  hp: 245,
  dmg: 28,
  radius: 30,
  xp: 20,
  texKind: 2,
  tint: 0x8a8d91, // rocky grey
  spawn: { minTime: 80, weight: 0.15 },
});
