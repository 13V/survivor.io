import { registerWeapon } from '../../registry';

registerWeapon({
  id: 'blades',
  name: 'Orbit Blades',
  type: 'orbit',
  orbit: true,
  icon: '🛡',
  color: 0x49c5ff,
  maxLevel: 5,
  desc: 'Blades orbit you, shredding what they touch.',
  stats: (l) => ({
    cooldown: 0.45,
    dmg: 5 + (l - 1) * 3,
    count: 2 + (l - 1),
    speed: 0,
    radius: 18,
    pierce: 0,
    range: 92 + (l - 1) * 9,
    knock: 40,
    spin: 2.4,
  }),
});
