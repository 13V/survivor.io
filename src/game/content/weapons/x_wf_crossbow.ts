// Crossbow: a silent quarrel that skewers a whole line of the infected with one slow, devastating bolt.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Crossbow — one precise, bone-shattering bolt fired at the nearest foe; low fire rate, massive pierce.
registerWeapon({
  id: 'wf_crossbow',
  name: 'Crossbow',
  type: 'projectile',
  icon: '🏹',
  color: 0x8a6a44,
  maxLevel: 5,
  desc: 'Looses a slow, iron-tipped bolt at the nearest enemy — punches clean through a column of the infected.',
  stats: (l) => ({
    cooldown: min(1.4 - (l - 1) * 0.12, 0.8), // 1.40 → 0.92 → floor 0.80
    dmg:      26 + (l - 1) * 12,               // 26 → 74
    count:    1,
    speed:    1100,                             // deliberate bolt, not a bullet
    radius:   6,
    pierce:   5 + (l - 1) * 2,                 // 5 → 13 — skewers whole columns
    range:    760 + (l - 1) * 20,              // 760 → 840
    knock:    14,
    spreadDeg: 0,                              // pinpoint accurate
  }),
});

// Evolution: Ballista — a siege-grade bolt that tears through two dozen zombies without slowing down.
registerWeapon({
  id: 'wf_ballista',
  name: 'Ballista',
  type: 'projectile',
  icon: '🎯',
  color: 0xb08a55,
  maxLevel: 5,
  hidden: true,
  desc: 'A yard-long siege bolt that rips a tunnel through the horde — nothing within its path survives the impact.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.1, 0.7),  // 1.10 → 0.70
    dmg:      54 + (l - 1) * 24,               // 54 → 150 (~2x crossbow)
    count:    1 + (l >= 4 ? 1 : 0),            // gains a second bolt at level 4
    speed:    1200 + (l - 1) * 30,             // 1200 → 1320 — slightly faster
    radius:   9,
    pierce:   12 + (l - 1) * 3,               // 12 → 24 (~2x pierce)
    range:    900 + (l - 1) * 25,             // 900 → 1000
    knock:    22,
    spreadDeg: 0,                             // still dead-straight
  }),
});

registerEvolution({ result: 'wf_ballista', base: 'wf_crossbow', catalyst: { kind: 'passive', id: 'power' } });
