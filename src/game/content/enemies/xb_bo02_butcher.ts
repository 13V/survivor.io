// The Butcher — a hulking abomination that charges through survivors like a freight train of rotting flesh.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo02_butcher',
  name: 'The Butcher',
  speed: 52,
  hp: 7200,
  dmg: 36,
  radius: 80,
  xp: 98,
  texKind: 3,
  tint: 0x7a3a30,
  boss: true,
  bossAttack: {
    interval: 4.2,
    radius: 120,
    kind: 'charge',
  },
});
