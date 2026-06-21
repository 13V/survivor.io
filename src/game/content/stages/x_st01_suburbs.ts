import { registerStage } from '../../registry';

registerStage({
  id: 'st01_suburbs',
  name: 'The Suburbs',
  desc: 'Cracked driveways and overgrown lawns stretch in every direction. The houses stand hollow, windows shattered, doors hanging open — whatever families lived here are long gone. A gentle enough place to sharpen your survival instincts before the real horrors begin.',
  icon: '🏘️',
  bossTime: 120,
  spawnBase: 1.6,
  spawnRamp: 0.05,
  enemyHpMul: 0.9,
  enemyDmgMul: 0.9,
  tint: 0x2a2a22,
});
