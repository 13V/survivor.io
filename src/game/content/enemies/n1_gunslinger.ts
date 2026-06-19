// Gunslinger: orange runner-type that snaps off quick, fast bolts.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'gunslinger',
  name: 'Gunslinger',
  speed: 84,
  hp: 46,
  dmg: 12,
  radius: 13,
  xp: 7,
  texKind: 1,
  tint: 0xff9800,
  ai: 'shooter',
  shootCd: 1.6,
  shootSpeed: 320,
  spawn: { minTime: 55, weight: 0.3 },
});
