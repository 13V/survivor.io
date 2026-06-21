// Armored riot-gear infected — slow but heavily plated, hits like a battering ram.
import { registerEnemy } from '../../registry';

registerEnemy({
  id: 'en08_riotbrute',
  name: 'Riot Brute',
  texKind: 2,
  tint: 0x55606a,
  ai: 'seek',
  speed: 44,
  hp: 220,
  dmg: 13,
  radius: 22,
  xp: 14,
  spawn: { minTime: 90, weight: 0.45 },
});
