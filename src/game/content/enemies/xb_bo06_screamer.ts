// The Screamer's wail splits stone and sanity alike — and its children finish what the sound starts.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'bo06_screamer', name: 'The Screamer', speed: 46, hp: 5600, dmg: 24, radius: 68, xp: 86, texKind: 3, tint: 0x8a4a5a, boss: true, bossAttack: { interval: 4.0, radius: 60, kind: 'summon', summonCount: 8 } });
