import { registerWeapon, registerEvolution } from '../../registry';

// Floor helper so cooldown never drops below a positive minimum.
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Lightning — chaining bolts like Tesla, but arcs to far more enemies.
registerWeapon({
  id: 'lightning',
  name: 'Lightning',
  type: 'zap',
  icon: '⚡',
  color: 0x66ccff,
  maxLevel: 5,
  desc: 'Forks lightning across many nearby foes at once.',
  stats: (l) => ({
    cooldown: min(1.3 - (l - 1) * 0.12, 0.6),
    dmg: 11 + (l - 1) * 5,
    count: 3 + (l - 1), // chains: 3 -> 7, well above Tesla
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 470,
    knock: 0,
  }),
});

// Evolution: Supercell — a thunderhead that obliterates whole crowds on crit.
registerWeapon({
  id: 'supercell',
  name: 'Supercell',
  type: 'zap',
  icon: '🌩️',
  color: 0x33aaff,
  maxLevel: 5,
  hidden: true,
  desc: 'A roiling storm cell that chains devastating bolts through the horde.',
  stats: (l) => ({
    cooldown: min(0.85 - (l - 1) * 0.1, 0.4),
    dmg: 34 + (l - 1) * 14,
    count: 8 + (l - 1) * 2, // 8 -> 16 chains
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 560,
    knock: 0,
  }),
});

registerEvolution({ result: 'supercell', base: 'lightning', catalyst: { kind: 'passive', id: 'crit' } });
