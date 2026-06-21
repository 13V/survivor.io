import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: a relentless close-range cone of fire — low per-hit but a very fast,
// wide spray that shreds packed hordes. (Reuses the projectile behavior tuned
// into a dense, short, rapid fan.)
registerWeapon({
  id: 'flamethrower',
  name: 'Flamethrower',
  type: 'projectile',
  icon: '🔥',
  color: 0xff7a1a,
  maxLevel: 5,
  desc: 'Sprays a relentless cone of fire that melts crowds.',
  stats: (l) => ({
    cooldown: min(0.2 - (l - 1) * 0.018, 0.11),
    dmg: 5 + (l - 1) * 2.5,
    count: 5 + (l - 1),
    speed: 240,
    radius: 11,
    pierce: 2 + Math.floor((l - 1) / 2),
    range: 220,
    knock: 18,
    spreadDeg: 34,
    burnDps: 4 + (l - 1) * 2, // lingering fire damage-over-time
    burnDur: 2,
  }),
});

// Evo: Inferno — a roaring firestorm; wider, hotter, deeper-piercing. Pair a
// maxed Flamethrower with Power.
registerWeapon({
  id: 'inferno',
  name: 'Inferno',
  type: 'projectile',
  icon: '🌋',
  color: 0xff3b00,
  maxLevel: 5,
  hidden: true,
  desc: 'An unrelenting firestorm that devours everything ahead.',
  stats: (l) => ({
    cooldown: min(0.16 - (l - 1) * 0.014, 0.08),
    dmg: 12 + (l - 1) * 5,
    count: 8 + (l - 1),
    speed: 280,
    radius: 14,
    pierce: 4 + (l - 1),
    range: 260,
    knock: 26,
    spreadDeg: 40,
    burnDps: 9 + (l - 1) * 4,
    burnDur: 2.5,
  }),
});

registerEvolution({
  result: 'inferno',
  base: 'flamethrower',
  catalyst: { kind: 'passive', id: 'power' },
});
