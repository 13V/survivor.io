import { registerWeapon, registerEvolution } from '../../registry';

// Defensive orbit family: a couple of fast, small blades spinning tight around
// the player. Evolves into Aegis (guard catalyst): a faster, wider, harder ring.

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'halo',
  name: 'Halo',
  type: 'orbit',
  orbit: true,
  icon: '💫',
  color: 0xffe27a,
  maxLevel: 5,
  desc: 'Swift little blades circle you in a tight ring.',
  stats: (l) => ({
    cooldown: min(0.4 - (l - 1) * 0.02, 0.3),
    dmg: 4 + (l - 1) * 2,
    count: 2 + (l - 1),
    speed: 0,
    radius: 12,
    pierce: 0,
    range: 70 + (l - 1) * 6,
    knock: 30,
    spin: 3.4,
  }),
});

registerWeapon({
  id: 'aegis',
  name: 'Aegis',
  type: 'orbit',
  orbit: true,
  hidden: true,
  icon: '🛡',
  color: 0xffd24a,
  maxLevel: 5,
  desc: 'A radiant guardian ring of whirling blades.',
  stats: (l) => ({
    cooldown: min(0.3 - (l - 1) * 0.015, 0.22),
    dmg: 14 + (l - 1) * 5,
    count: 5 + (l - 1),
    speed: 0,
    radius: 18,
    pierce: 0,
    range: 100 + (l - 1) * 8,
    knock: 60,
    spin: 4.2,
  }),
});

registerEvolution({ result: 'aegis', base: 'halo', catalyst: { kind: 'passive', id: 'guard' } });
