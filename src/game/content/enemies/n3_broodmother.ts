// Broodmother: a summon boss with high hp that periodically spawns swarms of adds.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'broodmother',
  name: 'Broodmother',
  speed: 38,
  hp: 5200,
  dmg: 30,
  radius: 70,
  xp: 78,
  texKind: 3,
  tint: 0x6fae3c,
  boss: true,
  bossAttack: {
    interval: 3.0,
    radius: 110,
    kind: 'summon',
    summonCount: 4,
  },
});
