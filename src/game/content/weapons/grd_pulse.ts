import { registerWeapon, registerEvolution } from '../../registry';

// Defensive aura family: a concussive pulse with strong knockback to keep the
// horde off you. Evolves into Shockwave (power catalyst): a devastating blast.

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'pulse',
  name: 'Pulse',
  type: 'nova',
  icon: '💥',
  color: 0xff8a5c,
  maxLevel: 5,
  desc: 'A concussive pulse hurls enemies away.',
  stats: (l) => ({
    cooldown: min(1.6 - (l - 1) * 0.08, 1.0),
    dmg: 6 + (l - 1) * 3,
    count: 0,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 110 + (l - 1) * 12,
    knock: 320 + (l - 1) * 30,
  }),
});

registerWeapon({
  id: 'shockwave',
  name: 'Shockwave',
  type: 'nova',
  hidden: true,
  icon: '🌋',
  color: 0xff5a2a,
  maxLevel: 5,
  desc: 'A thunderous blast that flattens everything near.',
  stats: (l) => ({
    cooldown: min(1.2 - (l - 1) * 0.06, 0.8),
    dmg: 16 + (l - 1) * 6,
    count: 0,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 150 + (l - 1) * 16,
    knock: 520 + (l - 1) * 40,
  }),
});

registerEvolution({
  result: 'shockwave',
  base: 'pulse',
  catalyst: { kind: 'passive', id: 'power' },
});
