// Rampager: a fast charge boss that telegraphs then dashes at the player.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'rampager',
  name: 'Rampager',
  speed: 76,
  hp: 3000,
  dmg: 34,
  radius: 54,
  xp: 66,
  texKind: 3,
  tint: 0xc23b3b,
  boss: true,
  bossAttack: {
    interval: 2.4,
    radius: 130,
    kind: 'charge',
  },
});
