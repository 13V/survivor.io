import { registerStage } from '../../registry';

registerStage({
  id: 'st06_hive',
  name: 'The Hive',
  desc: 'The nightmare nest. Walls of chitin, floors slick with ichor — the swarm never stops and neither will you. Relentless. Brutal. Endless.',
  icon: '🕳️',
  bossTime: 0,
  spawnBase: 3.0,
  spawnRamp: 0.13,
  enemyHpMul: 1.3,
  enemyDmgMul: 1.3,
  tint: 0x201a26,
});
