// Pipe Bomb family: a nail-packed improvised explosive hurled at enemies, scattering burning shrapnel in all directions.
// Base 'wc_pipebomb' evolves into 'wc_clustercharge' (double shrapnel rings, larger burn radius) via the power passive.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Pipe Bomb — lobs a crude nail-packed pipe that explodes into a radial ring of burning shrapnel.
registerWeapon({
  id: 'wc_pipebomb',
  name: 'Pipe Bomb',
  type: 'burst',
  icon: '🧨',
  color: 0xc06a3a,
  maxLevel: 5,
  desc: 'Hurls a nail-packed pipe bomb that detonates into a ring of searing shrapnel, leaving enemies ablaze.',
  stats: (l) => ({
    cooldown: min(1.8 - (l - 1) * 0.15, 1.05), // 1.8 → 1.05 s
    dmg: 14 + (l - 1) * 6,                       // 14 → 38 per shard
    count: 8 + (l - 1) * 2,                       // 8 → 16 shards in ring
    speed: 340,
    radius: 7 + (l > 2 ? 1 : 0),                 // 7 → 8 at lv3
    pierce: 1 + (l > 3 ? 1 : 0),                 // 1 → 2 at lv4
    range: 300 + (l - 1) * 20,                    // 300 → 380
    knock: 30 + (l - 1) * 5,                      // 30 → 50
    burnDps: 3 + (l - 1) * 1.5,                   // 3 → 9 dmg/sec on fire
    burnDur: 2,                                    // 2 s burn duration
  }),
});

// Evolution: Cluster Charge — a military-grade cluster bomb that erupts in two dense rings of superheated shrapnel.
registerWeapon({
  id: 'wc_clustercharge',
  name: 'Cluster Charge',
  type: 'burst',
  icon: '💥',
  color: 0xff6a2a,
  maxLevel: 5,
  hidden: true,
  desc: 'Detonates in overlapping shrapnel rings that engulf entire crowds in white-hot burning death.',
  stats: (l) => ({
    cooldown: min(1.3 - (l - 1) * 0.12, 0.82), // 1.3 → 0.82 s
    dmg: 30 + (l - 1) * 12,                      // 30 → 78 per shard
    count: 16 + (l - 1) * 2,                     // 16 → 24 shards (double ring)
    speed: 380 + (l - 1) * 10,                   // 380 → 420
    radius: 9 + (l > 2 ? 1 : 0),                // 9 → 10 at lv3
    pierce: 2 + (l > 3 ? 1 : 0),                // 2 → 3 at lv4
    range: 380 + (l - 1) * 25,                   // 380 → 480
    knock: 50 + (l - 1) * 8,                     // 50 → 82
    burnDps: 8 + (l - 1) * 3,                    // 8 → 20 dmg/sec on fire
    burnDur: 3,                                   // 3 s burn duration
    spin: 22.5,                                   // second ring offset by half a shard-step for full coverage
  }),
});

registerEvolution({
  result: 'wc_clustercharge',
  base: 'wc_pipebomb',
  catalyst: { kind: 'passive', id: 'power' },
});
