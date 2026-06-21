// The Devourer — an ancient horror that births endless hordes from its own rotting flesh.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo10_devourer',
  name: 'The Devourer',
  speed: 32,
  hp: 9600,
  dmg: 44,
  radius: 92,
  xp: 130,
  texKind: 3,
  tint: 0x7a2a28,
  boss: true,
  bossAttack: {
    interval: 3.4,
    radius: 60,
    kind: 'summon',
    summonCount: 7,
  },
});
