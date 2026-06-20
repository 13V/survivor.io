// Plague Host — a slow, bloated brute that detonates in a toxic blast upon death.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'plague_host', name: 'Plague Host', speed: 40, hp: 300, dmg: 10, radius: 24, xp: 22, texKind: 2, tint: 0x77aa44, ai: 'seek', explodeOnDeath: true, spawn: { minTime: 130, weight: 0.3 } });
