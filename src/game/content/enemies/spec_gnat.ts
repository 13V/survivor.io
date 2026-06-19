// Special: the Gnat — a tiny, frantic mote. texKind 1 (runner) at minimum size,
// tinted pale cyan. Blazing fast and dies to a stiff breeze (1-2 hp), but
// arrives in clouds thanks to a high spawn weight. Trivial individually;
// death-by-a-thousand-cuts en masse. Swarm archetype.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'gnat',
  name: 'Gnat',
  speed: 175,
  hp: 2,
  dmg: 3,
  radius: 10,
  xp: 1,
  texKind: 1,
  tint: 0xaffeff, // pale cyan
  spawn: { minTime: 25, weight: 0.9 },
});
