// Acidling: a ranged caster that lobs corrosive acid bolts at the player
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'acidling', name: 'Acidling', speed: 50, hp: 26, dmg: 8, radius: 14, xp: 4, texKind: 0, tint: 0x77dd33, ai: 'shooter', shootCd: 1.5, shootSpeed: 230, spawn: { minTime: 50, weight: 0.5 } });
