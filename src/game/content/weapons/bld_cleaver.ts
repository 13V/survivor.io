import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => Math.max(v, m);

// Wide shotgun spray of heavy cleavers. Brutal up close, useless at range.
registerWeapon({
  id: 'cleaver',
  name: 'Cleaver',
  type: 'projectile',
  icon: '🔨',
  color: 0xe06666,
  maxLevel: 5,
  desc: 'Sprays a wide fan of heavy cleavers. Devastating at point-blank range.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.09, 0.7),
    dmg: 8 + (l - 1) * 3,
    count: 5 + (l - 1),
    speed: 480,
    radius: 9,
    pierce: 1,
    range: 300,
    knock: 90,
    spreadDeg: 50,
  }),
});

// Evolution: a meat grinder of cleavers — more blades, wider, harder hitting.
registerWeapon({
  id: 'meatgrinder',
  name: 'Meatgrinder',
  type: 'projectile',
  icon: '🩸',
  color: 0xff4d4d,
  maxLevel: 5,
  hidden: true,
  desc: 'A churning wall of cleavers that mulches everything in front of you.',
  stats: (l) => ({
    cooldown: min(0.66 - (l - 1) * 0.06, 0.42),
    dmg: 15 + (l - 1) * 5,
    count: 8 + (l - 1) * 2,
    speed: 540,
    radius: 11,
    pierce: 2,
    range: 360,
    knock: 120,
    spreadDeg: 54,
  }),
});

registerEvolution({
  result: 'meatgrinder',
  base: 'cleaver',
  catalyst: { kind: 'passive', id: 'haste' },
});

// Created: cleaver, meatgrinder (evolution of cleaver via passive 'haste')
