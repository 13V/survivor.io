// Feral Sprinter: gaunt, sun-baked ghoul that closes ground faster than it has any right to.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en04_sprinter',
  name: 'Feral Sprinter',
  texKind: 1,
  tint: 0x8a6a4a,
  ai: 'seek',
  speed: 118,
  hp: 18,
  dmg: 7,
  radius: 12,
  xp: 3,
  spawn: { minTime: 35, weight: 0.7 },
});
