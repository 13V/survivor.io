// Special: the Lobber — a heavy, deliberate brute-in-zombie-clothing. texKind 0
// (zombie) painted warning yellow. Medium-slow with a chunky health pool and a
// solid contact hit; not a glass cannon, not a wall — a tanky-ish bruiser that
// shows up late and soaks punishment while it lumbers in.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'lobber',
  name: 'Lobber',
  speed: 45,
  hp: 95,
  dmg: 12,
  radius: 20,
  xp: 6,
  texKind: 0,
  tint: 0xffcc00, // warning yellow
  spawn: { minTime: 65, weight: 0.35 },
});
