// Shieldbearer: slow, heavily-armored tank that soaks damage
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'shieldbearer', name: 'Shieldbearer', speed: 42, hp: 260, dmg: 12, radius: 22, xp: 14, texKind: 2, tint: 0x6688aa, ai: 'seek', spawn: { minTime: 120, weight: 0.4 } });
