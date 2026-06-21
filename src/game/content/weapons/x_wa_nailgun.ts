// Nail Gun: a gritty improvised scavenger's sidearm hammering Ballista-grade rivets at blistering speed.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Nail Gun — rapid-fire improvised shooter; low damage per rivet, punishing sustained rate.
registerWeapon({
  id: 'wa_nailgun',
  name: 'Nail Gun',
  type: 'projectile',
  icon: '🔩',
  color: 0xc9b070,
  maxLevel: 5,
  desc: 'A cobbled-together nail gun that spits rivets into the horde — not pretty, but relentlessly fast.',
  stats: (l) => ({
    cooldown: min(0.5 - (l - 1) * 0.04, 0.3), // 0.50 → 0.34 → floor 0.30
    dmg: 8 + (l - 1) * 4,                      // 8 → 24
    count: 1 + Math.floor((l - 1) / 2),        // 1 → 3 (extra nail at lvl 3 & 5)
    speed: 900,
    radius: 5,
    pierce: 2 + (l - 1),                       // 2 → 6
    range: 600 + (l - 1) * 20,                 // 600 → 680
    knock: 6,
    spreadDeg: 6,
  }),
});

// Evolution: Rivet Cannon — overloaded to fire Ballista-grade spikes that shred columns of enemies.
registerWeapon({
  id: 'wa_rivetcannon',
  name: 'Rivet Cannon',
  type: 'projectile',
  icon: '🔫',
  color: 0xe0c878,
  maxLevel: 5,
  hidden: true,
  desc: 'An overcharged rivet cannon that punches industrial spikes clean through entire columns of undead.',
  stats: (l) => ({
    cooldown: min(0.28 - (l - 1) * 0.02, 0.18), // 0.28 → 0.20 → floor 0.18
    dmg: 18 + (l - 1) * 8,                       // 18 → 50  (~2x base scaling)
    count: 2 + Math.floor((l - 1) / 2),          // 2 → 4
    speed: 1050,
    radius: 7,
    pierce: 5 + (l - 1),                         // 5 → 9
    range: 700 + (l - 1) * 25,                   // 700 → 800
    knock: 10,
    spreadDeg: 5,
  }),
});

registerEvolution({ result: 'wa_rivetcannon', base: 'wa_nailgun', catalyst: { kind: 'passive', id: 'haste' } });
