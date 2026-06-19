// Stages/modes: each is a config of the single run engine. bossTime <= 0 = endless.
import { registerStage } from '../../registry';

registerStage({
  id: 'ch1',
  name: 'Wild Streets',
  desc: 'Survive to the boss at 1:30.',
  icon: '🌆',
  bossTime: 90,
  spawnBase: 2,
  spawnRamp: 0.2,
  enemyHpMul: 1,
  enemyDmgMul: 1,
});

registerStage({
  id: 'ch2',
  name: 'Subway',
  desc: 'A tougher, denser horde.',
  icon: '🚇',
  bossTime: 90,
  spawnBase: 2.4,
  spawnRamp: 0.24,
  enemyHpMul: 1.4,
  enemyDmgMul: 1.2,
  tint: 0x9aa6c4,
});

registerStage({
  id: 'endless',
  name: 'Endless',
  desc: 'No boss. How long can you last?',
  icon: '♾️',
  bossTime: -1,
  spawnBase: 2.2,
  spawnRamp: 0.28,
  enemyHpMul: 1.1,
  enemyDmgMul: 1.1,
  tint: 0xb89cff,
});

registerStage({
  id: 'bossrush',
  name: 'Boss Rush',
  desc: 'The boss arrives at 0:25.',
  icon: '💀',
  bossTime: 25,
  spawnBase: 1.6,
  spawnRamp: 0.15,
  enemyHpMul: 1.2,
  enemyDmgMul: 1.1,
  tint: 0xffb0b0,
});

registerStage({
  id: 'nightmare',
  name: 'Nightmare',
  desc: 'Brutal scaling. Bring a build.',
  icon: '🔥',
  bossTime: 90,
  spawnBase: 3,
  spawnRamp: 0.35,
  enemyHpMul: 2.2,
  enemyDmgMul: 1.6,
  tint: 0xff7a7a,
});
