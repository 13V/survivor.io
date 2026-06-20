// Arc Rifle: a crackling electro-lance that fires focused beams toward the nearest enemy.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Arc Rifle — one searing electric lance that skewers the nearest target.
registerWeapon({
  id: 'arc_rifle',
  name: 'Arc Rifle',
  type: 'lance',
  icon: '⚡',
  color: 0x66ccff,
  maxLevel: 5,
  desc: 'Fires a crackling electro-beam at the nearest foe, zapping everything in its path.',
  stats: (l) => ({
    cooldown: min(1.4 - (l - 1) * 0.15, 0.7),
    dmg: 14 + (l - 1) * 6,   // 14 -> 38
    count: 1,
    speed: 0,
    radius: 8,
    pierce: 0,
    range: 500 + (l - 1) * 50,  // 500 -> 700
    knock: 3,
    beamWidth: 16 + (l - 1) * 2, // 16 -> 24
  }),
});

// Evolution: Arc Annihilator — overcharged twin lances that shred everything in their path.
registerWeapon({
  id: 'arc_annihilator',
  name: 'Arc Annihilator',
  type: 'lance',
  icon: '🌩️',
  color: 0x33ffff,
  maxLevel: 5,
  hidden: true,
  desc: 'Unleashes a fan of supercharged arc beams that obliterate ranks of enemies.',
  stats: (l) => ({
    cooldown: min(0.9 - (l - 1) * 0.1, 0.45),
    dmg: 32 + (l - 1) * 14,  // 32 -> 88
    count: l < 3 ? 2 : l < 5 ? 3 : 4, // 2 -> 4 beams
    speed: 0,
    radius: 8,
    pierce: 0,
    range: 620 + (l - 1) * 50,  // 620 -> 820
    knock: 5,
    beamWidth: 22 + (l - 1) * 2, // 22 -> 30
  }),
});

registerEvolution({ result: 'arc_annihilator', base: 'arc_rifle', catalyst: { kind: 'passive', id: 'crit' } });
