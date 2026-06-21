// Acid Sprayer — jury-rigged tank sprayer of caustic chemical sludge.
// Fires a shotgun cone of short-range corrosive globs that leave a
// poison DoT on hit. Evolves into Bile Cannon with the Power passive.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// ── Base weapon ───────────────────────────────────────────────────────────────
registerWeapon({
  id: 'wg_acidsprayer',
  name: 'Acid Sprayer',
  type: 'scatter',
  icon: '🧪',
  color: 0x8fcf3a,
  maxLevel: 5,
  desc: 'Sprays a cone of acidic globs. Each glob deals poison damage over time.',
  stats: (l) => ({
    cooldown:   min(1.3 - (l - 1) * 0.12, 0.8), // 1.30 → 0.82 → 0.80
    dmg:        7  + (l - 1) * 3,                // 7 / 10 / 13 / 16 / 19
    count:      7  + (l - 1),                    // 7 → 11 globs
    speed:      600,
    radius:     6,
    pierce:     0,
    range:      340,                              // short-range splatter
    knock:      3,
    spreadDeg:  28,
    poisonDps:  5  + (l - 1) * 2,               // 5 → 13
    poisonDur:  3,                               // seconds of corrosion
  }),
});

// ── Hidden evolution ──────────────────────────────────────────────────────────
registerWeapon({
  id: 'wg_bilecannon',
  name: 'Bile Cannon',
  type: 'scatter',
  icon: '☣️',
  color: 0x66bb22,
  maxLevel: 5,
  hidden: true,
  desc: 'Overloaded bile cannon. Wider cone, heavier globs, and a devastating corrosive burn.',
  stats: (l) => ({
    cooldown:   min(1.1 - (l - 1) * 0.10, 0.7), // 1.10 → 0.74 → 0.70
    dmg:        18 + (l - 1) * 6,               // 18 / 24 / 30 / 36 / 42
    count:      10 + (l - 1) * 2,              // 10 → 18 globs
    speed:      580,
    radius:     9,
    pierce:     1,
    range:      400,
    knock:      6,
    spreadDeg:  36,
    poisonDps:  14 + (l - 1) * 4,              // 14 → 30
    poisonDur:  5,
  }),
});

// ── Evolution recipe ──────────────────────────────────────────────────────────
registerEvolution({
  result:   'wg_bilecannon',
  base:     'wg_acidsprayer',
  catalyst: { kind: 'passive', id: 'power' },
});
