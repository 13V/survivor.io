import { registerStage } from '../../registry';

registerStage({
  id: 'st05_laststand',
  name: 'Last Stand',
  desc: 'The dead never stop coming. Waves crash endlessly against your position — no rescue, no retreat, no mercy. Dig in and hold the line for as long as you can.',
  icon: '🔥',
  bossTime: 0,
  spawnBase: 2.6,
  spawnRamp: 0.11,
  enemyHpMul: 1.0,
  enemyDmgMul: 1.0,
  tint: 0x261e1e,
});
