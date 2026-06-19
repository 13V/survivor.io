// Artillerist: a volley boss that lobs frequent medium radial bolt barrages.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'artillerist',
  name: 'Artillerist',
  speed: 42,
  hp: 3400,
  dmg: 26,
  radius: 56,
  xp: 62,
  texKind: 3,
  tint: 0xd9772b,
  boss: true,
  bossAttack: {
    interval: 2.1,
    radius: 90,
    kind: 'volley',
    projCount: 12,
    projSpeed: 220,
  },
});
