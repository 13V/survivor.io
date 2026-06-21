// The Horde King — a relentless warlord who never fights alone, drowning survivors in endless waves of rotting flesh.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo01_hordeking',
  name: 'The Horde King',
  speed: 40,
  hp: 6000,
  dmg: 28,
  radius: 74,
  xp: 90,
  texKind: 3,
  tint: 0x6a5540,
  boss: true,
  bossAttack: {
    interval: 5,
    radius: 60,
    kind: 'summon',
    summonCount: 6,
  },
});
