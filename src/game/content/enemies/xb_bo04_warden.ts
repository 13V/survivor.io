// The Warden never lets anything leave — and nothing ever has.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'bo04_warden', name: 'The Warden', speed: 42, hp: 5800, dmg: 26, radius: 70, xp: 88, texKind: 3, tint: 0x55606a, boss: true, bossAttack: { interval: 3.2, radius: 60, kind: 'volley', projCount: 14, projSpeed: 240 } });
