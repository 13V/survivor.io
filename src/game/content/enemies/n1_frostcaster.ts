// Frostcaster: cyan mid-tier caster with steady, medium-speed frost bolts.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'frostcaster',
  name: 'Frostcaster',
  speed: 56,
  hp: 70,
  dmg: 13,
  radius: 15,
  xp: 8,
  texKind: 0,
  tint: 0x00bcd4,
  ai: 'shooter',
  shootCd: 2.4,
  shootSpeed: 250,
  spawn: { minTime: 60, weight: 0.28 },
});
