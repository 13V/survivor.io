import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => Math.max(v, m);

// Spinning radial blades flung in every direction at once.
registerWeapon({
  id: 'chakram',
  name: 'Chakram',
  type: 'burst',
  icon: '☸',
  color: 0xffc24b,
  maxLevel: 5,
  desc: 'Flings spinning blades outward in all directions.',
  stats: (l) => ({
    cooldown: min(1.4 - (l - 1) * 0.12, 0.85),
    dmg: 9 + (l - 1) * 3,
    count: 5 + (l - 1),
    speed: 380,
    radius: 9,
    pierce: 1,
    range: 0,
    knock: 70,
    spin: 1.6,
  }),
});

// Evolution: a relentless storm of fast-spinning rings, more blades, more reach.
registerWeapon({
  id: 'chakram_storm',
  name: 'Chakram Storm',
  type: 'burst',
  icon: '🌪',
  color: 0xffe08a,
  maxLevel: 5,
  hidden: true,
  desc: 'An unending cyclone of blades that fills the field with steel.',
  stats: (l) => ({
    cooldown: min(0.8 - (l - 1) * 0.08, 0.5),
    dmg: 16 + (l - 1) * 5,
    count: 9 + (l - 1) * 2,
    speed: 460,
    radius: 11,
    pierce: 3,
    range: 0,
    knock: 95,
    spin: 3.2,
  }),
});

registerEvolution({
  result: 'chakram_storm',
  base: 'chakram',
  catalyst: { kind: 'passive', id: 'haste' },
});

// Created: chakram, chakram_storm (evolution of chakram via passive 'haste')
