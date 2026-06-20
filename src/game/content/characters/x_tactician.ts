// Tactician: a fast-leveling strategist who snowballs XP to out-scale enemies before they can react.
import { registerCharacter } from '../../registry';
registerCharacter({ id: 'tactician', name: 'Tactician', desc: 'Why fight harder when you can fight smarter? The Tactician absorbs experience at a terrifying rate, unlocking power spikes that leave enemies hopelessly outclassed.', icon: '🎲', tint: 0x66aa88, startingWeapon: 'drone', mods: { cdMul: -0.08, xpMul: 0.15, dmgTakenMul: 0.05 } });
