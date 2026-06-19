import { registerWeapon, registerEvolution } from '../../registry';

// Floor helper so cooldown never drops below a positive minimum.
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Laser — a few strong, wide beams radiating from the player.
registerWeapon({
  id: 'laser',
  name: 'Laser',
  type: 'beam',
  icon: '🔆',
  color: 0xff3366,
  maxLevel: 5,
  desc: 'Sears foes with a few powerful sweeping beams.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.1, 0.55),
    dmg: 16 + (l - 1) * 7,
    count: l < 3 ? 2 : 3, // 2 -> 3 strong beams
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 520 + (l - 1) * 30,
    knock: 0,
    beamWidth: 26,
    spin: 0.5,
  }),
});

// Evolution: Death Ray — overwhelming columns of light that scythe the field.
registerWeapon({
  id: 'death_ray',
  name: 'Death Ray',
  type: 'beam',
  icon: '☄️',
  color: 0xff0033,
  maxLevel: 5,
  hidden: true,
  desc: 'Carves the battlefield with searing columns of annihilating light.',
  stats: (l) => ({
    cooldown: min(0.8 - (l - 1) * 0.08, 0.4),
    dmg: 44 + (l - 1) * 18,
    count: 3 + Math.floor((l - 1) / 2), // 3 -> 5 beams
    speed: 0,
    radius: 0,
    pierce: 0,
    range: 700 + (l - 1) * 40,
    knock: 0,
    beamWidth: 40,
    spin: 0.45,
  }),
});

registerEvolution({ result: 'death_ray', base: 'laser', catalyst: { kind: 'passive', id: 'power' } });
