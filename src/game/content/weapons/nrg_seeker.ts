import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: launches a salvo of homing missiles that bend toward enemies and chase
// them down — reliable damage that finds targets even while you kite.
registerWeapon({
  id: 'seeker',
  name: 'Seeker Missiles',
  type: 'homing',
  icon: '🚀',
  color: 0xffd24a,
  maxLevel: 5,
  desc: 'Fires homing missiles that hunt down the nearest threats.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.11, 0.6),
    dmg: 14 + (l - 1) * 7,
    count: 2 + Math.floor((l - 1) / 2),
    speed: 300,
    radius: 9,
    pierce: Math.floor((l - 1) / 3),
    range: 560,
    knock: 30,
    spreadDeg: 26,
  }),
});

// Evo: Hunter-Killer — a swarm of faster, harder-hitting missiles. Pair a maxed
// Seeker with Haste.
registerWeapon({
  id: 'hunter_killer',
  name: 'Hunter-Killer',
  type: 'homing',
  icon: '🛰️',
  color: 0xff5a2a,
  maxLevel: 5,
  hidden: true,
  desc: 'A relentless missile swarm that erases anything it locks onto.',
  stats: (l) => ({
    cooldown: min(0.7 - (l - 1) * 0.07, 0.35),
    dmg: 30 + (l - 1) * 14,
    count: 4 + Math.floor((l - 1) / 2),
    speed: 360,
    radius: 11,
    pierce: 1 + Math.floor((l - 1) / 2),
    range: 640,
    knock: 50,
    spreadDeg: 32,
  }),
});

registerEvolution({
  result: 'hunter_killer',
  base: 'seeker',
  catalyst: { kind: 'passive', id: 'haste' },
});
