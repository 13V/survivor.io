// Acid Lobber — a bloated wretch that hurls caustic globs from a safe distance, melting anything that gets too close.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en17_lobber', name: 'Acid Lobber', speed: 44, hp: 30, dmg: 10, radius: 14, xp: 5, texKind: 0, tint: 0x88aa3a, ai: 'shooter', shootCd: 2.0, shootSpeed: 200, spawn: { minTime: 60, weight: 0.4 } });
