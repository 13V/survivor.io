// Sapper: a walking bomb that detonates on death
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'sapper', name: 'Sapper', speed: 66, hp: 40, dmg: 8, radius: 15, xp: 6, texKind: 0, tint: 0xffaa44, ai: 'seek', explodeOnDeath: true, spawn: { minTime: 80, weight: 0.5 } });
