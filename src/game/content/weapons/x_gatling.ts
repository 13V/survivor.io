// Gatling Gun: a relentless rapid-fire stream of bullets that shreds enemies through sheer volume.
import { registerWeapon, registerEvolution } from '../../registry';

const min = (v: number, m: number): number => (v < m ? m : v);

// Base: Gatling Gun — a blistering burst of bullets; low damage per shot, absurdly high rate of fire.
registerWeapon({
  id: 'gatling',
  name: 'Gatling Gun',
  type: 'projectile',
  icon: '🔩',
  color: 0xffdd66,
  maxLevel: 5,
  desc: 'Unleashes a blistering stream of bullets at the nearest enemy — low per-shot damage, relentless output.',
  stats: (l) => ({
    cooldown: min(0.45 - (l - 1) * 0.04, 0.25), // 0.45 -> 0.29 -> floor 0.25
    dmg: 8 + (l - 1) * 3,                        // 8 -> 20
    count: l < 4 ? 1 : 2,                        // 1 -> 2 at level 4+
    speed: 900 + (l - 1) * 50,                   // 900 -> 1100
    radius: 5,
    pierce: 1 + Math.floor((l - 1) / 2),         // 1 -> 3
    range: 620 + (l - 1) * 20,                   // 620 -> 700
    knock: 2,
    spreadDeg: 6,
  }),
});

// Evolution: Minigun — spun up to lethal speed; tears through columns of foes without mercy.
registerWeapon({
  id: 'minigun',
  name: 'Minigun',
  type: 'projectile',
  icon: '🛞',
  color: 0xffaa33,
  maxLevel: 5,
  hidden: true,
  desc: 'A fully spun-up minigun that hosepipes a wall of lead through the horde at terrifying speed.',
  stats: (l) => ({
    cooldown: min(0.22 - (l - 1) * 0.02, 0.12), // 0.22 -> 0.14 -> floor 0.12
    dmg: 14 + (l - 1) * 5,                       // 14 -> 34
    count: 2 + Math.floor((l - 1) / 2),          // 2 -> 4
    speed: 1050 + (l - 1) * 60,                  // 1050 -> 1290
    radius: 6,
    pierce: 3 + (l - 1),                         // 3 -> 7
    range: 700 + (l - 1) * 25,                   // 700 -> 800
    knock: 3,
    spreadDeg: 8,
  }),
});

registerEvolution({ result: 'minigun', base: 'gatling', catalyst: { kind: 'passive', id: 'haste' } });
