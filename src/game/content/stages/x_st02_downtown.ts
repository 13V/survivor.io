import { registerStage } from '../../registry';

registerStage({
  id: 'st02_downtown',
  name: 'Downtown',
  desc: 'The ruined city core lies in ruins — skyscrapers guttered to husks, streets choked with the shambling dead. Dense crowds of infected flood every intersection, leaving no room to breathe and nowhere to hide.',
  icon: '🏙️',
  bossTime: 150,
  spawnBase: 2.0,
  spawnRamp: 0.07,
  enemyHpMul: 1.0,
  enemyDmgMul: 1.0,
  tint: 0x222630,
});
