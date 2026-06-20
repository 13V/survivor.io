// Dead-Eye: elite sniper enemy with fast, high-velocity shots that appears in later waves
import { registerEnemy } from '../../registry';
registerEnemy({ id: 'dead_eye', name: 'Dead-Eye', speed: 46, hp: 90, dmg: 12, radius: 15, xp: 16, texKind: 0, tint: 0xcc4444, ai: 'shooter', shootCd: 1.1, shootSpeed: 300, spawn: { minTime: 140, weight: 0.3 } });
