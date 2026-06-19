import { registerWeapon, registerEvolution } from '../../registry';

// Floor helper so cooldown never drops below a positive minimum.
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Railgun — a single very fast, narrow slug that punches through ranks.
registerWeapon({
  id: 'railgun',
  name: 'Railgun',
  type: 'projectile',
  icon: '🔫',
  color: 0x00ffcc,
  maxLevel: 5,
  desc: 'Fires a hypervelocity slug that skewers a long line of foes.',
  stats: (l) => ({
    cooldown: min(1.6 - (l - 1) * 0.14, 0.85),
    dmg: 30 + (l - 1) * 14,
    count: 1,
    speed: 1400 + (l - 1) * 120,
    radius: 7,
    pierce: 8 + (l - 1) * 2, // 8 -> 16 pierce
    range: 760,
    knock: 6,
    spreadDeg: 0,
  }),
});

// Evolution: Railstorm — overcharged slugs that tear endless holes in the swarm.
registerWeapon({
  id: 'railstorm',
  name: 'Railstorm',
  type: 'projectile',
  icon: '🛰️',
  color: 0x33ffaa,
  maxLevel: 5,
  hidden: true,
  desc: 'Overcharged rails that punch crater-lines clean through the horde.',
  stats: (l) => ({
    cooldown: min(1.0 - (l - 1) * 0.1, 0.5),
    dmg: 70 + (l - 1) * 30,
    count: 1 + Math.floor((l - 1) / 2), // 1 -> 3 slugs
    speed: 1800 + (l - 1) * 150,
    radius: 9,
    pierce: 20 + (l - 1) * 4, // 20 -> 36 pierce
    range: 900,
    knock: 10,
    spreadDeg: 4,
  }),
});

registerEvolution({ result: 'railstorm', base: 'railgun', catalyst: { kind: 'passive', id: 'power' } });
