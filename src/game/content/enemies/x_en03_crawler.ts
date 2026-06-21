// Scuttles out of the drainage grates — low and fast, claws scraping concrete.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en03_crawler',
  name: 'Gutter Crawler',
  texKind: 0,
  tint: 0x6a5a44,
  ai: 'seek',
  speed: 44,
  hp: 40,
  dmg: 9,
  radius: 13,
  xp: 4,
  spawn: { minTime: 40, weight: 0.7 },
});
