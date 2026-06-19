import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => Math.max(v, m);

// Fast, low-damage thrown dagger. Cheap, accurate, gains pierce as it levels.
registerWeapon({
  id: 'kunai',
  name: 'Kunai',
  type: 'projectile',
  icon: '🔪',
  color: 0xbcd6e8,
  maxLevel: 5,
  desc: 'Hurls a fast dagger at the nearest foe. Punches through with experience.',
  stats: (l) => ({
    cooldown: min(0.7 - (l - 1) * 0.07, 0.4),
    dmg: 5 + (l - 1) * 2,
    count: 1 + Math.floor((l - 1) / 3),
    speed: 720,
    radius: 6,
    pierce: Math.floor((l - 1) / 2),
    range: 640,
    knock: 45,
    spreadDeg: 5,
  }),
});

// Evolution: a spread of razor fans that hit harder, fly further, and shred lines.
registerWeapon({
  id: 'kunai_fan',
  name: 'Razor Fan',
  type: 'projectile',
  icon: '🌀',
  color: 0x7fe3ff,
  maxLevel: 5,
  hidden: true,
  desc: 'A whirling fan of daggers that tears through whole ranks at once.',
  stats: (l) => ({
    cooldown: min(0.42 - (l - 1) * 0.05, 0.26),
    dmg: 13 + (l - 1) * 4,
    count: 3 + Math.floor((l - 1) / 2),
    speed: 820,
    radius: 7,
    pierce: 2 + Math.floor((l - 1) / 2),
    range: 720,
    knock: 60,
    spreadDeg: 7,
  }),
});

registerEvolution({
  result: 'kunai_fan',
  base: 'kunai',
  catalyst: { kind: 'passive', id: 'power' },
});

// Created: kunai, kunai_fan (evolution of kunai via passive 'power')
