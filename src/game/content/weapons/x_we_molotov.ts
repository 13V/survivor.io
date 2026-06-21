import { registerWeapon, registerEvolution } from '../../registry';

// Clamps a value to a minimum so stats don't go below a floor at high levels.
const min = (v: number, m: number): number => (v < m ? m : v);

// ---------------------------------------------------------------------------
// Molotov — lobbed gasoline firebomb
// Throws a flaming pool ahead of the player. The blackhole behavior makes the
// zone pull nearby zombies into the flames while burnDps/burnDur ignite them.
// placeDist controls how far the bottle is thrown; range = pool radius.
// ---------------------------------------------------------------------------
registerWeapon({
  id: 'we_molotov',
  name: 'Molotov',
  type: 'blackhole',
  icon: '🔥',
  color: 0xff7a2a,
  maxLevel: 5,
  desc: 'Lob a gasoline bottle that shatters into a dragging fire pool, hauling zombies into the flames.',
  stats: (l) => ({
    cooldown:  min(2.0  - (l - 1) * 0.15, 1.25), // 2.0 → 1.25 s
    dmg:       16  + (l - 1) * 7,                  // 16 → 44
    count:     1,
    speed:     0,
    radius:    110 + (l - 1) * 14,                 // pool display radius (px)
    pierce:    0,
    range:     110 + (l - 1) * 14,                 // zone pull radius (px)
    knock:     40,                                  // pull strength (negative = inward)
    placeDist: 150 + (l - 1) * 10,                 // throw distance ahead of player
    burnDps:   6   + (l - 1) * 3,                  // fire damage per second while inside
    burnDur:   2.5 + (l - 1) * 0.25,               // how long the pool burns (s)
  }),
});

// ---------------------------------------------------------------------------
// Firestorm — evolved Molotov (hidden; unlocked via evolution)
// A barrel of napalm: far wider, hotter burn, stronger pull, faster throws.
// Obtained by maxing Molotov while carrying the 'power' passive.
// ---------------------------------------------------------------------------
registerWeapon({
  id: 'we_firestorm',
  name: 'Firestorm',
  type: 'blackhole',
  icon: '🌋',
  color: 0xff4400,
  maxLevel: 5,
  hidden: true,
  desc: 'A napalm barrel erupts into a massive inferno that drags the entire horde into searing devastation.',
  stats: (l) => ({
    cooldown:  min(1.5  - (l - 1) * 0.12, 0.9),   // 1.5 → 0.9 s
    dmg:       45  + (l - 1) * 15,                  // 45 → 105
    count:     1,
    speed:     0,
    radius:    200 + (l - 1) * 20,                  // ~2× Molotov pool radius
    pierce:    0,
    range:     200 + (l - 1) * 20,                  // pull zone matches pool
    knock:     80,                                   // stronger inward pull
    placeDist: 180 + (l - 1) * 12,                  // thrown farther
    burnDps:   18  + (l - 1) * 7,                   // ~3× hotter burn
    burnDur:   4.0 + (l - 1) * 0.5,                 // longer lasting inferno
  }),
});

// ---------------------------------------------------------------------------
// Evolution recipe: max-level Molotov + 'power' passive → Firestorm
// ---------------------------------------------------------------------------
registerEvolution({
  result:   'we_firestorm',
  base:     'we_molotov',
  catalyst: { kind: 'passive', id: 'power' },
});
