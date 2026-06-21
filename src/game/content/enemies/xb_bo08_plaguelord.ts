// The Plaguelord's rot spreads through flesh and will alike — sixteen bolts of blight for those who linger too long.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'bo08_plaguelord', name: 'The Plaguelord', speed: 38, hp: 6600, dmg: 28, radius: 78, xp: 94, texKind: 3, tint: 0x6a8a44, boss: true, bossAttack: { interval: 3.0, radius: 60, kind: 'volley', projCount: 16, projSpeed: 230 } });
