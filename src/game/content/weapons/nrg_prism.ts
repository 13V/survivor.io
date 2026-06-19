import { registerWeapon, registerEvolution } from '../../registry';

// Floor helper so cooldown never drops below a positive minimum.
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Prism — many thin beams whirling rapidly around the player.
registerWeapon({
  id: 'prism',
  name: 'Prism',
  type: 'beam',
  icon: '🔷',
  color: 0x9966ff,
  maxLevel: 5,
  desc: 'Splits light into a whirl of fast, slender beams.',
  stats: (l) => ({
    cooldown: min(0.7 - (l - 1) * 0.06, 0.35),
    dmg: 7 + (l - 1) * 3,
    count: 6 + (l - 1) * 2, // 6 -> 14 thin beams
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 360 + (l - 1) * 20,
    knock: 0,
    beamWidth: 9,
    spin: 2.6,
  }),
});

// Evolution: Prism Burst — a hyperspeed kaleidoscope of cutting light.
registerWeapon({
  id: 'prism_burst',
  name: 'Prism Burst',
  type: 'beam',
  icon: '💠',
  color: 0xcc66ff,
  maxLevel: 5,
  hidden: true,
  desc: 'A blistering kaleidoscope of beams that shreds everything around you.',
  stats: (l) => ({
    cooldown: min(0.45 - (l - 1) * 0.05, 0.22),
    dmg: 16 + (l - 1) * 7,
    count: 14 + (l - 1) * 3, // 14 -> 26 beams
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 460 + (l - 1) * 25,
    knock: 0,
    beamWidth: 12,
    spin: 4.4,
  }),
});

registerEvolution({ result: 'prism_burst', base: 'prism', catalyst: { kind: 'passive', id: 'haste' } });
