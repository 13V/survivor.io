import { registerStage } from '../../registry';

registerStage({
  id: 'st04_quarantine',
  name: 'Quarantine Zone',
  desc: 'A sealed-off red zone abandoned by authorities and forgotten by the living. Supply lines are cut, the air reeks of infection, and the walls are painted in warning signs nobody reads anymore. Only the desperate go in — and not all of them come back out.',
  icon: '☣️',
  bossTime: 180,
  spawnBase: 2.4,
  spawnRamp: 0.09,
  enemyHpMul: 1.2,
  enemyDmgMul: 1.2,
  tint: 0x2c2620,
});
