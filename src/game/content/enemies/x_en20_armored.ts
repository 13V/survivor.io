// Armored Walker — rusted plating bolted onto dead flesh, slow but relentless.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en20_armored',
  name: 'Armored Walker',
  speed: 46,
  hp: 180,
  dmg: 12,
  radius: 21,
  xp: 12,
  texKind: 2,
  tint: 0x60656a,
  ai: 'seek',
  spawn: { minTime: 100, weight: 0.4 },
});
