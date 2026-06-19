// Hexer: nimble purple caster that kites and flings fast hexes.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'hexer',
  name: 'Hexer',
  speed: 78,
  hp: 40,
  dmg: 11,
  radius: 13,
  xp: 6,
  texKind: 1,
  tint: 0x9c27b0,
  ai: 'shooter',
  shootCd: 2.2,
  shootSpeed: 280,
  spawn: { minTime: 50, weight: 0.35 },
});
