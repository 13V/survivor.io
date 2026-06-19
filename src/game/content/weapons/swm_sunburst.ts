import { registerWeapon, registerEvolution } from '../../registry';

// Clamp helper: keeps cooldown above a positive floor (test invariant).
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: several radial beams of sunlight sweeping out from the player. Good
// crowd coverage; the slow spin lets the beams rake across clustered enemies.
registerWeapon({
  id: 'sunburst',
  name: 'Sunburst',
  type: 'beam',
  icon: '🌞',
  color: 0xffd23f,
  maxLevel: 5,
  desc: 'Radiates beams of sunlight that sweep the field.',
  stats: (l) => ({
    cooldown: min(0.9 - (l - 1) * 0.08, 0.55),
    dmg: 9 + (l - 1) * 4,
    count: 4 + (l - 1),
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 300 + (l - 1) * 30,
    knock: 30,
    beamWidth: 16,
    spin: 0.7,
  }),
});

// Evo: the Solar Flare — a blinding corona of wider, longer, harder-hitting
// beams. Hidden from the draft; unlocked by pairing a maxed Sunburst with Power.
registerWeapon({
  id: 'solar_flare',
  name: 'Solar Flare',
  type: 'beam',
  icon: '🌅',
  color: 0xffa600,
  maxLevel: 5,
  hidden: true,
  desc: 'Erupts a scorching corona of sweeping solar beams.',
  stats: (l) => ({
    cooldown: min(0.65 - (l - 1) * 0.06, 0.38),
    dmg: 24 + (l - 1) * 10,
    count: 7 + (l - 1),
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 460 + (l - 1) * 40,
    knock: 55,
    beamWidth: 28,
    spin: 1.0,
  }),
});

registerEvolution({
  result: 'solar_flare',
  base: 'sunburst',
  catalyst: { kind: 'passive', id: 'power' },
});
