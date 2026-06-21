// Gore Charger — a gore-slicked brute that periodically hurls itself at the player with bone-crushing force.
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'en10_gorecharger', name: 'Gore Charger', texKind: 2, tint: 0x8a4a44, ai: 'charger', chargeCd: 3.0, speed: 72, hp: 140, dmg: 16, radius: 20, xp: 10, spawn: { minTime: 85, weight: 0.4 } });
