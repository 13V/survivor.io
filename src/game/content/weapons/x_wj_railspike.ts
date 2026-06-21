// Rail Spike: a jury-rigged electromagnetic rail that punches a glowing lance through the horde.
import { registerWeapon, registerEvolution } from '../../registry';

// Floor helper — cooldown never drops below a hard minimum.
const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Rail Spike — one focused EM lance that skewers everything in a straight line.
registerWeapon({
  id: 'wj_railspike',
  name: 'Rail Spike',
  type: 'lance',
  icon: '⚙',
  color: 0xb0c0c8,
  maxLevel: 5,
  desc: 'Fires a crackling electromagnetic lance at the nearest enemy, punching through every target in its path.',
  stats: (l) => ({
    cooldown: min(1.3 - (l - 1) * 0.11, 0.75), // 1.30 → 0.86 → floor 0.75
    dmg:       18 + (l - 1) * 8,                // 18 → 50
    count:     1,                                // single beam
    speed:     0,                                // lance: instant, no travel speed
    radius:    8,
    pierce:    0,                                // lances hit everything along their length
    range:     560 + (l - 1) * 30,              // 560 → 680
    knock:     10,
    beamWidth: 18 + (l - 1) * 2,               // 18 → 26 half-thickness
  }),
});

// Evolution: Gauss Lance — overcharged rails that fan two-to-three superheated beams wide enough
// to erase an entire lane of the horde simultaneously.
registerWeapon({
  id: 'wj_gausslance',
  name: 'Gauss Lance',
  type: 'lance',
  icon: '📡',
  color: 0xd0e0e8,
  maxLevel: 5,
  hidden: true,
  desc: 'Overcharged Gauss coils unleash a fan of searing lances that vaporize everything they touch.',
  stats: (l) => ({
    cooldown: min(0.85 - (l - 1) * 0.08, 0.50), // 0.85 → 0.53 → floor 0.50
    dmg:       38 + (l - 1) * 16,                // 38 → 102 (~2× base)
    count:     l < 3 ? 2 : l < 5 ? 3 : 3,       // 2 fanned beams, 3 at lv3+
    speed:     0,
    radius:    8,
    pierce:    0,
    range:     680 + (l - 1) * 35,              // 680 → 820 (longer reach)
    knock:     18,
    beamWidth: 26 + (l - 1) * 3,               // 26 → 38 (notably wider)
  }),
});

// Recipe: Rail Spike + Crit passive → Gauss Lance
registerEvolution({ result: 'wj_gausslance', base: 'wj_railspike', catalyst: { kind: 'passive', id: 'crit' } });
