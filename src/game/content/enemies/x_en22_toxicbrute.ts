// A bloated, bile-soaked brute that detonates on death, coating the ground in toxic filth.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'en22_toxicbrute', name: 'Toxic Brute', speed: 40, hp: 260, dmg: 12, radius: 22, xp: 16, texKind: 2, tint: 0x6a8a3a, ai: 'seek', explodeOnDeath: true, spawn: { minTime: 130, weight: 0.3 } });
