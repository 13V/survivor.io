// Artillery Bug: slow, tanky brute that lobs heavy shots on a long cooldown. Rare.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'artillery_bug',
  name: 'Artillery Bug',
  speed: 30,
  hp: 230,
  dmg: 20,
  radius: 26,
  xp: 14,
  texKind: 2,
  tint: 0x795548,
  ai: 'shooter',
  shootCd: 3.0,
  shootSpeed: 200,
  spawn: { minTime: 70, weight: 0.12 },
});
