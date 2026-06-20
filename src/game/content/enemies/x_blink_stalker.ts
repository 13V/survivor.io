// Blink Stalker — lethal elite that charges the player at high speed
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'blink_stalker', name: 'Blink Stalker', speed: 120, hp: 140, dmg: 20, radius: 16, xp: 20, texKind: 1, tint: 0x6644aa, ai: 'charger', chargeCd: 2.2, spawn: { minTime: 160, weight: 0.3 } });
