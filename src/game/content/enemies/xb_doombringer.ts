// Doombringer — colossal endgame horror that shakes the earth with devastating ground slams
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'doombringer', name: 'Doombringer', speed: 30, hp: 9000, dmg: 40, radius: 90, xp: 120, texKind: 3, tint: 0x992222, boss: true, bossAttack: { interval: 3.6, radius: 240, kind: 'slam' } });
