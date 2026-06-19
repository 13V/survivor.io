import { registerWeapon, registerEvolution } from '../../registry';

// Evolved form of Orbit Blades (base id: `blades`). A permanent-feeling wall of
// blades: more blades, bigger reach, heavier hits. Orbit behavior -> orbit:true.
registerWeapon({
  id: 'defender',
  name: 'Eternal Defender',
  type: 'orbit',
  orbit: true,
  hidden: true,
  icon: '🛡',
  color: 0x6fe3ff,
  maxLevel: 5,
  desc: 'An everlasting ring of greatblades guards you, grinding all it touches.',
  stats: (l) => ({
    cooldown: 0.32,
    dmg: 16 + (l - 1) * 7,
    count: 5 + (l - 1),
    speed: 0,
    radius: 26,
    pierce: 0,
    range: 120 + (l - 1) * 11,
    knock: 70,
    spin: 3.0,
  }),
});

registerEvolution({
  result: 'defender',
  base: 'blades',
  catalyst: { kind: 'passive', id: 'guard' },
});
