// Scavenged stun-net rig: arcs chain-lightning between the infected.
// Base: wd_taser  |  EVO: wd_arccage (needs 'crit' passive at max level)
// Engine reads chillMul (<1 = speed factor) + chillDur (seconds slowed).

import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number) => (v < m ? m : v);

// ── Base weapon ──────────────────────────────────────────────────────────────
// A jury-rigged net that zaps the nearest enemies in a chain. Each level adds
// a chain link, more damage, and slightly tightens the pulse rate.
registerWeapon({
  id: 'wd_taser',
  name: 'Taser Net',
  type: 'zap',
  icon: '⚡',
  color: 0x9fb8d8,
  maxLevel: 5,
  desc: 'Arcs chain-lightning through nearby infected. More levels = more links.',
  stats: (l) => ({
    cooldown: min(1.0 - (l - 1) * 0.09, 0.55), // 1.0 → 0.55 s
    dmg: 12 + (l - 1) * 5,                      // 12 / 17 / 22 / 27 / 32
    count: 3 + (l - 1),                          // 3 → 7 chains
    speed: 0,
    radius: 8,
    pierce: 0,
    range: 300 + (l - 1) * 25,                  // 300 → 400 px
    knock: 10,
    chillMul: 0.70 - (l - 1) * 0.03,            // 0.70 → 0.58 speed factor
    chillDur: 1.2,                               // 1.2 s stun-slow (all levels)
  }),
});

// ── Hidden evolved form ──────────────────────────────────────────────────────
// Arc Cage supercharges the net into a crackling sphere of chained lightning.
// Nearly double the chains, higher damage, longer chill, and a faster pulse.
registerWeapon({
  id: 'wd_arccage',
  name: 'Arc Cage',
  type: 'zap',
  icon: '🌩️',
  color: 0xc8e0ff,
  maxLevel: 5,
  hidden: true,
  desc: 'A crackling cage of chained arcs. Electrocuted enemies are left staggering.',
  stats: (l) => ({
    cooldown: min(0.65 - (l - 1) * 0.06, 0.35), // 0.65 → 0.35 s
    dmg: 28 + (l - 1) * 9,                       // 28 / 37 / 46 / 55 / 64
    count: 7 + (l - 1) * 2,                      // 7 → 15 chains
    speed: 0,
    radius: 10,
    pierce: 0,
    range: 380 + (l - 1) * 30,                   // 380 → 500 px
    knock: 18,
    chillMul: 0.45 - (l - 1) * 0.03,             // 0.45 → 0.33 speed factor
    chillDur: 2.0 + (l - 1) * 0.2,               // 2.0 → 2.8 s stun-slow
  }),
});

// ── Evolution recipe ─────────────────────────────────────────────────────────
// wd_taser @ maxLevel + 'crit' passive owned  →  wd_arccage
registerEvolution({
  result: 'wd_arccage',
  base: 'wd_taser',
  catalyst: { kind: 'passive', id: 'crit' },
});
