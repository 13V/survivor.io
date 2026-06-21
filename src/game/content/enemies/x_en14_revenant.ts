// Risen from the grave with a grudge — this elite bruiser refuses to stay dead.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en14_revenant',
  name: 'Dread Revenant',
  speed: 56,
  hp: 420,
  dmg: 18,
  radius: 22,
  xp: 26,
  texKind: 2,
  tint: 0x554a66,
  ai: 'seek',
  spawn: { minTime: 150, weight: 0.3 },
});
