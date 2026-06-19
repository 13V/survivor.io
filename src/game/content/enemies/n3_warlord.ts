// Warlord: the toughest summon boss; rarely calls in large reinforcement waves.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'warlord',
  name: 'Warlord',
  speed: 40,
  hp: 6500,
  dmg: 38,
  radius: 80,
  xp: 90,
  texKind: 3,
  tint: 0x8a5cc4,
  boss: true,
  bossAttack: {
    interval: 3.6,
    radius: 120,
    kind: 'summon',
    summonCount: 5,
  },
});
