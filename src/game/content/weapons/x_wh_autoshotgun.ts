// Auto-Shotgun — salvaged combat shotgun that blows the front rank off their feet.
// Heavy buckshot: fewer, harder pellets, strong knockback. Evolves into Street Sweeper.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number) => (v < m ? m : v);

// ── Base weapon ──────────────────────────────────────────────────────────────
registerWeapon({
  id: 'wh_autoshotgun',
  name: 'Auto-Shotgun',
  type: 'scatter',
  icon: '🔫',
  color: 0xc0a060,
  maxLevel: 5,
  desc: 'Fires a tight cone of heavy buckshot. Few pellets, each hits like a freight train.',
  stats: (l) => ({
    // Cooldown drops from 1.10 s → 0.74 s across five levels (floor 0.65 s)
    cooldown: min(1.1 - (l - 1) * 0.09, 0.65),
    // Damage per pellet: 14 → 38
    dmg: 14 + (l - 1) * 6,
    // Pellets: 5 → 9
    count: 5 + (l - 1),
    speed: 760,
    radius: 7,
    // Each pellet punches through 1 enemy (+1 per 2 levels)
    pierce: 1 + Math.floor((l - 1) / 2),
    range: 380,
    // Knockback: 60 → 100 — enemies get hurled back
    knock: 60 + (l - 1) * 10,
    // Spread stays tight — buckshot, not birdshot
    spreadDeg: 20,
  }),
});

// ── Evolved form (hidden from draft pool) ────────────────────────────────────
registerWeapon({
  id: 'wh_streetsweeper',
  name: 'Street Sweeper',
  type: 'scatter',
  icon: '💢',
  color: 0xe0c070,
  maxLevel: 5,
  hidden: true,
  desc: 'Armoured drum-fed beast. Brutal volley clears whole corridors in one sweep.',
  stats: (l) => ({
    // Faster cycle than the base — reinforced feed mechanism
    cooldown: min(0.9 - (l - 1) * 0.07, 0.55),
    // ~2× base damage per pellet: 30 → 62
    dmg: 30 + (l - 1) * 8,
    // More pellets fill the cone: 8 → 14
    count: 8 + (l - 1) * 1.5,
    speed: 800,
    radius: 9,
    // Punches through crowds — pierce 2 → 4
    pierce: 2 + Math.floor((l - 1) / 2),
    range: 420,
    // Savage knockback: enemies stagger far back — 110 → 170
    knock: 110 + (l - 1) * 15,
    // Slightly wider spray to sweep ranks
    spreadDeg: 26,
  }),
});

// ── Evolution recipe ─────────────────────────────────────────────────────────
// Requires Auto-Shotgun at max level + the Guard passive (damage-reduction armour).
// Thematic fit: a defender's weapon turned into an unstoppable crowd-clearer.
registerEvolution({
  result: 'wh_streetsweeper',
  base: 'wh_autoshotgun',
  catalyst: { kind: 'passive', id: 'guard' },
});
