import { registerWeapon, registerEvolution } from '../../registry';

// Defensive aura family: a very wide, low-damage chill field for broad zone
// control. Evolves into Blizzard (crit catalyst): a vast, biting storm.

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'frostfield',
  name: 'Frost Field',
  type: 'nova',
  icon: '❄',
  color: 0x9fdcff,
  maxLevel: 5,
  desc: 'A sprawling field of cold gnaws at the swarm.',
  stats: (l) => ({
    cooldown: min(1.5 - (l - 1) * 0.07, 0.95),
    dmg: 3 + (l - 1) * 2,
    count: 0,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 165 + (l - 1) * 20,
    knock: 60,
  }),
});

registerWeapon({
  id: 'blizzard',
  name: 'Blizzard',
  type: 'nova',
  hidden: true,
  icon: '🌨',
  color: 0xc8f0ff,
  maxLevel: 5,
  desc: 'A vast, howling storm that scours the field.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.05, 0.75),
    dmg: 9 + (l - 1) * 4,
    count: 0,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 220 + (l - 1) * 26,
    knock: 90,
  }),
});

registerEvolution({
  result: 'blizzard',
  base: 'frostfield',
  catalyst: { kind: 'passive', id: 'crit' },
});
