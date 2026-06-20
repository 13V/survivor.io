// Void Spike family: jagged void shards erupt outward in a radial ring, shredding everything around you.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'void_spike',
  name: 'Void Spike',
  type: 'burst',
  icon: '🔻',
  color: 0xaa66ff,
  maxLevel: 5,
  desc: 'Erupts a ring of jagged void shards in every direction, tearing through anything nearby.',
  stats: (l) => ({
    cooldown: min(1.8 - (l - 1) * 0.175, 1.1),
    dmg: 12 + (l - 1) * 5,
    count: 8 + (l - 1) * 2,
    speed: 350 + (l - 1) * 25,
    radius: 7 + Math.floor((l - 1) / 2),
    pierce: 1 + Math.floor((l - 1) / 3),
    range: 420 + (l - 1) * 20,
    knock: 18 + (l - 1) * 3,
    spin: 0.3 + (l - 1) * 0.1,
  }),
});

registerWeapon({
  id: 'abyss_maw',
  name: 'Abyss Maw',
  type: 'burst',
  icon: '🕳️',
  color: 0x8833ff,
  maxLevel: 5,
  hidden: true,
  desc: 'Tears open a howling abyss that blasts dense volleys of void shards through every enemy in sight.',
  stats: (l) => ({
    cooldown: min(1.0 - (l - 1) * 0.12, 0.55),
    dmg: 26 + (l - 1) * 11,
    count: 14 + (l - 1) * 2,
    speed: 480 + (l - 1) * 30,
    radius: 9 + Math.floor((l - 1) / 2),
    pierce: 2 + Math.floor((l - 1) / 2),
    range: 560 + (l - 1) * 25,
    knock: 32 + (l - 1) * 5,
    spin: 0.7 + (l - 1) * 0.15,
  }),
});

registerEvolution({
  result: 'abyss_maw',
  base: 'void_spike',
  catalyst: { kind: 'passive', id: 'power' },
});
