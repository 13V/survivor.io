// Lurking Stalker — a lethal late-game lunger that closes distance in an instant
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'en13_stalker', name: 'Lurking Stalker', speed: 120, hp: 110, dmg: 18, radius: 16, xp: 16, texKind: 1, tint: 0x4a4458, ai: 'charger', chargeCd: 2.4, spawn: { minTime: 150, weight: 0.3 } });
