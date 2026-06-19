import { registerWeapon, registerEvolution } from '../../registry';

// Clamp helper: keeps cooldown above a positive floor (test invariant).
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: a few persistent-feeling combat drones that orbit out in a radial
// burst. Fires frequently with slow, far-reaching projectiles so the swarm
// always feels present around the player.
registerWeapon({
  id: 'drone',
  name: 'Combat Drone',
  type: 'burst',
  icon: '🛸',
  color: 0x7fd8ff,
  maxLevel: 5,
  desc: 'Deploys orbiting drones that pelt nearby foes.',
  stats: (l) => ({
    cooldown: min(0.75 - (l - 1) * 0.07, 0.45),
    dmg: 6 + (l - 1) * 3,
    count: 3 + Math.floor((l - 1) / 2),
    speed: 180,
    radius: 9,
    pierce: 1 + Math.floor((l - 1) / 2),
    range: 520,
    knock: 40,
    spin: 1.1,
  }),
});

// Evo: the Destroyer — a heavier, faster-cycling drone fleet. Hidden from the
// draft; unlocked by pairing a maxed Combat Drone with Haste.
registerWeapon({
  id: 'destroyer',
  name: 'Destroyer',
  type: 'burst',
  icon: '🚀',
  color: 0x3fa9ff,
  maxLevel: 5,
  hidden: true,
  desc: 'An overclocked drone fleet that saturates the field.',
  stats: (l) => ({
    cooldown: min(0.5 - (l - 1) * 0.05, 0.28),
    dmg: 18 + (l - 1) * 7,
    count: 6 + (l - 1),
    speed: 240,
    radius: 12,
    pierce: 3 + (l - 1),
    range: 640,
    knock: 70,
    spin: 1.6,
  }),
});

registerEvolution({
  result: 'destroyer',
  base: 'drone',
  catalyst: { kind: 'passive', id: 'haste' },
});
