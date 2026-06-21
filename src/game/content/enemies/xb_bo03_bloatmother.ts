// A bloated, pestilent matriarch whose rotting mass trembles with each thunderous slam.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo03_bloatmother',
  name: 'The Bloat Mother',
  speed: 34,
  hp: 6400,
  dmg: 26,
  radius: 82,
  xp: 92,
  texKind: 3,
  tint: 0x5a7a3a,
  boss: true,
  bossAttack: {
    interval: 3.4,
    radius: 200,
    kind: 'slam',
  },
});
