// Base enemy roster. texKind selects which generated sprite to reuse
// (0 zombie, 1 runner, 2 brute, 3 boss); tint optionally recolors it.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'zombie',
  name: 'Zombie',
  speed: 55,
  hp: 14,
  dmg: 8,
  radius: 16,
  xp: 1,
  texKind: 0,
  spawn: { minTime: 0, weight: 1 },
});

registerEnemy({
  id: 'runner',
  name: 'Runner',
  speed: 116,
  hp: 9,
  dmg: 6,
  radius: 13,
  xp: 1,
  texKind: 1,
  spawn: { minTime: 20, weight: 0.6 },
});

registerEnemy({
  id: 'brute',
  name: 'Brute',
  speed: 40,
  hp: 66,
  dmg: 15,
  radius: 24,
  xp: 4,
  texKind: 2,
  spawn: { minTime: 45, weight: 0.3 },
});

registerEnemy({
  id: 'overlord',
  name: 'Overlord',
  speed: 48,
  hp: 3600,
  dmg: 28,
  radius: 58,
  xp: 60,
  texKind: 3,
  boss: true,
  bossAttack: { interval: 2.6, radius: 140 },
});
