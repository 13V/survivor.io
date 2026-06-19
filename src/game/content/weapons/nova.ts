import { registerWeapon } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'nova',
  name: 'Forcefield',
  type: 'nova',
  icon: '🌀',
  color: 0x86f7ff,
  maxLevel: 5,
  desc: 'A pulsing aura damages and knocks back.',
  stats: (l) => ({
    cooldown: min(1.7 - (l - 1) * 0.08, 1.0),
    dmg: 5 + (l - 1) * 3,
    count: 0,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 115 + (l - 1) * 16,
    knock: 200,
  }),
});
