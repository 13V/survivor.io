import { registerWeapon, registerEvolution } from '../../registry';

// Clamp helper: keeps cooldown above a positive floor (test invariant).
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: a medium-speed bolt of flame with a large blast radius and some pierce,
// aimed at the nearest enemy. Slow-firing but punishing on contact.
registerWeapon({
  id: 'fireball',
  name: 'Fireball',
  type: 'projectile',
  icon: '🔥',
  color: 0xff7a1a,
  maxLevel: 5,
  desc: 'Hurls a blazing orb that tears through enemies.',
  stats: (l) => ({
    cooldown: min(1.4 - (l - 1) * 0.12, 0.8),
    dmg: 16 + (l - 1) * 8,
    count: 1 + Math.floor((l - 1) / 3),
    speed: 360,
    radius: 22,
    pierce: 2 + Math.floor((l - 1) / 2),
    range: 700,
    knock: 90,
    spreadDeg: 7,
  }),
});

// Evo: the Meteor — a colossal falling star with crushing damage and a huge
// radius. Hidden from the draft; unlocked by pairing a maxed Fireball with Power.
registerWeapon({
  id: 'meteor',
  name: 'Meteor',
  type: 'projectile',
  icon: '☄️',
  color: 0xff3b00,
  maxLevel: 5,
  hidden: true,
  desc: 'Calls down a searing meteor that obliterates clusters.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.1, 0.6),
    dmg: 48 + (l - 1) * 20,
    count: 1 + Math.floor((l - 1) / 2),
    speed: 420,
    radius: 36,
    pierce: 5 + (l - 1),
    range: 800,
    knock: 150,
    spreadDeg: 10,
  }),
});

registerEvolution({
  result: 'meteor',
  base: 'fireball',
  catalyst: { kind: 'passive', id: 'power' },
});
