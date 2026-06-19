import { registerWeapon } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'shuriken',
  name: 'Shuriken',
  type: 'projectile',
  icon: '✦',
  color: 0xfff3b0,
  maxLevel: 5,
  desc: 'Throws blades at the nearest enemy.',
  stats: (l) => ({
    cooldown: min(0.95 - (l - 1) * 0.08, 0.5),
    dmg: 7 + (l - 1) * 4,
    count: 1 + Math.floor((l - 1) / 2),
    speed: 560,
    radius: 7,
    pierce: l >= 4 ? 1 : 0,
    range: 620,
    knock: 70,
    spreadDeg: 9,
  }),
});
