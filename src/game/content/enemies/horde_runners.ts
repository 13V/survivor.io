// Horde: the fast, frenzied wing of the zombie swarm.
// texKind 1 (runner sprite) recolored into hot, alarming hues. These close the
// gap quickly and punish standing still.
import { registerEnemy } from '../../registry';

// Very fast, very fragile. Swarms in the mid-run to overwhelm by speed.
registerEnemy({
  id: 'sprinter',
  name: 'Sprinter',
  speed: 138,
  hp: 8,
  dmg: 6,
  radius: 12,
  xp: 1,
  texKind: 1,
  tint: 0x20b2aa, // bright teal
  spawn: { minTime: 35, weight: 0.7 },
});

// Fast and unsettlingly bright. Starts harrying the player around 30s.
registerEnemy({
  id: 'screamer',
  name: 'Screamer',
  speed: 122,
  hp: 11,
  dmg: 7,
  radius: 13,
  xp: 2,
  texKind: 1,
  tint: 0xffd700, // glowing acid yellow
  spawn: { minTime: 30, weight: 0.55 },
});

// Medium-fast and noticeably tougher. A persistent threat from ~60s on.
registerEnemy({
  id: 'stalker',
  name: 'Stalker',
  speed: 104,
  hp: 34,
  dmg: 10,
  radius: 15,
  xp: 3,
  texKind: 1,
  tint: 0xb22222, // dark blood red
  spawn: { minTime: 60, weight: 0.4 },
});
