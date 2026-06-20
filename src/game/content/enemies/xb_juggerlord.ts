// Juggerlord: a hulking boss that charges across the arena, trampling everything in its path.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'juggerlord', name: 'Juggerlord', speed: 52, hp: 7000, dmg: 34, radius: 80, xp: 95, texKind: 3, tint: 0xbb5522, boss: true, bossAttack: { interval: 4.2, radius: 120, kind: 'charge' } });
