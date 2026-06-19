// Ogre: medium-big, faster than the golem, brutish elite. Appears ~60s, rare.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'ogre',
  name: 'Ogre',
  speed: 46,
  hp: 165,
  dmg: 22,
  radius: 26,
  xp: 13,
  texKind: 2,
  tint: 0x8d6e63, // muddy brown hide
  spawn: { minTime: 60, weight: 0.2 },
});
