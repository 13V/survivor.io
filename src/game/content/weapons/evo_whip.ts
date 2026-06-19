import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// New base weapon: Whip (beam). Two short, wide lashes that sweep around the
// player. Short range, fast cadence, solid up-close damage.
registerWeapon({
  id: 'whip',
  name: 'Thorn Whip',
  type: 'beam',
  icon: '🪢',
  color: 0xff8f5c,
  maxLevel: 5,
  desc: 'Two wide lashes sweep close around you, raking nearby foes.',
  stats: (l) => ({
    cooldown: min(0.8 - (l - 1) * 0.06, 0.5),
    dmg: 10 + (l - 1) * 5,
    count: 2,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 150 + (l - 1) * 12,
    knock: 60,
    beamWidth: 30,
    spin: 1.1,
  }),
});

// Evolved form of Whip: Serpent. Longer, wider lashes, more of them, far more
// damage -- a constrictor that fills the field.
registerWeapon({
  id: 'serpent',
  name: 'Serpent Lash',
  type: 'beam',
  hidden: true,
  icon: '🐍',
  color: 0xffb05c,
  maxLevel: 5,
  desc: 'Living lashes coil out and constrict everything around you.',
  stats: (l) => ({
    cooldown: min(0.6 - (l - 1) * 0.05, 0.4),
    dmg: 26 + (l - 1) * 11,
    count: 4 + (l - 1),
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 230 + (l - 1) * 18,
    knock: 90,
    beamWidth: 42,
    spin: 1.4,
  }),
});

registerEvolution({
  result: 'serpent',
  base: 'whip',
  catalyst: { kind: 'passive', id: 'power' },
});
