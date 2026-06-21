// Dried-out husks that swarm in packs — individually frail, collectively relentless.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en23_husk', name: 'Husk Swarm', speed: 98, hp: 12, dmg: 5, radius: 10, xp: 2, texKind: 1, tint: 0x8a8a5a, ai: 'seek', spawn: { minTime: 25, weight: 1.0 } });
