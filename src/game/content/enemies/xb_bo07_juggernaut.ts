// The Juggernaut: an unstoppable armored bruiser that bulldozes everything in its path without slowing.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo07_juggernaut',
  name: 'The Juggernaut',
  speed: 50,
  hp: 7600,
  dmg: 34,
  radius: 82,
  xp: 100,
  texKind: 3,
  tint: 0x55504a,
  boss: true,
  bossAttack: {
    interval: 4.4,
    radius: 130,
    kind: 'charge',
  },
});
