// Cryoblast family: a freezing shockwave aura that erupts from the survivor, shattering into Absolute Zero.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'cryoblast',
  name: 'Cryoblast',
  type: 'nova',
  icon: '❄️',
  color: 0x8fdfff,
  maxLevel: 5,
  desc: 'A freezing shockwave erupts from you each pulse, blasting nearby enemies back.',
  stats: (l) => ({
    cooldown: min(1.8 - (l - 1) * 0.2, 1.0),
    dmg: 14 + (l - 1) * 5.5,
    count: 1,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 120 + (l - 1) * 18,
    knock: 60 + (l - 1) * 12,
  }),
});

registerWeapon({
  id: 'absolute_zero',
  name: 'Absolute Zero',
  type: 'nova',
  icon: '🧊',
  color: 0x66ffff,
  maxLevel: 5,
  hidden: true,
  desc: 'An annihilating cryo-storm reduces everything near you to absolute zero, hurling enemies away.',
  stats: (l) => ({
    cooldown: min(1.0 - (l - 1) * 0.1, 0.6),
    dmg: 30 + (l - 1) * 11,
    count: 1,
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 180 + (l - 1) * 15,
    knock: 110 + (l - 1) * 14,
  }),
});

registerEvolution({
  result: 'absolute_zero',
  base: 'cryoblast',
  catalyst: { kind: 'passive', id: 'vitality' },
});
