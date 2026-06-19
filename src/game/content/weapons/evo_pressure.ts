import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Evolved form of Forcefield (base id: `nova`). A crushing pressure field:
// wider radius, brutal knockback, and high pulse damage.
registerWeapon({
  id: 'pressure_field',
  name: 'Pressure Field',
  type: 'nova',
  hidden: true,
  icon: '🌀',
  color: 0xb6fbff,
  maxLevel: 5,
  desc: 'A roaring pressure field flings foes back and crushes the bold.',
  stats: (l) => ({
    cooldown: min(1.2 - (l - 1) * 0.08, 0.8),
    dmg: 16 + (l - 1) * 7,
    count: 0,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 175 + (l - 1) * 22,
    knock: 420,
  }),
});

registerEvolution({
  result: 'pressure_field',
  base: 'nova',
  catalyst: { kind: 'passive', id: 'guard' },
});
