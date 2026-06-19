import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => Math.max(v, m);

// Slow, heavy spear. Hits hard, flies dead straight, and skewers a deep line.
registerWeapon({
  id: 'javelin',
  name: 'Javelin',
  type: 'projectile',
  icon: '🗡',
  color: 0xd8b46a,
  maxLevel: 5,
  desc: 'Launches a heavy spear that impales everything in a straight line.',
  stats: (l) => ({
    cooldown: min(1.6 - (l - 1) * 0.1, 1.1),
    dmg: 22 + (l - 1) * 8,
    count: 1,
    speed: 640,
    radius: 8,
    pierce: 4 + (l - 1),
    range: 760,
    knock: 130,
    spreadDeg: 0,
  }),
});

// Evolution: an unstoppable lance that pierces endlessly and hits like a truck.
registerWeapon({
  id: 'skewer',
  name: 'Skewer',
  type: 'projectile',
  icon: '⚔',
  color: 0xffd98a,
  maxLevel: 5,
  hidden: true,
  desc: 'A colossal lance that runs every enemy through in a single throw.',
  stats: (l) => ({
    cooldown: min(1.2 - (l - 1) * 0.09, 0.8),
    dmg: 42 + (l - 1) * 14,
    count: 1,
    speed: 760,
    radius: 11,
    pierce: 12 + (l - 1) * 2,
    range: 900,
    knock: 200,
    spreadDeg: 0,
  }),
});

registerEvolution({
  result: 'skewer',
  base: 'javelin',
  catalyst: { kind: 'passive', id: 'crit' },
});

// Created: javelin, skewer (evolution of javelin via passive 'crit')
