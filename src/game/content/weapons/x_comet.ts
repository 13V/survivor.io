// Comet family: lobs a fiery vortex into the horde that craters the ground and pulls enemies into the impact zone.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'comet',
  name: 'Comet',
  type: 'blackhole',
  icon: '☄️',
  color: 0xffaa55,
  maxLevel: 5,
  desc: 'Hurls a falling star into the swarm that craters the ground and drags enemies into the impact.',
  stats: (l) => ({
    cooldown: min(2.2 - (l - 1) * 0.2, 1.4),
    dmg: 18 + (l - 1) * 6.5,
    count: 1,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 120 + (l - 1) * 14,   // vortex pull radius
    knock: 60 + (l - 1) * 18,    // pull strength
    placeDist: 160 + (l - 1) * 8, // how far ahead the crater drops
  }),
});

registerWeapon({
  id: 'cataclysm',
  name: 'Cataclysm',
  type: 'blackhole',
  icon: '💥',
  color: 0xff7733,
  maxLevel: 5,
  hidden: true,
  desc: 'A world-ending impact that tears open a massive vortex, crushing everything drawn into its fury.',
  stats: (l) => ({
    cooldown: min(1.6 - (l - 1) * 0.16, 0.95),
    dmg: 40 + (l - 1) * 14,
    count: 1,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 170 + (l - 1) * 18,
    knock: 130 + (l - 1) * 22,
    placeDist: 185 + (l - 1) * 10,
  }),
});

registerEvolution({
  result: 'cataclysm',
  base: 'comet',
  catalyst: { kind: 'passive', id: 'magnet' },
});
