// Sawblade family: scavenged workshop saw blades orbiting the survivor, grinding down approaching hordes.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'wb_sawblade',
  name: 'Circular Saw',
  type: 'orbit',
  orbit: true,
  icon: '⚙️',
  color: 0xb8b0a0,
  maxLevel: 5,
  desc: 'Salvaged circular blades orbit you in a tight ring, steadily chewing through anything in range.',
  stats: (l) => ({
    cooldown: min(0.5 - (l - 1) * 0.04, 0.3),
    dmg: 6 + (l - 1) * 3,
    count: 1 + Math.floor((l - 1) / 2),
    speed: 0,
    radius: 16 + (l - 1) * 2,
    pierce: 0,
    range: 80 + (l - 1) * 12,
    knock: 20,
    spin: 2.6 + (l - 1) * 0.25,
  }),
});

registerWeapon({
  id: 'wb_mulcher',
  name: 'Mulcher',
  type: 'orbit',
  orbit: true,
  hidden: true,
  icon: '🪚',
  color: 0xd0c8b0,
  maxLevel: 5,
  desc: 'Reinforced industrial saw blades spin in a wide, ferocious arc — enemies that step close are reduced to scrap.',
  stats: (l) => ({
    cooldown: min(0.28 - (l - 1) * 0.02, 0.18),
    dmg: 14 + (l - 1) * 7,
    count: 3 + Math.floor((l - 1) / 2),
    speed: 0,
    radius: 26 + (l - 1) * 3,
    pierce: 0,
    range: 120 + (l - 1) * 14,
    knock: 35 + (l - 1) * 5,
    spin: 4.0 + (l - 1) * 0.3,
  }),
});

registerEvolution({
  result: 'wb_mulcher',
  base: 'wb_sawblade',
  catalyst: { kind: 'passive', id: 'swift' },
});
