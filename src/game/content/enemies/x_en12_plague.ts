// Festering carrier — shambles toward the living and bursts in a cloud of rot.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en12_plague', name: 'Plague Carrier', speed: 58, hp: 34, dmg: 9, radius: 14, xp: 5, texKind: 0, tint: 0x6a8a4a, ai: 'seek', explodeOnDeath: true, spawn: { minTime: 75, weight: 0.5 } });
