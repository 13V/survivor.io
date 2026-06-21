// The Reaper: a gaunt death-herald that drags souls screaming into the void with every slamming strike.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bo09_reaper',
  name: 'The Reaper',
  speed: 44,
  hp: 6200,
  dmg: 30,
  radius: 72,
  xp: 92,
  texKind: 3,
  tint: 0x4a4458,
  boss: true,
  bossAttack: {
    interval: 3.8,
    radius: 220,
    kind: 'slam',
  },
});
