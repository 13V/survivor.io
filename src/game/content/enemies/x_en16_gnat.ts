// Swarm Gnat — clouds of tiny infected pests that overwhelm survivors in buzzing, relentless waves.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en16_gnat', name: 'Swarm Gnat', speed: 110, hp: 10, dmg: 5, radius: 10, xp: 2, texKind: 1, tint: 0x9aa05a, ai: 'seek', spawn: { minTime: 30, weight: 1.1 } });
