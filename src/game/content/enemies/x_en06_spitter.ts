// Bile Spitter: festering gut-sac that hacks acidic globs — don't let it range freely.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en06_spitter',
  name: 'Bile Spitter',
  speed: 48,
  hp: 26,
  dmg: 8,
  radius: 14,
  xp: 4,
  texKind: 0,
  tint: 0x7a8a3a,
  ai: 'shooter',
  shootCd: 1.6,
  shootSpeed: 230,
  spawn: { minTime: 50, weight: 0.5 },
});
