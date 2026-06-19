// Special: the Leaper — a blink-fast harrier. texKind 1 (runner) tinted a
// livid lime. Fastest thing on the field, but extremely fragile; closes the gap
// in an instant and deals a meaningful medium bite. Glass-cannon speedster.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'leaper',
  name: 'Leaper',
  speed: 150,
  hp: 10,
  dmg: 14,
  radius: 12,
  xp: 2,
  texKind: 1,
  tint: 0x7cfc00, // livid lime
  spawn: { minTime: 35, weight: 0.5 },
});
