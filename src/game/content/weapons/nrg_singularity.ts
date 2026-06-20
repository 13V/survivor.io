import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: lobs a gravity well into the horde ahead that drags zombies toward its
// centre and crushes them — crowd control + damage in one. `range` is the vortex
// radius, `knock` the pull strength, `placeDist` how far ahead it forms.
registerWeapon({
  id: 'singularity',
  name: 'Singularity',
  type: 'blackhole',
  icon: '🕳️',
  color: 0x9b6cff,
  maxLevel: 5,
  desc: 'Opens a vortex that drags zombies in and crushes them.',
  stats: (l) => ({
    cooldown: min(2.2 - (l - 1) * 0.18, 1.3),
    dmg: 10 + (l - 1) * 6,
    count: 1,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 110 + (l - 1) * 14, // vortex radius
    knock: 240,
    placeDist: 170,
  }),
});

// Evo: Event Horizon — a wider, hungrier well with a vicious pull. Pair a maxed
// Singularity with Precision (crit).
registerWeapon({
  id: 'event_horizon',
  name: 'Event Horizon',
  type: 'blackhole',
  icon: '🌌',
  color: 0x6a3bff,
  maxLevel: 5,
  hidden: true,
  desc: 'A collapsing star that inhales the horde and annihilates it.',
  stats: (l) => ({
    cooldown: min(1.7 - (l - 1) * 0.14, 1.0),
    dmg: 26 + (l - 1) * 13,
    count: 1,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 150 + (l - 1) * 18,
    knock: 360,
    placeDist: 180,
  }),
});

registerEvolution({
  result: 'event_horizon',
  base: 'singularity',
  catalyst: { kind: 'passive', id: 'crit' },
});
