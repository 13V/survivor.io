// Frost Caster — a gaunt corpse mage that lobs shards of black ice from the treeline, chilling survivors to the bone before they ever see it coming.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en18_frostcaster', name: 'Frost Caster', speed: 46, hp: 30, dmg: 8, radius: 14, xp: 5, texKind: 0, tint: 0x6aa0c0, ai: 'shooter', shootCd: 1.8, shootSpeed: 210, spawn: { minTime: 65, weight: 0.4 } });
