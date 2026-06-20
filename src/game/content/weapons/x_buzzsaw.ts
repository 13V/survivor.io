// Buzzsaw family: whirring saw blades orbiting the player that shred enemies with rapid pulses.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'buzzsaw',
  name: 'Buzzsaw',
  type: 'orbit',
  orbit: true,
  icon: '⚙️',
  color: 0xffcc44,
  maxLevel: 5,
  desc: 'Spinning saw blades orbit you at high speed, grinding down anything they touch.',
  stats: (l) => ({
    cooldown: min(0.55 - (l - 1) * 0.05, 0.32),
    dmg: 6 + (l - 1) * 3,
    count: 1 + Math.floor((l - 1) / 2),
    speed: 0,
    radius: 16 + (l - 1) * 2,
    pierce: 0,
    range: 70 + (l - 1) * 10,
    knock: 4 + (l - 1) * 1,
    spin: 2.4 + (l - 1) * 0.35,
  }),
});

registerWeapon({
  id: 'ripsaw',
  name: 'Ripsaw',
  type: 'orbit',
  orbit: true,
  hidden: true,
  icon: '🪚',
  color: 0xff9933,
  maxLevel: 5,
  desc: 'Ferocious rip-saws tear through waves of enemies with brutal speed and reach.',
  stats: (l) => ({
    cooldown: min(0.38 - (l - 1) * 0.04, 0.22),
    dmg: 14 + (l - 1) * 6,
    count: 3 + Math.floor((l - 1) / 2),
    speed: 0,
    radius: 24 + (l - 1) * 2,
    pierce: 0,
    range: 110 + (l - 1) * 10,
    knock: 10 + (l - 1) * 2,
    spin: 3.8 + (l - 1) * 0.35,
  }),
});

registerEvolution({
  result: 'ripsaw',
  base: 'buzzsaw',
  catalyst: { kind: 'passive', id: 'swift' },
});
