// Hazmat suit won't save you from the bullet it's about to put in you.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en07_hazmat',
  name: 'Hazmat Gunner',
  texKind: 0,
  tint: 0x4a7a5a,
  ai: 'shooter',
  shootCd: 1.3,
  shootSpeed: 280,
  speed: 46,
  hp: 34,
  dmg: 9,
  radius: 14,
  xp: 5,
  spawn: { minTime: 80, weight: 0.45 },
});
