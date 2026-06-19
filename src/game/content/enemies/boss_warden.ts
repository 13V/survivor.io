// Warden — balanced all-rounder. Medium AoE on a steady cadence.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'warden',
  name: 'Warden',
  speed: 52,
  hp: 3900,
  dmg: 28,
  radius: 62,
  xp: 70,
  texKind: 3,
  tint: 0x2f7fb5, // steel blue
  boss: true,
  bossAttack: { interval: 2.7, radius: 155 },
});
