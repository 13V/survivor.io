// Plasma Orb family: slow, ghostly orbs of plasma that lazily steer toward the nearest enemy and detonate on contact.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'plasma_orb',
  name: 'Plasma Orb',
  type: 'homing',
  icon: '🔮',
  color: 0xcc66ff,
  maxLevel: 5,
  desc: 'Releases drifting plasma orbs that slowly home in on the nearest enemy, burning through whatever they touch.',
  stats: (l) => ({
    cooldown: min(1.6 - (l - 1) * 0.15, 1.0),
    dmg: 16 + (l - 1) * 6,
    count: 2 + Math.floor((l - 1) / 2),
    speed: 260 + (l - 1) * 14,
    radius: 10 + Math.floor((l - 1) / 2),
    pierce: Math.floor((l - 1) / 3),
    range: 560 + (l - 1) * 20,
    knock: 20,
    spreadDeg: 22 + (l - 1),
  }),
});

registerWeapon({
  id: 'plasma_storm',
  name: 'Plasma Storm',
  type: 'homing',
  icon: '🌌',
  color: 0xaa33ff,
  maxLevel: 5,
  hidden: true,
  desc: 'Unleashes a torrent of volatile plasma orbs that swarm every enemy on screen with relentless precision.',
  stats: (l) => ({
    cooldown: min(0.9 - (l - 1) * 0.1, 0.5),
    dmg: 34 + (l - 1) * 13,
    count: 4 + Math.floor((l - 1) / 2),
    speed: 340 + (l - 1) * 18,
    radius: 12 + Math.floor((l - 1) / 2),
    pierce: 1 + Math.floor((l - 1) / 2),
    range: 680 + (l - 1) * 20,
    knock: 35,
    spreadDeg: 26 + (l - 1),
  }),
});

registerEvolution({
  result: 'plasma_storm',
  base: 'plasma_orb',
  catalyst: { kind: 'passive', id: 'growth' },
});
