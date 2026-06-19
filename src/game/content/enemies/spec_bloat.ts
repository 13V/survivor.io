// Special: the Bloat — a swollen, lumbering sac. texKind 2 (brute) recolored a
// sickly purple-green. Enormous hp right up near the cap and a big body, but
// crawls along and barely scratches on contact. A slow wall of meat: low risk
// per hit, high reward for the patient, and a roadblock if ignored.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'bloat',
  name: 'Bloat',
  speed: 30,
  hp: 240,
  dmg: 6,
  radius: 30,
  xp: 9,
  texKind: 2,
  tint: 0x8a2be2, // sickly blue-violet
  spawn: { minTime: 55, weight: 0.3 },
});
