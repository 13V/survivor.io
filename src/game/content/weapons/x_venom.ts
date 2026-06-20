// Venom Spitter: a wide shotgun cone of corrosive venom globs sprayed at the nearest enemy.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Venom Spitter — blasts a short-range cone of toxic globs at the nearest foe.
registerWeapon({
  id: 'venom_spitter',
  name: 'Venom Spitter',
  type: 'scatter',
  icon: '🐍',
  color: 0x66dd55,
  maxLevel: 5,
  desc: 'Spews a wide fan of corrosive venom globs that shred anything caught in the spray.',
  stats: (l) => ({
    cooldown: min(1.5 - (l - 1) * 0.15, 0.9),  // 1.5 -> 0.9
    dmg: 8 + (l - 1) * 4,                        // 8 -> 24 per pellet
    count: 6 + (l - 1) * 1,                       // 6 -> 10 pellets
    speed: 560 + (l - 1) * 40,                    // 560 -> 720
    radius: 6,
    pierce: 0 + (l > 3 ? 1 : 0),                 // 0 -> 1 at lv4
    range: 320 + (l - 1) * 30,                    // 320 -> 440
    knock: 2,
    spreadDeg: 28,                                 // cone half-spread in degrees
  }),
});

// Evolution: Plague Spreader — an overcharged biohazard cannon that floods the cone with toxic death.
registerWeapon({
  id: 'plague_spreader',
  name: 'Plague Spreader',
  type: 'scatter',
  icon: '☠️',
  color: 0x33cc44,
  maxLevel: 5,
  hidden: true,
  desc: 'Unleashes a storm of plague-ridden globs across a devastating toxic cone.',
  stats: (l) => ({
    cooldown: min(1.1 - (l - 1) * 0.1, 0.65),   // 1.1 -> 0.65
    dmg: 18 + (l - 1) * 8,                        // 18 -> 50 per pellet
    count: 10 + (l - 1) * 1,                      // 10 -> 14 pellets
    speed: 640 + (l - 1) * 45,                    // 640 -> 820
    radius: 7,
    pierce: 1 + (l > 2 ? 1 : 0),                 // 1 -> 2 at lv3
    range: 370 + (l - 1) * 30,                    // 370 -> 490
    knock: 3,
    spreadDeg: 32,                                 // wider cone on evolution
  }),
});

registerEvolution({ result: 'plague_spreader', base: 'venom_spitter', catalyst: { kind: 'passive', id: 'power' } });
