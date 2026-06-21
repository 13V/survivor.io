// The Colossus: an ancient stone giant that shakes the earth with every thunderous slam.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo05_colossus',
  name: 'The Colossus',
  speed: 30,
  hp: 9000,
  dmg: 40,
  radius: 90,
  xp: 120,
  texKind: 3,
  tint: 0x6a5a50,
  boss: true,
  bossAttack: {
    interval: 3.6,
    radius: 240,
    kind: 'slam',
  },
});
