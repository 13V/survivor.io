import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Evolved form of Tesla (base id: `zap`). A storm of chaining bolts: far more
// chains, much higher damage, and a tighter firing cadence.
registerWeapon({
  id: 'tesla_coil',
  name: 'Tesla Coil',
  type: 'zap',
  hidden: true,
  icon: '⚡',
  color: 0xc9f3ff,
  maxLevel: 5,
  desc: 'An overcharged coil forks lightning across a crowd of foes.',
  stats: (l) => ({
    cooldown: min(0.85 - (l - 1) * 0.08, 0.45),
    dmg: 30 + (l - 1) * 12,
    count: 5 + (l - 1) * 2,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 520,
    knock: 0,
  }),
});

registerEvolution({
  result: 'tesla_coil',
  base: 'zap',
  catalyst: { kind: 'passive', id: 'crit' },
});
