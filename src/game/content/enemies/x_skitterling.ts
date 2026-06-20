// Skitterling: fast, weak early-swarm bug that rushes the player in large numbers
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'skitterling', name: 'Skitterling', speed: 115, hp: 14, dmg: 6, radius: 11, xp: 2, texKind: 1, tint: 0x88cc44, ai: 'seek', spawn: { minTime: 0, weight: 1.1 } });
