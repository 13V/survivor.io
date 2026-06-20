// Gore Boar — a beefy beast that periodically charges the player in a straight line.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'gore_boar', name: 'Gore Boar', speed: 72, hp: 120, dmg: 16, radius: 20, xp: 10, texKind: 2, tint: 0xaa5533, ai: 'charger', chargeCd: 3.0, spawn: { minTime: 90, weight: 0.4 } });
