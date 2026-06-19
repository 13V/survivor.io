// Titan — huge, slow juggernaut. Big, slow telegraphed AoE slams.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'titan',
  name: 'Titan',
  speed: 34,
  hp: 5200,
  dmg: 30,
  radius: 78,
  xp: 78,
  texKind: 3,
  tint: 0x7a5230, // weathered bronze
  boss: true,
  bossAttack: { interval: 3.4, radius: 200 },
});
