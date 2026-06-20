// Revenant — late-game elite bruiser that soaks damage and rewards skilled survivors
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'revenant', name: 'Revenant', speed: 58, hp: 420, dmg: 18, radius: 22, xp: 26, texKind: 2, tint: 0x886699, ai: 'seek', spawn: { minTime: 150, weight: 0.3 } });
