// Hex Spiral family: a hypnotic rotating spiral of arcane bolts whose emission angle advances each fire.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'hex_spiral',
  name: 'Hex Spiral',
  type: 'spiral',
  icon: '🌀',
  color: 0xff66cc,
  maxLevel: 5,
  desc: 'Fires a continuous rotating spiral of arcane bolts that sweep the field in a mesmerizing gyre.',
  stats: (l) => ({
    cooldown: min(0.35 - (l - 1) * 0.035, 0.2),
    dmg: 6 + (l - 1) * 2.5,
    count: 2 + Math.floor((l - 1) / 2),
    speed: 300 + (l - 1) * 20,
    radius: 6 + Math.floor((l - 1) / 3),
    pierce: 1 + Math.floor((l - 1) / 3),
    range: 560 + (l - 1) * 20,
    knock: 3,
    turn: 30 + (l - 1) * 3,
  }),
});

registerWeapon({
  id: 'mandala',
  name: 'Mandala',
  type: 'spiral',
  icon: '🔯',
  color: 0xff33aa,
  maxLevel: 5,
  hidden: true,
  desc: 'Unleashes a dense mandala of arcane bolts spiraling at blinding speed, overwhelming every direction at once.',
  stats: (l) => ({
    cooldown: min(0.22 - (l - 1) * 0.02, 0.14),
    dmg: 14 + (l - 1) * 5,
    count: 4 + Math.floor((l - 1) / 2),
    speed: 420 + (l - 1) * 20,
    radius: 8 + Math.floor((l - 1) / 3),
    pierce: 2 + Math.floor((l - 1) / 2),
    range: 660 + (l - 1) * 20,
    knock: 6,
    turn: 45 + (l - 1) * 3,
  }),
});

registerEvolution({
  result: 'mandala',
  base: 'hex_spiral',
  catalyst: { kind: 'passive', id: 'crit' },
});
