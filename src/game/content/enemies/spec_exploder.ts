// Special: the Exploder — a volatile rusher. texKind 0 (zombie) drenched in
// hot red. It barrels straight at the player: paper-thin hp, blistering contact
// damage, well above walker speed. A glass cannon that punishes letting it land.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'exploder',
  name: 'Exploder',
  speed: 130,
  hp: 12,
  dmg: 30,
  radius: 15,
  xp: 3,
  texKind: 0,
  tint: 0xff2200, // volatile red
  spawn: { minTime: 40, weight: 0.45 },
});
