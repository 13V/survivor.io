// The Hydra: a many-headed beast that periodically summons adds to overwhelm survivors
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'hydra', name: 'The Hydra', texKind: 3, tint: 0x33aa77, boss: true, speed: 40, hp: 6200, dmg: 28, radius: 74, xp: 90, bossAttack: { interval: 5, radius: 60, kind: 'summon', summonCount: 6 } });
