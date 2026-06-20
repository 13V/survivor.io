// War Glaive family: heavy spinning warglaives orbiting the player that fling enemies away.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'glaive',
  name: 'War Glaive',
  type: 'whirl',
  orbit: true,
  icon: '🌀',
  color: 0x9be7ff,
  maxLevel: 5,
  desc: 'Heavy warglaives spin around you, smashing back every foe they touch.',
  stats: (l) => ({
    cooldown: min(1.6 - (l - 1) * 0.18, 0.88),
    dmg: 12 + (l - 1) * 7,
    count: 2 + Math.floor((l - 1) / 2),
    speed: 0,
    radius: 20 + (l - 1) * 2,
    pierce: 0,
    range: 90 + (l - 1) * 10,
    knock: 50 + (l - 1) * 8,
    spin: 2.4 + (l - 1) * 0.2,
  }),
});

registerWeapon({
  id: 'glaive_storm',
  name: 'Tempest Glaive',
  type: 'whirl',
  orbit: true,
  hidden: true,
  icon: '🌪️',
  color: 0x66ddff,
  maxLevel: 5,
  desc: 'A howling tempest of glaives that sends enemies flying across the arena.',
  stats: (l) => ({
    cooldown: min(1.0 - (l - 1) * 0.12, 0.55),
    dmg: 28 + (l - 1) * 14,
    count: 4 + Math.floor((l - 1) / 2),
    speed: 0,
    radius: 30 + (l - 1) * 2,
    pierce: 0,
    range: 130 + (l - 1) * 12,
    knock: 90 + (l - 1) * 12,
    spin: 3.4 + (l - 1) * 0.2,
  }),
});

registerEvolution({
  result: 'glaive_storm',
  base: 'glaive',
  catalyst: { kind: 'passive', id: 'guard' },
});
