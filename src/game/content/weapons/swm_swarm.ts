import { registerWeapon, registerEvolution } from '../../registry';

// Clamp helper: keeps cooldown above a positive floor (test invariant).
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: a cloud of many tiny, fast projectiles bursting outward each cycle.
// Individually weak but the sheer count blankets the surrounding area.
registerWeapon({
  id: 'swarm',
  name: 'Swarm',
  type: 'burst',
  icon: '🐝',
  color: 0xc8f542,
  maxLevel: 5,
  desc: 'Unleashes a swarm of tiny stinging projectiles.',
  stats: (l) => ({
    cooldown: min(0.9 - (l - 1) * 0.08, 0.5),
    dmg: 3 + (l - 1) * 2,
    count: 8 + (l - 1) * 3,
    speed: 420,
    radius: 4,
    pierce: 0 + Math.floor((l - 1) / 3),
    range: 480,
    knock: 15,
    spin: 0.5,
  }),
});

// Evo: the Locust — a ravenous plague cloud, denser, faster, and far deadlier.
// Hidden from the draft; unlocked by pairing a maxed Swarm with Growth.
registerWeapon({
  id: 'locust',
  name: 'Locust Plague',
  type: 'burst',
  icon: '🦗',
  color: 0x8ec641,
  maxLevel: 5,
  hidden: true,
  desc: 'A devouring plague of locusts that strips the field bare.',
  stats: (l) => ({
    cooldown: min(0.6 - (l - 1) * 0.06, 0.32),
    dmg: 9 + (l - 1) * 5,
    count: 16 + (l - 1) * 4,
    speed: 540,
    radius: 6,
    pierce: 1 + Math.floor((l - 1) / 2),
    range: 600,
    knock: 28,
    spin: 0.8,
  }),
});

registerEvolution({
  result: 'locust',
  base: 'swarm',
  catalyst: { kind: 'passive', id: 'growth' },
});
