// Cryo Grenade — a stolen-lab coolant charge that flash-freezes everything
// near the survivor. Pulses a sub-zero aura that damages, knocks back, and
// applies a deep slow. Evolves into Blizzard Core when paired with Vitality.

import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// ── Base weapon ──────────────────────────────────────────────────────────────
registerWeapon({
  id: 'wi_cryonade',
  name: 'Cryo Grenade',
  type: 'nova',
  icon: '❄️',
  color: 0x9fd8e8,
  maxLevel: 5,
  desc: 'Detonates a cryo-pulse around you, dealing frost damage, knocking enemies back, and slowing them.',
  stats: (l) => ({
    cooldown:  min(1.8 - (l - 1) * 0.15, 1.05), // 1.80 → 1.20 → 1.05s
    dmg:       10  + (l - 1) * 4,                // 10  → 26
    count:     1,
    speed:     0,
    radius:    0,
    pierce:    0,
    range:     130 + (l - 1) * 16,               // 130 → 194 px aura radius
    knock:     50  + (l - 1) * 10,               // 50  → 90
    chillMul:  min(0.50 - (l - 1) * 0.03, 0.38), // 0.50 → 0.38 speed factor
    chillDur:  2   + (l - 1) * 0.25,             // 2.0 → 3.0 s slow duration
  }),
});

// ── Hidden evolved form ───────────────────────────────────────────────────────
registerWeapon({
  id: 'wi_blizzardcore',
  name: 'Blizzard Core',
  type: 'nova',
  icon: '🧊',
  color: 0xc8f0ff,
  maxLevel: 5,
  hidden: true,
  desc: 'An overcharged cryo-core erupts in a massive blizzard aura, shredding HP and locking enemies in near-total freeze.',
  stats: (l) => ({
    cooldown:  min(1.2 - (l - 1) * 0.10, 0.70), // 1.20 → 0.80 → 0.70s
    dmg:       26  + (l - 1) * 9,                // 26  → 62  (~2× base at same level)
    count:     1,
    speed:     0,
    radius:    0,
    pierce:    0,
    range:     210 + (l - 1) * 20,               // 210 → 290 px — wider aura
    knock:     90  + (l - 1) * 15,               // 90  → 150 — strong pushback
    chillMul:  min(0.28 - (l - 1) * 0.02, 0.18), // 0.28 → 0.18 — near-freeze
    chillDur:  3   + (l - 1) * 0.40,             // 3.0 → 4.6 s — deep freeze
  }),
});

// ── Evolution recipe ──────────────────────────────────────────────────────────
registerEvolution({
  result:   'wi_blizzardcore',
  base:     'wi_cryonade',
  catalyst: { kind: 'passive', id: 'vitality' },
});
