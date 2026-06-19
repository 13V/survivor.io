// Tempest: a volley boss that unleashes a huge, dense radial storm on a slower cadence.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'tempest',
  name: 'Tempest',
  speed: 44,
  hp: 4200,
  dmg: 28,
  radius: 62,
  xp: 74,
  texKind: 3,
  tint: 0x3c8fd9,
  boss: true,
  bossAttack: {
    interval: 3.4,
    radius: 100,
    kind: 'volley',
    projCount: 20,
    projSpeed: 200,
  },
});
