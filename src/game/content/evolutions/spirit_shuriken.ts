// Sample evolution validating the engine: max Shuriken + Power → Spirit Shuriken.
// (Evolved weapons are hidden from the draft and granted automatically.)
import { registerWeapon, registerEvolution } from '../../registry';

registerWeapon({
  id: 'spirit_shuriken',
  name: 'Spirit Shuriken',
  type: 'projectile',
  icon: '🌟',
  color: 0xa0ffe0,
  maxLevel: 5,
  hidden: true,
  desc: 'Evolved: faster, piercing, auto-homing blades.',
  stats: (l) => ({
    cooldown: Math.max(0.45 - (l - 1) * 0.05, 0.25),
    dmg: 18 + (l - 1) * 8,
    count: 2 + Math.floor((l - 1) / 1.5),
    speed: 660,
    radius: 9,
    pierce: 2 + (l - 1),
    range: 720,
    knock: 90,
    spreadDeg: 12,
  }),
});

registerEvolution({
  result: 'spirit_shuriken',
  base: 'shuriken',
  catalyst: { kind: 'passive', id: 'power' },
});
