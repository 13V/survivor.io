// Warlock King: a sorcerer-king boss that unleashes radial volleys of magical hazards at the player.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'warlock_king', name: 'Warlock King', speed: 42, hp: 5600, dmg: 26, radius: 70, xp: 88, texKind: 3, tint: 0x8844cc, boss: true, bossAttack: { interval: 3.2, radius: 60, kind: 'volley', projCount: 14, projSpeed: 240 } });
