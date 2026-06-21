// Ash Marksman — a deadly elite gunner who picks off survivors from a distance with ruthless precision.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en15_marksman', name: 'Ash Marksman', speed: 46, hp: 90, dmg: 12, radius: 15, xp: 16, texKind: 0, tint: 0x8a4444, ai: 'shooter', shootCd: 1.1, shootSpeed: 300, spawn: { minTime: 140, weight: 0.3 } });
