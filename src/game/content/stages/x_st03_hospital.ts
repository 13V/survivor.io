import { registerStage } from '../../registry';

registerStage({
  id: 'st03_hospital',
  name: 'The Hospital',
  desc: 'Patient zero walked these halls. The infected were born here — and they hit harder for it.',
  icon: '🏥',
  bossTime: 150,
  spawnBase: 2.2,
  spawnRamp: 0.08,
  enemyHpMul: 1.1,
  enemyDmgMul: 1.15,
  tint: 0x242c2a,
});
