// Behemoth: largest radius, near hp cap, hits hardest. Appears ~90s, very rare.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'behemoth',
  name: 'Behemoth',
  speed: 36,
  hp: 248,
  dmg: 32,
  radius: 33,
  xp: 24,
  texKind: 2,
  tint: 0x5e35b1, // deep violet carapace
  spawn: { minTime: 90, weight: 0.12 },
});
