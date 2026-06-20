// Wraith: fast, fragile spectre that explodes into a hazard on death
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'wraith', name: 'Wraith', speed: 100, hp: 30, dmg: 10, radius: 13, xp: 6, texKind: 1, tint: 0x99ddff, ai: 'seek', explodeOnDeath: true, spawn: { minTime: 70, weight: 0.5 } });
