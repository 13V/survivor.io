import { registerWeapon } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'zap',
  name: 'Tesla',
  type: 'zap',
  icon: '⚡',
  color: 0x9be7ff,
  maxLevel: 5,
  desc: 'Zaps the nearest foes with chaining bolts.',
  stats: (l) => ({
    cooldown: min(1.5 - (l - 1) * 0.12, 0.7),
    dmg: 13 + (l - 1) * 6,
    count: 1 + Math.floor((l - 1) / 1.5),
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 430,
    knock: 0,
  }),
});
